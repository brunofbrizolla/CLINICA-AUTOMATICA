import React, { useState } from 'react';
import { useProcedures, Procedure } from '../store/ProcedureContext';
import { Plus, Trash2, X, Pencil, Clock } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';

export const Procedures: React.FC = () => {
  const { procedures, addProcedure, deleteProcedure, updateProcedure } = useProcedures();
  const [showModal, setShowModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Form State
  const [form, setForm] = useState({ name: '', durationMinutes: 60 });

  const openAddModal = () => {
    setEditingProcedure(null);
    setForm({ name: '', durationMinutes: 60 });
    setShowModal(true);
  };

  const openEditModal = (p: Procedure) => {
    setEditingProcedure(p);
    setForm({ name: p.name, durationMinutes: p.durationMinutes });
    setShowModal(true);
  };

  const submit = () => {
    if (form.name && form.durationMinutes > 0) {
      if (editingProcedure) {
        updateProcedure(editingProcedure.id, form.name, form.durationMinutes);
      } else {
        addProcedure(form.name, form.durationMinutes);
      }
      setShowModal(false);
    }
  };

  return (
    <div className="crm-layout">
      <PageHeader 
        title="Configurações: Procedimentos" 
        description="Aqui você define o tempo médio de cada tratamento. Isso ajuda a IA a evitar conflitos na sua agenda automaticamente."
        actions={
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} /> Novo Procedimento
          </button>
        }
      />

      <div className="crm-content" style={{ padding: '32px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #e1e4e8' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px', color: '#586069' }}>Nome do Tratamento</th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#586069' }}>Tempo de Execução</th>
                <th style={{ textAlign: 'right', padding: '16px', color: '#586069' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#24292e' }}>{p.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6a737d' }}>
                      <Clock size={16} /> 
                      {p.durationMinutes >= 60 
                        ? `${Math.floor(p.durationMinutes / 60)}h ${p.durationMinutes % 60 > 0 ? (p.durationMinutes % 60) + 'min' : ''}`
                        : `${p.durationMinutes} min`
                      }
                    </div>
                  </td>
                   <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button className="action-btn" title="Editar" onClick={() => openEditModal(p)}>
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {procedures.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6a737d' }}>
              Nenhum procedimento cadastrado.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <div className="form-group">
              <label>Nome do Procedimento</label>
              <input 
                className="form-control" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Ex: Implante, Botox..."
              />
            </div>
            <div className="form-group">
              <label>Tempo de Execução (minutos)</label>
              <input 
                className="form-control" 
                type="number"
                value={form.durationMinutes} 
                onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value) || 0})}
              />
              <p style={{ marginTop: 8, fontSize: 12, color: '#6a737d' }}>
                Sugestão: 30, 45, 60, 90, 120 min
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 768 ? 'column-reverse' : 'row',
              justifyContent: 'space-between', 
              marginTop: 24, 
              gap: 12 
            }}>
              {editingProcedure && (
                <button 
                  className="btn" 
                  style={{ background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', width: window.innerWidth < 768 ? '100%' : 'auto' }} 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este procedimento?')) {
                      deleteProcedure(editingProcedure.id);
                      setShowModal(false);
                    }
                  }}
                >
                  <Trash2 size={16} /> Excluir
                </button>
              )}
              <div style={{ 
                display: 'flex', 
                flexDirection: window.innerWidth < 768 ? 'column-reverse' : 'row',
                gap: 12, 
                marginLeft: 'auto',
                width: window.innerWidth < 768 ? '100%' : 'auto'
              }}>
                <button className="btn" style={{ background: '#f0f2f5', width: window.innerWidth < 768 ? '100%' : 'auto' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ width: window.innerWidth < 768 ? '100%' : 'auto' }} onClick={submit}>
                  {editingProcedure ? 'Salvar Alterações' : 'Criar Procedimento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
