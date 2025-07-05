import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, Trophy, Target, Calendar, Flame } from 'lucide-react';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import { useQuestionStore } from '../stores/questionStore';
import { useProgressStore } from '../stores/progressStore';
import { ROUTES, DOMAIN_INFO } from '../constants';
import { calculateReadinessScore, safePercentage, safeNumber } from '../utils/questionUtils';

const HomePage: React.FC = () => {
  const { questions, loading, loadQuestions } = useQuestionStore();
  const { 
    totalQuestions, 
    masteredQuestions, 
    categoryProgress, 
    studyStreak,
    examAttempts,
    calculateProgress 
  } = useProgressStore();
  
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
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
      </div>
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
