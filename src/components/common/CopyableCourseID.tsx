// src/components/common/CopyableCourseID.tsx
import React, { useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

interface CopyableCourseIDProps {
  courseId: string;
  maxLength?: number;
}

const CopyableCourseID: React.FC<CopyableCourseIDProps> = ({
  courseId,
  maxLength = 999,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click if inside a table
    try {
      await navigator.clipboard.writeText(courseId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayText = courseId.length > maxLength ? `${courseId.substring(0, maxLength)}...` : courseId;

  return (
    <Tooltip title={copied ? 'Copied!' : 'Click to Copy'}>
      <Box
        onClick={handleCopy}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: colors.neutral[100],
          color: colors.neutral[700],
          border: `1px solid ${colors.neutral[300]}`,
          borderRadius: borderRadius.full,
          padding: `${spacing[2]} ${spacing[3]}`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          fontFamily: 'monospace',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
          '&:hover': {
            backgroundColor: colors.neutral[200],
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: 'inherit',
            color: 'inherit',
            fontWeight: 'inherit',
            userSelect: 'none',
          }}
          title={courseId}
        >
          {displayText}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default CopyableCourseID;
