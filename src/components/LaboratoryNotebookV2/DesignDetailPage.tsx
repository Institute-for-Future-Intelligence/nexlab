// src/components/LaboratoryNotebookV2/DesignDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ReactFlowProvider } from 'reactflow';
import { useUser } from '../../hooks/useUser';
import { useLabNotebookStore } from '../../stores/labNotebookStore';
import { colors, spacing, typography, borderRadius } from '../../config/designSystem';
import LabCanvas from './Canvas/LabCanvas';
import DetailPanel from './Panels/DetailPanel';
import ExpandedDetailPanel from './Panels/ExpandedDetailPanel';
import EditPanel from './Panels/EditPanel';
import ExpandedEditPanel from './Panels/ExpandedEditPanel';
import AddBuildPanel from './Panels/AddBuildPanel';
import ExpandedAddBuildPanel from './Panels/ExpandedAddBuildPanel';
import AddTestPanel from './Panels/AddTestPanel';
import ExpandedAddTestPanel from './Panels/ExpandedAddTestPanel';

/**
 * Design Detail Page - Shows mind-map for a specific design only
 */
const DesignDetailPage: React.FC = () => {
  const { designId } = useParams<{ designId: string }>();
  const navigate = useNavigate();
  const { userDetails } = useUser();
  
  const designs = useLabNotebookStore((state) => state.designs);
  const nodes = useLabNotebookStore((state) => state.nodes);
  const isLoading = useLabNotebookStore((state) => state.isLoading);
  const activePanel = useLabNotebookStore((state) => state.activePanel);
  const isExpanded = useLabNotebookStore((state) => state.isExpanded);
  const buildGraph = useLabNotebookStore((state) => state.buildGraph);

  const design = designs.find(d => d.id === designId);

  // Filter nodes to show only this design's hierarchy
  useEffect(() => {
    if (design) {
      buildGraph();
    }
  }, [design, buildGraph]);

  // Filter nodes for this design only
  const filteredNodes = nodes.filter(node => {
    if (node.type === 'designNode') {
      return node.data.designId === designId;
    }
    if (node.type === 'buildNode') {
      return node.data.designId === designId;
    }
    if (node.type === 'testNode') {
      return node.data.designId === designId;
    }
    return false;
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: spacing[4],
        }}
      >
        <CircularProgress size={60} sx={{ color: colors.primary[500] }} />
        <Typography
          variant="h6"
          sx={{
            fontFamily: typography.fontFamily.display,
            color: colors.text.secondary,
          }}
        >
          Loading design...
        </Typography>
      </Box>
    );
  }

  if (!design) {
    return (
      <Box sx={{ p: spacing[6] }}>
        <Alert severity="error" sx={{ borderRadius: '12px', mb: spacing[4] }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Design Not Found
          </Typography>
          <Typography variant="body2">
            The design you're looking for doesn't exist or you don't have permission to view it.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/laboratory-notebook')}
        >
          Back to Designs
        </Button>
      </Box>
    );
  }

  return (
    <ReactFlowProvider>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: colors.background.secondary,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: spacing[4],
            backgroundColor: colors.background.primary,
            borderBottom: `1px solid ${colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/laboratory-notebook')}
            sx={{ borderRadius: borderRadius.lg }}
          >
            Back to Designs
          </Button>
          
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: typography.fontFamily.display,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              {design.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.text.tertiary,
                mt: spacing[1],
              }}
            >
              {design.description}
            </Typography>
          </Box>
        </Box>

        {/* Canvas */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <LabCanvas designIdFilter={designId} />
        </Box>

        {/* Panels */}
        {isExpanded ? (
          <>
            {activePanel === 'detail' && <ExpandedDetailPanel />}
            {activePanel === 'edit' && <ExpandedEditPanel />}
            {activePanel === 'addBuild' && <ExpandedAddBuildPanel designId={designId} />}
            {activePanel === 'addTest' && <ExpandedAddTestPanel designId={designId} />}
          </>
        ) : (
          <>
            {activePanel === 'detail' && <DetailPanel />}
            {activePanel === 'edit' && <EditPanel />}
            {activePanel === 'addBuild' && <AddBuildPanel designId={designId} />}
            {activePanel === 'addTest' && <AddTestPanel designId={designId} />}
          </>
        )}
      </Box>
    </ReactFlowProvider>
  );
};

export default DesignDetailPage;

