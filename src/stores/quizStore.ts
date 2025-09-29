import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  QuizSession, 
  QuizDifficulty, 
  QuizStartData, 
  QuizAnswerChangeEvent, 
  QuizSubmissionResult, 
  QuizCloseInfo,
  QuizStatistics,
  QuizSummary
} from '../types/quiz';

interface QuizState {
  // Data state
  currentSession: QuizSession | null;
  sessions: QuizSession[];
  statistics: QuizStatistics;
  
  // UI state
  isModalOpen: boolean;
  currentChatbotId: string | null;
  currentDifficulty: QuizDifficulty;
  loading: boolean;
  error: string | null;
  
  // Session management
  isQuizActive: boolean;
  currentAnswers: Record<string, string>;
  lastSummary: QuizSummary | null;
  
  // Actions - UI state
  openQuizModal: (chatbotId: string, difficulty?: QuizDifficulty) => void;
  closeQuizModal: () => void;
  setDifficulty: (difficulty: QuizDifficulty) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Quiz lifecycle
  startQuiz: (data: QuizStartData) => void;
  updateAnswers: (event: QuizAnswerChangeEvent) => void;
  submitQuiz: (result: QuizSubmissionResult) => void;
  closeQuiz: (info: QuizCloseInfo) => void;
  
  // Actions - Session management
  addSession: (session: QuizSession) => void;
  updateSession: (sessionId: string, updates: Partial<QuizSession>) => void;
  deleteSession: (sessionId: string) => void;
  clearCurrentSession: () => void;
  
  // Actions - Statistics
  updateStatistics: () => void;
  
  // Async actions
  saveSessionToFirestore: (session: QuizSession) => Promise<void>;
  fetchUserSessions: (userId: string) => Promise<void>;
  
  // Utility actions
  reset: () => void;
}

const initialStatistics: QuizStatistics = {
  totalQuizzes: 0,
  completedQuizzes: 0,
  averageScore: 0,
  difficultyBreakdown: {
    easy: 0,
    medium: 0,
    hard: 0
  }
};

