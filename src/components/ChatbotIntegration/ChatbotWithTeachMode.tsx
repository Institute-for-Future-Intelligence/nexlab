// src/components/ChatbotIntegration/ChatbotWithTeachMode.tsx

import { useImperativeHandle, forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import { ChatbotInterface, TeachModeInterface } from 'chatbot-interface-ifi';
import { doc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firestore';
import ErrorBoundary from './ErrorBoundary';
import { useUser } from '../../hooks/useUser';
import { Box, Button, Collapse, Typography } from '@mui/material';
import { Chat as ChatIcon, School as TeachIcon, ExpandLess, ExpandMore } from '@mui/icons-material';

interface ChatbotWithTeachModeProps {
  chatbotId: string;
  enableGuidedQuestions?: boolean;
  showModeSwitch?: boolean; // Whether to show the switch mode buttons
}

export interface ChatbotWithTeachModeRef {
  endConversation: () => void;
  createNewSession: () => void;
  switchToChat: () => void;
  switchToTeach: () => void;
}

const ChatbotWithTeachMode = forwardRef<ChatbotWithTeachModeRef, ChatbotWithTeachModeProps>(
  ({ chatbotId, enableGuidedQuestions = false, showModeSwitch = true }, ref) => {
    const { userDetails } = useUser();
    const chatbotRef = useRef<{ endConversation: () => void } | null>(null);
    const teachRef = useRef<{ createNewSession: () => void } | null>(null);
    
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'chat' | 'teach'>('chat');
    const [savedSessionIds, setSavedSessionIds] = useState<string[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    // Load user's previous teach sessions on mount
    useEffect(() => {
      const loadUserSessions = async () => {
        if (!userDetails?.uid) return;

        setIsLoadingSessions(true);
        try {
          const sessionsRef = collection(db, 'teachSessions');
          const q = query(
            sessionsRef,
            where('userId', '==', userDetails.uid),
            where('chatbotId', '==', chatbotId),
            orderBy('startedAt', 'desc'),
            limit(50) // Load last 50 sessions
          );

          const querySnapshot = await getDocs(q);
          const sessionIds = querySnapshot.docs.map((doc) => doc.data().sessionId as string);
          
          console.log(`📚 Loaded ${sessionIds.length} teach sessions for user ${userDetails.uid}`);
          setSavedSessionIds(sessionIds);
        } catch (error) {
          console.error('Failed to load teach sessions:', error);
          // If there's an error (e.g., missing index), continue with empty array
          setSavedSessionIds([]);
        } finally {
          setIsLoadingSessions(false);
        }
      };

      loadUserSessions();
    }, [userDetails?.uid, chatbotId]);

    // Handle conversation start (Chat mode)
    const handleConversationStart = async (newConversationId: string) => {
      console.log(`💬 Chat started. Chatbot ID: ${chatbotId}, Conversation ID: ${newConversationId}`);

      if (userDetails?.uid) {
        try {
          await setDoc(
            doc(db, 'conversations', newConversationId),
            {
              conversationId: newConversationId,
              chatbotId,
              userId: userDetails.uid,
              startedAt: new Date().toISOString(),
              mode: 'chat',
            },
            { merge: true }
          );
          console.log('Conversation saved to Firestore');
        } catch (error) {
          console.error('Failed to save conversation:', error);
        }
      }
    };

    // Handle session start (Teach mode)
    const handleSessionStart = useCallback(
      async (newSessionId: string) => {
        console.log(`📚 Teach session started. Chatbot ID: ${chatbotId}, Session ID: ${newSessionId}`);

        // Update local state (avoid duplicates)
        setSavedSessionIds((prev) =>
          prev.includes(newSessionId) ? prev : [newSessionId, ...prev]
        );

        // Save to Firestore
        if (userDetails?.uid) {
          try {
            await setDoc(doc(db, 'teachSessions', newSessionId), {
              sessionId: newSessionId,
              chatbotId,
              userId: userDetails.uid,
              startedAt: new Date().toISOString(),
              mode: 'teach',
            });
            console.log('Teach session saved to Firestore');
          } catch (error) {
            console.error('Failed to save teach session:', error);
          }
        }
      },
      [userDetails?.uid, chatbotId]
    );

    // Mode switching handlers
    const handleSwitchToTeach = useCallback(() => {
      console.log('Switching to Teach mode');
      setMode('teach');
    }, []);

    const handleSwitchToChat = useCallback(() => {
      console.log('Switching to Chat mode');
      setMode('chat');
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      endConversation: () => {
        if (chatbotRef.current) {
          console.log('Ending chatbot conversation...');
          chatbotRef.current.endConversation();
        }
      },
      createNewSession: () => {
        if (teachRef.current) {
          console.log('Creating new teach session...');
          teachRef.current.createNewSession();
        }
      },
      switchToChat: handleSwitchToChat,
      switchToTeach: handleSwitchToTeach,
    }));

    // Panel visibility style (no absolute positioning to avoid layout issues)
    const panelStyle = (isActive: boolean) => ({
      display: isActive ? 'block' : 'none',
    });

    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {/* Chat Container */}
        <Box
          sx={{
            background: isOpen ? 'rgba(255, 255, 255, 0.95)' : mode === 'chat' ? '#0B53C0' : '#2E7D32',
            borderRadius: 4,
            boxShadow: isOpen
              ? '0 8px 32px rgba(0, 0, 0, 0.12)'
              : '0 2px 8px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: isOpen ? '1px solid #e0e0e0' : 'none',
            minWidth: isOpen ? 400 : 'auto',
            maxWidth: isOpen ? 450 : 'auto',
          }}
        >
          {/* Header Button */}
          <Button
            variant="text"
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              background: isOpen
                ? mode === 'chat'
                  ? '#0B53C0 !important'
                  : '#2E7D32 !important'
                : 'transparent !important',
              backgroundColor: isOpen
                ? mode === 'chat'
                  ? '#0B53C0 !important'
                  : '#2E7D32 !important'
                : 'transparent !important',
              color: 'white !important',
              px: 2.5,
              py: 1.5,
              borderRadius: isOpen ? '16px 16px 0 0' : '12px',
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              minWidth: 'auto',
              width: '100%',
              justifyContent: 'flex-start',
              '&:hover': {
                background:
                  mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important',
                backgroundColor:
                  mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important',
                boxShadow: isOpen
                  ? 'none'
                  : mode === 'chat'
                  ? '0px 4px 12px rgba(11, 83, 192, 0.3)'
                  : '0px 4px 12px rgba(46, 125, 50, 0.3)',
              },
              '&:active': {
                background:
                  mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important',
                backgroundColor:
                  mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important',
              },
              '&:focus': {
                background: isOpen 
                  ? (mode === 'chat' ? '#0B53C0 !important' : '#2E7D32 !important')
                  : (mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important'),
                backgroundColor: isOpen 
                  ? (mode === 'chat' ? '#0B53C0 !important' : '#2E7D32 !important')
                  : (mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important'),
              },
              '&.Mui-focusVisible': {
                background: isOpen 
                  ? (mode === 'chat' ? '#0B53C0 !important' : '#2E7D32 !important')
                  : (mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important'),
                backgroundColor: isOpen 
                  ? (mode === 'chat' ? '#0B53C0 !important' : '#2E7D32 !important')
                  : (mode === 'chat' ? '#064a9e !important' : '#1B5E20 !important'),
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {/* Icon */}
            {mode === 'chat' ? (
              <ChatIcon sx={{ fontSize: '1.5rem', color: 'white !important' }} />
            ) : (
              <TeachIcon sx={{ fontSize: '1.5rem', color: 'white !important' }} />
            )}

            {/* Text Content */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                lineHeight: 1,
                flex: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Staatliches, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mb: 0,
                  lineHeight: 1.1,
                  color: 'white !important',
                }}
              >
                {mode === 'chat' ? 'Chat with PAT' : 'Teach PAT'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Gabarito, sans-serif',
                  fontSize: '0.75rem',
                  opacity: 0.9,
                  lineHeight: 1,
                  mt: 0.2,
                  color: 'white !important',
                }}
              >
                {mode === 'chat' ? 'AI Tutor' : 'Learn by Teaching'}
              </Typography>
            </Box>

            {/* Expand/Collapse Icon */}
            {isOpen ? (
              <ExpandLess sx={{ fontSize: '1.2rem', color: 'white !important' }} />
            ) : (
              <ExpandMore sx={{ fontSize: '1.2rem', color: 'white !important' }} />
            )}
          </Button>

          {/* Chatbot Interfaces */}
          <Collapse
            in={isOpen}
            timeout={300}
            easing={{
              enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
              exit: 'cubic-bezier(0.4, 0, 0.6, 1)',
            }}
          >
            <Box
              sx={{
                background: 'white',
                borderRadius: '0 0 16px 16px',
                overflow: 'hidden',
              }}
            >
              <ErrorBoundary>
                {/* Chat Mode */}
                <Box style={panelStyle(mode === 'chat')}>
                  <ChatbotInterface
                    ref={chatbotRef}
                    chatbotId={chatbotId}
                    onConversationStart={handleConversationStart}
                    enableGuidedQuestions={enableGuidedQuestions}
                    onSwitchToLearn={showModeSwitch ? handleSwitchToTeach : undefined}
                    isActive={mode === 'chat'}
                  />
                </Box>

                {/* Teach Mode */}
                <Box style={panelStyle(mode === 'teach')}>
                  {isLoadingSessions ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 400,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Loading your teach sessions...
                      </Typography>
                    </Box>
                  ) : (
                    <TeachModeInterface
                      ref={teachRef}
                      chatbotId={chatbotId}
                      sessionIds={savedSessionIds}
                      initialSessionId={selectedSessionId || undefined}
                      onSessionStart={handleSessionStart}
                      onSwitchToChat={showModeSwitch ? handleSwitchToChat : undefined}
                      isActive={mode === 'teach'}
                      showRestartButton={true}
                    />
                  )}
                </Box>
              </ErrorBoundary>
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  }
);

ChatbotWithTeachMode.displayName = 'ChatbotWithTeachMode';

export default ChatbotWithTeachMode;
