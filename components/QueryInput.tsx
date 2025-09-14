import React from 'react';
import { AnalysisType } from '../types';
import { Icon } from './Icon';

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  handleAnalysis: (type: AnalysisType) => void;
  isDisabled: boolean;
  targetLanguage: string;
  setTargetLanguage: (language: string) => void;
}

const ActionButton: React.FC<{
  onClick: () => void;
  isDisabled: boolean;
  icon: 'summary' | 'jargon' | 'ask' | 'warning' | 'shield';
  text: string;
  className: string;
}> = ({ onClick, isDisabled, icon, text, className }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-white disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none transform hover:-translate-y-0.5 focus:ring-4 ${className}`}
  >
    <Icon icon={icon} className="w-5 h-5" />
    <span>{text}</span>
  </button>
);


export const QueryInput: React.FC<QueryInputProps> = ({ 
    query, 
    setQuery, 
    handleAnalysis, 
    isDisabled, 
    targetLanguage, 
    setTargetLanguage 
}) => {
  return (
    <div className="space-y-4">
      <ActionButton 
            onClick={() => handleAnalysis(AnalysisType.RISK_SCORE)}
            isDisabled={isDisabled}
            icon="shield"
            text="Calculate Risk Score"
            className="bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-cyan-900/50 focus:ring-cyan-400/50 py-4 text-lg"
        />

      <div className="grid grid-cols-2 gap-4 pt-2">
        <ActionButton 
            onClick={() => handleAnalysis(AnalysisType.SUMMARIZE)}
            isDisabled={isDisabled}
            icon="summary"
            text="Summarize"
            className="bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/50 focus:ring-blue-400/50"
        />
        <ActionButton 
            onClick={() => handleAnalysis(AnalysisType.JARGON)}
            isDisabled={isDisabled}
            icon="jargon"
            text="Explain Jargon"
            className="bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg shadow-purple-900/50 focus:ring-purple-400/50"
        />
        <ActionButton 
            onClick={() => handleAnalysis(AnalysisType.HIDDEN_TERMS)}
            isDisabled={isDisabled}
            icon="warning"
            text="Find Hidden Risks"
            className="bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg shadow-amber-900/50 focus:ring-amber-400/50"
        />
        <ActionButton 
            onClick={() => handleAnalysis(AnalysisType.HIDDEN_FEES)}
            isDisabled={isDisabled}
            icon="warning"
            text="Find Hidden Fees"
            className="bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-900/50 focus:ring-red-400/50"
        />
      </div>
      
      <div className="pt-2">
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-300 mb-2">
            Translate Result to:
        </label>
        <div className="relative">
            <select
                id="language-select"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={isDisabled}
                className="w-full appearance-none p-2 bg-[#0D1117] border border-[#30363D] rounded-md text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Translation is available for all analysis types.</p>
       </div>

       <div className="flex flex-col gap-2 pt-4 border-t border-[#30363D] mt-4">
         <label htmlFor="question-input" className="text-lg font-semibold text-gray-200">
           Ask a Specific Question
         </label>
        <div className="flex flex-col sm:flex-row gap-4">
            <input
              id="question-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isDisabled}
              placeholder="e.g., What is the penalty for late payment?"
              className="flex-grow p-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200 disabled:opacity-50"
            />
            <button
                onClick={() => handleAnalysis(AnalysisType.QUESTION)}
                disabled={isDisabled || !query}
                className="flex items-center justify-center gap-2 sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-white bg-gradient-to-br from-green-600 to-green-700 shadow-lg shadow-green-900/50 focus:ring-4 focus:ring-green-400/50 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none"
            >
                <Icon icon="ask" className="w-5 h-5" />
                <span>Ask</span>
            </button>
        </div>
      </div>
    </div>
  );
};