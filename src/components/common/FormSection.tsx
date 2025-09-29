// src/components/common/FormSection.tsx
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { colors, typography, spacing } from '../../config/designSystem';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  showDivider?: boolean;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  showDivider = false,
  className = ''
}) => {
  return (
    <>
      {showDivider && (
        <Divider 
          sx={{ 
            my: spacing[4],
            borderColor: colors.neutral[200]
          }} 
        />
      )}
      
      <Box className={`form-section ${className}`} sx={{ mb: spacing[4] }}>
        {title && (
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              mb: spacing[2],
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              fontSize: typography.fontSize.xl,
            }}
          >
            {title}
          </Typography>
        )}
        
        {description && (
          <Typography 
            variant="body1" 
            sx={{ 
              mb: spacing[3],
              color: colors.text.secondary,
              lineHeight: typography.lineHeight.relaxed,
              fontFamily: typography.fontFamily.primary,
            }}
          >
            {description}
          </Typography>
        )}
        
        {children}
      </Box>
    </>
  );
};

export default FormSection;
