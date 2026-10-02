import React from 'react';
import {
  UserRole,
  GoldenRecordCase,
  BackOfficeTab,
  CasePhase
} from '../../lib/types/funeral';
import {
  DollarSign,
  FileText,
  Layers,
  Flame,
  HeartHandshake,
  PlusCircle,
  Bell,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  BarChart3,
  Smartphone,
  Car,
  PenTool,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Truck,
  Users,
  LayoutDashboard,
  ScrollText,
  UserCheck,
  Lock,
  Printer,
  Bot,
  Video,
  Zap
} from 'lucide-react';

interface BackOfficeLayoutProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeCase: GoldenRecordCase;
  cases: GoldenRecordCase[];
  onSelectCase: (caseItem: GoldenRecordCase) => void;
  activeTab: BackOfficeTab;
  onChangeTab: (tab: BackOfficeTab) => void;
  onExitBackOffice: () => void;
  onOpenNewCase: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
  onOpenLiveryModal?: () => void;
  onOpenESignModal?: () => void;
  onOpenWoodlawnModal?: () => void;
  onOpenPartnerModal?: () => void;
  onOpenRemovalModal?: () => void;
  onOpenContractModal?: () => void;
  onOpenPrintAP47?: () => void;
  onAdvancePhase?: (caseId: string, nextPhase: CasePhase) => void;
  onOpenTwoWaySmsModal?: (requestId?: string) => void;
  onOpenTwilioGatewayModal?: () => void;
  onOpenDocuSignModal?: () => void;
  onOpenCloudModal?: () => void;
  onOpenAIModal?: () => void;
  onOpenPressModal?: () => void;
  onOpenWebcastModal?: () => void;
  onOpenStripeModal?: () => void;
  onOpenQuickBooks?: () => void;
  onOpenQuickBooksModal?: () => void;
  onOpenIntegrationsCenter?: () => void;
  onOpenSimulationModal?: () => void;
  onOpenFirstCallIntake?: () => void;
  onOpenDiscrepancyGuardrail?: () => void;
  onOpenDirectorDayOfServiceHUD?: () => void;
  onOpenFamilyProofApproval?: () => void;
  onOpenCheckPrinter?: () => void;
  onOpenGuidedTour?: () => void;
  onLockManagerSuite?: () => void;
  currentDirectorId?: string;
  onChangeDirectorId?: (id: string) => void;
  directorProfiles?: any[];
  partnerRequests?: any[];
}

