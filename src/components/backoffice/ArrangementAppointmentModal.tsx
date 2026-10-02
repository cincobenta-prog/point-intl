import React, { useState } from 'react';
import {
  GoldenRecordCase,
  ArrangementAppointmentInfo,
  ProposedTimeSlot,
  AppointmentMeetingFormat,
  SimulatedNotification
} from '../../lib/types/funeral';
import {
  Calendar,
  Clock,
  Building,
  Send,
  CheckCircle2,
  X,
  MapPin,
  Check,
  Plus,
  Trash2,
  Smartphone,
  Video,
  Home,
  ScrollText,
  Copy,
  Truck,
  Mail,
  Printer
} from 'lucide-react';

interface ArrangementAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: GoldenRecordCase;
  activeCase?: GoldenRecordCase;
  cases?: GoldenRecordCase[];
  onSaveAppointment: (caseId: string, appointment: ArrangementAppointmentInfo) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenCalendar?: () => void;
  onOpenContractModal?: () => void;
  onOpenRemovalModal?: (c: GoldenRecordCase) => void;
}

export const ArrangementAppointmentModal: React.FC<ArrangementAppointmentModalProps> = ({
  isOpen,
  onClose,
  caseData: directCaseData,
  activeCase,
  cases: _cases,
  onSaveAppointment,
  onSendNotification,
  onOpenCalendar,
  onOpenContractModal,
  onOpenRemovalModal
}) => {
  const caseData = directCaseData || activeCase!;
  const existingAppt = caseData?.arrangementAppointment;

  const [activeTab, setActiveTab] = useState<'setup_dispatch' | 'family_simulator' | 'confirmed_details' | 'what_to_bring'>(
    existingAppt?.status === 'confirmed' ? 'confirmed_details' : 'setup_dispatch'
  );

  // Director Setup State
  const [assignedDirector, setAssignedDirector] = useState(
    existingAppt?.assignedDirectorName || caseData.assignedDirector || 'Jason Benta, LFD #08850'
  );
  const [meetingFormat, setMeetingFormat] = useState<AppointmentMeetingFormat>(
    existingAppt?.meetingFormat || 'in_person_office'
  );
  const [locationVenue, setLocationVenue] = useState(
    existingAppt?.locationVenue || '630 St. Nicholas Ave - Arrangement Suite A'
  );
  const [invitationChannel, setInvitationChannel] = useState<'sms' | 'email' | 'both'>('both');

  // Candidate Slots Builder State
  const defaultSlots: ProposedTimeSlot[] = [
    {
      id: `slot-${Date.now()}-1`,
      date: '2026-09-21',
      dateLabel: 'Monday, Sept 21, 2026',
      time: '10:00 AM',
      durationMinutes: 90,
      isAvailable: true,
      selectedByFamily: true
    },
    {
      id: `slot-${Date.now()}-2`,
      date: '2026-09-21',
      dateLabel: 'Monday, Sept 21, 2026',
      time: '02:00 PM',
      durationMinutes: 90,
      isAvailable: true,
      selectedByFamily: false
    },
    {
      id: `slot-${Date.now()}-3`,
      date: '2026-09-22',
      dateLabel: 'Tuesday, Sept 22, 2026',
      time: '11:00 AM',
      durationMinutes: 90,
      isAvailable: true,
      selectedByFamily: false
    }
  ];

  const [proposedSlots, setProposedSlots] = useState<ProposedTimeSlot[]>(
    existingAppt?.proposedSlots && existingAppt.proposedSlots.length > 0
      ? existingAppt.proposedSlots
      : defaultSlots
  );

  // New slot quick inputs
  const [newSlotDate, setNewSlotDate] = useState('2026-09-22');
  const [newSlotTime, setNewSlotTime] = useState('03:30 PM');

  // Family Interactive Simulation Selection State
  const [familySelectedSlotId, setFamilySelectedSlotId] = useState<string>(
    proposedSlots.find(s => s.selectedByFamily)?.id || proposedSlots[0]?.id || ''
  );
  const [familyAttendeesCount, setFamilyAttendeesCount] = useState<number>(
    existingAppt?.attendingFamilyCount || 3
  );
  const [familyAttendeesNames, setFamilyAttendeesNames] = useState<string>(
    existingAppt?.attendingFamilyNames?.join(', ') || `${caseData.informant.fullName} (Next of Kin), Family Members`
  );
  const [familySpecialNotes, setFamilySpecialNotes] = useState<string>(
    existingAppt?.specialAccommodationsNotes || 'Will bring DD-214 veteran discharge papers and favorite photograph for obituary cover.'
  );

  const [toastFeedback, setToastFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(null), 4000);
  };

  const handleAddSlot = () => {
    if (!newSlotDate || !newSlotTime) return;
    const dateObj = new Date(newSlotDate + 'T00:00:00');
    const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    const newSlot: ProposedTimeSlot = {
      id: `slot-${Date.now()}`,
      date: newSlotDate,
      dateLabel: dateLabel,
      time: newSlotTime,
      durationMinutes: 90,
      isAvailable: true,
      selectedByFamily: false
    };

    setProposedSlots(prev => [...prev, newSlot]);
    showToast(`Added candidate timeslot: ${dateLabel} at ${newSlotTime}`);
  };

  const handleRemoveSlot = (slotId: string) => {
    setProposedSlots(prev => prev.filter(s => s.id !== slotId));
  };

  // Director Dispatches Candidate Times via SMS & Email
  const handleDispatchAvailableTimes = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slotSummaries = proposedSlots.map(s => `• ${s.dateLabel} at ${s.time}`).join('\n');

    const appointmentData: ArrangementAppointmentInfo = {
      id: existingAppt?.id || `appt-${Date.now()}`,
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      decedentName: caseData.decedent.legalName,
      informantName: caseData.informant.fullName,
      informantPhone: caseData.informant.phone,
      informantEmail: caseData.informant.email,
      status: 'proposed_options_sent',
      meetingFormat,
      locationVenue,
      assignedDirectorName: assignedDirector,
      assignedDirectorPhone: '(212) 281-8850',
      assignedDirectorEmail: 'care@e-bfh.com',
      proposedSlots,
      attendingFamilyCount: familyAttendeesCount,
      attendingFamilyNames: familyAttendeesNames.split(',').map(n => n.trim()).filter(Boolean),
      specialAccommodationsNotes: familySpecialNotes,
      invitationChannel,
      invitationSentAt: `Today ${timeStr}`,
      smsConfirmationSent: false,
      emailConfirmationSent: false
    };

    onSaveAppointment(caseData.id, appointmentData);

    // Fire simulated notification
    if (onSendNotification) {
      const notif: SimulatedNotification = {
        id: `notif-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: caseData.informant.fullName,
        recipientPhone: caseData.informant.phone,
        recipientEmail: caseData.informant.email,
        channel: 'sms',
        type: 'service_schedule',
        title: "Arrangement Conference Scheduling Invitation",
        bodyText: `Dear ${caseData.informant.fullName}, Director ${assignedDirector} invites you to schedule an in-person arrangement conference at Benta's Funeral Home (630 St. Nicholas Ave). Available options:\n${slotSummaries}\nSelect your time here: https://portal.e-bfh.com/case/${caseData.caseNumber}/schedule`,
        sentAt: `Today ${timeStr}`,
        status: 'delivered',
        actionUrl: '#portal',
        actionButtonText: 'Select Conference Time'
      };
      onSendNotification(notif);
    }

    showToast(`Dispatched ${proposedSlots.length} available timeslots via SMS & Email to ${caseData.informant.fullName}!`);
    setActiveTab('family_simulator');
  };

  // Family Confirms Their Selection
  const handleFamilyConfirmSelection = () => {
    const selectedSlot = proposedSlots.find(s => s.id === familySelectedSlotId) || proposedSlots[0];
    if (!selectedSlot) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedSlots = proposedSlots.map(s => ({
      ...s,
      selectedByFamily: s.id === selectedSlot.id
    }));

    const appointmentData: ArrangementAppointmentInfo = {
      id: existingAppt?.id || `appt-${Date.now()}`,
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      decedentName: caseData.decedent.legalName,
      informantName: caseData.informant.fullName,
      informantPhone: caseData.informant.phone,
      informantEmail: caseData.informant.email,
      status: 'confirmed',
      meetingFormat,
      locationVenue,
      assignedDirectorName: assignedDirector,
      assignedDirectorPhone: '(212) 281-8850',
      assignedDirectorEmail: 'care@e-bfh.com',
      proposedSlots: updatedSlots,
      confirmedSlot: {
        date: selectedSlot.date,
        dateLabel: selectedSlot.dateLabel,
        time: selectedSlot.time,
        durationMinutes: selectedSlot.durationMinutes
      },
      confirmedAt: `Today ${timeStr}`,
      attendingFamilyCount: familyAttendeesCount,
      attendingFamilyNames: familyAttendeesNames.split(',').map(n => n.trim()).filter(Boolean),
      specialAccommodationsNotes: familySpecialNotes,
      invitationChannel,
      invitationSentAt: existingAppt?.invitationSentAt || `Today ${timeStr}`,
      smsConfirmationSent: true,
      emailConfirmationSent: true,
      calendarEventId: `evt-conf-${Date.now()}`
    };

    onSaveAppointment(caseData.id, appointmentData);

    // Send confirmation SMS to family
    if (onSendNotification) {
      const confirmNotif: SimulatedNotification = {
        id: `notif-confirm-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: caseData.informant.fullName,
        recipientPhone: caseData.informant.phone,
        recipientEmail: caseData.informant.email,
        channel: 'sms',
        type: 'service_schedule',
        title: "In-Person Arrangement Conference Confirmed",
        bodyText: `APPOINTMENT CONFIRMED: Dear ${caseData.informant.fullName}, your arrangement conference with Director ${assignedDirector} is confirmed for ${selectedSlot.dateLabel} at ${selectedSlot.time} at ${locationVenue}. Parking is available in our private rear courtyard. We look forward to receiving your family with reverence.`,
        sentAt: `Today ${timeStr}`,
        status: 'delivered',
        actionUrl: '#portal',
        actionButtonText: 'View Appointment & Directions'
      };
      onSendNotification(confirmNotif);
    }

    showToast(`Appointment confirmed for ${selectedSlot.dateLabel} at ${selectedSlot.time}! Synced to Facility Calendar.`);
    setActiveTab('confirmed_details');
  };

  // Send Directions SMS
  const handleSendDirectionsSMS = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (onSendNotification) {
      const notif: SimulatedNotification = {
        id: `notif-dir-${Date.now()}`,
        caseId: caseData.id,
        decedentName: caseData.decedent.legalName,
        recipientName: caseData.informant.fullName,
        recipientPhone: caseData.informant.phone,
        recipientEmail: caseData.informant.email,
        channel: 'sms',
        type: 'service_schedule',
        title: "Directions & Arrival Guide for Benta's Funeral Home",
        bodyText: `Directions to 630 Saint Nicholas Ave (between 141st & 142nd St): Subway: A/B/C/D train to 145th St (exit at 141st St). Parking: Complimentary family parking in our private entrance driveway. Director ${assignedDirector} will greet you at the main reception foyer.`,
        sentAt: `Today ${timeStr}`,
        status: 'delivered'
      };
      onSendNotification(notif);
    }
    showToast(`Directions & Parking SMS dispatched to ${caseData.informant.phone}!`);
  };

  const handleCopyBookingLink = () => {
    navigator.clipboard.writeText(`https://portal.e-bfh.com/case/${caseData.caseNumber}/schedule`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#141b2b] via-[#1e2738] to-[#141b2b] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b-2 border-amber-400/80 shrink-0">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-bold shadow-sm border border-amber-300">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  FAMILY ARRANGEMENT CONFERENCE SCHEDULER
                </span>
                <span className="text-xs text-neutral-300 font-mono">
                  Case #{caseData.caseNumber}
                </span>
              </div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                {caseData.decedent.legalName} • In-Person Office Conference with Family
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              existingAppt?.status === 'confirmed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                : existingAppt?.status === 'proposed_options_sent'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                : 'bg-neutral-700 text-neutral-300'
            }`}>
              {existingAppt?.status === 'confirmed' ? '✅ Confirmed Appointment' : existingAppt?.status === 'proposed_options_sent' ? '⏳ Options Dispatched' : 'Unscheduled'}
            </span>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* BI-DIRECTIONAL INFORMATION BRIDGE BANNER */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#b45309] text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-amber-400/20 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30 uppercase tracking-wider">
              Bi-Directional Case Bridge
            </span>
            <span className="text-neutral-300 text-[11px]">
              Arrangement ➔ Removal Flow • Safe Arrival: <strong className="text-white">{caseData.safeArrivalStatus === 'safe_arrival_confirmed' ? '✓ Confirmed (630 St. Nicholas)' : caseData.safeArrivalStatus === 'in_transit' ? '🚐 En Route' : '🚨 Pending Removal'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {caseData.safeArrivalStatus === 'safe_arrival_confirmed' ? (
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Custody Secured at BFH</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Truck className="w-3 h-3 text-amber-300" />
                <span>{caseData.removalSchedule?.facilityName || caseData.decedent.facilityName || 'Facility Pickup Ready'}</span>
              </span>
            )}

            {onOpenRemovalModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRemovalModal(caseData);
                }}
                className="bg-red-800 hover:bg-red-700 text-white font-bold text-xs px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5 transition border border-red-400/40"
                title="Dispatch First Call Removal Logistics with pre-filled facility and physician details from this arrangement"
              >
                <Truck className="w-3.5 h-3.5 text-amber-200" />
                <span>➔ Dispatch Removal (Pre-filled)</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-4 sm:px-6 flex gap-2 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('setup_dispatch')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'setup_dispatch'
                ? 'bg-white text-[#991b1b] border-t-2 border-x border-[#991b1b] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>1. Director Timeslot Dispatcher</span>
          </button>

          <button
            onClick={() => setActiveTab('family_simulator')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'family_simulator'
                ? 'bg-white text-[#991b1b] border-t-2 border-x border-[#991b1b] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Family Selection View & SMS Link</span>
          </button>

          <button
            onClick={() => setActiveTab('confirmed_details')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'confirmed_details'
                ? 'bg-white text-[#991b1b] border-t-2 border-x border-[#991b1b] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Confirmed Schedule & Calendar Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('what_to_bring')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'what_to_bring'
                ? 'bg-white text-[#991b1b] border-t-2 border-x border-[#991b1b] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>4. What to Bring & Family Packet (Email / Print)</span>
          </button>
        </div>

        {/* Toast Notification Alert */}
        {toastFeedback && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{toastFeedback}</span>
            </div>
            <button onClick={() => setToastFeedback(null)} className="text-white/80 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-neutral-900">
          
          {/* ========================================================= */}
          {/* TAB 1: DIRECTOR APPOINTMENT SETUP & DISPATCH              */}
          {/* ========================================================= */}
          {activeTab === 'setup_dispatch' && (
            <div className="space-y-5">
              
              {/* Informant Target Banner */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Informant / Next of Kin:</span>
                  <div className="font-bold text-sm text-neutral-900">{caseData.informant.fullName} ({caseData.informant.relationship})</div>
                  <div className="text-neutral-600 font-mono">{caseData.informant.phone} • {caseData.informant.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyBookingLink}
                    className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#b45309]" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Family Booking Link'}</span>
                  </button>
                </div>
              </div>

              {/* Grid: Meeting Settings & Timeslots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* Column A: Meeting Specs */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                  <h4 className="font-serif-title font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#991b1b]" />
                    <span>Conference Logistics & Director Assignment</span>
                  </h4>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Assigned Funeral Director in Charge *</label>
                    <select
                      value={assignedDirector}
                      onChange={(e) => setAssignedDirector(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                    >
                      <option value="Jason Benta, LFD #08850">Jason Benta, LFD #08850 (President & Lead Director)</option>
                      <option value="Senior Director Davis, LFD #07421">Senior Director Davis, LFD #07421</option>
                      <option value="Staff Director Holloway, LFD #09120">Staff Director Holloway, LFD #09120</option>
                      <option value="Licensed Resident Apprentice">Licensed Resident Apprentice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Meeting Format *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'in_person_office', label: 'In-Person (Office)', icon: Home },
                        { id: 'virtual_video', label: 'Virtual Video', icon: Video },
                        { id: 'family_residence', label: 'Home Visit', icon: MapPin }
                      ].map(fmt => {
                        const IconFmt = fmt.icon;
                        const isSel = meetingFormat === fmt.id;
                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setMeetingFormat(fmt.id as any)}
                            className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition flex flex-col items-center justify-center gap-1 ${
                              isSel
                                ? 'bg-red-50 text-[#991b1b] border-[#991b1b] shadow-xs'
                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            <IconFmt className="w-3.5 h-3.5" />
                            <span>{fmt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Arrangement Suite / Room at 630 St. Nicholas *</label>
                    <select
                      value={locationVenue}
                      onChange={(e) => setLocationVenue(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                    >
                      <option value="630 St. Nicholas Ave - Arrangement Suite A">630 St. Nicholas Ave - Arrangement Suite A (Seats 6)</option>
                      <option value="630 St. Nicholas Ave - Arrangement Suite B">630 St. Nicholas Ave - Arrangement Suite B (Seats 8)</option>
                      <option value="630 St. Nicholas Ave - Executive Boardroom">630 St. Nicholas Ave - Executive Boardroom (Seats 12)</option>
                      <option value="630 St. Nicholas Ave - Parlor A Family Lounge">630 St. Nicholas Ave - Parlor A Family Lounge</option>
                      <option value="Virtual Video Conference (Zoom / Google Meet)">Virtual Video Conference (Encrypted HD Link)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Dispatch Communication Channel</label>
                    <div className="flex gap-2">
                      {(['both', 'sms', 'email'] as const).map(ch => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setInvitationChannel(ch)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 capitalize ${
                            invitationChannel === ch
                              ? 'bg-[#991b1b] text-white shadow-2xs'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {ch === 'both' ? 'SMS & Email' : ch.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Column B: Candidate Timeslot Builder */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <h4 className="font-serif-title font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Proposed Available Timeslots ({proposedSlots.length})</span>
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-mono">Offer 2–4 options</span>
                    </div>

                    <div className="space-y-2">
                      {proposedSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <strong className="text-neutral-900 font-bold block">{slot.dateLabel}</strong>
                            <div className="flex items-center gap-2 text-neutral-600">
                              <span className="font-mono text-[#991b1b] font-bold">{slot.time}</span>
                              <span>•</span>
                              <span>{slot.durationMinutes} Minutes Consultation</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                            title="Remove this slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Slot Quick Form */}
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                      <span className="text-[11px] font-bold text-amber-950 block">Add Another Candidate Date & Time:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={newSlotDate}
                          onChange={(e) => setNewSlotDate(e.target.value)}
                          className="bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono font-bold outline-none"
                        />
                        <input
                          type="text"
                          value={newSlotTime}
                          onChange={(e) => setNewSlotTime(e.target.value)}
                          placeholder="e.g. 03:30 PM"
                          className="bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSlot}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Timeslot to Invitation</span>
                      </button>
                    </div>
                  </div>

                  {/* Dispatch Action Trigger */}
                  <div className="pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleDispatchAvailableTimes}
                      className="w-full py-3 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 border border-amber-300/40"
                    >
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>Dispatch Available Times via SMS & Email to Family</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: INTERACTIVE FAMILY TIME SELECTION SIMULATOR        */}
          {/* ========================================================= */}
          {activeTab === 'family_simulator' && (
            <div className="space-y-5">
              
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
                <div className="flex items-center space-x-2.5">
                  <Smartphone className="w-5 h-5 text-[#991b1b] shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      Family Interactive Selection Simulation
                    </h4>
                    <p className="text-neutral-600">
                      This simulates the responsive portal interface {caseData.informant.fullName} accesses from their SMS/Email invitation.
                    </p>
                  </div>
                </div>

                <span className="bg-white border border-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full text-amber-900">
                  Live Selection Preview
                </span>
              </div>

              {/* Family Interactive Booking Card */}
              <div className="bg-white border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-lg max-w-2xl mx-auto space-y-6">
                
                {/* Family Header */}
                <div className="text-center space-y-1.5 border-b border-neutral-200 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-bold text-sm mx-auto border border-amber-300 shadow-xs">
                    BFH
                  </div>
                  <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                    Schedule Your Arrangement Conference
                  </h3>
                  <p className="text-xs text-neutral-600 max-w-lg mx-auto">
                    In Memory of <strong>{caseData.decedent.legalName}</strong>. Please choose a convenient time to meet in-person with <strong>{assignedDirector}</strong> at our historic Harlem facility.
                  </p>
                </div>

                {/* Timeslots Selector Radio Cards */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Select Your Preferred Conference Date & Time:
                  </label>

                  <div className="space-y-2.5">
                    {proposedSlots.map((slot) => {
                      const isSelected = familySelectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setFamilySelectedSlotId(slot.id)}
                          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-50/90 border-[#991b1b] ring-2 ring-red-500/30 shadow-sm'
                              : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#991b1b] bg-[#991b1b]' : 'border-neutral-400 bg-white'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>

                            <div>
                              <strong className={`text-sm font-bold block ${isSelected ? 'text-[#991b1b]' : 'text-neutral-900'}`}>
                                {slot.dateLabel}
                              </strong>
                              <span className="text-xs text-neutral-600 font-medium">
                                Time: <strong className="font-mono text-neutral-800">{slot.time}</strong> • {slot.durationMinutes} min consultation
                              </span>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            isSelected ? 'bg-[#991b1b] text-white' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {isSelected ? 'Selected Time' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Family Attendees & Special Requests Inputs */}
                <div className="space-y-3 text-xs pt-2 border-t border-neutral-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Attending Family Count:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={familyAttendeesCount}
                        onChange={(e) => setFamilyAttendeesCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Attending Family Names:
                      </label>
                      <input
                        type="text"
                        value={familyAttendeesNames}
                        onChange={(e) => setFamilyAttendeesNames(e.target.value)}
                        placeholder="e.g. Eleanor Vance, Marcus Jr."
                        className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Items Bringing / Special Accommodations:
                    </label>
                    <textarea
                      rows={2}
                      value={familySpecialNotes}
                      onChange={(e) => setFamilySpecialNotes(e.target.value)}
                      placeholder="e.g. Bringing military discharge records, requested low-step wheelchair access..."
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>

                {/* Family Confirmation Trigger */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleFamilyConfirmSelection}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-200" />
                    <span>Confirm In-Person Appointment at Benta's</span>
                  </button>
                  <p className="text-[11px] text-neutral-500 text-center pt-2">
                    Confirmation SMS with private parking details and directions will be sent immediately to {caseData.informant.phone}.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CONFIRMED SCHEDULE & CALENDAR SYNC                 */}
          {/* ========================================================= */}
          {activeTab === 'confirmed_details' && (
            <div className="space-y-5">
              
              {existingAppt?.status === 'confirmed' && existingAppt.confirmedSlot ? (
                <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
                  
                  {/* Confirmed Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          CONFIRMED IN-PERSON APPOINTMENT
                        </span>
                        <h3 className="font-serif-title text-xl font-bold text-neutral-900 pt-0.5">
                          {existingAppt.confirmedSlot.dateLabel} at {existingAppt.confirmedSlot.time}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-neutral-500 block">Confirmed At:</span>
                      <strong className="font-mono text-neutral-900">{existingAppt.confirmedAt || 'Today'}</strong>
                    </div>
                  </div>

                  {/* 4-Card Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Assigned Director</span>
                      <strong className="text-[#991b1b] text-sm block">{existingAppt.assignedDirectorName}</strong>
                      <span className="text-neutral-600 font-mono text-[11px] block">{existingAppt.assignedDirectorPhone}</span>
                    </div>

                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Venue Location</span>
                      <strong className="text-neutral-900 text-sm block">{existingAppt.locationVenue}</strong>
                      <span className="text-neutral-500 text-[11px] block">630 Saint Nicholas Ave</span>
                    </div>

                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Attending Family</span>
                      <strong className="text-neutral-900 text-sm block">{existingAppt.attendingFamilyCount} Family Members</strong>
                      <span className="text-neutral-600 text-[11px] truncate block">{existingAppt.attendingFamilyNames?.join(', ') || 'Next of Kin'}</span>
                    </div>

                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Calendar Sync</span>
                      <strong className="text-emerald-700 text-sm block flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Facility Sync Active</span>
                      </strong>
                      <span className="text-neutral-500 text-[11px] block">Room: Family Suite A</span>
                    </div>
                  </div>

                  {existingAppt.specialAccommodationsNotes && (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                      <strong>Family Notes & Materials Bringing:</strong> {existingAppt.specialAccommodationsNotes}
                    </div>
                  )}

                  {/* 1-Click Operational Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200">
                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenRemovalModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenRemovalModal(caseData);
                          }}
                          className="px-4 py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm border border-red-400/40"
                          title="Dispatch First Call Removal Logistics with pre-filled facility and physician details from this arrangement"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-200" />
                          <span>Dispatch Removal Logistics (Pre-filled)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSendDirectionsSMS}
                        className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-amber-400/40 shadow-xs"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                        <span>Send Directions & Parking SMS to Family</span>
                      </button>

                      {onOpenCalendar && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCalendar();
                          }}
                          className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                          <span>View in 12-Space Facility Calendar</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('setup_dispatch')}
                        className="px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition"
                      >
                        Reschedule / Propose New Times
                      </button>

                      {onOpenContractModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenContractModal();
                          }}
                          className="px-4 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm border border-amber-300/40"
                        >
                          <ScrollText className="w-3.5 h-3.5 text-amber-300" />
                          <span>Open Form AP-47 Studio</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif-title font-bold text-base text-neutral-900">
                    No Confirmed Appointment Yet
                  </h4>
                  <p className="text-xs text-neutral-600 max-w-md mx-auto">
                    Candidate timeslots have been dispatched to {caseData.informant.fullName}. Use the Family Selection tab to simulate or record the family's preferred meeting time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('family_simulator')}
                    className="px-4 py-2 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
                  >
                    Go to Family Selection Simulator →
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: WHAT TO BRING & FAMILY EMAIL PACKET */}
          {activeTab === 'what_to_bring' && (
            <div className="space-y-6 animate-fadeIn pb-6">
              {/* Header & Quick Action Bar */}
              <div className="bg-gradient-to-r from-neutral-900 to-[#1e2738] text-white p-5 rounded-2xl border border-amber-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      Family Arrangement Preparation Packet
                    </span>
                    <span className="text-xs text-neutral-300">
                      Case #{caseData.caseNumber}
                    </span>
                  </div>
                  <h4 className="font-serif-title font-bold text-lg text-white mt-1">
                    What to Bring Checklist & Email Confirmation
                  </h4>
                  <p className="text-xs text-neutral-300">
                    Recipient: <strong className="text-white">{caseData.informant.fullName}</strong> ({caseData.informant.email || 'No email on file'} • {caseData.informant.phone})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `WHAT TO BRING TO YOUR ARRANGEMENT CONFERENCE AT BENTA'S FUNERAL HOME:\n\n` +
                        `Case: ${caseData.decedent.legalName} (#${caseData.caseNumber})\n` +
                        `Appointment: ${caseData.arrangementAppointment?.confirmedSlot?.dateLabel || 'Scheduled Conference'} at ${caseData.arrangementAppointment?.confirmedSlot?.time || 'Confirmed Time'}\n` +
                        `Location: ${caseData.arrangementAppointment?.locationVenue || '630 St. Nicholas Ave, Harlem, NY 10030'}\n\n` +
                        `1. VITAL STATISTICS & BIOGRAPHICAL DATA:\n` +
                        `• Full legal name, date of birth, place of birth\n` +
                        `• Social Security Number\n` +
                        `• Father's full legal name & Mother's maiden name\n` +
                        `• Highest level of education completed\n` +
                        `• Military discharge papers (DD-214) if veteran\n\n` +
                        `2. CLOTHING & GROOMING FOR DECEASED:\n` +
                        `• Complete outfit (undergarments, stockings/socks, dress/suit, shoes)\n` +
                        `• Recent clear photograph for hair styling & makeup guidance\n` +
                        `• Eyeglasses & specific jewelry (with instructions to return or stay)\n\n` +
                        `3. LEGAL & FINANCIAL DOCUMENTS:\n` +
                        `• Government photo ID of Authorized Informant (Next of Kin)\n` +
                        `• Cemetery Deed / Plot certificate / Niche purchase agreement (if owned)\n` +
                        `• Life insurance policy documents (for direct C&J assignment)\n\n` +
                        `4. MEMORIAL PROGRAM & TRIBUTE PHOTOS:\n` +
                        `• 25–50 family photos for 360° digital tribute & program collage\n` +
                        `• Written obituary draft, favorite scriptures, songs, or pallbearer list`
                      );
                      showToast('Copied complete "What to Bring" guide to clipboard!');
                    }}
                    className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-neutral-600 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Copy Checklist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-neutral-600 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-300" />
                    <span>Print Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      if (onSendNotification) {
                        const notif: SimulatedNotification = {
                          id: `notif-packet-${Date.now()}`,
                          caseId: caseData.id,
                          decedentName: caseData.decedent.legalName,
                          recipientName: caseData.informant.fullName,
                          recipientPhone: caseData.informant.phone,
                          recipientEmail: caseData.informant.email,
                          channel: 'email',
                          type: 'service_schedule',
                          title: "Appointment Confirmation & What to Bring Guide Dispatched",
                          bodyText: `Confirmation email with complete What to Bring guide, online vital statistics pre-fill link, and parking directions sent to ${caseData.informant.email}. SMS careline notice sent to ${caseData.informant.phone}.`,
                          sentAt: `Today ${timeStr}`,
                          status: 'delivered'
                        };
                        onSendNotification(notif);
                      }
                      showToast(`Arrangement packet & What to Bring guide emailed to ${caseData.informant.email}!`);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#991b1b] to-red-800 hover:brightness-110 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm border border-amber-300/40"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>Resend Email to Family</span>
                  </button>
                </div>
              </div>

              {/* 4 Categorized Preparation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Vital Statistics */}
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <h5 className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                      Vital Statistics & Official Records
                    </h5>
                  </div>
                  <ul className="text-xs text-neutral-700 space-y-1.5 pl-7 list-disc">
                    <li><strong className="text-neutral-900">Full Legal Name, DOB & Place of Birth</strong> of deceased</li>
                    <li><strong className="text-neutral-900">Social Security Number</strong> (for NYC EDRS / State registry)</li>
                    <li><strong className="text-neutral-900">Father’s Full Name & Mother’s Maiden Name</strong></li>
                    <li><strong className="text-neutral-900">Highest Level of Education & Occupation</strong></li>
                    <li><strong className="text-neutral-900">Military Discharge Papers (Form DD-214)</strong> if veteran</li>
                  </ul>
                  <div className="pl-7 pt-1">
                    <span className="text-[11px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-medium">
                      💡 Family can also pre-fill this online via the Family Care Portal link
                    </span>
                  </div>
                </div>

                {/* 2. Clothing & Grooming */}
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <h5 className="font-bold text-xs text-blue-950 uppercase tracking-wide">
                      Clothing, Grooming & Presentation
                    </h5>
                  </div>
                  <ul className="text-xs text-neutral-700 space-y-1.5 pl-7 list-disc">
                    <li><strong className="text-neutral-900">Complete Outfit:</strong> Undergarments, stockings/socks, suit or dress, and shoes</li>
                    <li><strong className="text-neutral-900">Portrait Photograph:</strong> Clear recent picture for hairstyle, cosmetizing & facial guidance</li>
                    <li><strong className="text-neutral-900">Eyeglasses, Rosary, or Religious Articles</strong> (if applicable)</li>
                    <li><strong className="text-neutral-900">Jewelry Directive:</strong> Clear list of jewelry to stay with decedent or be returned to family</li>
                  </ul>
                </div>

                {/* 3. Legal, Insurance & Deeds */}
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <h5 className="font-bold text-xs text-emerald-950 uppercase tracking-wide">
                      Legal Authority & Funding Documents
                    </h5>
                  </div>
                  <ul className="text-xs text-neutral-700 space-y-1.5 pl-7 list-disc">
                    <li><strong className="text-neutral-900">Government Photo ID</strong> of Authorized Next of Kin (Informant)</li>
                    <li><strong className="text-neutral-900">NYS PHL § 4201 Proof of Authority</strong> (Spouse, Child, Executor, Designated Agent)</li>
                    <li><strong className="text-neutral-900">Cemetery Deed / Plot Certificate / Niche Receipt</strong> (if already owned)</li>
                    <li><strong className="text-neutral-900">Life Insurance Policies</strong> (for direct C&J assignment claim funding)</li>
                  </ul>
                </div>

                {/* 4. Tribute & Memorial */}
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
                    <h5 className="font-bold text-xs text-purple-950 uppercase tracking-wide">
                      Memorial Program, Photos & Music
                    </h5>
                  </div>
                  <ul className="text-xs text-neutral-700 space-y-1.5 pl-7 list-disc">
                    <li><strong className="text-neutral-900">25 to 50 Digital / Physical Photos</strong> for 360° digital tribute & collage</li>
                    <li><strong className="text-neutral-900">Obituary Draft / Biographical Story</strong> & list of surviving relatives</li>
                    <li><strong className="text-neutral-900">Selected Hymns, Musical Selections & Scripture Readings</strong></li>
                    <li><strong className="text-neutral-900">Names of Pallbearers & Key Participants</strong></li>
                  </ul>
                </div>

              </div>

              {/* LIVE EMAIL PACKET PREVIEW */}
              <div className="border border-neutral-300 rounded-3xl overflow-hidden shadow-md bg-white">
                
                {/* Simulated Email Client Top Bar */}
                <div className="bg-neutral-800 text-neutral-300 px-4 py-2.5 text-xs flex items-center justify-between border-b border-neutral-700">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="font-mono text-[11px] text-neutral-300 pl-2">
                      Outbound Email Delivery Preview: care@e-bfh.com ➔ {caseData.informant.email || 'informant@example.com'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Auto-Dispatched on Intake
                  </span>
                </div>

                {/* Email Body */}
                <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto bg-neutral-50/50">
                  
                  {/* BFH Header Seal */}
                  <div className="text-center space-y-1 border-b pb-4">
                    <div className="w-12 h-12 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif text-xl font-bold mx-auto border-2 border-amber-300 shadow-sm">
                      B
                    </div>
                    <h3 className="font-serif-title font-bold text-lg text-neutral-900 tracking-wide">
                      BENTA’S FUNERAL HOME, INC.
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      630 Saint Nicholas Avenue • New York, NY 10030 • (212) 281-8850
                    </p>
                    <p className="text-[11px] text-amber-800 font-bold uppercase tracking-wider">
                      Appointment Confirmation & Arrangement Preparation Guide
                    </p>
                  </div>

                  {/* Salutation */}
                  <div className="text-xs text-neutral-800 space-y-2">
                    <p>Dear <strong>{caseData.informant.fullName}</strong>,</p>
                    <p className="leading-relaxed">
                      On behalf of the entire staff at Benta’s Funeral Home, please accept our deepest condolences on the passing of your beloved <strong>{caseData.decedent.legalName}</strong>. We are committed to serving your family with compassion, reverence, and utmost professionalism.
                    </p>
                  </div>

                  {/* Confirmed Appointment Card */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#991b1b] shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-[#991b1b] uppercase tracking-wider">
                        📅 Scheduled Arrangement Conference
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Case #{caseData.caseNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Date & Time</span>
                        <strong className="text-neutral-900 text-sm">
                          {caseData.arrangementAppointment?.confirmedSlot?.dateLabel || 'Confirmed Appointment'} at {caseData.arrangementAppointment?.confirmedSlot?.time || 'Scheduled Time'}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Location</span>
                        <strong className="text-neutral-900">
                          {caseData.arrangementAppointment?.locationVenue || '630 St. Nicholas Ave (Arrangement Suite)'}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Assigned Funeral Director</span>
                        <span className="text-neutral-800 font-semibold">
                          {caseData.arrangementAppointment?.assignedDirectorName || caseData.assignedDirector || 'Jason Benta, LFD #08850'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">Arrival & Parking</span>
                        <span className="text-neutral-800 font-semibold">
                          Complimentary family courtyard parking
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Removal Readiness Status Notice */}
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Transfer & Custody Status:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {caseData.safeArrivalStatus === 'safe_arrival_confirmed' ? (
                        <span className="text-emerald-800 font-semibold">Your loved one is resting safely in our care at 630 Saint Nicholas Avenue.</span>
                      ) : (
                        <span>Our Care Coordination unit is actively liaising with <strong className="text-amber-900">{caseData.removalSchedule?.facilityName || caseData.decedent.facilityName || 'the medical facility'}</strong> regarding all necessary doctor releases and transfer protocols.</span>
                      )}
                    </p>
                  </div>

                  {/* Online Vital Records Pre-Fill Button */}
                  <div className="bg-gradient-to-r from-neutral-900 to-[#1e2738] text-white p-4 rounded-2xl text-center space-y-2">
                    <h6 className="font-bold text-xs text-amber-300">
                      ✨ Save Time: Pre-Fill Vital Records Online
                    </h6>
                    <p className="text-[11px] text-neutral-300">
                      You can securely submit the remaining vital statistics, family obituary notes, and memorial photos prior to our meeting.
                    </p>
                    <div className="pt-1">
                      <a
                        href="#vital-form"
                        onClick={(e) => { e.preventDefault(); showToast('Opened Online Family Vital Form Portal'); }}
                        className="inline-block bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs px-5 py-2 rounded-xl transition shadow-sm"
                      >
                        Pre-Fill Vital Records Sheet Online →
                      </a>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-[11px] text-neutral-500 text-center border-t pt-4 space-y-1">
                    <p className="font-bold text-neutral-700">Benta’s Funeral Home • Serving Families with Honor Since 1928</p>
                    <p>Questions or directions? Call our 24/7 Careline at <strong className="text-neutral-800">(212) 281-8850</strong></p>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
