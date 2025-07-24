// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface PrivateRouteProps {
  element: React.ComponentType;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component }) => {
  const { userDetails } = useUser();
  return userDetails ? <Component /> : <Navigate to="/" />;
};

export default PrivateRoute;