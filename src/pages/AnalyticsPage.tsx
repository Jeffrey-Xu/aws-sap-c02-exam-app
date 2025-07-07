import React, { useEffect } from 'react';
import { ArrowLeft, Target, Clock, Trophy, TrendingUp, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import WeakAreasAnalysis from '../components/analytics/WeakAreasAnalysis';
import PerformanceTrends from '../components/analytics/PerformanceTrends';
import { useQuestionStore } from '../stores/questionStore';
import { useProgressStore } from '../stores/progressStore';
import { ROUTES, DOMAIN_INFO } from '../constants';
import { calculateReadinessScore, formatTime, safePercentage, safeNumber } from '../utils/questionUtils';
import type { ExamDomain } from '../types';

const AnalyticsPage: React.FC = () => {
  const { questions, loading, loadQuestions } = useQuestionStore();
  const {
    totalQuestions,
    masteredQuestions,
    categoryProgress,
    studyStreak,
    totalStudyTime,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to={ROUTES.HOME}>
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Progress</h1>
          <p className="text-gray-600">Comprehensive exam preparation insights</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{readinessScore}%</div>
          <div className="text-sm text-gray-600">Exam Readiness</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{masteredQuestions}</div>
          <div className="text-sm text-gray-600">Questions Mastered</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{formatTime(totalStudyTime)}</div>
          <div className="text-sm text-gray-600">Study Time</div>
        </Card>
        
        <Card className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{studyStreak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </Card>
      </div>

      {/* Performance Trends Dashboard */}
      <PerformanceTrends
        examAttempts={examAttempts}
        studyStreak={studyStreak}
        totalStudyTime={totalStudyTime}
      />

      {/* Weak Areas Analysis Dashboard */}
      <WeakAreasAnalysis
        categoryProgress={categoryProgress}
        onStartTargetedPractice={(domain: ExamDomain) => {
          window.location.href = `${ROUTES.PRACTICE}?domain=${domain}`;
        }}
      />

      {/* Domain Performance Details */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Domain Performance</h2>
        
        {/* Debug Information - Remove in production */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Debug: Domain Performance Data
            </summary>
            <div className="space-y-2">
              {Object.entries(DOMAIN_INFO).map(([domain, info]) => {
                const progress = categoryProgress[domain as keyof typeof categoryProgress];
                return (
                  <div key={domain} className="text-gray-600">
                    <strong>{domain}:</strong> 
                    Total: {progress?.totalQuestions || 'undefined'}, 
                    Mastered: {progress?.masteredQuestions || 'undefined'}, 
                    AvgScore: {progress?.averageScore?.toFixed(2) || 'undefined'}%, 
                    Time: {progress?.timeSpent || 'undefined'}s
                  </div>
                );
              })}
            </div>
          </details>
        </div>
        
        <div className="space-y-6">
          {Object.entries(DOMAIN_INFO).map(([domain, info]) => {
            const progress = categoryProgress[domain as keyof typeof categoryProgress];
            
            // Handle case where no progress data exists for this domain
            if (!progress || !progress.totalQuestions) {
              return (
                <div key={domain} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{info.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{info.percentage}% of exam</span>
                        <span>•</span>
                        <span>No questions attempted yet</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-400">0%</div>
                      <div className="text-sm text-gray-400">0 / 0</div>
                    </div>
                  </div>
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Start practicing questions in this domain to see your progress</p>
                  </div>
                </div>
              );
            }
            
            const masteryPercentage = safePercentage(
              progress.masteredQuestions, 
              progress.totalQuestions
            );
            const averageScore = safeNumber(progress.averageScore, 0);
            const timeSpent = safeNumber(progress.timeSpent, 0);
            
            return (
              <div key={domain} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{info.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{info.percentage}% of exam</span>
                      <span>•</span>
                      <span>{formatTime(timeSpent)} studied</span>
                      <span>•</span>
                      <span>Avg: {Math.round(averageScore)}%</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">{masteryPercentage}%</div>
                    <div className="text-sm text-gray-500">
                      {progress.masteredQuestions} / {progress.totalQuestions}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Questions Mastered</span>
                    <span className="font-medium">{masteryPercentage}% ({progress.masteredQuestions} / {progress.totalQuestions})</span>
                  </div>
                  <ProgressBar
                    value={progress.masteredQuestions}
                    max={progress.totalQuestions}
                    color={masteryPercentage >= 70 ? 'green' : masteryPercentage >= 50 ? 'orange' : 'red'}
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Accuracy</span>
                    <span className="font-medium">{Math.round(averageScore)}%</span>
                  </div>
                  <ProgressBar
                    value={averageScore}
                    max={100}
                    color={averageScore >= 70 ? 'green' : averageScore >= 50 ? 'orange' : 'red'}
                    size="sm"
                  />
                  
                  {/* Additional insights */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Study Time</span>
                      <span>{formatTime(timeSpent)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Exam Weight</span>
                      <span>{info.percentage}% of total exam</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Exam Attempts */}
      {examAttempts.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Exam History</h2>
          <div className="space-y-3">
            {examAttempts.slice(-5).reverse().map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    (attempt.score?.passed) ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      {attempt.type === 'full-exam' ? 'Full Exam' : 'Practice Session'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(attempt.startTime).toLocaleDateString()} • {formatTime(attempt.duration)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    (attempt.score?.passed) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {attempt.score?.score || 0}/1000
                  </div>
                  <div className="text-xs text-gray-500">
                    {attempt.score?.correctAnswers || 0} / {attempt.score?.totalQuestions || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Study Recommendations */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Focus Areas</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Prioritize domains with &lt;70% mastery</li>
              <li>• Review incorrect answers thoroughly</li>
              <li>• Use flashcards for concept reinforcement</li>
              <li>• Take practice exams weekly</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Study Schedule</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Aim for 2-3 hours daily study</li>
              <li>• Mix practice questions with flashcards</li>
              <li>• Take full exams every weekend</li>
              <li>• Review weak areas before bed</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
