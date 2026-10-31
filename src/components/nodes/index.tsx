import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { Globe, Server, Database, Radio, GitBranch, Cog, CircleDot, ExternalLink, Bell, BookOpen, Layers } from 'lucide-react';
import { BaseNode, type BaseNodeData } from './BaseNode';

export function ApiEndpointNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="api-endpoint"
      typeLabel="Client App / API"
      icon={<Globe size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function MicroserviceNode({ data, selected }: NodeProps) {
  const serviceId = (data as unknown as BaseNodeData).serviceId;
  const isCore = serviceId === 'customer-transaction-service';
  const isEngine = serviceId === 'transaction-processor-service';

  let typeLabel = 'Microservice';
  let customClass = '';

  if (isCore) {
    typeLabel = '★ Core Orchestrator';
    customClass = 'microservice-core';
  } else if (isEngine) {
    typeLabel = '★ Transaction Engine';
    customClass = 'microservice-engine';
  }

  return (
    <BaseNode
      nodeType="microservice"
      typeLabel={typeLabel}
      customClass={customClass}
      icon={<Server size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function DatabaseNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="database"
      typeLabel="Database Store"
      icon={<Database size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function KafkaTopicNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="kafka-topic"
      typeLabel="Kafka Event Topic"
      icon={<Radio size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function DecisionNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="decision"
      typeLabel="Routing Decision"
      icon={<GitBranch size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function BusinessOperationNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="business-operation"
      typeLabel="Business Operation"
      icon={<Cog size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function TransactionStatusNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="transaction-status"
      typeLabel="Transaction Status"
      icon={<CircleDot size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function ExternalIntegrationNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="external-integration"
      typeLabel="External Clearing Switch"
      icon={<ExternalLink size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function NotificationServiceNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="notification-service"
      typeLabel="Notification Microservice"
      icon={<Bell size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export function JournalLedgerNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      nodeType="journal-ledger"
      typeLabel="Ledger & Settlement"
      icon={<BookOpen size={16} />}
      data={data as unknown as BaseNodeData}
      selected={selected}
    />
  );
}

export const nodeTypes = {
  apiEndpoint: ApiEndpointNode,
  microservice: MicroserviceNode,
  database: DatabaseNode,
  kafkaTopic: KafkaTopicNode,
  decision: DecisionNode,
  businessOperation: BusinessOperationNode,
  transactionStatus: TransactionStatusNode,
  externalIntegration: ExternalIntegrationNode,
  notificationService: NotificationServiceNode,
  journalLedger: JournalLedgerNode,
};
