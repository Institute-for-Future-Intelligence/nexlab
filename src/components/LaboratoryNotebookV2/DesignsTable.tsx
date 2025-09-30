// src/components/LaboratoryNotebookV2/DesignsTable.tsx
import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';
import { Design } from '../../types/types';
import { useLabNotebookStore } from '../../stores/labNotebookStore';

interface DesignsTableProps {
  designs: Design[];
}

const DesignsTable: React.FC<DesignsTableProps> = ({ designs }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const builds = useLabNotebookStore((state) => state.builds);
  const tests = useLabNotebookStore((state) => state.tests);

  const getDesignStats = (designId: string) => {
    const designBuilds = builds.filter(b => b.design_ID === designId);
    const buildIds = designBuilds.map(b => b.id);
    const designTests = tests.filter(t => buildIds.includes(t.build_ID));
    
    return {
      buildCount: designBuilds.length,
      testCount: designTests.length,
    };
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    let date: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    return `${dateStr}, ${timeStr}`;
  };

  const handleViewDesign = (designId: string) => {
    navigate(`/laboratory-notebook/${designId}`);
  };

  if (designs.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          p: spacing[6],
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: typography.fontFamily.display,
            color: colors.text.secondary,
            mb: spacing[2],
          }}
        >
          No Designs Yet
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: colors.text.tertiary,
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          Start by creating your first design to visualize your experimental workflow.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: borderRadius.xl,
        boxShadow: shadows.md,
        border: `1px solid ${colors.neutral[200]}`,
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: colors.background.secondary }}>
            <TableCell
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            >
              Title
            </TableCell>
            {!isMobile && (
              <TableCell
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                Description
              </TableCell>
            )}
            <TableCell
              align="center"
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            >
              Builds
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            >
              Tests
            </TableCell>
            {!isMobile && (
              <>
                <TableCell
                  sx={{
                    fontFamily: typography.fontFamily.secondary,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  Created
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: typography.fontFamily.secondary,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  Modified
                </TableCell>
              </>
            )}
            <TableCell
              align="center"
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {designs.map((design) => {
            const stats = getDesignStats(design.id);
            
            return (
              <TableRow
                key={design.id}
                sx={{
                  '&:hover': {
                    backgroundColor: colors.primary[50],
                    cursor: 'pointer',
                  },
                  transition: animations.transitions.fast,
                }}
                onClick={() => handleViewDesign(design.id)}
              >
                <TableCell>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.secondary,
                    }}
                  >
                    {design.title}
                  </Typography>
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        maxWidth: 400,
                      }}
                    >
                      {design.description || 'No description'}
                    </Typography>
                  </TableCell>
                )}
                <TableCell align="center">
                  <Chip
                    label={stats.buildCount}
                    size="small"
                    sx={{
                      backgroundColor: stats.buildCount > 0 ? colors.secondary[100] : colors.neutral[100],
                      color: stats.buildCount > 0 ? colors.secondary[700] : colors.text.tertiary,
                      fontWeight: typography.fontWeight.bold,
                      minWidth: 40,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={stats.testCount}
                    size="small"
                    sx={{
                      backgroundColor: stats.testCount > 0 ? '#FFEDD5' : colors.neutral[100],
                      color: stats.testCount > 0 ? '#C2410C' : colors.text.tertiary,
                      fontWeight: typography.fontWeight.bold,
                      minWidth: 40,
                    }}
                  />
                </TableCell>
                {!isMobile && (
                  <>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.tertiary, fontSize: typography.fontSize.sm }}
                      >
                        {formatDateTime(design.dateCreated)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.tertiary, fontSize: typography.fontSize.sm }}
                      >
                        {formatDateTime(design.dateModified)}
                      </Typography>
                    </TableCell>
                  </>
                )}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: spacing[1], justifyContent: 'center' }}>
                    <Tooltip title="View Diagram">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDesign(design.id);
                        }}
                        sx={{
                          color: colors.primary[500],
                          '&:hover': { backgroundColor: colors.primary[50] },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Design">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete confirmation
                          console.log('Delete design:', design.id);
                        }}
                        sx={{
                          color: colors.error,
                          '&:hover': { backgroundColor: '#FEE2E2' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DesignsTable;

