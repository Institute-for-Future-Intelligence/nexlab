// src/components/common/FormField.tsx
import React from 'react';
import { 
  TextField, 
  TextFieldProps, 
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  SelectProps,
  OutlinedInput,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

// Enhanced TextField with consistent styling
interface FormFieldProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
}

export const FormField: React.FC<FormFieldProps> = ({ 
  sx, 
  variant = 'outlined',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TextField
      variant="outlined" // Switch back to outlined for better control
      fullWidth
      margin="normal"
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: borderRadius.lg,
          backgroundColor: colors.surface.primary,
          border: `2px solid ${colors.neutral[300]}`,
          minHeight: '56px',
          
          '&:hover': {
            backgroundColor: colors.surface.primary,
            borderColor: colors.neutral[300], // Keep same border color on hover
          },
          
          '&.Mui-focused': {
            backgroundColor: colors.surface.primary,
            borderColor: colors.neutral[300], // Keep same border color on focus
          },
          
          '&.Mui-error': {
            borderColor: colors.error,
          },
          
          '& .MuiOutlinedInput-input': {
            padding: '16px 14px',
            boxSizing: 'border-box',
          },
        },
        
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none', // Remove the default outline
        },
        
        '& .MuiInputLabel-root': {
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary,
          transition: 'color 0.2s ease-in-out',
          transform: 'none !important', // Force no transform
          position: 'static !important', // Prevent floating label animations
          marginBottom: '8px', // Add space below label
          
          '&.Mui-focused': {
            color: colors.primary[600],
            transform: 'none !important', // Force no transform on focus
          },
          
          '&.MuiInputLabel-shrink': {
            transform: 'none !important', // Force no shrink animation
          },
          
          '&.Mui-error': {
            color: colors.error,
          },
        },
        
        '& .MuiFormHelperText-root': {
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.sm,
          marginTop: spacing[1],
          minHeight: '20px', // Reserve space to prevent layout shift
          lineHeight: '1.2',
        },
        
        // Responsive font size
        '& .MuiInputBase-input': {
          fontSize: isMobile ? typography.fontSize.base : typography.fontSize.base,
          fontFamily: typography.fontFamily.primary,
        },
        
        ...sx,
      }}
    />
  );
};

// Enhanced Select with consistent styling
interface FormSelectProps extends Omit<SelectProps, 'variant'> {
  label: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  helperText,
  error = false,
  required = false,
  variant = 'outlined',
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FormControl 
      fullWidth 
      margin="normal" 
      error={error}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: borderRadius.lg,
          backgroundColor: colors.surface.primary,
          border: `2px solid ${colors.neutral[300]}`,
          minHeight: '56px',
          
          '&:hover': {
            backgroundColor: colors.surface.primary,
            borderColor: colors.neutral[300], // Keep same border color on hover
          },
          
          '&.Mui-focused': {
            backgroundColor: colors.surface.primary,
            borderColor: colors.neutral[300], // Keep same border color on focus
          },
          
          '&.Mui-error': {
            borderColor: colors.error,
          },
          
          '& .MuiSelect-select': {
            padding: '16px 14px',
            boxSizing: 'border-box',
          },
        },
        
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none', // Remove the default outline
        },
        
        '& .MuiInputLabel-root': {
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary,
          transition: 'color 0.2s ease-in-out',
          transform: 'none !important', // Force no transform
          position: 'static !important', // Prevent floating label animations
          marginBottom: '8px', // Add space below label
          
          '&.Mui-focused': {
            color: colors.primary[600],
            transform: 'none !important', // Force no transform on focus
          },
          
          '&.MuiInputLabel-shrink': {
            transform: 'none !important', // Force no shrink animation
          },
        },
        
        '& .MuiFormHelperText-root': {
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.sm,
          marginTop: spacing[1],
          minHeight: '20px', // Reserve space to prevent layout shift
          lineHeight: '1.2',
        },
        
        ...sx,
      }}
    >
      <FormLabel 
        required={required}
        sx={{
          mb: 1,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary,
          fontSize: isMobile ? typography.fontSize.sm : typography.fontSize.base,
        }}
      >
        {label}
      </FormLabel>
      
      <Select
        variant="outlined" // Switch back to outlined for better control
        {...props}
      >
        {children}
      </Select>
      
      {helperText && (
        <Box 
          component="span" 
          sx={{ 
            fontSize: typography.fontSize.sm,
            color: error ? colors.error : colors.text.tertiary,
            mt: spacing[1],
            display: 'block',
            fontFamily: typography.fontFamily.primary,
            fontWeight: typography.fontWeight.normal,
          }}
        >
          {helperText}
        </Box>
      )}
    </FormControl>
  );
};

// Re-export for convenience
export default FormField;
