// src/types/quiz.ts

/**
 * TypeScript interfaces for quiz functionality
 * Based on rag-quiz-modal-ifi package documentation
 */

// Quiz difficulty levels
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

// Quiz modal state
export interface QuizModalState {
  open: boolean;
  difficulty: QuizDifficulty;
  chatbotId: string | null;
}

// Quiz start event data
export interface QuizStartData {
  quizId: string;
  chatbotId: string;
  startedAt: string;
  selection: {
    mode: QuizDifficulty;
    target: number;
    finalCount: number;
  };
}

// Answer change event data
export interface QuizAnswerChangeEvent {
  quizId: string;
  questionId: string;
  value: string;
  answers: Record<string, string>;
}

// Quiz submission result
export interface QuizSubmissionResult {
  quizId: string;
  chatbotId: string;
  answers: Record<string, string>;
  summary: QuizSummary;
  startedAt: string;
  submittedAt: string;
}

// Quiz close event data
export interface QuizCloseInfo {
  quizId: string;
  chatbotId: string;
  answers: Record<string, string>;
  summary: QuizSummary | null;
  completed: boolean;
  closedAt: string;
}

// Quiz summary structure
export interface QuizSummary {
  quiz_id: string;
  chatbot_id: string;
  total_score: number;
  total_max: number;
  percent: number;
  items: Record<string, QuizQuestionResult>;
}

// Individual question result
export interface QuizQuestionResult {
  score: number;
  max_score: number;
  verdict: 'correct' | 'incorrect';
  reasoning: string;
}

// Quiz session data for storage
export interface QuizSession {
  id: string;
  quizId: string;
  chatbotId: string;
  userId: string;
  difficulty: QuizDifficulty;
  startedAt: string;
  submittedAt?: string;
  completed: boolean;
  answers: Record<string, string>;
  summary?: QuizSummary;
}

// Quiz statistics for analytics
export interface QuizStatistics {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  difficultyBreakdown: Record<QuizDifficulty, number>;
  lastQuizDate?: string;
}

// Quiz error types
export type QuizErrorPhase = 'loading' | 'submitting' | 'initialization';

// Quiz event handlers interface
export interface QuizEventHandlers {
  onQuizStart?: (data: QuizStartData) => void;
  onAnswerChange?: (event: QuizAnswerChangeEvent) => void;
  onQuizSubmit?: (result: QuizSubmissionResult) => void;
  onQuizClose?: (info: QuizCloseInfo) => void;
  onError?: (error: Error, phase: QuizErrorPhase) => void;
}

// Quiz modal ref methods
export interface QuizModalRef {
  reloadQuiz: () => void;
  clearProgress: () => void;
  submit: () => void;
  getAnswers: () => Record<string, string>;
  getSummary: () => QuizSummary | null;
  close: () => void;
}

// Props for quiz components
export interface QuizWrapperProps {
  chatbotId: string;
  difficulty: QuizDifficulty;
  open: boolean;
  onClose: () => void;
  eventHandlers?: QuizEventHandlers;
}

export interface QuizManagerProps {
  defaultDifficulty?: QuizDifficulty;
  position?: 'fixed' | 'relative';
}

// Quiz button props
export interface QuizButtonProps {
  chatbotId?: string;
  difficulty?: QuizDifficulty;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children?: React.ReactNode;
}

// Enhanced data structures for Quiz Management Page

// Chatbot with quiz information
export interface ChatbotWithQuiz {
  chatbotId: string;
  title: string;
  materialTitle: string;
  materialId: string;
  courseId: string;
  courseTitle: string;
  createdBy: string;
  timestamp: string;
  quizId?: string; // Quiz ID associated with this chatbot
  hasQuiz: boolean;
}

// Quiz question information from the quiz API
export interface QuizQuestion {
  questionId: string;
  question: string;
  category: string; // Bloom's taxonomy category
  difficulty: QuizDifficulty;
  maxScore: number;
}

// Quiz pool information
export interface QuizPool {
  quizId: string;
  chatbotId: string;
  questions: QuizQuestion[];
  categoryCounts: Record<string, number>; // Count of questions per category
  difficultyBreakdown: Record<QuizDifficulty, number>;
  totalQuestions: number;
  lastUpdated: string;
}

// Enhanced quiz session with detailed user information
export interface EnhancedQuizSession {
  id: string;
  quizId: string;
  chatbotId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  difficulty: QuizDifficulty;
  startedAt: string;
  submittedAt?: string;
  closedAt?: string;
  completed: boolean;
  answers: Record<string, string>;
  summary?: QuizSummary;
  questionsAttempted: number;
  timeSpent?: number; // in minutes
}

// Quiz analytics and insights
export interface QuizAnalytics {
  totalSessions: number;
  completionRate: number;
  averageScore: number;
  averageTimeSpent: number;
  difficultyDistribution: Record<QuizDifficulty, number>;
  categoryPerformance: Record<string, {
    averageScore: number;
    totalAttempts: number;
    successRate: number;
  }>;
  timeBasedStats: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
}

// Quiz Management Page filters
export interface QuizFilters {
  chatbotId?: string;
  difficulty?: QuizDifficulty | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  completionStatus?: 'all' | 'completed' | 'incomplete';
  userId?: string;
}

// Quiz Management store interface
export interface QuizManagementState {
  // Data
  chatbotsWithQuizzes: ChatbotWithQuiz[];
  selectedChatbot: ChatbotWithQuiz | null;
  quizSessions: EnhancedQuizSession[];
  quizPools: Record<string, QuizPool>; // keyed by quizId
  analytics: QuizAnalytics | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: QuizFilters;
  selectedSession: EnhancedQuizSession | null;
  
  // Actions
  loadChatbotsWithQuizzes: () => Promise<void>;
  selectChatbot: (chatbot: ChatbotWithQuiz | null) => void;
  loadQuizSessions: (chatbotId?: string) => Promise<void>;
  loadQuizPool: (quizId: string) => Promise<void>;
  updateFilters: (filters: Partial<QuizFilters>) => void;
  selectSession: (session: EnhancedQuizSession | null) => void;
  generateAnalytics: () => void;
  exportSessionData: (sessionId: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}
