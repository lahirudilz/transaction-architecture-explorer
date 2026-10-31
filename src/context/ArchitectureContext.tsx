import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ArchitectureContextType {
  activeFlow: string;
  setActiveFlow: (flow: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  highlightedNodeId: string | null;
  setHighlightedNodeId: (id: string | null) => void;
  selectedVersion: string;
  setSelectedVersion: (v: string) => void;
}

const ArchitectureContext = createContext<ArchitectureContextType | null>(null);

export function ArchitectureProvider({ children }: { children: ReactNode }) {
  const [activeFlow, setActiveFlow] = useState('send-money-bank-v1');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('V1');

  return (
    <ArchitectureContext.Provider
      value={{
        activeFlow,
        setActiveFlow,
        searchQuery,
        setSearchQuery,
        highlightedNodeId,
        setHighlightedNodeId,
        selectedVersion,
        setSelectedVersion,
      }}
    >
      {children}
    </ArchitectureContext.Provider>
  );
}

export function useArchitecture() {
  const ctx = useContext(ArchitectureContext);
  if (!ctx) throw new Error('useArchitecture must be used within ArchitectureProvider');
  return ctx;
}
