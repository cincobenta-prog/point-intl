import React, { useState } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Truck, 
  ScrollText, 
  Printer, 
  Smartphone, 
  Flame, 
  Music, 
  Flower2, 
  Video, 
  Compass, 
  BookOpen, 
  Heart, 
  Award, 
  Scale, 
  HelpCircle,
  Zap,
  Check
} from 'lucide-react';

export type TourTrack = 'director' | 'family';

export interface TourStepItem {
  id: number;
  title: string;
  subtitle: string;
  roleBadge: string;
  icon: React.ElementType;
  colorClass: string;
  badgeBg: string;
  highlightCategory: string;
  explanation: string;
  statutoryProtectionOrComfort: string;
  actionLabel?: string;
  actionModalKey?: string;
  keyCheckpoints: string[];
}

export const DIRECTOR_TOUR_STEPS: TourStepItem[] = [
  {
    id: 1,
    title: 'Director Command Center & Case Roster',
    subtitle: 'Step 1 of 8: Centralized Oversight & Statutory Safety',
    roleBadge: 'Licensed Funeral Director & Management',
    icon: Award,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
    highlightCategory: 'Case Management & Audit Readiness',
    explanation: 'Your high-altitude flight deck. Monitor every active case from First Call to S3 Archival. Real-time phase trackers alert you to urgent tasks, missing signatures, or approaching statutory deadlines.',
    statutoryProtectionOrComfort: 'Protects against case slippage, missed 72-hour permit windows, and facility scheduling conflicts across Chapel 1, Chapel 2, and the Repast Suite.',
    actionLabel: 'Explore Active Cases',
    actionModalKey: 'cases',
    keyCheckpoints: [
      '5-Phase Golden Record statutory pipeline',
      'Urgent task alert matrix with color-coded urgency',
      'Instant switch between Case Cards and Calendar view'
    ]
  },
  {
    id: 2,
    title: 'First Call Rapid Intake & Driver SMS Dispatch',
    subtitle: 'Step 2 of 8: 60-Second Case Inception & Livery Routing',
    roleBadge: 'Intake Staff & Livery Chauffeurs',
    icon: Truck,
    colorClass: 'text-blue-400',
    badgeBg: 'bg-blue-950/80 border-blue-800/80 text-blue-300',
    highlightCategory: 'Custody & Logistics',
    explanation: 'When a hospital or hospice calls at 2:00 AM, log the decedent, informant, and place of death in under 60 seconds. The system immediately dispatches the transport crew via cellular SMS with turn-by-turn directions.',
    statutoryProtectionOrComfort: 'Secures immediate chain-of-custody documentation and sends the family an automatic SMS arrival window and digital parking pass to 630 St. Nicholas Ave.',
    actionLabel: 'Test First Call Intake',
    actionModalKey: 'first_call',
    keyCheckpoints: [
      'Automated Twilio SMS dispatch to on-duty transport driver',
      'Chain-of-custody transfer affidavit logged',
      'Instant family welcome message with directions'
    ]
  },
  {
    id: 3,
    title: 'Form AP-47 Contract Studio & Article 34 Compliance',
    subtitle: 'Step 3 of 8: Zero-Error Itemized Statement of Goods',
    roleBadge: 'Arranging Funeral Director',
    icon: ScrollText,
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300',
    highlightCategory: 'NYS Public Health Law Article 34',
    explanation: 'Build legally binding Form AP-47 contracts with 100% mathematical accuracy. Every line item pulls from our registered General Price List (GPL), calculating sales tax and cash advances down to the exact cent.',
    statutoryProtectionOrComfort: 'Completely eliminates manual math errors, audit fines from the NYS Bureau of Funeral Directing, and FTC Funeral Rule price discrepancy penalties.',
    actionLabel: 'Open Contract Studio',
    actionModalKey: 'contract',
    keyCheckpoints: [
      '12 statutory spaces itemized per NYS standards',
      'Batesville Casket & Milso urn catalog integration',
      'Zero-markup cash advance pass-through tracking'
    ]
  },
  {
    id: 4,
    title: 'NYC DOHMH eVital / EDRS & 72-Hour Transit Permitting',
    subtitle: 'Step 4 of 8: Automated Vital Statistics Data Scrubbing',
    roleBadge: 'Vital Statistics Clerk & LFD',
    icon: Scale,
    colorClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/80 border-indigo-800/80 text-indigo-300',
    highlightCategory: 'NYC DOHMH & NYS HCS Compliance',
    explanation: 'Scrubs all 18 mandatory death certificate fields before submission. Audits decedent SSN, place of death, and Mother’s Maiden Name to prevent rejections by the City registrar.',
    statutoryProtectionOrComfort: 'Generates the official NYC 72-Hour Burial/Transit Permit payload with 1 tap, guaranteeing smooth gatehouse entry at Woodlawn, Calverton, or Pinelawn.',
    actionLabel: 'View EDRS Rapid-Fill',
    actionModalKey: 'edrs',
    keyCheckpoints: [
      'Pre-submission audit prevents spelling/vital rejections',
      'NYC Electronic Death Registration (EDRS) XML generation',
      '72-Hour burial-transit permit barcode tracking'
    ]
  },
  {
    id: 5,
    title: 'DocuSign NYS ESRA Legal Signature Envelopes',
    subtitle: 'Step 5 of 8: Remote E-Signatures with 2-Factor SMS OTP',
    roleBadge: 'Legal & Executive Desk',
    icon: ShieldCheck,
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-950/80 border-rose-800/80 text-rose-300',
    highlightCategory: 'NYS Electronic Signatures & Records Act',
    explanation: 'Dispatch all required authorizations (Form AP-47, Embalming Consent, Batesville Warranty, PHL § 4201 Affidavits) directly to the family’s smartphone. Signers authenticate via secure SMS passcode.',
    statutoryProtectionOrComfort: 'Never lose a signed paper form again. Completed documents return cryptographically sealed with tamper-evident digital certificates.',
    actionLabel: 'Inspect DocuSign Hub',
    actionModalKey: 'docusign',
    keyCheckpoints: [
      'NYS ESRA legally binding e-signature envelopes',
      'SMS OTP identity verification for next of kin',
      'Instant return and archival into case vault'
    ]
  },
  {
    id: 6,
    title: 'JPMorgan Chase Pass-Through Check Disbursement',
    subtitle: 'Step 6 of 8: 1-Tap Service Morning Honorariums',
    roleBadge: 'Licensed Funeral Director & Accounting',
    icon: Printer,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
    highlightCategory: 'Cash Advances & GL Accounting',
    explanation: 'No more frantic checkbook writing on service mornings. With 1 tap, generate pre-formatted MICR-encoded checks for Clergy ($350), Organist ($250), and NYC DOHMH certified death transcripts ($15/copy).',
    statutoryProtectionOrComfort: 'Instantly logs hand-delivery by Director Jason Benta on the sanctuary floor and synchronizes 2-way balances directly into QuickBooks Online.',
    actionLabel: 'Open Check Printer',
    actionModalKey: 'check_printer',
    keyCheckpoints: [
      'Pre-filled MICR bank checks for pass-through vendors',
      'Zero-markup FTC cash advance compliance',
      '2-way auto-reconciliation with QuickBooks Online'
    ]
  },
  {
    id: 7,
    title: 'Director Day-of-Service Mobile HUD (iPad / iPhone)',
    subtitle: 'Step 7 of 8: Live Sanctuary Control on the Floor',
    roleBadge: 'Sanctuary Director & Escort Lead',
    icon: Smartphone,
    colorClass: 'text-sky-400',
    badgeBg: 'bg-sky-950/80 border-sky-800/80 text-sky-300',
    highlightCategory: 'Live Ceremony Operations',
    explanation: 'Run the entire homegoing service from your tablet or phone. Track live milestone countdowns (prelude, solos, eulogy, recessional), monitor 4K webcast streaming, and verify white-glove pallbearers.',
    statutoryProtectionOrComfort: '1-tap cellular SMS broadcast sends cortege route sheets and gatehouse instructions to all Cadillac hearse and limousine chauffeurs simultaneously.',
    actionLabel: 'Launch Mobile HUD',
    actionModalKey: 'day_of_service_hud',
    keyCheckpoints: [
      'Real-time ceremony timer and milestone progression',
      'Pallbearer badge and white-glove coordination',
      'Cortege fleet route broadcast via Twilio SMS'
    ]
  },
  {
    id: 8,
    title: 'Kinship Guardrails & Immutable S3 Golden Vault',
    subtitle: 'Step 8 of 8: Statutory Protection & Eternal Archival',
    roleBadge: 'Director in Charge & Archivist',
    icon: Compass,
    colorClass: 'text-purple-400',
    badgeBg: 'bg-purple-950/80 border-purple-800/80 text-purple-300',
    highlightCategory: 'PHL § 4201 & Permanent Security',
    explanation: 'The Kinship Guardrail Engine cross-checks the informant against the 7 statutory tiers of NYS PHL § 4201 to prevent family disputes. All completed case assets are permanently sealed with SHA-256 cryptographic hashes.',
    statutoryProtectionOrComfort: 'Ensures our 98-year establishment permit remains bulletproof during state inspections while keeping records accessible in seconds forever.',
    actionLabel: 'View Discrepancy Engine',
    actionModalKey: 'discrepancy_guardrail',
    keyCheckpoints: [
      'NYS PHL § 4201 Right of Disposition hierarchy enforcement',
      'SHA-256 cryptographic proof of record integrity',
      'Instant retrieval across iPads, MacBooks, and PCs'
    ]
  }
];

