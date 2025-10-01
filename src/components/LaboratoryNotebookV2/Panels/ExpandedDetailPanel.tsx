// src/components/LaboratoryNotebookV2/Panels/ExpandedDetailPanel.tsx
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
  Dialog,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  Minimize as MinimizeIcon,
} from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../../config/designSystem';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { isDesignNode, isBuildNode, isTestNode } from '../../../types/labNotebook';
import ImageGallery from '../ImageGallery';
import FileAttachmentsList from '../FileAttachmentsList';
import RichTextDisplay from '../RichTextDisplay';

const ExpandedDetailPanel: React.FC = () => {
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
    setIsExpanded(false);
  };

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  const handleEdit = () => {
    setActivePanel('edit');
    // Keep expanded mode
  };

  const handleAddBuild = () => {
    setActivePanel('addBuild');
    // Keep expanded mode
  };

  const handleAddTest = () => {
    setActivePanel('addTest');
    // Keep expanded mode
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[2] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Chip
              label={typeInfo.type}
              size="medium"
              sx={{
                backgroundColor: typeInfo.color,
                color: colors.text.inverse,
                fontWeight: typography.fontWeight.semibold,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              {node.data.title}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: spacing[1] }}>
            <IconButton size="medium" onClick={handleMinimize}>
              <MinimizeIcon />
            </IconButton>
            <IconButton size="medium" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

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

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: spacing[6],
          maxWidth: 1200,
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Description */}
        <Box sx={{ mb: spacing[6] }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: spacing[3],
            }}
          >
            Description
          </Typography>
          <RichTextDisplay 
            content={node.data.description || '<p>No description provided</p>'} 
          />
        </Box>

        <Divider sx={{ my: spacing[6] }} />

        {/* Test-specific fields */}
        {isTestNode(node) && (
          <>
            <Box sx={{ mb: spacing[6] }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  mb: spacing[3],
                }}
              >
                Results
              </Typography>
              <RichTextDisplay 
                content={node.data.results || '<p>No results provided</p>'} 
              />
            </Box>

            <Box sx={{ mb: spacing[6] }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  mb: spacing[3],
                }}
              >
                Conclusions
              </Typography>
              <RichTextDisplay 
                content={node.data.conclusions || '<p>No conclusions provided</p>'} 
              />
            </Box>

            <Divider sx={{ my: spacing[6] }} />
          </>
        )}

        {/* Images Section */}
        <Box sx={{ mb: spacing[6] }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: spacing[3],
            }}
          >
            Images ({node.data.images?.length || 0})
          </Typography>
          <ImageGallery images={node.data.images || []} />
        </Box>

        {/* Files Section */}
        <Box sx={{ mb: spacing[6] }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: typography.fontFamily.secondary,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: spacing[3],
            }}
          >
            Files ({node.data.files?.length || 0})
          </Typography>
          <FileAttachmentsList files={node.data.files || []} />
        </Box>

        {/* Build/Test count for Design */}
        {isDesignNode(node) && (
          <Box sx={{ mb: spacing[6] }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                mb: spacing[3],
              }}
            >
              Progress
            </Typography>
            <Box sx={{ display: 'flex', gap: spacing[4] }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: typography.fontFamily.display,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.secondary[600],
                  }}
                >
                  {node.data.buildCount}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  Build{node.data.buildCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: typography.fontFamily.display,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.warning,
                  }}
                >
                  {node.data.testCount}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  Test{node.data.testCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
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
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          {/* Quick Add Actions */}
          {(isDesignNode(node) || isBuildNode(node)) && (
            <Box sx={{ mb: spacing[3], display: 'flex', gap: spacing[2] }}>
              {isDesignNode(node) && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddBuild}
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

          {/* Edit Action */}
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            fullWidth
            size="large"
            sx={{
              backgroundColor: colors.primary[500],
              '&:hover': { backgroundColor: colors.primary[600] },
            }}
          >
            Edit
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ExpandedDetailPanel;

