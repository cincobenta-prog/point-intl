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
  Zap,
  PhoneCall,
  Compass,
  ChevronDown
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
  onOpenFirstCallIntake,
  onOpenDiscrepancyGuardrail: _onOpenDiscrepancyGuardrail,
  onOpenDirectorDayOfServiceHUD: _onOpenDirectorDayOfServiceHUD,
  onOpenFamilyProofApproval: _onOpenFamilyProofApproval,
  onOpenCheckPrinter: _onOpenCheckPrinter,
  onOpenGuidedTour
}) => {
  const roleBadges: Record<UserRole, { label: string; color: string; desc: string }> = {
    manager: {
      label: 'Managing Director & Administration',
      color: 'bg-amber-50 text-[#800000] border-amber-300/80',
      desc: 'Licensed Director scheduling, In-House vs Outsourced trade optimizer, 1099 disbursements'
    },
    director: {
      label: 'Funeral Director (Full Control)',
      color: 'bg-red-50 text-[#800000] border-red-200',
      desc: 'Full case authorization, Legal bundles, Woodlawn dispatch, EDRS'
    },
    staff: {
      label: 'Field / Transport Staff',
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      desc: 'Physical removal, Safe Arrival triggers, custodial logging'
    },
    accounting: {
      label: 'Accounting & Finance',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'ACH Bank transfers, Life insurance claim verification, split billing'
    },
    family: {
      label: 'Family Portal (Next of Kin)',
      color: 'bg-amber-50 text-amber-900 border-amber-200',
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
    <div className="bg-[#fcfbfa] text-neutral-900 flex flex-col font-sans border-b border-[#e5dfd5] shadow-xs">

      {/* TOP TIER: Brand Identification, Symmetrical Case Selector, Role Control */}
      <header className="bg-white border-b border-[#e5dfd5] px-4 sm:px-6 py-2.5 shrink-0 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Left: Public Portal Link + Official Benta Crest */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onExitBackOffice}
              className="flex items-center space-x-1.5 text-xs text-neutral-700 hover:text-[#800000] bg-[#faf8f5] hover:bg-[#f3eee5] px-3 py-1.5 rounded-lg border border-[#e5dfd5] font-semibold transition cursor-pointer group shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-neutral-500 group-hover:text-[#800000]" />
              <span>Public Website</span>
            </button>

            <div className="h-6 w-px bg-[#e5dfd5] hidden sm:block" />

            <div className="flex items-center space-x-2.5">
              <img
                src="/images/ebfh/BENTA_logo.png"
                alt="Benta's Funeral Home"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/ebfh/Benta-Flame-MN.png';
                }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-[#800000] text-base tracking-wide leading-tight">
                    Benta's Funeral Home
                  </span>
                  <span className="text-[10px] bg-[#fcf8ee] text-[#926c27] px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-[#e8d5a8] shadow-2xs">
                    LFD Console
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-medium hidden sm:block">
                  Harlem, New York City • Founded 1928
                </span>
              </div>
            </div>
          </div>

          {/* Center: Luxury Symmetrical Active Case Selector */}
          <div className="flex items-center bg-[#faf8f5] hover:bg-[#f5efe3] px-3 py-1.5 rounded-xl border border-[#e5dfd5] transition shadow-2xs group cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0 animate-pulse" />
            <span className="text-[11px] text-[#800000] font-bold mr-2 uppercase tracking-wider hidden md:inline">
              Active Case:
            </span>
            <select
              value={activeCase.id}
              onChange={(e) => {
                const found = cases.find(c => c.id === e.target.value);
                if (found) onSelectCase(found);
              }}
              className="bg-transparent text-neutral-900 text-xs font-bold outline-none cursor-pointer max-w-[220px] sm:max-w-[320px] truncate"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} • {c.decedent.legalName} ({c.dispositionType.replace('_', ' ').toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1.5 shrink-0 group-hover:text-neutral-700 transition" />
          </div>

          {/* Right: RBAC Role Switcher & Live Alert Bell */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#faf8f5] p-1 rounded-xl border border-[#e5dfd5] shadow-2xs">
              {(['manager', 'director', 'staff', 'accounting', 'family'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onChangeRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    currentRole === r
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#f0ebe1]'
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
                className="p-2 rounded-xl bg-[#faf8f5] hover:bg-[#f0ebe1] text-[#800000] relative border border-[#e5dfd5] transition cursor-pointer shadow-2xs"
                title="View Live Alert Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#800000] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white px-0.5">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* SECOND TIER: Symmetrical Action Command Suite (3 Balanced Tool Pods) */}
      <div className="bg-[#fdfcfb] border-b border-[#e5dfd5] px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* POD 1: Core Case Operations */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e5dfd5] shadow-2xs">
            <span className="px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider hidden 2xl:inline">
              Case Operations
            </span>

            {/* + New Case */}
            <button
              onClick={onOpenNewCase}
              className="bg-[#800000] hover:bg-[#6b0000] text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>New Case</span>
            </button>

            {/* Phone Intake */}
            {onOpenFirstCallIntake && (
              <button
                onClick={onOpenFirstCallIntake}
                className="bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Take Family Phone Intake Call & Schedule Arrangement Conference"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                <span>Phone Intake</span>
              </button>
            )}

            {/* Removal & Custody */}
            {onOpenRemovalModal && (
              <button
                onClick={onOpenRemovalModal}
                className="bg-blue-50/70 hover:bg-blue-100 text-blue-950 border border-blue-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Schedule First Call Removal & Custody Transfer"
              >
                <Truck className="w-3.5 h-3.5 text-blue-700" />
                <span>Removal</span>
              </button>
            )}

            {/* AP-47 Contract */}
            {onOpenContractModal && (
              <button
                onClick={onOpenContractModal}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300/80 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Open NYS Form AP-47 Itemized Contract Studio"
              >
                <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
                <span>AP-47 Contract</span>
              </button>
            )}
          </div>

          {/* POD 2: Digital Media & AI Studio */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e5dfd5] shadow-2xs">
            <span className="px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider hidden 2xl:inline">
              Media & AI
            </span>

            {/* AI Concierge */}
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Open 24/7 AI Family Care Concierge, 9-Part Obituary Generator & Audio Archive"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Concierge</span>
              </button>
            )}

            {/* Press Dispatch */}
            {onOpenPressModal && (
              <button
                onClick={onOpenPressModal}
                className="bg-amber-50/80 hover:bg-amber-100 text-amber-950 border border-amber-300/80 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Open Commercial Press Fulfillment & 300 DPI CMYK Programs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-800" />
                <span>Press Dispatch</span>
              </button>
            )}

            {/* Live 4K Webcast */}
            {onOpenWebcastModal && (
              <button
                onClick={onOpenWebcastModal}
                className="bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Open Live 4K Webcasting, Multi-Camera PTZ Switcher & Broadcast Gate"
              >
                <Video className="w-3.5 h-3.5 text-rose-700" />
                <span>Live 4K Webcast</span>
              </button>
            )}
          </div>

          {/* POD 3: Enterprise Hubs & Tools */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e5dfd5] shadow-2xs">
            <span className="px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider hidden 2xl:inline">
              Ecosystem
            </span>

            {/* Enterprise Integrations Command Center */}
            {onOpenIntegrationsCenter && (
              <button
                onClick={onOpenIntegrationsCenter}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-2 transition shadow-xs border border-neutral-700 cursor-pointer"
                title="Open Enterprise Integrations Hub (Twilio, DocuSign, Stripe, QuickBooks, Cloud Sync)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Integrations</span>
                <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold">
                  9/9 LIVE
                </span>
              </button>
            )}

            {/* Family SMS Hub */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="bg-red-50/70 hover:bg-red-100 text-[#800000] border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Open Live Family SMS & Alert Dispatch Hub"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#800000]" />
                <span className="hidden sm:inline">Family SMS Hub</span>
                {notificationCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#800000] text-white text-[10px] font-mono rounded-full font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Simulation Runner */}
            {onOpenSimulationModal && (
              <button
                onClick={onOpenSimulationModal}
                className="bg-[#f5f3ff] hover:bg-[#ede9fe] text-purple-950 border border-purple-200 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                title="Run 1-Click Interactive End-to-End Case Lifecycle Simulation"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden xl:inline">Simulation</span>
              </button>
            )}

            {/* Guided Tour */}
            {onOpenGuidedTour && (
              <button
                onClick={onOpenGuidedTour}
                className="bg-[#fefce8] hover:bg-[#fef9c3] text-amber-950 border border-amber-200 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                title="Open Interactive Step-by-Step Guided Tour"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden xl:inline">Tour</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* THIRD TIER: Role Telemetry & System Compliance Status */}
      <div className="bg-[#f8f6f0] border-b border-[#e5dfd5] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${roleBadges[currentRole].color} shadow-2xs`}>
            {roleBadges[currentRole].label}
          </span>
          <span className="text-neutral-600 text-[11px] hidden md:inline font-light">
            — {roleBadges[currentRole].desc}
          </span>
          {currentRole === 'manager' && onLockManagerSuite && (
            <button
              onClick={onLockManagerSuite}
              className="ml-2 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-[#800000] border border-amber-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              title="Lock Manager Suite and revoke signed session token"
            >
              <Lock className="w-2.5 h-2.5 text-[#800000]" />
              <span>Lock Suite</span>
            </button>
          )}
        </div>

        {/* Live Golden Record Telemetry */}
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

      {/* FOURTH TIER: Symmetrical 5-Phase Linear Progression (Golden Path Stepper) */}
      <div className="bg-white border-b border-[#e5dfd5] px-4 sm:px-6 py-3">
        <div className="flex flex-col space-y-2.5">

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-neutral-900 font-serif flex items-center gap-1.5 text-sm">
                <Layers className="w-4 h-4 text-[#800000]" />
                Linear Process Progression:
              </span>
              <span className="text-[#a07428] font-bold">
                {activeCase.decedent.legalName} ({activeCase.caseNumber})
              </span>
            </div>

            <span className="text-[11px] text-neutral-500 font-mono">
              Stage {currentPhaseIndex + 1} of 5 • {Math.round(((currentPhaseIndex + 1) / 5) * 100)}% Complete
            </span>
          </div>

          {/* 5-Step Connected Progress Track with Clean Symmetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
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
                  className={`p-3 rounded-xl border text-left transition flex items-center space-x-3 relative group ${
                    isCurrent
                      ? 'bg-[#fcf5f5] border-[#800000] ring-2 ring-[#800000]/20 shadow-xs'
                      : isPast
                        ? 'bg-[#f4fbf7] border-emerald-300 hover:bg-[#ebf8f0] text-emerald-950'
                        : 'bg-[#faf8f5] border-[#e5dfd5] hover:bg-[#f3ede3] text-neutral-600'
                  }`}
                  title={phase.id === 'arrangements' ? 'Open Arrangement Conference & AP-47 Contract Studio' : `Go to ${phase.label}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    isCurrent
                      ? 'bg-[#800000] text-white shadow-xs'
                      : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {isPast ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-[#800000]' : isPast ? 'text-emerald-950' : 'text-neutral-800'
                      }`}>
                        {phase.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block truncate font-normal">
                      {isPast ? '✓ Completed' : isCurrent ? '👉 Current Active Stage' : phase.subLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* FIFTH TIER: Symmetrical Co-Pilot Ribbon */}
          <div className="mt-2 p-3 bg-gradient-to-r from-[#fdfbf7] via-[#fffdfa] to-[#fbf8f2] rounded-xl border border-[#e5dfd5] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start md:items-center space-x-2.5">
              <div className="p-1.5 bg-[#800000] text-white rounded-lg shrink-0 mt-0.5 md:mt-0 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div>
                <span className="font-bold text-[#800000] uppercase tracking-wider text-[10px] block">
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
                    className="px-3.5 py-1.5 bg-[#800000] hover:bg-[#6b0000] text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Log Safe Arrival at BFH</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenNotifications}
                    className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#f0ebe1] text-neutral-800 border border-[#e5dfd5] font-bold rounded-lg text-xs transition cursor-pointer"
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
                      className="px-3.5 py-1.5 bg-[#800000] hover:bg-[#6b0000] text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 border border-amber-300/40 cursor-pointer"
                    >
                      <ScrollText className="w-3.5 h-3.5 text-amber-300" />
                      <span>Open AP-47 Studio</span>
                    </button>
                  )}
                  {onOpenPrintAP47 && (
                    <button
                      onClick={onOpenPrintAP47}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 border border-amber-400/40 cursor-pointer"
                      title="Print Official Form AP-47 Contract (10 NYCRR § 77.8)"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Print AP-47</span>
                    </button>
                  )}
                  <button
                    onClick={() => onChangeTab('calendar')}
                    className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#f0ebe1] text-neutral-800 border border-[#e5dfd5] font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                    <span>12-Room Calendar</span>
                  </button>
                  {onOpenLiveryModal && (
                    <button
                      onClick={onOpenLiveryModal}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Car className="w-3.5 h-3.5 text-amber-700" />
                      <span>Livery Hold</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenPartnerModal || (() => onChangeTab('partners'))}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
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
                    className="px-3.5 py-1.5 bg-[#800000] hover:bg-[#6b0000] text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Legal eSign Pad</span>
                  </button>
                  <button
                    onClick={onOpenNotifications}
                    className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#f0ebe1] text-neutral-800 border border-[#e5dfd5] font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Send eSign SMS Link
                  </button>
                </>
              )}

              {activeCase.currentPhase === 'permits_logistics' && (
                <button
                  onClick={onOpenWoodlawnModal}
                  className="px-3.5 py-1.5 bg-[#800000] hover:bg-[#6b0000] text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Woodlawn Dispatch</span>
                </button>
              )}

              {activeCase.currentPhase === 'finalization_aftercare' && (
                <button
                  onClick={() => onChangeTab('finances')}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Verify Split Billing</span>
                </button>
              )}

              {onAdvancePhase && currentPhaseIndex < phaseOrder.length - 1 && (
                <button
                  onClick={() => onAdvancePhase(activeCase.id, phaseOrder[currentPhaseIndex + 1])}
                  className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#f0ebe1] text-neutral-800 border border-[#e5dfd5] font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Advance case to next linear stage"
                >
                  <span>Advance Stage</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* SIXTH TIER: Navigation Tabs */}
      <nav className="bg-white border-b border-[#e5dfd5] px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex space-x-1.5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#fcf5f5] text-[#800000] border border-[#e8c8c8] shadow-xs'
                    : 'text-neutral-600 hover:text-[#800000] hover:bg-[#faf8f5]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#800000]' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
};
