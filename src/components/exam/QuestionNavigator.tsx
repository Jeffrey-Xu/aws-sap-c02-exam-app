import React from 'react';
import { Flag } from 'lucide-react';
import { clsx } from 'clsx';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onNavigate: (questionIndex: number) => void;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  flaggedQuestions,
  onNavigate
}) => {
  const getQuestionStatus = (index: number) => {
    if (index === currentQuestion) return 'current';
    if (answeredQuestions.has(index)) return 'answered';
    return 'unanswered';
  };
  
  const getQuestionClassName = (index: number) => {
    const status = getQuestionStatus(index);
    const isFlagged = flaggedQuestions.has(index);
    
    return clsx(
      'question-nav-button',
      {
        'border-aws-orange bg-aws-orange text-white shadow-lg': status === 'current',
        'border-green-500 bg-green-50 text-green-700 hover:bg-green-100': status === 'answered' && !isFlagged,
        'border-gray-300 bg-white text-gray-700 hover:bg-gray-50': status === 'unanswered' && !isFlagged,
        'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100': isFlagged && status !== 'current'
      }
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full">
      {/* Title */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">Question Navigator</h3>
      </div>
      
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded bg-aws-orange"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded bg-green-50 border border-green-500"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-500"></div>
          <span>Flagged</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded bg-white border border-gray-300"></div>
          <span>Unanswered</span>
        </div>
      </div>
      
      {/* Question Grid - 10 per row */}
      <div className="grid grid-cols-10 gap-2 mb-4 place-items-center w-full">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <div key={index} className="relative flex items-center justify-center w-8 h-8">
            <button
              onClick={() => onNavigate(index)}
              className={getQuestionClassName(index)}
            >
              {index + 1}
              {flaggedQuestions.has(index) && (
                <Flag 
                  size={8} 
                  className="absolute -top-0.5 -right-0.5 text-yellow-600 fill-current" 
                />
              )}
            </button>
          </div>
        ))}
      </div>
      
      {/* Statistics */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-green-600">
              {answeredQuestions.size}
            </div>
            <div className="text-xs text-gray-600 font-medium">Answered</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-600">
              {flaggedQuestions.size}
            </div>
            <div className="text-xs text-gray-600 font-medium">Flagged</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-600">
              {totalQuestions - answeredQuestions.size}
            </div>
            <div className="text-xs text-gray-600 font-medium">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;
