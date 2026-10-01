import React, { useState } from 'react';
import {
  IntakePathwayType,
  FirstCallIntakeFormData,
  RemovalLocationType,
  RemovalUrgency,
  DispositionType,
  DirectorProfile
} from '../../lib/types/funeral';
import { 
  TRI_STATE_HOSPITALS_DIRECTORY, 
  TRI_STATE_NURSING_HOMES_DIRECTORY 
} from '../../lib/data/partnerCatalogs';
import { 
  formatPhoneNumbersOnly, 
  isValidEmailFormat 
} from '../../lib/utils/inputValidation';
import {
  PhoneCall,
  User,
  MapPin,
  Calendar,
  Building2,
  Truck,
  HeartHandshake,
  Sparkles,
  X,
  Flame,
  Stethoscope,
  Info
} from 'lucide-react';

interface FirstCallIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIntake: (
    formData: FirstCallIntakeFormData, 
    nextAction: 'open_removal' | 'open_appointment' | 'save_only'
  ) => void;
  directorProfiles?: DirectorProfile[];
  currentDirectorId?: string;
}

export const FirstCallIntakeModal: React.FC<FirstCallIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmitIntake,
  directorProfiles = [],
  currentDirectorId = 'dir-fd-1'
}) => {
  if (!isOpen) return null;

  const dateToday = new Date().toISOString().split('T')[0];
  const activeDirectorObj = directorProfiles.find(d => d.id === currentDirectorId) || directorProfiles[0];

  // 1. Pathway Selector State
  const [intakePathway, setIntakePathway] = useState<IntakePathwayType>('unexpected_removal_first');

  // 2. Caller / Informant State
  const [callerName, setCallerName] = useState('');
  const [callerRelationship, setCallerRelationship] = useState('Spouse / Next of Kin');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerEmail, setCallerEmail] = useState('');
  const [callerAddress, setCallerAddress] = useState('New York, NY');
  const [hasRightToControl, setHasRightToControl] = useState(true);

  // 3. Decedent & Location State
  const [decedentLegalName, setDecedentLegalName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState(dateToday);
  const [isExpectedDeath, setIsExpectedDeath] = useState(false);

  // Location / Facility
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('custom');
  const [locationType, setLocationType] = useState<RemovalLocationType>('hospital_morgue');
  const [facilityName, setFacilityName] = useState('Mount Sinai Morningside');
  const [facilityAddress, setFacilityAddress] = useState('411 W 114th St, New York, NY 10025');
  const [facilityFloorRoom, setFacilityFloorRoom] = useState('Pathology Morgue Level B1 / Bay 2');
  const [facilityContactPhone, setFacilityContactPhone] = useState('(212) 523-4000');
  const [morgueAttendantOrNurse, setMorgueAttendantOrNurse] = useState('Officer in Charge / Morgue Desk');

  // 4. Physician & Medical Certifier
  const [physicianName, setPhysicianName] = useState('Dr. Sarah Jenkins, MD');
  const [physicianPhone, setPhysicianPhone] = useState('(212) 523-4000');
  const [physicianLicenseNumber, setPhysicianLicenseNumber] = useState('');

  // 5. Service Preferences & Assignment
  const [dispositionType, setDispositionType] = useState<DispositionType>('full_cremation');
  const [viewingParlor, setViewingParlor] = useState<'Parlor A (Seats 120)' | 'Parlor B (Seats 110)' | 'Church / External Venue' | 'Direct / No Viewing'>('Parlor A (Seats 120)');
  const [targetServiceDate, setTargetServiceDate] = useState('');
  const [assignedDirectorId, setAssignedDirectorId] = useState(activeDirectorObj?.id || 'dir-fd-1');
  const [assignedDirectorName, setAssignedDirectorName] = useState(activeDirectorObj?.name || 'Jason Benta');
  const [urgency, setUrgency] = useState<RemovalUrgency>('stat_immediate');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [specialEquipment, setSpecialEquipment] = useState<string[]>([
    'Standard Mortuary Cot & Transfer Pouch',
    'Tamper-Evident Personal Effects Security Bag'
  ]);

  // Validation Error State
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Quick Facility Lookup Handler
  const handleFacilitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedFacilityId(val);

    if (val === 'custom') {
      setLocationType('residence');
      setFacilityName('Private Residence');
      setFacilityAddress('');
      setFacilityFloorRoom('Apt / Room');
      setFacilityContactPhone('');
      return;
    }

    // Search in hospitals
    const hosp = TRI_STATE_HOSPITALS_DIRECTORY.find(h => h.id === val);
    if (hosp) {
      setLocationType('hospital_morgue');
      setFacilityName(hosp.name);
      setFacilityAddress(`${hosp.address}, ${hosp.city}, ${hosp.state} ${hosp.zip}`);
      setFacilityFloorRoom('Hospital Pathology Morgue');
      setFacilityContactPhone(hosp.morgueOrPathologyPhone || hosp.mainPhone);
      setMorgueAttendantOrNurse('Morgue Custodial Officer');
      return;
    }

    // Search in nursing homes
    const nh = TRI_STATE_NURSING_HOMES_DIRECTORY.find(n => n.id === val);
    if (nh) {
      setLocationType('nursing_home');
      setFacilityName(nh.name);
      setFacilityAddress(`${nh.address}, ${nh.city}, ${nh.state} ${nh.zip}`);
      setFacilityFloorRoom(nh.securityOrDockInstructions ? `Floor / Dock: ${nh.securityOrDockInstructions}` : 'Nursing Station');
      setFacilityContactPhone(nh.nursingStationPhone || nh.mainPhone);
      setMorgueAttendantOrNurse('Charge Nurse / Nursing Supervisor');
      return;
    }
  };

  const handleDirectorChange = (id: string) => {
    setAssignedDirectorId(id);
    const d = directorProfiles.find(p => p.id === id);
    if (d) setAssignedDirectorName(d.name);
  };

  const toggleEquipment = (item: string) => {
    setSpecialEquipment(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!callerName.trim()) {
      errors.callerName = 'Informant / Caller full name is required.';
    }
    if (!callerPhone.trim() || callerPhone.replace(/\D/g, '').length < 10) {
      errors.callerPhone = 'Valid 10-digit caller phone number is required.';
    }
    if (callerEmail.trim() && !isValidEmailFormat(callerEmail)) {
      errors.callerEmail = 'Please provide a valid email format (e.g. name@domain.com).';
    }
    if (!decedentLegalName.trim()) {
      errors.decedentLegalName = 'Decedent legal full name is required.';
    }
    if (!facilityName.trim()) {
      errors.facilityName = 'Place or facility of passing is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission handler
  const handleSubmit = (nextAction: 'open_removal' | 'open_appointment' | 'save_only') => {
    if (!validateForm()) return;

    const formData: FirstCallIntakeFormData = {
      callerName,
      callerRelationship,
      callerPhone,
      callerEmail,
      callerAddress,
      hasRightToControl,
      decedentLegalName,
      gender,
      dateOfBirth,
      dateOfDeath,
      isExpectedDeath,
      locationType,
      facilityName,
      facilityAddress,
      facilityFloorRoom,
      facilityContactPhone,
      morgueAttendantOrNurse,
      physicianName,
      physicianPhone,
      physicianLicenseNumber,
      dispositionType,
      viewingParlor,
      targetServiceDate,
      assignedDirectorId,
      assignedDirectorName,
      intakePathway,
      urgency,
      specialInstructions,
      specialEquipment
    };

    onSubmitIntake(formData, nextAction);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#991b1b] text-white border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                  EST. 1928 • HARLEM, NYC
                </span>
                <span className="text-[10px] text-neutral-300 font-mono">
                  First Call Intake Studio
                </span>
              </div>
              <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white tracking-wide">
                Universal First Call & Intake Studio
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-neutral-50/60 text-xs">
          
          {/* SECTION 1: INTAKE PATHWAY SELECTOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#991b1b]" />
                <span>1. Select Family Contact Scenario & Initial Intake Pathway</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Information captured transfers bi-directionally between removal & arrangement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Pathway A: Unexpected Death / Immediate Removal */}
              <div
                onClick={() => {
                  setIntakePathway('unexpected_removal_first');
                  setUrgency('stat_immediate');
                  setIsExpectedDeath(false);
                }}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  intakePathway === 'unexpected_removal_first'
                    ? 'bg-red-50/90 border-[#991b1b] shadow-md ring-2 ring-red-200'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-[#991b1b] flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  {intakePathway === 'unexpected_removal_first' && (
                    <span className="bg-[#991b1b] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Active Pathway
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">
                    🚨 Unexpected Death — Immediate Removal First
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                    Death has occurred at home or facility. First Call removal van is dispatched first. Arrangement conference scheduled subsequently.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#991b1b] pt-1 border-t border-red-200/60">
                  ➔ Route: First Call Removal Logistics ➔ Arrangement Conference
                </div>
              </div>

              {/* Pathway B: Advance / Scheduled Arrangement First */}
              <div
                onClick={() => {
                  setIntakePathway('scheduled_arrangement_first');
                  setUrgency('scheduled_window');
                  setIsExpectedDeath(true);
                }}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  intakePathway === 'scheduled_arrangement_first'
                    ? 'bg-amber-50/90 border-[#b45309] shadow-md ring-2 ring-amber-200'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#b45309] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  {intakePathway === 'scheduled_arrangement_first' && (
                    <span className="bg-[#b45309] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Active Pathway
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">
                    📅 Advance Planning / Scheduled Arrangement First
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                    Family calling in advance or consulting first. Book conference at 630 St. Nicholas Ave. Removal details pre-filled for rapid dispatch when needed.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#b45309] pt-1 border-t border-amber-200/60">
                  ➔ Route: Family Arrangement Studio ➔ 1-Click Removal Dispatch
                </div>
              </div>

              {/* Pathway C: Imminent / Hospice Holding */}
              <div
                onClick={() => {
                  setIntakePathway('imminent_hospice');
                  setUrgency('pending_physician_release');
                  setIsExpectedDeath(true);
                }}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  intakePathway === 'imminent_hospice'
                    ? 'bg-purple-50/90 border-purple-700 shadow-md ring-2 ring-purple-200'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  {intakePathway === 'imminent_hospice' && (
                    <span className="bg-purple-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Active Pathway
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">
                    ⚖️ Imminent Hospice / Palliative Holding
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                    Loved one under palliative / hospice care. Register vital details and pre-authorize BFH custody so transport is instantaneous upon call.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-purple-900 pt-1 border-t border-purple-200/60">
                  ➔ Route: Standby Golden Record ➔ Instant Release Dispatch
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: CALLER & LEGAL INFORMANT INFO */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="font-serif-title font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#991b1b]" />
                <span>2. Informant & Next of Kin (Caller Details)</span>
              </h4>
              <span className="text-[10px] text-neutral-500">NYS PHL § 4201 Right to Control</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Caller / Informant Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arthur Holloway"
                  value={callerName}
                  onChange={(e) => {
                    setCallerName(e.target.value);
                    if (validationErrors.callerName) setValidationErrors(prev => ({ ...prev, callerName: '' }));
                  }}
                  className={`w-full bg-[#fbfbfd] border rounded-xl p-2.5 font-bold outline-none transition ${
                    validationErrors.callerName ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 focus:border-[#991b1b]'
                  }`}
                />
                {validationErrors.callerName && (
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{validationErrors.callerName}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Relationship to Decedent
                </label>
                <select
                  value={callerRelationship}
                  onChange={(e) => setCallerRelationship(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-semibold outline-none focus:border-[#991b1b]"
                >
                  <option value="Spouse / Surviving Partner">Spouse / Surviving Partner</option>
                  <option value="Adult Child (Son / Daughter)">Adult Child (Son / Daughter)</option>
                  <option value="Parent (Father / Mother)">Parent (Father / Mother)</option>
                  <option value="Sibling (Brother / Sister)">Sibling (Brother / Sister)</option>
                  <option value="Grandchild / Niece / Nephew">Grandchild / Niece / Nephew</option>
                  <option value="Designated Healthcare Agent">Designated Healthcare Agent</option>
                  <option value="Estate Executor / Legal Fiduciary">Estate Executor / Legal Fiduciary</option>
                  <option value="Close Friend / Personal Representative">Close Friend / Personal Representative</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Caller Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="(212) 555-0199"
                  value={callerPhone}
                  onChange={(e) => {
                    setCallerPhone(formatPhoneNumbersOnly(e.target.value));
                    if (validationErrors.callerPhone) setValidationErrors(prev => ({ ...prev, callerPhone: '' }));
                  }}
                  className={`w-full bg-[#fbfbfd] border rounded-xl p-2.5 font-bold font-mono outline-none transition ${
                    validationErrors.callerPhone ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 focus:border-[#991b1b]'
                  }`}
                />
                {validationErrors.callerPhone && (
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{validationErrors.callerPhone}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Caller Email Address
                </label>
                <input
                  type="email"
                  placeholder="informant@family.org"
                  value={callerEmail}
                  onChange={(e) => {
                    setCallerEmail(e.target.value);
                    if (validationErrors.callerEmail) setValidationErrors(prev => ({ ...prev, callerEmail: '' }));
                  }}
                  className={`w-full bg-[#fbfbfd] border rounded-xl p-2.5 outline-none transition ${
                    validationErrors.callerEmail ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 focus:border-[#991b1b]'
                  }`}
                />
                {validationErrors.callerEmail && (
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{validationErrors.callerEmail}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Informant Physical Residence Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 240 W 138th St, Apt 4B, New York, NY 10030"
                  value={callerAddress}
                  onChange={(e) => setCallerAddress(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div className="flex items-center space-x-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200 mt-auto">
                <input
                  type="checkbox"
                  id="rightToControl"
                  checked={hasRightToControl}
                  onChange={(e) => setHasRightToControl(e.target.checked)}
                  className="w-4 h-4 accent-[#991b1b] cursor-pointer"
                />
                <label htmlFor="rightToControl" className="text-[11px] text-amber-950 font-semibold cursor-pointer">
                  Caller certifies legal right to control disposition under NYS Public Health Law § 4201.
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: DECEDENT & PLACE OF PASSING */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="font-serif-title font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#991b1b]" />
                <span>3. Decedent & Location of Passing / Pickup Facility</span>
              </h4>
              <span className="text-[10px] text-neutral-500">Auto-populates Removal Logistics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Decedent Legal Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gwendolyn M. Patterson"
                  value={decedentLegalName}
                  onChange={(e) => {
                    setDecedentLegalName(e.target.value);
                    if (validationErrors.decedentLegalName) setValidationErrors(prev => ({ ...prev, decedentLegalName: '' }));
                  }}
                  className={`w-full bg-[#fbfbfd] border rounded-xl p-2.5 font-bold outline-none transition ${
                    validationErrors.decedentLegalName ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 focus:border-[#991b1b]'
                  }`}
                />
                {validationErrors.decedentLegalName && (
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{validationErrors.decedentLegalName}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-semibold outline-none focus:border-[#991b1b]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Non-Binary</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Date of Birth (if known)</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Date of Passing {intakePathway === 'unexpected_removal_first' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono font-bold outline-none focus:border-[#991b1b]"
                />
              </div>
            </div>

            {/* Quick Facility Directory Selector */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>Facility Lookup & Address Quick-Filler:</span>
                </span>
                <select
                  value={selectedFacilityId}
                  onChange={handleFacilitySelect}
                  className="bg-white border border-neutral-300 text-neutral-900 font-bold rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#991b1b]"
                >
                  <option value="custom">🏠 Private Residence / Custom Facility</option>
                  <optgroup label="Tri-State Hospitals & Medical Centers">
                    {TRI_STATE_HOSPITALS_DIRECTORY.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.borough || h.city})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Nursing Homes & Hospices">
                    {TRI_STATE_NURSING_HOMES_DIRECTORY.map(n => (
                      <option key={n.id} value={n.id}>{n.name} ({n.borough || n.city})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Facility / Location Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => {
                      setFacilityName(e.target.value);
                      if (validationErrors.facilityName) setValidationErrors(prev => ({ ...prev, facilityName: '' }));
                    }}
                    placeholder="e.g. Mount Sinai Morningside"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                  />
                  {validationErrors.facilityName && (
                    <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{validationErrors.facilityName}</span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={facilityAddress}
                    onChange={(e) => setFacilityAddress(e.target.value)}
                    placeholder="e.g. 411 W 114th St, New York, NY"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Floor / Room / Morgue Bay</label>
                  <input
                    type="text"
                    value={facilityFloorRoom}
                    onChange={(e) => setFacilityFloorRoom(e.target.value)}
                    placeholder="e.g. Morgue Level B1 / Bay 2"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Facility Contact Phone</label>
                  <input
                    type="tel"
                    value={facilityContactPhone}
                    onChange={(e) => setFacilityContactPhone(formatPhoneNumbersOnly(e.target.value))}
                    placeholder="(212) 523-4000"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 font-mono outline-none focus:border-[#991b1b]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: ATTENDING PHYSICIAN & EDRS CERTIFIER */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="font-serif-title font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#991b1b]" />
                <span>4. Attending Physician & NYC EDRS eVital Certifier</span>
              </h4>
              <span className="text-[10px] text-neutral-500">NYC DOHMH 72-Hour Statutory Clock</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Attending Physician / Certifier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins, MD"
                  value={physicianName}
                  onChange={(e) => setPhysicianName(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Physician Phone / Office</label>
                <input
                  type="tel"
                  placeholder="(212) 523-4000"
                  value={physicianPhone}
                  onChange={(e) => setPhysicianPhone(formatPhoneNumbersOnly(e.target.value))}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Physician License / EDRS ID (if known)</label>
                <input
                  type="text"
                  placeholder="e.g. NY-MED-284910"
                  value={physicianLicenseNumber}
                  onChange={(e) => setPhysicianLicenseNumber(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono outline-none focus:border-[#991b1b]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: PRELIMINARY SERVICE & DIRECTOR ASSIGNMENT */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="font-serif-title font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#991b1b]" />
                <span>5. Preliminary Service Selection & Assigned Funeral Director</span>
              </h4>
              <span className="text-[10px] text-neutral-500">Pre-populates Form AP-47 Statement</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Preliminary Disposition</label>
                <select
                  value={dispositionType}
                  onChange={(e) => setDispositionType(e.target.value as any)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                >
                  <option value="full_cremation">Full Cremation with Chapel Viewing</option>
                  <option value="cremation_memorial">Cremation Memorial Tribute</option>
                  <option value="direct_cremation">Direct Dignified Cremation</option>
                  <option value="full_burial">Traditional Sanctuary Burial</option>
                  <option value="direct_burial">Direct Graveside Burial</option>
                  <option value="pre_need">Advance Pre-Need Plan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Preferred Viewing Parlor</label>
                <select
                  value={viewingParlor}
                  onChange={(e) => setViewingParlor(e.target.value as any)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-semibold outline-none focus:border-[#991b1b]"
                >
                  <option value="Parlor A (Seats 120)">Parlor A (Main Chapel - Seats 120)</option>
                  <option value="Parlor B (Seats 110)">Parlor B (Seats 110)</option>
                  <option value="Church / External Venue">Church / External Venue</option>
                  <option value="Direct / No Viewing">Direct / No Viewing</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Lead Funeral Director</label>
                <select
                  value={assignedDirectorId}
                  onChange={(e) => handleDirectorChange(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                >
                  {directorProfiles.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.title})</option>
                  ))}
                  {directorProfiles.length === 0 && (
                    <option value="dir-fd-1">Jason Benta (Licensed Funeral Director)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Target Service Date (if planned)</label>
                <input
                  type="date"
                  value={targetServiceDate}
                  onChange={(e) => setTargetServiceDate(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono outline-none focus:border-[#991b1b]"
                />
              </div>
            </div>

            {/* Transfer Equipment & Protocols Checklist */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-100">
              <label className="block font-bold text-neutral-700">
                First Call Transfer Equipment & Special Protocols:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  'Standard Mortuary Cot & Transfer Pouch',
                  'Bariatric 2-Man Lift Cot & Ramp',
                  'Stair Chair (Multi-Floor Residence)',
                  'Tamper-Evident Personal Effects Security Bag',
                  'PPE & Infectious Isolation Kit',
                  'Hospital Morgue Release Tag Scanner'
                ].map((item) => {
                  const checked = specialEquipment.includes(item);
                  return (
                    <label
                      key={item}
                      onClick={() => toggleEquipment(item)}
                      className={`p-2 rounded-xl border cursor-pointer flex items-center gap-2 transition text-[11px] ${
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

            {/* Special Instructions & Urgent Notes */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Immediate Logistics Notes & Special Family Requests:
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Elevator security code needed; family requested military honor guard; pacemaker present..."
                className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
              />
            </div>
          </div>

        </div>

        {/* MODAL FOOTER: ACTIONABLE PATHWAY LAUNCHERS */}
        <div className="px-6 py-4 bg-white border-t border-neutral-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-2 text-neutral-500 text-xs">
            <Info className="w-4 h-4 text-[#991b1b]" />
            <span>Case is automatically created & persisted with 5-phase flight checklist.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('save_only')}
              className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-bold rounded-xl text-xs transition shadow-2xs"
            >
              Save to Hub Only
            </button>

            {/* Primary Action Button 1: Removal Logistics First */}
            {intakePathway === 'unexpected_removal_first' ? (
              <button
                type="button"
                onClick={() => handleSubmit('open_removal')}
                className="px-5 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 border border-amber-400/40"
              >
                <Truck className="w-4 h-4 text-amber-300" />
                <span>Create Case & Dispatch Removal Crew Now ➔</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit('open_appointment')}
                className="px-5 py-2.5 bg-[#b45309] hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 border border-amber-300/40"
              >
                <Calendar className="w-4 h-4 text-amber-200" />
                <span>Create Case & Schedule Arrangement Conference ➔</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
