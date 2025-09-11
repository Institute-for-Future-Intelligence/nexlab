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
        quizId: null, // Will be populated from quiz sessions
        hasQuiz: true // Assuming all chatbots have quizzes as per your requirements
      };
      
      chatbots.push(chatbotWithQuiz);
    }
    
    // Now populate quiz IDs from quiz sessions
    for (const chatbot of chatbots) {
      try {
        // Get the first quiz session for this chatbot to extract the quiz ID
        const quizSessionQuery = query(
          collection(db, COLLECTIONS.QUIZ_SESSIONS),
          where('chatbotId', '==', chatbot.chatbotId),
          limit(1)
        );
        
        const quizSessionSnapshot = await getDocs(quizSessionQuery);
        if (!quizSessionSnapshot.empty) {
          const sessionData = quizSessionSnapshot.docs[0].data();
          chatbot.quizId = sessionData.quizId || null;
        }
      } catch (error) {
        console.warn(`⚠️ Could not fetch quiz ID for chatbot ${chatbot.chatbotId}:`, error);
        chatbot.quizId = null;
      }
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
    const baseQuery = collection(db, COLLECTIONS.QUIZ_SESSIONS);
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
      
      // Since we don't collect user profile data, just use the user ID
      let userInfo = userCache.get(sessionData.userId);
      if (!userInfo) {
        // Format user ID for display - use first 8 characters + last 4 for better identification
        const userIdShort = sessionData.userId.length > 12 
          ? `${sessionData.userId.substring(0, 8)}...${sessionData.userId.slice(-4)}`
          : sessionData.userId.substring(0, 12);
        
        userInfo = { 
          email: userIdShort, 
          displayName: `User ${userIdShort}` 
        };
        userCache.set(sessionData.userId, userInfo);
      }
      
      // Calculate time spent if both start and submit times are available
      let timeSpent: number | undefined;
      let timeSpentFormatted: string | undefined;
      if (sessionData.startedAt && sessionData.submittedAt) {
        const startTime = sessionData.startedAt.toMillis();
        const endTime = sessionData.submittedAt.toMillis();
        const totalSeconds = Math.round((endTime - startTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timeSpent = totalSeconds; // Store total seconds for calculations
        timeSpentFormatted = `${minutes}m ${seconds}s`;
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
        timeSpent,
        timeSpentFormatted
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
    
    // Query quiz sessions to extract real question IDs
    const sessionsQuery = query(
      collection(db, COLLECTIONS.QUIZ_SESSIONS),
      where('quizId', '==', quizId),
      orderBy('startedAt', 'desc'),
      limit(50) // Get recent sessions to extract question IDs
    );
    
    const sessionsSnapshot = await getDocs(sessionsQuery);
    const questionIds = new Set<string>();
    const questionAnswers = new Map<string, string>();
    
    // Extract unique question IDs from all sessions
    for (const docSnapshot of sessionsSnapshot.docs) {
      const sessionData = docSnapshot.data() as QuizSessionDocument;
      
      // Get question IDs from summary.items
      if (sessionData.summary?.items) {
        Object.keys(sessionData.summary.items).forEach(questionId => {
          questionIds.add(questionId);
        });
      }
      
      // Get question IDs from finalAnswers and store sample answers
      if (sessionData.finalAnswers) {
        Object.entries(sessionData.finalAnswers).forEach(([questionId, answer]) => {
          questionIds.add(questionId);
          if (!questionAnswers.has(questionId)) {
            questionAnswers.set(questionId, answer);
          }
        });
      }
    }
    
    // Convert to QuizQuestion array with real question IDs
    const realQuestions: QuizQuestion[] = Array.from(questionIds).map(questionId => {
      const answer = questionAnswers.get(questionId) || '';
      
      // Generate question text from answer (placeholder approach)
      const questionText = answer.length > 0 
        ? `Question about: ${answer.split(' ').slice(0, 10).join(' ')}${answer.split(' ').length > 10 ? '...' : ''}`
        : 'Question text not available';
      
      return {
        questionId,
        question: questionText,
        category: 'Biology Fundamentals', // Placeholder category
        difficulty: 'medium' as const,
        maxScore: 100
      };
    });
    
    // If no real questions found, show message
    const questions: QuizQuestion[] = realQuestions.length > 0 ? realQuestions : [
      {
        questionId: 'no-sessions-found',
        question: 'No quiz sessions found for this quiz ID. Question IDs will appear here once students take quizzes.',
        category: 'Biology Fundamentals',
        difficulty: 'medium',
        maxScore: 100
      }
    ];
    
    // Calculate category counts
    const categoryCounts: Record<string, number> = {};
    const difficultyBreakdown: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    
    questions.forEach(question => {
      categoryCounts[question.category] = (categoryCounts[question.category] || 0) + 1;
      difficultyBreakdown[question.difficulty] = (difficultyBreakdown[question.difficulty] || 0) + 1;
    });
    
    const quizPool: QuizPool = {
      quizId,
      chatbotId: quizId, // Assuming quiz ID matches chatbot ID
      questions,
      categoryCounts,
      difficultyBreakdown: difficultyBreakdown as any,
      totalQuestions: questions.length,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`✅ Loaded quiz pool with ${questions.length} real question IDs from ${sessionsSnapshot.docs.length} sessions`);
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
      ? Math.round(sessions.filter(s => s.timeSpent).reduce((sum, s) => sum + (s.timeSpent || 0), 0) / sessions.filter(s => s.timeSpent).length)
      : 0;
    
    // Difficulty distribution
    const difficultyDistribution: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    sessions.forEach(session => {
      difficultyDistribution[session.difficulty] = (difficultyDistribution[session.difficulty] || 0) + 1;
    });
    
    // Category performance - calculate from actual quiz data
    const categoryPerformance: Record<string, { averageScore: number, totalAttempts: number, successRate: number }> = {};
    
    // Analyze quiz summaries to extract category performance
    completedSessions.forEach(session => {
      if (session.summary?.items) {
        Object.values(session.summary.items).forEach(item => {
          // Note: We would need question category data from the quiz API to properly categorize
          // For now, we'll extract what we can from the available data
          const category = 'Mixed Questions'; // Placeholder until we get actual category data
          
          if (!categoryPerformance[category]) {
            categoryPerformance[category] = { averageScore: 0, totalAttempts: 0, successRate: 0 };
          }
          
          categoryPerformance[category].totalAttempts += 1;
          categoryPerformance[category].averageScore += item.score;
          if (item.verdict === 'correct') {
            categoryPerformance[category].successRate += 1;
          }
        });
      }
    });
    
    // Calculate averages
    Object.keys(categoryPerformance).forEach(category => {
      const data = categoryPerformance[category];
      if (data.totalAttempts > 0) {
        data.averageScore = (data.averageScore / data.totalAttempts);
        data.successRate = (data.successRate / data.totalAttempts) * 100;
      }
    });
    
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
