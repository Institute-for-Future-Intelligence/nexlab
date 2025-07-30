// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useUser } from '../hooks/useUser';

interface PrivateRouteProps {
  element: React.ComponentType;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component }) => {
  const { userDetails, loading } = useUser();
  
  // Show loading spinner while authentication state is being checked
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }
  
  // Only redirect to home after loading is complete and no user is found
  return userDetails ? <Component /> : <Navigate to="/" />;
};

export default PrivateRoute;