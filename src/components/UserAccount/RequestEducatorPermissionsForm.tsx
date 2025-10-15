// src/components/UserAccount/RequestEducatorPermissionsForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  CircularProgress, 
  MenuItem, 
  SelectChangeEvent, 
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Grid
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
import { 
  FormContainer, 
  FormSection, 
  FormField, 
  FormSelect, 
  FormActions, 
  FormActionButton,
  generateInstructorRequestSubmissionEmail,
  createEmailDocument,
  type InstructorRequestSubmissionData
} from '../common';
import { colors, typography } from '../../config/designSystem';

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
  
      // Send email notification to super-admins
      const adminEmailDoc = {
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
            <p><a href="https://nexlab.bio/educator-requests">
            Click here to review the request.
            </a></p>
          `,
        },
      };
      await addDoc(collection(db, 'mail'), adminEmailDoc);

      // Send user-friendly email notification to the user
      const userEmailData: InstructorRequestSubmissionData = {
        firstName,
        lastName,
        email,
        institution,
        courseNumber,
        courseTitle,
        requestType: requestType as 'primary' | 'co-instructor',
        courseCreationMode: requestType === 'primary' ? courseCreationMode : undefined,
        generatedMaterialsCount: requestType === 'primary' && courseCreationMode === 'syllabus' ? generatedMaterials.filter(m => m.published).length : undefined,
        requestId: educatorRequestRef.id,
        submittedAt: new Date().toISOString()
      };

      const userEmailHtml = generateInstructorRequestSubmissionEmail(userEmailData);
      const userEmailDoc = createEmailDocument(
        [email],
        'Instructor Request Submitted - NexLAB',
        userEmailHtml
      );
      await addDoc(collection(db, 'mail'), userEmailDoc);
  
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
    <FormContainer 
      title="Request Educator Permissions"
      subtitle="Request permissions to create courses or join existing courses as a co-instructor."
    >

      {/* Request Type Selection */}
      <FormSection 
        title="Request Type"
        description="Select the type of educator permissions you are requesting."
      >
        <FormSelect
          label="Request Type"
          value={requestType}
          onChange={handleSelectChange}
          required
          disabled={loading}
          helperText="Choose whether you want to create a new course or join an existing one"
        >
          <MenuItem value="primary">I am a primary course instructor, I want to create a new course</MenuItem>
          <MenuItem value="co-instructor">I am a co-instructor, I want to be added to an existing course</MenuItem>
        </FormSelect>
      </FormSection>

      {/* Personal Information Section */}
      <FormSection 
        title="Personal Information"
        description="Provide your contact and institutional details."
        showDivider
      >
        {/* First and Last Name - Two column layout */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormField
              label="First Name"
              value={firstName}
              onChange={handleInputChange(setFirstName)}
              required
              disabled={loading}
              placeholder="John"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormField
              label="Last Name"
              value={lastName}
              onChange={handleInputChange(setLastName)}
              required
              disabled={loading}
              placeholder="Doe"
            />
          </Grid>
        </Grid>

        {/* Institution and Email - Two column layout */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormField
              label="Institution Affiliation"
              value={institution}
              onChange={handleInputChange(setInstitution)}
              required
              disabled={loading}
              placeholder="University Name"
              helperText="The name of your educational institution"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormField
              label="Institutional Email"
              type="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              disabled={loading}
              placeholder="name@institution.edu"
              helperText="Please use your institutional email to confirm your affiliation"
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Course Details Section */}
      <FormSection 
        title={requestType === 'primary' ? 'New Course Details' : 'Existing Course Details'}
        description={requestType === 'primary' 
          ? 'Provide details for the course you want to create.'
          : 'Provide details about the existing course you want to join.'
        }
        showDivider
      >

        {/* Course Creation Mode Toggle - Only for Primary Instructors */}
        {requestType === 'primary' && (
          <Paper sx={{ p: 3, mb: 4, backgroundColor: 'grey.50' }}>
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

            <Paper sx={{ 
              p: 2, 
              backgroundColor: 'primary.50', 
              border: '1px solid', 
              borderColor: 'primary.200',
              fontFamily: typography.fontFamily.primary,
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
            }}>
              {courseCreationMode === 'manual' 
                ? 'Fill out the course information manually using the form below.'
                : 'Upload your syllabus document and we\'ll automatically extract course information and generate materials.'
              }
            </Paper>
          </Paper>
        )}

        {/* Syllabus Import Mode - Only for Primary Instructors */}
        {requestType === 'primary' && courseCreationMode === 'syllabus' && (
          <SyllabusImport
            onComplete={handleSyllabusComplete}
            onCancel={() => setCourseCreationMode('manual')}
          />
        )}

        {/* Course Information Form Fields - Show for manual mode OR co-instructor */}
        {(requestType === 'co-instructor' || (requestType === 'primary' && courseCreationMode === 'manual')) && (
          <>
            {/* Course Number and Title - Two column layout (25%/75%) */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormField
                  label="Course Number"
                  value={courseNumber}
                  onChange={handleInputChange(setCourseNumber)}
                  required
                  disabled={loading}
                  placeholder="e.g., BIOL301"
                  helperText="Enter the official course number or code"
                />
              </Grid>
              <Grid item xs={12} md={9}>
                <FormField
                  label="Course Title"
                  value={courseTitle}
                  onChange={handleInputChange(setCourseTitle)}
                  required
                  disabled={loading}
                  placeholder="e.g., Biotech Research Methods"
                  helperText="Enter the full course title"
                />
              </Grid>
            </Grid>
            
            {/* Course Description - Only for Primary Instructors */}
            {requestType === 'primary' && (
              <FormField
                label="Course Description"
                value={courseDescription}
                onChange={handleInputChange(setCourseDescription)}
                required
                disabled={loading}
                multiline
                rows={4}
                placeholder="A comprehensive course covering advanced methods and tools in modern biotech labs, focusing on CRISPR, NGS, and bioinformatics."
                helperText="Describe the course content, objectives, and learning outcomes"
              />
            )}
          </>
        )}

      </FormSection>
      
      {/* Submit Button - Show when ready */}
      {(requestType === 'co-instructor' || 
        (requestType === 'primary' && courseCreationMode === 'manual') || 
        isSyllabusComplete) && (
        <FormActions align="space-between">
          <FormActionButton
            variant="text"
            onClick={() => navigate('/my-profile')}
            disabled={loading}
          >
            Cancel
          </FormActionButton>
          
          <FormActionButton
            variant="primary"
            onClick={handleRequestPermissions}
            disabled={loading || isSyllabusInProgress}
            loading={loading}
          >
            {requestType === 'primary' && courseCreationMode === 'syllabus' && generatedMaterials.length > 0 
              ? `Submit with ${generatedMaterials.filter(m => m.published).length} Materials`
              : 'Submit'
            }
          </FormActionButton>
        </FormActions>
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
    </FormContainer>
  );
};

export default RequestEducatorPermissionsForm;