import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { open } from '@tauri-apps/plugin-dialog';
import { Server, Monitor, FolderOpen, Network } from 'lucide-react';

export default function Setup() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // 'server' or 'client'
  const [selectedPath, setSelectedPath] = useState('');
  const [serverIp, setServerIp] = useState('');
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
      setError("Erreur lors de la sélection du dossier.");
    }
  };

  const handleSaveAndContinue = () => {
    if (role === 'server') {
      if (!selectedPath) {
        setError("Veuillez sélectionner un dossier (يرجى اختيار مجلد)");
        return;
      }
      localStorage.setItem('chifa_role', 'server');
      localStorage.setItem('chifa_storage_path', selectedPath);
      localStorage.setItem('chifa_api_url', 'http://localhost:3000');
      window.location.href = '/login';
    } else if (role === 'client') {
      if (!serverIp.trim()) {
        setError("Veuillez entrer l'adresse IP du serveur (يرجى إدخال عنوان الـ IP)");
        return;
      }
      localStorage.setItem('chifa_role', 'client');
      localStorage.setItem('chifa_api_url', `http://${serverIp.trim()}:3000`);
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-gray-800">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl border-t-4 border-blue-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Network size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuration du Réseau (إعداد الشبكة)
          </h1>
          <p className="text-gray-500">
            Choisissez le rôle de cet ordinateur dans votre pharmacie.
          </p>
        </div>

        {!role ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setRole('server')}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
            >
              <Server size={48} className="text-blue-600 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Administrateur (المدير)</h2>
              <p className="text-sm text-gray-500">Cet ordinateur stockera les données et fera office de serveur.</p>
            </button>
            <button 
              onClick={() => setRole('client')}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center"
            >
              <Monitor size={48} className="text-green-600 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Réception (الاستقبال)</h2>
              <p className="text-sm text-gray-500">Cet ordinateur se connectera au serveur pour lire et ajouter des données.</p>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={() => { setRole(null); setError(''); }}
              className="text-blue-600 text-sm font-semibold hover:underline mb-4 inline-block"
            >
              &larr; Retour (رجوع)
            </button>

            {role === 'server' ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-1">Configuration Serveur</h3>
                  <p className="text-sm text-blue-600">Choisissez un dossier sur votre PC pour sauvegarder toutes les données de la pharmacie.</p>
                </div>
                <button 
                  onClick={handleSelectFolder}
                  className={`w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl transition-all ${selectedPath ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-400 text-gray-600'}`}
                >
                  <FolderOpen size={24} />
                  <span className="font-semibold">{selectedPath ? "Dossier sélectionné" : "Choisir le dossier (اختار المجلد)"}</span>
                </button>
                {selectedPath && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-mono break-all border border-green-200">
                    {selectedPath}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-1">Configuration Client</h3>
                  <p className="text-sm text-green-600">Entrez l'adresse IP de l'ordinateur de l'Administrateur (ex: 192.168.1.15).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse IP du Serveur:</label>
                  <input 
                    type="text" 
                    placeholder="192.168.1.X" 
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-lg"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            <button 
              onClick={handleSaveAndContinue}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all ${
                (role === 'server' && selectedPath) || (role === 'client' && serverIp)
                ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
                : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={(role === 'server' && !selectedPath) || (role === 'client' && !serverIp)}
            >
              Démarrer (البدء)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
