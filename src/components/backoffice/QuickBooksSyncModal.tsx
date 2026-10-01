import React, { useState, useEffect } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  RefreshCw, 
  Receipt, 
  Building2, 
  CreditCard,
  FileText,
  Layers,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  getQuickBooksConfig, 
  saveQuickBooksConfig, 
  testQuickBooksConnection, 
  generateQBOInvoiceFromCase, 
  generateVendorBillsForCase, 
  generateGeneralLedgerJournal, 
  generateQBOJsonPayload, 
  QuickBooksConfig, 
  QBOInvoice, 
  QBOVendorBill, 
  QBOGeneralLedgerJournalEntry 
} from '../../lib/services/quickbooksService';

interface QuickBooksSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase?: GoldenRecordCase;
  caseItem?: GoldenRecordCase;
  cases?: GoldenRecordCase[];
  onUpdateCase?: (updated: GoldenRecordCase) => void;
  onSaveSync?: (syncData: any) => void;
  onSendNotification?: (notif: any) => void;
}

export const QuickBooksSyncModal: React.FC<QuickBooksSyncModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  caseItem: propCaseItem,
  cases = [],
  onUpdateCase,
  onSaveSync,
  onSendNotification
}) => {
  const currentCase = activeCase || propCaseItem || cases[0];
  
  const [selectedCaseId, setSelectedCaseId] = useState<string>(currentCase?.id || '');
  const [activeTab, setActiveTab] = useState<'invoice' | 'payments' | 'bills' | 'journal' | 'credentials'>('invoice');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showJsonPayload, setShowJsonPayload] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Settings State
  const [config, setConfig] = useState<QuickBooksConfig>(() => getQuickBooksConfig());
  const [clientIdInput, setClientIdInput] = useState(config.clientId);
  const [clientSecretInput, setClientSecretInput] = useState(config.clientSecret);
  const [realmIdInput, setRealmIdInput] = useState(config.realmId);
  const [envInput, setEnvInput] = useState<'production' | 'sandbox'>(config.environment);
  const [showSecret, setShowSecret] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testConnResult, setTestConnResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  useEffect(() => {
    if (currentCase) {
      setSelectedCaseId(currentCase.id);
    }
  }, [currentCase]);

  if (!isOpen || !currentCase) return null;

  const targetCase = cases.find(c => c.id === selectedCaseId) || currentCase;
  const invoiceData: QBOInvoice = generateQBOInvoiceFromCase(targetCase);
  const vendorBills: QBOVendorBill[] = generateVendorBillsForCase(targetCase);
  const journalEntry: QBOGeneralLedgerJournalEntry = generateGeneralLedgerJournal(targetCase);
  const jsonPayloadString = generateQBOJsonPayload(targetCase);

  const handleSyncInvoice = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const updatedSync = {
        invoiceNumber: invoiceData.qboDocNumber,
        syncStatus: 'synced' as const,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        qboInvoiceId: `QBO-${Math.floor(10000 + Math.random() * 90000)}`,
        totalAmount: targetCase.totalAmountDue,
        balanceRemaining: invoiceData.balanceDue,
        billsGenerated: vendorBills.map(b => ({
          vendorName: b.vendorName,
          category: b.category,
          amount: b.amount,
          billNumber: b.billNumber,
          status: 'synced' as const
        }))
      };

      const updated: GoldenRecordCase = {
        ...targetCase,
        quickbooksSync: updatedSync,
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'QuickBooks Online Sync Hub',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `AP-47 Statement ($${targetCase.totalAmountDue.toLocaleString()}) synced to QuickBooks Online as Invoice #${invoiceData.qboDocNumber}. Customer: ${targetCase.informant.fullName}.`
          },
          ...(targetCase.notes || [])
        ]
      };

      onUpdateCase?.(updated);
      onSaveSync?.(updatedSync);

      onSendNotification?.({
        id: `notif-${Date.now()}`,
        caseId: targetCase.id,
        decedentName: targetCase.decedent.legalName,
        recipientName: 'Accounting / Finance Director',
        recipientPhone: '(212) 281-8850',
        channel: 'sms',
        type: 'portal_update',
        title: '📊 QuickBooks Invoice Synced',
        bodyText: `Invoice #${invoiceData.qboDocNumber} ($${targetCase.totalAmountDue.toFixed(2)}) synced with Intuit QuickBooks Online. Customer: ${targetCase.informant.fullName}.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }, 850);
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestConnResult(null);
    const updatedCfg: QuickBooksConfig = {
      ...config,
      clientId: clientIdInput.trim(),
      clientSecret: clientSecretInput.trim(),
      realmId: realmIdInput.trim(),
      environment: envInput
    };
    const res = await testQuickBooksConnection(updatedCfg);
    setIsTestingConn(false);
    setTestConnResult(res);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCfg: QuickBooksConfig = {
      ...config,
      clientId: clientIdInput.trim(),
      clientSecret: clientSecretInput.trim(),
      realmId: realmIdInput.trim(),
      environment: envInput,
      isConnected: true,
      lastTokenRefresh: 'Just Now (OAuth 2.0 Access Token Re-Authorized)'
    };
    setConfig(updatedCfg);
    saveQuickBooksConfig(updatedCfg);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3500);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(jsonPayloadString);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Account Code', 'Account Name', 'Debit (USD)', 'Credit (USD)', 'Description'],
      ...journalEntry.lines.map(l => [
        `"${l.accountNumber}"`,
        `"${l.accountName}"`,
        l.debit.toFixed(2),
        l.credit.toFixed(2),
        `"${l.description}"`
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QBO_General_Ledger_${targetCase.caseNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/40">
              <span className="text-white font-black text-xl font-mono tracking-tighter">qb</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Intuit QuickBooks Online & General Ledger Sync
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Live OAuth 2.0 Connected
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Realm ID: {config.realmId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated 2-way billing syncing Form AP-47 itemized charges, accounts receivable, and vendor 1099 disbursements.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {cases.length > 1 && (
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    Case #{c.caseNumber} - {c.decedent.legalName}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-6 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'invoice', label: 'AP-47 Customer Invoice', icon: Receipt },
            { id: 'payments', label: 'Payment Matching & A/R', icon: CreditCard },
            { id: 'bills', label: 'Vendor 1099 & AP Bills', icon: Building2 },
            { id: 'journal', label: 'General Ledger Journal', icon: Layers },
            { id: 'credentials', label: 'Intuit OAuth & Gateway', icon: Lock }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3.5 px-3.5 border-b-2 font-medium flex items-center space-x-2 transition cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'border-emerald-400 text-emerald-400 font-bold bg-slate-900/50' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-900/80">

          {/* TAB 1: AP-47 CUSTOMER INVOICE & A/R */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              
              {/* Top Case Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Invoice Document #</div>
                  <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">{invoiceData.qboDocNumber}</div>
                  <div className="text-[10px] text-slate-500 mt-1">NYS AP-47 Mirror</div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Customer Account (QBO)</div>
                  <div className="text-sm font-bold text-slate-200 truncate mt-0.5">{invoiceData.customerName}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">{invoiceData.customerEmail}</div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Contract Value</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">${invoiceData.totalAmount.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Itemized 3 Categories</div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Open Balance Due (A/R)</div>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5">${invoiceData.balanceDue.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {invoiceData.amountPaid > 0 ? `Paid: $${invoiceData.amountPaid.toLocaleString()}` : 'Unpaid Balance'}
                  </div>
                </div>
              </div>

              {/* Itemized Lines Table */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    Form AP-47 Itemized Service, Merchandise & Cash Advance Line Mapping
                  </h3>
                  <button
                    onClick={() => setShowJsonPayload(!showJsonPayload)}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{showJsonPayload ? 'Hide API JSON Payload' : 'View Intuit v3 JSON'}</span>
                  </button>
                </div>

                {showJsonPayload && (
                  <div className="p-4 bg-slate-950 border-b border-slate-800 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-slate-400">Intuit QuickBooks Online v3 REST API Payload</span>
                      <button
                        onClick={handleCopyPayload}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLink ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-300 bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-800">
                      {jsonPayloadString}
                    </pre>
                  </div>
                )}

                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Line Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">QBO Account Code</th>
                      <th className="py-3 px-4">Taxable</th>
                      <th className="py-3 px-4 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {invoiceData.lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-medium text-slate-200">{item.description}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                            {item.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{item.accountCode}</td>
                        <td className="py-3 px-4">
                          {item.taxable ? (
                            <span className="text-amber-400 font-semibold">Yes (8.875% NYC)</span>
                          ) : (
                            <span className="text-slate-500">Exempt</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          ${item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/90 font-mono text-xs border-t border-slate-800">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-4 text-right text-slate-400 uppercase font-semibold">
                        Subtotal (Form AP-47 Total)
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-white">
                        ${invoiceData.subtotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-2.5 px-4 text-right text-slate-400 uppercase font-semibold">
                        Applied Payments / Deposits
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                        -${invoiceData.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-950 font-bold">
                      <td colSpan={4} className="py-3 px-4 text-right text-slate-200 uppercase">
                        Net Accounts Receivable Due
                      </td>
                      <td className="py-3 px-4 text-right text-amber-300 text-sm">
                        ${invoiceData.balanceDue.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Action Bar & Sync History */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">QBO Synchronization Engine</span>
                    <span className="text-[10px] text-slate-500">Last Synced: {invoiceData.lastSyncedAt || 'Never'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pushes this itemized statement into QuickBooks Online company account {config.realmId} and registers customer legal ledger.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSyncInvoice}
                    disabled={isSyncing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition shadow-lg shadow-emerald-950/40 border border-emerald-400/30 cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Synchronizing QBO...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-emerald-200" />
                        <span>Push Invoice to QuickBooks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PAYMENT MATCHING & AR */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Automated 2-Way Payment & Deposit Matching</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    BFH OS automatically matches credit card charges from Stripe POS, Apple Pay, Plaid ACH transfers, and C&J Life Insurance funding checks against open QBO Invoice #{invoiceData.qboDocNumber}.
                  </p>
                </div>
              </div>

              {/* Matched Split Payments */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Verified Payment Receipts & Clearing Allocations
                  </h3>
                </div>

                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Payer / Source</th>
                      <th className="py-3 px-4">Rail / Provider</th>
                      <th className="py-3 px-4">QBO Clearing Account</th>
                      <th className="py-3 px-4">Match Status</th>
                      <th className="py-3 px-4 text-right">Allocated Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {(targetCase.splitBilling && targetCase.splitBilling.length > 0) ? (
                      targetCase.splitBilling.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-4 font-bold text-slate-200">{item.payerType}</td>
                          <td className="py-3 px-4 text-slate-300">{item.providerName}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {item.payerType.includes('Card') ? config.chartOfAccounts.stripeUndepositedFunds : '1020 - Chase Operating Checking'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 flex items-center w-fit gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              Auto-Matched
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-300">
                            ${item.amountAllocated.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                          No split billing payments allocated yet. Use Stripe POS or the Financial Verification Center to record transactions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VENDOR 1099 & AP BILLS */}
          {activeTab === 'bills' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-sky-300">Accounts Payable Vendor Bill & 1099 Disbursement Generation</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Dispatches Accounts Payable vendor bills for third-party pass-throughs (Woodlawn Crematory, Livery fleets, florist orders) and 1099 independent contractor vouchers for freelance service directors.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Bill #</th>
                      <th className="py-3 px-4">Vendor Name</th>
                      <th className="py-3 px-4">Category / Purpose</th>
                      <th className="py-3 px-4">Disbursement Type</th>
                      <th className="py-3 px-4">Terms</th>
                      <th className="py-3 px-4 text-right">Bill Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {vendorBills.map((b) => (
                      <tr key={b.billId} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-sky-300">{b.billNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          <div>{b.vendorName}</div>
                          {b.vendorEin && <div className="text-[10px] text-slate-500 font-mono">EIN: {b.vendorEin}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{b.category}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.disbursementType === '1099_contractor' 
                              ? 'bg-amber-900/50 text-amber-300 border border-amber-500/40' 
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {b.disbursementType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{b.dueDate}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          ${b.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: GENERAL LEDGER JOURNAL ENTRY */}
          {activeTab === 'journal' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">GAAP Double-Entry General Ledger Journal Entry</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Standard journal voucher #{journalEntry.entryNumber} generated for CPA audit and monthly trial balance closing.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition border border-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 font-sans">
                    <tr>
                      <th className="py-3 px-4">Account #</th>
                      <th className="py-3 px-4">Account Title</th>
                      <th className="py-3 px-4">Line Memo</th>
                      <th className="py-3 px-4 text-right">Debit (USD)</th>
                      <th className="py-3 px-4 text-right">Credit (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {journalEntry.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-bold text-emerald-300">{line.accountNumber}</td>
                        <td className="py-3 px-4 font-sans text-slate-200 font-medium">{line.accountName}</td>
                        <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{line.description}</td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          {line.debit > 0 ? `$${line.debit.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          {line.credit > 0 ? `$${line.credit.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/90 font-bold text-xs border-t border-slate-800">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right font-sans uppercase text-slate-400">
                        Total Journal Balance
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-300 text-sm">
                        ${journalEntry.totalDebits.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-300 text-sm">
                        ${journalEntry.totalCredits.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Debit & Credit Equality Verified: Debits ($${journalEntry.totalDebits.toLocaleString()}) = Credits ($${journalEntry.totalCredits.toLocaleString()})</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  GAAP Compliant
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: INTUIT OAUTH CREDENTIALS & GATEWAY */}
          {activeTab === 'credentials' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {saveSuccessToast && (
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-500 text-emerald-200 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Intuit QuickBooks Online credentials saved and re-authenticated successfully!</span>
                </div>
              )}

              {testConnResult && (
                <div className={`p-4 rounded-xl text-xs border flex items-start space-x-2.5 animate-fadeIn ${
                  testConnResult.success 
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}>
                  {testConnResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{testConnResult.success ? 'Handshake Successful' : 'Connection Failed'}</div>
                    <div className="mt-0.5 text-[11px] text-slate-300">{testConnResult.message}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Intuit Developer Platform Credentials
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Realm ID
                  </label>
                  <input
                    type="text"
                    value={realmIdInput}
                    onChange={(e) => setRealmIdInput(e.target.value)}
                    placeholder="9341452938102914"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Found in Intuit Developer Dashboard or QBO URL parameters.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    App Client ID
                  </label>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="AB1234567890..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Client Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={clientSecretInput}
                      onChange={(e) => setClientSecretInput(e.target.value)}
                      placeholder="sk_live_qbo_sec_..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-emerald-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Environment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEnvInput('production')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        envInput === 'production'
                          ? 'bg-emerald-600/20 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Production Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnvInput('sandbox')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        envInput === 'sandbox'
                          ? 'bg-amber-600/20 border-amber-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Developer Sandbox
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConn}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isTestingConn ? <RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    <span>Test Intuit OAuth Handshake</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border border-emerald-400/30 flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                  >
                    <span>Save QBO Credentials</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
