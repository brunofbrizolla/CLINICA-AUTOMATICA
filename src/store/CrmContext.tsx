import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type LeadStatus = 'new' | 'in-progress' | 'scheduled' | 'completed';

export interface Specialist {
  id: string;
  name: string;
  role: string;
}

export interface HistoryEntry {
  id: string;
  leadId: string;
  date: Date;
  action: string;
  note?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: LeadStatus;
  lastMessage: string;
  createdAt: Date;
  specialistId?: string;
  history: HistoryEntry[];
  treatments: string[];
}

interface CrmContextType {
  leads: Lead[];
  specialists: Specialist[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'history'>) => Promise<void>;
  updateLeadStatus: (id: string, newStatus: LeadStatus) => Promise<void>;
  assignSpecialist: (leadId: string, specialistId: string) => Promise<void>;
  addSpecialist: (spec: Omit<Specialist, 'id'>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addHistoryEntry: (leadId: string, action: string, note?: string) => Promise<void>;
  addTreatment: (leadId: string, treatment: string) => Promise<void>;
  updateLead: (id: string, updatedData: Partial<Lead>) => Promise<void>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  useEffect(() => {
    fetchSpecialists();
    fetchLeads();
  }, []);

  const fetchSpecialists = async () => {
    const { data } = await supabase.from('crm_specialists').select('*');
    if (data) setSpecialists(data);
  };

  const fetchLeads = async () => {
    const { data: leadsData } = await supabase.from('crm_leads').select('*').order('created_at', { ascending: false });
    const { data: historyData } = await supabase.from('crm_history_entries').select('*').order('date', { ascending: true });
    
    if (leadsData) {
      const formattedLeads: Lead[] = leadsData.map(ld => {
        const leadHistory = historyData?.filter(h => h.lead_id === ld.id).map(h => ({
          id: h.id,
          leadId: h.lead_id,
          date: new Date(h.date),
          action: h.action,
          note: h.note
        })) || [];
        
        return {
          id: ld.id,
          name: ld.name,
          phone: ld.phone,
          email: ld.email,
          status: ld.status as LeadStatus,
          lastMessage: ld.last_message,
          createdAt: new Date(ld.created_at),
          specialistId: ld.specialist_id,
          treatments: ld.treatments || [],
          history: leadHistory
        };
      });
      setLeads(formattedLeads);
    }
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'history'>) => {
    const { data: newLeadDb } = await supabase.from('crm_leads').insert([{
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      status: leadData.status,
      last_message: leadData.lastMessage,
      specialist_id: leadData.specialistId,
      treatments: leadData.treatments || []
    }]).select();

    if (newLeadDb && newLeadDb.length > 0) {
      const leadId = newLeadDb[0].id;
      const { data: initialHistory } = await supabase.from('crm_history_entries').insert([{
        lead_id: leadId,
        action: 'Cadastro manual realizado'
      }]).select();

      const history: HistoryEntry[] = initialHistory ? initialHistory.map(h => ({
        id: h.id,
        leadId: h.lead_id,
        date: new Date(h.date),
        action: h.action,
        note: h.note
      })) : [];

      setLeads(prev => [{
        id: leadId,
        name: newLeadDb[0].name,
        phone: newLeadDb[0].phone,
        email: newLeadDb[0].email,
        status: newLeadDb[0].status as LeadStatus,
        lastMessage: newLeadDb[0].last_message,
        createdAt: new Date(newLeadDb[0].created_at),
        specialistId: newLeadDb[0].specialist_id,
        treatments: newLeadDb[0].treatments || [],
        history
      }, ...prev]);
    }
  };

  const deleteLead = async (id: string) => {
    await supabase.from('crm_leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const addHistoryEntry = async (leadId: string, action: string, note?: string) => {
    const { data } = await supabase.from('crm_history_entries').insert([{
      lead_id: leadId, action, note
    }]).select();

    if (data && data.length > 0) {
      const newEntry: HistoryEntry = {
        id: data[0].id,
        leadId: data[0].lead_id,
        date: new Date(data[0].date),
        action: data[0].action,
        note: data[0].note
      };
      
      setLeads(prev => prev.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, history: [...lead.history, newEntry] };
        }
        return lead;
      }));
    }
  };

  const addTreatment = async (leadId: string, treatment: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const updatedTreatments = [...(lead.treatments || []), treatment];
    await supabase.from('crm_leads').update({ treatments: updatedTreatments }).eq('id', leadId);
    
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, treatments: updatedTreatments };
      }
      return l;
    }));
    
    await addHistoryEntry(leadId, 'Procedimento Realizado', treatment);
  };

  const updateLeadStatus = async (id: string, newStatus: LeadStatus) => {
    await supabase.from('crm_leads').update({ status: newStatus }).eq('id', id);
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    await addHistoryEntry(id, `Status alterado para: ${newStatus}`);
  };

  const assignSpecialist = async (leadId: string, specialistId: string) => {
    await supabase.from('crm_leads').update({ specialist_id: specialistId }).eq('id', leadId);
    setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, specialistId } : lead));
  };

  const addSpecialist = async (specData: Omit<Specialist, 'id'>) => {
    const { data } = await supabase.from('crm_specialists').insert([specData]).select();
    if (data && data.length > 0) {
      setSpecialists(prev => [...prev, data[0]]);
    }
  };

  const updateLead = async (id: string, updatedData: Partial<Lead>) => {
    const dbUpdate: any = {};
    if (updatedData.name !== undefined) dbUpdate.name = updatedData.name;
    if (updatedData.phone !== undefined) dbUpdate.phone = updatedData.phone;
    if (updatedData.email !== undefined) dbUpdate.email = updatedData.email;
    if (updatedData.status !== undefined) dbUpdate.status = updatedData.status;
    if (updatedData.lastMessage !== undefined) dbUpdate.last_message = updatedData.lastMessage;
    if (updatedData.specialistId !== undefined) dbUpdate.specialist_id = updatedData.specialistId;
    if (updatedData.treatments !== undefined) dbUpdate.treatments = updatedData.treatments;

    await supabase.from('crm_leads').update(dbUpdate).eq('id', id);
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...updatedData } : lead));
  };

  return (
    <CrmContext.Provider value={{ leads, specialists, addLead, updateLead, updateLeadStatus, assignSpecialist, addSpecialist, deleteLead, addHistoryEntry, addTreatment }}>
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
