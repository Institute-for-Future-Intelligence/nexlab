// src/components/common/CourseSelector.tsx
import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

export interface CourseOption {
  id: string;
  number: string;
  title: string;
  isCourseAdmin?: boolean;
}

interface CourseSelectorProps {
  // Core props
  value: string;
  onChange: (value: string) => void;
  courses: CourseOption[];
  
  // UI customization
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  
  // Display options
  showNumber?: boolean;
  showTitle?: boolean;
  showAdminBadge?: boolean;
  maxTitleLength?: number;
  
  // Styling
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  
  // Additional props
  'aria-label'?: string;
  'data-testid'?: string;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  value,
  onChange,
  courses,
  label = 'Course',
  placeholder,
  helperText,
  error = false,
  disabled = false,
  loading = false,
  required = false,
  showNumber = true,
  showTitle = true,
  showAdminBadge = true,
  maxTitleLength = 50,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}) => {
  const handleChange = (event: any) => {
    onChange(event.target.value);
  };

  const formatCourseDisplay = (course: CourseOption): string => {
    if (!showNumber && !showTitle) return '';
    
    const truncatedTitle = showTitle && course.title.length > maxTitleLength 
      ? `${course.title.substring(0, maxTitleLength)}...` 
      : course.title;
    
    if (showNumber && showTitle) {
      return `${course.number} - ${truncatedTitle}`;
    } else if (showNumber) {
      return course.number;
    } else {
      return truncatedTitle;
    }
  };

  const getSelectedCourse = (): CourseOption | undefined => {
    return courses.find(course => course.id === value);
  };

  const selectedCourse = getSelectedCourse();

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
          fontFamily: typography.fontFamily.secondary,
          fontSize: typography.fontSize.sm,
          color: error ? colors.error : colors.text.secondary,
          marginTop: spacing[1],
          marginBottom: 0,
        },
      }}
    >
      <InputLabel 
        id={`course-selector-label-${Math.random().toString(36).substr(2, 9)}`}
        aria-label={ariaLabel}
      >
        {label}
      </InputLabel>
      
      <Select
        labelId={`course-selector-label-${Math.random().toString(36).substr(2, 9)}`}
        value={value}
        onChange={handleChange}
        label={label}
        displayEmpty={!value}
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
          
          const course = getSelectedCourse();
          if (!course) return '';
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              {/* Combined Course Number and Title in one box */}
              <Box
                sx={{
                  backgroundColor: colors.primary[50],
                  border: `1px solid ${colors.primary[200]}`,
                  borderRadius: borderRadius.lg,
                  padding: `${spacing[2]} ${spacing[3]}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  width: 'fit-content',
                  maxWidth: '100%',
                }}
              >
                {/* Course Number */}
                {showNumber && (
                  <Typography
                    sx={{
                      fontFamily: typography.fontFamily.secondary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.primary[700],
                      flexShrink: 0,
                    }}
                  >
                    {course.number}
                  </Typography>
                )}
                
                {/* Separator */}
                {showNumber && showTitle && (
                  <Typography
                    sx={{
                      fontFamily: typography.fontFamily.primary,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      flexShrink: 0,
                    }}
                  >
                    -
                  </Typography>
                )}
                
                {/* Course Title */}
                {showTitle && (
                  <Typography
                    sx={{
                      fontFamily: typography.fontFamily.secondary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.primary[700],
                      flexShrink: 0,
                    }}
                  >
                    {course.title.length > maxTitleLength 
                      ? `${course.title.substring(0, maxTitleLength)}...` 
                      : course.title}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        }}
        data-testid={dataTestId}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: borderRadius.lg,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.neutral[200]}`,
              backgroundColor: colors.surface.primary,
              maxHeight: '300px',
            },
          },
        }}
      >
        {loading ? (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2], width: '100%' }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontFamily: typography.fontFamily.primary }}>
                Loading courses...
              </Typography>
            </Box>
          </MenuItem>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <MenuItem 
              key={course.id} 
              value={course.id}
              sx={{
                padding: `${spacing[2]} ${spacing[3]}`,
                '&:hover': {
                  backgroundColor: colors.primary[50],
                },
                '&.Mui-selected': {
                  backgroundColor: colors.primary[100],
                  '&:hover': {
                    backgroundColor: colors.primary[200],
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2], width: '100%' }}>
                {/* Combined Course Number and Title in one box */}
                <Box
                  sx={{
                    backgroundColor: colors.primary[100],
                    border: `1px solid ${colors.primary[300]}`,
                    borderRadius: borderRadius.lg,
                    padding: `${spacing[2]} ${spacing[3]}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    width: 'fit-content',
                    maxWidth: '100%',
                  }}
                >
                  {/* Course Number */}
                  {showNumber && (
                    <Typography
                      sx={{
                        fontFamily: typography.fontFamily.secondary,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.primary[700],
                        flexShrink: 0,
                      }}
                    >
                      {course.number}
                    </Typography>
                  )}
                  
                  {/* Separator */}
                  {showNumber && showTitle && (
                    <Typography
                      sx={{
                        fontFamily: typography.fontFamily.primary,
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        flexShrink: 0,
                      }}
                    >
                      -
                    </Typography>
                  )}
                  
                  {/* Course Title */}
                  {showTitle && (
                    <Typography
                      sx={{
                        fontFamily: typography.fontFamily.secondary,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.primary[700],
                        flexShrink: 0,
                      }}
                    >
                      {course.title}
                    </Typography>
                  )}
                </Box>
                
                {/* Admin Badge - only show if showAdminBadge is true */}
                {showAdminBadge && course.isCourseAdmin && (
                  <Box
                    sx={{
                      backgroundColor: colors.secondary[100],
                      border: `1px solid ${colors.secondary[300]}`,
                      borderRadius: borderRadius.sm,
                      padding: `${spacing[0.5]} ${spacing[1]}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: typography.fontFamily.secondary,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.secondary[700],
                        textTransform: 'uppercase',
                      }}
                    >
                      Admin
                    </Typography>
                  </Box>
                )}
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography 
              sx={{ 
                fontFamily: typography.fontFamily.primary,
                color: colors.text.secondary,
                fontStyle: 'italic',
              }}
            >
              No courses available
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

export default CourseSelector;
