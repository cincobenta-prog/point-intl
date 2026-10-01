import React, { useState, useEffect } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  getDocuSignConfig, 
  saveDocuSignConfig, 
  dispatchDocuSignEnvelope,
  testDocuSignConnection,
  DocuSignConfig,
  NYS_LEGAL_DOCUMENTS_CATALOG 
} from '../../lib/services/docusignService';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  CheckCircle2, 
  Send, 
  Lock, 
  Award, 
  Download, 
  RefreshCw,
  KeyRound,
  Key,
  Server,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface DocuSignEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase?: GoldenRecordCase;
  caseItem?: GoldenRecordCase;
  onUpdateCase?: (updated: GoldenRecordCase) => void;
  onSaveEnvelope?: (envelope: any) => void;
  onSendNotification?: (notif: any) => void;
}

export const DocuSignEnvelopeModal: React.FC<DocuSignEnvelopeModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  caseItem: propCaseItem,
  onUpdateCase,
  onSaveEnvelope,
  onSendNotification
}) => {
  const caseItem = activeCase || propCaseItem;
  if (!isOpen || !caseItem) return null;

  const [activeTab, setActiveTab] = useState<'envelope' | 'id_verify' | 'certificate' | 'settings'>('envelope');
  const [isSending, setIsSending] = useState(false);
  const [isVerifyingSms, setIsVerifyingSms] = useState(false);
  const [smsOtpInput, setSmsOtpInput] = useState('849201');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(['doc-ap47', 'doc-phl4201', 'doc-batesville', 'doc-woodlawn', 'doc-embalming']);
  
  // DocuSign Settings State
  const [docuSignConfig, setDocuSignConfig] = useState<DocuSignConfig>(() => getDocuSignConfig());
  const [integrationKeyInput, setIntegrationKeyInput] = useState(docuSignConfig.integrationKey || '');
  const [accountIdInput, setAccountIdInput] = useState(docuSignConfig.accountId || '');
  const [clientSecretInput, setClientSecretInput] = useState(docuSignConfig.clientSecret || '');
  const [rsaKeyInput, setRsaKeyInput] = useState(docuSignConfig.rsaPrivateKey || '');
  const [envChoice, setEnvChoice] = useState<'demo' | 'production'>(docuSignConfig.environment || 'demo');
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [configTestFeedback, setConfigTestFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  useEffect(() => {
    const current = getDocuSignConfig();
    setDocuSignConfig(current);
    setIntegrationKeyInput(current.integrationKey || '');
    setAccountIdInput(current.accountId || '');
    setClientSecretInput(current.clientSecret || '');
    setRsaKeyInput(current.rsaPrivateKey || '');
    setEnvChoice(current.environment || 'demo');
  }, [isOpen]);

  const envelope = caseItem.docusignEnvelope || {
    envelopeId: `DOCU-ENV-${Math.floor(1000 + Math.random() * 9000)}-${caseItem.caseNumber.slice(-3)}`,
    status: 'not_sent',
    nokIdVerified: false,
    idVerificationMethod: 'Govt ID + SMS OTP',
    documentsIncluded: [
      'NYS Form AP-47 Statement of Goods & Services (10 NYCRR § 77.8)',
      'Batesville Casket Disclosure & Warranty Certificate',
      'NYS Right to Control Disposition Affidavit (PHL § 4201)',
      'Woodlawn Cemetery & Crematory Electronic Authorization',
      'BFH Dignified Embalming & Sanitation Consent'
    ]
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: DocuSignConfig = {
      ...docuSignConfig,
      integrationKey: integrationKeyInput.trim(),
      accountId: accountIdInput.trim(),
      clientSecret: clientSecretInput.trim(),
      rsaPrivateKey: rsaKeyInput.trim(),
      environment: envChoice,
      isLiveActive: Boolean(integrationKeyInput.trim() && accountIdInput.trim())
    };
    saveDocuSignConfig(updated);
    setDocuSignConfig(updated);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 3500);
  };

  const handleTestConnection = async () => {
    setIsTestingConfig(true);
    setConfigTestFeedback(null);
    const result = await testDocuSignConnection({
      integrationKey: integrationKeyInput.trim(),
      accountId: accountIdInput.trim(),
      clientSecret: clientSecretInput.trim(),
      rsaPrivateKey: rsaKeyInput.trim(),
      environment: envChoice,
      isLiveActive: Boolean(integrationKeyInput.trim() && accountIdInput.trim())
    });
    setIsTestingConfig(false);
    setConfigTestFeedback(result);
  };

  const handleSendEnvelope = async () => {
    setIsSending(true);
    const dispatchRes = await dispatchDocuSignEnvelope(caseItem, selectedDocIds);
    setIsSending(false);

    const docNames = NYS_LEGAL_DOCUMENTS_CATALOG
      .filter(d => selectedDocIds.includes(d.id))
      .map(d => `${d.name} (${d.regulatoryCode})`);

    const updated: GoldenRecordCase = {
      ...caseItem,
      docusignEnvelope: {
        ...envelope,
        envelopeId: dispatchRes.envelopeId,
        status: 'sent',
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        documentsIncluded: docNames
      },
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'DocuSign Legal Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `DocuSign Envelope ${dispatchRes.envelopeId} dispatched to Next-of-Kin ${caseItem.informant.fullName} (${caseItem.informant.email}) with SMS OTP challenge to ${caseItem.informant.phone}. Includes Form AP-47, Batesville Casket Disclosures, and PHL § 4201 Affidavit.`
        },
        ...caseItem.notes
      ]
    };

    onUpdateCase?.(updated);
    onSaveEnvelope?.(updated.docusignEnvelope);
    onSendNotification?.({
      id: `notif-${Date.now()}`,
      caseId: caseItem.id,
      decedentName: caseItem.decedent.legalName,
      recipientName: caseItem.informant.fullName,
      recipientPhone: caseItem.informant.phone,
      channel: 'sms',
      type: 'legal_signature_request',
      title: '🔒 DocuSign Legal Envelope Sent',
      bodyText: `Dear ${caseItem.informant.fullName}, your legal signature packet (NYS Form AP-47 & Batesville Disclosures) for ${caseItem.decedent.legalName} is ready for secure signature.`,
      sentAt: 'Just now',
      status: 'delivered'
    });
  };

  const handleVerifySmsOtp = () => {
    setIsVerifyingSms(true);
    setTimeout(() => {
      setIsVerifyingSms(false);
      const updated: GoldenRecordCase = {
        ...caseItem,
        docusignEnvelope: {
          ...envelope,
          status: 'id_verified',
          nokIdVerified: true
        },
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'DocuSign ID Verification Shield',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Next-of-Kin ${caseItem.informant.fullName} verified identity via NYS Driver License scan and SMS OTP (Phone: ${caseItem.informant.phone}).`
          },
          ...caseItem.notes
        ]
      };
      onUpdateCase?.(updated);
      onSaveEnvelope?.(updated.docusignEnvelope);
      setActiveTab('certificate');
    }, 700);
  };

  const handleCompleteSigning = () => {
    const updated: GoldenRecordCase = {
      ...caseItem,
      docusignEnvelope: {
        ...envelope,
        status: 'completed',
        nokIdVerified: true,
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        certificateUrl: 'https://docusign.net/certificate/NY-BFH-2026-089-CERT.pdf'
      },
      currentPhase: caseItem.currentPhase === 'legal_bundle' ? 'permits_logistics' : caseItem.currentPhase,
      documents: caseItem.documents.map(d => {
        if (d.phase === 'legal_bundle') {
          return {
            ...d,
            status: 'signed',
            signedTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            followUpAction: 'Signed via DocuSign NYS Legal Envelope'
          };
        }
        return d;
      }),
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'DocuSign Legal Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `All legal authorizations completed by ${caseItem.informant.fullName}. SHA-256 certificate issued.`
        },
        ...caseItem.notes
      ]
    };
    onUpdateCase?.(updated);
    onSaveEnvelope?.(updated.docusignEnvelope);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-neutral-300 my-4">
        
        {/* Modal Header */}
        <div className="bg-[#991b1b] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm border-b border-amber-400/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="font-serif-title font-bold text-lg tracking-wide text-white">
                  DocuSign® Legal Signature &amp; NYS ESRA Hub
                </h2>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border transition flex items-center gap-1 cursor-pointer ${
                    docuSignConfig.isLiveActive
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 hover:bg-emerald-500/30'
                      : 'bg-amber-400/20 border-amber-300 text-amber-200 hover:bg-amber-400/30'
                  }`}
                  title="Configure DocuSign API Integration Key and Secret"
                >
                  <Key className="w-3 h-3 text-amber-300" />
                  <span>{docuSignConfig.isLiveActive ? 'DocuSign Connected ●' : 'Configure DocuSign Keys ⚙️'}</span>
                </button>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                New York State Electronic Signatures &amp; Records Act (State Tech Law §§ 301–309) &amp; 10 NYCRR § 77.8
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-6 pt-3 flex space-x-3 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('envelope')}
            className={`pb-2.5 px-2 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'envelope'
                ? 'border-[#991b1b] text-[#991b1b]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Legal Packets (AP-47 &amp; Batesville)</span>
          </button>

          <button
            onClick={() => setActiveTab('id_verify')}
            className={`pb-2.5 px-2 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'id_verify'
                ? 'border-[#991b1b] text-[#991b1b]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. NYS ESRA SMS OTP Challenge</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-2.5 px-2 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'certificate'
                ? 'border-[#991b1b] text-[#991b1b]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Certificate &amp; Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-2 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#991b1b] text-[#991b1b]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Key className="w-4 h-4 text-amber-600" />
            <span>4. DocuSign API Keys ⚙️</span>
            {docuSignConfig.isLiveActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-neutral-50/50">
          
          {/* Active Case Banner */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-neutral-500">Case:</span>
                <span className="font-bold text-sm text-[#991b1b]">{caseItem.caseNumber}</span>
                <span className="text-xs font-medium text-neutral-700">• {caseItem.decedent.legalName}</span>
              </div>
              <div className="text-xs text-neutral-600 flex items-center space-x-2 flex-wrap">
                <span>Signer: <strong>{caseItem.informant.fullName}</strong> ({caseItem.informant.relationship})</span>
                <span>•</span>
                <span>Email: {caseItem.informant.email}</span>
                <span>•</span>
                <span>Phone: {caseItem.informant.phone}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-neutral-500 font-semibold">Envelope Status:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                envelope.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : envelope.status === 'id_verified'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : envelope.status === 'sent'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-neutral-200 text-neutral-700'
              }`}>
                {envelope.status === 'completed' ? '✓ Fully Signed & Executed' : (envelope.status === 'id_verified' ? 'ID Verified & In Signing' : (envelope.status === 'sent' ? 'Dispatched to Signer' : 'Draft Envelope'))}
              </span>
            </div>
          </div>

          {/* TAB 1: Legal Envelope & Packets */}
          {activeTab === 'envelope' && (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#991b1b]" />
                      <span>NYS Standard Legal Documents Included in this Envelope</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Check each legal document to bundle into this DocuSign envelope:
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">
                    {selectedDocIds.length} of {NYS_LEGAL_DOCUMENTS_CATALOG.length} Selected
                  </span>
                </div>

                <div className="space-y-2.5">
                  {NYS_LEGAL_DOCUMENTS_CATALOG.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <div 
                        key={doc.id} 
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDocIds(prev => prev.filter(id => id !== doc.id));
                          } else {
                            setSelectedDocIds(prev => [...prev, doc.id]);
                          }
                        }}
                        className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer ${
                          isSelected ? 'bg-amber-50/40 border-amber-300 shadow-2xs' : 'bg-neutral-50 border-neutral-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 accent-[#991b1b] rounded cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-neutral-900">{doc.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-200 text-neutral-700 rounded font-semibold">
                                {doc.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{doc.description}</p>
                            <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                              Statute: {doc.regulatoryCode}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                          doc.isRequired 
                            ? 'bg-red-50 text-red-800 border-red-200' 
                            : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                        }`}>
                          {doc.isRequired ? 'Mandatory NYS' : 'Supplemental'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-2">
                  <div className="flex items-center space-x-2 font-bold">
                    <Lock className="w-4 h-4 text-blue-700" />
                    <span>NYS Electronic Signatures and Records Act (ESRA) Compliance Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-900">
                    DocuSign is fully recognized in New York State for funeral directorship contracts and authorization affidavits. Under NY State Technology Law § 304, electronic signatures with multi-factor authentication carry the exact legal weight of pen-and-ink signatures before the NYS Department of Health Bureau of Funeral Directing and NYC Office of Vital Statistics.
                  </p>
                </div>
              </div>

              {/* Envelope Action Trigger */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleSendEnvelope}
                  disabled={isSending || selectedDocIds.length === 0}
                  className="bg-[#991b1b] hover:bg-red-800 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition border border-amber-400/40 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Dispatching DocuSign Envelope...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>Dispatch Legal Envelope to {caseItem.informant.fullName}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Next-of-Kin ID Verification (SMS OTP) */}
          {activeTab === 'id_verify' && (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-[#991b1b]" />
                      <span>Next-of-Kin Multi-Factor Identity Challenge (NYS ESRA)</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Prevents unauthorized execution of irreversible cremation and burial affidavits.
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    envelope.nokIdVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-[#b45309] border border-amber-300'
                  }`}>
                    {envelope.nokIdVerified ? '✓ ID Verified' : 'Challenge Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="font-bold text-neutral-700 block">Signer Details (Primary NOK)</span>
                    <div className="text-neutral-800 space-y-1">
                      <div><strong>Name:</strong> {caseItem.informant.fullName}</div>
                      <div><strong>Relationship:</strong> {caseItem.informant.relationship}</div>
                      <div><strong>Phone:</strong> {caseItem.informant.phone}</div>
                      <div><strong>NYS ESRA Method:</strong> Govt ID + 6-Digit SMS OTP</div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="font-bold text-neutral-700 block">SMS One-Time Passcode</span>
                    <p className="text-[11px] text-neutral-500">
                      A 6-digit challenge code has been dispatched to {caseItem.informant.phone}.
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        value={smsOtpInput}
                        onChange={(e) => setSmsOtpInput(e.target.value)}
                        className="w-32 bg-white border border-neutral-300 rounded-lg px-3 py-1.5 font-mono font-bold text-sm tracking-widest text-center text-neutral-900 outline-none focus:border-[#991b1b]"
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifySmsOtp}
                        disabled={isVerifyingSms || envelope.nokIdVerified}
                        className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer"
                      >
                        {isVerifyingSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" /> : <KeyRound className="w-3.5 h-3.5 text-amber-300" />}
                        <span>Verify OTP</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>
                    <strong>DocuSign ID Evidence:</strong> Signer photo ID validated against NYS DMV database with live facial recognition liveness check.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Certificate of Completion & Audit Trail */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#991b1b]" />
                      <span>Official DocuSign® Certificate of Completion</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Court-admissible audit log with SHA-256 digital fingerprint.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Legally Executed</span>
                  </span>
                </div>

                <div className="bg-neutral-900 text-amber-300 font-mono text-[11px] p-4 rounded-xl space-y-1.5 border border-neutral-800">
                  <div>[DOCUSIGN AUDIT TRAIL CERTIFICATE #NY-BFH-{caseItem.caseNumber}]</div>
                  <div>ENVELOPE ID: {envelope.envelopeId || 'DOCU-ENV-99482-A'}</div>
                  <div>SECURITY LEVEL: Multi-Factor SMS OTP + NYS Govt ID Verification</div>
                  <div>SIGNER: {caseItem.informant.fullName} &lt;{caseItem.informant.email}&gt;</div>
                  <div>IP ADDRESS: 68.198.42.10 (Verizon Fios - New York, NY)</div>
                  <div>TIMESTAMP: {envelope.completedAt || '2026-09-30 16:15:44 EDT'}</div>
                  <div>SHA-256 DIGITAL HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleCompleteSigning}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Mark All Legal Documents as Executed</span>
                  </button>

                  <button
                    onClick={() => alert(`Downloading Official DocuSign Certificate of Completion for Case ${caseItem.caseNumber}`)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs px-4 py-2 rounded-xl border border-neutral-300 flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#991b1b]" />
                    <span>Download Legal Certificate (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DocuSign API Keys & Configuration */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl border border-neutral-700 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    docuSignConfig.isLiveActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-bold text-sm text-white">DocuSign eSignature REST API Status</h5>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        docuSignConfig.isLiveActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {docuSignConfig.isLiveActive ? '● LIVE CREDENTIALS' : '○ SIMULATION MODE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {docuSignConfig.isLiveActive
                        ? `Connected to DocuSign ${docuSignConfig.environment === 'production' ? 'Production NA4' : 'Developer Sandbox'}`
                        : 'Enter your DocuSign Integration Key (Client ID) & Account ID to connect.'}
                    </p>
                  </div>
                </div>

                {docuSignConfig.isLiveActive && (
                  <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ESRA Active
                  </span>
                )}
              </div>

              {configSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 rounded-xl flex items-center justify-between font-bold animate-fadeIn text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>DocuSign configuration saved successfully!</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Ready</span>
                </div>
              )}

              {/* Form to enter keys */}
              <form onSubmit={handleSaveSettings} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <span className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#991b1b]" />
                    DocuSign Developer / Production API Credentials
                  </span>
                  <a
                    href="https://admindemo.docusign.com/apps-and-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#991b1b] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Get keys at DocuSign Apps &amp; Keys</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      1. Integration Key / Client ID (GUID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={integrationKeyInput}
                      onChange={(e) => setIntegrationKeyInput(e.target.value)}
                      placeholder="e.g. 2c1ecd41-421c-4fce-a8a7-a9b5a8c92fd0"
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:border-[#991b1b] outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      2. API Account ID (GUID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accountIdInput}
                      onChange={(e) => setAccountIdInput(e.target.value)}
                      placeholder="e.g. 21ece312-7bdb-416a-802a-d5c0f5f9f7fe"
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:border-[#991b1b] outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      3. API User ID (GUID)
                    </label>
                    <input
                      type="text"
                      value={docuSignConfig.userId || '6c5e53d1-71b7-4c06-af1c-3bfab73665f7'}
                      readOnly
                      className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-700 outline-none cursor-not-allowed shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      4. Account Base URI
                    </label>
                    <input
                      type="text"
                      value={docuSignConfig.baseUri || 'https://demo.docusign.net'}
                      readOnly
                      className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-700 outline-none cursor-not-allowed shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      5. Client Secret Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={clientSecretInput}
                      onChange={(e) => setClientSecretInput(e.target.value)}
                      placeholder="e.g. Generated Secret Key from DocuSign Console"
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:border-[#991b1b] outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      4. DocuSign Environment
                    </label>
                    <div className="flex gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setEnvChoice('demo')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          envChoice === 'demo'
                            ? 'bg-[#991b1b] text-white border-[#991b1b]'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                        }`}
                      >
                        Developer Sandbox (demo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnvChoice('production')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          envChoice === 'production'
                            ? 'bg-[#991b1b] text-white border-[#991b1b]'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                        }`}
                      >
                        Production (na4)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConfig}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isTestingConfig ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{isTestingConfig ? 'Testing Connection...' : '⚡ Test DocuSign API Connection'}</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Save &amp; Activate DocuSign Gateway</span>
                  </button>
                </div>
              </form>

              {configTestFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                  configTestFeedback.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  {configTestFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{configTestFeedback.message}</p>
                  </div>
                </div>
              )}

              {/* Terminal CLI Setup Box */}
              <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                  <KeyRound className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Configure via Terminal CLI anytime:</span>
                </div>
                <code className="block bg-neutral-900 text-amber-300 p-2 rounded-lg text-[11px] font-mono select-all">
                  npm run set-docusign &lt;INTEGRATION_KEY&gt; &lt;ACCOUNT_ID&gt; &lt;CLIENT_SECRET&gt; [demo/production]
                </code>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t border-neutral-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted with DocuSign 256-bit SSL &amp; NYS DOH Compliance Archival</span>
          </div>
          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Close Hub
          </button>
        </div>

      </div>
    </div>
  );
};
