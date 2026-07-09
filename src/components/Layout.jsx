import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, CreditCard, Search } from 'lucide-react';

export default function Layout({ children }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="flex h-screen bg-gray-50" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--color-surface)', 
        borderInlineEnd: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--color-border)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold', fontSize: '1.25rem' }}>Pharmacie</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{t('chifa_card_status')}</p>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {user?.role === 'Administrateur' && (
            <>
              <button className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'white', fontWeight: '500', width: '100%', textAlign: 'start' }}>
                <CreditCard size={20} />
                Gestion des Cartes
              </button>
              <button className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', fontWeight: '500', width: '100%', textAlign: 'start' }}>
                <Users size={20} />
                Utilisateurs
              </button>
            </>
          )}

          {user?.role === 'Réception' && (
            <button className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'white', fontWeight: '500', width: '100%', textAlign: 'start' }}>
              <Search size={20} />
              Recherche
            </button>
          )}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <button onClick={toggleLanguage} className="btn" style={{ border: '1px solid var(--color-border)', width: '100%' }}>
            {i18n.language === 'fr' ? 'العربية' : 'Français'}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user?.username}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{user?.role}</p>
            </div>
            <button onClick={logout} style={{ color: 'var(--color-error)' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
