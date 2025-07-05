import React, { useState, useEffect } from 'react';
import { Flag, FlagOff, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Question } from '../../types';
import { parseCorrectAnswers, isMultipleChoice } from '../../utils/questionUtils';
import Button from '../common/Button';
import Card from '../common/Card';

interface ExamQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  isFlagged: boolean;
  onAnswerChange: (answer: string) => void;
  onFlag: () => void;
  onUnflag: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const ExamQuestion: React.FC<ExamQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer = '',
  isFlagged,
  onAnswerChange,
  onFlag,
  onUnflag,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  
  const isMultiple = isMultipleChoice(question.correct_answer);
  
  useEffect(() => {
    // Initialize selected answers from prop
    if (selectedAnswer) {
      setSelectedAnswers(selectedAnswer.split(''));
    } else {
      setSelectedAnswers([]);
    }
  }, [selectedAnswer, question.id]);
  
  const handleOptionSelect = (letter: string) => {
    let newSelection: string[];
    
    if (isMultiple) {
      newSelection = selectedAnswers.includes(letter)
        ? selectedAnswers.filter(a => a !== letter)
        : [...selectedAnswers, letter].sort();
    } else {
      newSelection = [letter];
    }
    
    setSelectedAnswers(newSelection);
    onAnswerChange(newSelection.join(''));
  };
  
  const isSelected = (letter: string) => {
    return selectedAnswers.includes(letter);
  };
  
  const getOptionClassName = (letter: string) => {
    return `question-option ${isSelected(letter) ? 'selected' : ''}`;
  };
  
  const correctAnswers = parseCorrectAnswers(question.correct_answer);
  
  return (
    <Card className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </div>
          {question.category && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {question.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          )}
        </div>
        
        <button
          onClick={isFlagged ? onUnflag : onFlag}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
            isFlagged
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
          }`}
        >
          {isFlagged ? <FlagOff size={16} /> : <Flag size={16} />}
          <span>{isFlagged ? 'Unflag' : 'Flag'}</span>
        </button>
      </div>
      
      {/* Question Text */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.question}
        </h2>
        {isMultiple && (
          <p className="text-sm text-blue-600 mt-2">
            Select multiple answers ({correctAnswers.length} correct)
          </p>
        )}
      </div>
      
      {/* Answer Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option) => (
          <div
            key={option.letter}
            className={getOptionClassName(option.letter)}
            onClick={() => handleOptionSelect(option.letter)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                {option.letter}
              </div>
              <div className="flex-1 text-sm leading-relaxed">
                {option.text}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          <ChevronLeft size={16} className="mr-1" />
          Previous
        </Button>
        
        <div className="text-sm text-gray-500">
          {selectedAnswers.length > 0 ? (
            <span className="text-green-600">Answer selected</span>
          ) : (
            <span>No answer selected</span>
          )}
        </div>
        
        <Button
          onClick={onNext}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </Card>
  );
};

export default ExamQuestion;
