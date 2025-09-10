import React from 'react';
import { Grid, Divider, Typography, IconButton, Box, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import NavigationCard from './NavigationCard';

const AdminNavigationCards: React.FC = () => {
  const navigate = useNavigate();
  const { navigationSections, toggleEducatorSection } = useUIStore();
  const isExpanded = navigationSections.educatorExpanded;

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
          onClick={toggleEducatorSection}
        >
          <Typography 
            className="general-menu-title" 
            variant="h6" 
            component="h2"
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            Educator Access
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
            aria-label={isExpanded ? 'collapse educator section' : 'expand educator section'}
          >
            {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Box>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, px: 1 }}>
            <NavigationCard
              title="Course Management"
              onClick={() => navigate('/course-management')}
            />
      <Box sx={{ mt: 1 }}>
        <NavigationCard
          title="Chatbot Management"
          onClick={() => navigate('/chatbot-management')}
        />
      </Box>
          </Box>
        </Collapse>
      </Grid>
    </>
  );
};

export default AdminNavigationCards; 