// src/components/common/PageHeader.tsx
import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      sx={{ 
        p: isMobile ? spacing[4] : spacing[6], // Responsive padding
        backgroundColor: colors.primary[100], // More visible light blue background
        borderRadius: borderRadius['2xl'], // 16px border radius
        mb: spacing[6], // 24px margin bottom
        border: `1px solid ${colors.primary[200]}`,
        boxShadow: shadows.sm,
      }}
    >
      {/* Page Title */}
      <Typography 
        variant="h2"
        sx={{
          fontFamily: typography.fontFamily.display,
          fontSize: isMobile ? typography.fontSize['3xl'] : typography.fontSize['5xl'], // Responsive font size
          fontWeight: typography.fontWeight.bold,
          color: colors.primary[700],
          lineHeight: typography.lineHeight.tight,
          mb: subtitle ? spacing[2] : 0, // Add margin bottom only if subtitle exists
        }}
      >
        {title}
      </Typography>
      
      {/* Optional Subtitle */}
      {subtitle && (
        <Typography 
          variant="body1"
          sx={{
            fontFamily: typography.fontFamily.primary,
            fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
            color: colors.text.secondary,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
