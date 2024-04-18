// AddBuild.jsx
import React, { useState } from 'react';

import { useUser } from '../../contexts/UserContext';

import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from '../../config/firestore';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';

import TextEditor from './TextEditor';
import ImageUpload from './ImageUpload'; // Import ImageUpload component
import FileUpload from './FileUpload'; // Import FileUpload component

const AddBuild = ({ designId, setIsAddingBuild, refreshBuilds }) => {
  const [buildTitle, setBuildTitle] = useState('');
  const [buildDescription, setBuildDescription] = useState('');
  const [images, setImages] = useState([]); // State to store images
  const [files, setFiles] = useState([]); // State to store files
  const { userDetails } = useUser();

  console.log("AddBuild loaded");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  console.log('Adding New Build by user:', userDetails);

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAddBuild = async (e) => {
    e.preventDefault();

    // Check if the user object is defined and has a uid property
    if (!userDetails || !userDetails.uid) {
      console.error("UserDetails object is undefined or missing UID.");
      // Inform the user that authentication is needed
      setDialogContent("You must be signed in to add a build.");
      setDialogOpen(true);
      return;
    }

    if (!buildDescription) {
      setDialogContent("Build description is required.");
      setDialogOpen(true);
      return;
    }

    try {
      // Inside the handleAddBuild function or equivalent
      const docRef = await addDoc(collection(db, "builds"), {
        title: buildTitle,
        description: buildDescription,
        design_ID: designId,
        dateCreated: serverTimestamp(), 
        userId: userDetails.uid, // Assuming you have access to the current user's UID
        images: images.map(img => ({ url: img.url, title: img.title })), // Include image URLs and titles
        files: files.map(file => ({ url: file.url, name: file.name }))
      });

      console.log("Build added with ID: ", docRef.id);
      console.log('Added New Build by user:', userDetails);
  
      // Update and display the success message
      setSnackbarMessage('Your build has been successfully added.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    
      // Delay hiding the AddBuild component to ensure the Snackbar is visible
      setTimeout(() => {
        setBuildTitle(''); // Reset the title input field
        setBuildDescription(''); // Reset the input field
        setImages([]); // Reset the images
        setFiles([]); // Reset the files
        setIsAddingBuild(false); // Hide the AddBuild component
        refreshBuilds();  // Refresh builds
      }, 1000); // Delay of 1 second
      
    } catch (error) {
      console.error("Error adding build: ", error);
    
      // Set a default error message
      let errorMessage = `Failed to add the build. ${error.message || "Please try again later."}`;
    
      // Customize the message for a permission-denied error
      if (error.code === "permission-denied") {
        errorMessage = "You do not have permission to perform this operation.";
      }
    
      // Use the Snackbar for displaying the error message
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleAddBuild}>
        <label htmlFor="buildTitle">Title</label>
        <input
          id="buildTitle"
          type="text"
          value={buildTitle}
          onChange={e => setBuildTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '20px' }}
        />
        <label htmlFor="buildDescription">Description</label>
        <TextEditor onChange={setBuildDescription} /> {/* Use TextEditor for build description */}
        <ImageUpload 
          path={`builds/${designId}/images`} // Ensure the path is unique for each build
          images={images}
          setImages={setImages}
        />
        <FileUpload 
          path={`builds/${designId}/files`} // Adjust the path to organize files separately
          files={files}
          setFiles={setFiles}
        />
        <div className="flex-space-between">
          <input type="submit" value="Save" className="button muted-button"/>
        </div>
      </form>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>OK</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddBuild;