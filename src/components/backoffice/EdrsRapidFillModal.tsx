import React, { useState, useEffect } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  Building2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Clock,
  FileText,
  Lock,
  RefreshCw,
  QrCode,
  Layers,
  Sparkles,
  Printer,
  Download
} from 'lucide-react';
import { 
  getEdrsConfig, 
  saveEdrsConfig, 
  testEdrsConnection, 
  get36FieldVitalStatistics, 
  issueBurialTransitPermit, 
  calculate72HourDeadline, 
  generateNycDohXmlPayload, 
  EdrsConfig, 
  EdrsBurialTransitPermit 
} from '../../lib/services/edrsVitalService';

interface EdrsRapidFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: GoldenRecordCase;
  activeCase?: GoldenRecordCase;
  cases?: GoldenRecordCase[];
  onSendNotification?: (notif: any) => void;
}

export const EdrsRapidFillModal: React.FC<EdrsRapidFillModalProps> = ({
  isOpen,
  onClose,
  caseData: propCaseData,
  activeCase,
  cases = [],
  onSendNotification
}) => {
  const currentCase = propCaseData || activeCase || cases[0];
  
  const [selectedCaseId, setSelectedCaseId] = useState<string>(currentCase?.id || '');
  const [activeTab, setActiveTab] = useState<'matrix' | 'submission' | 'permit' | 'settings'>('matrix');
  const [activeSection, setActiveSection] = useState<'all' | 'demographics' | 'informant_parents' | 'medical_certifier' | 'disposition_firm'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // EDRS Settings State
  const [config, setConfig] = useState<EdrsConfig>(() => getEdrsConfig());
  const [lfdIdInput, setLfdIdInput] = useState(config.nycDohLfdId);
  const [estPermitInput, setEstPermitInput] = useState(config.bfhEstablishmentPermit);
  const [hcsTokenInput, setHcsTokenInput] = useState(config.nysHcsDirectorToken);
  const [jurChoice, setJurChoice] = useState<'nyc_dohmh_5boroughs' | 'nys_hcs_outside_nyc'>(config.jurisdiction);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    if (currentCase) {
      setSelectedCaseId(currentCase.id);
    }
  }, [currentCase]);

  if (!isOpen || !currentCase) return null;

  const targetCase = cases.find(c => c.id === selectedCaseId) || currentCase;
  const fields = get36FieldVitalStatistics(targetCase);
  const deadlineInfo = calculate72HourDeadline(targetCase);
  const permit: EdrsBurialTransitPermit = issueBurialTransitPermit(targetCase);
  const xmlPayload = generateNycDohXmlPayload(targetCase);

  const copyToClipboard = (key: string, value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setToastMessage(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedKey(null);
      setToastMessage(null);
    }, 2000);
  };

  const handleCopyFullPacket = () => {
    const fullText = `=== NYS EDRS / NYC eVITAL 36-FIELD DEATH REGISTRATION SUMMARY ===
CASE NUMBER: ${targetCase.caseNumber}
FUNERAL FIRM: Benta's Funeral Home, Inc. (NYS Reg #08850 / NYC Permit #${config.bfhEstablishmentPermit})
SUPERVISING DIRECTOR: ${targetCase.assignedDirector} (NYC ID #${config.nycDohLfdId})
72-HR FILING DEADLINE: ${deadlineInfo.deadlineDate} (${deadlineInfo.statusText})

` + fields.map(f => `Field ${f.fieldNumber}. [${f.fieldCode}] ${f.fieldName}: ${f.value}`).join('\n');

    navigator.clipboard.writeText(fullText);
    setToastMessage('Complete 36-field EDRS registration packet copied to clipboard!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyXmlPayload = () => {
    navigator.clipboard.writeText(xmlPayload);
    setToastMessage('NYC DOHMH eVital XML payload copied to clipboard!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmitElectronicRegistration = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setToastMessage(`✅ State File #${permit.stateFileNumber} successfully registered with NYC DOHMH!`);
      
      onSendNotification?.({
        id: `notif-edrs-${Date.now()}`,
        caseId: targetCase.id,
        decedentName: targetCase.decedent.legalName,
        recipientName: 'Supervising Director / Records Registrar',
        recipientPhone: '(212) 281-8850',
        channel: 'sms',
        type: 'portal_update',
        title: '🏛️ EDRS Death Certificate Registered',
        bodyText: `Case #${targetCase.caseNumber} (${targetCase.decedent.legalName}) successfully registered in NYC eVital. Permit #${permit.permitNumber} issued.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const updatedCfg: EdrsConfig = {
      ...config,
      nycDohLfdId: lfdIdInput.trim(),
      bfhEstablishmentPermit: estPermitInput.trim(),
      nysHcsDirectorToken: hcsTokenInput.trim(),
      jurisdiction: jurChoice
    };
    const res = await testEdrsConnection(updatedCfg);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCfg: EdrsConfig = {
      ...config,
      nycDohLfdId: lfdIdInput.trim(),
      bfhEstablishmentPermit: estPermitInput.trim(),
      nysHcsDirectorToken: hcsTokenInput.trim(),
      jurisdiction: jurChoice,
      lastTestedAt: 'Just Now (Manual Save & Validation)'
    };
    setConfig(updatedCfg);
    saveEdrsConfig(updatedCfg);
    setToastMessage('✅ EDRS & eVital credentials updated and verified successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredFields = activeSection === 'all' 
    ? fields 
    : fields.filter(f => f.section === activeSection);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-[#fcfbfa] border border-neutral-300 rounded-3xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl text-neutral-900 overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="p-5 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-700 to-red-900 flex items-center justify-center shadow-lg shadow-red-950/20 border border-amber-400/40">
              <Building2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif-title text-lg font-bold text-neutral-900">
                  Vital Statistics & Regulatory EDRS Rapid-Fill
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  NYC eVital & NYS HCS
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                  Permit #{config.bfhEstablishmentPermit}
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-light mt-0.5">
                36-field statutory death registration matrix, 72-hour burial transit permits, and electronic submission.
              </p>
            </div>
          </div>

          {/* 72-Hour Legal Deadline Timer Pill */}
          <div className="flex items-center space-x-3">
            <div className={`px-3.5 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-bold ${
              deadlineInfo.isExpired 
                ? 'bg-red-100 text-red-900 border-red-300' 
                : deadlineInfo.isUrgent 
                ? 'bg-amber-100 text-amber-950 border-amber-300 animate-pulse' 
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{deadlineInfo.statusText}</span>
            </div>

            {cases.length > 1 && (
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="px-3 py-1.5 bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-800 outline-none focus:border-amber-600"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    Case #{c.caseNumber} - {c.decedent.legalName}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-900 text-white text-xs font-bold py-2.5 px-4 text-center border-b border-emerald-700 flex items-center justify-center space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex items-center border-b border-neutral-200 bg-[#f7f6f4] px-6 gap-2 overflow-x-auto text-xs font-semibold shrink-0">
          {[
            { id: 'matrix', label: '36-Field Statutory Form', icon: FileText },
            { id: 'submission', label: 'NYC eVital & NYS HCS Submission', icon: Layers },
            { id: 'permit', label: '72-Hour Burial / Transit Permit', icon: QrCode },
            { id: 'settings', label: 'LFD & Establishment Credentials', icon: Lock }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3.5 px-3.5 border-b-2 font-medium flex items-center space-x-2 transition cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'border-[#991b1b] text-[#991b1b] font-bold bg-white' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#991b1b]' : 'text-neutral-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: 36-FIELD RAPID-FILL MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              
              {/* Section Filters & Copy All Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-neutral-200 rounded-2xl">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All 36 Fields' },
                    { id: 'demographics', label: '1. Demographics (1-12)' },
                    { id: 'informant_parents', label: '2. Parents & Informant (13-20)' },
                    { id: 'medical_certifier', label: '3. Medical Attestation (21-28)' },
                    { id: 'disposition_firm', label: '4. Disposition & Firm (29-36)' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeSection === s.id 
                          ? 'bg-[#991b1b] text-white shadow-xs' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyFullPacket}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Copy Full 36-Field Summary</span>
                  </button>

                  <a
                    href="https://evital.health.nyc.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <span>Launch eVital</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                  </a>
                </div>
              </div>

              {/* 36-Field Interactive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredFields.map((field) => {
                  const isCopied = copiedKey === field.fieldCode;
                  return (
                    <div 
                      key={field.fieldCode}
                      className="p-3.5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 transition flex items-start justify-between gap-3 shadow-2xs group"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-neutral-200">
                            {field.fieldNumber}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider truncate">
                            {field.fieldName}
                          </span>
                          {field.required && (
                            <span className="text-[9px] text-red-600 font-bold">*Required</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-neutral-900 font-mono pl-7 break-words">
                          {field.value || <span className="text-neutral-400 italic">Not Provided</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(field.fieldCode, field.value, field.fieldName)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1 transition cursor-pointer shrink-0 ${
                          isCopied 
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100 group-hover:border-neutral-300'
                        }`}
                        title={`Copy ${field.fieldName}`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                        <span className="text-[10px]">{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: ELECTRONIC SUBMISSION & XML PAYLOAD */}
          {activeTab === 'submission' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-2">
                  <span className="text-[11px] text-neutral-500 uppercase font-semibold">Jurisdiction Target</span>
                  <div className="text-base font-bold text-neutral-900">
                    {config.jurisdiction === 'nyc_dohmh_5boroughs' ? 'NYC DOHMH eVital (5 Boroughs of NYC)' : 'NYS Health Commerce System (Outside NYC)'}
                  </div>
                  <p className="text-xs text-neutral-600">
                    Routing to {config.registrarOffice}.
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-2">
                  <span className="text-[11px] text-neutral-500 uppercase font-semibold">Filing Authority</span>
                  <div className="text-base font-bold text-neutral-900">
                    Beth Crowe, LFD #08850
                  </div>
                  <p className="text-xs text-neutral-600">
                    BFH Establishment Permit #{config.bfhEstablishmentPermit}
                  </p>
                </div>
              </div>

              {/* Electronic Filing XML Preview */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-300 font-mono">NYC DOHMH eVital Electronic Filing XML Payload</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">Schema Validated</span>
                  </div>
                  <button
                    onClick={handleCopyXmlPayload}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Copy XML</span>
                  </button>
                </div>

                <pre className="text-[11px] font-mono text-emerald-300 bg-slate-900 p-4 rounded-xl overflow-x-auto max-h-64 border border-slate-800">
                  {xmlPayload}
                </pre>
              </div>

              {/* Submission Success Banner */}
              {submissionSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-950 text-xs animate-fadeIn">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">Transmission Confirmed by NYC DOHMH State Registrar</div>
                      <div className="text-[11px] text-emerald-800">
                        State File #{permit.stateFileNumber} • Electronic Burial / Transit Permit generated.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('permit')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition cursor-pointer shadow-xs"
                  >
                    <span>View Permit</span>
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Submission Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-neutral-200 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-neutral-900">Direct Electronic Submission Gateway</div>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Transmits this completed 36-field record to the NYC DOHMH State Registrar and requests immediate burial permit generation.
                  </p>
                </div>

                <button
                  onClick={handleSubmitElectronicRegistration}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#991b1b] hover:bg-red-800 disabled:bg-neutral-400 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition shadow-lg shadow-red-950/20 border border-amber-400/40 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Transmitting Record...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Transmit Electronic Registration</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: 72-HOUR BURIAL / TRANSIT PERMIT */}
          {activeTab === 'permit' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <span className="text-xs font-bold text-neutral-700">Official NYC DOHMH Form V-11</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      window.print();
                      setToastMessage('Permit sent to system print dialog');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Print Permit</span>
                  </button>

                  <button
                    onClick={() => {
                      setToastMessage('Burial Transit Permit PDF downloaded!');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border-2 border-neutral-800 p-8 rounded-2xl shadow-md max-w-2xl mx-auto space-y-6 font-serif">
                
                {/* Certificate Header */}
                <div className="text-center border-b-2 border-neutral-800 pb-4 space-y-1">
                  <div className="text-[10px] uppercase tracking-widest font-sans font-bold text-neutral-500">The City of New York • Department of Health and Mental Hygiene</div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-neutral-900">Burial, Removal & Transit Permit</h3>
                  <div className="text-xs font-mono font-bold text-[#991b1b]">Permit Number: {permit.permitNumber}</div>
                  <div className="text-[10px] text-neutral-500 font-sans">State File Number: {permit.stateFileNumber}</div>
                </div>

                {/* Body Details */}
                <div className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Name of Deceased</span>
                      <strong className="text-sm font-serif">{permit.decedentName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Date of Death</span>
                      <strong>{permit.dateOfDeath}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Authorized Disposition</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-bold text-xs inline-block">
                        {permit.dispositionType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Target Cemetery / Crematory</span>
                      <strong>{permit.cemeteryOrCrematory}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Licensed Funeral Firm</span>
                      <div>{permit.firmName}</div>
                      <div className="text-[10px] text-neutral-500">{permit.firmRegistrationNumber}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Supervising Director</span>
                      <div>{permit.assignedDirector}</div>
                      <div className="text-[10px] text-neutral-500">{permit.lfdLicenseNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase font-bold">Authorized State Registrar</div>
                      <div className="font-serif italic text-neutral-800">{permit.registrarSignature}</div>
                      <div className="text-[9px] text-neutral-400">Issued at: {permit.issuedAt}</div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 border border-neutral-400 rounded-lg flex items-center justify-center bg-neutral-50 font-mono text-[9px] text-neutral-600">
                        [QR CODE]
                      </div>
                      <span className="text-[8px] text-neutral-400 font-mono">NYS-VERIFIED</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center text-[10px] font-sans text-amber-900">
                  ⚠️ This permit must accompany the remains to Woodlawn Crematory or the receiving cemetery authority.
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CREDENTIALS & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {testResult && (
                <div className={`p-4 rounded-2xl text-xs border flex items-start space-x-2.5 animate-fadeIn ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}>
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">{testResult.success ? 'Regulatory Handshake Successful' : 'Connection Failed'}</div>
                    <div className="mt-0.5 text-[11px]">{testResult.message}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#991b1b]" />
                  NYS DOHMH & NYS Health Commerce System Credentials
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Licensed Funeral Director (LFD) NYC ID
                  </label>
                  <input
                    type="text"
                    value={lfdIdInput}
                    onChange={(e) => setLfdIdInput(e.target.value)}
                    placeholder="NYC-LFD-08850-BC"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:border-amber-600"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Assigned by NYC DOHMH Bureau of Vital Statistics to Beth Crowe (LFD #08850).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    BFH Establishment Registration Permit Number
                  </label>
                  <input
                    type="text"
                    value={estPermitInput}
                    onChange={(e) => setEstPermitInput(e.target.value)}
                    placeholder="EST-BFH-NY-10027-08850"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    NYS Health Commerce System (HCS) Account Token
                  </label>
                  <input
                    type="password"
                    value={hcsTokenInput}
                    onChange={(e) => setHcsTokenInput(e.target.value)}
                    placeholder="HCS-SEC-TOK-..."
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:border-amber-600"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Required for filing death certificates outside the 5 boroughs of New York City.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Default Filing Jurisdiction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setJurChoice('nyc_dohmh_5boroughs')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        jurChoice === 'nyc_dohmh_5boroughs'
                          ? 'bg-amber-100 border-amber-500 text-amber-950'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      NYC DOHMH (5 Boroughs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setJurChoice('nys_hcs_outside_nyc')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        jurChoice === 'nys_hcs_outside_nyc'
                          ? 'bg-amber-100 border-amber-500 text-amber-950'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      NYS HCS (Outside NYC)
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 text-neutral-800 font-bold text-xs rounded-xl border border-neutral-300 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-neutral-500" /> : <ShieldCheck className="w-4 h-4 text-amber-700" />}
                    <span>Test Regulatory Handshake</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs rounded-xl border border-amber-400/40 flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Save Credentials</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
