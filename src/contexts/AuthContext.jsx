import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // Mock authentication for Phase 1 & 2
    const lowerUsername = username.toLowerCase().trim();
    if (lowerUsername === 'admin' && password === 'admin') {
      const adminUser = { username: 'admin', role: 'Administrateur' };
      setUser(adminUser);
      return adminUser;
    } else if (lowerUsername === 'reception' && password === 'reception') {
      const receptionUser = { username: 'reception', role: 'Réception' };
      setUser(receptionUser);
      return receptionUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
  };

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
