import React, { createContext, useContext, useState, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';

const CardContext = createContext(null);

export const CardProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  const [db, setDb] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize Database
  useEffect(() => {
    const initDb = async () => {
      try {
        // Load or create the sqlite file
        const database = await Database.load('sqlite:chifa.db');
        
        // Create the cards table if it doesn't exist
        await database.execute(`
          CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            isAvailable BOOLEAN NOT NULL,
            dateAdded TEXT NOT NULL
          )
        `);

        setDb(database);
        setIsDbReady(true);
        
        // Load existing cards
        loadCards(database);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    initDb();
  }, []);

  const loadCards = async (database = db) => {
    if (!database) return;
    try {
      const result = await database.select('SELECT * FROM cards ORDER BY id DESC');
      // SQLite returns integers for booleans (0 or 1), let's map them to JS booleans
      const mappedCards = result.map(card => ({
        ...card,
        isAvailable: Boolean(card.isAvailable)
      }));
      setCards(mappedCards);
    } catch (error) {
      console.error("Failed to load cards:", error);
    }
  };

  const addCard = async (card) => {
    if (!db) return;
    try {
      const dateAdded = new Date().toISOString().split('T')[0];
      await db.execute(
        'INSERT INTO cards (firstName, lastName, isAvailable, dateAdded) VALUES ($1, $2, $3, $4)',
        [card.firstName, card.lastName, card.isAvailable ? 1 : 0, dateAdded]
      );
      await loadCards(); // Refresh the list
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const updateCard = async (id, updatedData) => {
    if (!db) return;
    try {
      await db.execute(
        'UPDATE cards SET firstName = $1, lastName = $2, isAvailable = $3 WHERE id = $4',
        [updatedData.firstName, updatedData.lastName, updatedData.isAvailable ? 1 : 0, id]
      );
      await loadCards(); // Refresh the list
    } catch (error) {
      console.error("Failed to update card:", error);
    }
  };

  const deleteCard = async (id) => {
    if (!db) return;
    try {
      await db.execute('DELETE FROM cards WHERE id = $1', [id]);
      await loadCards(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  if (!isDbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p>Loading database... / Chargement de la base de données...</p>
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
