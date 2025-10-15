// src/components/CourseRequests/CourseRequestsAdminPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc, addDoc, writeBatch, Timestamp, deleteDoc } from 'firebase/firestore';
import { ParsedCourseInfo, GeneratedMaterial } from '../../stores/syllabusStore';
import type { Material } from '../../types/Material';
import { PageHeader } from '../common';
import { colors, spacing } from '../../config/designSystem';
import { Download as DownloadIcon } from '@mui/icons-material';
import ModernCourseRequestsTable from './ModernCourseRequestsTable';

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
    parsedCourseInfo: ParsedCourseInfo;
    generatedMaterials: GeneratedMaterial[];
    additionalInfo?: {
      contactInfo?: Record<string, unknown>;
      policies?: Record<string, unknown>;
      additionalResources?: Record<string, unknown>;
      labSpecific?: Record<string, unknown>;
      textbooks?: Record<string, unknown>[];
      gradingPolicy?: Record<string, unknown>[];
      assignments?: Record<string, unknown>[];
      prerequisites?: string[];
    };
    syllabusFile?: {
      url: string;
      path: string;
      metadata: {
        originalFilename: string;
        fileSize: number;
        fileType: string;
        uploadedAt: Date;
        uploadedBy: string;
        courseId?: string;
      };
    };
  };
}

