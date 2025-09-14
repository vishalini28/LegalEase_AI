import { GoogleGenAI, Type } from "@google/genai";
import { marked } from "marked";
import { AnalysisType } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
    return {
      inlineData: {
        data: base64Data,
        mimeType
      },
    };
}

export const extractTextFromImage = async (base64Data: string, mimeType: string): Promise<string> => {
    if (!base64Data || !mimeType) {
        throw new Error("Image data and MIME type are required.");
    }

    try {
        const imagePart = fileToGenerativePart(base64Data, mimeType);
        const textPart = {
            text: "Perform OCR on this image of a legal document. Extract all text content accurately. Maintain the original structure, including paragraphs, lists, and headings, as best as possible. Do not summarize, interpret, or add any information that is not present in the image. Only return the extracted text."
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const extractedText = response.text;
        if (!extractedText) {
            throw new Error("Could not extract any text from the image. The document might be blurry or empty.");
        }
        return extractedText;

    } catch (error) {
        console.error("Error extracting text from image:", error);
        if (error instanceof Error) {
            return Promise.reject(`Failed to extract text from image: ${error.message}`);
        }
        return Promise.reject("An unknown error occurred during image processing.");
    }
};

interface RiskScoreResponse {
    score: number;
    rating: string;
    justification: string[];
}

const generateRiskScoreCard = (data: RiskScoreResponse): string => {
    let scoreColorClass = '';
    let emoji = '';
    if (data.score <= 33) {
        scoreColorClass = 'text-green-400';
        emoji = '😊'; // Smiling face
    } else if (data.score <= 66) {
        scoreColorClass = 'text-yellow-400';
        emoji = '😐'; // Neutral face
    } else {
        scoreColorClass = 'text-red-400';
        emoji = '😟'; // Worried face
    }

    const justificationItems = data.justification.map(item => 
        `<li class="flex items-start gap-3"><span class="mt-1">🔹</span><span>${item}</span></li>`
    ).join('');

    return `
        <div class="bg-black/20 p-6 rounded-lg border border-[#30363D]">
            <h2 class="text-2xl font-bold text-center text-gray-200 mb-4">AI Risk Score Report</h2>
            <div class="text-center mb-6">
                <div class="text-8xl mb-2">${emoji}</div>
                <div class="text-6xl font-bold ${scoreColorClass}">${data.score} / 100</div>
                <div class="text-2xl font-semibold text-gray-300 mt-2">${data.rating}</div>
            </div>
            <div>
                <h3 class="text-xl font-semibold text-blue-300 mb-3 border-b border-[#30363D] pb-2">Key Contributing Factors:</h3>
                <ul class="space-y-3 text-gray-300">${justificationItems}</ul>
            </div>
        </div>
    `;
};


const generatePrompt = (type: AnalysisType, documentText: string, query?: string): string => {
  const baseIntro = `You are an expert legal assistant named LegalEase AI. Your goal is to demystify complex legal documents for the average person. Analyze the following legal document and respond in clear, simple, and easy-to-understand language. Use markdown for formatting (headings, lists, bold text) to improve readability.`;

  switch (type) {
    case AnalysisType.SUMMARIZE:
      return `${baseIntro}\n\n**Task:** Provide a structured and precise summary of the document. Use the following markdown format with the exact headings. For each section, provide clear, concise bullet points. If no information is found for a section, state "Not specified in the document."\n\n### Document Overview\n- **Type:** [e.g., Lease Agreement, Terms of Service]\n- **Purpose:** [A single sentence explaining the main goal of the document.]\n\n### Your Key Obligations & Responsibilities\n- [List key duties and actions required from you.]\n\n### Other Party's Key Obligations & Responsibilities\n- [List key duties and actions required from the other party.]\n\n### Financial Breakdown\n- [List all costs, fees, payment schedules, and penalties. Be specific.]\n\n### Important Clauses & Potential Risks\n- [Highlight any critical clauses, deadlines, or potential risks you should be aware of.]\n\n**Document:**\n"""\n${documentText}\n"""`;
    
    case AnalysisType.JARGON:
      return `${baseIntro}\n\n**Task:** Identify and explain complex legal jargon or confusing clauses in the document. For each term/clause:\n1. Quote or name the term/clause.\n2. Provide a simple, plain-language explanation of what it means.\n3. Briefly explain its practical implication for the user in the context of this document.\n\n**Document:**\n"""\n${documentText}\n"""`;

    case AnalysisType.HIDDEN_TERMS:
      return `You are an expert legal assistant specializing in consumer protection. Your task is to meticulously scan the following legal document for any hidden or potentially unfavorable terms. Focus specifically on identifying:\n- Vague or ambiguous language that could be exploited.\n- Clauses related to automatic renewals or recurring charges.\n- Unexpected fees, penalties, or charges (e.g., late fees, early termination fees).\n- Clauses that waive the user's rights (e.g., waiver of jury trial, class action waiver).\n- Unilateral rights for the other party to change terms.\n- Strict notice periods or complex cancellation procedures.\n\nFor each identified term, quote the relevant text and explain in simple language why it's a potential risk for the user. Use markdown for formatting. If no such terms are found, state that the document appears to be straightforward in this regard.\n\n**Document:**\n"""\n${documentText}\n"""`;
      
    case AnalysisType.HIDDEN_FEES:
      return `You are a forensic financial analyst specializing in contracts. Your sole task is to meticulously scan the following document to identify and highlight all potential hidden costs, fees, penalties, and financial traps. Focus exclusively on:\n- Late payment fees and their calculation.\n- Early termination penalties.\n- Automatic renewal clauses and the associated costs.\n- Undisclosed or vaguely mentioned charges (e.g., 'administrative fees', 'processing fees').\n- Interest rates on overdue payments.\n- Clauses that allow for unilateral price increases.\n\nFor each item you find, quote the exact text from the document, provide a clear explanation of the potential financial impact, and present it under a "Potential Hidden Fee/Penalty" heading. Use markdown for clear formatting. If no such items are found, state clearly: "No specific hidden fees or financial penalties were identified in the document." Do not analyze any other legal aspects.\n\n**Document:**\n"""\n${documentText}\n"""`;

    case AnalysisType.QUESTION:
      if (!query) throw new Error("A specific question is required for this analysis type.");
      return `${baseIntro}\n\n**Task:** Based *only* on the provided document, answer the user's specific question. If the document does not contain the answer, state that clearly.\n\n**User's Question:** "${query}"\n\n**Document:**\n"""\n${documentText}\n"""`;
      
    default:
      throw new Error("Invalid analysis type.");
  }
};

export const analyzeDocument = async (
  type: AnalysisType,
  documentText: string,
  query?: string,
  targetLanguage: string = 'English'
): Promise<string> => {
  if (!documentText.trim()) {
    throw new Error("The document text cannot be empty. It may not have been extracted correctly.");
  }
  
  try {
    if (type === AnalysisType.RISK_SCORE) {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following legal document and provide a risk score. Consider factors like hidden fees, unfavorable clauses, ambiguity, and waivers of rights. Return a JSON object with the exact schema provided. The justification should be a list of the top 3-4 factors that influenced the score. The rating should be one of: "Low Risk", "Moderate Risk", "High Risk", or "Very High Risk".
            
            Document: """${documentText}"""`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "A risk score from 0 (no risk) to 100 (extreme risk)." },
                        rating: { type: Type.STRING, description: "A textual rating of the risk level." },
                        justification: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "A list of key reasons for the score."
                        }
                    },
                    required: ["score", "rating", "justification"]
                }
            }
        });
        
        let riskData: RiskScoreResponse = JSON.parse(response.text);

        if (targetLanguage && targetLanguage.toLowerCase() !== 'english') {
            const textToTranslate = [riskData.rating, ...riskData.justification].join('\n---\n');
            const translateResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Translate the following text segments into ${targetLanguage}. The segments are separated by '---'. Maintain this separation in your response.\n\n"""\n${textToTranslate}\n"""`
            });

            const translatedParts = translateResponse.text.split('\n---\n');
            if (translatedParts.length === riskData.justification.length + 1) {
                riskData.rating = translatedParts[0];
                riskData.justification = translatedParts.slice(1);
            }
        }
        
        return generateRiskScoreCard(riskData);
    }
    
    // Handle other analysis types
    const prompt = generatePrompt(type, documentText, query);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    let analysisText = response.text;
    if (!analysisText) {
        throw new Error("Received an empty response from the AI.");
    }

    if (targetLanguage && targetLanguage.toLowerCase() !== 'english' && type !== AnalysisType.QUESTION) {
        const translatePrompt = `Translate the following text into ${targetLanguage}. Maintain the original markdown formatting and structure:\n\n"""\n${analysisText}\n"""`;
        
        const translateResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: translatePrompt
        });
        
        const translatedText = translateResponse.text;
        if (translatedText) {
            analysisText = translatedText;
        }
    }
    
    const htmlResult = await marked.parse(analysisText);
    return htmlResult;

  } catch (error) {
    console.error("Error analyzing document:", error);
    if (error instanceof Error) {
        return Promise.reject(`Failed to get analysis from AI: ${error.message}`);
    }
    return Promise.reject("An unknown error occurred during AI analysis.");
  }
};