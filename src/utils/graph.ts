import type { ArchitectureNode, ArchitectureEdge, NodeType } from '@/types/architecture';
import type { Node, Edge } from '@xyflow/react';

/**
 * Convert architecture nodes to React Flow nodes.
 */
export function toReactFlowNodes(nodes: ArchitectureNode[]): Node[] {
  return nodes.map((node) => ({
    id: node.id,
    type: mapNodeType(node.type),
    position: node.position,
    data: {
      label: node.label,
      description: node.description,
      nodeType: node.type,
      group: node.group,
      serviceId: node.serviceId,
      metadata: node.metadata,
      validationStatus: node.validationStatus,
    },
  }));
}

/**
 * Convert architecture edges to React Flow edges.
 */
export function toReactFlowEdges(edges: ArchitectureEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: mapEdgeType(edge.type),
    label: edge.label,
    data: {
      edgeType: edge.type,
      metadata: edge.metadata,
      validationStatus: edge.validationStatus,
    },
    animated: edge.type === 'kafka-publish' || edge.type === 'kafka-consume',
    style: getEdgeStyle(edge.type),
    labelStyle: { fontSize: 11, fontWeight: 500 },
    labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 3,
  }));
}

function mapNodeType(type: NodeType): string {
  const mapping: Record<NodeType, string> = {
    'api-endpoint': 'apiEndpoint',
    'microservice': 'microservice',
    'database': 'database',
    'kafka-topic': 'kafkaTopic',
    'decision': 'decision',
    'business-operation': 'businessOperation',
    'transaction-status': 'transactionStatus',
    'external-integration': 'externalIntegration',
    'notification-service': 'notificationService',
    'journal-ledger': 'journalLedger',
  };
  return mapping[type] || 'default';
}

function mapEdgeType(type: string): string {
  if (type === 'kafka-publish' || type === 'kafka-consume') return 'kafkaEdge';
  if (type === 'database-connection') return 'databaseEdge';
  if (type === 'decision-branch') return 'decisionEdge';
  if (type === 'error-path') return 'errorEdge';
  return 'restEdge';
}

function getEdgeStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'rest':
      return { stroke: '#3b82f6', strokeWidth: 2 };
    case 'kafka-publish':
    case 'kafka-consume':
      return { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' };
    case 'database-connection':
      return { stroke: '#8b5cf6', strokeWidth: 2 };
    case 'decision-branch':
      return { stroke: '#6b7280', strokeWidth: 2 };
    case 'error-path':
      return { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4' };
    default:
      return { stroke: '#94a3b8', strokeWidth: 1.5 };
  }
}

/**
 * Get unique groups from architecture nodes.
 */
export function getNodeGroups(nodes: ArchitectureNode[]): string[] {
  return [...new Set(nodes.map((n) => n.group))];
}

/**
 * Get unique node types from architecture nodes.
 */
export function getNodeTypes(nodes: ArchitectureNode[]): NodeType[] {
  return [...new Set(nodes.map((n) => n.type))];
}

/**
 * Filter nodes by type.
 */
export function filterNodesByType(nodes: ArchitectureNode[], types: NodeType[]): ArchitectureNode[] {
  if (types.length === 0) return nodes;
  return nodes.filter((n) => types.includes(n.type));
}

/**
 * Search nodes by label or description.
 */
export function searchNodes(nodes: ArchitectureNode[], query: string): ArchitectureNode[] {
  const q = query.toLowerCase();
  return nodes.filter(
    (n) =>
      n.label.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.group.toLowerCase().includes(q)
  );
}
