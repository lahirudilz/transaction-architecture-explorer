import type {
  ArchitectureNode,
  ArchitectureEdge,
  TransactionFlow,
  FlowStep,
  StateTransition,
  KafkaTopic,
  FailureScenario,
} from '@/types/architecture';

// ─── TRANSACTION FLOW DEFINITION ─────────────────────────────────────────────

export const sendMoneyFlow: TransactionFlow = {
  id: 'send-money-bank-v1',
  name: 'Send Money – V1 (Bank Only)',
  version: 'V1',
  description:
    'End-to-end Send Money flow across microservices: ' +
    'Mobile App calls customer-transaction-service, which coordinates ipay-core for limits/reference, ' +
    'route-optimizer for bank rails, publishes status changes to CT_TRANSACTION, submits asynchronous payment segment ' +
    'to transaction-processor, consumes segment updates from TP_TRANSACTION, updates ipay-account wallet balance, ' +
    'and dispatches push notifications via NOTIFY topic → notify-service → Firebase FCM → Mobile App.',
  domain: 'Customer Transactions Domain',
  entryPoint: '/customer-transactions/send-money',
  steps: [],
  services: [
    'mobile-app',
    'customer-transaction-service',
    'ipay-core-service',
    'route-optimizer-service',
    'transaction-processor-service',
    'payment-gateway-service',
    'ipay-account-service',
    'notify-service',
    'firebase-fcm',
  ],
  statuses: [
    'NEW',
    'DECLINED',
    'IN_PROGRESS',
    'FUNDS_SECURED',
    'COMPLETED',
  ],
  validationStatus: 'confirmed',
};

// ─── THE 10 EXACT EXECUTION STEPS ────────────────────────────────────────────

