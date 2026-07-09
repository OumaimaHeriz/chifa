import React, { createContext, useContext, useState } from 'react';

const CardContext = createContext(null);

export const CardProvider = ({ children }) => {
  const [cards, setCards] = useState([
    { id: 1, firstName: 'Ahmed', lastName: 'Benali', isAvailable: true, dateAdded: '2023-10-01' },
    { id: 2, firstName: 'Fatima', lastName: 'Zohra', isAvailable: false, dateAdded: '2023-10-05' },
    { id: 3, firstName: 'Yassine', lastName: 'Brahimi', isAvailable: true, dateAdded: '2023-10-12' },
  ]);

  const addCard = (card) => {
    setCards([...cards, { ...card, id: Date.now(), dateAdded: new Date().toISOString().split('T')[0] }]);
  };

  const updateCard = (id, updatedData) => {
    setCards(cards.map(card => card.id === id ? { ...card, ...updatedData } : card));
  };

  const deleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

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
