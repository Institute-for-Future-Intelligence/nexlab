import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <Paper sx={{ padding: 4, borderRadius: 2, maxWidth: 500, width: '100%' }} elevation={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Update Profile (Placeholder)
        </Typography>
        <Typography sx={{ mb: 3 }}>
          This is a placeholder page for updating your profile.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Paper>
    </Box>
  );
};

export default UpdateProfile;
