import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useCards } from '../contexts/CardContext';
import { Plus, Edit2, Trash2, Search, FileText, Star, Users } from 'lucide-react';
import CardFormModal from '../components/CardFormModal';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { cards, addCard, deleteCard, updateCard } = useCards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    return {
      total: cards.length,
      vip: cards.filter(c => c.client_type === 'VIP').length,
      normal: cards.filter(c => c.client_type !== 'VIP').length
    };
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const query = searchQuery.toLowerCase();
      return (card.numero_assurance?.toLowerCase().includes(query) ||
              card.nom?.toLowerCase().includes(query) ||
              card.prenom?.toLowerCase().includes(query));
    });
  }, [cards, searchQuery]);

  const handleSave = async (data) => {
    try {
      if (currentCard) {
        await updateCard(currentCard.id, data);
      } else {
        await addCard(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Une erreur s'est produite lors de l'enregistrement.");
    }
  };

  const openModal = (card = null) => {
    setCurrentCard(card);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce dossier ?")) {
      deleteCard(id);
    }
  };

  return (
    <Layout activeTab="cards">
      <div style={{ padding: '2rem' }}>
        
        {/* Header & Stats */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
            Tableau de Bord
          </h1>
          <div className="flex gap-4">
            <button 
              className="btn" 
              style={{ backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' }}
              onClick={() => {
                if (window.confirm("هل تريدين حقاً تغيير مسار قاعدة البيانات؟ سيتم إعادة توجيهك لشاشة الإعداد.")) {
                  localStorage.removeItem('chifa_storage_path');
                  window.location.href = '/setup';
                }
              }}
            >
              تغيير المجلد
            </button>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <Plus size={16} style={{ marginInlineEnd: '0.5rem' }} />
              Nouveau Dossier
            </button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card flex items-center gap-4">
            <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: '50%', color: '#3730a3' }}>
              <FileText size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Total Dossiers</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total}</h2>
            </div>
          </div>
          
          <div className="card flex items-center gap-4">
            <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#b45309' }}>
              <Star size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Clients VIP</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.vip}</h2>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#166534' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Clients Normaux</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.normal}</h2>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Rechercher par Numéro d'assurance, Nom ou Prénom..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
            <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>N° Assurance</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Nom & Prénom</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Client</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Statut</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Date d'ajout</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)', textAlign: 'end' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map(card => (
                <tr key={card.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{card.numero_assurance}</td>
                  <td style={{ padding: '1rem' }}>{card.nom} {card.prenom}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500',
                      backgroundColor: card.client_type === 'VIP' ? '#fef3c7' : '#f3f4f6',
                      color: card.client_type === 'VIP' ? '#b45309' : '#4b5563'
                    }}>
                      {card.client_type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500',
                      backgroundColor: card.status === 'موجودة' ? '#fef08a' : (card.status === 'أخذها' ? '#bbf7d0' : '#e5e7eb'),
                      color: card.status === 'موجودة' ? '#854d0e' : (card.status === 'أخذها' ? '#166534' : '#374151')
                    }}>
                      {card.status || 'موجودة'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{card.dateAdded}</td>
                  <td style={{ padding: '1rem', textAlign: 'end' }}>
                    <button onClick={() => openModal(card)} style={{ color: 'var(--color-secondary)', marginInlineEnd: '1rem' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(card.id)} style={{ color: 'var(--color-error)' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCards.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Aucun dossier trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CardFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={currentCard} 
      />
    </Layout>
  );
}
