import React, { useState } from 'react';
import {
  ArrowRight,
  Server,
  Database,
  Radio,
  FileText,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import type { TransactionStatus } from '@/types/architecture';

interface StatusMetadata {
  status: string;
  label: string;
  level: 'ct' | 'segment';
  category: 'initial' | 'in-progress' | 'terminal-success' | 'terminal-failure' | 'ambiguous';
  color: string;
  bg: string;
  updatedBy: string;
  dbOperation: string;
  kafkaEvents: string[];
  associatedLogs: string;
  possibleNextStates: string[];
  retryRecovery: string;
}

const CT_STATUS_DETAILS: Record<string, StatusMetadata> = {
  NEW: {
    status: 'NEW',
    label: 'NEW',
    level: 'ct',
    category: 'initial',
    color: '#2563eb',
    bg: '#eff6ff',
    updatedBy: 'Customer Transaction Service',
    dbOperation: 'INSERT customer_transaction (status = NEW, created_at = NOW())',
    kafkaEvents: ['CT_TRANSACTION (status = NEW)'],
    associatedLogs: 'INFO: [CustomerTxSvc] POST /send-money received. CT record inserted with status = NEW.',
    possibleNextStates: ['IN_PROGRESS', 'DECLINED'],
    retryRecovery: 'Idempotency key enforced. Duplicate submissions return existing transaction reference.',
  },
  IN_PROGRESS: {
    status: 'IN_PROGRESS',
    label: 'IN_PROGRESS',
    level: 'ct',
    category: 'in-progress',
    color: '#0284c7',
    bg: '#f0f9ff',
    updatedBy: 'Customer Transaction Service',
    dbOperation: 'UPDATE customer_transaction SET status = IN_PROGRESS, ct_transaction_reference = :ref',
    kafkaEvents: ['CT_TRANSACTION (status = IN_PROGRESS)'],
    associatedLogs: 'INFO: [CustomerTxSvc] Validation passed. CT updated to IN_PROGRESS. PULL segment submitted.',
    possibleNextStates: ['FUNDS_SECURED', 'DECLINED'],
    retryRecovery: 'Customer Txn Service asynchronously submits PULL segment to transaction-processor.',
  },
  DECLINED: {
    status: 'DECLINED',
    label: 'DECLINED',
    level: 'ct',
    category: 'terminal-failure',
    color: '#dc2626',
    bg: '#fef2f2',
    updatedBy: 'Customer Transaction Service',
    dbOperation: 'UPDATE customer_transaction SET status = DECLINED, reason = :rejectionReason',
    kafkaEvents: ['CT_TRANSACTION (status = DECLINED)'],
    associatedLogs: 'WARN: [CustomerTxSvc] Limit / route check failed. CT set to DECLINED.',
    possibleNextStates: [],
    retryRecovery: 'Terminal. Published to CT_TRANSACTION. Mobile app receives rejection alert.',
  },
  FUNDS_SECURED: {
    status: 'FUNDS_SECURED',
    label: 'FUNDS_SECURED',
    level: 'ct',
    category: 'in-progress',
    color: '#0d9488',
    bg: '#f0fdfa',
    updatedBy: 'Customer Transaction Service (via TP_TRANSACTION Kafka Consumer)',
    dbOperation: 'UPDATE customer_transaction SET status = FUNDS_SECURED',
    kafkaEvents: ['CT_TRANSACTION (status = FUNDS_SECURED)'],
    associatedLogs:
      'INFO: [CustomerTxSvc] TP_TRANSACTION consumer: PULL segment INSTRUCTION_ACCEPTED. CT → FUNDS_SECURED. Submitting next segment.',
    possibleNextStates: ['COMPLETED'],
    retryRecovery:
      'Next segment (INTER_BANK or PUSH) is submitted to transaction-processor. ipay-account balance update triggered.',
  },
  COMPLETED: {
    status: 'COMPLETED',
    label: 'COMPLETED',
    level: 'ct',
    category: 'terminal-success',
    color: '#15803d',
    bg: '#f0fdf4',
    updatedBy: 'Customer Transaction Service (via TP_TRANSACTION Kafka Consumer)',
    dbOperation: 'UPDATE customer_transaction SET status = COMPLETED, completed_at = NOW()',
    kafkaEvents: ['CT_TRANSACTION (status = COMPLETED)', 'NOTIFY (push notification trigger)'],
    associatedLogs:
      'INFO: [CustomerTxSvc] TP_TRANSACTION consumer: PUSH segment INSTRUCTION_ACCEPTED. CT → COMPLETED. NOTIFY published.',
    possibleNextStates: [],
    retryRecovery: 'Terminal success. Push notification dispatched via notify-service → FCM / APNS.',
  },
};

const SEG_STATUS_DETAILS: Record<string, StatusMetadata> = {
  NEW: {
    status: 'NEW',
    label: 'NEW (Segment)',
    level: 'segment',
    category: 'initial',
    color: '#6366f1',
    bg: '#eef2ff',
    updatedBy: 'Customer Transaction Service',
    dbOperation: 'INSERT segment (type = PULL|INTER_BANK|PUSH, status = NEW)',
    kafkaEvents: ['(none — synchronous submission to transaction-processor)'],
    associatedLogs: 'INFO: [CustomerTxSvc] Submitting PULL segment to /transaction-processor (async).',
    possibleNextStates: ['INSTRUCTED', 'REJECTED'],
    retryRecovery: 'Segment submitted asynchronously. Response received via TP_TRANSACTION Kafka consumer.',
  },
  INSTRUCTED: {
    status: 'INSTRUCTED',
    label: 'INSTRUCTED',
    level: 'segment',
    category: 'in-progress',
    color: '#7c3aed',
    bg: '#f5f3ff',
    updatedBy: 'transaction-processor Service',
    dbOperation: 'UPDATE segment SET status = INSTRUCTED',
    kafkaEvents: ['TP_TRANSACTION (status = INSTRUCTED)'],
    associatedLogs: 'INFO: [TxProcessor] Segment submitted to Payment Gateway. Awaiting response.',
    possibleNextStates: ['INSTRUCTION_ACCEPTED', 'REJECTED'],
    retryRecovery: 'Waiting for bank gateway clearing response within SLA window.',
  },
  INSTRUCTION_ACCEPTED: {
    status: 'INSTRUCTION_ACCEPTED',
    label: 'INSTRUCTION_ACCEPTED',
    level: 'segment',
    category: 'terminal-success',
    color: '#16a34a',
    bg: '#f0fdf4',
    updatedBy: 'transaction-processor Service',
    dbOperation: 'UPDATE segment SET status = INSTRUCTION_ACCEPTED',
    kafkaEvents: ['TP_TRANSACTION (status = INSTRUCTION_ACCEPTED)'],
    associatedLogs: 'INFO: [TxProcessor] Payment Gateway cleared segment. Publishing INSTRUCTION_ACCEPTED to TP_TRANSACTION.',
    possibleNextStates: ['SETTLED'],
    retryRecovery:
      'PULL INSTRUCTION_ACCEPTED → CT: FUNDS_SECURED, next segment submitted. PUSH INSTRUCTION_ACCEPTED → CT: COMPLETED.',
  },
  REJECTED: {
    status: 'REJECTED',
    label: 'REJECTED',
    level: 'segment',
    category: 'terminal-failure',
    color: '#ea580c',
    bg: '#fff7ed',
    updatedBy: 'transaction-processor Service',
    dbOperation: 'UPDATE segment SET status = REJECTED',
    kafkaEvents: ['TP_TRANSACTION (status = REJECTED)'],
    associatedLogs: 'ERROR: [TxProcessor] Bank payment gateway rejected fund transfer segment.',
    possibleNextStates: [],
    retryRecovery: 'Terminal failure. CT enters failure handling. No re-pull without customer action.',
  },
  SETTLED: {
    status: 'SETTLED',
    label: 'SETTLED',
    level: 'segment',
    category: 'terminal-success',
    color: '#0f766e',
    bg: '#f0fdfa',
    updatedBy: 'transaction-processor Service',
    dbOperation: 'UPDATE segment SET status = SETTLED',
    kafkaEvents: ['TP_TRANSACTION (status = SETTLED)'],
    associatedLogs: 'INFO: [TxProcessor] Segment settled by clearing network. Final state recorded.',
    possibleNextStates: [],
    retryRecovery: 'Final segment state. Clearing confirmed by interbank network.',
  },
};

const ALL_STATUS_DETAILS: Record<string, StatusMetadata> = {
  ...CT_STATUS_DETAILS,
  SEG_NEW: { ...SEG_STATUS_DETAILS['NEW']!, status: 'SEG_NEW' },
  SEG_INSTRUCTED: { ...SEG_STATUS_DETAILS['INSTRUCTED']!, status: 'SEG_INSTRUCTED' },
  SEG_INSTRUCTION_ACCEPTED: { ...SEG_STATUS_DETAILS['INSTRUCTION_ACCEPTED']!, status: 'SEG_INSTRUCTION_ACCEPTED' },
  SEG_REJECTED: { ...SEG_STATUS_DETAILS['REJECTED']!, status: 'SEG_REJECTED' },
  SEG_SETTLED: { ...SEG_STATUS_DETAILS['SETTLED']!, status: 'SEG_SETTLED' },
};

function StatusNode({
  statusKey,
  selected,
  onClick,
}: {
  statusKey: string;
  selected: boolean;
  onClick: () => void;
}) {
  const d = ALL_STATUS_DETAILS[statusKey];
  if (!d) return null;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 8,
        border: selected ? `2.5px solid ${d.color}` : `1.5px solid ${d.color}40`,
        background: selected ? d.bg : '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: selected ? `0 0 0 3px ${d.color}20` : 'none',
        minWidth: 160,
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: d.color, lineHeight: 1.2 }}>{d.label}</div>
        <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {d.level === 'ct' ? 'CT Status' : 'Segment Status'}
        </div>
      </div>
    </div>
  );
}

