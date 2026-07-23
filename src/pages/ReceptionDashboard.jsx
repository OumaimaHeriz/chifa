import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useCards } from '../contexts/CardContext';
import { Search, FileText, Image as ImageIcon, X } from 'lucide-react';
import { appDataDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';

export default function ReceptionDashboard() {
  const { t } = useTranslation();
  const { cards } = useCards();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return cards.filter(card => {
      const query = searchQuery.toLowerCase();
      return (card.numero_assurance?.toLowerCase().includes(query) ||
              card.nom?.toLowerCase().includes(query) ||
              card.prenom?.toLowerCase().includes(query));
    });
  }, [cards, searchQuery]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:') || path.startsWith('http')) {
      return path; // For blob preview
    }
    const apiUrl = localStorage.getItem('chifa_api_url');
    if (apiUrl) {
      return `${apiUrl}/images/${path}`;
    }
    return null;
  };

  return (
    <Layout activeTab="search">
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
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
          <div className="flex flex-col gap-6">
            {filteredCards.length > 0 ? (
              filteredCards.map(card => (
                <div key={card.id} className="card" style={{ borderLeft: '6px solid var(--color-primary)', padding: '1.5rem' }}>
                  
                  {/* Header: Name, Status, Client Type */}
                  <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                        {card.nom} {card.prenom}
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
                        N° Assurance: <span style={{ fontWeight: 'bold', color: '#111827' }}>{card.numero_assurance}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span style={{ 
                        padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: 'bold',
                        backgroundColor: card.status === 'موجودة' ? '#fef08a' : (card.status === 'أخذها' ? '#bbf7d0' : '#e5e7eb'),
                        color: card.status === 'موجودة' ? '#854d0e' : (card.status === 'أخذها' ? '#166534' : '#374151')
                      }}>
                        حالة الملف: {card.status || 'موجودة'}
                      </span>

                      <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                        backgroundColor: card.client_type === 'VIP' ? '#fef3c7' : '#f3f4f6',
                        color: card.client_type === 'VIP' ? '#b45309' : '#4b5563'
                      }}>
                        Client {card.client_type}
                      </span>
                    </div>
                  </div>

                  {/* Body: All details in a grid */}
                  <div className="grid grid-cols-2 gap-8">
                    
                    {/* Left Column */}
                    <div className="flex flex-col gap-4">
                      <h4 style={{ fontWeight: 'bold', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Informations Personnelles</h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                        <div className="text-gray-500">Date de naissance</div>
                        <div className="font-medium text-right">{card.date_naissance || '-'}</div>
                        
                        <div className="text-gray-500">Ayant Droit</div>
                        <div className="font-medium text-right">{card.ayant_droit || '-'}</div>
                        
                        <div className="text-gray-500">Maladie Chronique</div>
                        <div className="font-medium text-right text-red-600">{card.maladie_chronique ? 'Oui (نعم)' : 'Non (لا)'}</div>
                        
                        <div className="text-gray-500">Fin de droit</div>
                        <div className="font-medium text-right">{card.fin_droit || '-'}</div>
                      </div>

                      <h4 style={{ fontWeight: 'bold', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>Détails Médicaux & Tarifs</h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                        <div className="text-gray-500">Taux remboursement</div>
                        <div className="font-medium text-right">{card.taux_remboursement || '-'}</div>
                        
                        <div className="text-gray-500">Tier payant</div>
                        <div className="font-medium text-right">{card.tier_payant || '-'}</div>
                        
                        <div className="text-gray-500">Date servie</div>
                        <div className="font-medium text-right">{card.date_servie || '-'}</div>

                        <div className="text-gray-500">Tarif</div>
                        <div className="font-bold text-right text-lg">{card.tarif || '-'}</div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4">
                      <h4 style={{ fontWeight: 'bold', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Vignettes & Remarques</h4>
                      
                      <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vignette Instance</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem' }}>{card.vignette_instance || 'N/A'}</p>
                        
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vignette N° Remboursement</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem' }}>{card.vignette_remboursement || 'N/A'}</p>
                        
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Remarque (Admin)</p>
                        <p style={{ fontWeight: 'bold', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '0.25rem' }}>{card.remarque || 'Aucune remarque.'}</p>
                      </div>

                      <h4 style={{ fontWeight: 'bold', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>Ordonnance (الوصفة)</h4>
                      
                      {card.ordonnance_image_path ? (
                        <div 
                          onClick={() => setSelectedImage(getImageUrl(card.ordonnance_image_path))}
                          style={{ 
                            backgroundColor: '#f3f4f6', height: '120px', borderRadius: '0.5rem', border: '2px dashed #d1d5db', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            backgroundImage: `url(${getImageUrl(card.ordonnance_image_path)})`,
                            backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
                          }}
                        >
                          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <ImageIcon size={20} /> Cliquez pour agrandir
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ backgroundColor: '#f3f4f6', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          Aucune image disponible.
                        </div>
                      )}

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

      {/* Image Modal */}
      {selectedImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <button 
            onClick={() => setSelectedImage(null)} 
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}
          >
            <X size={32} />
          </button>
          <img src={selectedImage} alt="Ordonnance" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem' }} />
        </div>
      )}

    </Layout>
  );
}
