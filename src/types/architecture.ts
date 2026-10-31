// Core type definitions for the Transaction Architecture Explorer

export type NodeType =
  | 'api-endpoint'
  | 'microservice'
  | 'database'
  | 'kafka-topic'
  | 'decision'
  | 'business-operation'
  | 'transaction-status'
  | 'external-integration'
  | 'notification-service'
  | 'journal-ledger';

export type EdgeType =
  | 'rest'
  | 'kafka-publish'
  | 'kafka-consume'
  | 'database-connection'
  | 'decision-branch'
  | 'error-path';

export type TransactionStatus =
  | 'NEW'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'FUNDS_SECURED'
  | 'COMPLETED'
  | 'INSTRUCTED'
  | 'REJECTED'
  | 'INSTRUCTION_ACCEPTED'
  | 'INSTRUCTION_REJECTED'
  | 'SETTLED'
  | 'INSTRUCTION_TIMEOUT';

export type SegmentType = 'PULL' | 'INTER_BANK' | 'PUSH';

export interface TransactionSegment {
  id: string;
  type: SegmentType;
  name: string;
  description: string;
  isMandatory: boolean;
  statusLifecycle: {
    initial: 'NEW';
    dispatched: 'INSTRUCTED' | 'REJECTED';
    acknowledged: 'INSTRUCTION_ACCEPTED' | 'INSTRUCTION_REJECTED' | 'INSTRUCTION_TIMEOUT';
    final: 'SETTLED';
  };
  currentStatus: TransactionStatus;
  submittingService: string;
  processingEngine: string;
  kafkaTopic: string;
  clearingGateway: string;
}

export type ValidationStatus = 'confirmed' | 'needs-validation' | 'assumed';

export interface ArchitectureService {
  id: string;
  name: string;
  description: string;
  businessResponsibility: string;
  nodeType: NodeType;
  apisExposed: ApiEndpoint[];
  apisConsumed: ApiEndpoint[];
  kafkaTopicsProduced: string[];
  kafkaTopicsConsumed: string[];
  databaseInteractions: string[];
  upstreamDependencies: string[];
  downstreamDependencies: string[];
  authentication: string;
  errorHandling: string;
  workflowLink: string;
  apiSpecLink: string;
  repositoryLink: string;
  monitoringLink: string;
  validationStatus: ValidationStatus;
}

export interface ApiEndpoint {
  id: string;
  method: string;
  endpoint: string;
  description: string;
  callingService: string;
  receivingService: string;
  requestHeaders: Record<string, string>;
  requestPayload: string;
  responsePayload: string;
  httpResponseCodes: string[];
  timeoutMs: number | string;
  retryConfig: string;
  correlationId: string;
  validationStatus: ValidationStatus;
}

export interface KafkaTopic {
  id: string;
  topicName: string;
  producerService: string;
  consumerServices: string[];
  consumerGroup: string;
  messageKey: string;
  eventSchema: string;
  eventType: string;
  retryStrategy: string;
  deadLetterTopic: string;
  correlationIdPropagation: string;
  validationStatus: ValidationStatus;
}

export interface StateTransition {
  id: string;
  fromStatus: TransactionStatus;
  toStatus: TransactionStatus;
  trigger: string;
  service: string;
  databaseOperation: string;
  kafkaEvent: string;
  description: string;
  validationStatus: ValidationStatus;
}

export interface FlowStep {
  id: string;
  order: number;
  title: string;
  description: string;
  serviceId: string;
  type: 'api-call' | 'processing' | 'database-operation' | 'kafka-event' | 'decision' | 'status-update' | 'notification' | 'journal-processing';
  isAsync: boolean;
  details: Record<string, string>;
  nextSteps: string[];
  conditionalNextSteps?: { condition: string; stepId: string; validationStatus: ValidationStatus }[];
  validationStatus: ValidationStatus;
}

export interface TransactionFlow {
  id: string;
  name: string;
  version: string;
  description: string;
  domain: string;
  entryPoint: string;
  steps: FlowStep[];
  services: string[];
  statuses: TransactionStatus[];
  segments?: TransactionSegment[];
  validationStatus: ValidationStatus;
}

export interface FailureScenario {
  id: string;
  name: string;
  description: string;
  failureLocation: string;
  affectedServices: string[];
  resultingState: string;
  retryMechanism: string;
  recoveryAction: string;
  validationStatus: ValidationStatus;
}

export interface ArchitectureNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  group: string;
  serviceId?: string;
  metadata: Record<string, string>;
  validationStatus: ValidationStatus;
  position: { x: number; y: number };
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: EdgeType;
  label: string;
  metadata: Record<string, string>;
  validationStatus: ValidationStatus;
}

export interface SelectedNodeData {
  nodeType: NodeType;
  service?: ArchitectureService;
  api?: ApiEndpoint;
  kafka?: KafkaTopic;
  node: ArchitectureNode;
}

export interface SelectedEdgeData {
  edge: ArchitectureEdge;
  api?: ApiEndpoint;
  kafka?: KafkaTopic;
}
