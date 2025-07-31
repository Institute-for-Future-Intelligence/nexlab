// src/components/SelectionPage.tsx
import React, { useState } from 'react';
import { Box, Grid, Snackbar, Alert, SnackbarCloseReason } from '@mui/material';

import { useUser } from '../hooks/useUser';
import { useMessages } from '../hooks/useMessages';
import { NavigationMenu, MessagesSection } from './SelectionPage/';

const SelectionPage: React.FC = () => {
  const { userDetails, isSuperAdmin } = useUser();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { messages, loading, error, deleteMessage, togglePinMessage } = useMessages();

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Grid container spacing={3}>
        {/* Left side navigation menu */}
        <Grid item xs={12} md={3}>
          <NavigationMenu 
            userDetails={userDetails} 
            isSuperAdmin={isSuperAdmin} 
          />
        </Grid>

        {/* Main content area - Messages */}
        <Grid item xs={12} md={9}>
          <MessagesSection
            messages={messages}
            loading={loading}
            userDetails={userDetails}
            handleDeleteMessage={handleDeleteMessage}
            togglePinMessage={togglePinMessage}
          />
        </Grid>
      </Grid>
      
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          User ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SelectionPage;