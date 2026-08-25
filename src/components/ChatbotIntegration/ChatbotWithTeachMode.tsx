// src/components/ChatbotIntegration/ChatbotWithTeachMode.tsx

import { useImperativeHandle, forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import { ChatbotInterface, TeachModeInterface } from 'chatbot-interface-ifi';
import { doc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firestore';
import ErrorBoundary from './ErrorBoundary';
import { useUser } from '../../hooks/useUser';
import { Box, Button, Typography } from '@mui/material';
import { Chat as ChatIcon, School as TeachIcon, ExpandLess } from '@mui/icons-material';

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

type PanelMode = 'chat' | 'teach';

/**
 * Dual-mode wrapper around chatbot-interface-ifi's ChatbotInterface (Chat) and
 * TeachModeInterface (Learn).
 *
 * Integration contract of chatbot-interface-ifi >= 1.8 (mirrors the package
 * author's own dual-mode embed):
 * - Each interface owns its open/closed state and renders its panel as a
 *   position:fixed overlay with its own header close (X) button. Do NOT wrap
 *   it in a Collapse or gate it with a persistent `isActive` — `isActive`
 *   makes the panel unconditionally visible, which is what broke closing.
 * - `isActive` is meant as a one-tick pulse: set it to the target mode when
 *   switching so that panel auto-opens, then reset it so the widget's own
 *   controls take over again.
 * - When closed, the widget renders `customToggleButton` (our branded button)
 *   and toggles itself when that button is clicked.
 */
const ChatbotWithTeachMode = forwardRef<ChatbotWithTeachModeRef, ChatbotWithTeachModeProps>(
  ({ chatbotId, enableGuidedQuestions = false, showModeSwitch = true }, ref) => {
    const { userDetails } = useUser();
    const chatbotRef = useRef<{ endConversation: () => void } | null>(null);
    const teachRef = useRef<{ createNewSession: () => void } | null>(null);

    const [mode, setMode] = useState<PanelMode>('chat');
    // One-tick activation pulse (see contract above). null = widgets self-manage.
    const [activePulse, setActivePulse] = useState<PanelMode | null>(null);
    const [savedSessionIds, setSavedSessionIds] = useState<string[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    // Reset the activation pulse right after it has been applied
    useEffect(() => {
      if (!activePulse) return;
      const timer = window.setTimeout(() => setActivePulse(null), 0);
      return () => window.clearTimeout(timer);
    }, [activePulse]);

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
        setSelectedSessionId((prev) => prev || newSessionId);
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

    // Mode switching handlers: change the visible panel and pulse it open
    const handleSwitchToTeach = useCallback(() => {
      console.log('Switching to Teach mode');
      setMode('teach');
      setActivePulse('teach');
    }, []);

    const handleSwitchToChat = useCallback(() => {
      console.log('Switching to Chat mode');
      setMode('chat');
      setActivePulse('chat');
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
    const panelStyle = (visible: boolean) => ({
      display: visible ? 'block' : 'none',
    });

    // Branded launcher shown by the widget while its panel is closed.
    // The widget wraps it in its own click handler, so no onClick here.
    const toggleButton = (kind: PanelMode) => {
      const color = kind === 'chat' ? '#0B53C0' : '#2E7D32';
      const hover = kind === 'chat' ? '#064a9e' : '#1B5E20';
      const shadow =
        kind === 'chat' ? '0px 4px 12px rgba(11, 83, 192, 0.3)' : '0px 4px 12px rgba(46, 125, 50, 0.3)';
      return (
        <Button
          variant="text"
          component="div"
          sx={{
            background: `${color} !important`,
            backgroundColor: `${color} !important`,
            color: 'white !important',
            px: 2.5,
            py: 1.5,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            textTransform: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 'auto',
            justifyContent: 'flex-start',
            '&:hover': {
              background: `${hover} !important`,
              backgroundColor: `${hover} !important`,
              boxShadow: shadow,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {kind === 'chat' ? (
            <ChatIcon sx={{ fontSize: '1.5rem', color: 'white !important' }} />
          ) : (
            <TeachIcon sx={{ fontSize: '1.5rem', color: 'white !important' }} />
          )}
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
              {kind === 'chat' ? 'Chat with PAT' : 'Learn with PAT'}
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
              {kind === 'chat' ? 'AI Tutor' : 'Learn by Teaching'}
            </Typography>
          </Box>
          <ExpandLess sx={{ fontSize: '1.2rem', color: 'white !important' }} />
        </Button>
      );
    };

    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
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
              isActive={activePulse === 'chat'}
              customToggleButton={toggleButton('chat')}
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
                  px: 2.5,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
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
                isActive={activePulse === 'teach'}
                customToggleButton={toggleButton('teach')}
                showRestartButton={true}
              />
            )}
          </Box>
        </ErrorBoundary>
      </Box>
    );
  }
);

ChatbotWithTeachMode.displayName = 'ChatbotWithTeachMode';

export default ChatbotWithTeachMode;
