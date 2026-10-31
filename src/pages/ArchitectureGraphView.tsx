import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { sendMoneyNodes, sendMoneyEdges, sendMoneySteps, kafkaTopics } from '@/data/send-money-flow';
import { getServiceById } from '@/data/services';
import { nodeTypes } from '@/components/nodes';
import { edgeTypes } from '@/components/edges';
import { toReactFlowNodes, toReactFlowEdges } from '@/utils/graph';
import { DetailsPanel } from '@/components/layout/DetailsPanel';
import { useArchitecture } from '@/context/ArchitectureContext';
import type { SelectedNodeData, SelectedEdgeData } from '@/types/architecture';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
} from 'lucide-react';

// ─── STEP → HIGHLIGHT MAP ────────────────────────────────────────────────────

const STEP_HIGHLIGHT_MAP: Record<number, { nodes: string[]; edges: string[] }> = {
  1: {
    nodes: ['node-mobile-app', 'node-customer-tx-svc', 'node-customer-tx-db'],
    edges: ['edge-step-1', 'edge-db-new'],
  },
  2: {
    nodes: ['node-customer-tx-svc', 'node-ipay-core-svc'],
    edges: ['edge-step-2'],
  },
  3: {
    nodes: ['node-customer-tx-svc', 'node-route-optimizer-svc'],
    edges: ['edge-step-3'],
  },
  4: {
    nodes: ['node-customer-tx-svc', 'node-transaction-processor-svc'],
    edges: ['edge-step-4'],
  },
  5: {
    nodes: ['node-transaction-processor-svc', 'node-payment-gateway'],
    edges: ['edge-step-5'],
  },
  6: {
    nodes: ['node-transaction-processor-svc', 'node-kafka-tp-transaction'],
    edges: ['edge-step-6'],
  },
  7: {
    nodes: [
      'node-kafka-tp-transaction',
      'node-customer-tx-svc',
      'node-kafka-ct-transaction',
    ],
    edges: ['edge-step-7', 'edge-ct-transaction-publish'],
  },
  8: {
    nodes: ['node-customer-tx-svc', 'node-ipay-account-svc'],
    edges: ['edge-step-8'],
  },
  9: {
    nodes: ['node-customer-tx-svc', 'node-kafka-notify'],
    edges: ['edge-step-9'],
  },
  10: {
    nodes: [
      'node-customer-tx-svc',
      'node-kafka-notify',
      'node-notify-svc',
      'node-firebase',
      'node-mobile-app',
      'node-kafka-ct-transaction',
    ],
    edges: [
      'edge-ct-transaction-publish',
      'edge-step-10a-notify-consume',
      'edge-step-10b-firebase',
      'edge-step-10c-mobile-push',
    ],
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function ArchitectureGraphView() {
  const { searchQuery, highlightedNodeId } = useArchitecture();

  const [activeStepNumber, setActiveStepNumber] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'rest' | 'kafka' | 'db'>('all');
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdgeData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const rawNodes = useMemo(() => toReactFlowNodes(sendMoneyNodes), []);
  const rawEdges = useMemo(() => toReactFlowEdges(sendMoneyEdges), []);

  const activeStepConfig = activeStepNumber ? STEP_HIGHLIGHT_MAP[activeStepNumber] : null;
  const currentStepData = activeStepNumber ? sendMoneySteps.find((s) => s.order === activeStepNumber) : null;

  const processedNodes = useMemo(() => {
    return rawNodes.map((node) => {
      const archNode = sendMoneyNodes.find((n) => n.id === node.id);
      const matchesSearch =
        !searchQuery ||
        archNode?.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        archNode?.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        archNode?.group.toLowerCase().includes(searchQuery.toLowerCase());

      const isStepHighlighted = !activeStepConfig || activeStepConfig.nodes.includes(node.id);
      const isContextHighlighted = !highlightedNodeId || highlightedNodeId === node.id;
      const isDimmed = !matchesSearch || !isStepHighlighted || !isContextHighlighted;

      return {
        ...node,
        style: {
          opacity: isDimmed ? 0.15 : 1,
          transition: 'opacity 0.25s ease',
        },
      };
    });
  }, [rawNodes, searchQuery, activeStepConfig, highlightedNodeId]);

  const processedEdges = useMemo(() => {
    return rawEdges.map((edge) => {
      const archEdge = sendMoneyEdges.find((e) => e.id === edge.id);
      const isProtocolMatch =
        protocolFilter === 'all' ||
        (protocolFilter === 'rest' && archEdge?.type === 'rest') ||
        (protocolFilter === 'kafka' &&
          (archEdge?.type === 'kafka-publish' || archEdge?.type === 'kafka-consume')) ||
        (protocolFilter === 'db' && archEdge?.type === 'database-connection');

      const isStepHighlighted = !activeStepConfig || activeStepConfig.edges.includes(edge.id);
      const isDimmed = !isProtocolMatch || !isStepHighlighted;

      return {
        ...edge,
        animated: !isDimmed && (edge.animated || archEdge?.type === 'rest'),
        style: {
          ...edge.style,
          opacity: isDimmed ? 0.08 : 1,
          strokeWidth: isStepHighlighted && activeStepConfig ? 3.5 : 2,
          transition: 'all 0.25s ease',
        },
      };
    });
  }, [rawEdges, protocolFilter, activeStepConfig]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);

  useEffect(() => {
    setNodes(processedNodes);
  }, [processedNodes, setNodes]);

  useEffect(() => {
    setEdges(processedEdges);
  }, [processedEdges, setEdges]);

  // Auto-play stepper
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStepNumber((prev) => {
        if (prev === null) return 1;
        if (prev >= 10) {
          setIsPlaying(false);
          return 10;
        }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const archNode = sendMoneyNodes.find((n) => n.id === node.id);
    if (!archNode) return;
    const service = archNode.serviceId ? getServiceById(archNode.serviceId) : undefined;
    const kafka =
      archNode.type === 'kafka-topic'
        ? kafkaTopics.find((kt) => kt.topicName === archNode.metadata['topicName'] || kt.topicName === archNode.label)
        : undefined;
    setSelectedNode({ nodeType: archNode.type, service, kafka, node: archNode });
    setSelectedEdge(null);
    setIsPanelOpen(true);
  }, []);

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const archEdge = sendMoneyEdges.find((e) => e.id === edge.id);
    if (!archEdge) return;
    setSelectedEdge({ edge: archEdge });
    setSelectedNode(null);
    setIsPanelOpen(true);
  }, []);

  const nextStep = () => setActiveStepNumber((prev) => (prev === null || prev >= 10 ? 1 : prev + 1));
  const prevStep = () => setActiveStepNumber((prev) => (prev === null || prev <= 1 ? 10 : prev - 1));
  const resetAll = () => {
    setActiveStepNumber(null);
    setIsPlaying(false);
    setProtocolFilter('all');
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* ── FLOW CANVAS ── */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        {/* ── TOP CONTROL BAR ── */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: isPanelOpen ? 456 : 16,
            zIndex: 10,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(6px)',
            borderRadius: 10,
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 16px rgba(15,23,42,0.10)',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            transition: 'right 0.3s ease',
          }}
        >
          {/* Row 1: Controls + Step Pills */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            {/* Playback */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button className="flow-toolbar-btn" onClick={prevStep} title="Previous Step" style={{ padding: '4px 8px' }}>
                <SkipBack size={13} />
              </button>
              <button
                className={`flow-toolbar-btn ${isPlaying ? 'active' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
              </button>
              <button className="flow-toolbar-btn" onClick={nextStep} title="Next Step" style={{ padding: '4px 8px' }}>
                <SkipForward size={13} />
              </button>
            </div>

            {/* Step Buttons */}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {sendMoneySteps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveStepNumber(s.order); setIsPlaying(false); }}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: activeStepNumber === s.order ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: activeStepNumber === s.order ? '#2563eb' : '#f8fafc',
                    color: activeStepNumber === s.order ? '#fff' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.order}
                </button>
              ))}
            </div>

            {/* Protocol Filter */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: 6, marginLeft: 'auto' }}>
              {(['all', 'rest', 'kafka', 'db'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setProtocolFilter(f)}
                  style={{
                    padding: '3px 9px',
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 4,
                    background:
                      protocolFilter === f
                        ? f === 'kafka' ? '#fef3c7' : f === 'db' ? '#ede9fe' : '#fff'
                        : 'transparent',
                    color:
                      protocolFilter === f
                        ? f === 'kafka' ? '#92400e' : f === 'db' ? '#5b21b6' : '#0f172a'
                        : '#64748b',
                    boxShadow: protocolFilter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {f === 'all' ? 'All' : f === 'rest' ? 'REST' : f === 'kafka' ? 'Kafka' : 'DB'}
                </button>
              ))}
            </div>

            {activeStepNumber !== null && (
              <button
                className="flow-toolbar-btn"
                onClick={resetAll}
                style={{ fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RotateCcw size={12} /> Show All
              </button>
            )}
          </div>

          {/* Row 2: Step description banner */}
          {currentStepData && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 12px',
                background: '#eff6ff',
                borderRadius: 6,
                borderLeft: '4px solid #2563eb',
              }}
            >
              <span
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '2px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Step {currentStepData.order}/10
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', marginBottom: 2 }}>
                  {currentStepData.title}
                </div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
                  {currentStepData.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── REACT FLOW ── */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.15}
          maxZoom={2}
          attributionPosition="bottom-right"
          style={{ width: '100%', height: '100%' }}
        >
          <Controls position="top-right" style={{ marginTop: 16 }} />
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              const archNode = sendMoneyNodes.find((n) => n.id === node.id);
              switch (archNode?.type) {
                case 'api-endpoint': return '#3b82f6';
                case 'microservice': return '#0ea5e9';
                case 'database': return '#8b5cf6';
                case 'kafka-topic': return '#f59e0b';
                case 'notification-service': return '#a855f7';
                case 'external-integration': return '#f97316';
                default: return '#94a3b8';
              }
            }}
            nodeStrokeWidth={2}
            maskColor="rgba(240,244,248,0.7)"
            style={{ bottom: 16, right: 16 }}
          />
          <Background color="#e2e8f0" gap={20} size={1} />
        </ReactFlow>

        {/* ── LEGEND ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(4px)',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '8px 14px',
            boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
            zIndex: 5,
            fontSize: 11,
          }}
        >
          <div style={{ fontWeight: 700, color: '#475569', marginBottom: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Connection Types
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {[
              { color: '#3b82f6', dash: false, label: 'REST call' },
              { color: '#f59e0b', dash: true, label: 'Kafka Publish/Consume' },
              { color: '#8b5cf6', dash: false, label: 'Database Mutation' },
              { color: '#ef4444', dash: true, label: 'Error / DECLINED path' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width={28} height={10}>
                  <line
                    x1={0} y1={5} x2={28} y2={5}
                    stroke={item.color}
                    strokeWidth={2}
                    strokeDasharray={item.dash ? '5 3' : undefined}
                  />
                </svg>
                <span style={{ color: '#374151' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DETAILS PANEL ── */}
      <DetailsPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
