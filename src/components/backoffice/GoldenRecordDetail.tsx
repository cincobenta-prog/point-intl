import React, { useState, useEffect } from 'react';
import { 
  GoldenRecordCase, 
  UserRole, 
  SimulatedNotification,
  CasePhase,
  PartnerScheduleRequest,
  FlightChecklistActionType,
  CaseFlightPhaseProgress
} from '../../lib/types/funeral';
import { 
  ShieldCheck, 
  ShieldAlert,
  Send, 
  CheckCircle, 
  User, 
  Building, 
  Flame, 
  PenTool, 
  Clock,
  Smartphone,
  Sparkles,
  Mail,
  Key,
  Copy,
  X,
  Check,
  Video,
  Truck,
  ScrollText,
  Users,
  Calendar,
  CalendarCheck,
  Printer,
  Compass,
  BookOpen
} from 'lucide-react';
import { WebcastSchedulingModal } from './WebcastSchedulingModal';
import { CaseFlightChecklist } from './CaseFlightChecklist';
import { DayOfServiceVIPItineraryModal } from '../family/DayOfServiceVIPItineraryModal';
import { INITIAL_SERVICE_PARTNERS, getInitialFlightChecklist } from '../../lib/data/mockCases';
import { generateDiscrepancyAudit } from '../../lib/data/discrepancyAuditHelper';

interface GoldenRecordDetailProps {
  caseData: GoldenRecordCase;
  currentRole: UserRole;
  onUpdateCase: (updatedCase: GoldenRecordCase) => void;
  onOpenESign: () => void;
  onOpenWoodlawnDispatch: () => void;
  onOpenDocuments: () => void;
  onOpenRemovalModal?: () => void;
  onOpenContractModal?: () => void;
  onOpenPrintAP47?: () => void;
  onOpenAppointmentModal?: () => void;
  onOpenDiscrepancyGuardrail?: () => void;
  onOpenDirectorDayOfServiceHUD?: () => void;
  onOpenFamilyProofApproval?: () => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenNotifications?: () => void;
  onOpenFamilyPortal?: () => void;
  onOpenMemorialProgramModal?: () => void;
  onOpenEdrsRapidFillModal?: () => void;
  onOpenChapelQrModal?: () => void;
  onAdvancePhase?: (caseId: string, nextPhase: CasePhase) => void;
  onOpenTwoWaySmsModal?: (requestId?: string) => void;
  onOpenCalendar?: () => void;
  onOpenLiveryModal?: () => void;
  onOpenFinances?: () => void;
  onOpenAftercare?: () => void;
  onOpenCheckPrinter?: () => void;
  partnerRequests?: PartnerScheduleRequest[];
}

