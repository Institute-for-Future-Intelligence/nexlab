import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, typography, spacing } from '../../config/designSystem';

const DesktopVersion: React.FC = () => {
  return (
    <Box 
      sx={{ 
        backgroundColor: colors.neutral[50],
        borderTop: `1px solid ${colors.neutral[200]}`,
        padding: spacing[2],
        height: '2.5vh', // 2.5% of viewport height
        minHeight: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          color: colors.text.tertiary,
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        NexLAB Desktop Version 1.0
      </Typography>
    </Box>
  );
};

export default DesktopVersion;
