import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  History, 
  Clock, 
  UserCheck, 
  FileText, 
  ArrowRight, 
  RotateCcw, 
  Plus, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import { 
  GoldenRecordCase, 
  StatementOfGoodsData, 
  ContractRevisionArchiveRecord 
} from '../../lib/types/funeral';

interface ContractRevisionArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  currentStatement: StatementOfGoodsData;
  revisions: ContractRevisionArchiveRecord[];
  onRestoreRevision?: (snapshot: StatementOfGoodsData) => void;
  onCreateRevision?: (reasonNotes: string) => void;
}

export const ContractRevisionArchiveModal: React.FC<ContractRevisionArchiveModalProps> = ({
  isOpen,
  onClose,
  caseData,
  currentStatement,
  revisions,
  onRestoreRevision,
  onCreateRevision
}) => {
  const [selectedRevisionId, setSelectedRevisionId] = useState<string>(() => {
    return revisions.length > 0 ? revisions[revisions.length - 1].id : '';
  });
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);
  const [newRevisionNotes, setNewRevisionNotes] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'printable_rider'>('timeline');

  if (!isOpen) return null;

  const selectedRevision = revisions.find(r => r.id === selectedRevisionId) || revisions[revisions.length - 1] || null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevisionNotes.trim()) {
      alert('Please provide a reason or note for this contract adjustment.');
      return;
    }
    if (onCreateRevision) {
      onCreateRevision(newRevisionNotes.trim());
    }
    setNewRevisionNotes('');
    setIsCreatingRevision(false);
  };

  const handlePrintRider = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border-2 border-amber-400 overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* MODAL HEADER (SCREEN ONLY) */}
        <div className="bg-gradient-to-r from-neutral-900 via-[#1a1318] to-neutral-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/40 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#991b1b] border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                  Contract Adjustments &amp; Revision Archive
                </h3>
                <span className="bg-amber-400 text-neutral-950 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  NYS DOH Form AP-47
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Case #{caseData.caseNumber} • <strong>{caseData.decedent.legalName}</strong> • Informant: {caseData.informant.fullName} • <span className="text-amber-300 font-bold">{revisions.length} Archived Revision{revisions.length === 1 ? '' : 's'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-white/10 p-0.5 rounded-xl flex items-center text-xs">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-[#991b1b] text-white shadow-xs' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Audit Timeline</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('printable_rider')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'printable_rider' ? 'bg-[#991b1b] text-white shadow-xs' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>NYS AP-47 Amendment Rider</span>
                </span>
              </button>
            </div>

            {viewMode === 'printable_rider' && (
              <button
                onClick={handlePrintRider}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Legal Rider</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ============================================================ */}
          {/* VIEW MODE 1: AUDIT TIMELINE & VERSION INSPECTOR */}
          {/* ============================================================ */}
          {viewMode === 'timeline' && (
            <div className="space-y-6">
              
              {/* Top Banner with Action to Archive Snapshot */}
              <div className="bg-gradient-to-r from-amber-50 via-white to-red-50 p-4 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#991b1b]" />
                    <span className="font-bold text-neutral-900 text-sm">NYS Public Health Law § 3440-a &amp; 10 NYCRR § 77.8 Compliance</span>
                  </div>
                  <p className="text-neutral-600 mt-0.5">
                    All contract line modifications, quantity additions/reductions, and pass-through adjustments are preserved with director audit timestamps and printable amendment riders.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRevision(true)}
                    className="px-4 py-2 bg-[#991b1b] hover:bg-red-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Archive New Revision Snapshot</span>
                  </button>
                </div>
              </div>

              {/* Create Revision Snapshot Drawer Form */}
              {isCreatingRevision && (
                <form onSubmit={handleCreateSubmit} className="bg-neutral-900 text-white p-4 sm:p-5 rounded-2xl border-2 border-amber-400 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>Archive Current Contract State as a New Version</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingRevision(false)}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Provide the rationale or family request notes that prompted this contract adjustment (e.g. &ldquo;Family requested 1 additional limousine for extended family and added 50 memorial programs&rdquo;).
                  </p>
                  <div>
                    <label className="text-[11px] font-bold text-amber-200 block mb-1">
                      Adjustment Reason &amp; Family Request Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={newRevisionNotes}
                      onChange={(e) => setNewRevisionNotes(e.target.value)}
                      placeholder="e.g. Added 1 Cadillac 7-Passenger Limousine and 50 extra 4-panel printed programs per Robert Vance's phone call."
                      className="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingRevision(false)}
                      className="px-3 py-1.5 text-neutral-400 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
                    >
                      ✓ Save &amp; Archive Revision
                    </button>
                  </div>
                </form>
              )}

              {/* Revision Grid: Left Sidebar Version List, Right Inspector */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left: Revisions Timeline List */}
                <div className="md:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 px-1">
                    <span>Revision Timeline ({revisions.length})</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Select to inspect</span>
                  </div>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {revisions.map((rev, index) => {
                      const isSelected = rev.id === (selectedRevision?.id || '');
                      const isBaseline = rev.isBaselineOriginal || index === 0;
                      return (
                        <div
                          key={rev.id}
                          onClick={() => setSelectedRevisionId(rev.id)}
                          className={`p-3.5 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-red-50/80 border-[#991b1b] ring-2 ring-red-400/50 shadow-md'
                              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                isBaseline
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}>
                                {rev.versionLabel || `v1.${index}`}
                              </span>
                              {isBaseline && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Baseline Original
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {rev.savedAtFormatted || rev.savedAt}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-neutral-900 line-clamp-1">
                            {rev.reasonNotes || (isBaseline ? 'Initial Baseline Contract Creation' : 'Form AP-47 Variable Adjustments')}
                          </div>

                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-[#991b1b]" />
                              <span>{rev.savedByDirector?.name || 'Jason Benta, LFD'}</span>
                            </div>
                            <div className="font-mono font-bold text-neutral-900 flex items-center gap-1">
                              <span>${rev.newGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              {!isBaseline && rev.netAdjustmentAmount !== 0 && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                  rev.netAdjustmentAmount > 0 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-emerald-100 text-emerald-900 font-bold'
                                }`}>
                                  {rev.netAdjustmentAmount > 0 ? `+${rev.netAdjustmentAmount.toFixed(2)}` : `${rev.netAdjustmentAmount.toFixed(2)}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Detailed Revision Audit & Comparison Inspector */}
                <div className="md:col-span-7 space-y-4 bg-neutral-50/70 p-4 sm:p-5 rounded-2xl border border-neutral-200">
                  {selectedRevision ? (
                    <div className="space-y-4">
                      
                      {/* Revision Header Details */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                              {selectedRevision.versionLabel}
                            </span>
                            <span className="text-xs text-neutral-500 font-mono">
                              ID: {selectedRevision.id}
                            </span>
                          </div>
                          <h4 className="font-serif-title font-bold text-base text-neutral-900 mt-1">
                            {selectedRevision.reasonNotes || 'Baseline Form AP-47 Statement of Goods'}
                          </h4>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>Saved on {selectedRevision.savedAtFormatted || selectedRevision.savedAt} by <strong>{selectedRevision.savedByDirector?.name || 'Jason Benta, LFD #08850'}</strong></span>
                          </p>
                        </div>

                        {onRestoreRevision && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Load and restore contract snapshot from ${selectedRevision.versionLabel}? Current active entries in the Studio will be updated to match this historical version.`)) {
                                onRestoreRevision(selectedRevision.snapshotStatement);
                                onClose();
                              }
                            }}
                            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-amber-400/40"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore / Load This Version</span>
                          </button>
                        )}
                      </div>

                      {/* Financial Impact Cards */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                          <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Prior Total</span>
                          <span className="font-mono font-bold text-sm text-neutral-700">
                            ${selectedRevision.previousGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                          <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Revised Total</span>
                          <span className="font-mono font-bold text-sm text-[#991b1b]">
                            ${selectedRevision.newGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                          <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Net Adjustment</span>
                          <span className={`font-mono font-bold text-sm ${
                            selectedRevision.netAdjustmentAmount >= 0 ? 'text-amber-800' : 'text-emerald-700'
                          }`}>
                            {selectedRevision.netAdjustmentAmount >= 0 ? `+${selectedRevision.netAdjustmentAmount.toFixed(2)}` : `${selectedRevision.netAdjustmentAmount.toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      {/* Itemized Adjustments Diff Table */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#991b1b]" />
                            <span>Itemized Contract Adjustments &amp; Quantity Deltas ({selectedRevision.adjustmentsSummary?.length || 0}):</span>
                          </span>
                        </div>

                        {(!selectedRevision.adjustmentsSummary || selectedRevision.adjustmentsSummary.length === 0) ? (
                          <div className="p-5 text-center text-xs text-neutral-500 bg-white rounded-xl border border-neutral-200">
                            {selectedRevision.isBaselineOriginal 
                              ? '✓ Initial baseline contract signed and synchronized. No prior revisions recorded.'
                              : 'No line item differences detected for this snapshot.'}
                          </div>
                        ) : (
                          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold text-[11px]">
                                <tr>
                                  <th className="p-2.5">Category</th>
                                  <th className="p-2.5">Item Description</th>
                                  <th className="p-2.5">Modification</th>
                                  <th className="p-2.5 text-right">Line Delta</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100">
                                {selectedRevision.adjustmentsSummary.map((diff) => (
                                  <tr key={diff.id} className="hover:bg-neutral-50/80">
                                    <td className="p-2.5 font-semibold text-[10px] uppercase text-neutral-500 font-mono">
                                      {diff.category}
                                    </td>
                                    <td className="p-2.5 font-bold text-neutral-900">
                                      {diff.itemDescription}
                                    </td>
                                    <td className="p-2.5 text-neutral-700 text-[11px]">
                                      <div className="flex items-center space-x-1">
                                        <span className="text-neutral-500">{diff.fieldChanged}:</span>
                                        <span className="font-mono line-through text-neutral-400">{diff.oldValue}</span>
                                        <ArrowRight className="w-3 h-3 text-neutral-400 inline" />
                                        <span className="font-mono font-bold text-[#991b1b]">{diff.newValue}</span>
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-right font-mono font-bold">
                                      <span className={diff.deltaAmount >= 0 ? 'text-amber-800' : 'text-emerald-700'}>
                                        {diff.deltaAmount >= 0 ? `+$${diff.deltaAmount.toFixed(2)}` : `-$${Math.abs(diff.deltaAmount).toFixed(2)}`}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-neutral-400">
                      Select a revision from the timeline to view details.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW MODE 2: PRINTABLE NYS FORM AP-47 AMENDMENT RIDER */}
          {/* ============================================================ */}
          {viewMode === 'printable_rider' && (
            <div className="space-y-6 bg-white p-4 sm:p-8 rounded-2xl border border-neutral-300 shadow-sm print:p-0 print:border-none print:shadow-none">
              
              {/* Rider Header */}
              <div className="text-center border-b-2 border-neutral-900 pb-4 space-y-1">
                <div className="font-serif-title font-bold text-xl sm:text-2xl text-neutral-900 tracking-wide">
                  BENTA&apos;S FUNERAL HOME, INC.
                </div>
                <div className="text-xs text-neutral-700 uppercase tracking-widest font-semibold">
                  630 St. Nicholas Avenue, New York, NY 10030 • (212) 281-8850
                </div>
                <div className="mt-2 inline-block px-3 py-1 bg-neutral-900 text-amber-300 font-bold text-xs uppercase tracking-wider rounded">
                  NYS DOH Form AP-47 Contract Amendment &amp; Adjustment Rider
                </div>
                <div className="text-[11px] text-neutral-500 italic mt-1">
                  Pursuant to 10 NYCRR § 77.8 and New York State Public Health Law § 3440-a
                </div>
              </div>

              {/* Case Summary Reference Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Case Number:</span>
                  <strong className="font-mono text-neutral-900">{caseData.caseNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Deceased:</span>
                  <strong className="text-neutral-900">{caseData.decedent.legalName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Purchaser / Informant:</span>
                  <strong className="text-neutral-900">{caseData.informant.fullName} ({caseData.informant.relationship})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Contract Date:</span>
                  <strong className="font-mono text-neutral-900">{currentStatement.agreementDate || '2026-09-22'}</strong>
                </div>
              </div>

              {/* Legal Preamble */}
              <p className="text-xs text-neutral-700 leading-relaxed">
                This legal rider constitutes a binding amendment and itemized addendum to the original Statement of Goods and Services Selected (NYS Form AP-47). All counts, quantities, merchandise allocations, and third-party cash advances recorded below reflect authorized adjustments made subsequent to the initial arrangement conference.
              </p>

              {/* Chronological Table of Adjustments */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 flex justify-between">
                  <span>Chronological Schedule of Additions, Reductions &amp; Modifications</span>
                  <span className="font-mono text-neutral-600">Total Versions: {revisions.length}</span>
                </h4>

                <div className="border border-neutral-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-100 border-b border-neutral-300 text-neutral-800 font-bold text-[11px]">
                      <tr>
                        <th className="p-2 border-r border-neutral-200">Revision</th>
                        <th className="p-2 border-r border-neutral-200">Date &amp; Authorized Director</th>
                        <th className="p-2 border-r border-neutral-200">Adjustment Details &amp; Quantities</th>
                        <th className="p-2 text-right">Net Line Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-[11px]">
                      {revisions.map((rev) => (
                        <tr key={rev.id} className="align-top">
                          <td className="p-2 font-mono font-bold border-r border-neutral-200 whitespace-nowrap">
                            {rev.versionLabel}
                          </td>
                          <td className="p-2 border-r border-neutral-200 whitespace-nowrap">
                            <div>{rev.savedAtFormatted || rev.savedAt}</div>
                            <div className="text-[10px] text-neutral-500">{rev.savedByDirector?.name}</div>
                          </td>
                          <td className="p-2 border-r border-neutral-200 space-y-1">
                            <div className="font-semibold text-neutral-900">{rev.reasonNotes || 'Baseline Contract Finalization'}</div>
                            {rev.adjustmentsSummary && rev.adjustmentsSummary.length > 0 && (
                              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-neutral-700">
                                {rev.adjustmentsSummary.map((diff) => (
                                  <li key={diff.id}>
                                    <strong>{diff.itemDescription}</strong>: {diff.fieldChanged} {diff.oldValue} ➔ {diff.newValue} ({diff.deltaAmount >= 0 ? `+$${diff.deltaAmount.toFixed(2)}` : `-$${Math.abs(diff.deltaAmount).toFixed(2)}`})
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                          <td className="p-2 text-right font-mono font-bold whitespace-nowrap">
                            {rev.netAdjustmentAmount === 0 ? '$0.00' : (rev.netAdjustmentAmount > 0 ? `+$${rev.netAdjustmentAmount.toFixed(2)}` : `-$${Math.abs(rev.netAdjustmentAmount).toFixed(2)}`)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-100 border-t-2 border-neutral-900 font-bold text-xs">
                      <tr>
                        <td colSpan={3} className="p-2.5 text-right uppercase">Revised Total Funeral Charges (Form AP-47 Section III):</td>
                        <td className="p-2.5 text-right font-mono text-[#991b1b] text-sm">
                          ${currentStatement.sectionIII.totalFuneralCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Authorization Signatures */}
              <div className="pt-6 border-t-2 border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                <div className="space-y-4">
                  <div className="border-b border-neutral-400 pb-1 min-h-[36px] flex items-end">
                    <span className="font-serif italic text-neutral-800 text-sm">Jason Benta, LFD #08850</span>
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Licensed Funeral Director Authorization</div>
                    <div className="text-[10px] text-neutral-500">Benta&apos;s Funeral Home, Inc. • Registration #08850</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-neutral-400 pb-1 min-h-[36px] flex items-end">
                    <span className="font-serif italic text-neutral-800 text-sm">{caseData.informant.fullName}</span>
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Purchaser / Informant Acknowledgment</div>
                    <div className="text-[10px] text-neutral-500">I hereby approve the quantities, adjustments, and charges detailed above.</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
