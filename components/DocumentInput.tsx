import React, { useRef, useState, useCallback } from 'react';
import { Icon } from './Icon';
import { Loader } from './Loader';
import { CameraCapture } from './CameraCapture';

interface DocumentInputProps {
  onFileSelect: (file: File) => void;
  clearDocument: () => void;
  extractedText: string;
  isProcessing: boolean;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({ 
  onFileSelect, 
  clearDocument,
  extractedText, 
  isProcessing 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
      setShowCamera(false);
    }
  };
  
  const handleCameraCapture = (file: File) => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
    setShowCamera(false);
  };

  const handleDragEvent = (e: React.DragEvent, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setDragOver(isOver);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    handleDragEvent(e, false);
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  }, []);

  const handleClear = () => {
    if (preview) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    clearDocument();
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />;
  }
  
  const hasDocument = !!extractedText || !!preview;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-lg font-semibold text-gray-200">
          {hasDocument ? "Your Document" : "Upload Document"}
        </label>
        {hasDocument && !isProcessing && (
           <button onClick={handleClear} className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
             Clear
           </button>
        )}
      </div>

      <div className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 relative transition-all duration-300 ${dragOver ? 'border-blue-400 ring-4 ring-blue-400/20 bg-blue-900/20' : 'border-[#30363D]'}`}
        onDragEnter={(e) => handleDragEvent(e, true)}
        onDragOver={(e) => handleDragEvent(e, true)}
        onDragLeave={(e) => handleDragEvent(e, false)}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-400 animate-pulse">Extracting text from document...</p>
          </div>
        ) : extractedText ? (
           <div className="w-full h-full p-2 bg-black/20 rounded-md overflow-y-auto">
             <h3 className="text-md font-semibold text-gray-300 mb-2">Extracted Text Preview:</h3>
             <p className="text-sm text-gray-400 whitespace-pre-wrap">{extractedText.substring(0, 500)}{extractedText.length > 500 ? '...' : ''}</p>
           </div>
        ) : preview ? (
            <div className="relative w-full h-full">
                <img src={preview} alt="Document preview" className="w-full h-full object-contain rounded-md"/>
            </div>
        ) : (
          <div className="text-center text-gray-400">
            <Icon icon="gavel" className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="mb-2 font-semibold text-gray-300">Drag & drop an image file</p>
            <p className="text-sm mb-4">or</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-900/50"
                >
                    Upload File
                </button>
                <button
                    onClick={() => setShowCamera(true)}
                    className="px-4 py-2 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-500 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-purple-900/50"
                >
                    Use Camera
                </button>
            </div>
             <p className="text-xs mt-4 text-gray-500">Supports: JPG, PNG, WEBP</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="document-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};