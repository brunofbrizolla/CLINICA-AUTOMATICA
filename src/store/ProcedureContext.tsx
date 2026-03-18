import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Procedure {
  id: string;
  name: string;
  durationMinutes: number;
}

interface ProcedureContextType {
  procedures: Procedure[];
  addProcedure: (name: string, durationMinutes: number) => void;
  deleteProcedure: (id: string) => void;
  updateProcedure: (id: string, name: string, durationMinutes: number) => void;
}

const ProcedureContext = createContext<ProcedureContextType | undefined>(undefined);

export const ProcedureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    const { data, error } = await supabase.from('procedures').select('*');
    if (error) {
      console.error('Error fetching procedures:', error);
      return;
    }
    if (data) {
      setProcedures(data.map(d => ({
        id: d.id,
        name: d.name,
        durationMinutes: d.duration_minutes
      })));
    }
  };

  const addProcedure = async (name: string, durationMinutes: number) => {
    const { data, error } = await supabase
      .from('procedures')
      .insert([{ name, duration_minutes: durationMinutes }])
      .select();
      
    if (error) {
      console.error('Error adding procedure:', error);
      return;
    }
    if (data) {
      setProcedures(prev => [...prev, {
        id: data[0].id,
        name: data[0].name,
        durationMinutes: data[0].duration_minutes
      }]);
    }
  };

  const deleteProcedure = async (id: string) => {
    const { error } = await supabase.from('procedures').delete().eq('id', id);
    if (!error) {
      setProcedures(prev => prev.filter(p => p.id !== id));
    } else {
      console.error('Error deleting procedure:', error);
    }
  };

  const updateProcedure = async (id: string, name: string, durationMinutes: number) => {
    const { error } = await supabase
      .from('procedures')
      .update({ name, duration_minutes: durationMinutes })
      .eq('id', id);
      
    if (!error) {
      setProcedures(prev => prev.map(p => p.id === id ? { ...p, name, durationMinutes } : p));
    } else {
      console.error('Error updating procedure:', error);
    }
  };

  return (
    <ProcedureContext.Provider value={{ procedures, addProcedure, deleteProcedure, updateProcedure }}>
      {children}
    </ProcedureContext.Provider>
  );
};

export const useProcedures = () => {
  const context = useContext(ProcedureContext);
  if (!context) throw new Error('useProcedures must be used within ProcedureProvider');
  return context;
};
