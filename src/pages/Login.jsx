import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const user = await login(username, password);
    
    if (user) {
      if (user.role === 'Administrateur') {
        navigate('/admin');
      } else {
        navigate('/reception');
      }
    } else {
      setError('Invalid credentials / Identifiants invalides');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <button onClick={toggleLanguage} className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
          {i18n.language === 'fr' ? 'العربية' : 'Français'}
        </button>
      </div>

      <div className="card w-full" style={{ maxWidth: '400px' }}>
        <div className="flex flex-col items-center gap-4" style={{ marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
            <ShieldCheck size={48} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
            Gestion des Cartes Chifa
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{t('login')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              {t('username')}
            </label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              {t('password')}
            </label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem', padding: '0.75rem' }}>
            {t('login_btn')}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <p>Admin: admin / admin</p>
          <p>Reception: reception / reception</p>
        </div>
      </div>
    </div>
  );
}
