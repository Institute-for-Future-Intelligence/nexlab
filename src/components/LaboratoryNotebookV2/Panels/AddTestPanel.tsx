// src/components/LaboratoryNotebookV2/Panels/AddTestPanel.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Fullscreen as FullscreenIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';
import RichTextEditor from '../RichTextEditor';

interface AddTestPanelProps {
  designId?: string;
}

const AddTestPanel: React.FC<AddTestPanelProps> = ({ designId: propDesignId }) => {
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const setIsExpanded = useLabNotebookStore((state) => state.setIsExpanded);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);
  const designs = useLabNotebookStore((state) => state.designs);
  const builds = useLabNotebookStore((state) => state.builds);
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
    } else if (selectedNode.id && selectedNode.id.startsWith('build-')) {
      // For build nodes, get design ID from the build data
      const buildId = selectedNode.id.replace('build-', '');
      const build = builds.find(b => b.id === buildId);
      if (build) {
        designId = build.design_ID;
      }
    }
  }
  
  const design = designs.find(d => d.id === designId);
  const designBuilds = builds.filter(b => b.design_ID === designId);

  // Auto-select build if we're adding a test from a build node
  const initialBuildId = React.useMemo(() => {
    if (selectedNode && selectedNode.id && selectedNode.id.startsWith('build-')) {
      return selectedNode.id.replace('build-', '');
    }
    return '';
  }, [selectedNode]);

  const [buildId, setBuildId] = useState(initialBuildId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [results, setResults] = useState('');
  const [conclusions, setConclusions] = useState('');

  // Update buildId when initialBuildId changes
  React.useEffect(() => {
    if (initialBuildId) {
      setBuildId(initialBuildId);
    }
  }, [initialBuildId]);
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
    
    if (!buildId) {
      setError('Please select a build');
      return;
    }

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
      await labNotebookService.createTest({
        buildId: buildId,
        designId: designId,
        userId: design.userId,
        title: title.trim(),
        description: description.trim(),
        results: results.trim(),
        conclusions: conclusions.trim(),
      });

      // Refresh data
      await fetchAllData(design.userId, false, []);

      // Close panel
      setActivePanel(null);
    } catch (err) {
      console.error('Error creating test:', err);
      setError(err instanceof Error ? err.message : 'Failed to create test');
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
          backgroundColor: '#FFF7ED',
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
              Add Test
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

        {designBuilds.length === 0 ? (
          <Alert severity="warning">
            No builds available. Please create a build first before adding tests.
          </Alert>
        ) : (
          <>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Select Build</InputLabel>
              <Select
                value={buildId}
                onChange={(e) => setBuildId(e.target.value)}
                label="Select Build"
                sx={{
                  borderRadius: borderRadius.lg,
                }}
              >
                {designBuilds.map((build) => (
                  <MenuItem key={build.id} value={build.id}>
                    {build.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Test Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="e.g., Temperature Test"
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
                placeholder="Describe the test methodology..."
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
                Results (Optional)
              </Typography>
              <RichTextEditor
                value={results}
                onChange={setResults}
                placeholder="Document the test results..."
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
                Conclusions (Optional)
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
          disabled={isSubmitting || designBuilds.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
          sx={{
            backgroundColor: colors.warning,
            color: colors.text.primary,
            '&:hover': { backgroundColor: '#F59E0B' },
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Test'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddTestPanel;

