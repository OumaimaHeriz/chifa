import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import UserManagement from './pages/UserManagement';
import './i18n'; // Initialize i18n
import './index.css';
import { CardProvider } from './contexts/CardContext';
import Setup from './pages/Setup';

// Root redirect logic
const RootRedirect = () => {
  const role = localStorage.getItem('chifa_role');
  if (!role) return <Navigate to="/setup" replace />;

  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Administrateur') return <Navigate to="/admin" replace />;
  return <Navigate to="/reception" replace />;
};

function App() {

  return (
    <AuthProvider>
      <CardProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/admin/*" 
              element={
                <PrivateRoute allowedRoles={['Administrateur']}>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                  </Routes>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/reception/*" 
              element={
                <PrivateRoute allowedRoles={['Réception']}>
                  <ReceptionDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </CardProvider>
    </AuthProvider>
  );
}

export default App;
