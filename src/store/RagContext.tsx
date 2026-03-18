import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RagEntry, initialRagKnowledge } from './mockKnowledge';

interface RagContextType {
  knowledgeBase: RagEntry[];
  addEntry: (entry: Omit<RagEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Omit<RagEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  findResponse: (userInput: string) => RagEntry | null;
}

const RagContext = createContext<RagContextType | undefined>(undefined);

export const RagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [knowledgeBase, setKnowledgeBase] = useState<RagEntry[]>(initialRagKnowledge);

  const addEntry = (entry: Omit<RagEntry, 'id'>) => {
    setKnowledgeBase(prev => [...prev, { ...entry, id: Date.now().toString() }]);
  };

  const updateEntry = (id: string, updatedEntry: Omit<RagEntry, 'id'>) => {
    setKnowledgeBase(prev => 
      prev.map(item => item.id === id ? { ...updatedEntry, id } : item)
    );
  };

  const deleteEntry = (id: string) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
  };

  // Simple keyword matching (mocking a Vector DB / LLM)
  const findResponse = (userInput: string): RagEntry | null => {
    const normalizedInput = userInput.toLowerCase();
    
    // Exact match or contains phrase
    const match = knowledgeBase.find(entry => 
      normalizedInput.includes(entry.triggerPhrase.toLowerCase())
    );

    return match || null;
  };

  return (
    <RagContext.Provider value={{ knowledgeBase, addEntry, updateEntry, deleteEntry, findResponse }}>
      {children}
    </RagContext.Provider>
  );
};

export const useRag = () => {
  const context = useContext(RagContext);
  if (context === undefined) {
    throw new Error('useRag must be used within a RagProvider');
  }
  return context;
};
