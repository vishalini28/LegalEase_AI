import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  }, [onCapture]);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-lg p-2">
      {error ? (
        <div className="text-red-400 text-center">
            <p>{error}</p>
            <button onClick={onCancel} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Back
            </button>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain rounded-md mb-4" />
          <div className="flex gap-4">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Cancel
            </button>
            <button onClick={handleCapture} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
                Capture
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};
