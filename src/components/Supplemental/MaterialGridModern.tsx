// src/components/Supplemental/MaterialGridModern.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Container,
  Fade,
  Skeleton,
} from '@mui/material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';
import { Material } from '../../types/Material';
import { designSystemTheme, borderRadius } from '../../config/designSystem';
import MaterialCard from '../common/MaterialCard';
import MaterialsTabsModern from './MaterialsTabsModern';
import DeleteMaterialDialog from './DeleteMaterialDialog';
import UnpublishMaterial from './UnpublishMaterial';

interface MaterialGridModernProps {
  initialCourse?: string | null;
}

const MaterialGridModern: React.FC<MaterialGridModernProps> = ({ initialCourse }) => {
  const { userDetails } = useUser();
  const db = getFirestore();
  
  // State management
  const [selectedCourse, setSelectedCourse] = useState<string | null>(initialCourse ?? null);
  const [isCourseAdmin, setIsCourseAdmin] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [confirmUnpublish, setConfirmUnpublish] = useState<{ open: boolean, materialId: string | null }>({ 
    open: false, 
    materialId: null 
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch course admin status
  const fetchCourseAdminStatus = useCallback(async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const courseDocRef = doc(db, 'courses', selectedCourse);
      const courseDoc = await getDoc(courseDocRef);

      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        const courseAdmins = courseData?.courseAdmin || [];
        setIsCourseAdmin(courseAdmins.includes(userDetails?.uid));
      } else {
        setIsCourseAdmin(false);
      }
    } catch (err) {
      console.error('Error fetching course admin status:', err);
      setError('Failed to verify course permissions');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, db, userDetails]);

  // Effects
  useEffect(() => {
    if (!selectedCourse) return;
    fetchCourseAdminStatus();
  }, [selectedCourse, fetchCourseAdminStatus]);

  useEffect(() => {
    if (initialCourse && selectedCourse !== initialCourse) {
      setSelectedCourse(initialCourse);
    }
  }, [initialCourse, selectedCourse]);

  // Event handlers
  const handleDeleteClick = (id: string) => {
    setSelectedMaterial(id);
  };

  const handleCloseDialog = () => {
    setSelectedMaterial(null);
  };

  const handleDeleteMaterial = () => {
    console.log('Material deleted:', selectedMaterial);
    setSelectedMaterial(null);
  };

  const handleUnpublishClick = (materialId: string) => {
    setConfirmUnpublish({ open: true, materialId });
  };

  const handleUnpublish = () => {
    console.log('Material unpublished:', confirmUnpublish.materialId);
    setConfirmUnpublish({ open: false, materialId: null });
  };

  const handleCancelUnpublish = () => {
    setConfirmUnpublish({ open: false, materialId: null });
  };

  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Content */}
      {selectedCourse ? (
        <Fade in={true} timeout={500}>
          <Box>
            <MaterialsTabsModern
              courseId={selectedCourse}
              isCourseAdmin={isCourseAdmin}
              onDeleteClick={handleDeleteClick}
              onUnpublishClick={handleUnpublishClick}
            />
          </Box>
        </Fade>
      ) : (
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              backgroundColor: designSystemTheme.palette.background.paper,
              borderRadius: borderRadius['2xl'],
              border: `1px solid ${designSystemTheme.palette.divider}`,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: designSystemTheme.typography.h5.fontFamily,
                fontWeight: designSystemTheme.typography.h5.fontWeight,
                color: designSystemTheme.palette.text.secondary,
                mb: 2,
              }}
            >
              Select a Course
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: designSystemTheme.palette.text.secondary,
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              Please select a course from the dropdown above to view and manage course materials.
            </Typography>
          </Box>
        </Container>
      )}

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
          }}
        >
          <CircularProgress
            size={40}
            sx={{
              color: designSystemTheme.palette.primary.main,
            }}
          />
        </Box>
      )}

      {/* Dialogs */}
      {selectedMaterial && (
        <DeleteMaterialDialog
          materialId={selectedMaterial}
          open={!!selectedMaterial}
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

      {/* Error Snackbar */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleErrorClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleErrorClose}
            severity="error"
            sx={{
              backgroundColor: designSystemTheme.palette.error.light,
              color: designSystemTheme.palette.error.contrastText,
              '& .MuiAlert-icon': {
                color: designSystemTheme.palette.error.main,
              },
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default MaterialGridModern;
