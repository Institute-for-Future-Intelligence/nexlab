// src/components/Chatbot/ChatbotRequestPage.tsx
import React, { useEffect, useState } from 'react';
import {
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { collection, addDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import FileUpload from './FileUpload';
import { 
  FormContainer, 
  FormSection, 
  FormField, 
  FormSelect, 
  FormActions, 
  FormActionButton 
} from '../common';

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
    <FormContainer 
      title="Create a Chatbot"
      subtitle="Fill out the form below to request a chatbot. Please upload all related materials for the chatbot's knowledge base."
    >
      {/* Basic Information Section */}
      <FormSection 
        title="Basic Information"
        description="Provide the basic details for your chatbot request."
      >
        <FormField
          label="Chatbot Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter a descriptive title for your chatbot"
          helperText="Choose a clear, descriptive name that reflects the chatbot's purpose"
        />

        {/* Two-column layout for Course and Material selectors */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FormSelect
              label="Course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value as string)}
              required
              helperText="Only courses where you are an admin are available for chatbot requests."
            >
              {Object.keys(userDetails?.classes || {})
                .filter((id) => userDetails?.classes?.[id]?.isCourseAdmin)
                .map((id) => (
                  <MenuItem key={id} value={id}>
                    {userDetails?.classes?.[id]?.title || 'Untitled Course'}
                  </MenuItem>
                ))}
            </FormSelect>
          </Grid>

          <Grid item xs={12} md={9}>
            <FormSelect
              label="Material"
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value as string)}
              required
              disabled={!courseId || materialsLoading}
              helperText={
                !courseId
                  ? 'Please select a course first.'
                  : materialsError || (materialsLoading ? 'Loading materials...' : materials.length === 0 ? 'No materials available for this course.' : 'Select the primary material for your chatbot')
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
            </FormSelect>
          </Grid>
        </Grid>
      </FormSection>

      {/* File Upload Section */}
      <FormSection 
        title="Additional Materials"
        description="Upload additional files to enhance your chatbot's knowledge base. Supported formats: PDF, PPT, DOC/DOCX, TXT."
        showDivider
      >
        <FileUpload
          folderPath={`chatbotRequests/${userDetails?.uid}`}
          onUploadComplete={handleFileUploadComplete}
        />
      </FormSection>

      {/* Form Actions */}
      <FormActions align="space-between">
        <FormActionButton
          variant="text"
          onClick={handleNavigateBack}
        >
          Cancel
        </FormActionButton>
        
        <FormActionButton
          variant="primary"
          onClick={handleSubmit}
          disabled={!title || !courseId || !materialId || uploadedFileUrls.length === 0}
        >
          Submit
        </FormActionButton>
      </FormActions>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </FormContainer>
  );
};

export default ChatbotRequestPage;