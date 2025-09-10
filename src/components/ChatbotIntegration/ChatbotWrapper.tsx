// src/components/ChatbotIntegration/ChatbotWrapper.tsx

import { useImperativeHandle, forwardRef, useRef, useState } from 'react';
import { ChatbotInterface } from 'rag-chatbot-interface-ifi';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firestore';
import ErrorBoundary from './ErrorBoundary';
import { useUser } from '../../hooks/useUser';
import { Box, Button, Collapse, Typography } from '@mui/material';
import { Chat as ChatIcon, ExpandLess, ExpandMore } from '@mui/icons-material';

interface ChatbotWrapperProps {
  chatbotId: string;
}

const ChatbotWrapper = forwardRef<{ endConversation: () => void }, ChatbotWrapperProps>(
  ({ chatbotId }, ref) => {
    const { userDetails } = useUser();
    const chatbotRef = useRef<{ endConversation: () => void } | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleConversationStart = async (newConversationId: string) => {
      console.log(`🤖 Chatbot started. Chatbot ID: ${chatbotId}, Conversation ID: ${newConversationId}`);

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
      <Box sx={{ 
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end'
      }}>
        {/* Chat Container */}
        <Box sx={{
          background: isOpen ? 'rgba(255, 255, 255, 0.95)' : '#00695c',
          borderRadius: 4,
          boxShadow: isOpen 
            ? '0 8px 32px rgba(0, 0, 0, 0.12)' 
            : '0 2px 8px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: isOpen ? '1px solid #e0e0e0' : 'none',
          minWidth: isOpen ? 400 : 'auto',
          maxWidth: isOpen ? 450 : 'auto',
        }}>
          {/* Header Button */}
          <Button
            variant="text"
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              background: isOpen ? '#00695c !important' : 'transparent !important',
              backgroundColor: isOpen ? '#00695c !important' : 'transparent !important',
              color: 'white !important',
              px: 2.5,
              py: 1.5,
              borderRadius: isOpen ? '16px 16px 0 0' : 3,
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              minWidth: 'auto',
              width: '100%',
              justifyContent: 'flex-start',
              '&:hover': {
                background: '#004d40 !important',
                backgroundColor: '#004d40 !important',
                boxShadow: isOpen ? 'none' : '0px 4px 12px rgba(0, 105, 92, 0.3)',
              },
              '&:active': {
                background: '#004d40 !important',
                backgroundColor: '#004d40 !important',
              },
              '&:focus': {
                background: isOpen ? '#00695c !important' : '#004d40 !important',
                backgroundColor: isOpen ? '#00695c !important' : '#004d40 !important',
              },
              '&.Mui-focusVisible': {
                background: isOpen ? '#00695c !important' : '#004d40 !important',
                backgroundColor: isOpen ? '#00695c !important' : '#004d40 !important',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {/* Chat Icon */}
            <ChatIcon sx={{ fontSize: '1.5rem' }} />
            
            {/* Text Content */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              lineHeight: 1,
              flex: 1
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: 'Staatliches, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mb: 0,
                  lineHeight: 1.1
                }}
              >
                Chat with PAT
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: 'Gabarito, sans-serif',
                  fontSize: '0.75rem',
                  opacity: 0.9,
                  lineHeight: 1,
                  mt: 0.2
                }}
              >
                AI Tutor
              </Typography>
            </Box>

            {/* Expand/Collapse Icon */}
            {isOpen ? <ExpandLess sx={{ fontSize: '1.2rem' }} /> : <ExpandMore sx={{ fontSize: '1.2rem' }} />}
          </Button>

          {/* Chatbot Interface */}
          <Collapse 
            in={isOpen}
            timeout={300}
            easing={{
              enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
              exit: 'cubic-bezier(0.4, 0, 0.6, 1)',
            }}
          >
            <Box sx={{ 
              background: 'white',
              borderRadius: '0 0 16px 16px',
              overflow: 'hidden'
            }}>
              <ErrorBoundary>
                <ChatbotInterface
                  ref={chatbotRef}
                  chatbotId={chatbotId}
                  onConversationStart={handleConversationStart}
                />
              </ErrorBoundary>
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  }
);

ChatbotWrapper.displayName = 'ChatbotWrapper';

export default ChatbotWrapper;