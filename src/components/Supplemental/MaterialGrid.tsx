// src/components/Supplemental/MaterialGrid.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, IconButton, Snackbar, Alert } from '@mui/material';
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Material } from '../../types/Material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteMaterialDialog from './DeleteMaterialDialog';
import UnpublishButton from './UnpublishButton';
import UnpublishMaterial from './UnpublishMaterial';

const MaterialGrid: React.FC<{ initialCourse?: string | null }> = ({ initialCourse }) => {
  const { userDetails } = useUser();
  const db = getFirestore();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isCourseAdmin, setIsCourseAdmin] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState<string | null>(initialCourse ?? null);

  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [confirmUnpublish, setConfirmUnpublish] = useState<{ open: boolean, materialId: string | null }>({ open: false, materialId: null });
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const fetchCourseAdminStatus = async () => {
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
  };

  useEffect(() => {
    if (!selectedCourse) return; // Prevents unnecessary calls
    fetchCourseAdminStatus();
  }, [selectedCourse]); // Only runs when `selectedCourse` actually changes
  
  useEffect(() => {
    if (initialCourse && selectedCourse !== initialCourse) {
      setSelectedCourse(initialCourse);
    }
  }, [initialCourse]); // Only re-runs when `initialCourse` changes  

  useEffect(() => {
    if (!selectedCourse) {
      console.log("No course selected");
      setMaterials([]);
      setLoading(false); // Reset loading state if no course is selected
      return;
    }
  
    console.log(`Fetching materials for course: ${selectedCourse}`);
    setLoading(true);
  
    const q = userDetails?.isAdmin
      ? query(collection(db, 'materials'), where('course', '==', selectedCourse), orderBy('timestamp', 'desc'))
      : query(collection(db, 'materials'), where('course', '==', selectedCourse), where('published', '==', true), orderBy('timestamp', 'desc'));
  
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const materialsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Material[];
        setMaterials(materialsData);
        console.log(`Fetched ${materialsData.length} materials for course: ${selectedCourse}`);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Failed to fetch materials');
        setLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, [db, selectedCourse, userDetails]);  

  const handleDeleteClick = (id: string) => {
    setSelectedMaterial(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMaterial(null);
  };

  const handleDeleteMaterial = () => {
    setMaterials(materials.filter(material => material.id !== selectedMaterial));
  };

  const handleUnpublishClick = (materialId: string) => {
    setConfirmUnpublish({ open: true, materialId });
  };
  
  const handleUnpublish = () => {
    setMaterials(materials.map(material => material.id === confirmUnpublish.materialId ? { ...material, published: false } : material));
  };
  
  const handleCancelUnpublish = () => {
    setConfirmUnpublish({ open: false, materialId: null });
  };  

  

  if (loading) {
    return <CircularProgress />;
  }

  // Categorize materials
  const savedMaterials = materials.filter((material) => !material.published && !material.scheduledTimestamp);
  const publishScheduledMaterials = materials.filter((material) => material.scheduledTimestamp && !material.published);
  const publishedMaterials = materials.filter((material) => material.published);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Fallback for no materials */}
      {materials.length === 0 && selectedCourse && (
        <Typography variant="body1" align="center" sx={{ width: '100%', mb: 4 }}>
          No materials found for the selected course.
        </Typography>
      )}

      {/* Only show "Saved" and "Publish Scheduled" sections to course admins */}
      {isCourseAdmin && materials.length > 0 && (
        <>
          {/* Saved Materials */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F57C00', mb: 2 }}>
              Saved
            </Typography>
            <Grid container spacing={3}>
              {savedMaterials.length === 0 ? (
                <Typography variant="body1" align="center" sx={{ width: '100%' }}>
                  No saved (unpublished) materials found.
                </Typography>
              ) : (
                savedMaterials.map((material) => (
                  <MaterialItem 
                    key={material.id} 
                    material={material} 
                    isCourseAdmin={isCourseAdmin} 
                    navigate={navigate} 
                    selectedCourse={selectedCourse || ''}
                    onDeleteClick={handleDeleteClick} 
                    onUnpublishClick={handleUnpublishClick} 
                  />
                ))
              )}
            </Grid>
          </Box>

          {/* Publish Scheduled Materials */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0D47A1', mb: 2 }}>
              Publish Scheduled
            </Typography>
            <Grid container spacing={3}>
              {publishScheduledMaterials.length === 0 ? (
                <Typography variant="body1" align="center" sx={{ width: '100%' }}>
                  No materials scheduled for publishing found.
                </Typography>
              ) : (
                publishScheduledMaterials.map((material) => (
                  <MaterialItem 
                    key={material.id} 
                    material={material} 
                    isCourseAdmin={isCourseAdmin} 
                    navigate={navigate} 
                    selectedCourse={selectedCourse || ''}
                    onDeleteClick={handleDeleteClick} 
                    onUnpublishClick={handleUnpublishClick} 
                  />
                ))
              )}
            </Grid>
          </Box>
        </>
      )}

      {/* Published Materials */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 2 }}>
          Published
        </Typography>
        <Grid container spacing={3}>
          {publishedMaterials.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ width: '100%' }}>
              No published materials found.
            </Typography>
          ) : (
            publishedMaterials.map((material) => (
              <MaterialItem 
                key={material.id} 
                material={material} 
                isCourseAdmin={isCourseAdmin} 
                navigate={navigate} 
                selectedCourse={selectedCourse || ''}
                onDeleteClick={handleDeleteClick} 
                onUnpublishClick={handleUnpublishClick} 
              />
            ))
          )}
        </Grid>
      </Box>

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

// Reusable MaterialItem component for each material entry
const MaterialItem: React.FC<{ 
  material: Material,
  isCourseAdmin: boolean,
  navigate: any,
  selectedCourse: string,
  onDeleteClick: (id: string) => void,
  onUnpublishClick: (id: string) => void
}> = ({ material, isCourseAdmin, navigate, selectedCourse, onDeleteClick, onUnpublishClick }) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: 2, position: 'relative', backgroundColor: material.published ? '#E8F5E9' : '#FFF9C4' }}>
        <IconButton onClick={() => navigate(`/view-material/${material.id}?course=${selectedCourse}`)} aria-label="view">
          <VisibilityIcon />
        </IconButton>
        <Typography variant="h6">{material.title || 'Untitled'}</Typography>

        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
          {isCourseAdmin && (
            <>
              <IconButton onClick={() => navigate(`/edit-material/${material.id}?course=${selectedCourse}`)} aria-label="edit">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDeleteClick(material.id)} aria-label="delete">
                <DeleteIcon />
              </IconButton>
              {material.published && (
                <UnpublishButton materialId={material.id} onClick={onUnpublishClick} />
              )}
            </>
          )}
        </Box>
      </Box>
    </Grid>
  );
};

export default MaterialGrid;