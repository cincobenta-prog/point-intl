import React, { useState } from 'react';
import { GoldenRecordCase, SimulatedNotification, ArrangementAppointmentInfo } from '../../lib/types/funeral';
import { 
  Sparkles, 
  Headphones, 
  Video, 
  MessageSquare, 
  PenTool, 
  Calendar, 
  Image as ImageIcon, 
  Car, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Building,
  ChevronRight,
  Clock,
  MapPin,
  Send,
  Check,
  CalendarCheck,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface FamilyPortalOverviewHomeProps {
  activeCase: GoldenRecordCase;
  onNavigateTab: (tab: 'obituary' | 'tribute' | 'webcast' | 'concierge' | 'arrangements' | 'documents' | 'photos' | 'status') => void;
  onOpenESignModal?: () => void;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenGuidedTour?: () => void;
}

export const FamilyPortalOverviewHome: React.FC<FamilyPortalOverviewHomeProps> = ({
  activeCase,
  onNavigateTab,
  onOpenESignModal: _onOpenESignModal,
  onUpdateCase,
  onSendNotification,
  onOpenGuidedTour
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);
  const [attendeesCount, setAttendeesCount] = useState<number>(activeCase.arrangementAppointment?.attendingFamilyCount || 2);
  const [attendeeNamesInput, setAttendeeNamesInput] = useState<string>(activeCase.arrangementAppointment?.attendingFamilyNames?.join(', ') || activeCase.informant.fullName);
  const [specialNotesInput, setSpecialNotesInput] = useState<string>(activeCase.arrangementAppointment?.specialAccommodationsNotes || '');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const appt = activeCase.arrangementAppointment;
  const isConfirmed = appt?.status === 'confirmed';
  const hasProposedSlots = (appt?.proposedSlots && appt.proposedSlots.length > 0) || appt?.status === 'proposed_options_sent';

  const handleConfirmSelectedSlot = () => {
    if (!appt || !appt.proposedSlots || appt.proposedSlots.length === 0) return;
    const slotIdx = selectedSlotIndex !== null ? selectedSlotIndex : 0;
    const chosenSlot = appt.proposedSlots[slotIdx] || appt.proposedSlots[0];

    const updatedNames = attendeeNamesInput.split(',').map(s => s.trim()).filter(Boolean);
    const updatedAppt: ArrangementAppointmentInfo = {
      ...appt,
      status: 'confirmed',
      confirmedSlot: {
        date: chosenSlot.date,
        dateLabel: chosenSlot.dateLabel || chosenSlot.date,
        time: chosenSlot.time,
        durationMinutes: chosenSlot.durationMinutes || 90
      },
      confirmedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attendingFamilyCount: attendeesCount,
      attendingFamilyNames: updatedNames.length > 0 ? updatedNames : [activeCase.informant.fullName],
      specialAccommodationsNotes: specialNotesInput,
      smsConfirmationSent: true
    };

    if (onUpdateCase) {
      onUpdateCase({
        ...activeCase,
        arrangementAppointment: updatedAppt,
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'Family Portal 1-Tap Confirmation',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Family (${activeCase.informant.fullName}) confirmed in-person arrangement conference for ${chosenSlot.date} at ${chosenSlot.time} in ${appt.locationVenue || '630 St. Nicholas Ave'}. Attendees: ${attendeesCount}.`
          },
          ...activeCase.notes
        ]
      });
    }

    if (onSendNotification) {
      onSendNotification({
        id: `notif-appt-conf-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.informant.fullName,
        recipientPhone: activeCase.informant.phone,
        channel: 'sms',
        type: 'service_schedule',
        title: `ARRANGEMENT CONFERENCE CONFIRMED: ${activeCase.decedent.legalName}`,
        bodyText: `BENTA'S FUNERAL HOME: Your in-person arrangement conference with Jason Benta, LFD is confirmed for ${chosenSlot.date} at ${chosenSlot.time} at 630 St. Nicholas Ave (${appt.locationVenue || 'Arrangement Suite A'}). Dedicated parking reserved.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    showToast(`✅ In-Person Arrangement Conference confirmed for ${chosenSlot.date} at ${chosenSlot.time} at 630 St. Nicholas Ave!`);
  };

  const handleSendDirectionsSms = () => {
    if (onSendNotification) {
      onSendNotification({
        id: `notif-dir-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.informant.fullName,
        recipientPhone: activeCase.informant.phone,
        channel: 'sms',
        type: 'service_schedule',
        title: `BFH ARRIVAL & PARKING PASS: 630 St. Nicholas Ave`,
        bodyText: `DIRECTIONS TO BENTA'S FUNERAL HOME (630 St. Nicholas Ave at W 141st St, NY 10030): Reserved family parking in front driveway. Subway: A/B/C/D train to 145th St Station. Entrance buzzer for Arrangement Suite A.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }
    showToast(`📱 Reserved parking pass & GPS directions sent via SMS to ${activeCase.informant.phone}!`);
  };

  const handleSubmitRescheduleRequest = () => {
    if (!appt) return;
    const updatedAppt: ArrangementAppointmentInfo = {
      ...appt,
      status: 'rescheduled',
      specialAccommodationsNotes: `Family requested reschedule: "${rescheduleMessage}" (Requested at ${new Date().toLocaleTimeString()})`
    };

    if (onUpdateCase) {
      onUpdateCase({
        ...activeCase,
        arrangementAppointment: updatedAppt,
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'Family Portal Reschedule Request',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Family requested appointment reschedule: "${rescheduleMessage}". Director notified via SMS.`
          },
          ...activeCase.notes
        ]
      });
    }

    if (onSendNotification) {
      onSendNotification({
        id: `notif-resched-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.assignedDirector,
        recipientPhone: '(212) 281-8850',
        channel: 'sms',
        type: 'service_schedule',
        title: `RESCHEDULE REQUEST: ${activeCase.decedent.legalName}`,
        bodyText: `DIRECTOR ALERT: ${activeCase.informant.fullName} requested to reschedule their arrangement conference: "${rescheduleMessage}".`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    setIsRescheduleOpen(false);
    setRescheduleMessage('');
    showToast(`🔄 Your reschedule request has been transmitted to Licensed Director Jason Benta.`);
  };
  const pendingDocsCount = activeCase.documents.filter(d => d.status !== 'completed').length;

  const portalOfferings = [
    {
      id: 'obituary' as const,
      tab: 'obituary' as const,
      title: '9-Part Obituary & Life Story Studio',
      subtitle: 'Harlem Legacy Biographical Method',
      icon: Sparkles,
      iconBg: 'bg-amber-100 text-[#b45309]',
      borderHover: 'hover:border-amber-400',
      badge: 'Interactive Story Studio',
      badgeColor: 'bg-amber-50 text-[#b45309] border-amber-200',
      description: 'Craft a timeless tribute using our guided 9-part interview. Generates polished narratives in 3 literary voices (Poetic, Traditional Faith, Journalistic) with zero AI hallucination.',
      highlights: [
        'Guided family voice & text interview questions',
        'Verified Fact Ledger cross-check against vital records',
        'Direct 1-click proof sign-off & print-ready typesetting'
      ],
      buttonText: 'Open Obituary Studio',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'tribute' as const,
      tab: 'tribute' as const,
      title: '360° Living Digital Tribute & Voice Archive',
      subtitle: 'Living Memories & Voice Keepsakes',
      icon: Headphones,
      iconBg: 'bg-rose-100 text-[#991b1b]',
      borderHover: 'hover:border-red-400',
      badge: 'Living Voice Keepsakes',
      badgeColor: 'bg-red-50 text-[#991b1b] border-red-200',
      description: 'Collect living voice memories from relatives, church elders, and lifelong friends worldwide. Listen to heartfelt recordings in an interactive audio waveform player.',
      highlights: [
        'Voice prompt cards for childhood, church & family reflections',
        '1-Click SMS & Email invitation sender for friends',
        'Print-ready 4-up memorial QR cards for wake easels'
      ],
      buttonText: 'Listen & Record Memories',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'webcast' as const,
      tab: 'webcast' as const,
      title: '4K HD Live Sanctuary Webcasting & Guest Sharing',
      subtitle: 'Chapel 1, Chapel 2 & Repast Room Broadcasts',
      icon: Video,
      iconBg: 'bg-sky-100 text-sky-800',
      borderHover: 'hover:border-sky-400',
      badge: '4K Multi-Camera Live Stream',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
      description: 'Join the sanctuary celebration of life from anywhere in the world. Includes multi-angle 4K PTZ cameras, direct pipe organ and pulpit audio, and private PIN security.',
      highlights: [
        'Live stream player preview with real-time countdown',
        'Instant SMS & Email guest invite dispatcher',
        '1-Page printable service bulletin with direct stream QR'
      ],
      buttonText: 'Watch Webcast & Share',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'concierge' as const,
      tab: 'concierge' as const,
      title: '24/7 Family Care Concierge & Legal Guide',
      subtitle: 'Financial Benefits & Consumer Rights Assistant',
      icon: MessageSquare,
      iconBg: 'bg-purple-100 text-purple-800',
      borderHover: 'hover:border-purple-400',
      badge: 'AI Assistant & Benefits Hub',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      description: 'Instant 24/7 guidance for your family. Explore VA Military Honors ($2,000 allowance), NYC HRA $1,700 burial aid, SSA $255 benefits, NYS OVS $6,000 aid, and NY PHL § 4201 laws.',
      highlights: [
        'Case-aware conversational AI for immediate answers',
        'Financial Benefit claim trackers and document checklists',
        'Tri-State funeral consumer rights & 1-click Director hotline'
      ],
      buttonText: 'Ask 24/7 Concierge',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'documents' as const,
      tab: 'documents' as const,
      title: 'Legal Authorizations & Digital eSign Suite',
      subtitle: 'State-Mandated Disposition Consents',
      icon: PenTool,
      iconBg: 'bg-emerald-100 text-emerald-800',
      borderHover: 'hover:border-emerald-400',
      badge: `${pendingDocsCount} Action Required`,
      badgeColor: pendingDocsCount > 0 ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Review and legally sign required documents from any phone or computer without traveling back and forth. All signatures include legal audit timestamps.',
      highlights: [
        'NYC EDRS Vital Statistics authorization & permit release',
        'Cremation & Embalming statutory informed consents',
        'Certificate of Disposition and Woodlawn transit permits'
      ],
      buttonText: 'Review & eSign Documents',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'arrangements' as const,
      tab: 'arrangements' as const,
      title: 'Arrangement Summary & Transparent Accounting',
      subtitle: 'Itemized Statement of Goods & Services',
      icon: Calendar,
      iconBg: 'bg-indigo-100 text-indigo-800',
      borderHover: 'hover:border-indigo-400',
      badge: 'Transparent Ledger',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      description: 'Clear itemized review of your selected service package, ceremonial casket or bronze urn, chapel parlor reservation, clergy officiant, and split-billing insurance payments.',
      highlights: [
        'Complete breakdown conforming to NYS General Price List (GPL)',
        'Life insurance assignment & county grant tracking',
        'Order of service schedule & cemetery destination'
      ],
      buttonText: 'View Arrangement Summary',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'photos' as const,
      tab: 'photos' as const,
      title: 'Memorial Photo Gallery & DVD Tribute Studio',
      subtitle: 'High-Resolution Portrait Archives',
      icon: ImageIcon,
      iconBg: 'bg-pink-100 text-pink-800',
      borderHover: 'hover:border-pink-400',
      badge: 'Program & Video Uploads',
      badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
      description: 'Upload high-resolution family photos and cherished portraits for order-of-service program covers, digital chapel screen displays, and keepsake memorial DVD video slideshows.',
      highlights: [
        'Designated placement tags: Front Cover, Inside Spread, Back Keepsake',
        'Direct download for printer typesetting & DVD video mastering',
        'Safe cloud archive preserved for the family'
      ],
      buttonText: 'Upload Memorial Photos',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'status' as const,
      tab: 'status' as const,
      title: 'Real-Time Custodial Care & Livery Cortege Status',
      subtitle: 'Care Journey & Limousine Logistics',
      icon: Car,
      iconBg: 'bg-neutral-200 text-neutral-800',
      borderHover: 'hover:border-neutral-400',
      badge: 'Restorative Care Active',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Follow every step of your loved one’s care journey from hospital release to safe arrival at 630 St. Nicholas Ave, restorative preparation, and limousine cortege scheduling.',
      highlights: [
        'Safe arrival confirmed at 630 St. Nicholas Ave Preparation Suite',
        'Lead hearse & 8-seater limousine hold tracking',
        'Chapel assignment & sanitized staging confirmation'
      ],
      buttonText: 'Track Care & Livery Status',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. DIGNIFIED WELCOME HERO BANNER */}
      <div className="bg-gradient-to-br from-[#141b2b] via-[#1c2538] to-[#2a1d12] text-white p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden border-2 border-amber-500/40">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-4 opacity-10 pointer-events-none hidden lg:block">
          <Building className="w-64 h-64 text-amber-300" />
        </div>

        <div className="max-w-3xl space-y-4 relative z-10">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center space-x-1.5 bg-amber-400/20 border border-amber-400/60 text-amber-200 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Benta's Private Family Care Portal</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-400/40 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Resting Safely in Care at 630 St. Nicholas Ave</span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-neutral-300 uppercase tracking-widest font-semibold">
              Welcoming {activeCase.informant.fullName} ({activeCase.informant.relationship}) & The Family
            </div>
            <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide">
              In Loving Memory of<br />
              <strong className="text-amber-300">{activeCase.decedent.legalName}</strong>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-light italic">
              {activeCase.decedent.dateOfBirth} — {activeCase.decedent.dateOfDeath} • Case #{activeCase.caseNumber}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed max-w-2xl">
            This private portal is your family’s dedicated, 24/7 digital center to craft your loved one's story, invite friends to share voice tributes, review legal documents, watch the live sanctuary broadcast, and explore financial benefits with complete transparency.
          </p>

          {/* Quick Stats / Highlights Ribbon */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">Sanctuary Service</span>
              <div className="font-bold text-white text-xs">{activeCase.serviceSelections.serviceDate || 'Sep 22, 2026'}</div>
              <div className="text-[10px] text-neutral-300">{activeCase.serviceSelections.viewingParlor}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">4K Live Webcast</span>
              <div className="font-bold text-white text-xs">Chapel 1 & 2 Active</div>
              <div className="text-[10px] text-emerald-300">PIN: 1928 Protected</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">Legal eSign</span>
              <div className="font-bold text-white text-xs">
                {pendingDocsCount > 0 ? `${pendingDocsCount} Pending Review` : 'All Completed'}
              </div>
              <div className="text-[10px] text-neutral-300">NYC EDRS Verified</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">Director Hotline</span>
              <div className="font-bold text-white text-xs">(212) 281-8850</div>
              <div className="text-[10px] text-neutral-300">Jason Benta, LFD</div>
            </div>
          </div>

          {/* Interactive Tutorial Launcher Banner */}
          {onOpenGuidedTour && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenGuidedTour}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
                title="Start the 6-step interactive family portal guide"
              >
                <Sparkles className="w-4 h-4 text-neutral-950 animate-pulse" />
                <span>Start Interactive Family Guide (6 Comfort Steps)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-amber-200/90 italic">
                💡 Guided walkthrough of your obituary suite, floral gifts, live webcast & legal vault
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#141b2b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* 1.5 IN-PERSON ARRANGEMENT CONFERENCE SCHEDULING CARD */}
      <div className="bg-white border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-amber-100 text-[#991b1b] rounded-lg">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#b45309]">
                Family Arrangement Conference • 630 St. Nicholas Ave
              </span>
            </div>
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
              {isConfirmed
                ? 'Your In-Person Arrangement Conference is Confirmed'
                : hasProposedSlots
                ? 'Select Your In-Person Arrangement Conference Timeslot'
                : 'In-Person Arrangement Conference with Director Jason Benta'}
            </h2>
            <p className="text-xs text-neutral-500 font-light">
              Meet privately in our Harlem parlors at 630 St. Nicholas Ave to finalize service details, floral tributes, and memorial arrangements.
            </p>
          </div>

          <div>
            <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isConfirmed 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : hasProposedSlots 
                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              <span>{isConfirmed ? '✅ Confirmed & Reserved' : hasProposedSlots ? '📱 Action: Pick Your Time' : 'Scheduling Pending'}</span>
            </span>
          </div>
        </div>

        {/* STATE A: CONFIRMED APPOINTMENT */}
        {isConfirmed && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Confirmed Date & Time */}
              <div className="bg-gradient-to-br from-amber-50/80 to-red-50/40 p-5 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Date & Time</span>
                  <Clock className="w-4 h-4 text-[#991b1b]" />
                </div>
                <div className="text-lg font-bold font-serif-title text-[#991b1b]">
                  {appt?.confirmedSlot?.date || appt?.confirmedAt}
                </div>
                <div className="text-xs font-semibold text-neutral-800">
                  {appt?.confirmedSlot?.time} • (2-Hour Dedicated Private Session)
                </div>
                <p className="text-[11px] text-neutral-500 font-light">
                  Prompt arrival recommended. Dedicated private reception.
                </p>
              </div>

              {/* Location & Room */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Harlem Location</span>
                  <MapPin className="w-4 h-4 text-[#b45309]" />
                </div>
                <div className="text-sm font-bold text-neutral-900">
                  630 St. Nicholas Ave
                </div>
                <div className="text-xs text-neutral-700 font-medium">
                  {appt?.locationVenue || 'Arrangement Suite A (Seats 6)'}
                </div>
                <p className="text-[11px] text-neutral-500 font-light">
                  At W 141st St, Harlem, NY 10030. Dedicated family parking reserved.
                </p>
              </div>

              {/* Assigned Director & Attendees */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Director & Attendees</span>
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-sm font-bold text-neutral-900">
                  {appt?.assignedDirectorName || 'Jason Benta, LFD'}
                </div>
                <div className="text-xs text-emerald-800 font-medium">
                  {appt?.attendingFamilyCount || 2} Expected Family Attendees
                </div>
                <p className="text-[11px] text-neutral-500 font-light truncate">
                  Registered: {appt?.attendingFamilyNames?.join(', ') || activeCase.informant.fullName}
                </p>
              </div>

            </div>

            {/* Checklist & Logistics Box */}
            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/80 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#991b1b]" />
                <span>What to Bring to Your Conference (Preparation Checklist)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-neutral-700">
                <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-start gap-2">
                  <span className="text-[#991b1b] font-bold">1.</span>
                  <span>Recent high-res portrait for obituary and printed memorial programs.</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-start gap-2">
                  <span className="text-[#991b1b] font-bold">2.</span>
                  <span>Clothing & attire (undergarments, shoes, jewelry, rosary/cross if desired).</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-start gap-2">
                  <span className="text-[#991b1b] font-bold">3.</span>
                  <span>Social Security #, parents' full birth names, and vital birth history for state EDRS.</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-start gap-2">
                  <span className="text-[#991b1b] font-bold">4.</span>
                  <span>Military DD-214 discharge papers (if veteran) & insurance policies for verification.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendDirectionsSms}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Parking Pass & Directions to My Phone (SMS)</span>
                </button>

                <a
                  href="https://maps.google.com/?q=630+St+Nicholas+Ave+New+York+NY+10030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1 border border-neutral-300"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#b45309]" />
                  <span>Google Maps GPS</span>
                </a>
              </div>

              <div>
                <button
                  onClick={() => setIsRescheduleOpen(!isRescheduleOpen)}
                  className="text-xs font-semibold text-neutral-600 hover:text-[#991b1b] underline"
                >
                  Need to change time or add attendees? Request Reschedule ➔
                </button>
              </div>
            </div>

            {/* Reschedule Modal / Dialog */}
            {isRescheduleOpen && (
              <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#991b1b] font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Request Appointment Reschedule with Director
                  </strong>
                  <button onClick={() => setIsRescheduleOpen(false)} className="text-neutral-500 hover:text-neutral-900 text-xs">✕</button>
                </div>
                <p className="text-xs text-neutral-600">
                  Please specify your preferred new date, morning/afternoon timeframe, or additional family members joining:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rescheduleMessage}
                    onChange={(e) => setRescheduleMessage(e.target.value)}
                    placeholder="e.g. Please move to Thursday at 2:00 PM; 4 family members will attend"
                    className="flex-1 text-xs p-2.5 border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                  />
                  <button
                    onClick={handleSubmitRescheduleRequest}
                    disabled={!rescheduleMessage.trim()}
                    className="bg-[#991b1b] disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-red-800 transition shadow-sm"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* STATE B: PROPOSED CANDIDATE SLOTS (1-TAP SELECTION FOR FAMILY) */}
        {!isConfirmed && hasProposedSlots && (
          <div className="space-y-6">
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300/80 text-xs text-amber-950 flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-[#991b1b] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-[#991b1b]">Director Proposed Timeslots:</strong> Select a candidate timeslot below that best suits your family. Your selection will immediately lock your private consultation room on Benta's master calendar and dispatch a confirmation SMS with arrival directions.
              </div>
            </div>

            {/* Candidate Timeslot Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {(appt?.proposedSlots || []).map((slot, idx) => {
                const isSelected = selectedSlotIndex === idx;
                return (
                  <div
                    key={slot.id || idx}
                    onClick={() => setSelectedSlotIndex(idx)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                      isSelected
                        ? 'bg-amber-50/90 border-[#991b1b] shadow-md ring-2 ring-[#991b1b]/10'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                        Option {idx + 1}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#991b1b] bg-[#991b1b] text-white' : 'border-neutral-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-neutral-900 text-sm">{slot.dateLabel || slot.date}</div>
                      <div className="text-base font-serif-title font-bold text-[#991b1b] mt-0.5">{slot.time}</div>
                    </div>

                    <div className="text-[11px] text-neutral-600 border-t border-neutral-100 pt-2 space-y-0.5">
                      <div className="flex items-center gap-1 font-medium text-neutral-800">
                        <MapPin className="w-3 h-3 text-[#b45309]" />
                        <span className="truncate">{appt?.locationVenue || '630 St. Nicholas Ave'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500">{slot.durationMinutes || 90}-Min Private Consultation</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attendee Info & Confirm Action */}
            <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Family Attendees & Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">
                    Number of Family Members Attending:
                  </label>
                  <select
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => (
                      <option key={n} value={n}>{n} Family Attendees</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">
                    Attendee Names (Optional):
                  </label>
                  <input
                    type="text"
                    value={attendeeNamesInput}
                    onChange={(e) => setAttendeeNamesInput(e.target.value)}
                    placeholder="e.g. John Doe, Sarah Doe, Elder Vance"
                    className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1 text-xs">
                  Special Notes or Mobility Requests (Optional):
                </label>
                <input
                  type="text"
                  value={specialNotesInput}
                  onChange={(e) => setSpecialNotesInput(e.target.value)}
                  placeholder="e.g. Wheelchair accessible elevator required; requested Rev. Jenkins on speakerphone"
                  className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200">
                <div className="text-xs text-neutral-500">
                  Meeting at: <strong className="text-neutral-900">630 St. Nicholas Ave with Jason Benta, LFD</strong>
                </div>

                <button
                  onClick={handleConfirmSelectedSlot}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-md border border-amber-300/40"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Confirm In-Person Conference (1-Tap Lock)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STATE C: NO APPOINTMENT INITIALIZED */}
        {!isConfirmed && !hasProposedSlots && (
          <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 text-center space-y-3">
            <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="font-serif-title text-base font-bold text-neutral-900">
              In-Person Arrangement Conference Scheduling
            </h3>
            <p className="text-xs text-neutral-600 max-w-lg mx-auto">
              Our licensed funeral directors are available to meet at 630 St. Nicholas Ave. You can request an in-person consultation or reach us directly.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <a
                href="tel:2122818850"
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Director (212) 281-8850</span>
              </a>
            </div>
          </div>
        )}

      </div>

      {/* 2. "WHERE TO START" RECOMMENDED ACTION ROADMAP */}
      <div className="bg-amber-50/80 border-2 border-amber-300/80 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[#991b1b]">
            <CheckCircle2 className="w-5 h-5 text-[#991b1b]" />
            <h3 className="font-serif-title text-base sm:text-lg font-bold text-neutral-900">
              Where Should Your Family Begin? (Recommended Journey)
            </h3>
          </div>
          <span className="text-xs text-[#b45309] font-bold bg-amber-100 px-3 py-1 rounded-full">
            4-Step Priority Guide
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div 
            onClick={() => onNavigateTab('obituary')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991b1b] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">Tell Their Life Story</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Answer 9 guided biographical questions to craft the official printed obituary and program bio.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>Start Story Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('documents')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-[#b45309] font-bold text-xs flex items-center justify-center">
                2
              </span>
              <PenTool className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">eSign Authorizations</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Review and sign state-required cremation, embalming, and vital records permits from your phone.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>Open eSign Pad</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('tribute')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <Headphones className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">Invite Friends & Relatives</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Share the living voice tribute link via SMS or WhatsApp so friends can record audio memories.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>Send Voice Invites</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('webcast')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                4
              </span>
              <Video className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">Share Live Webcast Link</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Send the live 4K sanctuary webcast link and print 1-page bulletins with QR codes for remote guests.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>View Webcast Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. "WHAT THIS PORTAL OFFERS" COMPLETE 8-MODULE DIRECTORY */}
      <div className="space-y-4">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-neutral-900">
              What This Portal Offers Your Family
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Explore the 8 purpose-built studios and suites available inside your private Benta portal.
            </p>
          </div>
        </div>

        {/* 8-Card Grid (2 columns on large screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portalOfferings.map((offering) => {
            const Icon = offering.icon;
            return (
              <div
                key={offering.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border-2 border-neutral-200 ${offering.borderHover} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group`}
              >
                {/* Card Top */}
                <div className="space-y-3">
                  
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center space-x-3">
                      <span className={`p-3 rounded-2xl ${offering.iconBg} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </span>
                      <div>
                        <h3 className="font-serif-title text-lg font-bold text-neutral-900 leading-snug">
                          {offering.title}
                        </h3>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {offering.subtitle}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${offering.badgeColor}`}>
                      {offering.badge}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {offering.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="bg-neutral-50 rounded-2xl p-3.5 space-y-1.5 border border-neutral-200/70 text-xs">
                    {offering.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{h}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card Action Button */}
                <button
                  onClick={() => onNavigateTab(offering.tab)}
                  className={`w-full ${offering.buttonColor} font-bold text-xs py-3 px-4 rounded-2xl transition flex items-center justify-center space-x-2 shadow-md shadow-red-950/10 group-hover:shadow-lg`}
                >
                  <span>{offering.buttonText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

              </div>
            );
          })}
        </div>

      </div>

      {/* 4. SECURITY, PRIVACY & LEGAL COMPLIANCE FOOTER CARD */}
      <div className="bg-[#141b2b] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/40 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif-title text-base sm:text-lg font-bold text-white">
              Bank-Grade Security & New York State Regulatory Compliance
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
              All electronic signatures are cryptographically sealed and comply with <strong>NYS Public Health Law § 4201</strong> and <strong>FTC Funeral Rules</strong>. Pre-need financial funds are held in 100% FDIC-insured trust escrow under NY GBL § 453.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <a
            href="tel:2122818850"
            className="px-5 py-3 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs rounded-2xl transition flex items-center space-x-2 shadow-lg shadow-red-950/40"
          >
            <Phone className="w-4 h-4 text-amber-300" />
            <span>Call Director: (212) 281-8850</span>
          </a>
        </div>

      </div>

    </div>
  );
};
