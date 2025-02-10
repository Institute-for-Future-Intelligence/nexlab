// src/components/CourseManagement/DeleteCourse.tsx

import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { getFirestore, doc, getDocs, collection, writeBatch } from 'firebase/firestore';

import { useUser } from '../../contexts/UserContext';

interface DeleteCourseProps {
  selectedCourse: string;
  onCourseDelete: () => void; // Callback to refresh data
}

const DeleteCourse: React.FC<DeleteCourseProps> = ({ selectedCourse, onCourseDelete }) => {
  const [open, setOpen] = useState(false);

  const db = getFirestore();
  const { refreshUserDetails } = useUser();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    if (!selectedCourse) return;
  
    try {
      const batch = writeBatch(db);
  
      // Step 1: Delete the course document
      const courseRef = doc(db, 'courses', selectedCourse);
      batch.delete(courseRef);
  
      // Step 2: Query all users who have this course in their `classes` field
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef); // Retrieve all users
  
      // Step 3: Remove the course from each user's `classes`
      usersSnapshot.forEach((userDoc) => {
        const userRef = doc(db, 'users', userDoc.id);
        const userClasses = userDoc.data().classes || {}; // Safeguard for missing `classes` field
  
        // Check if the user has the course in `classes`
        if (userClasses && userClasses[selectedCourse]) {
          delete userClasses[selectedCourse];
          batch.update(userRef, { classes: userClasses });
        }
      });
  
      // Step 4: Commit the batch
      await batch.commit();
  
      // Step 5: Refresh data and close dialog
      await refreshUserDetails(); // Refresh the logged-in user's data
      onCourseDelete(); // Refresh parent data
      handleClose();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };  

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          fontFamily: 'Staatliches, sans-serif',
          fontSize: '1rem',
          backgroundColor: '#F44336',
          color: '#FFFFFF',
          borderRadius: 1,
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.3s ease, transform 0.3s ease',
          '&:hover': {
            backgroundColor: '#D32F2F',
            transform: 'scale(1.03)',
          },
        }}
      >
        Delete Course
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this course? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeleteCourse;