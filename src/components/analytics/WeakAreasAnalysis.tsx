import React from 'react';
import { AlertTriangle, Target, BookOpen, TrendingDown, Clock } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import { DOMAIN_INFO } from '../../constants';
import type { ExamDomain, CategoryProgress } from '../../types';

interface WeakAreasAnalysisProps {
  categoryProgress: Record<ExamDomain, CategoryProgress>;
  onStartTargetedPractice: (domain: ExamDomain) => void;
}

interface WeakArea {
  domain: ExamDomain;
  score: number;
  attempts: number;
  timeSpent: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

const WeakAreasAnalysis: React.FC<WeakAreasAnalysisProps> = ({
  categoryProgress,
  onStartTargetedPractice
}) => {
  const analyzeWeakAreas = (): WeakArea[] => {
    const weakAreas: WeakArea[] = [];
    
    Object.entries(categoryProgress).forEach(([domain, progress]) => {
      const domainKey = domain as ExamDomain;
      const score = progress.averageScore || 0;
      const attempts = progress.totalQuestions || 0;
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      let recommendation = '';
      
      if (score < 50) {
        priority = 'high';
        recommendation = 'Critical - Focus immediately on fundamentals';
      } else if (score < 70) {
        priority = 'medium';
        recommendation = 'Important - Regular practice needed';
      } else if (score < 85) {
        priority = 'low';
        recommendation = 'Good - Occasional review recommended';
      } else {
        return; // Skip strong areas
      }
      
      weakAreas.push({
        domain: domainKey,
        score,
        attempts,
        timeSpent: progress.timeSpent || 0,
        priority,
        recommendation
      });
    });
    
    return weakAreas.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const weakAreas = analyzeWeakAreas();
  
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBorderClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'low': return 'border-l-4 border-yellow-500 bg-yellow-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getPriorityButtonClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600 hover:bg-red-700';
      case 'medium': return 'bg-orange-600 hover:bg-orange-700';
      case 'low': return 'bg-yellow-600 hover:bg-yellow-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <TrendingDown className="w-5 h-5 text-orange-600" />;
      case 'low': return <Target className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (weakAreas.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Great Job! No Weak Areas Detected
          </h3>
          <p className="text-gray-600 mb-4">
            You're performing well across all domains. Keep up the excellent work!
          </p>
          <div className="text-sm text-gray-500">
            Continue practicing to maintain your strong performance.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Weak Areas Analysis</h2>
        </div>
        <p className="text-gray-600">
          Focus your study time on these areas to improve your exam readiness
        </p>
      </div>

      <div className="space-y-4">
        {weakAreas.map((area) => {
          const domainInfo = DOMAIN_INFO[area.domain];
          
          return (
            <div
              key={area.domain}
              className={`${getPriorityBorderClass(area.priority)} rounded-lg p-4`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getPriorityIcon(area.priority)}
                    <h3 className="font-semibold text-gray-900 ml-2">
                      {domainInfo.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeClass(area.priority)}`}>
                      {area.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {domainInfo.description}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {area.recommendation}
                  </p>
                </div>
                
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(area.score)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Current Score
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress to Mastery</span>
                  <span>{Math.round(area.score)}% / 85%</span>
                </div>
                <ProgressBar 
                  progress={area.score} 
                  color={area.priority === 'high' ? 'red' : area.priority === 'medium' ? 'orange' : 'green'}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span>{area.attempts} questions</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatTime(area.timeSpent)} studied</span>
                  </div>
                  <div className="text-xs">
                    {domainInfo.percentage}% of exam
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onStartTargetedPractice(area.domain)}
                  className={getPriorityButtonClass(area.priority)}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Practice Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Study Recommendations</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Focus 70% of your study time on high-priority areas</li>
          <li>• Aim for 85%+ accuracy before moving to next priority level</li>
          <li>• Review explanations thoroughly for incorrect answers</li>
          <li>• Use flashcard mode for quick concept reinforcement</li>
          <li>• Take practice exams weekly to track improvement</li>
        </ul>
      </div>
    </Card>
  );
};

export default WeakAreasAnalysis;
