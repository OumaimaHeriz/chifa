import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import './i18n'; // Initialize i18n
import './index.css';
import { CardProvider } from './contexts/CardContext';
import { useLicenseCheck } from './hooks/useLicenseCheck';
import { ShieldAlert } from 'lucide-react';

// Root redirect logic
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Administrateur') return <Navigate to="/admin" replace />;
  return <Navigate to="/reception" replace />;
};

function App() {
  const { isLicensed, isChecking } = useLicenseCheck();

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p>Vérification de la licence... / Checking license...</p>
      </div>
    );
  }

  if (!isLicensed) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-error)' }}>
        <div className="card text-center flex flex-col items-center gap-4" style={{ maxWidth: '400px', backgroundColor: 'var(--color-surface)' }}>
          <ShieldAlert size={48} color="var(--color-error)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Accès Bloqué</h1>
          <p>Votre licence a expiré ou a été révoquée. Veuillez contacter l'administrateur.</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Your license has expired or was revoked.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <CardProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/admin/*" 
              element={
                <PrivateRoute allowedRoles={['Administrateur']}>
                  <AdminDashboard />
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
