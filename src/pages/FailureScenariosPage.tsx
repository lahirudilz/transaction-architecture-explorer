import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Server,
  Layers,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { failureScenarios } from '@/data/send-money-flow';

export function FailureScenariosPage() {
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'terminal' | 'uncertain'>('all');

  const filteredScenarios = failureScenarios.filter((sc) => {
    if (filterOutcome === 'all') return true;
    if (filterOutcome === 'terminal') {
      return sc.resultingState === 'REJECTED' || sc.resultingState === 'INSTRUCTION_REJECTED';
    }
    if (filterOutcome === 'uncertain') {
      return sc.resultingState === 'INSTRUCTION_TIMEOUT' || sc.resultingState === 'Needs Validation';
    }
    return true;
  });

  return (
    <div className="page-container app-content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="validation-badge needs-validation">Resilience & Exception Handling</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Error Domain Matrix</span>
          </div>
          <h1 className="page-title">Failure Scenarios & Compensation</h1>
          <p className="page-subtitle">
            Systemic error modes, timeout boundaries, fallback recovery, and reconciliation behavior across the Send Money lifecycle.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`flow-toolbar-btn ${filterOutcome === 'all' ? 'active' : ''}`}
            onClick={() => setFilterOutcome('all')}
          >
            All Error Modes ({failureScenarios.length})
          </button>
          <button
            className={`flow-toolbar-btn ${filterOutcome === 'terminal' ? 'active' : ''}`}
            onClick={() => setFilterOutcome('terminal')}
          >
            Confirmed Terminal Failures
          </button>
          <button
            className={`flow-toolbar-btn ${filterOutcome === 'uncertain' ? 'active' : ''}`}
            onClick={() => setFilterOutcome('uncertain')}
          >
            Uncertain / Timeout Outcomes
          </button>
        </div>
      </div>

      {/* Warning banner about uncertain outcomes */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          padding: '14px 18px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
          <strong>Distinction Between Terminal Failures and Uncertain States:</strong>
          <br />
          In financial microservices, a network timeout (such as <code>INSTRUCTION_TIMEOUT</code>) does <em>not</em> mean the transaction failed—funds may have been debited at the partner bank. Such states require automated reconciliation or manual operations intervention rather than blind retries.
        </div>
      </div>

      {/* Grid of Failure Scenarios */}
      <div className="card-grid">
        {filteredScenarios.map((sc) => {
          const isUncertain = sc.resultingState === 'INSTRUCTION_TIMEOUT' || sc.resultingState === 'Needs Validation';

          return (
            <div
              key={sc.id}
              className="card"
              style={{
                borderLeft: isUncertain ? '4px solid #f59e0b' : '4px solid #ef4444',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="card-header" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isUncertain ? (
                    <HelpCircle size={18} color="#d97706" />
                  ) : (
                    <AlertOctagon size={18} color="#dc2626" />
                  )}
                  <h3 className="card-title" style={{ fontSize: '14px' }}>{sc.name}</h3>
                </div>
                <span className={`validation-badge ${sc.validationStatus}`} style={{ fontSize: '9px' }}>
                  {sc.validationStatus === 'confirmed' ? 'Confirmed' : 'Needs Validation'}
                </span>
              </div>

              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px', lineHeight: 1.4 }}>
                {sc.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', marginTop: 'auto' }}>
                <div className="details-field">
                  <span className="details-field-label">Failure Origin Location</span>
                  <span className="details-field-value mono">{sc.failureLocation}</span>
                </div>

                <div className="details-field">
                  <span className="details-field-label">Affected Microservices</span>
                  <div className="details-tag-list">
                    {sc.affectedServices.map((svc, i) => (
                      <span key={i} className="details-tag">{svc}</span>
                    ))}
                  </div>
                </div>

                <div className="details-field">
                  <span className="details-field-label">Resulting Lifecycle State</span>
                  <span
                    className="details-field-value font-semibold"
                    style={{
                      color: isUncertain ? '#b45309' : '#dc2626',
                    }}
                  >
                    {sc.resultingState}
                  </span>
                </div>

                <div className="details-field">
                  <span className="details-field-label">Retry Mechanism</span>
                  <span className="details-field-value">{sc.retryMechanism}</span>
                </div>

                <div className="details-field">
                  <span className="details-field-label">Automated Recovery / Reversal</span>
                  <span className="details-field-value font-medium" style={{ color: '#1e293b' }}>
                    {sc.recoveryAction}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
