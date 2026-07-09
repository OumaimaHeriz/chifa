import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useCards } from '../contexts/CardContext';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

export default function ReceptionDashboard() {
  const { t } = useTranslation();
  const { cards } = useCards();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = cards.filter(card => {
    const fullName = `${card.firstName} ${card.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
            {t('reception_dashboard')}
          </h1>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2" style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder={t('search_patient')} 
              style={{ paddingLeft: '3rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
            <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('first_name')}</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('last_name')}</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('chifa_card_status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map(card => (
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
                </tr>
              ))}
              {filteredCards.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No records found / Aucun enregistrement
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
