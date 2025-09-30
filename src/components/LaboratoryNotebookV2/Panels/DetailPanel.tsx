// src/components/LaboratoryNotebookV2/Panels/DetailPanel.tsx
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { isDesignNode, isBuildNode, isTestNode } from '../../../types/labNotebook';

const DetailPanel: React.FC = () => {
  const selectedNodeId = useLabNotebookStore((state) => state.selectedNodeId);
  const getNodeById = useLabNotebookStore((state) => state.getNodeById);
  const selectNode = useLabNotebookStore((state) => state.selectNode);
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const setIsExpanded = useLabNotebookStore((state) => state.setIsExpanded);

  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;

  if (!node) {
    return null;
  }

  const handleClose = () => {
    selectNode(null);
    setActivePanel(null);
  };

  const handleEdit = () => {
    setActivePanel('edit');
  };

  const handleDelete = () => {
    // TODO: Implement delete confirmation
    console.log('Delete:', node.id);
  };

  const handleAddBuild = () => {
    setActivePanel('addBuild');
  };

  const handleAddTest = () => {
    setActivePanel('addTest');
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const getNodeTypeInfo = () => {
    if (isDesignNode(node)) {
      return {
        type: 'Design',
        color: colors.primary[500],
        bgColor: colors.primary[50],
      };
    }
    if (isBuildNode(node)) {
      return {
        type: 'Build',
        color: colors.secondary[500],
        bgColor: colors.secondary[50],
      };
    }
    if (isTestNode(node)) {
      return {
        type: 'Test',
        color: colors.warning,
        bgColor: '#FFF7ED',
      };
    }
    return { type: 'Unknown', color: colors.neutral[500], bgColor: colors.neutral[50] };
  };

  const typeInfo = getNodeTypeInfo();
  const formattedDate = node.data.dateCreated.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[2] }}>
          <Chip
            label={typeInfo.type}
            size="small"
            sx={{
              backgroundColor: typeInfo.color,
              color: colors.text.inverse,
              fontWeight: typography.fontWeight.semibold,
            }}
          />
          <Box sx={{ display: 'flex', gap: spacing[0.5] }}>
            <IconButton size="small" onClick={handleExpand}>
              <FullscreenIcon />
            </IconButton>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography
          variant="h4"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            mb: spacing[1],
          }}
        >
          {node.data.title}
        </Typography>
        
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.tertiary,
              fontSize: typography.fontSize.sm,
            }}
          >
            Created {formattedDate}
          </Typography>
          {node.data.dateModified && (
            <Typography
              variant="body2"
              sx={{
                color: colors.text.tertiary,
                fontSize: typography.fontSize.sm,
                mt: spacing[0.5],
              }}
            >
              Last Modified {node.data.dateModified.toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: spacing[4],
        }}
      >
        {/* Description */}
        <Box sx={{ mb: spacing[4] }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: spacing[2],
            }}
          >
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            {node.data.description || 'No description provided'}
          </Typography>
        </Box>

        <Divider sx={{ my: spacing[4] }} />

        {/* Test-specific fields */}
        {isTestNode(node) && (
          <>
            <Box sx={{ mb: spacing[4] }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  mb: spacing[2],
                }}
              >
                Results
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.text.secondary,
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                {node.data.results || 'No results provided'}
              </Typography>
            </Box>

            <Box sx={{ mb: spacing[4] }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  mb: spacing[2],
                }}
              >
                Conclusions
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.text.secondary,
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                {node.data.conclusions || 'No conclusions provided'}
              </Typography>
            </Box>

            <Divider sx={{ my: spacing[4] }} />
          </>
        )}

        {/* Metadata */}
        <Box sx={{ mb: spacing[4] }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: spacing[2],
            }}
          >
            Attachments
          </Typography>
          
          <Box sx={{ display: 'flex', gap: spacing[3] }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <ImageIcon sx={{ color: colors.text.tertiary, fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {node.data.images?.length || 0} image{node.data.images?.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <FileIcon sx={{ color: colors.text.tertiary, fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {node.data.files?.length || 0} file{node.data.files?.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Design-specific info - removed course display */}

        {/* Build/Test count for Design */}
        {isDesignNode(node) && (
          <Box>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mb: spacing[1] }}
            >
              {node.data.buildCount} build{node.data.buildCount !== 1 ? 's' : ''}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary }}
            >
              {node.data.testCount} test{node.data.testCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box
        sx={{
          p: spacing[4],
          borderTop: `1px solid ${colors.neutral[200]}`,
        }}
      >
        {/* Quick Add Actions - only for Design and Build nodes */}
        {(isDesignNode(node) || isBuildNode(node)) && (
          <Box sx={{ mb: spacing[3], display: 'flex', gap: spacing[2] }}>
            {isDesignNode(node) && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddBuild}
                fullWidth
                sx={{
                  borderColor: colors.secondary[500],
                  color: colors.secondary[600],
                  fontWeight: typography.fontWeight.semibold,
                  '&:hover': {
                    borderColor: colors.secondary[600],
                    backgroundColor: colors.secondary[50],
                  },
                }}
              >
                Add Build
              </Button>
            )}
            {isBuildNode(node) && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTest}
                fullWidth
                sx={{
                  borderColor: colors.warning,
                  color: '#B45309',
                  fontWeight: typography.fontWeight.semibold,
                  '&:hover': {
                    borderColor: '#B45309',
                    backgroundColor: '#FFF7ED',
                  },
                }}
              >
                Add Test
              </Button>
            )}
          </Box>
        )}

        {/* Edit/Delete Actions */}
        <Box sx={{ display: 'flex', gap: spacing[2] }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            fullWidth
            sx={{
              backgroundColor: colors.primary[500],
              '&:hover': { backgroundColor: colors.primary[600] },
            }}
          >
            Edit
          </Button>
          
          {/* Delete button - only for builds and tests, NOT designs */}
          {!isDesignNode(node) && (
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{
                borderColor: colors.error,
                color: colors.error,
                '&:hover': {
                  borderColor: colors.error,
                  backgroundColor: '#FEE2E2',
                },
              }}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DetailPanel;

