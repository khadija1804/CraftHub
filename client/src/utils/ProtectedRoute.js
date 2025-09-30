import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const role = getUserRole();

  useEffect(() => {
    // Simuler un petit délai pour éviter les clignotements
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      setIsAuth(authStatus);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#8a5a44' }}>Chargement...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;