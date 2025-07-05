import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatTime } from '../../utils/questionUtils';

interface ExamTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  onTimeUp: () => void;
  onUpdate: (timeRemaining: number) => void;
}

const ExamTimer: React.FC<ExamTimerProps> = ({
  timeRemaining,
  isRunning,
  onTimeUp,
  onUpdate
}) => {
  const [currentTime, setCurrentTime] = useState(timeRemaining);
  
  useEffect(() => {
    setCurrentTime(timeRemaining);
  }, [timeRemaining]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev - 1;
          onUpdate(newTime);
          
          if (newTime <= 0) {
            onTimeUp();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentTime, onTimeUp, onUpdate]);
  
  const getTimerColor = () => {
    const minutes = Math.floor(currentTime / 60);
    if (minutes <= 5) return 'text-red-600';
    if (minutes <= 15) return 'text-orange-600';
    if (minutes <= 30) return 'text-yellow-600';
    return 'text-gray-900';
  };
  
  const getBackgroundColor = () => {
    const minutes = Math.floor(currentTime / 60);
    if (minutes <= 5) return 'bg-red-50 border-red-200';
    if (minutes <= 15) return 'bg-orange-50 border-orange-200';
    if (minutes <= 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white border-gray-200';
  };
  
  const showWarning = Math.floor(currentTime / 60) <= 15;
  
  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getBackgroundColor()}`}>
      {showWarning && <AlertTriangle size={20} className="text-orange-500" />}
      <Clock size={20} className={getTimerColor()} />
      <div className="flex flex-col">
        <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
          {formatTime(currentTime)}
        </span>
        <span className="text-xs text-gray-500">
          {Math.floor(currentTime / 60)} minutes remaining
        </span>
      </div>
    </div>
  );
};

export default ExamTimer;
