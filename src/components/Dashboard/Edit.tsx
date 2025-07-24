// Edit.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';

import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, orderBy, getDoc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";

import { getStorage, ref, deleteObject } from "firebase/storage";

import { db } from '../../config/firestore';

import AddBuild from './AddBuild';
import AddTest from './AddTest';

import ImageUpload from './ImageUpload';
import TextEditor from './TextEditor'; 
import FileUpload from './FileUpload'; 

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert,  MenuItem, Select } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';

import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';

import { Design, timestampToString } from '../../types/types'; // Import the Design type and the utility function

interface EditProps {
  designs: Design[];
  selectedDesign: Design | null;
  setDesigns: (designs: Design[]) => void;
  setIsEditing: (isEditing: boolean) => void;
  getDesigns: () => void;
  onReturnToDashboard: () => void;
}

const Edit: React.FC<EditProps> = ({ selectedDesign, setIsEditing, getDesigns, onReturnToDashboard }) => {
  
  // -- GENERAL CHECKS -- //
  const { userDetails, loading } = useUser();
  const id = selectedDesign.id;
  // Check if the current user is viewing their own design or another user's design
  const isOwnDesign = selectedDesign.userId === userDetails?.uid;
  console.log("Edit page loaded");
  console.log("Design ID:", id);
  console.log('Editing Design by user:', userDetails);

  // -- DESIGN SECTION STATES -- //
  const [title, setTitle] = useState('');
  const [description, setDesignDescription] = useState(selectedDesign.description);
  const [course, setCourse] = useState(selectedDesign.course || ''); // State for course selection
  const [dateCreated, setDateCreated] = useState<string | null>(timestampToString(selectedDesign.dateCreated));
  const [dateModified, setDateModified] = useState<string | null>(timestampToString(selectedDesign.dateModified));
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const imageUploadRef = useRef(null);

  // -- BUILD SECTION STATES -- //
  const [isAddingBuild, setIsAddingBuild] = useState(false);
  const [builds, setBuilds] = useState([]);
  const [editableBuildDescriptions, setEditableBuildDescriptions] = useState({});
  const [buildImages, setBuildImages] = useState({});
  const [buildFiles, setBuildFiles] = useState({});
  const addBuildFormRef = useRef(null);
  const [visibleBuildDetails, setVisibleBuildDetails] = useState({});
  // States for editing titles of Builds
  const [editableBuildTitles, setEditableBuildTitles] = useState({});

  // -- TEST SECTION STATES -- //
  const [testsByBuildId, setTestsByBuildId] = useState({});
  const [addingTestIdForBuild, setAddingTestIdForBuild] = useState(false);
  const [editableTestDescriptions, setEditableTestDescriptions] = useState({});
  const [editableTestResults, setEditableTestResults] = useState({});
  const [editableTestConclusions, setEditableTestConclusions] = useState({});
  const [testImages, setTestImages] = useState({});
  const [testFiles, setTestFiles] = useState({});
  const addTestFormRef = useRef(null);
  const [visibleTestDetails, setVisibleTestDetails] = useState({});
  // States for editing titles of Tests
  const [editableTestTitles, setEditableTestTitles] = useState({});
  const [collapsedTestsByBuild, setCollapsedTestsByBuild] = useState({});

  // -- UI NOTIFICATION STATES -- //
  // State for handling Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogConfirmAction, setDialogConfirmAction] = useState<() => void>(() => () => {});
  // State for Snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', etc.
  // State for tracking unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState({
    design: false, // You can add more sections as needed
    builds: false,
    tests: false,
  });


  // -- DESIGN SECTION -- //
  // --
  const updateDesign = async (e) => {
    e.preventDefault();

    if (!description) {
      setDialogContent('All fields are required.');
      setDialogOpen(true);
      return;
    }

    // Delete images if needed
    console.log("About to check image deletions", imageUploadRef.current);
    console.log(imageUploadRef.current)
    console.log(images.some(img => img.deleted))
    if (imageUploadRef.current && images.some(img => img.deleted)) {
      console.log("Committing deletions");
      await imageUploadRef.current.commitDeletions();
    }

    // Filter out images marked as deleted (this might be redundant if handled by commitDeletions)
    const activeImages = images.filter(img => !img.deleted);

      // Commit file deletions first
    if (files.some(file => file.deleted)) {
      await commitFileDeletions();
    }

    const activeFiles = files.filter(file => !file.deleted);

    // Construct the update object dynamically
    const updateObject = {
        title,
        description,
        course, // Include course in update
        dateModified: serverTimestamp(),
        images: activeImages.map(img => ({ url: img.url, title: img.title, path: img.path })),
        files: activeFiles.map(file => ({ id: file.id, url: file.url, name: file.name, path: file.path })),
        userId: userDetails.uid
    };

    try {
      await setDoc(doc(db, "designs", id), updateObject, { merge: true });
      setSnackbarMessage('Your design has been updated.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Manually update the dateModified state
      const now = Timestamp.now();
      setDateModified(timestampToString(now));

    } catch (error) {
      console.error("Error updating design:", error);
      setSnackbarMessage('There was an issue updating your design.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }

    // After successful update:
    setUnsavedChanges(prev => ({ ...prev, design: false }));
  };

  // useEffect hook for initializing form fields
  useEffect(() => {
    if (selectedDesign) {
      // Set title, description, and course directly from selectedDesign
      setDesignDescription(selectedDesign.description || '');
      setTitle(selectedDesign.title || '');
      setCourse(selectedDesign.course || '');

      // Fetch image URL from Firestore
      const fetchData = async () => {
        const designRef = doc(db, "designs", id);
        const docSnap = await getDoc(designRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Fetched images:', data.images); // Add this line to debug
          console.log('Fetched files:', data.files); // Add this line to debug
          setImages(data.images || []);
          setFiles(data.files || []);
          setDateCreated(timestampToString(data.dateCreated)); // Convert Timestamp to readable string
          setDateModified(timestampToString(data.dateModified)); // Convert Timestamp to readable string
        }
      };

      fetchData();
    }
  }, [selectedDesign, id]); // Included 'id' in the dependency array 

  const handleImageDeletions = (deletedImages) => {
    const remainingImages = images.filter(img => !deletedImages.some(delImg => delImg.path === img.path));
    console.log("Remaining images after deletion:", remainingImages);
    setImages(remainingImages);
    const imageUpdate = remainingImages.map(img => ({ url: img.url, title: img.title, path: img.path }));
    setDoc(doc(db, "designs", id), { images: imageUpdate }, { merge: true })
      .then(() => console.log("Firestore successfully updated"))
      .catch(error => console.error("Failed to update Firestore:", error));
  };  

  const handleImagesUpdated = (updatedImages) => {
    if (JSON.stringify(images) !== JSON.stringify(updatedImages)) {
      setImages(updatedImages);  // Update state with new image data
      console.log("Updated images received:", updatedImages);
    }
  };  

  const commitFileDeletions = async () => {
    const filesToDelete = files.filter(file => file.deleted);
    console.log("Files to delete:", filesToDelete);
  
    if (filesToDelete.length > 0) {
      // Assuming FileUpload uses Firebase Storage, and you have a delete function in FileUpload
      const storage = getStorage();
      const deletePromises = filesToDelete.map(file => {
        const fileRef = ref(storage, file.path);
        return deleteObject(fileRef);
      });
  
      try {
        await Promise.all(deletePromises);
        console.log("Files deleted successfully");
        // Remove the deleted files from the local state
        const remainingFiles = files.filter(file => !file.deleted);
        setFiles(remainingFiles);
  
        // Update Firestore to reflect the deletion
        await updateDoc(doc(db, "designs", selectedDesign.id), {
          files: remainingFiles.map(file => ({ id: file.id, url: file.url, name: file.name, path: file.path })),
        });
  
        setSnackbarMessage("Deleted files have been permanently removed.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Failed to delete files: ", error);
        setSnackbarMessage("Failed to delete files.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  }; 
  // -- //


  // -- BUILDS SECTION -- //
  const updateBuild = async (buildId) => {

    // Call commitBuildFileDeletions to handle file deletions
    // Handle file deletions first
    try {
      await commitBuildFileDeletions(buildId);
    } catch (error) {
      console.error("Error deleting files:", error);
      setSnackbarMessage('Failed to delete build files.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }

    // Filter out deleted images before sending update to Firestore
    const filteredBuildImages = buildImages[buildId]?.filter(img => !img.deleted).map(({ url, path, title }) => ({ url, path, title })) || [];
  
    // Filter out deleted files before updating Firestore
    const filteredFiles = buildFiles[buildId]?.filter(file => !file.deleted).map(file => ({
      id: file.id,  // Preserve the ID
      url: file.url,
      name: file.name,
      path: file.path
    })) || [];

    // Prepare the update data object and include only defined fields
    const updatedData: any = {};

    if (filteredBuildImages.length > 0) {
      updatedData.images = filteredBuildImages;
    }
    
    if (filteredFiles.length > 0) {
      updatedData.files = filteredFiles;
    }
    
    if (editableBuildDescriptions[buildId] !== undefined) {
      updatedData.description = editableBuildDescriptions[buildId];
    }    
  
    try {
      const buildRef = doc(db, "builds", buildId);
      await setDoc(buildRef, updatedData, { merge: true });
      setSnackbarMessage('Your build has been updated.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      refreshBuilds();
      setUnsavedChanges(prev => ({ ...prev, builds: false }));
    } catch (error) {
      console.error("Error updating build:", error);
      setSnackbarMessage('Failed to update build.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }; 

  const handleBuildTitleChange = (buildId, newTitle) => {
    setEditableBuildTitles(prev => ({ ...prev, [buildId]: newTitle }));
  };

  const handleBuildDescriptionChange = (buildId, value) => {
    setEditableBuildDescriptions(prev => ({ ...prev, [buildId]: value }));
    setUnsavedChanges(prev => ({ ...prev, builds: true }));
  };
  
  const saveBuildTitle = async (buildId) => {
    const newTitle = editableBuildTitles[buildId];
    try {
      // Update Firestore
      const buildRef = doc(db, "builds", buildId);
      await setDoc(buildRef, { title: newTitle }, { merge: true });
      // Update local state if necessary and reset editable state
      setEditableBuildTitles(prev => {
        const updated = { ...prev };
        delete updated[buildId]; // Remove the entry as it's no longer being edited
        return updated;
      });
      refreshBuilds(); // Refresh your builds to reflect the change
      // Optionally, show a success message
    } catch (error) {
      console.error("Failed to save build title:", error);
      // Show an error message to the user
    }
  };  

  // This function now focuses on refreshing builds only, with detailed console logging
  const refreshBuilds = async () => {
    if (!userDetails) {
      console.log("User details not loaded yet");
      return;
    }

    try {
      console.log("Refreshing builds for user UID:", userDetails?.uid);
      console.log("Selected design ID for query:", selectedDesign?.id);

      let buildsQuery;
      if (userDetails.isAdmin) {
        buildsQuery = query(
          collection(db, "builds"),
          where("design_ID", "==", id),
          orderBy("dateCreated")
        );
      } else {
        buildsQuery = query(
          collection(db, "builds"),
          where("design_ID", "==", id),
          where("userId", "==", userDetails.uid),
          orderBy("dateCreated")
        );
      }

      console.log("Builds query details:", JSON.stringify(buildsQuery, null, 2)); // Detailed query logging

      const buildsSnapshot = await getDocs(buildsQuery);
      console.log("Builds snapshot details:", JSON.stringify(buildsSnapshot.docs.map(doc => doc.data()), null, 2)); // Detailed snapshot logging

      console.log("Builds query successful, number of builds fetched: ", buildsSnapshot.docs.length);
    
      const newBuilds = buildsSnapshot.docs.map(doc => {
        console.log("Build doc path: ", doc.ref.path); // Log each build document path for tracking
        return { id: doc.id, ...(doc.data() as any) };
      });
    
      setBuilds(newBuilds);
      console.log("New builds state after refresh:", newBuilds); // Confirming the refreshed state
    } catch (error) {
      console.error("Error refreshing builds:", error); // Detailed error logging
      if (error.code === 'permission-denied') {
        console.error("Permission denied when trying to refresh builds:", error);
      } else {
        console.error("An unexpected error occurred when trying to refresh builds:", error);
      }
    }
  }; 

  const handleBuildImageDeletions = (buildId, deletedImages) => {
    const buildRef = doc(db, "builds", buildId);
    const remainingImages = buildImages[buildId].filter(img => !deletedImages.some(delImg => delImg.path === img.path));
  
    // Update the local state
    setBuildImages(prev => ({
      ...prev,
      [buildId]: remainingImages
    }));
  
    // Update Firestore
    const imageUpdate = remainingImages.map(img => ({ url: img.url, title: img.title, path: img.path }));
    setDoc(buildRef, { images: imageUpdate }, { merge: true })
      .then(() => {
        console.log("Firestore successfully updated for build images");
        setSnackbarMessage('Build Image deletions updated.');
        setSnackbarSeverity('success');
      })
      .catch(error => {
        console.error("Failed to update build images in Firestore:", error);
        setSnackbarMessage('Failed to update build image deletions.');
        setSnackbarSeverity('error');
      });
    setSnackbarOpen(true);
  };  

  const deleteBuildAndTests = async (buildId) => {
    const testsQuery = query(collection(db, "tests"), where("build_ID", "==", buildId), where("userId", "==", userDetails.uid));
    const testsSnapshot = await getDocs(testsQuery);

    for (const testDoc of testsSnapshot.docs) {
        // Correctly reference the document to delete
        await deleteDoc(doc(db, "tests", testDoc.id));
    }

    // Correctly reference the build document to delete
    await deleteDoc(doc(db, "builds", buildId));

    // Refresh the UI accordingly
    await refreshBuilds();
    setSnackbarMessage('Build and its tests (if any) deleted successfully.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const confirmDeleteBuild = (buildId) => {
    setDialogContent('Are you sure you want to delete this build and all associated tests? This action cannot be undone.');
    setDialogConfirmAction(() => () => deleteBuildAndTests(buildId));
    setDialogOpen(true);
  };

  // Function to handle updates to build images
  const handleBuildImagesUpdated = (buildId, newImages) => {
    setBuildImages(prev => ({
      ...prev,
      [buildId]: newImages
    }));
  };

  const handleBuildFilesUpdated = (buildId, newFiles) => {
    setBuildFiles(prev => ({
      ...prev,
      [buildId]: newFiles
    }));
  };

  const commitBuildFileDeletions = async (buildId) => {
    // if (!Array.isArray(buildFiles[buildId])) {
    //   console.error(`Expected buildFiles[${buildId}] to be an array, got:`, buildFiles[buildId]);
    //   return; // Exit the function if it's not an array
    // }

    const filesToDelete = buildFiles[buildId]?.filter(file => file.deleted) || [];
    console.log("Build files to delete:", filesToDelete);
  
    if (filesToDelete.length > 0) {
        const storage = getStorage();
        const deletePromises = filesToDelete.map(file => {
            const fileRef = ref(storage, file.path);
            return deleteObject(fileRef);
        });
  
        try {
            await Promise.all(deletePromises);
            console.log("Build files deleted successfully");
  
            // Remove the deleted files from the local state for this build
            const remainingFiles = buildFiles[buildId].filter(file => !file.deleted);
            setBuildFiles(prev => ({
                ...prev,
                [buildId]: remainingFiles
            }));
  
            // Update Firestore to reflect the deletion
            await updateDoc(doc(db, "builds", buildId), {
                files: remainingFiles.map(file => ({
                    id: file.id,
                    url: file.url,
                    name: file.name,
                    path: file.path
                })),
            });
  
            console.log("Firestore successfully updated to remove deleted files");
            setSnackbarMessage("Deleted build files have been permanently removed.");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Failed to delete build files: ", error);
            setSnackbarMessage("Failed to delete build files.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    }
  }; 
  // -- //

  // -- TESTS SECTION -- //
  const updateTest = async (testId, buildId) => {
    
    // Call commitTestFileDeletions to handle file deletions
    try {
      await commitTestFileDeletions(testId);
    } catch (error) {
      console.error("Error deleting files:", error);
      setSnackbarMessage('Failed to delete build files.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }

    // Prepare the update data object and include only defined fields.
    const updateData: any = {};

    // Filter out deleted images before sending update to Firestore
    const filteredTestImages = testImages[testId].filter(img => !img.deleted).map(({ url, path, title }) => ({ url, path, title }));
    
    // Filter out deleted files before updating Firestore
    const filteredFilesTest = testFiles[testId]?.filter(file => !file.deleted).map(file => ({
      id: file.id,  // Preserve the ID
      url: file.url,
      name: file.name,
      path: file.path
    })) || [];

    if (editableTestDescriptions[testId] !== undefined) {
      updateData.description = editableTestDescriptions[testId];
    }
    if (editableTestResults[testId] !== undefined) {
      updateData.results = editableTestResults[testId];
    }
    if (editableTestConclusions[testId] !== undefined) {
      updateData.conclusions = editableTestConclusions[testId];
    }

    updateData.images = filteredTestImages;
    updateData.files = filteredFilesTest;

    try {
      // Perform the update in Firestore.
      const testRef = doc(db, "tests", testId);
      await setDoc(testRef, updateData, { merge: true });
      
      // Show a success message.
      setSnackbarMessage('Your test has been updated.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
  
      // Refresh the tests to show the updated information.
      refreshTestsForBuild(buildId);
    } catch (error) {
      console.error(`Error updating test ID: ${testId}:`, error);
      
      // Show an error message.
      setSnackbarMessage('There was an issue updating your test.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }; 

  const handleTestTitleChange = (testId, newTitle) => {
    setEditableTestTitles(prev => ({ ...prev, [testId]: newTitle }));
  };
  
  const saveTestTitle = async (testId, buildId) => {
    const newTitle = editableTestTitles[testId];
    // Update Firestore
    const testRef = doc(db, "tests", testId);
    await setDoc(testRef, { title: newTitle }, { merge: true });
    // Optionally update local state and reset editable state
    setEditableTestTitles(prev => {
      const updated = { ...prev };
      delete updated[testId]; // Remove the entry as it's no longer being edited
      return updated;
    });
    refreshTestsForBuild(buildId)// Refresh tests for the build that this test belongs to
  };  
  
  const handleTestDescriptionChange = (testId, value) => {
    console.log(`Updating description for test ID ${testId}:`, value);
    setEditableTestDescriptions(prev => ({ ...prev, [testId]: value }));
    setUnsavedChanges(prev => ({ ...prev, tests: true }));
  };    

  const handleTestResultsChange = (testId, value) => {
    console.log(`Updating results for test ID ${testId}:`, value);
    setEditableTestResults(prev => ({ ...prev, [testId]: value }));
    setUnsavedChanges(prev => ({ ...prev, tests: true }));
  };
  
  const handleTestConclusionsChange = (testId, value) => {
    setEditableTestConclusions(prev => ({ ...prev, [testId]: value }));
    setUnsavedChanges(prev => ({ ...prev, tests: true }));
  }; 

  // UseEffect to fetch tests for all builds initially and whenever builds are refreshed
  useEffect(() => {
    const fetchBuildsAndTests = async () => {
      if (!userDetails) return;

      let buildsQuery;
      if (userDetails.isAdmin) {
        buildsQuery = query(collection(db, "builds"), where("design_ID", "==", id), orderBy("dateCreated"));
      } else {
        buildsQuery = query(collection(db, "builds"), where("design_ID", "==", id), where("userId", "==", userDetails.uid), orderBy("dateCreated"));
      }

      const querySnapshot = await getDocs(buildsQuery);
      const fetchedBuilds = [];
      const tempTestsByBuildId = {};

      const initialCollapseState = {};

      for (const buildDoc of querySnapshot.docs) {
        const buildData = buildDoc.data() as any;
        const buildId = buildDoc.id;
        fetchedBuilds.push({
          id: buildId,
          ...buildData,
          images: buildData.images || [], // Make sure images is an array
          files: buildData.files || [] // Make sure files is an array
        });

        initialCollapseState[buildId] = true;  // Initialize collapse state as true for each build
        
        let testsQuery;
        if (userDetails.isAdmin) {
          testsQuery = query(collection(db, "tests"), where("build_ID", "==", buildId), orderBy("dateCreated"));
        } else {
          testsQuery = query(collection(db, "tests"), where("build_ID", "==", buildId), where("userId", "==", userDetails.uid), orderBy("dateCreated"));
        }

        const testsSnapshot = await getDocs(testsQuery);
        const fetchedTests = [];
        const buildTestImages = {};
        const buildTestFiles = {};

        for (const testDoc of testsSnapshot.docs) {
          const testData = testDoc.data() as any;
          fetchedTests.push({
            id: testDoc.id,
            ...testData,
          });
          buildTestImages[testDoc.id] = testData.images || [];
          buildTestFiles[testDoc.id] = testData.files || [];
        }
        tempTestsByBuildId[buildId] = fetchedTests;
        
        setTestImages(prevImages => {
          const updatedImages = {...prevImages};
          for (const testId in buildTestImages) {
            updatedImages[testId] = buildTestImages[testId];
          }
          return updatedImages;
        });

        setTestFiles(prevFiles => {
          const updatedFiles = {...prevFiles};
          for (const testId in buildTestFiles) {
            updatedFiles[testId] = buildTestFiles[testId];
          }
          return updatedFiles;
        });
      }
      // Update state with fetched data
      setBuilds(fetchedBuilds);
      setTestsByBuildId(tempTestsByBuildId);
      setCollapsedTestsByBuild(initialCollapseState);  // Set the initial collapsed state for all builds
    };

    if (!loading && userDetails) {
      fetchBuildsAndTests();
    }
  }, [loading, userDetails, selectedDesign.id, id]); 

  const refreshTestsForBuild = async (buildId) => {
    if (!userDetails) {
      console.log("User details not loaded yet");
      return;
    }
  
    try {

      let testsQuery;
      if (userDetails.isAdmin) {
        testsQuery = query(
          collection(db, "tests"),
          where("build_ID", "==", buildId),
          orderBy("dateCreated")
        );
      } else {
        testsQuery = query(
          collection(db, "tests"),
          where("build_ID", "==", buildId),
          where("userId", "==", userDetails.uid),
          orderBy("dateCreated")
        );
      }

      const testsSnapshot = await getDocs(testsQuery);
      const fetchedTests = testsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        images: (doc.data() as any).images || [], // Ensure images is an array
        files: (doc.data() as any).files || [] // Ensure files is an array
      }));
    
      // Update tests for the specific build in state
      setTestsByBuildId(prev => ({
        ...prev,
        [buildId]: fetchedTests
      }));
  
      const newTestImages = {};
      const newTestFiles = {};
    
      fetchedTests.forEach(test => {
        newTestImages[test.id] = test.images;
        newTestFiles[test.id] = test.files;
      });
    
      setTestImages(newTestImages);
      setTestFiles(newTestFiles);
    } catch (error) {
      console.error("Error fetching tests:", error);
      // Optionally set an error state or show a notification
    }
  }; 

  const handleTestImageDeletions = (testId, deletedImages) => {
    const testRef = doc(db, "tests", testId);
    const remainingImages = testImages[testId].filter(img => !deletedImages.includes(img));

    // Update the local state
    setTestImages(prev => ({
        ...prev,
        [testId]: remainingImages
    }));

    // Update Firestore 
    const updatedImages = remainingImages.map(({ url, path, title }) => ({ url, path, title }));
    setDoc(testRef, { images: updatedImages }, { merge: true })
        .then(() => {
          console.log("Firestore successfully updated for test images");
          setSnackbarMessage('Test Image deletions updated.');
          setSnackbarSeverity('success');
        })
        .catch(error => {
          console.error("Failed to update test images in Firestore:", error);
          setSnackbarMessage('Failed to update test image deletions.');
          setSnackbarSeverity('error');
        });
    setSnackbarOpen(true);
  };

  // Function to update images for a specific test
  const handleTestImagesUpdated = (testId, newImages) => {
    setTestImages(prevImages => ({
      ...prevImages,
      [testId]: newImages
    }));
  };

  // Function to update files for a specific test
  const handleTestFilesUpdated = (testId, newFiles) => {
    setTestFiles(prevFiles => ({
      ...prevFiles,
      [testId]: newFiles
    }));
  };

  const commitTestFileDeletions = async (testId) => {
  
    const filesToDelete = testFiles[testId]?.filter(file => file.deleted) || [];
    if (filesToDelete.length > 0) {
        const storage = getStorage();
        const deletePromises = filesToDelete.map(file => {
            const fileRef = ref(storage, file.path);
            return deleteObject(fileRef);
        });
  
        try {
            await Promise.all(deletePromises);
            const remainingFiles = testFiles[testId].filter(file => !file.deleted);
            setTestFiles(prev => ({
                ...prev,
                [testId]: remainingFiles
            }));
  
            await updateDoc(doc(db, "tests", testId), {
                files: remainingFiles.map(file => ({
                    id: file.id,
                    url: file.url,
                    name: file.name,
                    path: file.path
                })),
            });
            setSnackbarMessage("Deleted test files have been permanently removed.");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Failed to delete test files: ", error);
            setSnackbarMessage("Failed to delete test files.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    }
  };  

  const deleteTest = async (testId, buildId) => {
    // Delete the test, assuming we've already ensured it belongs to this user elsewhere
    await deleteDoc(doc(db, "tests", testId));
  
    // Refresh tests for the build to reflect this change in the UI
    await refreshTestsForBuild(buildId);
  
    setSnackbarMessage('Test deleted successfully.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };   
  
  const confirmDeleteTest = (testId, buildId) => {
    setDialogContent('Are you sure you want to delete this test? This action cannot be undone.');
    setDialogConfirmAction(() => () => deleteTest(testId, buildId));
    setDialogOpen(true);
  }; 

  const toggleCollapseTests = (buildId) => {
    setCollapsedTestsByBuild(prev => ({
      ...prev,
      [buildId]: !prev[buildId]
    }));
  };  
  // -- //

  // -- UI NOTIFICATIONS -- //
  const promptBeforeLeaving = () => {
    const unsavedSections = Object.entries(unsavedChanges)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, hasUnsaved]) => hasUnsaved)
      .map(([section]) => section)
      .join(", ");
  
    if (!unsavedSections.length) {
      onReturnToDashboard();
      return;
    }
  
    const message = `You have unsaved changes in the following sections: ${unsavedSections}. Are you sure you want to leave?`;
    setDialogContent(message);
    setDialogConfirmAction(() => () => {
      setUnsavedChanges({
        design: false, 
        builds: false,
        tests: false,
      });
      onReturnToDashboard();
    });
  
    setDialogOpen(true);
  };   
  
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Check if any unsaved changes exist
      const hasUnsavedChanges = Object.values(unsavedChanges).some(value => value);
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]); // Depend on unsavedChanges now instead of isDirty    
  // -- //
  
  return (
    <div className="small-container">
      <Button
          variant="text"
          onClick={() => {
              // Check if any unsaved changes exist
              const hasUnsavedChanges = Object.values(unsavedChanges).some(value => value);
              if (hasUnsavedChanges) {
                  promptBeforeLeaving(); // Show confirmation dialog if unsaved changes exist
              } else {
                  onReturnToDashboard(); // Directly proceed if no unsaved changes
              }
          }}
          className="profile-button"
      >
          &larr; All Designs
      </Button>
      <div className="design-record">
        <form onSubmit={updateDesign}>
          <h1 className="designHeader" style={{ marginBottom: '20px' }}>Design Document</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 8, marginRight: '12px' }}>
              <label className="designTitles" htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  setUnsavedChanges(prev => ({ ...prev, design: true }));
                }}  
                style={{ width: '100%' }} // Make sure the input fills the div        
              />
            </div>
            <div style={{ flexGrow: 2 }}>
              <label className="designTitles" htmlFor="dateCreated">Created</label>
              <input
                id="dateCreated"
                type="text"
                name="dateCreated"
                value={dateCreated || ''}
                readOnly
                style={{ width: '100%' }}        
              />
            </div>
            <div style={{ flexGrow: 2, marginLeft: '12px' }}>
              <label className="designTitles" htmlFor="dateModified">Last Edited</label>
              <input
                id="dateModified"
                type="text"
                name="dateModified"
                value={dateModified || ''}
                readOnly
                style={{ width: '100%' }}        
              />
            </div>
          </div>

          {/* Course Dropdown */}
          <label className="designTitles" htmlFor="course">Course</label>
          <Select
            id="course"
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setUnsavedChanges((prev) => ({ ...prev, design: true }));
            }}
            fullWidth
          >
            {(userDetails?.classes ? Object.entries(userDetails.classes) : [])
              .map(([courseId, courseDetails]) => (
                <MenuItem key={courseId} value={courseId}>
                  {`${courseDetails.number} - ${courseDetails.title}`}
                </MenuItem>
              ))}
          </Select>
          
          <label className="designTitles" htmlFor="description">Description</label>
          <ul>
              <li>Objective: What is the goal for this design?</li>
              <li>Rationale: Why is this new design being done?</li>
              <li>Selected Target: What is the target for the design being made?</li>
              <li>Functional Modification: What is being done to this target?</li>
              <li>Overview/Plan for making the modification: What are the steps to be carried out to meet the objective?</li>
          </ul>
          <TextEditor
            initialValue={description}
            onChange={(newDescription) => {
              setDesignDescription(newDescription);
              setUnsavedChanges(prev => ({ ...prev, design: true }));
            }}
          />
          {/* Example for adding an image to a Design */}
          <ImageUpload
            ref={imageUploadRef}
            path={`designs/${selectedDesign.id}/images`}
            initialImages={images}
            onImagesUpdated={handleImagesUpdated}
            onDelete={handleImageDeletions}  
            isOwnDesign={isOwnDesign} // Pass the ownership information
          />
          <FileUpload
            path={`designs/${selectedDesign.id}/files`} // Adjust path to include the design ID
            initialFiles={files}
            onFilesChange={setFiles} // Handler to update state when files change
            isOwnDesign={isOwnDesign} // Pass the ownership information
          />
          {isOwnDesign && (
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                  <input type="submit" value="Update" />
                  <button
                      style={{ marginLeft: '12px' }}
                      className="muted-button"
                      type="button"
                      onClick={() => setIsEditing(false)}
                  >
                      Cancel
                  </button>
              </div>
          )}
        </form>
      </div>
      <div>
        <div className="flex-space-between">
          <h2 className="buildsHeader">Builds</h2>
          {isOwnDesign && (
              <button 
                  className="button muted-button"
                  onClick={() => {
                      setIsAddingBuild(true);
                      // Use a setTimeout to ensure the DOM has been updated
                      setTimeout(() => {
                          if (addBuildFormRef.current) {
                              addBuildFormRef.current.scrollIntoView({ behavior: 'smooth' });
                          }
                      }, 100);
                  }} style={{ marginTop: '20px' }}> 
                  <span role="img" aria-label="Add Build">➕</span> Build
              </button>
          )}
        </div>
        {builds.map((build, index) => (
          <div key={build.id} className="build-record">
            <div className="flex-space-between align-items-center">
                <div>
                  {editableBuildTitles[build.id] !== undefined ? (
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={editableBuildTitles[build.id]}
                      onChange={(e) => handleBuildTitleChange(build.id, e.target.value)}
                      onBlur={() => saveBuildTitle(build.id)}
                      autoFocus
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => saveBuildTitle(build.id)} size="small">
                            <SaveIcon />
                          </IconButton>
                        ),
                      }}
                    />
                  ) : (
                    <div
                      className="buildTitle"
                      onClick={() => setEditableBuildTitles(prev => ({ ...prev, [build.id]: build.title || `Build ${index + 1}` }))} 
                      style={{ cursor: 'pointer' }}
                    >
                      {build.title || `Build ${index + 1}`}
                    </div>
                  )}
                </div>
                {/* Toggle Button for Build Details */}
                <div> 
                  <button 
                    onClick={() => setVisibleBuildDetails(prev => ({
                      ...prev,
                      [build.id]: !prev[build.id] // Toggle the visibility state
                    }))}
                    className="button muted-button"
                    style={{ border: 'none', background: 'none' }}
                  >
                    {visibleBuildDetails[build.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                  {isOwnDesign && (
                    <>
                      <button 
                        className="button muted-button"
                        style={{ border: 'none', background: 'none' }}
                        onClick={() => confirmDeleteBuild(build.id)}
                      >
                        <DeleteIcon />
                      </button>
                      <button 
                          className="button muted-button"
                          onClick={() => {
                              setAddingTestIdForBuild(build.id);
                              setTimeout(() => {
                                  if (addTestFormRef.current) {
                                      addTestFormRef.current.scrollIntoView({ behavior: 'smooth' });
                                  }
                              }, 100);
                          }}>
                          <span role="img" aria-label="Add Test">➕</span> Test
                      </button>
                    </>
                  )}
                </div>
            </div>
            {visibleBuildDetails[build.id] && (
              <>
                <TextEditor
                  initialValue={editableBuildDescriptions[build.id] || build.description}
                  onChange={(newDescription) => {
                    handleBuildDescriptionChange(build.id, newDescription);
                  }}
                />
                <ImageUpload
                  path={`builds/${build.id}/images`}
                  initialImages={build.images}
                  onImagesUpdated={(images) => handleBuildImagesUpdated(build.id, images)}
                  onDelete={(deletedImages) => handleBuildImageDeletions(build.id, deletedImages)}
                  isOwnDesign={isOwnDesign} // Pass the ownership information
                />
                <FileUpload
                  path={`builds/${build.id}/files`}
                  initialFiles={build.files}
                  onFilesChange={(files) => handleBuildFilesUpdated(build.id, files)}
                  isOwnDesign={isOwnDesign} // Pass the ownership information
                />
                {isOwnDesign && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => updateBuild(build.id)}>Update</button>
                    </div>
                )}
                <div>
                  {testsByBuildId[build.id] && testsByBuildId[build.id].length > 0 && (
                    <button
                      onClick={() => toggleCollapseTests(build.id)}
                      className="button muted-button"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '12px', marginBottom: '12px' }}
                    >
                      {collapsedTestsByBuild[build.id] ? (
                        <>
                          <VisibilityIcon style={{ marginRight: '8px' }} />
                          Tests
                        </>
                      ) : (
                        <>
                          <VisibilityOffIcon style={{ marginRight: '8px' }} />
                          Tests
                        </>
                      )}
                    </button>
                  )}
                </div>
                {/* Only render tests if they are not collapsed */}
                {!collapsedTestsByBuild[build.id] && testsByBuildId[build.id] && testsByBuildId[build.id].map((test, testIndex) => (
                  <div key={test.id} className="test-record">
                    <div className="flex-space-between align-items-center">
                      <div>
                        {editableTestTitles[test.id] !== undefined ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={editableTestTitles[test.id]}
                            onChange={(e) => handleTestTitleChange(test.id, e.target.value)}
                            onBlur={() => saveTestTitle(test.id, build.id)}
                            autoFocus
                            InputProps={{
                              endAdornment: (
                                <IconButton onClick={() => saveTestTitle(test.id, build.id)} size="small">
                                  <SaveIcon />
                                </IconButton>
                              ),
                            }}
                          />
                        ) : (
                          <div
                            className="testTitle"
                            onClick={() => setEditableTestTitles(prev => ({ ...prev, [test.id]: test.title || `Test ${testIndex + 1}` }))} style={{ cursor: 'pointer' }}
                          >
                            {test.title || `Test ${testIndex + 1}`}
                          </div>
                        )}
                      </div>
                      <div>
                        {/* Toggle Button for Test Details */}
                        <button 
                          onClick={() => setVisibleTestDetails(prev => ({
                            ...prev,
                            [test.id]: !prev[test.id] // Toggle the visibility state for this test
                          }))}
                          className="button muted-button"
                          style={{ border: 'none', background: 'none' }}
                        >
                          {visibleTestDetails[test.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                        {isOwnDesign && (
                          <button
                            className="button muted-button"
                            style={{ border: 'none', background: 'none' }}
                            onClick={() => confirmDeleteTest(test.id, build.id)}
                          >
                            <DeleteIcon />
                          </button>
                        )}
                      </div>
                    </div>
                    {visibleTestDetails[test.id] && (
                      <>
                        <div>
                          <label className="testTitles">Description</label>
                          <TextEditor
                            initialValue={editableTestDescriptions[test.id] || test.description}
                            onChange={(newTestDescription) => {
                              handleTestDescriptionChange(test.id, newTestDescription);
                            }}
                          />
                        </div>
                        <div>
                          <label className="testTitles">Results</label>
                          <TextEditor
                            initialValue={editableTestResults[test.id] || test.results}
                            onChange={(newTestResults) => {
                              handleTestResultsChange(test.id, newTestResults);
                            }}
                          />
                        </div>
                        <div>
                          <label className="testTitles">Conclusions</label>
                          <TextEditor
                            initialValue={editableTestConclusions[test.id] || test.conclusions}
                            onChange={(newTestConclusions) => {
                              handleTestConclusionsChange(test.id, newTestConclusions);
                            }}
                          />
                        </div>
                        <div>
                          <ImageUpload
                              path={`tests/${test.id}/images`}
                              initialImages={testImages[test.id] || []}
                              onImagesUpdated={(images) => handleTestImagesUpdated(test.id, images)}
                              onDelete={(deletedImages) => handleTestImageDeletions(test.id, deletedImages)}
                              isOwnDesign={isOwnDesign} // Pass the ownership information
                            />
                            <FileUpload
                              path={`tests/${test.id}/files`}
                              initialFiles={testFiles[test.id] || []}
                              onFilesChange={(files) => handleTestFilesUpdated(test.id, files)}
                              isOwnDesign={isOwnDesign} // Pass the ownership information
                            />
                        </div>
                        {isOwnDesign && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => updateTest(test.id, build.id)}>Update</button>
                            </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </>
            )}

            {addingTestIdForBuild === build.id && (
              <div className="new-test-record" ref={addTestFormRef}>
                <h3 className="newTestHeader">New Test</h3>
                <AddTest
                  designId={selectedDesign.id}
                  buildId={build.id}
                  refreshTests={() => refreshTestsForBuild(build.id)}
                  setAddingTestIdForBuild={setAddingTestIdForBuild}
                  onImagesUpdated={(images: any) => handleTestImagesUpdated(build.id, images)}
                  onFilesChange={(files: any) => handleTestFilesUpdated(build.id, files)}
                />
              </div>
            )}
          </div>
        ))}
        <div>
          {isAddingBuild && (
            <div className="new-build-record" ref={addBuildFormRef}>
              <h3 className="newBuildHeader">New Build</h3>
              <AddBuild
                designId={selectedDesign.id}
                setIsAddingBuild={setIsAddingBuild}
                refreshBuilds={refreshBuilds}
                onImagesUpdated={(images: any) => handleBuildImagesUpdated('temp-build-id', images)}
                onFilesChange={(files: any) => handleBuildFilesUpdated('temp-build-id', files)}
              />
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{"Confirmation Required"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            dialogConfirmAction();
            setDialogOpen(false);
          }} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity as any} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );  
};

export default Edit;