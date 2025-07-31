import React from 'react';
import { Box, Grid } from '@mui/material';
import { UserDetails } from '../../contexts/UserContext';
import UserNavigationCards from './UserNavigationCards';
import AdminNavigationCards from './AdminNavigationCards';
import SuperAdminNavigationCards from './SuperAdminNavigationCards';

interface NavigationMenuProps {
  userDetails: UserDetails | null;
  isSuperAdmin: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ userDetails, isSuperAdmin }) => {
  return (
    <Box className="menu-container">
      <Grid container spacing={2} justifyContent="center">
        <UserNavigationCards userDetails={userDetails} />
        
        {userDetails?.isAdmin && <AdminNavigationCards />}
        
        {isSuperAdmin && <SuperAdminNavigationCards />}
      </Grid>
    </Box>
  );
};

export default NavigationMenu; 