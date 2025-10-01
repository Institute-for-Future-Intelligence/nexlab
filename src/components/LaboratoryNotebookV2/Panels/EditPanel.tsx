// src/components/LaboratoryNotebookV2/Panels/EditPanel.tsx
import React, { useState, useEffect } from 'react';
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
import { Close as CloseIcon, Save as SaveIcon, Fullscreen as FullscreenIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';
import { isDesignNode, isBuildNode, isTestNode } from '../../../types/labNotebook';
import { Image, FileDetails } from '../../../types/types';
import ImageUploadSection from '../ImageUploadSection';
import FileUploadSection from '../FileUploadSection';
import RichTextEditor from '../RichTextEditor';

const EditPanel: React.FC = () => {
  const selectedNodeId = useLabNotebookStore((state) => state.selectedNodeId);
  const getNodeById = useLabNotebookStore((state) => state.getNodeById);
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const setIsExpanded = useLabNotebookStore((state) => state.setIsExpanded);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);

  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [results, setResults] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with node data
  useEffect(() => {
    if (node) {
      setTitle(node.data.title || '');
      setDescription(node.data.description || '');
      setImages(node.data.images || []);
      setFiles(node.data.files || []);
      if (isTestNode(node)) {
        setResults(node.data.results || '');
        setConclusions(node.data.conclusions || '');
      }
    }
  }, [node]);

  if (!node) {
    return null;
  }

  const handleClose = () => {
    setActivePanel('detail');
    // Keep current expanded state
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
      if (isDesignNode(node)) {
        await labNotebookService.updateDesign({
          id: node.data.designId,
          title: title.trim(),
          description: description.trim(),
          images: images,
          files: files,
        });
      } else if (isBuildNode(node)) {
        await labNotebookService.updateBuild({
          id: node.data.buildId,
          title: title.trim(),
          description: description.trim(),
          images: images,
          files: files,
        });
      } else if (isTestNode(node)) {
        await labNotebookService.updateTest({
          id: node.data.testId,
          title: title.trim(),
          description: description.trim(),
          results: results.trim(),
          conclusions: conclusions.trim(),
          images: images,
          files: files,
        });
      }

      // Refresh data
      await fetchAllData(node.data.userId, false, []);

      // Close panel and show success
      setActivePanel('detail');
    } catch (err) {
      console.error('Error updating:', err);
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNodeTypeInfo = () => {
    if (isDesignNode(node)) {
      return { type: 'Design', color: colors.primary[500], bgColor: colors.primary[50] };
    }
    if (isBuildNode(node)) {
      return { type: 'Build', color: colors.secondary[500], bgColor: colors.secondary[50] };
    }
    if (isTestNode(node)) {
      return { type: 'Test', color: colors.warning, bgColor: '#FFF7ED' };
    }
    return { type: 'Unknown', color: colors.neutral[500], bgColor: colors.neutral[50] };
  };

  const typeInfo = getNodeTypeInfo();

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
          backgroundColor: typeInfo.bgColor,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            Edit {typeInfo.type}
          </Typography>
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
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          disabled={isSubmitting}
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
            placeholder="Enter description..."
            minHeight={200}
            disabled={isSubmitting}
          />
        </Box>

        {/* Divider */}
        <Divider sx={{ my: spacing[2] }} />

        {/* Image Upload Section */}
        <ImageUploadSection
          images={images}
          onImagesChange={setImages}
          storagePath={
            isDesignNode(node)
              ? `designs/${node.data.designId}`
              : isBuildNode(node)
              ? `builds/${node.data.buildId}`
              : isTestNode(node)
              ? `tests/${node.data.testId}`
              : ''
          }
          disabled={isSubmitting}
        />

        {/* Divider */}
        <Divider sx={{ my: spacing[2] }} />

        {/* File Upload Section */}
        <FileUploadSection
          files={files}
          onFilesChange={setFiles}
          storagePath={
            isDesignNode(node)
              ? `designs/${node.data.designId}`
              : isBuildNode(node)
              ? `builds/${node.data.buildId}`
              : isTestNode(node)
              ? `tests/${node.data.testId}`
              : ''
          }
          disabled={isSubmitting}
          maxFileSize={10}
        />

        {/* Test-specific fields */}
        {isTestNode(node) && (
          <>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: spacing[1],
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Results
              </Typography>
              <RichTextEditor
                value={results}
                onChange={setResults}
                placeholder="Describe the test results..."
                minHeight={150}
                disabled={isSubmitting}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: spacing[1],
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Conclusions
              </Typography>
              <RichTextEditor
                value={conclusions}
                onChange={setConclusions}
                placeholder="What conclusions can you draw?"
                minHeight={150}
                disabled={isSubmitting}
              />
            </Box>
          </>
        )}
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
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            backgroundColor: colors.primary[500],
            '&:hover': { backgroundColor: colors.primary[600] },
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default EditPanel;

