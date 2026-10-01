import React, { useState } from 'react';
import { 
  GoldenRecordCase, 
  FamilyProofApprovalRecord, 
  SimulatedNotification 
} from '../../lib/types/funeral';
import { 
  getInitialProofApproval 
} from '../../lib/data/familyProofHelper';
import { 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Printer, 
  X, 
  ShieldCheck, 
  Sparkles, 
  QrCode 
} from 'lucide-react';

interface FamilyProofApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  onUpdateCase: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  isFamilyView?: boolean;
}

export const FamilyProofApprovalModal: React.FC<FamilyProofApprovalModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onUpdateCase,
  onSendNotification,
  isFamilyView = false
}) => {
  const [proofRecord, setProofRecord] = useState<FamilyProofApprovalRecord>(() => {
    return caseData.proofApproval || getInitialProofApproval(caseData);
  });

  const [previewDocType, setPreviewDocType] = useState<'program' | 'keepsake_volume'>('program');
  const [spellingsChecked, setSpellingsChecked] = useState(proofRecord.spellingsVerified);
  const [photosChecked, setPhotosChecked] = useState(proofRecord.photosApproved);
  const [legalLockChecked, setLegalLockChecked] = useState(proofRecord.legalPrintLockAcknowledged);
  const [signatureName, setSignatureName] = useState(proofRecord.signatoryFullName || caseData.informant.fullName);
  const [signatureRelation, setSignatureRelation] = useState(proofRecord.signatoryRelationship || caseData.informant.relationship);
  const [programQty, setProgramQty] = useState(proofRecord.pressOrderQuantity.memorialPrograms || 250);
  const [keepsakeQty, setKeepsakeQty] = useState(proofRecord.pressOrderQuantity.keepsakeVolumes || 25);
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLocked = proofRecord.status === 'family_approved_locked';
  const allCheckboxesPassed = spellingsChecked && photosChecked && legalLockChecked && signatureName.trim() !== '';

  const handleExecuteApprovalAndLock = () => {
    if (!allCheckboxesPassed) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();
    const directorName = caseData.assignedDirector || 'Jason Benta (LFD #08850)';

    const updatedProof: FamilyProofApprovalRecord = {
      ...proofRecord,
      status: 'family_approved_locked',
      programApproved: true,
      keepsakeBookApproved: true,
      spellingsVerified: true,
      photosApproved: true,
      legalPrintLockAcknowledged: true,
      signatoryFullName: signatureName.trim(),
      signatoryRelationship: signatureRelation.trim(),
      signatoryEmail: caseData.informant.email,
      signedAt: timeNow,
      ipAddressHash: `NYC-IP-${Math.floor(Math.random() * 89999 + 10000)}`,
      lockedByDirector: directorName,
      lockedAt: timeNow,
      pressVendorDispatched: true,
      pressVendorDispatchedAt: timeNow,
      pressOrderQuantity: {
        memorialPrograms: programQty,
        keepsakeVolumes: keepsakeQty
      },
      pressJobTicketNumber: `PRESS-${caseData.caseNumber}-NYC`
    };

    setProofRecord(updatedProof);

    const updatedCase: GoldenRecordCase = {
      ...caseData,
      proofApproval: updatedProof,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Family Proof Approval Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `FAMILY PROOF APPROVED & PRINT-LOCKED by ${signatureName} (${signatureRelation}). Press Order Ticket #${updatedProof.pressJobTicketNumber} dispatched to Harlem Heritage Press (${programQty} Programs, ${keepsakeQty} Keepsake Volumes).`
        },
        ...caseData.notes
      ]
    };

    onUpdateCase(updatedCase);

    if (onSendNotification) {
      onSendNotification({
        id: `notif-proof-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: signatureName,
        recipientPhone: caseData.informant.phone,
        recipientEmail: caseData.informant.email,
        channel: 'sms',
        type: 'portal_update',
        title: '🖨️ Memorial Proof Approved & Print-Locked',
        bodyText: `Dear ${signatureName}, thank you for approving the memorial proofs for ${caseData.decedent.legalName}. Your order (${programQty} Memorial Programs & ${keepsakeQty} Keepsake Volumes) has been transmitted to our commercial press.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    setApprovalToast(`🎉 Proofs Approved! Print-Lock active. Job ticket dispatched to Harlem Heritage Press.`);
  };

  const handleUnlockForCorrection = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedProof: FamilyProofApprovalRecord = {
      ...proofRecord,
      status: 'reopened_for_correction',
      programApproved: false,
      keepsakeBookApproved: false,
      legalPrintLockAcknowledged: false
    };

    setProofRecord(updatedProof);
    setLegalLockChecked(false);

    const updatedCase: GoldenRecordCase = {
      ...caseData,
      proofApproval: updatedProof,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Managing LFD (Proof Unlock)',
          timestamp: timeNow,
          text: `Print-Lock reopened for minor family text corrections. Press hold placed.`
        },
        ...caseData.notes
      ]
    };

    onUpdateCase(updatedCase);
    setApprovalToast('Layout unlocked for edits. Remember to re-approve before commercial press run.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white text-neutral-900 w-full max-w-6xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[94vh]">

        {/* TOP MODAL HEADER */}
        <div className="bg-gradient-to-r from-neutral-900 via-[#991b1b] to-neutral-900 text-white p-5 px-6 flex items-center justify-between border-b border-red-800/40 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-2xl border ${
              isLocked 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {isLocked ? <Lock className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-widest font-mono text-amber-300 font-bold">
                  Publication Gatekeeper & Press Lock
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isLocked ? 'bg-emerald-500 text-neutral-950' : 'bg-amber-400 text-neutral-950'
                }`}>
                  {isLocked ? '🔒 COMMERCIAL PRINT LOCKED' : '📝 PROOF REVIEW IN PROGRESS'}
                </span>
              </div>
              <h2 className="text-xl font-serif-title font-bold text-white tracking-wide">
                Family Proof Approval & Commercial Press Lock
              </h2>
              <p className="text-xs text-neutral-300 font-light">
                Case #{caseData.caseNumber} • {caseData.decedent.legalName} • Informant: {caseData.informant.fullName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOAST ALERT */}
        {approvalToast && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{approvalToast}</span>
            </div>
            <button onClick={() => setApprovalToast(null)} className="text-emerald-200 hover:text-white">✕</button>
          </div>
        )}

        {/* MODAL BODY (SPLIT VIEW: PROOF PREVIEW + SIGN-OFF PANEL) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#faf7f2]">

          {/* LEFT: HIGH-FIDELITY SIDE-BY-SIDE PROOF PREVIEW (7 COLUMNS) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Document Selector Pills */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex space-x-1">
                <button
                  onClick={() => setPreviewDocType('program')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    previewDocType === 'program'
                      ? 'bg-[#991b1b] text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>4-Panel Memorial Bulletin (8-Page)</span>
                </button>

                <button
                  onClick={() => setPreviewDocType('keepsake_volume')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    previewDocType === 'keepsake_volume'
                      ? 'bg-[#b45309] text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Digi-Tribute Keepsake Volume (16-Page)</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                CMYK Print High-Res
              </span>
            </div>

            {/* Document Visual Render Canvas */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-md space-y-6 text-center">
              
              {previewDocType === 'program' ? (
                <div className="space-y-4">
                  <div className="w-24 h-24 rounded-full mx-auto p-1 border-2 border-amber-400/80 bg-neutral-100 overflow-hidden shadow-md">
                    <img
                      src={caseData.funeralAnnouncement?.portraitUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80"}
                      alt={caseData.decedent.legalName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#b45309] font-bold block">
                      In Loving Memory & Celebration of Life
                    </span>
                    <h3 className="font-serif-title text-2xl font-bold text-neutral-900 mt-1">
                      {caseData.decedent.legalName}
                    </h3>
                    <p className="text-xs text-neutral-600 font-mono mt-0.5">
                      {caseData.decedent.dateOfBirth || 'August 14, 1944'} — {caseData.decedent.dateOfDeath || 'September 17, 2026'}
                    </p>
                  </div>

                  <div className="border-t border-b border-amber-200/60 py-3 text-xs text-neutral-700 space-y-1">
                    <p className="font-bold">{caseData.serviceSelections.serviceDate || 'Tuesday, September 22, 2026'} • 11:00 AM</p>
                    <p className="text-neutral-600">{caseData.serviceSelections.viewingParlor || "Benta's Funeral Home Chapel • 630 St. Nicholas Ave, Harlem"}</p>
                    <p className="text-[11px] text-[#991b1b] font-medium">{caseData.serviceSelections.officiantName || 'Rev. Dr. Calvin Butts IV, Officiating'}</p>
                  </div>

                  <div className="text-left bg-[#fbfbfd] p-4 rounded-2xl border border-neutral-200 text-xs space-y-2">
                    <h4 className="font-bold text-neutral-900 font-serif-title border-b pb-1">
                      Order of Service Highlights:
                    </h4>
                    <p className="text-neutral-600 font-light text-[11px] leading-relaxed">
                      Musical Prelude • Processional • Scripture Readings (Psalm 23 & John 14) • Prayer of Comfort • Musical Solo • Reflections • Digi-Tribute 2.0 Keepsake Presentation • Eulogy • Recessional.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#141b2b] text-white rounded-2xl border border-amber-400/40 text-center space-y-2">
                    <span className="text-[10px] text-amber-300 font-mono uppercase tracking-widest font-bold block">
                      Museum-Grade Hardbound Gold-Foil Keepsake
                    </span>
                    <h3 className="font-serif-title text-xl font-bold text-amber-100">
                      The Life, Reflections & Living Voices of {caseData.decedent.legalName}
                    </h3>
                    <p className="text-xs text-neutral-300 font-light">
                      Compiled with 78 Relationship Inquiries, AI Memorial Poetic Stanzas, and 360° Living Audio QR Pills.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 bg-white rounded-xl border border-neutral-200 text-xs space-y-1">
                      <span className="text-[10px] text-[#b45309] font-bold block uppercase">Poetic Memory Spread:</span>
                      <p className="italic text-neutral-700 font-serif text-[11px]">
                        "Her laughter danced on Harlem nights,<br/>
                        A beacon of enduring grace,<br/>
                        Her wisdom shaped our guiding lights,<br/>
                        Forever in our sacred space."
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1 text-center flex flex-col items-center justify-center">
                      <QrCode className="w-8 h-8 text-[#991b1b]" />
                      <span className="text-[10px] font-mono text-neutral-600 font-bold block">
                        Scan-to-Stream Audio QR Pills
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        Permanent Master Storage
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: LEGAL VERIFICATION & COMMERCIAL PRESS SIGN-OFF (5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
              
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="font-serif-title font-bold text-base text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>3-Point Legal Sign-Off Gate</span>
                </h3>
                <p className="text-xs text-neutral-600 font-light mt-0.5">
                  Confirm the following statutory checks prior to commercial press plate engraving.
                </p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                
                <label className="flex items-start space-x-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer hover:bg-neutral-50 transition">
                  <input
                    type="checkbox"
                    checked={spellingsChecked}
                    disabled={isLocked}
                    onChange={(e) => setSpellingsChecked(e.target.checked)}
                    className="mt-0.5 rounded text-[#991b1b] focus:ring-red-500 h-4 w-4 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 block">1. Spelling & Chronological Dates Verified</span>
                    <span className="text-neutral-600 font-light text-[11px]">
                      Full legal name, birth/passing dates, surviving kin, and clergy titles are accurately spelled.
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer hover:bg-neutral-50 transition">
                  <input
                    type="checkbox"
                    checked={photosChecked}
                    disabled={isLocked}
                    onChange={(e) => setPhotosChecked(e.target.checked)}
                    className="mt-0.5 rounded text-[#991b1b] focus:ring-red-500 h-4 w-4 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 block">2. Archival Photos & Digi-Tributes Approved</span>
                    <span className="text-neutral-600 font-light text-[11px]">
                      Cover portrait, photographic layout, AI poetic stanzas, and QR audio links verified.
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 rounded-xl border border-amber-300 bg-amber-50/60 cursor-pointer hover:bg-amber-50 transition">
                  <input
                    type="checkbox"
                    checked={legalLockChecked}
                    disabled={isLocked}
                    onChange={(e) => setLegalLockChecked(e.target.checked)}
                    className="mt-0.5 rounded text-[#991b1b] focus:ring-red-500 h-4 w-4 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 block">3. Commercial Press Lock Acknowledgment</span>
                    <span className="text-amber-900 font-light text-[11px]">
                      I understand submitting this approval locks the design for commercial press printing.
                    </span>
                  </div>
                </label>

              </div>

              {/* Press Quantity Inputs */}
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Memorial Programs:</label>
                  <input
                    type="number"
                    disabled={isLocked}
                    value={programQty}
                    onChange={(e) => setProgramQty(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2 font-mono font-bold text-xs outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Keepsake Volumes:</label>
                  <input
                    type="number"
                    disabled={isLocked}
                    value={keepsakeQty}
                    onChange={(e) => setKeepsakeQty(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2 font-mono font-bold text-xs outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>

              {/* Signatory Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Authorizing Informant Full Name:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Relationship to Decedent:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={signatureRelation}
                    onChange={(e) => setSignatureRelation(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>

              {/* Locked / Sign-off Button State */}
              {isLocked ? (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 space-y-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>PRINT-LOCKED & DISPATCHED TO PRESS</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    Signed by: {proofRecord.signatoryFullName} ({proofRecord.signedAt})<br/>
                    Ticket: {proofRecord.pressJobTicketNumber}
                  </p>

                  <div className="flex justify-center space-x-2 pt-1">
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print PDF</span>
                    </button>

                    {!isFamilyView && (
                      <button
                        onClick={handleUnlockForCorrection}
                        className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 font-bold text-xs rounded-xl transition flex items-center space-x-1"
                      >
                        <Unlock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Director Unlock</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleExecuteApprovalAndLock}
                  disabled={!allCheckboxesPassed}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition shadow-md flex items-center justify-center space-x-2 ${
                    allCheckboxesPassed
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-[#991b1b] hover:brightness-110 text-white border border-amber-300/40 cursor-pointer'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-200" />
                  <span>Sign Proof & Lock for Commercial Press</span>
                </button>
              )}

            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white border-t border-neutral-200 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <Printer className="w-4 h-4 text-neutral-400" />
            <span>Commercial Press Partner: Harlem Heritage Press & Graphics (125th St Guild)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            Close Proof Studio
          </button>
        </div>

      </div>
    </div>
  );
};
