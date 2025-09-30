// src/components/common/MaterialSelector.tsx
import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  FormLabel,
  FormHelperText,
} from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

export interface Material {
  id: string;
  title: string;
  course?: string;
}

interface MaterialSelectorProps {
  value: string;
  onChange: (value: string) => void;
  materials: Material[];
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  sx?: any;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  value,
  onChange,
  materials,
  label = 'Material',
  placeholder,
  helperText,
  error = false,
  disabled = false,
  loading = false,
  required = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  sx,
}) => {
  const getSelectedMaterial = () => {
    return materials.find(material => material.id === value);
  };

  const selectedMaterial = getSelectedMaterial();

  return (
    <FormControl 
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      required={required}
      variant={variant}
      size={size}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: borderRadius.lg,
          backgroundColor: colors.surface.primary,
          border: `2px solid ${colors.neutral[300]}`,
          minHeight: size === 'small' ? '48px' : '56px',
          
          '&:hover': {
            backgroundColor: colors.surface.primary,
            borderColor: colors.neutral[300],
          },
          
          '&.Mui-focused': {
            backgroundColor: colors.surface.primary,
            borderColor: colors.primary[500],
            borderWidth: '2px',
          },
          
          '&.Mui-error': {
            borderColor: colors.error,
          },
          
          '& .MuiSelect-select': {
            padding: size === 'small' ? '12px 14px' : '16px 14px',
            boxSizing: 'border-box',
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSize.base,
            color: colors.text.primary,
          },
        },
        
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none', // Remove the default outline
        },
        
        '& .MuiInputLabel-root': {
          fontFamily: typography.fontFamily.secondary,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary,
          transform: 'none',
          position: 'static',
          marginBottom: spacing[1],
          
          '&.Mui-focused': {
            color: colors.primary[600],
          },
          
          '&.Mui-error': {
            color: colors.error,
          },
        },
        
        '& .MuiFormHelperText-root': {
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.sm,
          marginTop: spacing[1],
          minHeight: '20px',
          lineHeight: '1.2',
        },
        
        ...sx,
      }}
    >
      <FormLabel 
        required={required}
        sx={{
          mb: 1,
          fontFamily: typography.fontFamily.secondary,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary,
        }}
      >
        {label}
      </FormLabel>
      
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography
                sx={{
                  color: colors.text.secondary,
                  fontFamily: typography.fontFamily.primary,
                  fontSize: typography.fontSize.base,
                }}
              >
                {placeholder || `Select ${label.toLowerCase()}`}
              </Typography>
            );
          }

          const material = getSelectedMaterial();
          if (!material) return '';

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              {/* Material Title in styled box */}
              <Box
                sx={{
                  backgroundColor: '#D1FAE5', // colors.success.light
                  border: `1px solid #22C55E`, // colors.success.main
                  borderRadius: borderRadius.lg,
                  padding: `${spacing[2]} ${spacing[3]}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  width: 'fit-content',
                  maxWidth: '100%',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: typography.fontFamily.secondary,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: '#059669', // colors.success.dark
                    flexShrink: 0,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {material.title}
                </Typography>
              </Box>
            </Box>
          );
        }}
      >
        {loading ? (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontFamily: typography.fontFamily.primary }}>
                Loading materials...
              </Typography>
            </Box>
          </MenuItem>
        ) : materials.length > 0 ? (
          materials.map((material) => (
            <MenuItem
              key={material.id}
              value={material.id}
              sx={{
                padding: spacing[2],
                '&:hover': {
                  backgroundColor: '#ECFDF5', // Very light green hover
                },
                '&.Mui-selected': {
                  backgroundColor: '#D1FAE5', // colors.success.light
                  '&:hover': {
                    backgroundColor: '#A7F3D0', // Slightly darker green
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2], width: '100%' }}>
                {/* Material Title in styled box */}
                <Box
                  sx={{
                    backgroundColor: '#A7F3D0', // Medium green for dropdown items
                    border: `1px solid #22C55E`, // colors.success.main
                    borderRadius: borderRadius.lg,
                    padding: `${spacing[2]} ${spacing[3]}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    width: 'fit-content',
                    maxWidth: '100%',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: typography.fontFamily.secondary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: '#059669', // colors.success.dark
                      flexShrink: 0,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {material.title}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography sx={{ fontFamily: typography.fontFamily.primary, color: colors.text.secondary }}>
              No materials available
            </Typography>
          </MenuItem>
        )}
      </Select>
      
      {helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default MaterialSelector;
