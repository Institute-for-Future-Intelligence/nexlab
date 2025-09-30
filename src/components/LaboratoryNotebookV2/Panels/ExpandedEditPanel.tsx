// src/components/LaboratoryNotebookV2/Panels/ExpandedEditPanel.tsx
import React, { useState, useEffect } from 'react';
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
import { Close as CloseIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';
import { isDesignNode, isBuildNode, isTestNode } from '../../../types/labNotebook';

const ExpandedEditPanel: React.FC = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with node data
  useEffect(() => {
    if (node) {
      setTitle(node.data.title || '');
      setDescription(node.data.description || '');
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
      if (isDesignNode(node)) {
        await labNotebookService.updateDesign({
          id: node.data.designId,
          title: title.trim(),
          description: description.trim(),
        });
      } else if (isBuildNode(node)) {
        await labNotebookService.updateBuild({
          id: node.data.buildId,
          title: title.trim(),
          description: description.trim(),
        });
      } else if (isTestNode(node)) {
        await labNotebookService.updateTest({
          id: node.data.testId,
          title: title.trim(),
          description: description.trim(),
          results: results.trim(),
          conclusions: conclusions.trim(),
        });
      }

      // Refresh data
      await fetchAllData(node.data.userId, false, []);

      // Return to detail view
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
          backgroundColor: typeInfo.bgColor,
          borderBottom: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              Edit {typeInfo.type}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Box>
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
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            disabled={isSubmitting}
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
            rows={10}
            disabled={isSubmitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.lg,
              },
            }}
          />

          {/* Test-specific fields */}
          {isTestNode(node) && (
            <>
              <TextField
                label="Results"
                value={results}
                onChange={(e) => setResults(e.target.value)}
                fullWidth
                multiline
                rows={8}
                disabled={isSubmitting}
                placeholder="Describe the test results..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.lg,
                  },
                }}
              />

              <TextField
                label="Conclusions"
                value={conclusions}
                onChange={(e) => setConclusions(e.target.value)}
                fullWidth
                multiline
                rows={8}
                disabled={isSubmitting}
                placeholder="What conclusions can you draw?"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.lg,
                  },
                }}
              />
            </>
          )}
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
    </Dialog>
  );
};

export default ExpandedEditPanel;

