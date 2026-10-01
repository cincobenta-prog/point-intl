import { GoldenRecordCase, DayOfServiceHUDData, CortegeDriverDispatchItem, DayOfServiceReadinessItem } from '../types/funeral';

export function getInitialDayOfServiceHUD(caseData: GoldenRecordCase): DayOfServiceHUDData {
  const serviceDate = caseData.serviceSelections.serviceDate || 'Tuesday, September 22, 2026';
  const serviceTime = caseData.serviceSelections.serviceTime || '11:00 AM';
  const destination = caseData.serviceSelections.crematoryOrCemeteryName || 'The Woodlawn Cemetery & Crematory (Bronx, NY)';
  const informantName = caseData.informant.fullName;
  const decedentName = caseData.decedent.legalName;

  const defaultDrivers: CortegeDriverDispatchItem[] = [
    {
      id: 'driver-1',
      vehicleNumber: 'Lead Car #101',
      role: 'lead_car',
      roleLabel: 'Lead Director Car (BFH Flagship)',
      driverName: 'Jason Benta (Managing LFD)',
      driverPhone: '(212) 281-8850',
      vehicleModel: '2026 Cadillac Escalade ESV (Obsidian Black)',
      plateNumber: 'BFH-DIR-1',
      assignedPassengers: ['Jason Benta (LFD)', 'Rev. Dr. Calvin Butts IV (Officiating Clergy)'],
      capacity: 4,
      status: 'arrived_st_nicholas',
      smsDelivered: true,
      turnByTurnUrl: `https://maps.google.com/?daddr=${encodeURIComponent(destination)}`,
      specialInstructions: 'Lead motorcade at moderate pace via Harlem River Drive to Jerome Ave Woodlawn Gate.'
    },
    {
      id: 'driver-2',
      vehicleNumber: 'Flower Car #102',
      role: 'flower_car',
      roleLabel: 'Open-Deck Floral & Tribute Car',
      driverName: 'Derrick Washington (Fleet)',
      driverPhone: '(917) 555-0144',
      vehicleModel: '2025 Cadillac Coupé Flower Car',
      plateNumber: 'BFH-FLR-2',
      assignedPassengers: ['Standing Heart Wreaths', 'Family Casket Spray', 'Sanctuary Urn Surround'],
      capacity: 2,
      status: 'arrived_st_nicholas',
      smsDelivered: true,
      turnByTurnUrl: `https://maps.google.com/?daddr=${encodeURIComponent(destination)}`,
      specialInstructions: 'Secure all ribbon cards and deliver floral stands directly to gravesite canopy ahead of casket arrival.'
    },
    {
      id: 'driver-3',
      vehicleNumber: 'Hearse #103',
      role: 'hearse_coach',
      roleLabel: 'Grand Ceremonial Hearse / Coach',
      driverName: 'Marcus Benta (Lead Chauffeur)',
      driverPhone: '(212) 555-0182',
      vehicleModel: '2026 S&S Masterpiece Cadillac Coach',
      plateNumber: 'BFH-HEARSE-1',
      assignedPassengers: [`Casket of ${decedentName}`, '6 Active Pallbearers Escort Detail'],
      capacity: 2,
      status: 'arrived_st_nicholas',
      smsDelivered: true,
      turnByTurnUrl: `https://maps.google.com/?daddr=${encodeURIComponent(destination)}`,
      specialInstructions: 'Position hearse directly under St. Nicholas Ave portico at 10:45 AM. Ensure church truck is lubricated.'
    },
    {
      id: 'driver-4',
      vehicleNumber: 'Limousine #1 (Family Lead)',
      role: 'family_limo_1',
      roleLabel: 'Family Limousine #1 (Immediate Next of Kin)',
      driverName: 'Robert Johnson (Chauffeur)',
      driverPhone: '(646) 555-0193',
      vehicleModel: '2026 6-Door Cadillac Imperial Limousine',
      plateNumber: 'BFH-LIMO-1',
      assignedPassengers: [`${informantName} (Spouse/Next of Kin)`, 'Adult Children (Marcus Jr., Angela)', 'Immediate Grandchildren'],
      capacity: 7,
      status: 'standby',
      smsDelivered: false,
      turnByTurnUrl: `https://maps.google.com/?daddr=${encodeURIComponent(destination)}`,
      specialInstructions: 'Bottled water, tissues, and umbrella escort service on standby. Maintain 1-car distance behind hearse.'
    },
    {
      id: 'driver-5',
      vehicleNumber: 'Limousine #2 (Extended Kin)',
      role: 'family_limo_2',
      roleLabel: 'Family Limousine #2 (Siblings & In-Laws)',
      driverName: 'Keith Davis (Chauffeur)',
      driverPhone: '(917) 555-0177',
      vehicleModel: '2025 6-Door Lincoln Presidential Limousine',
      plateNumber: 'BFH-LIMO-2',
      assignedPassengers: ['Surviving Siblings', 'Nieces, Nephews & Godchildren'],
      capacity: 7,
      status: 'standby',
      smsDelivered: false,
      turnByTurnUrl: `https://maps.google.com/?daddr=${encodeURIComponent(destination)}`,
      specialInstructions: 'Assemble passengers in BFH Family Suite 1 promptly at 12:15 PM recessional.'
    },
    {
      id: 'driver-6',
      vehicleNumber: 'Pallbearer Transport #106',
      role: 'pallbearer_van',
      roleLabel: 'Active Pallbearers Transport Van',
      driverName: 'Tyrone Scott (Transport Specialist)',
      driverPhone: '(347) 555-0112',
      vehicleModel: '2025 Mercedes-Benz Sprinter Executive',
      plateNumber: 'BFH-VAN-1',
      assignedPassengers: ['6 Active Pallbearers', 'White Gloves & Boutonniere Kit'],
      capacity: 10,
      status: 'standby',
      smsDelivered: false,
      turnByTurnUrl: `https://maps.google.com/?daddr=${encodeURIComponent(destination)}`,
      specialInstructions: 'Arrive at cemetery gravesite ahead of hearse to receive casket from hearse rollers.'
    },
    {
      id: 'driver-7',
      vehicleNumber: 'Escort Captain #107',
      role: 'police_escort',
      roleLabel: 'Motorcade Traffic Escort Detail',
      driverName: 'Sgt. Alonzo Miller (Ret. NYPD / Road Captain)',
      driverPhone: '(212) 555-0155',
      vehicleModel: 'Harley-Davidson Electra Glide Police Special',
      plateNumber: 'ESCORT-NY-1',
      assignedPassengers: ['Motorcade Intersection Blockade Lead'],
      capacity: 1,
      status: 'arrived_st_nicholas',
      smsDelivered: true,
      turnByTurnUrl: `https://maps.google.com/?daddr=${encodeURIComponent(destination)}`,
      specialInstructions: 'Green lights secured via 145th St Bridge & Major Deegan Expressway north to Woodlawn Cemetery.'
    }
  ];

  const defaultReadiness: DayOfServiceReadinessItem[] = [
    {
      id: 'chk-1',
      category: 'clergy_music',
      title: 'Officiating Clergy Arrived & Order of Service Briefed',
      assignedTo: 'Lead Funeral Director',
      status: 'confirmed_ready',
      confirmedAt: '10:15 AM',
      notes: 'Rev. Dr. Butts verified 15-minute eulogy timing and scripture selections.'
    },
    {
      id: 'chk-2',
      category: 'clergy_music',
      title: 'Organist & Soloist Soundcheck Complete',
      assignedTo: 'Audio Technician',
      status: 'confirmed_ready',
      confirmedAt: '10:20 AM',
      notes: 'Sanctuary microphones tested; keys verified for "Amazing Grace" and "Precious Lord".'
    },
    {
      id: 'chk-3',
      category: 'floral_sanctuary',
      title: 'Casket Spray & Sanctuary Wreaths Positioned',
      assignedTo: "Uptown Daniela's Florals",
      status: 'confirmed_ready',
      confirmedAt: '10:05 AM',
      notes: 'White French rose & burgundy orchid casket spray centered with matching standing hearts.'
    },
    {
      id: 'chk-4',
      category: 'pallbearers',
      title: 'Active Pallbearers Briefed (White Gloves & Boutonnieres)',
      assignedTo: 'Staff Director Beth Crowe',
      status: 'in_progress',
      notes: '6 Active pallbearers checking in at Front Lobby; white gloves ready.'
    },
    {
      id: 'chk-5',
      category: 'media_webcast',
      title: 'Digi-Tribute 2.0 Audio/Video Reel Loaded & 4K Webcast Live',
      assignedTo: 'Media Specialist',
      status: 'confirmed_ready',
      confirmedAt: '10:28 AM',
      notes: 'Chapel QR Easel standing at chapel entrance; 4K stream transmitting to 142 remote family members.'
    },
    {
      id: 'chk-6',
      category: 'cemetery_gate',
      title: 'Cemetery Superintendent & Gravesite Confirmed Open',
      assignedTo: 'Woodlawn Cemetery Gate Office',
      status: 'confirmed_ready',
      confirmedAt: '10:30 AM',
      notes: 'Grave Plot #412-B opened; lowering device and canopy tent erected at Woodlawn.'
    }
  ];

  return {
    serviceDate,
    callTime: '9:30 AM',
    serviceStartTime: serviceTime,
    committalDepartureTime: '12:30 PM',
    currentPhaseIndex: 1, // 0: Pre-service, 1: Viewing/Chapel, 2: Sanctuary, 3: Cortege, 4: Committal, 5: Repast
    leadDirectorName: caseData.assignedDirector || 'Jason Benta (LFD #08850)',
    leadDirectorPhone: '(212) 281-8850',
    chapelCueUrl: `https://e-bfh.com/chapel-deck/${caseData.caseNumber}?pin=1928`,
    drivers: defaultDrivers,
    readinessChecklist: defaultReadiness,
    allDriversSmsDispatched: false
  };
}
