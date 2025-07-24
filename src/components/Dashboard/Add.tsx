// Add.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, SnackbarCloseReason, MenuItem, Select } from '@mui/material';

import { useUser } from '../../contexts/UserContext';
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
    <div className="small-container">
      <Button
            variant="text"
            onClick={onReturnToDashboard}
            className="profile-button"
        >
            &larr; All Designs
      </Button>
      <div className="design-record">
        <form onSubmit={saveDesign}>
          <h1 className="designHeader">New Design</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 8, marginRight: '12px' }}>
              <label className="designTitles" htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%' }} // Make sure the input fills the div        
              />
            </div>
          </div>

          {/* Course Selection Dropdown */}
          <label className="designTitles" htmlFor="course">Course</label>
          <Select
            id="course"
            value={course}
            onChange={e => setCourse(e.target.value)}
            fullWidth
            disabled={!userDetails?.classes || Object.keys(userDetails.classes).length === 0}
          >
            {(userDetails?.classes ? Object.entries(userDetails.classes) : [])
              .map(([courseId, courseDetails]) => (
                <MenuItem key={courseId} value={courseId}>{`${courseDetails.number} - ${courseDetails.title}`}</MenuItem>
              ))}
          </Select>

          <label className="designTitles" htmlFor="description">Description</label>
          <ul>
              <li>Objective: What is the goal for this design?</li>
              <li>Rationale: Why is this new design being done?</li>
              <li>Selected Target Identified: What is the target for the design being made?</li>
              <li>Functional Modification: What is being done to this target?</li>
              <li>Overview/Plan for making the modification: What are the steps to be carried out to meet the objective?</li>
          </ul>
          <TextEditor onChange={setDesignDescription} initialValue={description} />
          <ImageUpload 
            ref={imageUploadRef}
            path="designs/images"
            initialImages={initialImagesMemo}
            onImagesUpdated={setImages}
            onDelete={(deletedImages) => setImages(images.filter(img => !deletedImages.includes(img)))}
            isOwnDesign={true}
          />
          <FileUpload  // Include the FileUpload component in the form
            path="designs/files" 
            initialFiles={files}
            onFilesChange={setFiles} // Ensure this is correctly passed and used
            isOwnDesign={true}
          />
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                fontSize: '1rem',
                mt: 2, 
                textTransform: 'none',
                boxShadow: 'none', 
                '&:hover': {
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                border: '1px solid transparent',
              }}
            >
              Add
            </Button>
            <Button 
              onClick={() => setIsAdding(false)} 
              style={{ marginLeft: '12px' }} 
              variant="outlined"
              sx={{ 
                fontSize: '1rem',
                mt: 2, 
                textTransform: 'none',
                color: 'currentColor',
                borderColor: 'rgba(255, 0, 0, 0.5)',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'rgba(255, 0, 0, 0.7)',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                  color: 'currentColor',
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out, background-color 0.3s ease-in-out',
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Notification"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={1000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Add;