import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const initNetwork = async () => {
      const role = localStorage.getItem('chifa_role');
      const apiUrl = localStorage.getItem('chifa_api_url');
      const storagePath = localStorage.getItem('chifa_storage_path');

      if (!role || !apiUrl) {
        setIsDbReady(true);
        return;
      }

      try {
        if (role === 'server') {
          if (!storagePath) throw new Error("Storage path missing for server.");
          // Start the embedded Rust server
          try {
            await invoke('start_server_cmd', { storagePath });
            // Wait a moment for the server to actually bind to the port
            await new Promise(r => setTimeout(r, 1000));
          } catch (e) {
            console.error("Failed to start server:", e);
            throw new Error(`Erreur du Serveur Local: ${e}`);
          }
        }

        // Ping the server to verify it's reachable
        let retries = 3;
        let connected = false;
        let lastError = null;
        
        while (retries > 0 && !connected) {
          try {
            // We can ping the /cards endpoint just to check if it's alive, or just assume it's alive.
            // Wait, if it's alive, a GET /cards should return 200.
            const res = await fetch(`${apiUrl}/cards`);
            if (res.ok) {
              connected = true;
            } else {
              throw new Error(`HTTP Error: ${res.status}`);
            }
          } catch (e) {
            lastError = e;
            retries--;
            if (retries > 0) await new Promise(r => setTimeout(r, 1500));
          }
        }

        if (!connected) {
          throw lastError;
        }

        setIsDbReady(true);
      } catch (error) {
        console.error("Auth Network Init Error:", error);
        setDbError(error.toString() + " | URL: " + apiUrl);
        setIsDbReady(true);
      }
    };
    initNetwork();
  }, []);

  const login = async (username, password) => {
    const apiUrl = localStorage.getItem('chifa_api_url');
    if (!apiUrl) return null;
    
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const loggedUser = await res.json();
        setUser(loggedUser);
        return loggedUser;
      }
      return null;
    } catch (e) {
      console.error("Login failed:", e);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
  };

  if (dbError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-red-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de Connexion (خطأ في الاتصال)</h1>
        <p className="text-gray-700 mb-4">Impossible de se connecter au serveur. Vérifiez que l'ordinateur de l'Administrateur est allumé et que le pare-feu (Firewall) ne bloque pas le port 3000.</p>
        <div className="bg-white p-4 rounded border border-red-200 text-left text-sm text-red-800 break-all w-full max-w-2xl mb-6 font-mono">
          {dbError}
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('chifa_role');
            localStorage.removeItem('chifa_api_url');
            window.location.href = '/setup';
          }}
          className="bg-red-600 text-white px-6 py-2 rounded font-bold"
        >
          Réinitialiser la configuration
        </button>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="flex flex-col gap-4 h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 font-medium">Connexion au Serveur... (جاري الاتصال بالسيرفر)</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
