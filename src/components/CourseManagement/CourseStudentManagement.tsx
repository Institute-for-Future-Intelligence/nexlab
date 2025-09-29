// src/components/CourseStudentManagement.tsx

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { getFirestore, doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

// Update interface to include course details
interface CourseStudentManagementProps {
  selectedCourse: string;
  selectedCourseDetails: { number: string; title: string } | null; // Add course details prop
  onStudentChange: () => void; // Callback to refresh the student list
}

const CourseStudentManagement: React.FC<CourseStudentManagementProps> = ({ selectedCourse, selectedCourseDetails, onStudentChange }) => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const db = getFirestore();

  const handleStudentUpdate = async () => {
    if (!studentId || !selectedCourse) {
      setMessage('Please enter a Student ID and select a course.');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', studentId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const enrolledClasses = userData.classes || {};

        if (selectedCourse in enrolledClasses) {
          // Open the confirmation dialog
          setConfirmDialogOpen(true);
        } else {
          setMessage(`Student ${studentId} is not enrolled in course ${selectedCourseDetails?.number || selectedCourse}, cannot remove.`);
          setOpenSnackbar(true);
        }
      } else {
        setMessage(`Student ${studentId} does not exist.`);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error checking student course:', error);
      setMessage('Error checking student course.');
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  const confirmRemoval = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', studentId);
      // Remove the course from the student's classes
      await updateDoc(userRef, { [`classes.${selectedCourse}`]: deleteField() });
      setMessage(`Student ${studentId} removed from course ${selectedCourseDetails?.number || selectedCourse}.`);
      setStudentId(''); // Clear the Student ID input field
      onStudentChange(); // Refresh the student list
    } catch (error) {
      console.error('Error updating student course:', error);
      setMessage('Error updating student course.');
    }
    setLoading(false);
    setOpenSnackbar(true);
    setConfirmDialogOpen(false); // Close the confirmation dialog
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCancelRemoval = () => {
    setConfirmDialogOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <TextField
          label="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          fullWidth
          required
          margin="normal"
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleStudentUpdate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Remove'}
        </Button>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="info">
          {message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelRemoval}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to remove the student from the course? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemoval} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemoval} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseStudentManagement;