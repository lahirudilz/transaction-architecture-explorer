import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  GitBranch,
  Server,
  Globe,
  Radio,
  Workflow,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  FolderKanban,
  FileCode2,
} from 'lucide-react';
import { services } from '@/data/services';
import { sendMoneyNodes, sendMoneyEdges, kafkaTopics, stateTransitions, failureScenarios } from '@/data/send-money-flow';
import { DOMAINS } from '@/data/domains';

export function OverviewPage() {
  return (
    <div className="page-container app-content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaction Architecture Explorer</h1>
          <p className="page-subtitle">
            Enterprise microservices topology & domain migration hub for fintech payment processing.
          </p>
        </div>
        <span className="validation-badge confirmed">
          <ShieldCheck size={14} /> Migration Phase: Monolith to Microservices
        </span>
      </div>

      {/* High-level stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <FolderKanban size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{DOMAINS.length}</div>
            <div className="stat-label">Migrated Domains (Draw.io)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Server size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{services.length}</div>
            <div className="stat-label">Active Microservices</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Radio size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">3</div>
            <div className="stat-label">Kafka Topics (CT, TP, NOTIFY)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfeff', color: '#06b6d4' }}>
            <Workflow size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">10</div>
            <div className="stat-label">Microservice Workflow Steps</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <AlertOctagon size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{failureScenarios.length}</div>
            <div className="stat-label">Resilience Error Modes</div>
          </div>
        </div>
      </div>

      {/* Featured Primary Flow: Send Money V1 (Bank Only) */}
      <div className="card" style={{ marginBottom: '32px', borderLeft: '4px solid #2563eb' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="validation-badge confirmed">Migrated Production Workflow</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Domain: customer_transactions_domain.drawio</span>
            </div>
            <h2 className="card-title" style={{ fontSize: '18px' }}>Send Money – V1 (Bank Only)</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Interconnected microservices architecture connecting Mobile App, customer-transaction service, ipay-core, route-optimizer, transaction-processor, Payment Gateway (BANK or CARD), ipay-account, and notify-service via CT_TRANSACTION, TP_TRANSACTION, and NOTIFY Kafka topics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/flow/send-money-bank-v1" className="flow-toolbar-btn active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Interactive Graph & Stepper</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/flow/send-money-bank-v1/sequence" className="flow-toolbar-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>10-Step Sequence View</span>
            </Link>
          </div>
        </div>

        {/* The 10 Steps Summary */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            The 10 End-to-End Microservice Connection Steps
          </div>
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#1e40af' }}>1. Mobile /send-money Call</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Calls customer-transaction service (status = NEW)</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#1e40af' }}>2. Obtain ct_transaction_reference</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Calls ipay-core Service for limits & reference</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#1e40af' }}>3. Contact Route Optimizer</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Calls route-optimizer Service for payment rail</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#dc2626' }}>4. Update DECLINED & Publish</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Publishes status = DECLINED to CT_TRANSACTION</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#0284c7' }}>5. Update IN_PROGRESS & Publish</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Publishes status = IN_PROGRESS to CT_TRANSACTION</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#6d28d9' }}>6. Submit PULL Segment</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Calls /transaction-processor to reach Payment Gateway</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#b45309' }}>7. Listen on TP_TRANSACTION</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Consumer receives INSTRUCTION_ACCEPTED</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#047857' }}>8. Update ipay-account</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Calls ipay-account Service to debit wallet balance</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#7e22ce' }}>9. No Status Change & Push</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Publishes to NOTIFY topic; notify-service alerts App</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#15803d' }}>10. Update COMPLETED & Final Push</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Publishes to NOTIFY topic; notify-service alerts App</div>
            </div>
          </div>
        </div>
      </div>

      {/* Migrated Domains Grid */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Fintech Architecture Domains Portfolio</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Architecture domains transitioning from the legacy monolithic codebase into microservices.
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Domain Name</th>
                <th>Draw.io File Source</th>
                <th>Workflows Count</th>
                <th>Status</th>
                <th>Key Microservices</th>
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((dom) => (
                <tr key={dom.id}>
                  <td>
                    <strong>{dom.name}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: '11px', color: '#2563eb' }}>{dom.drawioFile}</code>
                  </td>
                  <td>{dom.workflowsCount} workflows</td>
                  <td>
                    <span className={`validation-badge ${dom.status === 'migrated' ? 'confirmed' : 'needs-validation'}`}>
                      {dom.status === 'migrated' ? 'Migrated V1' : 'In Progress'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>
                    {dom.id === 'customer-transactions-domain'
                      ? 'customer-transaction-service, route-optimizer'
                      : dom.id === 'ipay-account-domain'
                      ? 'ipay-account-service'
                      : dom.id === 'ipg-domain'
                      ? 'transaction-processor, payment-gateway'
                      : 'Specialized domain microservices'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
