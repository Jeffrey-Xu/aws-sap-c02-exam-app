import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamSession, ExamScore, ExamDomain, DomainScore } from '../types';
import { STORAGE_KEYS, EXAM_CONFIG } from '../constants';
import { ProgressPersistence } from '../utils/progressPersistence';
import { safeNumber } from '../utils/questionUtils';

interface ExamStore {
  currentSession: ExamSession | null;
  examHistory: ExamSession[];
  currentQuestionIndex: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  
  // Actions
  startExam: (type: 'practice' | 'full-exam', questionIds: number[]) => void;
  submitAnswer: (questionId: number, answer: string, timeSpent: number) => void;
  flagQuestion: (questionId: number) => void;
  unflagQuestion: (questionId: number) => void;
  navigateToQuestion: (index: number) => void;
  pauseExam: () => void;
  resumeExam: () => void;
  completeExam: (score?: ExamScore) => ExamSession | undefined;
  calculateScore: (questions: any[]) => ExamScore;
  resetExam: () => void;
  loadExamSession: () => void;
  updateTimer: (timeRemaining: number) => void;
  deleteExamSession: (sessionId: string) => void;
  getExamHistory: () => ExamSession[];
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      examHistory: [],
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isTimerRunning: false,
      
      startExam: (type: 'practice' | 'full-exam', questionIds: number[]) => {
        const session: ExamSession = {
          id: `exam-${Date.now()}`,
          type,
          startTime: new Date(),
          duration: type === 'full-exam' ? EXAM_CONFIG.FULL_EXAM_DURATION : 0,
          questions: questionIds,
          answers: {},
          flaggedQuestions: [],
          timePerQuestion: {},
          status: 'in-progress',
          reviewCompleted: false
        };
        
        set({
          currentSession: session,
          currentQuestionIndex: 0,
          timeRemaining: session.duration,
          isTimerRunning: session.duration > 0
        });
      },
      
      submitAnswer: (questionId: number, answer: string, timeSpent: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          answers: {
            ...currentSession.answers,
            [questionId]: answer
          },
          timePerQuestion: {
            ...currentSession.timePerQuestion,
            [questionId]: timeSpent
          }
        };
        
        set({ currentSession: updatedSession });
      },
      
      flagQuestion: (questionId: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          flaggedQuestions: [...currentSession.flaggedQuestions, questionId]
        };
        
        set({ currentSession: updatedSession });
      },
      
      unflagQuestion: (questionId: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          flaggedQuestions: currentSession.flaggedQuestions.filter(id => id !== questionId)
        };
        
        set({ currentSession: updatedSession });
      },
      
      navigateToQuestion: (index: number) => {
        set({ currentQuestionIndex: index });
      },
      
      pauseExam: () => {
        set({ isTimerRunning: false });
      },
      
      resumeExam: () => {
        set({ isTimerRunning: true });
      },
      
      completeExam: (score?: ExamScore) => {
        const { currentSession, examHistory } = get();
        if (!currentSession) return;
        
        const completedSession = {
          ...currentSession,
          endTime: new Date(),
          status: 'completed' as const,
          score: score || currentSession.score
        };
        
        set({
          currentSession: completedSession,
          examHistory: [...examHistory, completedSession],
          isTimerRunning: false
        });
        
        return completedSession;
      },
      
      calculateScore: (questions: any[]) => {
        const { currentSession } = get();
        if (!currentSession) {
          return {
            totalQuestions: 0,
            correctAnswers: 0,
            percentage: 0,
            score: 0,
            passed: false,
            domainScores: {} as Record<ExamDomain, DomainScore>
          };
        }
        
        let correctAnswers = 0;
        const domainStats: Record<ExamDomain, { correct: number; total: number }> = {
          'organizational-complexity': { correct: 0, total: 0 },
          'new-solutions': { correct: 0, total: 0 },
          'migration-planning': { correct: 0, total: 0 },
          'cost-control': { correct: 0, total: 0 },
          'continuous-improvement': { correct: 0, total: 0 }
        };
        
        currentSession.questions.forEach(questionId => {
          const question = questions.find(q => q.id === questionId);
          if (!question) return;
          
          const userAnswer = currentSession.answers[questionId];
          const isCorrect = userAnswer === question.correct_answer;
          
          if (isCorrect) correctAnswers++;
          
          const domain = (question.category || 'new-solutions') as ExamDomain;
          if (domain in domainStats) {
            domainStats[domain].total++;
            if (isCorrect) domainStats[domain].correct++;
          }
        });
        
        const totalQuestions = safeNumber(currentSession.questions.length, 1);
        const safeCorrectAnswers = safeNumber(correctAnswers, 0);
        const percentage = Math.round((safeCorrectAnswers / totalQuestions) * 100);
        const score = Math.round((safeCorrectAnswers / totalQuestions) * 1000); // Score out of 1000
        const domainScores: Record<ExamDomain, DomainScore> = {} as Record<ExamDomain, DomainScore>;
        
        Object.entries(domainStats).forEach(([domain, stats]) => {
          domainScores[domain as ExamDomain] = {
            correct: stats.correct,
            total: stats.total,
            percentage: stats.total > 0 ? Math.round((safeNumber(stats.correct, 0) / safeNumber(stats.total, 1)) * 100) : 0
          };
        });
        
        const examScore: ExamScore = {
          totalQuestions: currentSession.questions.length,
          correctAnswers,
          percentage,
          score,
          passed: percentage >= EXAM_CONFIG.PASSING_PERCENTAGE,
          domainScores
        };
        
        // Update current session with score
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              score: examScore
            }
          });
        }
        
        return examScore;
      },
      
      resetExam: () => {
        set({
          currentSession: null,
          currentQuestionIndex: 0,
          timeRemaining: 0,
          isTimerRunning: false
        });
      },
      
      loadExamSession: () => {
        // This will be called on app initialization to restore any in-progress exam
      },
      
      updateTimer: (timeRemaining: number) => {
        set({ timeRemaining });
      },
      
      deleteExamSession: (sessionId: string) => {
        const { examHistory } = get();
        set({
          examHistory: examHistory.filter(session => session.id !== sessionId)
        });
      },
      
      getExamHistory: () => {
        const { examHistory } = get();
        return examHistory;
      }
    }),
    {
      name: STORAGE_KEYS.EXAM_SESSION,
      partialize: (state) => ({
        currentSession: state.currentSession,
        examHistory: state.examHistory,
        currentQuestionIndex: state.currentQuestionIndex,
        timeRemaining: state.timeRemaining
      })
    }
  )
);
