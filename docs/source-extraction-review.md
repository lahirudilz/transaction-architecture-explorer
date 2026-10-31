# Source Extraction Review: send-money-bank-v1.png

## Source Artifact Traceability

- **Reference Image:** `docs/source/send-money-bank-v1.png`
- **Audit Date:** 2026-10-30
- **Workflow Title:** Send Money – V1 (Bank Only)

---

## 1. Confirmed Legible Elements

The following elements were distinctly identified and transcribed into `src/data/send-money-flow.ts` and `architecture/flows/send-money/flow.yaml`:

1. **API Entry:** `customer-transactions/send-money`
2. **Domain:** Customer Transaction
3. **Primary Coordinator:** Customer Transaction Manager
4. **Operation:** Customer transaction record creation
5. **Initial Status:** `NEW`
6. **State Transitions:**
   - `NEW` → `INSTRUCTED`
   - `NEW` → `REJECTED`
   - `INSTRUCTED` → `INSTRUCTION_ACCEPTED`
   - `INSTRUCTED` → `INSTRUCTION_REJECTED`
   - `INSTRUCTED` → `INSTRUCTION_TIMEOUT`
   - `INSTRUCTION_ACCEPTED` → `SETTLED`
7. **Messaging:** Kafka-based customer transaction status updates
8. **Final Operations:**
   - Journal / Ledger processing
   - App Notification
   - Transfer of Fees Collected
9. **Notes:** Section labeled "Notes on Customer Txn Rules" in bottom-left

---

## 2. Illegible / Low-Resolution Elements Marked "Needs Validation"

1. **Intermediate Table Grids:** Several tabular cards display columns (such as "Field", "Description") with illegible text. These are captured as placeholder metadata blocks tagged `Needs Validation`.
2. **Specific Error Codes:** Exact numeric or alphanumeric error codes returned by external clearing houses are unreadable.
3. **Kafka Partitioning Strategy:** Diagram implies event publishing but does not explicitly document message partitioning key or partition count.
