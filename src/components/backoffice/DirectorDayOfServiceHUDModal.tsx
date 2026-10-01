import React, { useState, useEffect } from 'react';
import { 
  GoldenRecordCase, 
  DayOfServiceHUDData, 
  CortegeDriverDispatchItem, 
  SimulatedNotification 
} from '../../lib/types/funeral';
import { 
  getInitialDayOfServiceHUD 
} from '../../lib/data/dayOfServiceHUDHelper';
import { 
  Smartphone, 
  Car, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Users, 
  Send, 
  Check, 
  X, 
  QrCode, 
  Share2, 
  Flame, 
  Music, 
  Church, 
  ShieldCheck, 
  Navigation, 
  Sparkles,
  Printer
} from 'lucide-react';

interface DirectorDayOfServiceHUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  onUpdateCase: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
}

export const DirectorDayOfServiceHUDModal: React.FC<DirectorDayOfServiceHUDModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onUpdateCase,
  onSendNotification
}) => {
  const [hudData, setHudData] = useState<DayOfServiceHUDData>(() => {
    return caseData.dayOfServiceHUD || getInitialDayOfServiceHUD(caseData);
  });

  const [activeTab, setActiveTab] = useState<'cortege' | 'readiness' | 'timeline' | 'chapel_cue'>('cortege');
  const [selectedDriverForSms, setSelectedDriverForSms] = useState<CortegeDriverDispatchItem | null>(null);
  const [customSmsText, setCustomSmsText] = useState('');
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null);
  const [currentServiceTime, setCurrentServiceTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentServiceTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleUpdateDriverStatus = (driverId: string, newStatus: CortegeDriverDispatchItem['status']) => {
    const updatedDrivers = hudData.drivers.map(d => {
      if (d.id === driverId) {
        return { ...d, status: newStatus };
      }
      return d;
    });

    const updatedHud: DayOfServiceHUDData = {
      ...hudData,
      drivers: updatedDrivers
    };

    setHudData(updatedHud);
    onUpdateCase({
      ...caseData,
      dayOfServiceHUD: updatedHud
    });
  };

  const handleBroadcastAllDrivers = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const destination = caseData.serviceSelections.crematoryOrCemeteryName || 'Woodlawn Cemetery';

    const updatedDrivers = hudData.drivers.map(d => ({
      ...d,
      smsDispatchedAt: `Today ${timeNow}`,
      smsDelivered: true
    }));

    const updatedHud: DayOfServiceHUDData = {
      ...hudData,
      drivers: updatedDrivers,
      allDriversSmsDispatched: true,
      lastDriverSmsBroadcastAt: `Today ${timeNow}`
    };

    setHudData(updatedHud);

    const updatedCase: GoldenRecordCase = {
      ...caseData,
      dayOfServiceHUD: updatedHud,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Day-of-Service Director Pocket HUD',
          timestamp: timeNow,
          text: `1-Click SMS Cortege Run-Sheet broadcast dispatched to all ${updatedDrivers.length} motorcade drivers. Destination: ${destination}. Turn-by-turn routes delivered.`
        },
        ...caseData.notes
      ]
    };

    onUpdateCase(updatedCase);

    if (onSendNotification) {
      onSendNotification({
        id: `notif-cortege-broadcast-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: 'All Cortege Chauffeurs & Police Escort (7 Vehicles)',
        recipientPhone: '(212) 281-8850 Fleet Dispatch',
        channel: 'sms',
        type: 'partner_dispatch',
        title: `🚗 CORTEGE DISPATCH RUN-SHEET: ${caseData.decedent.legalName}`,
        bodyText: `BFH Cortege Run-Sheet Broadcast: Departure set for ${hudData.committalDepartureTime}. Route: 630 St. Nicholas Ave -> ${destination}. All drivers maintain assigned vehicle positions. Lead Car: #101.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    setBroadcastToast(`🚀 Instant SMS Run-Sheets Dispatched to all 7 Chauffeurs & Escort Details!`);
    setTimeout(() => setBroadcastToast(null), 5000);
  };

  const handleSendIndividualDriverSms = () => {
    if (!selectedDriverForSms) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = customSmsText || `BFH Dispatch Update for ${selectedDriverForSms.vehicleNumber}: Please prepare vehicle. Passengers: ${selectedDriverForSms.assignedPassengers.join(', ')}.`;

    const updatedDrivers = hudData.drivers.map(d => {
      if (d.id === selectedDriverForSms.id) {
        return {
          ...d,
          smsDispatchedAt: `Today ${timeNow}`,
          smsDelivered: true
        };
      }
      return d;
    });

    const updatedHud: DayOfServiceHUDData = {
      ...hudData,
      drivers: updatedDrivers
    };

    setHudData(updatedHud);
    onUpdateCase({
      ...caseData,
      dayOfServiceHUD: updatedHud
    });

    if (onSendNotification) {
      onSendNotification({
        id: `notif-driver-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: `${selectedDriverForSms.driverName} (${selectedDriverForSms.vehicleNumber})`,
        recipientPhone: selectedDriverForSms.driverPhone,
        channel: 'sms',
        type: 'partner_dispatch',
        title: `SMS to ${selectedDriverForSms.vehicleNumber}`,
        bodyText: msg,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    setSelectedDriverForSms(null);
    setCustomSmsText('');
    setBroadcastToast(`SMS sent to ${selectedDriverForSms.driverName} (${selectedDriverForSms.driverPhone})`);
    setTimeout(() => setBroadcastToast(null), 4000);
  };

  const handleToggleReadiness = (checkId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedChecklist = hudData.readinessChecklist.map(c => {
      if (c.id === checkId) {
        const nextStatus: 'pending' | 'confirmed_ready' = c.status === 'confirmed_ready' ? 'pending' : 'confirmed_ready';
        return {
          ...c,
          status: nextStatus,
          confirmedAt: nextStatus === 'confirmed_ready' ? timeNow : undefined
        };
      }
      return c;
    });

    const updatedHud: DayOfServiceHUDData = {
      ...hudData,
      readinessChecklist: updatedChecklist
    };

    setHudData(updatedHud);
    onUpdateCase({
      ...caseData,
      dayOfServiceHUD: updatedHud
    });
  };

  const servicePhases = [
    { title: '10:00 AM - Family Private Viewing', sub: 'Parlor A / Family Suite 1', icon: Church },
    { title: '10:30 AM - Public Viewing & Prelude', sub: 'Sanctuary Organ Prelude', icon: Music },
    { title: '11:00 AM - Sanctuary Service Commences', sub: 'Processional & Scripture', icon: Church },
    { title: '11:35 AM - Digi-Tribute 2.0 Audio Reel', sub: '360° Community Memories', icon: Sparkles },
    { title: '11:50 AM - Eulogy', sub: 'Rev. Dr. Calvin Butts IV', icon: Users },
    { title: '12:15 PM - Recessional to Hearse', sub: 'Active Pallbearers Escort', icon: Truck },
    { title: '12:30 PM - Cortege Motorcade Rolls', sub: 'Jerome Ave Woodlawn Gate', icon: Car },
    { title: '1:15 PM - Committal & Lowering', sub: 'Gravesite Canopy #412-B', icon: Flame },
    { title: '2:30 PM - BFH Fellowship Repast', sub: 'Benta Suite, 630 St. Nicholas', icon: Users }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 text-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-700 overflow-hidden flex flex-col max-h-[94vh]">

        {/* TOP HUD APP BAR */}
        <div className="bg-neutral-950 p-4 px-6 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400">
                  Director Day-of-Service Pocket HUD
                </span>
                <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse">
                  ● LIVE RUNTIME
                </span>
              </div>
              <h2 className="text-lg font-serif-title font-bold text-white">
                {caseData.decedent.legalName} • {caseData.caseNumber}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded-xl text-center hidden sm:block">
              <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-bold">Service Clock</span>
              <span className="font-mono text-xs font-bold text-amber-300">{currentServiceTime}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST ALERT */}
        {broadcastToast && (
          <div className="bg-amber-500 text-neutral-950 px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{broadcastToast}</span>
            </div>
            <button onClick={() => setBroadcastToast(null)} className="text-neutral-900 hover:text-black">✕</button>
          </div>
        )}

        {/* QUICK COMMAND ACTION BAR (1-CLICK SMS BROADCAST & STAGE COUNTER) */}
        <div className="bg-[#141b2b] border-b border-neutral-800 p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBroadcastAllDrivers}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-[#991b1b] hover:brightness-110 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center space-x-2 border border-amber-300/40"
            >
              <Send className="w-4 h-4 text-amber-200" />
              <span>1-Click SMS All 7 Cortege Chauffeurs</span>
            </button>

            <span className="text-xs text-neutral-400 hidden lg:inline font-light">
              Destination: <strong className="text-white">{caseData.serviceSelections.crematoryOrCemeteryName || 'Woodlawn Cemetery'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('chapel_cue')}
              className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-900 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Clergy/Music Cue Deck</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Run-Sheet</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-neutral-950 px-6 flex border-b border-neutral-800 shrink-0">
          <div className="flex space-x-2 py-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'cortege', label: '🚗 Cortege Chauffeur Dispatch', icon: Car, count: hudData.drivers.length },
              { id: 'readiness', label: '⚡ Chapel Readiness Checks', icon: ShieldCheck, count: hudData.readinessChecklist.filter(c => c.status === 'confirmed_ready').length },
              { id: 'timeline', label: '⏱️ Live Service Schedule', icon: Clock },
              { id: 'chapel_cue', label: '📖 Officiant & Musician Deck', icon: Church }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 bg-neutral-800 text-white rounded-full text-[10px] font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-neutral-900">

          {/* TAB 1: CORTEGE DRIVER DISPATCH BOARD */}
          {activeTab === 'cortege' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Motorcade Procession Sequence (7 Authorized Vehicles):</span>
                <span className="font-mono text-amber-300 font-bold">Departure Target: {hudData.committalDepartureTime}</span>
              </div>

              <div className="space-y-3">
                {hudData.drivers.map((driver, idx) => {
                  return (
                    <div
                      key={driver.id}
                      className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition space-y-3 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Vehicle Title & Role */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-sm text-white font-serif-title">
                                {driver.vehicleNumber}
                              </h3>
                              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                                {driver.plateNumber}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 font-light">
                              {driver.roleLabel} • {driver.vehicleModel}
                            </p>
                          </div>
                        </div>

                        {/* Driver Contact & SMS Status */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <div className="text-right hidden sm:block">
                            <span className="font-bold text-white block">{driver.driverName}</span>
                            <span className="text-[11px] text-neutral-400 font-mono">{driver.driverPhone}</span>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedDriverForSms(driver);
                              setCustomSmsText(`BFH Driver ${driver.vehicleNumber} Update: Stand by for departure to ${caseData.serviceSelections.crematoryOrCemeteryName || 'Woodlawn'}.`);
                            }}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 rounded-xl font-bold text-xs flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>SMS Driver</span>
                          </button>

                          <a
                            href={driver.turnByTurnUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-500/30 rounded-xl font-bold text-xs flex items-center space-x-1"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>GPS Route</span>
                          </a>
                        </div>

                      </div>

                      {/* Passenger Manifest & Instructions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                            Assigned Manifest (Seats {driver.capacity}):
                          </span>
                          <p className="text-neutral-200 font-medium mt-0.5">
                            {driver.assignedPassengers.join(' • ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                            Chauffeur Protocol:
                          </span>
                          <p className="text-neutral-400 font-light mt-0.5 text-[11px]">
                            {driver.specialInstructions}
                          </p>
                        </div>
                      </div>

                      {/* Live Status Selector */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
                          <span>Status:</span>
                          <select
                            value={driver.status}
                            onChange={(e) => handleUpdateDriverStatus(driver.id, e.target.value as any)}
                            className="bg-neutral-900 border border-neutral-700 text-white font-bold text-xs rounded-lg px-2.5 py-1 outline-none focus:border-amber-400"
                          >
                            <option value="standby">⏳ Standby at Base</option>
                            <option value="arrived_st_nicholas">📍 Arrived at 630 St. Nicholas Ave</option>
                            <option value="family_seated">👥 Family Seated in Vehicle</option>
                            <option value="rolling_in_cortege">🚗 Rolling in Motorcade</option>
                            <option value="arrived_at_cemetery">🪦 Arrived at Gravesite</option>
                          </select>
                        </div>

                        {driver.smsDispatchedAt && (
                          <span className="text-[11px] text-emerald-400 font-mono">
                            ✓ SMS Run-Sheet Dispatched ({driver.smsDispatchedAt})
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CHAPEL READINESS CHECKS */}
          {activeTab === 'readiness' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-400">
                1-Tap Operational Checkpoints before Service Commences:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hudData.readinessChecklist.map((check) => {
                  const isReady = check.status === 'confirmed_ready';

                  return (
                    <button
                      key={check.id}
                      onClick={() => handleToggleReadiness(check.id)}
                      className={`p-4 rounded-2xl border text-left transition space-y-2 flex flex-col justify-between ${
                        isReady
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 w-full">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                            {check.assignedTo}
                          </span>
                          <h4 className="font-serif-title font-bold text-sm text-white">
                            {check.title}
                          </h4>
                        </div>

                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isReady ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          <Check className="w-4 h-4 font-bold" />
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 font-light">
                        {check.notes}
                      </p>

                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className={isReady ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                          {isReady ? `✓ Confirmed at ${check.confirmedAt}` : '○ Pending Confirmation (Tap to verify)'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SERVICE SCHEDULE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">
                Chronological Service Run-Sheet & Key Transitions:
              </div>

              <div className="space-y-2.5">
                {servicePhases.map((phase, idx) => {
                  const Icon = phase.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-neutral-900 text-amber-300 border border-neutral-700 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">
                            {phase.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 font-light">
                            {phase.sub}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-neutral-500">
                        Phase #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CLERGY / MUSICIAN CUE DECK */}
          {activeTab === 'chapel_cue' && (
            <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-white flex items-center gap-2">
                    <Church className="w-5 h-5 text-purple-400" />
                    <span>Zero-Login Mobile "Chapel Cue Deck"</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Share this instant mobile link or QR code with Officiating Clergy, Musician, and AV Tech.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(hudData.chapelCueUrl);
                      setBroadcastToast('Chapel Cue Deck Link copied to clipboard!');
                      setTimeout(() => setBroadcastToast(null), 3000);
                    }}
                    className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Copy Cue Link</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    Officiating Clergy:
                  </span>
                  <p className="text-xs font-bold text-white">
                    {caseData.serviceSelections.officiantName || 'Rev. Dr. Calvin Butts IV'}
                  </p>
                  <p className="text-[11px] text-purple-300 font-mono">Eulogy Allotment: 15 Mins</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    Organist & Soloist:
                  </span>
                  <p className="text-xs font-bold text-white">
                    {caseData.serviceSelections.organistName || 'Dr. Julian Vance (Organ) • Danielle St. Claire (Solo)'}
                  </p>
                  <p className="text-[11px] text-amber-300 font-mono">Hymns: Amazing Grace, Precious Lord</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    Digi-Tribute Video Cue:
                  </span>
                  <p className="text-xs font-bold text-white">
                    Audio & Video Memory Reel (3 Mins)
                  </p>
                  <p className="text-[11px] text-emerald-300 font-mono">Cue Time: 11:35 AM (Post-Scripture)</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-neutral-800 text-center space-y-2">
                <span className="text-xs text-neutral-400 block font-mono">
                  Direct Clergy Mobile Deck URL:
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-700 select-all">
                  {hudData.chapelCueUrl}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-neutral-950 border-t border-neutral-800 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-400">
            Lead LFD: <strong className="text-white">{hudData.leadDirectorName}</strong> ({hudData.leadDirectorPhone})
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs rounded-xl transition shadow-xs"
          >
            Close Pocket HUD
          </button>
        </div>

        {/* INDIVIDUAL DRIVER SMS MODAL */}
        {selectedDriverForSms && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-neutral-900 max-w-md w-full rounded-2xl p-5 space-y-4 border border-neutral-700 shadow-2xl text-white">
              <div className="flex items-center justify-between">
                <h4 className="font-serif-title font-bold text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>SMS to {selectedDriverForSms.vehicleNumber}</span>
                </h4>
                <button onClick={() => setSelectedDriverForSms(null)} className="text-neutral-400 hover:text-white">✕</button>
              </div>

              <p className="text-xs text-neutral-400">
                Driver: <strong>{selectedDriverForSms.driverName}</strong> ({selectedDriverForSms.driverPhone})
              </p>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Dispatch Message Text:
                </label>
                <textarea
                  rows={3}
                  value={customSmsText}
                  onChange={(e) => setCustomSmsText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setSelectedDriverForSms(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendIndividualDriverSms}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
                >
                  Send Driver SMS
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
