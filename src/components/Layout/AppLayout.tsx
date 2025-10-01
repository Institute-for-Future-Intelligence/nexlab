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
      minHeight: '100vh', // Minimum viewport height, can grow
      backgroundColor: colors.background.primary,
    }}>
      {/* Header - Fixed height */}
      <Box 
        component="header" 
        sx={{ 
          height: '12.5vh',
          minHeight: 90,
          maxHeight: 120,
          zIndex: 1000, // Lower z-index to prevent overlap
          flexShrink: 0,
          position: 'relative', // Ensure proper stacking context
        }}
      >
        <DashboardHeader />
      </Box>
      
      {/* Main Content Area - Flexible height, grows with content */}
      <Box 
        component="main" 
        sx={{ 
          flex: 1, // Takes remaining space and grows with content
          display: 'flex',
          minHeight: 0, // Allow shrinking below content size
        }}
      >
        <PersistentSidebar>
          {children}
        </PersistentSidebar>
      </Box>
      
      {/* Footer - Fixed height, pushed down by content */}
      <Box 
        component="footer"
        sx={{
          height: '10vh',
          minHeight: 70,
          maxHeight: 100,
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
