// Dashboard/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../hooks/useUser';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert, TextField, Box, Typography, Paper, Chip, useMediaQuery, useTheme } from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

import { collection, query, where, getDocs, doc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from '../../config/firestore';

import Header from './Header';
import NotebookTable from './NotebookTable';
import Add from './Add';
import Edit from './Edit';

import { Design } from '../../types/types';
import { DesignDocumentData, getDocumentField } from '../../types/events';

const Dashboard = () => {
  const { userDetails, loading } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  console.log("Dashboard loaded");

  const [superAdminDesigns, setSuperAdminDesigns] = useState<Design[]>([]); // State for super-admin designs
  const [adminDesigns, setAdminDesigns] = useState<Design[]>([]); // State for educator's designs
  const [userDesigns, setUserDesigns] = useState<Design[]>([]); // State for student's designs
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null); // Updated type for selectedDesign state
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State for Dialog and Snackbar
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');

  // New states for user ID confirmation logic
  const [userIdForConfirmation, setUserIdForConfirmation] = useState('');
  const [userIdConfirmationDialogOpen, setUserIdConfirmationDialogOpen] = useState(false);
  const [pendingDeleteDesignId, setPendingDeleteDesignId] = useState<string | null>(null); // Added explicit type annotation

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // Can be 'success', 'info', 'warning', 'error'

  const handleReturnToDashboard = () => {
    setIsEditing(false); // Resets editing state
    setIsAdding(false); // Resets adding state
    setSelectedDesign(null); // Optionally reset selected design
    getDesigns(); // Refresh designs if needed
  };

  const getDesigns = useCallback(async () => {
    if (!userDetails) return;
  
    let designsQuery;
    const superAdminDesigns: Design[] = [];
    const adminDesigns: Design[] = [];
    const userDesigns: Design[] = [];
  
    if (userDetails.isSuperAdmin) {
      // Super-Admins can view all designs, so no filtering by course
      designsQuery = query(
        collection(db, "designs"),
        orderBy("dateCreated", "desc")
      );
    } else if (userDetails.isAdmin) {
      // Use 'in' query to retrieve only designs related to the courses the admin has access to
      const accessibleCourses = userDetails.classes ? Object.keys(userDetails.classes) : [];
      if (accessibleCourses.length > 0) {
        designsQuery = query(
          collection(db, "designs"),
          where("course", "in", accessibleCourses),
          orderBy("dateCreated", "desc")
        );
      } else {
        // If the admin has no courses, return empty
        setAdminDesigns([]);
        setUserDesigns([]);
        return;
      }
    } else {
      // Non-admin users only see their designs
      designsQuery = query(
        collection(db, "designs"),
        where("userId", "==", userDetails.uid),
        orderBy("dateCreated", "desc")
      );
    }
  
    const querySnapshot = await getDocs(designsQuery);
  
    querySnapshot.forEach(doc => {
      const data = doc.data() as DesignDocumentData;
      const design = {
        id: doc.id,
        title: getDocumentField(data, 'title', ''),
        description: getDocumentField(data, 'description', ''),
        course: getDocumentField(data, 'course', ''),
        dateCreated: data.dateCreated,
        dateModified: data.dateModified,
        userId: getDocumentField(data, 'userId', ''),
        images: getDocumentField(data, 'images', []),
        files: getDocumentField(data, 'files', [])
      } as Design;
  
      if (userDetails.isSuperAdmin) {
        if (data.userId === userDetails.uid) {
          superAdminDesigns.push(design); // Super Admin's own designs
        } else if (data.userId !== userDetails.uid && data.course && data.isAdmin) {
          adminDesigns.push(design); // Educator designs from other admins
        } else if (data.userId !== userDetails.uid && !data.isAdmin) {
          userDesigns.push(design); // Student designs
        }
      } else if (userDetails.isAdmin) {
        if (data.userId === userDetails.uid) {
          adminDesigns.push(design); // Admin's own designs
        } else {
          userDesigns.push(design); // Other users' designs for courses the admin has access to
        }
      } else {
        if (data.userId === userDetails.uid) {
          userDesigns.push(design); // Student's own designs
        }
      }
    });
  
    setSuperAdminDesigns(superAdminDesigns);
    setAdminDesigns(adminDesigns);
    setUserDesigns(userDesigns);
  }, [userDetails]);  

  useEffect(() => {
    if (!loading && userDetails) {
      getDesigns();
    }
  }, [userDetails, loading, getDesigns]);

  const handleEdit = (id: string) => {
    const design = [...superAdminDesigns, ...adminDesigns, ...userDesigns].find(design => design.id === id);
    setSelectedDesign(design || null);
    setIsEditing(true);
  };

  const handleDelete = (designId: string) => {
    setPendingDeleteDesignId(designId); // Temporarily store the design ID for deletion
    setDialogContent('Are you sure you want to delete this design? This action cannot be undone.');
    setDialogOpen(true); // Open the initial confirmation dialog
  };

  const confirmDelete = async () => {
    // Ensure there's a designId to delete
    if (!pendingDeleteDesignId) return;

    if (userIdForConfirmation !== userDetails?.uid) {
      // User ID doesn't match, show error message and abort deletion
      setSnackbarMessage('User ID confirmation failed. Enter the correct User ID.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else {
      // User ID matches, proceed with deletion
      try {
        // Query for builds associated with the design
        const buildsQuery = query(collection(db, "builds"), where("design_ID", "==", pendingDeleteDesignId), where("userId", "==", userDetails.uid));
        const buildsSnapshot = await getDocs(buildsQuery);

        for (const buildDoc of buildsSnapshot.docs) {
          const buildId = buildDoc.id;

          // Query for tests associated with each build
          const testsQuery = query(collection(db, "tests"), where("build_ID", "==", buildId), where("userId", "==", userDetails.uid));
          const testsSnapshot = await getDocs(testsQuery);

          // Delete each test
          for (const testDoc of testsSnapshot.docs) {
            await deleteDoc(doc(db, "tests", testDoc.id));
          }

          // After deleting tests, delete the build
          await deleteDoc(doc(db, "builds", buildId));
        }

        // After deleting builds and their tests, delete the design
        await deleteDoc(doc(db, "designs", pendingDeleteDesignId));

        // Update UI
        setSuperAdminDesigns(prev => prev.filter(design => design.id !== pendingDeleteDesignId));
        setAdminDesigns(prev => prev.filter(design => design.id !== pendingDeleteDesignId));
        setUserDesigns(prev => prev.filter(design => design.id !== pendingDeleteDesignId));

        // Show success message
        setSnackbarMessage('Your design and its associated builds and tests have been deleted.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error deleting design, builds, and tests: ", error);
        // Show error message
        setSnackbarMessage('There was an issue deleting your design and its associated builds and tests.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        // Reset states
        setUserIdForConfirmation('');
        setUserIdConfirmationDialogOpen(false);
        setPendingDeleteDesignId(null); // Clear the pending design ID
      }
    }
  };

  // Helper function to render section header
  const renderSectionHeader = (title: string, count: number, color: string) => (
    <Box sx={{ mb: spacing[4], mt: spacing[6] }}>
      <Paper 
        sx={{ 
          p: isMobile ? spacing[3] : spacing[4], // Responsive padding
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.sm,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: spacing[3],
          flexDirection: isMobile ? 'column' : 'row', // Stack on mobile
          textAlign: isMobile ? 'center' : 'left',
        }}>
          <Typography 
            variant="h4"
            sx={{
              fontFamily: typography.fontFamily.display,
              fontSize: isMobile ? typography.fontSize.xl : typography.fontSize['2xl'], // Responsive font size
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            {title}
          </Typography>
          <Chip
            label={`${count} ${count === 1 ? 'Design' : 'Designs'}`}
            size="small"
            sx={{
              backgroundColor: color,
              color: colors.text.inverse,
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.sm,
            }}
          />
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ 
      p: isMobile ? spacing[3] : spacing[6], // Responsive padding
      backgroundColor: colors.background.primary, 
      minHeight: '100vh' 
    }}>
      {!isAdding && !isEditing && (
        <>
          {/* Header */}
          <Header setIsAdding={setIsAdding} />
          
          {/* Super Admin View */}
          {userDetails?.isSuperAdmin && (
            <>
              {renderSectionHeader('My Designs', superAdminDesigns.length, colors.primary[500])}
              <NotebookTable
                designs={superAdminDesigns}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isAdmin={true}
                userDetails={userDetails}
                showUserIdColumn={true}
              />
              
              {renderSectionHeader('Educator Designs', adminDesigns.length, colors.secondary[500])}
              <NotebookTable
                designs={adminDesigns}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isAdmin={true}
                userDetails={userDetails}
                showUserIdColumn={true}
              />
              
              {renderSectionHeader('Student Designs', userDesigns.length, colors.info)}
              <NotebookTable
                designs={userDesigns}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isAdmin={false}
                userDetails={userDetails}
                showUserIdColumn={true}
              />
            </>
          )}

          {/* Admin View */}
          {userDetails?.isAdmin && !userDetails.isSuperAdmin && (
            <>
              {renderSectionHeader('My Educator Designs', adminDesigns.length, colors.secondary[500])}
              <NotebookTable
                designs={adminDesigns}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isAdmin={true}
                userDetails={userDetails}
                showUserIdColumn={true}
              />
              
              {renderSectionHeader('Student Designs', userDesigns.length, colors.info)}
              <NotebookTable
                designs={userDesigns}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isAdmin={false}
                userDetails={userDetails}
                showUserIdColumn={true}
              />
            </>
          )}

          {/* Student View */}
          {!userDetails?.isAdmin && !userDetails?.isSuperAdmin && (
            <>
              {renderSectionHeader('My Designs', userDesigns.length, colors.primary[500])}
              <NotebookTable
                designs={userDesigns}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isAdmin={false}
                userDetails={userDetails}
                showUserIdColumn={false}
              />
            </>
          )}
        </>
      )}
      {isAdding && (
        <Add
          designs={superAdminDesigns.concat(adminDesigns)}
          setDesigns={setAdminDesigns}
          setIsAdding={setIsAdding}
          getDesigns={getDesigns}
          onReturnToDashboard={handleReturnToDashboard}
        />
      )}
      {isEditing && (
        <Edit
          designs={superAdminDesigns.concat(adminDesigns)}
          selectedDesign={selectedDesign}
          setDesigns={setAdminDesigns}
          setIsEditing={setIsEditing}
          getDesigns={getDesigns}
          onReturnToDashboard={handleReturnToDashboard}
        />
      )}
      {/* Initial Deletion Confirmation Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        PaperProps={{
          style: { minWidth: 500 }, // Adjust minWidth as needed
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>No, cancel</Button>
          <Button onClick={() => {
            setUserIdConfirmationDialogOpen(true);
            setDialogOpen(false); // This should close the initial dialog and open the user ID confirmation dialog without delay.
          }} color="primary">
            Yes, delete it
          </Button>
        </DialogActions>
      </Dialog>
      {/* User ID Confirmation Dialog */}
      <Dialog 
        open={userIdConfirmationDialogOpen} 
        onClose={() => setUserIdConfirmationDialogOpen(false)}
        PaperProps={{
          style: { minWidth: 500 }, // Ensure this matches the first Dialog
        }}
      >
        <DialogTitle>Confirm Your User ID</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="userId-confirm"
            label="User ID"
            type="text"
            fullWidth
            variant="outlined"
            value={userIdForConfirmation}
            onChange={(e) => setUserIdForConfirmation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserIdConfirmationDialogOpen(false)}>No, cancel</Button>
          <Button onClick={confirmDelete} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity as "info" | "error" | "success" | "warning" | undefined}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );  
};

export default React.memo(Dashboard);