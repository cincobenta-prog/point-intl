import React, { useState } from 'react';
import { 
  ServicePartnerContact, 
  PartnerScheduleRequest, 
  PartnerCategory, 
  PartnerRequestStatus,
  GoldenRecordCase 
} from '../../lib/types/funeral';
import { 
  BFH_OFFICIAL_STAFF,
  BENTA_TRANSPORTATION_FLEET,
  TRI_STATE_CHURCHES_DIRECTORY,
  TRI_STATE_HOSPITALS_DIRECTORY,
  TRI_STATE_NURSING_HOMES_DIRECTORY,
  FLORAL_CATALOG_DATA,
  CASKET_MANUFACTURER_CATALOGS,
  TRI_STATE_CEMETERIES_DIRECTORY
} from '../../lib/data/partnerCatalogs';
import {
  ALL_UNIFIED_MERCHANDISE,
  BATESVILLE_CASKETS,
  MILSO_CASKETS,
  ManufacturerFilter,
  searchMerchandise
} from '../../lib/data/casketCatalog';
import { 
  formatPhoneNumbersOnly, 
  isValidEmailFormat 
} from '../../lib/utils/inputValidation';
import { 
  Users, 
  Scissors, 
  Music, 
  Church, 
  UserCheck, 
  Phone, 
  Mail, 
  Plus, 
  Upload, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  MessageSquare, 
  RefreshCw, 
  FileSpreadsheet, 
  X, 
  Search,
  Video,
  Car,
  Building2,
  Flower,
  ShieldCheck,
  ExternalLink,
  Layers,
  Award,
  Smartphone
} from 'lucide-react';

interface ServicePartnerNetworkManagerProps {
  partners: ServicePartnerContact[];
  requests: PartnerScheduleRequest[];
  cases: GoldenRecordCase[];
  activeCase: GoldenRecordCase;
  onAddPartner: (newPartner: ServicePartnerContact) => void;
  onImportPartners: (newPartners: ServicePartnerContact[]) => void;
  onAddRequest: (newReq: PartnerScheduleRequest) => void;
  onUpdateRequest: (updatedReq: PartnerScheduleRequest) => void;
  onSimulateReminder: (requestId: string) => void;
  onSimulateConfirm: (requestId: string) => void;
  onOpenTwoWaySmsModal?: (requestId?: string) => void;
}

