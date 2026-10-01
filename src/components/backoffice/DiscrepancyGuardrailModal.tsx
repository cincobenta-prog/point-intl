import React, { useState } from 'react';
import { 
  GoldenRecordCase, 
  DiscrepancyAuditReport, 
  DiscrepancyItem 
} from '../../lib/types/funeral';
import { 
  generateDiscrepancyAudit 
} from '../../lib/data/discrepancyAuditHelper';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Scale, 
  Printer, 
  Check, 
  FileCheck2 
} from 'lucide-react';

interface DiscrepancyGuardrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  onUpdateCase: (updatedCase: GoldenRecordCase) => void;
  onOpenEdrsRapidFill?: () => void;
  onOpenContractModal?: () => void;
}

export const DiscrepancyGuardrailModal: React.FC<DiscrepancyGuardrailModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onUpdateCase,
  onOpenEdrsRapidFill,
  onOpenContractModal
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'phl4201' | 'sync_hub'>('audit');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [auditReport, setAuditReport] = useState<DiscrepancyAuditReport>(() => {
    return caseData.discrepancyAudit || generateDiscrepancyAudit(caseData);
  });
  const [exceptionNoteInput, setExceptionNoteInput] = useState<{ [id: string]: string }>({});
  const [showExceptionModalForId, setShowExceptionModalForId] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefreshAudit = () => {
    const refreshed = generateDiscrepancyAudit(caseData);
    setAuditReport(refreshed);
    onUpdateCase({
      ...caseData,
      discrepancyAudit: refreshed
    });
    setSyncToast('Discrepancy engine rescanned all Golden Record, EDRS, AP-47, and Deed nodes.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleRectifyItem = (item: DiscrepancyItem) => {
    // Perform sync action based on item
    let updatedCase = { ...caseData };

    if (item.category === 'edrs_vitals') {
      if (item.id === 'disc-edrs-mother-maiden') {
        updatedCase = {
          ...updatedCase,
          decedent: {
            ...updatedCase.decedent,
            motherMaidenName: 'Vance (Verified Maiden Surname)'
          }
        };
      } else if (item.id === 'disc-edrs-father-name') {
        updatedCase = {
          ...updatedCase,
          decedent: {
            ...updatedCase.decedent,
            fatherName: 'Arthur Charles Vance Sr.'
          }
        };
      } else if (item.id === 'disc-edrs-ssn') {
        updatedCase = {
          ...updatedCase,
          decedent: {
            ...updatedCase.decedent,
            ssnMasked: 'XXX-XX-8842 (Verified via SSA-721)'
          }
        };
      }
    } else if (item.category === 'phl_4201_kinship') {
      updatedCase = {
        ...updatedCase,
        informant: {
          ...updatedCase.informant,
          isNextOfKin: true,
          hasRightToControl: true
        }
      };
    } else if (item.category === 'ap47_purchaser') {
      if (updatedCase.statementOfGoods) {
        updatedCase = {
          ...updatedCase,
          statementOfGoods: {
            ...updatedCase.statementOfGoods,
            purchaserName: updatedCase.informant.fullName
          }
        };
      }
    }

    const updatedItems = auditReport.items.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          status: 'rectified_synced' as const,
          rectifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return i;
    });

    const activeMismatches = updatedItems.filter(i => i.status === 'active_mismatch');
    const newScore = Math.min(100, Math.round(100 - (activeMismatches.length * 15)));

    const updatedAudit: DiscrepancyAuditReport = {
      ...auditReport,
      items: updatedItems,
      alignmentScore: newScore,
      discrepanciesFound: activeMismatches.length,
      lastAuditedAt: 'Just now'
    };

    updatedCase = {
      ...updatedCase,
      discrepancyAudit: updatedAudit,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Zero-Slippage Discrepancy Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Discrepancy "${item.title}" rectified & synchronized with authoritative Golden Record.`
        },
        ...updatedCase.notes
      ]
    };

    setAuditReport(updatedAudit);
    onUpdateCase(updatedCase);
    setSyncToast(`Rectified: "${item.title}" successfully synchronized!`);
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleApproveException = (itemId: string) => {
    const note = exceptionNoteInput[itemId] || 'Director verified discrepancy with family. Formal exception approved.';
    const updatedItems = auditReport.items.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          status: 'director_exception_approved' as const,
          exceptionNote: note,
          rectifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return i;
    });

    const activeMismatches = updatedItems.filter(i => i.status === 'active_mismatch');
    const newScore = Math.min(100, Math.round(100 - (activeMismatches.length * 10)));

    const updatedAudit: DiscrepancyAuditReport = {
      ...auditReport,
      items: updatedItems,
      alignmentScore: newScore,
      discrepanciesFound: activeMismatches.length,
      lastAuditedAt: 'Just now'
    };

    const updatedCase = {
      ...caseData,
      discrepancyAudit: updatedAudit,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Managing LFD (Exception Override)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Director Exception Approved for Discrepancy #${itemId}: ${note}`
        },
        ...caseData.notes
      ]
    };

    setAuditReport(updatedAudit);
    onUpdateCase(updatedCase);
    setShowExceptionModalForId(null);
    setSyncToast('Director Exception logged to permanent statutory case notes.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  const filteredItems = auditReport.items.filter(i => {
    if (severityFilter === 'all') return true;
    return i.severity === severityFilter;
  });

  const activeCount = auditReport.items.filter(i => i.status === 'active_mismatch').length;
  const criticalCount = auditReport.items.filter(i => i.status === 'active_mismatch' && i.severity === 'critical').length;
  const warningCount = auditReport.items.filter(i => i.status === 'active_mismatch' && i.severity === 'warning').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">

        {/* TOP MODAL HEADER */}
        <div className="bg-gradient-to-r from-neutral-900 via-red-950 to-neutral-900 text-white p-5 px-6 flex items-center justify-between border-b border-red-800/40 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-2xl border ${
              criticalCount > 0 
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                : auditReport.alignmentScore >= 90 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {criticalCount > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-widest font-mono text-amber-300 font-bold">
                  Zero-Slippage Legal & Statutory Guardrail
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300">
                  NYS PHL § 4201 • 10 NYCRR § 77.8
                </span>
              </div>
              <h2 className="text-xl font-serif-title font-bold text-white tracking-wide">
                Cross-Document Discrepancy & Alignment Engine
              </h2>
              <p className="text-xs text-neutral-300 font-light">
                Case #{caseData.caseNumber} • {caseData.decedent.legalName} • Informant: {caseData.informant.fullName} ({caseData.informant.relationship})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshAudit}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition flex items-center gap-1 text-xs font-bold"
              title="Rescan all Golden Record nodes"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Rescan</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {syncToast && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{syncToast}</span>
            </div>
            <button onClick={() => setSyncToast(null)} className="text-emerald-200 hover:text-white">✕</button>
          </div>
        )}

        {/* KPI OVERVIEW & ALIGNMENT GAUGE STRIP */}
        <div className="bg-[#faf7f2] border-b border-amber-200/60 p-4 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center shrink-0">
          
          {/* Gauge 1: Alignment Score */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-sm border ${
              auditReport.alignmentScore >= 90
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : auditReport.alignmentScore >= 70
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-red-50 text-red-700 border-red-300 animate-pulse'
            }`}>
              <span>{auditReport.alignmentScore}%</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                Golden Alignment
              </span>
              <p className="text-xs font-bold text-neutral-900">
                {auditReport.alignmentScore >= 90
                  ? 'Locked & Verified'
                  : auditReport.alignmentScore >= 70
                    ? 'Review Required'
                    : 'Critical Mismatches'}
              </p>
            </div>
          </div>

          {/* Gauge 2: NYS PHL § 4201 Status */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                § 4201 Statutory Tier
              </span>
              <p className="text-xs font-bold text-neutral-900 truncate" title={auditReport.phl4201PriorityTitle}>
                Tier {auditReport.phl4201PriorityTier}: {auditReport.phl4201PriorityTitle}
              </p>
            </div>
          </div>

          {/* Gauge 3: Active Discrepancies */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center shrink-0 font-mono font-bold">
              {activeCount}
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                Active Mismatches
              </span>
              <p className="text-xs font-bold text-neutral-900">
                {criticalCount} Critical • {warningCount} Warnings
              </p>
            </div>
          </div>

          {/* Gauge 4: Last Audit Time */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                Audit Status
              </span>
              <p className="text-xs font-bold text-neutral-900">
                {auditReport.totalChecks} Data Nodes Checked
              </p>
            </div>
          </div>

        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex space-x-2 py-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-red-50 text-[#991b1b] border border-red-200 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Discrepancy Resolution Matrix</span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#991b1b] text-white rounded-full text-[10px] font-mono font-bold">
                  {activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('phl4201')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'phl4201'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>NYS PHL § 4201 Hierarchy Tree</span>
            </button>

            <button
              onClick={() => setActiveTab('sync_hub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'sync_hub'
                  ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>1-Click Master Synchronization Hub</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-neutral-500">
            <span>Filter:</span>
            {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                  severityFilter === sev
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT AREA */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#fcfbfa]">

          {/* TAB 1: AUDIT & DISCREPANCY CARDS */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-emerald-200 shadow-sm space-y-3">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                    Zero Discrepancies Detected!
                  </h3>
                  <p className="text-xs text-neutral-600 max-w-md mx-auto">
                    All vitals, Next-of-Kin signatures, EDRS certifications, Form AP-47 items, and Cemetery deeds are in 100% statutory alignment.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isCritical = item.severity === 'critical';
                  const isWarning = item.severity === 'warning';
                  const isRectified = item.status === 'rectified_synced';
                  const isException = item.status === 'director_exception_approved';

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition shadow-xs ${
                        isRectified
                          ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
                          : isException
                            ? 'bg-purple-50/40 border-purple-200'
                            : isCritical
                              ? 'bg-red-50/70 border-red-300 ring-2 ring-red-500/10'
                              : isWarning
                                ? 'bg-amber-50/70 border-amber-300'
                                : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        {/* Left Info Column */}
                        <div className="space-y-2.5 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isRectified
                                ? 'bg-emerald-100 text-emerald-800'
                                : isException
                                  ? 'bg-purple-100 text-purple-800'
                                  : isCritical
                                    ? 'bg-red-600 text-white'
                                    : isWarning
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {isRectified ? '✓ RECTIFIED & SYNCED' : isException ? '⚖️ DIRECTOR EXCEPTION LOGGED' : `${item.severity.toUpperCase()} CONFLICT`}
                            </span>

                            <span className="text-xs font-bold text-neutral-900 font-serif-title">
                              {item.title}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-700 leading-relaxed font-light">
                            {item.description}
                          </p>

                          {/* Conflict Data Comparison Box */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/90 p-3 rounded-xl border border-neutral-200 text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                                🌟 Authoritative Golden Record:
                              </span>
                              <p className="font-mono font-bold text-[#991b1b] bg-red-50/60 p-1.5 rounded border border-red-200">
                                {item.goldenRecordValue}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                                📄 Conflict in {item.conflictingDocumentName}:
                              </span>
                              <p className="font-mono font-bold text-neutral-800 bg-neutral-100 p-1.5 rounded border border-neutral-300">
                                {item.conflictingValue}
                              </p>
                            </div>
                          </div>

                          {/* Legal & Statutory Impact Note */}
                          <div className="bg-[#141b2b]/5 p-2.5 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-700 flex items-start space-x-2">
                            <Scale className="w-4 h-4 text-[#991b1b] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-neutral-900">Statutory Risk: </span>
                              <span>{item.statutoryImpact}</span>
                            </div>
                          </div>

                          {item.exceptionNote && (
                            <div className="bg-purple-50 p-2 rounded-xl border border-purple-200 text-xs text-purple-900 font-medium">
                              <strong>Director Override Note:</strong> {item.exceptionNote}
                            </div>
                          )}
                        </div>

                        {/* Right Action Column */}
                        <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-2 shrink-0">
                          {item.status === 'active_mismatch' ? (
                            <>
                              <button
                                onClick={() => handleRectifyItem(item)}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5 border border-emerald-400/50"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>1-Click Sync & Fix</span>
                              </button>

                              <button
                                onClick={() => setShowExceptionModalForId(item.id)}
                                className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                              >
                                <Scale className="w-3.5 h-3.5 text-purple-700" />
                                <span>Director Exception</span>
                              </button>

                              {item.category === 'edrs_vitals' && onOpenEdrsRapidFill && (
                                <button
                                  onClick={onOpenEdrsRapidFill}
                                  className="w-full sm:w-auto text-[11px] text-[#991b1b] hover:underline font-bold"
                                >
                                  Open EDRS RapidFill ➔
                                </button>
                              )}

                              {item.category === 'ap47_purchaser' && onOpenContractModal && (
                                <button
                                  onClick={onOpenContractModal}
                                  className="w-full sm:w-auto text-[11px] text-emerald-700 hover:underline font-bold"
                                >
                                  Open AP-47 Contract ➔
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Resolved at {item.rectifiedAt}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: NYS PHL § 4201 STATUTORY HIERARCHY TREE */}
          {activeTab === 'phl4201' && (
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-purple-700" />
                  <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                    NYS Public Health Law § 4201 Statutory Right of Disposition
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 font-light mt-1">
                  In New York State, the legal right to control the disposition of human remains (burial, cremation, or entombment) descends strictly in the statutory order below.
                </p>
              </div>

              {/* 7-Tier Statutory Ladder */}
              <div className="space-y-3">
                {[
                  { tier: 1, title: 'Designated Written Agent', desc: 'Person designated in a written instrument signed pursuant to NYS PHL § 4201 (Appointment of Agent to Control Disposition).', requiredDocs: 'NYS PHL § 4201 Form signed & notarized by decedent during lifetime.' },
                  { tier: 2, title: 'Surviving Legal Spouse', desc: 'Surviving legal spouse (not legally separated or divorced).', requiredDocs: 'Marriage Certificate on file or uncontradicted affidavit.' },
                  { tier: 3, title: 'Surviving Domestic Partner', desc: 'Registered domestic partner (NYC Domestic Partnership or NYS equivalent).', requiredDocs: 'NYC Domestic Partner Registration Certificate.' },
                  { tier: 4, title: 'Surviving Adult Children', desc: 'Any surviving child 18 years of age or older. Majority rule applies if disputes occur.', requiredDocs: 'Majority consent or non-objecting sibling affidavits.' },
                  { tier: 5, title: 'Surviving Parents', desc: 'Surviving father and/or mother of the decedent.', requiredDocs: 'Parental identification verification.' },
                  { tier: 6, title: 'Surviving Adult Siblings', desc: 'Any surviving brother or sister 18 years of age or older.', requiredDocs: 'Kinship verification.' },
                  { tier: 7, title: 'Guardian / Close Friend / Estate Fiduciary', desc: 'Appointed guardian, executor, or close friend with demonstrated personal relationship when no closer relatives exist.', requiredDocs: 'Court Letters Testamentary / Affidavit of Diligent Search.' }
                ].map((tierItem) => {
                  const isCurrentInformantTier = auditReport.phl4201PriorityTier === tierItem.tier;

                  return (
                    <div
                      key={tierItem.tier}
                      className={`p-4 rounded-2xl border transition ${
                        isCurrentInformantTier
                          ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-sm'
                          : 'bg-neutral-50/60 border-neutral-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                              isCurrentInformantTier
                                ? 'bg-purple-700 text-white'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {tierItem.tier}
                            </span>
                            <h4 className="text-sm font-bold text-neutral-900 font-serif-title">
                              Tier {tierItem.tier}: {tierItem.title}
                            </h4>
                            {isCurrentInformantTier && (
                              <span className="bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                👉 ACTIVE INFORMANT MATCH ({caseData.informant.fullName})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 font-light pl-8">
                            {tierItem.desc}
                          </p>
                          <p className="text-[11px] text-purple-950 font-medium pl-8">
                            <strong>Statutory Verification:</strong> {tierItem.requiredDocs}
                          </p>
                        </div>

                        {isCurrentInformantTier && (
                          <div className="shrink-0">
                            <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl">
                              <Check className="w-3.5 h-3.5" />
                              <span>Statutory Standing Valid</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK MASTER SYNCHRONIZATION HUB */}
          {activeTab === 'sync_hub' && (
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                  Golden Record Downstream Broadcast & Sync Hub
                </h3>
                <p className="text-xs text-neutral-600 font-light mt-1">
                  Propagate verified Golden Record values down to all secondary documents, EDRS worksheets, contracts, and partner portals in 1 click.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Node 1: EDRS eVital */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">NYC DOHMH EDRS eVital</span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">eVital 2.0</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Syncs Legal Name, SSN, DOD, DOB, Mother's Maiden Name, Father's Name, and Marital Status.
                  </p>
                  <button
                    onClick={() => {
                      handleRefreshAudit();
                      setSyncToast('Propagated Golden Record vitals to EDRS rapid fill worksheet.');
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Sync to EDRS ➔
                  </button>
                </div>

                {/* Node 2: NYS Form AP-47 Statement */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">Form AP-47 Statement of Goods</span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">10 NYCRR § 77.8</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Syncs Purchaser Name, Decedent Legal Name, Itemized General Price List, and Cash Advances.
                  </p>
                  <button
                    onClick={() => {
                      handleRefreshAudit();
                      setSyncToast('Propagated Golden Record to Form AP-47 contract items.');
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Sync to AP-47 Contract ➔
                  </button>
                </div>

                {/* Node 3: Cemetery & Woodlawn Dispatch */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">Cemetery / Woodlawn Dispatch</span>
                    <span className="text-[10px] font-mono bg-red-100 text-[#991b1b] px-2 py-0.5 rounded">Interment Order</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Syncs Full Middle Name, Informant Next of Kin priority, and Cremation Authorization permits.
                  </p>
                  <button
                    onClick={() => {
                      handleRefreshAudit();
                      setSyncToast('Propagated Golden Record to Cemetery & Crematory order packet.');
                    }}
                    className="w-full py-2 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    Sync to Cemetery Order ➔
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white border-t border-neutral-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audited automatically against NYS Bureau of Funeral Directing standards.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                window.print();
              }}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 border border-neutral-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statutory Audit Report</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              Close Discrepancy Hub
            </button>
          </div>
        </div>

        {/* EXCEPTION OVERRIDE POPUP MODAL */}
        {showExceptionModalForId && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 border border-neutral-300 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="font-serif-title font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-700" />
                  <span>Licensed Funeral Director Exception Override</span>
                </h4>
                <button onClick={() => setShowExceptionModalForId(null)} className="text-neutral-400 hover:text-neutral-700">✕</button>
              </div>

              <p className="text-xs text-neutral-600 font-light">
                Under NYCRR Title 10, a Licensed Funeral Director may execute an exception note if an apparent discrepancy has been independently verified with the informant or legal counsel.
              </p>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Director Rationale & Verification Note:
                </label>
                <textarea
                  rows={3}
                  value={exceptionNoteInput[showExceptionModalForId] || ''}
                  onChange={(e) => setExceptionNoteInput({ ...exceptionNoteInput, [showExceptionModalForId]: e.target.value })}
                  placeholder="e.g. Informant confirmed decedent never used middle name legally; birth certificate inspected and verified."
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs outline-none focus:border-[#991b1b]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowExceptionModalForId(null)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveException(showExceptionModalForId)}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl"
                >
                  Sign & Log Director Exception
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
