import React, { useState, useMemo } from 'react';
import {
  GoldenRecordCase,
  CasePhase,
  DocumentItem,
  UserRole,
  DirectorProfile,
  PartnerScheduleRequest
} from '../../lib/types/funeral';
import { CaseProgressBar } from './CaseProgressBar';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Send,
  Search,
  ShieldCheck,
  Layers,
  DollarSign,
  ScrollText,
  UserCheck,
  User,
  AlertCircle,
  Smartphone,
  Truck,
  Calendar,
  Clock,
  PhoneCall,
  ShieldAlert,
  Compass,
  BookOpen,
  Video,
  CreditCard
} from 'lucide-react';

export interface DirectorActiveCasesDashboardProps {
  cases: GoldenRecordCase[];
  activeCase: GoldenRecordCase;
  onSelectCase: (caseItem: GoldenRecordCase) => void;
  onOpenGoldenRecord: (caseId?: string) => void;
  onOpenESignModal?: (doc?: DocumentItem | null) => void;
  onOpenLiveryModal?: () => void;
  onOpenWoodlawnModal?: () => void;
  onOpenPartnerModal?: () => void;
  onOpenTwoWaySmsModal?: (requestId?: string) => void;
  onOpenWebcastModal?: (caseItem: GoldenRecordCase) => void;
  onOpenRemovalModal?: (caseItem: GoldenRecordCase) => void;
  onOpenContractModal?: (caseItem: GoldenRecordCase) => void;
  onOpenPrintAP47?: (caseItem: GoldenRecordCase) => void;
  onOpenAppointmentModal?: (caseItem: GoldenRecordCase) => void;
  onOpenDiscrepancyGuardrail?: (caseItem: GoldenRecordCase) => void;
  onOpenDirectorDayOfServiceHUD?: (caseItem: GoldenRecordCase) => void;
  onOpenFamilyProofApproval?: (caseItem: GoldenRecordCase) => void;
  onOpenNewCase?: () => void;
  onOpenFirstCallIntake?: () => void;
  onOpenFamilyPortal?: (caseId?: string) => void;
  onUpdateCasePhase?: (caseId: string, phase: CasePhase) => void;
  onSendNotification?: (notif: any) => void;
  currentRole?: UserRole;
  currentDirectorId?: string;
  onChangeDirectorId?: (id: string) => void;
  directorProfiles?: DirectorProfile[];
  onClaimCase?: (caseId: string) => void;
  onOverrideDirector?: (caseId: string, newDirectorId: string) => void;
  onOpenDocuSignModal?: (caseItem: GoldenRecordCase) => void;
  onOpenQuickBooksModal?: (caseItem: GoldenRecordCase) => void;
  onOpenCloudModal?: () => void;
  onOpenAIModal?: () => void;
  onOpenPressModal?: () => void;
  onOpenStripeModal?: (caseItem: GoldenRecordCase) => void;
  partnerRequests?: PartnerScheduleRequest[];
}

export type UrgencyLevel = 'critical' | 'warning' | 'ontrack' | 'administrative';

export interface CaseDueAlert {
  id: string;
  caseId: string;
  caseNumber: string;
  decedentName: string;
  category: 'edrs_72h' | 'program_print' | 'legal_esign' | 'livery_lock' | 'webcast_tech' | 'hra_60d' | 'insurance_claim' | 'unclaimed_case' | 'vendor_sms_overdue';
  categoryLabel: string;
  urgency: UrgencyLevel;
  title: string;
  description: string;
  dueTimeLabel: string;
  actionLabel: string;
  actionType: 'call_dr' | 'open_esign' | 'open_livery' | 'open_webcast' | 'open_print' | 'open_golden_record' | 'claim_case' | 'open_partner_sms';
  targetRequestId?: string;
}

