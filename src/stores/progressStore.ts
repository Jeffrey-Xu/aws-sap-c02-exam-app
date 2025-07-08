import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionProgress, CategoryProgress, ExamDomain, UserProgress } from '../types';

// Helper function to get user-specific storage key
const getUserProgressKey = (userId: string) => `progress-store-${userId}`;

// Helper function to load user-specific progress from localStorage
const loadUserProgressFromStorage = (userId: string): Partial<UserProgress> => {
  try {
    const key = getUserProgressKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      if (parsed.questionProgress) {
        Object.values(parsed.questionProgress).forEach((progress: any) => {
          if (progress.lastAttempted) {
            progress.lastAttempted = new Date(progress.lastAttempted);
          }
          if (progress.masteredAt) {
            progress.masteredAt = new Date(progress.masteredAt);
          }
        });
      }
      if (parsed.categoryProgress) {
        Object.values(parsed.categoryProgress).forEach((category: any) => {
          if (category.lastStudied) {
            category.lastStudied = new Date(category.lastStudied);
          }
        });
      }
      if (parsed.lastStudied) {
        parsed.lastStudied = new Date(parsed.lastStudied);
      }
      
      return parsed;
    }
  } catch (error) {
    console.error('Error loading user progress:', error);
  }
  return {};
};

// Helper function to save user-specific progress to localStorage
const saveUserProgressToStorage = (userId: string, progress: UserProgress) => {
  try {
    const key = getUserProgressKey(userId);
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

interface ProgressStore extends UserProgress {
  questionProgress: Record<number, QuestionProgress>;
  
  // Actions
  updateQuestionProgress: (questionId: number, correct: boolean, timeSpent: number, domain?: ExamDomain) => void;
  markAsMastered: (questionId: number) => void;
  markForReview: (questionId: number) => void;
  addBookmark: (questionId: number) => void;
  removeBookmark: (questionId: number) => void;
  addNote: (questionId: number, note: string) => void;
  toggleBookmark: (questionId: number) => void;
  addQuestionNote: (questionId: number, note: string) => void;
  getBookmarkedQuestions: () => QuestionProgress[];
  calculateProgress: (totalQuestions: number, questionsByCategory: Record<ExamDomain, number>) => void;
  refreshProgress: () => void;
  trackUserActivity: (activity: string) => void;
  getQuestionProgress: (questionId: number) => QuestionProgress;
  addExamAttempt: (examSession: any) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => boolean;
  getStorageStats: () => any;
  
  // User-specific methods
  loadUserProgress: (userId: string) => void;
  saveUserProgress: (userId: string) => void;
  switchUser: (userId: string) => void;
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

      loadUserProgress: (userId: string) => {
        const userData = loadUserProgressFromStorage(userId);
        set({
          questionProgress: userData.questionProgress || {},
          totalQuestions: userData.totalQuestions || 0,
          masteredQuestions: userData.masteredQuestions || 0,
          categoryProgress: userData.categoryProgress || {} as Record<ExamDomain, CategoryProgress>,
          studyStreak: userData.studyStreak || 0,
          totalStudyTime: userData.totalStudyTime || 0,
          examAttempts: userData.examAttempts || [],
          lastStudied: userData.lastStudied
        });
      },

      saveUserProgress: (userId: string) => {
        const state = get();
        const dataToSave = {
          questionProgress: state.questionProgress,
          totalQuestions: state.totalQuestions,
          masteredQuestions: state.masteredQuestions,
          categoryProgress: state.categoryProgress,
          studyStreak: state.studyStreak,
          totalStudyTime: state.totalStudyTime,
          examAttempts: state.examAttempts,
          lastStudied: state.lastStudied
        };
        saveUserProgressToStorage(userId, dataToSave);
      },

      clearUserProgress: (userId: string) => {
        try {
          const key = getUserProgressKey(userId);
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error clearing user progress:', error);
        }
      },

      updateQuestionProgress: (questionId: number, correct: boolean, timeSpent: number, domain?: ExamDomain) => {
        set((state) => {
          const currentProgress = state.questionProgress[questionId] || defaultQuestionProgress(questionId);
          
          const updatedProgress: QuestionProgress = {
            ...currentProgress,
            attempts: currentProgress.attempts + 1,
            correctAttempts: correct ? currentProgress.correctAttempts + 1 : currentProgress.correctAttempts,
            lastAttempted: new Date(),
            timeSpent: currentProgress.timeSpent + timeSpent,
            status: correct && currentProgress.correctAttempts >= 2 ? 'mastered' : 
                   correct ? 'practicing' : 'needs-review',
            domain: domain || currentProgress.domain // Store the domain
          };

          if (updatedProgress.status === 'mastered' && !currentProgress.masteredAt) {
            updatedProgress.masteredAt = new Date();
          }

          return {
            questionProgress: {
              ...state.questionProgress,
              [questionId]: updatedProgress
            },
            totalStudyTime: state.totalStudyTime + timeSpent,
            lastStudied: new Date()
          };
        });
      },

      markAsMastered: (questionId: number) => {
        set((state) => {
          const currentProgress = state.questionProgress[questionId] || defaultQuestionProgress(questionId);
          const updatedProgress: QuestionProgress = {
            ...currentProgress,
            status: 'mastered',
            masteredAt: new Date()
          };

          return {
            questionProgress: {
              ...state.questionProgress,
              [questionId]: updatedProgress
            }
          };
        });
      },

      markForReview: (questionId: number) => {
        set((state) => {
          const currentProgress = state.questionProgress[questionId] || defaultQuestionProgress(questionId);
          const updatedProgress: QuestionProgress = {
            ...currentProgress,
            status: 'needs-review'
          };

          return {
            questionProgress: {
              ...state.questionProgress,
              [questionId]: updatedProgress
            }
          };
        });
      },

      addBookmark: (questionId: number) => {
        set((state) => {
          const currentProgress = state.questionProgress[questionId] || defaultQuestionProgress(questionId);
          const updatedProgress: QuestionProgress = {
            ...currentProgress,
            bookmarked: true
          };

          return {
            questionProgress: {
              ...state.questionProgress,
              [questionId]: updatedProgress
            }
          };
        });
      },

      removeBookmark: (questionId: number) => {
        set((state) => {
          const currentProgress = state.questionProgress[questionId] || defaultQuestionProgress(questionId);
          const updatedProgress: QuestionProgress = {
            ...currentProgress,
            bookmarked: false
          };

          return {
            questionProgress: {
              ...state.questionProgress,
              [questionId]: updatedProgress
            }
          };
        });
      },

      addNote: (questionId: number, note: string) => {
        set((state) => {
          const currentProgress = state.questionProgress[questionId] || defaultQuestionProgress(questionId);
          const updatedProgress: QuestionProgress = {
            ...currentProgress,
            notes: note
          };

          return {
            questionProgress: {
              ...state.questionProgress,
              [questionId]: updatedProgress
            }
          };
        });
      },

      toggleBookmark: (questionId: number) => {
        const state = get();
        const currentProgress = state.questionProgress[questionId] || defaultQuestionProgress(questionId);
        if (currentProgress.bookmarked) {
          state.removeBookmark(questionId);
        } else {
          state.addBookmark(questionId);
        }
      },

      addQuestionNote: (questionId: number, note: string) => {
        get().addNote(questionId, note);
      },

      getBookmarkedQuestions: () => {
        const state = get();
        return Object.values(state.questionProgress).filter(progress => progress.bookmarked);
      },

      calculateProgress: (totalQuestions: number, questionsByCategory: Record<ExamDomain, number>) => {
        set((state) => {
          const masteredCount = Object.values(state.questionProgress)
            .filter(progress => progress.status === 'mastered').length;

          const categoryProgress: Record<ExamDomain, CategoryProgress> = {} as Record<ExamDomain, CategoryProgress>;
          
          Object.entries(questionsByCategory).forEach(([domain, count]) => {
            // Get progress for questions in this domain only
            const domainQuestions = Object.values(state.questionProgress)
              .filter(progress => progress.domain === domain);
            
            const masteredInDomain = domainQuestions.filter(progress => progress.status === 'mastered').length;
            const totalTimeInDomain = domainQuestions.reduce((sum, progress) => sum + progress.timeSpent, 0);
            
            // Calculate average score based on actual attempts
            let averageScore = 0;
            if (domainQuestions.length > 0) {
              // Only include questions that have been attempted (attempts > 0)
              const attemptedQuestions = domainQuestions.filter(progress => progress.attempts > 0);
              
              if (attemptedQuestions.length > 0) {
                // Calculate success rate for attempted questions
                const totalSuccessRate = attemptedQuestions.reduce((sum, progress) => {
                  return sum + (progress.correctAttempts / progress.attempts);
                }, 0);
                averageScore = (totalSuccessRate / attemptedQuestions.length) * 100;
              } else {
                // No questions attempted in this domain
                averageScore = 0;
              }
            }

            categoryProgress[domain as ExamDomain] = {
              domain: domain as ExamDomain,
              totalQuestions: count,
              masteredQuestions: masteredInDomain,
              averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
              timeSpent: totalTimeInDomain,
              lastStudied: new Date()
            };
          });

          return {
            totalQuestions,
            masteredQuestions: masteredCount,
            categoryProgress
          };
        });
      },

      refreshProgress: () => {
        set((state) => {
          // Force recalculation of all progress metrics
          const masteredCount = Object.values(state.questionProgress)
            .filter(progress => progress.status === 'mastered').length;
          
          // Recalculate category progress
          const categoryProgress: Record<ExamDomain, CategoryProgress> = {} as Record<ExamDomain, CategoryProgress>;
          
          // Group questions by domain
          const questionsByDomain: Record<string, QuestionProgress[]> = {};
          Object.values(state.questionProgress).forEach(progress => {
            if (!questionsByDomain[progress.domain]) {
              questionsByDomain[progress.domain] = [];
            }
            questionsByDomain[progress.domain].push(progress);
          });
          
          // Calculate progress for each domain
          Object.entries(questionsByDomain).forEach(([domain, domainQuestions]) => {
            const masteredInDomain = domainQuestions.filter(progress => progress.status === 'mastered').length;
            const totalTimeInDomain = domainQuestions.reduce((sum, progress) => sum + progress.timeSpent, 0);
            
            // Calculate average score based on actual attempts
            let averageScore = 0;
            if (domainQuestions.length > 0) {
              const attemptedQuestions = domainQuestions.filter(progress => progress.attempts > 0);
              
              if (attemptedQuestions.length > 0) {
                const totalSuccessRate = attemptedQuestions.reduce((sum, progress) => {
                  return sum + (progress.correctAttempts / progress.attempts);
                }, 0);
                averageScore = (totalSuccessRate / attemptedQuestions.length) * 100;
              }
            }

            categoryProgress[domain as ExamDomain] = {
              domain: domain as ExamDomain,
              totalQuestions: domainQuestions.length,
              masteredQuestions: masteredInDomain,
              averageScore: Math.round(averageScore * 100) / 100,
              timeSpent: totalTimeInDomain,
              lastStudied: new Date()
            };
          });
          
          return {
            ...state,
            masteredQuestions: masteredCount,
            categoryProgress
          };
        });
      },

      trackUserActivity: (activity: string) => {
        set((state) => ({
          ...state,
          lastStudied: new Date(),
          // Store activity log for admin tracking
          activityLog: [
            ...(state as any).activityLog?.slice(-49) || [], // Keep last 50 activities
            {
              activity,
              timestamp: new Date().toISOString(),
              date: new Date().toDateString()
            }
          ]
        }));
      },

      getQuestionProgress: (questionId: number) => {
        const state = get();
        return state.questionProgress[questionId] || defaultQuestionProgress(questionId);
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
          examAttempts: [],
          lastStudied: undefined
        });
      },

      exportProgress: () => {
        const state = get();
        const exportData = {
          questionProgress: state.questionProgress,
          totalQuestions: state.totalQuestions,
          masteredQuestions: state.masteredQuestions,
          categoryProgress: state.categoryProgress,
          studyStreak: state.studyStreak,
          totalStudyTime: state.totalStudyTime,
          examAttempts: state.examAttempts,
          lastStudied: state.lastStudied,
          exportedAt: new Date().toISOString()
        };
        return JSON.stringify(exportData, null, 2);
      },

      importProgress: (data: string) => {
        try {
          const importedData = JSON.parse(data);
          
          if (!importedData.questionProgress) {
            return false;
          }

          // Convert date strings back to Date objects
          Object.values(importedData.questionProgress).forEach((progress: any) => {
            if (progress.lastAttempted) {
              progress.lastAttempted = new Date(progress.lastAttempted);
            }
            if (progress.masteredAt) {
              progress.masteredAt = new Date(progress.masteredAt);
            }
          });

          if (importedData.examAttempts) {
            importedData.examAttempts.forEach((attempt: any) => {
              if (attempt.startTime) attempt.startTime = new Date(attempt.startTime);
              if (attempt.endTime) attempt.endTime = new Date(attempt.endTime);
            });
          }

          if (importedData.categoryProgress) {
            Object.values(importedData.categoryProgress).forEach((category: any) => {
              if (category.lastStudied) {
                category.lastStudied = new Date(category.lastStudied);
              }
            });
          }

          if (importedData.lastStudied) {
            importedData.lastStudied = new Date(importedData.lastStudied);
          }

          set({
            questionProgress: importedData.questionProgress || {},
            totalQuestions: importedData.totalQuestions || 0,
            masteredQuestions: importedData.masteredQuestions || 0,
            categoryProgress: importedData.categoryProgress || {},
            studyStreak: importedData.studyStreak || 0,
            totalStudyTime: importedData.totalStudyTime || 0,
            examAttempts: importedData.examAttempts || [],
            lastStudied: importedData.lastStudied
          });

          return true;
        } catch (error) {
          console.error('Error importing progress:', error);
          return false;
        }
      },

      getStorageStats: () => {
        const state = get();
        
        return {
          totalQuestions: Object.keys(state.questionProgress).length,
          masteredQuestions: Object.values(state.questionProgress).filter(p => p.status === 'mastered').length,
          bookmarkedQuestions: Object.values(state.questionProgress).filter(p => p.bookmarked).length,
          totalStudyTime: state.totalStudyTime,
          examAttempts: state.examAttempts.length,
          lastStudied: state.lastStudied?.toISOString() || 'Never'
        };
      },

      switchUser: (userId: string) => {
        // Save current user's progress before switching
        const currentState = get();
        if (Object.keys(currentState.questionProgress).length > 0) {
          // Save current progress to storage
          saveUserProgressToStorage(userId, {
            questionProgress: currentState.questionProgress,
            totalQuestions: currentState.totalQuestions,
            masteredQuestions: currentState.masteredQuestions,
            categoryProgress: currentState.categoryProgress,
            studyStreak: currentState.studyStreak,
            totalStudyTime: currentState.totalStudyTime,
            examAttempts: currentState.examAttempts,
            lastStudied: currentState.lastStudied
          });
        }
        
        // Load new user's progress
        const newUserData = loadUserProgressFromStorage(userId);
        set({
          questionProgress: newUserData.questionProgress || {},
          totalQuestions: newUserData.totalQuestions || 0,
          masteredQuestions: newUserData.masteredQuestions || 0,
          categoryProgress: newUserData.categoryProgress || {} as Record<ExamDomain, CategoryProgress>,
          studyStreak: newUserData.studyStreak || 0,
          totalStudyTime: newUserData.totalStudyTime || 0,
          examAttempts: newUserData.examAttempts || [],
          lastStudied: newUserData.lastStudied
        });
      },

    }),
    {
      name: 'progress-store',
      partialize: () => ({}), // Don't persist in the store itself, use user-specific storage
    }
  )
);
