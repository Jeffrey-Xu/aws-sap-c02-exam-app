import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle } from 'lucide-react';
import type { Question, ExamSession } from '../../types';
import { parseCorrectAnswers, isMultipleChoice } from '../../utils/questionUtils';
import Button from '../common/Button';
import Card from '../common/Card';

interface ExamReviewProps {
  questions: Question[];
  session: ExamSession;
  onClose: () => void;
}

const ExamReview: React.FC<ExamReviewProps> = ({
  questions,
  session,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'flagged'>('all');
  
  const getFilteredQuestions = () => {
    return questions.filter((question, index) => {
      const userAnswer = session.answers[question.id] || '';
      const isCorrect = userAnswer === question.correct_answer;
      const isFlagged = session.flaggedQuestions.includes(question.id);
      
      switch (filter) {
        case 'correct':
          return isCorrect;
        case 'incorrect':
          return !isCorrect && userAnswer !== '';
        case 'flagged':
          return isFlagged;
        default:
          return true;
      }
    });
  };
  
  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentIndex];
  
  if (!currentQuestion) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions to Review</h2>
        <p className="text-gray-600 mb-4">Try changing the filter or go back to results.</p>
        <Button onClick={onClose}>Back to Results</Button>
      </Card>
    );
  }
  
  const userAnswer = session.answers[currentQuestion.id] || '';
  const correctAnswers = parseCorrectAnswers(currentQuestion.correct_answer);
  const userAnswers = userAnswer ? userAnswer.split('') : [];
  const isCorrect = userAnswer === currentQuestion.correct_answer;
  const isFlagged = session.flaggedQuestions.includes(currentQuestion.id);
  const isMultiple = isMultipleChoice(currentQuestion.correct_answer);
  
  const getOptionClassName = (letter: string) => {
    const isUserSelected = userAnswers.includes(letter);
    const isCorrectOption = correctAnswers.includes(letter);
    
    if (isCorrectOption && isUserSelected) {
      return 'question-option correct'; // Correct and selected
    } else if (isCorrectOption) {
      return 'question-option border-green-500 bg-green-50'; // Correct but not selected
    } else if (isUserSelected) {
      return 'question-option incorrect'; // Incorrect but selected
    }
    return 'question-option'; // Default
  };
  
  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Exam Review</h2>
          <p className="text-gray-600">
            Question {currentIndex + 1} of {filteredQuestions.length} 
            {filter !== 'all' && ` (${filter})`}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Back to Results
        </Button>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Questions', count: questions.length },
          { key: 'correct', label: 'Correct', count: questions.filter(q => session.answers[q.id] === q.correct_answer).length },
          { key: 'incorrect', label: 'Incorrect', count: questions.filter(q => session.answers[q.id] && session.answers[q.id] !== q.correct_answer).length },
          { key: 'flagged', label: 'Flagged', count: questions.filter(q => session.flaggedQuestions.includes(q.id)).length }
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setFilter(key as any);
              setCurrentIndex(0);
            }}
          >
            {label} ({count})
          </Button>
        ))}
      </div>
      
      {/* Question Card */}
      <Card className="max-w-4xl mx-auto">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
            </div>
            
            {isFlagged && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                <Flag size={14} />
                <span>Flagged</span>
              </div>
            )}
            
            {currentQuestion.category && (
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {currentQuestion.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            )}
          </div>
        </div>
        
        {/* Question Text */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {currentQuestion.question}
          </h3>
          {isMultiple && (
            <p className="text-sm text-blue-600 mt-2">
              Multiple correct answers ({correctAnswers.length} correct)
            </p>
          )}
        </div>
        
        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => (
            <div
              key={option.letter}
              className={getOptionClassName(option.letter)}
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
        
        {/* User Answer Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Your Answer:</span>
              <span className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {userAnswer || 'Not answered'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Correct Answer:</span>
              <span className="ml-2 text-green-600">{currentQuestion.correct_answer}</span>
            </div>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Explanation</h4>
            <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
          </div>
          
          <div>
            <h5 className="font-medium text-green-700 mb-2">✅ Why the correct answer is right:</h5>
            <p className="text-gray-700 leading-relaxed">{currentQuestion.why_correct}</p>
          </div>
          
          {currentQuestion.why_others_wrong.length > 0 && (
            <div>
              <h5 className="font-medium text-red-700 mb-2">❌ Why other options are wrong:</h5>
              <ul className="space-y-2">
                {currentQuestion.why_others_wrong.map((explanation, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed">
                    • {explanation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {filteredQuestions.length}
          </span>
          
          <Button
            onClick={handleNext}
            disabled={currentIndex === filteredQuestions.length - 1}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExamReview;
