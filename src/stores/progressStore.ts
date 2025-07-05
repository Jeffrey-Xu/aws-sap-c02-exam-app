import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionProgress, CategoryProgress, ExamDomain, UserProgress } from '../types';
import { STORAGE_KEYS } from '../constants';
import { ProgressPersistence } from '../utils/progressPersistence';

interface ProgressStore extends UserProgress {
  questionProgress: Record<number, QuestionProgress>;
  
  // Actions
  updateQuestionProgress: (questionId: number, correct: boolean, timeSpent: number) => void;
  markAsMastered: (questionId: number) => void;
  markForReview: (questionId: number) => void;
  addBookmark: (questionId: number) => void;
  removeBookmark: (questionId: number) => void;
  addNote: (questionId: number, note: string) => void;
  toggleBookmark: (questionId: number) => void;
  addQuestionNote: (questionId: number, note: string) => void;
  getBookmarkedQuestions: () => QuestionProgress[];
  calculateProgress: (totalQuestions: number, questionsByCategory: Record<ExamDomain, number>) => void;
  getQuestionProgress: (questionId: number) => QuestionProgress;
  addExamAttempt: (examSession: any) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => boolean;
  getStorageStats: () => any;
}

const defaultQuestionProgress = (questionId: number): QuestionProgress => ({
  questionId,
  attempts: 0,
  correctAttempts: 0,
  lastAttempted: new Date(),
  status: 'new',
  timeSpent: 0,
  bookmarked: false,
  notes: ''
});

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
        questionProgress: {},
        totalQuestions: 0,
        masteredQuestions: 0,
        categoryProgress: {} as Record<ExamDomain, CategoryProgress>,
        studyStreak: 0,
        totalStudyTime: 0,
        examAttempts: [],
      
      updateQuestionProgress: (questionId: number, correct: boolean, timeSpent: number) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        const updated: QuestionProgress = {
          ...current,
          attempts: current.attempts + 1,
          correctAttempts: correct ? current.correctAttempts + 1 : current.correctAttempts,
          lastAttempted: new Date(),
          timeSpent: current.timeSpent + timeSpent,
          status: correct && current.correctAttempts >= 2 ? 'mastered' : 
                  correct ? 'practicing' : 'needs-review'
        };
        
        if (updated.status === 'mastered' && !current.masteredAt) {
          updated.masteredAt = new Date();
        }
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: updated
          },
          totalStudyTime: get().totalStudyTime + timeSpent,
          lastStudied: new Date()
        });
      },
      
      markAsMastered: (questionId: number) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: {
              ...current,
              status: 'mastered',
              masteredAt: new Date()
            }
          }
        });
      },
      
      markForReview: (questionId: number) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: {
              ...current,
              status: 'needs-review'
            }
          }
        });
      },
      
      addBookmark: (questionId: number) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: {
              ...current,
              bookmarked: true
            }
          }
        });
      },
      
      removeBookmark: (questionId: number) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: {
              ...current,
              bookmarked: false
            }
          }
        });
      },
      
      addNote: (questionId: number, note: string) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: {
              ...current,
              notes: note
            }
          }
        });
      },
      
      calculateProgress: (totalQuestions: number, questionsByCategory: Record<ExamDomain, number>) => {
        const { questionProgress } = get();
        
        const masteredCount = Object.values(questionProgress)
          .filter(p => p.status === 'mastered').length;
        
        const categoryProgress: Record<ExamDomain, CategoryProgress> = {} as Record<ExamDomain, CategoryProgress>;
        
        Object.entries(questionsByCategory).forEach(([domain, total]) => {
          const domainProgress = Object.values(questionProgress)
            .filter(p => p.status === 'mastered'); // This would need category mapping
          
          categoryProgress[domain as ExamDomain] = {
            domain: domain as ExamDomain,
            totalQuestions: total,
            masteredQuestions: domainProgress.length, // Simplified for now
            averageScore: 0, // Calculate based on attempts
            timeSpent: Object.values(questionProgress)
              .reduce((sum, p) => sum + p.timeSpent, 0),
            lastStudied: new Date()
          };
        });
        
        set({
          totalQuestions,
          masteredQuestions: masteredCount,
          categoryProgress
        });
      },
      
      // Bookmark actions
      toggleBookmark: (questionId: number) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: {
              ...current,
              bookmarked: !current.bookmarked
            }
          }
        });
      },
      
      addQuestionNote: (questionId: number, note: string) => {
        const { questionProgress } = get();
        const current = questionProgress[questionId] || defaultQuestionProgress(questionId);
        
        set({
          questionProgress: {
            ...questionProgress,
            [questionId]: {
              ...current,
              notes: note
            }
          }
        });
      },
      
      getBookmarkedQuestions: () => {
        const { questionProgress } = get();
        return Object.values(questionProgress).filter(q => q.bookmarked);
      },
      
      getQuestionProgress: (questionId: number) => {
        const { questionProgress } = get();
        return questionProgress[questionId] || defaultQuestionProgress(questionId);
      },
      
      addExamAttempt: (examSession: any) => {
        set((state) => ({
          examAttempts: [...state.examAttempts, examSession]
        }));
      },
      
      resetProgress: () => {
        set({
          questionProgress: {},
          totalQuestions: 0,
          masteredQuestions: 0,
          categoryProgress: {} as Record<ExamDomain, CategoryProgress>,
          studyStreak: 0,
          totalStudyTime: 0,
          examAttempts: []
        });
      },
      
      exportProgress: () => {
        return ProgressPersistence.exportProgress();
      },
      
      importProgress: (data: string) => {
        const success = ProgressPersistence.importProgress(data);
        if (success) {
          // Reload the store from localStorage
          const restoredData = ProgressPersistence.restoreProgress();
          if (restoredData) {
            set(restoredData);
          }
        }
        return success;
      },
      
      getStorageStats: () => {
        return ProgressPersistence.getStorageStats();
      }
    }),
    {
      name: STORAGE_KEYS.PROGRESS,
      partialize: (state) => ({
        questionProgress: state.questionProgress,
        totalQuestions: state.totalQuestions,
        masteredQuestions: state.masteredQuestions,
        categoryProgress: state.categoryProgress,
        studyStreak: state.studyStreak,
        totalStudyTime: state.totalStudyTime,
        examAttempts: state.examAttempts,
        lastStudied: state.lastStudied
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('✅ Progress store rehydrated successfully');
          // Validate and backup the restored data
          if (ProgressPersistence.validateProgressData(state)) {
            ProgressPersistence.backupProgress(state);
          }
        } else {
          console.log('ℹ️ No previous progress found - starting fresh');
        }
      }
    }
  )
);
