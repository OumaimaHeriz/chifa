import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CardContext = createContext(null);

export const CardProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Use a ref to always get the latest URL
  const apiUrlRef = useRef(localStorage.getItem('chifa_api_url'));

  useEffect(() => {
    let intervalId;
    const apiUrl = localStorage.getItem('chifa_api_url');
    apiUrlRef.current = apiUrl;

    if (!apiUrl) {
      setIsReady(true);
      return;
    }

    const init = async () => {
      try {
        await loadCards();
        setIsReady(true);

        // Sync Polling every 3 seconds to keep Reception/Admin in sync
        intervalId = setInterval(() => {
          loadCards();
        }, 3000);
      } catch (err) {
        console.error("Failed to initialize cards network:", err);
        setError(err.toString());
        setIsReady(true);
      }
    };

    init();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const loadCards = async () => {
    const apiUrl = apiUrlRef.current;
    if (!apiUrl) return;
    try {
      const res = await fetch(`${apiUrl}/cards`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Ensure boolean format
      const mappedCards = data.map(card => ({
        ...card,
        maladie_chronique: Boolean(card.maladie_chronique)
      }));
      setCards(mappedCards);
    } catch (error) {
      console.error("Failed to load cards:", error);
    }
  };

  const addCard = async (card) => {
    const apiUrl = apiUrlRef.current;
    if (!apiUrl) return;
    try {
      const dateAdded = new Date().toISOString().split('T')[0];
      
      // We map the payload exactly as the Rust struct expects
      const payload = {
        ...card,
        dateAdded,
        maladie_chronique: Boolean(card.maladie_chronique)
      };

      const res = await fetch(`${apiUrl}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      await loadCards();
    } catch (error) {
      console.error("Failed to add card:", error);
      throw error;
    }
  };

  const updateCard = async (id, updatedData) => {
    const apiUrl = apiUrlRef.current;
    if (!apiUrl) return;
    try {
      const payload = {
        ...updatedData,
        maladie_chronique: Boolean(updatedData.maladie_chronique)
      };

      const res = await fetch(`${apiUrl}/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      await loadCards();
    } catch (error) {
      console.error("Failed to update card:", error);
      throw error;
    }
  };

  const deleteCard = async (id) => {
    const apiUrl = apiUrlRef.current;
    if (!apiUrl) return;
    try {
      const res = await fetch(`${apiUrl}/cards/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      await loadCards();
    } catch (error) {
      console.error("Failed to delete card:", error);
      throw error;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-red-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur Réseau (Card DB)</h1>
        <div className="bg-white p-4 rounded border border-red-200 text-left text-sm text-red-800 break-all w-full max-w-2xl mb-6">
          {error}
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex flex-col gap-4 h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 font-medium">Chargement des données... (جاري تحميل البيانات)</p>
      </div>
    );
  }

  return (
    <CardContext.Provider value={{ cards, addCard, updateCard, deleteCard }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};
