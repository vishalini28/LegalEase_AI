import React, { useState, useEffect } from 'react';
import { Loader } from './Loader';
import { Icon } from './Icon';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  result: string;
}

const loadingMessages = [
  "Consulting with our AI legal experts...",
  "Analyzing complex clauses...",
  "Translating jargon into plain English...",
  "Scanning for hidden risks and fees...",
  "Finalizing your report...",
];

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, result }) => {
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    if (isLoading) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 text-center">
          <Loader />
          <p className="text-lg font-medium transition-opacity duration-500">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-red-400 text-center p-4">
          <Icon icon="jargon" className="w-16 h-16" />
          <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (result) {
      return (
        <div 
          className="prose prose-invert prose-blue max-w-none prose-p:text-gray-300 prose-headings:text-blue-300 prose-strong:text-white prose-li:text-gray-300 prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-code:bg-black/20 prose-code:p-1 prose-code:rounded-md"
          dangerouslySetInnerHTML={{ __html: result }} 
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 text-center p-4">
        <Icon icon="gavel" className="w-24 h-24 opacity-20" />
        <h3 className="text-2xl font-semibold text-gray-400">Your AI Legal Assistant</h3>
        <p className="max-w-md">
          Upload a document, then choose an analysis to get started. Your privacy is paramount—documents are processed in memory and never stored.
        </p>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D] rounded-xl p-6 overflow-y-auto">
      {renderContent()}
    </div>
  );
};