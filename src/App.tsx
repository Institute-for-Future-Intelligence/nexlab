// App.tsx
import { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';

import { useUser } from './hooks/useUser';
import { createRoutes } from './config/routing';
import { appTheme } from './config/theme';

// Import layout components
import AppLayout from './components/Layout/AppLayout';

const AppRoutes = () => {
  const { userDetails, isSuperAdmin } = useUser();
  const routes = createRoutes(userDetails, isSuperAdmin);
  const routeElement = useRoutes(routes);
  
  // Wrap authenticated routes with AppLayout
  const isAuthenticated = Boolean(userDetails?.uid);
  
  if (isAuthenticated) {
    return <AppLayout>{routeElement}</AppLayout>;
  }
  
  return routeElement;
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

  // Using root path for custom domain (nexlab.bio)
  const basename = undefined;
  
  // Create stable boolean to prevent Header re-mounting on userDetails changes
  const isLoggedIn = Boolean(userDetails?.uid);



  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Router 
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </div>
        }>
          <AppRoutes />
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

export default App;