export const DirectorActiveCasesDashboard: React.FC<DirectorActiveCasesDashboardProps> = ({
  cases,
  activeCase,
  onSelectCase,
  onOpenGoldenRecord,
  onOpenESignModal: _onOpenESignModal,
  onOpenLiveryModal: _onOpenLiveryModal,
  onOpenWoodlawnModal: _onOpenWoodlawnModal,
  onOpenPartnerModal,
  onOpenTwoWaySmsModal,
  onOpenWebcastModal,
  onOpenRemovalModal,
  onOpenContractModal,
  onOpenPrintAP47: _onOpenPrintAP47,
  onOpenAppointmentModal,
  onOpenDiscrepancyGuardrail,
  onOpenDirectorDayOfServiceHUD,
  onOpenFamilyProofApproval,
  onOpenNewCase,
  onOpenFirstCallIntake,
  onOpenFamilyPortal: _onOpenFamilyPortal,
  onUpdateCasePhase: _onUpdateCasePhase,
  onSendNotification,
  currentRole = 'director',
  currentDirectorId = 'dir-fd-1',
  onChangeDirectorId,
  directorProfiles = [],
  onClaimCase,
  onOverrideDirector,
  onOpenDocuSignModal,
  onOpenQuickBooksModal,
  onOpenCloudModal: _onOpenCloudModal,
  onOpenAIModal: _onOpenAIModal,
  onOpenPressModal: _onOpenPressModal,
  onOpenStripeModal,
  partnerRequests = []
}) => {
  // Scope Filter: 'my_cases' | 'unclaimed' | 'all'
  const [scopeFilter, setScopeFilter] = useState<'my_cases' | 'unclaimed' | 'all'>(
    currentRole === 'manager' ? 'all' : 'my_cases'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<'all' | 'critical' | 'warning' | 'ontrack'>('all');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<'all' | CasePhase>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [sortBy, setSortBy] = useState<'urgency' | 'service_date' | 'case_number' | 'name'>('urgency');
  
  // Reassignment Modal State for Managers
  const [reassigningCaseId, setReassigningCaseId] = useState<string | null>(null);
  const [targetReassignDirectorId, setTargetReassignDirectorId] = useState<string>('dir-fd-1');

  // Toast & Interaction state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeDirector = directorProfiles.find(d => d.id === currentDirectorId) || directorProfiles[0];
  const isManagerUser = currentRole === 'manager' || activeDirector?.roleType === 'manager';

  // Compute Unclaimed Cases
  const unclaimedCases = useMemo(() => {
    return cases.filter(c => c.caseClaimStatus === 'unclaimed' || !c.assignedDirectorId);
  }, [cases]);

  // Compute all deadline alerts dynamically across cases
  const caseAlertsMap = useMemo(() => {
    const alerts: Record<string, CaseDueAlert[]> = {};

    cases.forEach(c => {
      const caseAlerts: CaseDueAlert[] = [];

      // 1. Unclaimed Alert
      if (c.caseClaimStatus === 'unclaimed' || !c.assignedDirectorId) {
        caseAlerts.push({
          id: `alert-claim-${c.id}`,
          caseId: c.id,
          caseNumber: c.caseNumber,
          decedentName: c.decedent.legalName,
          category: 'unclaimed_case',
          categoryLabel: 'Case Claim Required',
          urgency: 'critical',
          title: 'Appointment Booked — Awaiting Funeral Director Claim',
          description: `Family appointment booked for ${c.appointmentDate || 'Upcoming'}. Director must claim to prepare Form AP-47.`,
          dueTimeLabel: 'Claim Prior to Conference',
          actionLabel: 'Claim Case',
          actionType: 'claim_case'
        });
      }

      // 2. NYC EDRS 72-Hour Statutory Clock
      if (c.medicalCertifier.edrsStatus === 'pending') {
        if (c.id === 'case-003') {
          caseAlerts.push({
            id: `alert-edrs-${c.id}`,
            caseId: c.id,
            caseNumber: c.caseNumber,
            decedentName: c.decedent.legalName,
            category: 'edrs_72h',
            categoryLabel: 'NYC EDRS 72h Clock',
            urgency: 'critical',
            title: 'Physician EDRS Certification Pending (< 18h)',
            description: `Statutory 72-hour filing deadline expiring. Physician ${c.medicalCertifier.physicianName} has not signed.`,
            dueTimeLabel: '18h remaining',
            actionLabel: 'Call Certifier',
            actionType: 'call_dr'
          });
        }
      }

      // 3. DocuSign Legal eSign Authorization
      if (c.docusignEnvelope?.status === 'sent' || c.docusignEnvelope?.status === 'not_sent') {
        if (c.currentPhase === 'legal_bundle') {
          caseAlerts.push({
            id: `alert-esign-${c.id}`,
            caseId: c.id,
            caseNumber: c.caseNumber,
            decedentName: c.decedent.legalName,
            category: 'legal_esign',
            categoryLabel: 'DocuSign Legal Packet',
            urgency: 'critical',
            title: `NOK Legal eSign Pending (${c.informant.fullName})`,
            description: 'Awaiting DocuSign NYS Form AP-47 and Cremation/Burial authorization with SMS OTP verification.',
            dueTimeLabel: 'Action Required',
            actionLabel: 'Open DocuSign Hub',
            actionType: 'open_esign'
          });
        }
      }

      // 4. Vendor SMS Unconfirmed & SLA Overdue Alerts
      const caseRequests = partnerRequests.filter(r => r.caseId === c.id);
      caseRequests.forEach(req => {
        const isOverdue = req.isOverdue || req.status === 'overdue_unconfirmed' || (req.status !== 'confirmed' && req.status !== 'completed' && req.status !== 'declined' && req.directorFollowUpRequired);
        if (isOverdue) {
          caseAlerts.push({
            id: `alert-vendor-sms-${req.id}`,
            caseId: c.id,
            caseNumber: c.caseNumber,
            decedentName: c.decedent.legalName,
            category: 'vendor_sms_overdue',
            categoryLabel: 'Vendor SMS SLA Overdue',
            urgency: 'critical',
            title: `🚨 Unconfirmed Partner: ${req.partnerName} (${req.roleTitle})`,
            description: `SMS dispatched for ${req.roleTitle} (${req.serviceDate} ${req.callTime}). SLA response deadline (${req.responseDeadline || 'Expired'}) passed. Standby backup: ${req.standbyBackupPartnerName || 'Assigned in directory'}. Immediate director follow-up required.`,
            dueTimeLabel: req.overdueMinutes ? `${req.overdueMinutes}m Overdue` : 'SLA Expired',
            actionLabel: 'Follow-Up / Standby',
            actionType: 'open_partner_sms',
            targetRequestId: req.id
          });
        }
      });

      alerts[c.id] = caseAlerts;
    });

    return alerts;
  }, [cases, partnerRequests]);

  const allAlertsList = useMemo(() => {
    return Object.values(caseAlertsMap).flat();
  }, [caseAlertsMap]);

  // Filtered cases based on Scope + Search + Filters
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Scope Filter
      if (scopeFilter === 'my_cases') {
        if (c.assignedDirectorId !== currentDirectorId && c.assignedDirector !== activeDirector?.name) {
          return false;
        }
      } else if (scopeFilter === 'unclaimed') {
        if (c.caseClaimStatus !== 'unclaimed' && c.assignedDirectorId) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.decedent.legalName.toLowerCase().includes(q);
        const matchesCaseNo = c.caseNumber.toLowerCase().includes(q);
        const matchesInformant = c.informant.fullName.toLowerCase().includes(q);
        const matchesDirector = (c.assignedDirector || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCaseNo && !matchesInformant && !matchesDirector) {
          return false;
        }
      }

      // Phase Filter
      if (selectedPhaseFilter !== 'all' && c.currentPhase !== selectedPhaseFilter) {
        return false;
      }

      // Urgency Filter
      if (selectedUrgencyFilter !== 'all') {
        const cAlerts = caseAlertsMap[c.id] || [];
        if (selectedUrgencyFilter === 'critical') return cAlerts.some(a => a.urgency === 'critical');
        if (selectedUrgencyFilter === 'warning') return cAlerts.some(a => a.urgency === 'warning');
        if (selectedUrgencyFilter === 'ontrack') return cAlerts.length === 0;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgency') {
        const aCrit = (caseAlertsMap[a.id] || []).filter(x => x.urgency === 'critical').length;
        const bCrit = (caseAlertsMap[b.id] || []).filter(x => x.urgency === 'critical').length;
        if (aCrit !== bCrit) return bCrit - aCrit;
      }
      return b.caseNumber.localeCompare(a.caseNumber);
    });
  }, [cases, scopeFilter, currentDirectorId, activeDirector, searchQuery, selectedPhaseFilter, selectedUrgencyFilter, sortBy, caseAlertsMap]);

  const handleAlertAction = (alert: CaseDueAlert) => {
    const targetCase = cases.find(c => c.id === alert.caseId);
    if (!targetCase) return;

    onSelectCase(targetCase);

    if (alert.actionType === 'claim_case' && onClaimCase) {
      onClaimCase(targetCase.id);
      showToast(`✓ You have claimed case ${targetCase.caseNumber} (${targetCase.decedent.legalName}).`);
    } else if (alert.actionType === 'open_esign' && onOpenDocuSignModal) {
      onOpenDocuSignModal(targetCase);
    } else if (alert.actionType === 'call_dr') {
      showToast(`📞 Calling Dr. ${targetCase.medicalCertifier.physicianName} at ${targetCase.medicalCertifier.phone || '(212) 939-1000'}.`);
    } else if (alert.actionType === 'open_partner_sms') {
      if (onOpenTwoWaySmsModal) {
        onOpenTwoWaySmsModal(alert.targetRequestId);
      } else if (onOpenPartnerModal) {
        onOpenPartnerModal();
      }
    } else {
      onOpenGoldenRecord(targetCase.id);
    }
  };

  const handleSendMagicLink = (c: GoldenRecordCase, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`📱 Family Portal magic-link sent to ${c.informant.fullName} (${c.informant.phone})`);
    if (onSendNotification) {
      onSendNotification({
        title: 'Family Portal Access Link Dispatched',
        message: `Magic link dispatched to ${c.informant.fullName} for Case ${c.caseNumber}`,
        type: 'sms',
        recipient: c.informant.phone
      });
    }
  };

  const handleExecuteReassign = () => {
    if (!reassigningCaseId || !onOverrideDirector) return;
    onOverrideDirector(reassigningCaseId, targetReassignDirectorId);
    const newDir = directorProfiles.find(d => d.id === targetReassignDirectorId);
    showToast(`✓ Case reassigned to ${newDir?.name || 'Director'}.`);
    setReassigningCaseId(null);
  };

  return (
    <div className="bg-neutral-50/80 min-h-screen text-neutral-900 pb-16 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-amber-300 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-amber-400/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* REASSIGNMENT OVERRIDE MODAL FOR MANAGERS */}
      {reassigningCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-300 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-bold text-sm text-neutral-900">Managerial Case Override</h3>
              </div>
              <button onClick={() => setReassigningCaseId(null)} className="text-neutral-400 hover:text-neutral-700 text-xs font-bold">✕</button>
            </div>

            <p className="text-xs text-neutral-600">
              Reassign lead licensed director for case <strong>{cases.find(c => c.id === reassigningCaseId)?.caseNumber}</strong>. This updates active schedules, Form AP-47 licenses, and notifications.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Assign To Licensed Director:</label>
              <select
                value={targetReassignDirectorId}
                onChange={(e) => setTargetReassignDirectorId(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
              >
                <optgroup label="Licensed Funeral Directors (In-House Staff)">
                  {directorProfiles.filter(d => d.roleType === 'funeral_director').map(d => (
                    <option key={d.id} value={d.id}>
                      👔 {d.name} ({d.licenseNumber}) • {d.colorTheme.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Managing Directors">
                  {directorProfiles.filter(d => d.roleType === 'manager').map(d => (
                    <option key={d.id} value={d.id}>
                      👑 {d.name} ({d.title})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReassigningCaseId(null)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReassign}
                className="px-4 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP COMMAND BAR: DIRECTOR / MANAGER IDENTITY & SCOPE SELECTOR */}
      <div className="bg-white border-b border-neutral-200 shadow-2xs sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Active Director Profile & Color Indicator */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs border"
              style={{ backgroundColor: activeDirector?.colorTheme?.primary || '#991b1b' }}
            >
              <User className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-neutral-900">
                  {activeDirector?.name || 'Jason Benta'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  activeDirector?.roleType === 'manager' 
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : activeDirector?.colorTheme?.badgeBg || 'bg-blue-100 text-blue-900 border-blue-300'
                }`}>
                  {activeDirector?.roleType === 'manager' ? 'Managing Director (2 Admins)' : `Funeral Director • ${activeDirector?.colorTheme?.name}`}
                </span>
              </div>
              <div className="text-xs text-neutral-500 flex items-center space-x-2">
                <span>{activeDirector?.licenseNumber}</span>
                <span>•</span>
                <span>{activeDirector?.title}</span>
              </div>
            </div>
          </div>

          {/* Director / Manager Persona Switcher Dropdown */}
          {onChangeDirectorId && directorProfiles.length > 0 && (
            <div className="flex items-center space-x-2 bg-neutral-50 p-1.5 rounded-xl border border-neutral-200 text-xs">
              <span className="text-neutral-500 font-semibold pl-1">Switch User:</span>
              <select
                value={currentDirectorId}
                onChange={(e) => onChangeDirectorId(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-900 font-bold rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#991b1b] cursor-pointer"
              >
                <optgroup label="Managing Directors (Full Access & Overrides)">
                  {directorProfiles.filter(d => d.roleType === 'manager').map(d => (
                    <option key={d.id} value={d.id}>👑 {d.name} ({d.title})</option>
                  ))}
                </optgroup>
                <optgroup label="Licensed Funeral Directors (Case Claiming)">
                  {directorProfiles.filter(d => d.roleType === 'funeral_director').map(d => (
                    <option key={d.id} value={d.id}>👤 {d.name} ({d.colorTheme.name})</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* UNCLAIMED CASES NOTIFICATION BANNER */}
        {unclaimedCases.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-[#b45309] text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-400">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 border border-white/30">
                <AlertCircle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm">
                    {unclaimedCases.length} Unclaimed {unclaimedCases.length === 1 ? 'Case' : 'Cases'} Awaiting Director Assignment
                  </span>
                  <span className="bg-white text-[#b45309] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-100 mt-0.5">
                  Family appointment has been scheduled. Any eligible director must claim the case before starting the arrangement conference.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setScopeFilter('unclaimed')}
                className="bg-white hover:bg-amber-50 text-[#b45309] font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition"
              >
                View Unclaimed Cases ({unclaimedCases.length})
              </button>
            </div>
          </div>
        )}

        {/* SCOPE TABS & SEARCH / FILTER BAR */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-4">
          
          {/* Main Scope Switcher (My Cases vs Unclaimed vs All) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div className="flex items-center space-x-2 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-bold">
              <button
                onClick={() => setScopeFilter('my_cases')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  scopeFilter === 'my_cases'
                    ? 'bg-[#991b1b] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>My Active Cases ({cases.filter(c => c.assignedDirectorId === currentDirectorId).length})</span>
              </button>

              <button
                onClick={() => setScopeFilter('unclaimed')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  scopeFilter === 'unclaimed'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-300" />
                <span>Unclaimed Cases ({unclaimedCases.length})</span>
              </button>

              <button
                onClick={() => setScopeFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  scopeFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Cases ({cases.length})</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {onOpenFirstCallIntake && (
                <button
                  onClick={onOpenFirstCallIntake}
                  className="bg-gradient-to-r from-amber-600 via-amber-700 to-[#991b1b] hover:brightness-110 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm border border-amber-400/50"
                  title="Capture First Call Intake (Immediate Removal or Advance Arrangement)"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                  <span>+ First Call Intake</span>
                </button>
              )}

              {onOpenNewCase && (
                <button
                  onClick={onOpenNewCase}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm border border-amber-400/40"
                >
                  <span>+ New Case</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Secondary Filter Dropdowns */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search cases by decedent, case number, informant, or director..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedPhaseFilter}
                onChange={(e) => setSelectedPhaseFilter(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-2.5 py-2 text-neutral-800 font-medium outline-none focus:border-[#991b1b]"
              >
                <option value="all">All 5 Phases</option>
                <option value="intake_removal">1. Intake & Removal</option>
                <option value="arrangements">2. Arrangements & AP-47</option>
                <option value="legal_bundle">3. Legal DocuSign Bundle</option>
                <option value="permits_logistics">4. Permits & Dispatch</option>
                <option value="finalization_aftercare">5. Finances & Aftercare</option>
              </select>

              <select
                value={selectedUrgencyFilter}
                onChange={(e) => setSelectedUrgencyFilter(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-2.5 py-2 text-neutral-800 font-medium outline-none focus:border-[#991b1b]"
              >
                <option value="all">All Deadlines</option>
                <option value="critical">🚨 Critical / Overdue</option>
                <option value="warning">⚠️ Due Soon (24-48h)</option>
                <option value="ontrack">✓ On Track</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-2.5 py-2 text-neutral-800 font-medium outline-none focus:border-[#991b1b]"
              >
                <option value="urgency">Sort: Deadlines First</option>
                <option value="case_number">Sort: Case Number</option>
                <option value="name">Sort: Decedent Name</option>
              </select>

              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    viewMode === 'cards' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    viewMode === 'matrix' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TOP ACTIONABLE ALERTS & STATUTORY DEADLINES STRIP */}
        {allAlertsList.length > 0 && selectedUrgencyFilter !== 'ontrack' && (
          <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                  Active Statutory Deadlines & Critical Case Alerts ({allAlertsList.length})
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">NYS Vital Records & Logistics Monitor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allAlertsList.slice(0, 6).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleAlertAction(alert)}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 cursor-pointer transition hover:shadow-xs ${
                    alert.urgency === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50 text-rose-950'
                      : 'bg-amber-50/70 border-amber-200 hover:bg-amber-50 text-amber-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-[10px] text-[#991b1b]">{alert.caseNumber}</span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded ${
                        alert.urgency === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {alert.dueTimeLabel}
                      </span>
                    </div>
                    <div className="font-bold text-neutral-900 truncate">{alert.decedentName}</div>
                    <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">{alert.description}</p>
                  </div>

                  <div className="pt-1 border-t border-neutral-200/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-500">{alert.categoryLabel}</span>
                    <span className="text-[10px] font-bold text-[#991b1b] hover:underline flex items-center gap-1">
                      <span>{alert.actionLabel}</span>
                      <span>➔</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CASE CARDS LIST */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCases.map((c) => {
              const isUnclaimed = c.caseClaimStatus === 'unclaimed' || !c.assignedDirectorId;
              const isAssignedToMe = c.assignedDirectorId === currentDirectorId;
              const assignedDirObj = directorProfiles.find(d => d.id === c.assignedDirectorId);
              const isCaseSelected = activeCase?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden relative group ${
                    isCaseSelected
                      ? 'border-[#991b1b] ring-2 ring-[#991b1b]/10'
                      : isUnclaimed
                        ? 'border-amber-300 ring-2 ring-amber-400/20'
                        : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-neutral-100 bg-gradient-to-r from-neutral-50/70 via-white to-neutral-50/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#991b1b] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            {c.caseNumber}
                          </span>

                          <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                            {c.dispositionType.replace('_', ' ')}
                          </span>

                          {/* Director Assignment Badge with Theme Color */}
                          {isUnclaimed ? (
                            <span className="text-[11px] font-bold bg-amber-100 text-[#b45309] border border-amber-300 px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                              <AlertCircle className="w-3 h-3" />
                              <span>Unclaimed</span>
                            </span>
                          ) : (
                            <span 
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                                assignedDirObj?.colorTheme?.badgeBg || 'bg-neutral-100 text-neutral-800 border-neutral-200'
                              }`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Lead: {c.assignedDirector}</span>
                            </span>
                          )}

                          {isAssignedToMe && !isUnclaimed && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                              Your Case
                            </span>
                          )}

                          {/* Bi-Directional Removal / Arrangement Flow Badge */}
                          {c.safeArrivalStatus === 'safe_arrival_confirmed' && c.arrangementAppointment?.status === 'confirmed' ? (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Removal & Arrangement Synced</span>
                            </span>
                          ) : c.safeArrivalStatus === 'safe_arrival_confirmed' ? (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Removal Done ➔ Needs Arrangement</span>
                            </span>
                          ) : c.arrangementAppointment?.status === 'confirmed' ? (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Truck className="w-3 h-3 text-blue-600" />
                              <span>Arrangement Booked ➔ Removal Pending</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-full">
                              Intake Pending
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif-title font-bold text-base text-neutral-900 group-hover:text-[#991b1b] transition-colors mt-1">
                          {c.decedent.legalName}
                        </h3>

                        <div className="text-xs text-neutral-500 flex items-center space-x-2">
                          <span>Informant: <strong>{c.informant.fullName}</strong> ({c.informant.relationship})</span>
                          <span>•</span>
                          <span>{c.informant.phone}</span>
                        </div>
                      </div>

                      {/* Manager Override Trigger */}
                      {isManagerUser && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReassigningCaseId(c.id);
                            setTargetReassignDirectorId(c.assignedDirectorId || 'dir-fd-1');
                          }}
                          className="text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2 py-1 rounded-lg transition"
                          title="Override or Reassign Director"
                        >
                          Override Lead
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Case Progress Bar & Integration Indicators */}
                  <div className="p-5 space-y-4">
                    
                    {/* Embedded Linear Case Progress Bar */}
                    <CaseProgressBar 
                      caseItem={c} 
                      compact={false} 
                      onClaimCase={onClaimCase} 
                    />

                    {/* Operational Quick Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                      
                      {/* DocuSign Legal Envelope Status */}
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">
                          DocuSign Legal Hub
                        </span>
                        <div className="flex items-center space-x-1 font-bold text-xs text-neutral-900">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {c.docusignEnvelope?.status === 'completed'
                              ? 'Signed & Verified'
                              : c.docusignEnvelope?.nokIdVerified
                                ? 'NOK ID Verified'
                                : c.docusignEnvelope?.status === 'sent'
                                  ? 'Envelope Sent'
                                  : 'Drafting Required'}
                          </span>
                        </div>
                      </div>

                      {/* QuickBooks Accounting Status */}
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">
                          QuickBooks Sync
                        </span>
                        <div className="flex items-center space-x-1 font-bold text-xs text-neutral-900">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span className={c.quickbooksSync?.syncStatus === 'synced' ? 'text-emerald-700' : 'text-[#b45309]'}>
                            {c.quickbooksSync?.syncStatus === 'synced' ? 'Invoice Synced' : 'Ready to Push'}
                          </span>
                        </div>
                      </div>

                      {/* Vendor SMS Confirmation Status */}
                      {(() => {
                        const caseReqs = partnerRequests.filter(r => r.caseId === c.id);
                        const hasOverdue = caseReqs.some(r => r.isOverdue || r.status === 'overdue_unconfirmed' || (r.status !== 'confirmed' && r.directorFollowUpRequired));
                        const allConfirmed = caseReqs.length > 0 && caseReqs.every(r => r.status === 'confirmed');

                        return (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenTwoWaySmsModal) {
                                const overdueReq = caseReqs.find(r => r.isOverdue || r.status === 'overdue_unconfirmed');
                                onOpenTwoWaySmsModal(overdueReq?.id || caseReqs[0]?.id);
                              }
                            }}
                            className={`p-2.5 rounded-xl border cursor-pointer transition ${
                              hasOverdue
                                ? 'bg-red-50 border-red-300 hover:bg-red-100/80 animate-pulse'
                                : allConfirmed
                                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70'
                                : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">
                              Vendor SMS ({caseReqs.length})
                            </span>
                            <div className="flex items-center space-x-1 font-bold text-xs">
                              <Smartphone className={`w-3.5 h-3.5 ${hasOverdue ? 'text-[#991b1b]' : allConfirmed ? 'text-emerald-600' : 'text-[#b45309]'}`} />
                              <span className={hasOverdue ? 'text-[#991b1b]' : allConfirmed ? 'text-emerald-700' : 'text-[#b45309]'}>
                                {hasOverdue
                                  ? '🚨 SLA Overdue!'
                                  : allConfirmed
                                  ? '✓ All Confirmed'
                                  : caseReqs.length > 0
                                  ? `${caseReqs.filter(r => r.status !== 'confirmed').length} Awaiting YES`
                                  : 'No Partners'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Form AP-47 Statement Total */}
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">
                          AP-47 Statement
                        </span>
                        <div className="font-bold text-xs text-neutral-900">
                          ${(c.totalAmountDue || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Action Toolbar */}
                  <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
                    
                    {/* Primary Left Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                          onOpenGoldenRecord(c.id);
                        }}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-xs border border-amber-400/30"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Golden Record</span>
                      </button>

                      {/* First Call Removal Modal Launcher */}
                      {onOpenRemovalModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenRemovalModal(c);
                          }}
                          className={`font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs border ${
                            c.safeArrivalStatus === 'safe_arrival_confirmed'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                          title="Open First Call Removal Logistics & Custody Affidavit"
                        >
                          <Truck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Removal</span>
                        </button>
                      )}

                      {/* In-Person Arrangement Appointment Modal Launcher */}
                      {onOpenAppointmentModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenAppointmentModal(c);
                          }}
                          className={`font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs border ${
                            c.arrangementAppointment?.status === 'confirmed'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                          }`}
                          title="Open Family Arrangement Conference Scheduling Studio"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          <span>Arrangement</span>
                        </button>
                      )}

                      {/* 2-Way Vendor SMS Studio Launcher */}
                      {onOpenTwoWaySmsModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            const caseReqs = partnerRequests.filter(r => r.caseId === c.id);
                            const targetReq = caseReqs.find(r => r.isOverdue || r.status === 'overdue_unconfirmed') || caseReqs[0];
                            onOpenTwoWaySmsModal(targetReq?.id);
                          }}
                          className={`font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs ${
                            partnerRequests.some(r => r.caseId === c.id && (r.isOverdue || r.status === 'overdue_unconfirmed'))
                              ? 'bg-red-100 text-red-900 border border-red-300 font-bold animate-pulse'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-neutral-700'
                          }`}
                          title="Open Two-Way Service Partner SMS Dispatch & Carrier Confirmation Hub"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Vendor SMS</span>
                        </button>
                      )}

                      {/* DocuSign Modal Launcher */}
                      {onOpenDocuSignModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenDocuSignModal(c);
                          }}
                          className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                          title="Open DocuSign Legal Signature Hub & SMS ID Verification"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>DocuSign Hub</span>
                        </button>
                      )}

                      {/* QuickBooks Modal Launcher */}
                      {onOpenQuickBooksModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenQuickBooksModal(c);
                          }}
                          className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                          title="Open QuickBooks Online Invoicing & 1099 Bill Sync"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>QuickBooks</span>
                        </button>
                      )}

                      {/* Discrepancy Guardrail Launcher */}
                      {onOpenDiscrepancyGuardrail && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenDiscrepancyGuardrail(c);
                          }}
                          className="bg-red-950/10 hover:bg-red-950/20 text-[#991b1b] border border-red-300 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                          title="Open Zero-Slippage Discrepancy Guardrail & NYS PHL § 4201 Check"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-[#991b1b]" />
                          <span>Guardrail</span>
                        </button>
                      )}

                      {/* Day of Service Director Pocket HUD Launcher */}
                      {onOpenDirectorDayOfServiceHUD && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenDirectorDayOfServiceHUD(c);
                          }}
                          className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-400 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                          title="Open Mobile Day-of-Service Director Pocket HUD & Cortege SMS Dispatch"
                        >
                          <Compass className="w-3.5 h-3.5 text-amber-700" />
                          <span>Director HUD</span>
                        </button>
                      )}

                      {/* Family Proof Approval & Press Lock Launcher */}
                      {onOpenFamilyProofApproval && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenFamilyProofApproval(c);
                          }}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                          title="Open Family Proof Approval & Commercial Press Lock Hub"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                          <span>Proof Lock</span>
                        </button>
                      )}

                      {/* AP-47 Contract Studio Launcher */}
                      {onOpenContractModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenContractModal(c);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>AP-47 Studio</span>
                        </button>
                      )}

                      {/* 4K Webcasting & PIN Hub Launcher */}
                      {onOpenWebcastModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenWebcastModal(c);
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-950 border border-red-300 font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                          title="Open Live 4K Webcast Hub & Multi-Cam Studio"
                        >
                          <Video className="w-3.5 h-3.5 text-red-600" />
                          <span>4K Webcast</span>
                        </button>
                      )}

                      {/* Stripe Merchant POS & Split-Pay Launcher */}
                      {onOpenStripeModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                            onOpenStripeModal(c);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                          title="Open Stripe POS Terminal & Process Payments"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Stripe Pay</span>
                        </button>
                      )}
                    </div>

                    {/* Right Action: Claim Case or Send Magic Link */}
                    <div className="flex items-center space-x-1.5">
                      {isUnclaimed && onClaimCase ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClaimCase(c.id);
                            showToast(`✓ You have claimed case ${c.caseNumber} as lead director.`);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center space-x-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Claim Case</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleSendMagicLink(c, e)}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-1.5 rounded-lg transition"
                          title="Send Family Portal Link"
                        >
                          <Send className="w-3.5 h-3.5 text-neutral-600" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE B: HIGH-DENSITY OPERATIONAL MATRIX */}
        {viewMode === 'matrix' && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3">Case / Decedent</th>
                    <th className="px-4 py-3">Lead Director</th>
                    <th className="px-4 py-3">Phase & Progress</th>
                    <th className="px-4 py-3">Vendor SMS</th>
                    <th className="px-4 py-3">DocuSign</th>
                    <th className="px-4 py-3">QuickBooks</th>
                    <th className="px-4 py-3">Statement Total</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredCases.map(c => {
                    const isUnclaimed = c.caseClaimStatus === 'unclaimed' || !c.assignedDirectorId;
                    const assignedDirObj = directorProfiles.find(d => d.id === c.assignedDirectorId);
                    const caseReqs = partnerRequests.filter(r => r.caseId === c.id);
                    const hasOverdue = caseReqs.some(r => r.isOverdue || r.status === 'overdue_unconfirmed' || (r.status !== 'confirmed' && r.directorFollowUpRequired));
                    const allConfirmed = caseReqs.length > 0 && caseReqs.every(r => r.status === 'confirmed');

                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => onSelectCase(c)}
                        className="hover:bg-neutral-50 transition cursor-pointer"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-neutral-900">{c.decedent.legalName}</div>
                          <div className="text-[11px] font-mono text-[#991b1b]">{c.caseNumber} • {c.dispositionType.replace('_', ' ')}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          {isUnclaimed ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-[#b45309] border border-amber-300 rounded-full font-bold text-[11px]">
                              Unclaimed
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${assignedDirObj?.colorTheme?.badgeBg || 'bg-neutral-100'}`}>
                              {c.assignedDirector}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="w-36">
                            <CaseProgressBar caseItem={c} compact={true} />
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenTwoWaySmsModal) {
                                const overdueReq = caseReqs.find(r => r.isOverdue || r.status === 'overdue_unconfirmed');
                                onOpenTwoWaySmsModal(overdueReq?.id || caseReqs[0]?.id);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition flex items-center gap-1 ${
                              hasOverdue
                                ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
                                : allConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : caseReqs.length > 0
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                            }`}
                          >
                            <Smartphone className="w-3 h-3 shrink-0" />
                            <span>
                              {hasOverdue
                                ? '🚨 Overdue'
                                : allConfirmed
                                ? '✓ Confirmed'
                                : caseReqs.length > 0
                                ? `${caseReqs.length} Sent`
                                : 'None'}
                            </span>
                          </button>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            c.docusignEnvelope?.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.docusignEnvelope?.nokIdVerified
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {c.docusignEnvelope?.status === 'completed' ? 'Signed' : (c.docusignEnvelope?.nokIdVerified ? 'ID Verified' : 'Draft')}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            c.quickbooksSync?.syncStatus === 'synced'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.quickbooksSync?.syncStatus === 'synced' ? 'Synced' : 'Pending'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-neutral-900">
                          ${c.totalAmountDue.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {isUnclaimed && onClaimCase ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClaimCase(c.id);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded text-xs font-bold"
                              >
                                Claim
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectCase(c);
                                  onOpenGoldenRecord(c.id);
                                }}
                                className="bg-[#991b1b] hover:bg-red-800 text-white px-2.5 py-1 rounded text-xs font-bold"
                              >
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
