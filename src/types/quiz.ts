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
