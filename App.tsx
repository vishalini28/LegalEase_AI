import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DocumentInput } from './components/DocumentInput';
import { QueryInput } from './components/QueryInput';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeDocument, extractTextFromImage } from './services/geminiService';
import { AnalysisType } from './types';

function App() {
  const [documentText, setDocumentText] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('English');

  const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(',')[1];
              resolve({ base64, mimeType: file.type });
          };
          reader.onerror = error => reject(error);
      });
  };

  const handleFileSelect = useCallback(async (file: File) => {
      if (!file) return;

      setIsProcessingFile(true);
      setError(null);
      setAnalysisResult('');
      setDocumentText('');
      setQuery('');

      try {
          const { base64, mimeType } = await fileToBase64(file);
          const extractedText = await extractTextFromImage(base64, mimeType);
          setDocumentText(extractedText);
      } catch (err: any) {
          setError(err.toString());
      } finally {
          setIsProcessingFile(false);
      }
  }, []);
  
  const handleClearDocument = useCallback(() => {
    setDocumentText('');
    setAnalysisResult('');
    setError(null);
    setQuery('');
  }, []);

  const handleAnalysis = useCallback(async (type: AnalysisType) => {
    if (!documentText) {
      setError("Please upload and process a document before requesting an analysis.");
      return;
    }
    if (type === AnalysisType.QUESTION && !query) {
      setError("Please enter a question to ask.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult('');

    try {
      const result = await analyzeDocument(type, documentText, query, targetLanguage);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentText, query, targetLanguage]);
  
  const isLoading = isProcessingFile || isAnalyzing;

  return (
    <div className="min-h-screen text-gray-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)] min-h-[650px]">
          {/* Left Panel */}
          <div className="flex flex-col gap-6 bg-[#161B22]/60 backdrop-blur-xl p-6 rounded-xl border border-[#30363D]">
            <div className="flex-grow h-3/5">
              <DocumentInput 
                onFileSelect={handleFileSelect}
                clearDocument={handleClearDocument}
                extractedText={documentText}
                isProcessing={isProcessingFile}
              />
            </div>
            <div className="border-t border-[#30363D] pt-6">
              <QueryInput 
                query={query}
                setQuery={setQuery}
                handleAnalysis={handleAnalysis}
                isDisabled={isLoading || !documentText}
                targetLanguage={targetLanguage}
                setTargetLanguage={setTargetLanguage}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="h-full">
            <ResultDisplay 
              isLoading={isAnalyzing}
              error={error}
              result={analysisResult}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;