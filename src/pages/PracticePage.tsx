import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, BarChart3, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import QuestionCard from '../components/practice/QuestionCard';
import QuestionFilters from '../components/practice/QuestionFilters';
import SmartRecommendations from '../components/practice/SmartRecommendations';
import FlashcardMode from '../components/study/FlashcardMode';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import PageLoader from '../components/common/PageLoader';
import { QuestionSkeleton } from '../components/common/SkeletonLoader';
import { useQuestionStore } from '../stores/questionStore';
import { categorizeQuestion } from '../utils/questionUtils';
import { useProgressStore } from '../stores/progressStore';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { ROUTES } from '../constants';
import type { ExamDomain, QuestionStatus } from '../types';

const PracticePage: React.FC = () => {
  const location = useLocation();
  const { 
    questions, 
    filters, 
    loading, 
    loadQuestions, 
    updateFilters, 
    resetFilters 
  } = useQuestionStore();
  
  const { 
    questionProgress, 
    updateQuestionProgress
  } = useProgressStore();
  
  // Use data refresh hook for tab switching
  const { refreshAllData } = useDataRefresh();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedQuestions, setRecommendedQuestions] = useState<typeof questions>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Apply filters with progress data for bookmarks - MOVED UP
  const filteredQuestions = React.useMemo(() => {
    return questions.filter(question => {
      // Category filter
      if (filters.category && categorizeQuestion(question) !== filters.category) {
        return false;
      }
      
      // Status filter
      if (filters.status) {
        const progress = questionProgress[question.id];
        const status = progress?.status || 'new';
        if (status !== filters.status) {
          return false;
        }
      }
      
      // Bookmark filter
      if (filters.bookmarked) {
        const progress = questionProgress[question.id];
        if (!progress || !progress.bookmarked) {
          return false;
        }
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const questionText = question.question.toLowerCase();
        const optionsText = question.options ? 
          question.options.map(opt => (typeof opt === 'string' ? opt : opt.text || '')).join(' ').toLowerCase() : '';
        
        if (!questionText.includes(searchTerm) && !optionsText.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  }, [questions, filters, questionProgress]);
  
  useEffect(() => {
    if (questions.length === 0 && !loading) {
      loadQuestions();
    }
    
    // Check URL parameters for flashcard mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'flashcards') {
      setShowFlashcards(true);
    }
  }, [questions.length, loading, loadQuestions]);
  
  useEffect(() => {
    // Reset to first question when filters or recommended questions change
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
  }, [filters, recommendedQuestions]);

  // Add keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          if (currentQuestionIndex > 0) {
            handlePrevious();
          }
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          if (currentQuestionIndex < displayQuestions.length - 1) {
            handleNext();
          }
          break;
        case 'j':
          e.preventDefault();
          // Focus on jump to position input
          document.getElementById('jumpToPosition')?.focus();
          break;
        case 'f':
          e.preventDefault();
          // Focus on jump to ID input
          document.getElementById('jumpToQuestionId')?.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, displayQuestions.length, handleNext, handlePrevious]);

  // Determine which questions to display: recommended questions take priority over filtered questions
  const displayQuestions = recommendedQuestions.length > 0 ? recommendedQuestions : filteredQuestions;
  const currentQuestion = displayQuestions[currentQuestionIndex];
  
  const handleAnswer = (answer: string, timeSpent: number) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correct_answer;
    const questionDomain = categorizeQuestion(currentQuestion);
    updateQuestionProgress(currentQuestion.id, isCorrect, timeSpent, questionDomain);
    setShowExplanation(true);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < displayQuestions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowExplanation(false);
        setIsTransitioning(false);
      }, 150);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        setShowExplanation(false);
        setIsTransitioning(false);
      }, 150);
    }
  };
  
  const handleStartRecommendedSession = (questions: typeof filteredQuestions, sessionType: string) => {
    setRecommendedQuestions(questions);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setShowRecommendations(false);
  };
  
  const handleExitRecommendedSession = () => {
    setRecommendedQuestions([]);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
  };
  
  const handleStartFlashcards = () => {
    setShowFlashcards(true);
  };
  
  const handleExitFlashcards = () => {
    setShowFlashcards(false);
  };
  
  // Calculate question counts for filters
  const questionCounts = {
    total: questions.length,
    filtered: displayQuestions.length,
    byCategory: Object.keys(questions.reduce((acc, q) => {
      const category = q.category || 'new-solutions';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).reduce((acc, category) => {
      acc[category as ExamDomain] = questions.filter(q => 
        (q.category || 'new-solutions') === category
      ).length;
      return acc;
    }, {} as Record<ExamDomain, number>),
    byStatus: displayQuestions.reduce((acc, question) => {
      const progress = questionProgress[question.id];
      const status = progress?.status || 'new'; // Default to 'new' if no progress
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { new: 0, practicing: 0, mastered: 0, 'needs-review': 0 } as Record<QuestionStatus, number>)
  };
  
  if (loading) {
    return (
      <PageLoader 
        text="Loading Practice Questions" 
        subText="Preparing your personalized study session..."
      />
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to={ROUTES.HOME}>
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practice Mode</h1>
            <p className="text-gray-600">Study by domain with instant feedback</p>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
            <p className="text-gray-600">Unable to load the question bank. Please check your connection and try again.</p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Show flashcard mode if enabled
  if (showFlashcards) {
    return (
      <FlashcardMode
        onComplete={handleExitFlashcards}
        initialDomain={filters.category}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={ROUTES.HOME}>
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practice Mode</h1>
            <p className="text-gray-600">Study by domain with instant feedback</p>
          </div>
        </div>
      </div>
      
      {/* Recommended Session Indicator */}
      {recommendedQuestions.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <h3 className="font-semibold text-purple-900">Smart Recommendation Session</h3>
                <p className="text-sm text-purple-700">
                  Practicing {displayQuestions.length} recommended questions
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExitRecommendedSession}
              className="text-purple-600 border-purple-300 hover:bg-purple-100"
            >
              Exit Session
            </Button>
          </div>
        </div>
      )}
      
      {/* Smart Recommendations */}
      {!showRecommendations && recommendedQuestions.length === 0 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowRecommendations(true)}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Zap className="w-4 h-4 mr-2" />
            Show Smart Recommendations
          </Button>
        </div>
      )}
      
      {showRecommendations && (
        <SmartRecommendations
          questions={questions}
          questionProgress={questionProgress}
          onStartRecommendedSession={handleStartRecommendedSession}
        />
      )}
      
      {/* Filters */}
      <QuestionFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
        questionCounts={questionCounts}
      />
      
      {/* Question Navigation */}
      {filteredQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {displayQuestions.length}
              {currentQuestion && (
                <span className="text-gray-400 ml-2">(ID: #{currentQuestion.id})</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentQuestionIndex === displayQuestions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
          
          {/* Quick Jump Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              {/* Jump by Position */}
              <div className="flex items-center space-x-2">
                <label htmlFor="jumpToPosition" className="text-sm text-gray-600">
                  Jump to position:
                </label>
                <input
                  id="jumpToPosition"
                  type="number"
                  min="1"
                  max={displayQuestions.length}
                  placeholder="1"
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const questionNum = parseInt((e.target as HTMLInputElement).value);
                      if (questionNum >= 1 && questionNum <= displayQuestions.length) {
                        setCurrentQuestionIndex(questionNum - 1);
                        setShowExplanation(false);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('jumpToPosition') as HTMLInputElement;
                    const questionNum = parseInt(input.value);
                    if (questionNum >= 1 && questionNum <= displayQuestions.length) {
                      setCurrentQuestionIndex(questionNum - 1);
                      setShowExplanation(false);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-1 text-sm bg-aws-orange text-white rounded hover:bg-aws-orange-dark transition-colors"
                >
                  Go
                </button>
              </div>
              
              {/* Jump by Question ID */}
              <div className="flex items-center space-x-2">
                <label htmlFor="jumpToQuestionId" className="text-sm text-gray-600">
                  Jump to ID #:
                </label>
                <input
                  id="jumpToQuestionId"
                  type="number"
                  min="1"
                  placeholder="123"
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const questionId = parseInt((e.target as HTMLInputElement).value);
                      const foundIndex = displayQuestions.findIndex(q => q.id === questionId);
                      if (foundIndex !== -1) {
                        setCurrentQuestionIndex(foundIndex);
                        setShowExplanation(false);
                        (e.target as HTMLInputElement).value = '';
                      } else {
                        alert(`Question ID #${questionId} not found in current filtered results.`);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('jumpToQuestionId') as HTMLInputElement;
                    const questionId = parseInt(input.value);
                    const foundIndex = displayQuestions.findIndex(q => q.id === questionId);
                    if (foundIndex !== -1) {
                      setCurrentQuestionIndex(foundIndex);
                      setShowExplanation(false);
                      input.value = '';
                    } else {
                      alert(`Question ID #${questionId} not found in current filtered results.`);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Find
                </button>
              </div>
            </div>
            
            {/* Keyboard Shortcuts Help */}
            <div className="text-xs text-gray-500">
              <span className="hidden sm:inline">
                Shortcuts: ← → (or H L) = Navigate | J = Jump to position | F = Find by ID
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Current Question */}
      {currentQuestion ? (
        <div className="space-y-4">
          {isTransitioning ? (
            <Card>
              <QuestionSkeleton />
            </Card>
          ) : (
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              showExplanation={showExplanation}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          
          {/* Additional Actions */}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Match Your Filters</h2>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more questions.</p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PracticePage;
