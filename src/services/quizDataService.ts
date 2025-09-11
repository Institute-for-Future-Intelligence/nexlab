import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { 
  QuizStartData, 
  QuizAnswerChangeEvent, 
  QuizSubmissionResult, 
  QuizCloseInfo 
} from '../types/quiz';

const db = getFirestore();

// Collection names
const COLLECTIONS = {
  QUIZ_SESSIONS: 'quizSessions',
  QUIZ_EVENTS: 'quizEvents'
} as const;

// Quiz session document structure for Firestore
export interface QuizSessionDocument {
  quizId: string;
  chatbotId: string;
  userId: string;
  startedAt: Timestamp;
  submittedAt?: Timestamp;
  closedAt?: Timestamp;
  completed: boolean;
  difficulty: string;
  
  // Selection object from quiz start (matches documentation)
  selection?: {
    mode: string;
    target: number;
    finalCount: number;
  };
  
  // Quiz performance data
  finalAnswers?: Record<string, string>;
  summary?: {
    quiz_id: string;
    chatbot_id: string;
    total_score: number;
    total_max: number;
    percent: number;
    items: Record<string, {
      score: number;
      max_score: number;
      verdict: 'correct' | 'incorrect';
      reasoning: string;
    }>;
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Quiz event document structure for detailed tracking
export interface QuizEventDocument {
  quizId: string;
  chatbotId: string;
  userId: string;
  eventType: 'quiz_started' | 'answer_changed' | 'quiz_submitted' | 'quiz_closed';
  timestamp: Timestamp;
  data: any; // The raw event data
  createdAt: Timestamp;
}

/**
 * Save quiz start event to Firestore
 */
export const saveQuizStartEvent = async (
  data: QuizStartData, 
  userId: string
): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Create quiz session document with unique session ID
    const sessionDoc: QuizSessionDocument = {
      quizId: data.quizId,
      chatbotId: data.chatbotId,
      userId,
      startedAt: Timestamp.fromDate(new Date(data.startedAt)),
      completed: false,
      difficulty: data.selection.mode,
      selection: {
        mode: data.selection.mode,
        target: data.selection.target,
        finalCount: data.selection.finalCount
      },
      createdAt: now,
      updatedAt: now
    };
    
    // Create quiz event document
    const eventDoc: QuizEventDocument = {
      quizId: data.quizId,
      chatbotId: data.chatbotId,
      userId,
      eventType: 'quiz_started',
      timestamp: now,
      data: data,
      createdAt: now
    };
    
    // Save both documents
    await Promise.all([
      addDoc(collection(db, COLLECTIONS.QUIZ_SESSIONS), sessionDoc),
      addDoc(collection(db, COLLECTIONS.QUIZ_EVENTS), eventDoc)
    ]);
    
    console.log('✅ Quiz start event saved to Firestore:', {
      quizId: data.quizId,
      difficulty: data.selection.mode,
      userId: userId.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('❌ Error saving quiz start event:', error);
    throw error;
  }
};

/**
 * Save answer change event to Firestore
 */
export const saveAnswerChangeEvent = async (
  event: QuizAnswerChangeEvent, 
  userId: string
): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Create quiz event document (matches documentation format)
    const eventDoc: QuizEventDocument = {
      quizId: event.quizId,
      chatbotId: event.chatbotId || event.quizId, // Use chatbotId if available, fallback to quizId
      userId,
      eventType: 'answer_changed',
      timestamp: now,
      data: {
        quizId: event.quizId,
        questionId: event.questionId,
        value: event.value,
        answers: event.answers
      },
      createdAt: now
    };
    
    await addDoc(collection(db, COLLECTIONS.QUIZ_EVENTS), eventDoc);
    
    console.log('✅ Answer change event saved to Firestore:', {
      quizId: event.quizId,
      questionId: event.questionId,
      userId: userId.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('❌ Error saving answer change event:', error);
    // Don't throw - answer changes are frequent and shouldn't break the quiz
  }
};

/**
 * Save quiz submission to Firestore
 */
export const saveQuizSubmissionEvent = async (
  result: QuizSubmissionResult, 
  userId: string
): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Update quiz session with completion data
    // Find the most recent incomplete session for this quiz and user
    // We'll look for sessions created within the last hour to match current session
    const oneHourAgo = Timestamp.fromMillis(now.toMillis() - (60 * 60 * 1000));
    
    const sessionQuery = query(
      collection(db, COLLECTIONS.QUIZ_SESSIONS),
      where('quizId', '==', result.quizId),
      where('userId', '==', userId),
      where('completed', '==', false),
      where('createdAt', '>=', oneHourAgo),
      orderBy('createdAt', 'desc')
    );
    
    const sessionDocs = await getDocs(sessionQuery);
    
    if (!sessionDocs.empty) {
      const sessionDoc = sessionDocs.docs[0]; // Get the most recent incomplete session
      const sessionRef = sessionDoc.ref;
      const sessionData = sessionDoc.data();
      
      // Update the session with completion data
      const updateData = {
        submittedAt: Timestamp.fromDate(new Date(result.submittedAt)),
        completed: true,
        finalAnswers: result.answers,
        summary: result.summary,
        updatedAt: now
      };
      
      await updateDoc(sessionRef, updateData);
      
      console.log('✅ Updated quiz session:', {
        quizId: result.quizId,
        difficulty: sessionData.difficulty,
        score: `${result.summary.total_score}/${result.summary.total_max}`,
        userId: userId.substring(0, 8) + '...'
      });
    } else {
      console.error('❌ No incomplete session found for quiz submission - this should not happen!', {
        quizId: result.quizId,
        userId: userId.substring(0, 8) + '...',
        submittedAt: result.submittedAt
      });
      
      // This indicates a problem - we should always have a session from quiz start
      throw new Error('No matching quiz session found for submission');
    }
    
    // Create quiz event document
    const eventDoc: QuizEventDocument = {
      quizId: result.quizId,
      chatbotId: result.chatbotId,
      userId,
      eventType: 'quiz_submitted',
      timestamp: now,
      data: result,
      createdAt: now
    };
    
    await addDoc(collection(db, COLLECTIONS.QUIZ_EVENTS), eventDoc);
    
    console.log('✅ Quiz submission saved to Firestore:', {
      quizId: result.quizId,
      score: `${result.summary.total_score}/${result.summary.total_max} (${result.summary.percent}%)`
    });
  } catch (error) {
    console.error('❌ Error saving quiz submission:', error);
    throw error;
  }
};

