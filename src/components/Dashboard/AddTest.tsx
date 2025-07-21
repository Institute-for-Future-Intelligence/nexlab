// AddTest.tsx
import React, { useState } from 'react';

import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from '../../config/firestore';

import { useUser } from '../../contexts/UserContext';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';

import TextEditor from './TextEditor'; 
import ImageUpload from './ImageUpload'; // Import ImageUpload component
import FileUpload from './FileUpload'; // Import FileUpload component

import { Image, FileDetails } from '../../types/types';

interface AddTestProps {
  designId: string;
  buildId: string;
  refreshTests: (buildId: string) => void;
  setAddingTestIdForBuild: (isAdding: boolean) => void;
  onImagesUpdated?: (images: any) => void;
  onFilesChange?: (files: any) => void;
}

const AddTest: React.FC<AddTestProps> = ({ designId, buildId, refreshTests, setAddingTestIdForBuild }) => {
  const [testTitle, setTestTitle] = useState<string>('');
  const [testDescription, setTestDescription] = useState<string>('');
  const [testResults, setTestResults] = useState<string>('');
  const [testConclusions, setTestConclusions] = useState<string>('');
  const [testImages, setTestImages] = useState<Image[]>([]);
  const [testFiles, setTestFiles] = useState<FileDetails[]>([]);

  const { userDetails } = useUser();

  console.log("AddTest loaded");

  // States for Dialog and Snackbar
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const handleTestFilesChange = (newFiles: FileDetails[]) => {
    setTestFiles(newFiles);
  };

  const handleAddTest = async () => {
    if (!testDescription) {
      setDialogContent("Test description cannot be empty!");
      setDialogOpen(true);
      return;
    }

    const filteredImagesTest = testImages.filter(img => !img.deleted); // Only save images that aren't marked as deleted

    const filteredFilesTest = testFiles.filter(file => !file.deleted).map(file => ({
      id: file.id,
      url: file.url,
      name: file.name,
      path: file.path
    }));

    try {
      await addDoc(collection(db, "tests"), {
        title: testTitle,
        build_ID: buildId,
        design_ID: designId,
        dateCreated: serverTimestamp(), 
        description: testDescription,
        results: testResults,
        conclusions: testConclusions,
        userId: userDetails?.uid,  // Ensure you check for userDetails existence before accessing uid
        images: filteredImagesTest,  // This now includes all image data including URL, title, path
        files: filteredFilesTest // Include file URLs and names
      });

      // Delay the rest of the operations to ensure the Snackbar is visible
      setTimeout(() => {
        refreshTests(buildId)
        setTestTitle(''); // Reset the title input field
        setTestDescription(''); // Reset the title description field
        setTestResults(''); // Reset the title results field
        setTestConclusions(''); // Reset the title conclusions field
        setTestImages([]); // Reset the images
        setTestFiles([]); // Reset the files
        setAddingTestIdForBuild(false); // Hide the input form if needed

        // Consider even redirecting or triggering other UI changes here
      }, 1000); // Adjust the delay as needed, but ensure it's slightly less than the Snackbar's autoHideDuration

      // Set and display the success message
      setSnackbarMessage("Test added successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

    } catch (error) {
      console.error("Error adding test: ", error);

      setSnackbarMessage("Failed to add the test");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <label className="testTitles" htmlFor="testTitle">Title</label>
      <input
          id="testTitle"
          type="text"
          value={testTitle}
          onChange={e => setTestTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '20px' }}
      />
      <label className="testTitles" htmlFor="testDescription">Description</label>
      <TextEditor onChange={setTestDescription} initialValue={testDescription} />
      <label className="testTitles" htmlFor="testResults">Results</label>
      <TextEditor onChange={setTestResults} initialValue={testResults} />
      <label className="testTitles" htmlFor="testConclusions">Conclusions</label>
      <TextEditor onChange={setTestConclusions} initialValue={testConclusions} />
      <ImageUpload 
        path={`tests/${buildId}/images`} 
        initialImages={testImages}
        onImagesUpdated={(updatedImages) => {
          setTestImages(updatedImages);
        }}
        onDelete={(deletedImages) => setTestImages(currentImages => currentImages.filter(image => !deletedImages.includes(image)))}
        isOwnDesign={true}
      />
      <FileUpload 
        path={`tests/${buildId}/files`} 
        initialFiles={testFiles}
        onFilesChange={handleTestFilesChange}
        isOwnDesign={true}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleAddTest}>Save</button>
        <button style={{ marginLeft: '12px' }} onClick={() => setAddingTestIdForBuild(false)} className="button muted-button">Cancel</button> 
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{"Notification"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddTest;
