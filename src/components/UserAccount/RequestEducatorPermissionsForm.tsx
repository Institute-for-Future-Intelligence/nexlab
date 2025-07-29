// src/components/UserAccount/RequestEducatorPermissionsForm.tsx
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
  MenuItem, 
  Select, 
  SelectChangeEvent, 
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Upload as UploadIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import SyllabusImport from '../CourseManagement/SyllabusImport';
import { useSyllabusStore } from '../../stores/syllabusStore';

type CourseCreationMode = 'manual' | 'syllabus';

// Utility function to recursively remove undefined values from objects
const cleanDataForFirebase = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  // Don't process Date objects - Firebase expects them as-is
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanDataForFirebase).filter(item => item !== null && item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        const cleanedValue = cleanDataForFirebase(value);
        if (cleanedValue !== undefined && cleanedValue !== null) {
          cleaned[key] = cleanedValue;
        }
      }
    });
    return cleaned;
  }
  
  return obj;
};

const RequestEducatorPermissionsForm: React.FC = () => {
  const { userDetails } = useUser();
  const navigate = useNavigate();
  const db = getFirestore();

  // Personal info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  
  // Course info state
  const [courseNumber, setCourseNumber] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  
  // Request type and course creation mode
  const [requestType, setRequestType] = useState('primary');
  const [courseCreationMode, setCourseCreationMode] = useState<CourseCreationMode>('manual');

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

  // Reset syllabus store when switching modes or request types
  useEffect(() => {
    if (courseCreationMode === 'manual' || requestType === 'co-instructor') {
      resetSyllabus();
    }
  }, [courseCreationMode, requestType, resetSyllabus]);

  // Auto-populate course fields when syllabus data is available (only for final submission)
  useEffect(() => {
    if (requestType === 'primary' && courseCreationMode === 'syllabus' && parsedCourseInfo) {
      setCourseNumber(parsedCourseInfo.suggestedNumber || '');
      setCourseTitle(parsedCourseInfo.suggestedTitle || '');
      setCourseDescription(parsedCourseInfo.suggestedDescription || '');
    }
  }, [requestType, courseCreationMode, parsedCourseInfo]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const newRequestType = event.target.value as string;
    setRequestType(newRequestType);
    
    // Reset course creation mode when switching to co-instructor
    if (newRequestType === 'co-instructor') {
      setCourseCreationMode('manual');
      setCourseNumber('');
      setCourseTitle('');
      setCourseDescription('');
    }
  };

  const handleCourseCreationModeChange = (event: React.MouseEvent<HTMLElement>, newMode: CourseCreationMode | null) => {
    if (newMode !== null) {
      setCourseCreationMode(newMode);
      // Clear course fields when switching to syllabus mode
      if (newMode === 'syllabus') {
        setCourseNumber('');
        setCourseTitle('');
        setCourseDescription('');
      }
    }
  };

  const validateForm = (): string | null => {
    // Personal info validation
    if (!firstName || !lastName || !institution || !email || !courseNumber || !courseTitle) {
      return 'Please fill in all required fields.';
    }

    // Course description validation for primary instructors
    if (requestType === 'primary') {
      if (courseCreationMode === 'manual' && !courseDescription) {
        return 'Please provide a course description.';
      }
      if (courseCreationMode === 'syllabus') {
        if (!parsedCourseInfo) {
          return 'Please complete the syllabus import process first.';
        }
        if (!courseDescription) {
          return 'Please ensure course description is properly filled from your syllabus.';
        }
      }
    }

    return null;
  };

  const handleSyllabusComplete = (data: { courseInfo: any; materials: any[] }) => {
    console.log('Syllabus import completed for educator request:', data);
  };

  const handleRequestPermissions = async () => {
    const validationError = validateForm();
    if (validationError) {
      setDialogContent(validationError);
      setDialogOpen(true);
      return;
    }

    setLoading(true);

    try {
      // Base request document with safe defaults
      const baseRequestDoc = {
        uid: userDetails?.uid || '',
        firstName: firstName || '',
        lastName: lastName || '',
        institution: institution || '',
        email: email || '',
        courseNumber: courseNumber || '',
        courseTitle: courseTitle || '',
        courseDescription: requestType === 'primary' ? (courseDescription || '') : 'CO-INSTRUCTOR REQUEST',
        requestType: requestType || 'primary',
        status: 'pending',
        timestamp: new Date(),
        syllabusImported: false
      };

      // Add syllabus data if imported and primary instructor
      if (requestType === 'primary' && courseCreationMode === 'syllabus' && parsedCourseInfo && generatedMaterials.length > 0) {
        const syllabusData = {
          parsedCourseInfo: parsedCourseInfo,
          generatedMaterials: generatedMaterials.filter(m => m.published)
        };
        
        // Clean the syllabus data to remove any undefined values
        const cleanedSyllabusData = cleanDataForFirebase(syllabusData);
        
        baseRequestDoc.syllabusImported = true;
        (baseRequestDoc as any).syllabusData = cleanedSyllabusData;
      }

      // Clean the entire document to ensure no undefined values
      const requestDoc = cleanDataForFirebase(baseRequestDoc);
      
      console.log('Submitting clean educator request document:', requestDoc);

      const educatorRequestRef = await addDoc(collection(db, 'educatorRequests'), requestDoc);
  
      // Enhanced email notification
      const emailDoc = {
        to: ['andriy@intofuture.org', 'dylan@intofuture.org'],
        message: {
          subject: `New Educator Request Submitted${requestType === 'primary' && courseCreationMode === 'syllabus' ? ' (With Syllabus Import)' : ''}`,
          html: `
            <p>A new educator request has been submitted:</p>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Institution:</strong> ${institution}</p>
            <p><strong>Course:</strong> ${courseNumber} - ${courseTitle}</p>
            <p><strong>Request Type:</strong> ${requestType}</p>
            ${requestType === 'primary' ? `<p><strong>Course Creation Method:</strong> ${courseCreationMode === 'syllabus' ? 'Imported from Syllabus' : 'Manual Entry'}</p>` : ''}
            ${requestType === 'primary' && courseCreationMode === 'syllabus' && generatedMaterials.length > 0 ? 
              `<p><strong>Generated Materials:</strong> ${generatedMaterials.filter(m => m.published).length} materials ready for publication</p>` : ''
            }
            <p><strong>Description:</strong> ${courseDescription}</p>
            <p><strong>Request ID:</strong> ${educatorRequestRef.id}</p>
            <p><a href="https://institute-for-future-intelligence.github.io/nexlab/educator-requests">
            Click here to review the request.
            </a></p>
          `,
        },
      };
      await addDoc(collection(db, 'mail'), emailDoc);
  
      setDialogContent(
        requestType === 'primary' && courseCreationMode === 'syllabus' && generatedMaterials.length > 0
          ? `Your educator request has been submitted for review with ${generatedMaterials.filter(m => m.published).length} auto-generated course materials.`
          : 'Your request has been submitted for review.'
      );

      // Clear form fields
      setFirstName('');
      setLastName('');
      setInstitution('');
      setEmail('');
      setCourseNumber('');
      setCourseTitle('');
      setCourseDescription('');
      setRequestType('primary');
      setCourseCreationMode('manual');
      if (courseCreationMode === 'syllabus') {
        resetSyllabus();
      }

      // Show success message and then navigate back to My Account
      setDialogOpen(true);
      setTimeout(() => {
        navigate('/my-profile');
      }, 3000);

    } catch (error) {
      console.error('Error submitting request: ', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      
      setDialogContent('Error submitting your request. Please try again.');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleNavigateBack = () => {
    navigate('/my-profile');
  };

  // Check if we're in the middle of syllabus import process
  const isSyllabusInProgress = requestType === 'primary' && courseCreationMode === 'syllabus' && currentStep !== 'upload' && !parsedCourseInfo;
  
  // Check if syllabus import is complete and ready for submission
  // Materials preview shows when currentStep is 'editing' or 'complete'
  const isSyllabusComplete = requestType === 'primary' && courseCreationMode === 'syllabus' && 
    (currentStep === 'review' || currentStep === 'editing' || currentStep === 'complete') && 
    parsedCourseInfo;

  return (
    <Box className="request-form-container" sx={{ padding: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button variant="text" onClick={handleNavigateBack} className="back-home-button">
          &larr; My Account
        </Button>
      </Box>

      <Box className="request-form-outline" sx={{ 
        backgroundColor: '#f8f9fa', 
        borderRadius: 2, 
        p: 4,
        border: '1px solid #e3f2fd',
        minWidth: '100%'
      }}>
        <Typography variant="h5" component="h1" className="request-form-title" sx={{ mb: 3 }}>
          Request Educator Permissions
        </Typography>

        {/* Request Type Selection */}
        <Grid item xs={12} sx={{ mb: 3 }}>
          <FormLabel htmlFor="request-type" required>Request Type</FormLabel>
          <Select
            id="request-type"
            name="request-type"
            value={requestType}
            onChange={handleSelectChange}
            fullWidth
            required
            disabled={loading}
            sx={{ mt: 1 }}
          >
            <MenuItem value="primary">I am a primary course instructor, I want to create a new course</MenuItem>
            <MenuItem value="co-instructor">I am a co-instructor, I want to be added to an existing course</MenuItem>
          </Select>
        </Grid>

        {/* Personal Information Section */}
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Personal Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormLabel htmlFor="first-name" required>First Name</FormLabel>
            <OutlinedInput
              id="first-name"
              name="first-name"
              value={firstName}
              onChange={handleInputChange(setFirstName)}
              placeholder="John"
              fullWidth
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormLabel htmlFor="last-name" required>Last Name</FormLabel>
            <OutlinedInput
              id="last-name"
              name="last-name"
              value={lastName}
              onChange={handleInputChange(setLastName)}
              placeholder="Doe"
              fullWidth
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <FormLabel htmlFor="institution" required>Institution Affiliation</FormLabel>
            <OutlinedInput
              id="institution"
              name="institution"
              value={institution}
              onChange={handleInputChange(setInstitution)}
              placeholder="University Name"
              fullWidth
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <FormLabel htmlFor="email" required>Institutional Email</FormLabel>
            <OutlinedInput
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              placeholder="name@institution.edu"
              fullWidth
              required
              disabled={loading}
            />
            <Typography variant="caption" sx={{ mt: 1 }}>Please use your institutional email to confirm your affiliation.</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Course Details Section */}
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {requestType === 'primary' ? 'New Course Details' : 'Existing Course Details'}
        </Typography>

        {/* Course Creation Mode Toggle - Only for Primary Instructors */}
        {requestType === 'primary' && (
          <Paper sx={{ p: 3, mb: 4, backgroundColor: 'grey.50' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              How would you like to create your course?
            </Typography>
            
            <ToggleButtonGroup
              value={courseCreationMode}
              exclusive
              onChange={handleCourseCreationModeChange}
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
              {courseCreationMode === 'manual' 
                ? 'Fill out the course information manually using the form below.'
                : 'Upload your syllabus document and we\'ll automatically extract course information and generate materials.'
              }
            </Typography>
          </Paper>
        )}

        {/* Syllabus Import Mode - Only for Primary Instructors */}
        {requestType === 'primary' && courseCreationMode === 'syllabus' && (
          <Box sx={{ mb: 4 }}>
            <SyllabusImport
              onComplete={handleSyllabusComplete}
              onCancel={() => setCourseCreationMode('manual')}
            />
          </Box>
        )}

        {/* Course Information Form Fields - Show for manual mode OR co-instructor */}
        {(requestType === 'co-instructor' || (requestType === 'primary' && courseCreationMode === 'manual')) && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
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
            
            {/* Course Description - Only for Primary Instructors */}
            {requestType === 'primary' && (
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
            )}
          </Grid>
        )}

        {/* Submit Button - Show when ready */}
        {(requestType === 'co-instructor' || 
          (requestType === 'primary' && courseCreationMode === 'manual') || 
          isSyllabusComplete) && (
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRequestPermissions} 
              fullWidth
              className="submit-button"
              sx={{ 
                py: 1.5, 
                fontWeight: 'bold', 
                fontSize: '16px', 
                textTransform: 'uppercase' 
              }}
              disabled={loading || isSyllabusInProgress}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Submitting Request...
                </>
              ) : (
                `Submit Request${requestType === 'primary' && courseCreationMode === 'syllabus' && generatedMaterials.length > 0 ? ` with ${generatedMaterials.filter(m => m.published).length} Materials` : ''}`
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

export default RequestEducatorPermissionsForm;