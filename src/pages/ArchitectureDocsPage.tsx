import React, { useState } from 'react';
import { BookOpen, FileText, AlertTriangle, CheckCircle2, ShieldCheck, Image as ImageIcon, ExternalLink, FolderKanban, Server } from 'lucide-react';
import { DOMAINS } from '@/data/domains';

export function ArchitectureDocsPage() {
  const [activeDoc, setActiveDoc] = useState<'overview' | 'domains' | 'workflow-steps' | 'assumptions' | 'source-image'>('workflow-steps');

  return (
    <div className="page-container app-content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="validation-badge confirmed">Microservices Architecture</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Monolith Migration Portfolio</span>
          </div>
          <h1 className="page-title">Architecture Documentation & Domain Portfolio</h1>
          <p className="page-subtitle">
            Domain breakdown, microservices connections, Draw.io specifications, and the Send Money V1 10-step lifecycle.
          </p>
        </div>
      </div>

      {/* Doc selection tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeDoc === 'workflow-steps' ? 'active' : ''}`}
          onClick={() => setActiveDoc('workflow-steps')}
        >
          Send Money V1: 10 Microservice Steps
        </button>
        <button
          className={`tab ${activeDoc === 'domains' ? 'active' : ''}`}
          onClick={() => setActiveDoc('domains')}
        >
          Migrated Domains Catalog (Draw.io)
        </button>
        <button
          className={`tab ${activeDoc === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveDoc('overview')}
        >
          Architecture Topology Overview
        </button>
        <button
          className={`tab ${activeDoc === 'assumptions' ? 'active' : ''}`}
          onClick={() => setActiveDoc('assumptions')}
        >
          Kafka & Status Assumptions Log
        </button>
        <button
          className={`tab ${activeDoc === 'source-image' ? 'active' : ''}`}
          onClick={() => setActiveDoc('source-image')}
        >
          Canonical Draw.io Diagram
        </button>
      </div>

      {/* DOC: 10 MICROSERVICE STEPS */}
      {activeDoc === 'workflow-steps' && (
        <div className="card" style={{ lineHeight: 1.6 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
            Send Money – V1 (Bank Only): 10 Microservice Connection Steps
          </h2>
          <p style={{ marginBottom: '16px', color: '#334155' }}>
            Rather than copying the flat legacy monolithic diagram, the application structures the exact 10 decoupled microservice interactions:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
              <strong style={{ color: '#1e40af' }}>1. Mobile calling /send-money</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Client invokes <code>POST /customer-transactions/send-money</code> in <strong>customer-transaction service</strong>. A transaction record is created with initial status <code>NEW</code>.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #0ea5e9' }}>
              <strong style={{ color: '#0369a1' }}>2. Obtain ct_transaction_reference from ipay-core</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Customer Transaction Service invokes the <strong>ipay-core Service</strong> to evaluate velocity/KYC limits and generate a unique tracking reference (<code>ct_transaction_reference</code>).
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #0ea5e9' }}>
              <strong style={{ color: '#0369a1' }}>3. Contact route-optimizer</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Customer Transaction Service invokes the <strong>route-optimizer Service</strong> to determine the optimal clearing rail and partner bank routing parameters.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
              <strong style={{ color: '#b91c1c' }}>4. Update record status = DECLINED & Publish CT_TRANSACTION</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                If business validation or route checks fail: DB record is updated to <code>DECLINED</code>, and an event is published to the <strong><code>CT_TRANSACTION</code></strong> Kafka topic.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #0284c7' }}>
              <strong style={{ color: '#0369a1' }}>5. Update record status = IN_PROGRESS & Publish CT_TRANSACTION</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                If validation succeeds: DB record is updated to <code>IN_PROGRESS</code>, and a status update is published to the <strong><code>CT_TRANSACTION</code></strong> Kafka topic.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #8b5cf6' }}>
              <strong style={{ color: '#6d28d9' }}>6. Submit PULL segment to transaction engine asynchronously</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Customer Transaction Service calls the <strong>/transaction-processor Service</strong> to process the payment. The transaction-processor routes the instruction to the relevant <strong>Payment Gateway (BANK or CARD)</strong>.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ color: '#b45309' }}>7. Listen for INSTRUCTION_ACCEPTED on TP_TRANSACTION Kafka Consumer</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Customer Transaction Service listens to transaction engine updates via the <strong><code>TP_TRANSACTION</code></strong> Kafka consumer for status = <code>INSTRUCTION_ACCEPTED</code> (or <code>INSTRUCTION_REJECTED</code> / <code>INSTRUCTION_TIMEOUT</code> on error).
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
              <strong style={{ color: '#047857' }}>8. Update ipay account</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Customer Transaction Service calls the <strong>ipay-account Service</strong> to debit user balances and update internal wallet ledger accounts.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #a855f7' }}>
              <strong style={{ color: '#7e22ce' }}>9. No status change & Notify App (Push)</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Customer Transaction Service publishes an in-flight message to the <strong><code>NOTIFY</code></strong> Kafka topic; <strong>notify-service</strong> consumes it and issues a real-time push notification to the mobile app without modifying state.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #15803d' }}>
              <strong style={{ color: '#15803d' }}>10. Update record status = COMPLETED & Notify App (Push)</strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Final stage: DB record updated to status = <code>COMPLETED</code>; a completion message is published to the <strong><code>NOTIFY</code></strong> Kafka topic, and <strong>notify-service</strong> delivers the final success confirmation push alert to the mobile app.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOC: DOMAINS CATALOG */}
      {activeDoc === 'domains' && (
        <div className="card" style={{ lineHeight: 1.6 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
            Migrated Domains Portfolio (Draw.io Sources)
          </h2>
          <p style={{ marginBottom: '16px', color: '#334155' }}>
            The enterprise system is divided into domain models defined across Draw.io files:
          </p>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Domain Name</th>
                  <th>Source Draw.io File</th>
                  <th>Workflows</th>
                  <th>Migration Status</th>
                  <th>Business Description</th>
                </tr>
              </thead>
              <tbody>
                {DOMAINS.map((dom) => (
                  <tr key={dom.id}>
                    <td><strong>{dom.name}</strong></td>
                    <td><code style={{ fontSize: '11px' }}>{dom.drawioFile}</code></td>
                    <td>{dom.workflowsCount} workflows</td>
                    <td>
                      <span className={`validation-badge ${dom.status === 'migrated' ? 'confirmed' : 'needs-validation'}`}>
                        {dom.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{dom.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOC: OVERVIEW */}
      {activeDoc === 'overview' && (
        <div className="card" style={{ lineHeight: 1.6 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
            Microservices Architecture Topology
          </h2>
          <p style={{ marginBottom: '14px', color: '#334155' }}>
            The target architecture avoids the monolith pitfalls by enforcing clear boundaries between services:
          </p>
          <ul style={{ paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Decoupled Orchestration:</strong> <code>customer-transaction-service</code> manages status but delegates reference generation to <code>ipay-core</code> and routing to <code>route-optimizer</code>.</li>
            <li><strong>Asynchronous Payment Processing:</strong> <code>transaction-processor</code> executes PULL segments against external Bank/Card payment gateways and communicates asynchronously via Kafka <code>TP_TRANSACTION</code>.</li>
            <li><strong>Event-Driven Notifications:</strong> <code>notify-service</code> isolates push notification delivery via Kafka <code>NOTIFY</code> so customer mobile notifications never block transaction clearing.</li>
          </ul>
        </div>
      )}

      {/* DOC: ASSUMPTIONS */}
      {activeDoc === 'assumptions' && (
        <div className="card" style={{ lineHeight: 1.6 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
            Kafka Topics & Status Mapping Assumptions
          </h2>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Producer</th>
                  <th>Consumer</th>
                  <th>Confirmed Statuses</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>CT_TRANSACTION</code></td>
                  <td>Customer Transaction Service</td>
                  <td>Audit / Analytics</td>
                  <td><code>DECLINED</code>, <code>IN_PROGRESS</code></td>
                </tr>
                <tr>
                  <td><code>TP_TRANSACTION</code></td>
                  <td>transaction-processor</td>
                  <td>Customer Transaction Service</td>
                  <td><code>INSTRUCTION_ACCEPTED</code>, <code>INSTRUCTION_REJECTED</code>, <code>INSTRUCTION_TIMEOUT</code></td>
                </tr>
                <tr>
                  <td><code>NOTIFY</code></td>
                  <td>Customer Transaction Service</td>
                  <td>notify-service</td>
                  <td>In-flight push alert, <code>COMPLETED</code> final push alert</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOC: SOURCE IMAGE */}
      {activeDoc === 'source-image' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Canonical Draw.io Workflow Export</h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>docs/source/send-money-bank-v1.png</span>
            </div>
            <a
              href="/docs/source/send-money-bank-v1.png"
              target="_blank"
              rel="noreferrer"
              className="flow-toolbar-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={14} />
              <span>Open Full Image</span>
            </a>
          </div>

          <div
            style={{
              padding: '16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflowX: 'auto',
              textAlign: 'center',
            }}
          >
            <img
              src="/docs/source/send-money-bank-v1.png"
              alt="Send Money V1 Draw.io"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
