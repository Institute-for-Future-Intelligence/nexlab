// src/components/Chatbot/ChatbotRequestPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { collection, addDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import FileUpload from './FileUpload';

import { useMaterialsStore } from '../../stores/materialsStore';

const ChatbotRequestPage: React.FC = () => {
  const { userDetails } = useUser();
  const navigate = useNavigate();
  const db = getFirestore();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { materials, loading: materialsLoading, error: materialsError, fetchMaterials } = useMaterialsStore();

  useEffect(() => {
    setMaterialId(''); // Reset materialId whenever courseId changes
    if (courseId) {
      fetchMaterials(courseId);
    }
  }, [courseId, fetchMaterials]);

  const handleFileUploadComplete = (newFileUrls: string[]) => {
    setUploadedFileUrls((prevUrls) => [...prevUrls, ...newFileUrls]); // Append new URLs to existing state
  };  

  const handleSubmit = async () => {
    if (!title || !courseId || !materialId || uploadedFileUrls.length === 0) {
      setSnackbarMessage('Please fill all required fields and upload at least one file.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Retrieve course details
    const selectedCourse = userDetails?.classes?.[courseId];

    // Blocks unauthorized chatbot requests at the API level.
    if (!selectedCourse || !selectedCourse.isCourseAdmin) {
      setSnackbarMessage('You are not authorized to request a chatbot for this course.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const courseNumber = selectedCourse?.number ?? 'N/A';
    const courseTitle = selectedCourse?.title ?? 'Untitled Course';

    // Retrieve material details
    const selectedMaterial = materials.find((material) => material.id === materialId);
    if (!selectedMaterial) {
      setSnackbarMessage('Selected material details could not be found.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const { title: materialTitle } = selectedMaterial;

    try {
      const chatbotRequestRef = await addDoc(collection(db, 'chatbotRequests'), {
        educatorId: userDetails?.uid,
        courseId,
        courseNumber,
        courseTitle,
        materialId,
        materialTitle,
        title,
        files: uploadedFileUrls,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      // Create email notification
      await addDoc(collection(db, 'mail'), {
        to: ['andriy@intofuture.org', 'dylan@intofuture.org'],
        message: {
          subject: 'New Chatbot Request Submitted',
          html: `
            <p>A new chatbot request has been submitted:</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Educator ID:</strong> ${userDetails?.uid}</p>
            <p><strong>Course:</strong> ${courseNumber} - ${courseTitle}</p>
            <p><strong>Material:</strong> ${materialTitle}</p>
            <p><strong>Request ID:</strong> ${chatbotRequestRef.id}</p>
            <p><a href="https://institute-for-future-intelligence.github.io/nexlab/super-admin-chatbot-requests">
            Click here to review the request.
            </a></p>
          `,
        },
      });

      setSnackbarMessage('Chatbot request submitted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
  
      setTimeout(() => navigate('/chatbot-management'), 1500);
    } catch (error) {
      console.error('Error submitting chatbot request:', error);
      setSnackbarMessage('Failed to submit the chatbot request. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleNavigateBack = () => {
    navigate('/chatbot-management');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box className="profile-container" sx={{ p: 4 }}>
      <Typography className="webpage_title" sx={{ mb: 2 }}>
        Request to Create a Chatbot
      </Typography>

      <Typography variant="body1" className="profile-text" sx={{ mb: 3 }}>
        Fill out the form below to request a chatbot. Please upload all related materials for the chatbot&apos;s knowledge base.
      </Typography>

      <TextField
        label="Chatbot Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        margin="normal"
        required
        className="form-field"
      />

      <TextField
        label="Course ID"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        fullWidth
        margin="normal"
        required
        select
        helperText="Only courses where you are an admin are available for chatbot requests."
        className="form-field"
      >
        {Object.keys(userDetails?.classes || {})
          .filter((id) => userDetails?.classes?.[id]?.isCourseAdmin) // Ensure only courses where the educator is an admin are selectable
          .map((id) => (
            <MenuItem key={id} value={id}>
              {userDetails?.classes?.[id]?.title || 'Untitled Course'}
            </MenuItem>
          ))}
      </TextField>

      <TextField
        label="Material"
        value={materialId}
        onChange={(e) => setMaterialId(e.target.value)}
        fullWidth
        margin="normal"
        required
        select
        disabled={!courseId || materialsLoading}
        helperText={
          !courseId
            ? 'Please select a course first.'
            : materialsError || (materialsLoading ? 'Loading materials...' : materials.length === 0 ? 'No materials available for this course.' : '')
        }
      >
        {!courseId ? (
          <MenuItem disabled>Please select a course first</MenuItem>
        ) : materialsLoading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ marginRight: 2 }} />
            Loading...
          </MenuItem>
        ) : materials.length === 0 ? (
          <MenuItem disabled>No materials found</MenuItem>
        ) : (
          materials.map((material) => (
            <MenuItem key={material.id} value={material.id}>
              {material.title}
            </MenuItem>
          ))
        )}
      </TextField>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body1" className="profile-text" sx={{ mb: 2 }}>
          Upload your files below (PDF, PPT, DOC/DOCX, TXT formats only):
        </Typography>
        <FileUpload
          folderPath={`chatbotRequests/${userDetails?.uid}`}
          onUploadComplete={handleFileUploadComplete}
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ mt: 4 }}
        className="submit-button"
      >
        Submit Request
      </Button>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatbotRequestPage;