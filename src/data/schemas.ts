import { z } from 'zod';

export const NodeTypeSchema = z.enum([
  'api-endpoint',
  'microservice',
  'database',
  'kafka-topic',
  'decision',
  'business-operation',
  'transaction-status',
  'external-integration',
  'notification-service',
  'journal-ledger',
]);

export const EdgeTypeSchema = z.enum([
  'rest',
  'kafka-publish',
  'kafka-consume',
  'database-connection',
  'decision-branch',
  'error-path',
]);

export const TransactionStatusSchema = z.enum([
  'NEW',
  'DECLINED',
  'IN_PROGRESS',
  'INSTRUCTION_ACCEPTED',
  'COMPLETED',
  'INSTRUCTION_REJECTED',
  'INSTRUCTION_TIMEOUT',
  'INSTRUCTED',
  'REJECTED',
  'SETTLED',
]);

export const ValidationStatusSchema = z.enum(['confirmed', 'needs-validation', 'assumed']);

export const ApiEndpointSchema = z.object({
  id: z.string(),
  method: z.string(),
  endpoint: z.string(),
  description: z.string(),
  callingService: z.string(),
  receivingService: z.string(),
  requestHeaders: z.record(z.string()),
  requestPayload: z.string(),
  responsePayload: z.string(),
  httpResponseCodes: z.array(z.string()),
  timeoutMs: z.union([z.number(), z.string()]),
  retryConfig: z.string(),
  correlationId: z.string(),
  validationStatus: ValidationStatusSchema,
});

export const KafkaTopicSchema = z.object({
  id: z.string(),
  topicName: z.string(),
  producerService: z.string(),
  consumerServices: z.array(z.string()),
  consumerGroup: z.string(),
  messageKey: z.string(),
  eventSchema: z.string(),
  eventType: z.string(),
  retryStrategy: z.string(),
  deadLetterTopic: z.string(),
  correlationIdPropagation: z.string(),
  validationStatus: ValidationStatusSchema,
});

export const StateTransitionSchema = z.object({
  id: z.string(),
  fromStatus: TransactionStatusSchema,
  toStatus: TransactionStatusSchema,
  trigger: z.string(),
  service: z.string(),
  databaseOperation: z.string(),
  kafkaEvent: z.string(),
  description: z.string(),
  validationStatus: ValidationStatusSchema,
});

export const FlowStepSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  serviceId: z.string(),
  type: z.enum(['api-call', 'processing', 'database-operation', 'kafka-event', 'decision', 'status-update', 'notification', 'journal-processing']),
  isAsync: z.boolean(),
  details: z.record(z.string()),
  nextSteps: z.array(z.string()),
  conditionalNextSteps: z.array(
    z.object({
      condition: z.string(),
      stepId: z.string(),
      validationStatus: ValidationStatusSchema,
    })
  ).optional(),
  validationStatus: ValidationStatusSchema,
});

export const TransactionFlowSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  domain: z.string(),
  entryPoint: z.string(),
  steps: z.array(FlowStepSchema),
  services: z.array(z.string()),
  statuses: z.array(TransactionStatusSchema),
  validationStatus: ValidationStatusSchema,
});

export const FailureScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  failureLocation: z.string(),
  affectedServices: z.array(z.string()),
  resultingState: z.string(),
  retryMechanism: z.string(),
  recoveryAction: z.string(),
  validationStatus: ValidationStatusSchema,
});

export const ArchitectureNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  label: z.string(),
  description: z.string(),
  group: z.string(),
  serviceId: z.string().optional(),
  metadata: z.record(z.string()),
  validationStatus: ValidationStatusSchema,
  position: z.object({ x: z.number(), y: z.number() }),
});

export const ArchitectureEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: EdgeTypeSchema,
  label: z.string(),
  metadata: z.record(z.string()),
  validationStatus: ValidationStatusSchema,
});

export const ArchitectureServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  businessResponsibility: z.string(),
  nodeType: NodeTypeSchema,
  apisExposed: z.array(ApiEndpointSchema),
  apisConsumed: z.array(ApiEndpointSchema),
  kafkaTopicsProduced: z.array(z.string()),
  kafkaTopicsConsumed: z.array(z.string()),
  databaseInteractions: z.array(z.string()),
  upstreamDependencies: z.array(z.string()),
  downstreamDependencies: z.array(z.string()),
  authentication: z.string(),
  errorHandling: z.string(),
  workflowLink: z.string(),
  apiSpecLink: z.string(),
  repositoryLink: z.string(),
  monitoringLink: z.string(),
  validationStatus: ValidationStatusSchema,
});
