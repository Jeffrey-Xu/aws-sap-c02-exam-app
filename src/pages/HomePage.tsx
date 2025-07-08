import React, { useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, BarChart3, Trophy, Target, Calendar, Flame, CheckCircle, AlertTriangle, RotateCcw, Flag, HelpCircle, Clock, TrendingUp } from 'lucide-react';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import ExamCountdown from '../components/common/ExamCountdown';
import PageLoader from '../components/common/PageLoader';
import { useQuestionStore } from '../stores/questionStore';
import { useProgressStore } from '../stores/progressStore';
import { useServerAuthStore } from '../stores/serverAuthStore';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { ROUTES, DOMAIN_INFO } from '../constants';
import { calculateReadinessScore, safePercentage, safeNumber, formatTime } from '../utils/questionUtils';
import type { QuestionStatus } from '../types';

const HomePage: React.FC = () => {
  const location = useLocation();
  const { questions, loading, loadQuestions } = useQuestionStore();
  const { user } = useServerAuthStore();
  const { 
    totalQuestions, 
    masteredQuestions, 
    categoryProgress, 
    studyStreak,
    examAttempts,
    calculateProgress,
    questionProgress,
    totalStudyTime,
    loadUserProgress
  } = useProgressStore();
  
  // Use data refresh hook for tab switching
  const { refreshAllData } = useDataRefresh();
  
  // Calculate status statistics
  const statusStats = React.useMemo(() => {
    const stats = {
      new: 0,
      practicing: 0,
      mastered: 0,
      'needs-review': 0
    };
    
    // Count questions by status
    Object.values(questionProgress).forEach(progress => {
      stats[progress.status]++;
    });
    
    // Add questions that haven't been attempted yet (they're "new")
    const attemptedQuestions = Object.keys(questionProgress).length;
    stats.new += Math.max(0, questions.length - attemptedQuestions);
    
    return stats;
  }, [questionProgress, questions.length]);
  
  // Initial data loading
  useEffect(() => {
    if (questions.length === 0 && !loading) {
      loadQuestions();
    }
  }, [questions.length, loading, loadQuestions]);
  
  useEffect(() => {
    if (questions.length > 0) {
      const questionsByCategory = Object.keys(DOMAIN_INFO).reduce((acc, domain) => {
        acc[domain as keyof typeof DOMAIN_INFO] = questions.filter(q => q.category === domain).length;
        return acc;
      }, {} as Record<keyof typeof DOMAIN_INFO, number>);
      
      calculateProgress(questions.length, questionsByCategory);
    }
  }, [questions, calculateProgress]);
  
  const categoryProgressForReadiness = Object.keys(DOMAIN_INFO).reduce((acc, domain) => {
    const progress = categoryProgress[domain as keyof typeof categoryProgress];
    acc[domain as keyof typeof DOMAIN_INFO] = {
      mastered: progress?.masteredQuestions || 0,
      total: progress?.totalQuestions || 1
    };
    return acc;
  }, {} as Record<keyof typeof DOMAIN_INFO, { mastered: number; total: number }>);
  
  const readinessScore = calculateReadinessScore(
    totalQuestions,
    masteredQuestions,
    categoryProgressForReadiness
  );
  
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };
  
  const getReadinessText = (score: number) => {
    if (score >= 85) return 'Exam Ready';
    if (score >= 70) return 'Almost Ready';
    if (score >= 50) return 'Making Progress';
    return 'Getting Started';
  };
  
  if (loading) {
    return (
      <PageLoader 
        text="Loading Dashboard" 
        subText="Preparing your study progress and exam insights..."
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AWS Solutions Architect Professional
        </h1>
        <p className="text-lg text-gray-600">SAP-C02 Exam Preparation</p>
      </div>
      
      {/* Exam Countdown */}
      <ExamCountdown examDate={user?.examDate} />
      
      {/* Progress Overview with Integrated Stats */}
      <Card>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Trophy className={`w-8 h-8 ${readinessScore >= 80 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <div>
              <div className="text-3xl font-bold text-gray-900">{readinessScore}%</div>
              <div className={`text-sm font-medium ${
                readinessScore >= 80 ? 'text-green-600' : 
                readinessScore >= 60 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {getReadinessText(readinessScore)}
              </div>
            </div>
          </div>
          <ProgressBar
            value={masteredQuestions}
            max={totalQuestions}
            color={getReadinessColor(readinessScore)}
            className="max-w-md mx-auto mb-6"
          />
          
          {/* Integrated Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-xs text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{masteredQuestions}</div>
              <div className="text-xs text-gray-600">Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{studyStreak}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{examAttempts.length}</div>
              <div className="text-xs text-gray-600">Exams Taken</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Enhanced Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{formatTime(totalStudyTime)}</div>
          <div className="text-sm text-gray-600 mb-2">Total Study Time</div>
          <div className="text-xs text-gray-500">
            {totalStudyTime > 0 ? `${Math.round(totalStudyTime / 3600)} hours of focused study` : 'Start studying to track time'}
          </div>
        </Card>
        
        <Card className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">
            {Object.values(questionProgress).length > 0 ? 
              Math.round(Object.values(questionProgress).reduce((sum, p) => sum + (p.correctAttempts / Math.max(p.attempts, 1)), 0) / Object.values(questionProgress).length * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600 mb-2">Overall Accuracy</div>
          <div className="text-xs text-gray-500">
            Average success rate across all attempts
          </div>
        </Card>
        
        <Card className="p-6 text-center">
          <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">
            {Object.keys(categoryProgress).filter(domain => {
              const progress = categoryProgress[domain as keyof typeof categoryProgress];
              return progress && progress.masteredQuestions > 0;
            }).length}
          </div>
          <div className="text-sm text-gray-600 mb-2">Active Domains</div>
          <div className="text-xs text-gray-500">
            Domains with mastered questions
          </div>
        </Card>
      </div>
      
      {/* Question Status Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
            Question Status Overview
          </h2>
          <Link 
            to={ROUTES.PRACTICE} 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Practice Now →
          </Link>
        </div>
        
        {/* Status Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flag className="w-5 h-5 text-gray-600 mr-1" />
              <span className="text-2xl font-bold text-gray-800">{statusStats.new}</span>
            </div>
            <div className="text-sm font-medium text-gray-700">New</div>
            <div className="text-xs text-gray-500 mt-1">
              {questions.length > 0 ? Math.round((statusStats.new / questions.length) * 100) : 0}%
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5 text-blue-600 mr-1" />
              <span className="text-2xl font-bold text-blue-800">{statusStats.practicing}</span>
            </div>
            <div className="text-sm font-medium text-blue-700">Practicing</div>
            <div className="text-xs text-blue-500 mt-1">
              {questions.length > 0 ? Math.round((statusStats.practicing / questions.length) * 100) : 0}%
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-2xl font-bold text-green-800">{statusStats.mastered}</span>
            </div>
            <div className="text-sm font-medium text-green-700">Mastered</div>
            <div className="text-xs text-green-500 mt-1">
              {questions.length > 0 ? Math.round((statusStats.mastered / questions.length) * 100) : 0}%
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-1" />
              <span className="text-2xl font-bold text-red-800">{statusStats['needs-review']}</span>
            </div>
            <div className="text-sm font-medium text-red-700">Needs Review</div>
            <div className="text-xs text-red-500 mt-1">
              {questions.length > 0 ? Math.round((statusStats['needs-review'] / questions.length) * 100) : 0}%
            </div>
          </div>
        </div>
        
        {/* Status Definitions */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Definitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <Flag className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">New</div>
                <div className="text-gray-600">Questions you haven't attempted yet</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RotateCcw className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Practicing</div>
                <div className="text-gray-600">Answered correctly, but need more practice</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Mastered</div>
                <div className="text-gray-600">Answered correctly 3+ times or manually marked</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Needs Review</div>
                <div className="text-gray-600">Answered incorrectly or marked for review</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Study Tip:</strong> Focus on "Needs Review" questions first, then work on "New" questions. 
                Use manual status controls to override automatic tracking based on your confidence level.
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={ROUTES.PRACTICE}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Practice Questions</h3>
                <p className="text-sm text-gray-600">Study with detailed explanations</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to={`${ROUTES.PRACTICE}?mode=flashcards`}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <Flame className="w-8 h-8 text-orange-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">AWS Flashcards</h3>
                <p className="text-sm text-gray-600">Quick concept reinforcement</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to={ROUTES.EXAM}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Full Exam</h3>
                <p className="text-sm text-gray-600">75 questions, 180 minutes</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Domain Progress */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Domain Progress</h3>
          <Link to={ROUTES.ANALYTICS}>
            <div className="flex items-center text-sm text-blue-600 hover:text-blue-700">
              <BarChart3 className="w-4 h-4 mr-1" />
              View Analytics
            </div>
          </Link>
        </div>
        <div className="space-y-3">
          {Object.entries(DOMAIN_INFO).map(([domain, info]) => {
            const progress = categoryProgress[domain as keyof typeof categoryProgress];
            const percentage = safePercentage(
              progress?.masteredQuestions || 0, 
              progress?.totalQuestions || 1
            );
            
            return (
              <div key={domain} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{info.name}</span>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                  </div>
                  <ProgressBar
                    value={progress?.masteredQuestions || 0}
                    max={progress?.totalQuestions || 1}
                    color={percentage >= 70 ? 'green' : percentage >= 50 ? 'orange' : 'red'}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Recent Activity */}
      {examAttempts.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exam Attempts</h3>
          <div className="space-y-3">
            {examAttempts.slice(-3).reverse().map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {attempt.type === 'full-exam' ? 'Full Exam' : 'Practice Session'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(attempt.startTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    (attempt.score?.percentage || 0) >= 72 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {attempt.score?.score || 0}/1000
                  </div>
                  <div className="text-xs text-gray-500">
                    {attempt.score?.passed ? 'Passed' : 'Failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
