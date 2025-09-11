import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  limit,
  startAfter,
  DocumentSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  ChatbotWithQuiz,
  EnhancedQuizSession,
  QuizPool,
  QuizQuestion,
  QuizAnalytics,
  QuizFilters
} from '../types/quiz';
import { QuizSessionDocument } from './quizDataService';

const db = getFirestore();

// Collection names
const COLLECTIONS = {
  CHATBOTS: 'chatbots',
  QUIZ_SESSIONS: 'quizSessions',
  QUIZ_EVENTS: 'quizEvents',
  USERS: 'users'
} as const;

/**
 * Load all chatbots with their associated quiz information
 */
export const loadChatbotsWithQuizzes = async (): Promise<ChatbotWithQuiz[]> => {
  try {
    console.log('🧩 Loading chatbots with quiz information...');
    
    const chatbotsQuery = query(
      collection(db, COLLECTIONS.CHATBOTS),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(chatbotsQuery);
    const chatbots: ChatbotWithQuiz[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      // Transform chatbot data to include quiz information
      const chatbotWithQuiz: ChatbotWithQuiz = {
        chatbotId: data.chatbotId,
        title: data.title || 'Untitled Chatbot',
        materialTitle: data.material?.title || 'Unknown Material',
        materialId: data.material?.id || '',
        courseId: data.courseId?.id || '',
        courseTitle: data.courseId?.title || 'Unknown Course',
        createdBy: data.createdBy || '',
        timestamp: data.timestamp || new Date().toISOString(),
        quizId: data.chatbotId, // Quiz ID is typically the same as chatbot ID
        hasQuiz: true // Assuming all chatbots have quizzes as per your requirements
      };
      
      chatbots.push(chatbotWithQuiz);
    }
    
    console.log(`✅ Loaded ${chatbots.length} chatbots with quiz information`);
    return chatbots;
  } catch (error) {
    console.error('❌ Error loading chatbots with quizzes:', error);
    throw error;
  }
};

/**
 * Load enhanced quiz sessions with user information
 */
export const loadEnhancedQuizSessions = async (
  filters: QuizFilters = {},
  pageSize: number = 100,
  lastDoc?: DocumentSnapshot
): Promise<{ sessions: EnhancedQuizSession[], hasMore: boolean, lastDoc?: DocumentSnapshot }> => {
  try {
    console.log('🧩 Loading enhanced quiz sessions with filters:', filters);
    
    // Build query based on filters
    let baseQuery = collection(db, COLLECTIONS.QUIZ_SESSIONS);
    const constraints: any[] = [];
    
    // Filter by chatbot ID
    if (filters.chatbotId) {
      constraints.push(where('chatbotId', '==', filters.chatbotId));
    }
    
    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'all') {
      constraints.push(where('difficulty', '==', filters.difficulty));
    }
    
    // Filter by completion status
    if (filters.completionStatus && filters.completionStatus !== 'all') {
      constraints.push(where('completed', '==', filters.completionStatus === 'completed'));
    }
    
    // Filter by user ID
    if (filters.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }
    
    // Filter by date range
    if (filters.dateRange) {
      constraints.push(where('startedAt', '>=', Timestamp.fromDate(new Date(filters.dateRange.start))));
      constraints.push(where('startedAt', '<=', Timestamp.fromDate(new Date(filters.dateRange.end))));
    }
    
    // Add ordering and pagination
    constraints.push(orderBy('startedAt', 'desc'));
    constraints.push(limit(pageSize));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    const q = query(baseQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const sessions: EnhancedQuizSession[] = [];
    const userCache = new Map<string, { email?: string, displayName?: string }>();
    
    // Process each session and enhance with user data
    for (const docSnapshot of querySnapshot.docs) {
      const sessionData = docSnapshot.data() as QuizSessionDocument;
      
      // Get user information (with caching to avoid duplicate requests)
      let userInfo = userCache.get(sessionData.userId);
      if (!userInfo) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, sessionData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userInfo = {
              email: userData.email,
              displayName: userData.displayName || userData.name
            };
          } else {
            userInfo = { email: 'Unknown User', displayName: 'Unknown User' };
          }
          userCache.set(sessionData.userId, userInfo);
        } catch (error) {
          console.warn(`Failed to load user data for ${sessionData.userId}:`, error);
          userInfo = { email: 'Unknown User', displayName: 'Unknown User' };
          userCache.set(sessionData.userId, userInfo);
        }
      }
      
      // Calculate time spent if both start and submit times are available
      let timeSpent: number | undefined;
      if (sessionData.startedAt && sessionData.submittedAt) {
        const startTime = sessionData.startedAt.toMillis();
        const endTime = sessionData.submittedAt.toMillis();
        timeSpent = Math.round((endTime - startTime) / (1000 * 60)); // Convert to minutes
      }
      
      // Count questions attempted
      const questionsAttempted = Object.keys(sessionData.finalAnswers || {}).length;
      
      const enhancedSession: EnhancedQuizSession = {
        id: docSnapshot.id,
        quizId: sessionData.quizId,
        chatbotId: sessionData.chatbotId,
        userId: sessionData.userId,
        userEmail: userInfo.email,
        userName: userInfo.displayName,
        difficulty: sessionData.difficulty as any,
        startedAt: sessionData.startedAt.toDate().toISOString(),
        submittedAt: sessionData.submittedAt?.toDate().toISOString(),
        closedAt: sessionData.closedAt?.toDate().toISOString(),
        completed: sessionData.completed,
        answers: sessionData.finalAnswers || {},
        summary: sessionData.summary,
        questionsAttempted,
        timeSpent
      };
      
      sessions.push(enhancedSession);
    }
    
    const hasMore = querySnapshot.docs.length === pageSize;
    const newLastDoc = querySnapshot.docs.length > 0 
      ? querySnapshot.docs[querySnapshot.docs.length - 1] 
      : undefined;
    
    console.log(`✅ Loaded ${sessions.length} enhanced quiz sessions`);
    return { sessions, hasMore, lastDoc: newLastDoc };
  } catch (error) {
    console.error('❌ Error loading enhanced quiz sessions:', error);
    throw error;
  }
};

