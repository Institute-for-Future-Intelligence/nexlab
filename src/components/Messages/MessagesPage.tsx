import React, { useState, useEffect } from 'react';
import { Box, Grid, Snackbar, Alert, SnackbarCloseReason, Fab, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common';

import { useUser } from '../../hooks/useUser';
import { useMessages } from '../../hooks/useMessages';
import { MessagesSection } from '../SelectionPageComponents';

const MessagesPage: React.FC = () => {
  const { userDetails } = useUser();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { messages, loading, deleteMessage, togglePinMessage, initializeMessages } = useMessages(true); // Enable lazy loading

  // Initialize messages loading when component mounts
  useEffect(() => {
    initializeMessages();
  }, [initializeMessages]);

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
  };

  const handleAddMessage = () => {
    navigate('/add-message');
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <PageHeader title="Messages" />

      <Grid container spacing={3}>
        {/* Main content area - Messages */}
        <Grid item xs={12}>
          <MessagesSection
            messages={messages}
            loading={loading}
            userDetails={userDetails}
            handleDeleteMessage={handleDeleteMessage}
            togglePinMessage={togglePinMessage}
          />
        </Grid>
      </Grid>

      {/* Floating Action Button for adding messages */}
      <Tooltip title="Add New Message" placement="left">
        <Fab
          color="primary"
          aria-label="add message"
          onClick={handleAddMessage}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          User ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessagesPage;
