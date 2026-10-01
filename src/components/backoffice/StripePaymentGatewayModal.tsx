import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Share2, 
  ArrowUpRight, 
  Building2, 
  Heart, 
  Eye,
  EyeOff,
  Radio,
  CheckCircle
} from 'lucide-react';
import { GoldenRecordCase, SplitBillingItem } from '../../lib/types/funeral';
import { 
  getStripeGatewayConfig, 
  saveStripeGatewayConfig, 
  getStripeTransactions, 
  saveStripeTransaction,
  testStripeConnection, 
  calculatePaymentFees,
  generateSplitPayCrowdfundLink,
  PaymentTransaction, 
  PaymentMethodType, 
  StripeGatewayConfig 
} from '../../lib/services/stripePaymentService';

interface StripePaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: GoldenRecordCase[];
  activeCase?: GoldenRecordCase | null;
  selectedCaseId?: string;
  onSendNotification?: (notif: any) => void;
  onUpdateCaseBilling?: (caseId: string, splitBilling: SplitBillingItem[]) => void;
}

export const StripePaymentGatewayModal: React.FC<StripePaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  cases,
  activeCase,
  selectedCaseId,
  onSendNotification,
  onUpdateCaseBilling
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'pos' | 'crowdfund' | 'ledger' | 'settings'>('pos');

  // Selected Case
  const [selectedCase, setSelectedCase] = useState<GoldenRecordCase>(() => {
    if (activeCase) return activeCase;
    if (selectedCaseId) {
      const match = cases.find(c => c.id === selectedCaseId);
      if (match) return match;
    }
    return cases[0] || {} as GoldenRecordCase;
  });

  // Config & Transactions State
  const [config, setConfig] = useState<StripeGatewayConfig>(() => getStripeGatewayConfig());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => getStripeTransactions());

  // POS Payment Terminal Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [chargeAmount, setChargeAmount] = useState<number>(() => {
    const total = selectedCase?.totalAmountDue || 8500;
    const paid = selectedCase?.splitBilling?.reduce((acc, curr) => acc + (curr.amountAllocated || 0), 0) || 0;
    return Math.max(0, total - paid) || 2500;
  });
  const [payerName, setPayerName] = useState<string>(selectedCase?.informant?.fullName || 'Eleanor Vance');
  const [payerEmail, setPayerEmail] = useState<string>(selectedCase?.informant?.email || 'eleanor.vance@vanceholdings.com');
  const [payerPhone, setPayerPhone] = useState<string>(selectedCase?.informant?.phone || '(212) 555-0192');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [cardZip, setCardZip] = useState('10027');

  // ACH Bank Inputs
  const [achBank, setAchBank] = useState('Chase Premier Checking');
  const [achAccountNum, setAchAccountNum] = useState('•••• 4419');
  const [achRoutingNum, setAchRoutingNum] = useState('021000021');

  // Processing status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<PaymentTransaction | null>(null);

  // Split-Pay Crowdfunding Form State
  const [crowdfundGoal, setCrowdfundGoal] = useState<number>(selectedCase?.totalAmountDue || 13500);
  const [crowdfundAmount, setCrowdfundAmount] = useState<number>(250);
  const [crowdfundDonorName, setCrowdfundDonorName] = useState('');
  const [crowdfundDonorEmail, setCrowdfundDonorEmail] = useState('');
  const [crowdfundDonorPhone, setCrowdfundDonorPhone] = useState('');
  const [crowdfundMessage, setCrowdfundMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [crowdfundToast, setCrowdfundToast] = useState<string | null>(null);

  // Settings State
  const [pubKeyInput, setPubKeyInput] = useState(config.publishableKey);
  const [secKeyInput, setSecKeyInput] = useState(config.secretKey);
  const [showSecKey, setShowSecKey] = useState(false);
  const [webhookInput, setWebhookInput] = useState(config.webhookSecret);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [merchantIdInput, setMerchantIdInput] = useState(config.merchantAccountId);
  const [statementDescriptorInput, setStatementDescriptorInput] = useState(config.statementDescriptor);
  const [testModeInput, setTestModeInput] = useState(config.testMode);

  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ 
    success: boolean; 
    message: string; 
    latencyMs?: number; 
    mode?: string; 
    liveAccount?: string; 
    supportedMethods?: string[];
    payoutSchedule?: string;
  } | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Fee calculation for current charge
  const feeDetails = calculatePaymentFees(chargeAmount, paymentMethod, config);

  // Current case balances
  const contractTotal = selectedCase?.totalAmountDue || 0;
  const totalPaid = selectedCase?.splitBilling?.reduce((acc, curr) => acc + (curr.amountAllocated || 0), 0) || 0;
  const balanceRemaining = Math.max(0, contractTotal - totalPaid);

  const crowdfundLink = generateSplitPayCrowdfundLink(selectedCase?.caseNumber || 'BFH-2026-0089');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(crowdfundLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chargeAmount <= 0) return;

    setIsProcessing(true);
    // Simulate Stripe 3D Secure / Plaid ACH authorization latency
    await new Promise(r => setTimeout(r, 1100));

    const newTxn: PaymentTransaction = {
      id: `txn_${Date.now().toString().slice(-10)}`,
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      decedentName: selectedCase.decedent.legalName,
      payerName: payerName.trim(),
      payerEmail: payerEmail.trim(),
      payerPhone: payerPhone.trim(),
      amount: chargeAmount,
      feeAmount: feeDetails.feeAmount,
      netPayout: feeDetails.netPayout,
      paymentMethod,
      status: 'succeeded',
      chargeId: `ch_3Pq${Date.now().toString().slice(-16)}`,
      receiptUrl: `https://pay.bentasfuneralhome.com/receipt/txn_${Date.now().toString().slice(-10)}`,
      timestamp: 'Just now',
      cardBrand: paymentMethod === 'card' ? 'Visa Signature' : paymentMethod === 'apple_pay' ? 'Apple Card' : undefined,
      last4: paymentMethod === 'card' || paymentMethod === 'apple_pay' ? '4242' : undefined,
      achBankName: paymentMethod === 'ach_debit' ? achBank : undefined,
      klarnaInstallments: paymentMethod === 'klarna' ? 4 : undefined,
      isSplitPay: false
    };

    const updatedTxns = saveStripeTransaction(newTxn);
    setTransactions(updatedTxns);
    setPaymentSuccessReceipt(newTxn);
    setIsProcessing(false);

    // Update case billing allocation if callback provided
    if (onUpdateCaseBilling) {
      const newSplitItem: SplitBillingItem = {
        payerType: paymentMethod === 'ach_debit' ? 'Family ACH Direct' : 'Credit Card',
        providerName: `Stripe Live (${paymentMethod.toUpperCase()})`,
        policyNumber: newTxn.chargeId,
        amountAllocated: chargeAmount,
        status: 'verified_active',
        notes: `Processed via Stripe Terminal. Payer: ${payerName}. Receipt: ${newTxn.id}`
      };
      const existing = selectedCase.splitBilling || [];
      onUpdateCaseBilling(selectedCase.id, [...existing, newSplitItem]);
    }

    // Trigger Twilio SMS receipt alert
    if (onSendNotification) {
      onSendNotification({
        id: `notif-stripe-${Date.now()}`,
        caseId: selectedCase.id,
        decedentName: selectedCase.decedent.legalName,
        recipientName: payerName,
        recipientPhone: payerPhone || '(212) 281-8850',
        channel: 'sms',
        type: 'portal_update',
        title: '💳 Payment Received & Receipt Generated',
        bodyText: `BENTA PAYMENT RECEIPT: $${chargeAmount.toLocaleString()} successfully received for ${selectedCase.decedent.legalName} via ${paymentMethod.toUpperCase()}. Transaction ID: ${newTxn.id}. Remaining balance: $${Math.max(0, balanceRemaining - chargeAmount).toLocaleString()}.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }
  };

  const handleProcessCrowdfundContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (crowdfundAmount <= 0 || !crowdfundDonorName.trim()) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 850));

    const fees = calculatePaymentFees(crowdfundAmount, 'split_pay_crowdfund', config);

    const newTxn: PaymentTransaction = {
      id: `cf_${Date.now().toString().slice(-10)}`,
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      decedentName: selectedCase.decedent.legalName,
      payerName: `${crowdfundDonorName.trim()} (Community Contributor)`,
      payerEmail: crowdfundDonorEmail.trim() || 'contributor@harlemcommunity.org',
      payerPhone: crowdfundDonorPhone.trim(),
      amount: crowdfundAmount,
      feeAmount: fees.feeAmount,
      netPayout: fees.netPayout,
      paymentMethod: 'split_pay_crowdfund',
      status: 'succeeded',
      chargeId: `ch_cf_${Date.now().toString().slice(-16)}`,
      receiptUrl: `https://pay.bentasfuneralhome.com/receipt/cf_${Date.now().toString().slice(-10)}`,
      timestamp: 'Just now',
      isSplitPay: true,
      tributeMessage: crowdfundMessage.trim() || 'Sending warmth and heartfelt prayers to the family.'
    };

    const updatedTxns = saveStripeTransaction(newTxn);
    setTransactions(updatedTxns);
    setIsProcessing(false);
    setCrowdfundToast(`🎉 Thank you! $${crowdfundAmount} contribution processed for the ${selectedCase.decedent.legalName} Memorial Fund.`);
    
    // Reset form
    setCrowdfundDonorName('');
    setCrowdfundDonorEmail('');
    setCrowdfundDonorPhone('');
    setCrowdfundMessage('');
    setTimeout(() => setCrowdfundToast(null), 4500);

    // Update case split-billing
    if (onUpdateCaseBilling) {
      const newSplitItem: SplitBillingItem = {
        payerType: 'Credit Card',
        providerName: `Community Split-Pay (${newTxn.payerName})`,
        policyNumber: newTxn.chargeId,
        amountAllocated: crowdfundAmount,
        status: 'verified_active',
        notes: `Crowdfund tribute contribution. Message: "${newTxn.tributeMessage}"`
      };
      const existing = selectedCase.splitBilling || [];
      onUpdateCaseBilling(selectedCase.id, [...existing, newSplitItem]);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testStripeConnection({
      ...config,
      publishableKey: pubKeyInput.trim(),
      secretKey: secKeyInput.trim(),
      webhookSecret: webhookInput.trim(),
      merchantAccountId: merchantIdInput.trim(),
      statementDescriptor: statementDescriptorInput.trim(),
      testMode: testModeInput
    });
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StripeGatewayConfig = {
      ...config,
      publishableKey: pubKeyInput.trim(),
      secretKey: secKeyInput.trim(),
      webhookSecret: webhookInput.trim(),
      merchantAccountId: merchantIdInput.trim(),
      statementDescriptor: statementDescriptorInput.trim(),
      testMode: testModeInput,
      status: testModeInput ? 'test' : 'live'
    };
    saveStripeGatewayConfig(updated);
    setConfig(updated);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // Split-Pay totals for active case
  const caseTransactions = transactions.filter(t => t.caseId === selectedCase.id || t.caseNumber === selectedCase.caseNumber);
  const totalRaisedCrowdfund = caseTransactions.filter(t => t.isSplitPay).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold text-emerald-100">
                  Stripe Merchant Terminal & Split-Pay Crowdfunding Gateway
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  PCI-DSS LEVEL 1 • 256-BIT ENCRYPTION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Merchant: <span className="text-emerald-300 font-medium">{config.statementDescriptor}</span> ({config.merchantAccountId}) • Rails: Apple Pay, Google Pay, Plaid ACH & Klarna BNPL
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Case Selector Dropdown */}
            {cases.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs shadow-sm">
                <span className="text-slate-400 font-semibold hidden md:inline">Account:</span>
                <select
                  value={selectedCase.id}
                  onChange={(e) => {
                    const found = cases.find(c => c.id === e.target.value);
                    if (found) {
                      setSelectedCase(found);
                      setPayerName(found.informant?.fullName || 'Eleanor Vance');
                      setPayerEmail(found.informant?.email || 'family@vanceholdings.com');
                      setPayerPhone(found.informant?.phone || '(212) 555-0192');
                      setChargeAmount(Math.max(0, found.totalAmountDue - (found.splitBilling?.reduce((acc, curr) => acc + (curr.amountAllocated || 0), 0) || 0)) || 2500);
                      setCrowdfundGoal(found.totalAmountDue || 13500);
                    }
                  }}
                  className="bg-slate-900 border border-slate-600 text-emerald-300 font-bold rounded-lg px-2.5 py-1 text-xs outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.decedent.legalName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pos'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Virtual POS Terminal & Fast Pay</span>
          </button>

          <button
            onClick={() => setActiveTab('crowdfund')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'crowdfund'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Split-Pay Crowdfunding Hub</span>
            {totalRaisedCrowdfund > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-bold">
                ${totalRaisedCrowdfund.toLocaleString()}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Transaction Ledger & Payouts</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Stripe API & Webhook Gateway</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: VIRTUAL POS TERMINAL */}
          {activeTab === 'pos' && (
            <div className="space-y-6">
              
              {/* Account Balance Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 uppercase font-semibold">NYS AP-47 Contract Total</span>
                  <div className="text-2xl font-serif font-bold text-slate-100">${contractTotal.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">100% Itemized Agreement</span>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Allocated / Paid</span>
                  <div className="text-2xl font-serif font-bold text-emerald-400">${totalPaid.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-500/90 font-medium">Insurance / ACH / Card</span>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-800/90 to-amber-950/20">
                  <span className="text-xs text-amber-300 uppercase font-semibold">Balance Remaining</span>
                  <div className="text-2xl font-serif font-bold text-amber-200">${balanceRemaining.toLocaleString()}</div>
                  <span className="text-[10px] text-amber-300/80 font-medium">Due prior to disposition</span>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Payment Rail Status</span>
                    <div className="text-sm font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Terminal Ready
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Auto 2-Day Deposit to Chase Checking
                  </div>
                </div>
              </div>

              {/* Payment Success Receipt Card */}
              {paymentSuccessReceipt && (
                <div className="bg-emerald-950/50 border-2 border-emerald-500 p-5 rounded-2xl animate-scaleUp">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-bold">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-emerald-100">
                          Payment Succeeded: ${paymentSuccessReceipt.amount.toLocaleString()}
                        </h4>
                        <p className="text-xs text-emerald-300/90">
                          Transaction ID: <span className="font-mono font-semibold">{paymentSuccessReceipt.id}</span> • Charge ID: <span className="font-mono">{paymentSuccessReceipt.chargeId}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPaymentSuccessReceipt(null)}
                      className="text-xs bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 px-3 py-1 rounded-lg border border-emerald-600 cursor-pointer"
                    >
                      Dismiss Receipt
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between text-xs text-emerald-200 gap-2">
                    <div>Payer: <strong>{paymentSuccessReceipt.payerName}</strong> ({paymentSuccessReceipt.payerEmail})</div>
                    <div>Net Payout: <strong>${paymentSuccessReceipt.netPayout.toLocaleString()}</strong> (Fee: ${paymentSuccessReceipt.feeAmount.toFixed(2)})</div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={paymentSuccessReceipt.receiptUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="underline hover:text-white flex items-center gap-1"
                      >
                        <span>View Stripe Customer Receipt</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Terminal Checkout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Form: Method Selection & Input */}
                <div className="lg:col-span-7 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-5">
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Select Payment Method & Authorization
                  </h3>

                  {/* Payment Method Selector Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'card', label: 'Credit / Debit', icon: '💳', desc: 'Visa, MC, Amex (2.9% + 30¢)' },
                      { id: 'apple_pay', label: 'Apple Pay', icon: '', desc: 'One-Touch Biometric' },
                      { id: 'google_pay', label: 'Google Pay', icon: 'GPay', desc: 'Instant Wallet' },
                      { id: 'ach_debit', label: 'Plaid ACH Direct', icon: '🏛️', desc: '0.8% (Capped at $5)' },
                      { id: 'klarna', label: 'Klarna 4-Pay', icon: '🛍️', desc: '4 Interest-Free Slices' },
                      { id: 'affirm', label: 'Affirm Monthly', icon: '📅', desc: '3, 6, 12-Month Terms' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethodType)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === m.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-950/30'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold">{m.icon}</span>
                          <span className="text-xs font-bold">{m.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleProcessPayment} className="space-y-4">
                    {/* Amount Input with Quick Presets */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Charge Amount (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={chargeAmount}
                          onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-bold text-white outline-none focus:border-emerald-500 font-mono"
                          required
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[500, 1000, 2500, balanceRemaining].filter(v => v > 0).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setChargeAmount(preset)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                          >
                            {preset === balanceRemaining ? `Full Balance ($${preset.toLocaleString()})` : `$${preset.toLocaleString()}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Cardholder / Payer Name
                        </label>
                        <input
                          type="text"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Receipt Email Address
                        </label>
                        <input
                          type="email"
                          value={payerEmail}
                          onChange={(e) => setPayerEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Method-Specific Input Fields */}
                    {(paymentMethod === 'card' || paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') && (
                      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Stripe Elements Payment Input</span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <Lock className="w-3 h-3" /> PCI-DSS Tokenized
                          </span>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number (4242 •••• •••• 4242)"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVC"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            value={cardZip}
                            onChange={(e) => setCardZip(e.target.value)}
                            placeholder="Postal Zip"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'ach_debit' && (
                      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Plaid Micro-Deposit / Instant Account Link</span>
                          <span className="text-[10px] text-emerald-400">Lowest Fee Rail (0.8% Max $5)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Financial Institution</label>
                            <input
                              type="text"
                              value={achBank}
                              onChange={(e) => setAchBank(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Routing Number (ABA)</label>
                            <input
                              type="text"
                              value={achRoutingNum}
                              onChange={(e) => setAchRoutingNum(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Account Number</label>
                            <input
                              type="text"
                              value={achAccountNum}
                              onChange={(e) => setAchAccountNum(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(paymentMethod === 'klarna' || paymentMethod === 'affirm') && (
                      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-2 text-xs">
                        <div className="font-bold text-amber-300">Buy Now Pay Later Installment Plan</div>
                        <p className="text-slate-300">
                          The family will receive a secure SMS invite to complete <strong>4 interest-free payments of ${(chargeAmount / 4).toFixed(2)}</strong> every two weeks via Klarna. Benta&apos;s Funeral Home receives full settlement in 2 business days.
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isProcessing || chargeAmount <= 0}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/40 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Authorizing via Stripe Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Charge ${chargeAmount.toLocaleString()} with Stripe ({paymentMethod.toUpperCase()})</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Summary Card: Fee Transparency & Net Payout */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Interchange Fee & Net Settlement
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Gross Transaction Amount:</span>
                        <span className="font-bold text-white font-mono">${chargeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>Stripe Interchange Fee ({feeDetails.rateDescription}):</span>
                        <span className="font-mono text-red-400">-${feeDetails.feeAmount.toFixed(2)}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-700 flex justify-between text-sm">
                        <span className="font-bold text-emerald-300">Net Deposit to BFH Checking:</span>
                        <span className="font-bold text-emerald-300 font-mono text-base">${feeDetails.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
                      <div className="font-bold text-slate-300">Settlement Target:</div>
                      <div>JPMorgan Chase Operating Account (•••• 0885)</div>
                      <div>Estimated Bank Availability: <strong>Within 48 Hours</strong></div>
                    </div>
                  </div>

                  {/* Shareable Split-Pay SMS Link Card */}
                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      Family Split-Pay Payment Link
                    </h4>
                    <p className="text-xs text-slate-400">
                      Send a secure mobile payment link directly to family members to contribute their share toward the contract.
                    </p>

                    <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-700 text-xs">
                      <input
                        type="text"
                        readOnly
                        value={crowdfundLink}
                        className="bg-transparent text-emerald-300 font-mono text-xs flex-1 outline-none truncate"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1 border border-slate-600 transition cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPLIT-PAY CROWDFUNDING HUB */}
          {activeTab === 'crowdfund' && (
            <div className="space-y-6">
              
              {/* Campaign Header & Progress Bar */}
              <div className="bg-gradient-to-br from-slate-800 to-emerald-950/40 p-6 rounded-2xl border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Memorial Fund & Community Support</span>
                    <h3 className="text-xl font-serif font-bold text-white">
                      Celebration of Life Memorial Campaign for {selectedCase.decedent.legalName}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Case Number: <span className="font-mono text-amber-300">{selectedCase.caseNumber}</span> • Arranging Family: {selectedCase.informant.fullName}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-serif font-bold text-emerald-300 font-mono">
                      ${totalRaisedCrowdfund.toLocaleString()} <span className="text-sm font-sans text-slate-400 font-normal">raised</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Goal: ${crowdfundGoal.toLocaleString()} ({Math.min(100, Math.round((totalRaisedCrowdfund / crowdfundGoal) * 100))}% Funded)
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(8, (totalRaisedCrowdfund / crowdfundGoal) * 100))}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-1">
                  <div>{caseTransactions.filter(t => t.isSplitPay).length} Loving Community Contributions</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 rounded-lg border border-emerald-500/50 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Shareable Memorial Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {crowdfundToast && (
                <div className="bg-emerald-950/80 border border-emerald-500 p-4 rounded-xl text-xs text-emerald-200 font-medium flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{crowdfundToast}</span>
                </div>
              )}

              {/* Direct Contribution Simulator & Recent Tributes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form to submit community tribute payment */}
                <div className="lg:col-span-6 bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Simulate Remote Community Contribution
                  </h4>

                  <form onSubmit={handleProcessCrowdfundContribution} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Contribution Amount (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={crowdfundAmount}
                          onChange={(e) => setCrowdfundAmount(parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-base font-bold text-white outline-none focus:border-emerald-500 font-mono"
                          required
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[50, 100, 250, 500, 1000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setCrowdfundAmount(val)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                          >
                            ${val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Contributor / Donor Name
                        </label>
                        <input
                          type="text"
                          value={crowdfundDonorName}
                          onChange={(e) => setCrowdfundDonorName(e.target.value)}
                          placeholder="e.g. Marcus Holloway"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Email (for Stripe Receipt)
                        </label>
                        <input
                          type="email"
                          value={crowdfundDonorEmail}
                          onChange={(e) => setCrowdfundDonorEmail(e.target.value)}
                          placeholder="m.holloway@example.com"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Condolence Tribute Message (Will appear in family ledger)
                      </label>
                      <textarea
                        rows={3}
                        value={crowdfundMessage}
                        onChange={(e) => setCrowdfundMessage(e.target.value)}
                        placeholder="Share a loving memory or prayer for the family..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing || crowdfundAmount <= 0 || !crowdfundDonorName.trim()}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md border border-emerald-400/40 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing Community Contribution...</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 text-red-300" />
                          <span>Submit & Post ${crowdfundAmount} Memorial Gift</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right: Stream of Contributor Messages */}
                <div className="lg:col-span-6 bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-4 flex flex-col">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Recent Community Contributors</span>
                    <span className="text-xs font-mono text-emerald-400">{caseTransactions.filter(t => t.isSplitPay).length} gifts</span>
                  </h4>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
                    {caseTransactions.filter(t => t.isSplitPay).length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        No community contributions yet. Share the campaign link to invite loved ones to contribute.
                      </div>
                    ) : (
                      caseTransactions.filter(t => t.isSplitPay).map((t) => (
                        <div key={t.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{t.payerName}</span>
                            <span className="font-mono text-xs font-bold text-emerald-300">+${t.amount.toLocaleString()}</span>
                          </div>
                          {t.tributeMessage && (
                            <p className="text-xs text-slate-300 italic font-serif bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                              &ldquo;{t.tributeMessage}&rdquo;
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{t.timestamp}</span>
                            <span className="font-mono text-emerald-500">Verified Paid</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION LEDGER & PAYOUTS */}
          {activeTab === 'ledger' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Stripe Enterprise Transaction Ledger
                  </h3>
                  <p className="text-xs text-slate-400">
                    Audit log of credit cards, digital wallets, ACH transfers, and split-pay crowdfunding payouts.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert(`Exporting ${transactions.length} transactions to CSV Ledger...`)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-slate-800/70 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Transaction / Time</th>
                        <th className="py-3 px-4">Case / Decedent</th>
                        <th className="py-3 px-4">Payer / Contributor</th>
                        <th className="py-3 px-4">Method & Rail</th>
                        <th className="py-3 px-4 text-right">Gross</th>
                        <th className="py-3 px-4 text-right">Stripe Fee</th>
                        <th className="py-3 px-4 text-right">Net Payout</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-white">{t.id}</div>
                            <div className="text-[10px] text-slate-500">{t.timestamp}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-200">{t.decedentName}</div>
                            <div className="font-mono text-[10px] text-amber-400">{t.caseNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-200">{t.payerName}</div>
                            <div className="text-[10px] text-slate-400">{t.payerEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 font-semibold text-[10px] text-emerald-300">
                              {t.paymentMethod.replace(/_/g, ' ')}
                            </span>
                            {t.cardBrand && <div className="text-[10px] text-slate-400 mt-0.5">{t.cardBrand} ••{t.last4}</div>}
                            {t.achBankName && <div className="text-[10px] text-slate-400 mt-0.5">{t.achBankName}</div>}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-red-400">
                            -${t.feeAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            ${t.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                              SUCCEEDED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STRIPE API & WEBHOOK GATEWAY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-400" />
                      Stripe Live Merchant Credentials & Webhooks
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure your Stripe live API keys to accept Apple Pay, Google Pay, Plaid ACH transfers, and split payments.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Environment:</span>
                    <button
                      type="button"
                      onClick={() => setTestModeInput(!testModeInput)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                        testModeInput
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      }`}
                    >
                      {testModeInput ? 'TEST / SANDBOX' : 'LIVE PRODUCTION'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Stripe Publishable Key ({testModeInput ? 'pk_test_...' : 'pk_live_...'})
                    </label>
                    <input
                      type="text"
                      value={pubKeyInput}
                      onChange={(e) => setPubKeyInput(e.target.value)}
                      placeholder="pk_live_..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Stripe Secret Key ({testModeInput ? 'sk_test_...' : 'sk_live_...'})
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400 font-medium">Server Protected</span>
                        <button
                          type="button"
                          onClick={() => setShowSecKey(!showSecKey)}
                          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {showSecKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <input
                      type={showSecKey ? 'text' : 'password'}
                      value={secKeyInput}
                      onChange={(e) => setSecKeyInput(e.target.value)}
                      placeholder="Stored on server (STRIPE_SECRET_KEY)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Stripe Webhook Signing Secret (whsec_...)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400 font-medium">Server Protected</span>
                        <button
                          type="button"
                          onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                      placeholder="Stored on server (STRIPE_WEBHOOK_SECRET)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Merchant Account ID
                      </label>
                      <input
                        type="text"
                        value={merchantIdInput}
                        onChange={(e) => setMerchantIdInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Credit Card Statement Descriptor
                      </label>
                      <input
                        type="text"
                        value={statementDescriptorInput}
                        onChange={(e) => setStatementDescriptorInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {saveSuccessToast && (
                    <div className="bg-emerald-950/80 border border-emerald-500 p-3 rounded-xl text-xs text-emerald-200 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Stripe live configuration saved and persistent!</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm border border-emerald-400/40 transition cursor-pointer"
                    >
                      Save Stripe Gateway Credentials
                    </button>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>Test Stripe API Handshake</span>
                    </button>
                  </div>
                </form>

                {/* Test Handshake Result */}
                {testResult && (
                  <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/40 space-y-2 animate-fadeIn text-xs">
                    <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{testResult.mode} Verified ({testResult.latencyMs}ms Latency)</span>
                    </div>
                    <p className="text-slate-300">{testResult.message}</p>
                    <div className="text-slate-400 text-[11px] pt-1">
                      Account: <strong>{testResult.liveAccount}</strong> • Payouts: {testResult.payoutSchedule}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Stripe Connect Merchant Engine • Benta&apos;s Funeral Home Inc.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Close Hub
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
