import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import type { Question } from '../../types';

interface DetailedExplanationProps {
  question: Question;
  userAnswer?: string;
}

const DetailedExplanation: React.FC<DetailedExplanationProps> = ({ question, userAnswer }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    optionAnalysis: true // Make this expanded by default since Overview is removed
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderCollapsibleSection = (
    key: string,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
    defaultExpanded = false
  ) => {
    const isExpanded = expandedSections[key] ?? defaultExpanded;
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        {isExpanded && (
          <div className="p-4 bg-white">
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderOptionAnalysis = () => {
    if (!question.detailed_reasoning?.option_analyses) {
      return <p className="text-gray-500">No detailed option analysis available.</p>;
    }

    return (
      <div className="space-y-4">
        {Object.entries(question.detailed_reasoning.option_analyses).map(([key, analysis]) => {
          // Convert numeric keys to letters (0->A, 1->B, etc.) or use existing letter keys
          const letter = isNaN(parseInt(key)) ? key : String.fromCharCode(65 + parseInt(key));
          const isUserAnswer = userAnswer === letter;
          const isCorrect = analysis.is_correct;
          
          return (
            <div
              key={key}
              className={`border rounded-lg p-4 ${
                isCorrect 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              } ${isUserAnswer ? 'ring-2 ring-blue-300' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {letter}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                    <span className={`font-medium ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Option {letter} {isUserAnswer ? '(Your Answer)' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {(analysis.reasoning || []).map((reason, index) => (
                      <p key={index} className="text-sm text-gray-700 leading-relaxed">
                        {reason}
                      </p>
                    ))}
                  </div>
                  
                  {(analysis.key_points?.services?.length || 0) > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-600">AWS Services: </span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {(analysis.key_points.services || []).map((service, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Explanation</h3>
      
      <div className="space-y-4">
        {/* Detailed Option Analysis */}
        {question.detailed_reasoning?.option_analyses && renderCollapsibleSection(
          'optionAnalysis',
          'Detailed Option Analysis',
          <CheckCircle size={18} className="text-green-600" />,
          renderOptionAnalysis(),
          true // Make this expanded by default since Overview is removed
        )}
      </div>
    </div>
  );
};

export default DetailedExplanation;
