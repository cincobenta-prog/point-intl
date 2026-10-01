import React, { useState, useRef } from 'react';
import {
  GoldenRecordCase,
  RemovalScheduleInfo,
  RemovalAffidavit,
  RemovalLocationType,
  RemovalUrgency,
  RemovalVehicleType,
  PersonalEffectsItem,
  SimulatedNotification
} from '../../lib/types/funeral';
import { 
  TRI_STATE_HOSPITALS_DIRECTORY, 
  TRI_STATE_NURSING_HOMES_DIRECTORY
} from '../../lib/data/partnerCatalogs';
import {
  Truck,
  ShieldCheck,
  MapPin,
  User,
  CheckCircle2,
  Send,
  Printer,
  FileText,
  Sparkles,
  X,
  Plus,
  Trash2,
  Building2,
  Home,
  Heart,
  Check,
  Radio,
  Share2,
  Calendar
} from 'lucide-react';

interface RemovalSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: GoldenRecordCase;
  cases: GoldenRecordCase[];
  onSaveRemoval: (caseId: string, updatedRemoval: RemovalScheduleInfo) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenAppointmentModal?: (c: GoldenRecordCase) => void;
  onOpenContractModal?: (c: GoldenRecordCase) => void;
}

export const RemovalSchedulingModal: React.FC<RemovalSchedulingModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  cases,
  onSaveRemoval,
  onSendNotification,
  onOpenAppointmentModal,
  onOpenContractModal: _onOpenContractModal
}) => {
  if (!isOpen) return null;

  // Selected case state (allows picking any case or active case)
  const [selectedCaseId, setSelectedCaseId] = useState<string>(activeCase.id);
  const currentCase = cases.find(c => c.id === selectedCaseId) || activeCase;
  const currentRemoval = currentCase.removalSchedule;

  // Active Tab: 'schedule' | 'sms' | 'affidavit'
  const [activeTab, setActiveTab] = useState<'schedule' | 'sms' | 'affidavit'>('schedule');

  // Form State: Transfer Options
  const [locationType, setLocationType] = useState<RemovalLocationType>(currentRemoval?.locationType || 'hospital_morgue');
  const [facilityName, setFacilityName] = useState<string>(currentRemoval?.facilityName || currentCase.decedent.facilityName || currentCase.decedent.placeOfDeath);
  const [facilityAddress, setFacilityAddress] = useState<string>(currentRemoval?.facilityAddress || '411 W 114th St, New York, NY 10025');
  const [facilityFloorRoom, setFacilityFloorRoom] = useState<string>(currentRemoval?.facilityFloorRoom || 'Pathology Morgue Level B1 / Bay 2');
  const [facilityContactPhone, setFacilityContactPhone] = useState<string>(currentRemoval?.facilityContactPhone || currentCase.medicalCertifier.phone || '(212) 523-4000');
  const [morgueAttendantOrNurse, setMorgueAttendantOrNurse] = useState<string>(currentRemoval?.morgueAttendantOrNurse || 'Officer in Charge / Morgue Desk');
  
  const [urgency, setUrgency] = useState<RemovalUrgency>(currentRemoval?.urgency || 'stat_immediate');
  const [targetCallTime, setTargetCallTime] = useState<string>(currentRemoval?.targetCallTime || 'Immediate (Within 45 Mins)');
  const [estimatedArrivalMinutes, setEstimatedArrivalMinutes] = useState<number>(currentRemoval?.estimatedArrivalMinutes || 30);
  
  // Assigned Director & Crew
  const [assignedDirector, setAssignedDirector] = useState<string>(currentRemoval?.assignedDirector || currentCase.assignedDirector || 'Jason Benta, LFD');
  const [directorLicenseNumber, setDirectorLicenseNumber] = useState<string>(currentRemoval?.directorLicenseNumber || 'NYS LFD #08850');
  const [directorPhone, setDirectorPhone] = useState<string>(currentRemoval?.directorPhone || '(212) 281-8850');
  const [secondaryCrewMember, setSecondaryCrewMember] = useState<string>(currentRemoval?.secondaryCrewMember || 'Marcus Vance (Transport Specialist)');
  const [vehicleType, setVehicleType] = useState<RemovalVehicleType>(currentRemoval?.vehicleType || 'First Call Custom Van (BFH-1)');
  const [vehiclePlate, setVehiclePlate] = useState<string>(currentRemoval?.vehiclePlate || 'BFH-CUSTODY-1');

  // Equipment Multi-Select
  const [specialEquipment, setSpecialEquipment] = useState<string[]>(
    currentRemoval?.specialEquipment || [
      'Standard Mortuary Cot & Transfer Pouch',
      'Tamper-Evident Personal Effects Security Bag',
      'Hospital Morgue Release Tag Scanner'
    ]
  );
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    currentRemoval?.specialInstructions || 'Ambulance service bay entrance on 114th St. Security buzzer #4110. Release authorized by Informant under NYS PHL § 4201.'
  );

  // Status & Progress Tracking
  const [removalStatus, setRemovalStatus] = useState<RemovalScheduleInfo['status']>(currentRemoval?.status || 'dispatched_en_route');

  // Personal Effects for Affidavit
  const [personalEffects, setPersonalEffects] = useState<PersonalEffectsItem[]>(
    currentRemoval?.affidavit?.personalEffects || [
      { id: 'pe-1', category: 'Jewelry / Rings', description: 'Gold signet ring (Left hand)', releasedBy: morgueAttendantOrNurse, custodyReceived: true },
      { id: 'pe-2', category: 'Watch / Electronics', description: 'Wristwatch with leather strap', releasedBy: morgueAttendantOrNurse, custodyReceived: true },
      { id: 'pe-3', category: 'Documents / ID', description: 'Personal ID & Medicare card', releasedBy: morgueAttendantOrNurse, custodyReceived: true },
      { id: 'pe-4', category: 'Clothing / Shoes', description: 'Personal garments in hospital security bag', releasedBy: morgueAttendantOrNurse, custodyReceived: true }
    ]
  );

  // Signatures
  const [directorSigned, setDirectorSigned] = useState<boolean>(!!currentRemoval?.affidavit?.directorSignedAt);
  const [directorSignatureTime, setDirectorSignatureTime] = useState<string>(currentRemoval?.affidavit?.directorSignedAt || '2026-09-18 01:45 PM');
  const [facilitySigned, setFacilitySigned] = useState<boolean>(!!currentRemoval?.affidavit?.facilitySignedAt);

  // Toast / feedback alert
  const [toastAlert, setToastAlert] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 4000);
  };

  const toggleEquipment = (item: string) => {
    setSpecialEquipment(prev => 
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const handleAddPersonalEffect = () => {
    const newId = `pe-${Date.now()}`;
    setPersonalEffects(prev => [
      ...prev,
      {
        id: newId,
        category: 'Other',
        description: 'Personal item / valuables description',
        releasedBy: morgueAttendantOrNurse,
        custodyReceived: true
      }
    ]);
  };

  const handleRemovePersonalEffect = (id: string) => {
    setPersonalEffects(prev => prev.filter(pe => pe.id !== id));
  };

  const handleUpdatePersonalEffect = (id: string, field: keyof PersonalEffectsItem, value: any) => {
    setPersonalEffects(prev => prev.map(pe => pe.id === id ? { ...pe, [field]: value } : pe));
  };

  // Compile full removal schedule & affidavit object
  const buildCurrentRemovalSchedule = (): RemovalScheduleInfo => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateToday = new Date().toISOString().split('T')[0];

    const affidavitObj: RemovalAffidavit = {
      id: currentRemoval?.affidavit?.id || `aff-${Date.now()}`,
      caseId: currentCase.id,
      caseNumber: currentCase.caseNumber,
      affidavitNumber: currentRemoval?.affidavit?.affidavitNumber || `AFF-REM-${currentCase.caseNumber.replace('BFH-', '')}`,
      decedentName: currentCase.decedent.legalName,
      dateOfPassing: currentCase.decedent.dateOfDeath || dateToday,
      timeOfPassing: currentRemoval?.affidavit?.timeOfPassing || '10:30 AM',
      placeOfPassing: facilityName,
      facilityMrnOrTag: currentRemoval?.affidavit?.facilityMrnOrTag || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      assignedDirectorName: assignedDirector,
      directorLicenseNumber: directorLicenseNumber,
      directorPhone: directorPhone,
      crewMembers: [assignedDirector, secondaryCrewMember],
      vehicleId: vehicleType.includes('BFH-1') ? 'BFH-1' : 'BFH-2',
      vehiclePlate: vehiclePlate,
      informantName: currentCase.informant.fullName,
      informantRelation: currentCase.informant.relationship,
      informantPhone: currentCase.informant.phone,
      informantAddress: currentCase.informant.address,
      authorizationType: 'Digital Portal eSign',
      authorizationTimestamp: currentRemoval?.affidavit?.authorizationTimestamp || `${dateToday} 09:15 AM`,
      facilityName: facilityName,
      facilityAddress: facilityAddress,
      facilityFloorRoom: facilityFloorRoom,
      releasingAttendantName: morgueAttendantOrNurse,
      releasingAttendantTitle: 'Pathology & Morgue Custodial Attendant',
      custodyReleaseTimestamp: currentRemoval?.affidavit?.custodyReleaseTimestamp || `${dateToday} ${timeNow}`,
      bodyTagConfirmed: true,
      tagNumber: currentRemoval?.affidavit?.tagNumber || `NYC-TAG-${Math.floor(10000 + Math.random() * 90000)}`,
      weightCategory: 'Standard (< 250 lbs)',
      equipmentUsed: specialEquipment,
      personalEffects: personalEffects,
      personalEffectsTotalCount: personalEffects.length,
      safeArrivalTimestamp: removalStatus === 'safe_arrival_completed' ? `${dateToday} ${timeNow}` : undefined,
      intakeAttendantName: `${assignedDirector} (${directorLicenseNumber})`,
      status: removalStatus === 'safe_arrival_completed' ? 'signed_verified' : 'custody_acquired',
      directorSignedAt: directorSigned ? directorSignatureTime : `${dateToday} ${timeNow}`,
      facilitySignedAt: facilitySigned ? `${dateToday} ${timeNow}` : `${dateToday} ${timeNow}`
    };

    return {
      id: currentRemoval?.id || `rem-${Date.now()}`,
      caseId: currentCase.id,
      status: removalStatus,
      locationType: locationType,
      facilityName: facilityName,
      facilityAddress: facilityAddress,
      facilityFloorRoom: facilityFloorRoom,
      facilityContactPhone: facilityContactPhone,
      morgueAttendantOrNurse: morgueAttendantOrNurse,
      urgency: urgency,
      targetCallTime: targetCallTime,
      estimatedArrivalMinutes: estimatedArrivalMinutes,
      assignedDirector: assignedDirector,
      directorLicenseNumber: directorLicenseNumber,
      directorPhone: directorPhone,
      secondaryCrewMember: secondaryCrewMember,
      vehicleType: vehicleType,
      vehiclePlate: vehiclePlate,
      specialEquipment: specialEquipment,
      specialInstructions: specialInstructions,
      directorSmsDispatched: true,
      directorSmsSentAt: currentRemoval?.directorSmsSentAt || `Today ${timeNow}`,
      directorConfirmedAt: currentRemoval?.directorConfirmedAt || `Today ${timeNow}`,
      facilitySmsDispatched: true,
      facilitySmsSentAt: currentRemoval?.facilitySmsSentAt || `Today ${timeNow}`,
      familySmsDispatched: true,
      familySmsSentAt: currentRemoval?.familySmsSentAt || `Today ${timeNow}`,
      affidavit: affidavitObj
    };
  };

  // Save changes
  const handleSaveAndDispatch = () => {
    const updated = buildCurrentRemovalSchedule();
    onSaveRemoval(currentCase.id, updated);
    showToast(`✅ Removal schedule & verified custody affidavit saved for ${currentCase.decedent.legalName}.`);
  };

  // Dispatch 3-Way SMS
  const handleDispatchAllSms = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = buildCurrentRemovalSchedule();
    onSaveRemoval(currentCase.id, updated);

    if (onSendNotification) {
      // 1. Director SMS
      onSendNotification({
        id: `notif-dir-${Date.now()}`,
        caseId: currentCase.id,
        decedentName: currentCase.decedent.legalName,
        recipientName: assignedDirector,
        recipientPhone: directorPhone,
        channel: 'sms',
        type: 'service_schedule',
        title: `FIRST CALL REMOVAL DISPATCH: ${currentCase.decedent.legalName}`,
        bodyText: `BFH DISPATCH: ${assignedDirector}, you are scheduled for immediate transfer of ${currentCase.decedent.legalName} at ${facilityName} (${facilityFloorRoom}). Release authorized by NOK ${currentCase.informant.fullName}. Vehicle: ${vehicleType} [${vehiclePlate}]. Completed Affidavit linked: https://e-bfh.com/affidavit/${currentCase.caseNumber}`,
        sentAt: `Today ${timeNow}`,
        status: 'delivered'
      });

      // 2. Family SMS
      onSendNotification({
        id: `notif-fam-${Date.now()}`,
        caseId: currentCase.id,
        decedentName: currentCase.decedent.legalName,
        recipientName: currentCase.informant.fullName,
        recipientPhone: currentCase.informant.phone,
        channel: 'sms',
        type: 'safe_arrival',
        title: `Benta's Transfer Team Dispatched for ${currentCase.decedent.legalName}`,
        bodyText: `Dear ${currentCase.informant.fullName}, our licensed custodial transfer team led by ${assignedDirector} has been dispatched to ${facilityName}. We will notify you immediately once your loved one safely arrives at 630 Saint Nicholas Ave.`,
        sentAt: `Today ${timeNow}`,
        status: 'delivered'
      });
    }

    showToast(`📱 3-Way Removal SMS dispatched to ${assignedDirector}, ${facilityName} Morgue Desk, and Informant (${currentCase.informant.fullName}).`);
  };

  // Simulation Steps
  const handleSimulateStatus = (nextStatus: RemovalScheduleInfo['status'], statusLabel: string) => {
    setRemovalStatus(nextStatus);
    const updated = {
      ...buildCurrentRemovalSchedule(),
      status: nextStatus
    };
    onSaveRemoval(currentCase.id, updated);
    showToast(`🚐 Status updated: "${statusLabel}". Logged to Golden Record chain-of-custody.`);
  };

  // Print Affidavit
  const handlePrintAffidavit = () => {
    window.print();
  };

  // Send completed affidavit directly to Director SMS/Email
  const handleSendAffidavitToDirector = () => {
    showToast(`✉️ Completed Removal Affidavit & Custody Ledger PDF dispatched to ${assignedDirector} via SMS (${directorPhone}) and Director Email.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Toast Alert */}
      {toastAlert && (
        <div className="fixed top-6 right-6 z-60 bg-[#141b2b] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <p className="text-xs font-medium">{toastAlert}</p>
        </div>
      )}

      <div className="bg-white text-neutral-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-neutral-300 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#141b2b] via-[#1a233a] to-[#2b0f0f] text-white p-5 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#991b1b] text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                First Call Transfer & Custody Engine
              </span>
              <span className="text-xs text-neutral-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                NYC Dept of Hospitals & NYS § 4201 Compliance
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-white flex items-center gap-2">
              Removal Scheduling, 3-Way SMS & Custody Affidavit
            </h2>
          </div>

          {/* Case Selector Dropdown & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-neutral-400 text-[10px] mr-1.5 font-bold">CASE:</span>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#141b2b] text-white">
                    {c.caseNumber} • {c.decedent.legalName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BI-DIRECTIONAL INFORMATION BRIDGE BANNER */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#991b1b] text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-amber-400/20 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30 uppercase tracking-wider">
              Bi-Directional Case Bridge
            </span>
            <span className="text-neutral-300 text-[11px]">
              Removal ➔ Family Arrangement Flow • Safe Arrival: <strong className="text-white">{currentCase.safeArrivalStatus === 'safe_arrival_confirmed' ? '✓ Confirmed (630 St. Nicholas)' : currentCase.safeArrivalStatus === 'in_transit' ? '🚐 En Route' : '🚨 Pending Removal'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {currentCase.arrangementAppointment?.status === 'confirmed' ? (
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Arrangement Booked: {currentCase.arrangementAppointment.confirmedSlot?.date} ({currentCase.arrangementAppointment.confirmedSlot?.time})</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                <span>Arrangement Conference Pending</span>
              </span>
            )}

            {onOpenAppointmentModal && (
              <button
                type="button"
                onClick={() => {
                  const updated = buildCurrentRemovalSchedule();
                  onSaveRemoval(currentCase.id, updated);
                  onClose();
                  onOpenAppointmentModal(currentCase);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5 transition border border-amber-300/40"
                title="Transfer all decedent, informant, and safe arrival information to the Arrangement Conference Studio"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-200" />
                <span>➔ Transfer to Arrangement Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-6 pt-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'border-[#991b1b] text-[#991b1b]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            1. Schedule & Transfer Options
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sms'
                ? 'border-[#991b1b] text-[#991b1b]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Send className="w-4 h-4" />
            2. 3-Way SMS Confirmations
          </button>

          <button
            onClick={() => setActiveTab('affidavit')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'affidavit'
                ? 'border-[#991b1b] text-[#991b1b]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            3. Completed Removal Affidavit
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-1.5 py-0.2 rounded border border-emerald-300">
              NYS Jurat
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#fbfbfa]">
          
          {/* TAB 1: SCHEDULE & TRANSFER OPTIONS */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Decedent Quick Ribbon */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Decedent Subject to Transfer</div>
                  <div className="text-base font-bold text-neutral-900 font-serif-title flex items-center gap-2">
                    {currentCase.decedent.legalName}
                    <span className="font-mono text-xs text-[#991b1b] bg-red-50 px-2 py-0.5 rounded border border-red-200 font-sans">
                      {currentCase.caseNumber}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600">
                    Passed: {currentCase.decedent.dateOfDeath} • Informant: <strong>{currentCase.informant.fullName}</strong> ({currentCase.informant.relationship}, {currentCase.informant.phone})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500">Current Status:</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    removalStatus === 'safe_arrival_completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : removalStatus === 'custody_acquired_in_transit'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    {removalStatus === 'safe_arrival_completed' ? 'Safe Arrival at 630 St Nicholas' : removalStatus === 'custody_acquired_in_transit' ? 'In-Transit to BFH' : 'Pending Removal Dispatch'}
                  </span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Pickup Location & Urgency */}
                <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <MapPin className="w-4 h-4 text-[#991b1b]" />
                    Pickup Location & Urgency Options
                  </h3>

                  {/* Location Type Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">Facility / Location Type:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'hospital_morgue', label: 'Hospital Morgue', icon: Building2 },
                        { id: 'residence', label: 'Private Residence', icon: Home },
                        { id: 'hospice_facility', label: 'Hospice Center', icon: Heart },
                        { id: 'nursing_home', label: 'Nursing Home', icon: Building2 },
                        { id: 'medical_examiner_ocme', label: 'NYC OCME (Morgue)', icon: ShieldCheck },
                        { id: 'airport_cargo', label: 'Airport Cargo (JFK/LGA)', icon: Truck }
                      ].map((loc) => {
                        const Icon = loc.icon;
                        const isSelected = locationType === loc.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => setLocationType(loc.id as RemovalLocationType)}
                            className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition flex flex-col gap-1.5 ${
                              isSelected
                                ? 'bg-red-50 border-[#991b1b] text-[#991b1b] shadow-xs'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px] leading-tight">{loc.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Select from Tri-State Directory */}
                  <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#991b1b] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Quick Select Tri-State Hospital or Nursing Home:
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">NY • NJ • CT</span>
                    </div>

                    <select
                      onChange={(e) => {
                        const facId = e.target.value;
                        if (!facId) return;
                        const hosp = TRI_STATE_HOSPITALS_DIRECTORY.find(h => h.id === facId);
                        const nh = TRI_STATE_NURSING_HOMES_DIRECTORY.find(n => n.id === facId);
                        const fac = hosp || nh;
                        if (fac) {
                          setFacilityName(fac.name);
                          setFacilityAddress(`${fac.address}, ${fac.city}, ${fac.state} ${fac.zip}`);
                          setFacilityContactPhone(fac.morgueOrPathologyPhone || fac.nursingStationPhone || fac.mainPhone);
                          setFacilityFloorRoom(fac.type === 'hospital' ? 'Pathology Morgue / Cold Vault' : 'Nursing Station Bedside Hold');
                          setMorgueAttendantOrNurse(fac.type === 'hospital' ? 'Pathology Officer on Duty' : 'Nurse Supervisor on Duty');
                          setSpecialInstructions(fac.securityOrDockInstructions);
                          if (fac.isUrgentRemovalRequired) {
                            setUrgency('stat_immediate');
                            setTargetCallTime('Immediate (Within 45 Mins - No Refrigeration)');
                            setEstimatedArrivalMinutes(30);
                          } else {
                            setUrgency('standard_2h');
                            setTargetCallTime('Standard Window (Refrigerated Morgue)');
                            setEstimatedArrivalMinutes(60);
                          }
                        }
                      }}
                      className="w-full text-xs p-2 bg-white border border-red-300 rounded-lg font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-[#991b1b]"
                    >
                      <option value="">-- Choose Verified Tri-State Medical Facility --</option>
                      <optgroup label="🏥 Tri-State Hospitals (Morgues with Refrigeration)">
                        {TRI_STATE_HOSPITALS_DIRECTORY.map(h => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.borough || h.city}, {h.state}) ❄️
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🏥 Tri-State Nursing Homes (Urgent Removal Protocol)">
                        {TRI_STATE_NURSING_HOMES_DIRECTORY.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.borough || n.city}, {n.state}) {n.hasRefrigerationOnPremises ? '❄️' : '🚨 URGENT'}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    {/* Refrigeration Status Notification */}
                    {(() => {
                      const hosp = TRI_STATE_HOSPITALS_DIRECTORY.find(h => facilityName.includes(h.name.split(' ')[0]) || h.name.includes(facilityName.split(' ')[0]));
                      const nh = TRI_STATE_NURSING_HOMES_DIRECTORY.find(n => facilityName.includes(n.name.split(' ')[0]) || n.name.includes(facilityName.split(' ')[0]));
                      const fac = hosp || nh;

                      if (fac) {
                        if (fac.hasRefrigerationOnPremises) {
                          return (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-0.5">
                              <div className="font-bold flex items-center gap-1">
                                <span>❄️ Refrigeration on Premises Available</span>
                                <span className="bg-blue-200 text-blue-800 text-[9px] px-1.5 py-0.2 rounded font-mono">Hospital Morgue</span>
                              </div>
                              <p className="text-blue-700">{fac.refrigerationDetails}</p>
                              <p className="text-[10px] text-blue-600 font-mono">Release Hours: {fac.releaseHours}</p>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-2 bg-red-100 border border-red-300 rounded-lg text-[11px] text-[#991b1b] space-y-0.5">
                              <div className="font-bold flex items-center gap-1">
                                <span>🚨 NO REFRIGERATION ON PREMISES</span>
                                <span className="bg-red-200 text-red-900 text-[9px] px-1.5 py-0.2 rounded font-mono">URGENT 2-4 HR PROTOCOL</span>
                              </div>
                              <p className="text-red-800">Skilled Nursing Facility bedside hold. Prompt removal required under NYS DOH regulations.</p>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>

                  {/* Facility Name & Address */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Facility / Pickup Address Name:</label>
                      <input
                        type="text"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                        placeholder="e.g. Mount Sinai Morningside Hospital"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Street Address & Borough:</label>
                      <input
                        type="text"
                        value={facilityAddress}
                        onChange={(e) => setFacilityAddress(e.target.value)}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                        placeholder="e.g. 411 W 114th St, New York, NY 10025"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Floor / Room / Morgue Bay:</label>
                        <input
                          type="text"
                          value={facilityFloorRoom}
                          onChange={(e) => setFacilityFloorRoom(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Morgue / Nurse Phone:</label>
                        <input
                          type="text"
                          value={facilityContactPhone}
                          onChange={(e) => setFacilityContactPhone(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Pathology Officer / Release Contact:</label>
                      <input
                        type="text"
                        value={morgueAttendantOrNurse}
                        onChange={(e) => setMorgueAttendantOrNurse(e.target.value)}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Urgency Tier */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                    <label className="text-xs font-bold text-neutral-700 block">Dispatch Urgency / Priority Tier:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'stat_immediate', label: '🔴 STAT (Immediate < 45m)', desc: 'Hospital/Home emergency' },
                        { id: 'standard_2h', label: '🟡 Standard (2 - 4 Hours)', desc: 'Routine morgue transfer' },
                        { id: 'scheduled_window', label: '🔵 Scheduled Window', desc: 'Pre-set appointment' },
                        { id: 'pending_physician_release', label: '⚪ Pending Dr. Release', desc: 'Hold until cert signed' }
                      ].map(t => (
                        <label
                          key={t.id}
                          className={`p-2 rounded-lg border cursor-pointer flex flex-col transition ${
                            urgency === t.id
                              ? 'bg-amber-50/80 border-[#b45309] text-amber-950 font-bold'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name="urgency"
                              checked={urgency === t.id}
                              onChange={() => {
                                const newUrgency = t.id as RemovalUrgency;
                                setUrgency(newUrgency);
                                if (newUrgency === 'stat_immediate') {
                                  setTargetCallTime('Immediate (Within 45 Mins)');
                                  setEstimatedArrivalMinutes(30);
                                } else if (newUrgency === 'standard_2h') {
                                  setTargetCallTime('Within 2-4 Hours');
                                  setEstimatedArrivalMinutes(120);
                                } else if (newUrgency === 'scheduled_window') {
                                  setTargetCallTime('Scheduled Appointment Window');
                                  setEstimatedArrivalMinutes(180);
                                } else {
                                  setTargetCallTime('On Hold Pending Release');
                                  setEstimatedArrivalMinutes(0);
                                }
                              }}
                              className="accent-[#991b1b]"
                            />
                            <span className="text-[11px] font-bold">{t.label}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 ml-4 font-normal">{t.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Director, Vehicle & Equipment */}
                <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <ShieldCheck className="w-4 h-4 text-[#991b1b]" />
                    Assigned Funeral Director, Crew & Vehicle
                  </h3>

                  {/* Director Selector */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Lead Licensed Funeral Director (LFD):</label>
                      <select
                        value={assignedDirector}
                        onChange={(e) => {
                          setAssignedDirector(e.target.value);
                          if (e.target.value.includes('Jason Benta')) {
                            setDirectorLicenseNumber('NYS LFD #08850');
                            setDirectorPhone('(212) 281-8850');
                          } else if (e.target.value.includes('Anthony Washington')) {
                            setDirectorLicenseNumber('NYS LFD #09124');
                            setDirectorPhone('(917) 555-8819');
                          } else {
                            setDirectorLicenseNumber('NYS LFD #07491');
                            setDirectorPhone('(646) 555-3390');
                          }
                        }}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-bold text-neutral-900 focus:ring-2 focus:ring-[#991b1b]"
                      >
                        <option value="Jason Benta, LFD">Jason Benta, LFD (Managing Director #08850)</option>
                        <option value="Anthony Washington, LFD">Anthony Washington, LFD (NYS Lic #09124)</option>
                        <option value="Cheryl Robinson, LFD">Cheryl Robinson, LFD (NYS Lic #07491)</option>
                        <option value="Senior Director Davis">Senior Director Davis (NYS Lic #06812)</option>
                      </select>
                      <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-2">
                        <span>License: <strong>{directorLicenseNumber}</strong></span>
                        <span>•</span>
                        <span>Direct: <strong>{directorPhone}</strong></span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Secondary Transport Specialist / Apprentice:</label>
                      <input
                        type="text"
                        value={secondaryCrewMember}
                        onChange={(e) => setSecondaryCrewMember(e.target.value)}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Transfer Vehicle:</label>
                        <select
                          value={vehicleType}
                          onChange={(e) => {
                            setVehicleType(e.target.value as RemovalVehicleType);
                            if (e.target.value.includes('BFH-1')) setVehiclePlate('BFH-CUSTODY-1');
                            else if (e.target.value.includes('BFH-2')) setVehiclePlate('BFH-CUSTODY-2');
                            else setVehiclePlate('BFH-ESCORT-4');
                          }}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-semibold"
                        >
                          <option value="First Call Custom Van (BFH-1)">First Call Van (BFH-1)</option>
                          <option value="Transfer Sprinter Unit (BFH-2)">Transfer Sprinter (BFH-2)</option>
                          <option value="Suburban Executive Escort">Suburban Escort Unit</option>
                          <option value="Cadillac Funeral Coach">Cadillac Funeral Coach</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Vehicle Plate / Tag:</label>
                        <input
                          type="text"
                          value={vehiclePlate}
                          onChange={(e) => setVehiclePlate(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono uppercase font-bold text-[#991b1b]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Equipment & Protocol Multi-Selector */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                    <label className="text-xs font-bold text-neutral-700 block">Transfer Equipment & Protocol:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        'Standard Mortuary Cot & Transfer Pouch',
                        'Bariatric 2-Man Lift Cot & Ramp',
                        'Stair Chair (Residence Multi-Floor)',
                        'Tamper-Evident Personal Effects Security Bag',
                        'Infectious Isolation & PPE Kit',
                        'Hospital Morgue Release Tag Scanner'
                      ].map((item) => {
                        const checked = specialEquipment.includes(item);
                        return (
                          <label
                            key={item}
                            onClick={() => toggleEquipment(item)}
                            className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition text-[11px] ${
                              checked
                                ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-bold'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="accent-blue-600 rounded"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Morgue Access Dock & Handling Instructions:</label>
                    <textarea
                      rows={2}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                      placeholder="Access codes, freight elevators, security desk clearance..."
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateStatus('dispatched_en_route', 'En Route to Facility')}
                    className="text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-2 rounded-lg border border-neutral-300 transition"
                  >
                    1. En Route
                  </button>
                  <button
                    onClick={() => handleSimulateStatus('on_scene', 'On Scene at Morgue')}
                    className="text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-2 rounded-lg border border-neutral-300 transition"
                  >
                    2. On Scene
                  </button>
                  <button
                    onClick={() => handleSimulateStatus('safe_arrival_completed', 'Safe Arrival Confirmed at 630 St Nicholas')}
                    className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg border border-emerald-300 transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    3. Safe Arrival
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenAppointmentModal && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = buildCurrentRemovalSchedule();
                        onSaveRemoval(currentCase.id, updated);
                        onClose();
                        onOpenAppointmentModal(currentCase);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-md flex items-center gap-1.5 border border-amber-300/40"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-200" />
                      <span>➔ Transfer to Arrangement</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('sms')}
                    className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    Next: Review SMS Confirmations
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSaveAndDispatch}
                    className="bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-md shadow-red-950/20 border border-amber-400/40"
                  >
                    Save Transfer Record
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-WAY SMS CONFIRMATIONS */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-neutral-900 to-[#2c1212] text-white p-4 rounded-xl border border-neutral-700 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="font-serif-title font-bold text-base text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                    Automated 3-Way Removal SMS Dispatcher
                  </h3>
                  <p className="text-xs text-neutral-300 font-light">
                    Real-time carrier text notifications keeping the Funeral Director, Releasing Morgue Officer, and Family synchronized.
                  </p>
                </div>
                <button
                  onClick={handleDispatchAllSms}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-lg shadow-red-950/40 border border-amber-300/40 flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  ⚡ Dispatch All 3 SMS Alerts
                </button>
              </div>

              {/* 3 SMS Channels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* 1. Director SMS */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between overflow-hidden">
                  <div className="p-4 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#991b1b]" />
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">1. Assigned Director SMS</h4>
                        <div className="text-[10px] text-neutral-500">{assignedDirector} • {directorPhone}</div>
                      </div>
                    </div>
                    <span className="bg-red-100 text-[#991b1b] text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                      DIRECTOR
                    </span>
                  </div>

                  <div className="p-4 space-y-3 bg-neutral-50/50 flex-1">
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs font-mono text-neutral-800 leading-relaxed">
                      <div className="text-[10px] text-neutral-400 font-bold border-b pb-1">CARRIER SMS PAYLOAD:</div>
                      <p>
                        🚨 <strong>BFH FIRST CALL DISPATCH:</strong><br />
                        Director {assignedDirector}, you are dispatched for custody transfer of <strong>{currentCase.decedent.legalName}</strong> ({currentCase.caseNumber}).
                      </p>
                      <p>
                        📍 <strong>Location:</strong> {facilityName}<br />
                        🏢 <strong>Floor:</strong> {facilityFloorRoom}<br />
                        📞 <strong>Morgue Desk:</strong> {facilityContactPhone}<br />
                        🚐 <strong>Vehicle:</strong> {vehicleType} [{vehiclePlate}]
                      </p>
                      <p className="text-[11px] text-[#991b1b] font-bold">
                        📜 Completed NYS Removal Affidavit linked: https://e-bfh.com/affidavit/{currentCase.caseNumber}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Director Quick-Reply Simulators:</div>
                      <div className="grid grid-cols-1 gap-1.5">
                        <button
                          onClick={() => handleSimulateStatus('dispatched_en_route', 'Director En Route')}
                          className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-[11px] font-semibold py-1.5 px-2.5 rounded-lg text-left flex items-center justify-between"
                        >
                          <span>📱 Reply: "1 - ACCEPT & EN ROUTE"</span>
                          <Check className="w-3 h-3 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleSimulateStatus('on_scene', 'Director On Scene at Morgue')}
                          className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-[11px] font-semibold py-1.5 px-2.5 rounded-lg text-left flex items-center justify-between"
                        >
                          <span>📱 Reply: "2 - ON SCENE AT MORGUE"</span>
                          <Check className="w-3 h-3 text-amber-600" />
                        </button>
                        <button
                          onClick={() => handleSimulateStatus('safe_arrival_completed', 'Custody Acquired & Safe Arrival at 630 St Nicholas')}
                          className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-[11px] font-semibold py-1.5 px-2.5 rounded-lg text-left flex items-center justify-between text-emerald-800 font-bold"
                        >
                          <span>📱 Reply: "3 - SAFE ARRIVAL AT BFH"</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Facility / Morgue SMS */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between overflow-hidden">
                  <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">2. Facility Morgue Desk SMS</h4>
                        <div className="text-[10px] text-neutral-500">{facilityName} • {facilityContactPhone}</div>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                      HOSPITAL
                    </span>
                  </div>

                  <div className="p-4 space-y-3 bg-neutral-50/50 flex-1">
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs font-mono text-neutral-800 leading-relaxed">
                      <div className="text-[10px] text-neutral-400 font-bold border-b pb-1">CARRIER SMS PAYLOAD:</div>
                      <p>
                        🏥 <strong>BENTA'S FUNERAL HOME INTAKE:</strong><br />
                        Attention Morgue Attendant / Security at {facilityName}.
                      </p>
                      <p>
                        Our licensed removal team led by <strong>{assignedDirector}</strong> ({directorLicenseNumber}) in vehicle <strong>{vehiclePlate}</strong> is en route for custody release of <strong>{currentCase.decedent.legalName}</strong>.
                      </p>
                      <p>
                        ⏱️ <strong>ETA:</strong> Approx {estimatedArrivalMinutes} Minutes.<br />
                        Signed Next-of-Kin Authorization is attached.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs text-blue-950 space-y-1">
                      <span className="font-bold block text-[11px]">Security Dock Fast-Pass:</span>
                      <p className="text-[10px] text-blue-800">
                        Provides hospital security with director license number and vehicle registration for gate access.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Family / Informant SMS */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between overflow-hidden">
                  <div className="p-4 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-amber-700" />
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">3. Family Reassurance SMS</h4>
                        <div className="text-[10px] text-neutral-500">{currentCase.informant.fullName} • {currentCase.informant.phone}</div>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                      NEXT OF KIN
                    </span>
                  </div>

                  <div className="p-4 space-y-3 bg-neutral-50/50 flex-1">
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs font-mono text-neutral-800 leading-relaxed">
                      <div className="text-[10px] text-neutral-400 font-bold border-b pb-1">CARRIER SMS PAYLOAD:</div>
                      <p>
                        🕊️ <strong>Benta's Funeral Home (Harlem, NY):</strong>
                      </p>
                      <p>
                        Dear {currentCase.informant.fullName}, our licensed transfer team led by <strong>{assignedDirector}</strong> has been dispatched to {facilityName}.
                      </p>
                      <p>
                        We will notify you immediately once your beloved <strong>{currentCase.decedent.legalName}</strong> has safely arrived into our reverent care at 630 Saint Nicholas Ave.
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        Director Hotline: (212) 281-8850
                      </p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
                      <span className="font-bold block text-[11px]">Peace of Mind Guarantee:</span>
                      <p className="text-[10px] text-amber-800">
                        Automates the sacred promise that family is notified the exact second their loved one crosses our threshold.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3 py-2"
                >
                  ← Back to Schedule Options
                </button>
                <button
                  onClick={() => setActiveTab('affidavit')}
                  className="bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition flex items-center gap-1.5 shadow-md shadow-red-950/20"
                >
                  Next: View Completed Removal Affidavit
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETED REMOVAL CUSTODY AFFIDAVIT */}
          {activeTab === 'affidavit' && (
            <div className="space-y-6">
              
              {/* Action Ribbon */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1.5 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Official NYC Statement of Authority & Custody Receipt
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    Doc Ref: #{currentRemoval?.affidavit?.affidavitNumber || `AFF-REM-${currentCase.caseNumber}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendAffidavitToDirector}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-3 py-2 rounded-lg border border-neutral-300 transition flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    SMS Affidavit to Director ({directorPhone})
                  </button>
                  <button
                    onClick={handlePrintAffidavit}
                    className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Legal Certificate
                  </button>
                  <button
                    onClick={handleSaveAndDispatch}
                    className="bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-red-950/20"
                  >
                    Save & Attach to Case
                  </button>
                </div>
              </div>

              {/* Printable Legal Document Container */}
              <div
                ref={printRef}
                className="bg-white p-8 sm:p-10 rounded-2xl border-2 border-neutral-300 shadow-lg text-neutral-900 font-sans space-y-6 print:border-none print:shadow-none print:p-0"
              >
                {/* Formal Document Header */}
                <div className="text-center border-b-2 border-neutral-900 pb-4 space-y-1 relative">
                  <div className="absolute top-0 right-0 text-right text-[10px] font-mono text-neutral-500">
                    <div>AFFIDAVIT NO:</div>
                    <div className="font-bold text-neutral-900 text-xs">{currentRemoval?.affidavit?.affidavitNumber || `AFF-REM-${currentCase.caseNumber}`}</div>
                  </div>

                  <h3 className="font-serif-title italic text-sm text-neutral-700">
                    "Dignity, Integrity, and Reverent Heritage"
                  </h3>
                  <h1 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#991b1b] tracking-wider">
                    Benta's Funeral Home, Inc.
                  </h1>
                  <p className="text-xs text-neutral-600 font-semibold">
                    630 Saint Nicholas Avenue • New York, NY 10030 • Tel: (212) 281-8850 • NYS Establishment Lic. #08850
                  </p>
                  <div className="inline-block bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded mt-2">
                    NYC Department of Hospitals / Statement of Authority & Removal Custody Receipt
                  </div>
                </div>

                {/* Section A: Decedent & Passing Details */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#991b1b] border-b border-neutral-200 pb-1">
                    SECTION I: DECEDENT IDENTIFICATION & FACILITY OF PASSING
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Legal Name of Deceased:</span>
                      <strong className="text-sm font-serif-title text-neutral-900">{currentCase.decedent.legalName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Case Number:</span>
                      <strong className="font-mono text-[#991b1b]">{currentCase.caseNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Date / Time of Passing:</span>
                      <strong>{currentCase.decedent.dateOfDeath} (10:30 AM)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Hospital MRN / Tag #:</span>
                      <strong className="font-mono">{currentRemoval?.affidavit?.facilityMrnOrTag || 'MSM-28491'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-neutral-500 block uppercase">Releasing Hospital / Facility:</span>
                      <strong>{facilityName} ({facilityFloorRoom})</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-neutral-500 block uppercase">Facility Street Address:</span>
                      <strong>{facilityAddress}</strong>
                    </div>
                  </div>
                </div>

                {/* Section B: Informant Right to Control Disposition Jurat */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#991b1b] border-b border-neutral-200 pb-1">
                    SECTION II: STATUTORY AUTHORITY OF PERSON ENGAGING SERVICES (NYS PHL § 4201)
                  </h4>
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-2">
                    <p className="leading-relaxed text-neutral-800">
                      Pursuant to <strong>New York State Public Health Law § 4201</strong>, the undersigned hereby certifies that <strong>{currentCase.informant.fullName}</strong>, residing at <strong>{currentCase.informant.address}</strong>, Phone: <strong>{currentCase.informant.phone}</strong>, relationship: <strong>{currentCase.informant.relationship}</strong>, has verified right-to-control disposition and has duly engaged and authorized <strong>Benta's Funeral Home, Inc.</strong> to take physical custody of the remains of <strong>{currentCase.decedent.legalName}</strong> for preparation, transport, and funeral services.
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-neutral-600 border-t border-neutral-200 pt-2 font-medium">
                      <span>Authorization Mode: <strong>Digital Portal eSign Verified</strong></span>
                      <span>Verified Timestamp: <strong>{currentCase.createdAt.split('T')[0]} 09:35 AM</strong></span>
                    </div>
                  </div>
                </div>

                {/* Section C: Assigned Funeral Director & Transport Crew */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#991b1b] border-b border-neutral-200 pb-1">
                    SECTION III: LICENSED FUNERAL DIRECTOR & CUSTODIAL TRANSFER LOG
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Assigned Director:</span>
                      <strong className="text-neutral-900">{assignedDirector}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">NYS LFD Reg Number:</span>
                      <strong className="font-mono text-neutral-900">{directorLicenseNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Transfer Vehicle & Plate:</span>
                      <strong>{vehicleType} [{vehiclePlate}]</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Secondary Crew:</span>
                      <strong>{secondaryCrewMember}</strong>
                    </div>
                  </div>
                </div>

                {/* Section D: Personal Effects & Property Custody Ledger */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#991b1b]">
                      SECTION IV: PERSONAL EFFECTS & VALUABLES CUSTODY INVENTORY ({personalEffects.length} Items Logged)
                    </h4>
                    <button
                      onClick={handleAddPersonalEffect}
                      className="text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded border border-neutral-300 flex items-center gap-1 print:hidden"
                    >
                      <Plus className="w-3 h-3" />
                      Add Property Item
                    </button>
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 font-serif-title uppercase text-[10px] border-b border-neutral-200 text-neutral-700">
                        <tr>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Detailed Description of Personal Property</th>
                          <th className="p-2.5">Released By (Hospital Staff)</th>
                          <th className="p-2.5 text-center">Custody Received</th>
                          <th className="p-2.5 text-right print:hidden">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {personalEffects.map((pe) => (
                          <tr key={pe.id} className="hover:bg-neutral-50">
                            <td className="p-2.5 font-semibold text-[11px] text-neutral-800 whitespace-nowrap">
                              <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200 text-[10px]">
                                {pe.category}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={pe.description}
                                onChange={(e) => handleUpdatePersonalEffect(pe.id, 'description', e.target.value)}
                                className="w-full text-xs p-1 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-[#991b1b] focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-neutral-600 text-[11px]">
                              {pe.releasedBy}
                            </td>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={pe.custodyReceived}
                                onChange={(e) => handleUpdatePersonalEffect(pe.id, 'custodyReceived', e.target.checked)}
                                className="accent-emerald-600 w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 text-right print:hidden">
                              <button
                                onClick={() => handleRemovePersonalEffect(pe.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section E: Dual Signatures & Authority Jurat */}
                <div className="pt-4 border-t-2 border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                  
                  {/* Releasing Hospital Attendant Signature */}
                  <div className="space-y-2">
                    <span className="font-bold text-neutral-900 uppercase block text-[11px]">
                      A. Releasing Facility Custody Officer:
                    </span>
                    <p className="text-[11px] text-neutral-600 leading-tight">
                      I hereby certify that I have positively identified the deceased and released physical custody and all itemized personal effects to Benta's Funeral Home, Inc.
                    </p>
                    <div className="border border-neutral-300 bg-neutral-50/70 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Attendant: <strong>{morgueAttendantOrNurse}</strong></span>
                        <button
                          onClick={() => setFacilitySigned(!facilitySigned)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded print:hidden ${
                            facilitySigned ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {facilitySigned ? '✓ Verified Signed' : 'Sign Stamp'}
                        </button>
                      </div>
                      <div className="font-serif italic text-base text-neutral-800 border-b border-neutral-400 pb-1">
                        {facilitySigned ? morgueAttendantOrNurse : '____________________________________'}
                      </div>
                      <div className="text-[10px] text-neutral-500 flex justify-between">
                        <span>Title: Pathology / Morgue Attendant</span>
                        <span>Date: {currentCase.createdAt.split('T')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Licensed Funeral Director Signature */}
                  <div className="space-y-2">
                    <span className="font-bold text-[#991b1b] uppercase block text-[11px]">
                      B. Licensed Funeral Director Receiving Custody:
                    </span>
                    <p className="text-[11px] text-neutral-600 leading-tight">
                      I hereby certify receipt of custody of the remains and all listed personal effects for transfer to Benta's Funeral Home, 630 Saint Nicholas Ave.
                    </p>
                    <div className="border border-red-200 bg-red-50/40 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Director: <strong>{assignedDirector}</strong></span>
                        <button
                          onClick={() => {
                            setDirectorSigned(true);
                            setDirectorSignatureTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0]);
                            showToast(`✍️ Director electronic signature applied with NYS LFD Seal #${directorLicenseNumber}.`);
                          }}
                          className="text-[10px] font-bold bg-[#991b1b] hover:bg-red-800 text-white px-2 py-0.5 rounded print:hidden"
                        >
                          {directorSigned ? '✓ Seal Applied' : 'Apply Director Seal PIN'}
                        </button>
                      </div>
                      <div className="font-serif italic text-lg text-[#991b1b] border-b border-red-300 pb-1 font-bold">
                        {directorSigned ? `${assignedDirector}, NYS LFD` : '____________________________________'}
                      </div>
                      <div className="text-[10px] text-neutral-600 flex justify-between">
                        <span>Reg: <strong>{directorLicenseNumber}</strong></span>
                        <span>Signed: {directorSignatureTime}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Safe Arrival Seal */}
                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>Establishment: Benta's Funeral Home, Inc. (630 St. Nicholas Ave, New York, NY 10030)</span>
                  <span>Chain of Custody Logged • 256-Bit Encrypted Record</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
