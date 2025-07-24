// src/components/SA_CourseManagement/SuperAdminCourseManagement.tsx

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Snackbar, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Course {
  id: string;
  title: string;
  number: string;
  courseAdmin: string[];
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
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            number: data.number || 'N/A',
            courseAdmin: data.courseAdmin || []
          } as Course;
        });
        setCourses(coursesList);
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

        // Update user's classes field in the user document
        const userRef = doc(db, 'users', userDetails.uid);
        await updateDoc(userRef, {
          [`classes.${courseId}`]: {
            number: courseData.number,
            title: courseData.title,
            isCourseAdmin: true, // Explicitly set the admin status
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

  const handleNavigateHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button variant="text" onClick={handleNavigateHome} sx={{ mr: 2 }}>
          &larr; Home Page
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom>Super Admin Course Management</Typography>
      {loading ? (
        <Typography>Loading courses...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="courses table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Course ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Course Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Course Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Instructors</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map(course => {
                const isCourseAdmin = !!userDetails?.uid && course.courseAdmin.includes(userDetails.uid);

                return (
                  <TableRow key={course.id} sx={{ backgroundColor: isCourseAdmin ? '#e0f7fa' : 'transparent' }}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.number}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.courseAdmin.length > 0 ? course.courseAdmin.join(', ') : 'No admins assigned'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Add yourself as an instructor">
                        <span>
                          <IconButton 
                            edge="end" 
                            aria-label="add" 
                            onClick={() => handleAddSuperAdmin(course.id)}
                            disabled={isCourseAdmin} 
                          >
                            <AddIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isCourseAdmin ? "Delete this course" : "You are not authorized to delete this course"}>
                        <span>
                          <IconButton 
                            edge="end" 
                            aria-label="delete" 
                            onClick={() => handleDeleteCourse(course.id)} 
                            disabled={!isCourseAdmin} 
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
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