/**
 * Load quiz pool information from the quiz API
 * Note: This would typically call the quiz API to get question details
 * For now, we'll create a placeholder implementation
 */
export const loadQuizPool = async (quizId: string): Promise<QuizPool> => {
  try {
    console.log('🧩 Loading quiz pool for quiz:', quizId);
    
    // TODO: Replace with actual API call to quiz service
    // This is a placeholder implementation
    const mockQuestions: QuizQuestion[] = [
      {
        questionId: 'q1',
        question: 'What is the primary function of mitochondria?',
        category: 'Remember',
        difficulty: 'easy',
        maxScore: 100
      },
      {
        questionId: 'q2',
        question: 'Explain the process of cellular respiration.',
        category: 'Understand',
        difficulty: 'medium',
        maxScore: 100
      },
      {
        questionId: 'q3',
        question: 'Analyze the relationship between photosynthesis and cellular respiration.',
        category: 'Analyze',
        difficulty: 'hard',
        maxScore: 100
      }
    ];
    
    // Calculate category counts
    const categoryCounts: Record<string, number> = {};
    const difficultyBreakdown: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    
    mockQuestions.forEach(question => {
      categoryCounts[question.category] = (categoryCounts[question.category] || 0) + 1;
      difficultyBreakdown[question.difficulty] = (difficultyBreakdown[question.difficulty] || 0) + 1;
    });
    
    const quizPool: QuizPool = {
      quizId,
      chatbotId: quizId, // Assuming quiz ID matches chatbot ID
      questions: mockQuestions,
      categoryCounts,
      difficultyBreakdown: difficultyBreakdown as any,
      totalQuestions: mockQuestions.length,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Loaded quiz pool with', mockQuestions.length, 'questions');
    return quizPool;
  } catch (error) {
    console.error('❌ Error loading quiz pool:', error);
    throw error;
  }
};

/**
 * Generate analytics from quiz session data
 */
export const generateQuizAnalytics = (sessions: EnhancedQuizSession[]): QuizAnalytics => {
  try {
    console.log('🧩 Generating quiz analytics from', sessions.length, 'sessions');
    
    const completedSessions = sessions.filter(s => s.completed && s.summary);
    
    // Calculate basic statistics
    const totalSessions = sessions.length;
    const completionRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;
    
    const averageScore = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + (s.summary?.percent || 0), 0) / completedSessions.length
      : 0;
    
    const averageTimeSpent = sessions.filter(s => s.timeSpent).length > 0
      ? sessions.filter(s => s.timeSpent).reduce((sum, s) => sum + (s.timeSpent || 0), 0) / sessions.filter(s => s.timeSpent).length
      : 0;
    
    // Difficulty distribution
    const difficultyDistribution: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    sessions.forEach(session => {
      difficultyDistribution[session.difficulty] = (difficultyDistribution[session.difficulty] || 0) + 1;
    });
    
    // Category performance (placeholder - would need actual question data)
    const categoryPerformance: Record<string, { averageScore: number, totalAttempts: number, successRate: number }> = {
      'Remember': { averageScore: 85, totalAttempts: completedSessions.length, successRate: 78 },
      'Understand': { averageScore: 72, totalAttempts: completedSessions.length, successRate: 65 },
      'Apply': { averageScore: 68, totalAttempts: completedSessions.length, successRate: 58 },
      'Analyze': { averageScore: 61, totalAttempts: completedSessions.length, successRate: 45 },
      'Evaluate': { averageScore: 58, totalAttempts: completedSessions.length, successRate: 42 },
      'Create': { averageScore: 55, totalAttempts: completedSessions.length, successRate: 38 }
    };
    
    // Time-based statistics (placeholder implementation)
    const timeBasedStats = {
      daily: {} as Record<string, number>,
      weekly: {} as Record<string, number>,
      monthly: {} as Record<string, number>
    };
    
    // Group sessions by date
    sessions.forEach(session => {
      const date = new Date(session.startedAt);
      const day = date.toISOString().split('T')[0];
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      timeBasedStats.daily[day] = (timeBasedStats.daily[day] || 0) + 1;
      timeBasedStats.weekly[week] = (timeBasedStats.weekly[week] || 0) + 1;
      timeBasedStats.monthly[month] = (timeBasedStats.monthly[month] || 0) + 1;
    });
    
    const analytics: QuizAnalytics = {
      totalSessions,
      completionRate,
      averageScore,
      averageTimeSpent,
      difficultyDistribution: difficultyDistribution as any,
      categoryPerformance,
      timeBasedStats
    };
    
    console.log('✅ Generated quiz analytics:', analytics);
    return analytics;
  } catch (error) {
    console.error('❌ Error generating quiz analytics:', error);
    throw error;
  }
};

/**
 * Export quiz session data for analysis
 */
export const exportQuizSessionData = async (sessionId: string): Promise<Blob> => {
  try {
    console.log('🧩 Exporting quiz session data for:', sessionId);
    
    // Get session document
    const sessionDoc = await getDoc(doc(db, COLLECTIONS.QUIZ_SESSIONS, sessionId));
    if (!sessionDoc.exists()) {
      throw new Error('Quiz session not found');
    }
    
    const sessionData = sessionDoc.data() as QuizSessionDocument;
    
    // Create export data
    const exportData = {
      sessionId,
      quizId: sessionData.quizId,
      chatbotId: sessionData.chatbotId,
      userId: sessionData.userId,
      difficulty: sessionData.difficulty,
      startedAt: sessionData.startedAt.toDate().toISOString(),
      submittedAt: sessionData.submittedAt?.toDate().toISOString(),
      completed: sessionData.completed,
      answers: sessionData.finalAnswers || {},
      summary: sessionData.summary,
      exportedAt: new Date().toISOString()
    };
    
    // Convert to JSON blob
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    console.log('✅ Quiz session data exported successfully');
    return blob;
  } catch (error) {
    console.error('❌ Error exporting quiz session data:', error);
    throw error;
  }
};

/**
 * Get quiz sessions count for a specific chatbot
 */
export const getQuizSessionsCount = async (chatbotId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.QUIZ_SESSIONS),
      where('chatbotId', '==', chatbotId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('❌ Error getting quiz sessions count:', error);
    return 0;
  }
};
