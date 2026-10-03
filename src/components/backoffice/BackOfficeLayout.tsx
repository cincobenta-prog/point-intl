import React, { useState } from 'react';
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
  ChevronDown,
  SlidersHorizontal,
  ChevronRight
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
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);

  const roleBadges: Record<UserRole, { label: string; color: string; desc: string }> = {
    manager: {
      label: 'Managing Director & Admin',
      color: 'bg-purple-50 text-purple-900 border-purple-200',
      desc: 'Licensed Director scheduling, trade contractor optimizer, 1099 disbursements'
    },
    director: {
      label: 'Licensed Funeral Director',
      color: 'bg-red-50 text-[#800000] border-red-200',
      desc: 'Full case authorization, Legal bundles, Woodlawn dispatch, EDRS'
    },
    staff: {
      label: 'Field & Transport Staff',
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      desc: 'Physical removal, Safe Arrival custody logging'
    },
    accounting: {
      label: 'Accounting & Finance',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'ACH Bank transfers, Life insurance claim verification'
    },
    family: {
      label: 'Family Portal View',
      color: 'bg-amber-50 text-amber-900 border-amber-200',
      desc: 'Arrangement review, e-Signatures, 360° Digi-Tribute'
    }
  };

  const navItems: Array<{ id: BackOfficeTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Active Cases', icon: LayoutDashboard },
    { id: 'manager', label: 'Director Roster & Shifts', icon: UserCheck },
    { id: 'pipeline', label: '5-Phase Pipeline', icon: Layers },
    { id: 'golden_record', label: 'Golden Record Hub', icon: FileText },
    { id: 'calendar', label: 'Facility & Chapel Calendar', icon: Calendar },
    { id: 'partners', label: 'Partners & Clergy SMS', icon: Users },
    { id: 'documents', label: 'Document Delivery Matrix', icon: CheckCircle2 },
    { id: 'dispatch', label: 'Woodlawn & Dispatch', icon: Flame },
    { id: 'finances', label: 'ACH & Insurance Billing', icon: DollarSign },
    { id: 'reports', label: 'Reports & Audit', icon: BarChart3 },
    { id: 'aftercare', label: 'Aftercare & CRM Nurture', icon: HeartHandshake }
  ];

  const phaseOrder: CasePhase[] = ['intake_removal', 'arrangements', 'legal_bundle', 'permits_logistics', 'finalization_aftercare'];
  const currentPhaseIndex = phaseOrder.indexOf(activeCase.currentPhase);

  const PHASES_LIST: Array<{
    id: CasePhase;
    stepNum: number;
    title: string;
    subTitle: string;
    targetTab: BackOfficeTab;
    icon: any;
  }> = [
    { id: 'intake_removal', stepNum: 1, title: 'Intake & Removal', subTitle: 'First Call & Custody', targetTab: 'golden_record', icon: Truck },
    { id: 'arrangements', stepNum: 2, title: 'Arrangements & AP-47', subTitle: 'Itemization & Chapel', targetTab: 'golden_record', icon: ScrollText },
    { id: 'legal_bundle', stepNum: 3, title: 'Legal Authorizations', subTitle: 'DocuSign & EDRS Verification', targetTab: 'documents', icon: PenTool },
    { id: 'permits_logistics', stepNum: 4, title: 'Permits & Dispatch', subTitle: 'NYC EDRS & Woodlawn', targetTab: 'dispatch', icon: Flame },
    { id: 'finalization_aftercare', stepNum: 5, title: 'Finances & Aftercare', subTitle: 'ACH, Claims & Nurture', targetTab: 'finances', icon: HeartHandshake }
  ];

  return (
    <div className="bg-[#FAF9F6] text-neutral-900 flex flex-col font-sans border-b border-[#E8E3DA] shadow-xs">

      {/* TOP TIER: Main Luxury Brand Header & Clean Case Identity */}
      <header className="bg-white border-b border-[#E8E3DA] px-4 sm:px-6 py-2.5 shrink-0 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Left: Public Website Link + Benta Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onExitBackOffice}
              className="flex items-center space-x-1.5 text-xs text-neutral-700 hover:text-[#800000] bg-[#FAF8F5] hover:bg-[#F3EFE8] px-3 py-1.5 rounded-lg border border-[#E8E3DA] font-medium transition cursor-pointer group shadow-2xs"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-neutral-500 group-hover:text-[#800000]" />
              <span>Public Website</span>
            </button>

            <div className="h-6 w-px bg-[#E8E3DA] hidden sm:block" />

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
                  <span className="text-[10px] bg-[#FAF3E0] text-[#9A7426] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold border border-[#E5D5AC] shadow-2xs">
                    Director Console
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-medium hidden sm:block">
                  Harlem, New York City • Founded 1928
                </span>
              </div>
            </div>
          </div>

          {/* Center: Friendly, High-Clarity Active Case Selector */}
          <div className="flex items-center bg-[#FAF8F5] hover:bg-[#F5F0E6] px-3 py-1.5 rounded-xl border border-[#E8E3DA] transition shadow-2xs group cursor-pointer">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 shrink-0 animate-pulse" />
            <div className="flex flex-col text-left mr-2">
              <span className="text-[9px] uppercase font-bold text-[#800000] tracking-wider">
                Current Working Case
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
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-700 transition ml-1" />
          </div>

          {/* Right: Staff Persona Switcher & Notifications */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3DA] shadow-2xs">
              {(['manager', 'director', 'staff', 'accounting', 'family'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onChangeRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                    currentRole === r
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#F3EFE8]'
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
                className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE8] text-[#800000] relative border border-[#E8E3DA] transition cursor-pointer shadow-2xs"
                title="View Notifications and SMS Dispatches"
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

      {/* SECOND TIER: Streamlined & Intuitive Action Bar (Clean Hierarchy, No Overwhelm) */}
      <div className="bg-white border-b border-[#E8E3DA] px-4 sm:px-6 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Left: Everyday Primary Actions for Staff */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Action 1: New Case */}
            <button
              onClick={onOpenNewCase}
              className="bg-[#800000] hover:bg-[#680000] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
              title="Create a new case record"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ New Case</span>
            </button>

            {/* Primary Action 2: First Call Intake */}
            {onOpenFirstCallIntake && (
              <button
                onClick={onOpenFirstCallIntake}
                className="bg-[#FAF3E0] hover:bg-[#F5EAD0] text-[#8C6B2D] border border-[#E5D5AC] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Log First Call Telephone Intake & Schedule Family Conference"
              >
                <PhoneCall className="w-4 h-4 text-[#A07428]" />
                <span>Phone Intake</span>
              </button>
            )}

            <div className="h-6 w-px bg-[#E8E3DA] mx-1 hidden sm:block" />

            {/* Stage Quick Actions (Clean, Pastel-Bordered Buttons) */}
            {onOpenRemovalModal && (
              <button
                onClick={onOpenRemovalModal}
                className="bg-[#F4F8FC] hover:bg-[#EAF2FA] text-blue-900 border border-blue-200/80 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                title="Schedule First Call Removal & Physical Custody"
              >
                <Truck className="w-3.5 h-3.5 text-blue-700" />
                <span>Removal</span>
              </button>
            )}

            {onOpenContractModal && (
              <button
                onClick={onOpenContractModal}
                className="bg-[#F2F9F5] hover:bg-[#E5F5EC] text-emerald-900 border border-emerald-200/80 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                title="Open NYS Form AP-47 Arrangement & Pricing Studio"
              >
                <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
                <span>AP-47 Contract</span>
              </button>
            )}

            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="bg-[#F6F5FB] hover:bg-[#EDEAFC] text-indigo-950 border border-indigo-200/80 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                title="Open AI Concierge, 9-Part Obituary Generator & Audio Archive"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Concierge</span>
              </button>
            )}

            {onOpenPressModal && (
              <button
                onClick={onOpenPressModal}
                className="bg-[#FCF8F2] hover:bg-[#F7EFE2] text-amber-950 border border-amber-200/80 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                title="Commercial Press Dispatch & 300 DPI CMYK Programs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-800" />
                <span>Press Dispatch</span>
              </button>
            )}

            {onOpenWebcastModal && (
              <button
                onClick={onOpenWebcastModal}
                className="bg-[#FDF4F5] hover:bg-[#FAE9EB] text-rose-950 border border-rose-200/80 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                title="Open 4K Live Broadcast & PTZ Studio"
              >
                <Video className="w-3.5 h-3.5 text-rose-700" />
                <span>Live 4K Webcast</span>
              </button>
            )}
          </div>

          {/* Right: Clean Ecosystem & System Tools */}
          <div className="flex items-center space-x-2">
            {/* Live Family SMS Hub */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="bg-[#FAF8F5] hover:bg-[#F5EFE6] text-[#800000] border border-[#E8E3DA] font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title="Family SMS Dispatch Hub"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#800000]" />
                <span className="hidden md:inline">Family SMS</span>
                {notificationCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#800000] text-white text-[10px] font-mono rounded-full font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Enterprise Integrations Pill */}
            {onOpenIntegrationsCenter && (
              <button
                onClick={onOpenIntegrationsCenter}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-2 transition shadow-xs cursor-pointer border border-neutral-700"
                title="Enterprise Gateways (Twilio, DocuSign, Stripe, QuickBooks)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Integrations</span>
                <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold">
                  9/9 LIVE
                </span>
              </button>
            )}

            {/* Tools Drawer Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowToolsDrawer(!showToolsDrawer)}
                className="bg-[#FAF8F5] hover:bg-[#F3EFE8] text-neutral-700 border border-[#E8E3DA] px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                title="More Tools & Simulations"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
                <span className="hidden xl:inline">More Tools</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* Dropdown Menu for Secondary Tools */}
              {showToolsDrawer && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E3DA] p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-[#E8E3DA] text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Staff Helpers & Diagnostics
                  </div>
                  
                  {onOpenSimulationModal && (
                    <button
                      onClick={() => {
                        setShowToolsDrawer(false);
                        onOpenSimulationModal();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#FAF8F5] rounded-xl text-xs font-medium text-neutral-800 flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-bold">Case Lifecycle Simulator</div>
                        <div className="text-[10px] text-neutral-500">Test 1-click end-to-end case flow</div>
                      </div>
                    </button>
                  )}

                  {onOpenGuidedTour && (
                    <button
                      onClick={() => {
                        setShowToolsDrawer(false);
                        onOpenGuidedTour();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#FAF8F5] rounded-xl text-xs font-medium text-neutral-800 flex items-center gap-2 transition"
                    >
                      <Compass className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-bold">Interactive Guided Tour</div>
                        <div className="text-[10px] text-neutral-500">Step-by-step staff walk-through</div>
                      </div>
                    </button>
                  )}

                  {onLockManagerSuite && currentRole === 'manager' && (
                    <button
                      onClick={() => {
                        setShowToolsDrawer(false);
                        onLockManagerSuite();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-xl text-xs font-medium text-[#800000] flex items-center gap-2 transition border-t border-[#E8E3DA] mt-1"
                    >
                      <Lock className="w-4 h-4 text-[#800000]" />
                      <div>
                        <div className="font-bold">Lock Manager Suite</div>
                        <div className="text-[10px] text-neutral-500">Revoke active admin session</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* THIRD TIER: Reassuring Role & Director Status Banner */}
      <div className="bg-[#FAF8F5] border-b border-[#E8E3DA] px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs text-neutral-600">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${roleBadges[currentRole].color} shadow-2xs`}>
            {roleBadges[currentRole].label}
          </span>
          <span className="text-neutral-500 text-[11px] hidden md:inline">
            — {roleBadges[currentRole].desc}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Zero Transcription: <strong className="text-neutral-900 font-bold">Active</strong></span>
          </span>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <span className="hidden sm:inline">
            Director in Charge: <strong className="text-neutral-900">{activeCase.assignedDirector}</strong>
          </span>
        </div>
      </div>

      {/* FOURTH TIER: THE HERO — 5-Step Intuitive Linear Progression ("Golden Path") */}
      <div className="bg-white border-b border-[#E8E3DA] px-4 sm:px-6 py-3.5">
        <div className="flex flex-col space-y-3">

          {/* Stepper Header with Case Highlight & Progress Meter */}
          <div className="flex flex-wrap justify-between items-center text-xs gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-neutral-900 font-serif text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#800000]" />
                Linear Process Progression:
              </span>
              <span className="text-[#8C6B2D] font-bold bg-[#FAF3E0] px-2.5 py-0.5 rounded-md border border-[#E5D5AC]">
                {activeCase.decedent.legalName} ({activeCase.caseNumber})
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-32 bg-neutral-100 rounded-full h-2 overflow-hidden border border-neutral-200 hidden sm:block">
                <div
                  className="bg-gradient-to-r from-[#800000] to-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((currentPhaseIndex + 1) / 5) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-neutral-500 font-mono font-semibold">
                Step {currentPhaseIndex + 1} of 5 • {Math.round(((currentPhaseIndex + 1) / 5) * 100)}% Complete
              </span>
            </div>
          </div>

          {/* 5 Connected Step Cards with Clear Visual Distinctions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-start space-x-3 relative cursor-pointer group ${
                    isCurrent
                      ? 'bg-gradient-to-br from-[#FFF8F8] to-[#FFF0F0] border-[#800000] shadow-sm ring-2 ring-[#800000]/20'
                      : isPast
                        ? 'bg-[#F4FAF6] border-emerald-200 hover:bg-[#EBF7EF] text-emerald-950 shadow-2xs'
                        : 'bg-[#FAF8F5] border-[#E8E3DA] hover:bg-[#F3EFE8] text-neutral-600 opacity-80 hover:opacity-100'
                  }`}
                  title={`Go to Step ${phase.stepNum}: ${phase.title}`}
                >
                  {/* Step Number & Icon Badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs transition-transform group-hover:scale-105 ${
                    isCurrent
                      ? 'bg-[#800000] text-white'
                      : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {isPast ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Step {phase.stepNum}
                      </span>
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-[#800000] animate-ping" />
                      )}
                    </div>
                    <div className={`text-xs font-bold truncate mt-0.5 ${
                      isCurrent ? 'text-[#800000]' : isPast ? 'text-emerald-950' : 'text-neutral-800'
                    }`}>
                      {phase.title}
                    </div>
                    <span className="text-[10px] text-neutral-500 block truncate font-normal mt-0.5">
                      {isPast ? '✓ Completed' : isCurrent ? '👉 Current Step' : phase.subTitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* FIFTH TIER: Reassuring "Director Guided Next Step" Co-Pilot Ribbon */}
          <div className="p-3.5 bg-gradient-to-r from-[#FAF8F5] via-[#FFFDF9] to-[#F8F5EE] rounded-2xl border border-[#E8E3DA] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start md:items-center space-x-3">
              <div className="p-2 bg-[#800000] text-white rounded-xl shrink-0 mt-0.5 md:mt-0 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="font-bold text-[#800000] uppercase tracking-wider text-[10px] block">
                  Director Guided Next Step:
                </span>
                <p className="text-neutral-800 text-xs font-medium leading-relaxed">
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

            {/* Contextual Action Triggers */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeCase.currentPhase === 'intake_removal' && (
                <>
                  <button
                    onClick={() => onChangeTab('golden_record')}
                    className="px-4 py-2 bg-[#800000] hover:bg-[#680000] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Log Safe Arrival at BFH</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenNotifications}
                    className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F3EFE8] text-neutral-800 border border-[#E8E3DA] font-semibold rounded-xl text-xs transition cursor-pointer"
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
                      className="px-4 py-2 bg-[#800000] hover:bg-[#680000] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 border border-amber-300/40 cursor-pointer"
                    >
                      <ScrollText className="w-3.5 h-3.5 text-amber-300" />
                      <span>Open AP-47 Studio</span>
                    </button>
                  )}
                  {onOpenPrintAP47 && (
                    <button
                      onClick={onOpenPrintAP47}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 border border-amber-400/40 cursor-pointer"
                      title="Print Official Form AP-47 Contract (10 NYCRR § 77.8)"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Print AP-47</span>
                    </button>
                  )}
                  <button
                    onClick={() => onChangeTab('calendar')}
                    className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F3EFE8] text-neutral-800 border border-[#E8E3DA] font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                    <span>12-Room Calendar</span>
                  </button>
                  {onOpenLiveryModal && (
                    <button
                      onClick={onOpenLiveryModal}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Car className="w-3.5 h-3.5 text-amber-700" />
                      <span>Livery Hold</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenPartnerModal || (() => onChangeTab('partners'))}
                    className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
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
                    className="px-4 py-2 bg-[#800000] hover:bg-[#680000] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Legal eSign Pad</span>
                  </button>
                  <button
                    onClick={onOpenNotifications}
                    className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F3EFE8] text-neutral-800 border border-[#E8E3DA] font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Send eSign SMS Link
                  </button>
                </>
              )}

              {activeCase.currentPhase === 'permits_logistics' && (
                <button
                  onClick={onOpenWoodlawnModal}
                  className="px-4 py-2 bg-[#800000] hover:bg-[#680000] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Woodlawn Dispatch</span>
                </button>
              )}

              {activeCase.currentPhase === 'finalization_aftercare' && (
                <button
                  onClick={() => onChangeTab('finances')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Verify Split Billing</span>
                </button>
              )}

              {onAdvancePhase && currentPhaseIndex < phaseOrder.length - 1 && (
                <button
                  onClick={() => onAdvancePhase(activeCase.id, phaseOrder[currentPhaseIndex + 1])}
                  className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F3EFE8] text-neutral-800 border border-[#E8E3DA] font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Advance case to next linear stage"
                >
                  <span>Advance Stage</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* SIXTH TIER: Smooth Luxury Navigation Tabs */}
      <nav className="bg-white border-b border-[#E8E3DA] px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF3E0] text-[#800000] font-bold border border-[#E5D5AC] shadow-2xs'
                    : 'text-neutral-600 hover:text-[#800000] hover:bg-[#FAF8F5]'
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
