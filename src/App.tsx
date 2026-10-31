import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ArchitectureProvider } from '@/context/ArchitectureContext';
import { AppLayout } from '@/components/layout/AppLayout';

import { OverviewPage } from '@/pages/OverviewPage';
import { ArchitectureGraphView } from '@/pages/ArchitectureGraphView';
import { SequenceView } from '@/pages/SequenceView';
import { MicroservicesPage } from '@/pages/MicroservicesPage';
import { ApiEventsExplorer } from '@/pages/ApiEventsExplorer';
import { StatusLifecyclePage } from '@/pages/StatusLifecyclePage';
import { FailureScenariosPage } from '@/pages/FailureScenariosPage';
import { ArchitectureDocsPage } from '@/pages/ArchitectureDocsPage';
import { PlannedFlowPage } from '@/pages/PlannedFlowPage';

import '@/styles/globals.css';
import '@/styles/nodes.css';

export function App() {
  return (
    <ArchitectureProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            
            {/* Primary Live Transaction Flow */}
            <Route path="flow/send-money-bank-v1" element={<ArchitectureGraphView />} />
            <Route path="flow/send-money-bank-v1/sequence" element={<SequenceView />} />

            {/* Planned Transaction Flows */}
            <Route
              path="flow/card-payment"
              element={
                <PlannedFlowPage
                  flowName="Card Payment"
                  domain="Card Services"
                  targetQuarter="Q2 2027"
                  description="Debit/Credit card processing via payment gateway integration and tokenization vault."
                />
              }
            />
            <Route
              path="flow/bank-account-payment"
              element={
                <PlannedFlowPage
                  flowName="Bank Account Payment"
                  domain="Merchant Settlements"
                  targetQuarter="Q3 2027"
                  description="Direct account debit and automated clearing house (ACH) merchant collections."
                />
              }
            />
            <Route
              path="flow/other-transactions"
              element={
                <PlannedFlowPage
                  flowName="Other Transaction Types"
                  domain="Platform Extensions"
                  targetQuarter="Q4 2027"
                  description="Peer-to-peer split payments, scheduled recurring debits, and bill pay integrations."
                />
              }
            />

            {/* Architecture Catalog Views */}
            <Route path="microservices" element={<MicroservicesPage />} />
            <Route path="api-integrations" element={<ApiEventsExplorer />} />
            <Route path="kafka-events" element={<ApiEventsExplorer />} />
            <Route path="status-lifecycle" element={<StatusLifecyclePage />} />
            <Route path="failure-scenarios" element={<FailureScenariosPage />} />
            <Route path="documentation" element={<ArchitectureDocsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ArchitectureProvider>
  );
}

export default App;