export const ServicePartnerNetworkManager: React.FC<ServicePartnerNetworkManagerProps> = ({
  partners,
  requests,
  cases,
  activeCase,
  onAddPartner,
  onImportPartners,
  onAddRequest,
  onUpdateRequest,
  onSimulateReminder,
  onSimulateConfirm,
  onOpenTwoWaySmsModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'all_cases_sms' | 'directory' | 'bfh_staff' | 'benta_fleet' | 'churches' | 'hospitals' | 'nursing_homes' | 'florists' | 'caskets' | 'cemeteries' | 'dispatch' | 'reminders'
  >('all_cases_sms');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PartnerCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerCasketFilter, setPartnerCasketFilter] = useState<ManufacturerFilter>('all');
  const [partnerCasketCategory, setPartnerCasketCategory] = useState<string>('all');
  
  // Modals
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [phoneLogRequestId, setPhoneLogRequestId] = useState<string | null>(null);
  const [phoneLogNotes, setPhoneLogNotes] = useState<string>('Director called vendor directly. Vendor verbally confirmed availability and arrival time.');
  const [phoneLogCallerName, setPhoneLogCallerName] = useState<string>('Jason Benta, LFD #08850');

  // New Partner Form State
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerRole, setNewPartnerRole] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState<PartnerCategory>('hairdresser_barber');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerOrg, setNewPartnerOrg] = useState('');
  const [newPartnerRate, setNewPartnerRate] = useState('');
  const [newPartnerNotes, setNewPartnerNotes] = useState('');

  // CSV Import State
  const [csvRawText, setCsvRawText] = useState('');
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  // New Dispatch Request Form State
  const [dispatchCaseId, setDispatchCaseId] = useState<string>(activeCase.id);
  const [dispatchPartnerId, setDispatchPartnerId] = useState<string>(partners[0]?.id || '');
  const [dispatchStandbyPartnerId, setDispatchStandbyPartnerId] = useState<string>(partners[1]?.id || '');
  const [dispatchSlaHours, setDispatchSlaHours] = useState<number>(4);
  const [dispatchDate, setDispatchDate] = useState<string>(activeCase.serviceSelections.serviceDate || '2026-09-22');
  const [dispatchCallTime, setDispatchCallTime] = useState<string>('09:30 AM');
  const [dispatchEndTime, setDispatchEndTime] = useState<string>('12:30 PM');
  const [dispatchVenue, setDispatchVenue] = useState<string>('630 St. Nicholas Ave - Preparation Suite');
  const [dispatchInstructions, setDispatchInstructions] = useState<string>('Please arrive in formal attire. Reference family portrait photo in digital portal.');
  const [dispatchFee, setDispatchFee] = useState<string>('$200.00');

  // Filtered partners
  const filteredPartners = partners.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        (p.organization && p.organization.toLowerCase().includes(q)) ||
        p.phone.includes(q)
      );
    }
    return true;
  });

  const getCategoryMeta = (cat: PartnerCategory) => {
    switch (cat) {
      case 'hairdresser_barber':
        return { label: 'Hairdressers & Barbers', icon: Scissors, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'outside_director':
        return { label: 'Outside Trade Directors', icon: UserCheck, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'pallbearer':
        return { label: 'Pallbearer Guilds', icon: Users, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'musician_organist':
        return { label: 'Organists & Musicians', icon: Music, color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'minister_clergy':
        return { label: 'Ministers & Clergy', icon: Church, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'broadcast_av_tech':
        return { label: 'Webcast & AV Technicians', icon: Video, color: 'text-sky-700 bg-sky-50 border-sky-200' };
      default:
        return { label: 'Livery & Other', icon: Users, color: 'text-neutral-700 bg-neutral-50 border-neutral-200' };
    }
  };

  const getStatusMeta = (status: PartnerRequestStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed (YES Received)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'overdue_unconfirmed':
        return { label: '🚨 Overdue (Director Action Req)', color: 'bg-red-50 text-red-900 border-red-300 animate-pulse' };
      case 'reminder_1_sent':
        return { label: 'Reminder #1 Sent (Awaiting Reply)', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'reminder_2_sent':
        return { label: 'Reminder #2 Sent (Urgent)', color: 'bg-orange-50 text-orange-800 border-orange-300' };
      case 'sms_sent':
        return { label: 'SMS Sent (Awaiting Reply)', color: 'bg-blue-50 text-blue-800 border-blue-300' };
      case 'declined':
        return { label: 'Declined (Reassign Needed)', color: 'bg-red-50 text-red-800 border-red-300' };
      case 'completed':
        return { label: 'Service Completed', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' };
      default:
        return { label: 'Pending SMS Dispatch', color: 'bg-neutral-50 text-neutral-600 border-neutral-200' };
    }
  };

  // Live selected partner for dispatch
  const currentSelectedPartner = partners.find(p => p.id === dispatchPartnerId) || partners[0];
  const currentStandbyPartner = partners.find(p => p.id === dispatchStandbyPartnerId) || partners[1];
  const currentTargetCase = cases.find(c => c.id === dispatchCaseId) || activeCase;

  // Auto-generate SMS Draft
  const generatedSmsText = `BFH SERVICE REQUEST: Dear ${currentSelectedPartner?.fullName || 'Partner'}, Benta's Funeral Home requests your ${currentSelectedPartner?.roleTitle || 'services'} for the ${currentTargetCase?.informant.fullName.split(' ')[1] || 'Family'} (${currentTargetCase?.decedent.legalName}, Case #${currentTargetCase?.caseNumber}) on ${dispatchDate} at ${dispatchCallTime}. Location: ${dispatchVenue}. Special notes: ${dispatchInstructions}. Compensation: ${dispatchFee}. Reply YES to confirm within ${dispatchSlaHours}h or NO if unavailable.`;

  // 1-Tap Standby Cascade Fallback Handler
  const handleStandbyCascade = (req: PartnerScheduleRequest) => {
    const standbyPartner = partners.find(p => p.id === req.standbyBackupPartnerId || p.fullName === req.standbyBackupPartnerName) || partners.find(p => p.category === req.category && p.id !== req.partnerId);
    if (!standbyPartner) {
      alert('No standby backup partner found in directory for this category.');
      return;
    }

    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();
    const newSmsText = `BFH URGENT STANDBY DISPATCH: Dear ${standbyPartner.fullName}, you have been activated from standby for ${req.roleTitle} on Case #${req.caseNumber} (${req.decedentName}) on ${req.serviceDate} at ${req.callTime} (${req.venueLocation}). Please reply YES immediately to confirm.`;

    const updated: PartnerScheduleRequest = {
      ...req,
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
      threadMessages: [
        ...(req.threadMessages || []),
        {
          id: `msg-cascade-${Date.now()}`,
          sender: 'bfh_dispatch',
          senderName: "Benta's Dispatch (Standby Cascade Fallback)",
          senderPhone: '(212) 281-8850',
          body: `[CASCADE FALLBACK ACTIVATED]: Primary vendor was unresponsive past SLA deadline. Service reassigned to Standby Partner ${standbyPartner.fullName} (${standbyPartner.phone}). SMS hold dispatched.`,
          timestamp: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: 'delivered'
        }
      ]
    };

    onUpdateRequest(updated);
  };

  // 1-Tap Verbal Phone Confirmation Handler
  const handleLogDirectorPhoneCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneLogRequestId) return;

    const req = requests.find(r => r.id === phoneLogRequestId);
    if (!req) return;

    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();
    const updated: PartnerScheduleRequest = {
      ...req,
      status: 'confirmed',
      isOverdue: false,
      directorFollowUpRequired: false,
      directorCalledAt: nowFormatted,
      directorFollowUpNotes: phoneLogNotes,
      escalationStatus: 'director_phone_confirmed',
      confirmedAt: nowFormatted,
      threadMessages: [
        ...(req.threadMessages || []),
        {
          id: `msg-phone-call-${Date.now()}`,
          sender: 'bfh_dispatch',
          senderName: phoneLogCallerName,
          senderPhone: '(212) 281-8850',
          body: `[DIRECTOR PHONE CALL LOGGED]: ${phoneLogNotes} (Logged by ${phoneLogCallerName} at ${nowFormatted})`,
          timestamp: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: 'delivered'
        }
      ]
    };

    onUpdateRequest(updated);
    setPhoneLogRequestId(null);
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !newPartnerPhone.trim()) return;

    if (newPartnerEmail.trim() && !isValidEmailFormat(newPartnerEmail.trim())) {
      alert('Please enter a valid email format (e.g. partner@harlem.org).');
      return;
    }

    const initials = newPartnerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const newP: ServicePartnerContact = {
      id: `sp-${Date.now()}`,
      fullName: newPartnerName.trim(),
      roleTitle: newPartnerRole.trim() || 'Specialized Service Partner',
      category: newPartnerCategory,
      phone: newPartnerPhone.trim(),
      email: newPartnerEmail.trim() || undefined,
      organization: newPartnerOrg.trim() || undefined,
      status: 'active',
      rateInfo: newPartnerRate.trim() || undefined,
      notes: newPartnerNotes.trim() || undefined,
      avatarInitials: initials
    };

    onAddPartner(newP);
    setIsAddPartnerModalOpen(false);
    setNewPartnerName('');
    setNewPartnerPhone('');
    setNewPartnerRole('');
    setNewPartnerEmail('');
    setNewPartnerOrg('');
    setNewPartnerRate('');
    setNewPartnerNotes('');
  };

  const handleCreateDispatchRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedPartner || !currentTargetCase) return;

    const deadlineHour = new Date(Date.now() + dispatchSlaHours * 3600000);
    const deadlineStr = `Today ${deadlineHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newReq: PartnerScheduleRequest = {
      id: `req-${Date.now()}`,
      caseId: currentTargetCase.id,
      caseNumber: currentTargetCase.caseNumber,
      familyReferenceName: `${currentTargetCase.informant.fullName.split(' ')[1] || 'Family'} Family`,
      decedentName: currentTargetCase.decedent.legalName,
      partnerId: currentSelectedPartner.id,
      partnerName: currentSelectedPartner.fullName,
      partnerPhone: currentSelectedPartner.phone,
      category: currentSelectedPartner.category,
      roleTitle: currentSelectedPartner.roleTitle,
      serviceDate: dispatchDate,
      callTime: dispatchCallTime,
      serviceEndTime: dispatchEndTime,
      venueLocation: dispatchVenue,
      specialInstructions: dispatchInstructions,
      honorariumFee: dispatchFee,
      status: 'sms_sent',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      remindersCount: 0,
      recurringIntervalMinutes: 240,
      smsMessageDraft: generatedSmsText,
      responseDeadline: deadlineStr,
      isOverdue: false,
      overdueMinutes: 0,
      urgencyLevel: 'normal',
      directorFollowUpRequired: false,
      standbyBackupPartnerId: currentStandbyPartner?.id,
      standbyBackupPartnerName: currentStandbyPartner?.fullName,
      standbyBackupPartnerPhone: currentStandbyPartner?.phone,
      standbyBackupRoleTitle: currentStandbyPartner?.roleTitle,
      escalationStatus: 'normal'
    };

    onAddRequest(newReq);
    setActiveSubTab('all_cases_sms');
  };

  const handleParseCSV = () => {
    if (!csvRawText.trim()) {
      setCsvFeedback('Please paste or upload CSV text.');
      return;
    }

    try {
      const lines = csvRawText.trim().split('\n');
      const parsedPartners: ServicePartnerContact[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.toLowerCase().startsWith('name') || line.toLowerCase().startsWith('fullname')) {
          continue; // skip header
        }

        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 3) {
          const name = cols[0];
          const role = cols[1];
          let cat: PartnerCategory = 'hairdresser_barber';
          const catStr = (cols[2] || '').toLowerCase();
          
          if (catStr.includes('barber') || catStr.includes('hair') || catStr.includes('cosmet')) cat = 'hairdresser_barber';
          else if (catStr.includes('director') || catStr.includes('lfd')) cat = 'outside_director';
          else if (catStr.includes('bearer') || catStr.includes('pall')) cat = 'pallbearer';
          else if (catStr.includes('organ') || catStr.includes('music') || catStr.includes('sing') || catStr.includes('choir')) cat = 'musician_organist';
          else if (catStr.includes('clergy') || catStr.includes('minister') || catStr.includes('pastor') || catStr.includes('reverend')) cat = 'minister_clergy';
          else if (catStr.includes('livery') || catStr.includes('limo') || catStr.includes('hearse')) cat = 'livery_transport';

          const phone = cols[3] || '(212) 555-0100';
          const email = cols[4] || '';
          const org = cols[5] || '';
          const rate = cols[6] || '';
          const notes = cols[7] || '';

          const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          parsedPartners.push({
            id: `sp-import-${Date.now()}-${i}`,
            fullName: name,
            roleTitle: role,
            category: cat,
            phone: phone,
            email: email || undefined,
            organization: org || undefined,
            rateInfo: rate || undefined,
            notes: notes || undefined,
            status: 'active',
            avatarInitials: initials
          });
        }
      }

      if (parsedPartners.length > 0) {
        onImportPartners(parsedPartners);
        setCsvFeedback(`Successfully imported ${parsedPartners.length} service partner contacts into directory!`);
        setTimeout(() => {
          setIsCSVModalOpen(false);
          setCsvFeedback(null);
          setCsvRawText('');
        }, 1200);
      } else {
        setCsvFeedback('No valid partner rows parsed. Please format as: Name, Role, Category, Phone, Email, Organization, Rate');
      }
    } catch (err: any) {
      setCsvFeedback(`Error parsing CSV: ${err.message}`);
    }
  };

  const loadSampleCSVTemplate = () => {
    setCsvRawText(`Full Name,Role Title,Category,Phone,Email,Organization,Rate,Notes
Rev. Dr. Malcolm Turner,Senior Minister & Eulogist,minister_clergy,(212) 555-7721,mturner@salemharlem.org,Salem United Methodist Church,$350 Honorarium,Specializes in choral eulogies and family prayers
Kendra Washington,Master Restorative Beautician,hairdresser_barber,(917) 555-4309,kendra@harlemglamour.com,Harlem Glamour Studio,$225 / session,Delicate wig styling and French manicure
Brother Elijah Brooks,Lead Pallbearer Corps,pallbearer,(646) 555-8819,brooks.bearer@gmail.com,Harlem Formal Bearers Guild,$150 / escort,White glove cortege escort and hearse transfer
Dr. Julian Vance,Church Organist & Pianist,musician_organist,(212) 555-1940,jvance@harlemheritage.org,Harlem Choral Institute,$300 / service,Hammond B3 & Pipe Organ accompaniment
Gregory Hall,Licensed Trade Funeral Director,outside_director,(917) 555-6623,ghall.lfd@gmail.com,NYS Trade Guild,$400 / 4h,Evening wake supervision and cortege driver`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-neutral-900 font-sans">
      
      {/* 1. TOP HEADER & METRIC BANNER */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Service Partner Directory & SMS Dispatch Center
            </h2>
            <span className="bg-red-50 text-[#991b1b] text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Automated SMS Reminders
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 font-light">
            Manage contacts, upload CSVs, and dispatch automated SMS schedule requests to <strong>Hairdressers, Barbers, Outside Trade Funeral Directors, Pallbearers, Organists, and Ministers</strong> with recurring reminder tracking.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-600" />
            <span>Upload / Import CSV Contacts</span>
          </button>

          <button
            onClick={() => setIsAddPartnerModalOpen(true)}
            className="px-3.5 py-2 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition shadow-sm border border-amber-300/40 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add New Contact</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION CONTROLS & METRICS */}
      <div className="space-y-3 bg-white p-3 rounded-2xl border border-neutral-200 shadow-sm">
        
        {/* Master Directory Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('all_cases_sms')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'all_cases_sms'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>All-Cases SMS Matrix</span>
            {requests.some(r => r.isOverdue || r.status === 'overdue_unconfirmed') && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {requests.filter(r => r.isOverdue || r.status === 'overdue_unconfirmed').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'directory'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Trade Services ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bfh_staff')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'bfh_staff'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>BFH Staff & Directors ({BFH_OFFICIAL_STAFF.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('benta_fleet')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'benta_fleet'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Benta Livery Fleet ({BENTA_TRANSPORTATION_FLEET.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('churches')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'churches'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Church className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Churches & Clergy ({TRI_STATE_CHURCHES_DIRECTORY.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hospitals')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'hospitals'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Hospitals & Morgues ({TRI_STATE_HOSPITALS_DIRECTORY.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nursing_homes')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'nursing_homes'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Nursing Homes ({TRI_STATE_NURSING_HOMES_DIRECTORY.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('florists')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'florists'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Flower className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Florists ({FLORAL_CATALOG_DATA.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('caskets')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'caskets'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Caskets ({CASKET_MANUFACTURER_CATALOGS.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cemeteries')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'cemeteries'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Cemeteries ({TRI_STATE_CEMETERIES_DIRECTORY.length})</span>
          </button>

          <div className="h-4 w-px bg-neutral-300 mx-1 hidden sm:block"></div>

          <button
            onClick={() => setActiveSubTab('dispatch')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'dispatch'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Dispatch SMS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reminders')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'reminders'
                ? 'bg-white text-[#991b1b] shadow-xs ring-1 ring-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>SMS Tracker ({requests.filter(r => r.status !== 'confirmed').length})</span>
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search directory by name, address, clergy, phone, or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs outline-none focus:border-[#991b1b]"
            />
          </div>
          <div className="text-[11px] text-neutral-500 font-mono hidden md:block">
            Verified Tri-State Master Network (NY • NJ • CT)
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2B. SUB-VIEW: ALL-CASES SMS STATUS MATRIX & OVERDUE ALERTS */}
      {/* ========================================================= */}
      {activeSubTab === 'all_cases_sms' && (
        <div className="space-y-5">
          
          {/* URGENT SLA OVERDUE ESCALATION BANNER */}
          {requests.some(r => r.isOverdue || r.status === 'overdue_unconfirmed') && (
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border-2 border-red-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 border border-white/30 animate-pulse">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-300 text-red-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      🚨 DIRECTOR ACTION REQUIRED
                    </span>
                    <span className="text-xs font-mono font-bold text-red-100">
                      {requests.filter(r => r.isOverdue || r.status === 'overdue_unconfirmed').length} Partner SLA Deadlines Expired
                    </span>
                  </div>
                  <h3 className="font-serif-title text-base sm:text-lg font-bold text-white mt-0.5">
                    Unconfirmed Service Partners Past Response Deadline
                  </h3>
                  <p className="text-xs text-red-100 font-light mt-0.5 max-w-2xl">
                    Service partners have not responded with "YES" within their SLA cutoff. Funeral Directors should call immediately or trigger a 1-tap <strong>Cascade Fallback</strong> to assign pre-verified Harlem standby backups.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const firstOverdue = requests.find(r => r.isOverdue || r.status === 'overdue_unconfirmed');
                    if (firstOverdue && onOpenTwoWaySmsModal) {
                      onOpenTwoWaySmsModal(firstOverdue.id);
                    }
                  }}
                  className="px-4 py-2 bg-white hover:bg-amber-50 text-red-900 font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-red-800" />
                  <span>Launch 2-Way SMS Studio</span>
                </button>
              </div>
            </div>
          )}

          {/* MASTER MATRIX TABLE */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
              <div>
                <h3 className="font-serif-title font-bold text-lg text-neutral-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#991b1b]" />
                  All-Cases Service Partner SMS Status Matrix
                </h3>
                <p className="text-xs text-neutral-600 font-light mt-0.5">
                  Universal dispatch monitor tracking Hairdressers, Barbers, Outside Trade Directors, Pallbearers, Organists, and Ministers across all active cases.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveSubTab('dispatch')}
                  className="px-3.5 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 border border-amber-300/40"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dispatch New Partner</span>
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200 font-mono">
                    <th className="py-3 px-3">Case & NOK Informant</th>
                    <th className="py-3 px-3">Service Schedule & Venue</th>
                    <th className="py-3 px-3">Primary Service Partner</th>
                    <th className="py-3 px-3">Response SLA & Confirmation Status</th>
                    <th className="py-3 px-3">Standby Backup Partner</th>
                    <th className="py-3 px-3 text-right">Director Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {requests.filter(r => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      r.decedentName.toLowerCase().includes(q) ||
                      r.caseNumber.toLowerCase().includes(q) ||
                      r.partnerName.toLowerCase().includes(q) ||
                      r.roleTitle.toLowerCase().includes(q)
                    );
                  }).map((req) => {
                    const statusMeta = getStatusMeta(req.status);
                    const isConfirmed = req.status === 'confirmed';
                    const isOverdue = req.isOverdue || req.status === 'overdue_unconfirmed';
                    const Icon = getCategoryMeta(req.category).icon;

                    return (
                      <tr 
                        key={req.id}
                        className={`hover:bg-neutral-50/80 transition-colors ${
                          isOverdue ? 'bg-red-50/40' : ''
                        }`}
                      >
                        {/* Case & Decedent */}
                        <td className="py-3 px-3 align-top">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] font-bold text-[#991b1b] bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                              {req.caseNumber}
                            </span>
                            <div className="font-serif-title font-bold text-sm text-neutral-900 leading-tight">
                              {req.decedentName}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-light">
                              {req.familyReferenceName}
                            </div>
                          </div>
                        </td>

                        {/* Service Schedule */}
                        <td className="py-3 px-3 align-top">
                          <div className="space-y-0.5 text-neutral-700">
                            <div className="font-bold text-neutral-900 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#991b1b]" />
                              <span>{req.serviceDate}</span>
                            </div>
                            <div className="text-[11px] font-medium text-[#b45309]">
                              Call: {req.callTime} {req.serviceEndTime ? `(until ${req.serviceEndTime})` : ''}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate max-w-[180px]" title={req.venueLocation}>
                              {req.venueLocation}
                            </div>
                          </div>
                        </td>

                        {/* Primary Service Partner */}
                        <td className="py-3 px-3 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="p-1 rounded bg-neutral-100 text-neutral-700">
                                <Icon className="w-3 h-3 text-[#991b1b]" />
                              </span>
                              <strong className="font-serif-title font-bold text-neutral-900">
                                {req.partnerName}
                              </strong>
                            </div>
                            <div className="text-[11px] text-[#b45309] font-bold">
                              {req.roleTitle}
                            </div>
                            <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-[#991b1b]" />
                              <span>{req.partnerPhone}</span>
                              {req.honorariumFee && (
                                <span className="text-neutral-700 font-bold ml-1">({req.honorariumFee})</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Response SLA & Confirmation Status */}
                        <td className="py-3 px-3 align-top">
                          <div className="space-y-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${statusMeta.color}`}>
                              {isConfirmed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              ) : isOverdue ? (
                                <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              )}
                              <span>{statusMeta.label}</span>
                            </span>

                            {isOverdue && (
                              <div className="text-[10px] font-mono text-red-700 font-bold bg-red-100/80 px-2 py-0.5 rounded border border-red-200">
                                ⏱ Overdue by {req.overdueMinutes || 60} mins • Deadline was {req.responseDeadline || 'Expired'}
                              </div>
                            )}

                            {!isOverdue && !isConfirmed && req.responseDeadline && (
                              <div className="text-[10px] font-mono text-neutral-500">
                                SLA Cutoff: <strong>{req.responseDeadline}</strong>
                              </div>
                            )}

                            {isConfirmed && req.confirmedAt && (
                              <div className="text-[10px] font-mono text-emerald-700">
                                Confirmed: {req.confirmedAt}
                              </div>
                            )}

                            {req.escalationStatus === 'backup_cascaded' && (
                              <div className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                ⚡ Standby Cascade Activated
                              </div>
                            )}

                            {req.escalationStatus === 'director_phone_confirmed' && (
                              <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                📞 Director Phone Override Confirmed
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Standby Backup Partner */}
                        <td className="py-3 px-3 align-top">
                          <div className="space-y-1 bg-[#fbfbfd] p-2 rounded-xl border border-neutral-200 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase font-bold text-neutral-500">Standby Route:</span>
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                Armed
                              </span>
                            </div>
                            <div className="font-bold text-neutral-900 leading-tight">
                              {req.standbyBackupPartnerName || 'Assigned in Harlem Directory'}
                            </div>
                            <div className="text-[10px] font-mono text-neutral-600">
                              {req.standbyBackupPartnerPhone || '(212) 555-0199'}
                            </div>
                          </div>
                        </td>

                        {/* Operational Actions */}
                        <td className="py-3 px-3 align-top text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            
                            {/* 1. Open 2-Way SMS Studio */}
                            {onOpenTwoWaySmsModal && (
                              <button
                                onClick={() => onOpenTwoWaySmsModal(req.id)}
                                className="px-2.5 py-1 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-2xs border border-amber-300/40 w-full justify-center"
                                title="Open Live Carrier 2-Way SMS Console"
                              >
                                <Smartphone className="w-3 h-3 text-amber-300" />
                                <span>2-Way SMS Studio</span>
                              </button>
                            )}

                            {/* 2. Overdue Standby Cascade Fallback */}
                            {!isConfirmed && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Cascade service request to Standby Backup Partner (${req.standbyBackupPartnerName || 'Next Available'})? This will reassign the case and send an urgent standby dispatch SMS.`)) {
                                    handleStandbyCascade(req);
                                  }
                                }}
                                className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-2xs w-full justify-center"
                                title="1-Tap Waterfall Cascade: Instantly swap to Standby Backup and dispatch SMS"
                              >
                                <span>⚡ Cascade to Standby</span>
                              </button>
                            )}

                            {/* 3. Director Phone Call Override */}
                            {!isConfirmed && (
                              <button
                                onClick={() => {
                                  setPhoneLogRequestId(req.id);
                                  setPhoneLogNotes(`Director phoned ${req.partnerName} (${req.partnerPhone}) directly. Vendor confirmed on-time arrival for ${req.serviceDate} at ${req.callTime}.`);
                                }}
                                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-xs transition flex items-center gap-1 w-full justify-center"
                                title="Log Director direct verbal phone call confirmation"
                              >
                                <Phone className="w-3 h-3 text-[#991b1b]" />
                                <span>Log Director Call</span>
                              </button>
                            )}

                            {/* 4. Quick Nudge Reminder */}
                            {!isConfirmed && (
                              <button
                                onClick={() => onSimulateReminder(req.id)}
                                className="px-2 py-0.5 text-[10px] text-neutral-600 hover:text-[#991b1b] font-medium flex items-center gap-1"
                                title="Trigger next scheduled SMS reminder"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                                <span>Nudge (#{req.remindersCount + 1})</span>
                              </button>
                            )}

                            {/* 5. Quick Simulate Confirm */}
                            {!isConfirmed && (
                              <button
                                onClick={() => onSimulateConfirm(req.id)}
                                className="px-2 py-0.5 text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                                title="Simulate partner replying YES"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Simulate "YES"</span>
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3A. SUB-VIEW: BFH OFFICIAL DIRECTORS & STAFF               */}
      {/* ========================================================= */}
      {activeSubTab === 'bfh_staff' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#991b1b]" />
                Benta's Funeral Home, Inc. — Official Staff & Licensed Funeral Directors
              </h3>
              <p className="text-xs text-neutral-600 font-light">
                Verified administrative and licensed personnel directory for NYS DOH regulatory compliance, vital filings, and family arrangements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-red-50 text-[#991b1b] border border-red-200 px-3 py-1 rounded-xl font-bold font-mono">
                630 St. Nicholas Ave • Est. 1928
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BFH_OFFICIAL_STAFF.filter(member => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return member.name.toLowerCase().includes(q) || member.title.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
            }).map((member) => (
              <div key={member.id} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#991b1b] transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[#991b1b] font-bold text-base shadow-xs">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-serif-title font-bold text-sm text-neutral-900 leading-snug">{member.name}</h4>
                        <p className="text-xs text-[#991b1b] font-bold">{member.title}</p>
                      </div>
                    </div>
                    {member.licenseNumber && (
                      <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                        {member.licenseNumber}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-[#fbfbfd] rounded-xl border border-neutral-200 space-y-1.5 text-xs text-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 flex items-center gap-1"><Phone className="w-3 h-3 text-[#991b1b]" /> Direct Phone:</span>
                      <strong className="font-mono text-neutral-900">{member.phone}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 flex items-center gap-1"><Mail className="w-3 h-3 text-[#991b1b]" /> Official Email:</span>
                      <a href={`mailto:${member.email}`} className="font-mono text-[#991b1b] hover:underline font-bold text-[11px] truncate max-w-[170px]">
                        {member.email}
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="capitalize font-mono">Role: {member.role}</span>
                  <span className="text-[#991b1b] font-bold flex items-center gap-0.5">
                    Verified Active <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-VIEW 1: PARTNER DIRECTORY & CATEGORY FILTER        */}
      {/* ========================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Category Filter Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                categoryFilter === 'all'
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              All Categories ({partners.length})
            </button>

            <button
              onClick={() => setCategoryFilter('hairdresser_barber')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                categoryFilter === 'hairdresser_barber'
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Scissors className="w-3 h-3" />
              <span>Hairdressers & Barbers ({partners.filter(p => p.category === 'hairdresser_barber').length})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('outside_director')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                categoryFilter === 'outside_director'
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Outside Trade Directors ({partners.filter(p => p.category === 'outside_director').length})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('pallbearer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                categoryFilter === 'pallbearer'
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Pallbearers ({partners.filter(p => p.category === 'pallbearer').length})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('musician_organist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                categoryFilter === 'musician_organist'
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Music className="w-3 h-3" />
              <span>Organists & Musicians ({partners.filter(p => p.category === 'musician_organist').length})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('minister_clergy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                categoryFilter === 'minister_clergy'
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Church className="w-3 h-3" />
              <span>Ministers & Clergy ({partners.filter(p => p.category === 'minister_clergy').length})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('broadcast_av_tech')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                categoryFilter === 'broadcast_av_tech'
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Webcast & AV Techs ({partners.filter(p => p.category === 'broadcast_av_tech').length})</span>
            </button>
          </div>

          {/* Directory Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map((partner) => {
              const meta = getCategoryMeta(partner.category);
              const Icon = meta.icon;

              return (
                <div 
                  key={partner.id}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 flex flex-col justify-between space-y-3 hover:border-neutral-300 transition"
                >
                  <div>
                    {/* Top Row: Category & Status */}
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${meta.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </div>

                    {/* Partner Name & Role */}
                    <div className="flex items-start space-x-3 mt-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-300 font-bold flex items-center justify-center text-sm font-serif-title shrink-0 shadow-xs">
                        {partner.avatarInitials || partner.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-serif-title font-bold text-sm text-neutral-900 leading-tight">
                          {partner.fullName}
                        </h3>
                        <p className="text-xs text-[#b45309] font-medium leading-snug">
                          {partner.roleTitle}
                        </p>
                        {partner.organization && (
                          <p className="text-[11px] text-neutral-500 font-light truncate">
                            {partner.organization}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact & Rates Details */}
                    <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-neutral-700 font-mono font-bold text-xs">
                          <Phone className="w-3 h-3 text-[#991b1b]" />
                          <span>{partner.phone}</span>
                        </span>
                        {partner.email && (
                          <span className="flex items-center gap-1 text-[11px] text-neutral-500 truncate max-w-[130px]">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            <span className="truncate">{partner.email}</span>
                          </span>
                        )}
                      </div>

                      {partner.rateInfo && (
                        <p className="text-[11px] text-neutral-800 bg-neutral-50 p-1.5 rounded-lg border border-neutral-200 font-medium">
                          <strong>Rate/Fee:</strong> {partner.rateInfo}
                        </p>
                      )}

                      {partner.notes && (
                        <p className="text-[10px] text-neutral-500 line-clamp-2 italic pt-0.5">
                          "{partner.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setDispatchPartnerId(partner.id);
                        setActiveSubTab('dispatch');
                      }}
                      className="flex-1 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>Dispatch SMS Hold</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3B. SUB-VIEW: BENTA TRANSPORTATION LIVERY FLEET           */}
      {/* ========================================================= */}
      {activeSubTab === 'benta_fleet' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-neutral-900 to-[#2b0f0f] text-white p-5 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#991b1b] text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-400/30">
                  Official Benta's Fleet Affiliate
                </span>
                <span className="text-xs text-neutral-300 font-mono">www.bentatrans.com</span>
              </div>
              <h3 className="font-serif-title text-xl font-bold text-white flex items-center gap-2">
                Benta Transportation Livery Fleet & Chauffeurs
              </h3>
              <p className="text-xs text-neutral-300 font-light">
                630 Saint Nicholas Avenue, New York, NY 10030 • Dispatch: <strong>(212) 281-4000</strong> / (800) 350-2534 • Email: <strong>info@bentatrans.com</strong>
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {BENTA_TRANSPORTATION_FLEET.length} Active Luxury Vehicles Available
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENTA_TRANSPORTATION_FLEET.filter(v => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return v.name.toLowerCase().includes(q) || v.makeModel.toLowerCase().includes(q) || v.assignedDriver.toLowerCase().includes(q);
            }).map((v) => (
              <div key={v.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-[#991b1b] transition">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#991b1b] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {v.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900 pt-1">{v.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono">{v.makeModel} • Plate: {v.licensePlate}</p>
                  </div>
                  <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-lg">
                    {v.capacity} Pax
                  </span>
                </div>

                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-700">
                    <span>NYC 5-Borough Local Rate:</span>
                    <strong className="text-neutral-900">${v.rateLocalNYC}.00</strong>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Long Distance (Calverton/NJ):</span>
                    <strong className="text-neutral-900">${v.rateDistance}.00</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 text-xs space-y-1">
                  <div className="flex justify-between items-center text-neutral-800 font-medium">
                    <span>Chauffeur: <strong>{v.assignedDriver}</strong></span>
                    <a href={`tel:${v.driverPhone}`} className="text-[#991b1b] hover:underline font-mono font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {v.driverPhone}
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {v.specialFeatures.map((f, i) => (
                      <span key={i} className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3C. SUB-VIEW: TRI-STATE CHURCHES & CLERGY DIRECTORY       */}
      {/* ========================================================= */}
      {activeSubTab === 'churches' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Church className="w-5 h-5 text-[#991b1b]" />
                Tri-State Historic & Prominent Churches & Clergy Directory
              </h3>
              <p className="text-xs text-neutral-600 font-light">
                Verified sanctuaries, pastors, contacts, and organ/livestream capabilities across Harlem, NYC, NJ, and CT.
              </p>
            </div>
            <span className="text-xs bg-red-50 text-[#991b1b] border border-red-200 px-3 py-1 rounded-xl font-bold font-mono">
              {TRI_STATE_CHURCHES_DIRECTORY.length} Sanctuaries Cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRI_STATE_CHURCHES_DIRECTORY.filter(c => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return c.name.toLowerCase().includes(q) || c.seniorPastor.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.denomination.toLowerCase().includes(q);
            }).map((church) => (
              <div key={church.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-[#991b1b] transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {church.denomination}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      {church.sanctuaryCapacity} Seats
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900 leading-tight">{church.name}</h4>
                    <p className="text-xs text-neutral-500 pt-0.5">{church.address}, {church.city}, {church.state} {church.zip}</p>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                    <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#991b1b]" />
                      <span>{church.seniorPastor}</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 italic">{church.pastorTitle}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-700">
                    <span className="font-mono font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#991b1b]" />
                      {church.phone}
                    </span>
                    <a href={`mailto:${church.email}`} className="text-[#991b1b] hover:underline truncate max-w-[140px] text-[11px]">
                      {church.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    {church.hasOrgan && <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium">🎵 Pipe Organ</span>}
                    {church.hasLivestreamCapability && <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium">📹 Broadcast AV</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3D. SUB-VIEW: TRI-STATE HOSPITALS & PATHOLOGY MORGUES     */}
      {/* ========================================================= */}
      {activeSubTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                Tri-State Hospitals & Pathology Morgues Directory
              </h3>
              <p className="text-xs text-neutral-600 font-light">
                All acute care hospitals maintain dedicated pathology cold storage vaults with EDRS release permit protocols.
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-xl font-bold font-mono">
              {TRI_STATE_HOSPITALS_DIRECTORY.length} Acute Centers Cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRI_STATE_HOSPITALS_DIRECTORY.filter(h => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || (h.borough && h.borough.toLowerCase().includes(q));
            }).map((hosp) => (
              <div key={hosp.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-blue-700 transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {hosp.borough || hosp.city}, {hosp.state}
                    </span>
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
                      ❄️ Morgue Refrigeration
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900 leading-tight">{hosp.name}</h4>
                    <p className="text-xs text-neutral-500 pt-0.5">{hosp.address}, {hosp.city}, {hosp.state} {hosp.zip}</p>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1 text-xs">
                    <div className="font-bold text-blue-950 flex items-center justify-between">
                      <span>Morgue Direct Line:</span>
                      <strong className="font-mono text-blue-900">{hosp.morgueOrPathologyPhone || hosp.mainPhone}</strong>
                    </div>
                    <p className="text-[11px] text-blue-800">{hosp.refrigerationDetails}</p>
                    <p className="text-[10px] text-blue-600 font-mono">Release: {hosp.releaseHours}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-600 space-y-1">
                  <p><strong>Loading Bay:</strong> {hosp.securityOrDockInstructions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3E. SUB-VIEW: TRI-STATE NURSING HOMES & SKILLED CARE      */}
      {/* ========================================================= */}
      {activeSubTab === 'nursing_homes' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-amber-950 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-700" />
                Tri-State Nursing Homes & Skilled Care Facilities
              </h3>
              <p className="text-xs text-amber-900 font-light">
                <strong>Crucial Operational Rule:</strong> 99% of nursing homes do <strong>NOT</strong> have on-site refrigeration. NYS DOH requires immediate 2 to 4 hour rapid bedside removal dispatch.
              </p>
            </div>
            <span className="text-xs bg-amber-200 text-amber-950 border border-amber-400 px-3 py-1 rounded-xl font-bold font-mono">
              {TRI_STATE_NURSING_HOMES_DIRECTORY.length} Facilities Cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRI_STATE_NURSING_HOMES_DIRECTORY.filter(n => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return n.name.toLowerCase().includes(q) || n.address.toLowerCase().includes(q);
            }).map((nh) => (
              <div key={nh.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-amber-600 transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {nh.borough || nh.city}, {nh.state}
                    </span>
                    {nh.hasRefrigerationOnPremises ? (
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                        ❄️ Holding Morgue Box
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-900 bg-red-100 border border-red-300 px-2 py-0.5 rounded">
                        🚨 NO REFRIGERATION (URGENT)
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900 leading-tight">{nh.name}</h4>
                    <p className="text-xs text-neutral-500 pt-0.5">{nh.address}, {nh.city}, {nh.state} {nh.zip}</p>
                  </div>

                  <div className={`p-2.5 rounded-xl border space-y-1 text-xs ${
                    nh.hasRefrigerationOnPremises ? 'bg-blue-50/60 border-blue-100 text-blue-950' : 'bg-red-50/60 border-red-100 text-red-950'
                  }`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>Nursing Station:</span>
                      <strong className="font-mono">{nh.nursingStationPhone || nh.mainPhone}</strong>
                    </div>
                    <p className="text-[11px] font-medium">{nh.refrigerationDetails}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-600 space-y-1">
                  <p><strong>Protocol:</strong> {nh.releaseProtocol}</p>
                  <p><strong>Access:</strong> {nh.securityOrDockInstructions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3F. SUB-VIEW: FLORAL PARTNERS & CATALOGS                  */}
      {/* ========================================================= */}
      {activeSubTab === 'florists' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Flower className="w-5 h-5 text-[#991b1b]" />
                Official Floral Partners & Catalogs
              </h3>
              <p className="text-xs text-neutral-600 font-light">
                <strong>Barbara's Flowers</strong> (Harlem: 2522 Frederick Douglass Blvd • 212-234-3211) & <strong>Daniela's Flower Shop</strong> (Broadway: 3650 Broadway • 212-283-9300).
              </p>
            </div>
            <span className="text-xs bg-red-50 text-[#991b1b] border border-red-200 px-3 py-1 rounded-xl font-bold font-mono">
              {FLORAL_CATALOG_DATA.length} Arrangements Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FLORAL_CATALOG_DATA.filter(f => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return f.name.toLowerCase().includes(q) || f.floristName.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
            }).map((item) => (
              <div key={item.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-[#991b1b] transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#991b1b] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {item.floristName}
                    </span>
                    <span className="text-sm font-bold text-[#991b1b] font-mono">
                      ${item.price}.00
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900">{item.name}</h4>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{item.category.replace('_', ' ')} • {item.dimensions || 'Standard Tribute'}</p>
                  </div>

                  <p className="text-xs text-neutral-600 font-light">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-500">
                  <span>Lead Time: <strong>{item.leadTimeHours} Hours</strong></span>
                  <a href={`tel:${item.floristPhone}`} className="text-[#991b1b] font-bold hover:underline font-mono">
                    {item.floristPhone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3G. SUB-VIEW: CASKET MANUFACTURERS & CATALOGS             */}
      {/* ========================================================= */}
      {activeSubTab === 'caskets' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#991b1b]" />
                Official Casket & Merchandise Catalogs
              </h3>
              <p className="text-xs text-neutral-600 font-light">
                Complete retail schedules and merchandise inventory for <strong>Batesville Casket Company</strong> (606 items) and <strong>Milso Industry</strong> (332 items).
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPartnerCasketFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    partnerCasketFilter === 'all'
                      ? 'bg-white text-neutral-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  All ({ALL_UNIFIED_MERCHANDISE.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPartnerCasketFilter('batesville')}
                  className={`px-3 py-1 rounded-lg transition ${
                    partnerCasketFilter === 'batesville'
                      ? 'bg-[#991b1b] text-white shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Batesville ({BATESVILLE_CASKETS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPartnerCasketFilter('milso')}
                  className={`px-3 py-1 rounded-lg transition ${
                    partnerCasketFilter === 'milso'
                      ? 'bg-[#15803d] text-white shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Milso ({MILSO_CASKETS.length})
                </button>
              </div>
            </div>
          </div>

          {/* Search and Material Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search catalog by Item #, model name, material, exterior finish, interior lining..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs placeholder:text-neutral-400 focus:bg-white focus:ring-1 focus:ring-[#991b1b]"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={partnerCasketCategory}
                onChange={(e) => setPartnerCasketCategory(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800"
              >
                <option value="all">All Material Categories</option>
                <option value="bronze">Bronze & Copper</option>
                <option value="stainless">Stainless Steel</option>
                <option value="steel">16, 18 & 20 Gauge Steel</option>
                <option value="wood">Hardwoods (Cherry, Oak, Maple, Poplar, Pine, Pecan, Mahogany)</option>
                <option value="cloth">Cloth & Alternative</option>
                <option value="urn">Urns & Keepsakes</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {(() => {
            let filtered = searchMerchandise(searchQuery, partnerCasketFilter, 'all');
            if (partnerCasketCategory !== 'all') {
              filtered = filtered.filter(item => {
                const c = (item.category + ' ' + item.material).toLowerCase();
                if (partnerCasketCategory === 'bronze') return c.includes('bronze') || c.includes('copper');
                if (partnerCasketCategory === 'stainless') return c.includes('stainless') || c.includes('onyx') || c.includes('sapphire');
                if (partnerCasketCategory === 'steel') return c.includes('gauge') || c.includes('steel') || c.includes('gemini') || c.includes('apollo') || c.includes('aries') || c.includes('spectra') || c.includes('hercules') || c.includes('pisces');
                if (partnerCasketCategory === 'wood') return c.includes('cherry') || c.includes('oak') || c.includes('maple') || c.includes('poplar') || c.includes('pine') || c.includes('pecan') || c.includes('mahogany') || c.includes('wood') || c.includes('hardwood') || c.includes('veneer');
                if (partnerCasketCategory === 'cloth') return c.includes('cloth') || c.includes('doeskin') || c.includes('cardboard') || c.includes('alternative') || c.includes('unfinished');
                if (partnerCasketCategory === 'urn') return item.productType === 'urn_keepsake' || c.includes('urn') || c.includes('keepsake');
                return true;
              });
            }

            const displayList = filtered.slice(0, 48);

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                  <span>Showing <strong>{displayList.length}</strong> of <strong>{filtered.length}</strong> catalog items</span>
                  <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded-md">Batesville: Item #, Desc, Proposed Display Price | Milso: Item Name, Current Price</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayList.map((item) => (
                    <div key={item.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-[#991b1b] transition flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            item.supplier === 'Batesville Casket Company'
                              ? 'bg-red-50 text-[#991b1b] border-red-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {item.supplier}
                          </span>
                          <span className="text-sm font-bold text-[#991b1b] font-mono">
                            ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            Item Code: #{item.modelCodeOrNumber}
                          </div>
                          <h4 className="font-serif-title font-bold text-sm text-neutral-900 line-clamp-1">
                            {item.supplier === 'Milso Industry' 
                              ? item.nameOrDescription 
                              : `[#${item.modelCodeOrNumber}] ${item.nameOrDescription}`}
                          </h4>
                          <p className="text-xs text-neutral-600 font-medium">{item.material}</p>
                        </div>

                        <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-[11px] text-neutral-700">
                          <div><strong>Category:</strong> {item.category}</div>
                          <div><strong>Interior:</strong> {item.interior}</div>
                          {item.availability && (
                            <div><strong>Availability:</strong> <span className="font-semibold">{item.availability}</span></div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500 font-medium">
                          {item.supplier === 'Milso Industry' ? 'Milso Wholesale Tier' : 'Batesville Master Worksheet'}
                        </span>
                        <span className="font-mono font-bold text-[#991b1b]">
                          ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3H. SUB-VIEW: TRI-STATE CEMETERIES & CREMATORIES          */}
      {/* ========================================================= */}
      {activeSubTab === 'cemeteries' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#991b1b]" />
                Tri-State Cemeteries & Crematories Directory (NY, NJ, CT)
              </h3>
              <p className="text-xs text-neutral-600 font-light">
                Complete address, dispatch telephone numbers, crematory permits, and arrival cutoff times.
              </p>
            </div>
            <span className="text-xs bg-red-50 text-[#991b1b] border border-red-200 px-3 py-1 rounded-xl font-bold font-mono">
              {TRI_STATE_CEMETERIES_DIRECTORY.length} Grounds Cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRI_STATE_CEMETERIES_DIRECTORY.filter(cem => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return cem.name.toLowerCase().includes(q) || cem.city.toLowerCase().includes(q) || cem.state.toLowerCase().includes(q) || cem.county.toLowerCase().includes(q);
            }).map((cem) => (
              <div key={cem.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-[#991b1b] transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {cem.county} ({cem.state})
                    </span>
                    <div className="flex gap-1">
                      {cem.hasCrematory && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          🔥 Crematory
                        </span>
                      )}
                      {cem.hasMausoleum && (
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          🏛️ Crypts
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900 leading-tight">{cem.name}</h4>
                    <p className="text-xs text-neutral-500 pt-0.5">{cem.address}, {cem.city}, {cem.state} {cem.zip}</p>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Main Office:</span>
                      <strong className="font-mono text-neutral-900">{cem.phone}</strong>
                    </div>
                    {cem.crematoryPhone && (
                      <div className="flex justify-between text-amber-900">
                        <span>Crematory Desk:</span>
                        <strong className="font-mono">{cem.crematoryPhone}</strong>
                      </div>
                    )}
                    <p className="text-[10px] text-neutral-500 pt-0.5">Cutoff: {cem.committalServiceCutoff}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-600">
                  <p className="italic">"{cem.notes}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeSubTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Dispatch Configuration Form */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
              <Send className="w-5 h-5 text-[#991b1b]" />
              <h3 className="font-serif-title font-bold text-base text-neutral-900">
                Compose Service Partner SMS Booking Request
              </h3>
            </div>

            <form onSubmit={handleCreateDispatchRequest} className="space-y-4 text-xs">
              
              {/* Select Case */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Target Case (Decedent & Family) *</label>
                <select
                  value={dispatchCaseId}
                  onChange={(e) => setDispatchCaseId(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} • {c.decedent.legalName} ({c.informant.fullName} - NOK)
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary & Standby Partner Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Select Primary Service Partner *</label>
                  <select
                    value={dispatchPartnerId}
                    onChange={(e) => setDispatchPartnerId(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} — {p.roleTitle} ({p.phone}) [{p.rateInfo || 'Standard'}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold mb-1">
                    Pre-Assigned Standby Backup Partner *
                  </label>
                  <select
                    value={dispatchStandbyPartnerId}
                    onChange={(e) => setDispatchStandbyPartnerId(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        🛡️ {p.fullName} — {p.roleTitle} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SLA Response Deadline Setting */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <label className="block text-amber-950 font-bold text-xs">
                  SLA Response Deadline & Auto-Escalation Window *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { hours: 2, label: '⚡ 2h (Ceremony < 48h)' },
                    { hours: 4, label: '⏱ 4h (Standard)' },
                    { hours: 8, label: '📅 8h (Same Day)' },
                    { hours: 24, label: '🗓 24h (Advance)' }
                  ].map(sla => (
                    <button
                      key={sla.hours}
                      type="button"
                      onClick={() => setDispatchSlaHours(sla.hours)}
                      className={`p-2 rounded-lg text-xs font-bold transition border text-center ${
                        dispatchSlaHours === sla.hours
                          ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {sla.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-amber-900 font-light">
                  If vendor does not reply "YES" within {dispatchSlaHours} hours, an alert strobes on the Director's dashboard and 1-tap Standby Cascade is activated.
                </p>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Service Date *</label>
                  <input
                    type="date"
                    required
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2 font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Report / Call Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30 AM"
                    value={dispatchCallTime}
                    onChange={(e) => setDispatchCallTime(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Est. End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 12:30 PM"
                    value={dispatchEndTime}
                    onChange={(e) => setDispatchEndTime(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>

              {/* Location Venue & Compensation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Reporting Location / Venue *</label>
                  <input
                    type="text"
                    required
                    value={dispatchVenue}
                    onChange={(e) => setDispatchVenue(e.target.value)}
                    placeholder="e.g. 630 St. Nicholas Ave - Prep Suite"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-neutral-900 outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Honorarium / Agreed Fee</label>
                  <input
                    type="text"
                    value={dispatchFee}
                    onChange={(e) => setDispatchFee(e.target.value)}
                    placeholder="e.g. $250.00 Honorarium"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-neutral-900 outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Special Attire / Preparation Instructions</label>
                <textarea
                  rows={3}
                  value={dispatchInstructions}
                  onChange={(e) => setDispatchInstructions(e.target.value)}
                  placeholder="e.g. Bring styling kit. Family reference photo uploaded to digital portal. White gloves required."
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-neutral-900 outline-none focus:border-[#991b1b]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition shadow-md border border-amber-300/40 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Send SMS Request with Auto-Reminder Cycle</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live SMS Smartphone Preview */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif-title font-bold text-base text-neutral-900">
                  Live SMS Carrier Preview
                </h3>
              </div>

              {/* Simulated Phone Shell */}
              <div className="mt-4 bg-neutral-900 p-4 rounded-3xl border-4 border-neutral-800 shadow-xl max-w-sm mx-auto text-white">
                <div className="flex justify-between items-center text-[10px] text-neutral-400 pb-2 border-b border-neutral-800 font-mono">
                  <span>BFH Dispatch</span>
                  <span>To: {currentSelectedPartner?.phone}</span>
                </div>

                <div className="py-4 space-y-3">
                  {/* SMS Bubble */}
                  <div className="bg-neutral-800 p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed text-neutral-200 border border-neutral-700 shadow-xs space-y-2">
                    <p className="font-semibold text-white">
                      {generatedSmsText}
                    </p>
                    <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1 pt-1 border-t border-neutral-700">
                      <span>• Auto-Reminder: Scheduled every 4h until YES received</span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-neutral-500">
                    Carrier: Twilio SMS • Status: Ready to Dispatch
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs">
              <strong>Notice:</strong> Once dispatched, the system will send an immediate SMS. If no confirmation reply is received, automated reminders will fire at scheduled intervals until the vendor confirms.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUB-VIEW 3: RECURRING REMINDERS & CONFIRMATION TRACKER */}
      {/* ========================================================= */}
      {activeSubTab === 'reminders' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
            <div>
              <h3 className="font-serif-title font-bold text-base text-neutral-900">
                Service Partner SMS Dispatch & Reminder Queue
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                Live monitoring of vendor booking requests, reminder cadences, and carrier confirmations.
              </p>
            </div>

            <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full">
              {requests.length} Total Dispatches
            </span>
          </div>

          {/* Request Rows */}
          <div className="divide-y divide-neutral-100">
            {requests.map((req) => {
              const statusMeta = getStatusMeta(req.status);
              const isConfirmed = req.status === 'confirmed';

              return (
                <div key={req.id} className="py-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Partner & Case Details */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif-title font-bold text-sm text-neutral-900">
                          {req.partnerName}
                        </span>
                        <span className="text-xs text-[#b45309] font-bold">({req.roleTitle})</span>
                        <span className="text-neutral-400 font-mono text-[11px]">[{req.partnerPhone}]</span>
                      </div>

                      <div className="text-xs text-neutral-700 flex flex-wrap items-center gap-2">
                        <span>Case: <strong className="text-neutral-900">{req.decedentName}</strong> ({req.caseNumber})</span>
                        <span>•</span>
                        <span>Date: <strong>{req.serviceDate}</strong> at <strong>{req.callTime}</strong></span>
                        <span>•</span>
                        <span>Venue: <strong>{req.venueLocation}</strong></span>
                      </div>

                      {req.specialInstructions && (
                        <p className="text-[11px] text-neutral-500 italic">
                          "{req.specialInstructions}"
                        </p>
                      )}
                    </div>

                    {/* Status Badge & Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusMeta.color}`}>
                        {isConfirmed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{statusMeta.label}</span>
                      </span>

                      {/* Launch Two-Way SMS Simulator */}
                      {onOpenTwoWaySmsModal && (
                        <button
                          onClick={() => onOpenTwoWaySmsModal(req.id)}
                          className="px-3 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 border border-amber-300/40"
                          title="Open Two-Way Carrier SMS Conversation Simulator"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                          <span>2-Way SMS Studio</span>
                        </button>
                      )}

                      {/* Reminder Trigger Simulation */}
                      {!isConfirmed && (
                        <>
                          <button
                            onClick={() => onSimulateReminder(req.id)}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-xs transition flex items-center gap-1"
                            title="Simulate sending the next scheduled recurring reminder SMS"
                          >
                            <RefreshCw className="w-3 h-3 text-[#991b1b]" />
                            <span>Send Reminder (#{req.remindersCount + 1})</span>
                          </button>

                          <button
                            onClick={() => onSimulateConfirm(req.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1"
                            title="Simulate partner replying YES via carrier SMS"
                          >
                            <CheckCircle2 className="w-3 h-3 text-amber-200" />
                            <span>Quick YES</span>
                          </button>
                        </>
                      )}

                      {isConfirmed && req.confirmedAt && (
                        <span className="text-[11px] text-neutral-500 font-mono">
                          Confirmed at {req.confirmedAt}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* SMS Message & Reminder History Log */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-xl font-medium">"{req.smsMessageDraft}"</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] text-neutral-500 font-mono shrink-0">
                      <span>Reminders Sent: <strong className="text-neutral-800">{req.remindersCount}</strong></span>
                      {req.lastReminderAt && <span>Last: {req.lastReminderAt}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: ADD NEW SERVICE PARTNER CONTACT                 */}
      {/* ========================================================= */}
      {isAddPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-neutral-900">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                  Add Service Partner Contact
                </h3>
              </div>
              <button
                onClick={() => setIsAddPartnerModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Legal / Professional Name *</label>
                <input
                  type="text"
                  required
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="e.g. Danielle St. Claire"
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={newPartnerCategory}
                    onChange={(e) => setNewPartnerCategory(e.target.value as PartnerCategory)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 font-bold outline-none focus:border-[#991b1b]"
                  >
                    <option value="hairdresser_barber">Hairdresser / Barber</option>
                    <option value="outside_director">Outside Trade Director</option>
                    <option value="pallbearer">Pallbearer Guild</option>
                    <option value="musician_organist">Organist / Musician</option>
                    <option value="minister_clergy">Minister / Clergy</option>
                    <option value="livery_transport">Livery / Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={newPartnerRole}
                    onChange={(e) => setNewPartnerRole(e.target.value)}
                    placeholder="e.g. Master Restorative Barber"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">SMS Phone Number (Numbers Only) *</label>
                  <input
                    type="tel"
                    required
                    value={newPartnerPhone}
                    onChange={(e) => setNewPartnerPhone(formatPhoneNumbersOnly(e.target.value))}
                    placeholder="(212) 555-0199"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 outline-none focus:border-[#991b1b] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Email (Optional - Valid Format)</label>
                  <input
                    type="email"
                    value={newPartnerEmail}
                    onChange={(e) => setNewPartnerEmail(e.target.value)}
                    placeholder="partner@harlem.org"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Organization / Affiliation</label>
                  <input
                    type="text"
                    value={newPartnerOrg}
                    onChange={(e) => setNewPartnerOrg(e.target.value)}
                    placeholder="e.g. Harlem Choral Trust"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Rate / Fee Info</label>
                  <input
                    type="text"
                    value={newPartnerRate}
                    onChange={(e) => setNewPartnerRate(e.target.value)}
                    placeholder="e.g. $250 / service"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Notes & Specialties</label>
                <textarea
                  rows={2}
                  value={newPartnerNotes}
                  onChange={(e) => setNewPartnerNotes(e.target.value)}
                  placeholder="e.g. Specialized in vintage hairstyles, cosmetic restoration, church liturgies."
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-sm border border-amber-300/40"
                >
                  Save Partner Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: CSV / CONTACTS IMPORT & UPLOAD                  */}
      {/* ========================================================= */}
      {isCSVModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-neutral-900">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                  Upload & Import Service Partner Contacts (CSV)
                </h3>
              </div>
              <button
                onClick={() => setIsCSVModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <p className="text-neutral-600">
                  Paste CSV text or copy/paste rows from Excel/Google Sheets. Format:
                </p>
                <button
                  onClick={loadSampleCSVTemplate}
                  className="text-[#991b1b] hover:underline font-bold text-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Load Sample Contacts Template</span>
                </button>
              </div>

              <div className="p-2.5 bg-neutral-100 rounded-lg font-mono text-[10px] text-neutral-600 overflow-x-auto">
                Full Name, Role Title, Category, Phone, Email, Organization, Rate, Notes
              </div>

              <textarea
                rows={8}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                placeholder="Paste CSV rows here..."
                className="w-full bg-[#fbfbfd] font-mono border border-neutral-300 rounded-xl p-3 text-xs outline-none focus:border-[#991b1b]"
              />

              {csvFeedback && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  csvFeedback.includes('Successfully')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-red-50 text-[#991b1b] border border-red-300'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{csvFeedback}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="text-[11px] text-neutral-500">
                  Supports Barbers, Hairdressers, Trade FDs, Pallbearers, Organists & Ministers
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCSVModalOpen(false)}
                    className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleParseCSV}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-sm border border-amber-300/40 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Import Contacts</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL: DIRECTOR VERBAL PHONE CALL LOG & CONFIRMATION   */}
      {/* ========================================================= */}
      {phoneLogRequestId && (() => {
        const reqToLog = requests.find(r => r.id === phoneLogRequestId);
        if (!reqToLog) return null;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-neutral-900 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-50 text-[#991b1b] rounded-xl border border-red-200">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-title font-bold text-base text-neutral-900">
                      Log Director Verbal Phone Call & Confirm
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      Case #{reqToLog.caseNumber} • {reqToLog.decedentName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPhoneLogRequestId(null)}
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Service Partner:</span>
                  <strong className="text-neutral-900">{reqToLog.partnerName} ({reqToLog.roleTitle})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Direct Phone:</span>
                  <a href={`tel:${reqToLog.partnerPhone}`} className="font-mono text-[#991b1b] font-bold hover:underline">
                    {reqToLog.partnerPhone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Service Schedule:</span>
                  <span className="font-semibold text-neutral-800">{reqToLog.serviceDate} at {reqToLog.callTime}</span>
                </div>
              </div>

              <form onSubmit={handleLogDirectorPhoneCall} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Licensed Director / Staff Caller Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneLogCallerName}
                    onChange={(e) => setPhoneLogCallerName(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Verbal Conversation Notes & Confirmation Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={phoneLogNotes}
                    onChange={(e) => setPhoneLogNotes(e.target.value)}
                    placeholder="Enter details of verbal conversation, confirmed arrival time, and special instructions agreed upon..."
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b] leading-relaxed"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Submitting will immediately mark this service request as <strong>CONFIRMED</strong>, clear SLA overdue alerts, and log an official entry into the Golden Record ledger.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setPhoneLogRequestId(null)}
                    className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm border border-amber-300/40 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Confirm & Log to Case Ledger</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
