// src/components/LaboratoryNotebookV2/Panels/ExpandedAddTestPanel.tsx
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
  Dialog,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';
import RichTextEditor from '../RichTextEditor';

interface ExpandedAddTestPanelProps {
  designId?: string;
}

const ExpandedAddTestPanel: React.FC<ExpandedAddTestPanelProps> = ({ designId: propDesignId }) => {
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
      designId = selectedNode.id.replace('design-', '');
    } else if (selectedNode.id && selectedNode.id.startsWith('build-')) {
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
  const initialBuildId = useMemo(() => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update buildId when initialBuildId changes
  useEffect(() => {
    if (initialBuildId) {
      setBuildId(initialBuildId);
    }
  }, [initialBuildId]);

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

      // Return to detail view
      setActivePanel('detail');
      
      // Clear form
      setTitle('');
      setDescription('');
      setResults('');
      setConclusions('');
    } catch (err) {
      console.error('Error creating test:', err);
      setError(err instanceof Error ? err.message : 'Failed to create test');
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
          backgroundColor: '#FFF7ED',
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
              Add Test
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

        {designBuilds.length === 0 ? (
          <Alert severity="warning">
            No builds available. Please create a build first before adding tests.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Select Build</InputLabel>
              <Select
                value={buildId}
                onChange={(e) => setBuildId(e.target.value)}
                label="Select Build"
                sx={{
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.lg,
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
                  fontSize: typography.fontSize.xl,
                },
              }}
            />

            <Box>
              <Typography
                variant="body1"
                sx={{
                  mb: spacing[2],
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.lg,
                }}
              >
                Description *
              </Typography>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe the test methodology..."
                minHeight={250}
                disabled={isSubmitting}
              />
            </Box>

            <Box>
              <Typography
                variant="body1"
                sx={{
                  mb: spacing[2],
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.lg,
                }}
              >
                Results (Optional)
              </Typography>
              <RichTextEditor
                value={results}
                onChange={setResults}
                placeholder="Document the test results..."
                minHeight={250}
                disabled={isSubmitting}
              />
            </Box>

            <Box>
              <Typography
                variant="body1"
                sx={{
                  mb: spacing[2],
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.lg,
                }}
              >
                Conclusions (Optional)
              </Typography>
              <RichTextEditor
                value={conclusions}
                onChange={setConclusions}
                placeholder="What conclusions can you draw?"
                minHeight={250}
                disabled={isSubmitting}
              />
            </Box>
          </Box>
        )}
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
    </Dialog>
  );
};

export default ExpandedAddTestPanel;

