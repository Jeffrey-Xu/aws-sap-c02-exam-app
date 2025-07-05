import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, Clock, Target } from 'lucide-react';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { safeNumber } from '../../utils/questionUtils';
import type { ExamSession } from '../../types';

interface PerformanceTrendsProps {
  examAttempts: ExamSession[];
  studyStreak: number;
  totalStudyTime: number;
}

interface TrendData {
  date: string;
  score: number;
  timeSpent: number;
  questionsAnswered: number;
}

const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({
  examAttempts,
  studyStreak,
  totalStudyTime
}) => {
  const generateTrendData = (): TrendData[] => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayAttempts = examAttempts.filter(attempt => 
        attempt.startTime.toISOString().split('T')[0] === date
      );
      
      const avgScore = dayAttempts.length > 0 
        ? dayAttempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0) / dayAttempts.length
        : 0;
      
      const totalTime = dayAttempts.reduce((sum, attempt) => sum + attempt.duration, 0);
      const totalQuestions = dayAttempts.reduce((sum, attempt) => sum + attempt.questions.length, 0);

      return {
        date,
        score: avgScore,
        timeSpent: totalTime,
        questionsAnswered: totalQuestions
      };
    });
  };

  const trendData = generateTrendData();
  const recentData = trendData.slice(-7); // Last 7 days
  
  const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3).filter(d => d > 0);
    const earlier = data.slice(-6, -3).filter(d => d > 0);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const diff = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  };

  const scoreTrend = calculateTrend(trendData.map(d => d.score));
  const timeTrend = calculateTrend(trendData.map(d => d.timeSpent));
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const recentScore = recentData.filter(d => d.score > 0).slice(-1)[0]?.score || 0;
  const studyDaysThisWeek = recentData.filter(d => d.timeSpent > 0).length;
  const avgDailyTime = recentData.reduce((sum, d) => sum + d.timeSpent, 0) / 7;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(safeNumber(recentScore, 0))}%
              </div>
              <div className="text-sm text-gray-600">Recent Score</div>
            </div>
            <div className="flex items-center">
              {getTrendIcon(scoreTrend)}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {studyStreak}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(totalStudyTime)}
              </div>
              <div className="text-sm text-gray-600">Total Study</div>
            </div>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {studyDaysThisWeek}/7
              </div>
              <div className="text-sm text-gray-600">Days This Week</div>
            </div>
            <Target className="w-6 h-6 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            7-Day Performance Trend
          </h3>
          <p className="text-gray-600">Your daily study activity and scores</p>
        </div>

        <div className="space-y-4">
          {recentData.map((day, index) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const hasActivity = day.score > 0 || day.timeSpent > 0;
            
            return (
              <div key={day.date} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {dayName}
                </div>
                
                <div className="flex-1">
                  {hasActivity ? (
                    <div className="space-y-2">
                      {day.score > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 text-xs text-gray-500">Score:</div>
                          <div className="flex-1">
                            <ProgressBar 
                              progress={day.score} 
                              color={day.score >= 70 ? 'green' : day.score >= 50 ? 'orange' : 'red'}
                              size="sm"
                            />
                          </div>
                          <div className="w-12 text-xs font-medium text-gray-700">
                            {Math.round(safeNumber(day.score, 0))}%
                          </div>
                        </div>
                      )}
                      
                      {day.timeSpent > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 text-xs text-gray-500">Time:</div>
                          <div className="flex-1">
                            <div className="h-1 bg-gray-200 rounded-full">
                              <div 
                                className="h-1 bg-blue-500 rounded-full"
                                style={{ 
                                  width: `${Math.min((day.timeSpent / 7200) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-12 text-xs font-medium text-gray-700">
                            {formatTime(day.timeSpent)}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">No study activity</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insights */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Performance Insights
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Study Consistency</div>
              <div className="text-sm text-gray-600">
                You studied {studyDaysThisWeek} out of 7 days this week. 
                {studyDaysThisWeek >= 5 ? ' Excellent consistency!' : 
                 studyDaysThisWeek >= 3 ? ' Good progress, try to study daily.' : 
                 ' Consider increasing study frequency.'}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="mt-0.5">{getTrendIcon(scoreTrend)}</div>
            <div>
              <div className="font-medium text-gray-900">Score Trend</div>
              <div className={`text-sm ${getTrendColor(scoreTrend)}`}>
                {scoreTrend === 'up' && 'Your scores are improving! Keep up the great work.'}
                {scoreTrend === 'down' && 'Scores have declined recently. Focus on weak areas.'}
                {scoreTrend === 'stable' && 'Scores are stable. Consider challenging yourself more.'}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Study Time</div>
              <div className="text-sm text-gray-600">
                Average {formatTime(avgDailyTime)} per day this week. 
                {avgDailyTime >= 3600 ? ' Excellent dedication!' : 
                 avgDailyTime >= 1800 ? ' Good study time.' : 
                 ' Consider increasing daily study time.'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PerformanceTrends;