export const useQuizStore = create<QuizState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentSession: null,
        sessions: [],
        statistics: initialStatistics,
        isModalOpen: false,
        currentChatbotId: null,
        currentDifficulty: 'medium',
        loading: false,
        error: null,
        isQuizActive: false,
        currentAnswers: {},
        lastSummary: null,
        
        // UI Actions
        openQuizModal: (chatbotId, difficulty = 'medium') => {
          set({ 
            isModalOpen: true, 
            currentChatbotId: chatbotId,
            currentDifficulty: difficulty,
            error: null
          });
        },
        
        closeQuizModal: () => {
          set({ 
            isModalOpen: false,
            error: null
          });
        },
        
        setDifficulty: (difficulty) => {
          set({ currentDifficulty: difficulty });
        },
        
        setLoading: (loading) => {
          set({ loading });
        },
        
        setError: (error) => {
          set({ error });
        },
        
        // Quiz Lifecycle Actions
        startQuiz: (data) => {
          const session: QuizSession = {
            id: `session_${Date.now()}`,
            quizId: data.quizId,
            chatbotId: data.chatbotId,
            userId: '', // Will be set when we have user context
            difficulty: data.selection.mode,
            startedAt: data.startedAt,
            completed: false,
            answers: {}
          };
          
          set({ 
            currentSession: session,
            isQuizActive: true,
            currentAnswers: {},
            lastSummary: null,
            error: null
          });
        },
        
        updateAnswers: (event) => {
          const { currentSession } = get();
          if (!currentSession) return;
          
          const updatedAnswers = { ...event.answers };
          
          set({ 
            currentAnswers: updatedAnswers,
            currentSession: {
              ...currentSession,
              answers: updatedAnswers
            }
          });
        },
        
        submitQuiz: (result) => {
          console.log('🧩 Quiz Store: Quiz submitted. Data should be saved by quiz modal API:', result);
          
          // Only update UI state - the quiz modal handles data persistence
          set({
            lastSummary: result.summary,
            isQuizActive: false
          });
        },
        
        closeQuiz: (info) => {
          console.log('🧩 Quiz Store: Quiz closed. Data handled by quiz modal API:', info);
          
          // Only update UI state - the quiz modal handles data persistence
          set({
            currentSession: null,
            isQuizActive: false,
            isModalOpen: false,
            currentAnswers: {},
            lastSummary: info.completed ? info.summary : null
          });
        },
        
        // Session Management Actions
        addSession: (session) => {
          set((state) => ({
            sessions: [...state.sessions, session]
          }));
        },
        
        updateSession: (sessionId, updates) => {
          set((state) => ({
            sessions: state.sessions.map(session =>
              session.id === sessionId ? { ...session, ...updates } : session
            ),
            currentSession: state.currentSession?.id === sessionId
              ? { ...state.currentSession, ...updates }
              : state.currentSession
          }));
        },
        
        deleteSession: (sessionId) => {
          set((state) => ({
            sessions: state.sessions.filter(session => session.id !== sessionId)
          }));
        },
        
        clearCurrentSession: () => {
          set({
            currentSession: null,
            isQuizActive: false,
            currentAnswers: {},
            lastSummary: null
          });
        },
        
        // Statistics Actions
        updateStatistics: () => {
          const { sessions } = get();
          const completed = sessions.filter(s => s.completed);
          
          const totalScore = completed.reduce((sum, session) => 
            sum + (session.summary?.percent || 0), 0
          );
          
          const difficultyBreakdown = sessions.reduce((acc, session) => ({
            ...acc,
            [session.difficulty]: acc[session.difficulty] + 1
          }), { easy: 0, medium: 0, hard: 0 });
          
          const statistics: QuizStatistics = {
            totalQuizzes: sessions.length,
            completedQuizzes: completed.length,
            averageScore: completed.length > 0 ? totalScore / completed.length : 0,
            difficultyBreakdown,
            lastQuizDate: sessions.length > 0 
              ? sessions[sessions.length - 1].startedAt 
              : undefined
          };
          
          set({ statistics });
        },
        
        // Async Actions
        saveSessionToFirestore: async (session) => {
          try {
            const { db } = await import('../config/firestore');
            const { doc, setDoc } = await import('firebase/firestore');
            
            await setDoc(doc(db, 'quizSessions', session.id), {
              ...session,
              timestamp: new Date().toISOString()
            });
            
            console.log('Quiz session saved to Firestore:', session.id);
          } catch (error) {
            console.error('Failed to save quiz session:', error);
            set({ error: 'Failed to save quiz session' });
          }
        },
        
        fetchUserSessions: async (userId) => {
          try {
            set({ loading: true, error: null });
            
            const { db } = await import('../config/firestore');
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            
            const q = query(
              collection(db, 'quizSessions'),
              where('userId', '==', userId),
              orderBy('startedAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const sessions = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...(doc.data() as Omit<QuizSession, 'id'>)
            }));
            
            set({ sessions, loading: false });
            get().updateStatistics();
          } catch (error) {
            // Handle permission errors more gracefully
            if (error instanceof Error && error.message.includes('permissions')) {
              console.warn('User does not have permission to access quiz sessions');
              set({ sessions: [], loading: false, error: null }); // Don't show error for permission issues
            } else {
              console.error('Failed to fetch quiz sessions:', error);
              set({ error: 'Failed to fetch quiz sessions', loading: false });
            }
          }
        },
        
        // Utility Actions
        reset: () => {
          set({
            currentSession: null,
            sessions: [],
            statistics: initialStatistics,
            isModalOpen: false,
            currentChatbotId: null,
            currentDifficulty: 'medium',
            loading: false,
            error: null,
            isQuizActive: false,
            currentAnswers: {},
            lastSummary: null
          });
        }
      }),
      {
        name: 'quiz-store',
        // Only persist UI preferences and statistics, not active sessions
        partialize: (state) => ({
          currentDifficulty: state.currentDifficulty
        }),
        // Merge function to ensure proper initialization
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          ...(persistedState || {}),
          currentDifficulty: persistedState?.currentDifficulty || 'medium'
        })
      }
    ),
    {
      name: 'quiz-store'
    }
  )
);
