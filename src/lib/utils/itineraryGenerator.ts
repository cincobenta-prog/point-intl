import { GoldenRecordCase, DayOfServiceVIPItinerary, ServiceMilestoneItem } from '../types/funeral';

export function generateVIPItinerary(caseData: GoldenRecordCase): DayOfServiceVIPItinerary {
  if (caseData.vipItinerary) {
    return caseData.vipItinerary;
  }

  const s = caseData.serviceSelections;
  const c = caseData.cortegeRoute;
  const d = caseData.decedent;
  const inf = caseData.informant;

  const serviceDate = s.serviceDate || 'Thursday, September 24, 2026';
  const serviceTime = s.serviceTime || '11:00 AM';
  const pickupTime = c?.pickupTime || '09:30 AM';
  const viewingTime = '10:00 AM';
  const motorcadeTime = '12:00 PM';
  const committalTime = c?.dropoffTime || '01:15 PM';
  const repastTime = '02:45 PM';

  const pickupAddress = c?.pickupAddress || 
    (d.residenceAddress ? `${d.residenceAddress}, ${d.city || 'New York'}, ${d.state || 'NY'} ${d.zipCode || '10032'}` : '409 Edgecombe Ave, Apt 6B, New York, NY 10032');
  
  const sanctuaryVenue = s.serviceVenueName || "Benta's Funeral Home - Chapel 1 (Main Sanctuary)";
  const sanctuaryAddress = '630 St. Nicholas Ave, New York, NY 10030';

  const cemeteryVenue = s.crematoryOrCemeteryName || 'Woodlawn Cemetery & Conservancy';
  const cemeteryAddress = c?.dropoffAddress || '4199 Webster Ave, Bronx, NY 10470';

  const repastVenue = c?.returnLocationName || `${inf.fullName.split(' ').pop() || 'Family'} Residence & Fellowship Repast`;
  const repastAddress = c?.returnAddress || pickupAddress;

  const milestones: ServiceMilestoneItem[] = [
    {
      id: 'm-1-pickup',
      timeLabel: pickupTime,
      title: 'Limousine & Family Livery Cortege Dispatch',
      category: 'pickup',
      venueName: c?.pickupLocationName || 'Family Residence',
      address: pickupAddress,
      gpsCoordinates: { lat: 40.8282, lng: -73.9442 },
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupAddress)}`,
      contactPerson: c?.pickupContactName || inf.fullName,
      contactPhone: c?.pickupContactPhone || inf.phone,
      specialInstructions: c?.pickupSpecialInstructions || 'Chauffeur will announce arrival in lobby. Low-step entry for elder family members.',
      status: 'upcoming',
      badgeLabel: 'Cadillac Master Fleet',
      keyDetails: [
        { label: 'Vehicle Fleet', value: '1 Lead Funeral Coach + 1 8-Passenger Cadillac Limousine' },
        { label: 'Lead Chauffeur', value: 'Dwight Washington (BFH Master Livery)' },
        { label: 'Special Accommodation', value: c?.pickupFloorApt || 'Elevator lobby access confirmed' }
      ]
    },
    {
      id: 'm-2-viewing',
      timeLabel: viewingTime,
      title: 'Private Family Repose & Final Viewing',
      category: 'viewing',
      venueName: sanctuaryVenue,
      address: sanctuaryAddress,
      gpsCoordinates: { lat: 40.8239, lng: -73.9472 },
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sanctuaryAddress)}`,
      contactPerson: caseData.assignedDirector || 'Jason Benta, LFD',
      contactPhone: '(212) 281-8850',
      specialInstructions: 'Family VIP Suite open on 2nd floor with private refreshments. Casket floral spray and tribute portraits staged.',
      status: 'upcoming',
      badgeLabel: 'Private Family Suite',
      keyDetails: [
        { label: 'Parlor Reservation', value: s.viewingParlor || 'Main Sanctuary (Chapel 1)' },
        { label: 'Floral Sprays', value: 'Family Heart Tribute + Standing Wreaths staged' },
        { label: 'Memorial Programs', value: 'Full color keepsake bulletins distributed to ushers' }
      ]
    },
    {
      id: 'm-3-service',
      timeLabel: serviceTime,
      title: 'Public Celebration of Life & Sanctuary Service',
      category: 'service',
      venueName: sanctuaryVenue,
      address: sanctuaryAddress,
      gpsCoordinates: { lat: 40.8239, lng: -73.9472 },
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sanctuaryAddress)}`,
      contactPerson: s.officiantName || 'Rev. Dr. Calvin O. Butts III / Pulpit Associate',
      contactPhone: s.officiantPhone || '(212) 862-7474',
      specialInstructions: 'Sanctuary doors open for public guests. 4K live webcast broadcast active with distant family viewing pin.',
      status: 'upcoming',
      badgeLabel: 'Sanctuary Service',
      keyDetails: [
        { label: 'Officiating Clergy', value: s.officiantName || 'Abyssinian Baptist Church' },
        { label: 'Sanctuary Musician', value: s.organistName || 'Minister of Music & Sanctuary Organist' },
        { label: 'Live Broadcast', value: '4K Private Stream & Digital Guestbook Live' }
      ]
    },
    {
      id: 'm-4-motorcade',
      timeLabel: motorcadeTime,
      title: 'Harlem Heritage Cortege Motorcade Departure',
      category: 'motorcade',
      venueName: 'Benta’s Funeral Coach Departure',
      address: '630 St. Nicholas Ave → Harlem River Drive → Major Deegan Expressway',
      gpsCoordinates: { lat: 40.8239, lng: -73.9472 },
      directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(sanctuaryAddress)}&destination=${encodeURIComponent(cemeteryAddress)}`,
      contactPerson: 'Lead Escort Commander',
      contactPhone: '(212) 281-8850',
      specialInstructions: 'All personal cars must turn on headlights and hazard lights. Gold BFH Cortege Pennants provided for dashboards.',
      status: 'upcoming',
      badgeLabel: 'NY Police / BFH Escort',
      keyDetails: [
        { label: 'Motorcade Route', value: 'Passing Historic 125th St & St. Nicholas Historic District' },
        { label: 'Procession Safety', value: 'Escort flaggers leading motorcade through all intersections' },
        { label: 'Tolls & Bridge Fees', value: 'Covered 100% via BFH Pass-Through operating dispatch' }
      ]
    },
    {
      id: 'm-5-committal',
      timeLabel: committalTime,
      title: 'Graveside Committal & Witness Inter Service',
      category: 'committal',
      venueName: cemeteryVenue,
      address: cemeteryAddress,
      gpsCoordinates: { lat: 40.8887, lng: -73.8647 },
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cemeteryAddress)}`,
      contactPerson: 'Cemetery Superintendent (Woodlawn Gatehouse)',
      contactPhone: '(718) 920-0500',
      specialInstructions: c?.dropoffSpecialInstructions || 'Assemble at Woolworth Gatehouse. Electric canopy, tent, and green turf carpet positioned at graveside.',
      status: 'upcoming',
      badgeLabel: 'Witness Committal',
      keyDetails: [
        { label: 'Cemetery Plot', value: 'Hillside Section • Plot 442B • Family Estate Lot' },
        { label: 'Graveside Setup', value: 'Full Weather Canopy, 18 Chairs, Lowering Device' },
        { label: 'Cemetery Fee Check', value: 'Hand-Delivered by Director at Graveside ($3,500)' }
      ]
    },
    {
      id: 'm-6-repast',
      timeLabel: repastTime,
      title: 'Repast & Family Fellowship Gathering',
      category: 'repast',
      venueName: repastVenue,
      address: repastAddress,
      gpsCoordinates: { lat: 40.8282, lng: -73.9442 },
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(repastAddress)}`,
      contactPerson: inf.fullName,
      contactPhone: inf.phone,
      specialInstructions: 'Catering delivery received. Limousines will return immediate family directly to repast venue.',
      status: 'upcoming',
      badgeLabel: 'Family Fellowship',
      keyDetails: [
        { label: 'Return Transportation', value: 'Cadillac Limousine return transit included' },
        { label: 'Hospitality Team', value: 'Floral baskets & framed portraits transported to repast' }
      ]
    }
  ];

  return {
    caseId: caseData.id,
    caseNumber: caseData.caseNumber,
    decedentName: d.legalName,
    serviceDate: serviceDate,
    directorName: caseData.assignedDirector || 'Jason Benta, LFD',
    directorPhone: '(212) 281-8850',
    directorEmail: 'director@bentasfuneralhome.com',
    directorLicense: 'NYS LFD #08850',
    limousineLeadChauffeur: 'Dwight Washington',
    limousinePhone: '(917) 555-0182',
    limousinePlate: 'T782910C',
    pallbearers: [
      { name: 'Marcus Vance Jr.', type: 'active', role: 'Son / Lead Pallbearer' },
      { name: 'Dr. Gregory Hayes', type: 'active', role: 'Colleague' },
      { name: 'Kendall Vance', type: 'active', role: 'Nephew' },
      { name: 'David Washington', type: 'active', role: 'Fraternity Brother' },
      { name: 'Arthur Bennett', type: 'active', role: 'Church Deacon' },
      { name: 'Robert Sinclair', type: 'active', role: 'Lifelong Friend' },
      { name: 'Rev. Dr. Calvin Butts', type: 'honorary', role: 'Pastor Emeritus' },
      { name: 'Judge Harold Vance', type: 'honorary', role: 'Brother' }
    ],
    milestones: milestones,
    cortegeInstructions: [
      'Turn vehicle headlights ON throughout the entire processional transit.',
      'Activate hazard emergency flashers upon leaving the chapel curb.',
      'Place the gold BFH cortege identification pennant visibly on the right front dashboard.',
      'Maintain close formation following the lead police/director escort vehicle.',
      'Do not break cortege formation at red traffic lights when the lead escort has secured the crossing.'
    ],
    repastInfo: {
      venue: repastVenue,
      address: repastAddress,
      time: repastTime,
      notes: 'Fellowship repast with catered Southern buffet & Harlem Jazz memorial audio.'
    },
    shareableToken: `tok_vip_${caseData.caseNumber.replace(/[^A-Za-z0-9]/g, '')}`
  };
}
