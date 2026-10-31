# Transaction Architecture Explorer

> Interactive Enterprise Architecture Visualization & Metadata Platform for Fintech Microservices

## Overview

**Transaction Architecture Explorer** is a production-quality internal architecture portal built for fintech engineering teams, architects, QA leads, and technical product managers. It centralizes and visualizes end-to-end transaction lifecycles as services transition from a monolithic legacy system into a modern microservices architecture.

The initial modeled transaction is **Send Money – V1 (Bank Only)**, extracted from the engineering specification diagram at `docs/source/send-money-bank-v1.png`.

---

## Key Features
;
1. **Interactive Architecture Graph (React Flow)**
   - Custom nodes for Microservices, API Endpoints, Databases, Kafka Topics, Decisions, Business Ops, Transaction Statuses, External Integrations, Notification Services, and Journal/Ledgers.
   - Distinct connector styles: solid REST calls, dashed Kafka pub/sub, database connectors, and decision branches.
   - Interactive canvas controls: Pan, Zoom, Fit to View, Minimap, Search & Highlight, Filter by Node Type, and Success Path Isolation.
   - Right-side sliding **Details Panel** inspecting technical contracts, dependencies, and payload definitions.

2. **Transaction Sequence View**
   - Vertical timeline view displaying the strict chronological execution path.
   - Clear visual differentiation between synchronous REST operations and asynchronous Kafka events.
   - Collapsible payload details and direct navigation linking back to graph nodes.

3. **Transaction Status Lifecycle**
   - Visual state machine modeling confirmed status transitions: `NEW` → `INSTRUCTED` → `INSTRUCTION_ACCEPTED` / `INSTRUCTION_REJECTED` / `INSTRUCTION_TIMEOUT` → `SETTLED`.
   - Inspection card showing service mutations, database queries, Kafka events, and recovery mechanisms for each state.

4. **API & Kafka Contract Explorer**
   - Dedicated contract catalog dividing synchronous OpenAPI specifications from asynchronous Kafka event envelopes.
   - One-click clipboard copying of endpoints, topic names, and payload schemas.

5. **Failure Scenarios & Resilience Matrix**
   - Catalog of critical error boundaries: validation failures, partner timeouts, duplicate requests, Kafka publishing failures, and ledger posting compensation.
   - Clear distinction between confirmed terminal failures (`REJECTED`) and ambiguous states (`INSTRUCTION_TIMEOUT`).

6. **Documentation & Source Traceability**
   - In-app markdown and image documentation browser with direct access to canonical diagrams and assumptions tracker.

---

## Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Diagramming Engine:** `@xyflow/react` (React Flow 12)
- **Icons:** `lucide-react`
- **Routing:** `react-router-dom` 7
- **Validation:** Zod 3.24
- **Design System:** Custom Enterprise Fintech CSS (Navy/Slate, modern borders, no decorative noise)

---

## Directory Structure

```text
D:\ARCHITECTURE\
├── architecture/                   # Decoupled Architecture Metadata
│   ├── contracts/
│   │   ├── events/                 # Kafka schemas
│   │   └── openapi/                # OpenAPI REST contracts
│   ├── flows/
│   │   └── send-money/             # Flow metadata (YAML)
│   ├── glossary/                   # Fintech terms
│   ├── integrations/               # External banking partner specs
│   ├── services/                   # Service definitions
│   ├── states/                     # State machine transitions
│   └── workflows/                  # Generic workflow models
├── docs/                           # Architecture Documentation
│   ├── source/
│   │   └── send-money-bank-v1.png  # Canonical reference image
│   ├── architecture-assumptions.md
│   ├── architecture-overview.md
│   ├── metadata-schema.md
│   └── source-extraction-review.md
├── src/
│   ├── components/
│   │   ├── edges/                  # Custom React Flow edges
│   │   ├── layout/                 # TopNav, Sidebar, DetailsPanel, AppLayout
│   │   └── nodes/                  # 10 custom React Flow node components
│   ├── context/                    # ArchitectureContext
│   ├── data/                       # Schemas, Send Money flow, Services
│   ├── hooks/                      # useDetailsPanel
│   ├── pages/                      # Graph, Sequence, Status, API, Failures, Docs
│   ├── styles/                     # CSS design system
│   ├── types/                      # TypeScript definitions
│   ├── utils/                      # Graph conversion & filtering utilities
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ or v20+)
- npm

### 1. Installation

```bash
cd D:\ARCHITECTURE
npm install
```

### 2. Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### 3. Build & Typecheck

```bash
npm run build
```

---

## Architectural Verification Policy

To avoid technical hallucinations:
- Any element not clearly legible from the source diagram is labeled with a **Needs Validation** badge.
- Unverified technical assumptions are formally recorded in `docs/architecture-assumptions.md`.
