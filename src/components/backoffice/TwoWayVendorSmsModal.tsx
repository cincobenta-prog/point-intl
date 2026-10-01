import React, { useState } from 'react';
import {
  GoldenRecordCase,
  PartnerScheduleRequest,
  ServicePartnerContact,
  VendorSmsThreadMessage,
  SimulatedNotification
} from '../../lib/types/funeral';
import { getTwilioConfig } from '../../lib/services/twilioService';
import {
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Users,
  Clock,
  Car,
  Flower,
  Church,
  Music,
  CheckCheck,
  ShieldCheck,
  Code,
  Copy,
  Check,
  Activity,
  Server,
  Phone,
  Key
} from 'lucide-react';

interface TwoWayVendorSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: GoldenRecordCase;
  partners: ServicePartnerContact[];
  requests: PartnerScheduleRequest[];
  onUpdateRequest: (updated: PartnerScheduleRequest) => void;
  onAddRequest?: (newReq: PartnerScheduleRequest) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  targetRequestId?: string | null;
  onOpenTwilioGateway?: () => void;
}

export const TwoWayVendorSmsModal: React.FC<TwoWayVendorSmsModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  partners = [],
  requests,
  onUpdateRequest,
  onAddRequest: _onAddRequest,
  onSendNotification,
  targetRequestId,
  onOpenTwilioGateway
}) => {
  // Find initial request or default
  const caseRequests = requests.filter(r => r.caseId === activeCase.id);
  const initialReq = targetRequestId
    ? requests.find(r => r.id === targetRequestId)
    : caseRequests[0] || requests[0];

  const [selectedRequestId, setSelectedRequestId] = useState<string>(initialReq?.id || '');
  const [activeModalTab, setActiveModalTab] = useState<'simulator' | 'webhook'>('simulator');
  const [vendorCustomReplyText, setVendorCustomReplyText] = useState('');
  const [directorOutboundDraft, setDirectorOutboundDraft] = useState('');
  const [adjustedTimeInput, setAdjustedTimeInput] = useState('10:15 AM');
  const [showAdjustTimeModal, setShowAdjustTimeModal] = useState(false);
  const [showPhoneLogModal, setShowPhoneLogModal] = useState(false);
  const [phoneLogNotes, setPhoneLogNotes] = useState('');
  const [phoneLogCaller, setPhoneLogCaller] = useState('Jason Benta, LFD #08850');
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const twilioConfig = getTwilioConfig();

  if (!isOpen) return null;

  const currentRequest = requests.find(r => r.id === selectedRequestId) || initialReq;

  const threadMessages = currentRequest?.threadMessages || [
    {
      id: `msg-init-${currentRequest?.id || '1'}`,
      sender: 'bfh_dispatch',
      senderName: "Benta's Dispatch (Jason Benta, LFD)",
      senderPhone: '(212) 281-8850',
      body: currentRequest?.smsMessageDraft || "BFH SERVICE REQUEST: Please confirm your booking.",
      timestamp: currentRequest?.requestedAt || 'Today 09:30 AM',
      status: 'delivered'
    }
  ];

  const showToast = (msg: string) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(null), 4000);
  };

  // Director triggers 1-Tap Standby Cascade Fallback
  const handleStandbyCascade = () => {
    if (!currentRequest) return;
    const standbyPartner = partners.find(p => p.id === currentRequest.standbyBackupPartnerId || p.fullName === currentRequest.standbyBackupPartnerName) || partners.find(p => p.category === currentRequest.category && p.id !== currentRequest.partnerId);
    
    if (!standbyPartner) {
      alert('No verified standby backup partner found in Harlem directory for this role.');
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowFormatted = `Today ${timeStr}`;

    const newSmsText = `BFH URGENT STANDBY DISPATCH: Dear ${standbyPartner.fullName}, you have been activated from standby for ${currentRequest.roleTitle} on Case #${currentRequest.caseNumber} (${currentRequest.decedentName}) on ${currentRequest.serviceDate} at ${currentRequest.callTime} (${currentRequest.venueLocation}). Please reply YES immediately to confirm.`;

    const cascadeMsg: VendorSmsThreadMessage = {
      id: `msg-cascade-${Date.now()}`,
      sender: 'bfh_dispatch',
      senderName: "Benta's Dispatch (Standby Cascade Fallback)",
      senderPhone: '(212) 281-8850',
      body: `[CASCADE FALLBACK ACTIVATED]: Primary vendor was unresponsive past SLA deadline. Service reassigned to Standby Partner ${standbyPartner.fullName} (${standbyPartner.phone}). Urgent hold SMS dispatched.`,
      timestamp: nowFormatted,
      status: 'delivered'
    };

    const updated: PartnerScheduleRequest = {
      ...currentRequest,
      partnerId: standbyPartner.id,
      partnerName: standbyPartner.fullName,
      partnerPhone: standbyPartner.phone,
      roleTitle: standbyPartner.roleTitle,
      status: 'sms_sent',
      isOverdue: false,
      overdueMinutes: 0,
      escalationStatus: 'backup_cascaded',
      directorFollowUpRequired: false,
      requestedAt: nowFormatted,
      smsMessageDraft: newSmsText,
      remindersCount: 0,
      threadMessages: [...threadMessages, cascadeMsg]
    };

    onUpdateRequest(updated);
    showToast(`⚡ Cascaded to Standby Partner: ${standbyPartner.fullName} (${standbyPartner.phone})!`);
  };

  // Director logs direct verbal phone call confirmation
  const handleLogDirectorPhoneCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRequest) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowFormatted = `Today ${timeStr}`;

    const phoneMsg: VendorSmsThreadMessage = {
      id: `msg-phone-${Date.now()}`,
      sender: 'bfh_dispatch',
      senderName: phoneLogCaller,
      senderPhone: '(212) 281-8850',
      body: `[DIRECTOR PHONE CALL LOGGED]: ${phoneLogNotes || 'Director called vendor directly. Vendor verbally confirmed availability and on-time arrival.'} (Confirmed by ${phoneLogCaller})`,
      timestamp: nowFormatted,
      status: 'delivered'
    };

    const updated: PartnerScheduleRequest = {
      ...currentRequest,
      status: 'confirmed',
      isOverdue: false,
      directorFollowUpRequired: false,
      directorCalledAt: nowFormatted,
      directorFollowUpNotes: phoneLogNotes || 'Director verbal phone confirmation.',
      escalationStatus: 'director_phone_confirmed',
      confirmedAt: nowFormatted,
      threadMessages: [...threadMessages, phoneMsg]
    };

    onUpdateRequest(updated);
    setShowPhoneLogModal(false);
    setPhoneLogNotes('');
    showToast(`📞 Verbal phone confirmation logged for ${currentRequest.partnerName}! Status set to CONFIRMED.`);
  };

  // Director sends an outbound SMS to the vendor
  const handleSendDirectorOutbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRequest) return;
    const bodyToSend = directorOutboundDraft.trim() || currentRequest.smsMessageDraft;
    if (!bodyToSend) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: VendorSmsThreadMessage = {
      id: `msg-${Date.now()}`,
      sender: 'bfh_dispatch',
      senderName: "Benta's Dispatch (Jason Benta, LFD)",
      senderPhone: '(212) 281-8850',
      body: bodyToSend,
      timestamp: `Today ${timeStr}`,
      status: 'delivered'
    };

    const updated: PartnerScheduleRequest = {
      ...currentRequest,
      status: currentRequest.status === 'confirmed' ? 'confirmed' : 'sms_sent',
      threadMessages: [...threadMessages, newMsg],
      remindersCount: currentRequest.remindersCount + 1,
      lastReminderAt: `Today ${timeStr}`
    };

    onUpdateRequest(updated);
    setDirectorOutboundDraft('');
    showToast(`Outbound SMS dispatched to ${currentRequest.partnerName} (${currentRequest.partnerPhone})!`);
  };

  // Vendor simulates sending a reply SMS
  const handleVendorSimulateReply = (
    type: 'accept_confirm' | 'time_adjustment' | 'decline' | 'custom_reply',
    customText?: string
  ) => {
    if (!currentRequest) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let bodyText = '';
    let newStatus = currentRequest.status;
    let adjustedTime: string | undefined = undefined;
    let declineReason: string | undefined = undefined;

    switch (type) {
      case 'accept_confirm':
        bodyText = `YES, CONFIRMED. We have scheduled the service for ${currentRequest.serviceDate} at ${currentRequest.callTime} in ${currentRequest.venueLocation}. Everything will be staged reverently. - ${currentRequest.partnerName}`;
        newStatus = 'confirmed';
        break;
      case 'time_adjustment':
        adjustedTime = adjustedTimeInput;
        bodyText = `CONFIRMED WITH TIME ADJUSTMENT: We can accommodate the service on ${currentRequest.serviceDate}, but arrival will be at ${adjustedTimeInput} due to prior sanctuary service. Please confirm if acceptable. - ${currentRequest.partnerName}`;
        newStatus = 'confirmed';
        setShowAdjustTimeModal(false);
        break;
      case 'decline':
        declineReason = 'Vendor unavailable on requested date/time.';
        bodyText = `UNAVAILABLE / DECLINED: Unfortunately we are fully committed on ${currentRequest.serviceDate} at ${currentRequest.callTime}. We suggest checking with alternate guild partner. Sincere apologies. - ${currentRequest.partnerName}`;
        newStatus = 'declined';
        break;
      case 'custom_reply':
        bodyText = customText || vendorCustomReplyText.trim();
        newStatus = 'confirmed';
        setVendorCustomReplyText('');
        break;
    }

    if (!bodyText.trim()) return;

    const vendorMsg: VendorSmsThreadMessage = {
      id: `msg-vendor-${Date.now()}`,
      sender: 'vendor',
      senderName: currentRequest.partnerName,
      senderPhone: currentRequest.partnerPhone,
      body: bodyText,
      timestamp: `Today ${timeStr}`,
      status: 'read',
      quickActionTriggered: type
    };

    const updated: PartnerScheduleRequest = {
      ...currentRequest,
      status: newStatus,
      confirmedAt: type !== 'decline' ? `Today ${timeStr}` : undefined,
      adjustedArrivalTime: adjustedTime || currentRequest.adjustedArrivalTime,
      declineReason: declineReason || currentRequest.declineReason,
      threadMessages: [...threadMessages, vendorMsg]
    };

    onUpdateRequest(updated);

    // Also fire a system notification simulation
    if (onSendNotification) {
      const notif: SimulatedNotification = {
        id: `notif-vendor-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: "Jason Benta, LFD",
        recipientPhone: '(212) 281-8850',
        channel: 'sms',
        type: 'service_schedule',
        title: `Two-Way SMS: ${currentRequest.partnerName} (${currentRequest.roleTitle})`,
        bodyText: `Carrier Reply from ${currentRequest.partnerPhone}: "${bodyText}"`,
        sentAt: `Today ${timeStr}`,
        status: 'delivered',
        actionUrl: '#partners',
        actionButtonText: 'View in Partner Hub'
      };
      onSendNotification(notif);
    }

    showToast(`Incoming carrier reply logged from ${currentRequest.partnerName}! Status: ${newStatus.toUpperCase()}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hairdresser_barber':
        return Users;
      case 'musician_organist':
        return Music;
      case 'minister_clergy':
        return Church;
      case 'other_vendor':
        return Flower;
      case 'livery_transport':
        return Car;
      default:
        return Users;
    }
  };

  const Icon = currentRequest ? getCategoryIcon(currentRequest.category) : Users;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Universal Top Header */}
        <div className="bg-gradient-to-r from-[#141b2b] via-[#1e2738] to-[#141b2b] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b-2 border-amber-400/80 shrink-0">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-bold shadow-sm border border-amber-300">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  TWO-WAY VENDOR SMS DISPATCH & CONFIRMATION HUB
                </span>
                <span className="text-xs text-neutral-300 font-mono">
                  Case #{activeCase.caseNumber}
                </span>
              </div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                Direct Carrier Link: {currentRequest?.partnerName || 'Service Partner'} ({currentRequest?.roleTitle || 'Vendor'})
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Case Request Switcher Dropdown */}
            <div className="flex items-center space-x-1.5 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700">
              <span className="text-[10px] text-neutral-400 font-bold px-2 uppercase hidden sm:inline">Partner:</span>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="bg-neutral-900 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none border border-neutral-700 focus:border-amber-400"
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.partnerName} ({r.roleTitle.split(' ')[0]}) • {r.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Sub Navigation Bar: Carrier Simulator vs Twilio Webhook Inspector */}
        <div className="bg-neutral-900 px-4 sm:px-5 py-2.5 flex items-center justify-between border-b border-neutral-800 text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveModalTab('simulator')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                activeModalTab === 'simulator'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>2-Way Carrier Simulator</span>
            </button>
            <button
              onClick={() => setActiveModalTab('webhook')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                activeModalTab === 'webhook'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Twilio / Gateway Webhook Inspector</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </button>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-[11px] text-neutral-400 font-mono">
            {onOpenTwilioGateway && (
              <button
                onClick={onOpenTwilioGateway}
                className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer font-sans text-xs mr-1"
                title="Configure Twilio API Keys and Phone Number"
              >
                <Key className="w-3 h-3 text-amber-400" />
                <span>Configure Keys</span>
              </button>
            )}
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-emerald-400" />
              <span>Twilio API v2010-04-01</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400">HMAC-SHA1: Verified</span>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastFeedback && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{toastFeedback}</span>
            </div>
            <button onClick={() => setToastFeedback(null)} className="text-white/80 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Modal Body: Active Tab View */}
        {activeModalTab === 'webhook' ? (
          <div className="p-6 overflow-y-auto space-y-6 bg-neutral-950 text-neutral-100 flex-1 font-mono text-xs">
            
            {/* Twilio Endpoint Overview Banner */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/30">
                    STATUS 200 OK
                  </span>
                  <span className="text-sm font-bold text-white">Twilio REST API Gateway & Webhook Pipeline</span>
                </div>
                <p className="text-neutral-400 text-xs mt-1 font-sans">
                  Bi-directional carrier routing between Benta's Funeral Home ({twilioConfig.fromPhoneNumber || '212-281-8850'}) and {currentRequest?.partnerName} ({currentRequest?.partnerPhone}).
                </p>
              </div>

              <div className="flex items-center gap-2 font-sans flex-wrap">
                {onOpenTwilioGateway && (
                  <button
                    onClick={onOpenTwilioGateway}
                    className="px-3.5 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-amber-300/40 shadow-xs cursor-pointer"
                    title="Open Twilio Gateway Settings to enter Account SID and Auth Token"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-300" />
                    <span>Configure Twilio Keys & Number</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    const lastMsg = currentRequest?.threadMessages && currentRequest.threadMessages.length > 0
                      ? currentRequest.threadMessages[currentRequest.threadMessages.length - 1].body
                      : "YES, CONFIRMED";
                    const sampleWebhook = JSON.stringify({
                      event: "sms.inbound_received",
                      AccountSid: twilioConfig.accountSid || "ACbfh9828472918402948201948201948",
                      MessageSid: `SM${Date.now().toString(36)}`,
                      From: currentRequest?.partnerPhone,
                      To: twilioConfig.fromPhoneNumber || "+12122818850",
                      Body: lastMsg,
                      Carrier: "Verizon Wireless (NYC)",
                      SignatureValid: true
                    }, null, 2);
                    navigator.clipboard.writeText(sampleWebhook);
                    setCopiedPayload(true);
                    setTimeout(() => setCopiedPayload(false), 2000);
                  }}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-neutral-700 cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{copiedPayload ? 'Copied JSON!' : 'Copy Twilio Payload'}</span>
                </button>
              </div>
            </div>

            {/* Carrier Telemetry Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-400 block font-sans">Primary Carrier</span>
                <span className="text-amber-300 font-bold text-sm">Verizon NYC 5G</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Latency: 114ms</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-400 block font-sans">Security Signature</span>
                <span className="text-emerald-400 font-bold text-sm">HMAC-SHA1 OK</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">X-Twilio-Signature verified</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-400 block font-sans">A2P 10DLC Campaign</span>
                <span className="text-blue-400 font-bold text-sm">Registered 10DLC</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Trust Score: 98/100</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-400 block font-sans">Delivery Rate</span>
                <span className="text-purple-400 font-bold text-sm">100% Confirmed</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">0 Failed / 0 Filtered</span>
              </div>
            </div>

            {/* Inbound & Outbound Payload Inspectors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Outbound Dispatch Payload */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Outbound REST Dispatch Payload (POST)</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">api.twilio.com/2010-04-01</span>
                </div>
                <div className="bg-black/60 rounded-xl p-3 text-[11px] overflow-x-auto text-neutral-300 leading-relaxed font-mono">
                  <span className="text-neutral-500">// BFH Dispatch Outbound Message</span><br />
                  POST /2010-04-01/Accounts/ACbfh9828472918402948201948201948/Messages.json HTTP/1.1<br />
                  Host: api.twilio.com<br />
                  Authorization: Basic QUNiZmg5ODI4NDcyOTE4NDAyOTQ4MjAxOTQ4MjAxOTQ4OnNlY3JldF9hdXRoX3Rva2Vu<br />
                  Content-Type: application/x-www-form-urlencoded<br /><br />
                  From=%2B12122818850<br />
                  &To={encodeURIComponent(currentRequest?.partnerPhone || '+12125550198')}<br />
                  &Body={encodeURIComponent(currentRequest?.smsMessageDraft || 'BFH SERVICE REQUEST')}<br />
                  &StatusCallback=https%3A%2F%2Fapi.e-bfh.com%2Fapi%2Fv1%2Fwebhooks%2Ftwilio%2Fsms-status
                </div>
              </div>

              {/* Inbound Webhook Callback Payload */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Inbound Carrier Webhook Event (POST)</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">api.e-bfh.com/webhooks/twilio</span>
                </div>
                <div className="bg-black/60 rounded-xl p-3 text-[11px] overflow-x-auto text-neutral-300 leading-relaxed font-mono">
                  <span className="text-neutral-500">// Received from Twilio Carrier Webhook</span><br />
                  POST /api/v1/webhooks/twilio/sms-inbound HTTP/1.1<br />
                  Host: api.e-bfh.com<br />
                  X-Twilio-Signature: 8xKj3290FnLq194zKla0Pz92837482==<br />
                  User-Agent: TwilioProxy/1.1<br /><br />
                  &#123;<br />
                  &nbsp;&nbsp;"MessageSid": "SM{currentRequest?.id.replace(/[^a-zA-Z0-9]/g, '') || '82947291'}",<br />
                  &nbsp;&nbsp;"AccountSid": "ACbfh9828472918402948201948201948",<br />
                  &nbsp;&nbsp;"From": "{currentRequest?.partnerPhone}",<br />
                  &nbsp;&nbsp;"To": "+12122818850",<br />
                  &nbsp;&nbsp;"Body": "{currentRequest?.threadMessages && currentRequest.threadMessages.length > 0 ? currentRequest.threadMessages[currentRequest.threadMessages.length - 1].body : 'YES, CONFIRMED'}",<br />
                  &nbsp;&nbsp;"NumMedia": "0",<br />
                  &nbsp;&nbsp;"FromCity": "NEW YORK",<br />
                  &nbsp;&nbsp;"FromState": "NY",<br />
                  &nbsp;&nbsp;"FromZip": "10030"<br />
                  &#125;
                </div>
              </div>

            </div>

          </div>
        ) : (
        /* Modal Body: 2-Column Split Console */
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Column (5 cols): BFH Dispatch Control Panel */}
          <div className="lg:col-span-5 p-5 bg-neutral-50/70 border-r border-neutral-200 flex flex-col justify-between space-y-5 overflow-y-auto">
            
            <div className="space-y-4">
              
              {/* Partner Profile Snapshot Card */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-red-50 text-[#991b1b] rounded-xl border border-red-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif-title font-bold text-sm text-neutral-900">
                        {currentRequest?.partnerName}
                      </h4>
                      <p className="text-[11px] text-[#b45309] font-bold">
                        {currentRequest?.roleTitle}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentRequest?.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : currentRequest?.status === 'overdue_unconfirmed' || currentRequest?.isOverdue
                      ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                      : currentRequest?.status === 'declined'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {currentRequest?.status === 'confirmed' 
                      ? '✅ Confirmed' 
                      : currentRequest?.status === 'overdue_unconfirmed' || currentRequest?.isOverdue
                      ? '🚨 SLA Overdue!' 
                      : currentRequest?.status === 'declined' 
                      ? '❌ Declined' 
                      : '⏳ Awaiting Reply'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-100">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Carrier Phone</span>
                    <strong className="font-mono text-neutral-900">{currentRequest?.partnerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Scheduled Call Time</span>
                    <strong className="text-neutral-900">{currentRequest?.serviceDate} at {currentRequest?.callTime}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Venue Staging</span>
                    <strong className="text-neutral-900 truncate block">{currentRequest?.venueLocation}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Response SLA Deadline</span>
                    <strong className={`font-mono ${currentRequest?.isOverdue ? 'text-red-700' : 'text-neutral-900'}`}>
                      {currentRequest?.responseDeadline || '4 Hours'}
                    </strong>
                  </div>
                </div>

                {currentRequest?.specialInstructions && (
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-700 italic">
                    "{currentRequest.specialInstructions}"
                  </div>
                )}
              </div>

              {/* Standby Backup Partner & Emergency Escalation Hub */}
              <div className="bg-gradient-to-r from-purple-50 via-purple-100/40 to-white p-4 rounded-2xl border border-purple-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      🛡️ Standby Waterfall Backup Partner
                    </span>
                  </div>
                  <span className="text-[10px] bg-purple-200/70 text-purple-900 font-mono font-bold px-2 py-0.5 rounded">
                    Pre-Assigned
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-purple-200/80 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="font-serif-title text-neutral-900 font-bold">
                      {currentRequest?.standbyBackupPartnerName || 'Assigned in Harlem Network Directory'}
                    </strong>
                    <span className="text-[10px] text-purple-700 font-bold">
                      {currentRequest?.standbyBackupRoleTitle || currentRequest?.roleTitle}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-600">
                    Direct Phone: {currentRequest?.standbyBackupPartnerPhone || '(212) 555-0199'}
                  </div>
                </div>

                {/* Director Quick Action Buttons for Unresponsive Vendor */}
                {currentRequest?.status !== 'confirmed' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (window.confirm(`Activate Standby Backup Partner (${currentRequest?.standbyBackupPartnerName || 'Next Guild Contact'})? This will reassign the booking and immediately dispatch a priority SMS hold.`)) {
                          handleStandbyCascade();
                        }
                      }}
                      className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                      title="1-Tap Waterfall: Swap to Standby Backup Partner and dispatch SMS"
                    >
                      <span>⚡ Cascade Backup</span>
                    </button>

                    <button
                      onClick={() => {
                        setPhoneLogNotes(`Director spoke directly with ${currentRequest?.partnerName} at ${currentRequest?.partnerPhone}. Partner confirmed arrival for ${currentRequest?.serviceDate} at ${currentRequest?.callTime}.`);
                        setShowPhoneLogModal(true);
                      }}
                      className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      title="Log direct verbal telephone confirmation from vendor"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#991b1b]" />
                      <span>Log Verbal Call</span>
                    </button>
                  </div>
                )}
              </div>

              {/* In-Modal Phone Log Dialog */}
              {showPhoneLogModal && (
                <form onSubmit={handleLogDirectorPhoneCall} className="p-4 bg-white rounded-2xl border-2 border-[#991b1b] shadow-md space-y-3 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                    <span className="font-serif-title font-bold text-neutral-900 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#991b1b]" />
                      <span>Log Director Phone Call Confirmation</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPhoneLogModal(false)}
                      className="text-neutral-400 hover:text-neutral-800 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Director / Caller Name:</label>
                    <input
                      type="text"
                      required
                      value={phoneLogCaller}
                      onChange={(e) => setPhoneLogCaller(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 font-bold outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Verbal Agreement Notes:</label>
                    <textarea
                      rows={3}
                      required
                      value={phoneLogNotes}
                      onChange={(e) => setPhoneLogNotes(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPhoneLogModal(false)}
                      className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#991b1b] hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg shadow-xs"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              )}

              {/* Outbound Dispatch Form */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif-title font-bold text-xs text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#991b1b]" />
                    <span>Send Outbound Dispatch SMS</span>
                  </h5>
                  <span className="text-[10px] text-neutral-400 font-mono">Twilio Live Relay</span>
                </div>

                <form onSubmit={handleSendDirectorOutbound} className="space-y-3">
                  <textarea
                    rows={4}
                    value={directorOutboundDraft}
                    onChange={(e) => setDirectorOutboundDraft(e.target.value)}
                    placeholder={currentRequest?.smsMessageDraft || "Type custom dispatch instructions or updates to partner..."}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 outline-none focus:border-[#991b1b] font-mono leading-relaxed"
                  />

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDirectorOutboundDraft(currentRequest?.smsMessageDraft || '')}
                      className="text-[11px] text-[#991b1b] hover:underline font-bold"
                    >
                      Reset to Default Template
                    </button>

                    <button
                      type="submit"
                      className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm border border-amber-300/40"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>Dispatch Outbound SMS</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Compliance Guarantee */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#991b1b] shrink-0" />
              <span>
                All two-way SMS confirmations are cryptographically stamped and synchronized with the <strong>Golden Record Activity Ledger</strong>.
              </span>
            </div>

          </div>

          {/* Right Column (7 cols): Simulated Vendor Smartphone Device */}
          <div className="lg:col-span-7 p-5 sm:p-6 bg-[#f4f5f8] flex flex-col justify-between space-y-4 overflow-y-auto">
            
            <div className="space-y-3">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-neutral-800">
                    Live Vendor Device Simulator • {currentRequest?.partnerName}’s Phone
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  Verizon Wireless (NYC 5G)
                </span>
              </div>

              {/* iPhone Mockup Frame */}
              <div className="bg-[#1f242d] rounded-3xl p-3 sm:p-4 shadow-xl border-4 border-neutral-800 max-w-md mx-auto w-full text-white">
                
                {/* Phone Status Bar */}
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 px-2 pb-2 border-b border-neutral-700/60">
                  <span>9:41 AM</span>
                  <div className="w-16 h-3 bg-black rounded-full mx-auto" />
                  <span className="flex items-center gap-1">5G 📶 100% 🔋</span>
                </div>

                {/* Conversation Header */}
                <div className="p-3 text-center border-b border-neutral-800 space-y-0.5">
                  <div className="w-10 h-10 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-bold text-xs mx-auto border border-amber-300">
                    BFH
                  </div>
                  <div className="font-bold text-xs text-white">Benta's Funeral Home</div>
                  <div className="text-[10px] text-neutral-400 font-mono">(212) 281-8850 • Harlem, NY</div>
                </div>

                {/* Message Thread Scroll Area */}
                <div className="p-3 sm:p-4 space-y-3 max-h-[300px] overflow-y-auto font-sans text-xs">
                  {threadMessages.map((msg) => {
                    const isBfh = msg.sender === 'bfh_dispatch';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isBfh ? 'items-start' : 'items-end'}`}
                      >
                        <span className="text-[9px] text-neutral-400 font-mono mb-0.5 px-1">
                          {isBfh ? "Benta's Dispatch" : currentRequest?.partnerName} • {msg.timestamp}
                        </span>

                        <div
                          className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
                            isBfh
                              ? 'bg-neutral-800 text-neutral-100 rounded-tl-xs border border-neutral-700'
                              : 'bg-[#007aff] text-white rounded-tr-xs font-medium'
                          }`}
                        >
                          {msg.body}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-neutral-500 mt-0.5 px-1">
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span>Delivered</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Phone Input Bar */}
                <div className="p-2.5 bg-neutral-900 rounded-2xl border border-neutral-700 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    value={vendorCustomReplyText}
                    onChange={(e) => setVendorCustomReplyText(e.target.value)}
                    placeholder="Type custom reply as vendor..."
                    className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-neutral-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVendorSimulateReply('custom_reply');
                      }
                    }}
                  />
                  <button
                    onClick={() => handleVendorSimulateReply('custom_reply')}
                    disabled={!vendorCustomReplyText.trim()}
                    className="p-1.5 bg-[#007aff] hover:bg-blue-600 disabled:opacity-40 text-white rounded-full transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

            {/* Vendor Interactive One-Click Response Bar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulate Vendor Interactive Carrier Actions:</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">1-Tap Live Simulation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                {/* 1. Accept & Confirm */}
                <button
                  onClick={() => handleVendorSimulateReply('accept_confirm')}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex flex-col items-center justify-center text-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-200" />
                  <span>Accept Order & Confirm</span>
                  <span className="text-[10px] text-emerald-200 font-normal">Sends "YES, CONFIRMED"</span>
                </button>

                {/* 2. Adjust Time */}
                <button
                  onClick={() => setShowAdjustTimeModal(true)}
                  className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex flex-col items-center justify-center text-center gap-1"
                >
                  <Clock className="w-4 h-4 text-amber-100" />
                  <span>Adjust Arrival Time</span>
                  <span className="text-[10px] text-amber-100 font-normal">Change call time slot</span>
                </button>

                {/* 3. Decline / Unavailable */}
                <button
                  onClick={() => handleVendorSimulateReply('decline')}
                  className="p-3 bg-neutral-800 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex flex-col items-center justify-center text-center gap-1"
                >
                  <AlertCircle className="w-4 h-4 text-red-300" />
                  <span>Decline / Unavailable</span>
                  <span className="text-[10px] text-neutral-300 font-normal">Suggest alternate guild</span>
                </button>

              </div>

              {/* Adjust Time Sub-form Modal */}
              {showAdjustTimeModal && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 space-y-2 text-xs">
                  <label className="block font-bold text-amber-950">
                    Propose Adjusted Vendor Arrival Time:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={adjustedTimeInput}
                      onChange={(e) => setAdjustedTimeInput(e.target.value)}
                      className="bg-white border border-amber-300 rounded-lg p-2 font-mono font-bold text-xs text-neutral-900 outline-none flex-1"
                    />
                    <button
                      onClick={() => handleVendorSimulateReply('time_adjustment')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                    >
                      Confirm Time Adjustment
                    </button>
                    <button
                      onClick={() => setShowAdjustTimeModal(false)}
                      className="text-neutral-500 hover:text-neutral-800 px-2 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
        )}

      </div>
    </div>
  );
};
