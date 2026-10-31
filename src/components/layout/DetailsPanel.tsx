import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Server,
  Radio,
  Database,
  Globe,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Code,
} from 'lucide-react';
import type { SelectedNodeData, SelectedEdgeData } from '@/types/architecture';

interface DetailsPanelProps {
  selectedNode: SelectedNodeData | null;
  selectedEdge: SelectedEdgeData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailsPanel({ selectedNode, selectedEdge, isOpen, onClose }: DetailsPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <aside className={`details-panel ${isOpen ? 'open' : 'closed'}`}>
      <div className="details-panel-header">
        <div className="details-panel-title-group">
          <h3>
            {selectedNode ? selectedNode.node.label : selectedEdge ? selectedEdge.edge.label : 'Component Details'}
          </h3>
        </div>
        <button className="details-panel-close" onClick={onClose} title="Close panel">
          <X size={18} />
        </button>
      </div>

      <div className="details-panel-content">
        {/* Node Details */}
        {selectedNode && (
          <>
            {/* Validation & Type Header */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <span className={`validation-badge ${selectedNode.node.validationStatus}`}>
                {selectedNode.node.validationStatus === 'confirmed' ? '✓ Confirmed by Source' : '⚠ Needs Validation'}
              </span>
              <span className="details-tag">{selectedNode.nodeType.toUpperCase()}</span>
              <span className="details-tag">{selectedNode.node.group}</span>
            </div>

            {/* Description */}
            <div className="details-section">
              <div className="details-section-title">Overview</div>
              <p className="details-field-value">{selectedNode.node.description}</p>
            </div>

            {/* If node is Microservice */}
            {selectedNode.service && (
              <>
                <div className="details-section">
                  <div className="details-section-title">Business Responsibility</div>
                  <p className="details-field-value">{selectedNode.service.businessResponsibility}</p>
                </div>

                <div className="details-section">
                  <div className="details-section-title">Dependencies & Topology</div>
                  <div className="details-field">
                    <span className="details-field-label">Upstream Dependencies</span>
                    <div className="details-tag-list">
                      {selectedNode.service.upstreamDependencies.map((dep, idx) => (
                        <span key={idx} className="details-tag">{dep}</span>
                      ))}
                    </div>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Downstream Dependencies</span>
                    <div className="details-tag-list">
                      {selectedNode.service.downstreamDependencies.length > 0 ? (
                        selectedNode.service.downstreamDependencies.map((dep, idx) => (
                          <span key={idx} className="details-tag">{dep}</span>
                        ))
                      ) : (
                        <span className="details-field-value" style={{ fontStyle: 'italic', color: '#94a3b8' }}>None</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <div className="details-section-title">Messaging & Databases</div>
                  <div className="details-field">
                    <span className="details-field-label">Kafka Topics Produced</span>
                    <div className="details-tag-list">
                      {selectedNode.service.kafkaTopicsProduced.map((topic, idx) => (
                        <span key={idx} className="details-tag" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                          <Radio size={10} style={{ marginRight: '4px' }} />
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="details-field">
                    <span className="details-field-label">Kafka Topics Consumed</span>
                    <div className="details-tag-list">
                      {selectedNode.service.kafkaTopicsConsumed.length > 0 ? (
                        selectedNode.service.kafkaTopicsConsumed.map((topic, idx) => (
                          <span key={idx} className="details-tag" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                            <Radio size={10} style={{ marginRight: '4px' }} />
                            {topic}
                          </span>
                        ))
                      ) : (
                        <span className="details-field-value" style={{ fontStyle: 'italic', color: '#94a3b8' }}>None</span>
                      )}
                    </div>
                  </div>

                  <div className="details-field">
                    <span className="details-field-label">Database Interactions</span>
                    {selectedNode.service.databaseInteractions.map((db, idx) => (
                      <div key={idx} className="details-field-value mono" style={{ marginTop: '4px' }}>
                        <Database size={11} style={{ marginRight: '6px', verticalAlign: 'middle', color: '#8b5cf6' }} />
                        {db}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <div className="details-section-title">Security & Error Handling</div>
                  <div className="details-field">
                    <span className="details-field-label">Authentication</span>
                    <span className="details-field-value needs-validation">{selectedNode.service.authentication}</span>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Error Handling Strategy</span>
                    <span className="details-field-value">{selectedNode.service.errorHandling}</span>
                  </div>
                </div>

                <div className="details-section">
                  <div className="details-section-title">Engineering Links</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="details-link">
                      <ExternalLink size={12} />
                      <span>Workflow Diagram: {selectedNode.service.workflowLink}</span>
                    </div>
                    <div className="details-link">
                      <Code size={12} />
                      <span>Repository: {selectedNode.service.repositoryLink}</span>
                    </div>
                    <div className="details-link">
                      <ExternalLink size={12} />
                      <span>API Spec: {selectedNode.service.apiSpecLink}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* If node is Kafka Topic */}
            {selectedNode.kafka && (
              <>
                <div className="details-section">
                  <div className="details-section-title">
                    <span>Kafka Topic Definition</span>
                    <button
                      className="details-copy-btn"
                      onClick={() => copyToClipboard(selectedNode.kafka!.topicName, 'topic')}
                    >
                      {copiedKey === 'topic' ? <Check size={11} /> : <Copy size={11} />}
                      {copiedKey === 'topic' ? 'Copied' : 'Copy Name'}
                    </button>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Topic Name</span>
                    <span className="details-field-value mono">{selectedNode.kafka.topicName}</span>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Producer Service</span>
                    <span className="details-field-value">{selectedNode.kafka.producerService}</span>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Consumer Services</span>
                    <div className="details-tag-list">
                      {selectedNode.kafka.consumerServices.map((c, i) => (
                        <span key={i} className="details-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Consumer Group</span>
                    <span className="details-field-value needs-validation">{selectedNode.kafka.consumerGroup}</span>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Message Key</span>
                    <span className="details-field-value needs-validation">{selectedNode.kafka.messageKey}</span>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Event Schema</span>
                    <span className="details-field-value needs-validation">{selectedNode.kafka.eventSchema}</span>
                  </div>
                  <div className="details-field">
                    <span className="details-field-label">Retry Strategy & DLQ</span>
                    <span className="details-field-value needs-validation">
                      {selectedNode.kafka.retryStrategy} / DLQ: {selectedNode.kafka.deadLetterTopic}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* If node is API Endpoint */}
            {selectedNode.nodeType === 'api-endpoint' && (
              <div className="details-section">
                <div className="details-section-title">
                  <span>API Specification</span>
                  <button
                    className="details-copy-btn"
                    onClick={() => copyToClipboard('/customer-transactions/send-money', 'endpoint')}
                  >
                    {copiedKey === 'endpoint' ? <Check size={11} /> : <Copy size={11} />}
                    {copiedKey === 'endpoint' ? 'Copied' : 'Copy Path'}
                  </button>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Endpoint</span>
                  <span className="details-field-value mono">POST /customer-transactions/send-money</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Domain</span>
                  <span className="details-field-value">Customer Transaction</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Calling Service</span>
                  <span className="details-field-value">Mobile Client / API Gateway</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Target Service</span>
                  <span className="details-field-value">Customer Transaction Service</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Expected Headers</span>
                  <span className="details-field-value mono">Content-Type: application/json{'\n'}Authorization: Bearer &lt;token&gt;</span>
                </div>
                <div className="details-field">
                  <span className="details-field-label">Sample Request Payload</span>
                  <span className="details-field-value mono">
{`{
  "sourceAccountId": "string",
  "targetBankCode": "string",
  "targetAccountNumber": "string",
  "amount": 100.00,
  "currency": "USD",
  "reference": "string"
}`}
                  </span>
                </div>
              </div>
            )}

            {/* Metadata dictionary if present */}
            {Object.keys(selectedNode.node.metadata).length > 0 && (
              <div className="details-section">
                <div className="details-section-title">Properties & Annotations</div>
                {Object.entries(selectedNode.node.metadata).map(([k, v]) => (
                  <div key={k} className="details-field">
                    <span className="details-field-label">{k}</span>
                    <span className="details-field-value mono">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Edge Details */}
        {selectedEdge && (
          <>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <span className={`validation-badge ${selectedEdge.edge.validationStatus}`}>
                {selectedEdge.edge.validationStatus === 'confirmed' ? '✓ Confirmed by Source' : '⚠ Needs Validation'}
              </span>
              <span className="details-tag">{selectedEdge.edge.type.toUpperCase()}</span>
            </div>

            <div className="details-section">
              <div className="details-section-title">Connection Overview</div>
              <div className="details-field">
                <span className="details-field-label">Channel Type</span>
                <span className="details-field-value">
                  {selectedEdge.edge.type === 'rest'
                    ? 'Synchronous HTTP/REST Call'
                    : selectedEdge.edge.type === 'kafka-publish'
                    ? 'Asynchronous Kafka Event Publish'
                    : selectedEdge.edge.type === 'kafka-consume'
                    ? 'Asynchronous Kafka Event Consumer Subscription'
                    : selectedEdge.edge.type === 'database-connection'
                    ? 'Database Persistence / Query Connector'
                    : 'Conditional Decision Branch'}
                </span>
              </div>
              <div className="details-field">
                <span className="details-field-label">Source Node</span>
                <span className="details-field-value mono">{selectedEdge.edge.source}</span>
              </div>
              <div className="details-field">
                <span className="details-field-label">Target Node</span>
                <span className="details-field-value mono">{selectedEdge.edge.target}</span>
              </div>
              <div className="details-field">
                <span className="details-field-label">Edge Label</span>
                <span className="details-field-value font-medium">{selectedEdge.edge.label}</span>
              </div>
            </div>

            <div className="details-section">
              <div className="details-section-title">Interaction Contract</div>
              <div className="details-field">
                <span className="details-field-label">Correlation ID Propagation</span>
                <span className="details-field-value mono">X-Correlation-ID (Needs Validation)</span>
              </div>
              <div className="details-field">
                <span className="details-field-label">Timeout / Retry Policy</span>
                <span className="details-field-value">Configured per resilience standard (Needs Validation)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
