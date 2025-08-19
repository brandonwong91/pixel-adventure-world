
import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 border-4 border-dashed border-green-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-2xl text-green-400">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
