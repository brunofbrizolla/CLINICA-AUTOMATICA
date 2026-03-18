import React, { useState } from 'react';
import { useCrm, Lead, LeadStatus } from '../store/CrmContext';
import { useAgenda } from '../store/AgendaContext';
import { Plus, Phone, X, Trash2, History, Mail, Calendar, Pencil, Info } from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader';

export const CRM: React.FC = () => {
  const { leads, addLead, deleteLead, updateLead } = useCrm();
  const { events } = useAgenda();
  
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLeadForHistory, setSelectedLeadForHistory] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form states
  const [leadForm, setLeadForm] = useState({ 
    id: '', 
    name: '', 
    phone: '', 
    email: '', 
    lastMessage: '', 
    status: 'new' as LeadStatus 
  });

  const openAddModal = () => {
    setEditingLead(null);
    setLeadForm({ id: '', name: '', phone: '', email: '', lastMessage: '', status: 'new' });
    setShowLeadModal(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setLeadForm({ 
      id: lead.id, 
      name: lead.name, 
      phone: lead.phone, 
      email: lead.email || '', 
      lastMessage: lead.lastMessage || '', 
      status: lead.status 
    });
    setShowLeadModal(true);
  };

  const submitLead = () => {
    if (leadForm.name && leadForm.phone) {
      if (editingLead) {
        updateLead(editingLead.id, {
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          lastMessage: leadForm.lastMessage,
          status: leadForm.status
        });
      } else {
        addLead({
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          lastMessage: leadForm.lastMessage || 'Adicionado pela equipe',
          status: 'new',
          treatments: []
        });
      }
      setShowLeadModal(false);
    }
  };

  return (
    <div className="crm-layout">
      <PageHeader 
        title="Gestão de Pacientes" 
        description="Aqui é onde os novos clientes e os antigos são registrados. Você pode adicionar pacientes manualmente também."
        actions={
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} /> Adicionar Paciente
          </button>
        }
      />

      <div className="crm-content" style={{ padding: '32px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #e1e4e8' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px', color: '#586069' }}>Nome do Cliente</th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#586069' }}>Contato</th>
                <th style={{ textAlign: 'right', padding: '16px', color: '#586069' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{lead.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} color="#6a737d" /> {lead.phone}
                      </span>
                      {lead.email && (
                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={14} color="#6a737d" /> {lead.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button 
                        className="action-btn" 
                        title="Editar"
                        onClick={() => openEditModal(lead)}
                        style={{ color: '#1a73e8' }}
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        className="action-btn" 
                        title="Ver Histórico"
                        onClick={() => setSelectedLeadForHistory(lead)}
                      >
                        <History size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6a737d' }}>
              Nenhum cliente cadastrado.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      {showLeadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingLead ? 'Editar Paciente' : 'Novo Paciente / Lead'}</h3>
              <button className="btn-close" onClick={() => setShowLeadModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="form-group">
              <label>Nome Completo</label>
              <input className="form-control" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Telefone / WhatsApp</label>
                <input className="form-control" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} />
              </div>
              <div>
                <label>E-mail (Opcional)</label>
                <input className="form-control" type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} />
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 768 ? 'column-reverse' : 'row',
              justifyContent: 'space-between', 
              marginTop: 24, 
              gap: 12 
            }}>
              {editingLead && (
                <button 
                  className="btn" 
                  style={{ background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', width: window.innerWidth < 768 ? '100%' : 'auto' }} 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
                      deleteLead(editingLead.id);
                      setShowLeadModal(false);
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
                <button className="btn" style={{ background: '#f0f2f5', width: window.innerWidth < 768 ? '100%' : 'auto' }} onClick={() => setShowLeadModal(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ width: window.innerWidth < 768 ? '100%' : 'auto' }} onClick={submitLead}>{editingLead ? 'Salvar Alterações' : 'Salvar Paciente'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History & Treatments Modal */}
      {selectedLeadForHistory && (
        <div className="modal-overlay" onClick={() => setSelectedLeadForHistory(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <h3 className="modal-title">Histórico: {selectedLeadForHistory.name}</h3>
              <button className="btn-close" onClick={() => setSelectedLeadForHistory(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#24292e' }}>Tratamentos Confirmados (Agenda):</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {(() => {
                    const now = new Date();
                    const pastEvents = events.filter(ev => 
                      (ev.leadId === selectedLeadForHistory.id || ev.patientName === selectedLeadForHistory.name) &&
                      new Date(ev.start) <= now
                    );

                    if (pastEvents.length > 0) {
                      return pastEvents.map((ev, idx) => (
                        <div key={idx} style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ background: '#e6fffa', padding: '8px', borderRadius: '8px' }}>
                            <Calendar size={18} color="#047481" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#24292e' }}>{ev.procedure}</div>
                            <div style={{ fontSize: '11px', color: '#6a737d' }}>{new Date(ev.start).toLocaleDateString('pt-BR')} • {ev.specialistName}</div>
                          </div>
                        </div>
                      ));
                    }
                    return <span style={{ color: '#959da5', fontSize: 13, fontStyle: 'italic' }}>Nenhum procedimento realizado encontrado.</span>
                  })()}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#24292e' }}>Linha do Tempo:</h4>
                <div className="history-timeline" style={{ maxHeight: 200, overflowY: 'auto', padding: '10px 0' }}>
                  {leads.find(l => l.id === selectedLeadForHistory.id)?.history.length ? (
                    leads.find(l => l.id === selectedLeadForHistory.id)!.history.slice().reverse().map(entry => (
                      <div key={entry.id} style={{ borderLeft: '2px solid #e1e4e8', marginLeft: 12, paddingLeft: 20, marginBottom: 15, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: -7, top: 0, width: 12, height: 12, background: 'var(--wa-green)', borderRadius: '50%' }}></div>
                        <div style={{ fontSize: 11, color: '#6a737d' }}>{new Date(entry.date).toLocaleString('pt-BR')}</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{entry.action}</div>
                        {entry.note && <div style={{ fontSize: 13, color: '#586069' }}>{entry.note}</div>}
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#6a737d' }}>Sem registros.</div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-primary" onClick={() => setSelectedLeadForHistory(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
