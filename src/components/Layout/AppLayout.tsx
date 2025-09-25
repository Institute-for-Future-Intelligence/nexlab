import React from 'react';
import { Box } from '@mui/material';
import PersistentSidebar from './PersistentSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import ChatbotManager from '../ChatbotIntegration/ChatbotManager';
import QuizManager from '../QuizIntegration/QuizManager';
import GlobalNotifications from '../common/GlobalNotifications';
import { colors, shadows } from '../../config/designSystem';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', // Full viewport height
      backgroundColor: colors.background.primary,
      overflow: 'hidden', // Prevent scrollbars on main container
    }}>
      {/* Header - 12.5% of viewport height */}
      <Box 
        component="header" 
        sx={{ 
          height: '12.5vh',
          minHeight: 90,
          zIndex: 1100,
          flexShrink: 0,
        }}
      >
        <DashboardHeader />
      </Box>
      
      {/* Main Content Area - 77.5% of viewport height */}
      <Box 
        component="main" 
        sx={{ 
          height: '77.5vh',
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <PersistentSidebar>
          {children}
        </PersistentSidebar>
      </Box>
      
      {/* Footer - 10% of viewport height */}
      <Box 
        component="footer"
        sx={{
          height: '10vh',
          minHeight: 70,
          flexShrink: 0,
        }}
      >
        <DashboardFooter />
      </Box>
      
      {/* Global Components */}
      <ChatbotManager />
      <QuizManager />
      <GlobalNotifications />
    </Box>
  );
};

export default AppLayout;
