// src/components/CourseManagement/EditCourseDetails.tsx

import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

import { useUser } from '../../contexts/UserContext';

interface EditCourseDetailsProps {
  selectedCourse: string;
  selectedCourseDetails: { number: string; title: string } | null;
  onCourseUpdate: () => void; // Callback to refresh data
}

const EditCourseDetails: React.FC<EditCourseDetailsProps> = ({ selectedCourse, selectedCourseDetails, onCourseUpdate }) => {
  const [open, setOpen] = useState(false);
  const [courseNumber, setCourseNumber] = useState('');
  const [courseTitle, setCourseTitle] = useState('');

  const db = getFirestore();
  const { userDetails, refreshUserDetails } = useUser();
  
  // Open the dialog and populate the fields with the current course details
  const handleOpen = () => {
    if (selectedCourseDetails) {
      setCourseNumber(selectedCourseDetails.number || '');
      setCourseTitle(selectedCourseDetails.title || '');
    }
    setOpen(true);
  };

  // Close dialog and reset state
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCourseNumber('');
    setCourseTitle('');
  };

  const handleSave = async () => {
    if (!selectedCourse || !userDetails?.uid) {
      console.error('Selected course or user details are missing.');
      return;
    }

    try {
      const courseRef = doc(db, 'courses', selectedCourse);

      // Update the course document
      await updateDoc(courseRef, {
        number: courseNumber,
        title: courseTitle,
      });

      // Update the user's classes field
      const userRef = doc(db, 'users', userDetails.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (userData.classes && userData.classes[selectedCourse]) {
          const existingCourseData = userData.classes[selectedCourse];
          const updatedClasses = {
            ...userData.classes,
            [selectedCourse]: {
              ...existingCourseData,
              number: courseNumber,
              title: courseTitle,
            },
          };

          await updateDoc(userRef, { classes: updatedClasses });
        }
      }

      await refreshUserDetails();
      onCourseUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={{
          fontFamily: 'Staatliches, sans-serif',
          fontSize: '1rem',
          backgroundColor: '#4CAF50',
          color: '#FFFFFF',
          borderRadius: 1,
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.3s ease, transform 0.3s ease',
          '&:hover': {
            backgroundColor: '#388E3C',
            transform: 'scale(1.03)',
          },
        }}
      >
        Edit Course Details
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Course Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Course Number"
            value={courseNumber}
            onChange={(e) => setCourseNumber(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Course Title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!courseNumber || !courseTitle}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditCourseDetails;