// src/components/LaboratoryNotebookV2/Panels/AddBuildPanel.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Fullscreen as FullscreenIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';
import RichTextEditor from '../RichTextEditor';
import ImageUploadSection from '../ImageUploadSection';
import FileUploadSection from '../FileUploadSection';
import { Image, FileDetails } from '../../../types/types';

interface AddBuildPanelProps {
  designId?: string;
}

const AddBuildPanel: React.FC<AddBuildPanelProps> = ({ designId: propDesignId }) => {
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
      // Extract design ID from node ID (format: "design-{designId}")
      designId = selectedNode.id.replace('design-', '');
    }
  }
  
  const design = designs.find(d => d.id === designId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!design) {
    return null;
  }

  const handleClose = () => {
    setActivePanel(null);
  };

  const handleExpand = () => {
    setIsExpanded(true);
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
        images,
        files,
      });

      // Refresh data
      await fetchAllData(design.userId, false, []);

      // Close panel
      setActivePanel(null);
    } catch (err) {
      console.error('Error creating build:', err);
      setError(err instanceof Error ? err.message : 'Failed to create build');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 480,
        backgroundColor: colors.background.primary,
        boxShadow: shadows['2xl'],
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out',
        '@keyframes slideInRight': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: spacing[4],
          borderBottom: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.secondary[50],
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              Add Build
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mt: spacing[1] }}
            >
              To: {design.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: spacing[0.5] }}>
            <IconButton size="small" onClick={handleExpand} disabled={isSubmitting}>
              <FullscreenIcon />
            </IconButton>
            <IconButton size="small" onClick={handleClose} disabled={isSubmitting}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: spacing[4],
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4],
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
            },
          }}
        />

        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: spacing[1],
              color: colors.text.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Description *
          </Typography>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Describe the build details, materials, methods, etc..."
            minHeight={250}
            disabled={isSubmitting}
          />
        </Box>

        {/* Divider */}
        <Divider sx={{ my: spacing[2] }} />

        {/* Image Upload Section */}
        <ImageUploadSection
          images={images}
          onImagesChange={setImages}
          storagePath=""
          disabled={isSubmitting}
        />

        {/* Divider */}
        <Divider sx={{ my: spacing[2] }} />

        {/* File Upload Section */}
        <FileUploadSection
          files={files}
          onFilesChange={setFiles}
          storagePath=""
          disabled={isSubmitting}
          maxFileSize={10}
        />
      </Box>

      {/* Actions */}
      <Box
        sx={{
          p: spacing[4],
          borderTop: `1px solid ${colors.neutral[200]}`,
          display: 'flex',
          gap: spacing[2],
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          fullWidth
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          fullWidth
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
  );
};

export default AddBuildPanel;

