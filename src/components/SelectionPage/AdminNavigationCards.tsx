import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavigationCard from './NavigationCard';

const AdminNavigationCards: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography className="general-menu-title" variant="h6" align="center" component="h2">
          Educator
        </Typography>
        <NavigationCard
          title="Course Management"
          onClick={() => navigate('/course-management')}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Chatbot Management"
          onClick={() => navigate('/chatbot-management')}
        />
      </Grid>
    </>
  );
};

export default AdminNavigationCards; 