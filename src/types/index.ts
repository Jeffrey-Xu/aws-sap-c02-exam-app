// Re-export auth types
export * from './auth';

export interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correct_answer: string;
  topic: string;
  category?: ExamDomain;
  difficulty?: QuestionDifficulty;
  explanation: string;
  why_correct: string;
  why_others_wrong: string[];
  tags?: string[];
  detailed_reasoning?: DetailedReasoning;
  aws_services?: string[];
  key_concepts?: string[];
}

export interface DetailedReasoning {
  option_analyses: Record<string, OptionAnalysis>;
  summary_reasoning: SummaryReasoning;
  why_correct_answer_wins: string[];
  common_mistakes: string[];
  key_concepts: string[];
  aws_services: string[];
}

export interface OptionAnalysis {
  reasoning: string[];
  key_points: {
    services: string[];
    configurations: string[];
    status: string;
  };
  is_correct: boolean;
}

export interface SummaryReasoning {
  why_correct_answer_wins: string[];
  common_mistakes_in_wrong_answers: string[];
  key_decision_factors: string[];
}

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  text: string;
}

export type ExamDomain = 
  | 'organizational-complexity'
  | 'new-solutions'
  | 'migration-planning'
  | 'cost-control'
  | 'continuous-improvement';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionStatus = 'new' | 'practicing' | 'mastered' | 'needs-review';

export interface QuestionProgress {
  questionId: number;
  attempts: number;
  correctAttempts: number;
  lastAttempted: Date;
  status: QuestionStatus;
  timeSpent: number; // seconds
  bookmarked: boolean;
  notes: string;
  masteredAt?: Date;
}

export interface CategoryProgress {
  domain: ExamDomain;
  totalQuestions: number;
  masteredQuestions: number;
  averageScore: number;
  timeSpent: number;
  lastStudied: Date;
}

export interface ExamSession {
  id: string;
  type: 'practice' | 'full-exam';
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  questions: number[];
  answers: Record<number, string>;
  flaggedQuestions: number[];
  timePerQuestion: Record<number, number>;
  status: ExamStatus;
  score?: ExamScore;
  reviewCompleted: boolean;
}

export type ExamStatus = 'not-started' | 'in-progress' | 'completed' | 'abandoned';

export interface ExamScore {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  score: number; // Score out of 1000
  passed: boolean;
  domainScores: Record<ExamDomain, DomainScore>;
}

export interface DomainScore {
  correct: number;
  total: number;
  percentage: number;
}

export interface UserProgress {
  totalQuestions: number;
  masteredQuestions: number;
  categoryProgress: Record<ExamDomain, CategoryProgress>;
  studyStreak: number;
  totalStudyTime: number;
  examAttempts: ExamSession[];
  lastStudied?: Date;
}

export interface QuestionFilters {
  category?: ExamDomain;
  status?: QuestionStatus;
  difficulty?: QuestionDifficulty;
  bookmarked?: boolean;
  search?: string;
}
