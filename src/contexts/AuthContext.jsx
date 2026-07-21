import React, { createContext, useContext, useState, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const initDb = async () => {
      const storagePath = localStorage.getItem('chifa_storage_path');
      if (!storagePath) {
        setIsDbReady(true); // Let the app render so it can route to /setup
        return;
      }

      try {
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
        setDbError(error.toString() + " | Path: " + storagePath);
        setIsDbReady(true);
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

  if (dbError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-red-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في الاتصال بقاعدة البيانات!</h1>
        <p className="text-gray-700 mb-4">تعذر الاتصال بالملف المشترك. يرجى التأكد من أن الحاسوب الرئيسي قيد التشغيل، وأن مسار الشبكة صحيح، وأن لديك صلاحية الدخول (القراءة والكتابة).</p>
        <div className="bg-white p-4 rounded border border-red-200 text-left text-sm text-red-800 break-all w-full max-w-2xl mb-6">
          {dbError}
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('chifa_storage_path');
            window.location.href = '/setup';
          }}
          className="bg-red-600 text-white px-6 py-2 rounded font-bold"
        >
          إعادة اختيار المجلد
        </button>
      </div>
    );
  }

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
