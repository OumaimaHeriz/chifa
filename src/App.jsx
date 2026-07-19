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
import { useLicenseCheck } from './hooks/useLicenseCheck';
import { ShieldAlert } from 'lucide-react';
import Setup from './pages/Setup';

// Root redirect logic
const RootRedirect = () => {
  const storagePath = localStorage.getItem('chifa_storage_path');
  if (!storagePath) return <Navigate to="/setup" replace />;

  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Administrateur') return <Navigate to="/admin" replace />;
  return <Navigate to="/reception" replace />;
};

function App() {
  const { isLicensed, isChecking, machineId } = useLicenseCheck();

  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isLicensed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full" style={{ backgroundColor: '#fef2f2', padding: '1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '28rem', width: '100%', borderTop: '4px solid #ef4444', backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div className="flex items-center justify-center mx-auto" style={{ width: '4rem', height: '4rem', backgroundColor: '#fee2e2', borderRadius: '9999px', marginBottom: '1rem' }}>
            <span style={{ color: '#ef4444', fontSize: '1.875rem' }}>⚠️</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Période d'essai expirée</h1>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>(انتهت الفترة التجريبية)</h2>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            Votre licence pour utiliser cette application a expiré ou a été désactivée. Veuillez contacter l'administrateur pour renouveler votre abonnement.
            <br/><br/>
            لقد انتهت صلاحية استخدامك للبرنامج. يرجى التواصل مع المبرمج لتفعيل النسخة الخاصة بك.
          </p>
          
          <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'bold', marginBottom: '0.25rem' }}>رقم الترخيص الخاص بك (License Key):</p>
            <p style={{ fontFamily: 'monospace', fontSize: '1.125rem', color: '#111827', letterSpacing: '0.05em', fontWeight: 'bold', userSelect: 'all' }}>{machineId}</p>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.25rem' }}>للتواصل والتفعيل:</p>
            <p style={{ color: '#15803d', fontWeight: 'bold' }} dir="ltr">+213 XX XX XX XX</p>
            <p style={{ color: '#15803d', fontWeight: 'bold' }}>Email@example.com</p>
          </div>
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
