import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

const DashboardHeader: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start', // Align to left
        padding: spacing[4],
        backgroundColor: colors.primary[100], // Slightly darker primary background
        borderBottom: `1px solid ${colors.primary[200]}`,
        boxShadow: shadows.sm,
        height: '100%', // Use full height of parent container
        width: '100%',
        position: 'relative',
        zIndex: 1, // Ensure proper stacking within header
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[4], width: '100%' }}>
        <img 
          src={`${import.meta.env.BASE_URL}nexlab-logo.png`} 
          alt="NexLab Logo" 
          style={{ 
            height: 85,
            borderRadius: borderRadius.lg,
          }}
        />
        <Box className="divider" sx={{ 
          height: '85px', 
          borderLeft: `2px solid ${colors.primary[500]}`, 
          marginRight: spacing[5] 
        }} />
        <Typography 
          variant="h4" 
          component="p" 
          sx={{ 
            color: colors.primary[700], // Darker primary color for better contrast 
            fontFamily: typography.fontFamily.secondary,
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.normal,
            whiteSpace: 'nowrap', // Keep on one line
            flex: 1,
          }}
        >
          Next-Generation Experiments and Learning for Advanced Biotech
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
