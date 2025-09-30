// src/components/LaboratoryNotebookV2/Panels/ExpandedAddBuildPanel.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';

interface ExpandedAddBuildPanelProps {
  designId?: string;
}

const ExpandedAddBuildPanel: React.FC<ExpandedAddBuildPanelProps> = ({ designId: propDesignId }) => {
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const setIsExpanded = useLabNotebookStore((state) => state.setIsExpanded);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);
  const designs = useLabNotebookStore((state) => state.designs);
  const selectedNodeId = useLabNotebookStore((state) => state.selectedNodeId);
  const getNodeById = useLabNotebookStore((state) => state.getNodeById);
  
  // Get design ID from either props or the selected node
  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  let designId = propDesignId;
  
  // If no prop designId, try to get from selected node
  if (!designId && selectedNode) {
    if (selectedNode.data?.designId) {
      designId = selectedNode.data.designId;
    } else if (selectedNode.id && selectedNode.id.startsWith('design-')) {
      designId = selectedNode.id.replace('design-', '');
    }
  }
  
  const design = designs.find(d => d.id === designId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!design) {
    return null;
  }

  const handleClose = () => {
    setActivePanel(null);
    setIsExpanded(false);
  };

  const handleBack = () => {
    setActivePanel('detail');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await labNotebookService.createBuild({
        designId: designId,
        userId: design.userId,
        title: title.trim(),
        description: description.trim(),
      });

      // Refresh data
      await fetchAllData(design.userId, false, []);

      // Return to detail view
      setActivePanel('detail');
      
      // Clear form
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error creating build:', err);
      setError(err instanceof Error ? err.message : 'Failed to create build');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: colors.background.secondary,
        },
      }}
    >
      {/* Fixed Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          p: spacing[4],
          backgroundColor: colors.secondary[50],
          borderBottom: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: spacing[2] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <IconButton onClick={handleBack} disabled={isSubmitting}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h3"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              Add Build
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography
          variant="body1"
          sx={{ color: colors.text.secondary }}
        >
          To: {design.title}
        </Typography>
      </Box>

      {/* Scrollable Form Content */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: spacing[6],
          maxWidth: 1200,
          mx: 'auto',
          width: '100%',
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: spacing[4] }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          <TextField
            label="Build Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            disabled={isSubmitting}
            placeholder="e.g., Prototype v1.0"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.xl,
              },
            }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            multiline
            rows={12}
            disabled={isSubmitting}
            placeholder="Describe the build details, materials, methods, etc."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.lg,
              },
            }}
          />
        </Box>
      </Box>

      {/* Fixed Footer with Actions */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          p: spacing[4],
          backgroundColor: colors.background.primary,
          borderTop: `1px solid ${colors.neutral[200]}`,
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box 
          sx={{ 
            maxWidth: 1200, 
            mx: 'auto', 
            width: '100%',
            display: 'flex',
            gap: spacing[2],
          }}
        >
          <Button
            variant="outlined"
            onClick={handleBack}
            fullWidth
            size="large"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{
              backgroundColor: colors.secondary[500],
              '&:hover': { backgroundColor: colors.secondary[600] },
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Build'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ExpandedAddBuildPanel;

