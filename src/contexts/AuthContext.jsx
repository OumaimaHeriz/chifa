import React, { createContext, useContext, useState, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      const storagePath = localStorage.getItem('chifa_storage_path');
      if (!storagePath) {
        setIsDbReady(true); // Let the app render so it can route to /setup
        return;
      }

      try {
        // Construct the absolute connection string for Tauri plugin sql
        // On Windows it will be sqlite:C:\Path\To\chifa.db
        // On Mac it will be sqlite:/Path/To/chifa.db
        // It requires a proper format. Let's use string concatenation.
        const dbPath = `sqlite:${storagePath}/chifa.db`;
        const database = await Database.load(dbPath);
        
        await database.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1
          )
        `);

        // Check if admin exists
        const result = await database.select("SELECT * FROM users WHERE username = 'admin'");
        if (result.length === 0) {
          await database.execute(
            "INSERT INTO users (username, password, role, is_active) VALUES ('admin', 'admin', 'Administrateur', 1)"
          );
        }

        setDb(database);
        setIsDbReady(true);
      } catch (error) {
        console.error("Auth DB Init Error:", error);
      }
    };
    initDb();
  }, []);

  const login = async (username, password) => {
    if (!db) return null;
    const lowerUsername = username.toLowerCase().trim();
    const result = await db.select(
      "SELECT * FROM users WHERE username = $1 AND password = $2 AND is_active = 1",
      [lowerUsername, password]
    );

    if (result.length > 0) {
      const loggedUser = result[0];
      setUser(loggedUser);
      return loggedUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
  };

  if (!isDbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p>Loading Authentication...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, db, login, logout }}>
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
