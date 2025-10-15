// src/components/common/MaterialHyperlink.tsx
import React from 'react';
import { Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors, typography } from '../../config/designSystem';

interface MaterialHyperlinkProps {
  materialId: string;
  materialTitle: string;
  maxTitleLength?: number;
  variant?: 'link' | 'text';
  onClick?: () => void; // Optional custom click handler
}

const MaterialHyperlink: React.FC<MaterialHyperlinkProps> = ({
  materialId,
  materialTitle,
  maxTitleLength = 50,
  variant = 'link',
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else {
      // Default navigation to material view page
      const isProduction = window.location.hostname === 'nexlab.bio';
      const baseUrl = isProduction 
        ? 'https://nexlab.bio'
        : '';
      
      const url = `${baseUrl}/view-material/${materialId}?material=${materialId}`;
      
      if (isProduction) {
        window.open(url, '_blank');
      } else {
        navigate(`/view-material/${materialId}?material=${materialId}`);
      }
    }
  };

  const displayTitle = materialTitle.length > maxTitleLength 
    ? `${materialTitle.substring(0, maxTitleLength)}...` 
    : materialTitle;

  if (variant === 'text') {
    return (
      <Typography
        variant="body2"
        sx={{
          color: colors.text.primary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
        }}
        title={materialTitle}
      >
        {displayTitle}
      </Typography>
    );
  }

  // Default 'link' variant - matches CourseHyperlink styling
  return (
    <Typography
      variant="body1"
      onClick={handleClick}
      sx={{
        fontFamily: typography.fontFamily.secondary,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        cursor: 'pointer',
        textDecoration: 'none',
        '&:hover': {
          color: colors.primary[600],
          textDecoration: 'underline',
        },
      }}
      title={materialTitle}
    >
      {displayTitle}
    </Typography>
  );
};

export default MaterialHyperlink;
