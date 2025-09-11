import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  QuizManagementState,
  ChatbotWithQuiz,
  EnhancedQuizSession,
  QuizPool,
  QuizAnalytics,
  QuizFilters,
  CourseInfo
} from '../types/quiz';
import {
  loadChatbotsWithQuizzes,
  loadEnhancedQuizSessions,
  loadQuizPool,
  generateQuizAnalytics,
  exportQuizSessionData
} from '../services/quizManagementService';

interface QuizManagementStore extends QuizManagementState {}

const initialFilters: QuizFilters = {
  difficulty: 'all',
  completionStatus: 'all'
};

export const useQuizManagementStore = create<QuizManagementStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        courses: [],
        selectedCourse: null,
        chatbotsWithQuizzes: [],
        filteredChatbots: [],
        selectedChatbot: null,
        quizSessions: [],
        quizPools: {},
        analytics: null,
        loading: false,
        error: null,
        filters: initialFilters,
        selectedSession: null,

        // Actions
        loadChatbotsWithQuizzes: async () => {
          try {
            set({ loading: true, error: null });
            console.log('🧩 Quiz Management Store: Loading chatbots with quizzes...');
            
            const chatbots = await loadChatbotsWithQuizzes();
            
            // Extract unique courses from chatbots
            const courseMap = new Map<string, CourseInfo>();
            chatbots.forEach(chatbot => {
              if (!courseMap.has(chatbot.courseId)) {
                courseMap.set(chatbot.courseId, {
                  courseId: chatbot.courseId,
                  courseTitle: chatbot.courseTitle,
                  chatbotCount: 0,
                  quizCount: 0
                });
              }
              const course = courseMap.get(chatbot.courseId)!;
              course.chatbotCount++;
              // Only count chatbots that actually have quizzes
              if (chatbot.quizId) {
                course.quizCount++;
              }
            });
            
            const courses = Array.from(courseMap.values()).sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
            
            set({ 
              chatbotsWithQuizzes: chatbots,
              courses,
              filteredChatbots: chatbots, // Initially show all
              loading: false 
            });
            
            console.log(`✅ Loaded ${chatbots.length} chatbots with quiz information from ${courses.length} courses`);
          } catch (error) {
            console.error('❌ Failed to load chatbots with quizzes:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load chatbots',
              loading: false 
            });
          }
        },

        selectCourse: (course) => {
          console.log('🧩 Quiz Management Store: Selecting course:', course?.courseId);
          const { chatbotsWithQuizzes } = get();
          
          const filteredChatbots = course 
            ? chatbotsWithQuizzes.filter(chatbot => chatbot.courseId === course.courseId)
            : chatbotsWithQuizzes;
          
          set({ 
            selectedCourse: course,
            filteredChatbots,
            selectedChatbot: null, // Clear selected chatbot when changing course
            selectedSession: null,
            quizSessions: [] // Clear sessions
          });
        },

        selectChatbot: (chatbot) => {
          console.log('🧩 Quiz Management Store: Selecting chatbot:', chatbot?.chatbotId);
          set({ 
            selectedChatbot: chatbot,
            selectedSession: null, // Clear selected session when changing chatbot
            filters: {
              ...get().filters,
              chatbotId: chatbot?.chatbotId
            }
          });
          
          // Auto-load sessions for the selected chatbot
          if (chatbot) {
            get().loadQuizSessions(chatbot.chatbotId);
          }
        },

        loadQuizSessions: async (chatbotId) => {
          try {
            set({ loading: true, error: null });
            console.log('🧩 Quiz Management Store: Loading quiz sessions for chatbot:', chatbotId);
            
            const filters = get().filters;
            const searchFilters = chatbotId ? { ...filters, chatbotId } : filters;
            
            const result = await loadEnhancedQuizSessions(searchFilters);
            
            set({ 
              quizSessions: result.sessions,
              loading: false 
            });
            
            // Generate analytics from the loaded sessions
            get().generateAnalytics();
            
            console.log(`✅ Loaded ${result.sessions.length} enhanced quiz sessions`);
          } catch (error) {
            console.error('❌ Failed to load quiz sessions:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load quiz sessions',
              loading: false 
            });
          }
        },

        loadQuizPool: async (quizId) => {
          try {
            set({ loading: true, error: null });
            console.log('🧩 Quiz Management Store: Loading quiz pool for:', quizId);
            
            const quizPool = await loadQuizPool(quizId);
            
            set((state) => ({ 
              quizPools: {
                ...state.quizPools,
                [quizId]: quizPool
              },
              loading: false 
            }));
            
            console.log(`✅ Loaded quiz pool with ${quizPool.totalQuestions} questions`);
          } catch (error) {
            console.error('❌ Failed to load quiz pool:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load quiz pool',
              loading: false 
            });
          }
        },

        updateFilters: (newFilters) => {
          const updatedFilters = { ...get().filters, ...newFilters };
          console.log('🧩 Quiz Management Store: Updating filters:', updatedFilters);
          
          set({ filters: updatedFilters });
          
          // Reload sessions with new filters
          get().loadQuizSessions(updatedFilters.chatbotId);
        },

        selectSession: (session) => {
          console.log('🧩 Quiz Management Store: Selecting session:', session?.id);
          set({ selectedSession: session });
        },

        generateAnalytics: () => {
          try {
            const { quizSessions } = get();
            console.log('🧩 Quiz Management Store: Generating analytics from', quizSessions.length, 'sessions');
            
            const analytics = generateQuizAnalytics(quizSessions);
            
            set({ analytics });
            
            console.log('✅ Generated quiz analytics successfully');
          } catch (error) {
            console.error('❌ Failed to generate analytics:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to generate analytics'
            });
          }
        },

        exportSessionData: async (sessionId) => {
          try {
            set({ loading: true, error: null });
            console.log('🧩 Quiz Management Store: Exporting session data for:', sessionId);
            
            const blob = await exportQuizSessionData(sessionId);
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quiz-session-${sessionId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            set({ loading: false });
            
            console.log('✅ Quiz session data exported successfully');
          } catch (error) {
            console.error('❌ Failed to export session data:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to export session data',
              loading: false 
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        reset: () => {
          console.log('🧩 Quiz Management Store: Resetting store state');
          set({
            chatbotsWithQuizzes: [],
            selectedChatbot: null,
            quizSessions: [],
            quizPools: {},
            analytics: null,
            loading: false,
            error: null,
            filters: initialFilters,
            selectedSession: null
          });
        }
      }),
      {
        name: 'quiz-management-store',
        // Only persist filters and selected chatbot to maintain user preferences
        partialize: (state) => ({
          filters: state.filters,
          selectedChatbot: state.selectedChatbot
        }),
        // Merge function to ensure proper initialization
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          ...(persistedState || {}),
          // Always start with clean data state
          courses: [],
          selectedCourse: null,
          chatbotsWithQuizzes: [],
          filteredChatbots: [],
          selectedChatbot: null,
          quizSessions: [],
          quizPools: {},
          analytics: null,
          loading: false,
          error: null,
          selectedSession: null
        })
      }
    ),
    {
      name: 'quiz-management-store'
    }
  )
);
