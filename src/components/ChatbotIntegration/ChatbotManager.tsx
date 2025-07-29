// src/components/ChatbotIntegration/ChatbotManager.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import ChatbotWrapper from './ChatbotWrapper';
import { useSearchParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const DEFAULT_CHATBOT_ID = import.meta.env.VITE_CHATBOT_DEFAULT_ID;

const ChatbotManager: React.FC = () => {
  const [selectedChatbotId, setSelectedChatbotId] = useState<string>(DEFAULT_CHATBOT_ID);
  const [searchParams] = useSearchParams();
  const chatbotRef = useRef<{ endConversation: () => void } | null>(null);

  useEffect(() => {
    const materialId = searchParams.get('material');

    if (!materialId) {
      if (selectedChatbotId !== DEFAULT_CHATBOT_ID) {
        setSelectedChatbotId(DEFAULT_CHATBOT_ID);
      }
      return; // Exit early to prevent unnecessary API calls
    }

    const fetchChatbotForMaterial = async () => {
      console.log("Fetching chatbot ID for material:", materialId);
      const db = getFirestore();
      const chatbotsRef = collection(db, 'chatbots');
      const q = query(chatbotsRef, where('material.id', '==', materialId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const chatbot = querySnapshot.docs[0].data();
        console.log("Found chatbot ID:", chatbot.chatbotId);

        // Ensure previous chatbot session ends
        if (chatbot.chatbotId !== selectedChatbotId) {
          chatbotRef.current?.endConversation();
        }

        setSelectedChatbotId(chatbot.chatbotId);
      } else {
        console.log("No chatbot found for material, using default.");
        setSelectedChatbotId(DEFAULT_CHATBOT_ID);
      }
    };

    fetchChatbotForMaterial();
  }, [searchParams, selectedChatbotId]);

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1100 }}>
      <ChatbotWrapper ref={chatbotRef} chatbotId={selectedChatbotId} />
    </Box>
  );
};

export default ChatbotManager;