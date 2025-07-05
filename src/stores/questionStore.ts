import { create } from 'zustand';
import type { Question, QuestionFilters, ExamDomain } from '../types';
import { categorizeQuestion, filterQuestions } from '../utils/questionUtils';

interface QuestionStore {
  questions: Question[];
  filteredQuestions: Question[];
  currentQuestion: Question | null;
  filters: QuestionFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadQuestions: () => Promise<void>;
  recategorizeQuestions: () => void;
  setCurrentQuestion: (id: number) => void;
  updateFilters: (filters: Partial<QuestionFilters>) => void;
  getQuestionsByCategory: (category: ExamDomain) => Question[];
  resetFilters: () => void;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  filteredQuestions: [],
  currentQuestion: null,
  filters: {},
  loading: false,
  error: null,
  
  loadQuestions: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/data/questions.json');
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }
      
      const questionsData: Question[] = await response.json();
      
      // Always re-categorize questions with improved algorithm
      const categorizedQuestions = questionsData.map(question => ({
        ...question,
        category: categorizeQuestion(question)
      }));
      
      set({ 
        questions: categorizedQuestions,
        filteredQuestions: categorizedQuestions,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  recategorizeQuestions: () => {
    const { questions, filters } = get();
    const recategorized = questions.map(question => ({
      ...question,
      category: categorizeQuestion(question)
    }));
    
    const filtered = filterQuestions(recategorized, filters);
    
    set({ 
      questions: recategorized,
      filteredQuestions: filtered
    });
  },
  
  setCurrentQuestion: (id: number) => {
    const { questions } = get();
    const question = questions.find(q => q.id === id);
    set({ currentQuestion: question || null });
  },
  
  updateFilters: (newFilters: Partial<QuestionFilters>) => {
    const { questions, filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    
    // Get progress data for bookmark filtering
    const progressStore = (window as any).__progressStore;
    const questionProgress = progressStore?.getState?.()?.questionProgress || {};
    
    const filtered = filterQuestions(questions, updatedFilters, questionProgress);
    
    set({ 
      filters: updatedFilters,
      filteredQuestions: filtered 
    });
  },
  
  getQuestionsByCategory: (category: ExamDomain) => {
    const { questions } = get();
    return questions.filter(q => categorizeQuestion(q) === category);
  },
  
  resetFilters: () => {
    const { questions } = get();
    set({ 
      filters: {},
      filteredQuestions: questions 
    });
  }
}));
