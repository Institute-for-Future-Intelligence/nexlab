import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavigationCard from './NavigationCard';

const SuperAdminNavigationCards: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography className="general-menu-title" variant="h6" align="center" component="h2">
          Super-Admin
        </Typography>
        <NavigationCard
          title="User Management"
          onClick={() => navigate('/user-management')}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Course Management"
          onClick={() => navigate('/super-admin-course-management')}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Educator Requests"
          onClick={() => navigate('/educator-requests')}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Course Requests"
          onClick={() => navigate('/course-requests')}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Chatbot Requests"
          onClick={() => navigate('/super-admin-chatbot-requests')}
        />
      </Grid>

      <Grid item xs={12}>
        <NavigationCard
          title="Chatbot Conversations"
          onClick={() => navigate('/chatbot-conversations')}
        />
      </Grid>
    </>
  );
};

export default SuperAdminNavigationCards; 