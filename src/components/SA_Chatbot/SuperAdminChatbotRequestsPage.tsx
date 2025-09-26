// src/components/SA_Chatbot/SuperAdminChatbotRequestsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { getFirestore, collection, addDoc, getDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ChatbotRequest } from '../../types/chatbot'; // Import proper type
import { PageHeader } from '../common';
import { colors, spacing } from '../../config/designSystem';
import ModernSuperAdminChatbotRequestsTableImproved from './ModernSuperAdminChatbotRequestsTableImproved';


const SuperAdminChatbotRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ChatbotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatbotIdMap, setChatbotIdMap] = useState<{ [key: string]: string }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  useEffect(() => {
    const fetchRequests = async () => {
      const db = getFirestore();
      const requestsRef = collection(db, 'chatbotRequests');

      try {
        const querySnapshot = await getDocs(requestsRef);
        const requestsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as ChatbotRequest));
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching chatbot requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApproveRequest = async (requestId: string) => {
    const chatbotId = chatbotIdMap[requestId];
    if (!chatbotId) {
      setSnackbarMessage('Please assign a Chatbot ID before approving the request.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
  
    try {
      const db = getFirestore();
      const requestRef = doc(db, 'chatbotRequests', requestId);
      const requestSnapshot = await getDoc(requestRef);
  
      if (!requestSnapshot.exists()) {
        setSnackbarMessage('Request not found. Please refresh the page.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
  
      const requestData = requestSnapshot.data();
  
      if (requestData.status !== 'pending') {
        setSnackbarMessage('This request has already been processed.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }
  
      // Update the request document with approved status and chatbotId
      await updateDoc(requestRef, {
        status: 'approved',
        chatbotId,
      });
  
      // Create a new chatbot document
      const chatbotData = {
        chatbotId,
        title: requestData.title,
        courseId: {
          id: requestData.courseId,
          number: requestData.courseNumber,
          title: requestData.courseTitle,
        },
        material: {
          id: requestData.materialId || null,
          title: requestData.materialTitle || 'N/A',
        },
        createdBy: requestData.educatorId,
        files: requestData.files,
        timestamp: new Date().toISOString(),
      };
  
      await addDoc(collection(db, 'chatbots'), chatbotData);
  
      // Update the requests state
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId
            ? { ...req, status: 'approved', chatbotId }
            : req
        )
      );
  
      setSnackbarMessage('Chatbot request approved and chatbot created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error approving chatbot request or creating chatbot:', error);
      setSnackbarMessage('Failed to approve the request and create the chatbot. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };    

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };


  const handleChatbotIdChange = (id: string, value: string) => {
    setChatbotIdMap((prev) => ({ ...prev, [id]: value }));
  };

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
    <Box sx={{ 
      p: spacing[6], 
      backgroundColor: colors.background.primary, 
      minHeight: '100vh' 
    }}>
      <PageHeader title="Chatbot Requests Management" />

      <Typography 
        variant="body1" 
        sx={{ 
          mb: spacing[4],
          color: colors.text.secondary,
        }}
      >
        Manage chatbot requests submitted by educators. Approve requests and assign Chatbot IDs.
      </Typography>

      <ModernSuperAdminChatbotRequestsTableImproved
        requests={requests}
        loading={loading}
        onApprove={handleApproveRequest}
        chatbotIdMap={chatbotIdMap}
        onChatbotIdChange={handleChatbotIdChange}
      />

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminChatbotRequestsPage;