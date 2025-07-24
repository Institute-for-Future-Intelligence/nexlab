// src/components/UserAccount/RetrieveCoursePasscode.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, MenuItem, Snackbar, Alert, Grid } from '@mui/material';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '../../contexts/UserContext';

import CopyToClipboard from './CopyToClipboard'; // Adjust the path as necessary

const RetrieveCoursePasscode: React.FC = () => {
  const { userDetails } = useUser();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<{ id: string; number: string; title: string; passcode: string }[]>([]);
  const [passcode, setPasscode] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const db = getFirestore();

  useEffect(() => {
    const fetchCourses = async () => {
      if (userDetails?.isAdmin) {
        const q = query(collection(db, 'courses'), where('courseAdmin', 'array-contains', userDetails.uid));
        const querySnapshot = await getDocs(q);
        const fetchedCourses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          number: doc.data().number as string,
          title: doc.data().title as string,
          passcode: doc.data().passcode as string,
        })) as { id: string; number: string; title: string; passcode: string }[];        
        setCourses(fetchedCourses);
      }
    };

    fetchCourses();
  }, [db, userDetails]);

  const handleCourseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const courseId = event.target.value;
    setSelectedCourse(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setPasscode(course.passcode);
      setSnackbarMessage(`Passcode for course "${course.number} - ${course.title}" retrieved successfully.`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } else {
      setPasscode(null);
      setSnackbarMessage('Course not found.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" component="h2" sx={{ mb: 2 }}>
        Retrieve Course Passcode
      </Typography>
      <Grid container spacing={2} sx={{ maxWidth: '75%' }}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            select
            label="Select Course Number"
            value={selectedCourse}
            onChange={handleCourseChange}
            fullWidth
            sx={{ mb: 2, mr: 2 }} // Added right margin here
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {`${course.number} - ${course.title}`}
              </MenuItem>                        
            ))}
          </TextField>
          {passcode && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Passcode:
              </Typography>
              <CopyToClipboard text={`${passcode}`} />
            </Box>
          )}
        </Grid>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );  
};

export default RetrieveCoursePasscode;