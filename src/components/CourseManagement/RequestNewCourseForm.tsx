// src/components/UserAccount/RequestNewCourseForm.tsx
import React, { useState } from 'react';
import { Box, Typography, Grid, OutlinedInput, FormLabel, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const RequestNewCourseForm: React.FC = () => {
  const { userDetails } = useUser();

  const [courseNumber, setCourseNumber] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');
  const db = getFirestore();
  const navigate = useNavigate();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleRequestNewCourse = async () => {
    if (!courseNumber || !courseTitle || !courseDescription) {
      setDialogTitle('Error');
      setDialogContent('Please fill in all required fields.');
      setDialogOpen(true);
      return;
    }
  
    setLoading(true);
  
    try {
      const requestDoc = {
        uid: userDetails?.uid,
        courseNumber,
        courseTitle,
        courseDescription,
        status: 'pending',
        timestamp: new Date(),
      };
  
      // Add the course request document
      const courseRequestRef = await addDoc(collection(db, 'courseRequests'), requestDoc);
  
      // Add an email document to the `mail` collection to notify super-admins
      const emailDoc = {
        to: ['andriy@intofuture.org', 'dylan@intofuture.org'],
        message: {
          subject: 'New Course Request Submitted',
          html: `
            <p>A new course request has been submitted:</p>
            <p><strong>Educator ID:</strong> ${userDetails?.uid}</p>
            <p><strong>Course:</strong> ${courseNumber} - ${courseTitle}</p>
            <p><strong>Description:</strong> ${courseDescription}</p>
            <p><strong>Request ID:</strong> ${courseRequestRef.id}</p>
            <p><a href="https://institute-for-future-intelligence.github.io/nexlab/#/course-requests">
            Click here to review the request.
            </a></p>
          `,
        },
      };
      await addDoc(collection(db, 'mail'), emailDoc);
  
      setDialogTitle('Success');
      setDialogContent('Your course request has been submitted for review.');
  
      // Clear form fields
      setCourseNumber('');
      setCourseTitle('');
      setCourseDescription('');
  
      // Show success message and navigate back
      setDialogOpen(true);
      setTimeout(() => {
        navigate('/course-management');
      }, 2000);
    } catch (error) {
      console.error('Error submitting course request: ', error);
      setDialogTitle('Error');
      setDialogContent('Error submitting your course request. Please try again.');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };  

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleNavigateBack = () => {
    navigate('/course-management'); // Change back route to Course Management
  };

  return (
    <Box className="request-form-container" sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="text" onClick={handleNavigateBack} className="back-home-button">
          &larr; Course Management
        </Button>
      </Box>
      
      <Box className="request-form-outline">
        <Typography variant="h5" component="h1" className="request-form-title">
          Request Creating a New Course
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormLabel htmlFor="course-number" required>Course Number</FormLabel>
            <OutlinedInput
              id="course-number"
              name="course-number"
              value={courseNumber}
              onChange={handleInputChange(setCourseNumber)}
              placeholder="e.g., BIOL301"
              fullWidth
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormLabel htmlFor="course-title" required>Course Title</FormLabel>
            <OutlinedInput
              id="course-title"
              name="course-title"
              value={courseTitle}
              onChange={handleInputChange(setCourseTitle)}
              placeholder="e.g., Biotech Research Methods"
              fullWidth
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormLabel htmlFor="course-description" required>Course Description</FormLabel>
            <OutlinedInput
              id="course-description"
              name="course-description"
              value={courseDescription}
              onChange={handleInputChange(setCourseDescription)}
              placeholder="e.g., A comprehensive course covering advanced methods and tools in modern biotech labs, focusing on CRISPR, NGS, and bioinformatics."
              fullWidth
              multiline
              rows={4}
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRequestNewCourse} 
              fullWidth
              className="submit-button"
              disabled={loading}
              sx={{ 
                mt: 3, 
                py: 1.5, 
                fontWeight: 'bold', 
                fontSize: '16px', 
                textTransform: 'uppercase' 
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              For any questions, please contact <a href="mailto:andriy@intofuture.org">andriy@intofuture.org</a>.
            </Typography>
          </Grid>
        </Grid>

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ color: 'green', fontSize: 50, marginRight: 1 }} />
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center' }}>
              {dialogContent}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default RequestNewCourseForm;