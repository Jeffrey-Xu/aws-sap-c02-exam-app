import { create } from 'zustand';
import { apiService } from '../services/api';
import type { UserProgress, QuestionProgress } from '../types/progress';

interface ServerProgressStore extends UserProgress {
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncAt: Date | null;
  
  // Actions
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  updateQuestionProgress: (questionId: number, progress: Partial<QuestionProgress>) => void;
  addExamAttempt: (attempt: any) => void;
  updateStudyTime: (timeSpent: number) => void;
  clearError: () => void;
  
  // Auto-save functionality
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  
  // Server-side specific
  isServerMode: boolean;
}

let autoSaveInterval: NodeJS.Timeout | null = null;

export const useServerProgressStore = create<ServerProgressStore>((set, get) => ({
  // Initial state
  questionProgress: {},
  totalQuestions: 0,
  masteredQuestions: 0,
  categoryProgress: {},
  studyStreak: 0,
  examAttempts: [],
  totalStudyTime: 0,
  lastStudied: null,
  
  // Server-side specific state
  isLoading: false,
  isSaving: false,
  error: null,
  lastSyncAt: null,
  isServerMode: true,

  // Load progress from server
  loadProgress: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await apiService.loadProgress();

      if (result.success && result.data?.progress) {
        const progress = result.data.progress;
        
        set({
          questionProgress: progress.questionProgress || {},
          totalQuestions: progress.totalQuestions || 0,
          masteredQuestions: progress.masteredQuestions || 0,
          categoryProgress: progress.categoryProgress || {},
          studyStreak: progress.studyStreak || 0,
          examAttempts: progress.examAttempts || [],
          totalStudyTime: progress.totalStudyTime || 0,
          lastStudied: progress.lastStudied ? new Date(progress.lastStudied) : null,
          lastSyncAt: new Date(),
          isLoading: false,
          error: null
        });
      } else {
        set({ 
          isLoading: false,
          error: result.error || 'Failed to load progress'
        });
      }
    } catch (error) {
      set({ 
        isLoading: false,
        error: 'Network error while loading progress'
      });
    }
  },

  // Save progress to server
  saveProgress: async () => {
    const state = get();
    
    if (state.isSaving) return; // Prevent concurrent saves
    
    set({ isSaving: true, error: null });

    try {
      const progressData = {
        questionProgress: state.questionProgress,
        totalQuestions: state.totalQuestions,
        masteredQuestions: state.masteredQuestions,
        categoryProgress: state.categoryProgress,
        studyStreak: state.studyStreak,
        examAttempts: state.examAttempts,
        totalStudyTime: state.totalStudyTime,
        lastStudied: state.lastStudied?.toISOString() || null
      };

      const result = await apiService.saveProgress(progressData);

      if (result.success) {
        set({
          lastSyncAt: new Date(),
          isSaving: false,
          error: null
        });
      } else {
        set({ 
          isSaving: false,
          error: result.error || 'Failed to save progress'
        });
      }
    } catch (error) {
      set({ 
        isSaving: false,
        error: 'Network error while saving progress'
      });
    }
  },

  // Update question progress
  updateQuestionProgress: (questionId: number, progress: Partial<QuestionProgress>) => {
    set((state) => {
      const currentProgress = state.questionProgress[questionId] || {
        questionId,
        attempts: 0,
        correctAttempts: 0,
        lastAttempted: new Date(),
        status: 'new' as const,
        timeSpent: 0,
        notes: [],
        bookmarked: false
      };

      const updatedProgress = {
        ...currentProgress,
        ...progress,
        lastAttempted: new Date()
      };

      // Calculate mastery
      let masteredQuestions = state.masteredQuestions;
      const wasMastered = currentProgress.status === 'mastered';
      const isNowMastered = updatedProgress.status === 'mastered';
      
      if (!wasMastered && isNowMastered) {
        masteredQuestions++;
      } else if (wasMastered && !isNowMastered) {
        masteredQuestions--;
      }

      return {
        questionProgress: {
          ...state.questionProgress,
          [questionId]: updatedProgress
        },
        masteredQuestions,
        lastStudied: new Date()
      };
    });

    // Auto-save after a delay
    setTimeout(() => {
      get().saveProgress();
    }, 2000);
  },

  // Add exam attempt
  addExamAttempt: (attempt: any) => {
    set((state) => ({
      examAttempts: [...state.examAttempts, {
        ...attempt,
        completedAt: new Date().toISOString()
      }],
      lastStudied: new Date()
    }));

    // Auto-save
    setTimeout(() => {
      get().saveProgress();
    }, 1000);
  },

  // Update study time
  updateStudyTime: (timeSpent: number) => {
    set((state) => ({
      totalStudyTime: state.totalStudyTime + timeSpent,
      lastStudied: new Date()
    }));
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Enable auto-save - only in browser
  enableAutoSave: () => {
    if (typeof window === 'undefined' || autoSaveInterval) return;
    
    autoSaveInterval = setInterval(() => {
      const state = get();
      if (state.lastStudied && !state.isSaving) {
        state.saveProgress();
      }
    }, 30000); // Auto-save every 30 seconds
  },

  // Disable auto-save
  disableAutoSave: () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
    }
  }
}));

// Initialize auto-save when store is created - only in browser
if (typeof window !== 'undefined') {
  useServerProgressStore.getState().enableAutoSave();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    const state = useServerProgressStore.getState();
    state.disableAutoSave();
    // Attempt to save before leaving (may not complete)
    state.saveProgress();
  });
}
