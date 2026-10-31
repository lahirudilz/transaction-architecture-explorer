import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Globe,
  Radio,
  Workflow,
  AlertOctagon,
  BookOpen,
  ChevronDown,
  ChevronRight,
  GitCommit,
  Layers,
  FolderKanban,
  FileCode2,
} from 'lucide-react';
import { DOMAINS } from '@/data/domains';

export function Sidebar() {
  const [workflowsExpanded, setWorkflowsExpanded] = useState(true);
  const [domainsExpanded, setDomainsExpanded] = useState(false);

  const customerDomain = DOMAINS.find((d) => d.id === 'customer-transactions-domain');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <GitCommit size={18} style={{ color: '#38bdf8' }} />
        <div>
          <div className="sidebar-header-title">Fintech Architecture</div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Microservices Migration</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Overview</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              end
            >
              <LayoutDashboard size={16} />
              <span>Dashboard Overview</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="sidebar-divider" />

      {/* Customer Transactions Domain Workflows (from screenshot 2) */}
      <div className="sidebar-section">
        <div
          className="sidebar-section-title"
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setWorkflowsExpanded(!workflowsExpanded)}
        >
          <span>Customer Txn Workflows</span>
          {workflowsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        {workflowsExpanded && customerDomain && (
          <div className="sidebar-sub-items" style={{ paddingLeft: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {/* Active Implemented Workflow */}
            <NavLink
              to="/flow/send-money-bank-v1"
              className={({ isActive }) => `sidebar-sub-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#22c55e', fontSize: '12px' }}>✓</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Send Money - V1 (Bank only)</span>
              </div>
              <span className="validation-badge confirmed" style={{ fontSize: '8px', padding: '1px 4px' }}>
                Active
              </span>
            </NavLink>

            <NavLink
              to="/flow/send-money-bank-v1/sequence"
              className={({ isActive }) => `sidebar-sub-item ${isActive ? 'active' : ''}`}
            >
              <span style={{ paddingLeft: '14px', fontSize: '11px', color: '#93c5fd' }}>
                ↳ 10-Step Sequence View
              </span>
            </NavLink>

            {/* Other Workflows from customer_transactions_domain.drawio */}
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>Send Money - V2 (Bank & Cards)</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>Make Payment</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>Make Payment to External Merchant?</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>Send Anyone - Reversal</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>Record Rollback</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>Exception_handler</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>Create Customer Payment Reference</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>PR_REFERENCE Kafka Consumer</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>VOID_PAYMENT</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>REVERSE CUSTOMER PAYMENT</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
            <div className="sidebar-sub-item" style={{ opacity: 0.65 }}>
              <span>CT_TRANSACTION consumer ...</span>
              <span className="sidebar-planned-badge">Planned</span>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* Migrated Domains Catalog (from screenshot 1) */}
      <div className="sidebar-section">
        <div
          className="sidebar-section-title"
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setDomainsExpanded(!domainsExpanded)}
        >
          <span>Migrated Domains ({DOMAINS.length})</span>
          {domainsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        {domainsExpanded && (
          <div className="sidebar-sub-items" style={{ paddingLeft: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {DOMAINS.map((dom) => (
              <div
                key={dom.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 6px',
                  fontSize: '11px',
                  color: dom.id === 'customer-transactions-domain' ? '#38bdf8' : '#94a3b8',
                }}
              >
                <FileCode2 size={11} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {dom.drawioFile}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* Cross-Cutting Architectural Layers */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Architecture Catalog</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/microservices"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Server size={16} />
              <span>Microservices</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/api-integrations"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Globe size={16} />
              <span>API Integrations</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/kafka-events"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Radio size={16} />
              <span>Kafka Topics (CT, TP, NOTIFY)</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/status-lifecycle"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Workflow size={16} />
              <span>Status Lifecycle</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/failure-scenarios"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <AlertOctagon size={16} />
              <span>Failure Scenarios</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/documentation"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={16} />
              <span>Domain Docs & Draw.io</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: 'auto', padding: '14px 16px', fontSize: '10px', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>Domain: customer_transactions</div>
        <div>Workflow: Send Money V1</div>
      </div>
    </aside>
  );
}
