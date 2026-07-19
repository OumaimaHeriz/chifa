import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { open } from '@tauri-apps/plugin-dialog';
import { FolderOpen, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Setup() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState('');
  const [error, setError] = useState('');

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Sélectionnez le dossier de stockage (اختار مجلد حفظ البيانات)"
      });

      if (selected) {
        setSelectedPath(selected);
        setError('');
      }
    } catch (err) {
      console.error("Failed to open dialog:", err);
      setError("Erreur lors de la sélection du dossier.");
    }
  };

  const handleSaveAndContinue = () => {
    if (!selectedPath) {
      setError("Veuillez sélectionner un dossier avant de continuer.");
      return;
    }
    localStorage.setItem('chifa_storage_path', selectedPath);
    // Reload the app completely so that AuthContext initializes with the new path
    window.location.href = '/login';
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full" style={{ backgroundColor: 'var(--color-background)' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }} className="rtl:left-4 rtl:right-auto">
        <button onClick={toggleLanguage} className="btn" style={{ backgroundColor: '#ffffff', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>
          {i18n.language === 'fr' ? 'العربية' : 'Français'}
        </button>
      </div>

      <div className="card" style={{ maxWidth: '36rem', width: '100%', borderTop: '4px solid #3b82f6', backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex flex-col items-center justify-center" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="flex items-center justify-center" style={{ width: '4rem', height: '4rem', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '9999px' }}>
            <Database size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', textAlign: 'center', lineHeight: '1.4' }}>
            Configuration de la Base de Données<br/>
            (إعداد قاعدة البيانات)
          </h1>
          <p style={{ color: '#4b5563', textAlign: 'center', marginBottom: '1rem' }}>
            Pour utiliser le logiciel sur plusieurs ordinateurs (Réseau Local), veuillez sélectionner un dossier partagé.
            <br/>
            لكي تستخدم البرنامج في حاسوبين (عبر الشبكة)، يرجى اختيار المجلد المشترك الذي سيحفظ فيه البيانات.
          </p>
        </div>

        <div style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #facc15', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.25rem' }}>
          <div className="flex items-start" style={{ gap: '0.75rem' }}>
            <ShieldAlert style={{ color: '#ca8a04', marginTop: '0.25rem', flexShrink: 0 }} size={24} />
            <div>
              <p style={{ fontWeight: 'bold', color: '#854d0e', marginBottom: '0.25rem' }}>Administrateur (المدير):</p>
              <p style={{ fontSize: '0.875rem', color: '#a16207', marginBottom: '0.5rem' }}>Choisissez un dossier sur votre bureau et partagez-le sur le réseau. (اختر مجلداً في حاسوبك وقم بمشاركته في الشبكة).</p>
              
              <p style={{ fontWeight: 'bold', color: '#854d0e', marginBottom: '0.25rem', marginTop: '0.5rem' }}>Réception (الاستقبال):</p>
              <p style={{ fontSize: '0.875rem', color: '#a16207' }}>Choisissez le dossier partagé par l'administrateur via le réseau. (اختر المجلد الذي شاركه المدير عبر الشبكة).</p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <div className="flex flex-col" style={{ gap: '1rem' }}>
          <button 
            onClick={handleSelectFolder}
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
              padding: '1rem 1.5rem', border: '2px dashed #d1d5db', borderRadius: '0.75rem', 
              backgroundColor: selectedPath ? '#eff6ff' : 'transparent', 
              borderColor: selectedPath ? '#3b82f6' : '#d1d5db',
              transition: 'all 0.2s', cursor: 'pointer'
            }}
          >
            <FolderOpen size={24} style={{ color: selectedPath ? '#3b82f6' : '#9ca3af' }} />
            <span style={{ fontWeight: selectedPath ? 'bold' : 'normal', color: selectedPath ? '#1d4ed8' : '#4b5563' }}>
              {selectedPath ? "Dossier sélectionné (تم اختيار المجلد)" : "Choisir le dossier (اختر المجلد)"}
            </span>
          </button>

          {selectedPath && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #bbf7d0' }}>
              <code style={{ fontSize: '0.875rem', color: '#166534', flex: 1, fontFamily: 'monospace', wordBreak: 'break-all' }} dir="ltr">
                {selectedPath}
              </code>
              <CheckCircle2 style={{ color: '#16a34a', flexShrink: 0, marginLeft: '0.5rem' }} size={20} />
            </div>
          )}

          <button 
            onClick={handleSaveAndContinue}
            disabled={!selectedPath}
            className="btn btn-primary w-full"
            style={{ 
              padding: '1rem', fontSize: '1.125rem', marginTop: '1rem',
              opacity: !selectedPath ? 0.5 : 1, 
              cursor: !selectedPath ? 'not-allowed' : 'pointer'
            }}
          >
            Continuer (متابعة)
          </button>
        </div>
      </div>
    </div>
  );
}