export const BackOfficeLayout: React.FC<BackOfficeLayoutProps> = ({
  currentRole,
  onChangeRole,
  activeCase,
  cases,
  onSelectCase,
  activeTab,
  onChangeTab,
  onExitBackOffice,
  onLockManagerSuite,
  onOpenNewCase,
  onOpenNotifications,
  notificationCount = 5,
  onOpenLiveryModal,
  onOpenESignModal,
  onOpenWoodlawnModal,
  onOpenPartnerModal,
  onOpenRemovalModal,
  onOpenContractModal,
  onOpenPrintAP47,
  onAdvancePhase,
  onOpenTwoWaySmsModal: _onOpenTwoWaySmsModal,
  onOpenTwilioGatewayModal: _onOpenTwilioGatewayModal,
  onOpenDocuSignModal: _onOpenDocuSignModal,
  onOpenCloudModal: _onOpenCloudModal,
  onOpenAIModal,
  onOpenPressModal,
  onOpenWebcastModal,
  onOpenStripeModal: _onOpenStripeModal,
  onOpenQuickBooks: _onOpenQuickBooks,
  onOpenIntegrationsCenter,
  onOpenSimulationModal,
  onOpenFirstCallIntake: _onOpenFirstCallIntake,
  onOpenDiscrepancyGuardrail: _onOpenDiscrepancyGuardrail,
  onOpenDirectorDayOfServiceHUD: _onOpenDirectorDayOfServiceHUD,
  onOpenFamilyProofApproval: _onOpenFamilyProofApproval,
  onOpenCheckPrinter: _onOpenCheckPrinter,
  onOpenGuidedTour
}) => {
  const roleBadges: Record<UserRole, { label: string; color: string; desc: string }> = {
    manager: {
      label: 'Managing Director & Administration',
      color: 'bg-purple-50 text-purple-900 border-purple-200',
      desc: 'Licensed Director scheduling, In-House vs Outsourced trade optimizer, 1099 disbursements'
    },
    director: {
      label: 'Funeral Director (Full Control)',
      color: 'bg-red-50 text-[#991b1b] border-red-200',
      desc: 'Full case authorization, Legal bundles, Woodlawn dispatch, EDRS'
    },
    staff: {
      label: 'Field / Transport Staff',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Physical removal, Safe Arrival triggers, custodial logging'
    },
    accounting: {
      label: 'Accounting & Finance',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'ACH Bank transfers, Life insurance claim verification, split billing'
    },
    family: {
      label: 'Family Portal (Next of Kin)',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Arrangement review, e-Signatures, 360° Digi-Tribute uploads'
    }
  };

  const navItems: Array<{ id: BackOfficeTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Director Active Cases', icon: LayoutDashboard },
    { id: 'manager', label: 'Director Scheduling & Roster', icon: UserCheck },
    { id: 'pipeline', label: '5-Phase Case Pipeline', icon: Layers },
    { id: 'golden_record', label: 'Golden Record Hub', icon: FileText },
    { id: 'calendar', label: 'Facility & Room Calendar', icon: Calendar },
    { id: 'partners', label: 'Service Partners & SMS', icon: Users },
    { id: 'documents', label: 'Document Delivery Matrix', icon: CheckCircle2 },
    { id: 'dispatch', label: 'Woodlawn & Logistics Dispatch', icon: Flame },
    { id: 'finances', label: 'ACH & Insurance Financing', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'aftercare', label: 'Aftercare & CRM Nurture', icon: HeartHandshake }
  ];

  const phaseOrder: CasePhase[] = ['intake_removal', 'arrangements', 'legal_bundle', 'permits_logistics', 'finalization_aftercare'];
  const currentPhaseIndex = phaseOrder.indexOf(activeCase.currentPhase);

  const PHASES_LIST: Array<{
    id: CasePhase;
    stepNum: number;
    label: string;
    subLabel: string;
    targetTab: BackOfficeTab;
    icon: any;
  }> = [
      { id: 'intake_removal', stepNum: 1, label: '1. Intake & Removal', subLabel: 'Physical Custody', targetTab: 'golden_record', icon: Truck },
      { id: 'arrangements', stepNum: 2, label: '2. Arrangements & Contract', subLabel: 'Form AP-47 & 12 Spaces', targetTab: 'golden_record', icon: ScrollText },
      { id: 'legal_bundle', stepNum: 3, label: '3. Legal Authorizations', subLabel: 'NOK e-Signatures', targetTab: 'documents', icon: PenTool },
      { id: 'permits_logistics', stepNum: 4, label: '4. Permits & Dispatch', subLabel: 'NYC EDRS & Woodlawn', targetTab: 'dispatch', icon: Flame },
      { id: 'finalization_aftercare', stepNum: 5, label: '5. Finances & Aftercare', subLabel: 'ACH / Ins & Nurture', targetTab: 'finances', icon: HeartHandshake }
    ];

  return (
    <div className="bg-white text-neutral-900 flex flex-col font-sans border-b border-neutral-200 shadow-sm">

      {/* Top Universal Back-Office Header: White & Crimson */}
      <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Brand & Active Case Identifier */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onExitBackOffice}
              className="flex items-center space-x-1.5 text-xs text-neutral-700 hover:text-[#991b1b] bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-300 font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </button>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <span className="font-serif-title font-bold text-[#991b1b] text-base tracking-wide">
                BFH Backoffice
              </span>
              <span className="text-[10px] bg-amber-100 text-[#b45309] px-2 py-0.5 rounded uppercase tracking-widest font-bold hidden md:inline border border-amber-300">
                Version 2
              </span>
            </div>
          </div>

          {/* Active Case Selector Dropdown & Primary Case Operations */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-300">
              <span className="text-[11px] text-neutral-500 font-semibold hidden lg:inline">Case:</span>
              <select
                value={activeCase.id}
                onChange={(e) => {
                  const found = cases.find(c => c.id === e.target.value);
                  if (found) onSelectCase(found);
                }}
                className="bg-transparent text-neutral-900 text-xs font-bold outline-hidden cursor-pointer max-w-[220px] sm:max-w-[280px] truncate"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} • {c.decedent.legalName} ({c.dispositionType.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenNewCase}
              className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs border border-amber-400/40 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Case</span>
            </button>

            {onOpenRemovalModal && (
              <button
                onClick={onOpenRemovalModal}
                className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                title="Schedule First Call Removal & Custody Affidavit"
              >
                <Truck className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden md:inline">Removal</span>
              </button>
            )}

            {onOpenContractModal && (
              <button
                onClick={onOpenContractModal}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                title="Open Arrangement Conference & AP-47 Contract Studio"
              >
                <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden md:inline">AP-47 Contract</span>
              </button>
            )}

            {/* AI Concierge & Audio Tribute */}
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-xs border border-indigo-400/50 cursor-pointer"
                title="Open 24/7 AI Family Care Concierge, 9-Part Obituary Generator & Audio Archive"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
                <span>AI Concierge 🤖</span>
              </button>
            )}

            {/* Commercial Press Fulfillment */}
            {onOpenPressModal && (
              <button
                onClick={onOpenPressModal}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-xs border border-amber-400/50 cursor-pointer"
                title="Open Commercial Press Fulfillment & 300 DPI CMYK Programs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-100" />
                <span>Press Dispatch 🖨️</span>
              </button>
            )}

            {/* Live 4K Webcasting */}
            {onOpenWebcastModal && (
              <button
                onClick={onOpenWebcastModal}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-xs border border-red-400/50 cursor-pointer"
                title="Open Live 4K Webcasting, Multi-Camera PTZ Switcher & Broadcast Gate"
              >
                <Video className="w-3.5 h-3.5 text-red-100" />
                <span>Live 4K Webcast 🎥</span>
              </button>
            )}

            {/* Consolidated Enterprise Integrations Command Center Hub */}
            {onOpenIntegrationsCenter && (
              <button
                onClick={onOpenIntegrationsCenter}
                className="bg-gradient-to-r from-neutral-900 via-stone-900 to-amber-950 hover:opacity-95 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-xs border border-amber-500/50 cursor-pointer"
                title="Open Enterprise Integrations Hub (Twilio, DocuSign, Stripe, QuickBooks, Cloud Sync)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Integrations Hub ⚡</span>
                <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold">9/9 LIVE</span>
              </button>
            )}

            {/* Live Family SMS Simulator & Notifications */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#991b1b] border border-red-300/80 rounded-lg text-xs font-bold transition shadow-2xs group cursor-pointer"
                title="Open Live Family SMS & Alert Dispatch Hub"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#991b1b] group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Family SMS Hub</span>
                {notificationCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#991b1b] text-white text-[10px] font-mono rounded-full font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Case Simulation Runner */}
            {onOpenSimulationModal && (
              <button
                onClick={onOpenSimulationModal}
                className="bg-indigo-900 hover:bg-indigo-800 text-indigo-100 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs border border-indigo-400/40 cursor-pointer"
                title="Run 1-Click Interactive End-to-End Case Lifecycle Simulation"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="hidden xl:inline">Simulation 🚀</span>
              </button>
            )}

            {/* Interactive Guided Tour */}
            {onOpenGuidedTour && (
              <button
                onClick={onOpenGuidedTour}
                className="bg-amber-700/80 hover:bg-amber-700 text-amber-100 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs border border-amber-400/40 cursor-pointer"
                title="Open Interactive Step-by-Step Guided Tour"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="hidden xl:inline">Tour 🎓</span>
              </button>
            )}
          </div>

          {/* RBAC Role Switcher & Notifications Bell */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
              {(['manager', 'director', 'staff', 'accounting', 'family'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onChangeRole(r)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${currentRole === r
                      ? 'bg-[#991b1b] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                    }`}
                >
                  {r === 'manager' ? (
                    <>
                      <span>Manager</span>
                      <Lock className="w-2.5 h-2.5 text-amber-300" />
                    </>
                  ) : r === 'director' ? 'Director' : r === 'staff' ? 'Staff' : r === 'accounting' ? 'Finance' : 'Family'}
                </button>
              ))}
            </div>

            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#991b1b] relative border border-neutral-200 transition cursor-pointer"
                title="View Alert Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#991b1b] rounded-full animate-ping" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#991b1b] rounded-full" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Role Context Bar */}
      <div className="bg-[#fafafa] border-b border-neutral-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded border text-[11px] font-bold ${roleBadges[currentRole].color}`}>
            {roleBadges[currentRole].label}
          </span>
          <span className="text-neutral-600 text-[11px] hidden md:inline font-light">
            — {roleBadges[currentRole].desc}
          </span>
          {currentRole === 'manager' && onLockManagerSuite && (
            <button
              onClick={onLockManagerSuite}
              className="ml-2 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-[#991b1b] border border-amber-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              title="Lock Manager Suite and revoke signed session token"
            >
              <Lock className="w-2.5 h-2.5 text-[#991b1b]" />
              <span>Lock Suite</span>
            </button>
          )}
        </div>

        {/* Live Golden Record Architecture Status */}
        <div className="flex items-center space-x-4 text-[11px] text-neutral-600 font-medium">
          {onOpenIntegrationsCenter && (
            <button
              onClick={onOpenIntegrationsCenter}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-bold transition cursor-pointer shadow-2xs"
              title="Open Unified Integrations Command Center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse inline-block" />
              <span>Gateways: <strong className="text-emerald-900 font-extrabold">9/9 Live</strong></span>
            </button>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Zero Transcription Engine: <strong className="text-neutral-900 font-bold">Active</strong>
          </span>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <span className="hidden sm:inline">
            Director in Charge: <strong className="text-neutral-900">{activeCase.assignedDirector}</strong>
          </span>
        </div>
      </div>

      {/* DISTINCT LINEAR 5-PHASE PROGRESSION TRACKER ("GOLDEN PATH NAVIGATOR") */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3">
        <div className="flex flex-col space-y-2">

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-neutral-900 font-serif-title flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#991b1b]" />
                Linear Process Progression:
              </span>
              <span className="text-[#b45309] font-bold">
                {activeCase.decedent.legalName} ({activeCase.caseNumber})
              </span>
            </div>

            <span className="text-[11px] text-neutral-500 font-mono">
              Stage {currentPhaseIndex + 1} of 5 • {Math.round(((currentPhaseIndex + 1) / 5) * 100)}% Complete
            </span>
          </div>

          {/* 5-Step Connected Progress Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-1">
            {PHASES_LIST.map((phase, idx) => {
              const Icon = phase.icon;
              const isPast = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;

              return (
                <button
                  key={phase.id}
                  onClick={() => {
                    if (phase.id === 'arrangements' && onOpenContractModal) {
                      onOpenContractModal();
                    } else {
                      onChangeTab(phase.targetTab);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2.5 relative group ${isCurrent
                      ? 'bg-red-50/90 border-[#991b1b] ring-2 ring-red-500/20 shadow-sm'
                      : isPast
                        ? 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-50 text-emerald-950'
                        : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100 text-neutral-500'
                    }`}
                  title={phase.id === 'arrangements' ? 'Open Arrangement Conference & AP-47 Contract Studio' : `Go to ${phase.label}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${isCurrent
                      ? 'bg-[#991b1b] text-white'
                      : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                    {isPast ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-bold truncate ${isCurrent ? 'text-[#991b1b]' : isPast ? 'text-emerald-950' : 'text-neutral-700'
                        }`}>
                        {phase.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block truncate font-light">
                      {isPast ? '✓ Completed' : isCurrent ? '👉 Current Active Stage' : phase.subLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* GUIDED "NEXT STEP TO ASSIST" CO-PILOT BAR */}
          <div className="mt-2 p-3 bg-gradient-to-r from-red-50 via-white to-amber-50 rounded-xl border border-red-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start md:items-center space-x-2.5">
              <div className="p-1.5 bg-[#991b1b] text-white rounded-lg shrink-0 mt-0.5 md:mt-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div>
                <span className="font-bold text-[#991b1b] uppercase tracking-wider text-[10px] block">
                  Director Guided Next Step:
                </span>
                <p className="text-neutral-800 text-xs font-medium">
                  {activeCase.currentPhase === 'intake_removal' && (
                    <span>Log physical arrival at 630 St. Nicholas Ave and send instant peace-of-mind confirmation SMS to {activeCase.informant.fullName}.</span>
                  )}
                  {activeCase.currentPhase === 'arrangements' && (
                    <span>Conduct Family Arrangement Conference to select Service Type, Casket/Vault, Livery Fleet, Flowers, Programs & Pass-Through Cash Advances into Form AP-47, and reserve facility space.</span>
                  )}
                  {activeCase.currentPhase === 'legal_bundle' && (
                    <span>Request Next of Kin legal e-signatures on the NYC EDRS worksheet and Woodlawn Crematory authorization.</span>
                  )}
                  {activeCase.currentPhase === 'permits_logistics' && (
                    <span>Transmit verified NYC EDRS permit and certified cremation authorization packet to Woodlawn Crematory & officiants.</span>
                  )}
                  {activeCase.currentPhase === 'finalization_aftercare' && (
                    <span>Verify ACH bank transfer / C&J Life Insurance funding and activate Day 7/30/365 grief support touchpoints.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick 1-Click Action Triggers */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeCase.currentPhase === 'intake_removal' && (
                <>
                  <button
                    onClick={() => onChangeTab('golden_record')}
                    className="px-3 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5"
                  >
                    <span>Log Safe Arrival at BFH</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenNotifications}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-xs transition"
                  >
                    Send Arrival SMS
                  </button>
                </>
              )}

              {activeCase.currentPhase === 'arrangements' && (
                <>
                  {onOpenContractModal && (
                    <button
                      onClick={onOpenContractModal}
                      className="px-3.5 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-lg text-xs transition shadow-md flex items-center gap-1.5 border border-amber-300/40"
                    >
                      <ScrollText className="w-3.5 h-3.5 text-amber-300" />
                      <span>📜 Open AP-47 Arrangement Studio</span>
                    </button>
                  )}
                  {onOpenPrintAP47 && (
                    <button
                      onClick={onOpenPrintAP47}
                      className="px-3.5 py-1.5 bg-red-950 hover:bg-red-900 text-amber-300 font-bold rounded-lg text-xs transition shadow-md flex items-center gap-1.5 border border-amber-400/60"
                      title="Print Official Form AP-47 Contract (10 NYCRR § 77.8)"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>🖨️ Print Form AP-47</span>
                    </button>
                  )}
                  <button
                    onClick={() => onChangeTab('calendar')}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                    <span>12-Room Calendar</span>
                  </button>
                  <button
                    onClick={onOpenLiveryModal}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-300 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Livery Hold</span>
                  </button>
                  <button
                    onClick={onOpenPartnerModal || (() => onChangeTab('partners'))}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 border border-amber-400/30"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    <span>Partner SMS</span>
                  </button>
                </>
              )}

              {activeCase.currentPhase === 'legal_bundle' && (
                <>
                  <button
                    onClick={onOpenESignModal}
                    className="px-3 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Legal eSign Pad</span>
                  </button>
                  <button
                    onClick={onOpenNotifications}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-xs transition"
                  >
                    Send eSign SMS Link
                  </button>
                </>
              )}

              {activeCase.currentPhase === 'permits_logistics' && (
                <button
                  onClick={onOpenWoodlawnModal}
                  className="px-3 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Woodlawn Dispatch</span>
                </button>
              )}

              {activeCase.currentPhase === 'finalization_aftercare' && (
                <button
                  onClick={() => onChangeTab('finances')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Verify Split Billing</span>
                </button>
              )}

              {onAdvancePhase && currentPhaseIndex < phaseOrder.length - 1 && (
                <button
                  onClick={() => onAdvancePhase(activeCase.id, phaseOrder[currentPhaseIndex + 1])}
                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-xs transition flex items-center gap-1 hover:border-neutral-400"
                  title="Advance case to next linear stage"
                >
                  <span>Advance Stage ➔</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <nav className="bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${isActive
                    ? 'bg-red-50 text-[#991b1b] border border-red-200 shadow-sm'
                    : 'text-neutral-600 hover:text-[#991b1b] hover:bg-neutral-50'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#991b1b]' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {onOpenAIModal && (
          <button
            onClick={onOpenAIModal}
            className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md border border-indigo-400/50 shrink-0 ml-3 cursor-pointer"
            title="Open 24/7 AI Family Care Concierge, 9-Part Obituary Generator & Whisper Audio Archive"
          >
            <Bot className="w-4 h-4 text-indigo-200 animate-pulse" />
            <span>AI Concierge &amp; Whisper Hub 🤖</span>
          </button>
        )}

        {onOpenPressModal && (
          <button
            onClick={onOpenPressModal}
            className="flex items-center space-x-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md border border-amber-400/50 shrink-0 ml-2 cursor-pointer"
            title="Open Commercial Press Fulfillment, 300 DPI CMYK Programs & Hardcover Books"
          >
            <Printer className="w-4 h-4 text-amber-100" />
            <span>Commercial Press 🖨️</span>
          </button>
        )}
      </nav>

    </div>
  );
};
