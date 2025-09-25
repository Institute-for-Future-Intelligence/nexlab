// Header.tsx
import React, { memo } from 'react';
import { Button, Box, useMediaQuery, useTheme } from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';
import { PageHeader } from '../common';

interface HeaderProps {
  setIsAdding: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line react/prop-types
const Header: React.FC<HeaderProps> = memo(({ setIsAdding }) => {
  console.log("Header loaded");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      <PageHeader 
        title="Laboratory Notebook"
        subtitle="Manage your lab experiments, designs, and research projects"
      />

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