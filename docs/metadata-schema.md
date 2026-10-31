# Architecture Metadata Schema Guide

## Overview

The Transaction Architecture Explorer enforces a metadata-driven approach. Adding a new transaction workflow (such as *Card Payment* or *Bank Account Payment*) primarily requires defining metadata files in YAML without writing new React layout components.

---

## Schema Models (Zod Validation)

All metadata schemas are declared in `src/data/schemas.ts` and can be validated during continuous integration or local builds.

### 1. `TransactionFlow`

```typescript
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
  validationStatus: 'confirmed' | 'needs-validation' | 'assumed';
}
```

### 2. `ArchitectureService`

```typescript
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
  validationStatus: ValidationStatus;
}
```

### 3. `FlowStep`

```typescript
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
```

### 4. `StateTransition`

```typescript
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
```

### 5. `FailureScenario`

```typescript
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
```
