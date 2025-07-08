import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  lines = 1,
  height = 'h-4'
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className={`bg-gray-200 rounded ${height} ${index > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </div>
  );
};

export const QuestionSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    {/* Question header */}
    <div className="flex items-center justify-between">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
      <div className="h-8 bg-gray-200 rounded w-20"></div>
    </div>
    
    {/* Question text */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    
    {/* Answer choices */}
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Navigation buttons */}
    <div className="flex justify-between">
      <div className="h-10 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 6 
}) => (
  <div className="animate-pulse">
    {/* Table header */}
    <div className="grid grid-cols-6 gap-4 mb-4">
      {Array.from({ length: cols }).map((_, index) => (
        <div key={index} className="h-6 bg-gray-200 rounded"></div>
      ))}
    </div>
    
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-6 gap-4 mb-3">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="h-8 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
