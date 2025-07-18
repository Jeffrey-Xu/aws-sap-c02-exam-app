import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Flag, Clock, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import type { Question } from '../../types';
import { parseCorrectAnswers, isMultipleChoice } from '../../utils/questionUtils';
import Button from '../common/Button';
import Card from '../common/Card';
import DetailedExplanation from '../common/DetailedExplanation';
import { useProgressStore } from '../../stores/progressStore';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string, timeSpent: number) => void;
  showExplanation?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  showExplanation = false,
  onNext,
  onPrevious
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  
  const { 
    getQuestionProgress, 
    addBookmark, 
    removeBookmark, 
    addNote,
    markAsMastered,
    markForReview
  } = useProgressStore();
  
  const questionProgress = getQuestionProgress(question.id);
  const correctAnswers = parseCorrectAnswers(question.correct_answer);
  const isMultiple = isMultipleChoice(question.correct_answer);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswers([]);
    setSubmitted(false);
  }, [question.id]);
  
  const handleOptionSelect = (letter: string) => {
    if (submitted) return;
    
    if (isMultiple) {
      setSelectedAnswers(prev => 
        prev.includes(letter) 
          ? prev.filter(a => a !== letter)
          : [...prev, letter]
      );
    } else {
      setSelectedAnswers([letter]);
    }
  };
  
  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;
    
    const answer = selectedAnswers.sort().join('');
    setSubmitted(true);
    onAnswer(answer, timeSpent);
  };
  
  const isCorrectAnswer = (letter: string) => {
    return correctAnswers.includes(letter);
  };
  
  const isSelectedAnswer = (letter: string) => {
    return selectedAnswers.includes(letter);
  };
  
  const getOptionClassName = (letter: string) => {
    let className = 'question-option';
    
    if (submitted) {
      if (isCorrectAnswer(letter)) {
        className += ' correct';
      } else if (isSelectedAnswer(letter)) {
        className += ' incorrect';
      }
    } else if (isSelectedAnswer(letter)) {
      className += ' selected';
    }
    
    return className;
  };
  
  const toggleBookmark = () => {
    if (questionProgress.bookmarked) {
      removeBookmark(question.id);
    } else {
      addBookmark(question.id);
    }
  };
  
  return (
    <Card className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="text-sm text-gray-500">
            Question #{question.id}
          </div>
          {question.category && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {question.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          )}
          {/* Status Label */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            questionProgress.status === 'mastered' ? 'bg-green-100 text-green-800' :
            questionProgress.status === 'practicing' ? 'bg-blue-100 text-blue-800' :
            questionProgress.status === 'needs-review' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {questionProgress.status === 'mastered' && <CheckCircle size={10} className="mr-1" />}
            {questionProgress.status === 'needs-review' && <AlertTriangle size={10} className="mr-1" />}
            {questionProgress.status === 'practicing' && <RotateCcw size={10} className="mr-1" />}
            {questionProgress.status === 'new' && <Flag size={10} className="mr-1" />}
            {questionProgress.status.charAt(0).toUpperCase() + questionProgress.status.slice(1).replace('-', ' ')}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleBookmark}
            className="p-2 text-gray-400 hover:text-aws-orange transition-colors"
          >
            {questionProgress.bookmarked ? (
              <BookmarkCheck size={20} className="text-aws-orange" />
            ) : (
              <Bookmark size={20} />
            )}
          </button>
        </div>
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
      <div className="space-y-3 mb-6">
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
              <div className="flex-1 text-sm leading-relaxed break-words">
                {option.text}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex space-x-3">
          {!submitted ? (
            <Button 
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0}
            >
              Submit Answer
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="text-green-600 font-medium">Answer Submitted!</div>
              {onNext && (
                <Button onClick={onNext}>
                  Next Question
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Explanation */}
      {submitted && (
        <DetailedExplanation 
          question={question} 
          userAnswer={selectedAnswers.join('')}
        />
      )}
      
      {/* Manual Status Control */}
      {submitted && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Question Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                questionProgress.status === 'mastered' ? 'bg-green-100 text-green-800' :
                questionProgress.status === 'practicing' ? 'bg-blue-100 text-blue-800' :
                questionProgress.status === 'needs-review' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {questionProgress.status === 'mastered' && <CheckCircle size={12} className="mr-1" />}
                {questionProgress.status === 'needs-review' && <AlertTriangle size={12} className="mr-1" />}
                {questionProgress.status === 'practicing' && <RotateCcw size={12} className="mr-1" />}
                {questionProgress.status === 'new' && <Flag size={12} className="mr-1" />}
                {questionProgress.status.charAt(0).toUpperCase() + questionProgress.status.slice(1).replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsMastered(question.id)}
                disabled={questionProgress.status === 'mastered'}
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                <CheckCircle size={14} className="mr-1" />
                Mark as Mastered
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => markForReview(question.id)}
                disabled={questionProgress.status === 'needs-review'}
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <AlertTriangle size={14} className="mr-1" />
                Mark for Review
              </Button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Manually override the question status based on your confidence level
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuestionCard;
