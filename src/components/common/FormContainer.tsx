// src/components/common/FormContainer.tsx
import React from 'react';
import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import { colors, spacing, borderRadius, shadows } from '../../config/designSystem';
import PageHeader from './PageHeader';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string | number;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  title,
  subtitle,
  children,
  maxWidth = '1200px',
  className = ''
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      className={`form-page-container ${className}`}
      sx={{ 
        p: isMobile ? spacing[3] : spacing[4], 
        maxWidth, 
        mx: 'auto',
        minHeight: '100vh',
        backgroundColor: colors.primary[50], // Light purple background to match app
      }}
    >
      {/* Page Header */}
      <PageHeader title={title} subtitle={subtitle} />
      
      {/* Form Container */}
      <Paper
        className="form-container"
        elevation={0}
        sx={{
          backgroundColor: colors.surface.primary,
          borderRadius: borderRadius['2xl'], // 16px
          p: isMobile ? spacing[4] : spacing[6], // Responsive padding
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.lg,
          position: 'relative',
          overflow: 'hidden',
          
          // Subtle top accent border
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: colors.primary[500],
            borderRadius: `${borderRadius['2xl']} ${borderRadius['2xl']} 0 0`,
          }
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default FormContainer;
