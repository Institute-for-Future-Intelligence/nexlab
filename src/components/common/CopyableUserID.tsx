// src/components/common/CopyableUserID.tsx
import React, { useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

interface CopyableUserIDProps {
  userId: string;
  userType?: 'superAdmin' | 'educator' | 'student';
  maxLength?: number;
}

const CopyableUserID: React.FC<CopyableUserIDProps> = ({
  userId,
  userType = 'student',
  maxLength = 999,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click if inside a table
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getUserTypeColors = () => {
    switch (userType) {
      case 'superAdmin':
        return {
          backgroundColor: colors.secondary[100],
          color: colors.secondary[700],
          borderColor: colors.secondary[300],
          hoverColor: colors.secondary[200],
        };
      case 'educator':
        return {
          backgroundColor: colors.primary[100],
          color: colors.primary[700],
          borderColor: colors.primary[300],
          hoverColor: colors.primary[200],
        };
      default:
        return {
          backgroundColor: colors.neutral[100],
          color: colors.neutral[700],
          borderColor: colors.neutral[300],
          hoverColor: colors.neutral[200],
        };
    }
  };

  const displayText = userId.length > maxLength ? `${userId.substring(0, maxLength)}...` : userId;
  const typeColors = getUserTypeColors();

  return (
    <Tooltip title={copied ? 'Copied!' : 'Click to Copy'}>
      <Box
        onClick={handleCopy}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: typeColors.backgroundColor,
          color: typeColors.color,
          border: `1px solid ${typeColors.borderColor}`,
          borderRadius: borderRadius.full,
          padding: `${spacing[2]} ${spacing[3]}`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          fontFamily: 'monospace',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
          '&:hover': {
            backgroundColor: typeColors.hoverColor,
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
          title={userId}
        >
          {displayText}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default CopyableUserID;