const CourseRequestsAdminPage: React.FC = () => {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'deny' | 'delete' | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentRequestData, setCurrentRequestData] = useState<CourseRequest | null>(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courseRequests'));
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CourseRequest[];
  
        // Sort by timestamp (newest first), then by status (pending first)
        fetchedRequests.sort((a, b) => {
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



  const handleApprove = async () => {
    if (!currentRequestId || !currentRequestData) return;
  
    try {
      const passcode = generatePasscode();
  
      // Prepare course document data
      const courseData: Record<string, unknown> = {
        number: currentRequestData.courseNumber,
        title: currentRequestData.courseTitle,
        description: currentRequestData.courseDescription,
        passcode: passcode,
        courseAdmin: [currentRequestData.uid], // Initialize with primary admin as array
        createdAt: new Date(), // Keep this for backward compatibility
        courseCreatedAt: new Date(), // Add explicit courseCreatedAt field for consistency
      };

      // Add additional information if available from syllabus import
      if (currentRequestData.syllabusImported && currentRequestData.syllabusData?.additionalInfo) {
        const additionalInfo = currentRequestData.syllabusData.additionalInfo;
        courseData.additionalInfo = {
          contactInfo: additionalInfo.contactInfo || {},
          policies: additionalInfo.policies || {},
          additionalResources: additionalInfo.additionalResources || {},
          labSpecific: additionalInfo.labSpecific || {},
          textbooks: additionalInfo.textbooks || [],
          gradingPolicy: additionalInfo.gradingPolicy || [],
          assignments: additionalInfo.assignments || [],
          prerequisites: additionalInfo.prerequisites || [],
          lastUpdated: new Date()
        };
      }

      // Add syllabus file reference if available
      if (currentRequestData.syllabusImported && currentRequestData.syllabusData?.syllabusFile) {
        courseData.syllabusFile = currentRequestData.syllabusData.syllabusFile;
      }

      // Create the course document
      const courseDocRef = await addDoc(collection(db, 'courses'), courseData);
  
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
            courseCreatedAt: new Date(), // When the course was originally created
            enrolledAt: new Date(), // When the user was enrolled in this course
          },
        },
      });

      // Create materials if syllabus was imported
      let createdMaterialsCount = 0;
      if (currentRequestData.syllabusImported && currentRequestData.syllabusData?.generatedMaterials) {
        const batch = writeBatch(db);
        
        currentRequestData.syllabusData.generatedMaterials.forEach((material) => {
          const materialRef = doc(collection(db, 'materials')); // Let Firestore auto-generate ID
          const materialData: Omit<Material, 'id'> & { 
            createdAt: Date; 
            updatedAt: Date; 
          } = {
            // No id field needed - document ID will be used
            title: material.title || 'Untitled Material',
            header: material.header || { title: '', content: '' },
            footer: material.footer || { title: '', content: '' },
            sections: (material.sections || []).map(section => ({
              ...section,
              images: section.images || [],
              links: section.links || [],
              subsections: (section.subsections || []).map(subsection => ({
                ...subsection,
                images: subsection.images || [],
                links: subsection.links || [],
                subSubsections: (subsection.subSubsections || []).map(subSubsection => ({
                  ...subSubsection,
                  images: subSubsection.images || [],
                  links: subSubsection.links || []
                }))
              }))
            })),
            published: true, // Materials from syllabus are published by default
            course: courseDocRef.id, // Changed from courseId to course
            author: currentRequestData.uid, // Changed from createdBy to author
            timestamp: Timestamp.now(), // Added timestamp field for ordering
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          if (material.scheduledTimestamp) {
            materialData.scheduledTimestamp = Timestamp.fromDate(material.scheduledTimestamp);
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
        to: ['andriy@intofuture.org'],
        message: {
          subject: 'Your Course Request Has Been Approved',
          html: `
            <p>Your course request has been approved:</p>
            <p><strong>Course:</strong> ${currentRequestData.courseNumber} - ${currentRequestData.courseTitle}</p>
            <p><strong>Passcode:</strong> ${passcode}</p>
            ${currentRequestData.syllabusImported && createdMaterialsCount > 0 ? 
              `<p><strong>Materials Created:</strong> ${createdMaterialsCount} materials have been automatically added to your course from your syllabus import.</p>` : ''
            }
            <p><a href="https://nexlab.bio/supplemental-materials">
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
      await updateDoc(doc(db, 'courseRequests', currentRequestId), {
        status: 'denied'
      });
      setSnackbarMessage('Course request denied.');
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
      await deleteDoc(doc(db, 'courseRequests', currentRequestId));
      setSnackbarMessage('Course request deleted successfully.');
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

  const handleOpenDialog = (action: 'approve' | 'deny' | 'delete', requestId: string, requestData: CourseRequest) => {
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


  return (
    <Box sx={{ 
      p: spacing[6], 
      backgroundColor: colors.background.primary, 
      minHeight: '100vh' 
    }}>
      <PageHeader title="Course Creation Requests" />

      <Typography 
        variant="body1" 
        sx={{ 
          mb: spacing[4],
          color: colors.text.secondary,
          fontFamily: 'Gabarito, sans-serif',
        }}
      >
        Review and approve course creation requests from educators.
      </Typography>

      <ModernCourseRequestsTable
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
        onViewSyllabus={(request) => {
        // You can add syllabus viewing logic here if needed
        if (request.syllabusData?.syllabusFile && 
            typeof request.syllabusData.syllabusFile === 'object' && 
            request.syllabusData.syllabusFile !== null &&
            'url' in request.syllabusData.syllabusFile) {
          window.open((request.syllabusData.syllabusFile as { url: string }).url, '_blank');
        }
        }}
      />

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {currentAction === 'approve' ? 'Approve Course Request' : 
           currentAction === 'deny' ? 'Deny Course Request' : 
           'Delete Course Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {currentAction === 'approve' ? (
              <>
                Are you sure you want to approve this course request?
                {currentRequestData?.syllabusImported && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#ECF4FE', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      📚 Syllabus Import Detected
                    </Typography>
                    <Typography variant="body2">
                      This request includes {currentRequestData?.syllabusData?.generatedMaterials?.length || 0} auto-generated materials that will be added to the course.
                    </Typography>
                    {currentRequestData?.syllabusData?.syllabusFile && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Syllabus File:</strong> {currentRequestData.syllabusData.syllabusFile.metadata.originalFilename}
                          {' '}({(currentRequestData.syllabusData.syllabusFile.metadata.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                          if (currentRequestData.syllabusData?.syllabusFile && 'url' in currentRequestData.syllabusData.syllabusFile) {
                            window.open((currentRequestData.syllabusData.syllabusFile as { url: string }).url, '_blank');
                          }
                        }}
                          sx={{ mt: 0.5 }}
                        >
                          View/Download Syllabus
                        </Button>
                      </Box>
                    )}
                    {currentRequestData?.syllabusData?.additionalInfo && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Additional Info:</strong> Contact info, policies, textbooks, and other course details extracted
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            ) : currentAction === 'deny' ? (
              'Are you sure you want to deny this course request?'
            ) : (
              'Are you sure you want to delete this course request? This action cannot be undone.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={currentAction === 'approve' ? handleApprove : 
                    currentAction === 'deny' ? handleDeny : 
                    handleDelete} 
            color={currentAction === 'approve' ? 'success' : 
                   currentAction === 'deny' ? 'error' : 
                   'error'}
            variant="contained"
          >
            {currentAction === 'approve' ? 'Approve' : 
             currentAction === 'deny' ? 'Deny' : 
             'Delete'}
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