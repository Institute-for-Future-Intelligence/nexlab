// src/components/Chatbot/ChatbotRequestsDisplay.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useUser } from '../../hooks/useUser';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { ChatbotRequest } from '../../types/chatbot'; // Import proper type

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
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Your Chatbot Requests
      </Typography>
      <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>
                Title
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>
                Course
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>
                Material
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>
                Submitted On
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>
                File Links
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request, index) => (
              <TableRow
                key={request.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#F6E9B2' : '#FBFADA',
                  '&:hover': { backgroundColor: '#E8E8E8' },
                }}
              >
                <TableCell>{request.title}</TableCell>
                <TableCell>{`${request.courseNumber} - ${request.courseTitle}`}</TableCell>
                <TableCell>{request.materialTitle || 'N/A'}</TableCell>
                <TableCell>{new Date(request.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: request.status === 'pending' ? '#FFA726' : '#43A047',
                      fontWeight: 'bold',
                    }}
                  >
                    {request.status}
                  </Typography>
                </TableCell>
                <TableCell>
                  {request.files.map((file: string, index: number) => (
                    <FileDownload
                      key={index}
                      filePath={file}
                      fileLabel={`File ${index + 1}`}
                    />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ChatbotRequestsDisplay;