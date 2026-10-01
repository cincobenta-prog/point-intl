import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Radio, 
  ShieldCheck, 
  Lock, 
  Settings, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  MessageSquare, 
  Globe, 
  Tv, 
  Download,
  Users,
  HardDrive
} from 'lucide-react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  getWebcastGatewayConfig, 
  saveWebcastGatewayConfig, 
  testWebcastConnection, 
  generateLiveStreamCredentials,
  INITIAL_REMOTE_MOURNER_MESSAGES,
  WebcastGatewayConfig, 
  WebcastProvider, 
  RemoteMournerMessage,
  CameraPresetAngle
} from '../../lib/services/webcastGatewayService';

interface WebcastLiveStreamHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: GoldenRecordCase[];
  activeCase?: GoldenRecordCase | null;
  selectedCaseId?: string;
  onSendNotification?: (notif: any) => void;
  onDispatchSMS?: (recipient: string, message: string) => void;
}

export const WebcastLiveStreamHubModal: React.FC<WebcastLiveStreamHubModalProps> = ({
  isOpen,
  onClose,
  cases,
  activeCase,
  selectedCaseId,
  onSendNotification,
  onDispatchSMS
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'studio' | 'security' | 'guestbook' | 'settings'>('studio');

  // Cases and selection
  const [selectedCase, setSelectedCase] = useState<GoldenRecordCase>(() => {
    if (activeCase) return activeCase;
    if (selectedCaseId) {
      const match = cases.find(c => c.id === selectedCaseId);
      if (match) return match;
    }
    return cases[0];
  });

  // Gateway Config State
  const [config, setConfig] = useState<WebcastGatewayConfig>(() => getWebcastGatewayConfig());
  
  // Live Studio State
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [activeCamera, setActiveCamera] = useState<CameraPresetAngle>('pulpit_wide');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isBlackoutActive, setIsBlackoutActive] = useState<boolean>(false);
  const [viewerCount, setViewerCount] = useState<number>(142);

  // Security & PIN State
  const [securityPin, setSecurityPin] = useState<string>(config.defaultSecurityPin || '8921');
  const [isPinRequired, setIsPinRequired] = useState<boolean>(config.isPinRequired ?? true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Guestbook State
  const [mournerMessages, setMournerMessages] = useState<RemoteMournerMessage[]>(INITIAL_REMOTE_MOURNER_MESSAGES);
  const [newMessageText, setNewMessageText] = useState('');
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderLocation, setNewSenderLocation] = useState('');

  // Settings form input states
  const [providerInput, setProviderInput] = useState<WebcastProvider>(config.provider);
  const [rtmpUrlInput, setRtmpUrlInput] = useState<string>(config.rtmpServerUrl);
  const [rtmpKeyInput, setRtmpKeyInput] = useState<string>(config.rtmpStreamKey);
  const [showRtmpKey, setShowRtmpKey] = useState<boolean>(false);
  const [embedUrlInput, setEmbedUrlInput] = useState<string>(config.channelEmbedUrl);
  const [chapelLocationInput, setChapelLocationInput] = useState<string>(config.chapelLocation);
  const [autoArchiveInput, setAutoArchiveInput] = useState<boolean>(config.recordingAutoArchive);

  // Async test status states
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; provider?: string; resolution?: string } | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteToast, setInviteToast] = useState<string | null>(null);

  // Dynamic Credentials
  const credentials = generateLiveStreamCredentials(selectedCase.caseNumber, securityPin);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddGuestbookMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !newSenderName.trim()) return;

    const newMsg: RemoteMournerMessage = {
      id: `msg-${Date.now()}`,
      senderName: newSenderName.trim(),
      location: newSenderLocation.trim() || 'Remote Attendee',
      relationship: 'Loved One',
      message: newMessageText.trim(),
      timestamp: 'Just now'
    };

    setMournerMessages([newMsg, ...mournerMessages]);
    setNewMessageText('');
    setNewSenderName('');
    setNewSenderLocation('');
    setViewerCount(prev => prev + 1);
  };

  const handleTogglePinMessage = (msgId: string) => {
    setMournerMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, isPinned: !m.isPinned };
      }
      return m;
    }));
  };

  const handleSendInviteSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePhone.trim()) return;

    const msg = `BENTA 4K WEBCAST INVITE: You are invited to the Celebration of Life for ${selectedCase.decedent.legalName}. Watch the live broadcast from Chapel 1: ${credentials.streamUrl} (Access PIN: ${isPinRequired ? securityPin : 'None'}).`;
    
    if (onDispatchSMS) {
      onDispatchSMS(invitePhone, msg);
    }

    if (onSendNotification) {
      onSendNotification({
        id: `notif-${Date.now()}`,
        caseId: selectedCase.id,
        decedentName: selectedCase.decedent.legalName,
        recipientName: inviteName || selectedCase.informant.fullName,
        recipientPhone: invitePhone,
        channel: 'sms',
        type: 'webcast_invite',
        title: '🎥 4K Webcast Access Dispatched',
        bodyText: msg,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    setInviteToast(`Live webcast invite sent to ${inviteName || invitePhone}!`);
    setInviteName('');
    setInvitePhone('');
    setTimeout(() => setInviteToast(null), 3500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testWebcastConnection({
      ...config,
      provider: providerInput,
      rtmpServerUrl: rtmpUrlInput.trim(),
      rtmpStreamKey: rtmpKeyInput.trim(),
      channelEmbedUrl: embedUrlInput.trim()
    });
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WebcastGatewayConfig = {
      ...config,
      provider: providerInput,
      rtmpServerUrl: rtmpUrlInput.trim(),
      rtmpStreamKey: rtmpKeyInput.trim(),
      channelEmbedUrl: embedUrlInput.trim(),
      chapelLocation: chapelLocationInput.trim(),
      defaultSecurityPin: securityPin.trim(),
      isPinRequired,
      recordingAutoArchive: autoArchiveInput,
      isLiveActive: true
    };
    saveWebcastGatewayConfig(updated);
    setConfig(updated);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  const cameraPresetLabels: Record<CameraPresetAngle, { label: string; desc: string; icon: string }> = {
    pulpit_wide: { label: 'Cam 1: Sanctuary Pulpit (Wide)', desc: 'Full altar, clergy podium & cross', icon: '🏛️' },
    rostrum_eulogist: { label: 'Cam 2: Eulogist Rostrum (Close-up)', desc: 'Family speaker & eulogy lectern', icon: '🎤' },
    choir_organ: { label: 'Cam 3: Pipe Organ & Sanctuary Choir', desc: 'Musical loft & guest soloists', icon: '🎹' },
    congregation_flowers: { label: 'Cam 4: Congregation & Floral Alcove', desc: 'Processional aisle & floral displays', icon: '💐' }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-950/40">
              <Video className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold text-amber-100">
                  Live 4K Webcasting Studio & Enterprise Gateway
                </h2>
                {isLiveStreaming ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/50 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    LIVE ON AIR • 4K UHD 60FPS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    STANDBY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Venue: <span className="text-amber-300 font-medium">Chapel 1 (Main Sanctuary)</span> • Stream Provider: <span className="text-slate-200 capitalize font-medium">{config.provider.replace('_', ' ')}</span> • {viewerCount} Connected Mourners
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Case Selection Dropdown */}
            {cases.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs shadow-sm">
                <span className="text-slate-400 font-semibold hidden md:inline">Broadcast Case:</span>
                <select
                  value={selectedCase.id}
                  onChange={(e) => {
                    const found = cases.find(c => c.id === e.target.value);
                    if (found) setSelectedCase(found);
                  }}
                  className="bg-slate-900 border border-slate-600 text-amber-300 font-bold rounded-lg px-2.5 py-1 text-xs outline-none focus:border-amber-400 cursor-pointer"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.decedent.legalName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'studio'
                ? 'border-red-500 text-red-300 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Chapel 1 Multi-Cam Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>PIN Guard & Invites</span>
          </button>

          <button
            onClick={() => setActiveTab('guestbook')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'guestbook'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Remote Condolence Stream ({mournerMessages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Vimeo / RTMP Gateway Config</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/90 custom-scrollbar">
          
          {/* TAB 1: MULTI-CAM STUDIO */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: 4K Live Broadcast Viewport */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Video Screen Container */}
                  <div className="relative aspect-video bg-black rounded-2xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
                    
                    {/* Background Simulated Live Video Feed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-10" />
                    
                    {/* Camera Feed Background Simulation */}
                    <div className={`absolute inset-0 transition-all duration-700 ${
                      isBlackoutActive 
                        ? 'bg-black' 
                        : activeCamera === 'pulpit_wide'
                        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40'
                        : activeCamera === 'rostrum_eulogist'
                        ? 'bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-900'
                        : activeCamera === 'choir_organ'
                        ? 'bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900'
                        : 'bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-900'
                    }`}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
                    </div>

                    {/* Top Overlay HUD */}
                    <div className="relative z-20 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2.5 py-1 rounded-md bg-red-600/90 text-white font-bold text-[11px] flex items-center gap-1.5 shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          LIVE ON AIR
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-amber-300 font-mono text-[11px] border border-amber-500/30">
                          {cameraPresetLabels[activeCamera].label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-300 bg-black/60 backdrop-blur px-3 py-1 rounded-md border border-slate-700">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>{viewerCount} Remote Viewers</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-emerald-400">4K 60FPS</span>
                      </div>
                    </div>

                    {/* Center Screen State / Pinned Tribute Overlay */}
                    <div className="relative z-20 my-auto text-center space-y-2">
                      {isBlackoutActive ? (
                        <div className="p-4 rounded-xl bg-black/80 border border-slate-800 max-w-sm mx-auto">
                          <EyeOff className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                          <p className="text-sm font-bold text-slate-200">Broadcast Privacy Hold Active</p>
                          <p className="text-xs text-slate-400">Sanctuary camera muted for private family prayer</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-widest text-amber-300/80 font-serif">
                            Benta's Funeral Home • Sanctuary Feed
                          </p>
                          <h3 className="text-2xl font-serif font-bold text-white tracking-wide drop-shadow-md">
                            Celebration of Life for {selectedCase.decedent.legalName}
                          </h3>
                          <p className="text-xs text-slate-300 font-serif italic">
                            Live from Chapel 1 • Multi-Camera NDI 4K Array
                          </p>

                          {/* Pinned tribute ticker */}
                          {mournerMessages.find(m => m.isPinned) && (
                            <div className="mt-3 mx-auto max-w-md p-2.5 rounded-xl bg-slate-900/85 backdrop-blur border border-amber-500/40 text-left flex items-start space-x-2.5 shadow-xl">
                              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="text-[11px] leading-snug">
                                <span className="font-bold text-amber-300">{mournerMessages.find(m => m.isPinned)?.senderName} ({mournerMessages.find(m => m.isPinned)?.location}):</span>
                                <span className="text-slate-200 ml-1">"{mournerMessages.find(m => m.isPinned)?.message}"</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Video Controls Bar */}
                    <div className="relative z-20 flex items-center justify-between text-xs bg-black/70 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/60">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsAudioMuted(!isAudioMuted)}
                          className={`p-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
                            isAudioMuted ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                          title="Toggle Master Soundboard Feed"
                        >
                          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                          <span className="text-[11px] font-semibold">{isAudioMuted ? 'Muted' : 'Soundboard LIVE (-14 LUFS)'}</span>
                        </button>

                        <button
                          onClick={() => setIsBlackoutActive(!isBlackoutActive)}
                          className={`p-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
                            isBlackoutActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                          title="Privacy Hold / Blackout Feed"
                        >
                          {isBlackoutActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          <span className="text-[11px] font-semibold">{isBlackoutActive ? 'End Blackout' : 'Privacy Hold'}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                          className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center space-x-1.5 shadow ${
                            isLiveStreaming 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          <span>{isLiveStreaming ? 'Cut Broadcast' : 'Go Live 🔴'}</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Camera PTZ Angle Switcher Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Live Multi-Camera Switcher (PTZ NDI Presets)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(['pulpit_wide', 'rostrum_eulogist', 'choir_organ', 'congregation_flowers'] as CameraPresetAngle[]).map((cam) => {
                        const info = cameraPresetLabels[cam];
                        const isActive = activeCamera === cam;
                        return (
                          <button
                            key={cam}
                            onClick={() => setActiveCamera(cam)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isActive
                                ? 'bg-amber-500/20 border-amber-500 text-slate-100 shadow-md shadow-amber-950/40'
                                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-base">{info.icon}</span>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              )}
                            </div>
                            <p className="text-xs font-bold text-amber-200">{info.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{info.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Column: Broadcast Telemetry & Audio Levels */}
                <div className="space-y-4">
                  
                  {/* Audio & Video Signal Telemetry Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-950 border border-slate-700 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <h4 className="text-xs font-bold text-amber-100 uppercase tracking-wider">Broadcast Telemetry</h4>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        HEALTHY
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Stream Provider</span>
                        <span className="font-semibold text-slate-200 capitalize">{config.provider.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Video Encoding</span>
                        <span className="font-mono text-emerald-400 font-semibold">3840x2160 (4K UHD) @ 60 FPS</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Average Bitrate</span>
                        <span className="font-mono text-slate-200">6.85 Mbps (H.265 / HEVC)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Audio Loudness</span>
                        <span className="font-mono text-emerald-400 font-semibold">-14.2 LUFS (Stereo 48kHz)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Glass-to-Glass Latency</span>
                        <span className="font-mono text-slate-200">1.2s Low-Latency RTMP</span>
                      </div>
                    </div>

                    {/* Animated Audio VU Meter Simulation */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>L/R Soundboard Master</span>
                        <span className="text-emerald-400">Stereo Normalized</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1 h-2">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-full rounded-sm transition-all ${
                              i < 8 
                                ? 'bg-emerald-500' 
                                : i < 10 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* S3 Recording & Archival Card */}
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3 text-xs">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold">
                      <HardDrive className="w-4 h-4 text-amber-400" />
                      <span>Archival Cloud Recording</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Broadcast is automatically recorded in 4K ProRes 422 and synced to the family's <strong>bfh-golden-records-vault</strong> S3 bucket upon service completion.
                    </p>
                    <button
                      onClick={() => alert(`Master 4K recording queued for archival export for ${selectedCase.caseNumber}`)}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download 4K Master MP4</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SECURITY PIN & INVITES */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {inviteToast && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-emerald-200 animate-fadeIn shadow-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium">{inviteToast}</span>
                  </div>
                  <span className="text-xs text-emerald-400/80">Twilio Cellular SMS Gateway</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Col: Security PIN Configuration */}
                <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-amber-100 uppercase tracking-wider">Mourner PIN Protection Guard</h4>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isPinRequired}
                        onChange={(e) => setIsPinRequired(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-slate-300 font-medium">Require PIN for Access</span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-300 uppercase">
                      4-Digit Family Security PIN
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          maxLength={6}
                          value={securityPin}
                          onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                          disabled={!isPinRequired}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xl font-mono tracking-widest text-amber-300 text-center font-bold focus:outline-none focus:border-amber-500 disabled:opacity-40"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSecurityPin(Math.floor(1000 + Math.random() * 9000).toString())}
                        disabled={!isPinRequired}
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-40"
                      >
                        Generate Random PIN
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Remote mourners arriving at the live stream URL will be prompted to enter this PIN before video unlocks.
                    </p>
                  </div>

                  {/* Shareable Link Card */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase block">Direct Live Webcast URL</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={credentials.streamUrl}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 select-all"
                      />
                      <button
                        onClick={() => handleCopy(credentials.streamUrl)}
                        className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center space-x-1"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Col: Instant SMS Webcast Invite Dispatcher */}
                <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-amber-100 uppercase tracking-wider">Dispatch SMS Webcast Invites</h4>
                  </div>

                  <form onSubmit={handleSendInviteSMS} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Remote Mourner / Family Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aunt Patricia Vance (London)"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Mobile Phone Number (E.164 Format)</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 019-2831"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                      Preview: "BENTA 4K WEBCAST INVITE: You are invited to the Celebration of Life for {selectedCase.decedent.legalName}. Watch live: {credentials.streamUrl}"
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md shadow-emerald-950"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Webcast Link via Twilio SMS Gateway</span>
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: REMOTE CONDOLENCE GUESTBOOK STREAM */}
          {activeTab === 'guestbook' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100">Live Remote Condolence & Guestbook Stream</h3>
                  <p className="text-xs text-slate-400">Incoming reflections from remote mourners attending the live sanctuary broadcast worldwide</p>
                </div>
                <button
                  onClick={() => alert(`Exported ${mournerMessages.length} condolence messages to family PDF keepsake.`)}
                  className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export Guestbook to PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Message Feed */}
                <div className="lg:col-span-2 space-y-3">
                  {mournerMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        msg.isPinned
                          ? 'bg-amber-500/15 border-amber-500/80 shadow-md shadow-amber-950/40'
                          : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-bold text-amber-200">{msg.senderName}</h4>
                          <span className="text-[11px] text-slate-400">({msg.location})</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                          <button
                            onClick={() => handleTogglePinMessage(msg.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              msg.isPinned 
                                ? 'bg-amber-500 text-slate-950 font-bold' 
                                : 'bg-slate-700 text-slate-300 hover:text-amber-300'
                            }`}
                          >
                            {msg.isPinned ? '📌 Pinned to Screen' : 'Pin to Overlay'}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 mt-2 leading-relaxed font-serif">
                        "{msg.message}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Right Col: Add New Message Simulation */}
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Add Remote Guestbook Note</h4>
                  
                  <form onSubmit={handleAddGuestbookMessage} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rev. Marcus Holloway"
                        value={newSenderName}
                        onChange={(e) => setNewSenderName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Toronto, Canada"
                        value={newSenderLocation}
                        onChange={(e) => setNewSenderLocation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Condolence Message</label>
                      <textarea
                        rows={3}
                        placeholder="Write a message of comfort..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-950"
                    >
                      Post to Live Stream
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: VIMEO / ONEROOM / RTMP CONFIG */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100">Live 4K Broadcast Server & RTMP Key Settings</h3>
                  <p className="text-xs text-slate-400">Configure Vimeo Enterprise, OneRoom, YouTube Live or direct RTMP endpoints</p>
                </div>
                {saveSuccessToast && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Webcast Configuration Saved
                  </span>
                )}
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' : 'bg-red-950/80 border-red-500/50 text-red-200'} flex items-start justify-between space-y-1`}>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{testResult.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Latency: {testResult.latencyMs}ms • Resolution: {testResult.resolution} • Provider: {testResult.provider}</p>
                    </div>
                  </div>
                  <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Provider & RTMP Keys */}
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Enterprise Streaming Provider & RTMP Credentials</h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Broadcasting Platform</label>
                        <select
                          value={providerInput}
                          onChange={(e) => setProviderInput(e.target.value as WebcastProvider)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        >
                          <option value="vimeo_enterprise">Vimeo Enterprise Live (Recommended)</option>
                          <option value="oneroom">OneRoom Funerals Broadcast Engine</option>
                          <option value="youtube_live">YouTube Live 4K Ultra-HD</option>
                          <option value="custom_rtmp">Custom Secure RTMP Media Server</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">RTMP Server Ingest URL</label>
                        <input
                          type="text"
                          value={rtmpUrlInput}
                          onChange={(e) => setRtmpUrlInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-slate-300 font-medium">RTMP Streaming Key</label>
                          <button
                            type="button"
                            onClick={() => setShowRtmpKey(!showRtmpKey)}
                            className="text-[11px] text-amber-400 hover:underline"
                          >
                            {showRtmpKey ? 'Hide Key' : 'Show Key'}
                          </button>
                        </div>
                        <input
                          type={showRtmpKey ? 'text' : 'password'}
                          value={rtmpKeyInput}
                          onChange={(e) => setRtmpKeyInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Live Channel Embed Player URL</label>
                        <input
                          type="text"
                          value={embedUrlInput}
                          onChange={(e) => setEmbedUrlInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Chapel Setup & Archival Defaults */}
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Sanctuary Hardware & Archival Policy</h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Chapel Location & Sanctuary Room</label>
                        <input
                          type="text"
                          value={chapelLocationInput}
                          onChange={(e) => setChapelLocationInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <label className="flex items-center space-x-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoArchiveInput}
                            onChange={(e) => setAutoArchiveInput(e.target.checked)}
                            className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="font-semibold text-slate-200">Auto-Archive 4K Masters to S3 Storage</span>
                        </label>
                        <p className="text-[11px] text-slate-400 pl-6">
                          Automatically creates a permanent, pristine recording in the BFH Golden Records Cloud Vault.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <p className="font-semibold text-amber-200">Hardware Switcher Status:</p>
                        <p className="text-[11px] text-slate-300">
                          Sony FX6 + PTZOptics 30X NDI 4K (4 Input Channels) connected via Gigabit Sanctuary LAN.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Radio className="w-4 h-4 text-emerald-400" />}
                    <span>Test RTMP Handshake & Video Ping</span>
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-950"
                  >
                    Save Webcast Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vimeo Enterprise 4K Ultra-HD Broadcaster Active</span>
          </div>
          <span>Benta's Funeral Home, Inc. • 630 St. Nicholas Ave, Harlem NYC</span>
        </div>

      </div>
    </div>
  );
};
