// Add.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Snackbar, 
  Alert, 
  SnackbarCloseReason, 
  MenuItem, 
  Select,
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';

import { useUser } from '../../hooks/useUser';
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from '../../config/firestore'

import ImageUpload, { ImageUploadHandle } from './ImageUpload'; 
import TextEditor from './TextEditor'; 
import FileUpload from './FileUpload'; 

import { NewDesign, Design, Image, FileDetails } from '../../types/types'; // Import the interfaces

// Define an interface for the props
interface AddProps {
  designs: Design[];
  setDesigns: React.Dispatch<React.SetStateAction<Design[]>>;
  setIsAdding: (isAdding: boolean) => void;
  getDesigns: () => void;
  onReturnToDashboard: () => void;
}

const Add: React.FC<AddProps> = ({ designs, setDesigns, setIsAdding, getDesigns, onReturnToDashboard }) => {
  const { userDetails } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  console.log("Add Design loaded");

  const [description, setDesignDescription] = useState('');
  const [course, setCourse] = useState(''); // New state for course selection
  
  const [title, setTitle] = useState('');

  const [images, setImages] = useState<Image[]>([]); // This now handles multiple images
  const [files, setFiles] = useState<FileDetails[]>([]);  // State for storing file information

  const initialImagesMemo = useMemo(() => images, [images]);

  // Newly added state variables for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<"info" | "error" | "success" | "warning">("info");

  // State for handling Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');

  console.log('Adding New Design from user:', userDetails);

  const imageUploadRef = useRef<ImageUploadHandle>(null);

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSnackbarClose =  (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Set default course when component mounts
  useEffect(() => {
    if (userDetails?.classes) {
      const firstCourse = Object.keys(userDetails.classes)[0]; // Select the first course ID as the default
      setCourse(firstCourse || ""); // If no courses, set to an empty string
    }
  }, [userDetails?.classes]);
  
  const saveDesign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Files to be saved:", files);

    // Check if the user object is defined and has a uid property
    if (!userDetails || !userDetails.uid) {
      console.error("User object is undefined or missing UID.");
      setDialogContent('You must be signed in to add a design.');
      setDialogOpen(true);
      return;
    }
  
    if (!description) {
      setDialogContent('All fields are required.');
      setDialogOpen(true);
      return;
    }

    await imageUploadRef.current?.commitDeletions();

    const filteredImages = images.filter(img => !img.deleted); // Only save images that aren't marked as deleted

    const filteredFiles = files.filter(file => !file.deleted).map(file => ({
      id: file.id,
      url: file.url,
      name: file.name,
      path: file.path
    }));
  
    const newDesign: NewDesign = {
      title: title,
      description: description,
      course: course, // Include course in the design data
      dateCreated: serverTimestamp(), // FieldValue during write
      dateModified: serverTimestamp(), // FieldValue during write
      images: filteredImages, // Pass filtered images
      files: filteredFiles,  // Only include non-deleted files
      userId: userDetails.uid, // Use the user's ID to associate the design with the user
    };     
  
    try {
      const docRef = await addDoc(collection(db, "designs"), newDesign);
      const addedDesign: Design = { ...newDesign, id: docRef.id };
      setDesigns([...designs, addedDesign]); // Update state correctly
      setSnackbarMessage(`${title} has been Added.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Resetting form states here
      setTitle('');
      setDesignDescription('');
      setImages([]);
      setFiles([]);  // Reset the files state
      
      setTimeout(() => {
        setIsAdding(false); // Or any other operation that might hide the Snackbar
        getDesigns();
      }, 1000); // Adjust delay as needed, but ensure it's at least as long as the Snackbar's autoHideDuration
    } catch (error) {
      console.log(error);
      setDialogContent('There was an issue adding your design.');
      setDialogOpen(true);
    }
  };
  
  return (
    <Box sx={{ 
      p: isMobile ? spacing[3] : spacing[6], 
      backgroundColor: colors.background.primary, 
      minHeight: '100vh' 
    }}>
      {/* Header Section */}
      <Box sx={{ mb: spacing[6] }}>
        <Button
          variant="text"
          onClick={onReturnToDashboard}
          sx={{
            fontFamily: typography.fontFamily.secondary,
            fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
            color: colors.primary[600],
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            mb: spacing[4],
            '&:hover': {
              backgroundColor: colors.primary[100],
              color: colors.primary[700],
            },
            transition: animations.transitions.fast,
          }}
        >
          &larr; All Designs
        </Button>

        <Paper 
          sx={{ 
            p: isMobile ? spacing[4] : spacing[6], 
            backgroundColor: colors.primary[50], 
            borderRadius: borderRadius['2xl'], 
            border: `1px solid ${colors.primary[200]}`,
            boxShadow: shadows.sm,
          }}
        >
          <Typography 
            variant="h2"
            sx={{
              fontFamily: typography.fontFamily.display,
              fontSize: isMobile ? typography.fontSize['3xl'] : typography.fontSize['5xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.primary[700],
              lineHeight: typography.lineHeight.tight,
              mb: spacing[2],
            }}
          >
            Create New Design
          </Typography>
          <Typography 
            variant="body1"
            sx={{
              fontFamily: typography.fontFamily.primary,
              fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
              color: colors.text.secondary,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            Design and document your laboratory experiments and research projects
          </Typography>
        </Paper>
      </Box>

      {/* Form Section */}
      <Paper 
        sx={{ 
          p: isMobile ? spacing[4] : spacing[6], 
          backgroundColor: colors.background.elevated,
          borderRadius: borderRadius['2xl'], 
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.lg,
        }}
      >
        <form onSubmit={saveDesign}>
          {/* Title Field */}
          <Box sx={{ mb: spacing[5] }}>
            <TextField
              id="title"
              label="Design Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: borderRadius.lg,
                  fontFamily: typography.fontFamily.primary,
                  fontSize: typography.fontSize.base,
                },
                '& .MuiInputLabel-root': {
                  fontFamily: typography.fontFamily.secondary,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                },
              }}
            />
          </Box>

          {/* Course Selection */}
          <Box sx={{ mb: spacing[5] }}>
            <FormControl fullWidth required>
              <InputLabel 
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Course
              </InputLabel>
              <Select
                id="course"
                value={course}
                onChange={e => setCourse(e.target.value)}
                disabled={!userDetails?.classes || Object.keys(userDetails.classes).length === 0}
                sx={{
                  borderRadius: borderRadius.lg,
                  fontFamily: typography.fontFamily.primary,
                  fontSize: typography.fontSize.base,
                }}
              >
                {(userDetails?.classes ? Object.entries(userDetails.classes) : [])
                  .map(([courseId, courseDetails]) => (
                    <MenuItem key={courseId} value={courseId}>
                      {`${courseDetails.number} - ${courseDetails.title}`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          {/* Description Section */}
          <Box sx={{ mb: spacing[5] }}>
            <Typography 
              variant="h5"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                mb: spacing[3],
              }}
            >
              Design Description
            </Typography>
            
            <Paper 
              sx={{ 
                p: spacing[4], 
                backgroundColor: colors.background.secondary,
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.neutral[200]}`,
                mb: spacing[3],
              }}
            >
              <Typography 
                variant="body2"
                sx={{
                  fontFamily: typography.fontFamily.primary,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  mb: spacing[2],
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Please include the following elements in your description:
              </Typography>
              <Box component="ul" sx={{ 
                pl: spacing[4], 
                m: 0,
                '& li': {
                  fontFamily: typography.fontFamily.primary,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  mb: spacing[1],
                }
              }}>
                <li>Objective: What is the goal for this design?</li>
                <li>Rationale: Why is this new design being done?</li>
                <li>Selected Target Identified: What is the target for the design being made?</li>
                <li>Functional Modification: What is being done to this target?</li>
                <li>Overview/Plan for making the modification: What are the steps to be carried out to meet the objective?</li>
              </Box>
            </Paper>

            <TextEditor onChange={setDesignDescription} initialValue={description} />
          </Box>

          <Divider sx={{ my: spacing[5] }} />

          {/* File Upload Sections */}
          <Box sx={{ mb: spacing[5] }}>
            <Typography 
              variant="h5"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                mb: spacing[3],
              }}
            >
              Attachments
            </Typography>
            
            <ImageUpload 
              ref={imageUploadRef}
              path="designs/images"
              initialImages={initialImagesMemo}
              onImagesUpdated={setImages}
              onDelete={(deletedImages) => setImages(images.filter(img => !deletedImages.includes(img)))}
              isOwnDesign={true}
            />
            
            <Box sx={{ mt: spacing[4] }}>
              <FileUpload
                path="designs/files" 
                initialFiles={files}
                onFilesChange={setFiles}
                isOwnDesign={true}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: spacing[3],
            mt: spacing[6],
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <Button 
              onClick={() => setIsAdding(false)} 
              variant="outlined"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                textTransform: 'none',
                px: spacing[6],
                py: spacing[3],
                borderRadius: borderRadius.xl,
                borderColor: colors.error,
                color: colors.error,
                '&:hover': {
                  borderColor: colors.error,
                  backgroundColor: colors.error + '10',
                  boxShadow: shadows.md,
                },
                transition: animations.transitions.fast,
              }}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                textTransform: 'none',
                px: spacing[6],
                py: spacing[3],
                backgroundColor: colors.primary[500],
                borderRadius: borderRadius.xl,
                boxShadow: shadows.md,
                '&:hover': {
                  backgroundColor: colors.primary[600],
                  boxShadow: shadows.lg,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                transition: animations.transitions.fast,
              }}
            >
              Create Design
            </Button>
          </Box>
        </form>
      </Paper>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: borderRadius['2xl'],
            boxShadow: shadows.xl,
          }
        }}
      >
        <DialogTitle 
          id="alert-dialog-title"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
          }}
        >
          Notification
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="alert-dialog-description"
            sx={{
              fontFamily: typography.fontFamily.primary,
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
            }}
          >
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            autoFocus
            sx={{
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              textTransform: 'none',
              borderRadius: borderRadius.lg,
            }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={1000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            borderRadius: borderRadius.lg,
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSize.base,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Add;