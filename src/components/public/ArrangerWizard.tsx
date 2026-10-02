import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  ShieldCheck, 
  Calendar, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Phone, 
  UserCheck, 
  Lock 
} from 'lucide-react';
import { DispositionType, GoldenRecordCase } from '../../lib/types/funeral';
import { INITIAL_DOCUMENT_TEMPLATES } from '../../lib/data/mockCases';
import { getDefaultStatementOfGoodsForCase } from '../../lib/data/generalPriceList';

interface ArrangerWizardProps {
  onClose: () => void;
  onCaseCreated: (newCase: GoldenRecordCase) => void;
  initialService?: string;
}

export const ArrangerWizard: React.FC<ArrangerWizardProps> = ({
  onClose,
  onCaseCreated,
  initialService = 'cremation_memorial'
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdCaseNumber, setCreatedCaseNumber] = useState<string>('');
  
  // Step 1: Vital Records Sheet (Decedent Info)
  const [decedentName, setDecedentName] = useState('');
  const [decedentGender, setDecedentGender] = useState<'male' | 'female'>('female');
  const [decedentDob, setDecedentDob] = useState('');
  const [decedentDod, setDecedentDod] = useState('');
  const [placeOfDeath, setPlaceOfDeath] = useState('Mount Sinai Morningside Hospital (411 W 114th St, NYC)');
  const [floorOrRoom, setFloorOrRoom] = useState('Pathology / Morgue Bay 2');
  const [ssnLast4, setSsnLast4] = useState('4819');
  const [residence, setResidence] = useState('Harlem, New York, NY 10030');
  const [maritalStatus, setMaritalStatus] = useState<'married' | 'widowed' | 'single' | 'divorced'>('widowed');
  const [isVeteran] = useState(false);
  const [occupation] = useState('Educator & Community Advocate');
  const [fatherName, setFatherName] = useState('Arthur Vance Sr.');
  const [motherMaidenName, setMotherMaidenName] = useState('Mildred Hayes');

  // Step 1: Informant / Next of Kin
  const [informantName, setInformantName] = useState('Robert Vance');
  const [informantRelation, setInformantRelation] = useState('Spouse');
  const [informantPhone, setInformantPhone] = useState('(212) 555-0198');
  const [informantEmail, setInformantEmail] = useState('robert.vance@example.com');

  // Step 1: Medical Certifier
  const [physicianName] = useState('Dr. Marcus Sterling, MD');
  const [hospitalPhone] = useState('(212) 523-4000');

  // Step 2: Service Preference & Arrangement Appointment Request
  const [disposition, setDisposition] = useState<DispositionType>(
    (initialService === 'full_cremation' || initialService === 'cremation_memorial' || initialService === 'direct_cremation' || initialService === 'full_burial' || initialService === 'direct_burial')
      ? (initialService as DispositionType)
      : 'cremation_memorial'
  );
  const [appointmentFormat, setAppointmentFormat] = useState<'in_person_office' | 'virtual_video'>('in_person_office');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-05');
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('10:00 AM');
  const [familyNotes, setFamilyNotes] = useState('We would like to review the 360 Digital Tribute options and memorial programs during our appointment.');

  // Pricing Calculation
  const basePrices: Record<DispositionType, number> = {
    direct_cremation: 1995,
    cremation_memorial: 3195,
    full_cremation: 4850,
    direct_burial: 2750,
    full_burial: 5950,
    pre_need: 3500
  };

  const currentBasePrice = basePrices[disposition] || 3195;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCaseId = `case-${Date.now()}`;
    const newCaseNumber = `BFH-2026-09${Math.floor(Math.random() * 90 + 10)}`;
    setCreatedCaseNumber(newCaseNumber);

    const newCase: GoldenRecordCase = {
      id: newCaseId,
      caseNumber: newCaseNumber,
      createdAt: new Date().toISOString(),
      currentPhase: 'intake_removal',
      dispositionType: disposition,
      safeArrivalStatus: 'pending_removal',
      assignedDirector: 'Jason Benta (Licensed Funeral Director in Charge)',
      decedent: {
        legalName: decedentName || 'Eleanor Vance',
        gender: decedentGender,
        dateOfBirth: decedentDob || '1948-03-14',
        dateOfDeath: decedentDod || new Date().toISOString().split('T')[0],
        placeOfDeath: placeOfDeath,
        ssnMasked: `XXX-XX-${ssnLast4 || '4819'}`,
        maritalStatus: maritalStatus,
        residenceAddress: residence || 'Harlem, New York, NY 10030',
        city: 'New York',
        state: 'NY',
        zipCode: '10030',
        veteran: isVeteran,
        occupation: occupation || 'Educator & Community Leader',
        industry: 'Education & Community Service',
        fatherName: fatherName || 'Father',
        motherMaidenName: motherMaidenName || 'Mother',
        facilityName: placeOfDeath
      },
      informant: {
        fullName: informantName || 'Robert Vance',
        relationship: informantRelation,
        phone: informantPhone || '(212) 555-0198',
        email: informantEmail || 'family@harlem.org',
        address: residence || 'Harlem, New York, NY 10030',
        isNextOfKin: true,
        hasRightToControl: true
      },
      medicalCertifier: {
        physicianName: physicianName || 'Attending Physician, MD',
        licenseNumber: 'NY-MED-992019',
        hospitalFacility: placeOfDeath,
        phone: hospitalPhone || '(212) 523-4000',
        edrsStatus: 'pending'
      },
      // Automatically port appointment details to Arrangement Schedule Queue
      arrangementAppointment: {
        id: `appt-${Date.now()}`,
        caseId: newCaseId,
        caseNumber: newCaseNumber,
        decedentName: decedentName || 'Eleanor Vance',
        informantName: informantName,
        informantPhone: informantPhone,
        informantEmail: informantEmail,
        status: 'proposed_options_sent',
        assignedDirectorName: 'Jason Benta, LFD #08850',
        assignedDirectorPhone: '(212) 281-8850',
        meetingFormat: appointmentFormat,
        locationVenue: appointmentFormat === 'in_person_office' 
          ? "Benta's Arrangement Suite A (630 Saint Nicholas Ave)"
          : "Secure BFH Virtual Video Conference",
        proposedSlots: [
          {
            id: `slot-req-${Date.now()}`,
            date: appointmentDate,
            dateLabel: `Requested: ${appointmentDate}`,
            time: appointmentTimeSlot,
            durationMinutes: 90,
            isAvailable: true,
            selectedByFamily: true
          }
        ],
        attendingFamilyCount: 2,
        invitationChannel: 'both',
        invitationSentAt: new Date().toISOString(),
        smsConfirmationSent: true,
        emailConfirmationSent: true,
        specialAccommodationsNotes: familyNotes
      },
      // Automatically port vital records to Removal Queue
      removalSchedule: {
        id: `rem-${Date.now()}`,
        caseId: newCaseId,
        status: 'pending_dispatch',
        locationType: 'hospital_morgue',
        facilityName: placeOfDeath,
        facilityAddress: '411 W 114th St, New York, NY 10025',
        facilityFloorRoom: floorOrRoom,
        facilityContactPhone: hospitalPhone,
        morgueAttendantOrNurse: 'Hospital Morgue Administrator',
        urgency: 'stat_immediate',
        targetCallTime: 'Within 45 Mins',
        estimatedArrivalMinutes: 30,
        assignedDirector: 'Jason Benta, LFD',
        directorLicenseNumber: 'NYS LFD #08850',
        directorPhone: '(212) 281-8850',
        secondaryCrewMember: 'Marcus Vance (Mortuary Transport)',
        vehicleType: 'First Call Custom Van (BFH-1)',
        vehiclePlate: 'BFH-CUSTODY-1',
        specialEquipment: [
          'Mortuary Cot & Transfer Pouch',
          'Tamper-Evident Personal Effects Bag',
          'NYS PHL § 4201 Release Verification'
        ],
        specialInstructions: `Release authorized by ${informantName} (${informantRelation}). Ported from Vital Records Intake.`,
        directorSmsDispatched: true,
        facilitySmsDispatched: false,
        familySmsDispatched: true
      },
      serviceSelections: {
        dispositionType: disposition,
        packageTitle: disposition === 'full_cremation' 
          ? 'Funeral Service with Cremation'
          : disposition === 'cremation_memorial'
          ? 'Cremation and Memorial Service'
          : disposition === 'full_burial'
          ? 'Traditional Service and Burial'
          : disposition === 'direct_cremation'
          ? 'Direct Cremation'
          : 'Direct Earth Burial',
        basePackagePrice: currentBasePrice,
        casketOrUrnSelected: disposition.includes('cremation') ? 'Handcrafted Solid Bronze Urn' : 'The St. Nicholas Heritage Casket',
        casketPrice: 0,
        viewingParlor: 'Parlor A (Seats 120)',
        crematoryOrCemeteryName: disposition.includes('cremation') 
          ? 'Woodlawn Crematory (Bronx, NY)'
          : 'Woodlawn Cemetery (Bronx, NY)'
      },
      documents: INITIAL_DOCUMENT_TEMPLATES,
      splitBilling: [
        {
          payerType: 'Cash / Certified Bank Check',
          providerName: "In-Person Arrangement Conference (Benta's 630 St. Nicholas Ave)",
          amountAllocated: currentBasePrice,
          status: 'pending_verification',
          notes: "Final Statement of Goods to be executed during appointment with Funeral Director."
        }
      ],
      totalAmountDue: currentBasePrice,
      totalPaid: 0,
      aftercare: [
        {
          id: `ac-${Date.now()}`,
          milestoneTitle: 'Day 7 Family Wellness & Keepsake Delivery',
          triggerDaysPostService: 7,
          targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'scheduled',
          templateName: 'Harlem Grief & Resilience Outreach'
        }
      ],
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Pre-Arrangement Vital Records Intake',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Vital Records completed by ${informantName} (${informantRelation}). Information ported to Removal Queue & Arrangement Schedule Queue for ${appointmentDate} at ${appointmentTimeSlot}.`
        }
      ]
    };
    
    // Generate base statement of goods for review during conference
    newCase.statementOfGoods = getDefaultStatementOfGoodsForCase(newCase);

    onCaseCreated(newCase);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-neutral-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="mb-6 pb-4 border-b border-neutral-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs text-[#991b1b] font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-[#b45309]" />
              <span>Pre-Arrangement Vital Records Intake & Appointment Request</span>
            </div>
            <span className="bg-red-50 text-[#991b1b] border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              NYS PHL § 4201 Standard
            </span>
          </div>

          <h2 className="font-serif-title text-2xl font-bold text-neutral-900 mt-1.5">
            Vital Records Sheet & Director Arrangement Scheduling
          </h2>

          <div className="mt-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
            <ShieldCheck className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Family Notice:</strong> In accordance with NYS funeral law, binding funeral arrangements are finalized with a licensed Funeral Director during your scheduled appointment. 
              Completing this Vital Records Sheet in advance allows us to prepare legal removal documents, reserve chapel space, and port your information directly into our Care Coordination queues.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUCCESS / PORTED CONFIRMATION SCREEN                     */}
        {/* ======================================================== */}
        {isSubmitted ? (
          <div className="py-6 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <div className="space-y-1.5">
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                VITAL RECORDS PORTED & QUEUED
              </span>
              <h3 className="font-serif-title text-2xl font-bold text-neutral-900">
                Case {createdCaseNumber} Successfully Initialized
              </h3>
              <p className="text-xs text-neutral-600 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{informantName}</strong>. Your Vital Records information has been transmitted to our Care Coordination & Removal Team.
              </p>
            </div>

            {/* Dual-Porting Confirmation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto text-xs">
              
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-[#991b1b] font-bold">
                  <Truck className="w-4 h-4 text-[#991b1b]" />
                  <span>1. Removal Logistics Queue</span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Release documents pre-filled for <strong>{placeOfDeath}</strong>. Transfer specialists dispatched under Director Jason Benta's supervision.
                </p>
                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                  ✓ Removal Documents Pre-Populated
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-[#991b1b] font-bold">
                  <Calendar className="w-4 h-4 text-[#b45309]" />
                  <span>2. Arrangement Schedule Queue</span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Requested appointment: <strong>{appointmentDate} at {appointmentTimeSlot}</strong> ({appointmentFormat === 'in_person_office' ? 'In-Person at 630 St. Nicholas Ave' : 'Virtual Video'}).
                </p>
                <div className="text-[10px] text-[#991b1b] font-bold bg-red-50 px-2 py-1 rounded border border-red-200 inline-block">
                  ✓ Director Consultation Reserved
                </div>
              </div>

            </div>

            {/* Family Portal Access Notice */}
            <div className="max-w-2xl mx-auto p-4 bg-[#faf7f2] border border-[#e6dac1] rounded-2xl text-left space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#af893e] font-bold">
                <Lock className="w-4 h-4" />
                <span>Family Portal PIN Generation & Guidance</span>
              </div>
              <p className="text-[11px] text-[#69635b] leading-relaxed">
                During your arrangement appointment, your licensed Funeral Director will finalize your Statement of Goods, generate your private <strong>Family Security PIN</strong>, and walk you through the <strong>360 Digital Tribute Studio</strong>, <strong>Keepsake Coffee Table Edition</strong>, and <strong>Floral Shop</strong>.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md transition cursor-pointer border border-amber-300/40"
              >
                Done • Return to Benta's Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* Step Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  step === 1 ? 'bg-white text-[#991b1b] shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Vital Records Information Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  step === 2 ? 'bg-white text-[#991b1b] shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>2. Service Preference & Appointment</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* STEP 1: VITAL RECORDS INFORMATION SHEET                  */}
            {/* ======================================================== */}
            {step === 1 && (
              <div className="space-y-5">
                
                {/* Decedent Vital Details */}
                <div className="space-y-3 bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                    <UserCheck className="w-4 h-4 text-[#991b1b]" />
                    <span>Decedent Vital Statistics (Needed for Death Certificate & Removal)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-700 mb-1">Full Legal Name of Deceased *</label>
                      <input
                        type="text"
                        required
                        value={decedentName}
                        onChange={(e) => setDecedentName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Sex *</label>
                      <select
                        value={decedentGender}
                        onChange={(e) => setDecedentGender(e.target.value as any)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={decedentDob}
                        onChange={(e) => setDecedentDob(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Date of Passing (or recent) *</label>
                      <input
                        type="date"
                        required
                        value={decedentDod}
                        onChange={(e) => setDecedentDod(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">SSN (Last 4 Digits) *</label>
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={ssnLast4}
                        onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 4819"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 font-mono text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Hospital / Facility where Deceased is Resting *</label>
                      <input
                        type="text"
                        required
                        value={placeOfDeath}
                        onChange={(e) => setPlaceOfDeath(e.target.value)}
                        placeholder="e.g. Mount Sinai Morningside Hospital"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Floor / Room / Morgue Bay</label>
                      <input
                        type="text"
                        value={floorOrRoom}
                        onChange={(e) => setFloorOrRoom(e.target.value)}
                        placeholder="e.g. Pathology / Morgue Bay 2"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-700 mb-1">Last Residence Address *</label>
                      <input
                        type="text"
                        required
                        value={residence}
                        onChange={(e) => setResidence(e.target.value)}
                        placeholder="e.g. 630 Saint Nicholas Ave, Harlem, NY 10030"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Marital Status</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value as any)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      >
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="never_married">Never Married</option>
                        <option value="divorced">Divorced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Father's Full Name</label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="e.g. Arthur Vance Sr."
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Mother's Maiden Name</label>
                      <input
                        type="text"
                        value={motherMaidenName}
                        onChange={(e) => setMotherMaidenName(e.target.value)}
                        placeholder="e.g. Mildred Hayes"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                  </div>
                </div>

                {/* Informant / Next of Kin */}
                <div className="space-y-3 bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                    <Phone className="w-4 h-4 text-[#b45309]" />
                    <span>Informant & Authorized Next of Kin (Right to Control Remains)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Your Full Name (Next of Kin) *</label>
                      <input
                        type="text"
                        required
                        value={informantName}
                        onChange={(e) => setInformantName(e.target.value)}
                        placeholder="e.g. Robert Vance"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Relationship to Deceased *</label>
                      <input
                        type="text"
                        required
                        value={informantRelation}
                        onChange={(e) => setInformantRelation(e.target.value)}
                        placeholder="e.g. Spouse / Son / Daughter"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Mobile Phone Number (for SMS Careline & Portal PIN) *</label>
                      <input
                        type="tel"
                        required
                        value={informantPhone}
                        onChange={(e) => setInformantPhone(e.target.value)}
                        placeholder="(212) 555-0198"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={informantEmail}
                        onChange={(e) => setInformantEmail(e.target.value)}
                        placeholder="robert.vance@example.com"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer border border-amber-300/40"
                  >
                    <span>Proceed to Service & Appointment Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 2: SERVICE PREFERENCE & APPOINTMENT SCHEDULING      */}
            {/* ======================================================== */}
            {step === 2 && (
              <div className="space-y-5">
                
                {/* Service Type Selection */}
                <div className="space-y-3 bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                    <Sparkles className="w-4 h-4 text-[#991b1b]" />
                    <span>Select Preferred Service Category (To be finalized during appointment)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'cremation_memorial',
                        title: 'Cremation & Memorial Service',
                        price: '$3,195',
                        desc: 'Chapel celebration with 360 Digital Tribute, keepsake volume, and staff supervision.'
                      },
                      {
                        id: 'full_cremation',
                        title: 'Funeral Service with Cremation',
                        price: '$4,850',
                        desc: 'Full visitation & funeral ceremony in Chapel with ceremonial casket, followed by cremation.'
                      },
                      {
                        id: 'full_burial',
                        title: 'Traditional Service & Earth Burial',
                        price: '$5,950',
                        desc: 'Full church/chapel ceremony, hearse cortege, limousine escort, and cemetery committal.'
                      },
                      {
                        id: 'direct_cremation',
                        title: 'Direct Cremation',
                        price: '$1,995',
                        desc: 'Direct transfer and cremation with return of urn to family.'
                      }
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => setDisposition(item.id as DispositionType)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          disposition === item.id
                            ? 'bg-red-50/90 border-[#991b1b] ring-2 ring-[#991b1b]/20 shadow-xs'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-xs font-bold text-neutral-900">{item.title}</strong>
                          <span className="text-[#991b1b] font-bold">{item.price}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrangement Appointment Scheduler */}
                <div className="space-y-3 bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                    <Calendar className="w-4 h-4 text-[#b45309]" />
                    <span>Request Arrangement Conference Appointment with Funeral Director</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Meeting Format *</label>
                      <select
                        value={appointmentFormat}
                        onChange={(e) => setAppointmentFormat(e.target.value as any)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      >
                        <option value="in_person_office">In-Person (630 St. Nicholas Ave)</option>
                        <option value="virtual_video">Virtual Video Conference</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Preferred Time *</label>
                      <select
                        value={appointmentTimeSlot}
                        onChange={(e) => setAppointmentTimeSlot(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 outline-none focus:border-[#991b1b]"
                      >
                        <option value="10:00 AM">10:00 AM (Morning Slot)</option>
                        <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                        <option value="05:00 PM">05:00 PM (Late Afternoon Slot)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Notes for Funeral Director / Special Family Accommodations</label>
                    <textarea
                      rows={2}
                      value={familyNotes}
                      onChange={(e) => setFamilyNotes(e.target.value)}
                      placeholder="e.g. Bringing family photos, requesting specific hymn, veteran military honors..."
                      className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>

                {/* Submit & Dual-Port Action */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Vital Records</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer border border-amber-300/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Submit Vital Records & Port to Queues</span>
                  </button>
                </div>

              </div>
            )}

          </form>
        )}

      </div>
    </div>
  );
};
