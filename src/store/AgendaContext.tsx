import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CalendarEvent {
  id: string;
  title: string;
  patientName: string;
  specialistName: string;
  procedure: string;
  value: string;
  whatsapp: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  leadId?: string;
  resource?: any;
}

interface AgendaContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (id: string, updatedEvent: Partial<CalendarEvent>) => Promise<void>;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const AgendaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('agenda_events').select('*');
    if (data) {
      setEvents(data.map(d => ({
        id: d.id,
        title: d.title,
        patientName: d.patient_name,
        specialistName: d.specialist_name,
        procedure: d.procedure,
        value: d.value,
        whatsapp: d.whatsapp,
        start: new Date(d.start_time),
        end: new Date(d.end_time),
        allDay: d.all_day,
        leadId: d.lead_id
      })));
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    const { data } = await supabase.from('agenda_events').insert([{
      title: event.title,
      patient_name: event.patientName,
      specialist_name: event.specialistName,
      procedure: event.procedure,
      value: event.value,
      whatsapp: event.whatsapp,
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      all_day: event.allDay || false,
      lead_id: event.leadId
    }]).select();

    if (data && data.length > 0) {
      const d = data[0];
      setEvents(prev => [...prev, {
        id: d.id,
        title: d.title,
        patientName: d.patient_name,
        specialistName: d.specialist_name,
        procedure: d.procedure,
        value: d.value,
        whatsapp: d.whatsapp,
        start: new Date(d.start_time),
        end: new Date(d.end_time),
        allDay: d.all_day,
        leadId: d.lead_id
      }]);
    }
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('agenda_events').delete().eq('id', id);
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateEvent = async (id: string, updatedEvent: Partial<CalendarEvent>) => {
    const updatePayload: any = {};
    if (updatedEvent.title !== undefined) updatePayload.title = updatedEvent.title;
    if (updatedEvent.patientName !== undefined) updatePayload.patient_name = updatedEvent.patientName;
    if (updatedEvent.specialistName !== undefined) updatePayload.specialist_name = updatedEvent.specialistName;
    if (updatedEvent.procedure !== undefined) updatePayload.procedure = updatedEvent.procedure;
    if (updatedEvent.value !== undefined) updatePayload.value = updatedEvent.value;
    if (updatedEvent.whatsapp !== undefined) updatePayload.whatsapp = updatedEvent.whatsapp;
    if (updatedEvent.start !== undefined) updatePayload.start_time = updatedEvent.start.toISOString();
    if (updatedEvent.end !== undefined) updatePayload.end_time = updatedEvent.end.toISOString();
    if (updatedEvent.allDay !== undefined) updatePayload.all_day = updatedEvent.allDay;
    if (updatedEvent.leadId !== undefined) updatePayload.lead_id = updatedEvent.leadId;

    await supabase.from('agenda_events').update(updatePayload).eq('id', id);
    setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...updatedEvent } : evt));
  };

  return (
    <AgendaContext.Provider value={{ events, addEvent, deleteEvent, updateEvent }}>
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = () => {
  const context = useContext(AgendaContext);
  if (context === undefined) {
    throw new Error('useAgenda deve ser usado dentro de um AgendaProvider');
  }
  return context;
};
