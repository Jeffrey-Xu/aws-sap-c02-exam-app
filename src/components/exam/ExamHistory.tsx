import React, { useState } from 'react';
import { Calendar, Clock, Target, TrendingUp, Eye, Trash2, Award } from 'lucide-react';
import type { ExamSession } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatTime } from '../../utils/questionUtils';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { EXAM_CONFIG } from '../../constants';

interface ExamHistoryProps {
  examHistory: ExamSession[];
  onViewResults: (session: ExamSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClose: () => void;
}

const ExamHistory: React.FC<ExamHistoryProps> = ({
  examHistory,
  onViewResults,
  onDeleteSession,
  onClose
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'passed' | 'failed'>('all');
  
  // Custom dialog hook
  const { dialogState, showDialog, hideDialog } = useConfirmDialog();

  const sortedAndFilteredHistory = examHistory
    .filter(session => {
      if (filterBy === 'all') return true;
      const score = calculateSessionScore(session);
      const passingScore = EXAM_CONFIG.PASSING_PERCENTAGE * 10; // Convert to 1000-point scale
      if (filterBy === 'passed') return score >= passingScore;
      if (filterBy === 'failed') return score < passingScore;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      } else {
        const scoreA = calculateSessionScore(a);
        const scoreB = calculateSessionScore(b);
        return scoreB - scoreA;
      }
    });

  function calculateSessionScore(session: ExamSession): number {
    // Use stored score if available (1000-point scale)
    if (session.score?.score) {
      return session.score.score;
    }
    
    // Fallback calculation for older sessions without stored scores
    const totalQuestions = session.questions.length;
    const correctAnswers = session.questions.filter(qId => {
      const userAnswer = session.answers[qId];
      // We'd need the actual question data to check correctness
      // For now, we'll estimate based on a simple heuristic
      return userAnswer && userAnswer.length > 0;
    }).length;
    
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 1000) : 0;
  }

  function getSessionDuration(session: ExamSession): number {
    if (!session.endTime) return 0;
    return Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000);
  }

  function getScoreColor(score: number): string {
    const passingScore = EXAM_CONFIG.PASSING_PERCENTAGE * 10; // Convert to 1000-point scale
    if (score >= passingScore) return 'text-green-600';
    if (score >= 600) return 'text-yellow-600'; // 60% of 1000
    return 'text-red-600';
  }

  function getScoreBadgeColor(score: number): string {
    const passingScore = EXAM_CONFIG.PASSING_PERCENTAGE * 10; // Convert to 1000-point scale
    if (score >= passingScore) return 'bg-green-100 text-green-800';
    if (score >= 600) return 'bg-yellow-100 text-yellow-800'; // 60% of 1000
    return 'bg-red-100 text-red-800';
  }

  const stats = {
    total: examHistory.length,
    passed: examHistory.filter(s => calculateSessionScore(s) >= (EXAM_CONFIG.PASSING_PERCENTAGE * 10)).length,
    averageScore: examHistory.length > 0 
      ? Math.round(examHistory.reduce((sum, s) => sum + calculateSessionScore(s), 0) / examHistory.length)
      : 0,
    bestScore: examHistory.length > 0 
      ? Math.max(...examHistory.map(s => calculateSessionScore(s)))
      : 0
  };

  if (examHistory.length === 0) {
    return (
      <Card className="text-center py-12">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Exam History</h2>
        <p className="text-gray-600 mb-6">
          You haven't taken any practice exams yet. Start your first exam to see your progress here!
        </p>
        <Button onClick={onClose}>
          Take Your First Exam
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam History</h2>
          <p className="text-gray-600">Track your progress and review past attempts</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Back to Exam
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Attempts</div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.passed}</div>
          <div className="text-sm text-gray-600">Passed</div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.averageScore}/1000</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.bestScore}/1000</div>
          <div className="text-sm text-gray-600">Best Score</div>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="date">Date (Newest First)</option>
              <option value="score">Score (Highest First)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'passed' | 'failed')}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Attempts</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {sortedAndFilteredHistory.length} of {examHistory.length} attempts
          </div>
        </div>
      </Card>

      {/* Exam History List */}
      <div className="space-y-4">
        {sortedAndFilteredHistory.map((session, index) => {
          const score = calculateSessionScore(session);
          const duration = getSessionDuration(session);
          const startDate = new Date(session.startTime);
          
          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(score)}`}>
                      {score}/1000 {score >= (EXAM_CONFIG.PASSING_PERCENTAGE * 10) ? '✅' : '❌'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-1" />
                      {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-1" />
                      {formatTime(duration)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>
                      <strong>Questions:</strong> {session.questions.length}
                    </span>
                    <span>
                      <strong>Answered:</strong> {Object.keys(session.answers).length}
                    </span>
                    <span>
                      <strong>Flagged:</strong> {session.flaggedQuestions.length}
                    </span>
                    <span>
                      <strong>Status:</strong> 
                      <span className={`ml-1 ${session.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                        {session.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewResults(session)}
                    className="flex items-center"
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      showDialog(
                        {
                          title: 'Delete Exam Attempt',
                          message: 'Are you sure you want to delete this exam attempt? This action cannot be undone.',
                          type: 'warning',
                          confirmText: 'Delete',
                          cancelText: 'Cancel',
                          confirmVariant: 'danger'
                        },
                        () => {
                          onDeleteSession(session.id);
                        }
                      );
                    }}
                    className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {sortedAndFilteredHistory.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-gray-600">No exam attempts match your current filter.</p>
          <Button
            variant="outline"
            onClick={() => setFilterBy('all')}
            className="mt-4"
          >
            Show All Attempts
          </Button>
        </Card>
      )}
      
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
};

export default ExamHistory;
