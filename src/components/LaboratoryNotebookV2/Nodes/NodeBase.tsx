// src/components/LaboratoryNotebookV2/Nodes/NodeBase.tsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, IconButton, Chip, useTheme, useMediaQuery } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../../config/designSystem';

export interface NodeBaseProps {
  id: string;
  title: string;
  description: string;
  dateCreated: Date;
  imageCount: number;
  fileCount: number;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  nodeColor: {
    bg: string;
    border: string;
    text: string;
    hover: string;
  };
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  badge?: {
    label: string;
    color: string;
  };
  isSelected?: boolean;
  isHovered?: boolean;
}

const NodeBase: React.FC<NodeBaseProps> = memo(({
  title,
  description,
  dateCreated,
  imageCount,
  fileCount,
  onView,
  onEdit,
  onDelete,
  nodeColor,
  showSourceHandle = true,
  showTargetHandle = true,
  badge,
  isSelected = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formattedDate = dateCreated.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Box
      sx={{
        minWidth: isMobile ? 220 : 280,
        maxWidth: isMobile ? 220 : 280,
        backgroundColor: isSelected ? nodeColor.hover : nodeColor.bg,
        border: `2px solid ${isSelected ? nodeColor.border : colors.neutral[300]}`,
        borderRadius: borderRadius.xl,
        padding: spacing[4],
        boxShadow: isSelected ? shadows.lg : shadows.md,
        transition: animations.transitions.fast,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: nodeColor.hover,
          boxShadow: shadows.lg,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Target Handle (incoming connections) */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: nodeColor.border,
            width: 12,
            height: 12,
            border: `2px solid ${colors.background.primary}`,
          }}
        />
      )}

      {/* Header with badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[2] }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: nodeColor.text,
            lineHeight: typography.lineHeight.tight,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </Typography>
        {badge && (
          <Chip
            label={badge.label}
            size="small"
            sx={{
              ml: spacing[2],
              backgroundColor: badge.color,
              color: colors.text.inverse,
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.xs,
              height: 20,
            }}
          />
        )}
      </Box>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: colors.text.secondary,
          fontSize: typography.fontSize.sm,
          mb: spacing[3],
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: typography.lineHeight.snug,
        }}
      >
        {description || 'No description provided'}
      </Typography>

      {/* Metadata */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[3], mb: spacing[3] }}>
        <Typography
          variant="caption"
          sx={{
            color: colors.text.tertiary,
            fontSize: typography.fontSize.xs,
          }}
        >
          {formattedDate}
        </Typography>
        
        {imageCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            <ImageIcon sx={{ fontSize: 14, color: colors.text.tertiary }} />
            <Typography
              variant="caption"
              sx={{ color: colors.text.tertiary, fontSize: typography.fontSize.xs }}
            >
              {imageCount}
            </Typography>
          </Box>
        )}
        
        {fileCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            <FileIcon sx={{ fontSize: 14, color: colors.text.tertiary }} />
            <Typography
              variant="caption"
              sx={{ color: colors.text.tertiary, fontSize: typography.fontSize.xs }}
            >
              {fileCount}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: spacing[1], justifyContent: 'flex-end' }}>
        {onView && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            sx={{
              color: nodeColor.border,
              '&:hover': { backgroundColor: nodeColor.hover },
            }}
          >
            <ViewIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        
        {onEdit && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{
              color: colors.primary[500],
              '&:hover': { backgroundColor: colors.primary[50] },
            }}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        
        {onDelete && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              color: colors.error,
              '&:hover': { backgroundColor: '#FEE2E2' },
            }}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Source Handle (outgoing connections) */}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: nodeColor.border,
            width: 12,
            height: 12,
            border: `2px solid ${colors.background.primary}`,
          }}
        />
      )}
    </Box>
  );
});

NodeBase.displayName = 'NodeBase';

export default NodeBase;

