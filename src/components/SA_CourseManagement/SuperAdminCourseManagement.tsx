// src/components/SA_CourseManagement/SuperAdminCourseManagement.tsx

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, writeBatch, getDoc, Timestamp } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Snackbar, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField,
} from '@mui/material';
import { PageHeader } from '../common';
import { colors, spacing } from '../../config/designSystem';
import ModernSuperAdminCourseTable from './ModernSuperAdminCourseTable';

interface Course {
  id: string;
  title: string;
  number: string;
  courseAdmin: string[];
  createdAt?: Date;
  courseCreatedAt?: Date;
  timestamp?: Date;
}

const SuperAdminCourseManagement: React.FC = () => {
  const db = getFirestore();
  const { userDetails } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [confirmUserId, setConfirmUserId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Helper function to convert Firestore timestamp to Date
          const convertTimestamp = (timestamp: any): Date | undefined => {
            if (!timestamp) return undefined;
            if (timestamp instanceof Date) return timestamp;
            if (timestamp instanceof Timestamp) return timestamp.toDate();
            if (timestamp.seconds) return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();
            return undefined;
          };

          return {
            id: doc.id,
            title: data.title || 'Untitled',
            number: data.number || 'N/A',
            courseAdmin: data.courseAdmin || [],
            createdAt: convertTimestamp(data.createdAt),
            courseCreatedAt: convertTimestamp(data.courseCreatedAt),
            timestamp: convertTimestamp(data.timestamp)
          } as Course;
        });

        // Sort courses by creation date (newest first)
        const sortedCourses = coursesList.sort((a, b) => {
          const dateA = a.courseCreatedAt || a.createdAt || a.timestamp;
          const dateB = b.courseCreatedAt || b.createdAt || b.timestamp;
          
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          return dateB.getTime() - dateA.getTime();
        });

        setCourses(sortedCourses);
      } catch (error) {
        console.error('Error fetching courses: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [db]);

  const handleAddSuperAdmin = async (courseId: string) => {
    if (!userDetails) {
      showSnackbar('User details are not available.', 'error');
      return;
    }

    const courseData = courses.find(course => course.id === courseId);
    if (courseData && userDetails) {
      try {
        if (courseData.courseAdmin.includes(userDetails.uid)) {
          showSnackbar('You are already an admin for this course.', 'warning');
          return;
        }

        // Update courseAdmin array in the course document
        const courseRef = doc(db, 'courses', courseId);
        const updatedAdmins = [...courseData.courseAdmin, userDetails.uid];
        await updateDoc(courseRef, { courseAdmin: updatedAdmins });

        // Get course creation date from the course document
        const courseDoc = await getDoc(courseRef);
        const courseDocData = courseDoc.exists() ? courseDoc.data() : null;
        const courseCreatedAt = courseDocData?.courseCreatedAt || courseDocData?.createdAt || courseDocData?.timestamp || new Date();

        // Update user's classes field in the user document
        const userRef = doc(db, 'users', userDetails.uid);
        await updateDoc(userRef, {
          [`classes.${courseId}`]: {
            number: courseData.number,
            title: courseData.title,
            isCourseAdmin: true, // Explicitly set the admin status
            courseCreatedAt: courseCreatedAt, // When the course was originally created
            enrolledAt: new Date(), // When the SA was added to this course
          }
        });

        setCourses(courses.map(course =>
          course.id === courseId ? { ...course, courseAdmin: updatedAdmins } : course
        ));
        showSnackbar('You have been successfully added as an admin to this course.', 'success');
      } catch (error) {
        console.error('Error adding super-admin to course: ', error);
        showSnackbar('Failed to add admin to course.', 'error');
      }
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setDialogOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (userDetails && confirmUserId === userDetails.uid) {
      const courseData = courses.find(course => course.id === selectedCourseId);
      if (courseData && courseData.courseAdmin.includes(userDetails.uid)) {
        try {
          // Delete the course document
          await deleteDoc(doc(db, 'courses', selectedCourseId));

          // Remove the course from all users' classes object
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const batch = writeBatch(db);

          usersSnapshot.forEach((userDoc) => {
            const userRef = doc(db, 'users', userDoc.id);
            const userData = userDoc.data();
            const updatedClasses = { ...userData.classes };
            delete updatedClasses[selectedCourseId];
            batch.update(userRef, { classes: updatedClasses });
          });

          await batch.commit(); // Commit the batch operation

          setCourses(courses.filter(course => course.id !== selectedCourseId));
          showSnackbar('Course deleted successfully.', 'success');
        } catch (error) {
          console.error('Error deleting course: ', error);
          showSnackbar('Failed to delete course.', 'error');
        } finally {
          setDialogOpen(false);
          setConfirmUserId('');
        }
      } else {
        showSnackbar('You are not authorized to delete this course.', 'warning');
        setDialogOpen(false);
      }
    } else {
      showSnackbar('User ID does not match. Please try again.', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setConfirmUserId('');
  };


  return (
    <Box sx={{ 
      p: spacing[6], 
      backgroundColor: colors.background.primary, 
      minHeight: '100vh' 
    }}>
      <PageHeader title="Super Admin Course Management" />
      
      <Typography 
        variant="body1" 
        sx={{ 
          mb: spacing[4],
          color: colors.text.secondary,
        }}
      >
        Manage all courses in the system. Add yourself as an instructor or delete courses you manage.
      </Typography>

      <ModernSuperAdminCourseTable
        courses={courses}
        loading={loading}
        onAddSuperAdmin={handleAddSuperAdmin}
        onDeleteCourse={handleDeleteCourse}
        userUid={userDetails?.uid}
      />
      {/* Snackbar for Notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialog for Deleting a Course */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To confirm the deletion of this course, please enter your User ID:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="userId"
            label="User ID"
            type="text"
            fullWidth
            variant="outlined"
            value={confirmUserId}
            onChange={(e) => setConfirmUserId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteCourse} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminCourseManagement;