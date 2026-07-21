import React, { createContext, useContext, useState, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';

const CardContext = createContext(null);

export const CardProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  const [db, setDb] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  const [dbError, setDbError] = useState(null);

  // Initialize Database
  useEffect(() => {
    let intervalId;
    let currentDb = null;

    const initDb = async () => {
      const storagePath = localStorage.getItem('chifa_storage_path');
      if (!storagePath) {
        setIsDbReady(true);
        return;
      }

      try {
        const dbPath = `sqlite:${storagePath}/chifa.db`;
        const database = await Database.load(dbPath);
        currentDb = database;
        
        await database.execute(`
          CREATE TABLE IF NOT EXISTS cards_v2 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_assurance TEXT NOT NULL,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            date_naissance TEXT,
            ayant_droit TEXT,
            taux_remboursement TEXT,
            maladie_chronique BOOLEAN,
            tier_payant TEXT,
            fin_droit TEXT,
            date_servie TEXT,
            client_type TEXT,
            remarque TEXT,
            tarif TEXT,
            vignette_remboursement TEXT,
            vignette_instance TEXT,
            ordonnance_image_path TEXT,
            status TEXT DEFAULT 'En attente',
            dateAdded TEXT NOT NULL
          )
        `);

        setDb(database);
        setIsDbReady(true);
        
        loadCards(database);

        intervalId = setInterval(() => {
          loadCards(currentDb);
        }, 3000);

      } catch (error) {
        console.error("Failed to initialize database:", error);
        setDbError(error.toString());
        setIsDbReady(true);
      }
    };

    initDb();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const loadCards = async (database = db) => {
    if (!database) return;
    try {
      const result = await database.select('SELECT * FROM cards_v2 ORDER BY id DESC');
      const mappedCards = result.map(card => ({
        ...card,
        maladie_chronique: Boolean(card.maladie_chronique)
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
        `INSERT INTO cards_v2 (
          numero_assurance, nom, prenom, date_naissance, ayant_droit,
          taux_remboursement, maladie_chronique, tier_payant, fin_droit,
          date_servie, client_type, remarque, tarif, vignette_remboursement,
          vignette_instance, ordonnance_image_path, status, dateAdded
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          card.numero_assurance || '',
          card.nom || '',
          card.prenom || '',
          card.date_naissance || '',
          card.ayant_droit || '',
          card.taux_remboursement || '',
          card.maladie_chronique ? 1 : 0,
          card.tier_payant || '',
          card.fin_droit || '',
          card.date_servie || '',
          card.client_type || 'Normal',
          card.remarque || '',
          card.tarif || '',
          card.vignette_remboursement || '',
          card.vignette_instance || '',
          card.ordonnance_image_path || '',
          card.status || 'En attente',
          dateAdded
        ]
      );
      await loadCards();
    } catch (error) {
      console.error("Failed to add card:", error);
      throw error;
    }
  };

  const updateCard = async (id, updatedData) => {
    if (!db) return;
    try {
      await db.execute(
        `UPDATE cards_v2 SET 
          numero_assurance = $1, nom = $2, prenom = $3, date_naissance = $4,
          ayant_droit = $5, taux_remboursement = $6, maladie_chronique = $7,
          tier_payant = $8, fin_droit = $9, date_servie = $10, client_type = $11,
          remarque = $12, tarif = $13, vignette_remboursement = $14,
          vignette_instance = $15, ordonnance_image_path = $16, status = $17
        WHERE id = $18`,
        [
          updatedData.numero_assurance || '',
          updatedData.nom || '',
          updatedData.prenom || '',
          updatedData.date_naissance || '',
          updatedData.ayant_droit || '',
          updatedData.taux_remboursement || '',
          updatedData.maladie_chronique ? 1 : 0,
          updatedData.tier_payant || '',
          updatedData.fin_droit || '',
          updatedData.date_servie || '',
          updatedData.client_type || 'Normal',
          updatedData.remarque || '',
          updatedData.tarif || '',
          updatedData.vignette_remboursement || '',
          updatedData.vignette_instance || '',
          updatedData.ordonnance_image_path || '',
          updatedData.status || 'En attente',
          id
        ]
      );
      await loadCards();
    } catch (error) {
      console.error("Failed to update card:", error);
      throw error;
    }
  };

  const deleteCard = async (id) => {
    if (!db) return;
    try {
      await db.execute('DELETE FROM cards_v2 WHERE id = $1', [id]);
      await loadCards();
    } catch (error) {
      console.error("Failed to delete card:", error);
      throw error;
    }
  };

  if (dbError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-red-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في الاتصال (Card DB)</h1>
        <div className="bg-white p-4 rounded border border-red-200 text-left text-sm text-red-800 break-all w-full max-w-2xl mb-6">
          {dbError}
        </div>
      </div>
    );
  }

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
