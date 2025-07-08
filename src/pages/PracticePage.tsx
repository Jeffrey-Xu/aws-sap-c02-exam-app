import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, BarChart3, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import QuestionCard from '../components/practice/QuestionCard';
import QuestionFilters from '../components/practice/QuestionFilters';
import SmartRecommendations from '../components/practice/SmartRecommendations';
import FlashcardMode from '../components/study/FlashcardMode';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
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
      console.log('🔄 Loading questions...');
      loadQuestions();
    }
    
    // Check URL parameters for flashcard mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'flashcards') {
      setShowFlashcards(true);
    }
  }, [questions.length, loading, loadQuestions]);
  
  // Debug logging
  useEffect(() => {
    console.log('📊 PracticePage state:', {
      questionsCount: questions.length,
      loading,
      filteredCount: filteredQuestions.length,
      currentIndex: currentQuestionIndex
    });
  }, [questions.length, loading, filteredQuestions.length, currentQuestionIndex]);
  
  useEffect(() => {
    // Reset to first question when filters change
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
  }, [filteredQuestions]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  const handleAnswer = (answer: string, timeSpent: number) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correct_answer;
    const questionDomain = categorizeQuestion(currentQuestion);
    updateQuestionProgress(currentQuestion.id, isCorrect, timeSpent, questionDomain);
    setShowExplanation(true);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };
  
  const handleStartRecommendedSession = (questions: typeof filteredQuestions, sessionType: string) => {
    setRecommendedQuestions(questions);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setShowRecommendations(false);
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
    filtered: filteredQuestions.length,
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
    byStatus: questions.reduce((acc, question) => {
      const progress = questionProgress[question.id];
      const status = progress?.status || 'new'; // Default to 'new' if no progress
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { new: 0, practicing: 0, mastered: 0, 'needs-review': 0 } as Record<QuestionStatus, number>)
  };
  
  if (loading) {
    console.log('⏳ PracticePage: Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
      </div>
    );
  }
  
  if (questions.length === 0) {
    console.log('❌ PracticePage: No questions available');
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
      
      {/* Smart Recommendations */}
      {!showRecommendations && (
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
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {filteredQuestions.length}
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
              disabled={currentQuestionIndex === filteredQuestions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Current Question */}
      {currentQuestion ? (
        <div className="space-y-4">
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            showExplanation={showExplanation}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
          
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
