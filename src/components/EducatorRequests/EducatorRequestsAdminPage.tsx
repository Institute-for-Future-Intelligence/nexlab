// src/components/EducatorRequests/EducatorRequestsAdminPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Select, MenuItem } from '@mui/material';
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc, addDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common';
import { colors, typography, spacing } from '../../config/designSystem';
import ModernEducatorRequestsTable from './ModernEducatorRequestsTable';

// Define the interface for the request data
interface EducatorRequest {
  id: string;
  firstName: string;
  lastName: string;
  uid: string;
  institution: string;
  email: string;
  courseNumber: string;
  courseTitle: string;
  courseDescription: string;
  requestType: 'primary' | 'co-instructor';
  timestamp: { seconds: number; nanoseconds: number };
  status: 'pending' | 'approved' | 'denied';
}

const EducatorRequestsAdminPage: React.FC = () => {
  const [requests, setRequests] = useState<EducatorRequest[]>([]);
  const [courses, setCourses] = useState<Array<{id: string; number?: string; title?: string}>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(''); // State for selected course when approving co-instructor

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'deny' | 'delete' | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentRequestData, setCurrentRequestData] = useState<EducatorRequest | null>(null);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequestsAndCourses = async () => {
      const querySnapshot = await getDocs(collection(db, 'educatorRequests'));
      const fetchedRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EducatorRequest[];

      const courseSnapshot = await getDocs(collection(db, 'courses'));
      const fetchedCourses = courseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort requests by timestamp (newest first), then by status (pending first)
      const sortedRequests = fetchedRequests.sort((a, b) => {
        // First sort by timestamp (newest first)
        const timestampA = a.timestamp?.seconds || 0;
        const timestampB = b.timestamp?.seconds || 0;
        const timestampDiff = timestampB - timestampA;
        
        if (timestampDiff !== 0) {
          return timestampDiff;
        }
        
        // If timestamps are equal, sort by status (pending first)
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status === 'approved' && b.status === 'denied') return -1;
        if (a.status === 'denied' && b.status === 'approved') return 1;
        return 0;
      });

      setRequests(sortedRequests);
      setCourses(fetchedCourses);
    };
    fetchRequestsAndCourses();
  }, [db]);

  // Function to generate a unique 28-character passcode
  function generatePasscode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let passcode = '';
    for (let i = 0; i < 28; i++) {
      passcode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return passcode;
  }

  const handleApprove = async () => {
    if (!currentRequestId || !currentRequestData) return;

    // Validate request data
    if (!currentRequestData.courseNumber || !currentRequestData.courseTitle) {
      setSnackbarMessage('Course number or title is missing. Cannot approve request.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (currentRequestData.requestType === 'co-instructor' && !selectedCourseId) {
      setSnackbarMessage('Please select a course for the co-instructor request.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (currentRequestData.status !== 'pending') {
      setSnackbarMessage('This request has already been processed.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }
  
    try {
      const userDocRef = doc(db, 'users', currentRequestData.uid);

      if (currentRequestData.requestType === 'primary') {
        // Create a new course document
        const passcode = generatePasscode();
        const courseDocRef = await addDoc(collection(db, 'courses'), {
          number: currentRequestData.courseNumber,
          title: currentRequestData.courseTitle,
          passcode,
          courseAdmin: [currentRequestData.uid], // Initialize with primary admin as array
          createdAt: new Date(), // Keep this for backward compatibility
          courseCreatedAt: new Date(), // Add explicit courseCreatedAt field for consistency
        });

        // Update the user's document
        const userDoc = await getDoc(userDocRef);
        const existingClasses = userDoc.exists() ? userDoc.data()?.classes || {} : {};
  
        await updateDoc(userDocRef, {
          isAdmin: true,
          classes: {
            ...existingClasses,
            [courseDocRef.id]: {
              number: currentRequestData.courseNumber,
              title: currentRequestData.courseTitle,
              isCourseAdmin: true, // Explicitly set the user as course admin
              courseCreatedAt: new Date(), // When the course was originally created
              enrolledAt: new Date(), // When the user was enrolled in this course
            },
          },
        });

        // Update the educator request document
        await updateDoc(doc(db, 'educatorRequests', currentRequestId), {
          status: 'approved',
          courseId: courseDocRef.id,
          passcode,
        });
  
      } else if (currentRequestData.requestType === 'co-instructor') {
        if (!selectedCourseId) {
          setSnackbarMessage('Please select a course for the co-instructor request.');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          return;
        }

        // Add the user to the existing course's admin array
        const courseDocRef = doc(db, 'courses', selectedCourseId);
        await updateDoc(courseDocRef, {
          courseAdmin: arrayUnion(currentRequestData.uid),
        });

        // Update the user's document
        const userDoc = await getDoc(userDocRef);
        const existingClasses = userDoc.exists() ? userDoc.data()?.classes || {} : {};
          
        // Update user document using a map structure
        await updateDoc(userDocRef, {
          isAdmin: true,
          classes: {
            ...existingClasses,
            [selectedCourseId]: {
              number: currentRequestData.courseNumber,
              title: currentRequestData.courseTitle,
              isCourseAdmin: true, // Co-instructors are also course admins
              courseCreatedAt: new Date(), // When the course was originally created
              enrolledAt: new Date(), // When the user was enrolled in this course
            },
          },
        });
  
        // Update the educator request document
        await updateDoc(doc(db, 'educatorRequests', currentRequestId), {
          status: 'approved',
          courseId: selectedCourseId,
        });
      }
  
      setSnackbarMessage('Request approved, and user promoted to educator.');
      setSnackbarSeverity('success');
      setRequests((prevRequests) => {
        const updatedRequests = prevRequests.map((request) =>
          request.id === currentRequestId ? { ...request, status: 'approved' as const } : request
        );
        
        // Re-sort after update
        return updatedRequests.sort((a, b) => {
          const timestampA = a.timestamp?.seconds || 0;
          const timestampB = b.timestamp?.seconds || 0;
          const timestampDiff = timestampB - timestampA;
          
          if (timestampDiff !== 0) {
            return timestampDiff;
          }
          
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status === 'approved' && b.status === 'denied') return -1;
          if (a.status === 'denied' && b.status === 'approved') return 1;
          return 0;
        });
      });
    } catch (error) {
      console.error('Error approving request: ', error);
      setSnackbarMessage('Error approving the request. Please try again.');
      setSnackbarSeverity('error');
    }
    setOpenSnackbar(true);
    handleCloseDialog();
  };  

  const handleDeny = async () => {
    if (!currentRequestId) return;

    try {
      await updateDoc(doc(db, 'educatorRequests', currentRequestId), {
        status: 'denied'
      });
      setSnackbarMessage('Request denied.');
      setSnackbarSeverity('success');
      setRequests((prevRequests) => {
        const updatedRequests = prevRequests.map(request => 
          request.id === currentRequestId ? { ...request, status: 'denied' as const } : request
        );
        
        // Re-sort after update
        return updatedRequests.sort((a, b) => {
          const timestampA = a.timestamp?.seconds || 0;
          const timestampB = b.timestamp?.seconds || 0;
          const timestampDiff = timestampB - timestampA;
          
          if (timestampDiff !== 0) {
            return timestampDiff;
          }
          
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status === 'approved' && b.status === 'denied') return -1;
          if (a.status === 'denied' && b.status === 'approved') return 1;
          return 0;
        });
      });
    } catch (error) {
      console.error('Error denying request: ', error);
      setSnackbarMessage('Error denying the request. Please try again.');
      setSnackbarSeverity('error');
    }
    setOpenSnackbar(true);
    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (!currentRequestId) return;

    try {
      await deleteDoc(doc(db, 'educatorRequests', currentRequestId));
      setSnackbarMessage('Educator request deleted successfully.');
      setSnackbarSeverity('success');
      setRequests((prevRequests) => {
        const updatedRequests = prevRequests.filter(request => request.id !== currentRequestId);
        
        // Re-sort after deletion
        return updatedRequests.sort((a, b) => {
          const timestampA = a.timestamp?.seconds || 0;
          const timestampB = b.timestamp?.seconds || 0;
          const timestampDiff = timestampB - timestampA;
          
          if (timestampDiff !== 0) {
            return timestampDiff;
          }
          
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status === 'approved' && b.status === 'denied') return -1;
          if (a.status === 'denied' && b.status === 'approved') return 1;
          return 0;
        });
      });
    } catch (error) {
      console.error('Error deleting request: ', error);
      setSnackbarMessage('Error deleting the request. Please try again.');
      setSnackbarSeverity('error');
    }
    setOpenSnackbar(true);
    handleCloseDialog();
  };

  const handleOpenDialog = (action: 'approve' | 'deny' | 'delete', requestId: string, requestData: EducatorRequest) => {
    setCurrentAction(action);
    setCurrentRequestId(requestId);
    setCurrentRequestData(requestData);
    setSelectedCourseId(''); // Reset selected course ID when dialog is closed
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentAction(null);
    setCurrentRequestId(null);
    setCurrentRequestData(null);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ 
      p: spacing[6], 
      backgroundColor: colors.background.primary, 
      minHeight: '100vh' 
    }}>
      <PageHeader title="Educator Permission Requests" />

      <Typography 
        variant="body1" 
        sx={{ 
          mb: spacing[4],
          color: colors.text.secondary,
          fontFamily: 'Gabarito, sans-serif',
        }}
      >
        Review and manage educator permission requests from users seeking to become course instructors.
      </Typography>

      <ModernEducatorRequestsTable
        requests={requests}
        loading={false}
        onApprove={(requestId) => {
          const request = requests.find(r => r.id === requestId);
          if (request) handleOpenDialog('approve', requestId, request);
        }}
        onDeny={(requestId) => {
          const request = requests.find(r => r.id === requestId);
          if (request) handleOpenDialog('deny', requestId, request);
        }}
        onDelete={(requestId) => {
          const request = requests.find(r => r.id === requestId);
          if (request) handleOpenDialog('delete', requestId, request);
        }}
      />

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">
          {currentAction === 'approve' ? 'Confirm Approval' : 
           currentAction === 'deny' ? 'Confirm Denial' : 
           'Delete Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {currentAction === 'delete' ? (
              `Are you sure you want to delete this request for ${currentRequestData?.firstName} ${currentRequestData?.lastName}? This action cannot be undone.`
            ) : (
              `Are you sure you want to ${currentAction} this request for ${currentRequestData?.firstName} ${currentRequestData?.lastName}?`
            )}
          </DialogContentText>

          {currentAction === 'approve' && currentRequestData?.requestType === 'co-instructor' && (
            <Box sx={{ mt: 2 }}>
              <Typography>Select Course:</Typography>
              <Select
                fullWidth
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>
                    {`${course.number} - ${course.title}`}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={currentAction === 'approve' ? handleApprove : 
                    currentAction === 'deny' ? handleDeny : 
                    handleDelete}
            color={currentAction === 'delete' ? 'error' : 'primary'}
            variant="contained"
            autoFocus
            disabled={currentRequestData?.requestType === 'co-instructor' && currentAction === 'approve' && !selectedCourseId} // Disable if no course is selected for co-instructor
          >
            {currentAction === 'approve' ? 'Approve' : 
             currentAction === 'deny' ? 'Deny' : 
             'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducatorRequestsAdminPage;