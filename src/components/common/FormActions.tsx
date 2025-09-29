// src/components/common/FormActions.tsx
import React from 'react';
import { Box, Button, ButtonProps, useMediaQuery, useTheme } from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

interface FormActionButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
}

export const FormActionButton: React.FC<FormActionButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  sx,
  disabled,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[500],
          color: colors.text.inverse,
          '&:hover': {
            backgroundColor: colors.primary[600],
            boxShadow: shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:disabled': {
            backgroundColor: colors.neutral[300],
            color: colors.text.disabled,
          },
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary[500],
          color: colors.text.inverse,
          '&:hover': {
            backgroundColor: colors.secondary[600],
            boxShadow: shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:disabled': {
            backgroundColor: colors.neutral[300],
            color: colors.text.disabled,
          },
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary[600],
          border: `2px solid ${colors.primary[500]}`,
          '&:hover': {
            backgroundColor: colors.primary[50],
            borderColor: colors.primary[600],
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:disabled': {
            borderColor: colors.neutral[300],
            color: colors.text.disabled,
          },
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: colors.text.secondary,
          '&:hover': {
            backgroundColor: colors.neutral[100],
            color: colors.text.primary,
          },
          '&:disabled': {
            color: colors.text.disabled,
          },
        };
      default:
        return {};
    }
  };

  return (
    <Button
      disabled={disabled || loading}
      {...props}
      sx={{
        borderRadius: borderRadius.xl,
        padding: isMobile 
          ? `${spacing[2]} ${spacing[4]}` 
          : `${spacing[3]} ${spacing[6]}`,
        fontFamily: typography.fontFamily.secondary,
        fontWeight: typography.fontWeight.semibold,
        fontSize: isMobile ? typography.fontSize.sm : typography.fontSize.base,
        textTransform: 'none',
        transition: 'all 0.2s ease-in-out',
        minHeight: '48px',
        position: 'relative',
        
        ...getVariantStyles(),
        
        // Loading state
        ...(loading && {
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '16px',
            height: '16px',
            border: `2px solid ${variant === 'primary' || variant === 'secondary' ? colors.text.inverse : colors.primary[500]}`,
            borderTop: `2px solid transparent`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          },
        }),
        
        ...sx,
      }}
    >
      {loading ? '' : children}
    </Button>
  );
};

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
  className?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'left',
  className = ''
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getAlignment = () => {
    switch (align) {
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      default:
        return 'flex-start';
    }
  };

  return (
    <Box
      className={`form-actions ${className}`}
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: spacing[3],
        justifyContent: getAlignment(),
        alignItems: isMobile ? 'stretch' : 'center',
        mt: spacing[5],
        pt: spacing[4],
        borderTop: `1px solid ${colors.neutral[200]}`,
        
        // Mobile adjustments
        ...(isMobile && {
          '& > *': {
            width: '100%',
          },
        }),
      }}
    >
      {children}
    </Box>
  );
};

export default FormActions;
