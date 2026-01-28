// src/components/LaboratoryNotebookV2/Panels/DetailPanel.tsx
import React, { useState } from 'react';
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
import { labNotebookService } from '../../../services/labNotebookService';
import ImageGallery from '../ImageGallery';
import FileAttachmentsList from '../FileAttachmentsList';
import ConfirmationDialog from '../ConfirmationDialog';
import RichTextDisplay from '../RichTextDisplay';
import DataAnalysisPanel from '../DataAnalysis/DataAnalysisPanel';

const DetailPanel: React.FC = () => {
  const selectedNodeId = useLabNotebookStore((state) => state.selectedNodeId);
  const getNodeById = useLabNotebookStore((state) => state.getNodeById);
  const selectNode = useLabNotebookStore((state) => state.selectNode);
  const setActivePanel = useLabNotebookStore((state) => state.setActivePanel);
  const setIsExpanded = useLabNotebookStore((state) => state.setIsExpanded);
  const fetchAllData = useLabNotebookStore((state) => state.fetchAllData);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;

  // Data Analysis handlers
  const handleSaveDataset = async (dataset: any) => {
    if (!node) return;
    
    try {
      let nodeType: 'design' | 'build' | 'test';
      let nodeId: string;

      if (isDesignNode(node)) {
        nodeType = 'design';
        nodeId = node.data.designId;
      } else if (isBuildNode(node)) {
        nodeType = 'build';
        nodeId = node.data.buildId;
      } else if (isTestNode(node)) {
        nodeType = 'test';
        nodeId = node.data.testId;
      } else {
        throw new Error('Unknown node type');
      }

      await labNotebookService.addDataset(nodeType, nodeId, dataset);
      
      // Refresh data to reflect changes
      console.log('Refreshing data after dataset save...');
      await fetchAllData(node.data.userId, false, []);
      
      // Force a small delay to ensure Firestore has propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Dataset saved successfully. Node data:', node.data.dataAnalysis);
    } catch (error) {
      console.error('Error saving dataset:', error);
      alert('Failed to save dataset. Please try again.');
    }
  };

  const handleSaveAnalysis = async (analysis: any) => {
    if (!node) return;
    
    try {
      let nodeType: 'design' | 'build' | 'test';
      let nodeId: string;

      if (isDesignNode(node)) {
        nodeType = 'design';
        nodeId = node.data.designId;
      } else if (isBuildNode(node)) {
        nodeType = 'build';
        nodeId = node.data.buildId;
      } else if (isTestNode(node)) {
        nodeType = 'test';
        nodeId = node.data.testId;
      } else {
        throw new Error('Unknown node type');
      }

      await labNotebookService.addAnalysis(nodeType, nodeId, analysis);
      
      // Refresh data to reflect changes
      await fetchAllData(node.data.userId, false, []);
      
      console.log('Analysis saved successfully');
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Failed to save analysis. Please try again.');
    }
  };

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
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      if (isBuildNode(node)) {
        await labNotebookService.deleteBuild(node.data.buildId, node.data.userId);
      } else if (isTestNode(node)) {
        await labNotebookService.deleteTest(node.data.testId, node.data.userId);
      }

      // Close dialog and panel
      setShowDeleteDialog(false);
      handleClose();

      // Refresh data
      await fetchAllData(node.data.userId, false, []);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
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
          <RichTextDisplay 
            content={node.data.description || '<p>No description provided</p>'} 
          />
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
              <RichTextDisplay 
                content={node.data.results || '<p>No results provided</p>'} 
              />
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
              <RichTextDisplay 
                content={node.data.conclusions || '<p>No conclusions provided</p>'} 
              />
            </Box>

            <Divider sx={{ my: spacing[4] }} />
          </>
        )}

        {/* Images Section */}
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
            Images ({node.data.images?.length || 0})
          </Typography>
          <ImageGallery images={node.data.images || []} />
        </Box>

        {/* Files Section */}
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
            Files ({node.data.files?.length || 0})
          </Typography>
          <FileAttachmentsList files={node.data.files || []} />
        </Box>

        <Divider sx={{ my: spacing[4] }} />

        {/* Data Analysis Section */}
        <Box sx={{ mb: spacing[4] }}>
          <DataAnalysisPanel
            key={`${selectedNodeId}-${node.data.dataAnalysis?.datasets?.length || 0}`}
            userId={node.data.userId}
            nodeId={
              isDesignNode(node) ? node.data.designId :
              isBuildNode(node) ? node.data.buildId :
              (isTestNode(node) ? node.data.testId : '')
            }
            nodeType={
              isDesignNode(node) ? 'design' :
              (isBuildNode(node) ? 'build' : 'test')
            }
            existingDatasets={node.data.dataAnalysis?.datasets || []}
            existingAnalyses={node.data.dataAnalysis?.analyses || []}
            onSaveDataset={handleSaveDataset}
            onSaveAnalysis={handleSaveAnalysis}
          />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        title={`Delete ${isBuildNode(node) ? 'Build' : 'Test'}?`}
        message={`Are you sure you want to delete "${node.data.title}"? ${
          isBuildNode(node) 
            ? 'This will also delete all associated tests. ' 
            : ''
        }This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </Box>
  );
};

export default DetailPanel;

