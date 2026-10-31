import { useState, useCallback } from 'react';
import type { ArchitectureNode, ArchitectureEdge, SelectedNodeData, SelectedEdgeData } from '@/types/architecture';
import { getServiceById } from '@/data/services';
import { kafkaTopics } from '@/data/send-money-flow';

export function useDetailsPanel() {
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdgeData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const onNodeSelect = useCallback((node: ArchitectureNode) => {
    const service = node.serviceId ? getServiceById(node.serviceId) : undefined;
    const kafka = node.type === 'kafka-topic'
      ? kafkaTopics.find((kt) => kt.topicName === node.metadata['topicName'])
      : undefined;

    setSelectedNode({
      nodeType: node.type,
      service,
      kafka,
      node,
    });
    setSelectedEdge(null);
    setIsPanelOpen(true);
  }, []);

  const onEdgeSelect = useCallback((edge: ArchitectureEdge) => {
    setSelectedEdge({ edge });
    setSelectedNode(null);
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  return {
    selectedNode,
    selectedEdge,
    isPanelOpen,
    onNodeSelect,
    onEdgeSelect,
    closePanel,
  };
}
