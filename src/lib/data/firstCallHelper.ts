import { 
  GoldenRecordCase, 
  FirstCallIntakeFormData, 
  RemovalScheduleInfo, 
  ArrangementAppointmentInfo, 
  RemovalAffidavit,
  DocumentItem,
  DocumentStatus,
  CasePhase
} from '../types/funeral';
import { INITIAL_DOCUMENT_TEMPLATES } from './mockCases';
import { getDefaultStatementOfGoodsForCase } from './generalPriceList';

export function createCaseFromFirstCall(
  formData: FirstCallIntakeFormData,
  existingCasesCount: number
): GoldenRecordCase {
  const dateToday = new Date().toISOString().split('T')[0];
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const year = new Date().getFullYear();
  const caseNumber = `BFH-${year}-${String(existingCasesCount + 101).padStart(3, '0')}`;
  const caseId = `case-${Date.now()}`;

  // Determine initial phase and status based on pathway
  const isRemovalFirst = formData.intakePathway === 'unexpected_removal_first';
  const initialPhase: CasePhase = isRemovalFirst ? 'intake_removal' : 'arrangements';

  // Base decedent object with full vital statistics
  const decedent = {
    legalName: formData.decedentLegalName.trim(),
    gender: formData.gender,
    dateOfBirth: formData.dateOfBirth || '1950-01-01',
    dateOfDeath: formData.dateOfDeath || dateToday,
    placeOfDeath: `${formData.facilityName}${formData.facilityAddress ? ', ' + formData.facilityAddress : ''}`,
    facilityName: formData.facilityName,
    ssnMasked: formData.ssnLast4 ? `***-**-${formData.ssnLast4}` : 'XXX-XX-XXXX',
    maritalStatus: formData.maritalStatus || ('single' as const),
    residenceAddress: formData.residenceAddress || formData.callerAddress || 'Harlem, New York, NY',
    city: 'New York',
    state: 'NY',
    zipCode: '10030',
    veteran: false,
    occupation: 'Not Provided at Intake',
    industry: 'General',
    fatherName: formData.fatherName || 'Not Provided at Intake',
    motherMaidenName: formData.motherMaidenName || 'Not Provided at Intake'
  };

  // Base informant object
  const informant = {
    fullName: formData.callerName.trim(),
    relationship: formData.callerRelationship.trim() || 'Next of Kin / Informant',
    phone: formData.callerPhone.trim(),
    email: formData.callerEmail.trim() || 'informant@harlemfamily.org',
    address: formData.callerAddress.trim() || 'New York, NY',
    isNextOfKin: true,
    hasRightToControl: formData.hasRightToControl
  };

  // Base medical certifier
  const medicalCertifier = {
    physicianName: formData.physicianName.trim() || 'Attending Staff Physician, MD',
    licenseNumber: formData.physicianLicenseNumber?.trim() || 'NY-MED-PENDING',
    hospitalFacility: formData.facilityName || 'Mount Sinai Health System',
    phone: formData.physicianPhone?.trim() || formData.facilityContactPhone || '(212) 523-4000',
    edrsStatus: 'pending' as const
  };

  // Base service selections
  const serviceSelections = {
    dispositionType: formData.dispositionType,
    packageTitle: formData.dispositionType === 'full_burial'
      ? 'Traditional Harlem Sanctuary Burial Service'
      : formData.dispositionType === 'full_cremation'
      ? 'Full Traditional Cremation with Chapel Viewing'
      : formData.dispositionType === 'cremation_memorial'
      ? 'Cremation Memorial Service & Tribute Celebration'
      : formData.dispositionType === 'direct_burial'
      ? 'Direct Immediate Graveside Burial'
      : 'Direct Dignified Cremation',
    basePackagePrice: formData.dispositionType.includes('cremation') ? 4850 : 5950,
    casketOrUrnSelected: formData.dispositionType.includes('cremation') ? 'Cherry Veneer Hardwood Rental' : '18-Gauge Steel Gasketed Casket',
    casketPrice: 1450,
    viewingParlor: formData.viewingParlor,
    serviceVenueName: formData.viewingParlor === 'Church / External Venue' ? 'Harlem Sanctuary Church' : "Benta's Funeral Home Chapel",
    serviceDate: formData.targetServiceDate || '',
    crematoryOrCemeteryName: formData.dispositionType.includes('cremation') ? 'Woodlawn Cemetery & Crematory' : 'Woodlawn Cemetery',
    specialRequests: formData.specialInstructions || ''
  };

  // Initial Removal Schedule
  const removalAffidavit: RemovalAffidavit = {
    id: `aff-${Date.now()}`,
    caseId: caseId,
    caseNumber: caseNumber,
    affidavitNumber: `AFF-REM-${caseNumber.replace('BFH-', '')}`,
    decedentName: decedent.legalName,
    dateOfPassing: decedent.dateOfDeath,
    timeOfPassing: timeNow,
    placeOfPassing: formData.facilityName,
    facilityMrnOrTag: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
    assignedDirectorName: formData.assignedDirectorName,
    directorLicenseNumber: 'NYS LFD Reg. #08850',
    directorPhone: '(212) 281-8850',
    crewMembers: [formData.assignedDirectorName, 'Marcus Vance (Transport Specialist)'],
    vehicleId: 'BFH-1',
    vehiclePlate: 'BFH-CUSTODY-1',
    informantName: informant.fullName,
    informantRelation: informant.relationship,
    informantPhone: informant.phone,
    informantAddress: informant.address,
    authorizationType: 'Digital Portal eSign',
    authorizationTimestamp: `${dateToday} ${timeNow}`,
    facilityName: formData.facilityName,
    facilityAddress: formData.facilityAddress,
    facilityFloorRoom: formData.facilityFloorRoom,
    releasingAttendantName: formData.morgueAttendantOrNurse || 'Morgue Custodial Officer',
    releasingAttendantTitle: 'Pathology & Morgue Custodial Attendant',
    custodyReleaseTimestamp: `${dateToday} ${timeNow}`,
    bodyTagConfirmed: true,
    tagNumber: `NYC-TAG-${Math.floor(10000 + Math.random() * 90000)}`,
    weightCategory: 'Standard (< 250 lbs)',
    equipmentUsed: formData.specialEquipment,
    personalEffects: [
      {
        id: `pe-init-1`,
        category: 'Documents / ID',
        description: 'Personal identification & intake custody records',
        releasedBy: formData.morgueAttendantOrNurse || 'Facility Attendant',
        custodyReceived: true
      }
    ],
    personalEffectsTotalCount: 1,
    status: 'draft'
  };

  const removalSchedule: RemovalScheduleInfo = {
    id: `rem-${Date.now()}`,
    caseId: caseId,
    status: formData.removalReadiness === 'ready_immediate_removal' ? 'dispatched_en_route' : 'pending_dispatch',
    locationType: formData.locationType,
    facilityName: formData.facilityName,
    facilityAddress: formData.facilityAddress,
    facilityFloorRoom: formData.facilityFloorRoom,
    facilityContactPhone: formData.facilityContactPhone,
    morgueAttendantOrNurse: formData.morgueAttendantOrNurse || 'Staff Nurse / Morgue Officer',
    urgency: formData.urgency,
    targetCallTime: formData.removalReadiness === 'ready_immediate_removal' ? 'Immediate First Call (Within 45 Mins)' : 'Scheduled Upon Facility Release',
    estimatedArrivalMinutes: 35,
    assignedDirector: formData.assignedDirectorName,
    directorLicenseNumber: 'NYS LFD Reg. #08850',
    directorPhone: '(212) 281-8850',
    secondaryCrewMember: 'Marcus Vance (Transport Specialist)',
    vehicleType: 'First Call Custom Van (BFH-1)',
    vehiclePlate: 'BFH-CUSTODY-1',
    specialEquipment: formData.specialEquipment,
    specialInstructions: formData.specialInstructions || (
      formData.removalReadiness === 'pending_hospital_release' 
        ? 'Loved one resting at facility. Removal pending physician/morgue clearance.' 
        : formData.removalReadiness === 'family_consultation_hold'
        ? 'Family consultation first. Transfer to be scheduled following conference.'
        : 'Direct hospital/facility intake. Custody authorized by Informant under NYS PHL § 4201.'
    ),
    directorSmsDispatched: formData.removalReadiness === 'ready_immediate_removal',
    facilitySmsDispatched: formData.removalReadiness === 'ready_immediate_removal',
    familySmsDispatched: formData.sendConfirmationSms ?? true,
    affidavit: removalAffidavit
  };

  const apptDate = formData.scheduledAppointmentDate || dateToday;
  const apptTime = formData.scheduledAppointmentTime || '10:00 AM';
  const apptVenue = formData.scheduledAppointmentVenue || '630 St. Nicholas Ave - Arrangement Suite 1';

  // Initial Arrangement Appointment
  const arrangementAppointment: ArrangementAppointmentInfo = {
    id: `appt-${Date.now()}`,
    caseId: caseId,
    caseNumber: caseNumber,
    decedentName: decedent.legalName,
    informantName: informant.fullName,
    informantPhone: informant.phone,
    informantEmail: informant.email,
    status: formData.scheduledAppointmentDate ? 'confirmed' : 'proposed_options_sent',
    meetingFormat: apptVenue.includes('Virtual') ? 'virtual_video' : 'in_person_office',
    locationVenue: apptVenue,
    assignedDirectorName: formData.assignedDirectorName,
    assignedDirectorPhone: '(212) 281-8850',
    assignedDirectorEmail: 'directors@bentasfuneralhome.com',
    confirmedSlot: formData.scheduledAppointmentDate ? {
      date: apptDate,
      dateLabel: new Date(apptDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      time: apptTime,
      durationMinutes: 90
    } : undefined,
    confirmedAt: formData.scheduledAppointmentDate ? `${dateToday} ${timeNow}` : undefined,
    proposedSlots: [
      {
        id: `slot-${Date.now()}-1`,
        date: apptDate,
        dateLabel: new Date(apptDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: apptTime,
        durationMinutes: 90,
        isAvailable: true,
        selectedByFamily: true
      },
      {
        id: `slot-${Date.now()}-2`,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        dateLabel: `Tomorrow (${new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`,
        time: '02:00 PM',
        durationMinutes: 90,
        isAvailable: true,
        selectedByFamily: false
      }
    ],
    attendingFamilyCount: formData.attendingFamilyCount || 2,
    attendingFamilyNames: [informant.fullName],
    invitationChannel: 'both',
    invitationSentAt: `${dateToday} ${timeNow}`,
    smsConfirmationSent: formData.sendConfirmationSms ?? true,
    emailConfirmationSent: formData.sendConfirmationEmail ?? true
  };

  // Documents
  const documents: DocumentItem[] = INITIAL_DOCUMENT_TEMPLATES.map(doc => {
    let status: DocumentStatus = 'pending';
    if (doc.id === 'doc-1') status = 'completed'; // Vital records captured in First Call
    if (doc.id === 'doc-3' && formData.hasRightToControl) status = 'signed';
    return {
      ...doc,
      status,
      lastUpdated: `${dateToday} ${timeNow}`
    };
  });

  // Partial draft case for Statement of Goods calculator
  const draftCase: GoldenRecordCase = {
    id: caseId,
    caseNumber: caseNumber,
    createdAt: new Date().toISOString(),
    currentPhase: initialPhase,
    dispositionType: formData.dispositionType,
    safeArrivalStatus: formData.removalReadiness === 'in_custody' ? 'safe_arrival_confirmed' : 'pending_removal',
    removalReadiness: formData.removalReadiness,
    removalReadinessNotes: formData.removalReadinessNotes,
    assignedDirector: formData.assignedDirectorName,
    assignedDirectorId: formData.assignedDirectorId,
    caseClaimStatus: 'claimed',
    appointmentScheduled: Boolean(formData.scheduledAppointmentDate),
    appointmentDate: apptDate,
    appointmentTime: apptTime,
    decedent,
    informant,
    medicalCertifier,
    serviceSelections,
    documents,
    splitBilling: [
      {
        id: `split-${Date.now()}-1`,
        payerType: 'Family ACH Direct',
        payerName: informant.fullName,
        payerEmail: informant.email,
        payerPhone: informant.phone,
        relationshipToDecedent: informant.relationship,
        amountAllocated: 3500,
        amountPaid: 0,
        status: 'pending_verification',
        itemAssigned: 'Primary Funeral & Professional Services'
      }
    ],
    totalAmountDue: 7450,
    totalPaid: 0,
    aftercare: [],
    removalSchedule,
    arrangementAppointment,
    intakePathway: formData.intakePathway,
    firstCallNotes: formData.specialInstructions || '',
    notes: [
      {
        id: `note-${Date.now()}`,
        author: 'Staff Phone Intake & Appointment Desk',
        timestamp: timeNow,
        text: `Intake phone call captured by staff. Caller: ${informant.fullName} (${informant.relationship}, ${informant.phone}, ${informant.email}). Decedent: ${decedent.legalName}. Resting at: ${formData.facilityName}. Removal Readiness: ${
          formData.removalReadiness === 'pending_hospital_release'
            ? '🟡 PENDING HOSPITAL/DOCTOR RELEASE (Not ready for physical removal yet)'
            : formData.removalReadiness === 'family_consultation_hold'
            ? '🟠 FAMILY ARRANGEMENT FIRST (Hold removal until conference)'
            : formData.removalReadiness === 'ready_immediate_removal'
            ? '🟢 READY FOR IMMEDIATE REMOVAL DISPATCH'
            : '🔵 IN BFH CUSTODY'
        }. Appointment scheduled for ${apptDate} at ${apptTime} (${apptVenue}). What-to-Bring preparation packet dispatched to ${informant.email}.`
      }
    ]
  };

  // Compile official Form AP-47 Statement of Goods
  const statementOfGoods = getDefaultStatementOfGoodsForCase(draftCase);
  draftCase.statementOfGoods = statementOfGoods;
  draftCase.totalAmountDue = statementOfGoods.sectionIII.totalFuneralCharges;

  return draftCase;
}
