// src/types/chatbot.ts

/**
 * Comprehensive types for chatbot-related data structures
 * Based on actual usage patterns found in the codebase
 */

// Chatbot Request data structure (from Firestore)
export interface ChatbotRequest {
  id: string;
  educatorId: string;
  courseId: string;
  courseNumber: string;
  courseTitle: string;
  materialId?: string;
  materialTitle?: string;
  title: string;
  files: string[]; // Array of file URLs
  status: 'pending' | 'approved' | 'denied';
  timestamp: string; // ISO string
  chatbotId?: string; // Only present after approval
}

// Chatbot Details data structure (from Firestore)
export interface ChatbotDetails {
  chatbotId: string;
  title: string;
  courseId: {
    id: string;
    number?: string;
    title: string;
  };
  material: {
    id: string;
    title: string;
  };
  createdBy: string;
  files?: string[];
  timestamp: string; // ISO string
}

// Conversation data structure (from Firestore)
export interface Conversation {
  id: string;
  userId: string;
  chatbotId: string;
  startedAt: string;
}

// Conversation message (from API)
export interface ConversationMessage {
  question: string;
  answer: string;
  timestamp: string;
}

// Extended chatbot details for conversation history modal
export interface ExtendedChatbotDetails {
  chatbotId: string;
  chatbotTitle: string;
  courseTitle: string;
  courseId: string;
  materialTitle: string;
  materialId: string;
  materialLink: string;
  chatbotCreatedBy: string;
  chatbotCreatedAt: string;
}

// Conversation metadata for exports
export interface ConversationMetadata {
  conversationId: string;
  userId: string;
  chatbotId: string;
  chatbotTitle: string;
  startedAt: string;
  courseTitle: string;
  courseId: string;
  materialTitle: string;
  materialId: string;
  materialLink: string;
  chatbotCreatedBy: string;
  chatbotCreatedAt: string;
} 