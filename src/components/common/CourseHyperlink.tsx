// src/components/common/CourseHyperlink.tsx
import React from 'react';
import { Box, Link, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

interface CourseHyperlinkProps {
  courseId: string;
  courseNumber: string;
  courseTitle: string;
  variant?: 'link' | 'chip' | 'text';
  isAdmin?: boolean;
  showNumber?: boolean;
  showTitle?: boolean;
  maxTitleLength?: number;
  onClick?: () => void; // Optional custom click handler
}

const CourseHyperlink: React.FC<CourseHyperlinkProps> = ({
  courseId,
  courseNumber,
  courseTitle,
  variant = 'link',
  isAdmin = false,
  showNumber = true,
  showTitle = true,
  maxTitleLength = 50,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else {
      // Default navigation to supplemental materials page
      const isProduction = window.location.hostname === 'nexlab.bio';
      const baseUrl = isProduction 
        ? 'https://nexlab.bio'
        : '';
      
      const url = `${baseUrl}/supplemental-materials?course=${courseId}`;
      
      if (isProduction) {
        window.open(url, '_blank');
      } else {
        navigate(`/supplemental-materials?course=${courseId}`);
      }
    }
  };

  const truncatedTitle = courseTitle.length > maxTitleLength 
    ? `${courseTitle.substring(0, maxTitleLength)}...` 
    : courseTitle;

  const getChipColors = () => {
    return isAdmin 
      ? {
          backgroundColor: colors.primary[100],
          color: colors.primary[700],
          '&:hover': {
            backgroundColor: colors.primary[200],
          },
        }
      : {
          backgroundColor: colors.neutral[200],
          color: colors.neutral[700],
          '&:hover': {
            backgroundColor: colors.neutral[300],
          },
        };
  };

  if (variant === 'chip') {
    const chipLabel = showNumber && showTitle 
      ? `${courseNumber} - ${truncatedTitle}`
      : showNumber 
      ? courseNumber 
      : showTitle 
      ? truncatedTitle 
      : '';

    return (
      <Chip
        label={chipLabel}
        size="small"
        clickable
        onClick={handleClick}
        sx={{
          ...getChipColors(),
          fontFamily: typography.fontFamily.secondary,
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.fontSize.sm,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
        }}
        title={`${courseNumber} - ${courseTitle}`}
      />
    );
  }

  if (variant === 'text') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
        {showNumber && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              fontSize: typography.fontSize.sm,
            }}
          >
            {courseNumber}
          </Typography>
        )}
        {showTitle && (
          <Link
            component="button"
            variant="body2"
            onClick={handleClick}
            sx={{
              color: colors.primary[600],
              textDecoration: 'none',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              textAlign: 'left',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
                color: colors.primary[700],
              },
            }}
            title={courseTitle}
          >
            {truncatedTitle}
          </Link>
        )}
      </Box>
    );
  }

  // Default 'link' variant - modern chip design with rounded corners
  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        border: `1px solid ${colors.primary[200]}`,
        borderRadius: borderRadius.lg,
        padding: `${spacing[2]} ${spacing[3]}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        maxWidth: '100%',
        '&:hover': {
          backgroundColor: colors.primary[100],
          borderColor: colors.primary[300],
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }}
      title={`${courseNumber} - ${courseTitle}`}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: typography.fontFamily.secondary,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.primary[700],
          textDecoration: 'none',
          userSelect: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {showNumber && showTitle ? `${courseNumber} - ${truncatedTitle}` : 
         showNumber ? courseNumber : 
         showTitle ? truncatedTitle : ''}
      </Typography>
    </Box>
  );
};

export default CourseHyperlink;
