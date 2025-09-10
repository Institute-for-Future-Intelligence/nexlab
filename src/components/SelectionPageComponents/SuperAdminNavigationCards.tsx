import React from 'react';
import { Grid, Divider, Typography, IconButton, Box, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import NavigationCard from './NavigationCard';

const SuperAdminNavigationCards: React.FC = () => {
  const navigate = useNavigate();
  const { navigationSections, toggleSuperAdminSection } = useUIStore();
  const isExpanded = navigationSections.superAdminExpanded;

  return (
    <>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            py: 1.5,
            px: 2,
            mx: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            },
            borderRadius: 2,
            transition: 'background-color 0.2s'
          }}
          onClick={toggleSuperAdminSection}
        >
          <Typography 
            className="general-menu-title" 
            variant="h6" 
            component="h2"
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            Super-Admin Access
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              ml: 2,
              p: 0.5,
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText'
              }
            }}
            aria-label={isExpanded ? 'collapse super-admin section' : 'expand super-admin section'}
          >
            {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Box>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, px: 1 }}>
            <NavigationCard
              title="User Management"
              onClick={() => navigate('/user-management')}
            />
            <Box sx={{ mt: 1 }}>
              <NavigationCard
                title="Course Management"
                onClick={() => navigate('/super-admin-course-management')}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <NavigationCard
                title="Educator Requests"
                onClick={() => navigate('/educator-requests')}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <NavigationCard
                title="Course Requests"
                onClick={() => navigate('/course-requests')}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <NavigationCard
                title="Chatbot Requests"
                onClick={() => navigate('/super-admin-chatbot-requests')}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <NavigationCard
                title="Chatbot Conversations"
                onClick={() => navigate('/chatbot-conversations')}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <NavigationCard
                title="Quiz Management"
                onClick={() => navigate('/quiz-management')}
              />
            </Box>
          </Box>
        </Collapse>
      </Grid>
    </>
  );
};

export default SuperAdminNavigationCards; 