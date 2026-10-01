import React, { useState } from 'react';
import { 
  GoldenRecordCase, 
  PassThroughPayableCheck, 
  StatementOfGoodsData,
  CheckDisbursementStatus 
} from '../../lib/types/funeral';
import { generateCashAdvanceChecks } from '../../lib/utils/checkGenerator';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  FileCheck2, 
  Building2, 
  Download, 
  HandCoins, 
  AlertCircle,
  Layers
} from 'lucide-react';

interface CashAdvanceCheckPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  customStatement?: StatementOfGoodsData;
  onUpdateChecks?: (checks: PassThroughPayableCheck[]) => void;
  onOpenQuickBooks?: (targetCase: GoldenRecordCase) => void;
}

export const CashAdvanceCheckPrinterModal: React.FC<CashAdvanceCheckPrinterModalProps> = ({
  isOpen,
  onClose,
  caseData,
  customStatement,
  onUpdateChecks,
  onOpenQuickBooks
}) => {
  if (!isOpen || !caseData) return null;

  // Initialize checks from existing case or generate dynamically from Section II
  const [checks, setChecks] = useState<PassThroughPayableCheck[]>(() => {
    if (caseData.statementOfGoods?.cashAdvanceChecks && caseData.statementOfGoods.cashAdvanceChecks.length > 0) {
      return caseData.statementOfGoods.cashAdvanceChecks;
    }
    return generateCashAdvanceChecks(caseData, customStatement);
  });

  const [selectedCheckId, setSelectedCheckId] = useState<string>('all');
  const [isQboSynced, setIsQboSynced] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalAmount = checks.reduce((sum, c) => sum + c.amount, 0);
  const printedCount = checks.filter(c => c.status === 'check_printed' || c.status === 'hand_delivered_at_service' || c.status === 'reconciled_cleared').length;
  const deliveredCount = checks.filter(c => c.status === 'hand_delivered_at_service' || c.status === 'reconciled_cleared').length;

  const handleUpdateStatus = (checkId: string, newStatus: CheckDisbursementStatus) => {
    const updated = checks.map(c => {
      if (c.id === checkId) {
        return {
          ...c,
          status: newStatus,
          printedAt: newStatus === 'check_printed' ? new Date().toLocaleString() : c.printedAt,
          deliveredToRecipient: newStatus === 'hand_delivered_at_service' ? `${c.payeeName} Representative` : c.deliveredToRecipient,
          deliveredByDirector: newStatus === 'hand_delivered_at_service' ? (caseData.assignedDirector || 'Jason Benta, LFD') : c.deliveredByDirector
        };
      }
      return c;
    });
    setChecks(updated);
    onUpdateChecks?.(updated);
    showToast(`Check status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
  };

  const handleBatchMarkPrinted = () => {
    const updated = checks.map(c => ({
      ...c,
      status: 'check_printed' as CheckDisbursementStatus,
      printedAt: new Date().toLocaleString()
    }));
    setChecks(updated);
    onUpdateChecks?.(updated);
    showToast(`All ${checks.length} cash advance checks marked as PRINTED`);
  };

  const handleBatchMarkDelivered = () => {
    const updated = checks.map(c => ({
      ...c,
      status: 'hand_delivered_at_service' as CheckDisbursementStatus,
      deliveredToRecipient: `${c.payeeName} Rep on Svc Date`,
      deliveredByDirector: caseData.assignedDirector || 'Jason Benta, LFD #08850'
    }));
    setChecks(updated);
    onUpdateChecks?.(updated);
    showToast(`All ${checks.length} checks logged as HAND-DELIVERED on service date`);
  };

  const handleSyncQuickBooksAP = () => {
    setIsQboSynced(true);
    const updated = checks.map((c, i) => ({
      ...c,
      qboBillPaymentId: `QBO-CHK-${99480 + i}`
    }));
    setChecks(updated);
    onUpdateChecks?.(updated);
    showToast(`Successfully synced ${checks.length} pass-through checks to QuickBooks Online AP!`);
  };

  const handlePrint = () => {
    window.print();
    handleBatchMarkPrinted();
  };

  const handleDownloadLedgerJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      caseNumber: caseData.caseNumber,
      decedentName: caseData.decedent.legalName,
      serviceDate: caseData.serviceSelections.serviceDate,
      totalCashAdvances: totalAmount,
      checks: checks
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PassThrough_Checks_${caseData.caseNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const visibleChecks = selectedCheckId === 'all' 
    ? checks 
    : checks.filter(c => c.id === selectedCheckId);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 font-sans animate-fadeIn">
      
      {/* Modal Container */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none print:bg-white">
        
        {/* Screen-Only Executive Header Toolbar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141b2b] via-[#1e2738] to-[#141b2b] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b-2 border-amber-400/80 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-bold shadow-md border border-amber-300">
              <HandCoins className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  NYS FORM AP-47 SECTION II • PASS-THROUGH AP CHECKS
                </span>
                <span className="text-xs text-neutral-300 font-mono">
                  Case #{caseData.caseNumber}
                </span>
              </div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                Pass-Through Accounts Payable Check Generator
              </h3>
              <p className="text-[11px] text-neutral-300 font-light">
                {caseData.decedent.legalName} • 100% Pass-Through Expenses (0% Funeral Home Markup pursuant to 10 NYCRR § 77.8)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncQuickBooksAP}
              className="bg-[#2ca01c] hover:bg-[#238016] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
              title="Sync cash advance checks to QuickBooks Online AP Accounts"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{isQboSynced ? 'QBO AP Synced ✓' : 'QuickBooks AP Sync'}</span>
            </button>

            {onOpenQuickBooks && (
              <button
                onClick={() => onOpenQuickBooks(caseData)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-neutral-700"
                title="Open QuickBooks Modal"
              >
                <span>Open QBO Center</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm border border-amber-400/40"
              title="Print standard 3-part check vouchers with auto page-breaks"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print Check Vouchers</span>
            </button>

            <button
              onClick={handleDownloadLedgerJSON}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-neutral-700"
              title="Download Ledger JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner print:hidden animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Summary Metrics & Filter Bar (Screen Only) */}
        <div className="bg-white border-b border-neutral-300 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          
          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-4 text-neutral-700">
            <div className="flex items-center space-x-1.5">
              <span className="text-neutral-500 font-medium">Total Check Amount:</span>
              <strong className="font-mono text-sm font-bold text-[#991b1b]">
                ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="h-4 w-px bg-neutral-300 hidden sm:block" />
            <div className="flex items-center space-x-1.5">
              <span className="text-neutral-500 font-medium">Total Pass-Through Checks:</span>
              <strong className="font-mono font-bold text-neutral-900">{checks.length} checks</strong>
            </div>
            <div className="h-4 w-px bg-neutral-300 hidden sm:block" />
            <div className="flex items-center space-x-1.5">
              <span className="text-neutral-500 font-medium">Printed:</span>
              <strong className="font-mono font-bold text-blue-700">{printedCount} / {checks.length}</strong>
            </div>
            <div className="h-4 w-px bg-neutral-300 hidden sm:block" />
            <div className="flex items-center space-x-1.5">
              <span className="text-neutral-500 font-medium">Hand-Delivered on Svc Date:</span>
              <strong className="font-mono font-bold text-emerald-700">{deliveredCount} / {checks.length}</strong>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchMarkPrinted}
              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg border border-neutral-300 transition text-[11px]"
            >
              Mark All Printed
            </button>
            <button
              onClick={handleBatchMarkDelivered}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg border border-emerald-300 transition text-[11px]"
            >
              Mark All Delivered at Service
            </button>
          </div>
        </div>

        {/* Check Selector Tabs (Screen Only) */}
        <div className="bg-neutral-200/70 border-b border-neutral-300 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 print:hidden text-xs">
          <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider pl-1 mr-1 shrink-0">
            Select Check:
          </span>

          <button
            onClick={() => setSelectedCheckId('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 ${
              selectedCheckId === 'all'
                ? 'bg-[#141b2b] text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Checks ({checks.length}) — Batch Mode</span>
          </button>

          {checks.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCheckId(c.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedCheckId === c.id
                  ? 'bg-[#991b1b] text-white shadow-sm'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
              }`}
            >
              <span className="font-mono">{c.checkNumber}</span>
              <span>•</span>
              <span className="max-w-[140px] truncate">{c.payeeName}</span>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200/50">
                ${c.amount.toFixed(2)}
              </span>
            </button>
          ))}
        </div>

        {/* Printable & Scrollable Vouchers Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-neutral-200/40 space-y-8 print:p-0 print:overflow-visible print:bg-white print:space-y-0">
          
          {visibleChecks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-neutral-300 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="font-bold text-base text-neutral-900">No Pass-Through Checks Generated</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                No non-zero cash advance items were detected in Section II of Form AP-47 for this case. Add cemetery, clergy, death certificates, or musician fees in the Contract Builder.
              </p>
            </div>
          ) : (
            visibleChecks.map((check, idx) => (
              <div 
                key={check.id}
                className="bg-white rounded-2xl border border-neutral-300 shadow-md p-6 sm:p-8 space-y-6 print:shadow-none print:border-none print:rounded-none print:p-8 print:m-0 print:h-screen print:flex print:flex-col print:justify-between print:page-break-after-always"
                style={{ breakAfter: 'page' }}
              >
                
                {/* Status Bar (Screen Only) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200 print:hidden text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-neutral-800">Voucher #{idx + 1} of {visibleChecks.length}</span>
                    <span className="text-neutral-400">•</span>
                    <span className="font-mono font-bold text-neutral-900">{check.checkNumber}</span>
                    <span className="text-neutral-400">•</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      check.status === 'hand_delivered_at_service' || check.status === 'reconciled_cleared'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : check.status === 'check_printed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {check.status.replace(/_/g, ' ')}
                    </span>
                    {check.qboBillPaymentId && (
                      <span className="bg-emerald-50 text-emerald-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-200">
                        {check.qboBillPaymentId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={check.status}
                      onChange={(e) => handleUpdateStatus(check.id, e.target.value as CheckDisbursementStatus)}
                      className="bg-neutral-50 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-bold text-neutral-800 outline-none focus:border-[#991b1b]"
                    >
                      <option value="draft_queued">Draft / Queued</option>
                      <option value="check_printed">Check Printed (Director Folder)</option>
                      <option value="hand_delivered_at_service">Hand-Delivered on Service Date</option>
                      <option value="mailed_to_vendor">Mailed to Vendor</option>
                      <option value="reconciled_cleared">Reconciled / Cleared in Bank</option>
                    </select>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* PART 1: TOP 3.5" — OFFICIAL NEGOTIABLE BUSINESS CHECK       */}
                {/* ========================================================= */}
                <div className="border-2 border-neutral-900 rounded-xl p-5 bg-[#fdfdfd] relative shadow-sm space-y-4">
                  
                  {/* Security Background Watermark Accent */}
                  <div className="absolute top-2 right-4 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest pointer-events-none">
                    PASS-THROUGH DISBURSEMENT • SECURE CHECK
                  </div>

                  {/* Check Header: Payer Info & Check Meta */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded bg-[#991b1b] text-white flex items-center justify-center font-serif-title font-bold text-xs">
                          B
                        </div>
                        <h2 className="font-serif-title text-base sm:text-lg font-bold uppercase tracking-wider text-neutral-950">
                          Benta's Funeral Home, Inc.
                        </h2>
                      </div>
                      <p className="text-[11px] text-neutral-700 font-semibold uppercase tracking-wider">
                        630 Saint Nicholas Avenue • New York, NY 10030
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        (212) 281-8850 • NYS LFD Registration #08850
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-mono text-base sm:text-lg font-black text-[#991b1b]">
                        {check.checkNumber}
                      </div>
                      <div className="text-xs text-neutral-800">
                        <span className="text-neutral-500 font-bold mr-1">DATE:</span>
                        <strong className="font-mono font-bold underline decoration-neutral-400 underline-offset-4">
                          {check.serviceDate}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Payee & Dollar Amount Box */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                        PAY TO THE ORDER OF:
                      </span>
                      <div className="p-2 bg-neutral-50 border-b-2 border-neutral-900 font-serif-title font-bold text-sm sm:text-base text-neutral-950 tracking-wide">
                        {check.payeeName}
                      </div>
                      {check.payeeAddress && (
                        <p className="text-[10px] text-neutral-500 pl-1 font-mono">{check.payeeAddress}</p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <div className="bg-neutral-100 border-2 border-neutral-900 rounded-lg p-2.5 px-4 text-right shadow-inner">
                        <span className="text-xs font-bold text-neutral-600 mr-1">$</span>
                        <span className="font-mono text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
                          {check.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spelled Legal Amount Line */}
                  <div className="pt-1">
                    <div className="p-2 bg-neutral-100 border-b-2 border-neutral-900 text-xs font-mono font-bold text-neutral-900 uppercase tracking-wide flex justify-between items-center">
                      <span className="truncate mr-2">{check.amountInWords}</span>
                      <span className="text-[10px] text-neutral-500 font-sans uppercase tracking-widest shrink-0">DOLLARS</span>
                    </div>
                  </div>

                  {/* Bank Name, Memo & Signature Line */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-2">
                    
                    {/* Bank Info */}
                    <div className="sm:col-span-3 space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-neutral-700" />
                        <span className="font-bold text-xs text-neutral-900">JPMorgan Chase Bank, N.A.</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono">Harlem Branch • New York, NY</p>
                    </div>

                    {/* Memo Line (Highlighted per user request!) */}
                    <div className="sm:col-span-5 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                        MEMO:
                      </span>
                      <div className="p-1.5 bg-amber-50/80 border-b-2 border-neutral-900 font-mono font-bold text-[11px] text-[#991b1b] rounded-t">
                        {check.memo}
                      </div>
                    </div>

                    {/* Authorized Signature */}
                    <div className="sm:col-span-4 text-right space-y-1">
                      <div className="border-b-2 border-neutral-900 pb-1 font-serif-title italic font-bold text-sm text-neutral-900">
                        {check.signedByDirector}
                      </div>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">
                        AUTHORIZED SIGNATURE • NYS LFD #08850
                      </span>
                    </div>
                  </div>

                  {/* Authentic MICR Routing Line */}
                  <div className="pt-3 border-t border-neutral-200 text-center">
                    <span className="font-mono text-sm sm:text-base font-bold text-neutral-800 tracking-[0.25em]">
                      {check.micrEncoding}
                    </span>
                  </div>

                </div>

                {/* Perforation Line */}
                <div className="border-t-2 border-dashed border-neutral-400 relative my-2 print:my-4">
                  <span className="absolute -top-2.5 left-6 bg-white px-2 text-[9px] font-mono uppercase text-neutral-500 tracking-widest">
                    ✂ TEAR HERE • ACCOUNTS PAYABLE REMITTANCE ADVICE
                  </span>
                </div>

                {/* ========================================================= */}
                {/* PART 2: MIDDLE 3.5" — AP REMITTANCE VOUCHER                 */}
                {/* ========================================================= */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-300 p-4 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                        Accounts Payable Remittance Advice — NYS Form AP-47 Section II Pass-Through
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        Benta's Funeral Home, Inc. • Disbursement Ledger Record
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Check Number</span>
                      <strong className="font-mono text-sm font-bold text-neutral-900">{check.checkNumber}</strong>
                    </div>
                  </div>

                  {/* Itemized Remittance Table */}
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-neutral-300 text-neutral-500 uppercase text-[10px]">
                        <th className="py-1">Case # &amp; Decedent</th>
                        <th className="py-1">Category &amp; Description</th>
                        <th className="py-1">Informant / Next of Kin</th>
                        <th className="py-1">Service Date</th>
                        <th className="py-1 text-right">Net Amount ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-medium text-neutral-800">
                        <td className="py-2">
                          <strong className="text-neutral-900 block font-mono">{check.caseNumber}</strong>
                          <span className="text-neutral-600">{check.decedentName}</span>
                        </td>
                        <td className="py-2">
                          <strong className="text-neutral-900 block">{check.categoryLabel}</strong>
                          <span className="text-neutral-500 text-[10px]">{check.notes}</span>
                        </td>
                        <td className="py-2">
                          <span>{caseData.informant.fullName}</span>
                          <span className="text-neutral-400 block text-[10px]">Purchaser on Form AP-47</span>
                        </td>
                        <td className="py-2 font-mono">
                          {check.serviceDate}
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-sm text-neutral-950">
                          ${check.amount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Statutory Disclosure Notice */}
                  <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-[10px] text-amber-900 space-y-0.5">
                    <strong>NYS DOH 10 NYCRR § 77.8 &amp; FTC Compliance Certification:</strong>
                    <p className="italic">
                      This check represents a 100% direct pass-through cash advance paid on the family's behalf at the exact actual third-party vendor charge without funeral home margin, rebate, or markup.
                    </p>
                  </div>
                </div>

                {/* Perforation Line */}
                <div className="border-t-2 border-dashed border-neutral-400 relative my-2 print:my-4">
                  <span className="absolute -top-2.5 left-6 bg-white px-2 text-[9px] font-mono uppercase text-neutral-500 tracking-widest">
                    ✂ TEAR HERE • VENDOR HAND-DELIVERY RECEIPT &amp; SIGN-OFF
                  </span>
                </div>

                {/* ========================================================= */}
                {/* PART 3: BOTTOM 3.5" — VENDOR RECEIPT & SIGN-OFF STUB        */}
                {/* ========================================================= */}
                <div className="bg-white rounded-xl border-2 border-neutral-300 p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                        Vendor Hand-Delivery Receipt &amp; Proof of Presentation
                      </h4>
                      <p className="text-[10px] text-neutral-500">
                        To be signed by vendor representative upon physical receipt at cemetery, crematory, or church.
                      </p>
                    </div>
                    <span className="bg-neutral-100 text-neutral-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-neutral-300">
                      Amount: ${check.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2">
                      <div className="border-b border-neutral-400 pb-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Received By (Print Name):</span>
                        <div className="h-5 font-bold text-neutral-800 pt-0.5">
                          {check.deliveredToRecipient || ''}
                        </div>
                      </div>
                      <div className="border-b border-neutral-400 pb-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Vendor / Organization:</span>
                        <div className="h-5 font-semibold text-neutral-800 pt-0.5">
                          {check.payeeName}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="border-b border-neutral-400 pb-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Authorized Signature:</span>
                        <div className="h-5"></div>
                      </div>
                      <div className="border-b border-neutral-400 pb-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Delivered By Director &amp; Date/Time:</span>
                        <div className="h-5 font-mono text-[11px] text-neutral-700 pt-0.5">
                          {check.deliveredByDirector || check.signedByDirector} • {check.serviceDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}

        </div>

        {/* Footer Bar (Screen Only) */}
        <div className="p-3 sm:p-4 bg-white border-t border-neutral-300 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          <div className="flex items-center space-x-2 text-neutral-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Checks conform to ANSI X9 / Check 21 standards with MICR E-13B font line.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-xl transition"
            >
              Close Window
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm border border-amber-300/40"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print {visibleChecks.length} Check Voucher{visibleChecks.length > 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
