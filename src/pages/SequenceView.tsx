import React, { useState } from 'react';
import {
  Globe,
  Server,
  Database,
  Radio,
  GitBranch,
  CircleDot,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { sendMoneySteps } from '@/data/send-money-flow';
import { sendMoneyNodes } from '@/data/send-money-flow';
import { getServiceById } from '@/data/services';
import { kafkaTopics } from '@/data/send-money-flow';
import { DetailsPanel } from '@/components/layout/DetailsPanel';
import type { FlowStep, SelectedNodeData } from '@/types/architecture';

export function SequenceView() {
  const [expandedStepIds, setExpandedStepIds] = useState<Set<string>>(
    new Set(['step-1', 'step-2', 'step-6', 'step-7', 'step-10'])
  );
  const [selectedStep, setSelectedStep] = useState<FlowStep | null>(null);

  // Details panel state
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const toggleExpand = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedStepIds((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const handleStepClick = (step: FlowStep) => {
    setSelectedStep(step);

    let matchedNode = sendMoneyNodes.find((n) => n.serviceId === step.serviceId);
    if (step.type === 'kafka-event' || step.details.topic) {
      if (step.details.topic?.includes('CT_TRANSACTION')) {
        matchedNode = sendMoneyNodes.find((n) => n.id === 'node-kafka-ct-transaction') || matchedNode;
      } else if (step.details.topic?.includes('TP_TRANSACTION')) {
        matchedNode = sendMoneyNodes.find((n) => n.id === 'node-kafka-tp-transaction') || matchedNode;
      } else if (step.details.topic?.includes('NOTIFY')) {
        matchedNode = sendMoneyNodes.find((n) => n.id === 'node-kafka-notify') || matchedNode;
      }
    }

    if (matchedNode) {
      const service = matchedNode.serviceId ? getServiceById(matchedNode.serviceId) : undefined;
      const kafka = matchedNode.type === 'kafka-topic'
        ? kafkaTopics.find((kt) => kt.topicName === matchedNode.metadata['topicName'])
        : undefined;

      setSelectedNode({
        nodeType: matchedNode.type,
        service,
        kafka,
        node: matchedNode,
      });
      setIsPanelOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div className="app-content-inner" style={{ padding: '32px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="page-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="validation-badge confirmed">10-Step Execution Sequence</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Send Money – V1 (Bank Only)</span>
              </div>
              <h1 className="page-title">Transaction Sequence View</h1>
              <p className="page-subtitle">
                Chronological microservices orchestration from mobile initiation to partner bank clearing, ipay-account balance update, and push notification.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="details-tag" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                Solid: Synchronous REST
              </span>
              <span className="details-tag" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                Dashed: Asynchronous Kafka
              </span>
            </div>
          </div>

          {/* Timeline list */}
          <div className="sequence-container" style={{ padding: 0 }}>
            {sendMoneySteps.map((step, idx) => {
              const isExpanded = expandedStepIds.has(step.id);
              const isSelected = selectedStep?.id === step.id;

              return (
                <div key={step.id} className="sequence-step">
                  {/* Timeline track */}
                  <div className="sequence-timeline">
                    <div
                      className={`sequence-dot ${step.isAsync ? 'async' : ''}`}
                      title={step.isAsync ? 'Asynchronous Kafka Operation' : 'Synchronous REST Call'}
                    />
                    {idx < sendMoneySteps.length - 1 && (
                      <div className={`sequence-line ${step.isAsync ? 'async' : ''}`} />
                    )}
                  </div>

                  {/* Step Card */}
                  <div
                    className={`sequence-card ${isSelected ? 'highlighted' : ''}`}
                    onClick={() => handleStepClick(step)}
                  >
                    <div className="sequence-card-header">
                      <div className="sequence-card-title">
                        <span
                          style={{
                            background: step.isAsync ? '#fef3c7' : '#dbeafe',
                            color: step.isAsync ? '#92400e' : '#1e40af',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Step {step.order}
                        </span>
                        <span>{step.title}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`sequence-card-type ${step.type}`}>
                          {step.type.replace('-', ' ')}
                        </span>
                        {step.isAsync ? (
                          <span className="details-tag" style={{ fontSize: '9px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                            Async Kafka
                          </span>
                        ) : (
                          <span className="details-tag" style={{ fontSize: '9px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                            Sync REST
                          </span>
                        )}
                        <button
                          onClick={(e) => toggleExpand(step.id, e)}
                          style={{ color: '#94a3b8', padding: '2px' }}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="sequence-card-desc">{step.description}</div>

                    {/* Collapsible details */}
                    {isExpanded && (
                      <div className="sequence-card-details">
                        <div className="sequence-card-detail-row">
                          <span className="sequence-card-detail-label">Service Owner:</span>
                          <span className="sequence-card-detail-value font-mono">
                            {step.serviceId}
                          </span>
                        </div>

                        {Object.entries(step.details).map(([k, v]) => (
                          <div key={k} className="sequence-card-detail-row">
                            <span className="sequence-card-detail-label">{k}:</span>
                            <span className="sequence-card-detail-value">{v}</span>
                          </div>
                        ))}

                        {step.conditionalNextSteps && (
                          <div style={{ marginTop: '8px', padding: '6px 8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Branches / Outcomes:
                            </div>
                            {step.conditionalNextSteps.map((c, i) => (
                              <div key={i} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                                <ArrowRight size={10} color="#2563eb" />
                                <strong>{c.condition}:</strong> transitions to <code>{c.stepId}</code>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide-out details panel */}
      <DetailsPanel
        selectedNode={selectedNode}
        selectedEdge={null}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
