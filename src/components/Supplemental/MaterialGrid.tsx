// src/components/Supplemental/MaterialGrid.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import DeleteMaterialDialog from './DeleteMaterialDialog';
import UnpublishMaterial from './UnpublishMaterial';
import MaterialsTabs from './MaterialsTabs';


const MaterialGrid: React.FC<{ initialCourse?: string | null }> = ({ initialCourse }) => {
  const { userDetails } = useUser();
  const db = getFirestore();
  const [openDialog, setOpenDialog] = useState(false);
  const [isCourseAdmin, setIsCourseAdmin] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState<string | null>(initialCourse ?? null);

  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [confirmUnpublish, setConfirmUnpublish] = useState<{ open: boolean, materialId: string | null }>({ open: false, materialId: null });
  const [error, setError] = useState<string | null>(null);

  const fetchCourseAdminStatus = useCallback(async () => {
    if (!selectedCourse) return;
    const courseDocRef = doc(db, 'courses', selectedCourse);
    const courseDoc = await getDoc(courseDocRef);

    if (courseDoc.exists()) {
      const courseData = courseDoc.data();
      const courseAdmins = courseData?.courseAdmin || [];
      setIsCourseAdmin(courseAdmins.includes(userDetails?.uid));
    } else {
      setIsCourseAdmin(false);
    }
  }, [selectedCourse, db, userDetails]);

  useEffect(() => {
    if (!selectedCourse) return; // Prevents unnecessary calls
    fetchCourseAdminStatus();
  }, [selectedCourse, fetchCourseAdminStatus]); // Only runs when `selectedCourse` actually changes
  
  useEffect(() => {
    if (initialCourse && selectedCourse !== initialCourse) {
      setSelectedCourse(initialCourse);
    }
  }, [initialCourse, selectedCourse]); // Only re-runs when `initialCourse` or `selectedCourse` changes  

  const handleDeleteClick = (id: string) => {
    setSelectedMaterial(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMaterial(null);
  };

  const handleDeleteMaterial = () => {
    // Material deletion is now handled by the MaterialsTabs component
    console.log('Material deleted:', selectedMaterial);
  };

  const handleUnpublishClick = (materialId: string) => {
    setConfirmUnpublish({ open: true, materialId });
  };
  
  const handleUnpublish = () => {
    // Material unpublishing is now handled by the MaterialsTabs component
    console.log('Material unpublished:', confirmUnpublish.materialId);
  };
  
  const handleCancelUnpublish = () => {
    setConfirmUnpublish({ open: false, materialId: null });
  };  

  return (
    <Box sx={{ width: '100%' }}>
      {/* Use the new MaterialsTabs component */}
      {selectedCourse ? (
        <MaterialsTabs
          courseId={selectedCourse}
          isCourseAdmin={isCourseAdmin}
          onDeleteClick={handleDeleteClick}
          onUnpublishClick={handleUnpublishClick}
        />
      ) : (
        <Typography variant="body1" align="center" sx={{ width: '100%', mb: 4 }}>
          Please select a course to view materials.
        </Typography>
      )}

      {selectedMaterial && (
        <DeleteMaterialDialog
          materialId={selectedMaterial}
          open={openDialog}
          onClose={handleCloseDialog}
          onDelete={handleDeleteMaterial}
        />
      )}

      {confirmUnpublish.materialId && (
        <UnpublishMaterial
          materialId={confirmUnpublish.materialId}
          open={confirmUnpublish.open}
          onClose={handleCancelUnpublish}
          onUnpublish={handleUnpublish}
        />
      )}
      {error && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          key={error} // Forces re-render on new errors
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};


export default MaterialGrid;