# Architecture Assumptions & Needs Validation Tracker

## Verification Policy

In accordance with enterprise engineering governance, no microservice names, Kafka topics, REST endpoints, database schemas, or business conditions have been fabricated.

Whenever a section in `docs/source/send-money-bank-v1.png` is low-resolution, blurred, or truncated, it is explicitly tagged as **Needs Validation** in the codebase and registered in this log.

---

## Log of Unverified & Assumed Attributes

| Item ID | Component | Field / Parameter | Source Value | Status | Working Assumption & Verification Step |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VAL-001** | `customer-transactions/send-money` | Request & Response Schema | Inferred from context | **Needs Validation** | Payload JSON includes `sourceAccountId`, `targetBankCode`, `targetAccountNumber`, `amount`, `currency`. Needs confirmation with API specs. |
| **VAL-002** | Kafka Event Bus | Topic Name | `customer-transaction-status-updates` | **Needs Validation** | Text references "Kafka Customer Txn Status". Exact topic naming standard (e.g. `fintech.customer-tx.status-v1`) needs validation. |
| **VAL-003** | Kafka Event Bus | Consumer Group Names | Unreadable | **Needs Validation** | Assumed separate consumer groups for Notification and Journal services to enable independent replay. |
| **VAL-004** | Instruction Service | SLA Timeout Threshold | Visible transition: `INSTRUCTION_TIMEOUT` | **Needs Validation** | Assumed 5000ms watchdog timer before triggering timeout reconciliation. |
| **VAL-005** | Decision Diamonds | Business Logic Expressions | Symbols legible, text blurred | **Needs Validation** | Inferred validation of customer KYC status, velocity limits, and account status. |
| **VAL-006** | Journal / Ledger Service | Fee Transfer Mechanism | Labeled "Transfer of Fees Collected" | **Needs Validation** | Assumed asynchronous posting via internal ledger account debits/credits. |
| **VAL-007** | Databases | Schema and RDBMS engine | Database symbols visible | **Needs Validation** | Modeled as transactional PostgreSQL or Spanner tables. |
