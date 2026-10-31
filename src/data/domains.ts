// Domain and workflow catalog extracted from Draw.io migration specifications

export interface DomainInfo {
  id: string;
  name: string;
  drawioFile: string;
  description: string;
  status: 'migrated' | 'in-progress' | 'planned';
  workflowsCount: number;
  workflows: WorkflowItem[];
}

export interface WorkflowItem {
  id: string;
  title: string;
  domainId: string;
  status: 'active' | 'in-progress' | 'planned' | 'deprecated';
  description: string;
}

export const DOMAINS: DomainInfo[] = [
  {
    id: 'customer-transactions-domain',
    name: 'Customer Transactions Domain',
    drawioFile: 'customer_transactions_domain.drawio',
    description: 'Core financial transactions initiated by consumers including P2P send money, payments, reversals, and rollbacks.',
    status: 'migrated',
    workflowsCount: 22,
    workflows: [
      { id: 'send-money-v1-bank', title: 'Send Money - V1 (Bank only)', domainId: 'customer-transactions-domain', status: 'active', description: 'Bank-to-bank customer transfer via ipay-core, route-optimizer, transaction-processor, and notify-service.' },
      { id: 'send-money-v2-cards', title: 'Send Money - V2 (Bank and Cards)', domainId: 'customer-transactions-domain', status: 'in-progress', description: 'Extended transfer supporting credit and debit card pull segments.' },
      { id: 'make-payment', title: 'Make Payment', domainId: 'customer-transactions-domain', status: 'planned', description: 'Consumer bill and utility payment workflow.' },
      { id: 'make-payment-external', title: 'Make Payment to External Merchant ?', domainId: 'customer-transactions-domain', status: 'planned', description: 'Merchant-directed external payment orchestration.' },
      { id: 'send-anyone-reversal', title: 'Send Anyone - Reversal', domainId: 'customer-transactions-domain', status: 'planned', description: 'Automated reversal processing for unclaimed transfers.' },
      { id: 'record-rollback', title: 'Record Rollback', domainId: 'customer-transactions-domain', status: 'planned', description: 'Compensating ledger transaction on processing exceptions.' },
      { id: 'exception-handler', title: 'Exception_handler', domainId: 'customer-transactions-domain', status: 'planned', description: 'Centralized error recovery, dead-letter routing, and manual retry handler.' },
      { id: 'create-cust-pay-ref', title: 'Create Customer Payment Reference', domainId: 'customer-transactions-domain', status: 'planned', description: 'Generates idempotency references for payment tracking.' },
      { id: 'validate-cust-pay-ref', title: 'Validate Customer Payment Reference', domainId: 'customer-transactions-domain', status: 'planned', description: 'Pre-flight reference authorization and duplicate checks.' },
      { id: 'update-merchant-cust-pay', title: 'Update Merchant for Customer Payment', domainId: 'customer-transactions-domain', status: 'planned', description: 'Merchant balance and ledger notification.' },
      { id: 'register-payment-cust-pay', title: 'Register Payment for Customer Payment', domainId: 'customer-transactions-domain', status: 'planned', description: 'Persists settled state in customer transaction ledger.' },
      { id: 'pr-reference-kafka-consumer', title: 'PR_REFERENCE Kafka Consumer', domainId: 'customer-transactions-domain', status: 'planned', description: 'Asynchronous payment reference event consumer.' },
      { id: 'void-payment', title: 'VOID_PAYMENT', domainId: 'customer-transactions-domain', status: 'planned', description: 'Immediate same-day payment cancellation.' },
      { id: 'reverse-customer-payment', title: 'REVERSE CUSTOMER PAYMENT', domainId: 'customer-transactions-domain', status: 'planned', description: 'Post-settlement customer refund workflow.' },
      { id: 'generic-fund-transfer', title: 'GENERIC_FUND_TRANSFER', domainId: 'customer-transactions-domain', status: 'planned', description: 'Foundational fund transfer pipeline.' },
      { id: 'ct-transaction-consumer', title: 'CT_TRANSACTION consumer for Money ...', domainId: 'customer-transactions-domain', status: 'planned', description: 'Domain-level status consumer and audit logger.' },
    ],
  },
  {
    id: 'ipay-account-domain',
    name: 'ipay Account Domain',
    drawioFile: 'ipay-account-domain.drawio',
    description: 'Digital wallet and user balance management, account state mutations, and internal ledger accounts.',
    status: 'migrated',
    workflowsCount: 8,
    workflows: [],
  },
  {
    id: 'fees-domain',
    name: 'Fees Domain',
    drawioFile: 'fees_domain.drawio',
    description: 'Fee calculations, commission tier lookups, and transfer of fees collected to treasury.',
    status: 'migrated',
    workflowsCount: 6,
    workflows: [],
  },
  {
    id: 'ipg-domain',
    name: 'IPG Domain (Payment Gateway)',
    drawioFile: 'ipg_domain.drawio',
    description: 'Direct integrations with commercial bank gateways, VISA/Mastercard switches, and LankaPay network.',
    status: 'migrated',
    workflowsCount: 12,
    workflows: [],
  },
  {
    id: 'payment-reference-domain',
    name: 'Payment Reference Domain',
    drawioFile: 'Payment_reference_domain.drawio',
    description: 'Unique reference generation, QR string encoding, and inter-service idempotency tokens.',
    status: 'migrated',
    workflowsCount: 5,
    workflows: [],
  },
  {
    id: 'merchant-transaction-domain',
    name: 'Merchant Transaction Domain',
    drawioFile: 'merchant_transaction_domain.drawio',
    description: 'Merchant cash-out, POS terminal payments, dynamic QR invoice settlement, and merchant portals.',
    status: 'in-progress',
    workflowsCount: 14,
    workflows: [],
  },
  {
    id: 'net-settlement-domain',
    name: 'Net Settlement Domain',
    drawioFile: 'Net Settlement.drawio',
    description: 'End-of-day clearing, interbank reconciliation, and central bank netting files.',
    status: 'in-progress',
    workflowsCount: 4,
    workflows: [],
  },
  {
    id: 'lanka-qr-domain',
    name: 'Lanka QR Domain',
    drawioFile: 'Lanka QR.drawio',
    description: 'National EMVCo QR code processing, static and dynamic payload decoding.',
    status: 'migrated',
    workflowsCount: 7,
    workflows: [],
  },
  {
    id: 'customer-limit-calculator',
    name: 'Customer Transaction Limit Calculator',
    drawioFile: 'Customer Transaction Limit Calculator.drawio',
    description: 'Real-time velocity limits, KYC level ceilings, and anti-fraud threshold evaluations.',
    status: 'migrated',
    workflowsCount: 3,
    workflows: [],
  },
];