export const sendMoneySteps: FlowStep[] = [
  {
    id: 'step-1',
    order: 1,
    title: 'Mobile Calling /send-money',
    description:
      'Mobile calls the /send-money endpoint in the customer-transaction service. Record created in Customer Transaction DB with status = NEW.',
    serviceId: 'customer-transaction-service',
    type: 'api-call',
    isAsync: false,
    details: {
      caller: 'Mobile App',
      target: 'Customer Transaction Service',
      endpoint: 'POST /customer-transactions/send-money',
      protocol: 'HTTPS / REST (Synchronous)',
      initialStatus: 'Customer-Transaction record created with status = NEW',
    },
    nextSteps: ['step-2'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-2',
    order: 2,
    title: 'Obtain ct_transaction_reference',
    description:
      'Customer Transaction Service calls the ipay-core Service to evaluate user limits and obtain a unique ct_transaction_reference.',
    serviceId: 'ipay-core-service',
    type: 'api-call',
    isAsync: false,
    details: {
      caller: 'Customer Transaction Service',
      target: 'ipay-core Service',
      endpoint: 'POST /ipay-core/transaction-reference',
      protocol: 'REST / mTLS',
      payload: 'User ID, Transaction Amount, Channel = MOBILE',
      response: 'ct_transaction_reference issued',
    },
    nextSteps: ['step-3'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-3',
    order: 3,
    title: 'Contact Route Optimizer',
    description:
      'Customer Transaction Service calls the route-optimizer Service to resolve the optimal bank payment rail.',
    serviceId: 'route-optimizer-service',
    type: 'api-call',
    isAsync: false,
    details: {
      caller: 'Customer Transaction Service',
      target: 'route-optimizer Service',
      endpoint: 'POST /route-optimizer/resolve-route',
      protocol: 'REST / mTLS',
      evaluation: 'Source bank vs destination bank clearing route resolution',
    },
    nextSteps: ['step-4'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-4',
    order: 4,
    title: 'Submit Segment to Transaction Engine (Async)',
    description:
      'Customer Transaction Service calls /transaction-processor asynchronously to submit the payment segment to the transaction engine.',
    serviceId: 'transaction-processor-service',
    type: 'api-call',
    isAsync: true,
    details: {
      caller: 'Customer Transaction Service',
      target: 'transaction-processor Service (Transaction Engine)',
      endpoint: 'POST /transaction-processor/pull-segment',
      mode: 'Asynchronous payment segment submission',
    },
    nextSteps: ['step-5'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-5',
    order: 5,
    title: 'Process with Bank Payment Gateway',
    description:
      'Transaction processor invokes the relevant Bank Payment Gateway (ISO 8583 / ISO 20022) to execute bank clearing.',
    serviceId: 'payment-gateway-service',
    type: 'api-call',
    isAsync: true,
    details: {
      caller: 'transaction-processor Service',
      target: 'Bank Payment Gateway',
      protocol: 'ISO 8583 / ISO 20022 Interbank Clearing',
    },
    nextSteps: ['step-6'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-6',
    order: 6,
    title: 'Publish Segment Updates to TP_TRANSACTION',
    description:
      'Transaction processor publishes segment clearing status updates (INSTRUCTION_ACCEPTED) to the TP_TRANSACTION Kafka topic.',
    serviceId: 'transaction-processor-service',
    type: 'kafka-event',
    isAsync: true,
    details: {
      producer: 'transaction-processor Service',
      topic: 'TP_TRANSACTION',
      eventStatus: 'INSTRUCTION_ACCEPTED',
    },
    nextSteps: ['step-7'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-7',
    order: 7,
    title: 'Listen via TP_TRANSACTION Consumer & Update CT Status',
    description:
      'Customer Transaction Service listens to transaction engine updates via the TP_TRANSACTION Kafka consumer. ' +
      'When segment reaches INSTRUCTION_ACCEPTED, Customer-Transaction status updates to FUNDS_SECURED and publishes to CT_TRANSACTION.',
    serviceId: 'customer-transaction-service',
    type: 'kafka-event',
    isAsync: true,
    details: {
      consumer: 'Customer Transaction Service (TP_TRANSACTION Consumer)',
      topic: 'TP_TRANSACTION',
      receivedStatus: 'INSTRUCTION_ACCEPTED',
      ctUpdate: 'Customer-Transaction updated to status = FUNDS_SECURED',
      kafkaPublish: 'PUBLISH to CT_TRANSACTION topic',
    },
    nextSteps: ['step-8'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-8',
    order: 8,
    title: 'Update ipay Account Wallet',
    description:
      'Customer Transaction Service calls the ipay-account Service to update customer wallet balances and ledger records.',
    serviceId: 'ipay-account-service',
    type: 'api-call',
    isAsync: false,
    details: {
      caller: 'Customer Transaction Service',
      target: 'ipay-account Service',
      endpoint: 'POST /ipay-account/balance-update',
      action: 'Debit customer wallet; update double-entry ledger balance',
    },
    nextSteps: ['step-9'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-9',
    order: 9,
    title: 'Publish Push Request to NOTIFY Topic',
    description:
      'Customer Transaction Service publishes notification request to the NOTIFY Kafka topic without altering transaction state.',
    serviceId: 'customer-transaction-service',
    type: 'status-update',
    isAsync: true,
    details: {
      producer: 'Customer Transaction Service',
      topic: 'NOTIFY',
      event: 'AppPushNotificationRequest',
    },
    nextSteps: ['step-10'],
    validationStatus: 'confirmed',
  },
  {
    id: 'step-10',
    order: 10,
    title: 'Consume NOTIFY & Deliver Push via Firebase FCM to Mobile',
    description:
      'notify-service consumes NOTIFY Kafka topic → calls Firebase Cloud Messaging (FCM) API → Firebase FCM pushes final notification banner to Mobile App.',
    serviceId: 'notify-service',
    type: 'notification',
    isAsync: true,
    details: {
      consumer: 'notify-service consumes NOTIFY topic',
      firebaseApi: 'notify-service calls Firebase Cloud Messaging (FCM) HTTP v1 API',
      mobilePush: 'Firebase delivers push notification to Mobile App (iOS / Android)',
      ctPublish: 'Customer Transaction DB updated to COMPLETED; published to CT_TRANSACTION',
    },
    nextSteps: [],
    validationStatus: 'confirmed',
  },
];

// ─── STATE TRANSITIONS ──────────────────────────────────────────────────────

export const stateTransitions: StateTransition[] = [
  {
    id: 'st-ct-new-inprogress',
    fromStatus: 'NEW',
    toStatus: 'IN_PROGRESS',
    trigger: 'Validation passed & ct_transaction_reference obtained from ipay-core',
    service: 'Customer Transaction Service',
    databaseOperation: 'UPDATE customer_transaction SET status = "IN_PROGRESS"',
    kafkaEvent: 'CT_TRANSACTION (status = IN_PROGRESS)',
    description: 'Validation passed. Payment segment is submitted asynchronously to transaction-processor.',
    validationStatus: 'confirmed',
  },
  {
    id: 'st-ct-new-declined',
    fromStatus: 'NEW',
    toStatus: 'DECLINED',
    trigger: 'Limit exceeded, customer verification failed, or route unroutable',
    service: 'Customer Transaction Service',
    databaseOperation: 'UPDATE customer_transaction SET status = "DECLINED"',
    kafkaEvent: 'CT_TRANSACTION (status = DECLINED)',
    description: 'Terminal decline. Kafka message published to CT_TRANSACTION topic.',
    validationStatus: 'confirmed',
  },
  {
    id: 'st-ct-funds-secured',
    fromStatus: 'IN_PROGRESS',
    toStatus: 'FUNDS_SECURED',
    trigger: 'Segment reaches INSTRUCTION_ACCEPTED on TP_TRANSACTION Kafka consumer',
    service: 'Customer Transaction Service (TP_TRANSACTION Kafka Consumer)',
    databaseOperation: 'UPDATE customer_transaction SET status = "FUNDS_SECURED"',
    kafkaEvent: 'CT_TRANSACTION (status = FUNDS_SECURED)',
    description: 'Segment cleared by partner bank. Funds secured; ipay-account updated.',
    validationStatus: 'confirmed',
  },
  {
    id: 'st-ct-completed',
    fromStatus: 'FUNDS_SECURED',
    toStatus: 'COMPLETED',
    trigger: 'Final segment cleared & push notification delivered',
    service: 'Customer Transaction Service',
    databaseOperation: 'UPDATE customer_transaction SET status = "COMPLETED", completed_at = NOW()',
    kafkaEvent: 'CT_TRANSACTION (status = COMPLETED) & NOTIFY',
    description: 'Transaction complete. Push notification delivered via notify-service → Firebase FCM.',
    validationStatus: 'confirmed',
  },
];

// ─── KAFKA TOPICS ────────────────────────────────────────────────────────────

export const kafkaTopics: KafkaTopic[] = [
  {
    id: 'kt-ct-transaction',
    topicName: 'CT_TRANSACTION',
    producerService: 'Customer Transaction Service',
    consumerServices: ['Audit Service', 'Analytics Pipeline', 'CT_TRANSACTION Downstream Consumers'],
    consumerGroup: 'ct-transaction-consumers',
    messageKey: 'ct_transaction_reference',
    eventSchema: 'com.ipay.customer.transaction.v1',
    eventType: 'TransactionStatusChanged (NEW, IN_PROGRESS, FUNDS_SECURED, COMPLETED, DECLINED)',
    retryStrategy: 'Dead-letter topic: CT_TRANSACTION_DLQ, 3 exponential retries',
    deadLetterTopic: 'CT_TRANSACTION_DLQ',
    correlationIdPropagation: 'X-Correlation-ID propagated in Kafka record headers',
    validationStatus: 'confirmed',
  },
  {
    id: 'kt-tp-transaction',
    topicName: 'TP_TRANSACTION',
    producerService: 'transaction-processor Service (Transaction Engine)',
    consumerServices: ['Customer Transaction Service (TP_TRANSACTION Kafka Consumer)'],
    consumerGroup: 'customer-transaction-tp-consumer-group',
    messageKey: 'ct_transaction_reference',
    eventSchema: 'com.ipay.transaction.processor.event.v1',
    eventType: 'SegmentStatusUpdate (INSTRUCTED, INSTRUCTION_ACCEPTED, REJECTED, SETTLED)',
    retryStrategy: 'In-order partition processing with fallback to TP_TRANSACTION_DLQ',
    deadLetterTopic: 'TP_TRANSACTION_DLQ',
    correlationIdPropagation: 'X-Correlation-ID propagated in Kafka record headers',
    validationStatus: 'confirmed',
  },
  {
    id: 'kt-notify',
    topicName: 'NOTIFY',
    producerService: 'Customer Transaction Service',
    consumerServices: ['notify-service'],
    consumerGroup: 'notify-service-push-group',
    messageKey: 'userId',
    eventSchema: 'com.ipay.notification.event.v1',
    eventType: 'AppPushNotificationRequest (COMPLETED final push)',
    retryStrategy: 'Non-blocking retry with exponential backoff to NOTIFY_DLQ',
    deadLetterTopic: 'NOTIFY_DLQ',
    correlationIdPropagation: 'X-Correlation-ID propagated in Kafka record headers',
    validationStatus: 'confirmed',
  },
];

// ─── FAILURE SCENARIOS ───────────────────────────────────────────────────────

export const failureScenarios: FailureScenario[] = [
  {
    id: 'fs-1',
    name: 'Validation Failure / Limit Exceeded',
    description: 'ipay-core rejects reference generation or route-optimizer finds no active bank rail.',
    failureLocation: 'ipay-core / route-optimizer',
    affectedServices: ['Customer Transaction Service', 'Mobile App'],
    resultingState: 'DECLINED',
    retryMechanism: 'Terminal. Client is prompted to adjust amount or try another bank.',
    recoveryAction: 'Customer Transaction DB updated to DECLINED; CT_TRANSACTION event broadcast.',
    validationStatus: 'confirmed',
  },
  {
    id: 'fs-2',
    name: 'Bank Payment Gateway Rejection',
    description: 'External bank gateway returns rejection during segment execution.',
    failureLocation: 'Payment Gateway (BANK)',
    affectedServices: ['transaction-processor Service', 'Customer Transaction Service'],
    resultingState: 'REJECTED (segment level)',
    retryMechanism: 'Non-retryable without customer action.',
    recoveryAction: 'transaction-processor publishes REJECTED to TP_TRANSACTION; CT enters error workflow.',
    validationStatus: 'confirmed',
  },
  {
    id: 'fs-3',
    name: 'Payment Gateway Clearing Timeout',
    description: 'External bank switch fails to respond within the SLA window.',
    failureLocation: 'Payment Gateway (BANK)',
    affectedServices: ['transaction-processor Service', 'Customer Transaction Service'],
    resultingState: 'INSTRUCTED (pending reconciliation)',
    retryMechanism: 'Hold for automated reconciliation or end-of-day net settlement.',
    recoveryAction: 'transaction-processor publishes timeout status to TP_TRANSACTION. Funds are NOT re-pulled.',
    validationStatus: 'confirmed',
  },
  {
    id: 'fs-4',
    name: 'Firebase FCM Gateway Transient Failure',
    description: 'Mobile device offline or Google Firebase FCM gateway encounters transient error.',
    failureLocation: 'Firebase Cloud Messaging (FCM)',
    affectedServices: ['notify-service', 'Firebase FCM', 'Mobile App'],
    resultingState: 'COMPLETED (Transaction status remains COMPLETED)',
    retryMechanism: 'Async retry queue in notify-service; fallback to in-app notification inbox.',
    recoveryAction: 'Transaction status is not blocked because notification is asynchronous.',
    validationStatus: 'confirmed',
  },
];

// ─── GRAPH NODES ─────────────────────────────────────────────────────────────
// Clean, balanced layout with ample distance between blocks (zero overlap):
// Top Tier (y: 30):      ipay-core (x: 380), route-optimizer (x: 780)
// Main Spine (y: 240):   Mobile App (x: 60) ──► Customer Txn (x: 580) ──► Txn Processor (x: 1180) ──► Bank Gateway (x: 1760)
// Mid Tier (y: 500):     Customer Txn DB (x: 380), CT_TRANSACTION (x: 780), TP_TRANSACTION (x: 1180), ipay-account (x: 1760)
// Bottom Tier (y: 760):  Firebase FCM (x: 60) ◄── notify-service (x: 580) ◄── NOTIFY Topic (x: 1180)

export const sendMoneyNodes: ArchitectureNode[] = [
  // ── Client & Push Gateway
  {
    id: 'node-mobile-app',
    type: 'api-endpoint',
    label: 'Mobile App',
    description: 'Initiates Send Money via POST /send-money and receives push notifications from Firebase FCM.',
    group: 'Client Layer',
    serviceId: 'mobile-app',
    metadata: {
      channel: 'iOS / Android',
      entrypoint: 'POST /customer-transactions/send-money',
      pushClient: 'Receives alerts via Firebase FCM',
    },
    validationStatus: 'confirmed',
    position: { x: 60, y: 240 },
  },
  {
    id: 'node-firebase',
    type: 'external-integration',
    label: 'Firebase Cloud Messaging (FCM)',
    description: 'Google Firebase gateway. Receives push requests from notify-service and delivers banners to Mobile App.',
    group: 'External Push Gateway',
    serviceId: 'firebase-fcm',
    metadata: {
      provider: 'Google Cloud Firebase',
      protocol: 'HTTP v1 API / OAuth2',
      pushChannels: 'Android (FCM) & iOS (APNs)',
      caller: 'notify-service',
    },
    validationStatus: 'confirmed',
    position: { x: 60, y: 760 },
  },

  // ── Top Validation Services
  {
    id: 'node-ipay-core-svc',
    type: 'microservice',
    label: 'ipay-core Service',
    description:
      'Step 2: Evaluates customer velocity & limits; issues unique ct_transaction_reference.',
    group: 'Core Domain',
    serviceId: 'ipay-core-service',
    metadata: {
      domain: 'ipay_core_domain',
      output: 'ct_transaction_reference',
      protocol: 'REST / mTLS',
    },
    validationStatus: 'confirmed',
    position: { x: 380, y: 30 },
  },
  {
    id: 'node-route-optimizer-svc',
    type: 'microservice',
    label: 'route-optimizer Service',
    description:
      'Step 3: Resolves optimal banking rail. Failure → DECLINED; Success → IN_PROGRESS.',
    group: 'Routing & Optimization',
    serviceId: 'route-optimizer-service',
    metadata: {
      domain: 'routing_domain',
      output: 'Optimal Payment Rail',
      outcome: 'Pass → IN_PROGRESS / Fail → DECLINED',
    },
    validationStatus: 'confirmed',
    position: { x: 780, y: 30 },
  },

  // ── Core Orchestrator (Main Spine)
  {
    id: 'node-customer-tx-svc',
    type: 'microservice',
    label: 'customer-transaction-service',
    description:
      'Core Orchestrator. Manages CT lifecycle (NEW → DECLINED | IN_PROGRESS → FUNDS_SECURED → COMPLETED). ' +
      'Publishes to CT_TRANSACTION on status change. Consumes TP_TRANSACTION for segment updates.',
    group: 'Customer Transactions Domain',
    serviceId: 'customer-transaction-service',
    metadata: {
      role: '★ Core Orchestrator',
      'CT statuses': 'NEW | IN_PROGRESS | FUNDS_SECURED | COMPLETED | DECLINED',
      'Kafka producer': 'CT_TRANSACTION & NOTIFY',
      'Kafka consumer': 'TP_TRANSACTION (segment status updates)',
    },
    validationStatus: 'confirmed',
    position: { x: 580, y: 240 },
  },

  // ── Mid Tier: DB & Kafka Topics
  {
    id: 'node-customer-tx-db',
    type: 'database',
    label: 'Customer Transaction DB',
    description:
      'Persists CT records and child segment rows. Tracks lifecycle status transitions.',
    group: 'Persistence Layer',
    metadata: {
      table: 'customer_transaction',
      'CT record': 'status: NEW | IN_PROGRESS | FUNDS_SECURED | COMPLETED | DECLINED',
      'Persistence': 'Relational DB Audit Trail',
    },
    validationStatus: 'confirmed',
    position: { x: 380, y: 500 },
  },
  {
    id: 'node-kafka-ct-transaction',
    type: 'kafka-topic',
    label: 'Kafka Topic: CT_TRANSACTION',
    description:
      'Topic receiving Customer Transaction status changes: NEW, IN_PROGRESS, FUNDS_SECURED, COMPLETED, DECLINED.',
    group: 'Kafka Event Bus',
    metadata: {
      topic: 'CT_TRANSACTION',
      producer: 'customer-transaction-service',
      statuses: 'NEW | IN_PROGRESS | FUNDS_SECURED | COMPLETED | DECLINED',
      rule: 'Broadcast on EVERY CT status transition',
    },
    validationStatus: 'confirmed',
    position: { x: 780, y: 500 },
  },

  // ── Transaction Engine Spine
  {
    id: 'node-transaction-processor-svc',
    type: 'microservice',
    label: 'transaction-processor Service',
    description:
      'Transaction Engine. Asynchronously executes payment segment via Bank Payment Gateway. Publishes to TP_TRANSACTION.',
    group: 'IPG Domain (Transaction Engine)',
    serviceId: 'transaction-processor-service',
    metadata: {
      role: '★ Transaction Engine',
      segment: 'Submits payment segment to clearing switch',
      'Kafka producer': 'TP_TRANSACTION topic',
    },
    validationStatus: 'confirmed',
    position: { x: 1180, y: 240 },
  },
  {
    id: 'node-payment-gateway',
    type: 'external-integration',
    label: 'Bank Payment Gateway',
    description:
      'External commercial bank clearing switch / LankaPay CEFT. Executes interbank fund transfers.',
    group: 'External Financial Infrastructure',
    serviceId: 'payment-gateway-service',
    metadata: {
      network: 'Commercial Bank API / LankaPay CEFT',
      protocol: 'ISO 8583 / ISO 20022',
      responses: 'INSTRUCTION_ACCEPTED | REJECTED | Timeout',
    },
    validationStatus: 'confirmed',
    position: { x: 1760, y: 240 },
  },

  // ── Mid Tier Right: TP_TRANSACTION Topic & Ledger
  {
    id: 'node-kafka-tp-transaction',
    type: 'kafka-topic',
    label: 'Kafka Topic: TP_TRANSACTION',
    description:
      'Published by transaction-processor with segment status updates. Consumed by Customer Transaction Service to update CT status.',
    group: 'Kafka Event Bus',
    metadata: {
      topic: 'TP_TRANSACTION',
      producer: 'transaction-processor-service',
      consumer: 'customer-transaction-service (TP Consumer)',
      events: 'INSTRUCTED | INSTRUCTION_ACCEPTED | REJECTED | SETTLED',
    },
    validationStatus: 'confirmed',
    position: { x: 1180, y: 500 },
  },
  {
    id: 'node-ipay-account-svc',
    type: 'microservice',
    label: 'ipay-account Service',
    description:
      'Step 8: Debits customer wallet balance and updates internal double-entry ledgers upon FUNDS_SECURED.',
    group: 'ipay-account Domain',
    serviceId: 'ipay-account-service',
    metadata: {
      action: 'Debit customer wallet balance; update ledger',
      trigger: 'After segment INSTRUCTION_ACCEPTED',
      protocol: 'REST / mTLS',
    },
    validationStatus: 'confirmed',
    position: { x: 1760, y: 500 },
  },

  // ── Bottom Notification Row
  {
    id: 'node-notify-svc',
    type: 'notification-service',
    label: 'notify-service',
    description:
      'Consumes NOTIFY Kafka topic and calls Firebase Cloud Messaging (FCM) to deliver push notifications to Mobile App.',
    group: 'Notification Domain',
    serviceId: 'notify-service',
    metadata: {
      consumes: 'NOTIFY Kafka Topic',
      downstream: 'Calls Firebase Cloud Messaging (FCM)',
      trigger: 'Transaction COMPLETED push notification',
    },
    validationStatus: 'confirmed',
    position: { x: 580, y: 760 },
  },
  {
    id: 'node-kafka-notify',
    type: 'kafka-topic',
    label: 'Kafka Topic: NOTIFY',
    description:
      'Published by Customer Txn Service upon COMPLETED. Consumed by notify-service for push notifications.',
    group: 'Kafka Event Bus',
    metadata: {
      topic: 'NOTIFY',
      producer: 'customer-transaction-service',
      consumer: 'notify-service',
      event: 'AppPushNotificationRequest (COMPLETED)',
    },
    validationStatus: 'confirmed',
    position: { x: 1180, y: 760 },
  },
];

// ─── GRAPH EDGES ─────────────────────────────────────────────────────────────
// Clean, non-overlapping routing:
// - Step 4 is a direct, bold horizontal line from customer-transaction-service to transaction-processor
// - Single line to CT_TRANSACTION
// - TP_TRANSACTION consumer connects visibly back into customer-transaction-service
// - Full notification loop across the bottom: NOTIFY → notify-service → Firebase FCM → Mobile App

export const sendMoneyEdges: ArchitectureEdge[] = [
  // ── Step 1: Mobile → Customer Txn Svc
  {
    id: 'edge-step-1',
    source: 'node-mobile-app',
    target: 'node-customer-tx-svc',
    sourceHandle: 'source-right',
    targetHandle: 'target-left',
    type: 'rest',
    label: '① POST /send-money',
    metadata: { step: '1', protocol: 'HTTPS REST', caller: 'Mobile App' },
    validationStatus: 'confirmed',
  },

  // ── DB: Insert NEW record
  {
    id: 'edge-db-new',
    source: 'node-customer-tx-svc',
    target: 'node-customer-tx-db',
    sourceHandle: 'source-bottom',
    targetHandle: 'target-top',
    type: 'database-connection',
    label: 'Insert status = NEW',
    metadata: { operation: 'INSERT', status: 'NEW' },
    validationStatus: 'confirmed',
  },

  // ── Step 2: Customer Txn Svc → ipay-core
  {
    id: 'edge-step-2',
    source: 'node-customer-tx-svc',
    target: 'node-ipay-core-svc',
    sourceHandle: 'source-top',
    targetHandle: 'target-bottom',
    type: 'rest',
    label: '② Obtain ct_transaction_reference',
    metadata: { step: '2', protocol: 'REST mTLS', target: 'ipay-core' },
    validationStatus: 'confirmed',
  },

  // ── Step 3: Customer Txn Svc → route-optimizer
  {
    id: 'edge-step-3',
    source: 'node-customer-tx-svc',
    target: 'node-route-optimizer-svc',
    sourceHandle: 'source-top',
    targetHandle: 'target-bottom',
    type: 'rest',
    label: '③ Contact route-optimizer',
    metadata: { step: '3', protocol: 'REST mTLS', target: 'route-optimizer' },
    validationStatus: 'confirmed',
  },

  // ── Step 4: Customer Txn Svc → transaction-processor (Submit Segment Async)
  {
    id: 'edge-step-4',
    source: 'node-customer-tx-svc',
    target: 'node-transaction-processor-svc',
    sourceHandle: 'source-right',
    targetHandle: 'target-left',
    type: 'rest',
    label: '④ Submit segment to transaction engine (async)',
    metadata: { step: '4', protocol: 'REST (async job)', action: 'Submit segment to engine' },
    validationStatus: 'confirmed',
  },

  // ── Step 5: transaction-processor → Bank Payment Gateway
  {
    id: 'edge-step-5',
    source: 'node-transaction-processor-svc',
    target: 'node-payment-gateway',
    sourceHandle: 'source-right',
    targetHandle: 'target-left',
    type: 'rest',
    label: '⑤ Process with Bank Payment Gateway',
    metadata: { step: '5', protocol: 'ISO 8583 / ISO 20022' },
    validationStatus: 'confirmed',
  },

  // ── Step 6: transaction-processor publishes segment status to TP_TRANSACTION
  {
    id: 'edge-step-6',
    source: 'node-transaction-processor-svc',
    target: 'node-kafka-tp-transaction',
    sourceHandle: 'source-bottom',
    targetHandle: 'target-top',
    type: 'kafka-publish',
    label: '⑥ Publish segment status updates',
    metadata: { step: '6', topic: 'TP_TRANSACTION', segmentStatus: 'INSTRUCTION_ACCEPTED' },
    validationStatus: 'confirmed',
  },

  // ── Step 7: TP_TRANSACTION is CONSUMED by customer-transaction-service
  {
    id: 'edge-step-7',
    source: 'node-kafka-tp-transaction',
    target: 'node-customer-tx-svc',
    sourceHandle: 'source-left',
    targetHandle: 'target-bottom',
    type: 'kafka-consume',
    label: '⑦ Listen via TP_TRANSACTION Consumer (INSTRUCTION_ACCEPTED)',
    metadata: { step: '7', topic: 'TP_TRANSACTION', consumer: 'customer-transaction-service' },
    validationStatus: 'confirmed',
  },

  // ── Step 8: Customer Txn Svc → ipay-account Service
  {
    id: 'edge-step-8',
    source: 'node-customer-tx-svc',
    target: 'node-ipay-account-svc',
    sourceHandle: 'source-right',
    targetHandle: 'target-left',
    type: 'rest',
    label: '⑧ Update ipay account wallet',
    metadata: { step: '8', protocol: 'REST mTLS', target: 'ipay-account' },
    validationStatus: 'confirmed',
  },

  // ── Step 9: Publish to NOTIFY Kafka topic
  {
    id: 'edge-step-9',
    source: 'node-customer-tx-svc',
    target: 'node-kafka-notify',
    sourceHandle: 'source-bottom',
    targetHandle: 'target-top',
    type: 'kafka-publish',
    label: '⑨ Publish push request to NOTIFY',
    metadata: { step: '9', topic: 'NOTIFY', event: 'AppPushNotificationRequest' },
    validationStatus: 'confirmed',
  },

  // ── Step 10a: notify-service consumes NOTIFY Kafka topic
  {
    id: 'edge-step-10a-notify-consume',
    source: 'node-kafka-notify',
    target: 'node-notify-svc',
    sourceHandle: 'source-left',
    targetHandle: 'target-right',
    type: 'kafka-consume',
    label: '⑩ Consume NOTIFY topic',
    metadata: { step: '10', consumer: 'notify-service', topic: 'NOTIFY' },
    validationStatus: 'confirmed',
  },

  // ── Step 10b: notify-service calls Firebase Cloud Messaging (FCM)
  {
    id: 'edge-step-10b-firebase',
    source: 'node-notify-svc',
    target: 'node-firebase',
    sourceHandle: 'source-left',
    targetHandle: 'target-right',
    type: 'rest',
    label: '⑩ Call Firebase FCM API',
    metadata: { step: '10', protocol: 'HTTP v1 API / OAuth2', caller: 'notify-service', target: 'Firebase FCM' },
    validationStatus: 'confirmed',
  },

  // ── Step 10c: Firebase FCM delivers push notification to Mobile App
  {
    id: 'edge-step-10c-mobile-push',
    source: 'node-firebase',
    target: 'node-mobile-app',
    sourceHandle: 'source-top',
    targetHandle: 'target-bottom',
    type: 'rest',
    label: '⑩ Deliver Push Notification to Mobile App',
    metadata: { step: '10', protocol: 'FCM / APNS Persistent Push', caller: 'Firebase FCM', target: 'Mobile App' },
    validationStatus: 'confirmed',
  },

  // ── ONE SINGLE LINE TO CT_TRANSACTION
  {
    id: 'edge-ct-transaction-publish',
    source: 'node-customer-tx-svc',
    target: 'node-kafka-ct-transaction',
    sourceHandle: 'source-bottom',
    targetHandle: 'target-top',
    type: 'kafka-publish',
    label: 'Publish CT_TRANSACTION on status change (DECLINED / IN_PROGRESS / FUNDS_SECURED / COMPLETED)',
    metadata: {
      topic: 'CT_TRANSACTION',
      rule: 'Customer-Transaction produces to CT_TRANSACTION on EVERY status change',
    },
    validationStatus: 'confirmed',
  },
];
