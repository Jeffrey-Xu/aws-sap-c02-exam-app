import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value?: number;
  progress?: number; // Add progress prop for compatibility
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  progress, // Accept progress prop
  max = 100,
  className,
  showLabel = true,
  color = 'orange',
  size = 'md'
}) => {
  // Use progress if provided, otherwise use value
  const actualValue = progress !== undefined ? progress : (value || 0);
  
  // Safe percentage calculation to prevent NaN
  const safeValue = isFinite(actualValue) ? actualValue : 0;
  const safeMax = isFinite(max) && max > 0 ? max : 1;
  const percentage = Math.min(Math.max((safeValue / safeMax) * 100, 0), 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-aws-orange',
    red: 'bg-red-500'
  };
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {actualValue} / {max}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={clsx(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-out rounded-full',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
