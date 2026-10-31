import React, { useState } from 'react';
import {
  Globe,
  Radio,
  Copy,
  Check,
  ExternalLink,
  Code,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { kafkaTopics } from '@/data/send-money-flow';

const API_REGISTRY = [
  {
    id: 'api-1',
    method: 'POST',
    endpoint: '/customer-transactions/send-money',
    service: 'Customer Transaction Service',
    caller: 'Mobile App Client',
    description: 'Step 1: Mobile application initiates a bank-to-bank customer transfer.',
    headers: 'Content-Type: application/json\nAuthorization: Bearer <jwt-token>',
    requestPayload: `{\n  "sourceAccountId": "acc_001928",\n  "targetBankCode": "7010",\n  "targetAccountNumber": "1002938102",\n  "amount": 2500.00,\n  "currency": "LKR",\n  "remark": "Rent payment"\n}`,
    responsePayload: `{\n  "ct_transaction_reference": "CT_TXN_9948201",\n  "status": "IN_PROGRESS",\n  "timestamp": 1793422422\n}`,
    codes: ['200 OK', '400 Bad Request', '422 Declined', '500 Server Error'],
  },
  {
    id: 'api-2',
    method: 'POST',
    endpoint: '/ipay-core/transaction-reference',
    service: 'ipay-core Service',
    caller: 'Customer Transaction Service',
    description: 'Step 2: Obtains unique ct_transaction_reference and checks daily velocity limits.',
    headers: 'Content-Type: application/json\nX-Correlation-ID: <uuid>',
    requestPayload: `{\n  "userId": "usr_9921",\n  "amount": 2500.00,\n  "channel": "MOBILE"\n}`,
    responsePayload: `{\n  "ct_transaction_reference": "CT_TXN_9948201",\n  "status": "APPROVED"\n}`,
    codes: ['200 OK', '403 Limit Exceeded'],
  },
  {
    id: 'api-3',
    method: 'POST',
    endpoint: '/route-optimizer/resolve-route',
    service: 'route-optimizer Service',
    caller: 'Customer Transaction Service',
    description: 'Step 3: Evaluates the optimal clearing payment rail (e.g. direct CEFT vs SLIPS).',
    headers: 'Content-Type: application/json\nX-Correlation-ID: <uuid>',
    requestPayload: `{\n  "sourceBank": "7010",\n  "targetBank": "7135",\n  "amount": 2500.00\n}`,
    responsePayload: `{\n  "routeId": "ROUTE_CEFT_DIRECT",\n  "cost": 0.00,\n  "status": "OPTIMAL"\n}`,
    codes: ['200 OK', '422 Unroutable'],
  },
  {
    id: 'api-4',
    method: 'POST',
    endpoint: '/transaction-processor/pull-segment',
    service: 'transaction-processor Service (Transaction Engine)',
    caller: 'Customer Transaction Service',
    description: 'Step 6: Submits PULL segment asynchronously to execute with external Bank Payment Gateway.',
    headers: 'Content-Type: application/json\nX-Correlation-ID: <uuid>',
    requestPayload: `{\n  "ct_transaction_reference": "CT_TXN_9948201",\n  "segment": "PULL",\n  "gatewayType": "BANK",\n  "amount": 2500.00\n}`,
    responsePayload: `{\n  "tp_job_id": "TP_JOB_48219",\n  "status": "ACCEPTED_FOR_PROCESSING"\n}`,
    codes: ['202 Accepted', '400 Bad Request'],
  },
  {
    id: 'api-5',
    method: 'POST',
    endpoint: '/ipay-account/balance-update',
    service: 'ipay-account Service',
    caller: 'Customer Transaction Service',
    description: 'Step 8: Updates internal ipay user wallet balance upon instruction acceptance.',
    headers: 'Content-Type: application/json\nX-Correlation-ID: <uuid>',
    requestPayload: `{\n  "ct_transaction_reference": "CT_TXN_9948201",\n  "debitAccountId": "acc_001928",\n  "amount": 2500.00\n}`,
    responsePayload: `{\n  "status": "UPDATED",\n  "balance": 18240.50\n}`,
    codes: ['200 OK', '409 Balance Conflict'],
  },
];

export function ApiEventsExplorer() {
  const [activeTab, setActiveTab] = useState<'apis' | 'events'>('apis');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="page-container app-content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="validation-badge confirmed">Microservices Contracts</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Interface Registry</span>
          </div>
          <h1 className="page-title">API & Kafka Contract Explorer</h1>
          <p className="page-subtitle">
            Synchronous REST API endpoints and asynchronous Kafka topics across the Send Money microservices workflow.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'apis' ? 'active' : ''}`}
          onClick={() => setActiveTab('apis')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} />
            <span>REST APIs ({API_REGISTRY.length})</span>
          </div>
        </button>
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} />
            <span>Kafka Topics ({kafkaTopics.length})</span>
          </div>
        </button>
      </div>

      {/* REST API SECTION */}
      {activeTab === 'apis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {API_REGISTRY.map((api) => (
            <div key={api.id} className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '11px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                    }}
                  >
                    {api.method}
                  </span>
                  <h3 className="card-title" style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {api.endpoint}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="validation-badge confirmed">Confirmed</span>
                  <button
                    className="details-copy-btn"
                    onClick={() => copyToClipboard(`${api.method} ${api.endpoint}`, api.id)}
                  >
                    {copiedKey === api.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === api.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
                {api.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div className="details-field">
                  <span className="details-field-label">Target Service</span>
                  <span className="details-field-value font-semibold">{api.service}</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Calling Client / Service</span>
                  <span className="details-field-value">{api.caller}</span>
                </div>
              </div>

              {/* Payloads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Request Payload
                  </span>
                  <div className="details-field-value mono">{api.requestPayload}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Response Payload
                  </span>
                  <div className="details-field-value mono">{api.responsePayload}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Response Codes
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {api.codes.map((c, i) => (
                    <span key={i} className="details-tag" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KAFKA TOPICS SECTION */}
      {activeTab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {kafkaTopics.map((kt) => (
            <div key={kt.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Radio size={18} color="#f59e0b" />
                  <h3 className="card-title" style={{ fontFamily: 'monospace', fontSize: '16px', color: '#92400e' }}>
                    {kt.topicName}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="validation-badge confirmed">Confirmed Kafka Topic</span>
                  <button
                    className="details-copy-btn"
                    onClick={() => copyToClipboard(kt.topicName, kt.id)}
                  >
                    {copiedKey === kt.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === kt.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="details-field">
                  <span className="details-field-label">Producer Microservice</span>
                  <span className="details-field-value font-semibold">{kt.producerService}</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Consumer Microservices</span>
                  <div className="details-tag-list">
                    {kt.consumerServices.map((c, i) => (
                      <span key={i} className="details-tag font-semibold" style={{ background: '#eff6ff', color: '#1e40af' }}>{c}</span>
                    ))}
                  </div>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Consumer Group</span>
                  <span className="details-field-value mono">{kt.consumerGroup}</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Partitioning Message Key</span>
                  <span className="details-field-value mono">{kt.messageKey}</span>
                </div>
              </div>

              <div className="details-field" style={{ marginBottom: '14px' }}>
                <span className="details-field-label">Event Description & Payloads</span>
                <span className="details-field-value">{kt.eventType}</span>
              </div>

              {/* Event Schema Box */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Schema Envelope ({kt.eventSchema})
                </span>
                <div className="details-field-value mono">
{kt.topicName === 'CT_TRANSACTION' && `{
  "topic": "CT_TRANSACTION",
  "ct_transaction_reference": "CT_TXN_9948201",
  "status": "NEW | IN_PROGRESS | FUNDS_SECURED | COMPLETED | DECLINED",
  "timestamp": 1793422422,
  "payload": {
    "amount": 2500.00,
    "currency": "LKR",
    "sourceBank": "7010",
    "targetBank": "7135"
  }
}`}
{kt.topicName === 'TP_TRANSACTION' && `{
  "topic": "TP_TRANSACTION",
  "ct_transaction_reference": "CT_TXN_9948201",
  "segment": "PULL | INTER_BANK | PUSH",
  "status": "NEW | INSTRUCTED | INSTRUCTION_ACCEPTED | REJECTED | SETTLED",
  "gateway": "BANK",
  "timestamp": 1793422424
}`}
{kt.topicName === 'NOTIFY' && `{
  "topic": "NOTIFY",
  "userId": "usr_9921",
  "ct_transaction_reference": "CT_TXN_9948201",
  "notificationType": "PUSH",
  "template": "TRANSACTION_IN_FLIGHT | TRANSACTION_COMPLETED",
  "title": "Send Money Update",
  "body": "Your transfer of LKR 2500.00 has been completed successfully."
}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
