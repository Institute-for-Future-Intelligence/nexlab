// App.tsx
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';

import { useUser } from './hooks/useUser';
import { createRoutes } from './config/routing';
import { appTheme } from './config/theme';

// Import layout and global components
import DeviceVersion from './components/DeviceVersion';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatbotManager from './components/ChatbotIntegration/ChatbotManager';
import GlobalNotifications from './components/common/GlobalNotifications';

const AppRoutes = () => {
  const { userDetails, isSuperAdmin } = useUser();
  const routes = createRoutes(userDetails, isSuperAdmin);
  return useRoutes(routes);
};

const App = () => {
  const { userDetails, loading } = useUser();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  // Set basename conditionally: /nexlab/ for production, undefined for development
  const basename = import.meta.env.PROD ? '/nexlab' : undefined;
  
  // Create stable boolean to prevent Header re-mounting on userDetails changes
  const isLoggedIn = Boolean(userDetails?.uid);



  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Router basename={basename}>
        {/* Conditionally render the Header based on stable login state */}
        {isLoggedIn && <Header />}
        <div className="content">
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
            </div>
          }>
            <AppRoutes />
          </Suspense>
        </div>
        <Footer />
        <DeviceVersion />
        {/* Chatbot Manager */}
        {isLoggedIn && <ChatbotManager />}
        {/* Global Notifications */}
        <GlobalNotifications />
      </Router>
    </ThemeProvider>
  );
};

export default App;