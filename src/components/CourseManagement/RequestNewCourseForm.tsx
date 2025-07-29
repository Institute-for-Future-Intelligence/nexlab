// src/components/UserAccount/RequestNewCourseForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  OutlinedInput, 
  FormLabel, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Divider
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Upload as UploadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import SyllabusImport from './SyllabusImport';
import { useSyllabusStore } from '../../stores/syllabusStore';

type CourseCreationMode = 'manual' | 'syllabus';

const RequestNewCourseForm: React.FC = () => {
  const { userDetails } = useUser();
  const navigate = useNavigate();
  const db = getFirestore();

  // Form mode state
  const [creationMode, setCreationMode] = useState<CourseCreationMode>('manual');
  
  // Manual entry state
  const [courseNumber, setCourseNumber] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  // Syllabus import state
  const { 
    parsedCourseInfo, 
    generatedMaterials, 
    reset: resetSyllabus,
    currentStep 
  } = useSyllabusStore();

  // UI state
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');

  // Reset syllabus store when switching modes
  useEffect(() => {
    if (creationMode === 'manual') {
      resetSyllabus();
    }
  }, [creationMode, resetSyllabus]);

  // Auto-populate manual fields when syllabus data is available (only for final submission)
  useEffect(() => {
    if (creationMode === 'syllabus' && parsedCourseInfo) {
      setCourseNumber(parsedCourseInfo.suggestedNumber || '');
      setCourseTitle(parsedCourseInfo.suggestedTitle || '');
      setCourseDescription(parsedCourseInfo.suggestedDescription || '');
    }
  }, [creationMode, parsedCourseInfo]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: CourseCreationMode | null) => {
    if (newMode !== null) {
      setCreationMode(newMode);
      // Clear manual form when switching to syllabus mode
      if (newMode === 'syllabus') {
        setCourseNumber('');
        setCourseTitle('');
        setCourseDescription('');
      }
    }
  };

  const validateForm = (): string | null => {
    if (creationMode === 'manual') {
      if (!courseNumber || !courseTitle || !courseDescription) {
        return 'Please fill in all required fields.';
      }
    } else if (creationMode === 'syllabus') {
      if (!parsedCourseInfo) {
        return 'Please complete the syllabus import process first.';
      }
      if (!courseNumber || !courseTitle || !courseDescription) {
        return 'Please ensure course information is properly filled from your syllabus.';
      }
    }
    return null;
  };

  const handleSyllabusComplete = (data: { courseInfo: any; materials: any[] }) => {
    // The course info is already populated via useEffect
    // Just show a success message or continue with the flow
    console.log('Syllabus import completed:', data);
  };

  const handleRequestNewCourse = async () => {
    const validationError = validateForm();
    if (validationError) {
      setDialogContent(validationError);
      setDialogOpen(true);
      return;
    }
  
    setLoading(true);
  
    try {
      // Base request document with safe defaults
      const requestDoc: any = {
        uid: userDetails?.uid || '',
        courseNumber: courseNumber || '',
        courseTitle: courseTitle || '',
        courseDescription: courseDescription || '',
        status: 'pending',
        timestamp: new Date(),
        syllabusImported: false
      };

      // Add syllabus data if imported
      if (creationMode === 'syllabus' && parsedCourseInfo && generatedMaterials.length > 0) {
        requestDoc.syllabusImported = true;
        requestDoc.syllabusData = {
          parsedCourseInfo: parsedCourseInfo,
          generatedMaterials: generatedMaterials.filter(m => m.published)
        };
      }
  
      // Add the course request document
      const courseRequestRef = await addDoc(collection(db, 'courseRequests'), requestDoc);
  
      // Enhanced email notification
      const emailDoc = {
        to: ['andriy@intofuture.org', 'dylan@intofuture.org'],
        message: {
          subject: `New Course Request Submitted${creationMode === 'syllabus' ? ' (With Syllabus Import)' : ''}`,
          html: `
            <p>A new course request has been submitted:</p>
            <p><strong>Educator ID:</strong> ${userDetails?.uid || 'Unknown'}</p>
            <p><strong>Course:</strong> ${courseNumber} - ${courseTitle}</p>
            <p><strong>Description:</strong> ${courseDescription}</p>
            <p><strong>Creation Method:</strong> ${creationMode === 'syllabus' ? 'Imported from Syllabus' : 'Manual Entry'}</p>
            ${creationMode === 'syllabus' && generatedMaterials.length > 0 ? 
              `<p><strong>Generated Materials:</strong> ${generatedMaterials.filter(m => m.published).length} materials ready for publication</p>` : ''
            }
            <p><strong>Request ID:</strong> ${courseRequestRef.id}</p>
            <p><a href="https://institute-for-future-intelligence.github.io/nexlab/course-requests">
            Click here to review the request.
            </a></p>
          `,
        },
      };
      await addDoc(collection(db, 'mail'), emailDoc);
  
      setDialogContent(
        creationMode === 'syllabus' 
          ? `Your course request has been submitted for review with ${generatedMaterials.filter(m => m.published).length} auto-generated materials.`
          : 'Your course request has been submitted for review.'
      );
  
      // Clear form fields
      setCourseNumber('');
      setCourseTitle('');
      setCourseDescription('');
      if (creationMode === 'syllabus') {
        resetSyllabus();
      }
  
      // Show success message and navigate back
      setDialogOpen(true);
      setTimeout(() => {
        navigate('/course-management');
      }, 3000);
    } catch (error) {
      console.error('Error submitting course request: ', error);
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
    navigate('/course-management');
  };

  // Check if we're in the middle of syllabus import process
  const isSyllabusInProgress = creationMode === 'syllabus' && currentStep !== 'upload' && !parsedCourseInfo;
  
  // Check if syllabus import is complete and ready for submission
  const isSyllabusComplete = creationMode === 'syllabus' && currentStep === 'review' && parsedCourseInfo;

  return (
    <Box className="request-form-container" sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button variant="text" onClick={handleNavigateBack} className="back-home-button">
          &larr; Course Management
        </Button>
      </Box>
      
      <Box className="request-form-outline">
        <Typography variant="h5" component="h1" className="request-form-title" sx={{ mb: 3 }}>
          Request Creating a New Course
        </Typography>

        {/* Mode Selection */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            How would you like to create your course?
          </Typography>
          
          <ToggleButtonGroup
            value={creationMode}
            exclusive
            onChange={handleModeChange}
            aria-label="course creation mode"
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="manual" aria-label="manual entry">
              <EditIcon sx={{ mr: 1 }} />
              Manual Entry
            </ToggleButton>
            <ToggleButton value="syllabus" aria-label="syllabus import">
              <UploadIcon sx={{ mr: 1 }} />
              Import from Syllabus
            </ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="body2" color="text.secondary">
            {creationMode === 'manual' 
              ? 'Fill out the course information manually using the form below.'
              : 'Upload your syllabus document and we\'ll automatically extract course information and generate materials.'
            }
          </Typography>
        </Paper>

        {/* Syllabus Import Mode */}
        {creationMode === 'syllabus' && (
          <Box sx={{ mb: 4 }}>
            <SyllabusImport
              onComplete={handleSyllabusComplete}
              onCancel={() => setCreationMode('manual')}
            />
          </Box>
        )}

        {/* Manual Form Fields - Only show in manual mode */}
        {creationMode === 'manual' && (
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
          </Grid>
        )}

        {/* Submit Button - Show for both modes with different conditions */}
        {(creationMode === 'manual' || isSyllabusComplete) && (
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRequestNewCourse} 
              fullWidth
              className="submit-button"
              disabled={loading || isSyllabusInProgress}
              sx={{ 
                py: 1.5, 
                fontWeight: 'bold', 
                fontSize: '16px', 
                textTransform: 'uppercase' 
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Submitting Request...
                </>
              ) : (
                `Submit Request${creationMode === 'syllabus' && generatedMaterials.length > 0 ? ` with ${generatedMaterials.filter(m => m.published).length} Materials` : ''}`
              )}
            </Button>

            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              For any questions, please contact <a href="mailto:andriy@intofuture.org">andriy@intofuture.org</a>.
            </Typography>
          </Box>
        )}

        {/* Success/Error Dialog */}
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