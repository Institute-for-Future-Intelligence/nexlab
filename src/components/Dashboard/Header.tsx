// Header.tsx
import React, { memo } from 'react';
import { Typography, Button, Box, useMediaQuery, useTheme } from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';

interface HeaderProps {
  setIsAdding: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line react/prop-types
const Header: React.FC<HeaderProps> = memo(({ setIsAdding }) => {
  console.log("Header loaded");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      sx={{ 
        p: isMobile ? spacing[4] : spacing[6], // Responsive padding
        backgroundColor: colors.primary[50], // Light blue background
        borderRadius: borderRadius['2xl'], // 16px border radius
        mb: spacing[6], // 24px margin bottom
        border: `1px solid ${colors.primary[200]}`,
        boxShadow: shadows.sm,
      }}
    >

      {/* Page Title */}
      <Box sx={{ mb: spacing[6] }}>
        <Typography 
          variant="h2"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontSize: isMobile ? typography.fontSize['3xl'] : typography.fontSize['5xl'], // Responsive font size
            fontWeight: typography.fontWeight.bold,
            color: colors.primary[700],
            lineHeight: typography.lineHeight.tight,
            mb: spacing[2],
          }}
        >
          Laboratory Notebook
        </Typography>
        <Typography 
          variant="body1"
          sx={{
            fontFamily: typography.fontFamily.primary,
            fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
            color: colors.text.secondary,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          Manage your lab experiments, designs, and research projects
        </Typography>
      </Box>

      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button 
          variant="contained" 
          onClick={() => setIsAdding(true)}
          sx={{
            fontFamily: typography.fontFamily.display,
            fontSize: isMobile ? typography.fontSize.lg : typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            textTransform: 'none',
            px: isMobile ? spacing[4] : spacing[6], // Responsive horizontal padding
            py: spacing[3], // 12px vertical padding
            backgroundColor: colors.primary[500],
            borderRadius: borderRadius.xl,
            boxShadow: shadows.md,
            transition: animations.transitions.fast,
            '&:hover': {
              backgroundColor: colors.primary[600],
              boxShadow: shadows.lg,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
          }}
        >
          + Create New Design
        </Button>
      </Box>
    </Box>
  );
});

Header.displayName = 'Header';

export default Header;