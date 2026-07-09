import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user doesn't have the correct role, redirect them to their respective dashboard
    if (user.role === 'Administrateur') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/reception" replace />;
    }
  }

  return children;
}
