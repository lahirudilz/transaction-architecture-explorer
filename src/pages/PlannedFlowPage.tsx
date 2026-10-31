import React from 'react';
import { Clock, Calendar, ArrowRight, ShieldCheck, GitPullRequest } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlannedFlowProps {
  flowName: string;
  domain: string;
  targetQuarter: string;
  description: string;
}

export function PlannedFlowPage({ flowName, domain, targetQuarter, description }: PlannedFlowProps) {
  return (
    <div className="page-container app-content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="sidebar-planned-badge" style={{ fontSize: '11px', padding: '2px 8px', background: '#f1f5f9', color: '#64748b' }}>
              Planned Roadmap
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Domain: {domain}</span>
          </div>
          <h1 className="page-title">{flowName}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
      </div>

      <div className="placeholder-section">
        <Clock size={48} className="placeholder-icon" />
        <h3 className="placeholder-title">Workflow Architecture Modeling in Progress</h3>
        <p className="placeholder-text">
          This transaction flow is scheduled for formal decomposition in <strong>{targetQuarter}</strong> as part of the monolithic unbundling roadmap.
        </p>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to="/flow/send-money-bank-v1" className="flow-toolbar-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Explore Active Flow: Send Money – V1</span>
            <ArrowRight size={14} />
          </Link>
          <Link to="/" className="flow-toolbar-btn">
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
