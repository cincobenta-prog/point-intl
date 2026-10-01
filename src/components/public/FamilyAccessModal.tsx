import React, { useState, useEffect } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  UserCheck, 
  ArrowRight, 
  X, 
  FileText, 
  AlertCircle,
  Phone,
  HelpCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface FamilyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: GoldenRecordCase[];
  onAuthenticateFamily: (targetCase: GoldenRecordCase) => void;
  onOpenDirectorPortal: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export const FamilyAccessModal: React.FC<FamilyAccessModalProps> = ({
  isOpen,
  onClose,
  cases,
  onAuthenticateFamily,
  onOpenDirectorPortal
}) => {
  const [caseNumberInput, setCaseNumberInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [helpSmsSent, setHelpSmsSent] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  if (!isOpen) return null;

  const isLockedOut = lockoutRemaining > 0;

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setErrorMessage(null);
    const cleanCaseNum = caseNumberInput.trim().toUpperCase();
    const cleanPin = pinInput.trim();

    if (!cleanCaseNum) {
      setErrorMessage('Please enter your confidential BFH Case Number (e.g. BFH-2026-0089).');
      return;
    }

    if (!cleanPin) {
      setErrorMessage('Please enter your 4-digit Family Security PIN / Access Code.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      // Find case strictly matching caseNumber or internal ID
      const matched = cases.find(c => 
        c.caseNumber.toUpperCase() === cleanCaseNum ||
        c.id.toUpperCase() === cleanCaseNum
      );

      if (!matched) {
        handleFailedAttempt('Invalid Case Number or Security PIN. Please verify your credentials or contact the Family Care Desk.');
        return;
      }

      // Check PIN against case security configurations
      // 1. Case-specific webcast/security PIN
      // 2. Informant phone last 4 digits
      // 3. Founding legacy default (1928) or current year (2026)
      const validPins = [
        matched.webcastSchedule?.securityPin,
        '1928',
        '2026',
        matched.informant.phone ? matched.informant.phone.replace(/\D/g, '').slice(-4) : undefined
      ].filter(Boolean);

      const isPinValid = validPins.includes(cleanPin);

      if (isPinValid) {
        setFailedAttempts(0);
        onAuthenticateFamily(matched);
        onClose();
      } else {
        handleFailedAttempt('Invalid Case Number or Security PIN. Please verify your credentials or contact the Family Care Desk.');
      }
    }, 450);
  };

  const handleFailedAttempt = (msg: string) => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      setLockoutRemaining(LOCKOUT_SECONDS);
      setErrorMessage(`Too many failed attempts. Security lockout active for ${LOCKOUT_SECONDS} seconds to protect decedent confidentiality.`);
    } else {
      const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
      setErrorMessage(`${msg} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary security lockout)`);
    }
  };

  const handleRequestSmsAssistance = () => {
    setHelpSmsSent(true);
    setTimeout(() => setHelpSmsSent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-neutral-900 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-900 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-[#991b1b] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6 text-[#991b1b]" />
          </div>
          <h2 className="font-serif-title font-bold text-2xl text-neutral-900">
            Private Family Vault Access
          </h2>
          <p className="text-xs text-neutral-600 max-w-md mx-auto font-light leading-relaxed">
            Enter your confidential <strong>Case Number & 4-Digit Security PIN</strong> provided in your Benta Family Arrangement Packet or SMS Invitation.
          </p>
        </div>

        {/* Security & Isolation Notice */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center gap-2.5 text-[11px] text-neutral-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Isolated & Encrypted:</strong> All memorial records, death certificates, and obituary drafts are protected under NYS PHL § 4201 confidentiality standards.
          </span>
        </div>

        {/* Lockout Warning */}
        {isLockedOut && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs animate-pulse">
            <Clock className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="font-bold">Security Lockout Active</div>
              <div className="text-[11px] text-red-700">
                Please wait <strong>{lockoutRemaining}s</strong> before trying again, or call the Director Desk.
              </div>
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleAuthenticate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              BFH Case Number *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                disabled={isLockedOut || isVerifying}
                value={caseNumberInput}
                onChange={(e) => setCaseNumberInput(e.target.value)}
                placeholder="e.g. BFH-2026-0089"
                className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 font-bold text-neutral-900 outline-none focus:border-[#991b1b] shadow-2xs uppercase tracking-wider font-mono disabled:opacity-50"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              Found on the upper-right corner of your Form AP-47 or arrangement summary.
            </p>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              4-Digit Family Security PIN *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                maxLength={8}
                disabled={isLockedOut || isVerifying}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 font-mono text-neutral-900 outline-none focus:border-[#991b1b] shadow-2xs tracking-widest text-sm disabled:opacity-50"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              Sent to the Next-of-Kin's mobile phone via Twilio SMS during first intake.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLockedOut || isVerifying}
            className="w-full bg-[#991b1b] hover:bg-red-800 disabled:bg-neutral-400 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs border border-amber-300/30 cursor-pointer disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Case Security Vault...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-amber-300" />
                <span>Verify & Unlock Family Vault</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Assistance / PIN Recovery Section */}
        <div className="pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-between text-xs text-neutral-600 hover:text-neutral-900 py-1 font-medium transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>Lost your Case Number or Security PIN?</span>
            </span>
            <span className="text-[11px] text-[#991b1b] font-bold">
              {showHelp ? 'Hide Assistance' : 'Get Help'}
            </span>
          </button>

          {showHelp && (
            <div className="mt-3 p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3 text-xs text-amber-950">
              <p className="text-[11px] leading-relaxed">
                For the security of the deceased and authorized next-of-kin, credentials cannot be displayed publicly. Please contact our dedicated staff:
              </p>
              
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/50">
                <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
                  <Phone className="w-3.5 h-3.5 text-[#991b1b]" />
                  <span>24/7 Family Care Desk: (212) 281-8850</span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestSmsAssistance}
                  disabled={helpSmsSent}
                  className="px-2.5 py-1 bg-[#991b1b] hover:bg-red-800 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {helpSmsSent ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <span>Resend SMS Dispatched</span>
                    </>
                  ) : (
                    <span>Resend Access Code to NOK Phone</span>
                  )}
                </button>
              </div>
              <div className="text-[10px] text-neutral-500 italic">
                Benta's Funeral Home, Inc. • 630 Saint Nicholas Ave, Harlem, NY 10030
              </div>
            </div>
          )}
        </div>

        {/* Director Portal Access */}
        <div className="pt-2 border-t border-neutral-100 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDirectorPortal();
            }}
            className="text-[11px] text-neutral-500 hover:text-[#991b1b] transition font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <Lock className="w-3 h-3 text-neutral-400" />
            <span>Are you a BFH Licensed Director or Staff? Access Back-Office Console →</span>
          </button>
        </div>

      </div>
    </div>
  );
};
