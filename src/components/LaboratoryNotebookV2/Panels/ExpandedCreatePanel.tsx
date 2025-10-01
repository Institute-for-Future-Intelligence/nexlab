// src/components/LaboratoryNotebookV2/Panels/ExpandedCreatePanel.tsx
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
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { labNotebookService } from '../../../services/labNotebookService';
import { useUser } from '../../../hooks/useUser';
import { CourseSelector, CourseOption } from '../../common';
import RichTextEditor from '../RichTextEditor';
import ImageUploadSection from '../ImageUploadSection';
import FileUploadSection from '../FileUploadSection';
import { Image, FileDetails } from '../../../types/types';

const ExpandedCreatePanel: React.FC = () => {
  const { userDetails } = useUser();
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const setIsExpanded = useLabNotebookStore((state) => state.setIsExpanded);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert user courses to CourseOption format
  const courseOptions: CourseOption[] = Object.entries(userDetails?.classes || {}).map(([id, course]) => ({
    id,
    number: course.number,
    title: course.title,
    isCourseAdmin: course.isCourseAdmin,
  }));

  const handleBack = () => {
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setActivePanel(null);
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
      setIsExpanded(false);
      setActivePanel(null);
    } catch (err) {
      console.error('Error creating design:', err);
      setError(err instanceof Error ? err.message : 'Failed to create design');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      {/* Fixed Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          p: spacing[4],
          borderBottom: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.primary[50],
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <IconButton size="small" onClick={handleBack} disabled={isSubmitting}>
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
                Create New Design
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleClose} disabled={isSubmitting}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: spacing[6],
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            width: '100%',
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
              placeholder="Describe your design, its purpose, and goals..."
              minHeight={400}
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
              Course *
            </Typography>
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
          <Divider sx={{ my: spacing[3] }} />

          {/* Image Upload Section */}
          <ImageUploadSection
            images={images}
            onImagesChange={setImages}
            storagePath=""
            disabled={isSubmitting}
          />

          {/* Divider */}
          <Divider sx={{ my: spacing[3] }} />

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
            {isSubmitting ? 'Creating...' : 'Create Design'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ExpandedCreatePanel;

