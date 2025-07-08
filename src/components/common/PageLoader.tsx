import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
  subText?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = "Loading...", 
  subText 
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">{text}</h3>
          {subText && (
            <p className="text-sm text-gray-500 mt-1">{subText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
