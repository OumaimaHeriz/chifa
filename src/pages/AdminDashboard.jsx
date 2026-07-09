import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useCards } from '../contexts/CardContext';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { cards, addCard, deleteCard, updateCard } = useCards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState({ firstName: '', lastName: '', isAvailable: true });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateCard(currentCard.id, currentCard);
    } else {
      addCard(currentCard);
    }
    closeModal();
  };

  const openModal = (card = null) => {
    if (card) {
      setCurrentCard(card);
      setIsEditing(true);
    } else {
      setCurrentCard({ firstName: '', lastName: '', isAvailable: true });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCard({ firstName: '', lastName: '', isAvailable: true });
    setIsEditing(false);
  };

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
            {t('admin_dashboard')}
          </h1>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={16} style={{ marginInlineEnd: '0.5rem' }} />
            {t('add_card')}
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
            <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('first_name')}</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('last_name')}</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('chifa_card_status')}</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Date</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)', textAlign: 'end' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem' }}>{card.firstName}</td>
                  <td style={{ padding: '1rem' }}>{card.lastName}</td>
                  <td style={{ padding: '1rem' }}>
                    {card.isAvailable ? (
                      <span className="flex items-center gap-2" style={{ color: 'var(--color-success)', fontWeight: '500', fontSize: '0.875rem' }}>
                        <CheckCircle2 size={16} /> {t('available')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2" style={{ color: 'var(--color-error)', fontWeight: '500', fontSize: '0.875rem' }}>
                        <XCircle size={16} /> {t('not_available')}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{card.dateAdded}</td>
                  <td style={{ padding: '1rem', textAlign: 'end' }}>
                    <button onClick={() => openModal(card)} style={{ color: 'var(--color-secondary)', marginInlineEnd: '1rem' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteCard(card.id)} style={{ color: 'var(--color-error)' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No records found / Aucun enregistrement
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {isEditing ? t('edit') : t('add_card')}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>{t('first_name')}</label>
                <input type="text" className="input-field" value={currentCard.firstName} onChange={(e) => setCurrentCard({...currentCard, firstName: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>{t('last_name')}</label>
                <input type="text" className="input-field" value={currentCard.lastName} onChange={(e) => setCurrentCard({...currentCard, lastName: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="isAvailable" checked={currentCard.isAvailable} onChange={(e) => setCurrentCard({...currentCard, isAvailable: e.target.checked})} />
                <label htmlFor="isAvailable" style={{ fontSize: '0.875rem', fontWeight: '500' }}>{t('available')}</label>
              </div>
              <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={closeModal} style={{ border: '1px solid var(--color-border)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
