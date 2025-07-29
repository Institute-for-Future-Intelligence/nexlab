import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Grid,
  Card,
  CardContent 
} from '@mui/material';
import { useMaterialsStore } from '../../stores/materialsStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useUIStore } from '../../stores/uiStore';

/**
 * Example component showing how to use Zustand stores
 * This replaces complex useState patterns with clean, centralized state management
 * 
 * BEFORE (old pattern):
 * - Multiple useState hooks scattered across components
 * - Prop drilling for shared state
 * - Manual loading and error handling
 * - Duplicate snackbar logic everywhere
 * 
 * AFTER (Zustand pattern):
 * - Centralized state management
 * - No prop drilling
 * - Automatic loading/error states
 * - Global notification system
 */
const MaterialsExample: React.FC = () => {
  // Zustand stores - clean and simple!
  const {
    materials,
    loading,
    error,
    selectedCourse,
    setSelectedCourse,
    fetchMaterials,
    publishMaterial,
    unpublishMaterial
  } = useMaterialsStore();
  
  const { showSuccess, showError } = useNotificationStore();
  const { openDialog, closeDialog, isDialogOpen } = useUIStore();

  // Example course ID - in real app this would come from user selection
  const exampleCourseId = 'example-course-123';

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials(selectedCourse);
    }
  }, [selectedCourse, fetchMaterials]);

  const handleLoadMaterials = () => {
    setSelectedCourse(exampleCourseId);
    showSuccess('Loading materials for course...');
  };

  const handlePublishMaterial = async (materialId: string) => {
    try {
      await publishMaterial(materialId);
      showSuccess('Material published successfully!');
    } catch (error) {
      showError('Failed to publish material');
    }
  };

  const handleUnpublishMaterial = async (materialId: string) => {
    try {
      await unpublishMaterial(materialId);
      showSuccess('Material unpublished successfully!');
    } catch (error) {
      showError('Failed to unpublish material');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Zustand State Management Example
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This component demonstrates how Zustand simplifies state management.
        Notice how clean the code is compared to the old useState patterns!
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleLoadMaterials}
          disabled={loading}
        >
          Load Example Materials
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => openDialog('example-dialog')}
          sx={{ ml: 2 }}
        >
          Open Example Dialog
        </Button>
        
        {isDialogOpen('example-dialog') && (
          <Alert 
            severity="info" 
            onClose={() => closeDialog('example-dialog')}
            sx={{ mt: 2 }}
          >
            This dialog state is managed by Zustand UIStore!
          </Alert>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Loading materials...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Materials Grid */}
      <Grid container spacing={2}>
        {materials.map((material) => (
          <Grid item xs={12} md={6} lg={4} key={material.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {material.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Published: {material.published ? 'Yes' : 'No'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {material.published ? (
                    <Button 
                      size="small" 
                      onClick={() => handleUnpublishMaterial(material.id)}
                    >
                      Unpublish
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      onClick={() => handlePublishMaterial(material.id)}
                    >
                      Publish
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {materials.length === 0 && !loading && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No materials loaded. Click &quot;Load Example Materials&quot; to see the Zustand stores in action!
        </Typography>
      )}
    </Box>
  );
};

export default MaterialsExample; 