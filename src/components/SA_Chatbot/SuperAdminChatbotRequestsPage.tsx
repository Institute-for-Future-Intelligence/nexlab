// src/components/SA_Chatbot/SuperAdminChatbotRequestsPage.tsx
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
  Button,
  TextField,
  Snackbar,
  Alert,
  TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, getDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

import FileDownload from '../Chatbot/FileDownload'; // Import FileDownload component

const SuperAdminChatbotRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatbotIdMap, setChatbotIdMap] = useState<{ [key: string]: string }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const db = getFirestore();
      const requestsRef = collection(db, 'chatbotRequests');

      try {
        const querySnapshot = await getDocs(requestsRef);
        const requestsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    <Box className="profile-container" sx={{ p: 4 }}>
      {/* Back to Home Button */}
      <Button variant="text" onClick={() => navigate('/')} className="profile-button">
        &larr; Home Page
      </Button>

      <Typography variant="h5" className="webpage_title" sx={{ mb: 2 }}>
        Chatbot Requests Management
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Manage chatbot requests submitted by educators. Approve requests and assign Chatbot IDs.
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Course</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Material</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Educator ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Course ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Material ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Submitted On</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>File Links</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Chatbot ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8E8E8', color: '#12372A' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((request, index) => (
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
                <TableCell>{request.educatorId}</TableCell>
                <TableCell>{request.courseId}</TableCell>
                <TableCell>{request.materialId || 'N/A'}</TableCell>
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
                  {request.files?.length ? (
                    request.files.map((file: string, idx: number) => (
                      <FileDownload key={idx} filePath={file} fileLabel={`File ${idx + 1}`} />
                    ))
                  ) : (
                    <Typography variant="body2">No files uploaded</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {request.status === 'approved' ? (
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {request.chatbotId}
                    </Typography>
                  ) : (
                    <TextField
                      size="small"
                      value={chatbotIdMap[request.id] || ''}
                      onChange={(e) => handleChatbotIdChange(request.id, e.target.value)}
                      placeholder="Enter Chatbot ID"
                      sx={{ width: '150px' }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleApproveRequest(request.id)}
                    disabled={request.status === 'approved'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {request.status === 'approved' ? 'Approved' : 'Approve'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={requests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          aria-label="Chatbot requests pagination"
          sx={{ mt: 2 }}
        />
      </TableContainer>

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