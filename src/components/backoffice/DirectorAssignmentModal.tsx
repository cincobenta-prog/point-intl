import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Smartphone, 
  Users, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { 
  ServiceDirectorAssignment, 
  DirectorProfile, 
  ServiceAssignmentStatus
} from '../../lib/types/funeral';

interface DirectorAssignmentModalProps {
  isOpen: boolean;
  assignment: ServiceDirectorAssignment | null;
  directors: DirectorProfile[];
  onClose: () => void;
  onSaveAssignment: (updatedAssignment: ServiceDirectorAssignment) => void;
}

export const DirectorAssignmentModal: React.FC<DirectorAssignmentModalProps> = ({
  isOpen,
  assignment,
  directors,
  onClose,
  onSaveAssignment
}) => {
  if (!isOpen || !assignment) return null;

  const [filterType, setFilterType] = useState<'all' | 'in_house' | 'outsourced'>('all');
  const [selectedDirectorId, setSelectedDirectorId] = useState<string>(assignment.assignedDirectorId || '');
  const [callTime, setCallTime] = useState<string>(assignment.callTime || '9:30 AM');
  const [attire, setAttire] = useState<ServiceDirectorAssignment['uniformAttireRequired']>(
    assignment.uniformAttireRequired || 'BFH Formal Morning Coat'
  );
  const [specialInstructions, setSpecialInstructions] = useState<string>(assignment.specialInstructions || '');
  const [activeTab, setActiveTab] = useState<'select' | 'sms_simulator'>('select');

  // SMS Simulator state
  const [smsThread, setSmsThread] = useState(
    assignment.dispatchSmsThread || [
      {
        id: `sms-init-${Date.now()}`,
        sender: 'manager' as const,
        text: `BFH SERVICE DISPATCH: Order for ${assignment.decedentName} (Case #${assignment.caseNumber}) on ${assignment.serviceDate} (${assignment.serviceTime}). Call time: ${callTime}. Venue: ${assignment.venueName}. Uniform: ${attire}. Please reply ACCEPT to confirm.`,
        timestamp: 'Just now'
      }
    ]
  );
  const [simulatedStatus, setSimulatedStatus] = useState<ServiceAssignmentStatus>(assignment.status);

  const selectedDirector = directors.find(d => d.id === selectedDirectorId);

  const filteredDirectors = directors.filter(d => {
    if (filterType === 'in_house') return d.type === 'in_house';
    if (filterType === 'outsourced') return d.type === 'outsourced';
    return true;
  });

  const handleSimulateDirectorAccept = () => {
    const directorMsg = {
      id: `sms-dir-${Date.now()}`,
      sender: 'director' as const,
      text: `ACCEPT: Confirmed for ${assignment.serviceDate} at ${callTime}. I will arrive at ${assignment.venueName} in ${attire}. Service sheet reviewed.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSmsThread(prev => [...prev, directorMsg]);
    setSimulatedStatus('confirmed');
  };

  const handleSimulateDirectorDecline = () => {
    const directorMsg = {
      id: `sms-dir-${Date.now()}`,
      sender: 'director' as const,
      text: `DECLINE: Apologies, I have a prior church obligation at that exact call time. Please dispatch alternate guild director.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSmsThread(prev => [...prev, directorMsg]);
    setSimulatedStatus('declined');
  };

  const handleSave = () => {
    if (!selectedDirector) return;

    const updated: ServiceDirectorAssignment = {
      ...assignment,
      assignedDirectorId: selectedDirector.id,
      assignedDirectorName: selectedDirector.name,
      directorType: selectedDirector.type,
      directorLicense: selectedDirector.licenseNumber,
      callTime,
      uniformAttireRequired: attire,
      specialInstructions,
      status: simulatedStatus === 'unassigned' ? 'confirmed' : simulatedStatus,
      dispatchSmsThread: smsThread
    };

    onSaveAssignment(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden font-sans">
        
        {/* Top Crimson Header Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#991b1b] via-[#831818] to-[#991b1b] text-white flex justify-between items-start shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/30 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>NYS Licensed Funeral Director Scheduling & Dispatch Studio</span>
            </div>
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold">
              Director Assignment: {assignment.decedentName}
            </h2>
            <p className="text-xs text-red-100 font-light">
              Case <strong className="text-amber-200 font-mono">{assignment.caseNumber}</strong> • {assignment.serviceType} • {assignment.serviceDate} ({assignment.serviceTime})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-100 px-6 py-2.5 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('select')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'select'
                  ? 'bg-white text-[#991b1b] shadow-xs border border-neutral-200'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>1. Director Selection & Overtime Optimizer</span>
            </button>

            <button
              onClick={() => setActiveTab('sms_simulator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'sms_simulator'
                  ? 'bg-white text-[#991b1b] shadow-xs border border-neutral-200'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>2. Two-Way SMS Dispatch Simulator</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                simulatedStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {simulatedStatus.toUpperCase()}
              </span>
            </button>
          </div>

          <div className="text-xs text-neutral-500 hidden sm:flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Call Time: <strong>{callTime}</strong></span>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {activeTab === 'select' ? (
            <>
              {/* Service Summary & Venue Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Venue Location</span>
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <MapPin className="w-3.5 h-3.5 text-[#991b1b]" />
                    <span>{assignment.venueName}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{assignment.venueAddress}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Attendance & Ceremony</span>
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    <span>~{assignment.estimatedAttendance} Guests Expected</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{assignment.vipProtocols?.join(' • ') || 'Standard Chapel Liturgy'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Current Scheduling Status</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      assignment.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : assignment.status === 'unassigned'
                        ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {assignment.status === 'unassigned' ? '⚠️ Director Needed' : assignment.status.toUpperCase()}
                    </span>
                  </div>
                  {assignment.assignedDirectorName && (
                    <p className="text-[11px] text-neutral-600 font-medium">Assigned: {assignment.assignedDirectorName}</p>
                  )}
                </div>
              </div>

              {/* AI Staffing & Overtime Optimizer Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      🧠
                    </div>
                    <h4 className="font-serif-title font-bold text-xs text-amber-950 uppercase tracking-wider">
                      Manager Decision Engine: In-House vs. Outsourced Guild Analysis
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    assignment.costAnalysis.recommendedType === 'in_house'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {assignment.costAnalysis.recommendedType === 'in_house' ? '✅ Recommend In-House Staff' : '🤝 Recommend Outsourced Trade Guild'}
                  </span>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  {assignment.costAnalysis.recommendationReason}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/40">
                    <span className="text-neutral-500 block text-[10px]">In-House Incremental Cost:</span>
                    <strong className="text-neutral-900 font-mono">
                      {assignment.costAnalysis.inHouseCost === 0 ? '$0.00 (Salary Base)' : `$${assignment.costAnalysis.inHouseCost.toFixed(2)} (Overtime)`}
                    </strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/40">
                    <span className="text-neutral-500 block text-[10px]">Outsourced Trade Fee:</span>
                    <strong className="text-neutral-900 font-mono">${assignment.costAnalysis.outsourcedCost.toFixed(2)} (Flat Rate)</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/40">
                    <span className="text-neutral-500 block text-[10px]">Net Margin Savings:</span>
                    <strong className="text-emerald-700 font-mono flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-emerald-600" />
                      +${assignment.costAnalysis.marginImpactSavings.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Director Filter & Candidate Grid */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif-title font-bold text-sm text-neutral-900 uppercase tracking-wider">
                    Select Licensed Funeral Director (NYS LFD)
                  </h3>

                  <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        filterType === 'all' ? 'bg-[#991b1b] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      All Available ({directors.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('in_house')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        filterType === 'in_house' ? 'bg-[#991b1b] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      In-House Staff ({directors.filter(d => d.type === 'in_house').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('outsourced')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        filterType === 'outsourced' ? 'bg-[#991b1b] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Independent Contractors ({directors.filter(d => d.type === 'outsourced').length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDirectors.map((director) => {
                    const isSelected = selectedDirectorId === director.id;
                    const isInHouse = director.type === 'in_house';

                    return (
                      <div
                        key={director.id}
                        onClick={() => setSelectedDirectorId(director.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'bg-red-50/60 border-[#991b1b] ring-2 ring-[#991b1b]/30 shadow-md'
                            : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 shadow-2xs'
                        }`}
                      >
                        {/* Header: Name & Type Badge */}
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="font-bold text-neutral-900 text-sm">{director.name}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                                  director.isManager
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : isInHouse
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}>
                                  {director.isManager ? '👑 Managing Director & LFD' : isInHouse ? '👔 In-House LFD' : '🤝 Independent Contractor (Service Directing)'}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 font-mono">{director.licenseNumber} • {director.yearsExperience} yrs exp</p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-amber-500">★ {director.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Metrics strip */}
                          {isInHouse ? (
                            <div className="flex items-center gap-3 text-[11px] bg-neutral-100/70 p-2 rounded-xl">
                              <div>
                                <span className="text-neutral-400 block text-[9px]">Weekly Hours</span>
                                <strong className={`font-mono ${director.weeklyHoursLogged! >= 38 ? 'text-[#991b1b]' : 'text-neutral-800'}`}>
                                  {director.weeklyHoursLogged} / {director.weeklyHoursCap} hrs
                                </strong>
                              </div>
                              <div className="h-6 w-px bg-neutral-200" />
                              <div>
                                <span className="text-neutral-400 block text-[9px]">Active Cases</span>
                                <strong className="font-mono text-neutral-800">{director.activeCasesCount} cases</strong>
                              </div>
                              <div className="h-6 w-px bg-neutral-200" />
                              <div>
                                <span className="text-neutral-400 block text-[9px]">Overtime Risk</span>
                                <strong className={`font-mono ${director.weeklyHoursLogged! >= 38 ? 'text-[#991b1b]' : 'text-emerald-700'}`}>
                                  {director.weeklyHoursLogged! >= 38 ? 'High (Over 38h)' : 'Low ($0 Overtime)'}
                                </strong>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-[11px] bg-neutral-100/70 p-2 rounded-xl">
                              <div>
                                <span className="text-neutral-400 block text-[9px]">Per-Diem Rate</span>
                                <strong className="font-mono text-neutral-900">${director.perDiemRate} / service</strong>
                              </div>
                              <div className="h-6 w-px bg-neutral-200" />
                              <div>
                                <span className="text-neutral-400 block text-[9px]">Punctuality</span>
                                <strong className="font-mono text-emerald-700">{director.punctualityScore}%</strong>
                              </div>
                              <div className="h-6 w-px bg-neutral-200" />
                              <div>
                                <span className="text-neutral-400 block text-[9px]">BFH Services</span>
                                <strong className="font-mono text-neutral-800">{director.ytdServicesCompleted} YTD</strong>
                              </div>
                            </div>
                          )}

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {director.specialties.slice(0, 3).map((spec, i) => (
                              <span key={i} className="bg-neutral-100 text-neutral-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Selection Checkmark */}
                        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 font-mono">{director.phone}</span>
                          <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-[#991b1b]' : 'text-neutral-400'}`}>
                            {isSelected ? '✓ Assigned Candidate' : 'Click to Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Call Time & Attire Protocols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Director Call Time (Arrival at Venue)
                  </label>
                  <input
                    type="text"
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    placeholder="e.g. 9:30 AM (90 mins prior to ceremony)"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none font-medium"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">Standard protocol: 90 minutes before chapel service; 60 minutes for church.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Required Uniform & Attire Protocol
                  </label>
                  <select
                    value={attire}
                    onChange={(e) => setAttire(e.target.value as any)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none font-medium"
                  >
                    <option value="BFH Formal Morning Coat">BFH Formal Morning Coat (Main Sanctuary / Civic)</option>
                    <option value="Dark Charcoal Suit">Dark Charcoal Suit with Black Tie (Standard Chapel)</option>
                    <option value="Liturgical Vestments & White Gloves">Liturgical Vestments & White Gloves (High Episcopal / Catholic)</option>
                  </select>
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">Mandatory BFH dress code and gold lapel insignia.</span>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Special Director Instructions & Procession Directives
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Coordinate Navy honor guard arrival at 10:15 AM. Lead 3-limousine cortege down St. Nicholas Ave to Woodlawn Crematory."
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                />
              </div>
            </>
          ) : (
            /* Tab 2: Two-Way SMS Dispatch Simulator */
            <div className="space-y-4">
              <div className="p-4 bg-neutral-900 text-white rounded-2xl border border-neutral-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-xs">Director Smartphone SMS Dispatch Console</h4>
                      <p className="text-[10px] text-neutral-400">Carrier Dispatch Route: +1 (212) 281-8850 $\rightarrow$ {selectedDirector?.phone || '(917) 555-3819'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    simulatedStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {simulatedStatus.toUpperCase()}
                  </span>
                </div>

                {/* SMS Chat Bubbles */}
                <div className="space-y-3 max-h-72 overflow-y-auto p-2 bg-neutral-950/60 rounded-xl">
                  {smsThread.map((msg) => {
                    const isManager = msg.sender === 'manager';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isManager ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md rounded-2xl p-3 text-xs space-y-1 ${
                          isManager
                            ? 'bg-[#991b1b] text-white rounded-tr-xs'
                            : 'bg-neutral-800 text-neutral-100 rounded-tl-xs border border-neutral-700'
                        }`}>
                          <div className="flex items-center justify-between gap-2 text-[9px] opacity-70">
                            <span>{isManager ? 'BFH Operations Dispatch' : selectedDirector?.name || 'Licensed Director'}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Simulation Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 text-xs">
                  <span className="text-neutral-400 text-[11px]">Simulate Director Response:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateDirectorAccept}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simulate "ACCEPT" Reply</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateDirectorDecline}
                      className="bg-neutral-800 hover:bg-neutral-700 text-red-400 font-bold px-3 py-1.5 rounded-xl transition border border-red-500/30"
                    >
                      <span>Simulate "DECLINE" Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'select' && (
              <button
                type="button"
                onClick={() => setActiveTab('sms_simulator')}
                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <span>Preview SMS Dispatch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!selectedDirectorId}
              className={`font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm ${
                selectedDirectorId
                  ? 'bg-[#991b1b] hover:bg-red-800 text-white border border-amber-400/40'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Confirm & Dispatch Director</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
