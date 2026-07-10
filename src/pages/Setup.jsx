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
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <button onClick={toggleLanguage} className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
          {i18n.language === 'fr' ? 'العربية' : 'Français'}
        </button>
      </div>

      <div className="card w-full shadow-2xl border-t-4 border-blue-500" style={{ maxWidth: '600px', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Database size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Configuration de la Base de Données<br/>
            (إعداد قاعدة البيانات)
          </h1>
          <p className="text-gray-600 text-center mb-4">
            Pour utiliser le logiciel sur plusieurs ordinateurs (Réseau Local), veuillez sélectionner un dossier partagé.
            <br/>
            لكي تستخدم البرنامج في حاسوبين (عبر الشبكة)، يرجى اختيار المجلد المشترك الذي سيحفظ فيه البيانات.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <ShieldAlert className="text-yellow-600 mt-1 mr-3 rtl:ml-3" size={24} />
            <div>
              <p className="font-bold text-yellow-800">Administrateur (المدير):</p>
              <p className="text-sm text-yellow-700 mb-2">Choisissez un dossier sur votre bureau et partagez-le sur le réseau. (اختر مجلداً في حاسوبك وقم بمشاركته في الشبكة).</p>
              
              <p className="font-bold text-yellow-800">Réception (الاستقبال):</p>
              <p className="text-sm text-yellow-700">Choisissez le dossier partagé par l'administrateur via le réseau. (اختر المجلد الذي شاركه المدير عبر الشبكة).</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSelectFolder}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FolderOpen size={24} className={selectedPath ? "text-blue-500" : "text-gray-400"} />
            <span className={selectedPath ? "font-bold text-blue-700" : "text-gray-600"}>
              {selectedPath ? "Dossier sélectionné (تم اختيار المجلد)" : "Choisir le dossier (اختر المجلد)"}
            </span>
          </button>

          {selectedPath && (
            <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between border border-green-200">
              <code className="text-sm text-green-800 truncate flex-1 font-mono" dir="ltr" style={{ userSelect: 'all' }}>
                {selectedPath}
              </code>
              <CheckCircle2 className="text-green-600 ml-2 rtl:mr-2" size={20} />
            </div>
          )}

          <button 
            onClick={handleSaveAndContinue}
            disabled={!selectedPath}
            className={`btn btn-primary w-full py-4 text-lg mt-4 ${!selectedPath ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continuer (متابعة)
          </button>
        </div>
      </div>
    </div>
  );
}