export const FAMILY_TOUR_STEPS: TourStepItem[] = [
  {
    id: 1,
    title: 'Welcome to Your Private Family Care Portal',
    subtitle: 'Step 1 of 6: A Compassionate Sanctuary for Your Family',
    roleBadge: 'Family & Loved Ones',
    icon: Heart,
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-950/80 border-rose-800/80 text-rose-300',
    highlightCategory: 'Private Family Sanctuary',
    explanation: 'Your private, secure space to manage arrangements, celebrate memories, and collaborate with family members worldwide. Accessible anytime from your phone, tablet, or computer.',
    statutoryProtectionOrComfort: 'Complete financial transparency with zero hidden fees. Includes 1-tap confirmation of arrangement meetings with reserved parking at 630 St. Nicholas Ave.',
    keyCheckpoints: [
      '100% transparent pricing and arrangement summary',
      '1-Tap in-person meeting confirmation with directions',
      'Private access link with zero confusing passwords'
    ]
  },
  {
    id: 2,
    title: '9-Part Harlem Heritage Obituary & Story Studio',
    subtitle: 'Step 2 of 6: Guided Storytelling Without Blank-Page Anxiety',
    roleBadge: 'Next of Kin & Family Writers',
    icon: BookOpen,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
    highlightCategory: 'Cultural Remembrance',
    explanation: 'Writing an obituary during grief is difficult. Our guided 9-part assistant walks you through early years, faith journey, career, and family legacy with cultural reverence and AI assistance.',
    statutoryProtectionOrComfort: 'Relatives worldwide can record spoken audio memories from their smartphones to be preserved forever in your family’s Living Voice Archive.',
    keyCheckpoints: [
      'Guided 9-part cultural Harlem heritage structure',
      'AI writing assistant powered by OpenAI GPT-4o',
      'Audio keepsake recording studio for relatives'
    ]
  },
  {
    id: 3,
    title: 'Harlem Florist Guild & Sympathy Boutique',
    subtitle: 'Step 3 of 6: Fresh Floral Tributes & Satin Ribbon Sashes',
    roleBadge: 'Family, Church & Community',
    icon: Flower2,
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-950/80 border-rose-800/80 text-rose-300',
    highlightCategory: 'Harlem Master Florists',
    explanation: 'Browse handcrafted casket sprays, standing crosses, and comfort fruit baskets from Harlem’s master florists: Daniela’s Flower Shop (Broadway) and Barbara’s Flowers (FDB).',
    statutoryProtectionOrComfort: 'Includes customized embossed gold-letter satin ribbon sashes ("Beloved Mother", "In God’s Eternal Grace") and 1-click Stripe Card / Apple Pay checkout.',
    keyCheckpoints: [
      'Direct delivery to Chapel 1 Sanctuary or residence',
      'Custom gold-embossed ribbon banner text',
      '1-Click instant checkout with printable receipt'
    ]
  },
  {
    id: 4,
    title: 'Perpetual Memorial Candle Wall & Sacred Scripture',
    subtitle: 'Step 4 of 6: Lighting Flames of Eternal Remembrance',
    roleBadge: 'Family & Friends Worldwide',
    icon: Flame,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
    highlightCategory: 'Faith & Solace',
    explanation: 'Light a virtual memorial candle that burns perpetually in honor of your loved one. Anchor your remembrance with comforting scriptures (Psalm 23, John 14, Ecclesiastes 3).',
    statutoryProtectionOrComfort: 'Creates a beautiful, living stream of condolences and prayers that the family can read and treasure forever.',
    keyCheckpoints: [
      'Real-time memorial candle lighting counter',
      'Scripture preset selector for biblical solace',
      'Community remembrance and condolences feed'
    ]
  },
  {
    id: 5,
    title: 'Sacred Repertoire & Service Music Player',
    subtitle: 'Step 5 of 6: Curating Choral Solos & Organ Preludes',
    roleBadge: 'Family & Church Officiants',
    icon: Music,
    colorClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/80 border-indigo-800/80 text-indigo-300',
    highlightCategory: 'Sanctuary Music',
    explanation: 'Listen to and select sacred hymns for the service ("Take My Hand, Precious Lord", "Amazing Grace", "His Eye Is on the Sparrow", "Going Up Yonder").',
    statutoryProtectionOrComfort: '1-tap selection automatically places your chosen songs on the printed funeral program and director cue sheet.',
    keyCheckpoints: [
      'Historic Harlem gospel anthems and pipe organ solos',
      'Interactive music player preview',
      'Direct synchronization with printed service program'
    ]
  },
  {
    id: 6,
    title: 'Private 4K Sanctuary Livestreaming & VIP Itinerary',
    subtitle: 'Step 6 of 6: Connecting Distant Family in Real Time',
    roleBadge: 'Global Family & Attendees',
    icon: Video,
    colorClass: 'text-sky-400',
    badgeBg: 'bg-sky-950/80 border-sky-800/80 text-sky-300',
    highlightCategory: 'Broadcast & Route Timing',
    explanation: 'Family members unable to travel to New York can participate in crystal-clear 4K livestreaming from Chapel 1 Sanctuary with a private security PIN.',
    statutoryProtectionOrComfort: 'Includes the Day-of-Service VIP Itinerary with turn-by-turn routing and live cortege timing from 630 St. Nicholas Ave to Woodlawn Cemetery.',
    keyCheckpoints: [
      'Private 4K livestream with remote guestbook',
      'Turn-by-turn cortege GPS route to cemetery',
      'Permanent digital recording archive in S3 Vault'
    ]
  }
];

interface InteractiveGuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase?: GoldenRecordCase;
  initialTrack?: TourTrack;
  onLaunchToolModal?: (modalKey: string) => void;
}

export const InteractiveGuidedTourModal: React.FC<InteractiveGuidedTourModalProps> = ({
  isOpen,
  onClose,
  initialTrack = 'director',
  onLaunchToolModal
}) => {
  const [activeTrack, setActiveTrack] = useState<TourTrack>(initialTrack);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [completedStepIds, setCompletedStepIds] = useState<number[]>([]);
  const [toastAlert, setToastAlert] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSteps = activeTrack === 'director' ? DIRECTOR_TOUR_STEPS : FAMILY_TOUR_STEPS;
  const currentStep = currentSteps[currentStepIdx] || currentSteps[0];
  const StepIcon = currentStep.icon;

  const showToast = (msg: string) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 3500);
  };

  const handleNext = () => {
    if (!completedStepIds.includes(currentStep.id)) {
      setCompletedStepIds(prev => [...prev, currentStep.id]);
    }
    if (currentStepIdx < currentSteps.length - 1) {
      setCurrentStepIdx(idx => idx + 1);
    } else {
      showToast('🎉 You completed the full tour! All systems verified.');
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(idx => idx - 1);
    }
  };

  const handleSwitchTrack = (track: TourTrack) => {
    setActiveTrack(track);
    setCurrentStepIdx(0);
    setCompletedStepIds([]);
  };

  const handleActionClick = () => {
    if (currentStep.actionModalKey && onLaunchToolModal) {
      onLaunchToolModal(currentStep.actionModalKey);
      onClose();
    } else {
      showToast(`Launching ${currentStep.title}...`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-900/60 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-stone-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-amber-100">
                  Benta's Interactive System Mastery & Guided Tour
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  EST. 1928 • HARLEM
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Zero-Gap Safety Architecture & Step-by-Step Operational Blueprint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Track Switcher */}
            <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                onClick={() => handleSwitchTrack('director')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTrack === 'director'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Director Tour
              </button>
              <button
                onClick={() => handleSwitchTrack('family')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTrack === 'family'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5" /> Family Tour
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800/60 hover:bg-stone-800 transition"
              title="Close Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastAlert && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-200 px-6 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastAlert}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-stone-950 h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / currentSteps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicator Pills */}
        <div className="px-6 pt-4 flex items-center justify-between overflow-x-auto gap-2 border-b border-stone-800/60 pb-3">
          {currentSteps.map((step, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isCompleted = completedStepIds.includes(step.id) || idx < currentStepIdx;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStepIdx(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition border ${
                  isCurrent 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-sm'
                    : isCompleted
                      ? 'bg-stone-950/80 border-emerald-800/50 text-emerald-300'
                      : 'bg-stone-950/40 border-stone-800/80 text-stone-500 hover:text-stone-300'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent 
                    ? 'bg-amber-500 text-stone-950' 
                    : isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-stone-800 text-stone-400'
                }`}>
                  {isCompleted ? '✓' : step.id}
                </span>
                <span className="hidden sm:inline">{step.title.split(' ')[0]} {step.title.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Spotlight Hero Card */}
          <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 shadow-lg ${currentStep.colorClass}`}>
                  <StepIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentStep.badgeBg}`}>
                      {currentStep.roleBadge}
                    </span>
                    <span className="text-[11px] text-amber-400 font-mono font-semibold">
                      {currentStep.subtitle}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                    {currentStep.title}
                  </h3>
                  <span className="text-xs text-stone-400 font-medium block">
                    Domain: <strong className="text-stone-200">{currentStep.highlightCategory}</strong>
                  </span>
                </div>
              </div>

              {currentStep.actionLabel && (
                <button
                  onClick={handleActionClick}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg transition shrink-0 self-start"
                >
                  <Zap className="w-4 h-4 fill-stone-950" /> {currentStep.actionLabel}
                </button>
              )}
            </div>

            {/* Explanation */}
            <div className="mt-5 pt-4 border-t border-stone-800/80 space-y-4 text-xs sm:text-sm leading-relaxed text-stone-300">
              <p className="font-light">
                {currentStep.explanation}
              </p>

              {/* Protective Shield Callout */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 mb-0.5 uppercase tracking-wider text-[10px]">
                    Why This Protects the Director & Family:
                  </strong>
                  <span>{currentStep.statutoryProtectionOrComfort}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Key Safeguards & Checkpoints */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-stone-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Standard Operating Checkpoints Verified by System:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentStep.keyCheckpoints.map((chk, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs text-stone-300 flex items-start gap-2.5"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    ✓
                  </span>
                  <span>{chk}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Step {currentStepIdx + 1} of {currentSteps.length} • Benta Operating Standard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold transition disabled:opacity-30 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentStepIdx < currentSteps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition shadow flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  showToast('🎉 Tutorial completed! You are fully prepared to operate the system.');
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold transition shadow flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Complete Tour
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
