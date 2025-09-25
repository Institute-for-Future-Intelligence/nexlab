// src/components/Supplemental/Header.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Header: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography className="supplemental-title">
          Course Materials
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;