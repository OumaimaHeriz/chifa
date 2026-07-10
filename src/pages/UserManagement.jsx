import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Shield, UserX, UserCheck } from 'lucide-react';

export default function UserManagement() {
  const { t } = useTranslation();
  const { db, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Réception', is_active: true });

  useEffect(() => {
    loadUsers();
  }, [db]);

  const loadUsers = async () => {
    if (!db) return;
    try {
      const result = await db.select('SELECT * FROM users ORDER BY id ASC');
      setUsers(result.map(u => ({ ...u, is_active: Boolean(u.is_active) })));
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, password: user.password, role: user.role, is_active: user.is_active });
    } else {
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'Réception', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;

    try {
      if (editingUser) {
        await db.execute(
          'UPDATE users SET username = $1, password = $2, role = $3, is_active = $4 WHERE id = $5',
          [formData.username, formData.password, formData.role, formData.is_active ? 1 : 0, editingUser.id]
        );
      } else {
        await db.execute(
          'INSERT INTO users (username, password, role, is_active) VALUES ($1, $2, $3, $4)',
          [formData.username, formData.password, formData.role, formData.is_active ? 1 : 0]
        );
      }
      handleCloseModal();
      loadUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Erreur lors de l'enregistrement de l'utilisateur. Le nom d'utilisateur existe peut-être déjà.");
    }
  };

  const handleDelete = async (id) => {
    if (!db) return;
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await db.execute('DELETE FROM users WHERE id = $1', [id]);
        loadUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const toggleActive = async (user) => {
    if (!db) return;
    try {
      await db.execute(
        'UPDATE users SET is_active = $1 WHERE id = $2',
        [!user.is_active ? 1 : 0, user.id]
      );
      loadUsers();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  return (
    <Layout activeTab="users">
      <div style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
            Gestion des Utilisateurs
          </h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} style={{ marginInlineEnd: '0.5rem' }} />
            Nouvel Utilisateur
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
            <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Nom d'utilisateur</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Mot de passe</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Rôle</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Statut</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)', textAlign: 'end' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{u.username}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                    {u.id === currentUser.id ? '••••••••' : u.password}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '500',
                      backgroundColor: u.role === 'Administrateur' ? '#e0e7ff' : '#f3f4f6',
                      color: u.role === 'Administrateur' ? '#3730a3' : '#4b5563'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => u.id !== currentUser.id && toggleActive(u)}
                      disabled={u.id === currentUser.id}
                      className="flex items-center gap-1" 
                      style={{ 
                        color: u.is_active ? 'var(--color-success)' : 'var(--color-error)', 
                        fontSize: '0.875rem',
                        cursor: u.id === currentUser.id ? 'not-allowed' : 'pointer',
                        opacity: u.id === currentUser.id ? 0.5 : 1
                      }}
                    >
                      {u.is_active ? <><UserCheck size={16}/> Actif</> : <><UserX size={16}/> Inactif</>}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'end' }}>
                    <button onClick={() => handleOpenModal(u)} style={{ color: 'var(--color-secondary)', marginInlineEnd: '1rem' }}>
                      <Edit2 size={18} />
                    </button>
                    {u.id !== currentUser.id && (
                      <button onClick={() => handleDelete(u.id)} style={{ color: 'var(--color-error)' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* License Key Section */}
        <div className="card mt-8" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
            معلومات الترخيص (License Information)
          </h2>
          <p className="text-gray-600 mb-4">
            هذا هو الرقم التعريفي الخاص بهذا الحاسوب. يمكنك استخدامه لإيقاف البرنامج عن بُعد في حال انتهاء فترة التجربة.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
            <code className="font-mono text-lg text-gray-900 font-bold" style={{ userSelect: 'all' }}>
              {localStorage.getItem('chifa_machine_id') || 'جاري التوليد...'}
            </code>
            <span className="text-sm text-gray-500">انسخ هذا الرقم واحتفظ به</span>
          </div>
        </div>

      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {editingUser ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Nom d'utilisateur</label>
                <input type="text" className="input-field" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Mot de passe</label>
                <input type="text" className="input-field" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Rôle</label>
                <select className="input-field" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Réception">Réception</option>
                  <option value="Administrateur">Administrateur</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Compte Actif</label>
              </div>
              <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={handleCloseModal} style={{ border: '1px solid var(--color-border)' }}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
