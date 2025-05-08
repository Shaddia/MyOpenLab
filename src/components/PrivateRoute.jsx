// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // Si no hay usuario o si el usuario es anónimo, redirige a login
  if (!user || user.isAnonymous) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
