import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X, Save } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

export default function CardFormModal({ isOpen, onClose, onSave, initialData = null }) {
  const { t } = useTranslation();
  
  const defaultState = {
    numero_assurance: '', nom: '', prenom: '', date_naissance: '',
    ayant_droit: '', taux_remboursement: '', maladie_chronique: false,
    tier_payant: '', fin_droit: '', date_servie: '', client_type: 'Normal',
    remarque: '', tarif: '', vignette_remboursement: '', vignette_instance: '',
    ordonnance_image_path: '', status: 'موجودة'
  };

  const [formData, setFormData] = useState(initialData || defaultState);
  const [imagePreview, setImagePreview] = useState(initialData?.ordonnance_image_path || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const uploadImageToApi = async (blob, extension = 'png') => {
    try {
      setIsUploading(true);
      const apiUrl = localStorage.getItem('chifa_api_url');
      if (!apiUrl) throw new Error("API URL missing");
      
      const formData = new FormData();
      formData.append('file', blob, `upload_${Date.now()}.${extension}`);

      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      setIsUploading(false);
      return data.filename;
    } catch (err) {
      console.error("Error uploading image:", err);
      setIsUploading(false);
      return null;
    }
  };

  const handleFileUpload = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Images', extensions: ['png', 'jpeg', 'jpg'] }]
      });
      
      if (selected) {
        // Read file contents from local disk using Tauri
        const fileContents = await readFile(selected);
        const blob = new Blob([fileContents]);
        
        const uploadedFilename = await uploadImageToApi(blob, 'jpg');
        if (uploadedFilename) {
          setFormData(prev => ({ ...prev, ordonnance_image_path: uploadedFilename }));
          setImagePreview(uploadedFilename);
        } else {
          alert("Erreur lors de l'envoi de l'image au serveur.");
        }
      }
    } catch (err) {
      console.error("File selection error:", err);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Impossible d'accéder à la caméra.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          stopCamera();
          const uploadedFilename = await uploadImageToApi(blob, 'png');
          
          if (uploadedFilename) {
            setFormData(prev => ({ ...prev, ordonnance_image_path: uploadedFilename }));
            setImagePreview(uploadedFilename);
          } else {
            alert("Erreur lors de l'envoi de l'image au serveur.");
          }
        }
      }, 'image/png');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            {initialData ? 'Modifier le Dossier' : 'Nouveau Dossier'}
          </h2>
          <button onClick={() => { stopCamera(); onClose(); }} style={{ color: 'var(--color-text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: 'var(--color-background)' }}>
          <form id="cardForm" onSubmit={handleSubmit} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Left Column: Patient Data */}
            <div className="flex flex-col gap-4">
              <h3 style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-primary-light)', paddingBottom: '0.5rem' }}>Informations Patient</h3>
              
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-sm font-medium mb-1 block">Numéro Assurance</label>
                  <input type="text" name="numero_assurance" value={formData.numero_assurance} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client</label>
                  <select name="client_type" value={formData.client_type} onChange={handleChange} className="input-field">
                    <option value="Normal">Normal</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom</label>
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom</label>
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="input-field" required />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date de naissance</label>
                  <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ayant Droit</label>
                  <input type="text" name="ayant_droit" value={formData.ayant_droit} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="maladie" name="maladie_chronique" checked={formData.maladie_chronique} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                <label htmlFor="maladie" className="font-medium text-red-600">Maladie Chronique</label>
              </div>

              <h3 style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-primary-light)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Détails Médicaux</h3>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-sm font-medium mb-1 block">Taux de remboursement</label>
                  <input type="text" name="taux_remboursement" value={formData.taux_remboursement} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tier payant</label>
                  <input type="text" name="tier_payant" value={formData.tier_payant} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-sm font-medium mb-1 block">Fin droit</label>
                  <input type="date" name="fin_droit" value={formData.fin_droit} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date servie traitement</label>
                  <input type="date" name="date_servie" value={formData.date_servie} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>

            {/* Right Column: Ordonnance & Tarifs */}
            <div className="flex flex-col gap-4">
              <h3 style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-primary-light)', paddingBottom: '0.5rem' }}>Ordonnance</h3>
              
              <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '2px dashed #d1d5db' }}>
                {isCameraActive ? (
                  <div style={{ width: '100%', position: 'relative' }}>
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '0.25rem', backgroundColor: '#000' }}></video>
                    <button type="button" onClick={capturePhoto} className="btn btn-primary" style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }}>
                      Capturer
                    </button>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                  </div>
                ) : imagePreview ? (
                  <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p className="text-sm text-center mb-2 font-medium text-green-600">
                      {isUploading ? "Envoi en cours..." : "Image jointe au dossier (sur le serveur)"}
                    </p>
                    {/* We can fetch it to display, but for now we just show a success message since previewing a remote image needs the full URL */}
                    {imagePreview && (
                      <img 
                        src={`${localStorage.getItem('chifa_api_url')}/images/${imagePreview}`} 
                        alt="Ordonnance" 
                        style={{ maxHeight: '150px', borderRadius: '0.25rem', border: '1px solid #ccc', marginBottom: '0.5rem' }}
                      />
                    )}
                    <button type="button" onClick={() => setImagePreview(null)} className="btn text-sm" style={{ padding: '0.25rem 0.5rem' }}>Changer</button>
                  </div>
                ) : (
                  <>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>Aucune ordonnance jointe.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleFileUpload} disabled={isUploading} className="btn flex items-center gap-2" style={{ backgroundColor: 'white', border: '1px solid var(--color-border)', opacity: isUploading ? 0.5 : 1 }}>
                        <Upload size={16} /> Parcourir
                      </button>
                      <button type="button" onClick={startCamera} disabled={isUploading} className="btn flex items-center gap-2" style={{ backgroundColor: 'white', border: '1px solid var(--color-border)', opacity: isUploading ? 0.5 : 1 }}>
                        <Camera size={16} /> Caméra
                      </button>
                    </div>
                  </>
                )}
              </div>

              <h3 style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-primary-light)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Facturation & Vignettes</h3>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tarif</label>
                  <input type="text" name="tarif" value={formData.tarif} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Vignette Instance</label>
                  <input type="text" name="vignette_instance" value={formData.vignette_instance} onChange={handleChange} className="input-field" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Vignette N° remboursement</label>
                <input type="text" name="vignette_remboursement" value={formData.vignette_remboursement} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Remarque</label>
                <textarea name="remarque" value={formData.remarque} onChange={handleChange} className="input-field" style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-primary-dark)' }}>Statut du dossier (حالة الملف)</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input-field" style={{ fontWeight: 'bold', backgroundColor: formData.status === 'أخذها' ? '#bbf7d0' : '#fef08a' }}>
                  <option value="موجودة">موجودة (En attente)</option>
                  <option value="أخذها">أخذها (Livré)</option>
                </select>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3" style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <button type="button" className="btn" onClick={() => { stopCamera(); onClose(); }} style={{ border: '1px solid var(--color-border)' }}>Annuler</button>
          <button type="submit" form="cardForm" disabled={isUploading} className="btn btn-primary flex items-center gap-2">
            <Save size={18} /> {isUploading ? 'Envoi...' : 'Enregistrer le dossier'}
          </button>
        </div>

      </div>
    </div>
  );
}
