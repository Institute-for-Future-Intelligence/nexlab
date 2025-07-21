// src/components/ChatbotIntegration/ChatbotWrapper.tsx

import { useImperativeHandle, forwardRef, useRef } from 'react';
import { ChatbotInterface } from 'rag-chatbot-interface-ifi';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firestore';
import ErrorBoundary from './ErrorBoundary';
import { useUser } from '../../contexts/UserContext';

interface ChatbotWrapperProps {
  chatbotId: string;
}

const ChatbotWrapper = forwardRef<{ endConversation: () => void }, ChatbotWrapperProps>(
  ({ chatbotId }, ref) => {
    const { userDetails } = useUser();
    const chatbotRef = useRef<{ endConversation: () => void } | null>(null); // Corrected ref type

    const handleConversationStart = async (newConversationId: string) => {
      console.log("🤖 Chatbot started. Conversation ID:", newConversationId);

      if (userDetails?.uid) {
        try {
          await setDoc(
            doc(db, 'conversations', newConversationId),
            {
              conversationId: newConversationId,
              chatbotId,
              userId: userDetails.uid,
              startedAt: new Date().toISOString(),
            },
            { merge: true } // Prevent overwriting previous data
          );
          console.log('Conversation saved to Firestore');
        } catch (error) {
          console.error('Failed to save conversation:', error);
        }
      }
    };

    // Expose endConversation() function
    useImperativeHandle(ref, () => ({
      endConversation: () => {
        if (chatbotRef.current) {
          console.log("Ending chatbot conversation...");
          chatbotRef.current.endConversation(); // Built-in method
        }
      }
    }));

    return (
      <ErrorBoundary>
        <ChatbotInterface
          ref={chatbotRef} // Corrected: attach ref properly
          chatbotId={chatbotId}
          onConversationStart={handleConversationStart}
        />
      </ErrorBoundary>
    );
  }
);

ChatbotWrapper.displayName = 'ChatbotWrapper';

export default ChatbotWrapper;