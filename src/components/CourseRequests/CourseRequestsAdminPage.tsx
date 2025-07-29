// src/components/CourseRequests/CourseRequestsAdminPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface CourseRequest {
  id: string;
  uid: string;  // Educator ID
  courseNumber: string;
  courseTitle: string;
  courseDescription: string;
  timestamp: { seconds: number; nanoseconds: number };
  status: 'pending' | 'approved' | 'denied';
  syllabusImported?: boolean;
  syllabusData?: {
    parsedCourseInfo: any;
    generatedMaterials: any[];
  };
}

const CourseRequestsAdminPage: React.FC = () => {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'deny' | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentRequestData, setCurrentRequestData] = useState<CourseRequest | null>(null);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courseRequests'));
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CourseRequest[];
  
        fetchedRequests.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status === 'approved' && b.status === 'denied') return -1;
          if (a.status === 'denied' && b.status === 'approved') return 1;
          return 0;
        });
  
        setRequests(fetchedRequests);
      } catch (error) {
        console.error("Error fetching course requests: ", error);
      }
    };
    fetchRequests();
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

  // Function to generate a unique material ID
  const generateMaterialId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleApprove = async () => {
    if (!currentRequestId || !currentRequestData) return;
  
    try {
      const passcode = generatePasscode();
  
      // Create a new course document
      const courseDocRef = await addDoc(collection(db, 'courses'), {
        number: currentRequestData.courseNumber,
        title: currentRequestData.courseTitle,
        passcode: passcode,
        courseAdmin: [currentRequestData.uid], // Initialize with primary admin as array
      });
  
      // Update the user's document to associate them with the new course using the map structure
      const userDocRef = doc(db, 'users', currentRequestData.uid);
      const userDoc = await getDoc(userDocRef);
  
      // Get existing classes from the user's document (if any)
      const existingClasses = userDoc.exists() ? userDoc.data()?.classes || {} : {};
  
      // Update the user's document to include the new course
      await updateDoc(userDocRef, {
        classes: {
          ...existingClasses,
          [courseDocRef.id]: {
            number: currentRequestData.courseNumber,
            title: currentRequestData.courseTitle,
            isCourseAdmin: true, // Set explicitly
          },
        },
      });

      // Create materials if syllabus was imported
      let createdMaterialsCount = 0;
      if (currentRequestData.syllabusImported && currentRequestData.syllabusData?.generatedMaterials) {
        const batch = writeBatch(db);
        
        currentRequestData.syllabusData.generatedMaterials.forEach((material) => {
          const materialRef = doc(collection(db, 'materials'));
          const materialData: any = {
            id: generateMaterialId(),
            title: material.title || 'Untitled Material',
            header: material.header || { title: '', content: '' },
            footer: material.footer || { title: '', content: '' },
            sections: material.sections || [],
            published: true, // Materials from syllabus are published by default
            courseId: courseDocRef.id,
            createdBy: currentRequestData.uid,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          if (material.scheduledTimestamp) {
            materialData.scheduledTimestamp = material.scheduledTimestamp;
          }
          
          batch.set(materialRef, materialData);
          createdMaterialsCount++;
        });
        
        // Commit the batch
        await batch.commit();
        console.log(`Created ${createdMaterialsCount} materials from syllabus`);
      }
  
      // Update the course request document with the new course ID and passcode
      await updateDoc(doc(db, 'courseRequests', currentRequestId), {
        status: 'approved',
        courseId: courseDocRef.id,
        passcode: passcode,
      });
  
      // Enhanced email notification
      const emailDoc = {
        to: ['andriy@intofuture.org', 'dylan@intofuture.org'],
        message: {
          subject: 'Your Course Request Has Been Approved',
          html: `
            <p>Your course request has been approved:</p>
            <p><strong>Course:</strong> ${currentRequestData.courseNumber} - ${currentRequestData.courseTitle}</p>
            <p><strong>Passcode:</strong> ${passcode}</p>
            ${currentRequestData.syllabusImported && createdMaterialsCount > 0 ? 
              `<p><strong>Materials Created:</strong> ${createdMaterialsCount} materials have been automatically added to your course from your syllabus import.</p>` : ''
            }
            <p><a href="https://institute-for-future-intelligence.github.io/nexlab/supplemental-materials">
            Click here to view your course.
            </a></p>
          `,
        },
      };
      await addDoc(collection(db, 'mail'), emailDoc);
  
      setSnackbarMessage(
        `Course request approved, course added${createdMaterialsCount > 0 ? ` with ${createdMaterialsCount} materials` : ''}.`
      );
      setSnackbarSeverity('success');
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === currentRequestId ? { ...request, status: 'approved' } : request
        )
      );
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
      await updateDoc(doc(db, 'courseRequests', currentRequestId), {
        status: 'denied'
      });
      setSnackbarMessage('Course request denied.');
      setSnackbarSeverity('success');
      setRequests(requests.map(request => request.id === currentRequestId ? { ...request, status: 'denied' } : request));
    } catch (error) {
      console.error('Error denying request: ', error);
      setSnackbarMessage('Error denying the request. Please try again.');
      setSnackbarSeverity('error');
    }
    setOpenSnackbar(true);
    handleCloseDialog();
  };

  const handleOpenDialog = (action: 'approve' | 'deny', requestId: string, requestData: CourseRequest) => {
    setCurrentAction(action);
    setCurrentRequestId(requestId);
    setCurrentRequestData(requestData);
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
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="text" onClick={handleNavigateHome} sx={{ mr: 2 }}>
          &larr; Home Page
        </Button>
      </Box>

      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Course Creation Requests
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Educator ID</TableCell>
              <TableCell>Course Number</TableCell>
              <TableCell>Course Title</TableCell>
              <TableCell>Course Description</TableCell>
              <TableCell>Creation Method</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.uid}</TableCell>
                <TableCell>{request.courseNumber}</TableCell>
                <TableCell>{request.courseTitle}</TableCell>
                <TableCell>
                  {request.courseDescription.length > 100 
                    ? `${request.courseDescription.substring(0, 100)}...` 
                    : request.courseDescription
                  }
                </TableCell>
                <TableCell>
                  {request.syllabusImported ? (
                    <Box>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                        Syllabus Import
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.syllabusData?.generatedMaterials?.length || 0} materials
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Manual Entry
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {request.timestamp?.seconds 
                    ? new Date(request.timestamp.seconds * 1000).toLocaleString()
                    : 'Invalid Date'
                  }
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        variant="contained" 
                        color="success" 
                        size="small"
                        onClick={() => handleOpenDialog('approve', request.id, request)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => handleOpenDialog('deny', request.id, request)}
                      >
                        Deny
                      </Button>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      Approved
                    </Typography>
                  )}
                  {request.status === 'denied' && (
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
                      Denied
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {currentAction === 'approve' ? 'Approve Course Request' : 'Deny Course Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {currentAction === 'approve' ? (
              <>
                Are you sure you want to approve this course request?
                {currentRequestData?.syllabusImported && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      📚 Syllabus Import Detected
                    </Typography>
                    <Typography variant="body2">
                      This request includes {currentRequestData?.syllabusData?.generatedMaterials?.length || 0} auto-generated materials that will be added to the course.
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              'Are you sure you want to deny this course request?'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={currentAction === 'approve' ? handleApprove : handleDeny} 
            color={currentAction === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {currentAction === 'approve' ? 'Approve' : 'Deny'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseRequestsAdminPage;