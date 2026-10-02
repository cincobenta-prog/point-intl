import { 
  GoldenRecordCase, 
  DocumentItem, 
  FacilityRoom, 
  RoomScheduleEvent, 
  SimulatedNotification, 
  VehicleHoldRequest,
  ServicePartnerContact,
  PartnerScheduleRequest,
  CaseFlightPhaseProgress,
  DirectorProfile,
  ServiceDirectorAssignment,
  Director1099Voucher
} from '../types/funeral';
import { getDefaultStatementOfGoodsForCase } from './generalPriceList';

export const INITIAL_DOCUMENT_TEMPLATES: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Vital Record Information',
    formType: 'vital_records',
    phase: 'intake_removal',
    triggerTiming: 'Initial Intake',
    destinationRecipient: 'Next of Kin / Informant',
    deliveryMethod: 'Digital Portal',
    status: 'completed',
    followUpAction: 'NYC EDRS Vital Statistics data capture & informant verification',
    lastUpdated: '2026-09-18 10:15 AM'
  },
  {
    id: 'doc-2',
    name: "NYC Dept of Hospitals - Funeral Director's Statement of Authority",
    formType: 'nyc_authority',
    phase: 'intake_removal',
    triggerTiming: 'At Removal / Pickup',
    destinationRecipient: 'Hospital / Health Care Facility',
    deliveryMethod: 'Physical/PDF',
    status: 'completed',
    followUpAction: 'Release of death certificate and physical custody of remains',
    lastUpdated: '2026-09-18 10:45 AM'
  },
  {
    id: 'doc-3',
    name: 'Engagement of Services & Financial Responsibility Affidavit',
    formType: 'engagement_financial',
    phase: 'intake_removal',
    triggerTiming: 'Upon Removal Authorization',
    destinationRecipient: 'Next of Kin / Person Engaging',
    deliveryMethod: 'eSign Portal',
    status: 'completed',
    followUpAction: 'Financial engagement binding & removal custody jurat',
    lastUpdated: '2026-09-18 11:30 AM'
  },
  {
    id: 'doc-4',
    name: 'Safe Arrival Confirmation & Custody Receipt',
    formType: 'general_document',
    phase: 'intake_removal',
    triggerTiming: 'Upon arrival at 630 St Nicholas',
    destinationRecipient: 'Next of Kin (NOK)',
    deliveryMethod: 'Email/SMS',
    status: 'completed',
    followUpAction: 'Immediate peace of mind for family upon arrival at BFH',
    lastUpdated: '2026-09-18 12:00 PM'
  },
  {
    id: 'doc-5',
    name: 'Itemization of Funeral Services & Merchandise Selected (Statement of Goods & Services)',
    formType: 'statement_goods_services',
    phase: 'arrangements',
    triggerTiming: 'Arrangement Conference',
    destinationRecipient: 'Next of Kin (NOK)',
    deliveryMethod: 'eSign Portal',
    status: 'generated',
    followUpAction: 'FTC General Price List compliance & itemized charge agreement',
    lastUpdated: '2026-09-18 01:15 PM'
  },
  {
    id: 'doc-6',
    name: 'Clothing Transmittal Form',
    formType: 'clothing_transmittal',
    phase: 'arrangements',
    triggerTiming: 'Garment Delivery',
    destinationRecipient: 'Preparation Suite / Hairdresser',
    deliveryMethod: 'Physical/PDF',
    status: 'generated',
    followUpAction: 'Log 12 clothing items, casket specs, and hairdresser assignment',
    lastUpdated: '2026-09-18 01:45 PM'
  },
  {
    id: 'doc-7',
    name: 'Client Production Package Overview (DVD, Programs, Prayer Cards)',
    formType: 'client_production',
    phase: 'arrangements',
    triggerTiming: 'Arrangement Conference',
    destinationRecipient: 'Digiprint / Media Production',
    deliveryMethod: 'Digital Portal',
    status: 'generated',
    followUpAction: 'Print order, DVD slideshow, photo placement & prayer card verse',
    lastUpdated: '2026-09-18 02:30 PM'
  },
  {
    id: 'doc-8',
    name: 'At-Need Written Statement of Person Having Right to Control Disposition (NYS § 4201)',
    formType: 'right_to_control',
    phase: 'legal_bundle',
    triggerTiming: 'Post-Consultation',
    destinationRecipient: 'Next of Kin (NOK)',
    deliveryMethod: 'eSign Portal',
    status: 'signed',
    followUpAction: 'NYS Public Health Law § 4201 statutory priority compliance',
    lastUpdated: '2026-09-18 03:00 PM',
    isUrgent: true
  },
  {
    id: 'doc-9',
    name: 'Woodlawn Crematory Authorization & Dispatch Packet',
    formType: 'woodlawn_cremation',
    phase: 'legal_bundle',
    triggerTiming: 'Pre-Cremation',
    destinationRecipient: 'Woodlawn Crematory (Bronx, NY)',
    deliveryMethod: 'eSign Portal',
    status: 'urgent',
    followUpAction: 'Required prior to booking crematory witness slot',
    isUrgent: true
  },
  {
    id: 'doc-10',
    name: 'NYC EDRS Certified Death Certificate & Burial/Cremation Permit',
    formType: 'edrs_permit',
    phase: 'permits_logistics',
    triggerTiming: 'Post-Physician Certification',
    destinationRecipient: 'NYC Dept of Health & Mental Hygiene',
    deliveryMethod: 'Online Portal',
    status: 'approved',
    followUpAction: 'EDRS Permit #NYC-EDRS-2026-44910 synced to Golden Record'
  },
  {
    id: 'doc-11',
    name: 'Service Logistics Info Sheet (Officiant & Organist)',
    formType: 'service_sheet',
    phase: 'permits_logistics',
    triggerTiming: '72hrs Before Service',
    destinationRecipient: 'Officiant / Musician / Pallbearers',
    deliveryMethod: 'Email/SMS',
    status: 'sent',
    followUpAction: 'Vendor confirmation logged in Partner SMS queue'
  },
  {
    id: 'doc-12',
    name: 'Final Itemized Statement of Account & Payment Receipt',
    formType: 'statement_goods_services',
    phase: 'finalization_aftercare',
    triggerTiming: 'Post-Service Finalization',
    destinationRecipient: 'Next of Kin / Estate',
    deliveryMethod: 'Email/Portal',
    status: 'pending',
    followUpAction: 'ACH verification & insurance assignment payout release'
  },
  {
    id: 'doc-13',
    name: 'Day 7 / 30 Bereavement Care Guide & Certificate of Completed Disposition',
    formType: 'general_document',
    phase: 'finalization_aftercare',
    triggerTiming: '7 Days Post-Service',
    destinationRecipient: 'Next of Kin (NOK)',
    deliveryMethod: 'Email/Portal',
    status: 'pending',
    followUpAction: 'Aftercare check-in & Digi-Tribute memory archive access'
  }
];

export const MOCK_CASES: GoldenRecordCase[] = [
  {
    id: 'case-001',
    caseNumber: 'BFH-2026-089',
    createdAt: '2026-09-17T09:30:00Z',
    currentPhase: 'legal_bundle',
    dispositionType: 'full_cremation',
    safeArrivalStatus: 'safe_arrival_confirmed',
    safeArrivalTimestamp: '2026-09-17 11:30 AM',
    assignedDirector: 'Beth Crowe',
    assignedDirectorId: 'dir-fd-1',
    caseClaimStatus: 'claimed',
    appointmentScheduled: true,
    appointmentDate: '2026-09-18',
    appointmentTime: '02:00 PM',
    quickbooksSync: {
      invoiceNumber: 'INV-BFH-2026-089',
      syncStatus: 'synced',
      lastSyncedAt: '2026-09-18 03:45 PM',
      qboInvoiceId: 'QBO-99482',
      totalAmount: 7850,
      balanceRemaining: 3000,
      billsGenerated: [
        { vendorName: 'Woodlawn Cemetery & Crematory', category: 'Crematory Cash Advance', amount: 595, billNumber: 'BILL-WD-4410', status: 'synced' },
        { vendorName: 'Harlem Florist Guild', category: 'Floral Casket Spray', amount: 350, billNumber: 'BILL-FL-1092', status: 'synced' }
      ]
    },
    docusignEnvelope: {
      envelopeId: 'DOCU-ENV-7782-991A',
      status: 'id_verified',
      nokIdVerified: true,
      idVerificationMethod: 'Govt ID + SMS OTP',
      sentAt: '2026-09-18 01:15 PM',
      documentsIncluded: ['NYS Form AP-47 Statement of Goods', 'NYS Right to Control § 4201', 'Woodlawn Cremation Authorization']
    },
    decedent: {
      legalName: 'Dr. Marcus Aurelius Vance',
      gender: 'male',
      dateOfBirth: '1948-04-12',
      dateOfDeath: '2026-09-16',
      placeOfDeath: 'Mount Sinai Morningside Hospital, New York, NY',
      facilityName: 'Mount Sinai Morningside',
      ssnMasked: 'XXX-XX-6194',
      maritalStatus: 'married',
      residenceAddress: '240 W 138th St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10030',
      veteran: true,
      branchOfService: 'U.S. Navy (Vietnam Era)',
      occupation: 'Professor of African American History',
      industry: 'Higher Education (Columbia University)',
      fatherName: 'Edward Vance',
      motherMaidenName: 'Corinne Robinson'
    },
    informant: {
      fullName: 'Eleanor Vance-Holloway',
      relationship: 'Spouse / Next of Kin',
      phone: '(212) 555-0198',
      email: 'eleanor.vance@harlemheritage.org',
      address: '240 W 138th St, Apt 4B, New York, NY 10030',
      isNextOfKin: true,
      hasRightToControl: true
    },
    medicalCertifier: {
      physicianName: 'Dr. Sarah Jenkins, MD',
      licenseNumber: 'NY-MED-284910',
      hospitalFacility: 'Mount Sinai Morningside',
      phone: '(212) 523-4000',
      edrsStatus: 'certified',
      edrsPermitNumber: 'NYC-EDRS-2026-44910'
    },
    serviceSelections: {
      dispositionType: 'full_cremation',
      packageTitle: 'Funeral Service with Cremation',
      basePackagePrice: 4850.00,
      casketOrUrnSelected: 'The St. Nicholas Cherry Ceremonial Casket & Handcrafted Bronze Urn',
      casketPrice: 1850.00,
      viewingParlor: 'Parlor A (Seats 120)',
      serviceVenueName: "Benta's Main Chapel (630 St Nicholas Ave)",
      serviceDate: '2026-09-22',
      serviceTime: '11:00 AM - 1:00 PM',
      crematoryOrCemeteryName: 'Woodlawn Crematory (Bronx, NY)',
      officiantName: 'Rev. Dr. Calvin Butts IV',
      officiantPhone: '(212) 555-8833',
      organistName: 'Marcus Roberts Ensemble',
      specialRequests: 'Navy Military Color Guard for folding of the flag before procession to Woodlawn.'
    },
    documents: INITIAL_DOCUMENT_TEMPLATES.map(doc => {
      if (doc.id === 'doc-7') return { ...doc, status: 'urgent' };
      if (['doc-1', 'doc-2', 'doc-3', 'doc-4'].includes(doc.id)) return { ...doc, status: 'completed' };
      return doc;
    }),
    splitBilling: [
      {
        payerType: 'Life Insurance Assignment',
        providerName: 'C&J Financial / Lincoln National Life',
        policyNumber: 'LN-774029-A',
        amountAllocated: 5500.00,
        status: 'verified_active',
        notes: 'Verification approved with carrier; funds pending dispatch confirmation'
      },
      {
        payerType: 'Family ACH Direct',
        providerName: 'Chase Bank ACH (...8841)',
        amountAllocated: 1200.00,
        status: 'funded',
        notes: 'Deposit received for parlor and honorarium'
      }
    ],
    totalAmountDue: 6700.00,
    totalPaid: 1200.00,
    aftercare: [
      {
        id: 'ac-1',
        milestoneTitle: 'Day 7 Family Wellness Check & Grief Guide',
        triggerDaysPostService: 7,
        targetDate: '2026-09-29',
        status: 'scheduled',
        templateName: 'Harlem Grief & Resilience Outreach'
      },
      {
        id: 'ac-2',
        milestoneTitle: 'Day 30 Bereavement Support Follow-up',
        triggerDaysPostService: 30,
        targetDate: '2026-10-22',
        status: 'scheduled',
        templateName: 'Community Support Group Connections'
      },
      {
        id: 'ac-3',
        milestoneTitle: '1-Year Memorial Remembrance & Digi-Tribute Tribute',
        triggerDaysPostService: 365,
        targetDate: '2027-09-16',
        status: 'scheduled',
        templateName: 'Eternal Flame Remembrance'
      }
    ],
    friendTributeShares: [
      {
        id: 'share-1',
        recipientName: 'Martha Hayes',
        recipientContact: '(212) 555-4421',
        channel: 'sms',
        personalNote: 'Dear Martha, please share your memories of Arthur for our digital archive.',
        sentAt: 'Yesterday 2:10 PM',
        status: 'voice_recorded'
      },
      {
        id: 'share-2',
        recipientName: 'Rev. Dr. Calvin Butts IV',
        recipientContact: 'calvin.butts@abyssinian.org',
        channel: 'email',
        personalNote: 'Pastor Calvin, we would be deeply honored to include your prayer and reflection.',
        sentAt: 'Yesterday 3:00 PM',
        status: 'voice_recorded'
      },
      {
        id: 'share-3',
        recipientName: 'Marcus Roberts',
        recipientContact: '(917) 555-8821',
        channel: 'sms',
        personalNote: 'Marcus, Arthur always cherished the Sunday hymns. Please record a voice tribute.',
        sentAt: 'Today 9:15 AM',
        status: 'opened'
      },
      {
        id: 'share-4',
        recipientName: 'Dr. Arlene Phillips',
        recipientContact: 'a.phillips@columbia.edu',
        channel: 'email',
        personalNote: 'Dr. Phillips, the faculty and students at Columbia meant the world to Arthur.',
        sentAt: 'Today 10:30 AM',
        status: 'sent'
      }
    ],
    webcastSchedule: {
      isEnabled: true,
      venueId: 'chapel_1',
      venueName: 'Chapel 1 (Main Sanctuary)',
      streamStatus: 'scheduled',
      broadcastDate: '2026-09-22',
      broadcastStartTime: '10:30 AM',
      broadcastEndTime: '1:00 PM',
      assignedDirector: 'Jason Benta, LFD',
      assignedAvTech: 'Marcus Vance (Harlem Media AV)',
      avTechPhone: '(212) 555-4920',
      streamUrl: 'https://broadcast.e-bfh.com/live/2026-BFH-0891',
      isPinProtected: true,
      securityPin: '1928',
      cameraPresets: ['Pulpit Sanctuary Wide', 'Casket & Floral Alcove', 'Choir & Pipe Organ', 'Family Pew Front View'],
      audioBoardVerified: true,
      recordingArchived: false,
      estimatedViewers: 120,
      notes: 'Sanctuary 4K PTZ Camera array active. Direct soundboard audio feed calibrated.'
    },
    webcastShares: [
      {
        id: 'ws-1',
        caseId: 'case-1',
        recipientName: 'Aunt Evelyn Vance (Chicago)',
        recipientContact: '(312) 555-8120',
        channel: 'sms',
        sentAt: 'Sep 18, 2026 2:15 PM',
        status: 'opened',
        viewerLocation: 'Chicago, IL'
      },
      {
        id: 'ws-2',
        caseId: 'case-1',
        recipientName: 'Dr. Gregory Vance (London, UK)',
        recipientContact: 'gregory.vance@oxford-med.ac.uk',
        channel: 'email',
        sentAt: 'Sep 18, 2026 3:30 PM',
        status: 'watching',
        viewerLocation: 'London, United Kingdom'
      },
      {
        id: 'ws-3',
        caseId: 'case-1',
        recipientName: 'Abyssinian Senior Deacon Circle',
        recipientContact: '(917) 555-0914',
        channel: 'whatsapp',
        sentAt: 'Sep 18, 2026 4:10 PM',
        status: 'delivered',
        viewerLocation: 'Harlem, NYC'
      }
    ],
    removalSchedule: {
      id: 'rem-001',
      caseId: 'case-001',
      status: 'safe_arrival_completed',
      locationType: 'hospital_morgue',
      facilityName: 'Mount Sinai Morningside Hospital',
      facilityAddress: '411 W 114th St, New York, NY 10025',
      facilityFloorRoom: 'Sub-Basement Pathology Morgue / Bay 3',
      facilityContactPhone: '(212) 523-4000',
      morgueAttendantOrNurse: 'Officer Maria Santos (Pathology Attendant)',
      morgueReleaseHours: '24/7 Security Dock Access',
      urgency: 'stat_immediate',
      targetCallTime: '2026-09-17 10:15 AM',
      estimatedArrivalMinutes: 25,
      assignedDirector: 'Jason Benta, LFD',
      directorLicenseNumber: 'NYS LFD #08850',
      directorPhone: '(212) 281-8850',
      secondaryCrewMember: 'James O\'Connor (Transport Specialist)',
      vehicleType: 'First Call Custom Van (BFH-1)',
      vehiclePlate: 'BFH-CUSTODY-1',
      specialEquipment: [
        'Standard Mortuary Cot & Transfer Pouch',
        'Tamper-Evident Personal Effects Security Bag',
        'Hospital Morgue Release Tag Scanner'
      ],
      specialInstructions: 'Enter via 114th St service dock. Security badge code #4110. Attending Dr. Sarah Jenkins completed cause of death.',
      directorSmsDispatched: true,
      directorSmsSentAt: '2026-09-17 09:45 AM',
      directorConfirmedAt: '2026-09-17 09:48 AM',
      facilitySmsDispatched: true,
      facilitySmsSentAt: '2026-09-17 09:50 AM',
      familySmsDispatched: true,
      familySmsSentAt: '2026-09-17 11:30 AM',
      affidavit: {
        id: 'aff-001',
        caseId: 'case-001',
        caseNumber: 'BFH-2026-089',
        affidavitNumber: 'AFF-REM-2026-0891',
        decedentName: 'Dr. Marcus Aurelius Vance',
        dateOfPassing: '2026-09-16',
        timeOfPassing: '08:45 PM',
        placeOfPassing: 'Mount Sinai Morningside Hospital, New York, NY',
        facilityMrnOrTag: 'MSM-MORG-28491',
        assignedDirectorName: 'Jason Benta',
        directorLicenseNumber: 'NYS LFD #08850',
        directorPhone: '(212) 281-8850',
        crewMembers: ['Jason Benta (LFD)', 'James O\'Connor (Transport Specialist)'],
        vehicleId: 'BFH-1',
        vehiclePlate: 'BFH-CUSTODY-1',
        informantName: 'Eleanor Vance-Holloway',
        informantRelation: 'Spouse / Next of Kin',
        informantPhone: '(212) 555-0198',
        informantAddress: '240 W 138th St, Apt 4B, New York, NY 10030',
        authorizationType: 'Digital Portal eSign',
        authorizationTimestamp: '2026-09-17 09:35 AM',
        facilityName: 'Mount Sinai Morningside Hospital',
        facilityAddress: '411 W 114th St, New York, NY 10025',
        facilityFloorRoom: 'Sub-Basement Pathology Morgue / Bay 3',
        releasingAttendantName: 'Maria Santos',
        releasingAttendantTitle: 'Pathology & Custodial Release Officer',
        custodyReleaseTimestamp: '2026-09-17 10:45 AM',
        bodyTagConfirmed: true,
        tagNumber: 'NYC-MSM-99120',
        weightCategory: 'Standard (< 250 lbs)',
        equipmentUsed: ['Standard Cot & Pouch', 'Tamper-Evident Bag'],
        personalEffectsTotalCount: 5,
        personalEffects: [
          {
            id: 'pe-1',
            category: 'Jewelry / Rings',
            description: '14K Gold Navy Veteran Signet Ring (Left Ring Finger)',
            releasedBy: 'Officer Maria Santos',
            custodyReceived: true
          },
          {
            id: 'pe-2',
            category: 'Watch / Electronics',
            description: 'Vintage Omega Constellation Gold Watch (Black Leather Strap)',
            releasedBy: 'Officer Maria Santos',
            custodyReceived: true
          },
          {
            id: 'pe-3',
            category: 'Documents / ID',
            description: 'Columbia University Faculty ID & NY Driver License',
            releasedBy: 'Officer Maria Santos',
            custodyReceived: true
          },
          {
            id: 'pe-4',
            category: 'Dentures / Eyeglasses',
            description: 'Tortoiseshell Reading Eyeglasses in hard case',
            releasedBy: 'Officer Maria Santos',
            custodyReceived: true
          },
          {
            id: 'pe-5',
            category: 'Wallet / Currency',
            description: 'Brown Leather Bi-fold Wallet ($45.00 cash logged)',
            releasedBy: 'Officer Maria Santos',
            custodyReceived: true
          }
        ],
        safeArrivalTimestamp: '2026-09-17 11:30 AM',
        intakeAttendantName: 'Jason Benta (LFD #08850)',
        status: 'signed_verified',
        directorSignedAt: '2026-09-17 11:35 AM',
        facilitySignedAt: '2026-09-17 10:45 AM'
      }
    },
    cortegeRoute: {
      id: 'route-001',
      caseId: 'case-001',
      pickupLocationName: 'Vance Family Residence',
      pickupAddress: '409 Edgecombe Ave, Apt 6B, New York, NY 10032',
      pickupContactName: 'Clara Vance',
      pickupContactPhone: '(212) 555-0198',
      pickupTime: '09:30 AM',
      pickupFloorApt: 'Apt 6B (Elevator building, rear lobby ramp)',
      pickupSpecialInstructions: 'Elder family member requires low-step entry. 2 floral standing sprays to be loaded with cortege.',
      serviceVenueName: "Benta's Funeral Home - Chapel 1 (Main Sanctuary)",
      serviceVenueAddress: '630 Saint Nicholas Ave, New York, NY 10030',
      serviceTime: '11:00 AM',
      dropoffLocationName: 'Woodlawn Cemetery & Crematory',
      dropoffAddress: '4199 Webster Ave, Bronx, NY 10470',
      dropoffTime: '01:30 PM',
      dropoffSpecialInstructions: 'Procession will assemble at Woolworth Gatehouse for witness committal service.',
      returnLocationName: 'Vance Family Residence & Repast Gathering',
      returnAddress: '409 Edgecombe Ave, New York, NY 10032',
      returnRequired: true,
      totalPassengers: 14,
      vehiclesAllocated: [
        {
          vehicleType: 'Cadillac Professional Hearse',
          vehicleSize: 'Custom / Standard',
          quantity: 1,
          assignedDriver: 'Jason Benta (LFD Escort Lead)',
          driverPhone: '(212) 281-8850',
          plateNumber: 'BFH-HEARSE-1'
        },
        {
          vehicleType: 'Cadillac 8-Passenger Family Limousine',
          vehicleSize: 'Limo 8-seater',
          quantity: 2,
          assignedDriver: 'Marcus Vance / Transport Fleet',
          driverPhone: '(212) 555-4920',
          plateNumber: 'BFH-LIMO-8A'
        }
      ],
      isConfirmedByFamily: true,
      confirmedAt: '2026-09-18 04:30 PM',
      confirmedBy: 'Clara Vance (Spouse)',
      lastModifiedAt: '2026-09-18 04:30 PM',
      serviceDateTime: '2026-09-22 11:00 AM',
      cutoffHours: 10,
      isLockedBy10HourRule: false
    },
    notes: [
      {
        id: 'note-1',
        author: 'Jason Benta',
        timestamp: '2026-09-17 11:35 AM',
        text: 'Decedent arrived safely at 630 St Nicholas from Mount Sinai. Automated safe arrival confirmation dispatched to Mrs. Vance.'
      },
      {
        id: 'note-2',
        author: 'Staff Apprentice',
        timestamp: '2026-09-17 2:15 PM',
        text: 'Consultation completed in Parlor A. Vital statistics verified against Golden Record. Legal Bundle generated and prepared for eSign.'
      }
    ],
    arrangementAppointment: {
      id: 'appt-001',
      caseId: 'case-001',
      caseNumber: 'BFH-2026-089',
      decedentName: 'Dr. Marcus Aurelius Vance',
      informantName: 'Eleanor Vance-Holloway',
      informantPhone: '(212) 555-0198',
      informantEmail: 'eleanor.vance@columbia.edu',
      status: 'confirmed',
      meetingFormat: 'in_person_office',
      locationVenue: '630 St. Nicholas Ave - Arrangement Suite A',
      assignedDirectorName: 'Jason Benta, LFD #08850',
      assignedDirectorPhone: '(212) 281-8850',
      assignedDirectorEmail: 'care@e-bfh.com',
      proposedSlots: [
        {
          id: 'slot-1',
          date: '2026-09-21',
          dateLabel: 'Monday, Sept 21, 2026',
          time: '10:00 AM',
          durationMinutes: 90,
          isAvailable: true,
          selectedByFamily: true
        },
        {
          id: 'slot-2',
          date: '2026-09-21',
          dateLabel: 'Monday, Sept 21, 2026',
          time: '02:00 PM',
          durationMinutes: 90,
          isAvailable: true,
          selectedByFamily: false
        },
        {
          id: 'slot-3',
          date: '2026-09-22',
          dateLabel: 'Tuesday, Sept 22, 2026',
          time: '11:00 AM',
          durationMinutes: 90,
          isAvailable: true,
          selectedByFamily: false
        }
      ],
      confirmedSlot: {
        date: '2026-09-21',
        dateLabel: 'Monday, Sept 21, 2026',
        time: '10:00 AM',
        durationMinutes: 90
      },
      confirmedAt: '2026-09-17 01:45 PM',
      attendingFamilyCount: 3,
      attendingFamilyNames: ['Eleanor Vance (Spouse)', 'Marcus Vance Jr. (Son)', 'Clara Vance (Daughter)'],
      specialAccommodationsNotes: 'Family will bring physical naval discharge papers (DD-214) and family heirloom photograph for memorial program cover.',
      invitationChannel: 'both',
      invitationSentAt: '2026-09-17 11:45 AM',
      smsConfirmationSent: true,
      emailConfirmationSent: true,
      calendarEventId: 'evt-conf-101'
    }
  },
  {
    id: 'case-002',
    caseNumber: 'BFH-2026-090',
    createdAt: '2026-09-18T08:00:00Z',
    currentPhase: 'permits_logistics',
    dispositionType: 'full_burial',
    safeArrivalStatus: 'safe_arrival_confirmed',
    safeArrivalTimestamp: '2026-09-18 09:15 AM',
    assignedDirector: 'Chontel Harris',
    assignedDirectorId: 'dir-fd-2',
    caseClaimStatus: 'claimed',
    appointmentScheduled: true,
    appointmentDate: '2026-09-18',
    appointmentTime: '10:00 AM',
    quickbooksSync: {
      invoiceNumber: 'INV-BFH-2026-090',
      syncStatus: 'synced',
      lastSyncedAt: '2026-09-18 10:45 AM',
      qboInvoiceId: 'QBO-99483',
      totalAmount: 9350,
      balanceRemaining: 0
    },
    docusignEnvelope: {
      envelopeId: 'DOCU-ENV-7783-112B',
      status: 'completed',
      nokIdVerified: true,
      idVerificationMethod: 'Govt ID + SMS OTP',
      sentAt: '2026-09-18 09:30 AM',
      completedAt: '2026-09-18 10:15 AM'
    },
    decedent: {
      legalName: 'Bernice Jackson-Taylor',
      gender: 'female',
      dateOfBirth: '1939-11-20',
      dateOfDeath: '2026-09-17',
      placeOfDeath: 'Harlem Hospital Center, New York, NY',
      facilityName: 'Harlem Hospital Center',
      ssnMasked: 'XXX-XX-1142',
      maritalStatus: 'widowed',
      residenceAddress: '55 W 130th St',
      city: 'New York',
      state: 'NY',
      zipCode: '10037',
      veteran: false,
      occupation: 'Nurse Administrator (Retired)',
      industry: 'Healthcare (NYC Health + Hospitals)',
      fatherName: 'Arthur Jackson',
      motherMaidenName: 'Mae Washington'
    },
    informant: {
      fullName: 'Tyrone Taylor',
      relationship: 'Son / Executor',
      phone: '(917) 555-4920',
      email: 'tyrone.taylor@nycreal.com',
      address: '55 W 130th St, New York, NY 10037',
      isNextOfKin: true,
      hasRightToControl: true
    },
    medicalCertifier: {
      physicianName: 'Dr. Robert Osei, MD',
      licenseNumber: 'NY-MED-991204',
      hospitalFacility: 'Harlem Hospital Center',
      phone: '(212) 939-1000',
      edrsStatus: 'certified',
      edrsPermitNumber: 'NYC-EDRS-2026-44988'
    },
    serviceSelections: {
      dispositionType: 'full_burial',
      packageTitle: 'Traditional Service and Burial',
      basePackagePrice: 5950.00,
      casketOrUrnSelected: 'The St. Nicholas Heritage Solid Mahogany Casket',
      casketPrice: 3400.00,
      viewingParlor: 'Church / External Venue',
      serviceVenueName: 'Abyssinian Baptist Church (132 W 138th St)',
      serviceDate: '2026-09-24',
      serviceTime: '10:00 AM - 12:30 PM',
      crematoryOrCemeteryName: 'Woodlawn Cemetery (Bronx, NY) - Heritage Plot',
      officiantName: 'Senior Pastor Abyssinian',
      officiantPhone: '(212) 862-7474',
      organistName: 'Harlem Gospel Choir Director',
      specialRequests: 'Procession will pause outside family home on 130th St before continuing to Woodlawn.'
    },
    documents: INITIAL_DOCUMENT_TEMPLATES.map(doc => {
      if (['doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5', 'doc-6', 'doc-7', 'doc-8'].includes(doc.id)) {
        return { ...doc, status: 'completed' };
      }
      if (doc.id === 'doc-10' || doc.id === 'doc-12') return { ...doc, status: 'generated' };
      return doc;
    }),
    splitBilling: [
      {
        payerType: 'Family ACH Direct',
        providerName: 'Citibank Direct ACH Transfer',
        amountAllocated: 9350.00,
        status: 'funded',
        notes: 'Full balance settled via direct ACH bank transfer'
      }
    ],
    totalAmountDue: 9350.00,
    totalPaid: 9350.00,
    aftercare: [
      {
        id: 'ac-1',
        milestoneTitle: 'Day 7 Family Wellness Check & Grief Guide',
        triggerDaysPostService: 7,
        targetDate: '2026-10-01',
        status: 'scheduled',
        templateName: 'Harlem Grief & Resilience Outreach'
      }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Chontel Harris',
        timestamp: '2026-09-18 9:20 AM',
        text: 'Church confirmed with Abyssinian Baptist. Woodlawn Cemetery plot deed verified.'
      }
    ]
  },
  {
    id: 'case-003',
    caseNumber: 'BFH-2026-091',
    createdAt: '2026-09-18T12:00:00Z',
    currentPhase: 'intake_removal',
    dispositionType: 'direct_cremation',
    safeArrivalStatus: 'in_transit',
    assignedDirector: 'Unassigned (Claim Pending)',
    assignedDirectorId: undefined,
    caseClaimStatus: 'unclaimed',
    appointmentScheduled: true,
    appointmentDate: '2026-09-29',
    appointmentTime: '11:00 AM',
    quickbooksSync: {
      invoiceNumber: 'INV-BFH-2026-091',
      syncStatus: 'not_synced',
      totalAmount: 2850,
      balanceRemaining: 2850
    },
    docusignEnvelope: {
      status: 'not_sent',
      nokIdVerified: false
    },
    decedent: {
      legalName: 'Gregory Scott Sterling',
      gender: 'male',
      dateOfBirth: '1962-08-04',
      dateOfDeath: '2026-09-18',
      placeOfDeath: 'New York Presbyterian / Columbia University Irving Medical Center',
      facilityName: 'NYP Columbia',
      ssnMasked: 'XXX-XX-8402',
      maritalStatus: 'single',
      residenceAddress: '512 W 143rd St',
      city: 'New York',
      state: 'NY',
      zipCode: '10031',
      veteran: false,
      occupation: 'Architectural Historian',
      industry: 'Urban Architecture',
      fatherName: 'Harold Sterling',
      motherMaidenName: 'Evelyn James'
    },
    informant: {
      fullName: 'Valerie Sterling',
      relationship: 'Sister / Next of Kin',
      phone: '(646) 555-7782',
      email: 'valerie.sterling@gmail.com',
      address: '512 W 143rd St, New York, NY 10031',
      isNextOfKin: true,
      hasRightToControl: true
    },
    medicalCertifier: {
      physicianName: 'Dr. Alan Vance, MD',
      licenseNumber: 'NY-MED-550183',
      hospitalFacility: 'NYP Columbia',
      phone: '(212) 305-2500',
      edrsStatus: 'pending'
    },
    serviceSelections: {
      dispositionType: 'direct_cremation',
      packageTitle: 'Direct Cremation',
      basePackagePrice: 1995.00,
      casketOrUrnSelected: 'Alternative Eco Container & Midnight Ceramic Keepsake Urn',
      casketPrice: 350.00,
      viewingParlor: 'Direct / No Viewing',
      crematoryOrCemeteryName: 'Woodlawn Crematory (Bronx, NY)',
      specialRequests: 'Private return of urn to sister Valerie at Benta funeral home.'
    },
    documents: INITIAL_DOCUMENT_TEMPLATES,
    splitBilling: [
      {
        payerType: 'Family ACH Direct',
        providerName: 'Direct Bank Transfer',
        amountAllocated: 2345.00,
        status: 'pending_verification'
      }
    ],
    totalAmountDue: 2345.00,
    totalPaid: 0.00,
    aftercare: [],
    removalSchedule: {
      id: 'rem-003',
      caseId: 'case-003',
      status: 'custody_acquired_in_transit',
      locationType: 'hospital_morgue',
      facilityName: 'New York Presbyterian / Columbia University Irving Medical Center',
      facilityAddress: '622 W 168th St, New York, NY 10032',
      facilityFloorRoom: 'Milstein Hospital Building, Pathology Morgue Level B1',
      facilityContactPhone: '(212) 305-2500',
      morgueAttendantOrNurse: 'Nurse Supervisor Kevin Walsh / Morgue Desk',
      morgueReleaseHours: '24/7 Security Service Bay 2',
      urgency: 'stat_immediate',
      targetCallTime: 'Today 1:15 PM',
      estimatedArrivalMinutes: 20,
      assignedDirector: 'Jason Benta, LFD',
      directorLicenseNumber: 'NYS LFD #08850',
      directorPhone: '(212) 281-8850',
      secondaryCrewMember: 'Marcus Vance (Transport Specialist)',
      vehicleType: 'First Call Custom Van (BFH-1)',
      vehiclePlate: 'BFH-CUSTODY-1',
      specialEquipment: [
        'Standard Mortuary Cot & Transfer Pouch',
        'Tamper-Evident Personal Effects Security Bag'
      ],
      specialInstructions: 'Access via Fort Washington Ave service ambulance ramp. Release authorized by sister Valerie Sterling.',
      directorSmsDispatched: true,
      directorSmsSentAt: 'Today 1:10 PM',
      directorConfirmedAt: 'Today 1:12 PM',
      facilitySmsDispatched: true,
      facilitySmsSentAt: 'Today 1:15 PM',
      familySmsDispatched: true,
      familySmsSentAt: 'Today 1:18 PM',
      affidavit: {
        id: 'aff-003',
        caseId: 'case-003',
        caseNumber: 'BFH-2026-091',
        affidavitNumber: 'AFF-REM-2026-0912',
        decedentName: 'Gregory Scott Sterling',
        dateOfPassing: '2026-09-18',
        timeOfPassing: '11:20 AM',
        placeOfPassing: 'New York Presbyterian / Columbia University Irving Medical Center',
        facilityMrnOrTag: 'NYP-COL-77182',
        assignedDirectorName: 'Jason Benta',
        directorLicenseNumber: 'NYS LFD #08850',
        directorPhone: '(212) 281-8850',
        crewMembers: ['Jason Benta (LFD)', 'Marcus Vance (Transport Specialist)'],
        vehicleId: 'BFH-1',
        vehiclePlate: 'BFH-CUSTODY-1',
        informantName: 'Valerie Sterling',
        informantRelation: 'Sister / Next of Kin',
        informantPhone: '(646) 555-7782',
        informantAddress: '512 W 143rd St, New York, NY 10031',
        authorizationType: 'Verbal Telephone Jurat',
        authorizationTimestamp: '2026-09-18 12:45 PM',
        facilityName: 'New York Presbyterian / Columbia Medical Center',
        facilityAddress: '622 W 168th St, New York, NY 10032',
        facilityFloorRoom: 'Milstein Hospital Building, Pathology Morgue Level B1',
        releasingAttendantName: 'Kevin Walsh, RN',
        releasingAttendantTitle: 'Charge Nurse & Morgue Attendant',
        custodyReleaseTimestamp: '2026-09-18 01:45 PM',
        bodyTagConfirmed: true,
        tagNumber: 'NYP-CUST-88410',
        weightCategory: 'Standard (< 250 lbs)',
        equipmentUsed: ['Standard Mortuary Cot & Transfer Pouch'],
        personalEffectsTotalCount: 3,
        personalEffects: [
          {
            id: 'pe-11',
            category: 'Watch / Electronics',
            description: 'Apple Watch Series 8 (Silver Aluminum) with charging cable',
            releasedBy: 'Kevin Walsh, RN',
            custodyReceived: true
          },
          {
            id: 'pe-12',
            category: 'Dentures / Eyeglasses',
            description: 'Black Frame Prescription Eyeglasses',
            releasedBy: 'Kevin Walsh, RN',
            custodyReceived: true
          },
          {
            id: 'pe-13',
            category: 'Clothing / Shoes',
            description: 'Navy Wool Jacket & Personal Wardrobe in NYP Hospital Bag',
            releasedBy: 'Kevin Walsh, RN',
            custodyReceived: true
          }
        ],
        safeArrivalTimestamp: undefined,
        intakeAttendantName: 'Pending arrival at 630 St Nicholas',
        status: 'custody_acquired',
        directorSignedAt: '2026-09-18 01:40 PM',
        facilitySignedAt: '2026-09-18 01:45 PM'
      }
    },
    notes: [
      {
        id: 'note-1',
        author: 'Transport Team',
        timestamp: '2026-09-18 1:15 PM',
        text: 'Removal team dispatched to NYP Columbia with signed affidavit.'
      }
    ]
  },
  {
    id: 'case-004',
    caseNumber: 'BFH-2026-092',
    createdAt: '2026-09-17T14:20:00Z',
    currentPhase: 'legal_bundle',
    dispositionType: 'full_burial',
    safeArrivalStatus: 'safe_arrival_confirmed',
    safeArrivalTimestamp: '2026-09-17 04:00 PM',
    assignedDirector: 'Leatrice Henry',
    assignedDirectorId: 'dir-fd-3',
    caseClaimStatus: 'claimed',
    appointmentScheduled: true,
    appointmentDate: '2026-09-17',
    appointmentTime: '04:00 PM',
    quickbooksSync: {
      invoiceNumber: 'INV-BFH-2026-092',
      syncStatus: 'synced',
      lastSyncedAt: '2026-09-17 05:30 PM',
      qboInvoiceId: 'QBO-99484',
      totalAmount: 10050,
      balanceRemaining: 8000
    },
    docusignEnvelope: {
      envelopeId: 'DOCU-ENV-7784-331C',
      status: 'id_verified',
      nokIdVerified: true,
      idVerificationMethod: 'Govt ID + SMS OTP',
      sentAt: '2026-09-17 04:30 PM',
      documentsIncluded: ['NYS Form AP-47 Statement of Goods', 'NYS Right to Control § 4201', 'Sanctuary Earth Burial Authorization']
    },
    decedent: {
      legalName: 'Hon. Gwendolyn Baptiste-Mercer',
      gender: 'female',
      dateOfBirth: '1944-06-18',
      dateOfDeath: '2026-09-16',
      placeOfDeath: 'NYU Langone Health, New York, NY',
      facilityName: 'NYU Langone Health',
      ssnMasked: 'XXX-XX-9021',
      maritalStatus: 'widowed',
      residenceAddress: '1867 7th Ave (Adam Clayton Powell Jr Blvd)',
      city: 'New York',
      state: 'NY',
      zipCode: '10026',
      veteran: false,
      occupation: 'NY State Supreme Court Justice (Retired)',
      industry: 'Judiciary & Public Service',
      fatherName: 'Alphonse Baptiste',
      motherMaidenName: 'Clarissa St. Claire'
    },
    informant: {
      fullName: 'Julian Mercer, Esq.',
      relationship: 'Son / Executor',
      phone: '(212) 555-9088',
      email: 'julian.mercer@mercerlawny.com',
      address: '1867 7th Ave, New York, NY 10026',
      isNextOfKin: true,
      hasRightToControl: true
    },
    medicalCertifier: {
      physicianName: 'Dr. Raymond Scott, MD',
      licenseNumber: 'NY-MED-441829',
      hospitalFacility: 'NYU Langone Health',
      phone: '(212) 263-7300',
      edrsStatus: 'certified',
      edrsPermitNumber: 'NYC-EDRS-2026-45012'
    },
    serviceSelections: {
      dispositionType: 'full_burial',
      packageTitle: 'Harlem Judicial Honors & Sanctuary Earth Burial',
      basePackagePrice: 6200.00,
      casketOrUrnSelected: 'The St. Nicholas Ambassador Hand-Polished Mahogany Casket',
      casketPrice: 3850.00,
      viewingParlor: 'Parlor A (Seats 120)',
      serviceVenueName: "Benta's Main Chapel (630 St Nicholas Ave)",
      serviceDate: '2026-09-21',
      serviceTime: '11:00 AM - 1:30 PM',
      crematoryOrCemeteryName: 'Woodlawn Cemetery (Bronx, NY) - Private Mausoleum',
      officiantName: 'Bishop Horace C. Michael',
      officiantPhone: '(212) 555-7119',
      organistName: 'Harlem Baroque Strings & Organ',
      specialRequests: 'Judicial Robes display and ceremonial gavel presentation during eulogy.'
    },
    documents: INITIAL_DOCUMENT_TEMPLATES.map(doc => {
      if (doc.id === 'doc-8') return { ...doc, status: 'urgent' };
      if (['doc-1', 'doc-2', 'doc-3', 'doc-4'].includes(doc.id)) return { ...doc, status: 'completed' };
      return doc;
    }),
    splitBilling: [
      {
        payerType: 'Life Insurance Assignment',
        providerName: 'C&J Financial / NYS Judicial Pension',
        policyNumber: 'NYS-JUR-881204',
        amountAllocated: 8000.00,
        status: 'verified_active',
        notes: 'Verification in place; final payout release queued upon permit transit'
      },
      {
        payerType: 'Family ACH Direct',
        providerName: 'Chase Premier Wire',
        amountAllocated: 2050.00,
        status: 'funded',
        notes: 'Private parlor reservation & floral retainer paid'
      }
    ],
    totalAmountDue: 10050.00,
    totalPaid: 2050.00,
    webcastSchedule: {
      isEnabled: true,
      venueId: 'chapel_1',
      venueName: 'Chapel 1 (Main Sanctuary)',
      streamStatus: 'scheduled',
      broadcastDate: '2026-09-21',
      broadcastStartTime: '10:30 AM',
      broadcastEndTime: '1:30 PM',
      assignedDirector: 'Ronald K. Washington, LFD',
      assignedAvTech: 'Marcus Vance (Harlem Media AV)',
      avTechPhone: '(212) 555-4920',
      streamUrl: 'https://broadcast.e-bfh.com/live/2026-BFH-092',
      isPinProtected: true,
      securityPin: '2026',
      cameraPresets: ['Pulpit Sanctuary Wide', 'Casket & Floral Alcove', 'Choir & Pipe Organ', 'Family Pew Front View'],
      audioBoardVerified: true,
      recordingArchived: false,
      estimatedViewers: 250,
      notes: 'State judicial delegation attending. Remote live stream broadcast for appellate colleagues.'
    },
    aftercare: [],
    notes: [
      {
        id: 'note-1',
        author: 'Ronald K. Washington',
        timestamp: '2026-09-17 5:00 PM',
        text: 'NYS Supreme Court security liaison coordinated. Woodlawn Mausoleum vault opening verified.'
      }
    ]
  },
  {
    id: 'case-005',
    caseNumber: 'BFH-2026-093',
    createdAt: '2026-09-18T06:30:00Z',
    currentPhase: 'arrangements',
    dispositionType: 'full_burial',
    safeArrivalStatus: 'safe_arrival_confirmed',
    safeArrivalTimestamp: '2026-09-18 08:30 AM',
    assignedDirector: 'Billy McDonald',
    assignedDirectorId: 'dir-fd-4',
    caseClaimStatus: 'claimed',
    appointmentScheduled: true,
    appointmentDate: '2026-09-18',
    appointmentTime: '01:00 PM',
    quickbooksSync: {
      invoiceNumber: 'INV-BFH-2026-093',
      syncStatus: 'pending',
      totalAmount: 8000,
      balanceRemaining: 5500
    },
    docusignEnvelope: {
      status: 'sent',
      nokIdVerified: true,
      idVerificationMethod: 'Govt ID + SMS OTP'
    },
    decedent: {
      legalName: 'Rev. Emmanuel Kofi Mensah',
      gender: 'male',
      dateOfBirth: '1952-03-10',
      dateOfDeath: '2026-09-17',
      placeOfDeath: 'NYC Health + Hospitals / Harlem, New York, NY',
      facilityName: 'NYC Health + Hospitals Harlem',
      ssnMasked: 'XXX-XX-4419',
      maritalStatus: 'married',
      residenceAddress: '310 Convent Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10031',
      veteran: false,
      occupation: 'Minister & Community Counselor',
      industry: 'Faith & Pastoral Ministry',
      fatherName: 'Kofi Mensah Sr.',
      motherMaidenName: 'Abena Osei'
    },
    informant: {
      fullName: 'Abena Mensah',
      relationship: 'Daughter / Designated Arranger',
      phone: '(646) 555-3390',
      email: 'abena.mensah@ghana-council.org',
      address: '310 Convent Ave, New York, NY 10031',
      isNextOfKin: true,
      hasRightToControl: true
    },
    medicalCertifier: {
      physicianName: 'Dr. Kwame Asante, MD',
      licenseNumber: 'NY-MED-194820',
      hospitalFacility: 'NYC Health + Hospitals Harlem',
      phone: '(212) 939-1000',
      edrsStatus: 'pending'
    },
    serviceSelections: {
      dispositionType: 'full_burial',
      packageTitle: 'Ghanaian Traditional Vigils & Earth Burial Celebration',
      basePackagePrice: 5400.00,
      casketOrUrnSelected: 'The St. Nicholas Heritage Solid Oak Casket',
      casketPrice: 2600.00,
      viewingParlor: 'Parlor B (Seats 110)',
      serviceVenueName: 'Chapel 2 (Harlem Sanctuary)',
      serviceDate: '2026-09-25',
      serviceTime: '6:00 PM - 10:00 PM',
      crematoryOrCemeteryName: 'Woodlawn Cemetery (Bronx, NY)',
      officiantName: 'Pastor Samuel Boateng',
      officiantPhone: '(718) 555-1200',
      organistName: 'Harlem Praise & Worship Ensemble',
      specialRequests: 'Traditional Kente cloth pall drape and evening wake reception in Repast Room.'
    },
    documents: INITIAL_DOCUMENT_TEMPLATES,
    splitBilling: [
      {
        payerType: 'Family ACH Direct',
        providerName: 'Bank of America Wire',
        amountAllocated: 8000.00,
        status: 'pending_verification'
      }
    ],
    totalAmountDue: 8000.00,
    totalPaid: 2500.00,
    aftercare: [],
    notes: [
      {
        id: 'note-1',
        author: 'Billy McDonald',
        timestamp: '2026-09-18 9:00 AM',
        text: 'Consultation scheduled with daughter Abena. Awaiting physician EDRS certification from Harlem Hospital.'
      }
    ]
  },
  {
    id: 'case-006',
    caseNumber: 'BFH-2026-094',
    createdAt: '2026-09-18T10:00:00Z',
    currentPhase: 'permits_logistics',
    dispositionType: 'direct_burial',
    safeArrivalStatus: 'safe_arrival_confirmed',
    safeArrivalTimestamp: '2026-09-18 11:15 AM',
    assignedDirector: 'Unassigned (Claim Pending)',
    assignedDirectorId: undefined,
    caseClaimStatus: 'unclaimed',
    appointmentScheduled: true,
    appointmentDate: '2026-09-30',
    appointmentTime: '02:30 PM',
    quickbooksSync: {
      invoiceNumber: 'INV-BFH-2026-094',
      syncStatus: 'not_synced',
      totalAmount: 3950,
      balanceRemaining: 3950
    },
    docusignEnvelope: {
      status: 'not_sent',
      nokIdVerified: false
    },
    decedent: {
      legalName: 'Dorothy Mae Washington',
      gender: 'female',
      dateOfBirth: '1935-09-02',
      dateOfDeath: '2026-09-17',
      placeOfDeath: 'Mount Sinai Hospital, New York, NY',
      facilityName: 'Mount Sinai Hospital',
      ssnMasked: 'XXX-XX-3011',
      maritalStatus: 'widowed',
      residenceAddress: '145 W 119th St',
      city: 'New York',
      state: 'NY',
      zipCode: '10026',
      veteran: true,
      branchOfService: 'U.S. Army Medical Corps (Korean War Era)',
      occupation: 'Elementary School Principal (Retired)',
      industry: 'NYC Department of Education',
      fatherName: 'George Washington',
      motherMaidenName: 'Lillie Belle Clark'
    },
    informant: {
      fullName: 'Constance Washington-Lee',
      relationship: 'Daughter / Power of Attorney',
      phone: '(917) 555-8819',
      email: 'c.washington@nycedu.org',
      address: '145 W 119th St, New York, NY 10026',
      isNextOfKin: true,
      hasRightToControl: true
    },
    medicalCertifier: {
      physicianName: 'Dr. Miriam Cohen, MD',
      licenseNumber: 'NY-MED-771902',
      hospitalFacility: 'Mount Sinai Hospital',
      phone: '(212) 241-6500',
      edrsStatus: 'certified',
      edrsPermitNumber: 'NYC-EDRS-2026-45180'
    },
    serviceSelections: {
      dispositionType: 'direct_burial',
      packageTitle: 'Military Honors Graveside Committal & Earth Burial',
      basePackagePrice: 3200.00,
      casketOrUrnSelected: 'The St. Nicholas Patriot Bronze-Finish Casket',
      casketPrice: 1950.00,
      viewingParlor: 'Direct / No Viewing',
      serviceVenueName: 'Woodlawn Cemetery (Bronx, NY) - Field of Honor',
      serviceDate: '2026-09-23',
      serviceTime: '1:00 PM - 2:00 PM',
      crematoryOrCemeteryName: 'Woodlawn Cemetery (Bronx, NY)',
      officiantName: 'Chaplain Ronald Hayes (USVA)',
      officiantPhone: '(212) 555-9921',
      specialRequests: 'US Army Honor Guard for flag folding and presentation to daughter Constance. Taps Bugler requested.'
    },
    documents: INITIAL_DOCUMENT_TEMPLATES.map(doc => {
      if (['doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5', 'doc-8', 'doc-10'].includes(doc.id)) {
        return { ...doc, status: 'completed' };
      }
      return doc;
    }),
    splitBilling: [
      {
        payerType: 'County/Grant Aid',
        providerName: 'NYC HRA Public Burial Assistance & VA $255 Benefit',
        amountAllocated: 1955.00,
        status: 'verified_active',
        notes: 'HRA $1,700 grant filed; VA Form 21P-530 application attached'
      },
      {
        payerType: 'Family ACH Direct',
        providerName: 'Chase Direct ACH',
        amountAllocated: 3195.00,
        status: 'funded',
        notes: 'Balance settled'
      }
    ],
    totalAmountDue: 5150.00,
    totalPaid: 3195.00,
    aftercare: [],
    notes: [
      {
        id: 'note-1',
        author: 'Anthony Washington',
        timestamp: '2026-09-18 11:30 AM',
        text: 'VA Form DD-214 verified. Woodlawn Cemetery Field of Honor plot scheduled for Sep 23.'
      }
    ]
  }
];

// Initialize Statement of Goods on all mock cases according to BFH 2026 GPL
MOCK_CASES.forEach((c) => {
  if (!c.statementOfGoods) {
    c.statementOfGoods = getDefaultStatementOfGoodsForCase(c);
  }
});

export const FACILITY_ROOMS: FacilityRoom[] = [
  {
    id: 'chapel_1',
    name: 'Chapel 1 (Main Sanctuary)',
    code: 'CHAP-1',
    capacity: 120,
    type: 'chapel',
    features: ['120 Guest Capacity', 'HD Live-Stream Cameras', 'Pipe Organ & Steinway Piano', 'Private Family Alcove', 'ADA Accessible'],
    color: 'border-red-500 bg-red-50/50 text-[#991b1b]'
  },
  {
    id: 'chapel_2',
    name: 'Chapel 2 (Harlem Sanctuary)',
    code: 'CHAP-2',
    capacity: 110,
    type: 'chapel',
    features: ['110 Guest Capacity', '360° Digi-Tribute Screens', 'Dedicated Family Lounge', 'Dedicated Floral Staging', 'Surround Audio'],
    color: 'border-amber-500 bg-amber-50/50 text-[#b45309]'
  },
  {
    id: 'repast_room',
    name: 'Repast Room (Hospitality & Dining)',
    code: 'REPAST',
    capacity: 75,
    type: 'repast',
    features: ['75 Seated Dining', 'Catering Warming Kitchen', 'Family Reception Buffet', 'Beverage Bar', 'Audio Visual Display'],
    color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
  },
  {
    id: 'family_suite_1',
    name: 'Family Suite 1 (Comfort & Intake)',
    code: 'SUITE-1',
    capacity: 15,
    type: 'suite',
    features: ['15 Guest Seating', 'Golden Record Intake Terminal', 'Private Restroom', 'Refreshment Station', 'Acoustic Privacy'],
    color: 'border-blue-500 bg-blue-50/50 text-blue-800'
  },
  {
    id: 'family_suite_2',
    name: 'Family Suite 2 (Consultation & Pre-Need)',
    code: 'SUITE-2',
    capacity: 10,
    type: 'suite',
    features: ['10 Guest Seating', 'Pre-Need Planning Terminal', 'Legal eSign Pad Station', 'FDIC Trust Review'],
    color: 'border-purple-500 bg-purple-50/50 text-purple-800'
  },
  {
    id: 'parlor_a',
    name: 'Parlor A (North Salon)',
    code: 'PARL-A',
    capacity: 60,
    type: 'parlor',
    features: ['60 Guest Capacity', 'Intimate Viewing Staging', 'Digital Photo Tribute Screen', 'Plush Parlor Seating'],
    color: 'border-rose-400 bg-rose-50/50 text-rose-800'
  },
  {
    id: 'parlor_b',
    name: 'Parlor B (Central Salon)',
    code: 'PARL-B',
    capacity: 50,
    type: 'parlor',
    features: ['50 Guest Capacity', 'Candlelit Viewing Alcove', 'Surround Sound Music', 'Floral Displays'],
    color: 'border-amber-400 bg-amber-50/50 text-amber-800'
  },
  {
    id: 'parlor_c',
    name: 'Parlor C (South Salon)',
    code: 'PARL-C',
    capacity: 40,
    type: 'parlor',
    features: ['40 Guest Capacity', 'Quiet Family Vigils', 'Private Visitation', 'Historic Mahogany Millwork'],
    color: 'border-teal-500 bg-teal-50/50 text-teal-800'
  },
  {
    id: 'parlor_ab',
    name: 'Parlor AB (Combined Salons A+B)',
    code: 'PARL-AB',
    capacity: 110,
    type: 'parlor',
    features: ['110 Guest Capacity', 'Double Salon Layout', 'Dual Viewing Areas', 'Broad Family Reception Area'],
    color: 'border-orange-500 bg-orange-50/50 text-orange-800'
  },
  {
    id: 'parlor_abc',
    name: 'Parlor ABC (Grand Combined Suite)',
    code: 'PARL-ABC',
    capacity: 150,
    type: 'parlor',
    features: ['150 Guest Capacity', 'Full Floor Parlor Suite', 'Triple Display Screens', 'Grand Cortege Staging'],
    color: 'border-red-600 bg-red-100/50 text-red-900 font-bold'
  },
  {
    id: 'church',
    name: 'Church (Offsite Sanctuary Cortege)',
    code: 'CHURCH',
    capacity: 500,
    type: 'offsite',
    features: ['Cathedral / Church Service', 'Director Escort & Pallbearers', 'Hearse & Livery Procession Staging'],
    color: 'border-indigo-500 bg-indigo-50/50 text-indigo-800'
  },
  {
    id: 'other',
    name: 'Other (Crematory / Graveside)',
    code: 'OTHER',
    capacity: 100,
    type: 'offsite',
    features: ['Woodlawn Crematory Witness Room', 'Cemetery Graveside Pavilion', 'External Logistics'],
    color: 'border-slate-500 bg-slate-50/50 text-slate-800'
  }
];

export const INITIAL_CALENDAR_EVENTS: RoomScheduleEvent[] = [
  {
    id: 'evt-conf-101',
    roomId: 'family_suite_1',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    decedentName: 'Dr. Marcus Aurelius Vance',
    title: 'Family In-Person Arrangement Conference (Eleanor Vance & Family)',
    date: '2026-09-21',
    startTime: '10:00',
    endTime: '11:30',
    serviceType: 'Arrangement Conference',
    assignedDirector: 'Beth Crowe',
    assignedDirectorId: 'dir-fd-1',
    estimatedGuests: 4,
    notes: 'Family informant Eleanor Vance and children meeting in Arrangement Suite A to finalize Form AP-47, casket, livery cortege, and floral selections.',
    status: 'confirmed'
  },
  {
    id: 'evt-101',
    roomId: 'chapel_1',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    decedentName: 'Dr. Marcus Aurelius Vance',
    title: 'Memorial Service & Navy Color Guard Honors',
    date: '2026-09-22',
    startTime: '11:00',
    endTime: '13:00',
    serviceType: 'Memorial Service',
    assignedDirector: 'Beth Crowe',
    assignedDirectorId: 'dir-fd-1',
    officiantName: 'Rev. Dr. Calvin Butts IV',
    organistOrMusic: 'Marcus Roberts Ensemble',
    livestreamActive: true,
    woodlawnDepartureTime: '13:30',
    estimatedGuests: 115,
    notes: 'Navy Color Guard will perform military flag folding in Chapel 1 at 12:45 PM.',
    status: 'confirmed'
  },
  {
    id: 'evt-102',
    roomId: 'repast_room',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    decedentName: 'Dr. Marcus Aurelius Vance',
    title: 'Family & Community Repast Reception',
    date: '2026-09-22',
    startTime: '13:30',
    endTime: '16:00',
    serviceType: 'Repast Gathering',
    assignedDirector: 'Beth Crowe',
    assignedDirectorId: 'dir-fd-1',
    estimatedGuests: 70,
    notes: "Harlem Soul Catering delivery scheduled for 1:00 PM. Repast room setup with 10 banquet tables.",
    status: 'confirmed'
  },
  {
    id: 'evt-103',
    roomId: 'chapel_2',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-090',
    decedentName: 'Bernice Jackson-Taylor',
    title: 'Celebration of Life & Gospel Homegoing',
    date: '2026-09-21',
    startTime: '14:00',
    endTime: '16:30',
    serviceType: 'Memorial Service',
    assignedDirector: 'Chontel Harris',
    assignedDirectorId: 'dir-fd-2',
    officiantName: 'Rev. Dr. Calvin Butts',
    organistOrMusic: 'Abyssinian Gospel Choir',
    livestreamActive: true,
    estimatedGuests: 105,
    notes: '360 Digi-Tribute screens active with family heritage photo collection.',
    status: 'confirmed'
  },
  {
    id: 'evt-104',
    roomId: 'parlor_ab',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    decedentName: 'Dr. Marcus Aurelius Vance',
    title: 'Family Evening Wake & Quiet Reflection Vigil',
    date: '2026-09-21',
    startTime: '16:00',
    endTime: '19:00',
    serviceType: 'Viewing / Wake',
    assignedDirector: 'Beth Crowe',
    assignedDirectorId: 'dir-fd-1',
    organistOrMusic: 'Recorded Choral Preludes',
    livestreamActive: false,
    estimatedGuests: 85,
    notes: 'Combined Parlor AB setup. Floral sprays arranged in North & Central alcoves.',
    status: 'confirmed'
  },
  {
    id: 'evt-105',
    roomId: 'family_suite_1',
    caseId: 'case-003',
    caseNumber: 'BFH-2026-091',
    decedentName: 'Gregory Scott Sterling',
    title: 'Direct Cremation Intake & Vital Records Signing',
    date: '2026-09-19',
    startTime: '10:00',
    endTime: '11:30',
    serviceType: 'Arrangement Conference',
    assignedDirector: 'Unassigned (Claim Pending)',
    estimatedGuests: 3,
    notes: 'Sister Valerie Sterling attending to sign NYC EDRS and cremation authorization.',
    status: 'tentative'
  },
  {
    id: 'evt-106',
    roomId: 'church',
    caseId: 'case-004',
    caseNumber: 'BFH-2026-092',
    decedentName: 'Hon. Gwendolyn Baptiste-Mercer',
    title: 'Judicial Honors & Church Sanctuary Mass',
    date: '2026-09-20',
    startTime: '10:00',
    endTime: '13:00',
    serviceType: 'Memorial Service',
    assignedDirector: 'Leatrice Henry',
    assignedDirectorId: 'dir-fd-3',
    officiantName: 'Bishop Horace C. Michael',
    organistOrMusic: 'Harlem Spiritual Choir',
    woodlawnDepartureTime: '13:30',
    estimatedGuests: 320,
    notes: 'Hearse and 2 Limo Buses departing 630 St Nicholas at 9:15 AM for church arrival.',
    status: 'confirmed'
  },
  {
    id: 'evt-107',
    roomId: 'chapel_1',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-090',
    decedentName: 'Bernice Jackson-Taylor',
    title: 'Morning Prayer & Family Blessing',
    date: '2026-09-23',
    startTime: '09:30',
    endTime: '11:00',
    serviceType: 'Family Visitation',
    assignedDirector: 'Chontel Harris',
    assignedDirectorId: 'dir-fd-2',
    officiantName: 'Deacon Arthur Washington',
    organistOrMusic: 'Sanctuary Organist',
    livestreamActive: true,
    estimatedGuests: 60,
    notes: 'Immediate family gathering prior to cemetery procession.',
    status: 'confirmed'
  },
  {
    id: 'evt-108',
    roomId: 'parlor_a',
    caseId: 'case-005',
    caseNumber: 'BFH-2026-093',
    decedentName: 'Rev. Emmanuel Kofi Mensah',
    title: 'Ghanaian Traditional Vigils & Wake',
    date: '2026-09-24',
    startTime: '18:00',
    endTime: '22:00',
    serviceType: 'Viewing / Wake',
    assignedDirector: 'Billy McDonald',
    assignedDirectorId: 'dir-fd-4',
    estimatedGuests: 95,
    notes: 'Kente cloth display and traditional choral vigil.',
    status: 'confirmed'
  },
  {
    id: 'evt-109',
    roomId: 'repast_room',
    caseId: 'case-004',
    caseNumber: 'BFH-2026-092',
    decedentName: 'Hon. Gwendolyn Baptiste-Mercer',
    title: 'Judicial Bar Association Memorial Luncheon',
    date: '2026-09-25',
    startTime: '12:00',
    endTime: '15:00',
    serviceType: 'Repast Gathering',
    assignedDirector: 'Leatrice Henry',
    assignedDirectorId: 'dir-fd-3',
    estimatedGuests: 75,
    notes: 'Buffet setup with Harlem Jazz background music.',
    status: 'confirmed'
  },
  {
    id: 'evt-110',
    roomId: 'chapel_2',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    decedentName: 'Dr. Marcus Aurelius Vance',
    title: 'Scholars & Community Memorial Symposium',
    date: '2026-09-26',
    startTime: '14:00',
    endTime: '17:00',
    serviceType: 'Memorial Service',
    assignedDirector: 'Beth Crowe',
    assignedDirectorId: 'dir-fd-1',
    officiantName: 'Columbia Faculty Liaison',
    livestreamActive: true,
    estimatedGuests: 110,
    notes: 'Live broadcast to university alumni network.',
    status: 'confirmed'
  },
  {
    id: 'evt-111',
    roomId: 'chapel_1',
    caseId: 'case-004',
    caseNumber: 'BFH-2026-092',
    decedentName: 'Hon. Gwendolyn Baptiste-Mercer',
    title: 'Memorial Celebration of Life',
    date: '2026-09-28',
    startTime: '10:30',
    endTime: '12:30',
    serviceType: 'Memorial Service',
    assignedDirector: 'Leatrice Henry',
    assignedDirectorId: 'dir-fd-3',
    officiantName: 'Pastor Thomas Wright',
    livestreamActive: true,
    estimatedGuests: 120,
    notes: 'Full sanctuary floral setup with grand piano.',
    status: 'confirmed'
  },
  {
    id: 'evt-112',
    roomId: 'family_suite_2',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-090',
    decedentName: 'Bernice Jackson-Taylor',
    title: 'Pre-Need & Aftercare Family Conference',
    date: '2026-09-30',
    startTime: '15:00',
    endTime: '16:30',
    serviceType: 'Pre-Need Consultation',
    assignedDirector: 'Chontel Harris',
    assignedDirectorId: 'dir-fd-2',
    estimatedGuests: 6,
    notes: 'Reviewing estate and eternal remembrance options.',
    status: 'confirmed'
  },
  {
    id: 'evt-113',
    roomId: 'chapel_1',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    decedentName: 'Dr. Marcus Aurelius Vance',
    title: 'Harlem Heritage Foundation Tribute',
    date: '2026-10-03',
    startTime: '11:00',
    endTime: '13:30',
    serviceType: 'Memorial Service',
    assignedDirector: 'Dean Wilson',
    assignedDirectorId: 'dir-fd-5',
    livestreamActive: true,
    estimatedGuests: 120,
    notes: 'Historical society honorary service.',
    status: 'confirmed'
  }
];

export const INITIAL_LIVERY_HOLDS: VehicleHoldRequest[] = [
  {
    id: 'liv-001',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    familyReferenceName: 'Vance Family',
    vendorName: 'NYC Royal Coach Livery & Funeral Cars',
    vendorPhone: '(718) 555-0144',
    vehicleType: 'Limo Bus',
    vehicleSize: 'Limo Bus 16-seater',
    quantity: 1,
    serviceDate: '2026-09-22',
    serviceTime: '10:00 AM',
    status: 'vendor_confirmed',
    notice48HrAcknowledged: true,
    notes: 'Hold confirmed by dispatcher Carlos. Family requested 16-seater for extended family from St. Nicholas to Woodlawn.',
    requestedAt: '2026-09-18 10:30 AM',
    confirmedAt: '2026-09-18 11:15 AM',
    reminderSchedule: {
      reminder48h: { scheduledDate: '2026-09-20 09:00 AM', sent: false },
      reminder24h: { scheduledDate: '2026-09-21 09:00 AM', sent: false },
      morningAlert: { scheduledDate: '2026-09-22 07:00 AM', sent: false }
    }
  },
  {
    id: 'liv-002',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    familyReferenceName: 'Vance Family',
    vendorName: 'Empire State Funeral Coach & Hearse',
    vendorPhone: '(212) 555-0988',
    vehicleType: 'Hearse',
    vehicleSize: 'Custom / Standard',
    quantity: 1,
    serviceDate: '2026-09-22',
    serviceTime: '10:30 AM',
    status: 'vendor_confirmed',
    notice48HrAcknowledged: true,
    notes: 'Cadillac Masterpiece Hearse with Navy veteran flag mounts.',
    requestedAt: '2026-09-18 10:30 AM',
    confirmedAt: '2026-09-18 10:55 AM',
    reminderSchedule: {
      reminder48h: { scheduledDate: '2026-09-20 09:00 AM', sent: false },
      reminder24h: { scheduledDate: '2026-09-21 09:00 AM', sent: false },
      morningAlert: { scheduledDate: '2026-09-22 07:00 AM', sent: false }
    }
  },
  {
    id: 'liv-003',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-090',
    familyReferenceName: 'Robinson Family',
    vendorName: 'Harlem Luxury Livery Service',
    vendorPhone: '(917) 555-0322',
    vehicleType: 'Limo',
    vehicleSize: 'Limo 8-seater',
    quantity: 2,
    serviceDate: '2026-09-21',
    serviceTime: '01:00 PM',
    status: 'hold_requested',
    notice48HrAcknowledged: true,
    notes: 'Hold requested via SMS. Awaiting confirmation from dispatcher Malik.',
    requestedAt: '2026-09-18 02:45 PM',
    reminderSchedule: {
      reminder48h: { scheduledDate: '2026-09-19 09:00 AM', sent: false },
      reminder24h: { scheduledDate: '2026-09-20 09:00 AM', sent: false },
      morningAlert: { scheduledDate: '2026-09-21 07:00 AM', sent: false }
    }
  }
];


