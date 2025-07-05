import React from 'react';
import { Trophy, Target, Clock, BarChart3, Home, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ExamSession, ExamScore, Question } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import { ROUTES, DOMAIN_INFO, EXAM_CONFIG } from '../../constants';
import { formatTime, safeNumber } from '../../utils/questionUtils';

interface ExamResultsProps {
  session: ExamSession;
  score: ExamScore;
  questions: Question[];
  onRetakeExam: () => void;
  onReviewAnswers: () => void;
}

const ExamResults: React.FC<ExamResultsProps> = ({
  session,
  score,
  questions,
  onRetakeExam,
  onReviewAnswers
}) => {
  const examDuration = session.endTime && session.startTime 
    ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
    : 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= EXAM_CONFIG.PASSING_PERCENTAGE) return 'text-green-600';
    return 'text-red-600';
  };

  const getScoreBackground = (percentage: number) => {
    if (percentage >= EXAM_CONFIG.PASSING_PERCENTAGE) return 'bg-green-50 border-green-200';
    return 'bg-red-50 border-red-200';
  };

  const getDomainScoreColor = (percentage: number) => {
    const safePercentage = safeNumber(percentage, 0);
    if (safePercentage >= 80) return 'green';
    if (safePercentage >= 60) return 'orange';
    return 'red';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          score.passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Trophy className={`w-10 h-10 ${score.passed ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {score.passed ? 'Congratulations!' : 'Keep Studying!'}
        </h1>
        <p className="text-lg text-gray-600">
          {score.passed 
            ? 'You passed the AWS SAP-C02 practice exam!' 
            : 'You need more preparation before taking the real exam.'}
        </p>
      </div>

      {/* Overall Score */}
      <Card className={`text-center border-2 ${getScoreBackground(score.percentage)}`}>
        <div className="mb-4">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(score.percentage)}`}>
            {score.score}/1000
          </div>
          <div className="text-lg text-gray-600 mb-4">
            {score.correctAnswers} out of {score.totalQuestions} questions correct
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            score.passed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {score.passed ? '✅ PASSED' : '❌ FAILED'}
            <span className="ml-2">
              (Passing: {EXAM_CONFIG.PASSING_PERCENTAGE}%)
            </span>
          </div>
        </div>
      </Card>

      {/* Exam Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm" className="text-center">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{score.correctAnswers}</div>
          <div className="text-sm text-gray-600">Correct Answers</div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{formatTime(examDuration)}</div>
          <div className="text-sm text-gray-600">Time Taken</div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {Object.values(score.domainScores).filter(d => safeNumber(d.percentage, 0) >= 70).length}
          </div>
          <div className="text-sm text-gray-600">Domains Above 70%</div>
        </Card>
      </div>

      {/* Domain Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Domain</h3>
        <div className="space-y-4">
          {Object.entries(score.domainScores).map(([domain, domainScore]) => {
            const domainInfo = DOMAIN_INFO[domain as keyof typeof DOMAIN_INFO];
            if (!domainInfo || domainScore.total === 0) return null;
            
            return (
              <div key={domain} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{domainInfo.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({domainScore.correct}/{domainScore.total} questions)
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    safeNumber(domainScore.percentage, 0) >= 70 ? 'text-green-600' : 
                    safeNumber(domainScore.percentage, 0) >= 50 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {safeNumber(domainScore.percentage, 0)}%
                  </span>
                </div>
                <ProgressBar
                  value={domainScore.correct}
                  max={domainScore.total}
                  showLabel={false}
                  size="sm"
                  color={getDomainScoreColor(safeNumber(domainScore.percentage, 0))}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommendations */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {score.passed ? (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🎉 Great job! You're ready for the real exam!</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Schedule your AWS SAP-C02 exam</li>
                <li>• Review any domains below 80% for extra confidence</li>
                <li>• Take one more practice exam closer to your exam date</li>
                <li>• Review AWS whitepapers and case studies</li>
              </ul>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">📚 Keep studying! Here's what to focus on:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                {Object.entries(score.domainScores)
                  .filter(([, domainScore]) => safeNumber(domainScore.percentage, 0) < 70)
                  .map(([domain, domainScore]) => {
                    const domainInfo = DOMAIN_INFO[domain as keyof typeof DOMAIN_INFO];
                    return (
                      <li key={domain}>
                        • <strong>{domainInfo?.name}</strong>: {safeNumber(domainScore.percentage, 0)}% - Focus on this area
                      </li>
                    );
                  })}
                <li>• Take more practice questions in weak areas</li>
                <li>• Review explanations for incorrect answers</li>
                <li>• Aim for 85%+ overall score before taking the real exam</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onReviewAnswers} variant="outline" className="flex items-center">
          <BarChart3 size={16} className="mr-2" />
          Review Answers
        </Button>
        
        <Button onClick={onRetakeExam} className="flex items-center">
          <RotateCcw size={16} className="mr-2" />
          Retake Exam
        </Button>
        
        <Link to={ROUTES.PRACTICE}>
          <Button variant="outline" className="flex items-center w-full sm:w-auto">
            <Target size={16} className="mr-2" />
            Practice Mode
          </Button>
        </Link>
        
        <Link to={ROUTES.HOME}>
          <Button variant="outline" className="flex items-center w-full sm:w-auto">
            <Home size={16} className="mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ExamResults;