/**
 * Save quiz close event to Firestore
 */
export const saveQuizCloseEvent = async (
  info: QuizCloseInfo, 
  userId: string
): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Update session with close time
    const sessionQuery = query(
      collection(db, COLLECTIONS.QUIZ_SESSIONS),
      where('quizId', '==', info.quizId),
      where('userId', '==', userId)
    );
    
    const sessionDocs = await getDocs(sessionQuery);
    
    if (!sessionDocs.empty) {
      const sessionDoc = sessionDocs.docs[0];
      const sessionRef = sessionDoc.ref;
      
      const updateData: any = {
        closedAt: Timestamp.fromDate(new Date(info.closedAt)),
        updatedAt: now
      };
      
      // If quiz was completed on close, update completion data
      if (info.completed && info.summary) {
        updateData.completed = true;
        updateData.finalAnswers = info.answers;
        updateData.summary = info.summary;
      }
      
      await updateDoc(sessionRef, updateData);
    }
    
    // Create quiz event document
    const eventDoc: QuizEventDocument = {
      quizId: info.quizId,
      chatbotId: info.chatbotId,
      userId,
      eventType: 'quiz_closed',
      timestamp: now,
      data: info,
      createdAt: now
    };
    
    await addDoc(collection(db, COLLECTIONS.QUIZ_EVENTS), eventDoc);
    
    console.log('✅ Quiz close event saved to Firestore:', {
      quizId: info.quizId,
      completed: info.completed
    });
  } catch (error) {
    console.error('❌ Error saving quiz close event:', error);
    throw error;
  }
};

/**
 * Get all quiz sessions for super-admin view
 */
export const getAllQuizSessions = async (): Promise<QuizSessionDocument[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.QUIZ_SESSIONS),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const sessions: QuizSessionDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data && typeof data === 'object') {
        sessions.push(data as QuizSessionDocument);
      }
    });
    
    console.log(`✅ Retrieved ${sessions.length} quiz sessions from Firestore`);
    return sessions;
  } catch (error) {
    console.error('❌ Error retrieving quiz sessions:', error);
    throw error;
  }
};

/**
 * Get quiz sessions for a specific user
 */
export const getUserQuizSessions = async (userId: string): Promise<QuizSessionDocument[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.QUIZ_SESSIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const sessions: QuizSessionDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data && typeof data === 'object') {
        sessions.push(data as QuizSessionDocument);
      }
    });
    
    console.log(`✅ Retrieved ${sessions.length} quiz sessions for user ${userId}`);
    return sessions;
  } catch (error) {
    console.error('❌ Error retrieving user quiz sessions:', error);
    throw error;
  }
};


/**
 * Get quiz events for detailed analysis
 */
export const getQuizEvents = async (quizId?: string): Promise<QuizEventDocument[]> => {
  try {
    let q;
    if (quizId) {
      q = query(
        collection(db, COLLECTIONS.QUIZ_EVENTS),
        where('quizId', '==', quizId),
        orderBy('timestamp', 'asc')
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.QUIZ_EVENTS),
        orderBy('timestamp', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const events: QuizEventDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data && typeof data === 'object') {
        events.push(data as QuizEventDocument);
      }
    });
    
    console.log(`✅ Retrieved ${events.length} quiz events from Firestore`);
    return events;
  } catch (error) {
    console.error('❌ Error retrieving quiz events:', error);
    throw error;
  }
};