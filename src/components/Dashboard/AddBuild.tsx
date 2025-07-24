// AddBuild.tsx
import React, { useState } from 'react';

import { useUser } from '../../hooks/useUser';

import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from '../../config/firestore';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';

import TextEditor from './TextEditor';
import ImageUpload from './ImageUpload'; // Import ImageUpload component
import FileUpload from './FileUpload'; // Import FileUpload component

import { Image, FileDetails } from '../../types/types'; // Import the necessary types

interface AddBuildProps {
  designId: string;
  setIsAddingBuild: (isAdding: boolean) => void;
  refreshBuilds: () => void;
  onImagesUpdated?: (images: Image[]) => void;
  onFilesChange?: (files: FileDetails[]) => void;
}

const AddBuild: React.FC<AddBuildProps> = ({ designId, setIsAddingBuild, refreshBuilds }) => {
  const [buildTitle, setBuildTitle] = useState<string>('');
  const [buildDescription, setBuildDescription] = useState<string>('');
  const [buildImages, setBuildImages] = useState<Image[]>([]);
  const [buildFiles, setBuildFiles] = useState<FileDetails[]>([]); // Initialize as an array
  const { userDetails } = useUser();

  const handleImagesChange = (newImages: Image[]) => {
    setBuildImages(newImages);
  };

  const handleFilesChange = (newFiles: FileDetails[]) => {
    setBuildFiles(newFiles);
  };

  console.log("AddBuild loaded");

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  console.log('Adding New Build by user:', userDetails);

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAddBuild = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const filteredImagesBuild = buildImages.filter(img => !img.deleted); // Only save images that aren't marked as deleted

    const filteredFiles = buildFiles.filter(file => !file.deleted).map(file => ({
      id: file.id,
      url: file.url,
      name: file.name,
      path: file.path
    }));

    try {
      // Inside the handleAddBuild function or equivalent
      const docRef = await addDoc(collection(db, "builds"), {
        title: buildTitle,
        description: buildDescription,
        design_ID: designId,
        dateCreated: serverTimestamp(), 
        userId: userDetails.uid, // Assuming you have access to the current user's UID
        images: filteredImagesBuild,  // This now includes all image data including URL, title, path
        files: filteredFiles
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
        setBuildImages([]); // Reset the images
        setBuildFiles([]); // Reset the files
        setIsAddingBuild(false); // Hide the AddBuild component
        refreshBuilds();  // Refresh builds
      }, 1000); // Delay of 1 second
      
    } catch (error) {
      console.error("Error adding build: ", error);
    
      if (error instanceof Error) {
        let errorMessage = `Failed to add the build. ${error.message}`;
        if (error.message === "permission-denied") {
          errorMessage = "You do not have permission to perform this operation.";
        }
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Failed to add the build. Please try again later.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleAddBuild}>
        <label className="buildTitles" htmlFor="buildTitle">Title</label>
        <input
          id="buildTitle"
          type="text"
          value={buildTitle}
          onChange={e => setBuildTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '20px' }}
        />
        <label className="buildTitles" htmlFor="buildDescription">Description</label>
        <TextEditor onChange={setBuildDescription} initialValue={buildDescription} /> {/* Use TextEditor for build description */}
        <ImageUpload 
          path={`builds/${designId}/images`} // Ensure the path is unique for each build
          initialImages={buildImages}
          onImagesUpdated={handleImagesChange}
          onDelete={(deletedImages) => setBuildImages(currentImages => currentImages.filter(image => !deletedImages.includes(image)))}
          isOwnDesign={true}
        />
        <FileUpload 
          path={`builds/${designId}/files`} // Adjust the path to organize files separately
          initialFiles={buildFiles}
          onFilesChange={handleFilesChange} // Directly set files from FileUpload
          isOwnDesign={true}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <input type="submit" value="Save"/>
          <button style={{ marginLeft: '12px' }} onClick={() => setIsAddingBuild(false)} className="button muted-button">Cancel</button> 
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