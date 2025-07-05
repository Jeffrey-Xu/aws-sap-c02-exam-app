import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Square, Eye, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExamTimer from '../components/exam/ExamTimer';
import ExamQuestion from '../components/exam/ExamQuestion';
import QuestionNavigator from '../components/exam/QuestionNavigator';
import ExamResults from '../components/exam/ExamResults';
import ExamReview from '../components/exam/ExamReview';
import ExamPreview from '../components/exam/ExamPreview';
import ExamHistory from '../components/exam/ExamHistory';
import ReviewDialog from '../components/exam/ReviewDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useQuestionStore } from '../stores/questionStore';
import { useExamStore } from '../stores/examStore';
import { useProgressStore } from '../stores/progressStore';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { ROUTES, EXAM_CONFIG } from '../constants';
import { getRandomQuestions, getQuestionsWithDomainRatio } from '../utils/questionUtils';
import type { Question } from '../types';

const ExamPage: React.FC = () => {
  const { questions, loading, loadQuestions } = useQuestionStore();
  const { addExamAttempt } = useProgressStore();
  const {
    currentSession,
    currentQuestionIndex,
    timeRemaining,
    isTimerRunning,
    examHistory,
    startExam,
    submitAnswer,
    flagQuestion,
    unflagQuestion,
    navigateToQuestion,
    pauseExam,
    resumeExam,
    completeExam,
    calculateScore,
    resetExam,
    updateTimer,
    deleteExamSession
  } = useExamStore();
  
  const [examQuestions, setExamQuestions] = useState<typeof questions>([]);
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [examScore, setExamScore] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  // Custom dialog hook
  const { dialogState, showDialog, hideDialog } = useConfirmDialog();
  
  useEffect(() => {
    if (questions.length === 0 && !loading) {
      loadQuestions();
    }
  }, [questions.length, loading, loadQuestions]);
  
  useEffect(() => {
    if (currentSession && questions.length > 0) {
      if (currentSession.status === 'in-progress') {
        const sessionQuestions = questions.filter(q => 
          currentSession.questions.includes(q.id)
        );
        setExamQuestions(sessionQuestions);
        setShowStartDialog(false);
      } else if (currentSession.status === 'completed' && !showResults && !showReview) {
        // If session is completed and we're not showing results/review, reset and show start dialog
        resetExam();
        setShowStartDialog(true);
        setExamScore(null);
      }
    }
  }, [currentSession, questions, resetExam, showResults, showReview]);
  
  const handleStartExam = () => {
    if (questions.length === 0) return;
    
    // Clear any existing session (including completed ones)
    if (currentSession) {
      resetExam();
    }
    
    // Generate fresh questions for the actual exam
    const selectedQuestions = getRandomQuestions(questions, EXAM_CONFIG.FULL_EXAM_QUESTIONS);
    const questionIds = selectedQuestions.map(q => q.id);
    
    startExam('full-exam', questionIds);
    
    // Clear all dialog states and start the exam
    setShowStartDialog(false);
    setShowPreview(false);
    setShowHistory(false);
    setShowResults(false);
    setShowReview(false);
  };

  const handlePrepareQuestions = (newQuestions?: Question[]) => {
    if (questions.length === 0) return;
    
    // If new questions are provided, use them; otherwise generate fresh ones
    let selectedQuestions: Question[];
    if (newQuestions) {
      selectedQuestions = newQuestions;
    } else {
      // Use domain ratios for better exam simulation
      selectedQuestions = getQuestionsWithDomainRatio(questions, EXAM_CONFIG.FULL_EXAM_QUESTIONS);
    }
    
    setExamQuestions(selectedQuestions);
    
    // Stay on preview page to show the prepared questions
    // Don't change the current view state
  };

  const handleStartTimedExam = () => {
    if (questions.length === 0) return;
    
    // Clear any existing session (including completed ones)
    if (currentSession) {
      resetExam();
    }
    
    // Generate fresh questions for the actual exam and start immediately
    const selectedQuestions = getRandomQuestions(questions, EXAM_CONFIG.FULL_EXAM_QUESTIONS);
    const questionIds = selectedQuestions.map(q => q.id);
    
    startExam('full-exam', questionIds);
    
    // Clear all dialog states and start the exam
    setShowStartDialog(false);
    setShowPreview(false);
    setShowHistory(false);
    setShowResults(false);
    setShowReview(false);
  };
  
  const handleAnswerChange = (answer: string) => {
    if (!currentSession || !examQuestions[currentQuestionIndex]) return;
    
    const questionId = examQuestions[currentQuestionIndex].id;
    submitAnswer(questionId, answer, 0); // Time tracking handled separately
  };
  
  const handleFlag = () => {
    if (!currentSession || !examQuestions[currentQuestionIndex]) return;
    
    const questionId = examQuestions[currentQuestionIndex].id;
    flagQuestion(questionId);
  };
  
  const handleUnflag = () => {
    if (!currentSession || !examQuestions[currentQuestionIndex]) return;
    
    const questionId = examQuestions[currentQuestionIndex].id;
    unflagQuestion(questionId);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  };
  
  const handleTimeUp = () => {
    handleSubmitExam();
  };
  
  const handleSubmitExam = () => {
    if (!currentSession) return;
    
    const answeredCount = Object.keys(currentSession.answers).length;
    const totalQuestions = examQuestions.length;
    const unansweredCount = totalQuestions - answeredCount;
    
    let message = `Are you sure you want to submit your exam?`;
    if (unansweredCount > 0) {
      message += `\n\nYou have ${unansweredCount} unanswered questions. These will be marked as incorrect.`;
    }
    
    showDialog(
      {
        title: 'Submit Exam',
        message,
        type: 'warning',
        confirmText: 'Submit Exam',
        cancelText: 'Continue Exam',
        confirmVariant: 'danger'
      },
      () => {
        const score = calculateScore(examQuestions);
        const completedSession = completeExam(score);
        
        // Add to progress store for dashboard display
        if (completedSession) {
          addExamAttempt(completedSession);
        }
        
        setExamScore(score);
        setShowResults(true);
      }
    );
  };
  
  const handleRetakeExam = () => {
    resetExam();
    setShowResults(false);
    setShowReview(false);
    setShowPreview(false);
    setShowHistory(false);
    setShowStartDialog(true);
    setExamScore(null);
  };
  
  const handleReviewAnswers = () => {
    setShowResults(false);
    setShowReview(true);
  };
  
  const handleBackToResults = () => {
    setShowReview(false);
    setShowResults(true);
  };
  
  const handleShowPreview = () => {
    if (questions.length === 0) return;
    
    // Generate sample questions for preview using domain ratios
    const selectedQuestions = getQuestionsWithDomainRatio(questions, EXAM_CONFIG.FULL_EXAM_QUESTIONS);
    setExamQuestions(selectedQuestions);
    setShowStartDialog(false);
    setShowPreview(true);
  };
  
  const handleShowHistory = () => {
    setShowStartDialog(false);
    setShowHistory(true);
  };
  
  const handleBackToStart = () => {
    setShowPreview(false);
    setShowHistory(false);
    setShowStartDialog(true);
  };
  
  const handleViewHistoryResults = (session: any) => {
    // TODO: Implement viewing historical results
    alert('Historical results viewing coming soon!');
  };
  
  const handleDeleteSession = (sessionId: string) => {
    deleteExamSession(sessionId);
  };
  
  const handleReviewExam = () => {
    pauseExam(); // Pause the timer when opening review
    setShowReviewDialog(true);
  };
  
  const getAnsweredQuestions = (): Set<number> => {
    if (!currentSession) return new Set();
    
    return new Set(
      examQuestions
        .map((_, index) => index)
        .filter(index => {
          const questionId = examQuestions[index].id;
          return currentSession.answers[questionId];
        })
    );
  };
  
  const getFlaggedQuestions = (): Set<number> => {
    if (!currentSession) return new Set();
    
    return new Set(
      examQuestions
        .map((_, index) => index)
        .filter(index => {
          const questionId = examQuestions[index].id;
          return currentSession.flaggedQuestions.includes(questionId);
        })
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
      </div>
    );
  }
  
  // Show Preview
  if (showPreview) {
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
            <h1 className="text-2xl font-bold text-gray-900">Exam Preview</h1>
            <p className="text-gray-600">Review the exam structure before starting</p>
          </div>
        </div>
        
        <ExamPreview
          questions={examQuestions}
          allQuestions={questions}
          onPrepareQuestions={handlePrepareQuestions}
          onStartTimedExam={handleStartTimedExam}
          onClose={handleBackToStart}
        />
      </div>
    );
  }
  
  // Show History
  if (showHistory) {
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
            <h1 className="text-2xl font-bold text-gray-900">Exam History</h1>
            <p className="text-gray-600">Review your past exam attempts</p>
          </div>
        </div>
        
        <ExamHistory
          examHistory={examHistory}
          onViewResults={handleViewHistoryResults}
          onDeleteSession={handleDeleteSession}
          onClose={handleBackToStart}
        />
      </div>
    );
  }
  
  // Show Review
  if (showReview && currentSession) {
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
            <h1 className="text-2xl font-bold text-gray-900">Answer Review</h1>
            <p className="text-gray-600">Review your exam answers with detailed explanations</p>
          </div>
        </div>
        
        <ExamReview
          questions={examQuestions}
          session={currentSession}
          onClose={handleBackToResults}
        />
      </div>
    );
  }
  
  // Show Results
  if (showResults && currentSession && examScore) {
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
            <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
            <p className="text-gray-600">AWS Solutions Architect Professional (SAP-C02)</p>
          </div>
        </div>
        
        <ExamResults
          session={currentSession}
          score={examScore}
          questions={examQuestions}
          onRetakeExam={handleRetakeExam}
          onReviewAnswers={handleReviewAnswers}
        />
      </div>
    );
  }
  
  // Start Dialog
  if (showStartDialog) {
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
            <h1 className="text-2xl font-bold text-gray-900">Exam Simulator</h1>
            <p className="text-gray-600">AWS Solutions Architect Professional (SAP-C02)</p>
          </div>
        </div>
        
        <Card className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-aws-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Start Your Exam?
            </h2>
            <p className="text-gray-600">
              This is a full simulation of the AWS SAP-C02 exam
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <div className="font-medium text-gray-900">Questions</div>
                <div className="text-gray-600">{EXAM_CONFIG.FULL_EXAM_QUESTIONS}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Time Limit</div>
                <div className="text-gray-600">180 minutes</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Passing Score</div>
                <div className="text-gray-600">{EXAM_CONFIG.PASSING_PERCENTAGE}%</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Question Types</div>
                <div className="text-gray-600">Multiple Choice</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button onClick={handleStartExam} size="lg" className="w-full">
              <Play size={20} className="mr-2" />
              Start Exam
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleShowPreview} className="flex items-center justify-center">
                <Eye size={16} className="mr-2" />
                Preview Questions
              </Button>
              
              <Button variant="outline" onClick={handleShowHistory} className="flex items-center justify-center">
                <History size={16} className="mr-2" />
                View History ({examHistory.length})
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Make sure you have 3 hours available. The timer will start immediately.
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Exam Interface
  if (currentSession && examQuestions.length > 0) {
    const currentQuestion = examQuestions[currentQuestionIndex];
    const selectedAnswer = currentSession.answers[currentQuestion.id] || '';
    const isFlagged = currentSession.flaggedQuestions.includes(currentQuestion.id);
    const answeredQuestions = getAnsweredQuestions();
    const flaggedQuestions = getFlaggedQuestions();
    
    return (
      <div className="space-y-6">
        {/* Exam Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">
              AWS SAP-C02 Exam Simulator
            </h1>
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {examQuestions.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ExamTimer
              timeRemaining={timeRemaining}
              isRunning={isTimerRunning}
              onTimeUp={handleTimeUp}
              onUpdate={updateTimer}
            />
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isTimerRunning ? pauseExam : resumeExam}
              >
                {isTimerRunning ? <Square size={16} /> : <Play size={16} />}
                {isTimerRunning ? 'Pause' : 'Resume'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReviewExam}
              >
                <Eye size={16} className="mr-1" />
                Review
              </Button>
              
              <Button
                onClick={handleSubmitExam}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question */}
          <div className="lg:col-span-3">
            <ExamQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={examQuestions.length}
              selectedAnswer={selectedAnswer}
              isFlagged={isFlagged}
              onAnswerChange={handleAnswerChange}
              onFlag={handleFlag}
              onUnflag={handleUnflag}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoNext={currentQuestionIndex < examQuestions.length - 1}
              canGoPrevious={currentQuestionIndex > 0}
            />
          </div>
          
          {/* Navigator */}
          <div className="lg:col-span-1">
            <QuestionNavigator
              totalQuestions={examQuestions.length}
              currentQuestion={currentQuestionIndex}
              answeredQuestions={answeredQuestions}
              flaggedQuestions={flaggedQuestions}
              onNavigate={navigateToQuestion}
            />
          </div>
        </div>
        
        {/* Review Dialog */}
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          session={currentSession}
          questions={examQuestions}
          currentQuestionIndex={currentQuestionIndex}
          timeRemaining={timeRemaining}
          onNavigateToQuestion={navigateToQuestion}
          onResumeExam={resumeExam}
        />
        
        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={dialogState.isOpen}
          onClose={hideDialog}
          onConfirm={dialogState.onConfirm}
          title={dialogState.title}
          message={dialogState.message}
          type={dialogState.type}
          confirmText={dialogState.confirmText}
          cancelText={dialogState.cancelText}
          confirmVariant={dialogState.confirmVariant}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Exam...</h2>
          <p className="text-gray-600">Please wait while we prepare your exam.</p>
        </div>
      </Card>
    </div>
  );
};

export default ExamPage;
