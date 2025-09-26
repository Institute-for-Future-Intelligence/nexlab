// src/components/Chatbot/ChatbotRequestsDisplay.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useUser } from '../../hooks/useUser';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { ChatbotRequest } from '../../types/chatbot'; // Import proper type
import { colors, typography, spacing } from '../../config/designSystem';
import ModernChatbotRequestsTable from './ModernChatbotRequestsTable';

import FileDownload from './FileDownload'; // Import the new component

const ChatbotRequestsDisplay: React.FC = () => {
  const { userDetails } = useUser();
  const [requests, setRequests] = useState<ChatbotRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userDetails?.uid) return;
      const db = getFirestore();
      const requestsRef = collection(db, 'chatbotRequests');
      const q = query(requestsRef, where('educatorId', '==', userDetails.uid));

      try {
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        } as ChatbotRequest));
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching chatbot requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userDetails?.uid]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
        No chatbot requests found.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: spacing[6] }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: spacing[4],
          fontFamily: typography.fontFamily.display,
          fontWeight: typography.fontWeight.bold,
          color: colors.primary[500],
        }}
      >
        Your Chatbot Requests
      </Typography>
      
      <ModernChatbotRequestsTable 
        requests={requests}
        loading={loading}
      />
    </Box>
  );
};

export default ChatbotRequestsDisplay;