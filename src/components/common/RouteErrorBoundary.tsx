import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorBoundary from './ErrorBoundary';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  showDetails?: boolean;
}

const RouteErrorFallback: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        m: 4, 
        textAlign: 'center',
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
        maxWidth: 600,
        mx: 'auto',
        mt: 8
      }}
    >
      <ErrorOutlineIcon 
        color="error" 
        sx={{ fontSize: 64, mb: 2 }} 
      />
      
      <Typography variant="h4" gutterBottom color="error">
        Page Error
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        This page encountered an error and cannot be displayed. 
        You can try going back to the previous page or return to the home page.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Box>
    </Paper>
  );
};

const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children, showDetails }) => {
  return (
    <ErrorBoundary 
      fallbackComponent={<RouteErrorFallback />}
      showDetails={showDetails}
      onError={(error, errorInfo) => {
        // Log route-level errors with additional context
        console.error('Route Error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RouteErrorBoundary; 