function Arrow({ label, color = '#64748b' }: { label?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {label && <span style={{ fontSize: 9, color: '#64748b', textAlign: 'center' }}>{label}</span>}
      <ArrowRight size={14} style={{ transform: 'rotate(90deg)', color }} />
    </div>
  );
}

export function StatusLifecyclePage() {
  const [selectedStatusKey, setSelectedStatusKey] = useState<string>('IN_PROGRESS');
  const activeDetails = ALL_STATUS_DETAILS[selectedStatusKey] ?? ALL_STATUS_DETAILS['IN_PROGRESS']!;

  return (
    <div className="page-container app-content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="validation-badge confirmed">State Machine</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>Send Money – V1 (Bank Only)</span>
          </div>
          <h1 className="page-title">Transaction Status Lifecycle</h1>
          <p className="page-subtitle">
            Customer-Transaction (CT) level statuses and Payment Segment level statuses — with Kafka event broadcasts on every transition.
          </p>
        </div>
      </div>

      {/* ── TWO-TIER LIFECYCLE DIAGRAM ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* CT Status Flow */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color="#2563eb" /> Customer-Transaction Statuses
            </h3>
            <span style={{ fontSize: 11, color: '#64748b' }}>Every change → CT_TRANSACTION Kafka</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <StatusNode statusKey="NEW" selected={selectedStatusKey === 'NEW'} onClick={() => setSelectedStatusKey('NEW')} />
            <div style={{ display: 'flex', gap: 20, paddingLeft: 20 }}>
              <Arrow label="Pass (Steps 3→5)" color="#0284c7" />
              <Arrow label="Fail (Step 4)" color="#dc2626" />
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <StatusNode statusKey="IN_PROGRESS" selected={selectedStatusKey === 'IN_PROGRESS'} onClick={() => setSelectedStatusKey('IN_PROGRESS')} />
              <StatusNode statusKey="DECLINED" selected={selectedStatusKey === 'DECLINED'} onClick={() => setSelectedStatusKey('DECLINED')} />
            </div>
            <Arrow label="PULL INSTRUCTION_ACCEPTED (Step 7)" color="#0d9488" />
            <StatusNode statusKey="FUNDS_SECURED" selected={selectedStatusKey === 'FUNDS_SECURED'} onClick={() => setSelectedStatusKey('FUNDS_SECURED')} />
            <Arrow label="PUSH INSTRUCTION_ACCEPTED (Step 8→10)" color="#15803d" />
            <StatusNode statusKey="COMPLETED" selected={selectedStatusKey === 'COMPLETED'} onClick={() => setSelectedStatusKey('COMPLETED')} />
          </div>
        </div>

        {/* Segment Status Flow */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={16} color="#f59e0b" /> Payment Segment Statuses
            </h3>
            <span style={{ fontSize: 11, color: '#64748b' }}>PULL · INTER_BANK (optional) · PUSH → TP_TRANSACTION Kafka</span>
          </div>

          {/* Segment info banner */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: '#92400e' }}>
            Each CT has <strong>2–3 segments</strong>:<br />
            &nbsp;&nbsp;• <strong>PULL</strong> (mandatory) — pulls funds from source bank<br />
            &nbsp;&nbsp;• <strong>INTER_BANK</strong> (optional) — intermediary transfer<br />
            &nbsp;&nbsp;• <strong>PUSH</strong> (mandatory) — pushes funds to destination
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <StatusNode statusKey="SEG_NEW" selected={selectedStatusKey === 'SEG_NEW'} onClick={() => setSelectedStatusKey('SEG_NEW')} />
            <Arrow label="Submitted to gateway" color="#7c3aed" />
            <div style={{ display: 'flex', gap: 16 }}>
              <StatusNode statusKey="SEG_INSTRUCTED" selected={selectedStatusKey === 'SEG_INSTRUCTED'} onClick={() => setSelectedStatusKey('SEG_INSTRUCTED')} />
            </div>
            <div style={{ display: 'flex', gap: 20, paddingLeft: 20 }}>
              <Arrow label="Accepted" color="#16a34a" />
              <Arrow label="Rejected" color="#ea580c" />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <StatusNode statusKey="SEG_INSTRUCTION_ACCEPTED" selected={selectedStatusKey === 'SEG_INSTRUCTION_ACCEPTED'} onClick={() => setSelectedStatusKey('SEG_INSTRUCTION_ACCEPTED')} />
              <StatusNode statusKey="SEG_REJECTED" selected={selectedStatusKey === 'SEG_REJECTED'} onClick={() => setSelectedStatusKey('SEG_REJECTED')} />
            </div>
            <Arrow label="Cleared by network" color="#0f766e" />
            <StatusNode statusKey="SEG_SETTLED" selected={selectedStatusKey === 'SEG_SETTLED'} onClick={() => setSelectedStatusKey('SEG_SETTLED')} />
          </div>
        </div>
      </div>

      {/* ── SEGMENT → CT RELATIONSHIP ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">Segment → CT Status Relationship</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {[
            { seg: 'PULL', segEvt: 'INSTRUCTION_ACCEPTED', ctResult: 'FUNDS_SECURED', color: '#0d9488' },
            { seg: 'INTER_BANK', segEvt: 'INSTRUCTION_ACCEPTED', ctResult: '(no CT status change)', color: '#6366f1', note: 'optional' },
            { seg: 'PUSH', segEvt: 'INSTRUCTION_ACCEPTED', ctResult: 'COMPLETED', color: '#15803d' },
          ].map((r) => (
            <div
              key={r.seg}
              style={{
                flex: '1 1 280px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '3px 7px', borderRadius: 4 }}>
                {r.seg} {r.note ? `(${r.note})` : ''}
              </div>
              <ArrowRight size={12} color="#94a3b8" />
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#16a34a', background: '#dcfce7', padding: '3px 7px', borderRadius: 4 }}>
                {r.segEvt}
              </div>
              <ArrowRight size={12} color="#94a3b8" />
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: r.color, background: r.color + '18', padding: '3px 7px', borderRadius: 4 }}>
                CT: {r.ctResult}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SELECTED STATUS DETAILS ── */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: activeDetails.color }} />
            <h3 className="card-title" style={{ fontSize: 15 }}>
              State Detail: <span style={{ color: activeDetails.color }}>{activeDetails.label}</span>
            </h3>
            <span style={{ fontSize: 10, color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: 10 }}>
              {activeDetails.level === 'ct' ? 'Customer-Transaction Level' : 'Segment Level'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div>
            <div className="details-field">
              <span className="details-field-label">Managing Service</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Server size={14} color="#0ea5e9" />
                <span className="details-field-value">{activeDetails.updatedBy}</span>
              </div>
            </div>
            <div className="details-field" style={{ marginTop: 12 }}>
              <span className="details-field-label">Database Mutation</span>
              <div className="details-field-value mono" style={{ marginTop: 4 }}>
                <Database size={12} style={{ marginRight: 6, verticalAlign: 'middle', color: '#8b5cf6' }} />
                {activeDetails.dbOperation}
              </div>
            </div>
            <div className="details-field" style={{ marginTop: 12 }}>
              <span className="details-field-label">Kafka Event Broadcast</span>
              {activeDetails.kafkaEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="details-field-value mono"
                  style={{ marginTop: 4, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
                >
                  <Radio size={12} style={{ marginRight: 6, verticalAlign: 'middle', color: '#f59e0b' }} />
                  {evt}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="details-field">
              <span className="details-field-label">Diagnostic Log Signature</span>
              <div className="details-field-value mono" style={{ marginTop: 4 }}>
                <FileText size={12} style={{ marginRight: 6, verticalAlign: 'middle', color: '#64748b' }} />
                {activeDetails.associatedLogs}
              </div>
            </div>
            <div className="details-field" style={{ marginTop: 12 }}>
              <span className="details-field-label">Valid Next States</span>
              <div className="details-tag-list" style={{ marginTop: 6 }}>
                {activeDetails.possibleNextStates.length > 0 ? (
                  activeDetails.possibleNextStates.map((st) => {
                    const target = ALL_STATUS_DETAILS[st] || ALL_STATUS_DETAILS['SEG_' + st];
                    return (
                      <span
                        key={st}
                        className="details-tag"
                        style={{
                          cursor: target ? 'pointer' : 'default',
                          color: target?.color || '#0f172a',
                          borderColor: target?.color || '#cbd5e1',
                          background: target?.bg || '#f1f5f9',
                        }}
                        onClick={() => target && setSelectedStatusKey(target.status)}
                      >
                        → {st}
                      </span>
                    );
                  })
                ) : (
                  <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>Terminal State</span>
                )}
              </div>
            </div>
            <div className="details-field" style={{ marginTop: 12 }}>
              <span className="details-field-label">Recovery & Next Action</span>
              <div style={{ fontSize: 12, color: '#334155', marginTop: 4, lineHeight: 1.4 }}>
                <RotateCcw size={12} style={{ marginRight: 6, verticalAlign: 'middle', color: '#d97706' }} />
                {activeDetails.retryRecovery}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