export const INITIAL_NOTIFICATIONS: SimulatedNotification[] = [
  {
    id: 'notif-001',
    caseId: 'case-001',
    decedentName: 'Dr. Marcus Aurelius Vance',
    recipientName: 'Eleanor Vance',
    recipientPhone: '(917) 555-0182',
    recipientEmail: 'eleanor.vance@harlemheritage.org',
    channel: 'sms',
    type: 'safe_arrival',
    title: 'Safe Arrival at 630 St. Nicholas Ave',
    bodyText: "Dear Mrs. Vance, this is Jason Benta from Benta's Funeral Home. We want to gently reassure you that your beloved husband Dr. Marcus Aurelius Vance has safely arrived into our dignified care at 630 Saint Nicholas Ave. Our team is attending to him with the utmost reverence.",
    sentAt: 'Today 11:30 AM',
    status: 'read',
    actionUrl: '#portal',
    actionButtonText: 'View Family Portal',
    metadata: {
      carrier: 'Verizon Wireless (NYC 5G)',
      deliveryLatencyMs: 184,
      twilioMessageSid: 'SM8fa2904b7c194a8e932b189a01',
      readReceiptTimestamp: 'Today 11:32 AM'
    }
  },
  {
    id: 'notif-002',
    caseId: 'case-001',
    decedentName: 'Dr. Marcus Aurelius Vance',
    recipientName: 'Eleanor Vance',
    recipientPhone: '(917) 555-0182',
    recipientEmail: 'eleanor.vance@harlemheritage.org',
    channel: 'sms',
    type: 'esign_request',
    title: 'Legal Authorization Bundle Ready for E-Signature',
    bodyText: "Benta's Care Alert: Important legal authorization documents (NYC EDRS Worksheet & Woodlawn Cremation Authorization) for Dr. Marcus Aurelius Vance are prepared for your review and secure digital signature.",
    sentAt: 'Today 1:15 PM',
    status: 'delivered',
    actionUrl: '#esign',
    actionButtonText: 'Sign Legal Documents',
    metadata: {
      carrier: 'Verizon Wireless (NYC 5G)',
      deliveryLatencyMs: 210,
      twilioMessageSid: 'SM4ca8105d6e293b7f819a024c55',
      readReceiptTimestamp: 'Today 1:16 PM'
    }
  },
  {
    id: 'notif-003',
    caseId: 'case-002',
    decedentName: 'Gloria Jean Robinson',
    recipientName: 'Arthur Robinson',
    recipientPhone: '(646) 555-0199',
    recipientEmail: 'arobinson@abyssinian.org',
    channel: 'sms',
    type: 'service_schedule',
    title: 'Celebration of Life Schedule & 4K Livestream Link',
    bodyText: "Memorial Service Reminder: The Celebration of Life for Gloria Jean Robinson is confirmed for Sunday, Sept 21 at 2:00 PM in Parlor A (Saint Nicholas Main Chapel, 120 Guests). Family & friends who cannot attend in person may join the 4K HD livestream broadcast here.",
    sentAt: 'Yesterday 4:45 PM',
    status: 'read',
    actionUrl: '#stream',
    actionButtonText: 'Open 4K HD Livestream',
    metadata: {
      carrier: 'T-Mobile US',
      deliveryLatencyMs: 142,
      twilioMessageSid: 'SM7de1902a3b451c8e90214c7811',
      readReceiptTimestamp: 'Yesterday 4:48 PM'
    }
  },
  {
    id: 'notif-004',
    caseId: 'case-004',
    decedentName: 'Evelyn Marie Dupont',
    recipientName: 'Jean-Luc Dupont',
    recipientPhone: '(917) 555-4811',
    recipientEmail: 'jdupont@sorbonne.fr',
    channel: 'sms',
    type: 'woodlawn_departure',
    title: 'Dignified Transport Escort to Woodlawn Crematory',
    bodyText: "Benta's Logistics Update: Dignified cortege transport for Evelyn Marie Dupont has departed 630 St. Nicholas Ave under Director Benta escort heading to Woodlawn Crematory (Bronx, NY). Estimated arrival: 5:15 PM.",
    sentAt: 'Sept 16, 4:30 PM',
    status: 'read',
    actionUrl: '#logistics',
    actionButtonText: 'Track Logistics',
    metadata: {
      carrier: 'AT&T Mobility',
      deliveryLatencyMs: 198,
      twilioMessageSid: 'SM1aa9082b4c109e8f492015d833',
      readReceiptTimestamp: 'Sept 16, 4:32 PM'
    }
  },
  {
    id: 'notif-005',
    caseId: 'case-003',
    decedentName: 'Rev. Sterling Coleman',
    recipientName: 'Rev. Sterling Coleman Jr.',
    recipientPhone: '(212) 555-8821',
    recipientEmail: 'scoleman.jr@canaanbaptist.org',
    channel: 'sms',
    type: 'aftercare_checkin',
    title: 'Day 7 Grief Support & Family Check-in',
    bodyText: "Dear Pastor Coleman, the entire Benta family is holding you and your congregation in our prayers 7 days following the homegoing celebration of your beloved father. If we can assist with certified copies or memorial tributes, we remain 24/7 at your side.",
    sentAt: 'Sept 15, 10:00 AM',
    status: 'read',
    actionUrl: '#aftercare',
    actionButtonText: 'Access Grief Resources',
    metadata: {
      carrier: 'Verizon Wireless',
      deliveryLatencyMs: 165,
      twilioMessageSid: 'SM3bb8109d7e301f7c819283f120',
      readReceiptTimestamp: 'Sept 15, 10:14 AM'
    }
  }
];

export const INITIAL_SERVICE_PARTNERS: ServicePartnerContact[] = [
  // --- HAIR / RESTORATIVE GROOMING ---
  {
    id: 'sp-hair-01',
    fullName: 'Kelvin Brooks',
    roleTitle: 'Master Restorative Barber & Stylist',
    category: 'hairdresser_barber',
    phone: '(646) 508-3474',
    email: 'kbrooks@harlemhaircare.com',
    organization: 'Brooks Restorative Grooming Lounge',
    status: 'active',
    rateInfo: '$175 / styling session',
    notes: 'Harlem master barber. Precision hairlines, restorative facial grooming, and cosmetic presentation.',
    avatarInitials: 'KB'
  },
  {
    id: 'sp-hair-02',
    fullName: 'Tanisha Carey',
    roleTitle: 'Licensed Cosmetologist & Hair Stylist',
    category: 'hairdresser_barber',
    phone: '(347) 605-8707',
    email: 'tcarey@studiocareynyc.com',
    organization: 'Carey Hair & Cosmetology Studio',
    status: 'active',
    rateInfo: '$225 / full service',
    notes: 'Specializes in textured hair artistry, custom wigs, silk press, and delicate cosmetic styling.',
    avatarInitials: 'TC'
  },
  {
    id: 'sp-hair-03',
    fullName: 'Renee- Zomelia Thomas',
    roleTitle: 'Senior Hair Stylist & Cosmetologist',
    category: 'hairdresser_barber',
    phone: '(646) 285-2851',
    email: 'rzthomas@harlembeauty.nyc',
    organization: 'Zomelia Thomas Hair Design',
    status: 'active',
    rateInfo: '$200 / styling session',
    notes: 'Expert cosmetologist for funeral and memorial presentations, wig maintenance, and cosmetic care.',
    avatarInitials: 'RT'
  },
  {
    id: 'sp-001',
    fullName: 'Marcus "Cuts" Jenkins',
    roleTitle: 'Master Restorative Barber & Grooming Specialist',
    category: 'hairdresser_barber',
    phone: '(212) 555-0419',
    email: 'marcus@harlemcuts.com',
    organization: 'Apollo Grooming & Barber Lounge (Harlem)',
    status: 'active',
    rateInfo: '$175 / session (Styling & Shave)',
    notes: '25 years experience in Harlem. Specialized in restorative facial grooming, precision hairlines, and peaceful cosmetic styling.',
    avatarInitials: 'MJ'
  },
  {
    id: 'sp-002',
    fullName: 'Danielle St. Claire',
    roleTitle: 'Licensed Cosmetologist & Hairdresser',
    category: 'hairdresser_barber',
    phone: '(917) 555-8842',
    email: 'danielle@stclaireglamour.nyc',
    organization: 'St. Claire Beauty Suite & Restorative Care',
    status: 'active',
    rateInfo: '$250 / service (Full Hair, Crown & Nails)',
    notes: 'Specializes in textured hair styling, custom wigs, press & curl, and delicate nail artistry.',
    avatarInitials: 'DS'
  },

  // --- MINISTERS & CLERGY ---
  {
    id: 'sp-min-01',
    fullName: 'Rev. James Logan',
    roleTitle: 'Senior Pastor & Homegoing Minister',
    category: 'minister_clergy',
    phone: '(201) 274-4430',
    email: 'revjlogan@harlemministries.org',
    organization: 'Metropolitan Clergy Council',
    status: 'active',
    rateInfo: '$300 Honorarium',
    notes: 'Experienced in comforting family scripture reading, prayers of comfort, and celebratory eulogies.',
    avatarInitials: 'JL'
  },
  {
    id: 'sp-min-02',
    fullName: 'Pas. Terrance Kennedy',
    roleTitle: 'Pastor & Liturgical Celebrant',
    category: 'minister_clergy',
    phone: '(917) 763-6714',
    email: 'pastorkennedy@harlemgospel.org',
    organization: 'New Life Christian Fellowship',
    status: 'active',
    rateInfo: '$300 Honorarium',
    notes: 'Provides pastoral leadership, family homegoing eulogies, and scripture liturgy.',
    avatarInitials: 'TK'
  },
  {
    id: 'sp-min-03',
    fullName: 'Pas. Gooding',
    roleTitle: 'Pastor & Eulogist',
    category: 'minister_clergy',
    phone: '(917) 769-4449',
    email: 'pasgooding@faithharlem.org',
    organization: 'Harlem Faith Community Alliance',
    status: 'active',
    rateInfo: '$300 Honorarium',
    notes: 'Specializes in uplifting homegoing sermons and interfaith prayers of comfort.',
    avatarInitials: 'PG'
  },
  {
    id: 'sp-min-04',
    fullName: 'Rev. Eric Turner',
    roleTitle: 'Senior Clergy & Memorial Celebrant',
    category: 'minister_clergy',
    phone: '(347) 490-6847',
    email: 'revericturner@turnerministries.org',
    organization: 'Turner Fellowship Ministries',
    status: 'active',
    rateInfo: '$300 Honorarium',
    notes: 'Orator and pastor providing comforting funeral liturgies and memorial celebrations.',
    avatarInitials: 'ET'
  },
  {
    id: 'sp-009',
    fullName: 'Rev. Dr. Calvin O. Butts IV',
    roleTitle: 'Senior Clergy & Memorial Eulogist',
    category: 'minister_clergy',
    phone: '(212) 555-8833',
    email: 'cbutts@harlemfaithalliance.org',
    organization: 'Harlem Interfaith Clergy Council',
    status: 'active',
    rateInfo: '$350 Honorarium',
    notes: 'Renowned Harlem pastor and orator. Experienced in comforting families across Christian, Baptist, Methodist, and non-denominational backgrounds.',
    avatarInitials: 'CB'
  },
  {
    id: 'sp-010',
    fullName: 'Pastor Thomas Wright',
    roleTitle: 'Senior Pastor & Homegoing Celebrant',
    category: 'minister_clergy',
    phone: '(917) 555-9912',
    email: 'pastor.wright@canaanharlem.org',
    organization: 'Canaan Baptist Church of Christ',
    status: 'active',
    rateInfo: '$300 Honorarium',
    notes: 'Provides compassionate pre-service family prayer, scripture reading, and inspiring eulogies.',
    avatarInitials: 'TW'
  },
  {
    id: 'sp-011',
    fullName: 'Elder Janice Montgomery',
    roleTitle: 'Certified Interfaith Funeral Celebrant & Life Story Eulogist',
    category: 'minister_clergy',
    phone: '(212) 555-6670',
    email: 'janice@celebrantnyc.com',
    organization: 'NYC Certified Celebrants Network',
    status: 'active',
    rateInfo: '$350 / customized celebration of life',
    notes: 'Specializes in personalized non-denominational, spiritual, and customized biographical celebrations of life.',
    avatarInitials: 'JM'
  },

  // --- ORGANISTS & MUSICIANS ---
  {
    id: 'sp-mus-01',
    fullName: 'Brvon Neal',
    roleTitle: 'Principal Sanctuary Organist & Pianist',
    category: 'musician_organist',
    phone: '(347) 993-5579',
    email: 'bneal@harlemmusic.org',
    organization: 'Harlem Music Ministry',
    status: 'active',
    rateInfo: '$250 / service (Prelude, Hymns, Postlude)',
    notes: 'Master pipe organist and classical accompanist for church and chapel celebrations.',
    avatarInitials: 'BN'
  },
  {
    id: 'sp-mus-02',
    fullName: 'Fabian Ralph',
    roleTitle: 'Concert Organist & Vocal Accompanist',
    category: 'musician_organist',
    phone: '(646) 245-9791',
    email: 'fralph@metrogospelmusic.com',
    organization: 'Metropolitan Gospel Organists Guild',
    status: 'active',
    rateInfo: '$275 / service',
    notes: 'Renowned organist specializing in traditional hymns, gospel anthems, and prelude interludes.',
    avatarInitials: 'FR'
  },
  {
    id: 'sp-mus-03',
    fullName: 'Pas. Terrance Kennedy (Organist)',
    roleTitle: 'Minister of Music & Sanctuary Organist',
    category: 'musician_organist',
    phone: '(917) 763-6714',
    email: 'pastorkennedy.music@harlemgospel.org',
    organization: 'New Life Christian Fellowship',
    status: 'active',
    rateInfo: '$250 / service',
    notes: 'Dual ministry: Hammond B3 gospel organist and musical accompanist.',
    avatarInitials: 'TK'
  },
  {
    id: 'sp-mus-04',
    fullName: 'Rev. Eric Turner (Organist)',
    roleTitle: 'Liturgical Organist & Pianist',
    category: 'musician_organist',
    phone: '(347) 490-6847',
    email: 'revericturner.music@turnerministries.org',
    organization: 'Turner Fellowship Ministries',
    status: 'active',
    rateInfo: '$250 / service',
    notes: 'Sanctuary pipe and electronic organist for sacred services.',
    avatarInitials: 'ET'
  },
  {
    id: 'sp-007',
    fullName: 'Marcus Roberts',
    roleTitle: 'Principal Sanctuary Organist & Concert Pianist',
    category: 'musician_organist',
    phone: '(212) 555-3920',
    email: 'mroberts@harlemclassical.org',
    organization: 'Abyssinian Music Ministry / Harlem Choral Trust',
    status: 'active',
    rateInfo: '$300 / service (Prelude, 3 Hymns, Solo, Postlude)',
    notes: 'Master of classical pipe organ, Hammond B3 gospel organ, and classical piano accompaniments.',
    avatarInitials: 'MR'
  },
  {
    id: 'sp-008',
    fullName: 'Sister Angela Davis-Thorpe',
    roleTitle: 'Gospel Soloist & Vocal Choral Director',
    category: 'musician_organist',
    phone: '(646) 555-1178',
    email: 'angela.soloist@faithharlem.org',
    organization: 'Harlem Gospel Heritage Vocalists',
    status: 'active',
    rateInfo: '$225 / 2 solo pieces ("Precious Lord", "Going Up Yonder")',
    notes: 'Acclaimed gospel vocalist. Specializes in traditional African American spirituals and modern gospel anthems.',
    avatarInitials: 'AD'
  },

  // --- FUNERAL DIRECTORS (TRADE DIRECTORS) ---
  {
    id: 'sp-trade-01',
    fullName: 'Curvelle Larcque',
    roleTitle: 'Licensed Trade Funeral Director',
    category: 'outside_director',
    phone: '(347) 724-1998',
    email: 'clarcque@nytradefuneral.org',
    organization: 'New York State Licensed Trade Directors Guild',
    status: 'active',
    rateInfo: '$350 / 4-hour chapel service • $550 full day',
    notes: 'Licensed trade director available for chapel services, church liturgies, and cemetery transfers.',
    avatarInitials: 'CL'
  },
  {
    id: 'sp-trade-02',
    fullName: 'Pierre Cobb',
    roleTitle: 'Licensed Trade Funeral Director',
    category: 'outside_director',
    phone: '(718) 350-1441',
    email: 'pcobb@nytradefuneral.org',
    organization: 'New York State Licensed Trade Directors Guild',
    status: 'active',
    rateInfo: '$350 / 4-hour chapel service • $550 full day',
    notes: 'Licensed trade director specializing in cortege coordination and family ceremonies.',
    avatarInitials: 'PC'
  },
  {
    id: 'sp-trade-03',
    fullName: 'Cory Vaughn-Daniels',
    roleTitle: 'Licensed Trade Funeral Director',
    category: 'outside_director',
    phone: '(646) 701-1966',
    email: 'cvdaniels@nytradefuneral.org',
    organization: 'Harlem Independent Funeral Directing Services',
    status: 'active',
    rateInfo: '$350 / 4-hour chapel service • $550 full day',
    notes: 'Licensed trade director with extensive experience in Harlem memorials and cemetery committals.',
    avatarInitials: 'CD'
  },
  {
    id: 'sp-trade-04',
    fullName: 'Sylvia Saxton',
    roleTitle: 'Licensed Trade Funeral Director',
    category: 'outside_director',
    phone: '(862) 368-4706',
    email: 'ssaxton@nytradefuneral.org',
    organization: 'New York State Licensed Trade Directors Guild',
    status: 'active',
    rateInfo: '$350 / 4-hour chapel service • $550 full day',
    notes: 'Licensed trade director skilled in arrangement protocol, family care, and service direction.',
    avatarInitials: 'SS'
  },
  {
    id: 'sp-trade-05',
    fullName: 'Delyce Edwards',
    roleTitle: 'Licensed Trade Funeral Director',
    category: 'outside_director',
    phone: '(646) 408-3350',
    email: 'dedwards@nytradefuneral.org',
    organization: 'New York State Licensed Trade Directors Guild',
    status: 'active',
    rateInfo: '$350 / 4-hour chapel service • $550 full day',
    notes: 'Licensed trade director for chapel viewings, church ceremonies, and graveside committals.',
    avatarInitials: 'DE'
  },
  {
    id: 'sp-003',
    fullName: 'Anthony R. Washington, LFD',
    roleTitle: 'Senior Trade Funeral Director (NYS Lic #14892)',
    category: 'outside_director',
    phone: '(646) 555-3310',
    email: 'anthony.washington.lfd@metroguild.org',
    organization: 'New York State Licensed Trade Directors Guild',
    status: 'active',
    rateInfo: '$400 / 4-hour chapel coverage • $600 / full day & cortege',
    notes: 'Available for per diem director coverage, evening wakes, Woodlawn crematory cortege management, and graveside committals.',
    avatarInitials: 'AW'
  },
  {
    id: 'sp-004',
    fullName: 'Cheryl Robinson, LFD',
    roleTitle: 'Per Diem Funeral Director & Service Escort',
    category: 'outside_director',
    phone: '(212) 555-7791',
    email: 'crobinson.director@gmail.com',
    organization: 'Harlem Independent Funeral Directing Services',
    status: 'on_call',
    rateInfo: '$350 / 4-hour service',
    notes: 'Expert in Baptist & Episcopal liturgy protocols, family greeting, and VIP dignitary escorts.',
    avatarInitials: 'CR'
  },

  // --- PALLBEARERS & CORTEGE GUILD ---
  {
    id: 'sp-005',
    fullName: 'Harlem Dignified Bearers Guild (Lead: Jamal Hayes)',
    roleTitle: 'Guild Lead & 6-Member Active Pallbearer Corps',
    category: 'pallbearer',
    phone: '(347) 555-9011',
    email: 'cortege@harlembearers.org',
    organization: 'Harlem Formal Pallbearer & Cortege Guild',
    status: 'active',
    rateInfo: '$600 for complete 6-member squad (White Gloves & Black Suits)',
    notes: 'Professional uniformed pallbearers. Synchronized marching, military cadence step, hearse transfer, and graveside carrying.',
    avatarInitials: 'HB'
  },
  {
    id: 'sp-006',
    fullName: 'Derrick "Doc" Vance',
    roleTitle: 'Professional Pallbearer & Cortege Marshal',
    category: 'pallbearer',
    phone: '(917) 555-2248',
    email: 'dvance.bearer@gmail.com',
    organization: 'Independent Bearer Corps',
    status: 'active',
    rateInfo: '$125 / service',
    notes: 'Experienced lead bearer and church usher coordinator.',
    avatarInitials: 'DV'
  },

  // --- BROADCAST AV & STREAMING ---
  {
    id: 'sp-012',
    fullName: 'Marcus Vance',
    roleTitle: 'Lead Sanctuary Live Webcast & Sound Engineer',
    category: 'broadcast_av_tech',
    phone: '(212) 555-4920',
    email: 'marcus@harlembroadcasting.tv',
    organization: 'Harlem Live Media & Sanctuary AV Systems',
    status: 'active',
    rateInfo: '$250 / service (4K PTZ Multi-Cam, Direct Soundboard & Cloud Stream)',
    notes: 'Certified operator for Benta Chapel 1, Chapel 2, and Repast Room PTZ camera arrays. Manages RTMP feeds, private family PIN security, and instant 4K master archival.',
    avatarInitials: 'MV'
  },
  {
    id: 'sp-013',
    fullName: 'Jasmine Thorne',
    roleTitle: 'Live Stream Producer & Repast Overflow Specialist',
    category: 'broadcast_av_tech',
    phone: '(917) 555-6670',
    email: 'jasmine@metrostream.nyc',
    organization: 'Metro Sanctuary Streaming Solutions',
    status: 'active',
    rateInfo: '$225 / service',
    notes: 'Expert in multi-angle live switching, virtual guest chat moderation, hymn lyrics overlay, and Repast Room overflow feeds.',
    avatarInitials: 'JT'
  }
];

