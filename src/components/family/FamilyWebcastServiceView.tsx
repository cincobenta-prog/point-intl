import React, { useState, useEffect } from 'react';
import { 
  GoldenRecordCase, 
  WebcastShareInvite,
  SimulatedNotification
} from '../../lib/types/funeral';
import { 
  Calendar, 
  Clock, 
  Send, 
  Mail, 
  Smartphone, 
  Copy, 
  Check, 
  QrCode, 
  Printer, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Users, 
  Church, 
  ArrowLeft,
  X,
  Globe
} from 'lucide-react';

interface FamilyWebcastServiceViewProps {
  activeCase: GoldenRecordCase;
  onBackToWelcome?: () => void;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenScheduleModal?: () => void;
}

export const FamilyWebcastServiceView: React.FC<FamilyWebcastServiceViewProps> = ({
  activeCase,
  onBackToWelcome,
  onUpdateCase,
  onSendNotification,
  onOpenScheduleModal
}) => {
  const webcast = activeCase.webcastSchedule || {
    isEnabled: true,
    venueId: 'chapel_1',
    venueName: 'Chapel 1 (Main Sanctuary)',
    streamStatus: 'scheduled',
    broadcastDate: activeCase.serviceSelections.serviceDate || '2026-09-22',
    broadcastStartTime: '10:30 AM',
    broadcastEndTime: '01:00 PM',
    assignedDirector: 'Jason Benta, LFD',
    assignedAvTech: 'Marcus Vance (Harlem Media AV)',
    avTechPhone: '(212) 555-4920',
    streamUrl: `https://broadcast.e-bfh.com/live/${activeCase.caseNumber}`,
    isPinProtected: false,
    securityPin: '',
    cameraPresets: ['Pulpit Sanctuary Wide', 'Casket & Floral Alcove', 'Choir & Pipe Organ', 'Family Pew Front View'],
    audioBoardVerified: true,
    recordingArchived: false,
    estimatedViewers: 120,
    notes: 'Sanctuary 4K PTZ Camera array active. Direct soundboard feed. Open worldwide access.'
  };

  // Video Player Preview State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCameraAngle, setCurrentCameraAngle] = useState(0);
  const [liveViewerCount] = useState(webcast.estimatedViewers || 94);

  // Countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Webcast Share Invites State
  const [shares, setShares] = useState<WebcastShareInvite[]>(
    activeCase.webcastShares || [
      {
        id: 'ws-1',
        caseId: activeCase.id,
        recipientName: 'Aunt Evelyn Vance',
        recipientContact: '(312) 555-8120',
        channel: 'sms',
        sentAt: 'Sep 18, 2026 2:15 PM',
        status: 'opened',
        viewerLocation: 'Chicago, IL'
      },
      {
        id: 'ws-2',
        caseId: activeCase.id,
        recipientName: 'Dr. Gregory Vance',
        recipientContact: 'gregory.vance@oxford-med.ac.uk',
        channel: 'email',
        sentAt: 'Sep 18, 2026 3:30 PM',
        status: 'watching',
        viewerLocation: 'London, United Kingdom'
      },
      {
        id: 'ws-3',
        caseId: activeCase.id,
        recipientName: 'Abyssinian Senior Deacon Circle',
        recipientContact: '(917) 555-0914',
        channel: 'whatsapp',
        sentAt: 'Sep 18, 2026 4:10 PM',
        status: 'delivered',
        viewerLocation: 'Harlem, NYC'
      }
    ]
  );

  // Share Dispatch Form State
  const [shareChannel, setShareChannel] = useState<'sms' | 'email'>('sms');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const customMessage = `You are warmly invited to celebrate the life of ${activeCase.decedent.legalName}. Join us in person or watch the live 4K sanctuary webcast: ${webcast.streamUrl} (Open to all family and friends worldwide).`;
  
  // UI Modals & Toast
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Copied ${label} to clipboard!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientContact.trim()) return;

    const newInvite: WebcastShareInvite = {
      id: `ws-${Date.now()}`,
      caseId: activeCase.id,
      recipientName: recipientName.trim(),
      recipientContact: recipientContact.trim(),
      channel: shareChannel,
      sentAt: 'Just now',
      status: 'sent',
      viewerLocation: 'Remote Guest'
    };

    const updatedShares = [newInvite, ...shares];
    setShares(updatedShares);

    if (onUpdateCase) {
      onUpdateCase({
        ...activeCase,
        webcastShares: updatedShares
      });
    }

    if (onSendNotification) {
      onSendNotification({
        id: `notif-webcast-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: recipientName.trim(),
        recipientPhone: shareChannel === 'sms' ? recipientContact.trim() : activeCase.informant.phone,
        recipientEmail: shareChannel === 'email' ? recipientContact.trim() : undefined,
        channel: shareChannel === 'sms' ? 'sms' : 'email',
        type: 'webcast_invite',
        title: `Live Service Webcast Invitation: ${activeCase.decedent.legalName}`,
        bodyText: `${customMessage}\n\nLive Broadcast Venue: ${webcast.venueName}\nDate: ${webcast.broadcastDate} at ${webcast.broadcastStartTime}\nLink: ${webcast.streamUrl} (Open Access)`,
        status: 'delivered',
        sentAt: 'Just now'
      });
    }

    setToastMessage(`Webcast invitation dispatched to ${recipientName.trim()} via ${shareChannel.toUpperCase()}!`);
    setTimeout(() => setToastMessage(null), 4000);

    setRecipientName('');
    setRecipientContact('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Universal Navigation Button Back to Welcome Page */}
      <div className="flex items-center justify-between">
        {onBackToWelcome && (
          <button
            onClick={onBackToWelcome}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xl font-bold text-xs transition border border-neutral-300 shadow-xs group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#991b1b] group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Welcome Page</span>
          </button>
        )}
        <div className="flex items-center space-x-2 text-xs text-neutral-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Open Access Webcast • Worldwide Broadcast</span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141b2b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400 flex items-center space-x-3 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO HEADER BANNER */}
      <div className="bg-gradient-to-br from-[#141b2b] via-[#1f293d] to-[#2c1d11] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-red-600/30 border border-red-500/60 text-red-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>4K HD Sanctuary Webcasting</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-400/40 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Open Access • No PIN Required</span>
            </span>
            <span className="bg-amber-400/20 text-amber-200 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-400/40">
              {webcast.venueName}
            </span>
          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide">
            Live Webcast & Complete Service Information
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
            All family members, relatives, and friends worldwide can join the celebration of life for <strong className="text-amber-200">{activeCase.decedent.legalName}</strong> directly in high-definition video with direct soundboard audio. No PIN or password is required for any viewer.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCopyText(webcast.streamUrl, 'Webcast URL')}
              className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/30 cursor-pointer"
            >
              <Copy className="w-4 h-4 text-amber-300" />
              <span>Copy Direct Webcast Link ({webcast.streamUrl.replace('https://', '')})</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 border border-neutral-600 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Keepsake Service Bulletin (with QR)</span>
            </button>

            {onOpenScheduleModal && (
              <button
                onClick={onOpenScheduleModal}
                className="bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition border border-amber-500/50 flex items-center space-x-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Director Scheduling Controls</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN GRID: LIVE PLAYER & DISPATCH SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: LIVE BROADCAST PLAYER (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* HD Broadcast Player Card */}
          <div className="bg-[#0f1522] rounded-3xl overflow-hidden border-2 border-neutral-800 shadow-2xl space-y-0">
            
            {/* Player Top Bar */}
            <div className="bg-[#141b2b] px-4 py-3 border-b border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  {webcast.streamStatus === 'live' ? '🔴 LIVE STREAMING NOW' : 'SANCTUARY BROADCAST FEED'}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-amber-400 font-bold">{webcast.venueName}</span>
              </div>

              <div className="flex items-center space-x-3 text-neutral-400 text-[11px]">
                <span className="flex items-center space-x-1 text-emerald-400 font-mono font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{liveViewerCount} tuned in</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700/40 font-mono text-[10px]">
                  <Globe className="w-3 h-3" />
                  <span>Open Access</span>
                </span>
              </div>
            </div>

            {/* Video Stage / Canvas */}
            <div className="relative aspect-video bg-gradient-to-b from-neutral-900 to-black flex items-center justify-center group overflow-hidden">
              
              {/* Background Sanctuary Ambience Simulation */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${isPlaying ? 'opacity-80 scale-105' : 'opacity-40 filter blur-xs'}`}
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80')`
                }}
              />

              {/* Dignified Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1522] via-transparent to-black/60 pointer-events-none" />

              {/* Watermark Crest */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="text-[10px] font-bold tracking-widest text-amber-400/90 uppercase font-serif-title bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-amber-500/20">
                  BENTA'S HARLEM SANCTUARY 4K • OPEN BROADCAST
                </span>
              </div>

              {/* Center Play Overlay / Countdown */}
              {!isPlaying ? (
                <div className="relative z-20 text-center space-y-4 p-6 max-w-md">
                  <div className="bg-black/80 backdrop-blur-md border border-amber-500/40 p-5 rounded-3xl shadow-2xl space-y-3">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      Broadcast Service Countdown
                    </span>
                    
                    {/* Countdown Clock */}
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-700">
                        <span className="text-2xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-[9px] text-neutral-400 block uppercase">Hours</span>
                      </div>
                      <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-700">
                        <span className="text-2xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[9px] text-neutral-400 block uppercase">Mins</span>
                      </div>
                      <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-700">
                        <span className="text-2xl font-bold text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-[9px] text-neutral-400 block uppercase">Secs</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-300">
                      Scheduled for <strong>{webcast.broadcastDate}</strong> at <strong>{webcast.broadcastStartTime}</strong>
                    </div>

                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-full bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg shadow-red-950/40 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current text-amber-300" />
                      <span>Start Webcast Preview Stream</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Streaming Feed active */
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-20">
                  <div className="flex justify-end">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-md">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      <span>LIVE PREVIEW</span>
                    </span>
                  </div>

                  {/* Sanctuary Caption Overlay */}
                  <div className="bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white max-w-sm">
                    <div className="text-[11px] font-serif-title font-bold text-amber-300">
                      Celebrating the Life of {activeCase.decedent.legalName}
                    </div>
                    <div className="text-[10px] text-neutral-300">
                      Current View: {webcast.cameraPresets[currentCameraAngle] || 'Sanctuary Main Pulpit'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Player Controls Toolbar */}
            <div className="bg-[#141b2b] p-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-neutral-400 text-[11px]">
                  Audio board direct feed • 4K HDR
                </span>
              </div>

              {/* Multi-Camera Angle Selector */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mr-1">
                  Camera:
                </span>
                {webcast.cameraPresets.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentCameraAngle(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                      currentCameraAngle === idx
                        ? 'bg-[#991b1b] text-white font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Cam {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Service Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Sanctuary Service Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <div className="font-bold text-neutral-900 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#991b1b]" />
                  <span>Sanctuary Service</span>
                </div>
                <div className="text-neutral-600">{webcast.broadcastDate}</div>
                <div className="text-neutral-500 font-mono text-[11px]">{webcast.broadcastStartTime} - {webcast.broadcastEndTime}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <div className="font-bold text-neutral-900 flex items-center space-x-1.5">
                  <Church className="w-3.5 h-3.5 text-[#991b1b]" />
                  <span>Service Venue</span>
                </div>
                <div className="text-neutral-600">{webcast.venueName}</div>
                <div className="text-neutral-500 text-[11px]">630 St. Nicholas Ave, Harlem, NYC</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SHARE SUITE & GUESTBOOK (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dispatch Webcast Links Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-serif-title text-base font-bold text-neutral-900">
                  Share Webcast Link with Family
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Send the direct live stream link via SMS text message or Email.
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                No PIN Gate
              </span>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShareChannel('sms')}
                  className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 border transition cursor-pointer ${
                    shareChannel === 'sms'
                      ? 'bg-[#991b1b] text-white border-transparent shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS Text Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareChannel('email')}
                  className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 border transition cursor-pointer ${
                    shareChannel === 'email'
                      ? 'bg-[#991b1b] text-white border-transparent shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Invitation</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-800 text-[11px]">Recipient Full Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Aunt Evelyn Vance"
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-800 text-[11px]">
                  {shareChannel === 'sms' ? 'Mobile Phone Number' : 'Email Address'}
                </label>
                <input
                  type={shareChannel === 'sms' ? 'tel' : 'email'}
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  placeholder={shareChannel === 'sms' ? '(212) 555-0199' : 'relative@example.com'}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-md shadow-red-950/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Send {shareChannel.toUpperCase()} Webcast Invite</span>
              </button>
            </form>

            {/* Dispatched Invites Ledger */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-700 block">
                Dispatched Invitations ({shares.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map((sh) => (
                  <div key={sh.id} className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-neutral-900">{sh.recipientName}</div>
                      <div className="text-[10px] text-neutral-500">{sh.recipientContact} • {sh.viewerLocation}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {sh.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Share Link Pill */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <Globe className="w-4 h-4 text-amber-700" />
              <span>Universal Shareable Webcast Link</span>
            </div>
            <div className="bg-white border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono text-neutral-700">
              <span className="truncate pr-2">{webcast.streamUrl}</span>
              <button
                onClick={() => handleCopyText(webcast.streamUrl, 'Webcast URL')}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded-lg font-sans font-bold text-[10px] shrink-0 cursor-pointer"
              >
                Copy
              </button>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Anyone with this link can watch the sanctuary broadcast in real-time. No login or PIN required.
            </p>
          </div>
        </div>

      </div>

      {/* 3. PRINTABLE BULLETIN MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                  Printable Service Bulletin & Webcast Pass
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bulletin Preview Card */}
            <div className="border-2 border-neutral-800 p-6 rounded-2xl space-y-4 font-serif text-center bg-amber-50/20">
              <div className="text-xs uppercase tracking-widest text-[#991b1b] font-bold">
                Benta's Funeral Home, Inc. • Harlem, NYC
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Celebration of Life & Homegoing Service
              </h2>
              <div className="text-lg text-amber-900 font-bold">
                {activeCase.decedent.legalName}
              </div>
              <div className="text-xs text-neutral-500">
                {activeCase.decedent.dateOfBirth} — {activeCase.decedent.dateOfDeath}
              </div>

              <div className="pt-4 border-t border-neutral-200 text-left font-sans text-xs space-y-2">
                <div><strong>Sanctuary Service:</strong> {webcast.broadcastDate} at {webcast.broadcastStartTime}</div>
                <div><strong>Venue:</strong> {webcast.venueName} (630 Saint Nicholas Ave, Harlem, NY)</div>
                <div><strong>Live 4K Webcast URL:</strong> {webcast.streamUrl} (Open to all family and friends)</div>
              </div>

              <div className="pt-4 flex flex-col items-center justify-center space-y-2">
                <div className="w-28 h-28 bg-white border border-neutral-300 rounded-xl p-2 flex items-center justify-center shadow-xs">
                  <QrCode className="w-full h-full text-neutral-900" />
                </div>
                <div className="text-[10px] font-sans font-bold text-neutral-600">
                  Scan QR code to stream directly on any smartphone or tablet
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-800"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center space-x-2 shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Print Bulletin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
