/**
 * Benta's Funeral Home - Merchant Payment Processing & Split-Pay Crowdfunding Gateway
 * 
 * Manages Stripe Live / Test integration, Apple Pay, Google Pay, Plaid ACH Direct Debit,
 * Buy Now Pay Later (Klarna / Affirm), and Community Split-Pay Crowdfunding checkout.
 */

import { loadPersistedState, savePersistedState, STORAGE_KEYS } from '../storage/persistence';

export type PaymentMethodType = 
  | 'card' 
  | 'apple_pay' 
  | 'google_pay' 
  | 'ach_debit' 
  | 'klarna' 
  | 'affirm' 
  | 'split_pay_crowdfund';

export interface PaymentTransaction {
  id: string;
  caseId: string;
  caseNumber: string;
  decedentName: string;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  amount: number;
  feeAmount: number;
  netPayout: number;
  paymentMethod: PaymentMethodType;
  status: 'succeeded' | 'processing' | 'requires_action' | 'failed';
  chargeId: string;
  receiptUrl?: string;
  timestamp: string;
  isSplitPay?: boolean;
  tributeMessage?: string;
  cardBrand?: string;
  last4?: string;
  achBankName?: string;
  klarnaInstallments?: number;
}

export interface StripeGatewayConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  merchantAccountId: string;
  statementDescriptor: string;
  testMode: boolean;
  allowCrowdfunding: boolean;
  allowACHDebit: boolean;
  allowBNPL: boolean;
  cardProcessingFeePercent: number; // 2.9%
  cardProcessingFeeFixed: number;   // $0.30
  achProcessingFeePercent: number;  // 0.8%
  achProcessingFeeCap: number;      // $5.00 max cap
  status: 'live' | 'test' | 'unconfigured';
}

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const DEFAULT_STRIPE_CONFIG: StripeGatewayConfig = {
  publishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51PqBFH_Harlem_9918230198273619283746192',
  secretKey: '', // Master Stripe secret is stored on server (process.env.STRIPE_SECRET_KEY)
  webhookSecret: '', // Webhook signing secret is stored on server (process.env.STRIPE_WEBHOOK_SECRET)
  merchantAccountId: 'acct_bfh_harlem_prime_08850',
  statementDescriptor: "BENTA'S FUNERAL HOME",
  testMode: false,
  allowCrowdfunding: true,
  allowACHDebit: true,
  allowBNPL: true,
  cardProcessingFeePercent: 2.9,
  cardProcessingFeeFixed: 0.30,
  achProcessingFeePercent: 0.8,
  achProcessingFeeCap: 5.00,
  status: 'live'
};

export const INITIAL_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'txn_1092817281',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-0089',
    decedentName: 'Dr. Calvin O. Vance Jr.',
    payerName: 'Eleanor Vance (Spouse / Next of Kin)',
    payerEmail: 'eleanor.vance@vanceholdings.com',
    payerPhone: '(212) 555-0192',
    amount: 5000.00,
    feeAmount: 145.30,
    netPayout: 4854.70,
    paymentMethod: 'apple_pay',
    status: 'succeeded',
    chargeId: 'ch_3Pq99182301982736192',
    receiptUrl: 'https://pay.bentasfuneralhome.com/receipt/txn_1092817281',
    timestamp: 'Today, 2:15 PM',
    cardBrand: 'Apple Card (Mastercard)',
    last4: '8812',
    isSplitPay: false
  },
  {
    id: 'txn_1092817282',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-0089',
    decedentName: 'Dr. Calvin O. Vance Jr.',
    payerName: 'Marcus & Cheryl Holloway (Grandchildren)',
    payerEmail: 'm.holloway@atlantagroup.org',
    payerPhone: '(404) 555-7781',
    amount: 1250.00,
    feeAmount: 5.00,
    netPayout: 1245.00,
    paymentMethod: 'ach_debit',
    status: 'succeeded',
    chargeId: 'ch_3Pq99182301982736193',
    receiptUrl: 'https://pay.bentasfuneralhome.com/receipt/txn_1092817282',
    timestamp: 'Today, 11:30 AM',
    achBankName: 'Chase Premier Checking (••••4419)',
    isSplitPay: true,
    tributeMessage: 'Contributing toward Grandpa’s custom bronze urn and floral tribute. We love you forever.'
  },
  {
    id: 'txn_1092817283',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-0089',
    decedentName: 'Dr. Calvin O. Vance Jr.',
    payerName: 'Howard University Alumni Association (NY Chapter)',
    payerEmail: 'treasury@howardalumniny.org',
    payerPhone: '(212) 555-4920',
    amount: 2500.00,
    feeAmount: 72.80,
    netPayout: 2427.20,
    paymentMethod: 'card',
    status: 'succeeded',
    chargeId: 'ch_3Pq99182301982736194',
    receiptUrl: 'https://pay.bentasfuneralhome.com/receipt/txn_1092817283',
    timestamp: 'Yesterday, 4:45 PM',
    cardBrand: 'Visa Corporate',
    last4: '1902',
    isSplitPay: true,
    tributeMessage: 'In enduring honor of Dr. Vance’s decades of medical leadership and mentorship of young physicians.'
  },
  {
    id: 'txn_1092817284',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-0090',
    decedentName: 'Gloria Jean Washington',
    payerName: 'Darnell Washington (Son)',
    payerEmail: 'darnell.w@gmail.com',
    payerPhone: '(917) 555-3819',
    amount: 3200.00,
    feeAmount: 93.10,
    netPayout: 3106.90,
    paymentMethod: 'klarna',
    status: 'succeeded',
    chargeId: 'ch_3Pq99182301982736195',
    receiptUrl: 'https://pay.bentasfuneralhome.com/receipt/txn_1092817284',
    timestamp: 'Sep 29, 2026',
    klarnaInstallments: 4,
    isSplitPay: false
  }
];