export const GoldenRecordDetail: React.FC<GoldenRecordDetailProps> = ({
  caseData,
  currentRole,
  onUpdateCase,
  onOpenESign,
  onOpenWoodlawnDispatch,
  onOpenDocuments,
  onOpenRemovalModal,
  onOpenContractModal,
  onOpenPrintAP47,
  onOpenAppointmentModal,
  onOpenDiscrepancyGuardrail,
  onOpenDirectorDayOfServiceHUD,
  onOpenFamilyProofApproval,
  onSendNotification,
  onOpenNotifications,
  onOpenFamilyPortal,
  onOpenMemorialProgramModal,
  onOpenEdrsRapidFillModal,
  onOpenChapelQrModal,
  onAdvancePhase,
  onOpenTwoWaySmsModal,
  onOpenCalendar,
  onOpenLiveryModal,
  onOpenFinances,
  onOpenAftercare,
  onOpenCheckPrinter,
  partnerRequests = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'informant' | 'services' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [showArrivalToast, setShowArrivalToast] = useState(false);
  const [previewEmailModalOpen, setPreviewEmailModalOpen] = useState(false);
  const [previewSMSModalOpen, setPreviewSMSModalOpen] = useState(false);
  const [isWebcastModalOpen, setIsWebcastModalOpen] = useState(false);
  const [isVIPItineraryModalOpen, setIsVIPItineraryModalOpen] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState<string | null>(null);
  const [checklistProgress, setChecklistProgress] = useState<CaseFlightPhaseProgress[]>(() => getInitialFlightChecklist(caseData));

  useEffect(() => {
    setChecklistProgress(getInitialFlightChecklist(caseData));
  }, [caseData.id, caseData.safeArrivalStatus, caseData.statementOfGoods, caseData.medicalCertifier.edrsStatus, caseData.arrangementAppointment]);

  const handleFlightChecklistAction = (actionType: FlightChecklistActionType) => {
    switch (actionType) {
      case 'open_appointment':
        onOpenAppointmentModal?.();
        break;
      case 'open_removal':
        onOpenRemovalModal?.();
        break;
      case 'open_contract':
        onOpenContractModal?.();
        break;
      case 'open_print_ap47':
        onOpenPrintAP47 ? onOpenPrintAP47() : onOpenContractModal?.();
        break;
      case 'open_cash_advance_checks':
        onOpenCheckPrinter?.();
        break;
      case 'open_calendar':
        onOpenCalendar?.();
        break;
      case 'open_edrs':
        onOpenEdrsRapidFillModal?.();
        break;
      case 'open_esign':
        onOpenESign();
        break;
      case 'open_memorial_program':
        onOpenMemorialProgramModal?.();
        break;
      case 'open_chapel_qr':
        onOpenChapelQrModal?.();
        break;
      case 'open_webcast':
        setIsWebcastModalOpen(true);
        break;
      case 'open_woodlawn':
        onOpenWoodlawnDispatch();
        break;
      case 'open_livery':
        onOpenLiveryModal?.();
        break;
      case 'open_partner_sms':
        onOpenTwoWaySmsModal?.();
        break;
      case 'open_finances':
        onOpenFinances?.();
        break;
      case 'open_aftercare':
        onOpenAftercare?.();
        break;
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    setChecklistProgress(prev => prev.map(phase => ({
      ...phase,
      items: phase.items.map(item => {
        if (item.id === itemId) {
          const newStatus = !item.isCompleted;
          return {
            ...item,
            isCompleted: newStatus,
            completedAt: newStatus ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            completedBy: newStatus ? (currentRole === 'director' ? 'Jason Benta, LFD' : 'Staff Member') : undefined
          };
        }
        return item;
      })
    })));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAlert(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedAlert(null), 3000);
  };

  // Trigger Safe Arrival Notification
  const handleTriggerSafeArrival = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: GoldenRecordCase = {
      ...caseData,
      safeArrivalStatus: 'safe_arrival_confirmed',
      safeArrivalTimestamp: timeStr,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'System Trigger (Arrival Log)',
          timestamp: timeStr,
          text: `Safe Arrival confirmed at 630 St Nicholas Ave. Instant notification dispatched to Next of Kin (${caseData.informant.phone} / ${caseData.informant.email}).`
        },
        ...caseData.notes
      ]
    };
    onUpdateCase(updated);

    if (onSendNotification) {
      const notif: SimulatedNotification = {
        id: `notif-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: caseData.informant.fullName,
        recipientPhone: caseData.informant.phone,
        recipientEmail: caseData.informant.email,
        channel: 'sms',
        type: 'safe_arrival',
        title: 'Safe Arrival Confirmation at 630 St. Nicholas Ave',
        bodyText: `Dear ${caseData.informant.fullName}, this is Jason Benta from Benta's Funeral Home. We want to gently let you know that your beloved ${caseData.decedent.legalName} has safely arrived into our dignified care at 630 Saint Nicholas Ave. Our custodial team is attending to them with the utmost reverence.`,
        sentAt: `Today ${timeStr}`,
        status: 'delivered',
        actionUrl: '#portal',
        actionButtonText: 'View Family Portal',
        metadata: {
          carrier: 'Verizon Wireless (NYC 5G)',
          deliveryLatencyMs: 140,
          twilioMessageSid: `SM${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`,
          readReceiptTimestamp: `Today ${timeStr}`
        }
      };
      onSendNotification(notif);
    }

    setShowArrivalToast(true);
    setTimeout(() => setShowArrivalToast(false), 6000);
  };

  // Trigger Family Portal Access Invitation via Email & SMS
  const handleSendPortalInvite = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: GoldenRecordCase = {
      ...caseData,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Portal Access Dispatcher',
          timestamp: timeStr,
          text: `Official Family Portal Invitation dispatched via Email (${caseData.informant.email}) and SMS (${caseData.informant.phone}). Access token generated with 9-part obituary studio and digital tribute suite.`
        },
        ...caseData.notes
      ]
    };
    onUpdateCase(updated);

    if (onSendNotification) {
      const notif: SimulatedNotification = {
        id: `notif-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: caseData.informant.fullName,
        recipientPhone: caseData.informant.phone,
        recipientEmail: caseData.informant.email,
        channel: 'sms',
        type: 'portal_access_invite',
        title: 'Official Family Portal Access & 9-Part Obituary Studio',
        bodyText: `Dear ${caseData.informant.fullName}, your private Benta's Family Portal for ${caseData.decedent.legalName} (Case #${caseData.caseNumber}) is now active. Access arrangement details, collaborate on the 9-part obituary, eSign legal documents, and listen to 360° digital voice tributes here: https://portal.e-bfh.com/case/${caseData.caseNumber} • Passcode: 1928-BFH`,
        sentAt: `Today ${timeStr}`,
        status: 'delivered',
        actionUrl: '#portal',
        actionButtonText: 'Open Secure Family Portal'
      };
      onSendNotification(notif);
    }

    alert(`Official Family Portal Invitation sent via Email (${caseData.informant.email}) and SMS (${caseData.informant.phone}) to ${caseData.informant.fullName}!`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const updated: GoldenRecordCase = {
      ...caseData,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: currentRole === 'director' ? 'Jason Benta' : 'Staff Member',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: newNote.trim()
        },
        ...caseData.notes
      ]
    };
    onUpdateCase(updated);
    setNewNote('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-neutral-900">
      
      {/* Toast Alert for Safe Arrival */}
      {showArrivalToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Safe Arrival Dispatched</p>
              <p className="text-xs text-emerald-700">Immediate reassurance SMS & email sent to {caseData.informant.fullName} ({caseData.informant.phone}).</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-2xs transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>View in SMS Simulator</span>
              </button>
            )}
            <button 
              onClick={() => setShowArrivalToast(false)}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 1. INTERACTIVE CASE FLIGHT CHECKLIST & STAGE GATEKEEPER BANNER */}
      <CaseFlightChecklist
        caseItem={caseData}
        currentPhase={caseData.currentPhase}
        checklistProgress={checklistProgress}
        onTriggerAction={handleFlightChecklistAction}
        onAdvancePhase={onAdvancePhase}
        onToggleItemCompletion={handleToggleChecklistItem}
      />

      {/* 2. ZERO-SLIPPAGE MULTI-DOCUMENT DISCREPANCY & STATUTORY ALIGNMENT BANNER */}
      {(() => {
        const audit = caseData.discrepancyAudit || generateDiscrepancyAudit(caseData);
        const hasMismatches = audit.discrepanciesFound > 0;
        const isCritical = audit.items.some(i => i.severity === 'critical' && i.status === 'active_mismatch');

        return (
          <div className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isCritical
              ? 'bg-red-50/90 border-red-300 ring-2 ring-red-500/20'
              : hasMismatches
                ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-emerald-50/90 border-emerald-300'
          }`}>
            <div className="flex items-center space-x-3.5">
              <div className={`p-2.5 rounded-2xl border shrink-0 ${
                isCritical
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : hasMismatches
                    ? 'bg-amber-500 text-neutral-950 border-amber-300'
                    : 'bg-emerald-600 text-white border-emerald-400'
              }`}>
                {isCritical ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isCritical
                      ? 'bg-red-200 text-red-900'
                      : hasMismatches
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {audit.alignmentScore}% Golden Alignment • NYS PHL § 4201 Tier {audit.phl4201PriorityTier}
                  </span>
                  <span className="font-serif-title font-bold text-xs text-neutral-900">
                    {hasMismatches
                      ? `⚠️ ${audit.discrepanciesFound} Cross-Document Discrepanc${audit.discrepanciesFound > 1 ? 'ies' : 'y'} Detected`
                      : '✓ Zero Slippage: All Documents & Permits in 100% Statutory Alignment'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-light mt-0.5">
                  {hasMismatches
                    ? `Cross-check identified potential conflicts across EDRS, AP-47, or Cemetery records. Action required before filing.`
                    : `Vitals, next-of-kin signatures, Form AP-47, and Woodlawn permits verified against state health regulations.`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {onOpenDiscrepancyGuardrail && (
                <button
                  onClick={onOpenDiscrepancyGuardrail}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                    isCritical
                      ? 'bg-red-700 hover:bg-red-800 text-white'
                      : hasMismatches
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-white hover:bg-neutral-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{hasMismatches ? 'Review & Rectify Conflicts' : 'Inspect Compliance Tree'}</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Golden Record Architecture Banner: Clean White & Crimson */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-bold text-[#991b1b] bg-red-50 px-2.5 py-1 rounded border border-red-200">
              {caseData.caseNumber}
            </span>
            <h2 className="font-serif-title text-2xl font-bold text-neutral-900">
              {caseData.decedent.legalName}
            </h2>
            <span className="text-xs text-[#b45309] font-bold uppercase tracking-widest hidden sm:inline">
              • Golden Record Central Hub
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-light">
            Single Source of Truth for Name, DOD, Next of Kin, Permits, Contracts, and Downstream State Filings.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap gap-2.5">
          {caseData.safeArrivalStatus !== 'safe_arrival_confirmed' && (
            <button
              onClick={handleTriggerSafeArrival}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Safe Arrival at BFH</span>
            </button>
          )}

          {/* 1. Director Day-of-Service HUD Button */}
          {onOpenDirectorDayOfServiceHUD && (
            <button
              onClick={onOpenDirectorDayOfServiceHUD}
              className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-400 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-2xs"
              title="Open Mobile Day-of-Service Director Pocket HUD & 1-Click SMS Cortege Dispatch"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <span>📱 Director Day-of-Service HUD</span>
            </button>
          )}

          {/* 3. Family Proof Approval & Press Lock Button */}
          {onOpenFamilyProofApproval && (
            <button
              onClick={onOpenFamilyProofApproval}
              className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-2xs"
              title="Open Family Proof Approval & Commercial Press Lock Hub"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-700" />
              <span>🖨️ Family Proof & Press Lock</span>
            </button>
          )}

          <button
            onClick={onOpenESign}
            className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-sm border border-amber-300/40"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-300" />
            <span>Open Legal eSign Pad</span>
          </button>

          {onOpenRemovalModal && (
            <button
              onClick={onOpenRemovalModal}
              className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Schedule / View First Call Removal & Custody Affidavit"
            >
              <Truck className="w-3.5 h-3.5 text-blue-700" />
              <span>🚑 Removal & Affidavit</span>
            </button>
          )}

          {onOpenAppointmentModal && (
            <button
              onClick={onOpenAppointmentModal}
              className="bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Schedule / Manage Family In-Person Arrangement Conference"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>📅 Conference Scheduler</span>
            </button>
          )}

          {onOpenContractModal && (
            <button
              onClick={onOpenContractModal}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Open Arrangement Conference & Form AP-47 Contract Studio"
            >
              <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
              <span>📜 AP-47 Contract Studio</span>
            </button>
          )}

          {onOpenPrintAP47 && (
            <button
              onClick={onOpenPrintAP47}
              className="bg-[#991b1b] hover:bg-red-800 text-white border border-amber-300/60 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Print Official Form AP-47 Statement of Goods & Services (10 NYCRR § 77.8)"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>🖨️ Print Form AP-47</span>
            </button>
          )}

          {onOpenCheckPrinter && (
            <button
              onClick={onOpenCheckPrinter}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Print 3-Part Pass-Through Cash Advance Checks (10 NYCRR § 77.8)"
            >
              <Printer className="w-3.5 h-3.5 text-amber-700" />
              <span>💵 Cash Advance Checks</span>
            </button>
          )}

          <button
            onClick={() => setIsVIPItineraryModalOpen(true)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
            title="Open Day-of-Service Mobile VIP Family Itinerary & GPS Dispatch"
          >
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>📱 VIP Itinerary & GPS</span>
          </button>

          {onOpenMemorialProgramModal && (
            <button
              onClick={onOpenMemorialProgramModal}
              className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Print 4-Panel Memorial Service Program (8.5x11 Bifold)"
            >
              <ScrollText className="w-3.5 h-3.5 text-purple-700" />
              <span>🖨️ 4-Panel Bulletin Studio</span>
            </button>
          )}

          {onOpenEdrsRapidFillModal && (
            <button
              onClick={onOpenEdrsRapidFillModal}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="NYS EDRS & NYC eVital Death Registration Assistant"
            >
              <Building className="w-3.5 h-3.5 text-indigo-700" />
              <span>🏛️ NYS EDRS Assistant</span>
            </button>
          )}

          {onOpenChapelQrModal && (
            <button
              onClick={onOpenChapelQrModal}
              className="bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Print Chapel Welcome & Tribute QR Easel Sign"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-700" />
              <span>📱 Chapel QR Easel Sign</span>
            </button>
          )}

          <button
            onClick={handleSendPortalInvite}
            className="bg-red-50 hover:bg-red-100 text-[#991b1b] border border-red-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-sm"
            title="Dispatch Family Portal Access Link via Email & SMS"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Portal Invite (Email + SMS)</span>
          </button>

          {onOpenFamilyPortal && (
            <button
              onClick={onOpenFamilyPortal}
              className="bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-sm"
              title="Open Family Portal with 9-Part Obituary Writer Suite"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>🕊️ Family Portal & Obituary Studio</span>
            </button>
          )}

          <button
            onClick={onOpenWoodlawnDispatch}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition"
          >
            <Flame className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Woodlawn Dispatch</span>
          </button>
        </div>
      </div>

      {/* Architecture Note Alert: Light Red & Gold Accent */}
      <div className="bg-amber-50/80 border border-amber-300/80 p-4 rounded-xl flex items-center space-x-3 text-xs text-amber-950 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-[#b45309] shrink-0" />
        <div>
          <strong className="font-bold text-[#991b1b]">Golden Record Zero-Transcription Architecture:</strong> Staff never re-copy data. All vital fields are populated once and verified against state EDRS, permits, and contracts, eliminating ~80% of administrative errors.
        </div>
      </div>

      {/* Main Grid: Left Detailed Tabs, Right Status & Financial Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Tabs & Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Pill Tabs */}
          <div className="flex border-b border-neutral-200 space-x-2 pb-2">
            {[
              { id: 'overview', label: 'Case Summary' },
              { id: 'vitals', label: 'Vital Statistics' },
              { id: 'informant', label: 'Next of Kin & Legal' },
              { id: 'services', label: 'Service & Merchandise' },
              { id: 'notes', label: `Activity Notes (${caseData.notes.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-[#991b1b] border border-red-200 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* BI-DIRECTIONAL FIRST CALL & LOGISTICS BRIDGE PANEL */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#991b1b] text-white p-5 rounded-2xl shadow-md border border-amber-400/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                      Bi-Directional Case Bridge
                    </span>
                    <span className="text-xs text-neutral-300 font-semibold">
                      Pathway: {caseData.intakePathway === 'unexpected_removal_first' ? '🚨 Unexpected Death (Removal First)' : caseData.intakePathway === 'scheduled_arrangement_first' ? '📅 Advance Arrangement First' : '⚖️ Standard First Call'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onOpenRemovalModal && (
                      <button
                        onClick={onOpenRemovalModal}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5 text-blue-200" />
                        <span>{caseData.safeArrivalStatus === 'safe_arrival_confirmed' ? '✓ Removal Completed' : '🚑 Dispatch Removal'}</span>
                      </button>
                    )}

                    {onOpenAppointmentModal && (
                      <button
                        onClick={onOpenAppointmentModal}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-200" />
                        <span>{caseData.arrangementAppointment?.status === 'confirmed' ? `📅 Conference: ${caseData.arrangementAppointment.confirmedSlot?.date}` : '📅 Schedule Conference'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-white/10">
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">First Call Custody Location</span>
                    <strong className="text-white text-xs block truncate">{caseData.removalSchedule?.facilityName || caseData.decedent.facilityName || caseData.decedent.placeOfDeath}</strong>
                    <span className="text-neutral-300 text-[11px] block truncate">{caseData.removalSchedule?.facilityFloorRoom || 'Floor / Bay Noted'}</span>
                  </div>

                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Attending Physician (EDRS)</span>
                    <strong className="text-white text-xs block truncate">{caseData.medicalCertifier.physicianName}</strong>
                    <span className="text-neutral-300 text-[11px] block">{caseData.medicalCertifier.phone}</span>
                  </div>

                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Family Arrangement Status</span>
                    <strong className="text-amber-300 text-xs block truncate">
                      {caseData.arrangementAppointment?.status === 'confirmed' 
                        ? `Confirmed: ${caseData.arrangementAppointment.confirmedSlot?.date} (${caseData.arrangementAppointment.confirmedSlot?.time})`
                        : 'Candidate Timeslots Offered'}
                    </strong>
                    <span className="text-neutral-300 text-[11px] block truncate">{caseData.arrangementAppointment?.locationVenue || '630 St. Nicholas Ave'}</span>
                  </div>
                </div>
              </div>

              {/* Decedent Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#991b1b]" />
                  <span>Decedent Master Profile</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Full Legal Name</span>
                    <strong className="text-neutral-900 text-sm">{caseData.decedent.legalName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Date of Passing</span>
                    <strong className="text-neutral-900">{caseData.decedent.dateOfDeath}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Date of Birth</span>
                    <strong className="text-neutral-900">{caseData.decedent.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Place of Passing</span>
                    <strong className="text-neutral-900">{caseData.decedent.placeOfDeath}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Residence (NYC)</span>
                    <strong className="text-neutral-900">{caseData.decedent.residenceAddress}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Veteran Status</span>
                    <strong className="text-[#991b1b]">{caseData.decedent.veteran ? `Yes (${caseData.decedent.branchOfService || 'Armed Forces'})` : 'No'}</strong>
                  </div>
                </div>
              </div>

              {/* In-Person Family Arrangement Conference Scheduling Card */}
              <div className="bg-white p-6 rounded-2xl border-2 border-amber-500/30 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-amber-100 text-amber-900 rounded-lg">
                      <CalendarCheck className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider">
                        Family Arrangement Conference & Director Scheduling Hub
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        In-Person Consultation at 630 St. Nicholas Ave & 2-Way SMS Appointment Coordination
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      caseData.arrangementAppointment?.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : caseData.arrangementAppointment?.status === 'proposed_options_sent'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : caseData.arrangementAppointment?.status === 'rescheduled'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                    }`}>
                      {caseData.arrangementAppointment?.status === 'confirmed'
                        ? '✅ Confirmed on Facility Calendar'
                        : caseData.arrangementAppointment?.status === 'proposed_options_sent'
                        ? '📱 Candidate Slots Dispatched'
                        : caseData.arrangementAppointment?.status === 'rescheduled'
                        ? '🔄 Reschedule Requested'
                        : '⏳ Needs Appointment Scheduling'}
                    </span>

                    {onOpenAppointmentModal && (
                      <button
                        onClick={onOpenAppointmentModal}
                        className="px-3 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1 shadow-sm"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>Schedule / Manage</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Assigned Director</span>
                    <strong className="text-neutral-900 block truncate">
                      {caseData.arrangementAppointment?.assignedDirectorName || caseData.assignedDirector.split('(')[0]}
                    </strong>
                    <span className="text-[10px] font-mono text-neutral-500 block">NYS LFD #{caseData.removalSchedule?.directorLicenseNumber || '08850'}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Date & Time Slot</span>
                    <strong className="text-[#991b1b] block">
                      {caseData.arrangementAppointment?.confirmedSlot 
                        ? `${caseData.arrangementAppointment.confirmedSlot.date} (${caseData.arrangementAppointment.confirmedSlot.time})`
                        : caseData.arrangementAppointment?.proposedSlots && caseData.arrangementAppointment.proposedSlots.length > 0
                        ? `${caseData.arrangementAppointment.proposedSlots.length} Slots Proposed`
                        : 'Pending Selection'}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">
                      {caseData.arrangementAppointment?.confirmedSlot ? '2-Hour Private Session' : 'SMS Link Sent to Informant'}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Room & Venue</span>
                    <strong className="text-neutral-900 block truncate">
                      {caseData.arrangementAppointment?.locationVenue || 'Arrangement Suite A (Seats 6)'}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">
                      {caseData.arrangementAppointment?.meetingFormat === 'virtual_video' ? 'Encrypted Video Room' : '630 St. Nicholas Ave'}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Family Delegation</span>
                    <strong className="text-emerald-700 block">
                      {caseData.arrangementAppointment?.attendingFamilyCount || 2} Expected Attendees
                    </strong>
                    <span className="text-[10px] text-neutral-500 block truncate">
                      {caseData.arrangementAppointment?.attendingFamilyNames && caseData.arrangementAppointment.attendingFamilyNames.length > 0
                        ? caseData.arrangementAppointment.attendingFamilyNames.join(', ')
                        : caseData.informant.fullName}
                    </span>
                  </div>
                </div>

                {/* Appointment Quick Action Footer */}
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-600">
                      Informant Contact: <strong className="text-neutral-900">{caseData.informant.fullName} ({caseData.informant.phone})</strong>
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-neutral-600">
                      SMS Status: <strong className={caseData.arrangementAppointment?.status === 'confirmed' ? 'text-emerald-700' : 'text-amber-700'}>
                        {caseData.arrangementAppointment?.status === 'confirmed' ? 'Delivered & Locked' : 'Pending Family 1-Tap Pick'}
                      </strong>
                    </span>
                  </div>

                  {onOpenAppointmentModal && (
                    <button
                      onClick={onOpenAppointmentModal}
                      className="text-xs font-bold text-[#991b1b] hover:text-red-900 flex items-center gap-1"
                    >
                      <span>Open Interactive Family Slot Dispatcher & SMS Studio</span>
                      <span>➔</span>
                    </button>
                  )}
                </div>
              </div>

              {/* First Call Physical Removal & Custodial Transfer Card */}
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-500/30 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                      <Truck className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider">
                        First Call Physical Removal & Custody Hub
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        NYS PHL § 4201 Authorization & NYC Department of Hospitals Release Jurat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      caseData.safeArrivalStatus === 'safe_arrival_confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : caseData.safeArrivalStatus === 'in_transit'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {caseData.safeArrivalStatus === 'safe_arrival_confirmed' ? '✅ Safe Arrival at 630 St Nicholas' : caseData.safeArrivalStatus === 'in_transit' ? '🚐 Transfer In-Transit' : 'Pending Removal'}
                    </span>

                    {onOpenRemovalModal && (
                      <button
                        onClick={onOpenRemovalModal}
                        className="px-3 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1 shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Schedule / Removal Options</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Pickup Facility</span>
                    <strong className="text-neutral-900 truncate block">
                      {caseData.removalSchedule?.facilityName || caseData.decedent.facilityName || caseData.decedent.placeOfDeath}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">{caseData.removalSchedule?.facilityFloorRoom || 'Pathology Morgue'}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Lead Transfer Director</span>
                    <strong className="text-neutral-900 block">
                      {caseData.removalSchedule?.assignedDirector || caseData.assignedDirector.split('(')[0]}
                    </strong>
                    <span className="text-[10px] font-mono text-neutral-500 block">{caseData.removalSchedule?.directorLicenseNumber || 'NYS LFD #08850'}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Transfer Vehicle</span>
                    <strong className="text-neutral-900 block">
                      {caseData.removalSchedule?.vehicleType || 'First Call Custom Van (BFH-1)'}
                    </strong>
                    <span className="text-[10px] font-mono text-[#991b1b] block">Plate: {caseData.removalSchedule?.vehiclePlate || 'BFH-CUSTODY-1'}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Valuables & Effects</span>
                    <strong className="text-emerald-700 block">
                      {caseData.removalSchedule?.affidavit?.personalEffectsTotalCount ? `${caseData.removalSchedule.affidavit.personalEffectsTotalCount} Items Logged & Sealed` : 'Custody Bag Verified'}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">Tag: {caseData.removalSchedule?.affidavit?.tagNumber || 'NYC-TAG-OK'}</span>
                  </div>
                </div>

                {/* Removal Quick Action Footer */}
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-600">
                      Affidavit: <strong className="font-mono text-neutral-900">{caseData.removalSchedule?.affidavit?.affidavitNumber || `AFF-REM-${caseData.caseNumber}`}</strong>
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-neutral-600">
                      3-Way SMS: <strong className="text-emerald-700">Dispatched & Active</strong>
                    </span>
                  </div>

                  {onOpenRemovalModal && (
                    <button
                      onClick={onOpenRemovalModal}
                      className="text-xs font-bold text-[#991b1b] hover:text-red-900 flex items-center gap-1"
                    >
                      <span>View Completed NYS Affidavit & Effects Ledger</span>
                      <span>➔</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Service & Venue Card */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#b45309]" />
                  <span>Service Configuration & Venues</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Package Type</span>
                    <strong className="text-[#991b1b]">{caseData.serviceSelections.packageTitle}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Viewing Parlor</span>
                    <strong className="text-neutral-900">{caseData.serviceSelections.viewingParlor}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Destination Facility</span>
                    <strong className="text-neutral-900">{caseData.serviceSelections.crematoryOrCemeteryName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Service Schedule</span>
                    <strong className="text-neutral-900">
                      {caseData.serviceSelections.serviceDate ? `${caseData.serviceSelections.serviceDate} (${caseData.serviceSelections.serviceTime})` : 'Scheduling in Progress'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Officiant</span>
                    <strong className="text-neutral-900">{caseData.serviceSelections.officiantName || 'Pending Family Selection'}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Merchandise Choice</span>
                    <strong className="text-neutral-900">{caseData.serviceSelections.casketOrUrnSelected}</strong>
                  </div>
                </div>
              </div>

              {/* Webcast & Live Broadcast Production Card */}
              <div className="bg-white p-6 rounded-2xl border-2 border-red-500/30 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-red-100 text-[#991b1b] rounded-lg">
                      <Video className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider">
                        Live 4K Webcast & Sanctuary Broadcast Production
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Broadcasting Hardware Active in: <strong>Chapel 1, Chapel 2, and The Repast Room</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      caseData.webcastSchedule?.isEnabled !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {caseData.webcastSchedule?.isEnabled !== false ? '🔴 Live Stream Configured' : 'Webcasting Inactive'}
                    </span>
                    <button
                      onClick={() => setIsWebcastModalOpen(true)}
                      className="px-3 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1 shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Schedule Webcast</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Broadcast Venue</span>
                    <strong className="text-neutral-900">{caseData.webcastSchedule?.venueName || 'Chapel 1 (Main Sanctuary)'}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Assigned Director & AV</span>
                    <strong className="text-[#991b1b]">{caseData.webcastSchedule?.assignedDirector || 'Jason Benta, LFD'}</strong>
                    <span className="block text-[11px] text-neutral-600">{caseData.webcastSchedule?.assignedAvTech || 'Marcus Vance (Harlem Media AV)'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Stream Access Link</span>
                    <strong className="text-neutral-900 font-mono text-[11px] truncate block">
                      {caseData.webcastSchedule?.streamUrl || `https://broadcast.e-bfh.com/live/${caseData.caseNumber}`}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      PIN: {caseData.webcastSchedule?.isPinProtected ? (caseData.webcastSchedule?.securityPin || '1928') : 'Public'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Sanctuary Audio Feed</span>
                    <strong className="text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct Soundboard XLR Verified</span>
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Vital Statistics */}
          {activeTab === 'vitals' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider">
                NYC EDRS Vital Statistics Fields
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-neutral-500 block">Social Security (Masked)</span>
                  <strong className="text-neutral-900 font-mono">{caseData.decedent.ssnMasked}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Marital Status</span>
                  <strong className="text-neutral-900 capitalize">{caseData.decedent.maritalStatus}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Usual Occupation</span>
                  <strong className="text-neutral-900">{caseData.decedent.occupation}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Father's Full Name</span>
                  <strong className="text-neutral-900">{caseData.decedent.fatherName}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Mother's Maiden Name</span>
                  <strong className="text-neutral-900">{caseData.decedent.motherMaidenName}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Attending Physician</span>
                  <strong className="text-neutral-900">{caseData.medicalCertifier.physicianName}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">EDRS Permit Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 uppercase text-[10px]">
                    {caseData.medicalCertifier.edrsStatus}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">EDRS Permit Number</span>
                  <strong className="text-[#991b1b] font-mono">{caseData.medicalCertifier.edrsPermitNumber || 'Pending State Generation'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Informant & Legal */}
          {activeTab === 'informant' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Next of Kin & Legal Right to Control
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-neutral-500 block">Informant Full Name</span>
                    <strong className="text-neutral-900">{caseData.informant.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Relationship to Decedent</span>
                    <strong className="text-neutral-900">{caseData.informant.relationship}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Contact Phone</span>
                    <strong className="text-neutral-900">{caseData.informant.phone}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Email Address</span>
                    <strong className="text-neutral-900">{caseData.informant.email}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Legal Right to Control (NYS 4201)</span>
                    <strong className="text-emerald-700 font-bold">{caseData.informant.hasRightToControl ? 'Verified Primary NOK' : 'Secondary'}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Address</span>
                    <strong className="text-neutral-900">{caseData.informant.address}</strong>
                  </div>
                </div>
              </div>

              {/* Family Portal Access & Credentials Center */}
              <div className="bg-gradient-to-br from-red-50 via-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#991b1b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <Key className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-serif-title font-bold text-sm text-neutral-900">
                        Family Portal Access & Credentials Hub
                      </h4>
                      <p className="text-[11px] text-neutral-600">
                        Secure email invitation, SMS carrier alerts, 9-part obituary studio, and digital tributes
                      </p>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Email & SMS Invite Dispatched</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white/90 p-4 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">Portal Direct URL</span>
                    <strong className="font-mono text-[#991b1b] text-[11px] truncate block">
                      portal.e-bfh.com/case/{caseData.caseNumber}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">Family Passcode</span>
                    <strong className="font-mono text-neutral-900 text-[11px] block">
                      1928-BFH
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">Primary Email</span>
                    <span className="font-mono text-neutral-700 text-[11px] truncate block">
                      {caseData.informant.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">SMS Mobile</span>
                    <span className="font-mono text-neutral-700 text-[11px] block">
                      {caseData.informant.phone}
                    </span>
                  </div>
                </div>

                {/* Dispatch & Preview Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSendPortalInvite}
                      className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>Resend Portal Invite (Email + SMS)</span>
                    </button>
                    <button
                      onClick={() => handleCopy(`https://portal.e-bfh.com/case/${caseData.caseNumber} • Passcode: 1928-BFH`, 'Portal Access Info')}
                      className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>Copy Credentials</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewEmailModalOpen(true)}
                      className="bg-white hover:bg-red-50 text-[#991b1b] border border-red-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Preview Email</span>
                    </button>
                    <button
                      onClick={() => setPreviewSMSModalOpen(true)}
                      className="bg-white hover:bg-amber-50 text-[#b45309] border border-amber-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Preview SMS</span>
                    </button>
                    {onOpenFamilyPortal && (
                      <button
                        onClick={onOpenFamilyPortal}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>Open Portal</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Services & Pricing (Form AP-47 Statement of Goods & Services) */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Header Banner & Studio Launch */}
              <div className="bg-linear-to-r from-neutral-900 to-neutral-800 p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Form AP-47 (Pages 1 & 2)
                    </span>
                    <span className="text-xs text-neutral-300">
                      Effective GPL: April 13, 2026
                    </span>
                  </div>
                  <h3 className="font-serif-title text-lg font-bold text-white tracking-wide">
                    Statement of Goods and Services Selected
                  </h3>
                  <p className="text-xs text-neutral-300 font-light mt-0.5">
                    Itemized NYS DOH statutory contract, GPL selections, merchandise, livery fleet & cash advances.
                  </p>
                </div>

                {onOpenContractModal && (
                  <button
                    onClick={onOpenContractModal}
                    className="bg-[#991b1b] hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md border border-amber-300/40 shrink-0"
                  >
                    <ScrollText className="w-4 h-4 text-amber-300" />
                    <span>Arrangement Studio / Edit Contract</span>
                  </button>
                )}
              </div>

              {/* Financial Totals 3-Card Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Section I: Funeral Home Charges
                  </div>
                  <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                    ${(caseData.statementOfGoods?.sectionIII.funeralHomeChargesTotal ?? caseData.serviceSelections.basePackagePrice + caseData.serviceSelections.casketPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    Direct services, facilities, livery & merchandise
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Section II: Cash Advances (100% Pass-Through)
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-1">
                    ${(caseData.statementOfGoods?.sectionIII.cashAdvancesTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    Cemetery/Crematory, transcripts, officiant, organist, tolls
                  </div>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    Section III: Estimated Grand Total
                  </div>
                  <div className="text-xl font-bold font-mono text-[#991b1b] mt-1">
                    ${(caseData.statementOfGoods?.sectionIII.totalFuneralCharges ?? caseData.totalAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-amber-800 mt-1 flex justify-between font-semibold">
                    <span>Balance Due: ${(caseData.statementOfGoods?.sectionIII.balanceDue ?? (caseData.totalAmountDue - caseData.totalPaid)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-emerald-700">Paid: ${(caseData.statementOfGoods?.sectionIII.lessCreditsAndInsurance ?? caseData.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Panel 1: Primary Services & Facilities */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <h4 className="font-serif-title text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
                    Professional Services & Facilities (Sec. I A–F)
                  </h4>
                  <div className="space-y-2 text-neutral-700">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-medium text-neutral-800">Primary Service Selected:</span>
                      <span className="font-bold text-neutral-900 capitalize">
                        {caseData.statementOfGoods?.serviceType ? caseData.statementOfGoods.serviceType.replace('_', ' ') : caseData.serviceSelections.packageTitle}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Basic Arrangements & Consultation:</span>
                      <span className="font-mono font-medium">${(caseData.statementOfGoods?.sectionI.D_basicArrangementsAmount ?? 950).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Transfer of Remains to Funeral Home:</span>
                      <span className="font-mono font-medium">${(caseData.statementOfGoods?.sectionI.B_transferOfRemainsAmount ?? 750).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Preparation & Embalming:</span>
                      <span className="font-mono font-medium">
                        ${((caseData.statementOfGoods?.sectionI.C1_embalmingAmount ?? 0) + (caseData.statementOfGoods?.sectionI.C2_dressingCasketingAmount ?? 0) + (caseData.statementOfGoods?.sectionI.C2_cosmetologyAmount ?? 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Supervision & Use of Facilities:</span>
                      <span className="font-mono font-medium">
                        ${((caseData.statementOfGoods?.sectionI.E1_supervisionVisitationAmount ?? 0) + (caseData.statementOfGoods?.sectionI.E2_supervisionFuneralServiceAmount ?? 0) + (caseData.statementOfGoods?.sectionI.F1_facilitiesVisitationAmount ?? 0) + (caseData.statementOfGoods?.sectionI.F2_facilitiesFuneralServiceAmount ?? 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Merchandise & Livery Fleet */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <h4 className="font-serif-title text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
                    Merchandise, Livery & Additional (Sec. I G–I)
                  </h4>
                  <div className="space-y-2 text-neutral-700">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-medium text-neutral-800">Casket / Alternative Container:</span>
                      <span className="font-mono font-bold text-neutral-900">
                        ${(caseData.statementOfGoods?.sectionI.H1_casketAmount ?? caseData.serviceSelections.casketPrice).toFixed(2)}
                      </span>
                    </div>
                    {caseData.statementOfGoods?.sectionI.H2_outerReceptacleAmount ? (
                      <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span>Outer Interment Receptacle / Vault:</span>
                        <span className="font-mono font-medium">${caseData.statementOfGoods.sectionI.H2_outerReceptacleAmount.toFixed(2)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Livery Fleet Total:</span>
                      <span className="font-mono font-medium">${(caseData.statementOfGoods?.sectionI.G_totalLiveryAmount ?? 655).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Stationery, Programs & Cards:</span>
                      <span className="font-mono font-medium">${(caseData.statementOfGoods?.sectionI.I10_programsMatrix?.totalAmount ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Floral Arrangements:</span>
                      <span className="font-mono font-medium">
                        {caseData.statementOfGoods?.sectionI.I6_noFlowersRequested
                          ? 'Declined (No Flowers)'
                          : `$${(caseData.statementOfGoods?.sectionI.I6_totalFlowersAmount ?? 0).toFixed(2)}`}
                      </span>
                    </div>

                    {caseData.statementOfGoods?.sectionI.I6_flowerItems && caseData.statementOfGoods.sectionI.I6_flowerItems.length > 0 && !caseData.statementOfGoods.sectionI.I6_noFlowersRequested && (
                      <div className="pt-2 mt-2 border-t border-neutral-100">
                        <span className="text-[11px] font-bold text-neutral-800 block mb-2">Ordered Floral Tributes ({caseData.statementOfGoods.sectionI.I6_flowerItems.length}):</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {caseData.statementOfGoods.sectionI.I6_flowerItems.map((fl) => (
                            <div key={fl.id} className="flex items-center space-x-2.5 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                              {fl.imageUrl ? (
                                <img src={fl.imageUrl} alt={fl.description} className="w-10 h-10 rounded-lg object-cover border border-neutral-300 shrink-0 shadow-xs" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">💐</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-neutral-900 truncate">{fl.name || fl.description}</div>
                                <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 flex-wrap">
                                  {fl.code && <span className="font-mono bg-amber-100 text-amber-900 px-1 rounded font-bold">{fl.code}</span>}
                                  {fl.size && <span className="uppercase font-semibold text-neutral-700">{fl.size}</span>}
                                  {fl.ribbonText && <span className="italic text-[#991b1b]">&quot;{fl.ribbonText}&quot;</span>}
                                </div>
                              </div>
                              <div className="text-xs font-mono font-bold text-[#991b1b] text-right shrink-0">
                                ${(fl.quantity * fl.unitPrice).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* Service Partner Dispatches & Two-Way Carrier Confirmation Center */}
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-amber-100 text-[#b45309] rounded-xl">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif-title text-sm font-bold text-neutral-900">
                        Service Partner Dispatches & Two-Way SMS Status
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Florists, Clergy, Pipe Organists, Pallbearers, Livery Drivers & Woodlawn Crematory
                      </p>
                    </div>
                  </div>

                  {onOpenTwoWaySmsModal && (
                    <button
                      onClick={() => onOpenTwoWaySmsModal()}
                      className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm border border-amber-300/40"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                      <span>Open 2-Way SMS Studio</span>
                    </button>
                  )}
                </div>

                {/* Partner Request List for this case */}
                <div className="space-y-2 text-xs">
                  {partnerRequests.filter(r => r.caseId === caseData.id).length > 0 ? (
                    partnerRequests.filter(r => r.caseId === caseData.id).map(req => {
                      const isConfirmed = req.status === 'confirmed';
                      return (
                        <div key={req.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <strong className="text-neutral-900 font-bold">{req.partnerName}</strong>
                              <span className="text-[11px] text-[#b45309] font-bold">({req.roleTitle})</span>
                              <span className="text-neutral-400 font-mono text-[10px]">[{req.partnerPhone}]</span>
                            </div>
                            <p className="text-[11px] text-neutral-600">
                              Service: <strong>{req.serviceDate}</strong> at <strong>{req.callTime}</strong> • {req.venueLocation}
                            </p>
                            {req.threadMessages && req.threadMessages.length > 1 && (
                              <p className="text-[10px] text-emerald-700 font-medium italic">
                                Latest: "{req.threadMessages[req.threadMessages.length - 1].body}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : req.status === 'declined'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {isConfirmed ? '✅ Confirmed' : req.status === 'declined' ? '❌ Declined' : '⏳ Awaiting Reply'}
                            </span>

                            {onOpenTwoWaySmsModal && (
                              <button
                                onClick={() => onOpenTwoWaySmsModal(req.id)}
                                className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-[11px] transition"
                              >
                                View Chat →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-neutral-50 rounded-xl text-neutral-500 text-xs text-center">
                      No active partner dispatches logged for this case. Open the 2-Way SMS Studio to dispatch florists, clergy, or livery.
                    </div>
                  )}
                </div>
              </div>

              {/* Statutory Note Banner */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-800">Legal Compliance Note: </span>
                  Charges conform to the BFH General Price List (Effective April 13, 2026) and NYS Department of Health regulations (10 NYCRR Part 77).
                </div>
                {onOpenContractModal && (
                  <button
                    onClick={onOpenContractModal}
                    className="text-[#991b1b] hover:text-red-800 font-bold underline shrink-0 ml-4"
                  >
                    View Official 2-Page Print Form →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Activity Log & Notes */}
          {activeTab === 'notes' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <h3 className="font-serif-title text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Case Activity & Collaboration Log
              </h3>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add operational update, phone note, or transfer detail..."
                  className="flex-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                />
                <button
                  type="submit"
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                >
                  Post Note
                </button>
              </form>

              <div className="space-y-3 pt-2">
                {caseData.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                    <div className="flex justify-between text-neutral-500 text-[10px]">
                      <span className="font-bold text-[#991b1b]">{note.author}</span>
                      <span>{note.timestamp}</span>
                    </div>
                    <p className="text-neutral-800 font-light">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4 cols): Quick Status & Milestones */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Safe Arrival & Custodial Status */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h4 className="font-serif-title text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Custody & Safe Arrival Status
            </h4>

            {caseData.safeArrivalStatus === 'safe_arrival_confirmed' ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Safe Arrival Confirmed</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Logged at 630 Saint Nicholas Avenue: {caseData.safeArrivalTimestamp}
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Transfer In Progress</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  En route from {caseData.decedent.facilityName || caseData.decedent.placeOfDeath}.
                </p>
                <button
                  onClick={handleTriggerSafeArrival}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition shadow-sm"
                >
                  Confirm Arrival & Alert Family
                </button>
              </div>
            )}
          </div>

          {/* Quick Document Status */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-serif-title text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Document Matrix
              </h4>
              <button 
                onClick={onOpenDocuments}
                className="text-[11px] text-[#991b1b] hover:text-red-900 font-bold"
              >
                View All 14 Docs →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {caseData.documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/60">
                  <span className="truncate max-w-[160px] text-neutral-700 font-medium">{doc.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    doc.status === 'completed' || doc.status === 'signed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.status === 'urgent'
                      ? 'bg-red-100 text-[#991b1b] animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h4 className="font-serif-title text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Financing & Invoicing
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Total Due:</span>
                <span className="text-neutral-900 font-mono font-bold">${caseData.totalAmountDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Settled / Funded:</span>
                <span className="text-emerald-700 font-mono font-bold">${caseData.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-1 border-t border-neutral-200">
                <span>Balance Remaining:</span>
                <span className="text-[#991b1b] font-mono font-bold">
                  ${(caseData.totalAmountDue - caseData.totalPaid).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Toast Copy Alert */}
      {copiedAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141b2b] text-white px-5 py-3 rounded-xl shadow-2xl border border-amber-400/40 flex items-center space-x-3 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedAlert}</span>
        </div>
      )}

      {/* MODAL 1: FAMILY PORTAL ACCESS EMAIL PREVIEW */}
      {previewEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-300 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                  Official Family Portal Email Invitation Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewEmailModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Headers Mockup */}
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1 font-mono text-neutral-600">
              <div><strong className="text-neutral-900">From:</strong> Benta's Funeral Home &lt;care@portal.e-bfh.com&gt;</div>
              <div><strong className="text-neutral-900">To:</strong> {caseData.informant.fullName} &lt;{caseData.informant.email}&gt;</div>
              <div><strong className="text-neutral-900">Subject:</strong> Your Secure Benta's Family Portal Access for {caseData.decedent.legalName} (Case #{caseData.caseNumber})</div>
            </div>

            {/* Letterhead Body */}
            <div className="border-2 border-amber-300/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#141b2b] text-white p-5 text-center border-b-2 border-amber-400/80 space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#991b1b] text-white flex items-center justify-center font-serif-title font-bold text-base mx-auto border border-amber-300">
                  BFH
                </div>
                <h4 className="font-serif-title text-base font-bold tracking-wide">
                  BENTA'S FUNERAL HOME
                </h4>
                <p className="text-[10px] text-amber-200/90 uppercase tracking-widest">
                  Serving Harlem & New York Families Since 1928
                </p>
              </div>

              <div className="p-6 bg-white space-y-4 text-xs text-neutral-800 leading-relaxed">
                <p>Dear <strong>{caseData.informant.fullName}</strong>,</p>
                <p>
                  We extend our deepest condolences and reverence to you and your loved ones. To ensure your family has complete peace of mind, peaceful collaboration, and immediate access to arrangements, we have activated your private, encrypted <strong>Benta Family Portal</strong> for <strong>{caseData.decedent.legalName}</strong> (Case #{caseData.caseNumber}).
                </p>

                <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-2">
                  <strong className="text-xs font-bold text-[#991b1b] block">Features Ready in Your Family Portal:</strong>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-700">
                    <li><strong>🕊️ 9-Part Trauma-Informed Obituary Studio:</strong> Craft meaningful memorial programs and short newspaper notices at your own pace.</li>
                    <li><strong>🎙️ 360° Digital Tribute & Voice Studio:</strong> Listen to living voice memories from relatives and lifelong friends worldwide.</li>
                    <li><strong>✍️ Legal Documents & eSign:</strong> Review and sign vital statutory authorizations right from your phone.</li>
                    <li><strong>🚗 Service & Livery Status:</strong> Live updates on physical transfer and limousine cortege scheduling.</li>
                  </ul>
                </div>

                {/* Big Action Button */}
                <div className="text-center py-2">
                  <a
                    href={`#portal`}
                    onClick={(e) => {
                      e.preventDefault();
                      setPreviewEmailModalOpen(false);
                      if (onOpenFamilyPortal) onOpenFamilyPortal();
                    }}
                    className="inline-block bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-red-950/20 transition border border-amber-300/40"
                  >
                    Open Secure Family Portal →
                  </a>
                  <span className="block text-[10px] text-neutral-400 mt-2 font-mono">
                    Direct Link: https://portal.e-bfh.com/case/{caseData.caseNumber} • Passcode: 1928-BFH
                  </span>
                </div>

                <div className="border-t border-neutral-100 pt-3 text-[11px] text-neutral-500 text-center">
                  630 Saint Nicholas Ave, New York, NY 10030 • 24/7 Family Line: (212) 281-8850
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleCopy(`https://portal.e-bfh.com/case/${caseData.caseNumber}`, 'Portal Link')}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Magic Link</span>
              </button>
              <button
                onClick={() => {
                  handleSendPortalInvite();
                  setPreviewEmailModalOpen(false);
                }}
                className="bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Resend Email to {caseData.informant.email}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: FAMILY PORTAL ACCESS SMS PREVIEW */}
      {previewSMSModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-neutral-300">
            
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                  Carrier SMS Alert Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewSMSModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phone Screen Mockup */}
            <div className="bg-[#181a20] rounded-3xl p-5 text-white space-y-4 shadow-xl border-4 border-neutral-800">
              <div className="flex justify-between items-center text-[10px] text-neutral-400 border-b border-neutral-800 pb-2">
                <span>Verizon 5G</span>
                <span>Benta Care Dispatch</span>
                <span>100% 🔋</span>
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-neutral-200 block">+1 (212) 281-8850</span>
                <span className="text-[10px] text-amber-400">Benta's Funeral Home (Harlem, NY)</span>
              </div>

              {/* Text Bubble */}
              <div className="bg-[#242938] text-neutral-100 text-xs p-4 rounded-2xl rounded-tl-sm border border-neutral-700/60 space-y-2 leading-relaxed">
                <p>
                  Dear <strong>{caseData.informant.fullName}</strong>, your private Benta's Family Portal for <strong>{caseData.decedent.legalName}</strong> (Case #{caseData.caseNumber}) is now active.
                </p>
                <p>
                  Access arrangement details, collaborate on the 9-part obituary, eSign legal documents, and listen to 360° digital voice tributes here:
                </p>
                <p className="font-mono text-amber-300 underline text-[11px] break-all">
                  https://portal.e-bfh.com/case/{caseData.caseNumber}
                </p>
                <p className="text-[11px] text-neutral-300">
                  Passcode: <strong>1928-BFH</strong>
                </p>
              </div>

              <div className="text-right text-[10px] text-neutral-400">
                Delivered · Read Receipt Verified
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleCopy(`https://portal.e-bfh.com/case/${caseData.caseNumber}`, 'SMS Link')}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={() => {
                  handleSendPortalInvite();
                  setPreviewSMSModalOpen(false);
                }}
                className="bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Resend SMS to {caseData.informant.phone}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* WEBCAST & BROADCAST PRODUCTION SCHEDULING MODAL */}
      {isWebcastModalOpen && (
        <WebcastSchedulingModal
          isOpen={isWebcastModalOpen}
          onClose={() => setIsWebcastModalOpen(false)}
          activeCase={caseData}
          cases={[caseData]}
          partners={INITIAL_SERVICE_PARTNERS}
          onSaveWebcast={(updatedWebcast) => {
            const updated = {
              ...caseData,
              webcastSchedule: updatedWebcast,
              notes: [
                {
                  id: `note-${Date.now()}`,
                  author: 'Webcast Scheduler',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text: `Live Webcast scheduled for ${updatedWebcast.venueName} on ${updatedWebcast.broadcastDate} at ${updatedWebcast.broadcastStartTime}. Assigned Director: ${updatedWebcast.assignedDirector}. AV Tech: ${updatedWebcast.assignedAvTech}.`
                },
                ...caseData.notes
              ]
            };
            onUpdateCase(updated);
          }}
          onDispatchSMS={(recipient, message) => {
            if (onSendNotification) {
              onSendNotification({
                id: `notif-crew-${Date.now()}`,
                caseId: caseData.id,
                decedentName: caseData.decedent.legalName,
                recipientName: 'Broadcast Production Crew',
                recipientPhone: recipient,
                type: 'custom_director_sms',
                channel: 'sms',
                title: `Webcast Production Dispatch: ${caseData.caseNumber}`,
                bodyText: message,
                status: 'delivered',
                sentAt: 'Just now'
              });
            }
          }}
        />
      )}

      {/* Day-of-Service Mobile VIP Family Itinerary & GPS Dispatch Modal */}
      {isVIPItineraryModalOpen && (
        <DayOfServiceVIPItineraryModal
          isOpen={isVIPItineraryModalOpen}
          onClose={() => setIsVIPItineraryModalOpen(false)}
          caseData={caseData}
          onUpdateCase={onUpdateCase}
          isStaffMode={true}
        />
      )}

    </div>
  );
};
