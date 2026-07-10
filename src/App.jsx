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

// Root redirect logic
const RootRedirect = () => {
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
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-red-50 p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border-t-4 border-red-500">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Période d'essai expirée</h1>
          <h2 className="text-xl font-bold text-gray-900 mb-4">(انتهت الفترة التجريبية)</h2>
          <p className="text-gray-600 mb-6">
            Votre licence pour utiliser cette application a expiré ou a été désactivée. Veuillez contacter l'administrateur pour renouveler votre abonnement.
            <br/><br/>
            لقد انتهت صلاحية استخدامك للبرنامج. يرجى التواصل مع المبرمج لتفعيل النسخة الخاصة بك.
          </p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 font-bold mb-1">رقم الترخيص الخاص بك (License Key):</p>
            <p className="font-mono text-lg text-gray-900 tracking-wider font-bold select-all">{machineId}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-bold text-green-800 mb-1">للتواصل والتفعيل:</p>
            <p className="text-green-700 font-bold" dir="ltr">+213 XX XX XX XX</p>
            <p className="text-green-700 font-bold">Email@example.com</p>
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
