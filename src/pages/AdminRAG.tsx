import React, { useState } from 'react';
import { useRag } from '../store/RagContext';
import { RagEntry } from '../store/mockKnowledge';
import { ArrowLeft, Plus, Save, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminRAG: React.FC = () => {
  const { knowledgeBase, addEntry, updateEntry, deleteEntry } = useRag();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<RagEntry, 'id'>>({
    triggerPhrase: '',
    responseType: 'text',
    responseText: '',
    mediaUrl: '',
    audioDuration: ''
  });

  const handleEdit = (entry: RagEntry) => {
    setEditingId(entry.id);
    setFormData({
      triggerPhrase: entry.triggerPhrase,
      responseType: entry.responseType,
      responseText: entry.responseText,
      mediaUrl: entry.mediaUrl || '',
      audioDuration: entry.audioDuration || ''
    });
  };

  const handleSave = () => {
    if (!formData.triggerPhrase || !formData.responseText) {
      alert("A frase gatilho e o texto de resposta são obrigatórios.");
      return;
    }

    if (editingId) {
      updateEntry(editingId, formData);
      setEditingId(null);
    } else {
      addEntry(formData);
    }

    setFormData({
      triggerPhrase: '',
      responseType: 'text',
      responseText: '',
      mediaUrl: '',
      audioDuration: ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      triggerPhrase: '',
      responseType: 'text',
      responseText: '',
      mediaUrl: '',
      audioDuration: ''
    });
  };

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="flex items-center" style={{ gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/')}>
            <ArrowLeft size={24} />
          </button>
          <h2>Treinamento RAG (Base de Conhecimento)</h2>
        </div>
      </div>

      <div className="admin-content">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>{editingId ? 'Editar Regra' : 'Adicionar Nova Regra'}</h3>
          
          <div className="form-group">
            <label>Quando o cliente disser (Ex: "olá", "marcar consulta"):</label>
            <input 
              className="form-control" 
              type="text" 
              value={formData.triggerPhrase} 
              onChange={e => setFormData({...formData, triggerPhrase: e.target.value})}
              placeholder="Frase ou palavra-chave"
            />
          </div>

          <div className="form-group">
            <label>Tipo de resposta da IA:</label>
            <select 
              className="form-control" 
              value={formData.responseType}
              onChange={e => setFormData({...formData, responseType: e.target.value as any})}
            >
              <option value="text">Texto Simples</option>
              <option value="image">Imagem com Texto</option>
              <option value="video">Vídeo com Texto</option>
              <option value="audio">Áudio Transcrito (Simulação)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Resposta de Texto da IA (Transcrição se for áudio):</label>
            <textarea 
              className="form-control" 
              value={formData.responseText}
              onChange={e => setFormData({...formData, responseText: e.target.value})}
              placeholder="O que a atendente vai responder..."
            />
          </div>

          {['image', 'video', 'audio'].includes(formData.responseType) && (
            <div className="form-group">
              <label>URL da URL da Mídia ({formData.responseType === 'image' ? 'JPG/PNG' : formData.responseType === 'video' ? 'MP4' : 'MP3'}):</label>
              <input 
                className="form-control" 
                type="text" 
                value={formData.mediaUrl}
                onChange={e => setFormData({...formData, mediaUrl: e.target.value})}
                placeholder="https://..."
              />
            </div>
          )}

          {formData.responseType === 'audio' && (
            <div className="form-group">
              <label>Duração do áudio simulada (Ex: "1:30"):</label>
              <input 
                className="form-control" 
                type="text" 
                value={formData.audioDuration}
                onChange={e => setFormData({...formData, audioDuration: e.target.value})}
                placeholder="1:30"
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={18} /> {editingId ? 'Salvar Alterações' : 'Adicionar Regra'}
            </button>
            {editingId && (
              <button className="btn" style={{ background: '#e2e8f0' }} onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Regras Cadastradas ({knowledgeBase.length})</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {knowledgeBase.map(entry => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--wa-border)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--wa-green-dark)', marginBottom: 4 }}>"{entry.triggerPhrase}"</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                    <span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, marginRight: 8 }}>{entry.responseType.toUpperCase()}</span>
                    {entry.responseText.length > 80 ? entry.responseText.substring(0, 80) + '...' : entry.responseText}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-icon" onClick={() => handleEdit(entry)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => deleteEntry(entry.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
