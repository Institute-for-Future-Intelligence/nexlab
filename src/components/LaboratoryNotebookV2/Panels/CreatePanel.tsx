// src/components/LaboratoryNotebookV2/Panels/CreatePanel.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Fullscreen as FullscreenIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';
import { useUser } from '../../../hooks/useUser';
import { CourseSelector, CourseOption } from '../../common';
import RichTextEditor from '../RichTextEditor';
import ImageUploadSection from '../ImageUploadSection';
import FileUploadSection from '../FileUploadSection';
import { Image, FileDetails } from '../../../types/types';

const CreatePanel: React.FC = () => {
  const { userDetails } = useUser();
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const addDesign = useLabNotebookStore((state) => state.addDesign);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setIsExpanded = useLabNotebookStore((state) => state.setIsExpanded);

  // Convert user courses to CourseOption format
  const courseOptions: CourseOption[] = Object.entries(userDetails?.classes || {}).map(([id, course]) => ({
    id,
    number: course.number,
    title: course.title,
    isCourseAdmin: course.isCourseAdmin,
  }));

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

    if (!course) {
      setError('Please select a course');
      return;
    }

    if (!userDetails) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const designId = await labNotebookService.createDesign({
        title: title.trim(),
        description: description.trim(),
        course,
        userId: userDetails.uid,
        images,
        files,
      });

      // Refresh data to show the new design
      const courses = Object.keys(userDetails.classes || {});
      await fetchAllData(userDetails.uid, userDetails.isAdmin, courses);

      // Close panel
      setActivePanel(null);
    } catch (err) {
      console.error('Error creating design:', err);
      setError(err instanceof Error ? err.message : 'Failed to create design');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
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
          backgroundColor: colors.primary[50],
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
            Create New Design
          </Typography>
          <Box sx={{ display: 'flex', gap: spacing[1] }}>
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
          placeholder="Enter design title"
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
            placeholder="Describe your design, its purpose, and goals..."
            minHeight={200}
            disabled={isSubmitting}
          />
        </Box>

        <Box>
          <CourseSelector
            value={course}
            onChange={(courseId) => setCourse(courseId || '')}
            courses={courseOptions}
            disabled={isSubmitting}
            size="medium"
            showAdminBadge={false}
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

        <Alert severity="info" sx={{ borderRadius: borderRadius.lg }}>
          <Typography variant="body2">
            After creating your design, you can add builds and tests to it from the graph view.
          </Typography>
        </Alert>
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
          {isSubmitting ? 'Creating...' : 'Create Design'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreatePanel;

