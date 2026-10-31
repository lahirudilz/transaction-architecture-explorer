import React from 'react';
import { Layers, Search, ShieldCheck, User } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';

export function TopNav() {
  const { searchQuery, setSearchQuery, selectedVersion, setSelectedVersion } = useArchitecture();

  return (
    <header className="topnav">
      <div className="topnav-brand">
        <Layers size={20} />
        <span>Transaction Architecture Explorer</span>
      </div>

      <div className="topnav-search">
        <Search size={16} className="topnav-search-icon" />
        <input
          type="text"
          placeholder="Search microservices, APIs, Kafka topics, nodes, or states..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="topnav-actions">
        <select
          className="topnav-version-select"
          value={selectedVersion}
          onChange={(e) => setSelectedVersion(e.target.value)}
          title="Architecture Version"
        >
          <option value="V1">Architecture: V1 (Current Transition)</option>
          <option value="V2" disabled>Architecture: V2 (Planned)</option>
        </select>

        <span className="topnav-badge">
          <ShieldCheck size={13} />
          Internal Fintech Architecture
        </span>

        <div className="topnav-avatar" title="Architect / Engineer User">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