export const INITIAL_PARTNER_REQUESTS: PartnerScheduleRequest[] = [
  // --- Case 001 (Dr. Marcus Aurelius Vance) ---
  {
    id: 'req-001',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    familyReferenceName: 'Vance Family',
    decedentName: 'Dr. Marcus Aurelius Vance',
    partnerId: 'sp-001',
    partnerName: 'Marcus "Cuts" Jenkins',
    partnerPhone: '(212) 555-0419',
    category: 'hairdresser_barber',
    roleTitle: 'Master Restorative Barber',
    serviceDate: '2026-09-21',
    callTime: '09:00 AM',
    serviceEndTime: '10:30 AM',
    venueLocation: '630 St. Nicholas Ave - Restorative Preparation Suite',
    specialInstructions: 'Family provided portrait photo from Columbia University faculty archives. Clean taper fade and neat mustache groom.',
    honorariumFee: '$175.00',
    status: 'confirmed',
    requestedAt: '2026-09-18 09:30 AM',
    confirmedAt: '2026-09-18 09:42 AM',
    responseDeadline: '2026-09-18 11:30 AM',
    isOverdue: false,
    directorFollowUpRequired: false,
    standbyBackupPartnerId: 'sp-hair-01',
    standbyBackupPartnerName: 'Kelvin Brooks',
    standbyBackupPartnerPhone: '(646) 508-3474',
    standbyBackupRoleTitle: 'Master Restorative Barber & Stylist',
    escalationStatus: 'normal',
    remindersCount: 0,
    recurringIntervalMinutes: 240,
    smsMessageDraft: "BFH SERVICE REQUEST: Dear Marcus Jenkins, Benta's Funeral Home requests your barber services for the Vance Family (Dr. Marcus Aurelius Vance, Case #BFH-2026-089) on Mon, Sept 21 at 9:00 AM. Location: 630 St. Nicholas Ave - Prep Suite. Fee: $175.00. Reply YES to confirm or NO if unavailable.",
    threadMessages: [
      {
        id: 'msg-001a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch (Jason Benta, LFD)",
        senderPhone: '(212) 281-8850',
        body: "BFH SERVICE REQUEST: Dear Marcus Jenkins, Benta's Funeral Home requests your barber services for the Vance Family (Dr. Marcus Aurelius Vance, Case #BFH-2026-089) on Mon, Sept 21 at 9:00 AM. Location: 630 St. Nicholas Ave - Prep Suite. Fee: $175.00. Reply YES to confirm or NO if unavailable.",
        timestamp: '2026-09-18 09:30 AM',
        status: 'delivered'
      },
      {
        id: 'msg-001b',
        sender: 'vendor',
        senderName: 'Marcus Jenkins (Apollo Barber Studio)',
        senderPhone: '(212) 555-0419',
        body: "YES, CONFIRMED. I have received the Columbia portrait reference and will arrive at 630 St. Nicholas at 8:45 AM Monday morning. - Marcus",
        timestamp: '2026-09-18 09:42 AM',
        status: 'read',
        quickActionTriggered: 'accept_confirm'
      }
    ]
  },
  {
    id: 'req-002',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    familyReferenceName: 'Vance Family',
    decedentName: 'Dr. Marcus Aurelius Vance',
    partnerId: 'sp-007',
    partnerName: 'Marcus Roberts',
    partnerPhone: '(212) 555-3920',
    category: 'musician_organist',
    roleTitle: 'Principal Sanctuary Organist',
    serviceDate: '2026-09-22',
    callTime: '10:15 AM',
    serviceEndTime: '01:15 PM',
    venueLocation: 'Chapel 1 (Main Sanctuary, 120 Guests)',
    specialInstructions: 'Navy Military Color Guard processional hymns + "Navy Hymn (Eternal Father, Strong to Save)" and "Great Is Thy Faithfulness".',
    honorariumFee: '$300.00',
    status: 'confirmed',
    requestedAt: '2026-09-18 10:00 AM',
    confirmedAt: '2026-09-18 10:18 AM',
    responseDeadline: '2026-09-18 12:00 PM',
    isOverdue: false,
    directorFollowUpRequired: false,
    standbyBackupPartnerId: 'sp-mus-01',
    standbyBackupPartnerName: 'Brvon Neal',
    standbyBackupPartnerPhone: '(347) 993-5579',
    standbyBackupRoleTitle: 'Principal Sanctuary Organist & Pianist',
    escalationStatus: 'normal',
    remindersCount: 0,
    recurringIntervalMinutes: 240,
    smsMessageDraft: "BFH SERVICE REQUEST: Dear Marcus Roberts, Benta's Funeral Home requests your organist services for the Vance Family (Dr. Marcus Aurelius Vance, Case #BFH-2026-089) on Tue, Sept 22 at 10:15 AM in Chapel 1. Fee: $300.00. Reply YES to confirm or NO if unavailable.",
    threadMessages: [
      {
        id: 'msg-002a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch (Jason Benta, LFD)",
        senderPhone: '(212) 281-8850',
        body: "BFH SERVICE REQUEST: Dear Marcus Roberts, Benta's Funeral Home requests your organist services for the Vance Family (Dr. Marcus Aurelius Vance, Case #BFH-2026-089) on Tue, Sept 22 at 10:15 AM in Chapel 1. Fee: $300.00. Reply YES to confirm or NO if unavailable.",
        timestamp: '2026-09-18 10:00 AM',
        status: 'delivered'
      },
      {
        id: 'msg-002b',
        sender: 'vendor',
        senderName: 'Marcus Roberts (Sanctuary Organist)',
        senderPhone: '(212) 555-3920',
        body: "YES, CONFIRMED. I have prepared the Navy Hymn and Great Is Thy Faithfulness for Chapel 1. See you Tuesday at 10:00 AM. - Marcus Roberts",
        timestamp: '2026-09-18 10:18 AM',
        status: 'read',
        quickActionTriggered: 'accept_confirm'
      }
    ]
  },
  {
    id: 'req-003',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    familyReferenceName: 'Vance Family',
    decedentName: 'Dr. Marcus Aurelius Vance',
    partnerId: 'sp-005',
    partnerName: 'Harlem Dignified Bearers Guild (Jamal Hayes)',
    partnerPhone: '(347) 555-9011',
    category: 'pallbearer',
    roleTitle: 'Guild Lead & 6 Pallbearers',
    serviceDate: '2026-09-22',
    callTime: '10:30 AM',
    serviceEndTime: '03:30 PM',
    venueLocation: 'Chapel 1 to Woodlawn Crematory Procession',
    specialInstructions: 'Formal white glove cortege squad. Chapel 1 transfer to Master Hearse, escort cortege up FDR to Woodlawn Crematory Bronx.',
    honorariumFee: '$600.00',
    status: 'overdue_unconfirmed',
    requestedAt: '2026-09-18 08:30 AM',
    responseDeadline: '2026-09-18 11:30 AM (Expired 3h ago)',
    isOverdue: true,
    overdueMinutes: 180,
    urgencyLevel: 'critical',
    directorFollowUpRequired: true,
    standbyBackupPartnerId: 'sp-006',
    standbyBackupPartnerName: 'Derrick "Doc" Vance & Bearers Squad',
    standbyBackupPartnerPhone: '(917) 555-2248',
    standbyBackupRoleTitle: 'Professional Pallbearer & Cortege Marshal',
    escalationStatus: 'overdue_director_alert',
    remindersCount: 2,
    lastReminderAt: '2026-09-18 11:30 AM',
    recurringIntervalMinutes: 120,
    smsMessageDraft: "URGENT BFH DISPATCH ALERT: Dear Jamal Hayes (Harlem Bearers Guild), Benta's Funeral Home urgently requires confirmation for the Vance Family (Dr. Marcus Aurelius Vance, Case #BFH-2026-089) on Tue, Sept 22 at 10:30 AM. Please reply YES immediately or 1-click fallback will cascade to Standby Bearers Squad.",
    threadMessages: [
      {
        id: 'msg-003a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch (Jason Benta, LFD)",
        senderPhone: '(212) 281-8850',
        body: "BFH SERVICE REQUEST: Dear Harlem Bearers Guild, Benta's Funeral Home requests 6 Pallbearers for the Vance Family (Dr. Marcus Aurelius Vance, Case #BFH-2026-089) on Tue, Sept 22 at 10:30 AM in Chapel 1 to Woodlawn. Attire: Black suits/White gloves. Fee: $600.00. Reply YES to confirm or NO if unavailable.",
        timestamp: '2026-09-18 08:30 AM',
        status: 'delivered'
      },
      {
        id: 'msg-003b',
        sender: 'bfh_dispatch',
        senderName: "Benta's Auto-Reminder",
        senderPhone: '(212) 281-8850',
        body: "⚠️ 2-HOUR REMINDER: Booking for Case #BFH-2026-089 remains pending confirmation. Please reply YES to lock in your squad.",
        timestamp: '2026-09-18 10:30 AM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'req-004',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-089',
    familyReferenceName: 'Vance Family',
    decedentName: 'Dr. Marcus Aurelius Vance',
    partnerId: 'fl-001',
    partnerName: "Barbara's Flower Shop",
    partnerPhone: '(212) 234-3211',
    category: 'other_vendor',
    roleTitle: 'Master Floral Designer (Lenox Ave)',
    serviceDate: '2026-09-22',
    callTime: '09:00 AM',
    serviceEndTime: '10:00 AM',
    venueLocation: '630 St. Nicholas Ave - Chapel 1 Casket Staging',
    specialInstructions: 'Red, White & Blue Patriotic Casket Spray (Red Freedom Roses, White Casablanca Lilies, Blue Delphinium) + 2 Standing Heart Wreaths.',
    honorariumFee: '$785.00',
    status: 'confirmed',
    requestedAt: '2026-09-18 10:30 AM',
    confirmedAt: '2026-09-18 10:48 AM',
    responseDeadline: '2026-09-18 12:30 PM',
    isOverdue: false,
    directorFollowUpRequired: false,
    escalationStatus: 'normal',
    remindersCount: 0,
    recurringIntervalMinutes: 240,
    smsMessageDraft: "BFH FLORAL DISPATCH: Dear Barbara's Flowers, Benta's Funeral Home confirms order for Vance Family (#BFH-2026-089). Delivery: Tue Sept 22 by 9:00 AM to Chapel 1. Item: Patriotic Casket Spray & 2 Standing Hearts. Total: $785.00. Reply YES to confirm delivery time.",
    threadMessages: [
      {
        id: 'msg-004a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch (Jason Benta, LFD)",
        senderPhone: '(212) 281-8850',
        body: "BFH FLORAL DISPATCH: Dear Barbara's Flowers, Benta's Funeral Home confirms order for Vance Family (#BFH-2026-089). Delivery: Tue Sept 22 by 9:00 AM to Chapel 1. Item: Patriotic Casket Spray & 2 Standing Hearts. Total: $785.00. Reply YES to confirm delivery time.",
        timestamp: '2026-09-18 10:30 AM',
        status: 'delivered'
      },
      {
        id: 'msg-004b',
        sender: 'vendor',
        senderName: "Barbara's Flower Shop (Lenox Ave)",
        senderPhone: '(212) 234-3211',
        body: "YES, CONFIRMED. We have the fresh blue delphinium and white lilies in our cold room. Delivery van will arrive at 630 St. Nicholas Chapel 1 staging at 8:45 AM Tuesday. - Barbara",
        timestamp: '2026-09-18 10:48 AM',
        status: 'read',
        quickActionTriggered: 'accept_confirm'
      }
    ]
  },

  // --- Case 002 (Bernice Jackson-Taylor) ---
  {
    id: 'req-005',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-090',
    familyReferenceName: 'Robinson Family',
    decedentName: 'Bernice Jackson-Taylor',
    partnerId: 'sp-min-01',
    partnerName: 'Rev. James Logan',
    partnerPhone: '(201) 274-4430',
    category: 'minister_clergy',
    roleTitle: 'Senior Pastor & Homegoing Minister',
    serviceDate: '2026-09-24',
    callTime: '09:30 AM',
    serviceEndTime: '12:30 PM',
    venueLocation: 'Abyssinian Baptist Church (132 W 138th St)',
    specialInstructions: 'Officiating traditional Baptist service and family scripture reading.',
    honorariumFee: '$300.00',
    status: 'confirmed',
    requestedAt: '2026-09-18 11:30 AM',
    confirmedAt: '2026-09-18 11:50 AM',
    responseDeadline: '2026-09-18 03:30 PM',
    isOverdue: false,
    directorFollowUpRequired: false,
    standbyBackupPartnerId: 'sp-min-02',
    standbyBackupPartnerName: 'Pas. Terrance Kennedy',
    standbyBackupPartnerPhone: '(917) 763-6714',
    standbyBackupRoleTitle: 'Pastor & Liturgical Celebrant',
    escalationStatus: 'normal',
    remindersCount: 0,
    recurringIntervalMinutes: 240,
    smsMessageDraft: "BFH SERVICE REQUEST: Dear Rev. James Logan, Benta's Funeral Home requests you to officiate the Homegoing Celebration for Bernice Jackson-Taylor (Case #BFH-2026-090) on Thu, Sept 24 at 9:30 AM at Abyssinian Baptist. Honorarium: $300.00. Reply YES to confirm or NO if unavailable.",
    threadMessages: [
      {
        id: 'msg-005a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch (Chontel Harris, LFD)",
        senderPhone: '(212) 281-8850',
        body: "BFH SERVICE REQUEST: Dear Rev. James Logan, Benta's Funeral Home requests you to officiate the Homegoing Celebration for Bernice Jackson-Taylor (Case #BFH-2026-090) on Thu, Sept 24 at 9:30 AM at Abyssinian Baptist. Honorarium: $300.00. Reply YES to confirm or NO if unavailable.",
        timestamp: '2026-09-18 11:30 AM',
        status: 'delivered'
      },
      {
        id: 'msg-005b',
        sender: 'vendor',
        senderName: 'Rev. James Logan',
        senderPhone: '(201) 274-4430',
        body: "YES, CONFIRMED. I will gladly minister and preach the eulogy for Sister Bernice. Peace and blessings. - Rev. Logan",
        timestamp: '2026-09-18 11:50 AM',
        status: 'read',
        quickActionTriggered: 'accept_confirm'
      }
    ]
  },
  {
    id: 'req-006',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-090',
    familyReferenceName: 'Robinson Family',
    decedentName: 'Bernice Jackson-Taylor',
    partnerId: 'sp-hair-01',
    partnerName: 'Kelvin Brooks',
    partnerPhone: '(646) 508-3474',
    category: 'hairdresser_barber',
    roleTitle: 'Master Restorative Barber & Stylist',
    serviceDate: '2026-09-23',
    callTime: '01:00 PM',
    serviceEndTime: '03:00 PM',
    venueLocation: '630 St. Nicholas Ave - Preparation Suite',
    specialInstructions: 'Delicate cosmetic styling, hair preparation for viewing, and crown setting.',
    honorariumFee: '$175.00',
    status: 'overdue_unconfirmed',
    requestedAt: '2026-09-18 09:00 AM',
    responseDeadline: '2026-09-18 12:00 PM (Expired 2h ago)',
    isOverdue: true,
    overdueMinutes: 120,
    urgencyLevel: 'critical',
    directorFollowUpRequired: true,
    standbyBackupPartnerId: 'sp-hair-02',
    standbyBackupPartnerName: 'Tanisha Carey',
    standbyBackupPartnerPhone: '(347) 605-8707',
    standbyBackupRoleTitle: 'Licensed Cosmetologist & Hair Stylist',
    escalationStatus: 'overdue_director_alert',
    remindersCount: 1,
    lastReminderAt: '2026-09-18 12:00 PM',
    recurringIntervalMinutes: 120,
    smsMessageDraft: "URGENT BFH SERVICE REQUEST: Dear Kelvin Brooks, Benta's Funeral Home urgently requests confirmation for Bernice Jackson-Taylor (Case #BFH-2026-090) on Wed, Sept 23 at 1:00 PM. Please reply YES or 1-tap fallback will cascade to Tanisha Carey.",
    threadMessages: [
      {
        id: 'msg-006a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch (Chontel Harris, LFD)",
        senderPhone: '(212) 281-8850',
        body: "BFH SERVICE REQUEST: Dear Kelvin Brooks, Benta's Funeral Home requests your restorative hair styling services for Bernice Jackson-Taylor (Case #BFH-2026-090) on Wed, Sept 23 at 1:00 PM. Fee: $175.00. Reply YES to confirm or NO if unavailable.",
        timestamp: '2026-09-18 09:00 AM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'req-007',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-090',
    familyReferenceName: 'Robinson Family',
    decedentName: 'Bernice Jackson-Taylor',
    partnerId: 'sp-mus-01',
    partnerName: 'Brvon Neal',
    partnerPhone: '(347) 993-5579',
    category: 'musician_organist',
    roleTitle: 'Principal Sanctuary Organist & Pianist',
    serviceDate: '2026-09-24',
    callTime: '09:30 AM',
    serviceEndTime: '12:30 PM',
    venueLocation: 'Abyssinian Baptist Church (132 W 138th St)',
    specialInstructions: 'Organ prelude, choral accompaniment, and postlude recessional.',
    honorariumFee: '$250.00',
    status: 'confirmed',
    requestedAt: '2026-09-18 10:00 AM',
    confirmedAt: '2026-09-18 10:25 AM',
    responseDeadline: '2026-09-18 02:00 PM',
    isOverdue: false,
    directorFollowUpRequired: false,
    standbyBackupPartnerId: 'sp-mus-02',
    standbyBackupPartnerName: 'Fabian Ralph',
    standbyBackupPartnerPhone: '(646) 245-9791',
    standbyBackupRoleTitle: 'Concert Organist & Vocal Accompanist',
    escalationStatus: 'normal',
    remindersCount: 0,
    recurringIntervalMinutes: 240,
    smsMessageDraft: "BFH SERVICE REQUEST: Dear Brvon Neal, Benta's Funeral Home confirms organist services for Bernice Jackson-Taylor on Thu Sept 24 at 9:30 AM. Reply YES to confirm.",
    threadMessages: [
      {
        id: 'msg-007a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch",
        senderPhone: '(212) 281-8850',
        body: "BFH SERVICE REQUEST: Dear Brvon Neal, Benta's Funeral Home confirms organist services for Bernice Jackson-Taylor on Thu Sept 24 at 9:30 AM. Fee: $250.00. Reply YES to confirm.",
        timestamp: '2026-09-18 10:00 AM',
        status: 'delivered'
      },
      {
        id: 'msg-007b',
        sender: 'vendor',
        senderName: 'Brvon Neal',
        senderPhone: '(347) 993-5579',
        body: "YES, CONFIRMED. I will be at the organ console by 9:00 AM. - Brvon",
        timestamp: '2026-09-18 10:25 AM',
        status: 'read',
        quickActionTriggered: 'accept_confirm'
      }
    ]
  },

  // --- Case 004 (Hon. Gwendolyn Baptiste-Mercer) ---
  {
    id: 'req-008',
    caseId: 'case-004',
    caseNumber: 'BFH-2026-092',
    familyReferenceName: 'Mercer Family',
    decedentName: 'Hon. Gwendolyn Baptiste-Mercer',
    partnerId: 'sp-trade-01',
    partnerName: 'Curvelle Larcque',
    partnerPhone: '(347) 724-1998',
    category: 'outside_director',
    roleTitle: 'Licensed Trade Funeral Director',
    serviceDate: '2026-09-20',
    callTime: '09:00 AM',
    serviceEndTime: '02:00 PM',
    venueLocation: 'Church Sanctuary & Woodlawn Cortege Escort',
    specialInstructions: 'Lead cortege escort and church judicial honors ceremony supervision.',
    honorariumFee: '$400.00',
    status: 'confirmed',
    requestedAt: '2026-09-18 09:30 AM',
    confirmedAt: '2026-09-18 09:55 AM',
    responseDeadline: '2026-09-18 01:30 PM',
    isOverdue: false,
    directorFollowUpRequired: false,
    standbyBackupPartnerId: 'sp-trade-02',
    standbyBackupPartnerName: 'Pierre Cobb',
    standbyBackupPartnerPhone: '(718) 350-1441',
    standbyBackupRoleTitle: 'Licensed Trade Funeral Director',
    escalationStatus: 'normal',
    remindersCount: 0,
    recurringIntervalMinutes: 240,
    smsMessageDraft: "BFH DISPATCH: Dear Curvelle Larcque, Benta's requests trade director coverage for Hon. Gwendolyn Baptiste-Mercer (Case #BFH-2026-092) on Sun, Sept 20 at 9:00 AM. Fee: $400.00. Reply YES to confirm.",
    threadMessages: [
      {
        id: 'msg-008a',
        sender: 'bfh_dispatch',
        senderName: "Benta's Dispatch (Leatrice Henry, LFD)",
        senderPhone: '(212) 281-8850',
        body: "BFH DISPATCH: Dear Curvelle Larcque, Benta's requests trade director coverage for Hon. Gwendolyn Baptiste-Mercer (Case #BFH-2026-092) on Sun, Sept 20 at 9:00 AM. Fee: $400.00. Reply YES to confirm.",
        timestamp: '2026-09-18 09:30 AM',
        status: 'delivered'
      },
      {
        id: 'msg-008b',
        sender: 'vendor',
        senderName: 'Curvelle Larcque, LFD',
        senderPhone: '(347) 724-1998',
        body: "YES, CONFIRMED. I will lead the judicial cortege escort on Sunday at 9:00 AM sharp. - Curvelle Larcque",
        timestamp: '2026-09-18 09:55 AM',
        status: 'read',
        quickActionTriggered: 'accept_confirm'
      }
    ]
  }
];

// -------------------------------------------------------------
// INITIAL FLIGHT CHECKLIST GENERATOR FOR GOLDEN RECORD CASES
// -------------------------------------------------------------
export const getInitialFlightChecklist = (caseItem: GoldenRecordCase): CaseFlightPhaseProgress[] => {
  const isCremation = caseItem.dispositionType.includes('cremation');
  const hasSafeArrival = caseItem.safeArrivalStatus === 'safe_arrival_confirmed';
  const hasAP47 = !!caseItem.statementOfGoods;
  const isEdrsCertified = caseItem.medicalCertifier.edrsStatus === 'certified' || !!caseItem.medicalCertifier.edrsPermitNumber;

  return [
    {
      phase: 'intake_removal',
      phaseNumber: 1,
      title: 'Phase 1: First Call & Chain of Custody',
      isUnlocked: true,
      isCompleted: hasSafeArrival,
      items: [
        {
          id: 'fc-101',
          phase: 'intake_removal',
          code: 'NYS-PHL-4201',
          title: 'Execute First Call Physical Custody & Removal',
          description: 'Dispatch transfer unit, log pickup facility morgue release jurat, and record driver plate.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: true,
          completedAt: '2026-09-17 10:45 AM',
          completedBy: 'Jason Benta (LFD #08850)',
          actionType: 'open_removal',
          actionLabel: 'Removal & Custody Hub',
          statutoryReference: 'NYS PHL § 4201'
        },
        {
          id: 'fc-102',
          phase: 'intake_removal',
          code: 'VALUABLES-TAG',
          title: 'Itemize & Seal Personal Effects Ledger',
          description: 'Document jewelry, cash, dentures, and seal in tamper-evident pouch with witness signature.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: true,
          completedAt: '2026-09-17 10:50 AM',
          completedBy: 'Maria Santos (Pathology Attendant)',
          actionType: 'open_removal',
          actionLabel: 'View Valuables Ledger'
        },
        {
          id: 'fc-103',
          phase: 'intake_removal',
          code: 'SAFE-ARRIVE-SMS',
          title: 'Log Safe Arrival & Fire Reassurance SMS',
          description: 'Log arrival at 630 St. Nicholas Ave and send instant peace-of-mind alert to Next of Kin.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: hasSafeArrival,
          completedAt: hasSafeArrival ? caseItem.safeArrivalTimestamp : undefined,
          completedBy: hasSafeArrival ? 'System Trigger' : undefined,
          actionType: 'open_removal',
          actionLabel: 'Log Safe Arrival & SMS'
        }
      ]
    },
    {
      phase: 'arrangements',
      phaseNumber: 2,
      title: 'Phase 2: Arrangement Conference & Contract Execution',
      isUnlocked: true,
      isCompleted: hasAP47,
      items: [
        {
          id: 'fc-200',
          phase: 'arrangements',
          code: 'APPT-SCHEDULE',
          title: 'Schedule In-Person Family Arrangement Conference',
          description: 'Offer selectable dates/times via SMS/Email and confirm appointment with assigned director at 630 St. Nicholas Ave.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: !!caseItem.arrangementAppointment && caseItem.arrangementAppointment.status === 'confirmed',
          completedAt: caseItem.arrangementAppointment?.confirmedAt,
          completedBy: caseItem.arrangementAppointment?.assignedDirectorName,
          actionType: 'open_appointment',
          actionLabel: 'Schedule Conference'
        },
        {
          id: 'fc-201',
          phase: 'arrangements',
          code: 'AP-47-CONTRACT',
          title: 'Conduct Arrangement Conference & Form AP-47',
          description: 'Itemize Professional Services, Casket/Vault, 12-Variable Suite, Livery, and Section II Cash Advances.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: hasAP47,
          completedAt: hasAP47 ? '2026-09-17 02:30 PM' : undefined,
          completedBy: hasAP47 ? 'Jason Benta, LFD' : undefined,
          actionType: 'open_contract',
          actionLabel: 'Open AP-47 Contract Studio',
          statutoryReference: '10 NYCRR Part 77 / FTC Rule'
        },
        {
          id: 'fc-202',
          phase: 'arrangements',
          code: 'VENUE-RESERVE',
          title: 'Reserve 12-Space Facility & Chapel Schedule',
          description: 'Lock Chapel A / Chapel B viewing slot and optional 2nd-floor Repast Suite.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: !!caseItem.serviceSelections.serviceDate,
          completedAt: caseItem.serviceSelections.serviceDate ? '2026-09-17 03:00 PM' : undefined,
          actionType: 'open_calendar',
          actionLabel: '12-Room Facility Calendar'
        },
        {
          id: 'fc-203',
          phase: 'arrangements',
          code: 'PORTAL-INVITE',
          title: 'Dispatch Family Portal Access Link (Email + SMS)',
          description: 'Grant secure family access with passcode for obituary collaboration and digital tributes.',
          isMandatoryForPhaseAdvance: false,
          isCompleted: true,
          completedAt: '2026-09-17 03:15 PM',
          actionType: 'open_contract',
          actionLabel: 'Resend Portal Invite'
        }
      ]
    },
    {
      phase: 'legal_bundle',
      phaseNumber: 3,
      title: 'Phase 3: State Vital Registrations & Legal Authorizations',
      isUnlocked: true,
      isCompleted: isEdrsCertified,
      items: [
        {
          id: 'fc-301',
          phase: 'legal_bundle',
          code: 'EDRS-72H',
          title: 'NYC eVital / NYS EDRS 72-Hour Death Registration',
          description: 'Rapid-fill vital statistics into state portal and acquire certified burial/cremation permit number.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: isEdrsCertified,
          completedAt: isEdrsCertified ? '2026-09-18 10:00 AM' : undefined,
          actionType: 'open_edrs',
          actionLabel: 'EDRS RapidFill Assistant',
          statutoryReference: 'NYS PHL § 4140'
        },
        {
          id: 'fc-302',
          phase: 'legal_bundle',
          code: 'NOK-ESIGN-4201',
          title: 'Capture Informant Legal E-Signatures',
          description: 'Right to Control Jurat, Statement of Goods Terms, and Embalming Authorization signature.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: true,
          completedAt: '2026-09-18 11:30 AM',
          actionType: 'open_esign',
          actionLabel: 'Open Legal eSign Pad'
        },
        {
          id: 'fc-303',
          phase: 'legal_bundle',
          code: isCremation ? 'WOODLAWN-AUTH' : 'CEMETERY-AUTH',
          title: isCremation ? 'Woodlawn Crematory Authorization Packet' : 'Cemetery Interment Authorization',
          description: isCremation ? 'Affidavit of Cremation and disposition of cremated remains instructions.' : 'Plot deed and grave opening authorization.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: true,
          actionType: isCremation ? 'open_woodlawn' : 'open_esign',
          actionLabel: isCremation ? 'Woodlawn Dispatch' : 'Cemetery Authorization'
        }
      ]
    },
    {
      phase: 'permits_logistics',
      phaseNumber: 4,
      title: 'Phase 4: Logistics, Service Production & Vendor Confirmation',
      isUnlocked: true,
      isCompleted: false,
      items: [
        {
          id: 'fc-401',
          phase: 'permits_logistics',
          code: 'PRINT-BULLETIN',
          title: 'Print 4-Panel Duplex Memorial Programs',
          description: 'Format obituary, order of service, pallbearers, and print 8.5x11 duplex bifolds.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: true,
          completedAt: '2026-09-19 02:00 PM',
          actionType: 'open_memorial_program',
          actionLabel: '4-Panel Bulletin Studio'
        },
        {
          id: 'fc-402',
          phase: 'permits_logistics',
          code: 'VENDOR-2WAY-SMS',
          title: 'Two-Way Partner Dispatches (Florist, Clergy, Organist, Livery)',
          description: 'Dispatch orders to Barbara’s/Daniela’s Flowers, clergy, and organist; track two-way confirmations.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: false,
          actionType: 'open_partner_sms',
          actionLabel: 'Two-Way Partner SMS Hub'
        },
        {
          id: 'fc-403',
          phase: 'permits_logistics',
          code: 'CHAPEL-QR-EASEL',
          title: 'Stage Chapel Tribute QR Code & Easel Welcome Sign',
          description: 'Print high-contrast acrylic easel welcome sign with live QR link for digital tributes & guestbook.',
          isMandatoryForPhaseAdvance: false,
          isCompleted: true,
          actionType: 'open_chapel_qr',
          actionLabel: 'Chapel QR Easel Sign'
        },
        {
          id: 'fc-404',
          phase: 'permits_logistics',
          code: 'WEBCAST-XLR',
          title: 'Sanctuary 4K Webcast & XLR Audio Stream Schedule',
          description: 'Verify soundboard XLR direct feed and generate encrypted family viewing PIN.',
          isMandatoryForPhaseAdvance: false,
          isCompleted: caseItem.webcastSchedule?.isEnabled !== false,
          actionType: 'open_webcast',
          actionLabel: 'Webcast Scheduling'
        },
        {
          id: 'fc-405',
          phase: 'permits_logistics',
          code: 'PASS-THROUGH-CHECKS',
          title: 'Generate & Print Pass-Through Cash Advance Checks',
          description: 'Print 3-part payable check vouchers for cemetery, clergy, NYC DOHMH, and organist with deceased name & case # in memo line.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: false,
          actionType: 'open_cash_advance_checks',
          actionLabel: 'Print Cash Advance Checks',
          statutoryReference: '10 NYCRR § 77.8 Pass-Through'
        }
      ]
    },
    {
      phase: 'finalization_aftercare',
      phaseNumber: 5,
      title: 'Phase 5: Financial Settlement, Committal & 365-Day Aftercare',
      isUnlocked: true,
      isCompleted: false,
      items: [
        {
          id: 'fc-501',
          phase: 'finalization_aftercare',
          code: 'SPLIT-BILL-SETTLE',
          title: 'Reconcile Split-Billing & Life Insurance Assignments',
          description: 'Verify C&J Life Insurance assignment funding, ACH transfers, and clear contract balance.',
          isMandatoryForPhaseAdvance: true,
          isCompleted: caseItem.totalPaid >= caseItem.totalAmountDue,
          actionType: 'open_finances',
          actionLabel: 'Financial Verification Center'
        },
        {
          id: 'fc-502',
          phase: 'finalization_aftercare',
          code: 'AFTERCARE-365',
          title: 'Activate 365-Day Grief Support & Memorial Cadence',
          description: 'Schedule automated Day 7, Day 30, Day 90, and 1-Year Remembrance anniversary check-ins.',
          isMandatoryForPhaseAdvance: false,
          isCompleted: true,
          actionType: 'open_aftercare',
          actionLabel: 'Aftercare CRM Nurture'
        }
      ]
    }
  ];
};

// ==========================================
// MANAGER & DIRECTOR SCHEDULING MOCK DATA
// ==========================================

export const INITIAL_DIRECTOR_PROFILES: DirectorProfile[] = [
  // 3 Managing Directors & Licensed Funeral Directors (Dual Capacity: Executive Management & Arrangement Directing)
  {
    id: 'dir-mgr-1',
    name: 'Jason Benta',
    licenseNumber: 'NYS LFD #08850',
    type: 'in_house',
    roleType: 'manager',
    isManager: true,
    canMakeArrangements: true,
    isIndependentContractor: false,
    title: 'Director in Charge / Managing LFD',
    phone: '(212) 281-8850',
    email: 'jason.benta@bentasfuneralhome.com',
    securityPin: '3995',
    yearsExperience: 24,
    specialties: ['Managing LFD Oversight', 'Harlem Civic & Community Ceremonies', 'NYS DOH Regulatory Lead', 'Executive Administration'],
    rating: 5.0,
    status: 'available',
    colorTheme: {
      name: 'Crimson Wine',
      primary: '#991b1b',
      badgeBg: 'bg-red-100 text-red-900 border-red-300',
      calendarBg: 'bg-red-50/95 border-l-4 border-red-600 shadow-xs',
      border: 'border-red-500',
      text: 'text-[#991b1b]'
    },
    weeklyHoursLogged: 34,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 95,
    activeCasesCount: 2
  },
  {
    id: 'dir-fd-1',
    name: 'Beth Crowe',
    licenseNumber: 'NYS LFD #09412',
    type: 'in_house',
    roleType: 'manager',
    isManager: true,
    canMakeArrangements: true,
    isIndependentContractor: false,
    title: 'Managing Director & Licensed Funeral Director',
    phone: '(646) 243-8899',
    email: 'BCrowe@e-bfh.com',
    securityPin: '9412',
    yearsExperience: 14,
    specialties: ['Traditional Funeral Rites', 'Harlem Civic Services', 'DocuSign Legal Compliance', 'Executive Management'],
    rating: 4.9,
    status: 'available',
    colorTheme: {
      name: 'Royal Blue',
      primary: '#1d4ed8',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      calendarBg: 'bg-blue-50/95 border-l-4 border-blue-600 shadow-xs',
      border: 'border-blue-500',
      text: 'text-blue-700'
    },
    weeklyHoursLogged: 32,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 85,
    activeCasesCount: 2
  },
  {
    id: 'dir-fd-4',
    name: 'Billy McDonald',
    licenseNumber: 'NYS LFD #09340',
    type: 'in_house',
    roleType: 'manager',
    isManager: true,
    canMakeArrangements: true,
    isIndependentContractor: false,
    title: 'Managing Director & Licensed Funeral Director',
    phone: '(917) 519-7382',
    email: 'Bmcdonald@e-bfh.com',
    securityPin: '9340',
    yearsExperience: 18,
    specialties: ['Catholic Liturgies & Masses', 'Repast Directing', 'Veterans Military Honors', 'Executive Management'],
    rating: 4.8,
    status: 'available',
    colorTheme: {
      name: 'Amber Gold',
      primary: '#b45309',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      calendarBg: 'bg-amber-50/95 border-l-4 border-amber-600 shadow-xs',
      border: 'border-amber-500',
      text: 'text-[#b45309]'
    },
    weeklyHoursLogged: 34,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 85,
    activeCasesCount: 1
  },

  // 3 In-House Licensed Funeral Directors (Case Claiming & Arrangement Conferences)
  {
    id: 'dir-fd-2',
    name: 'Chontel Harris',
    licenseNumber: 'NYS LFD #10231',
    type: 'in_house',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: true,
    isIndependentContractor: false,
    title: 'Licensed Funeral Director',
    phone: '(917) 213-3955',
    email: 'CHarris@e-bfh.com',
    yearsExperience: 11,
    specialties: ['Family Arrangements Lead', 'Cremation Memorials', 'Repatriation Logistics', 'Aftercare Coordination'],
    rating: 4.9,
    status: 'available',
    colorTheme: {
      name: 'Emerald Green',
      primary: '#047857',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      calendarBg: 'bg-emerald-50/95 border-l-4 border-emerald-600 shadow-xs',
      border: 'border-emerald-500',
      text: 'text-emerald-700'
    },
    weeklyHoursLogged: 28,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 80,
    activeCasesCount: 1
  },
  {
    id: 'dir-fd-3',
    name: 'Leatrice Henry',
    licenseNumber: 'NYS LFD #07194',
    type: 'in_house',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: true,
    isIndependentContractor: false,
    title: 'Licensed Funeral Director',
    phone: '(347) 479-0536',
    email: 'LHenry@e-bfh.com',
    yearsExperience: 16,
    specialties: ['Baptist & Gospel Traditions', 'Large Harlem Processions', 'Senior Clergy Liaison', 'Eulogy Protocol'],
    rating: 5.0,
    status: 'available',
    colorTheme: {
      name: 'Royal Purple',
      primary: '#6d28d9',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      calendarBg: 'bg-purple-50/95 border-l-4 border-purple-600 shadow-xs',
      border: 'border-purple-500',
      text: 'text-purple-700'
    },
    weeklyHoursLogged: 30,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 85,
    activeCasesCount: 1
  },
  {
    id: 'dir-fd-5',
    name: 'Dean Wilson',
    licenseNumber: 'NYS LFD #08112',
    type: 'in_house',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: true,
    isIndependentContractor: false,
    title: 'Licensed Funeral Director',
    phone: '(631) 708-6473',
    email: 'DWilson@e-bfh.com',
    yearsExperience: 12,
    specialties: ['Transport Operations & Cortege Escorts', 'Masonic & Fraternal Rites', 'Graveside Formations', 'Tri-State Logistics'],
    rating: 4.9,
    status: 'available',
    colorTheme: {
      name: 'Ocean Teal',
      primary: '#0f766e',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      calendarBg: 'bg-teal-50/95 border-l-4 border-teal-600 shadow-xs',
      border: 'border-teal-500',
      text: 'text-teal-700'
    },
    weeklyHoursLogged: 26,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 80,
    activeCasesCount: 0
  },

  // 5 Independent Contractor Funeral Directors (Hired for Funeral Services Only - Do NOT make arrangements)
  {
    id: 'dir-trade-1',
    name: 'Curvelle Larcque',
    licenseNumber: 'NYS LFD #11048',
    type: 'outsourced',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: false,
    isIndependentContractor: true,
    title: 'Independent Contractor Licensed Funeral Director',
    phone: '(347) 724-1998',
    email: 'clarcque@nytradefuneral.org',
    yearsExperience: 10,
    specialties: ['Per Diem Chapel Directing', 'Cortege Logistics', 'Cemetery Committals', 'Funeral Services'],
    rating: 4.9,
    status: 'available',
    perDiemRate: 350,
    guildAffiliation: 'Independent Contractor LFD (Harlem Service Directing)',
    colorTheme: {
      name: 'Slate Grey',
      primary: '#475569',
      badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
      calendarBg: 'bg-slate-50/95 border-l-4 border-slate-600 shadow-xs',
      border: 'border-slate-500',
      text: 'text-slate-700'
    },
    weeklyHoursLogged: 0,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 75,
    activeCasesCount: 0
  },
  {
    id: 'dir-trade-2',
    name: 'Pierre Cobb',
    licenseNumber: 'NYS LFD #09823',
    type: 'outsourced',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: false,
    isIndependentContractor: true,
    title: 'Independent Contractor Licensed Funeral Director',
    phone: '(718) 350-1441',
    email: 'pcobb@nytradefuneral.org',
    yearsExperience: 12,
    specialties: ['Evening Wake Directing', 'Church Ceremony Protocols', 'Hearse Escort', 'Funeral Services'],
    rating: 4.8,
    status: 'available',
    perDiemRate: 350,
    guildAffiliation: 'Independent Contractor LFD (Harlem Service Directing)',
    colorTheme: {
      name: 'Indigo',
      primary: '#4338ca',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      calendarBg: 'bg-indigo-50/95 border-l-4 border-indigo-600 shadow-xs',
      border: 'border-indigo-500',
      text: 'text-indigo-700'
    },
    weeklyHoursLogged: 0,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 75,
    activeCasesCount: 0
  },
  {
    id: 'dir-trade-3',
    name: 'Cory Vaughn-Daniels',
    licenseNumber: 'NYS LFD #12049',
    type: 'outsourced',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: false,
    isIndependentContractor: true,
    title: 'Independent Contractor Licensed Funeral Director',
    phone: '(646) 701-1966',
    email: 'cvdaniels@nytradefuneral.org',
    yearsExperience: 14,
    specialties: ['Harlem Community Funerals', 'Family Assistance', 'Graveside Formations', 'Funeral Services'],
    rating: 4.9,
    status: 'available',
    perDiemRate: 350,
    guildAffiliation: 'Independent Contractor LFD (Harlem Service Directing)',
    colorTheme: {
      name: 'Forest',
      primary: '#15803d',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      calendarBg: 'bg-emerald-50/95 border-l-4 border-emerald-600 shadow-xs',
      border: 'border-emerald-500',
      text: 'text-emerald-700'
    },
    weeklyHoursLogged: 0,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 75,
    activeCasesCount: 0
  },
  {
    id: 'dir-trade-4',
    name: 'Sylvia Saxton',
    licenseNumber: 'NYS LFD #08944',
    type: 'outsourced',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: false,
    isIndependentContractor: true,
    title: 'Independent Contractor Licensed Funeral Director',
    phone: '(862) 368-4706',
    email: 'ssaxton@nytradefuneral.org',
    yearsExperience: 15,
    specialties: ['Church & Chapel Services', 'Liturgical Protocol', 'VIP Family Escort', 'Funeral Services'],
    rating: 5.0,
    status: 'available',
    perDiemRate: 350,
    guildAffiliation: 'Independent Contractor LFD (Harlem Service Directing)',
    colorTheme: {
      name: 'Rose Gold',
      primary: '#be123c',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      calendarBg: 'bg-rose-50/95 border-l-4 border-rose-600 shadow-xs',
      border: 'border-rose-500',
      text: 'text-rose-700'
    },
    weeklyHoursLogged: 0,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 75,
    activeCasesCount: 0
  },
  {
    id: 'dir-trade-5',
    name: 'Delyce Edwards',
    licenseNumber: 'NYS LFD #10924',
    type: 'outsourced',
    roleType: 'funeral_director',
    isManager: false,
    canMakeArrangements: false,
    isIndependentContractor: true,
    title: 'Independent Contractor Licensed Funeral Director',
    phone: '(646) 408-3350',
    email: 'dedwards@nytradefuneral.org',
    yearsExperience: 11,
    specialties: ['Chapel Ceremonies', 'Crematory Cortege', 'Interment Coordination', 'Funeral Services'],
    rating: 4.9,
    status: 'available',
    perDiemRate: 350,
    guildAffiliation: 'Independent Contractor LFD (Harlem Service Directing)',
    colorTheme: {
      name: 'Bronze',
      primary: '#9a3412',
      badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
      calendarBg: 'bg-orange-50/95 border-l-4 border-orange-600 shadow-xs',
      border: 'border-orange-500',
      text: 'text-orange-700'
    },
    weeklyHoursLogged: 0,
    weeklyHoursCap: 40,
    hourlyOvertimeRate: 75,
    activeCasesCount: 0
  }
];

export const INITIAL_SERVICE_ASSIGNMENTS: ServiceDirectorAssignment[] = [
  {
    id: 'asgn-001',
    caseId: 'case-001',
    caseNumber: 'BFH-2026-0901',
    decedentName: 'Dr. Marcus Vance',
    serviceType: 'Funeral Service with Cremation',
    serviceDate: '2026-09-22',
    serviceTime: '11:00 AM - 1:00 PM',
    callTime: '9:30 AM',
    venueName: "Benta's Main Chapel (630 St Nicholas Ave)",
    venueAddress: '630 St. Nicholas Ave, New York, NY 10030',
    estimatedAttendance: 120,
    assignedDirectorId: 'dir-mgr-1',
    assignedDirectorName: 'Jason Benta',
    directorType: 'in_house',
    directorLicense: 'NYS LFD #08850',
    status: 'confirmed',
    uniformAttireRequired: 'BFH Formal Morning Coat',
    vipProtocols: ['Navy Military Color Guard flag folding', 'Columbia University faculty honorary pallbearers', '4K HD Live Webcast'],
    specialInstructions: 'Lead cortege following chapel service directly to Woodlawn Crematory (Bronx, NY). Navy flag presentation at 12:45 PM sharp.',
    costAnalysis: {
      inHouseCost: 0,
      outsourcedCost: 350,
      recommendedType: 'in_house',
      recommendationReason: 'Jason Benta has 6 hrs available before overtime threshold. High-profile Columbia University civic ceremony warrants Managing Director oversight.',
      marginImpactSavings: 350,
      fatigueRiskLevel: 'low'
    },
    dispatchSmsThread: [
      {
        id: 'sms-asgn-1',
        sender: 'manager',
        text: 'DISPATCH NOTICE: Assigned as Lead Director for Dr. Marcus Vance (Case #BFH-2026-0901) on Tue Sep 22. Call time 9:30 AM at 630 St. Nicholas Ave Main Chapel. Uniform: Formal Morning Coat.',
        timestamp: '2026-09-20 09:15 AM'
      },
      {
        id: 'sms-asgn-2',
        sender: 'director',
        text: 'CONFIRMED: Received. Service sheet reviewed; Navy Color Guard arrival confirmed for 10:15 AM. Will lead service.',
        timestamp: '2026-09-20 09:18 AM'
      }
    ]
  },
  {
    id: 'asgn-002',
    caseId: 'case-002',
    caseNumber: 'BFH-2026-0902',
    decedentName: 'Hon. Evelyn Carter-Hayes',
    serviceType: 'Traditional Service and Burial',
    serviceDate: '2026-09-23',
    serviceTime: '10:00 AM - 1:30 PM',
    callTime: '8:30 AM',
    venueName: 'Abyssinian Baptist Church',
    venueAddress: '132 W 138th St, New York, NY 10030',
    estimatedAttendance: 350,
    assignedDirectorId: 'dir-fd-3',
    assignedDirectorName: 'Leatrice Henry',
    directorType: 'in_house',
    directorLicense: 'NYS LFD #07194',
    status: 'confirmed',
    uniformAttireRequired: 'BFH Formal Morning Coat',
    vipProtocols: ['Harlem Police Department cortege escort', '350+ Guest Sanctuary Management', 'Elected Officials Reserved Pew Seating'],
    specialInstructions: 'Coordinate 3-limousine cortege with NYPD 32nd Precinct escort down St. Nicholas Ave to Woodlawn Cemetery.',
    costAnalysis: {
      inHouseCost: 0,
      outsourcedCost: 350,
      recommendedType: 'in_house',
      recommendationReason: 'Leatrice Henry has 10 hrs available capacity and leverages 16 yrs Baptist liturgical and Harlem procession experience.',
      marginImpactSavings: 350,
      fatigueRiskLevel: 'low'
    },
    dispatchSmsThread: [
      {
        id: 'sms-asgn-3',
        sender: 'manager',
        text: 'BFH DISPATCH: Lead Director assignment for Hon. Evelyn Carter-Hayes funeral service on Wed Sep 23 at Abyssinian Baptist Church. Call time 8:30 AM.',
        timestamp: '2026-09-20 11:30 AM'
      },
      {
        id: 'sms-asgn-4',
        sender: 'director',
        text: 'ACCEPT: Confirmed for Wed 8:30 AM at Abyssinian. Will be in BFH morning coat. NYPD escort route noted.',
        timestamp: '2026-09-20 11:34 AM'
      }
    ]
  },
  {
    id: 'asgn-003',
    caseId: 'case-003',
    caseNumber: 'BFH-2026-0903',
    decedentName: 'Rev. James Arthur Baldwin',
    serviceType: 'Cremation and Memorial Service',
    serviceDate: '2026-09-24',
    serviceTime: '2:00 PM - 4:00 PM',
    callTime: '1:00 PM',
    venueName: "Benta's Chapel Parlor B (630 St Nicholas Ave)",
    venueAddress: '630 St. Nicholas Ave, New York, NY 10030',
    estimatedAttendance: 65,
    assignedDirectorId: 'dir-fd-2',
    assignedDirectorName: 'Chontel Harris',
    directorType: 'in_house',
    directorLicense: 'NYS LFD #10231',
    status: 'confirmed',
    uniformAttireRequired: 'Dark Charcoal Suit',
    vipProtocols: ['360° Digi-Tribute Audio Waveform Keepsake playback', 'Clergy Guestbook Presentation'],
    specialInstructions: 'Organist setup at 1:15 PM. Family requesting audio keepsake recording cards handed out to church elders.',
    costAnalysis: {
      inHouseCost: 0,
      outsourcedCost: 300,
      recommendedType: 'in_house',
      recommendationReason: 'Chontel Harris has 12 hrs available capacity this week. Standard 65-guest memorial is optimal for in-house arrangement team ($300 margin preserved).',
      marginImpactSavings: 300,
      fatigueRiskLevel: 'low'
    }
  },
  {
    id: 'asgn-004',
    caseId: 'case-004',
    caseNumber: 'BFH-2026-0904',
    decedentName: 'Constance DeWitt',
    serviceType: 'Direct Earth Burial & Committal',
    serviceDate: '2026-09-25',
    serviceTime: '11:30 AM - 1:00 PM',
    callTime: '10:15 AM',
    venueName: 'Ferncliff Cemetery (Hartsdale, NY)',
    venueAddress: '280 Secor Rd, Hartsdale, NY 10530',
    estimatedAttendance: 40,
    status: 'unassigned',
    uniformAttireRequired: 'Dark Charcoal Suit',
    vipProtocols: ['Graveside tent & lowering device inspection', 'Floral sprays transfer to grave'],
    specialInstructions: 'Meet cortege at Ferncliff Cemetery gates at 11:15 AM. Family requested direct burial without church service.',
    costAnalysis: {
      inHouseCost: 0,
      outsourcedCost: 325,
      recommendedType: 'in_house',
      recommendationReason: 'Assigning Staff Director Dean Wilson or Billy McDonald preserves margin and covers Westchester committal logistics seamlessly.',
      marginImpactSavings: 325,
      fatigueRiskLevel: 'low'
    }
  }
];

export const INITIAL_1099_VOUCHERS: Director1099Voucher[] = [
  {
    id: 'vch-101',
    voucherNumber: 'VCH-2026-0881',
    assignmentId: 'asgn-002',
    directorId: 'dir-201',
    directorName: 'Ronald K. Washington',
    directorLicense: 'NYS LFD #07194',
    caseNumber: 'BFH-2026-0902',
    decedentName: 'Hon. Evelyn Carter-Hayes',
    serviceDate: '2026-09-23',
    serviceType: 'Traditional Service and Burial (Abyssinian)',
    amount: 350.00,
    status: 'approved_for_payment',
    approvedBy: 'Jason Benta (Managing LFD)',
    approvedAt: '2026-09-20 11:40 AM',
    notes: 'Approved per trade agreement. Abyssinian sanctuary service + Woodlawn cortege.'
  },
  {
    id: 'vch-102',
    voucherNumber: 'VCH-2026-0879',
    assignmentId: 'asgn-prev-1',
    directorId: 'dir-203',
    directorName: 'Keith Ellison',
    directorLicense: 'NYS LFD #08112',
    caseNumber: 'BFH-2026-0889',
    decedentName: 'Sgt. Major Thomas Washington',
    serviceDate: '2026-09-17',
    serviceType: 'Military Chapel Service & Calverton Escort',
    amount: 375.00,
    status: 'paid_ach',
    approvedBy: 'Jason Benta (Managing LFD)',
    approvedAt: '2026-09-17 04:10 PM',
    notes: 'Long-distance Calverton National Cemetery escort completed. ACH cleared.'
  },
  {
    id: 'vch-103',
    voucherNumber: 'VCH-2026-0874',
    assignmentId: 'asgn-prev-2',
    directorId: 'dir-202',
    directorName: 'Cheryl A. Boyd',
    directorLicense: 'NYS LFD #09340',
    caseNumber: 'BFH-2026-0894',
    decedentName: 'Maria Santos-Valdez',
    serviceDate: '2026-09-15',
    serviceType: 'St. Aloysius Catholic Mass of Christian Burial',
    amount: 325.00,
    status: 'paid_ach',
    approvedBy: 'Jason Benta (Managing LFD)',
    approvedAt: '2026-09-15 02:30 PM',
    notes: 'Bilingual Spanish/English mass direction. ACH batch settlement processed.'
  }
];



