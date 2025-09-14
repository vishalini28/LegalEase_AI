import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="py-4 px-4 md:px-8 text-center border-b border-[#30363D]">
      <div className="flex items-center justify-center gap-3 mb-1">
        <Icon icon="gavel" className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">
          LegalEase AI
        </h1>
      </div>
      <p className="text-md text-gray-400">
        Demystifying complex legal documents with the power of AI.
      </p>
    </header>
  );
};