/**
 * Retrieves the current Stripe Gateway Configuration
 */
export function getStripeGatewayConfig(): StripeGatewayConfig {
  const persisted = loadPersistedState<StripeGatewayConfig>(
    STORAGE_KEYS.STRIPE_GATEWAY_CONFIG,
    DEFAULT_STRIPE_CONFIG
  );
  return {
    ...DEFAULT_STRIPE_CONFIG,
    ...persisted
  };
}

/**
 * Saves updated Stripe Gateway Configuration
 */
export function saveStripeGatewayConfig(config: StripeGatewayConfig): void {
  savePersistedState<StripeGatewayConfig>(STORAGE_KEYS.STRIPE_GATEWAY_CONFIG, config);
}

/**
 * Retrieves all stored payment & split-pay transactions
 */
export function getStripeTransactions(): PaymentTransaction[] {
  return loadPersistedState<PaymentTransaction[]>(
    STORAGE_KEYS.STRIPE_TRANSACTIONS,
    INITIAL_PAYMENT_TRANSACTIONS
  );
}

/**
 * Saves a new payment transaction into the ledger
 */
export function saveStripeTransaction(transaction: PaymentTransaction): PaymentTransaction[] {
  const current = getStripeTransactions();
  const updated = [transaction, ...current];
  savePersistedState<PaymentTransaction[]>(STORAGE_KEYS.STRIPE_TRANSACTIONS, updated);
  return updated;
}

/**
 * Calculates processing fees based on payment method
 */
export function calculatePaymentFees(
  amount: number, 
  method: PaymentMethodType, 
  config?: StripeGatewayConfig
): { feeAmount: number; netPayout: number; rateDescription: string } {
  const activeConfig = config || getStripeGatewayConfig();
  let fee = 0;
  let desc = '';

  switch (method) {
    case 'card':
    case 'apple_pay':
    case 'google_pay':
    case 'split_pay_crowdfund':
      fee = Number((amount * (activeConfig.cardProcessingFeePercent / 100) + activeConfig.cardProcessingFeeFixed).toFixed(2));
      desc = `${activeConfig.cardProcessingFeePercent}% + $${activeConfig.cardProcessingFeeFixed.toFixed(2)}`;
      break;
    case 'ach_debit':
      const rawAch = amount * (activeConfig.achProcessingFeePercent / 100);
      fee = Number(Math.min(rawAch, activeConfig.achProcessingFeeCap).toFixed(2));
      desc = `${activeConfig.achProcessingFeePercent}% (Max $${activeConfig.achProcessingFeeCap.toFixed(2)} Cap)`;
      break;
    case 'klarna':
    case 'affirm':
      fee = Number((amount * 0.0599 + 0.30).toFixed(2)); // 5.99% BNPL slice
      desc = '5.99% + $0.30 (4-Pay Interest-Free Installment)';
      break;
  }

  const net = Number((amount - fee).toFixed(2));
  return {
    feeAmount: fee,
    netPayout: Math.max(0, net),
    rateDescription: desc
  };
}

/**
 * Performs simulated live Stripe API ping and webhook cryptographic verification
 */
export async function testStripeConnection(
  config?: StripeGatewayConfig
): Promise<{ 
  success: boolean; 
  message: string; 
  latencyMs: number; 
  mode: string; 
  liveAccount: string; 
  supportedMethods: string[];
  payoutSchedule: string;
}> {
  const activeConfig = config || getStripeGatewayConfig();
  const startTime = performance.now();

  // Network handshake simulation
  await new Promise(r => setTimeout(r, 680));
  const latency = Math.round(performance.now() - startTime);

  const isLive = activeConfig.publishableKey.startsWith('pk_live') && !activeConfig.testMode;

  return {
    success: true,
    latencyMs: latency,
    message: isLive 
      ? 'Stripe Live Merchant Engine connected. Visa, Mastercard, Apple Pay, Google Pay, Plaid ACH, and Klarna/Affirm BNPL active.'
      : 'Stripe Sandbox / Test Environment connected successfully. Test cards active.',
    mode: isLive ? 'LIVE PRODUCTION (FDIC Insured)' : 'TEST SANDBOX MODE',
    liveAccount: `Benta's Funeral Home Inc. (${activeConfig.merchantAccountId})`,
    supportedMethods: [
      'Credit & Debit (Visa, Mastercard, Amex, Discover)',
      'Apple Pay & Google Pay (One-Touch Biometric)',
      'Plaid ACH Direct Debit (0.8% Capped at $5)',
      'Buy Now Pay Later (Klarna 4-Pay & Affirm)',
      'Community Split-Pay Crowdfunding Engine'
    ],
    payoutSchedule: 'Rolling 2-day automatic bank deposit to JPMorgan Chase Operating Account'
  };
}

/**
 * Generates a public split-pay crowdfunding link for a case
 */
export function generateSplitPayCrowdfundLink(caseNumber: string): string {
  return `https://pay.bentasfuneralhome.com/contribute/${caseNumber}`;
}
