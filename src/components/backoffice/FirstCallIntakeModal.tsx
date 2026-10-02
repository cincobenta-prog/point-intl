import React, { useState } from 'react';
import {
  IntakePathwayType,
  FirstCallIntakeFormData,
  RemovalLocationType,
  RemovalUrgency,
  DispositionType,
  DirectorProfile,
  RemovalReadinessStatus
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
  Calendar,
  Building2,
  Truck,
  Sparkles,
  X,
  Info,
  Mail,
  Printer,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Copy,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Image as ImageIcon
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

  // Multi-Step Navigation State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. Pathway Selector State
  const intakePathway: IntakePathwayType = 'scheduled_arrangement_first';

  // 2. Caller / Informant State (Captured from Phone Call)
  const [callerName, setCallerName] = useState('');
  const [callerRelationship, setCallerRelationship] = useState('Spouse / Surviving Partner');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerEmail, setCallerEmail] = useState('');
  const [callerAddress, setCallerAddress] = useState('Harlem, New York, NY');
  const [hasRightToControl, setHasRightToControl] = useState(true);

  // 3. Decedent & Vital Records State
  const [decedentLegalName, setDecedentLegalName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState(dateToday);
  const isExpectedDeath = false;
  const [ssnLast4, setSsnLast4] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'married' | 'single' | 'widowed' | 'divorced'>('widowed');
  const [fatherName, setFatherName] = useState('');
  const [motherMaidenName, setMotherMaidenName] = useState('');
  const [residenceAddress, setResidenceAddress] = useState('Harlem, New York, NY 10030');

  // 4. Removal Readiness & Location Triage
  const [removalReadiness, setRemovalReadiness] = useState<RemovalReadinessStatus>('pending_hospital_release');
  const [removalReadinessNotes, setRemovalReadinessNotes] = useState('Awaiting attending physician death certificate sign-off and pathology release clearance.');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('custom');
  const [locationType, setLocationType] = useState<RemovalLocationType>('hospital_morgue');
  const [facilityName, setFacilityName] = useState('Mount Sinai Morningside Hospital');
  const [facilityAddress, setFacilityAddress] = useState('411 W 114th St, New York, NY 10025');
  const [facilityFloorRoom, setFacilityFloorRoom] = useState('Pathology / Morgue Bay 2');
  const [facilityContactPhone, setFacilityContactPhone] = useState('(212) 523-4000');
  const [morgueAttendantOrNurse, setMorgueAttendantOrNurse] = useState('Officer in Charge / Morgue Custody Desk');

  // Physician & Medical Certifier
  const [physicianName, setPhysicianName] = useState('Dr. Sarah Jenkins, MD');
  const [physicianPhone] = useState('(212) 523-4000');
  const [physicianLicenseNumber] = useState('');

  // 5. Service Preferences & Assignment
  const [dispositionType, setDispositionType] = useState<DispositionType>('full_cremation');
  const viewingParlor = 'Parlor A (Seats 120)';
  const targetServiceDate = '';
  const [assignedDirectorId, setAssignedDirectorId] = useState(activeDirectorObj?.id || 'dir-fd-1');
  const [assignedDirectorName, setAssignedDirectorName] = useState(activeDirectorObj?.name || 'Jason Benta');
  const [urgency, setUrgency] = useState<RemovalUrgency>('scheduled_window');
  const specialInstructions = '';
  const [specialEquipment] = useState<string[]>([
    'Standard Mortuary Cot & Transfer Pouch',
    'Tamper-Evident Personal Effects Security Bag'
  ]);

  // 6. Arrangement Appointment Scheduling State
  const defaultApptDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [scheduledAppointmentDate, setScheduledAppointmentDate] = useState(defaultApptDate);
  const [scheduledAppointmentTime, setScheduledAppointmentTime] = useState('10:00 AM');
  const [scheduledAppointmentVenue, setScheduledAppointmentVenue] = useState('630 St. Nicholas Ave - Arrangement Suite 1 (Ground Floor)');
  const [attendingFamilyCount, setAttendingFamilyCount] = useState(3);
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);
  const [sendConfirmationSms, setSendConfirmationSms] = useState(true);

  // Copy Feedback Toast
  const [copiedEmailText, setCopiedEmailText] = useState(false);

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

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!callerName.trim()) {
      errors.callerName = 'Informant / Caller full name is required.';
    }
    if (!callerPhone.trim() || callerPhone.replace(/\D/g, '').length < 10) {
      errors.callerPhone = 'Valid 10-digit caller phone number is required for SMS confirmation.';
    }
    if (callerEmail.trim() && !isValidEmailFormat(callerEmail)) {
      errors.callerEmail = 'Please provide a valid email format (e.g. name@domain.com) for confirmation packet.';
    }
    if (!decedentLegalName.trim()) {
      errors.decedentLegalName = 'Decedent legal full name is required.';
    }
    if (!facilityName.trim()) {
      errors.facilityName = 'Place or facility where loved one is resting is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Copy email text summary
  const handleCopyEmailText = () => {
    const emailBody = `SUBJECT: Appointment Confirmation & Arrangement Preparation Guide — Benta's Funeral Home

Dear ${callerName || 'Family Representative'},

Thank you for contacting Benta's Funeral Home. We extend our deepest condolences to you and your family on the passing of ${decedentLegalName || 'your loved one'}.

=======================================================
ARRANGEMENT CONFERENCE APPOINTMENT DETAILS
=======================================================
• Date & Time: ${scheduledAppointmentDate} at ${scheduledAppointmentTime}
• Location: Benta's Funeral Home, 630 Saint Nicholas Avenue, New York, NY 10030
• Meeting Room: ${scheduledAppointmentVenue}
• Assigned Funeral Director: ${assignedDirectorName} (212) 281-8850

=======================================================
CURRENT STATUS & CUSTODY NOTICE
=======================================================
• Loved One: ${decedentLegalName || 'Loved One'}
• Current Resting Location: ${facilityName} (${facilityFloorRoom})
• Removal Readiness Status: ${
  removalReadiness === 'pending_hospital_release' 
    ? 'Pending Hospital / Attending Physician Release' 
    : removalReadiness === 'family_consultation_hold'
    ? 'Family Consultation First (Hold Removal)'
    : 'Ready for Immediate Transfer Dispatch'
}

=======================================================
WHAT TO BRING TO YOUR ARRANGEMENT CONFERENCE
=======================================================
Please gather the following items and documentation:

1. VITAL STATISTICS INFORMATION:
   ✓ Full Legal Name and Social Security Number
   ✓ Exact Date and Place of Birth (City, State / Country)
   ✓ Father's Full Name & Mother's Maiden Name
   ✓ Highest Level of Education Completed & Primary Occupation
   ✓ Military Veteran Discharge Papers (Form DD-214), if applicable

2. CLOTHING & PERSONAL ARTICLES:
   ✓ Full set of clothing including undergarments, stockings/socks, dress/suit, shoes
   ✓ Eyeglasses & jewelry instructions (specify if items stay on or return to family)
   ✓ Recent photograph for natural hairdressing and cosmetic reference

3. LEGAL, INSURANCE & CEMETERY RECORDS:
   ✓ Government-Issued Photo ID of Next of Kin / Authorized Informant
   ✓ Right to Control Remains Documentation (NYS PHL § 4201)
   ✓ Life Insurance Policy documents (if assigning proceeds for funeral costs)
   ✓ Existing Cemetery Deed / Crypt Certificate (if family owns a plot)

4. MEMORIAL PROGRAM & TRIBUTE MATERIALS:
   ✓ 25 to 50 family photographs for the 360° Digital Tribute Video and 4-Panel Bulletin
   ✓ List of surviving and predeceased family members for the official obituary

=======================================================
DIGITAL PRE-FILL & FAMILY PORTAL ACCESS
=======================================================
You may review or complete your vital statistics sheet online in advance:
• Online Pre-Fill: https://bentasfuneralhome.com/portal/pre-fill
• Confidential Family Portal: https://bentasfuneralhome.com/portal (PIN: 3995)

If you have any questions or need immediate assistance, our 24/7 Careline is always available at (212) 281-8850.

Warmly and with dignity,
Jason Benta & The Staff of Benta's Funeral Home
EST. 1928 • HARLEM, NYC`;

    navigator.clipboard.writeText(emailBody);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 3000);
  };

  // Submission handler
  const handleSubmit = (nextAction: 'open_removal' | 'open_appointment' | 'save_only') => {
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    const formData: FirstCallIntakeFormData = {
      callerName,
      callerRelationship,
      callerPhone,
      callerEmail: callerEmail || 'family@bentasfuneralhome.org',
      callerAddress,
      hasRightToControl,
      
      decedentLegalName,
      gender,
      dateOfBirth,
      dateOfDeath,
      isExpectedDeath,
      ssnLast4,
      maritalStatus,
      fatherName,
      motherMaidenName,
      residenceAddress,
      
      removalReadiness,
      removalReadinessNotes,
      
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
      
      scheduledAppointmentDate,
      scheduledAppointmentTime,
      scheduledAppointmentVenue,
      attendingFamilyCount,
      sendConfirmationEmail,
      sendConfirmationSms,
      
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
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-950 via-neutral-900 to-[#991b1b] text-white border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Universal Staff Intake Console
                </span>
                <span className="text-[10px] text-neutral-300 font-mono">
                  Incoming Family Phone Intake & Appointment Scheduler
                </span>
              </div>
              <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white tracking-wide">
                First Call Phone Intake, Vital Records & Arrangement Scheduler
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

        {/* 4-STEP WIZARD PROGRESS BAR */}
        <div className="bg-neutral-100 px-4 sm:px-6 py-2.5 border-b border-neutral-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0 text-xs font-semibold">
          {[
            { step: 1, title: '1. Phone Call & Vital Statistics', icon: PhoneCall },
            { step: 2, title: '2. Removal Readiness & Location', icon: Truck },
            { step: 3, title: '3. Appointment Scheduling', icon: Calendar },
            { step: 4, title: '4. Family Email & What-to-Bring Guide', icon: Mail }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step as any)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-[#991b1b] text-white shadow-xs font-bold'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.title}</span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-neutral-50/60 text-xs text-neutral-900 font-sans">
          
          {/* ======================================================== */}
          {/* STEP 1: PHONE CALL & VITAL STATISTICS (MATCHING SHEET)    */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Notice Banner */}
              <div className="bg-amber-50/90 border border-amber-300 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500 text-neutral-950 rounded-xl font-bold shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-amber-950 block text-xs">Universal Staff Call-In Protocol (NYS PHL § 4201):</strong>
                    <p className="text-[11px] text-amber-900 font-light">
                      Capture caller contact info and decedent vital statistics over the phone. All details pre-populate the Vital Records Sheet and the Family Arrangement Packet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informant & Caller Section */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h4 className="font-serif-title font-bold text-sm uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#991b1b]" />
                    <span>Caller & Authorized Informant (Right to Control Remains)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Captures Email for What-to-Bring Packet
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Caller / Informant Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Robert Vance"
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
                    <label className="block font-bold text-neutral-700 mb-1">Relationship to Deceased</label>
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
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Mobile Phone (for SMS Careline) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="(212) 555-0198"
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
                      Email Address (for What-to-Bring Packet) <span className="text-[#991b1b]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="robert.vance@example.com"
                      value={callerEmail}
                      onChange={(e) => {
                        setCallerEmail(e.target.value);
                        if (validationErrors.callerEmail) setValidationErrors(prev => ({ ...prev, callerEmail: '' }));
                      }}
                      className={`w-full bg-[#fbfbfd] border rounded-xl p-2.5 outline-none transition font-semibold ${
                        validationErrors.callerEmail ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 focus:border-[#991b1b]'
                      }`}
                    />
                    {validationErrors.callerEmail && (
                      <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{validationErrors.callerEmail}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Informant Home Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 125 W 138th St, Apt 4B, New York, NY 10030"
                      value={callerAddress}
                      onChange={(e) => setCallerAddress(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b] font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    id="rightToControlCheckbox"
                    checked={hasRightToControl}
                    onChange={(e) => setHasRightToControl(e.target.checked)}
                    className="w-4 h-4 accent-[#991b1b] cursor-pointer"
                  />
                  <label htmlFor="rightToControlCheckbox" className="text-[11px] text-amber-950 font-semibold cursor-pointer">
                    Caller certifies legal authority to control funeral arrangements under NYS Public Health Law § 4201.
                  </label>
                </div>
              </div>

              {/* Decedent Vital Statistics Section (Exact match to Vital Records Sheet) */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h4 className="font-serif-title font-bold text-sm uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#991b1b]" />
                    <span>Decedent Vital Statistics (Needed for Death Certificate & Removal)</span>
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    NYS DOH Form AP-47 / EDRS Pre-Fill
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-neutral-700 mb-1">
                      Full Legal Name of Deceased <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      value={decedentLegalName}
                      onChange={(e) => {
                        setDecedentLegalName(e.target.value);
                        if (validationErrors.decedentLegalName) setValidationErrors(prev => ({ ...prev, decedentLegalName: '' }));
                      }}
                      className={`w-full bg-[#fbfbfd] border rounded-xl p-2.5 font-bold text-sm outline-none transition ${
                        validationErrors.decedentLegalName ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 focus:border-[#991b1b]'
                      }`}
                    />
                    {validationErrors.decedentLegalName && (
                      <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{validationErrors.decedentLegalName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Sex / Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-semibold outline-none focus:border-[#991b1b]"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other / Non-Binary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">SSN (Last 4 Digits)</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="4819"
                      value={ssnLast4}
                      onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono font-bold outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Date of Passing</label>
                    <input
                      type="date"
                      value={dateOfDeath}
                      onChange={(e) => setDateOfDeath(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono font-bold outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as any)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-semibold outline-none focus:border-[#991b1b]"
                    >
                      <option value="widowed">Widowed</option>
                      <option value="married">Married</option>
                      <option value="single">Single / Never Married</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Last Residence Address</label>
                    <input
                      type="text"
                      placeholder="Harlem, New York, NY 10030"
                      value={residenceAddress}
                      onChange={(e) => setResidenceAddress(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Father's Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Arthur Vance Sr."
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Mother's Full Maiden Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mildred Hayes"
                      value={motherMaidenName}
                      onChange={(e) => setMotherMaidenName(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: REMOVAL READINESS & RESTING LOCATION TRIAGE       */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Removal Readiness Assessment Card */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h4 className="font-serif-title font-bold text-sm uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#991b1b]" />
                    <span>Removal Readiness Status (Is Loved One Ready for Removal?)</span>
                  </h4>
                  <span className="text-[10px] text-neutral-500">
                    Physical Transfer Coordination
                  </span>
                </div>

                {/* 4 Status Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Option 1: Pending Hospital / Doctor Release */}
                  <div
                    onClick={() => {
                      setRemovalReadiness('pending_hospital_release');
                      setRemovalReadinessNotes('Loved one is resting at facility. Removal pending physician/morgue clearance.');
                      setUrgency('pending_physician_release');
                    }}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                      removalReadiness === 'pending_hospital_release'
                        ? 'bg-amber-50/90 border-amber-600 shadow-md ring-2 ring-amber-200'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        🟡 Not Ready for Removal
                      </span>
                      {removalReadiness === 'pending_hospital_release' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-neutral-900 text-sm">
                        Pending Hospital / Doctor Release
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                        Loved one has died at the hospital/facility, but is <strong>NOT yet cleared</strong> for physical removal (e.g. physician certificate, autopsy, or morgue release pending).
                      </p>
                    </div>
                    <div className="text-[10px] text-amber-900 font-semibold pt-1 border-t border-amber-200/60">
                      ✓ Does NOT stall arrangement appointment booking
                    </div>
                  </div>

                  {/* Option 2: Family Arrangement Consultation First */}
                  <div
                    onClick={() => {
                      setRemovalReadiness('family_consultation_hold');
                      setRemovalReadinessNotes('Family requested in-person arrangement conference before initiating physical transport.');
                      setUrgency('scheduled_window');
                    }}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                      removalReadiness === 'family_consultation_hold'
                        ? 'bg-purple-50/90 border-purple-700 shadow-md ring-2 ring-purple-200'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        🟠 Family Consultation First
                      </span>
                      {removalReadiness === 'family_consultation_hold' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-neutral-900 text-sm">
                        Arrangement Consultation First (Hold Removal)
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                        Family wants to meet for the arrangement conference first to finalize details before authorizing physical removal from the facility.
                      </p>
                    </div>
                    <div className="text-[10px] text-purple-900 font-semibold pt-1 border-t border-purple-200/60">
                      ✓ Coordinates removal timing after arrangement conference
                    </div>
                  </div>

                  {/* Option 3: Ready for Immediate Removal Dispatch */}
                  <div
                    onClick={() => {
                      setRemovalReadiness('ready_immediate_removal');
                      setRemovalReadinessNotes('Facility release verified. Ready for immediate transport dispatch.');
                      setUrgency('stat_immediate');
                    }}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                      removalReadiness === 'ready_immediate_removal'
                        ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-200'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        🟢 Ready for Immediate Removal
                      </span>
                      {removalReadiness === 'ready_immediate_removal' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-neutral-900 text-sm">
                        Ready for Immediate Removal Dispatch
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                        Facility has released the decedent. First Call transfer van will be dispatched to secure physical custody immediately.
                      </p>
                    </div>
                    <div className="text-[10px] text-emerald-900 font-semibold pt-1 border-t border-emerald-200/60">
                      ✓ Instant custody logging & Safe Arrival tracking
                    </div>
                  </div>

                  {/* Option 4: Already in BFH Custody */}
                  <div
                    onClick={() => {
                      setRemovalReadiness('in_custody');
                      setRemovalReadinessNotes('Decedent safely arrived and resting at Benta Funeral Home.');
                    }}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                      removalReadiness === 'in_custody'
                        ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-200'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        🔵 Already in Custody
                      </span>
                      {removalReadiness === 'in_custody' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-neutral-900 text-sm">
                        Already in BFH Custody (630 St. Nicholas)
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                        Loved one is already safely present at Benta's Funeral Home. Focus directly on the upcoming arrangement conference.
                      </p>
                    </div>
                    <div className="text-[10px] text-blue-900 font-semibold pt-1 border-t border-blue-200/60">
                      ✓ Safe Arrival confirmed
                    </div>
                  </div>

                </div>
              </div>

              {/* Facility & Pickup Location Details */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h4 className="font-serif-title font-bold text-sm uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#991b1b]" />
                    <span>Facility / Hospital / Morgue Where Deceased is Resting</span>
                  </h4>
                  <select
                    value={selectedFacilityId}
                    onChange={handleFacilitySelect}
                    className="bg-neutral-50 border border-neutral-300 text-neutral-900 font-bold rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#991b1b]"
                  >
                    <option value="custom">🏠 Private Residence / Custom Facility</option>
                    <optgroup label="Tri-State Hospitals">
                      {TRI_STATE_HOSPITALS_DIRECTORY.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Nursing Homes & Hospices">
                      {TRI_STATE_NURSING_HOMES_DIRECTORY.map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Facility / Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={facilityName}
                      onChange={(e) => {
                        setFacilityName(e.target.value);
                        if (validationErrors.facilityName) setValidationErrors(prev => ({ ...prev, facilityName: '' }));
                      }}
                      className={`w-full bg-[#fbfbfd] border rounded-xl p-2.5 font-bold outline-none transition ${
                        validationErrors.facilityName ? 'border-red-500 bg-red-50/30' : 'border-neutral-300 focus:border-[#991b1b]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Floor / Room / Morgue Bay</label>
                    <input
                      type="text"
                      value={facilityFloorRoom}
                      onChange={(e) => setFacilityFloorRoom(e.target.value)}
                      placeholder="e.g. Pathology / Morgue Bay 2"
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Facility Address</label>
                    <input
                      type="text"
                      value={facilityAddress}
                      onChange={(e) => setFacilityAddress(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Facility Phone</label>
                    <input
                      type="tel"
                      value={facilityContactPhone}
                      onChange={(e) => setFacilityContactPhone(formatPhoneNumbersOnly(e.target.value))}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-mono outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Attending Physician / Certifier</label>
                    <input
                      type="text"
                      value={physicianName}
                      onChange={(e) => setPhysicianName(e.target.value)}
                      placeholder="Dr. Sarah Jenkins, MD"
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Removal Readiness Status Notes</label>
                    <input
                      type="text"
                      value={removalReadinessNotes}
                      onChange={(e) => setRemovalReadinessNotes(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: ARRANGEMENT APPOINTMENT SCHEDULING               */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h4 className="font-serif-title font-bold text-sm uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#991b1b]" />
                    <span>In-Person or Virtual Arrangement Conference Scheduler</span>
                  </h4>
                  <span className="text-[10px] text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    630 St. Nicholas Ave
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Appointment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={scheduledAppointmentDate}
                      onChange={(e) => setScheduledAppointmentDate(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold font-mono outline-none focus:border-[#991b1b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Appointment Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={scheduledAppointmentTime}
                      onChange={(e) => setScheduledAppointmentTime(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                    >
                      <option value="09:00 AM">09:00 AM (Morning Slot)</option>
                      <option value="10:00 AM">10:00 AM (Primary Morning)</option>
                      <option value="11:30 AM">11:30 AM (Midday Slot)</option>
                      <option value="01:00 PM">01:00 PM (Early Afternoon)</option>
                      <option value="02:30 PM">02:30 PM (Afternoon Slot)</option>
                      <option value="04:00 PM">04:00 PM (Late Afternoon)</option>
                      <option value="05:30 PM">05:30 PM (Evening Consultation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Meeting Venue / Suite</label>
                    <select
                      value={scheduledAppointmentVenue}
                      onChange={(e) => setScheduledAppointmentVenue(e.target.value)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-semibold outline-none focus:border-[#991b1b]"
                    >
                      <option value="630 St. Nicholas Ave - Arrangement Suite 1 (Ground Floor)">
                        Arrangement Suite 1 (Ground Floor)
                      </option>
                      <option value="630 St. Nicholas Ave - Arrangement Suite 2 (Executive Room)">
                        Arrangement Suite 2 (Executive Room)
                      </option>
                      <option value="Virtual Video Conference (Secure Zoom)">
                        Virtual Video Conference (Secure Zoom)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Lead Licensed Director</label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Expected Attending Family Members</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={attendingFamilyCount}
                        onChange={(e) => setAttendingFamilyCount(Number(e.target.value))}
                        className="w-24 bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold text-center outline-none focus:border-[#991b1b]"
                      />
                      <span className="text-neutral-500 text-xs">
                        Spokesperson: <strong>{callerName || 'Informant'}</strong> ({callerRelationship})
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Preliminary Service Type</label>
                    <select
                      value={dispositionType}
                      onChange={(e) => setDispositionType(e.target.value as any)}
                      className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-semibold outline-none focus:border-[#991b1b]"
                    >
                      <option value="full_cremation">Full Cremation with Chapel Viewing</option>
                      <option value="cremation_memorial">Cremation Memorial Service</option>
                      <option value="direct_cremation">Direct Cremation</option>
                      <option value="full_burial">Traditional Sanctuary Burial</option>
                      <option value="direct_burial">Direct Burial</option>
                    </select>
                  </div>
                </div>

                {/* Dispatch Toggles */}
                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendConfirmationEmail}
                        onChange={(e) => setSendConfirmationEmail(e.target.checked)}
                        className="w-4 h-4 accent-[#991b1b] rounded"
                      />
                      <span className="font-bold text-neutral-800">
                        📧 Send Email Confirmation Packet to <strong className="text-[#991b1b]">{callerEmail || 'Caller Email'}</strong>
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendConfirmationSms}
                        onChange={(e) => setSendConfirmationSms(e.target.checked)}
                        className="w-4 h-4 accent-[#991b1b] rounded"
                      />
                      <span className="font-bold text-neutral-800">
                        📱 Send Instant SMS Confirmation to <strong className="text-[#991b1b]">{callerPhone || 'Caller Phone'}</strong>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: EMAIL PACKET & "WHAT TO BRING" GUIDE PREVIEW      */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-lg bg-red-50 text-[#991b1b] flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900">
                      Family Confirmation & "What to Bring" Packet Preview
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Dispatched immediately to <strong className="text-[#991b1b]">{callerEmail || 'informant@example.com'}</strong> and SMS to <strong className="text-neutral-800">{callerPhone || '(212) 555-0198'}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyEmailText}
                    className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs transition border border-neutral-300 flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedEmailText ? '✓ Copied to Clipboard!' : 'Copy Email Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs transition border border-neutral-300 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Appointment Slip</span>
                  </button>
                </div>
              </div>

              {/* LIVE EMAIL RENDER CONTAINER */}
              <div className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
                
                {/* Brand Header */}
                <div className="border-b-2 border-[#991b1b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center space-x-3 justify-center sm:justify-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-serif-title font-bold text-xl border-2 border-amber-400/60 shadow-md">
                      BFH
                    </div>
                    <div>
                      <h3 className="font-serif-title font-bold text-xl text-[#991b1b]">
                        BENTA'S FUNERAL HOME
                      </h3>
                      <p className="text-[10px] text-[#b45309] font-bold uppercase tracking-widest">
                        Four Generations of Compassion & Dignity • EST. 1928
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-neutral-500 font-light">
                    <p className="font-semibold text-neutral-800">630 Saint Nicholas Avenue</p>
                    <p>New York, NY 10030</p>
                    <p className="text-[#991b1b] font-bold">24/7 Careline: (212) 281-8850</p>
                  </div>
                </div>

                {/* Email Salutation */}
                <div className="space-y-2 text-xs leading-relaxed text-neutral-700">
                  <p className="font-bold text-neutral-900 text-sm">
                    Dear {callerName || 'Family Representative'},
                  </p>
                  <p>
                    Thank you for calling Benta's Funeral Home. We extend our deepest sympathy to you and your loved ones on the passing of <strong className="text-neutral-900">{decedentLegalName || 'your beloved'}</strong>. We are honored to care for your family during this sacred time.
                  </p>
                </div>

                {/* Stately Appointment Card */}
                <div className="bg-gradient-to-br from-red-50/90 via-[#fffcf9] to-amber-50/90 border-2 border-red-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-red-200 pb-2">
                    <span className="font-serif-title font-bold text-xs uppercase tracking-wider text-[#991b1b] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#991b1b]" />
                      <span>Confirmed Arrangement Conference Details</span>
                    </span>
                    <span className="bg-[#991b1b] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Confirmed Appointment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Date & Time:</span>
                      <strong className="text-sm text-neutral-900 font-serif-title">
                        {new Date(scheduledAppointmentDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {scheduledAppointmentTime}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Location / Meeting Venue:</span>
                      <p className="text-neutral-900 font-semibold">{scheduledAppointmentVenue}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Lead Licensed Director:</span>
                      <p className="text-neutral-900 font-semibold">{assignedDirectorName} (NYS LFD Reg. #08850)</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Attending Family:</span>
                      <p className="text-neutral-900 font-semibold">{callerName} ({callerRelationship}) + {attendingFamilyCount - 1} Guests</p>
                    </div>
                  </div>
                </div>

                {/* Loved One Location & Removal Status Banner */}
                <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 ${
                  removalReadiness === 'pending_hospital_release'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : removalReadiness === 'family_consultation_hold'
                    ? 'bg-purple-50/90 border-purple-300 text-purple-950'
                    : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                }`}>
                  <div className={`p-2 rounded-xl text-white font-bold shrink-0 ${
                    removalReadiness === 'pending_hospital_release' ? 'bg-amber-600' : removalReadiness === 'family_consultation_hold' ? 'bg-purple-700' : 'bg-emerald-600'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold">
                      Current Resting Status: {facilityName} ({facilityFloorRoom})
                    </strong>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {removalReadiness === 'pending_hospital_release' && (
                        <span>Your loved one is currently resting safely at {facilityName}. Our direct transport team will coordinate release with the pathology/morgue desk once physician paperwork clears.</span>
                      )}
                      {removalReadiness === 'family_consultation_hold' && (
                        <span>As requested, physical removal will be coordinated immediately following our in-person arrangement conference.</span>
                      )}
                      {removalReadiness === 'ready_immediate_removal' && (
                        <span>Our transport crew has been dispatched to secure physical custody at {facilityName}.</span>
                      )}
                      {removalReadiness === 'in_custody' && (
                        <span>Your loved one is safely present at Benta's Funeral Home under our care.</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 4-PART "WHAT TO BRING" INTERACTIVE CHECKLIST              */}
                {/* ========================================================= */}
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 pb-1">
                    <h4 className="font-serif-title font-bold text-sm text-[#991b1b] uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>What to Bring to Your Arrangement Conference</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-light">
                      Please bring as many of the following items as possible to ensure seamless legal filings:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Item Category 1 */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                      <span className="font-bold text-[#991b1b] text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>1. Vital Records & State Statistics</span>
                      </span>
                      <ul className="text-[11px] text-neutral-700 space-y-1.5 list-disc list-inside">
                        <li>Full legal name and full Social Security Number</li>
                        <li>Exact date & city/state of birth</li>
                        <li>Father’s full name & Mother’s full maiden name</li>
                        <li>Highest education level & primary occupation/industry</li>
                        <li>Military Discharge papers (Form DD-214) if veteran</li>
                      </ul>
                    </div>

                    {/* Item Category 2 */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                      <span className="font-bold text-[#b45309] text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>2. Clothing, Grooming & Cosmetics</span>
                      </span>
                      <ul className="text-[11px] text-neutral-700 space-y-1.5 list-disc list-inside">
                        <li>Complete outfit from inside out (undergarments, suit/dress)</li>
                        <li>Shoes, stockings/socks, belt & accessories</li>
                        <li>Eyeglasses, rosaries, or masonic/veteran pins</li>
                        <li>Jewelry instructions (indicate if items stay or return)</li>
                        <li>Recent color photograph for natural hairstyling reference</li>
                      </ul>
                    </div>

                    {/* Item Category 3 */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                      <span className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>3. Legal, Insurance & Cemetery Deeds</span>
                      </span>
                      <ul className="text-[11px] text-neutral-700 space-y-1.5 list-disc list-inside">
                        <li>Government-issued photo ID of Next of Kin / Informant</li>
                        <li>NYS PHL § 4201 Right of Disposition paperwork</li>
                        <li>Life Insurance policies (for direct assignment/funding)</li>
                        <li>Existing Cemetery Deed / Plot certificate (if owned)</li>
                      </ul>
                    </div>

                    {/* Item Category 4 */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                      <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
                        <span>4. Memorial & Tribute Materials</span>
                      </span>
                      <ul className="text-[11px] text-neutral-700 space-y-1.5 list-disc list-inside">
                        <li>25 to 50 family photos for 360° Tribute & 4-panel program</li>
                        <li>Written list of surviving and predeceased family members</li>
                        <li>Special musical selections, scripture verses, or hymns</li>
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Action Links Buttons */}
                <div className="pt-2 border-t border-neutral-200 flex flex-wrap gap-3 items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#991b1b] text-white px-3.5 py-2 rounded-xl font-bold inline-flex items-center gap-1 shadow-xs">
                      <span>✓ Pre-Fill Vital Records Sheet Online</span>
                    </span>
                    <span className="bg-neutral-100 text-neutral-800 px-3.5 py-2 rounded-xl font-bold inline-flex items-center gap-1 border border-neutral-300">
                      <span>🔒 Access Family Vault (PIN: 3995)</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-500 italic">
                    Benta’s Funeral Home Careline: (212) 281-8850
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER: NAVIGATION & FINAL SUBMISSION */}
        <div className="px-6 py-4 bg-white border-t border-neutral-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          
          <div className="flex items-center space-x-2 text-neutral-500 text-xs">
            <Info className="w-4 h-4 text-[#991b1b]" />
            <span>Step {currentStep} of 4 • Case auto-generates with complete Golden Record.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep - 1) as any)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1) {
                    if (!validateForm()) return;
                  }
                  setCurrentStep((currentStep + 1) as any);
                }}
                className="px-5 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 border border-amber-400/40"
              >
                <span>Continue to {currentStep === 1 ? 'Removal Readiness' : currentStep === 2 ? 'Appointment' : 'Email Preview'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit('save_only')}
                  className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-bold rounded-xl text-xs transition shadow-2xs"
                >
                  Save to Hub Only
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit('open_appointment')}
                  className="px-5 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 border border-amber-400/40 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>Create Case & Dispatch Preparation Packet ➔</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
