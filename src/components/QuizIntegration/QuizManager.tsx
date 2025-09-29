import React, { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

import QuizWrapper from './QuizWrapper';
import QuizDifficultySelector from './QuizDifficultySelector';
import { useQuizStore } from '../../stores/quizStore';
import { useUser } from '../../hooks/useUser';
import { QuizManagerProps, QuizModalRef, QuizDifficulty } from '../../types/quiz';

const DEFAULT_CHATBOT_ID = import.meta.env.VITE_CHATBOT_DEFAULT_ID;

const QuizManager: React.FC<QuizManagerProps> = ({
  defaultDifficulty = 'medium',
  position = 'fixed'
}) => {
  const { userDetails } = useUser();
  const [searchParams] = useSearchParams();
  const quizRef = useRef<QuizModalRef | null>(null);
  
  const {
    isModalOpen,
    currentChatbotId,
    currentDifficulty,
    statistics,
    openQuizModal,
    closeQuizModal,
    setDifficulty,
    fetchUserSessions,
    setError
  } = useQuizStore();

  // Determine the chatbot ID based on URL parameters or default
  const [selectedChatbotId, setSelectedChatbotId] = React.useState<string>(DEFAULT_CHATBOT_ID);

  // Fetch chatbot ID based on material context (similar to ChatbotManager)
  useEffect(() => {
    const materialId = searchParams.get('material');

    if (!materialId) {
      if (selectedChatbotId !== DEFAULT_CHATBOT_ID) {
        setSelectedChatbotId(DEFAULT_CHATBOT_ID);
      }
      return;
    }

    const fetchChatbotForMaterial = async () => {
      try {
        console.log(`🧩 Fetching chatbot ID for quiz material:`, materialId);
        const db = getFirestore();
        const chatbotsRef = collection(db, 'chatbots');
        const q = query(chatbotsRef, where('material.id', '==', materialId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const chatbot = querySnapshot.docs[0].data();
          console.log(`🧩 Found chatbot for quiz material ${materialId}:`, chatbot.chatbotId);
          setSelectedChatbotId(chatbot.chatbotId);
        } else {
          console.log(`🧩 No chatbot found for material ${materialId}, using default for quiz:`, DEFAULT_CHATBOT_ID);
          setSelectedChatbotId(DEFAULT_CHATBOT_ID);
        }
      } catch (error) {
        console.error('Failed to fetch chatbot for quiz:', error);
        setError('Failed to load quiz for this material');
        setSelectedChatbotId(DEFAULT_CHATBOT_ID);
      }
    };

    fetchChatbotForMaterial();
  }, [searchParams, selectedChatbotId, setError]);

  // Fetch user quiz sessions when user details are available (only for admins/educators)
  useEffect(() => {
    if (userDetails?.uid && (userDetails.isAdmin || userDetails.isSuperAdmin)) {
      fetchUserSessions(userDetails.uid);
    }
  }, [userDetails?.uid, userDetails?.isAdmin, userDetails?.isSuperAdmin, fetchUserSessions]);

  // Set default difficulty
  useEffect(() => {
    setDifficulty(defaultDifficulty);
  }, [defaultDifficulty, setDifficulty]);

  // Handle opening quiz modal with selected difficulty
  const handleOpenQuiz = useCallback((difficulty: QuizDifficulty) => {
    if (selectedChatbotId) {
      openQuizModal(selectedChatbotId, difficulty);
    } else {
      setError('No chatbot available for quiz');
    }
  }, [selectedChatbotId, openQuizModal, setError]);

  // Handle closing quiz modal
  const handleCloseQuiz = useCallback(() => {
    closeQuizModal();
  }, [closeQuizModal]);

  // Don't render if user is not logged in
  if (!userDetails?.uid) {
    return null;
  }

  // Only render quiz on material pages (when material query parameter exists)
  const materialId = searchParams.get('material');
  if (!materialId) {
    return null;
  }

  const fabStyle = position === 'fixed' 
    ? { 
        position: 'fixed', 
        bottom: 120, // Above the chatbot button
        right: 16, 
        zIndex: 1000 
      }
    : { 
        position: 'relative' 
      };

  return (
    <>
      {/* Quiz Difficulty Selector */}
      <Box sx={fabStyle}>
        <QuizDifficultySelector
          onStartQuiz={handleOpenQuiz}
          disabled={!selectedChatbotId}
        />
      </Box>

      {/* Quiz Modal */}
      {isModalOpen && currentChatbotId && (
        <QuizWrapper
          ref={quizRef}
          chatbotId={currentChatbotId}
          difficulty={currentDifficulty}
          open={isModalOpen}
          onClose={handleCloseQuiz}
          eventHandlers={{
            onQuizStart: (data) => {
              // Quiz started - could trigger analytics, etc.
            },
            onQuizSubmit: (result) => {
              // Quiz submitted - could trigger notifications, analytics, etc.
            },
            onError: (error, phase) => {
              console.error('Quiz error:', phase, error);
            }
          }}
        />
      )}
    </>
  );
};

export default QuizManager;
