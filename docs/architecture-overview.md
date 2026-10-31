# Architecture Overview: Send Money – V1 (Bank Only)

## Executive Summary

The Send Money V1 (Bank Only) workflow orchestrates a customer-initiated fund transfer across generic microservices decomposed from a legacy fintech monolith. The orchestration is coordinated by the **Customer Transaction Service**, which interacts with dedicated domain services via synchronous REST and manages transaction states asynchronously across three Kafka topics: `CT_TRANSACTION`, `TP_TRANSACTION`, and `NOTIFY`.

---

## 1. Domain Decomposition & Microservices

| Service | Domain | Role & Key Responsibilities |
|---|---|---|
| **Mobile App (Client)** | Client Layer | Calls `POST /customer-transactions/send-money`. Receives FCM/APNS push notifications from notify-service. |
| **customer-transaction-service** | `customer_transactions_domain` | **★ Core Orchestrator.** Creates CT records (`status = NEW`), coordinates reference generation and routing, submits payment segments asynchronously to the transaction engine, updates CT status on `TP_TRANSACTION` updates, and broadcasts every CT status change to `CT_TRANSACTION`. |
| **ipay-core-service** | `ipay_core_domain` | Obtains unique `ct_transaction_reference` and evaluates customer velocity and transaction limits. |
| **route-optimizer-service** | `routing_domain` | Resolves the optimal bank clearing payment rail. Failure triggers `DECLINED` path. |
| **transaction-processor-service** | `ipg_domain` (Transaction Engine) | Processes payment segments (`PULL`, `INTER_BANK`, `PUSH`) asynchronously by calling external Bank Payment Gateways. Publishes segment status lifecycle events to `TP_TRANSACTION`. |
| **Payment Gateway (BANK)** | External Infrastructure | Commercial Bank API / LankaPay CEFT interbank switch executing actual clearing. |
| **ipay-account-service** | `ipay-account-domain` | Debits customer wallet balance and updates internal double-entry ledgers upon `FUNDS_SECURED`. |
| **notify-service** | Notification Domain | Consumes `NOTIFY` Kafka topic and delivers real-time push notifications to the mobile device. |

---

## 2. Multi-Segment Payment Architecture

Each Send Money transaction consists of **at least 2** and **at most 3** payment segments:
- **PULL** (Mandatory): Pulls funds from the customer's source bank account.
- **INTER_BANK** (Optional): Intermediary clearing transfer between financial institutions (only present in 3-segment transactions).
- **PUSH** (Mandatory): Pushes funds to the beneficiary destination account.

### Segment-Level Lifecycle (`TP_TRANSACTION`)

Each individual segment undergoes the following progression:
```
NEW → INSTRUCTED | REJECTED → INSTRUCTION_ACCEPTED → SETTLED
```

---

## 3. Customer-Transaction (CT) Lifecycle & Kafka Triggers

The overall Customer-Transaction record maintains its own lifecycle, which progresses in lockstep with segment milestones:

```
NEW 
  │
  ├──[Validation Failure]──► DECLINED (Terminal)
  │                            └─► Published to CT_TRANSACTION
  │
  └──[Validation Success]──► IN_PROGRESS
                               └─► Published to CT_TRANSACTION
                               └─► PULL segment submitted to /transaction-processor (async)
                                     │
                                     ▼
                              [PULL segment reaches INSTRUCTION_ACCEPTED on TP_TRANSACTION]
                                     │
                                     ▼
                             FUNDS_SECURED
                               └─► Published to CT_TRANSACTION
                               └─► Next segment (INTER_BANK or PUSH) submitted to transaction engine
                               └─► ipay-account wallet balance updated
                                     │
                                     ▼
                              [PUSH segment reaches INSTRUCTION_ACCEPTED on TP_TRANSACTION]
                                     │
                                     ▼
                              COMPLETED (Terminal Success)
                               └─► Published to CT_TRANSACTION
                               └─► Published to NOTIFY
                               └─► notify-service delivers push notification to Mobile App
```

> **Mandatory Rule:** On **EVERY** Customer-Transaction status change (`NEW`, `IN_PROGRESS`, `FUNDS_SECURED`, `COMPLETED`, `DECLINED`), an event is published to the `CT_TRANSACTION` Kafka topic.

---

## 4. Kafka Topics Specification

1. **`CT_TRANSACTION`**
   - **Producer:** `customer-transaction-service`
   - **Consumers:** Audit Service, Analytics Pipeline, Downstream Ledger Consumers
   - **Partition Key:** `ct_transaction_reference`
   - **Events Broadcast:** `NEW`, `IN_PROGRESS`, `FUNDS_SECURED`, `COMPLETED`, `DECLINED`
   - **Dead Letter Topic:** `CT_TRANSACTION_DLQ`

2. **`TP_TRANSACTION`**
   - **Producer:** `transaction-processor-service` (Transaction Engine)
   - **Consumer:** `customer-transaction-service` (TP_TRANSACTION Kafka Consumer)
   - **Partition Key:** `ct_transaction_reference`
   - **Events Broadcast:** `INSTRUCTED`, `INSTRUCTION_ACCEPTED`, `REJECTED`, `SETTLED`
   - **Dead Letter Topic:** `TP_TRANSACTION_DLQ`

3. **`NOTIFY`**
   - **Producer:** `customer-transaction-service`
   - **Consumer:** `notify-service`
   - **Partition Key:** `userId`
   - **Events Broadcast:** `AppPushNotificationRequest` (final `COMPLETED` confirmation)
   - **Dead Letter Topic:** `NOTIFY_DLQ`
