import React from 'react';
import { Brain, Target, Clock, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { DOMAIN_INFO } from '../../constants';
import type { Question, ExamDomain, QuestionProgress } from '../../types';

interface SmartRecommendationsProps {
  questions: Question[];
  questionProgress: Record<number, QuestionProgress>;
  onStartRecommendedSession: (questions: Question[], sessionType: string) => void;
}

interface RecommendationSession {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: Question[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  color: string;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  questions,
  questionProgress,
  onStartRecommendedSession
}) => {
  const generateRecommendations = (): RecommendationSession[] => {
    const recommendations: RecommendationSession[] = [];
    
    // 1. Review Incorrect Answers
    const incorrectQuestions = questions.filter(q => {
      const progress = questionProgress[q.id];
      return progress && progress.attempts > 0 && progress.correctAttempts < progress.attempts;
    });
    
    if (incorrectQuestions.length > 0) {
      recommendations.push({
        type: 'review-incorrect',
        title: 'Review Incorrect Answers',
        description: `Focus on ${incorrectQuestions.length} questions you got wrong`,
        icon: <AlertCircle className="w-5 h-5" />,
        questions: incorrectQuestions.slice(0, 20),
        priority: 'high',
        estimatedTime: Math.min(incorrectQuestions.length * 2, 40),
        color: 'red'
      });
    }
    
    // 2. Weak Domain Focus
    const domainScores: Record<ExamDomain, { correct: number; total: number }> = {
      'organizational-complexity': { correct: 0, total: 0 },
      'new-solutions': { correct: 0, total: 0 },
      'migration-planning': { correct: 0, total: 0 },
      'cost-control': { correct: 0, total: 0 },
      'continuous-improvement': { correct: 0, total: 0 }
    };
    
    questions.forEach(q => {
      if (q.category) {
        const progress = questionProgress[q.id];
        if (progress && progress.attempts > 0) {
          domainScores[q.category].total++;
          if (progress.correctAttempts > 0) {
            domainScores[q.category].correct++;
          }
        }
      }
    });
    
    const weakestDomain = Object.entries(domainScores)
      .filter(([_, score]) => score.total > 0)
      .sort(([_, a], [__, b]) => (a.correct / a.total) - (b.correct / b.total))[0];
    
    if (weakestDomain && (weakestDomain[1].correct / weakestDomain[1].total) < 0.7) {
      const domainQuestions = questions.filter(q => q.category === weakestDomain[0]);
      recommendations.push({
        type: 'weak-domain',
        title: `Focus on ${DOMAIN_INFO[weakestDomain[0] as ExamDomain].name}`,
        description: `Strengthen your weakest area (${Math.round((weakestDomain[1].correct / weakestDomain[1].total) * 100)}% accuracy)`,
        icon: <Target className="w-5 h-5" />,
        questions: domainQuestions.slice(0, 15),
        priority: 'high',
        estimatedTime: 30,
        color: 'orange'
      });
    }
    
    // 3. Untouched Questions
    const untouchedQuestions = questions.filter(q => {
      const progress = questionProgress[q.id];
      return !progress || progress.attempts === 0;
    });
    
    if (untouchedQuestions.length > 0) {
      recommendations.push({
        type: 'new-questions',
        title: 'Explore New Questions',
        description: `Try ${Math.min(untouchedQuestions.length, 20)} questions you haven't seen`,
        icon: <BookOpen className="w-5 h-5" />,
        questions: untouchedQuestions.slice(0, 20),
        priority: 'medium',
        estimatedTime: 40,
        color: 'blue'
      });
    }
    
    // 4. Quick Review (Mastered Questions)
    const masteredQuestions = questions.filter(q => {
      const progress = questionProgress[q.id];
      return progress && progress.status === 'mastered';
    });
    
    if (masteredQuestions.length > 0) {
      recommendations.push({
        type: 'quick-review',
        title: 'Quick Review Session',
        description: `Refresh ${Math.min(masteredQuestions.length, 15)} concepts you've mastered`,
        icon: <TrendingUp className="w-5 h-5" />,
        questions: masteredQuestions.slice(0, 15),
        priority: 'low',
        estimatedTime: 20,
        color: 'green'
      });
    }
    
    // 5. Mixed Practice
    const mixedQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, 25);
    
    recommendations.push({
      type: 'mixed-practice',
      title: 'Mixed Practice Session',
      description: 'Random selection across all domains for comprehensive review',
      icon: <Brain className="w-5 h-5" />,
      questions: mixedQuestions,
      priority: 'medium',
      estimatedTime: 50,
      color: 'purple'
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const recommendations = generateRecommendations();
  
  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Recommendations Available
          </h3>
          <p className="text-gray-600">
            Start practicing questions to get personalized recommendations.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Brain className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Smart Recommendations</h2>
        </div>
        <p className="text-gray-600">
          Personalized study sessions based on your performance and progress
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.type}
            className={`border-l-4 border-${rec.color}-500 bg-${rec.color}-50 rounded-lg p-4`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-${rec.color}-100 text-${rec.color}-600`}>
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      <span>{rec.questions.length} questions</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>~{rec.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                size="sm"
                onClick={() => onStartRecommendedSession(rec.questions, rec.type)}
                className={`bg-${rec.color}-600 hover:bg-${rec.color}-700`}
              >
                Start Session
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How Recommendations Work</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>High Priority:</strong> Focus on areas where you need the most improvement</li>
          <li>• <strong>Medium Priority:</strong> Balanced practice to maintain overall progress</li>
          <li>• <strong>Low Priority:</strong> Reinforcement of concepts you've already mastered</li>
        </ul>
      </div>
    </Card>
  );
};

export default SmartRecommendations;
