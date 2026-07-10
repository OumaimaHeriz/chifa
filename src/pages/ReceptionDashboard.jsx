import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useCards } from '../contexts/CardContext';
import { Search, FileText } from 'lucide-react';

export default function ReceptionDashboard() {
  const { t } = useTranslation();
  const { cards } = useCards();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return cards.filter(card => {
      const query = searchQuery.toLowerCase();
      return (card.numero_assurance?.toLowerCase().includes(query) ||
              card.nom?.toLowerCase().includes(query) ||
              card.prenom?.toLowerCase().includes(query));
    });
  }, [cards, searchQuery]);

  return (
    <Layout activeTab="search">
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
          <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-primary-light)', padding: '1rem', borderRadius: '50%', color: 'white', marginBottom: '1rem' }}>
            <Search size={48} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
            Recherche de Dossier
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Recherchez un patient par Numéro d'assurance, Nom ou Prénom.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', marginBottom: '2rem', border: '2px solid var(--color-primary-light)' }}>
          <Search size={24} color="var(--color-primary)" />
          <input 
            type="text" 
            placeholder="Entrez le numéro d'assurance ou le nom..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1.125rem' }}
            autoFocus
          />
        </div>

        {searchQuery.trim() !== '' && (
          <div className="flex flex-col gap-4">
            {filteredCards.length > 0 ? (
              filteredCards.map(card => (
                <div key={card.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                        {card.nom} {card.prenom}
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        N° Assurance: {card.numero_assurance}
                      </p>
                    </div>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                      backgroundColor: card.client_type === 'VIP' ? '#fef3c7' : '#f3f4f6',
                      color: card.client_type === 'VIP' ? '#b45309' : '#4b5563'
                    }}>
                      Client {card.client_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4" style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vignette Instance</p>
                      <p style={{ fontWeight: '500' }}>{card.vignette_instance || 'N/A'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vignette N° Remboursement</p>
                      <p style={{ fontWeight: '500' }}>{card.vignette_remboursement || 'N/A'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Remarque (Admin)</p>
                      <p style={{ fontWeight: '500', color: '#b91c1c' }}>{card.remarque || 'Aucune remarque.'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                <FileText size={48} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '1rem' }} />
                <p>Aucun dossier trouvé pour "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
