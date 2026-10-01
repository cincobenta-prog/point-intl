import React, { useState } from 'react';
import { 
  GoldenRecordCase, 
  SplitBillingItem, 
  CommunityContribution, 
  FamilySplitPayConfig 
} from '../../lib/types/funeral';
import { 
  formatPhoneNumbersOnly, 
  isValidEmailFormat 
} from '../../lib/utils/inputValidation';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Users, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Copy, 
  Plus, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  MessageSquare, 
  Gift,
  FileCheck2,
  X,
  RefreshCw,
  HandCoins,
  Check
} from 'lucide-react';

interface FamilySplitPaymentPortalProps {
  caseData: GoldenRecordCase;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  onUpdateBilling?: (updatedBilling: SplitBillingItem[]) => void;
  onOpenQuickBooks?: (targetCase: GoldenRecordCase) => void;
  isStaffMode?: boolean;
  initialGuestToken?: string;
}

export const FamilySplitPaymentPortal: React.FC<FamilySplitPaymentPortalProps> = ({
  caseData,
  onUpdateCase,
  onUpdateBilling,
  onOpenQuickBooks,
  isStaffMode = false,
  initialGuestToken
}) => {
  // Mode: 'overview' | 'manage_splits' | 'guest_checkout' | 'community_fund' | 'receipt_view'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'splits' | 'community' | 'checkout' | 'receipt'>(
    initialGuestToken ? 'checkout' : 'overview'
  );

  // Split Billing State
  const [splitItems, setSplitItems] = useState<SplitBillingItem[]>(caseData.splitBilling || []);
  
  // Community Contributions State
  const [communityConfig, setCommunityConfig] = useState<FamilySplitPayConfig>(
    caseData.familySplitPayConfig || {
      enabled: true,
      communityContributionsEnabled: true,
      communityGoalAmount: 2500,
      communityDescription: "Friends, church members, and alumni are invited to contribute towards the celebration of life and memorial arrangements for our beloved.",
      shareableLinkCode: `BFH-${caseData.caseNumber.replace(/[^A-Za-z0-9]/g, '')}-SPLIT`,
      contributions: [
        {
          id: 'contrib-1',
          contributorName: 'Harlem Hospital Alumni Association',
          relationship: 'Medical Colleagues',
          amount: 500,
          message: 'In honor of Dr. Vance’s decades of dedicated medical service and leadership in Harlem.',
          date: '2026-09-24',
          paymentMethod: 'Card',
          transactionId: 'TXN-99812-HARLEM',
          isAnonymous: false
        },
        {
          id: 'contrib-2',
          contributorName: 'Sister Evelyn Waters & Family',
          relationship: 'Abyssinian Church Family',
          amount: 250,
          message: 'Sending prayers of comfort and peace to Maya, Marcus Jr., and the entire family.',
          date: '2026-09-25',
          paymentMethod: 'Apple Pay',
          transactionId: 'TXN-99814-WATERS',
          isAnonymous: false
        },
        {
          id: 'contrib-3',
          contributorName: 'Alpha Phi Alpha Fraternity, Harlem Chapter',
          relationship: 'Fraternity Brothers',
          amount: 350,
          message: 'First of All, Servants of All, We Shall Transcends All. Rest in eternal power, Brother.',
          date: '2026-09-26',
          paymentMethod: 'ACH',
          transactionId: 'TXN-99820-ALPHA',
          isAnonymous: false
        }
      ]
    }
  );

  // Modal / Drawer States
  const [isAddPayerModalOpen, setIsAddPayerModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePayer, setSelectedSharePayer] = useState<SplitBillingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastReceiptData, setLastReceiptData] = useState<any>(null);

  // New Payer Form State
  const [newPayerName, setNewPayerName] = useState('');
  const [newPayerEmail, setNewPayerEmail] = useState('');
  const [newPayerPhone, setNewPayerPhone] = useState('');
  const [newPayerRelationship, setNewPayerRelationship] = useState('Sibling / Family Member');
  const [newPayerType, setNewPayerType] = useState<SplitBillingItem['payerType']>('Credit Card');
  const [newPayerAmount, setNewPayerAmount] = useState<number>(1000);
  const [newPayerItemAssigned, setNewPayerItemAssigned] = useState('Equal Family Share');

  // Checkout Form State (Simulated Contributor Payment)
  const [checkoutPayerName, setCheckoutPayerName] = useState(caseData.informant.fullName);
  const [checkoutPayerEmail, setCheckoutPayerEmail] = useState(caseData.informant.email || '');
  const [checkoutPayerPhone, setCheckoutPayerPhone] = useState(caseData.informant.phone || '');
  const [checkoutAmount, setCheckoutAmount] = useState<number>(1000);
  const [checkoutMethod, setCheckoutMethod] = useState<'Apple Pay' | 'Google Pay' | 'Card' | 'ACH' | 'Life Insurance Assignment'>('Apple Pay');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '•••• •••• •••• 4242', exp: '12/28', cvc: '•••', zip: '10030' });
  const [achDetails] = useState({ bank: 'Chase Bank (Checking)', routing: '021000021', account: '••••••8841' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Financial Calculations
  const totalContract = caseData.totalAmountDue || 12850;
  
  // Calculate verified insurance
  const insuranceFunded = splitItems
    .filter(i => i.payerType === 'Life Insurance Assignment' && (i.status === 'verified_active' || i.status === 'funded'))
    .reduce((acc, curr) => acc + curr.amountAllocated, 0);

  // Calculate direct payments from family co-payers
  const directFamilyPaid = splitItems
    .filter(i => i.payerType !== 'Life Insurance Assignment' && i.status === 'funded')
    .reduce((acc, curr) => acc + (curr.amountPaid || curr.amountAllocated), 0);

  // Calculate community contributions
  const communityPaid = (communityConfig.contributions || []).reduce((acc, curr) => acc + curr.amount, 0);

  const totalFunded = directFamilyPaid + insuranceFunded + communityPaid;
  const remainingBalance = Math.max(0, totalContract - totalFunded);
  const progressPercent = Math.min(100, Math.round((totalFunded / totalContract) * 100));

  // Handle Adding Co-Payer
  const handleAddCoPayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayerName.trim()) {
      showToast("Please enter a valid payer name");
      return;
    }

    if (newPayerEmail.trim() && !isValidEmailFormat(newPayerEmail.trim())) {
      showToast("Please enter a valid email address format (e.g. name@example.com)");
      return;
    }

    const newItem: SplitBillingItem = {
      id: `split-${Date.now()}`,
      payerName: newPayerName.trim(),
      payerEmail: newPayerEmail.trim(),
      payerPhone: newPayerPhone.trim(),
      relationshipToDecedent: newPayerRelationship,
      payerType: newPayerType,
      amountAllocated: newPayerAmount,
      amountPaid: 0,
      status: 'pending_verification',
      itemAssigned: newPayerItemAssigned,
      notes: `Assigned on ${new Date().toLocaleDateString()}`,
      inviteSentAt: new Date().toISOString(),
      shareableToken: `tok_${Math.random().toString(36).substring(2, 9)}`
    };

    const updated = [...splitItems, newItem];
    setSplitItems(updated);
    onUpdateBilling?.(updated);
    if (onUpdateCase) {
      onUpdateCase({
        ...caseData,
        splitBilling: updated
      });
    }

    setIsAddPayerModalOpen(false);
    setNewPayerName('');
    setNewPayerEmail('');
    setNewPayerPhone('');
    showToast(`Payment share created for ${newPayerName} ($${newPayerAmount.toLocaleString()})`);
  };

  // Quick Split Equalizer
  const handleSplitEvenly = (numPeople: number) => {
    if (remainingBalance <= 0) {
      showToast("Contract is already fully funded!");
      return;
    }
    const perPerson = Math.round(remainingBalance / numPeople);
    setNewPayerAmount(perPerson);
    setNewPayerItemAssigned(`1 of ${numPeople} Equal Shares ($${perPerson.toLocaleString()} each)`);
    setIsAddPayerModalOpen(true);
  };

  // Handle Simulated Contributor Payment Execution
  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}-BFH`;
      const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowStr = new Date().toLocaleString();

      const receiptPayload = {
        receiptNumber: receiptNo,
        transactionId: txnId,
        timestamp: nowStr,
        payerName: checkoutPayerName,
        payerEmail: checkoutPayerEmail,
        payerPhone: checkoutPayerPhone,
        amount: checkoutAmount,
        paymentMethod: checkoutMethod,
        caseNumber: caseData.caseNumber,
        decedentName: caseData.decedent.legalName,
        remainingBalance: Math.max(0, remainingBalance - checkoutAmount),
        condolenceNote: checkoutMessage
      };

      setLastReceiptData(receiptPayload);

      // Check if this payment matches an existing split item or is a new contribution
      const existingIdx = splitItems.findIndex(
        s => s.payerName?.toLowerCase() === checkoutPayerName.toLowerCase() || 
             (s.payerEmail && s.payerEmail.toLowerCase() === checkoutPayerEmail.toLowerCase())
      );

      let updatedSplits = [...splitItems];
      if (existingIdx >= 0) {
        updatedSplits[existingIdx] = {
          ...updatedSplits[existingIdx],
          amountPaid: (updatedSplits[existingIdx].amountPaid || 0) + checkoutAmount,
          status: 'funded',
          paidAt: nowStr,
          transactionReference: txnId,
          receiptNumber: receiptNo
        };
      } else {
        // Add as a direct family contribution
        updatedSplits.push({
          id: `split-${Date.now()}`,
          payerName: checkoutPayerName,
          payerEmail: checkoutPayerEmail,
          payerPhone: checkoutPayerPhone,
          payerType: checkoutMethod === 'ACH' ? 'Family ACH Direct' : 'Credit Card',
          amountAllocated: checkoutAmount,
          amountPaid: checkoutAmount,
          status: 'funded',
          itemAssigned: 'Direct Family Contribution',
          paidAt: nowStr,
          transactionReference: txnId,
          receiptNumber: receiptNo,
          notes: checkoutMessage ? `Note: "${checkoutMessage}"` : undefined
        });
      }

      setSplitItems(updatedSplits);
      onUpdateBilling?.(updatedSplits);

      // Update Case in Parent
      if (onUpdateCase) {
        onUpdateCase({
          ...caseData,
          splitBilling: updatedSplits,
          totalPaid: (caseData.totalPaid || 0) + checkoutAmount
        });
      }

      setActiveSubTab('receipt');
      showToast(`Payment of $${checkoutAmount.toLocaleString()} successfully processed! Receipt generated.`);
    }, 1400);
  };

  // Handle Community Gift Contribution
  const handleAddCommunityContribution = (amount: number, name: string, note: string) => {
    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}-GIFT`;
    const newContrib: CommunityContribution = {
      id: `contrib-${Date.now()}`,
      contributorName: name || 'Harlem Community Supporter',
      amount: amount,
      message: note || 'With deepest sympathy and loving prayers.',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Apple Pay',
      transactionId: txnId,
      isAnonymous: !name
    };

    const updatedContributions = [...(communityConfig.contributions || []), newContrib];
    const updatedConfig = {
      ...communityConfig,
      contributions: updatedContributions
    };

    setCommunityConfig(updatedConfig);
    if (onUpdateCase) {
      onUpdateCase({
        ...caseData,
        familySplitPayConfig: updatedConfig,
        totalPaid: (caseData.totalPaid || 0) + amount
      });
    }

    showToast(`Gift contribution of $${amount.toLocaleString()} added to memorial fund!`);
  };

  const copyShareLink = (payer?: SplitBillingItem) => {
    const baseUrl = window.location.origin;
    const token = payer?.shareableToken || communityConfig.shareableLinkCode;
    const url = `${baseUrl}/pay/${caseData.caseNumber}?token=${token}`;
    navigator.clipboard?.writeText(url);
    showToast(`Private payment link copied to clipboard!`);
  };

  return (
    <div className="bg-neutral-900 text-neutral-100 rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#991b1b] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-amber-400/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Top Gold Foil Bar */}
      <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

      {/* Main Header */}
      <div className="p-6 md:p-8 bg-gradient-to-b from-[#181d28] via-[#121620] to-[#0f121a] border-b border-neutral-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#991b1b] to-red-950 border border-amber-400/50 flex items-center justify-center text-white shadow-xl shrink-0">
              <HandCoins className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  FAMILY SPLIT-PAY & CONTRIBUTION HUB
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Case #{caseData.caseNumber}
                </span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                  NYS AP-47 Compliant (0% Markup Pass-Through)
                </span>
                {isStaffMode && (
                  <span className="text-[11px] text-red-300 bg-red-950 px-2 py-0.5 rounded-full border border-red-500/40 font-bold">
                    Staff Director Access
                  </span>
                )}
              </div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white mt-1">
                Collaborative Arrangement Funding & Split-Pay
              </h2>
              <p className="text-sm text-neutral-300 font-light mt-0.5 max-w-2xl">
                Honoring <strong className="text-amber-200 font-semibold">{caseData.decedent.legalName}</strong>. 
                Coordinate family shares, sponsor pass-through cash advances, or accept community love gifts without financial stress.
              </p>
            </div>
          </div>

          {/* Quick Header Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-neutral-800/80 p-3.5 rounded-2xl border border-neutral-700/80 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Total Contract</div>
              <div className="text-xl font-bold font-serif-title text-white mt-0.5">
                ${totalContract.toLocaleString()}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">NYS Form AP-47</div>
            </div>

            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 flex items-center gap-1">
                <span>Funded & Paid</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-serif-title text-emerald-300 mt-0.5">
                ${totalFunded.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">{progressPercent}% Cleared</div>
            </div>

            <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/30 backdrop-blur-sm col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-amber-300 flex items-center gap-1">
                <span>Balance Due</span>
                <Clock className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-serif-title text-amber-300 mt-0.5">
                ${remainingBalance.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-400/80 mt-0.5">
                {remainingBalance === 0 ? 'Fully Paid ✓' : 'Awaiting Settlement'}
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center text-xs font-mono text-neutral-400 mb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              Direct Paid (${(directFamilyPaid + communityPaid).toLocaleString()})
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block ml-2"></span>
              Insurance Assignment (${insuranceFunded.toLocaleString()})
            </span>
            <span className="font-bold text-white">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="h-3.5 w-full bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700 flex">
            {/* Direct Paid Green Segment */}
            <div 
              style={{ width: `${Math.min(100, ((directFamilyPaid + communityPaid) / totalContract) * 100)}%` }} 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-full transition-all duration-700"
              title={`Direct Cash & Card: $${(directFamilyPaid + communityPaid).toLocaleString()}`}
            />
            {/* Insurance Blue Segment */}
            <div 
              style={{ width: `${Math.min(100 - ((directFamilyPaid + communityPaid) / totalContract) * 100, (insuranceFunded / totalContract) * 100)}%` }} 
              className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full transition-all duration-700"
              title={`Insurance Assignment: $${insuranceFunded.toLocaleString()}`}
            />
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-neutral-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'overview'
                  ? 'bg-amber-400 text-neutral-950 shadow-md'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Overview & Ledger</span>
            </button>

            <button
              onClick={() => setActiveSubTab('splits')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'splits'
                  ? 'bg-amber-400 text-neutral-950 shadow-md'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Family Co-Payers ({splitItems.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('community')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'community'
                  ? 'bg-amber-400 text-neutral-950 shadow-md'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span>Community Love Gifts (${communityPaid.toLocaleString()})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('checkout')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'checkout'
                  ? 'bg-[#991b1b] text-white border border-amber-300 shadow-md'
                  : 'bg-neutral-800/80 text-amber-300 hover:bg-neutral-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-300" />
              <span>Make a Payment / Gift</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition border border-neutral-700"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Portal Links</span>
            </button>

            {onOpenQuickBooks && (
              <button
                onClick={() => onOpenQuickBooks(caseData)}
                className="bg-[#2ca01c]/20 hover:bg-[#2ca01c]/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">QBO Sync</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Tab Body Content */}
      <div className="p-6 md:p-8 space-y-6">

        {/* 1. OVERVIEW & FINANCIAL LEDGER TAB */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick Sibling Split Equalizer Banner */}
            <div className="bg-gradient-to-r from-neutral-800 via-neutral-850 to-neutral-800 p-5 rounded-2xl border border-neutral-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="font-serif-title font-bold text-white text-sm sm:text-base">
                    Equal Sibling & Family Split Calculator
                  </h4>
                </div>
                <p className="text-xs text-neutral-300 mt-1 font-light">
                  Split the remaining balance of <strong className="text-amber-300">${remainingBalance.toLocaleString()}</strong> equally with pre-filled payment links sent directly via SMS.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSplitEvenly(2)}
                  className="bg-neutral-700 hover:bg-amber-400 hover:text-neutral-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition border border-neutral-600"
                >
                  2 Ways (${Math.round(remainingBalance / 2).toLocaleString()}/ea)
                </button>
                <button
                  onClick={() => handleSplitEvenly(3)}
                  className="bg-neutral-700 hover:bg-amber-400 hover:text-neutral-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition border border-neutral-600"
                >
                  3 Ways (${Math.round(remainingBalance / 3).toLocaleString()}/ea)
                </button>
                <button
                  onClick={() => handleSplitEvenly(4)}
                  className="bg-neutral-700 hover:bg-amber-400 hover:text-neutral-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition border border-neutral-600"
                >
                  4 Ways (${Math.round(remainingBalance / 4).toLocaleString()}/ea)
                </button>
                <button
                  onClick={() => setIsAddPayerModalOpen(true)}
                  className="bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm border border-amber-400/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom Payer</span>
                </button>
              </div>
            </div>

            {/* Split Allocation Matrix Table */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-inner">
              <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h4 className="font-serif-title font-bold text-white text-sm">
                    Verified Payer Allocations & Funding Sources
                  </h4>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {splitItems.length} Registered Payer(s)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/60 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800 text-[10px]">
                    <tr>
                      <th className="p-3.5">Payer / Contributor</th>
                      <th className="p-3.5">Funding Method / Item</th>
                      <th className="p-3.5">Allocated</th>
                      <th className="p-3.5">Amount Paid</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/70 text-neutral-200">
                    {splitItems.map((item, idx) => {
                      const isFunded = item.status === 'funded' || (item.payerType === 'Life Insurance Assignment' && item.status === 'verified_active');
                      return (
                        <tr key={item.id || idx} className="hover:bg-neutral-900/50 transition">
                          <td className="p-3.5 font-medium">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-300 text-xs">
                                {item.payerName ? item.payerName.charAt(0) : 'P'}
                              </div>
                              <div>
                                <div className="text-white font-semibold">
                                  {item.payerName || item.providerName || `Payer #${idx + 1}`}
                                </div>
                                <div className="text-[11px] text-neutral-400">
                                  {item.relationshipToDecedent || item.payerType}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="text-neutral-300 font-medium">
                              {item.payerType}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono">
                              {item.itemAssigned || item.policyNumber || 'General Funeral Allocation'}
                            </div>
                          </td>

                          <td className="p-3.5 font-mono font-semibold text-white">
                            ${item.amountAllocated.toLocaleString()}
                          </td>

                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            ${(item.amountPaid || (isFunded ? item.amountAllocated : 0)).toLocaleString()}
                          </td>

                          <td className="p-3.5">
                            {item.status === 'funded' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3" />
                                Funded & Paid
                              </span>
                            ) : item.status === 'verified_active' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40">
                                <ShieldCheck className="w-3 h-3" />
                                Policy Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                                <Clock className="w-3 h-3" />
                                Pending Payment
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {item.status !== 'funded' && (
                                <button
                                  onClick={() => {
                                    setCheckoutPayerName(item.payerName || '');
                                    setCheckoutPayerEmail(item.payerEmail || '');
                                    setCheckoutPayerPhone(item.payerPhone || '');
                                    setCheckoutAmount(item.amountAllocated - (item.amountPaid || 0));
                                    setActiveSubTab('checkout');
                                  }}
                                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-[11px] transition"
                                >
                                  Pay Share
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedSharePayer(item);
                                  setIsShareModalOpen(true);
                                }}
                                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                                title="Send SMS Payment Link"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NYS Form AP-47 Pass-Through Transparency Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif-title font-bold text-white text-sm">
                    100% Pass-Through Assurance (NYS Form AP-47 Section II)
                  </h5>
                  <p className="text-xs text-neutral-400 font-light mt-0.5 max-w-2xl">
                    Pursuant to <strong>10 NYCRR § 77.8</strong>, all cash advance items (Cemetery, Clergy, Death Certificates, Organist, Pallbearers) are processed at exact third-party vendor cost with <strong>0% markup</strong>. Family co-payer receipts detail exact statutory line-item attribution.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCheckoutAmount(250);
                  setCheckoutPayerName('Community Supporter');
                  setActiveSubTab('checkout');
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl transition shrink-0 border border-neutral-700"
              >
                Sponsor Cash Advance Item
              </button>
            </div>

          </div>
        )}

        {/* 2. SIBLING & FAMILY SPLIT CO-PAYERS TAB */}
        {activeSubTab === 'splits' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Family Co-Payer Management
                </h3>
                <p className="text-xs text-neutral-400 font-light">
                  Assign individual shares to siblings, children, and sponsors. Each person receives a personalized, secure link with instant receipts.
                </p>
              </div>

              <button
                onClick={() => setIsAddPayerModalOpen(true)}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm border border-amber-400/40"
              >
                <Plus className="w-4 h-4" />
                <span>Add Family Co-Payer</span>
              </button>
            </div>

            {/* Sibling Share Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {splitItems.map((payer, pIdx) => {
                const isPaid = payer.status === 'funded' || payer.status === 'verified_active';
                const shareAmount = payer.amountAllocated;
                const paidAmt = payer.amountPaid || (isPaid ? shareAmount : 0);
                const isFull = paidAmt >= shareAmount;

                return (
                  <div 
                    key={payer.id || pIdx} 
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isFull 
                        ? 'bg-neutral-900/90 border-emerald-500/40' 
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isFull ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-neutral-800 text-amber-300'
                          }`}>
                            {payer.payerName ? payer.payerName.charAt(0) : 'P'}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {payer.payerName || payer.providerName || `Payer #${pIdx + 1}`}
                            </h4>
                            <span className="text-[11px] text-neutral-400 font-light">
                              {payer.relationshipToDecedent || 'Family Co-Payer'}
                            </span>
                          </div>
                        </div>

                        {isFull ? (
                          <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Paid
                          </span>
                        ) : (
                          <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400">Assigned Share:</span>
                          <span className="font-bold text-white font-mono">${shareAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400">Item Assigned:</span>
                          <span className="font-mono text-amber-300 text-[11px] truncate max-w-[140px]">
                            {payer.itemAssigned || 'General Services'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400">Payment Channel:</span>
                          <span className="text-neutral-300 text-[11px]">{payer.payerType}</span>
                        </div>
                      </div>

                      {payer.notes && (
                        <p className="text-[11px] text-neutral-400 italic mt-2.5 bg-neutral-800/40 p-2 rounded-lg border border-neutral-800">
                          "{payer.notes}"
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => copyShareLink(payer)}
                        className="text-xs text-neutral-300 hover:text-amber-300 font-bold flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </button>

                      {!isFull ? (
                        <button
                          onClick={() => {
                            setCheckoutPayerName(payer.payerName || '');
                            setCheckoutPayerEmail(payer.payerEmail || '');
                            setCheckoutPayerPhone(payer.payerPhone || '');
                            setCheckoutAmount(shareAmount - paidAmt);
                            setActiveSubTab('checkout');
                          }}
                          className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
                        >
                          <CreditCard className="w-3 h-3 text-amber-300" />
                          <span>Pay ${shareAmount.toLocaleString()}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setLastReceiptData({
                              receiptNumber: payer.receiptNumber || 'REC-2026-BFH',
                              transactionId: payer.transactionReference || 'TXN-PAID-01',
                              timestamp: payer.paidAt || '2026-09-26',
                              payerName: payer.payerName || 'Family Co-Payer',
                              payerEmail: payer.payerEmail || '',
                              amount: shareAmount,
                              paymentMethod: payer.payerType,
                              caseNumber: caseData.caseNumber,
                              decedentName: caseData.decedent.legalName,
                              remainingBalance: remainingBalance
                            });
                            setActiveSubTab('receipt');
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 text-emerald-300 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                        >
                          <FileCheck2 className="w-3 h-3 text-emerald-400" />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* 3. COMMUNITY LOVE GIFTS & MEMORIAL FUND TAB */}
        {activeSubTab === 'community' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-red-950/40 via-neutral-900 to-red-950/40 p-6 rounded-2xl border border-red-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                  <h3 className="font-serif-title text-xl font-bold text-white">
                    Community Memorial Gift & Blessing Pool
                  </h3>
                </div>
                <p className="text-xs text-neutral-300 font-light mt-1 max-w-2xl leading-relaxed">
                  Allows friends, church auxiliaries, fraternity brothers, and coworkers to send financial love gifts and condolence blessings directly towards the funeral service expenses.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAddCommunityContribution(50, 'Church Auxiliary Member', 'Prayers of comfort and strength for the family.')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs px-3.5 py-3 rounded-xl transition border border-neutral-700"
                >
                  +$50 Quick Gift
                </button>
                <button
                  onClick={() => handleAddCommunityContribution(100, 'Harlem Community Friend', 'In loving remembrance and celebration of life.')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs px-3.5 py-3 rounded-xl transition border border-neutral-700"
                >
                  +$100 Quick Gift
                </button>
                <button
                  onClick={() => {
                    setCheckoutPayerName('');
                    setCheckoutAmount(250);
                    setActiveSubTab('checkout');
                  }}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-lg border border-amber-400/50"
                >
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>Custom Love Gift</span>
                </button>
              </div>
            </div>

            {/* Goal Progress Banner */}
            <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400">Total Love Gifts</span>
                <div className="text-2xl font-bold font-serif-title text-amber-300 mt-0.5">
                  ${communityPaid.toLocaleString()}
                </div>
                <span className="text-[11px] text-neutral-400">
                  {communityConfig.contributions?.length || 0} Individual Blessings
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400">Community Goal</span>
                <div className="text-2xl font-bold font-serif-title text-white mt-0.5">
                  ${(communityConfig.communityGoalAmount || 2500).toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-400">
                  {Math.round((communityPaid / (communityConfig.communityGoalAmount || 2500)) * 100)}% of goal reached
                </span>
              </div>

              <div className="sm:text-right flex sm:flex-col justify-between items-start sm:items-end">
                <span className="text-[10px] uppercase font-mono text-neutral-400">Balance Reduction</span>
                <div className="text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 mt-1">
                  100% reduces family balance
                </div>
              </div>
            </div>

            {/* Love Gifts Feed & Condolence Messages */}
            <div className="space-y-3">
              <h4 className="font-serif-title font-bold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Condolence Messages & Gift Feed</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(communityConfig.contributions || []).map((gift) => (
                  <div key={gift.id} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-white text-sm">
                          {gift.isAnonymous ? 'Anonymous Church Supporter' : gift.contributorName}
                        </h5>
                        <div className="text-[11px] text-amber-300/80 font-light">
                          {gift.relationship || 'Community Supporter'} • {gift.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                          +${gift.amount.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{gift.paymentMethod}</div>
                      </div>
                    </div>

                    {gift.message && (
                      <p className="text-xs text-neutral-300 font-light italic bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
                        "{gift.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 4. MAKE A PAYMENT / SPONSOR SHARE (CHECKOUT GATEWAY) */}
        {activeSubTab === 'checkout' && (
          <div className="max-w-2xl mx-auto bg-neutral-950 p-6 md:p-8 rounded-3xl border border-neutral-800 shadow-2xl space-y-6">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#991b1b] border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-white mt-2">
                Make a Secure Payment or Gift
              </h3>
              <p className="text-xs text-neutral-400 font-light max-w-md mx-auto">
                Benta’s Funeral Home Secure Checkout • Harlem, NY. Instant NYS Form AP-47 digital receipt generated upon completion.
              </p>
            </div>

            {/* Quick Amount Selectors */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                Select or Enter Contribution Amount ($)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCheckoutAmount(amt)}
                    className={`py-2.5 rounded-xl font-mono font-bold text-xs transition border ${
                      checkoutAmount === amt
                        ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md'
                        : 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-base font-bold">$</span>
                <input
                  type="number"
                  value={checkoutAmount}
                  onChange={(e) => setCheckoutAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-400"
                  placeholder="Enter custom amount"
                />
              </div>
            </div>

            {/* Payer Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={checkoutPayerName}
                  onChange={(e) => setCheckoutPayerName(e.target.value)}
                  placeholder="e.g., Marcus Vance Jr."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                  Email Address (For Receipt)
                </label>
                <input
                  type="email"
                  value={checkoutPayerEmail}
                  onChange={(e) => setCheckoutPayerEmail(e.target.value)}
                  placeholder="e.g., marcus.jr@gmail.com"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Apple Pay', icon: Smartphone, label: 'Apple Pay' },
                  { id: 'Google Pay', icon: Smartphone, label: 'Google Pay' },
                  { id: 'Card', icon: CreditCard, label: 'Credit Card' },
                  { id: 'ACH', icon: Building2, label: 'Chase ACH' }
                ].map((meth) => {
                  const Icon = meth.icon;
                  const isSelected = checkoutMethod === meth.id;
                  return (
                    <button
                      key={meth.id}
                      type="button"
                      onClick={() => setCheckoutMethod(meth.id as any)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center space-y-1 text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#991b1b] to-red-950 border-amber-400 text-white shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-neutral-400'}`} />
                      <span>{meth.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card / ACH Fields */}
            {checkoutMethod === 'Card' && (
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex justify-between items-center text-xs text-neutral-400 font-mono">
                  <span>CARD INFORMATION</span>
                  <div className="flex space-x-1">
                    <span className="text-neutral-300 font-bold">VISA</span>
                    <span>•</span>
                    <span className="text-neutral-300 font-bold">MC</span>
                    <span>•</span>
                    <span className="text-neutral-300 font-bold">AMEX</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  placeholder="Card Number"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={cardDetails.exp}
                    onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                    placeholder="MM/YY"
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs text-center focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                    placeholder="CVC"
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs text-center focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={cardDetails.zip}
                    onChange={(e) => setCardDetails({ ...cardDetails, zip: e.target.value })}
                    placeholder="ZIP Code"
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {checkoutMethod === 'ACH' && (
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-neutral-400 font-mono">
                  <span>DIRECT ACH BANK DEBIT</span>
                  <span className="text-emerald-400 font-bold">0% Transaction Fee</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">{achDetails.bank}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">Routing: {achDetails.routing} • Account: {achDetails.account}</div>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold">Plaid Verified ✓</span>
                </div>
              </div>
            )}

            {/* Condolence Message */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Condolence Note / Message for the Family (Optional)
              </label>
              <textarea
                value={checkoutMessage}
                onChange={(e) => setCheckoutMessage(e.target.value)}
                placeholder="Share your prayers, love, or personal memory..."
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleExecutePayment}
              disabled={isProcessingPayment || checkoutAmount <= 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#991b1b] via-red-800 to-[#991b1b] text-white font-bold text-sm tracking-wide shadow-xl flex items-center justify-center space-x-2 border border-amber-400/50 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="w-5 h-5 text-amber-300 animate-spin" />
                  <span>Processing Secure Payment with Chase Merchant...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Authorize & Pay ${checkoutAmount.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted • Direct Credit to NYS Form AP-47</span>
            </div>

          </div>
        )}

        {/* 5. OFFICIAL NYS FORM AP-47 DIGITAL RECEIPT VIEW */}
        {activeSubTab === 'receipt' && lastReceiptData && (
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* Action Toolbar */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setActiveSubTab('overview')}
                className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1.5 transition"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Back to Overview</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition border border-amber-400/40"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Printable Digital Receipt Card */}
            <div className="bg-white text-neutral-900 p-8 rounded-3xl border border-neutral-300 shadow-2xl font-sans relative overflow-hidden">
              
              {/* Watermark Crest */}
              <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
                <Building2 className="w-32 h-32 text-neutral-900" />
              </div>

              {/* Header */}
              <div className="border-b-2 border-[#991b1b] pb-5 flex justify-between items-start">
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#991b1b] tracking-wider uppercase">
                    Benta’s Funeral Home, Inc.
                  </h3>
                  <p className="text-xs text-neutral-600 font-light mt-0.5">
                    630 St. Nicholas Avenue • Harlem, New York 10030 • (212) 281-8696
                  </p>
                  <div className="text-[10px] font-mono text-neutral-500 mt-1">
                    NYS Registration No. 08850 • Established 1928
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-300 uppercase">
                    Official Payment Receipt
                  </span>
                  <div className="text-xs font-mono font-bold text-neutral-900 mt-1.5">
                    {lastReceiptData.receiptNumber}
                  </div>
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 gap-4 py-6 border-b border-neutral-200 text-xs">
                <div>
                  <span className="text-neutral-500 font-mono uppercase text-[10px]">Decedent / Estate</span>
                  <div className="font-bold text-neutral-900 text-sm mt-0.5">{lastReceiptData.decedentName}</div>
                  <div className="text-neutral-600 font-mono text-[11px]">Case #{lastReceiptData.caseNumber}</div>
                </div>

                <div>
                  <span className="text-neutral-500 font-mono uppercase text-[10px]">Paid By</span>
                  <div className="font-bold text-neutral-900 text-sm mt-0.5">{lastReceiptData.payerName}</div>
                  <div className="text-neutral-600 text-[11px]">{lastReceiptData.payerEmail || 'Family Co-Payer'}</div>
                </div>

                <div>
                  <span className="text-neutral-500 font-mono uppercase text-[10px]">Date & Time</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{lastReceiptData.timestamp}</div>
                  <div className="text-neutral-500 font-mono text-[10px]">TXN: {lastReceiptData.transactionId}</div>
                </div>

                <div>
                  <span className="text-neutral-500 font-mono uppercase text-[10px]">Payment Method</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{lastReceiptData.paymentMethod}</div>
                  <div className="text-emerald-700 font-mono text-[10px] font-bold">Processed & Cleared ✓</div>
                </div>
              </div>

              {/* Financial Line Item Amount */}
              <div className="py-6 border-b border-neutral-200">
                <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Arrangement Contract Payment & Pass-Through Funding
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Applied directly towards NYS Form AP-47 Statement of Goods & Services
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif-title font-bold text-2xl text-[#991b1b]">
                      ${lastReceiptData.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remaining Balance Summary */}
              <div className="pt-4 flex justify-between items-center text-xs">
                <span className="text-neutral-600 font-light">
                  Remaining Case Balance on File:
                </span>
                <span className="font-bold font-mono text-neutral-900 text-sm">
                  ${lastReceiptData.remainingBalance.toLocaleString()}
                </span>
              </div>

              {/* Statutory Footer */}
              <div className="mt-8 pt-4 border-t border-dashed border-neutral-300 text-[10px] text-neutral-500 text-center leading-relaxed">
                Thank you for entrusting Benta’s Funeral Home. All funds received are credited in full compliance with New York State Department of Health Regulations (10 NYCRR § 77.8).
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODAL: ADD CO-PAYER / SPLIT SHARE */}
      {isAddPayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white animate-fadeIn">
            
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-title text-lg font-bold text-white">
                  Add Family Co-Payer / Sponsor Share
                </h3>
              </div>
              <button
                onClick={() => setIsAddPayerModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoPayer} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-mono uppercase block mb-1">
                  Co-Payer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPayerName}
                  onChange={(e) => setNewPayerName(e.target.value)}
                  placeholder="e.g., Marcus Vance Jr."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono uppercase block mb-1">
                    Relationship
                  </label>
                  <select
                    value={newPayerRelationship}
                    onChange={(e) => setNewPayerRelationship(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Church Sponsor">Church Sponsor</option>
                    <option value="Fraternity / Org">Fraternity / Org</option>
                    <option value="Extended Family">Extended Family</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 font-mono uppercase block mb-1">
                    Allocated Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPayerAmount}
                    onChange={(e) => setNewPayerAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono uppercase block mb-1">
                    Mobile Phone (Numbers Only)
                  </label>
                  <input
                    type="tel"
                    value={newPayerPhone}
                    onChange={(e) => setNewPayerPhone(formatPhoneNumbersOnly(e.target.value))}
                    placeholder="(212) 555-0199"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-mono uppercase block mb-1">
                    Email Address (Email Format)
                  </label>
                  <input
                    type="email"
                    value={newPayerEmail}
                    onChange={(e) => setNewPayerEmail(e.target.value)}
                    placeholder="marcus.jr@gmail.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono uppercase block mb-1">
                  Funding Channel / Preferred Payment
                </label>
                <select
                  value={newPayerType}
                  onChange={(e) => setNewPayerType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                >
                  <option value="Credit Card">Credit / Debit Card (Apple Pay / Google Pay)</option>
                  <option value="Family ACH Direct">Family ACH Direct Bank Transfer (Plaid Verified)</option>
                  <option value="Life Insurance Assignment">Life Insurance Policy Assignment (C&J)</option>
                  <option value="Cash / Certified Bank Check">Cash / Certified Bank Check (BFH Office)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-mono uppercase block mb-1">
                  Item or Purpose Assigned
                </label>
                <input
                  type="text"
                  value={newPayerItemAssigned}
                  onChange={(e) => setNewPayerItemAssigned(e.target.value)}
                  placeholder="e.g., Cemetery Cash Advance ($3,500) or Sibling 1/3 Share"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPayerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold transition text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#991b1b] hover:bg-red-800 text-white font-bold transition flex items-center space-x-1.5 shadow-lg border border-amber-400/40 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Send Link</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: SHARE PRIVATE PAYMENT LINK */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white animate-fadeIn">
            
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-title text-lg font-bold text-white">
                  Share Private Payment Link
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-neutral-300 font-light">
                Share this secure contribution link with family members or church sponsors. Payments directly update the official NYS Form AP-47 contract.
              </p>

              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <span className="font-mono text-amber-300 text-[11px] truncate mr-2">
                  https://bfh.nyc/pay/{caseData.caseNumber}?token={selectedSharePayer?.shareableToken || communityConfig.shareableLinkCode}
                </span>
                <button
                  onClick={() => copyShareLink(selectedSharePayer || undefined)}
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              {/* SMS Preview Card */}
              <div className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 text-xs space-y-1.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Pre-Formatted SMS Message</div>
                <p className="text-neutral-200 italic font-light">
                  "Hi {selectedSharePayer?.payerName || 'Family'}, here is the private Benta's Funeral Home payment link for {caseData.decedent.legalName}: bfh.nyc/pay/{caseData.caseNumber}. Thank you for your love and support."
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  copyShareLink(selectedSharePayer || undefined);
                  setIsShareModalOpen(false);
                }}
                className="w-full py-3 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-2xl transition border border-amber-400/40 text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Copy & Send Message</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
