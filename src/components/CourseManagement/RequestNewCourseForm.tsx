// src/components/CourseManagement/RequestNewCourseForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Grid,
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
import { useSyllabusStore, ParsedCourseInfo, GeneratedMaterial } from '../../stores/syllabusStore';
import { 
  FormContainer, 
  FormSection, 
  FormField, 
  FormActions, 
  FormActionButton 
} from '../common';
import { colors, typography } from '../../config/designSystem';

type CourseCreationMode = 'manual' | 'syllabus';

// Utility function to recursively remove undefined values from objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    aiExtractedInfo,
    storedSyllabusFile,
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

  const handleSyllabusComplete = (data: { courseInfo: ParsedCourseInfo; materials: GeneratedMaterial[] }) => {
    console.log('Syllabus import completed:', data);
    // Automatically trigger course creation when syllabus import is complete
    handleRequestNewCourse();
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
      const baseRequestDoc = {
        uid: userDetails?.uid || '',
        courseNumber: courseNumber || '',
        courseTitle: courseTitle || '',
        courseDescription: courseDescription || '',
        status: 'pending',
        timestamp: new Date(), // Keep Date object as-is for Firebase
        syllabusImported: false
      };

      // Add syllabus data if imported
      if (creationMode === 'syllabus' && parsedCourseInfo && generatedMaterials.length > 0) {
        const syllabusData = {
          parsedCourseInfo: parsedCourseInfo,
          generatedMaterials: generatedMaterials.filter(m => m.published),
          // Include additional information from AI extraction
          additionalInfo: aiExtractedInfo ? {
            contactInfo: aiExtractedInfo.contactInfo,
            policies: aiExtractedInfo.policies,
            additionalResources: aiExtractedInfo.additionalResources,
            labSpecific: aiExtractedInfo.labSpecific,
            textbooks: aiExtractedInfo.textbooks,
            gradingPolicy: aiExtractedInfo.gradingPolicy,
            assignments: aiExtractedInfo.assignments,
            prerequisites: aiExtractedInfo.prerequisites
          } : null,
          // Include syllabus file reference
          syllabusFile: storedSyllabusFile ? {
            url: storedSyllabusFile.url,
            path: storedSyllabusFile.path,
            metadata: storedSyllabusFile.metadata
          } : null
        };
        
        // Clean the syllabus data to remove any undefined values
        const cleanedSyllabusData = cleanDataForFirebase(syllabusData);
        
        baseRequestDoc.syllabusImported = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (baseRequestDoc as any).syllabusData = cleanedSyllabusData;
      }

      // Clean the entire document to ensure no undefined values (but preserve Date objects)
      const requestDoc = cleanDataForFirebase(baseRequestDoc);
      
      console.log('Submitting clean request document:', requestDoc);
  
      // Add the course request document
      const courseRequestRef = await addDoc(collection(db, 'courseRequests'), requestDoc);
  
      // Enhanced email notification
      const emailDoc = {
        to: ['andriy@intofuture.org'],
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
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      
      setDialogContent('Error submitting your course request. Please try again.');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };  

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };


  // Check if we're in the middle of syllabus import process
  const isSyllabusInProgress = creationMode === 'syllabus' && currentStep !== 'upload' && !parsedCourseInfo;
  
  // Check if syllabus import is complete and ready for submission
  // Materials preview shows when currentStep is 'editing' or 'complete'
  const isSyllabusComplete = creationMode === 'syllabus' && 
    (currentStep === 'review' || currentStep === 'editing' || currentStep === 'complete') && 
    parsedCourseInfo;

  return (
    <FormContainer 
      title="Request New Course"
      subtitle="Create a new course by entering course information manually or importing from a syllabus document."
    >

      {/* Mode Selection */}
      <FormSection 
        title="Course Creation Method"
        description="Choose how you would like to create your course."
      >
        <Paper sx={{ p: 3, mb: 4, backgroundColor: 'grey.50' }}>
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

          <Paper sx={{ 
            p: 2, 
            backgroundColor: 'primary.50', 
            border: '1px solid', 
            borderColor: 'primary.200',
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
          }}>
            {creationMode === 'manual' 
              ? 'Fill out the course information manually using the form below.'
              : 'Upload your syllabus document and we\'ll automatically extract course information and generate materials.'
            }
          </Paper>
        </Paper>
      </FormSection>

      {/* Syllabus Import Mode */}
      {creationMode === 'syllabus' && (
        <FormSection 
          title="Syllabus Import"
          description="Upload your syllabus document to automatically extract course information."
          showDivider
        >
          <SyllabusImport
            onComplete={handleSyllabusComplete}
            onCancel={() => setCreationMode('manual')}
            educatorUid={userDetails?.uid}
          />
        </FormSection>
      )}

      {/* Manual Form Fields - Only show in manual mode */}
      {creationMode === 'manual' && (
        <FormSection 
          title="Course Information"
          description="Provide the basic details for your course."
          showDivider
        >
          {/* Course Number and Title in one line */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
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
            
            <Grid item xs={12} md={8}>
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
        </FormSection>
      )}

      {/* Submit Button - Show for both modes with different conditions */}
      {(creationMode === 'manual' || isSyllabusComplete) && (
        <FormActions align="space-between">
          <FormActionButton
            variant="text"
            onClick={() => navigate('/course-management')}
            disabled={loading}
          >
            Cancel
          </FormActionButton>
          
          <FormActionButton
            variant="primary"
            onClick={handleRequestNewCourse}
            disabled={loading || isSyllabusInProgress}
            loading={loading}
          >
            {creationMode === 'syllabus' && generatedMaterials.length > 0 
              ? `Submit Request with ${generatedMaterials.filter(m => m.published).length} Materials`
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

export default RequestNewCourseForm;