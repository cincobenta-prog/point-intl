import React from 'react';
import { GoldenRecordCase, CasePhase } from '../../lib/types/funeral';
import { 
  Truck, 
  UserCheck, 
  ScrollText, 
  FileCheck2, 
  Flame, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface CaseProgressBarProps {
  caseItem: GoldenRecordCase;
  compact?: boolean;
  onAdvancePhase?: (caseId: string, nextPhase: CasePhase) => void;
  onClaimCase?: (caseId: string) => void;
}

export interface CaseStepInfo {
  id: string;
  phase: CasePhase;
  stepNumber: number;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  statusBadge: string;
  nextActionPrompt: string;
}

export function getCaseSteps(caseItem: GoldenRecordCase): {
  steps: CaseStepInfo[];
  currentStepIndex: number;
  progressPercent: number;
  nextAction: string;
} {
  const isCustodyAcquired = caseItem.safeArrivalStatus === 'safe_arrival_confirmed';
  const isClaimed = caseItem.caseClaimStatus === 'claimed' || caseItem.caseClaimStatus === 'reassigned';
  const isArranged = caseItem.currentPhase !== 'intake_removal';
  const isLegalSigned = ['permits_logistics', 'finalization_aftercare'].includes(caseItem.currentPhase) || 
    caseItem.docusignEnvelope?.status === 'completed' || 
    caseItem.documents.some(d => d.phase === 'legal_bundle' && d.status === 'signed');
  const isPermitsDispatched = caseItem.currentPhase === 'finalization_aftercare' || 
    caseItem.medicalCertifier.edrsStatus === 'certified';
  const isFinalized = (isPermitsDispatched || caseItem.currentPhase === 'finalization_aftercare') && (caseItem.totalPaid >= caseItem.totalAmountDue || caseItem.quickbooksSync?.syncStatus === 'synced');

  const steps: CaseStepInfo[] = [
    {
      id: 'step-1',
      phase: 'intake_removal',
      stepNumber: 1,
      label: 'Intake & Custody',
      subLabel: isCustodyAcquired ? 'Remains at 630 St Nicholas' : 'In Transit / First Call',
      icon: Truck,
      isCompleted: isCustodyAcquired,
      isCurrent: caseItem.currentPhase === 'intake_removal' && !isClaimed,
      isUpcoming: false,
      statusBadge: isCustodyAcquired ? 'Safe Arrival Confirmed' : 'Custody Pending',
      nextActionPrompt: isCustodyAcquired ? 'Confirm intake inventory & arrange family consultation' : 'Complete hospital release & safe arrival at BFH'
    },
    {
      id: 'step-2',
      phase: 'intake_removal',
      stepNumber: 2,
      label: 'Case Claim & Appt',
      subLabel: isClaimed ? `Lead: ${caseItem.assignedDirector}` : 'Unclaimed Case',
      icon: UserCheck,
      isCompleted: isClaimed && (caseItem.appointmentScheduled || isArranged),
      isCurrent: caseItem.currentPhase === 'intake_removal' && !isClaimed,
      isUpcoming: false,
      statusBadge: isClaimed ? 'Director Claimed' : 'Awaiting Director Claim',
      nextActionPrompt: isClaimed ? 'Prepare Form AP-47 itemized worksheet for arrangement conference' : 'Funeral Director must claim this case to begin arrangements'
    },
    {
      id: 'step-3',
      phase: 'arrangements',
      stepNumber: 3,
      label: 'Arrangements & AP-47',
      subLabel: isArranged ? 'Form AP-47 Initialized' : 'Consultation Scheduled',
      icon: ScrollText,
      isCompleted: isArranged && (caseItem.statementOfGoods !== undefined || caseItem.currentPhase !== 'intake_removal'),
      isCurrent: caseItem.currentPhase === 'arrangements',
      isUpcoming: caseItem.currentPhase === 'intake_removal',
      statusBadge: caseItem.currentPhase === 'arrangements' ? 'Conference in Session' : (isArranged ? 'AP-47 Itemized' : 'Pending Conference'),
      nextActionPrompt: 'Finalize 12-Space AP-47 Statement of Goods & cash advances with informant'
    },
    {
      id: 'step-4',
      phase: 'legal_bundle',
      stepNumber: 4,
      label: 'DocuSign & Permits',
      subLabel: caseItem.docusignEnvelope?.nokIdVerified ? 'NOK ID Verified' : 'DocuSign Legal Packet',
      icon: FileCheck2,
      isCompleted: isLegalSigned,
      isCurrent: caseItem.currentPhase === 'legal_bundle',
      isUpcoming: ['intake_removal', 'arrangements'].includes(caseItem.currentPhase),
      statusBadge: caseItem.docusignEnvelope?.status === 'completed' ? 'Signed & Verified' : (caseItem.docusignEnvelope?.status === 'id_verified' ? 'ID Verified' : 'Awaiting NOK Signature'),
      nextActionPrompt: 'Dispatch DocuSign envelope with SMS OTP verification to Next-of-Kin'
    },
    {
      id: 'step-5',
      phase: 'finalization_aftercare',
      stepNumber: 5,
      label: 'Dispatch & Billing',
      subLabel: caseItem.quickbooksSync?.syncStatus === 'synced' ? 'QBO Synced' : 'Woodlawn & Billing',
      icon: Flame,
      isCompleted: isFinalized,
      isCurrent: ['permits_logistics', 'finalization_aftercare'].includes(caseItem.currentPhase),
      isUpcoming: ['intake_removal', 'arrangements', 'legal_bundle'].includes(caseItem.currentPhase),
      statusBadge: caseItem.quickbooksSync?.syncStatus === 'synced' ? 'QuickBooks Invoiced' : 'Pending QBO Sync',
      nextActionPrompt: 'Submit EDRS permit, execute Woodlawn transit, and sync invoice to QuickBooks'
    }
  ];

  let completedCount = steps.filter(s => s.isCompleted).length;
  if (caseItem.currentPhase === 'finalization_aftercare') completedCount = Math.max(completedCount, 4);
  if (caseItem.currentPhase === 'permits_logistics') completedCount = Math.max(completedCount, 3);
  if (caseItem.currentPhase === 'legal_bundle') completedCount = Math.max(completedCount, 2);
  if (caseItem.currentPhase === 'arrangements') completedCount = Math.max(completedCount, 2);

  const progressPercent = Math.min(100, Math.max(15, Math.round((completedCount / steps.length) * 100)));
  const activeStep = steps.find(s => s.isCurrent) || steps[Math.min(completedCount, steps.length - 1)];

  return {
    steps,
    currentStepIndex: Math.min(completedCount, steps.length - 1),
    progressPercent,
    nextAction: activeStep?.nextActionPrompt || 'Proceed with case workflow'
  };
}

export const CaseProgressBar: React.FC<CaseProgressBarProps> = ({
  caseItem,
  compact = false,
  onAdvancePhase,
  onClaimCase
}) => {
  const { steps, progressPercent, nextAction } = getCaseSteps(caseItem);
  const isUnclaimed = caseItem.caseClaimStatus === 'unclaimed' || !caseItem.assignedDirectorId;

  if (compact) {
    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-neutral-800">Case Progress:</span>
            <span className="font-bold text-[#991b1b]">{progressPercent}%</span>
          </div>
          <span className="text-[11px] font-medium text-neutral-500 truncate max-w-[200px]">
            Phase: {caseItem.currentPhase.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-rose-600 to-[#991b1b] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#991b1b]/10 border border-[#991b1b]/20 flex items-center justify-center text-[#991b1b]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-neutral-900 text-sm">
                Case Workflow Progress
              </span>
              <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-[#b45309] text-[11px] font-bold rounded-full">
                {progressPercent}% Complete
              </span>
              {isUnclaimed && (
                <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 text-[#991b1b] text-[11px] font-bold rounded-full animate-pulse flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Claim Required</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              NYS Article 34 & Golden Record 5-Stage Director Protocol
            </p>
          </div>
        </div>

        {/* Claim Action for Director */}
        <div className="flex items-center space-x-2">
          {isUnclaimed && onClaimCase && (
            <button
              onClick={() => onClaimCase(caseItem.id)}
              className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition border border-amber-400/40"
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Claim Case to Lead</span>
            </button>
          )}
          {onAdvancePhase && !isUnclaimed && (
            <button
              onClick={() => {
                const phaseOrder: CasePhase[] = ['intake_removal', 'arrangements', 'legal_bundle', 'permits_logistics', 'finalization_aftercare'];
                const curIdx = phaseOrder.indexOf(caseItem.currentPhase);
                if (curIdx < phaseOrder.length - 1) {
                  onAdvancePhase(caseItem.id, phaseOrder[curIdx + 1]);
                }
              }}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold text-xs px-3 py-1.5 rounded-lg transition"
            >
              Advance Stage ➔
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Visual Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isDone = step.isCompleted;
          const isCurrent = step.isCurrent;

          return (
            <div 
              key={step.id} 
              className={`p-3 rounded-lg border transition-all relative ${
                isCurrent 
                  ? 'bg-red-50/80 border-red-300 ring-2 ring-red-500/20 shadow-xs' 
                  : isDone 
                    ? 'bg-emerald-50/60 border-emerald-200' 
                    : 'bg-neutral-50/70 border-neutral-200 text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone 
                    ? 'bg-emerald-600 text-white' 
                    : isCurrent 
                      ? 'bg-[#991b1b] text-white' 
                      : 'bg-neutral-300 text-neutral-700'
                }`}>
                  {isDone ? '✓' : step.stepNumber}
                </span>

                <StepIcon className={`w-4 h-4 ${
                  isDone ? 'text-emerald-600' : isCurrent ? 'text-[#991b1b]' : 'text-neutral-400'
                }`} />
              </div>

              <div className="font-bold text-xs text-neutral-900 truncate" title={step.label}>
                {step.label}
              </div>
              <div className="text-[11px] text-neutral-500 truncate mt-0.5" title={step.subLabel}>
                {step.subLabel}
              </div>

              <div className="mt-2">
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium truncate max-w-full ${
                  isDone 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : isCurrent 
                      ? 'bg-rose-100 text-red-900 font-bold' 
                      : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {step.statusBadge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar Line */}
      <div className="space-y-1">
        <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden border border-neutral-200 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-rose-600 to-[#991b1b] transition-all duration-700 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* "What To Do Next" Director Assistant Callout */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-3 flex items-start space-x-3 text-xs text-neutral-800">
        <div className="mt-0.5 p-1 bg-amber-200/70 text-[#b45309] rounded">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-[#b45309] mr-1.5">Director Next Action:</span>
          <span className="font-medium text-neutral-800">{nextAction}</span>
        </div>
      </div>

    </div>
  );
};
