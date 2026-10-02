import React, { useState, useEffect } from 'react';
import { 
  GoldenRecordCase, 
  ObituaryPackageData, 
  FactLedgerItem, 
  DocumentItem,
  SimulatedNotification,
  LiveryCortegeRoute,
  FuneralAnnouncementData,
  AnnouncementTheme,
  AnnouncementAspectRatio,
  TributePhotoItem
} from '../../lib/types/funeral';
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  PenTool, 
  Copy, 
  Printer, 
  Plus, 
  Image as ImageIcon, 
  Calendar, 
  Car, 
  Check, 
  ArrowLeft, 
  AlertTriangle, 
  Upload, 
  Share2, 
  QrCode, 
  Headphones, 
  Send, 
  Smartphone, 
  User, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X, 
  MessageSquare, 
  Video, 
  Home, 
  Edit3, 
  Lock, 
  Unlock, 
  Navigation, 
  Building2, 
  Download, 
  ExternalLink, 
  Camera, 
  Globe, 
  Palette, 
  Layout, 
  MessageCircle, 
  Trash2, 
  ScrollText, 
  Flower2 
} from 'lucide-react';
import { FamilyPortalOverviewHome } from './FamilyPortalOverviewHome';
import { FamilyCareConciergeView } from './FamilyCareConciergeView';
import { FamilyWebcastServiceView } from './FamilyWebcastServiceView';
import { FloralTributeShopModal } from './FloralTributeShopModal';
import { DigitalTributeStudioView } from './DigitalTributeStudioView';

interface FamilyPortalViewProps {
  activeCase: GoldenRecordCase;
  cases: GoldenRecordCase[];
  onSelectCase: (caseItem: GoldenRecordCase) => void;
  onUpdateCase: (updatedCase: GoldenRecordCase) => void;
  onOpenESignModal?: (doc?: DocumentItem) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenFamilyProofApproval?: () => void;
  onOpenGuidedTour?: () => void;
  onExitPortal: () => void;
  isStaffUser?: boolean;
}

export const FamilyPortalView: React.FC<FamilyPortalViewProps> = ({
  activeCase,
  cases,
  onSelectCase,
  onUpdateCase,
  onOpenESignModal,
  onSendNotification,
  onOpenGuidedTour,
  onExitPortal,
  isStaffUser = false
}) => {
  // Main Family Portal Nav Tab (Defaults to 'home' Welcome & Overview)
  const [portalTab, setPortalTab] = useState<'home' | 'obituary' | 'tribute' | 'webcast' | 'concierge' | 'arrangements' | 'documents' | 'photos' | 'status'>('home');

  // Obituary Assistant Sub-View: 'interview' | 'drafting' | 'ledger' | 'safety' | 'approval'
  const [obitSection, setObitSection] = useState<'interview' | 'drafting' | 'ledger' | 'safety' | 'approval'>('interview');
  const [interviewStep, setInterviewStep] = useState<number>(1);

  // Floral Tribute Shop Modal State
  const [isFloralShopModalOpen, setIsFloralShopModalOpen] = useState<boolean>(false);

  // Toast Notification Alert State
  const [toastAlert, setToastAlert] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 4500);
  };

  // Livery Cortege Route State
  const defaultCortegeRoute: LiveryCortegeRoute = activeCase.cortegeRoute || {
    id: `route-${activeCase.id}`,
    caseId: activeCase.id,
    pickupLocationName: `${activeCase.informant.fullName.split(' ').pop() || 'Family'} Residence`,
    pickupAddress: activeCase.decedent.residenceAddress
      ? `${activeCase.decedent.residenceAddress}, ${activeCase.decedent.city}, ${activeCase.decedent.state} ${activeCase.decedent.zipCode}`
      : '409 Edgecombe Ave, Apt 6B, New York, NY 10032',
    pickupContactName: activeCase.informant.fullName,
    pickupContactPhone: activeCase.informant.phone,
    pickupTime: '09:30 AM',
    pickupFloorApt: 'Apt 6B (Elevator building, rear courtyard ramp access)',
    pickupSpecialInstructions: 'Elder family member requires low-step entry. 2 floral standing sprays to be loaded with cortege.',
    serviceVenueName: activeCase.serviceSelections.serviceVenueName || "Benta's Funeral Home - Chapel 1 (Main Sanctuary)",
    serviceVenueAddress: '630 Saint Nicholas Ave, New York, NY 10030',
    serviceTime: activeCase.serviceSelections.serviceTime || '11:00 AM',
    dropoffLocationName: activeCase.serviceSelections.crematoryOrCemeteryName || 'Woodlawn Cemetery & Crematory',
    dropoffAddress: '4199 Webster Ave, Bronx, NY 10470',
    dropoffTime: '01:30 PM',
    dropoffSpecialInstructions: 'Procession will assemble at Woolworth Gatehouse for witness committal service.',
    returnLocationName: `${activeCase.informant.fullName.split(' ').pop() || 'Family'} Residence & Repast Gathering`,
    returnAddress: activeCase.decedent.residenceAddress
      ? `${activeCase.decedent.residenceAddress}, ${activeCase.decedent.city}, ${activeCase.decedent.state} ${activeCase.decedent.zipCode}`
      : '409 Edgecombe Ave, New York, NY 10032',
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
    confirmedBy: activeCase.informant.fullName,
    lastModifiedAt: '2026-09-18 04:30 PM',
    serviceDateTime: `${activeCase.serviceSelections.serviceDate || '2026-09-22'} ${activeCase.serviceSelections.serviceTime || '11:00 AM'}`,
    cutoffHours: 10,
    isLockedBy10HourRule: false
  };

  const [cortegeRoute, setCortegeRoute] = useState<LiveryCortegeRoute>(activeCase.cortegeRoute || defaultCortegeRoute);
  const [isEditingRoute, setIsEditingRoute] = useState<boolean>(false);
  const [simulateUnder10hLock, setSimulateUnder10hLock] = useState<boolean>(false);

  // Form State for editing
  const [formPickupName, setFormPickupName] = useState(cortegeRoute.pickupLocationName);
  const [formPickupAddress, setFormPickupAddress] = useState(cortegeRoute.pickupAddress);
  const [formPickupTime, setFormPickupTime] = useState(cortegeRoute.pickupTime);
  const [formPickupContact, setFormPickupContact] = useState(cortegeRoute.pickupContactName);
  const [formPickupPhone, setFormPickupPhone] = useState(cortegeRoute.pickupContactPhone);
  const [formPickupFloorApt, setFormPickupFloorApt] = useState(cortegeRoute.pickupFloorApt || '');
  const [formPickupInstructions, setFormPickupInstructions] = useState(cortegeRoute.pickupSpecialInstructions || '');

  const [formDropoffName, setFormDropoffName] = useState(cortegeRoute.dropoffLocationName);
  const [formDropoffAddress, setFormDropoffAddress] = useState(cortegeRoute.dropoffAddress);
  const [formDropoffTime, setFormDropoffTime] = useState(cortegeRoute.dropoffTime || '01:30 PM');
  const [formDropoffInstructions, setFormDropoffInstructions] = useState(cortegeRoute.dropoffSpecialInstructions || '');

  const [formReturnName, setFormReturnName] = useState(cortegeRoute.returnLocationName || '');
  const [formReturnAddress, setFormReturnAddress] = useState(cortegeRoute.returnAddress || '');
  const [formReturnRequired, setFormReturnRequired] = useState(cortegeRoute.returnRequired);
  const [formPassengers, setFormPassengers] = useState(cortegeRoute.totalPassengers);

  // Sync state when activeCase changes
  useEffect(() => {
    const route = activeCase.cortegeRoute || defaultCortegeRoute;
    setCortegeRoute(route);
    setFormPickupName(route.pickupLocationName);
    setFormPickupAddress(route.pickupAddress);
    setFormPickupTime(route.pickupTime);
    setFormPickupContact(route.pickupContactName);
    setFormPickupPhone(route.pickupContactPhone);
    setFormPickupFloorApt(route.pickupFloorApt || '');
    setFormPickupInstructions(route.pickupSpecialInstructions || '');
    setFormDropoffName(route.dropoffLocationName);
    setFormDropoffAddress(route.dropoffAddress);
    setFormDropoffTime(route.dropoffTime || '01:30 PM');
    setFormDropoffInstructions(route.dropoffSpecialInstructions || '');
    setFormReturnName(route.returnLocationName || '');
    setFormReturnAddress(route.returnAddress || '');
    setFormReturnRequired(route.returnRequired);
    setFormPassengers(route.totalPassengers);
  }, [activeCase.id]);

  // Is locked check
  const isCortegeLocked = simulateUnder10hLock || cortegeRoute.isLockedBy10HourRule;

  // Handle Save Route
  const handleSaveRoute = () => {
    if (isCortegeLocked) {
      showToast('❌ Route is locked (within 10-hour cutoff). Please call Director on Duty at (212) 281-8850 for emergency adjustments.');
      return;
    }

    const nowFormatted = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedRoute: LiveryCortegeRoute = {
      ...cortegeRoute,
      pickupLocationName: formPickupName,
      pickupAddress: formPickupAddress,
      pickupTime: formPickupTime,
      pickupContactName: formPickupContact,
      pickupContactPhone: formPickupPhone,
      pickupFloorApt: formPickupFloorApt,
      pickupSpecialInstructions: formPickupInstructions,
      dropoffLocationName: formDropoffName,
      dropoffAddress: formDropoffAddress,
      dropoffTime: formDropoffTime,
      dropoffSpecialInstructions: formDropoffInstructions,
      returnLocationName: formReturnName,
      returnAddress: formReturnAddress,
      returnRequired: formReturnRequired,
      totalPassengers: formPassengers,
      isConfirmedByFamily: true,
      confirmedAt: nowFormatted,
      confirmedBy: activeCase.informant.fullName,
      lastModifiedAt: nowFormatted
    };

    setCortegeRoute(updatedRoute);
    setIsEditingRoute(false);

    onUpdateCase({
      ...activeCase,
      cortegeRoute: updatedRoute,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: `Family Portal (${activeCase.informant.fullName})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Cortege Route updated & confirmed by Next of Kin. Pickup: ${formPickupAddress} (${formPickupTime}), Drop-off: ${formDropoffAddress} (${formDropoffTime}). Passengers: ${formPassengers}. Locked with Harlem Livery Dispatch.`
        },
        ...activeCase.notes
      ]
    });

    if (onSendNotification) {
      onSendNotification({
        id: `notif-cortege-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.assignedDirector,
        recipientPhone: '(212) 281-8850',
        channel: 'sms',
        type: 'service_schedule',
        title: `CORTEGE ROUTE CONFIRMED BY FAMILY: ${activeCase.decedent.legalName}`,
        bodyText: `BFH DISPATCH ALERT: ${activeCase.informant.fullName} has confirmed pickup at ${formPickupAddress} (${formPickupTime}) and dropoff at ${formDropoffAddress} (${formDropoffTime}) for ${formPassengers} passengers. 10-Hour policy active.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    showToast(`✅ Pick-up & drop-off route successfully updated and confirmed with Harlem Livery Dispatch!`);
  };

  // Handle Quick Confirm
  const handleQuickConfirmRoute = () => {
    const nowFormatted = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedRoute: LiveryCortegeRoute = {
      ...cortegeRoute,
      isConfirmedByFamily: true,
      confirmedAt: nowFormatted,
      confirmedBy: activeCase.informant.fullName,
      lastModifiedAt: nowFormatted
    };

    setCortegeRoute(updatedRoute);

    onUpdateCase({
      ...activeCase,
      cortegeRoute: updatedRoute,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: `Family Portal (${activeCase.informant.fullName})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Cortege Route verified & confirmed by ${activeCase.informant.fullName}. Pickup: ${cortegeRoute.pickupAddress} at ${cortegeRoute.pickupTime}.`
        },
        ...activeCase.notes
      ]
    });

    if (onSendNotification) {
      onSendNotification({
        id: `notif-cortege-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.assignedDirector,
        recipientPhone: '(212) 281-8850',
        channel: 'sms',
        type: 'service_schedule',
        title: `CORTEGE ROUTE CONFIRMED: ${activeCase.decedent.legalName}`,
        bodyText: `BFH DISPATCH: ${activeCase.informant.fullName} has verified and confirmed the cortege route for ${activeCase.decedent.legalName}.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    showToast(`✓ Cortege route and pick-up timing officially confirmed by ${activeCase.informant.fullName}!`);
  };

  // Dispatch SMS Itinerary to Family
  const handleSendItinerarySMS = () => {
    if (onSendNotification) {
      onSendNotification({
        id: `notif-itin-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.informant.fullName,
        recipientPhone: activeCase.informant.phone,
        channel: 'sms',
        type: 'service_schedule',
        title: `Cortege Route Itinerary for ${activeCase.decedent.legalName}`,
        bodyText: `BFH Cortege Itinerary: Pickup at ${cortegeRoute.pickupAddress} (${cortegeRoute.pickupTime}). Service at ${cortegeRoute.serviceVenueName} (${cortegeRoute.serviceTime}). Drop-off at ${cortegeRoute.dropoffLocationName} (${cortegeRoute.dropoffTime}). Lead Escort: ${cortegeRoute.vehiclesAllocated[0]?.assignedDriver || 'Director Benta'}. Note: Changes permitted up to 10h prior to service.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }
    showToast(`📱 Complete cortege itinerary dispatched via SMS to ${activeCase.informant.fullName} (${activeCase.informant.phone})!`);
  };

  // Photos & Announcement Studio Sub-Tab: 'announcement' | 'gallery'
  const [photoSubTab, setPhotoSubTab] = useState<'announcement' | 'gallery'>('announcement');

  // Photo Upload Modal & Form State
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoPlacement, setNewPhotoPlacement] = useState<'Front Cover' | 'Inside Spread' | 'Obituary Column' | 'Back Keepsake'>('Front Cover');

  // Funeral Announcement Customizer State
  const [announcementTheme, setAnnouncementTheme] = useState<AnnouncementTheme>(
    activeCase.funeralAnnouncement?.theme || 'harlem_obsidian_gold'
  );
  const [announcementAspectRatio, setAnnouncementAspectRatio] = useState<AnnouncementAspectRatio>(
    activeCase.funeralAnnouncement?.aspectRatio || 'mobile_story_9_16'
  );
  const [announcementHeadline, setAnnouncementHeadline] = useState(
    activeCase.funeralAnnouncement?.headlineTitle || "Homegoing Celebration & Life Legacy"
  );
  const [announcementPortraitUrl, setAnnouncementPortraitUrl] = useState(
    activeCase.funeralAnnouncement?.portraitUrl || activeCase.obituaryData?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'
  );
  const [announcementFrameStyle, setAnnouncementFrameStyle] = useState<'arched_gold_foil' | 'oval_classic' | 'square_crest'>(
    activeCase.funeralAnnouncement?.portraitFrameStyle || 'arched_gold_foil'
  );

  const [announcementWakeInfo, setAnnouncementWakeInfo] = useState(
    activeCase.funeralAnnouncement?.visitationInfo || 'Public Viewing & Wake: Monday, Sep 21, 2026 • 4:00 PM – 8:00 PM'
  );
  const [announcementWakeVenue, setAnnouncementWakeVenue] = useState(
    activeCase.funeralAnnouncement?.visitationVenue || "Benta's Funeral Home — Parlor A (630 St. Nicholas Ave, Harlem, NYC)"
  );
  const [announcementServiceInfo, setAnnouncementServiceInfo] = useState(
    activeCase.funeralAnnouncement?.serviceInfo || 'Funeral Sanctuary Service: Tuesday, Sep 22, 2026 • 11:00 AM'
  );
  const [announcementServiceVenue, setAnnouncementServiceVenue] = useState(
    activeCase.funeralAnnouncement?.serviceVenue || activeCase.serviceSelections.serviceVenueName || "Benta's Main Sanctuary Chapel 1"
  );
  const [announcementServiceAddress, setAnnouncementServiceAddress] = useState(
    activeCase.funeralAnnouncement?.serviceAddress || '630 Saint Nicholas Ave, New York, NY 10030'
  );
  const [announcementOfficiant, setAnnouncementOfficiant] = useState(
    activeCase.funeralAnnouncement?.officiantInfo || (activeCase.serviceSelections.officiantName ? `Officiated by ${activeCase.serviceSelections.officiantName}` : 'Officiated by Rev. Dr. Calvin Butts IV')
  );
  const [announcementCommittal, setAnnouncementCommittal] = useState(
    activeCase.funeralAnnouncement?.committalInfo || `Witness Committal: ${activeCase.serviceSelections.crematoryOrCemeteryName || 'Woodlawn Cemetery & Crematory (Bronx, NY)'}`
  );
  const [announcementWebcastUrl, setAnnouncementWebcastUrl] = useState(
    activeCase.funeralAnnouncement?.webcastUrl || activeCase.webcastSchedule?.streamUrl || `https://e-bfh.com/live/${activeCase.caseNumber}`
  );
  const [announcementWebcastPin, setAnnouncementWebcastPin] = useState(
    activeCase.funeralAnnouncement?.webcastPin || activeCase.webcastSchedule?.securityPin || '1928'
  );
  const [announcementDonations, setAnnouncementDonations] = useState(
    activeCase.funeralAnnouncement?.memorialDonationsNote || activeCase.obituaryData?.memorialDonations || `In lieu of flowers, memorial gifts may be made in honor of ${activeCase.decedent.legalName} to the Harlem Youth & Education Foundation.`
  );
  const [announcementFamilyMessage, setAnnouncementFamilyMessage] = useState(
    activeCase.funeralAnnouncement?.familyMessage || `“The ${activeCase.informant.fullName.split(' ').pop() || 'Vance'} Family extends our deepest gratitude for your comforting prayers, condolences, and enduring love.”`
  );

  // SMS Text Announcement Dispatcher Modal State
  const [isAnnouncementSMSModalOpen, setIsAnnouncementSMSModalOpen] = useState(false);
  const [announcementSMSRecipientName, setAnnouncementSMSRecipientName] = useState('');
  const [announcementSMSRecipientPhone, setAnnouncementSMSRecipientPhone] = useState('');
  const [announcementSMSCustomNote, setAnnouncementSMSCustomNote] = useState('');
  const [announcementSMSHistory, setAnnouncementSMSHistory] = useState<Array<{ id: string; name: string; phone: string; sentAt: string }>>([
    { id: 'sms-1', name: 'Harlem Community Elders Circle', phone: '(212) 555-8819', sentAt: 'Yesterday at 3:15 PM' },
    { id: 'sms-2', name: 'Abyssinian Baptist Church Deacons', phone: '(212) 555-4920', sentAt: 'Today at 10:30 AM' }
  ]);

  // Add new photo handler
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) {
      showToast('Please provide an image URL or upload a photo.');
      return;
    }
    const newPhotoItem: TributePhotoItem = {
      id: `photo-${Date.now()}`,
      caption: newPhotoCaption.trim() || 'Uploaded Family Memorial Portrait',
      placement: newPhotoPlacement,
      url: newPhotoUrl.trim()
    };
    const updatedPhotos = [newPhotoItem, ...obitState.photos];
    const updatedObit = {
      ...obitState,
      photos: updatedPhotos
    };
    setObitState(updatedObit);
    onUpdateCase({
      ...activeCase,
      obituaryData: updatedObit
    });
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setIsPhotoUploadModalOpen(false);
    showToast(`📸 Photo successfully uploaded to Memorial Media Vault (${newPhotoPlacement})!`);
  };

  // Delete photo handler
  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = obitState.photos.filter(p => p.id !== photoId);
    const updatedObit = {
      ...obitState,
      photos: updatedPhotos
    };
    setObitState(updatedObit);
    onUpdateCase({
      ...activeCase,
      obituaryData: updatedObit
    });
    showToast('🗑️ Photo removed from Memorial Vault.');
  };

  // Set as Announcement Portrait
  const handleSetAsAnnouncementPortrait = (url: string) => {
    setAnnouncementPortraitUrl(url);
    showToast('⭐ Selected as official Announcement Portrait!');
  };

  // Save Announcement Settings to Golden Record
  const handleSaveAnnouncementData = () => {
    const announcementData: FuneralAnnouncementData = {
      id: `ann-${activeCase.id}`,
      caseId: activeCase.id,
      theme: announcementTheme,
      aspectRatio: announcementAspectRatio,
      headlineTitle: announcementHeadline,
      decedentLegalName: activeCase.decedent.legalName,
      lifeDates: `${activeCase.decedent.dateOfBirth} — ${activeCase.decedent.dateOfDeath}`,
      portraitUrl: announcementPortraitUrl,
      portraitFrameStyle: announcementFrameStyle,
      visitationInfo: announcementWakeInfo,
      visitationVenue: announcementWakeVenue,
      serviceInfo: announcementServiceInfo,
      serviceVenue: announcementServiceVenue,
      serviceAddress: announcementServiceAddress,
      officiantInfo: announcementOfficiant,
      committalInfo: announcementCommittal,
      webcastUrl: announcementWebcastUrl,
      webcastPin: announcementWebcastPin,
      memorialDonationsNote: announcementDonations,
      familyMessage: announcementFamilyMessage,
      totalSocialShares: (activeCase.funeralAnnouncement?.totalSocialShares || 0) + 1,
      totalSmsDispatches: announcementSMSHistory.length,
      lastSharedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onUpdateCase({
      ...activeCase,
      funeralAnnouncement: announcementData,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: `Family Portal (${activeCase.informant.fullName})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Public Funeral Announcement Graphic customized & saved (${announcementTheme.replace(/_/g, ' ').toUpperCase()}). Ready for social media & text distribution.`
        },
        ...activeCase.notes
      ]
    });

    showToast('💾 Elegant Funeral Announcement Graphic saved & synchronized with Benta Production Desk!');
  };

  // Build plain text announcement for sharing / copying
  const getAnnouncementShareText = () => {
    return `🕊️ ${announcementHeadline.toUpperCase()}
In Loving Memory of ${activeCase.decedent.legalName}
(${activeCase.decedent.dateOfBirth} — ${activeCase.decedent.dateOfDeath})

📅 VISITATION & WAKE:
${announcementWakeInfo}
📍 ${announcementWakeVenue}

⛪ FUNERAL SANCTUARY SERVICE:
${announcementServiceInfo}
📍 ${announcementServiceVenue} (${announcementServiceAddress})
${announcementOfficiant}

🌿 WITNESS COMMITTAL:
${announcementCommittal}

🔴 LIVE 4K WEBCAST & ONLINE TRIBUTE:
Watch Live: ${announcementWebcastUrl} (PIN: ${announcementWebcastPin})
Digital Memorial Archive: https://e-bfh.com/tribute/${activeCase.caseNumber}

💐 MEMORIAL GIFTS:
${announcementDonations}

${announcementFamilyMessage}

— Benta's Funeral Home, Harlem, NYC • (212) 281-8850`;
  };

  // Copy announcement text
  const handleCopyAnnouncementText = () => {
    const text = getAnnouncementShareText();
    navigator.clipboard.writeText(text);
    showToast('📋 Public Funeral Announcement text copied to clipboard!');
  };

  // Social Sharing Handlers
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getAnnouncementShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    handleSaveAnnouncementData();
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(`https://e-bfh.com/tribute/${activeCase.caseNumber}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    handleSaveAnnouncementData();
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`In Loving Memory of ${activeCase.decedent.legalName} (${activeCase.decedent.dateOfBirth} — ${activeCase.decedent.dateOfDeath}). Service details & live webcast: https://e-bfh.com/tribute/${activeCase.caseNumber} #InLovingMemory #HarlemCelebrationOfLife`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    handleSaveAnnouncementData();
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(`https://e-bfh.com/tribute/${activeCase.caseNumber}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    handleSaveAnnouncementData();
  };

  // Dispatch SMS Text Announcement
  const handleDispatchAnnouncementSMS = (recipientName: string, recipientPhone: string) => {
    if (!recipientPhone.trim()) {
      showToast('Please enter a recipient phone number.');
      return;
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry = {
      id: `sms-${Date.now()}`,
      name: recipientName.trim() || 'Community Contact',
      phone: recipientPhone.trim(),
      sentAt: `Today at ${timeNow}`
    };

    setAnnouncementSMSHistory([newEntry, ...announcementSMSHistory]);

    if (onSendNotification) {
      onSendNotification({
        id: `notif-ann-sms-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: recipientName.trim() || 'Community Member',
        recipientPhone: recipientPhone.trim(),
        channel: 'sms',
        type: 'service_schedule',
        title: `FUNERAL ANNOUNCEMENT: ${activeCase.decedent.legalName}`,
        bodyText: `Benta's Memorial Notice: ${announcementHeadline} for ${activeCase.decedent.legalName}. Service: ${announcementServiceInfo} at ${announcementServiceVenue}. Live Webcast & Memorial Archive: ${announcementWebcastUrl} (PIN: ${announcementWebcastPin}). ${announcementSMSCustomNote ? `Note from family: "${announcementSMSCustomNote}"` : ''}`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    onUpdateCase({
      ...activeCase,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: `Family Announcement Dispatcher`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Funeral announcement card & service schedule dispatched via SMS to ${recipientName || 'Contact'} (${recipientPhone}).`
        },
        ...activeCase.notes
      ]
    });

    setAnnouncementSMSRecipientName('');
    setAnnouncementSMSRecipientPhone('');
    setAnnouncementSMSCustomNote('');
    setIsAnnouncementSMSModalOpen(false);

    showToast(`📱 Official funeral announcement SMS successfully dispatched to ${recipientName || recipientPhone}!`);
  };

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Initialize or pull obituary data from activeCase
  const defaultObituaryData: ObituaryPackageData = {
    spokespersonName: activeCase.informant.fullName || 'Spokesperson',
    spokespersonRelation: activeCase.informant.relationship || 'Next of Kin',
    spokespersonEmail: activeCase.informant.email || '',
    consentGranted: true,
    
    // Step 2: Oral History
    ordinaryHabits: activeCase.obituaryData?.ordinaryHabits || 
      `Every morning before sunrise, ${activeCase.decedent.legalName.split(' ')[0]} brewed fresh chamomile tea and left handwritten notes of quiet encouragement on the kitchen counter for the family.`,
    signaturePhrase: activeCase.obituaryData?.signaturePhrase || 
      `“Don't you dare let one bad day tell you who you are.”`,
    definingStory: activeCase.obituaryData?.definingStory || 
      `When neighborhood arts programs faced severe cuts, ${activeCase.decedent.legalName.split(' ')[0]} gathered retired mentors to host free after-school music and reading workshops right from the family living room for over four years.`,
    
    // Step 3: Chronology
    birthDetails: activeCase.obituaryData?.birthDetails || 
      `${activeCase.decedent.dateOfBirth} · ${activeCase.decedent.city}, ${activeCase.decedent.state}`,
    passingDetails: activeCase.obituaryData?.passingDetails || 
      `${activeCase.decedent.dateOfDeath} · ${activeCase.decedent.placeOfDeath}`,
    educationCareer: activeCase.obituaryData?.educationCareer || 
      `Dedicated over 35 years of master service in ${activeCase.decedent.industry}. A proud alumnus, community mentor, and lifelong pillar of the Harlem civic leadership.`,
    
    // Step 4: Family & Services
    survivors: activeCase.obituaryData?.survivors || 
      `Devoted spouse ${activeCase.informant.fullName}; loving children and grandchildren; beloved siblings; and a host of cherished relatives, former colleagues, and lifelong friends.`,
    predeceased: activeCase.obituaryData?.predeceased || 
      `Parents ${activeCase.decedent.fatherName} and ${activeCase.decedent.motherMaidenName}.`,
    serviceDetails: activeCase.obituaryData?.serviceDetails || 
      `A celebration of life will be held ${activeCase.serviceSelections.serviceDate || 'Saturday'} at ${activeCase.serviceSelections.serviceTime || '11:00 AM'} at ${activeCase.serviceSelections.serviceVenueName || "Benta's Funeral Home Chapel"}, 630 St. Nicholas Ave, New York, NY.`,
    memorialDonations: activeCase.obituaryData?.memorialDonations || 
      `In lieu of flowers, memorial contributions may be made in honor of ${activeCase.decedent.legalName} to the Harlem Heritage & Youth Enrichment Foundation.`,
    
    // Step 5 & 6: Dual Drafts
    voiceTone: activeCase.obituaryData?.voiceTone || 'warm',
    fullObituaryDraft: activeCase.obituaryData?.fullObituaryDraft || '',
    shortNoticeDraft: activeCase.obituaryData?.shortNoticeDraft || '',
    
    // Fact Ledger
    factLedger: activeCase.obituaryData?.factLedger || [
      { id: 'f-1', detail: `Legal Full Name: ${activeCase.decedent.legalName}`, source: 'NYC EDRS Verified Record', tag: 'confirmed', category: 'identity' },
      { id: 'f-2', detail: `Date of Passing: ${activeCase.decedent.dateOfDeath}`, source: `${activeCase.decedent.placeOfDeath}`, tag: 'confirmed', category: 'dates' },
      { id: 'f-3', detail: `Spouse / Primary Next of Kin: ${activeCase.informant.fullName}`, source: 'Family Record', tag: 'confirmed', category: 'family' },
      { id: 'f-4', detail: `Military Service: ${activeCase.decedent.veteran ? activeCase.decedent.branchOfService || 'U.S. Armed Forces' : 'Civilian'}`, source: 'Official Record', tag: 'confirmed', category: 'career' },
      { id: 'f-5', detail: `Private Family Nickname: "Little Chief"`, source: 'Family Memory (Private)', tag: 'private', category: 'private' }
    ],
    
    // Fraud Shield
    fraudShieldPassed: true,
    ageInsteadOfBirthdate: true,
    chapelAddressProtected: true,
    relativeHometownsProtected: true,
    
    // Review & Signoff
    reviewGate1Facts: true,
    reviewGate2Names: true,
    reviewGate3Tone: true,
    reviewGate4Privacy: true,
    isSignedOff: activeCase.obituaryData?.isSignedOff || false,
    signedOffAt: activeCase.obituaryData?.signedOffAt || undefined,
    signedOffBy: activeCase.obituaryData?.signedOffBy || undefined,
    
    // Photos
    photos: activeCase.obituaryData?.photos || [
      { id: 'p-1', caption: 'Official Portrait for Program Front Cover', placement: 'Front Cover', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80' },
      { id: 'p-2', caption: 'Family Gathering & Mentorship Celebration', placement: 'Inside Spread', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=80' },
      { id: 'p-3', caption: 'Graduation & Military Honors Memorial', placement: 'Back Keepsake', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80' }
    ]
  };

  const [obitState, setObitState] = useState<ObituaryPackageData>(activeCase.obituaryData || defaultObituaryData);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [newFactDetail, setNewFactDetail] = useState('');
  const [newFactTag, setNewFactTag] = useState<'confirmed' | 'unconfirmed' | 'private' | 'omitted'>('confirmed');

  // Regenerate / synchronize dual drafts whenever case changes
  useEffect(() => {
    if (activeCase.obituaryData) {
      setObitState(activeCase.obituaryData);
    } else {
      setObitState(defaultObituaryData);
    }
  }, [activeCase.id]);

  useEffect(() => {
    if (!obitState.fullObituaryDraft) {
      handleGenerateDrafts();
    }
  }, [obitState.fullObituaryDraft]);

  const handleGenerateDrafts = () => {
    const firstName = activeCase.decedent.legalName.split(' ')[0];
    const lastName = activeCase.decedent.legalName.split(' ').slice(-1)[0];
    
    const full = `${activeCase.decedent.legalName}, a beloved soul and esteemed pillar of our community whose kindness, wisdom, and leadership touched countless lives, entered into eternal rest on ${activeCase.decedent.dateOfDeath} in New York.

Born on ${activeCase.decedent.dateOfBirth} in ${activeCase.decedent.city}, ${firstName} lived a life rooted in unwavering generosity, steadfast courage, and devotion to family. ${obitState.educationCareer}

${obitState.definingStory}

${obitState.ordinaryHabits} Words that will forever echo in our hearts: ${obitState.signaturePhrase}

${firstName} is lovingly remembered and survived by ${obitState.survivors}. Preceded in eternal peace by ${obitState.predeceased}.

${obitState.serviceDetails} ${obitState.memorialDonations}`;

    const short = `${lastName.toUpperCase()}, ${activeCase.decedent.legalName} — Passed away ${activeCase.decedent.dateOfDeath}. Beloved ${activeCase.decedent.occupation} and community pillar. Survived by loving spouse ${activeCase.informant.fullName} and family. Predeceased by parents. ${obitState.serviceDetails} ${obitState.memorialDonations}`;

    const updated = {
      ...obitState,
      fullObituaryDraft: full,
      shortNoticeDraft: short
    };

    setObitState(updated);
    saveObituaryToCase(updated);
  };

  const saveObituaryToCase = (updatedObit: ObituaryPackageData) => {
    onUpdateCase({
      ...activeCase,
      obituaryData: updatedObit
    });
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleAddFact = () => {
    if (!newFactDetail.trim()) return;
    const newEntry: FactLedgerItem = {
      id: `fact-${Date.now()}`,
      detail: newFactDetail.trim(),
      source: `Provided by ${obitState.spokespersonName}`,
      tag: newFactTag,
      category: 'stories'
    };
    const updated = {
      ...obitState,
      factLedger: [newEntry, ...obitState.factLedger]
    };
    setObitState(updated);
    saveObituaryToCase(updated);
    setNewFactDetail('');
  };

  const handleFinalSignoff = () => {
    if (!obitState.reviewGate1Facts || !obitState.reviewGate2Names || !obitState.reviewGate3Tone || !obitState.reviewGate4Privacy) {
      alert('Please complete all 4 review verification gates before authorizing final publication.');
      return;
    }

    const nowFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: ObituaryPackageData = {
      ...obitState,
      isSignedOff: true,
      signedOffAt: nowFormatted,
      signedOffBy: obitState.spokespersonName
    };
    setObitState(updated);
    saveObituaryToCase(updated);
    alert(`Obituary publication successfully authorized by ${obitState.spokespersonName}! Master record synchronized with Director Production Desk.`);
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-neutral-900 font-sans flex flex-col">
      
      {/* Top Contact & Announcement Bar (e-bfh.com style) */}
      <div className="bg-[#141b2b] text-white text-xs py-2 px-4 sm:px-8 flex flex-wrap justify-between items-center gap-2 border-b border-amber-500/30">
        <div className="flex items-center space-x-3 text-amber-200/90 font-medium">
          <span>📍 630 Saint Nicholas Ave, New York, NY 10030</span>
          <span className="hidden md:inline text-neutral-500">|</span>
          <span className="hidden md:inline">📞 (212) 281-8850</span>
        </div>
        <div className="flex items-center space-x-3">
          {isStaffUser ? (
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                👑 Licensed Staff Console Mode
              </span>
              {onOpenGuidedTour && (
                <button
                  onClick={onOpenGuidedTour}
                  className="flex items-center space-x-1 bg-amber-400/30 hover:bg-amber-400/40 text-amber-100 px-2.5 py-1 rounded text-[11px] font-bold transition border border-amber-300/50"
                  title="Launch Family Portal Interactive Tutorial"
                >
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>Portal Tour 🎓</span>
                </button>
              )}
              <button
                onClick={onExitPortal}
                className="flex items-center space-x-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 px-2.5 py-1 rounded text-[11px] font-bold transition border border-amber-400/30"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Director Back-Office</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 font-semibold tracking-wide text-xs flex items-center gap-1.5 hidden sm:flex">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confidential Family Portal</span>
              </span>
              {onOpenGuidedTour && (
                <button
                  onClick={onOpenGuidedTour}
                  className="flex items-center space-x-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-2.5 py-1 rounded text-[11px] font-bold transition border border-amber-400/40"
                  title="Launch Family Portal Interactive Walkthrough"
                >
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>Interactive Guide 💡</span>
                </button>
              )}
              <button
                onClick={onExitPortal}
                className="flex items-center space-x-1 bg-red-950/40 hover:bg-red-900/60 text-red-200 px-2.5 py-1 rounded text-[11px] font-bold transition border border-red-700/40"
              >
                <Lock className="w-3 h-3 text-red-400" />
                <span>Sign Out of Family Vault</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stately Family Portal Header */}
      <header className="bg-white border-b-2 border-[#991b1b] px-4 sm:px-8 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          
          {/* Brand Logo & Active Family Header */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#991b1b] flex items-center justify-center text-white font-serif-title font-bold text-xl shadow-md border-2 border-amber-400/50">
              BFH
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif-title font-bold text-xl sm:text-2xl text-neutral-900">
                  The Family Portal
                </h1>
                <span className="bg-red-50 text-[#991b1b] border border-red-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {activeCase.caseNumber}
                </span>
              </div>
              <p className="text-xs text-[#b45309] font-medium tracking-wide">
                Honoring <strong className="text-neutral-900 font-bold">{activeCase.decedent.legalName}</strong> • Spokesperson: {activeCase.informant.fullName}
              </p>
            </div>
          </div>

          {/* Right Header: Staff Navigator vs. Isolated Family Badge */}
          {isStaffUser ? (
            <div className="flex items-center space-x-2.5 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
              <span className="text-xs text-amber-900 font-bold hidden lg:inline">Staff Switch Family:</span>
              <select
                value={activeCase.id}
                onChange={(e) => {
                  const found = cases.find(c => c.id === e.target.value);
                  if (found) onSelectCase(found);
                }}
                className="bg-white border border-amber-300 text-neutral-900 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none focus:border-[#991b1b] shadow-xs"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — Family of {c.decedent.legalName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5 bg-emerald-50 text-emerald-950 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-neutral-900 block">Private Family Access</span>
                <span className="text-[11px] text-emerald-800 block font-light">
                  Authorized Informant: <strong>{activeCase.informant.fullName}</strong> ({activeCase.informant.relationship})
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Family Portal Main Navigation Pills */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center space-x-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setPortalTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'home'
                ? 'bg-[#991b1b] text-white shadow-md ring-2 ring-amber-400'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-amber-300" />
            <span>🏠 Welcome & Overview</span>
          </button>

          <button
            onClick={() => setPortalTab('obituary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'obituary'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🕊️ Obituary & Story Studio (9-Part Method)</span>
          </button>

          <button
            onClick={() => setPortalTab('tribute')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'tribute'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-amber-500" />
            <span>🎙️ 360° Digital Tribute & Voice Studio</span>
          </button>

          <button
            onClick={() => setPortalTab('webcast')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'webcast'
                ? 'bg-[#991b1b] text-white shadow-md ring-2 ring-amber-400'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-amber-500" />
            <span>🔴 Live Webcast & Service Info</span>
          </button>

          <button
            onClick={() => setPortalTab('concierge')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'concierge'
                ? 'bg-[#991b1b] text-white shadow-md ring-2 ring-amber-400'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>💬 24/7 Family Care Concierge & Legal Guide</span>
          </button>

          <button
            onClick={() => setPortalTab('arrangements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'arrangements'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>📋 Arrangement & Vital Summary</span>
          </button>

          <button
            onClick={() => setPortalTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'documents'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>✍️ Legal Documents & eSign</span>
          </button>

          <button
            onClick={() => setPortalTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'photos'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>📸 Memorial Photos & DVD Uploads</span>
          </button>

          <button
            onClick={() => setPortalTab('status')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
              portalTab === 'status'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>🚗 Service & Livery Status</span>
          </button>

          <button
            onClick={() => setIsFloralShopModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md transition ml-auto"
          >
            <Flower2 className="w-3.5 h-3.5 text-amber-200" />
            <span>🌸 Send Flowers (Daniela’s)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Toast Copy Alert */}
        {copiedNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#141b2b] text-white px-5 py-3 rounded-xl shadow-2xl border border-amber-400/40 flex items-center space-x-3 text-xs font-bold animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* TAB 0: HOME / WELCOME & WHAT THIS PORTAL OFFERS */}
        {portalTab === 'home' && (
          <FamilyPortalOverviewHome
            activeCase={activeCase}
            onNavigateTab={(tab) => setPortalTab(tab as any)}
            onOpenESignModal={() => onOpenESignModal?.()}
            onUpdateCase={onUpdateCase}
            onSendNotification={onSendNotification}
            onOpenGuidedTour={onOpenGuidedTour}
          />
        )}

        {/* TAB: 24/7 FAMILY CARE CONCIERGE & FINANCIAL/LEGAL GUIDE */}
        {portalTab === 'concierge' && (
          <FamilyCareConciergeView
            activeCase={activeCase}
            onNavigateTab={(tab) => setPortalTab(tab as any)}
          />
        )}

        {/* TAB: LIVE WEBCAST & COMPLETE SERVICE INFORMATION */}
        {portalTab === 'webcast' && (
          <FamilyWebcastServiceView
            activeCase={activeCase}
            onUpdateCase={onUpdateCase}
            onSendNotification={onSendNotification}
          />
        )}

        {/* TAB: 360° DIGITAL TRIBUTE & COFFEE TABLE KEEPSAKE STUDIO */}
        {portalTab === 'tribute' && (
          <DigitalTributeStudioView
            activeCase={activeCase}
            onUpdateCase={onUpdateCase}
            onSendNotification={onSendNotification}
            isStaffUser={isStaffUser}
          />
        )}

        {/* TAB 1: OBITUARY & STORY STUDIO (The 9-Part Trauma-Informed Method) */}
        {portalTab === 'obituary' && (
          <div className="space-y-6">
            
            {/* Dignified Hero Banner (matching obituary-writer.html) */}
            <div className="bg-gradient-to-br from-[#141b2b] to-[#1f2a42] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-amber-500/20">
              <div className="max-w-3xl space-y-2 relative z-10">
                <span className="inline-block bg-amber-400/20 border border-amber-400/50 text-amber-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Nine-Part Trauma-Informed Method • Benta's Memorial Suite
                </span>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  Drafting with Care, Dignity & Pacing for {activeCase.decedent.legalName}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                  Grief makes decision-making difficult. We begin with the person before the timeline, preserve private family memories, shield against public fraud, and draft both a Full Memorial Program obituary and a Short Newspaper notice.
                </p>
              </div>
              <div className="absolute right-4 -bottom-6 text-9xl text-white/5 font-serif select-none pointer-events-none">
                ❧
              </div>
            </div>

            {/* Obituary Method Nav Bar */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-1.5 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
              <button
                onClick={() => setObitSection('interview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
                  obitSection === 'interview'
                    ? 'bg-[#991b1b] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>🕊️ 1. Guided Interview</span>
              </button>

              <button
                onClick={() => setObitSection('drafting')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
                  obitSection === 'drafting'
                    ? 'bg-[#991b1b] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>📝 2. Dual-Length Drafts</span>
              </button>

              <button
                onClick={() => setObitSection('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
                  obitSection === 'ledger'
                    ? 'bg-[#991b1b] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>📊 3. Fact Ledger ({obitState.factLedger.length})</span>
              </button>

              <button
                onClick={() => setObitSection('safety')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
                  obitSection === 'safety'
                    ? 'bg-[#991b1b] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>🛡️ 4. Fraud Shield</span>
              </button>

              <button
                onClick={() => setObitSection('approval')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition ${
                  obitSection === 'approval'
                    ? 'bg-[#991b1b] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>✍️ 5. 4-Gate Sign-Off {obitState.isSignedOff && '✓'}</span>
              </button>
            </div>

            {/* SECTION 1: GUIDED INTERVIEW */}
            {obitSection === 'interview' && (
              <div className="space-y-6">
                
                {/* 4-Step Interview Stepper */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { step: 1, title: 'Consent & Spokesperson', desc: 'Single Authority Gate' },
                    { step: 2, title: 'The Person First', desc: 'Habits, Phrases, Stories' },
                    { step: 3, title: 'Chronology & Milestones', desc: 'Education & Career' },
                    { step: 4, title: 'Family & Services', desc: 'Survivors & Chapel' }
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => setInterviewStep(s.step)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 ${
                        interviewStep === s.step
                          ? 'bg-red-50 border-[#991b1b] ring-2 ring-red-500/20 shadow-sm'
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        interviewStep === s.step ? 'bg-[#991b1b] text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {s.step}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">{s.title}</div>
                        <div className="text-[10px] text-neutral-500">{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Sub-Pane 1: Consent & Spokesperson */}
                {interviewStep === 1 && (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                      <div>
                        <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                          1. Consent, Privacy & Designated Family Spokesperson
                        </h3>
                        <p className="text-xs text-neutral-500">
                          One designated spokesperson holds sole authority to review and approve publication.
                        </p>
                      </div>
                      <span className="bg-red-50 text-[#991b1b] border border-red-200 text-xs font-bold px-3 py-1 rounded-full">
                        Trauma-Informed Gate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Full Preferred Name of Loved One</label>
                        <input
                          type="text"
                          value={activeCase.decedent.legalName}
                          disabled
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Named Family Spokesperson (Final Sign-off Authority)</label>
                        <input
                          type="text"
                          value={obitState.spokespersonName}
                          onChange={(e) => setObitState({ ...obitState, spokespersonName: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-900 focus:border-[#991b1b] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Spokesperson Email Address</label>
                        <input
                          type="email"
                          value={obitState.spokespersonEmail}
                          onChange={(e) => setObitState({ ...obitState, spokespersonEmail: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Relationship to Decedent</label>
                        <input
                          type="text"
                          value={obitState.spokespersonRelation}
                          onChange={(e) => setObitState({ ...obitState, spokespersonRelation: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-red-50/60 border border-red-200/80 p-4 rounded-2xl flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="consent-check"
                        checked={obitState.consentGranted}
                        onChange={(e) => setObitState({ ...obitState, consentGranted: e.target.checked })}
                        className="mt-1 accent-[#991b1b] w-4 h-4"
                      />
                      <label htmlFor="consent-check" className="text-xs text-neutral-800 cursor-pointer">
                        <strong>Family Consent Granted:</strong> I authorize Benta's Obituary Assistant to securely assist in drafting this memorial and affirm that our designated spokesperson has final approval rights prior to printing or newspaper transmission.
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          saveObituaryToCase(obitState);
                          setInterviewStep(2);
                        }}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                      >
                        <span>Proceed to Step 2: The Person →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Pane 2: The Person Before the Timeline */}
                {interviewStep === 2 && (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                      <div>
                        <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                          2. Capture the Person Before the Timeline
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Oral History Principle: We begin with everyday habits, defining relationships, characteristic phrases, and revealing stories.
                        </p>
                      </div>
                      <span className="bg-amber-50 text-[#b45309] border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                        Oral History Principle
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Ordinary Daily Habit or Ritual Everyone Remembers
                        </label>
                        <textarea
                          rows={3}
                          value={obitState.ordinaryHabits}
                          onChange={(e) => setObitState({ ...obitState, ordinaryHabits: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:border-[#991b1b] outline-none leading-relaxed"
                          placeholder="e.g. Brewing chamomile tea at 6:00 AM every morning and leaving handwritten notes of encouragement..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Signature Phrase, Saying, or Piece of Advice
                        </label>
                        <input
                          type="text"
                          value={obitState.signaturePhrase}
                          onChange={(e) => setObitState({ ...obitState, signaturePhrase: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                          placeholder="e.g. “Don't let one bad day tell you who you are.”"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          One Revealing Story That Captures Who They Really Were
                        </label>
                        <textarea
                          rows={3}
                          value={obitState.definingStory}
                          onChange={(e) => setObitState({ ...obitState, definingStory: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:border-[#991b1b] outline-none leading-relaxed"
                          placeholder="e.g. When the town music program was cut, she gathered 8 retired teachers to host free violin classes in her living room for four years..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setInterviewStep(1)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          saveObituaryToCase(obitState);
                          setInterviewStep(3);
                        }}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                      >
                        <span>Next: Chronology & Milestones →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Pane 3: Chronology & Milestones */}
                {interviewStep === 3 && (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                      <div>
                        <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                          3. Essential Chronology & Life Milestones
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Capture verified dates, places of origin, education, career, military honors, and affiliations.
                        </p>
                      </div>
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                        Publishable Milestones
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Birth Date & Birthplace</label>
                        <input
                          type="text"
                          value={obitState.birthDetails}
                          onChange={(e) => setObitState({ ...obitState, birthDetails: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Date of Passing & Facility</label>
                        <input
                          type="text"
                          value={obitState.passingDetails}
                          onChange={(e) => setObitState({ ...obitState, passingDetails: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Education, Career, Military & Civic Affiliations</label>
                        <textarea
                          rows={3}
                          value={obitState.educationCareer}
                          onChange={(e) => setObitState({ ...obitState, educationCareer: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:border-[#991b1b] outline-none leading-relaxed"
                          placeholder="e.g. Proud graduate of Hunter College. Dedicated 38 years as a master educator at PS 154 in Harlem..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setInterviewStep(2)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          saveObituaryToCase(obitState);
                          setInterviewStep(4);
                        }}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                      >
                        <span>Next: Family & Services →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Pane 4: Family & Services */}
                {interviewStep === 4 && (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                      <div>
                        <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                          4. Family Survivors, Predeceased & Memorial Services
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Acknowledge loved ones, service locations, and charitable tribute funds.
                        </p>
                      </div>
                      <span className="bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold px-3 py-1 rounded-full">
                        Family & Service Details
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Survived By (Immediate & Extended Family)
                        </label>
                        <textarea
                          rows={3}
                          value={obitState.survivors}
                          onChange={(e) => setObitState({ ...obitState, survivors: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:border-[#991b1b] outline-none leading-relaxed"
                          placeholder="e.g. Her devoted husband of 52 years, Robert; children Claire and David; four grandchildren..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Predeceased By
                        </label>
                        <input
                          type="text"
                          value={obitState.predeceased}
                          onChange={(e) => setObitState({ ...obitState, predeceased: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                          placeholder="e.g. Her beloved parents Arthur and Mae Williams..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Funeral & Memorial Service Details
                        </label>
                        <textarea
                          rows={2}
                          value={obitState.serviceDetails}
                          onChange={(e) => setObitState({ ...obitState, serviceDetails: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:border-[#991b1b] outline-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Memorial Donations & Charitable Tributes
                        </label>
                        <input
                          type="text"
                          value={obitState.memorialDonations}
                          onChange={(e) => setObitState({ ...obitState, memorialDonations: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:border-[#991b1b] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setInterviewStep(3)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          handleGenerateDrafts();
                          setObitSection('drafting');
                        }}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>✨ Generate Dual-Length Drafts →</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SECTION 2: DUAL-LENGTH AI DRAFTING (FULL & SHORT NOTICE) */}
            {obitSection === 'drafting' && (
              <div className="space-y-6">
                
                {/* Voice Calibrator Toggle */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <span className="text-xs font-bold text-neutral-900">Voice & Tone Calibration:</span>
                    <span className="text-xs text-neutral-500 ml-2">Choose the voice that best reflects your family's tone</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const updated = { ...obitState, voiceTone: 'warm' as const };
                        setObitState(updated);
                        saveObituaryToCase(updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        obitState.voiceTone === 'warm'
                          ? 'bg-red-50 text-[#991b1b] border border-red-300'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Warm & Narrative
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...obitState, voiceTone: 'stately' as const };
                        setObitState(updated);
                        saveObituaryToCase(updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        obitState.voiceTone === 'stately'
                          ? 'bg-red-50 text-[#991b1b] border border-red-300'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Classic & Stately
                    </button>
                    <button
                      onClick={handleGenerateDrafts}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Re-Generate</span>
                    </button>
                  </div>
                </div>

                {/* Dual Split Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Full Memorial Program Draft */}
                  <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          📖 Full Memorial Program (Source)
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        ~{obitState.fullObituaryDraft.split(/\s+/).filter(Boolean).length} Words
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={obitState.fullObituaryDraft}
                      onChange={(e) => {
                        const updated = { ...obitState, fullObituaryDraft: e.target.value };
                        setObitState(updated);
                        saveObituaryToCase(updated);
                      }}
                      className="w-full bg-[#fdfbf7] border border-[#ebd8bf] rounded-2xl p-4 text-sm font-serif text-neutral-900 leading-relaxed outline-none focus:border-[#991b1b]"
                    />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[11px] text-neutral-500">
                        Editable. Used for printed funeral programs and digital tribute pages.
                      </span>
                      <button
                        onClick={() => handleCopyText(obitState.fullObituaryDraft, 'Full Obituary')}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Full Text</span>
                      </button>
                    </div>
                  </div>

                  {/* Short Newspaper Notice Draft */}
                  <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          📰 Short Newspaper Notice
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        ~{obitState.shortNoticeDraft.split(/\s+/).filter(Boolean).length} Words
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={obitState.shortNoticeDraft}
                      onChange={(e) => {
                        const updated = { ...obitState, shortNoticeDraft: e.target.value };
                        setObitState(updated);
                        saveObituaryToCase(updated);
                      }}
                      className="w-full bg-[#fdfbf7] border border-[#ebd8bf] rounded-2xl p-4 text-sm font-serif text-neutral-900 leading-relaxed outline-none focus:border-[#991b1b]"
                    />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[11px] text-neutral-500">
                        Derived directly from confirmed facts for newspaper character limits.
                      </span>
                      <button
                        onClick={() => handleCopyText(obitState.shortNoticeDraft, 'Newspaper Notice')}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Short Notice</span>
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setObitSection('safety')}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                  >
                    <span>Proceed to Fraud Shield & Public Disclosure Screen →</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 3: FACT LEDGER */}
            {obitSection === 'ledger' && (
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-neutral-200 pb-4">
                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                      Memorial Fact Ledger & Verification
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Step 2 of Method: Every fact is categorized as Confirmed, Unconfirmed, Private, or Omitted to prevent plausible wording from disguising uncertainty.
                    </p>
                  </div>
                  <span className="bg-amber-50 text-[#b45309] border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                    {obitState.factLedger.length} Verified Entries
                  </span>
                </div>

                {/* Add Fact Form */}
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={newFactDetail}
                    onChange={(e) => setNewFactDetail(e.target.value)}
                    placeholder="Enter new fact, story detail, or private memory (e.g. Volunteer choir soloist for 25 years)..."
                    className="flex-1 bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                  />
                  <select
                    value={newFactTag}
                    onChange={(e: any) => setNewFactTag(e.target.value)}
                    className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 outline-none"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="unconfirmed">Unconfirmed</option>
                    <option value="private">Private / Omitted</option>
                    <option value="omitted">Omitted from Print</option>
                  </select>
                  <button
                    onClick={handleAddFact}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Fact Entry</span>
                  </button>
                </div>

                {/* Facts Table / List */}
                <div className="space-y-3">
                  {obitState.factLedger.map((fact) => {
                    const tagStyles = {
                      confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      unconfirmed: 'bg-amber-50 text-amber-800 border-amber-200',
                      private: 'bg-purple-50 text-purple-800 border-purple-200',
                      omitted: 'bg-red-50 text-red-800 border-red-200'
                    };

                    return (
                      <div key={fact.id} className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50/70 transition flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-neutral-900">{fact.detail}</div>
                          <div className="text-[11px] text-neutral-500">Source: {fact.source}</div>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${tagStyles[fact.tag]}`}>
                          {fact.tag.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 4: FRAUD SHIELD & PUBLIC DISCLOSURE SCREEN */}
            {obitSection === 'safety' && (
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                      Fraud Shield & Public Disclosure Screen
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Steps 7 & 8 of Method: Law enforcement and identity security protocols warn that public obituaries can expose identifying data. We screen and sanitize sensitive details before release.
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Security Screen Active</span>
                  </span>
                </div>

                <div className="bg-amber-50/80 border border-amber-300/80 p-4 rounded-2xl flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <strong>Automated Privacy Protections Applied:</strong>
                    <p>
                      Your draft has been screened. Exact mother's maiden names, full residential home addresses, and minor children's direct hometowns are masked to prevent identity ghosting scams.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-neutral-900">1. Birth Date & Maiden Name Protection</strong>
                      <p className="text-[11px] text-neutral-500">Displaying age or birth year rather than full day/month to prevent financial identity theft.</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">✓ Protected</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-neutral-900">2. Residence Address Shield</strong>
                      <p className="text-[11px] text-neutral-500">Public memorial services route to Benta's Funeral Home Chapel rather than private home address.</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">✓ Protected</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-neutral-900">3. Living Relatives' Locations</strong>
                      <p className="text-[11px] text-neutral-500">Children and grandchildren are listed by name only without exact current physical cities.</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">✓ Protected</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setObitSection('approval')}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                  >
                    <span>Proceed to 4-Gate Review & Spokesperson Sign-Off →</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 5: FOUR-GATE REVIEW & FINAL SPOKESPERSON SIGN-OFF */}
            {obitSection === 'approval' && (
              <div className="space-y-6">
                
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                    <div>
                      <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                        Four-Gate Review & Spokesperson Digital Sign-Off
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Step 9 of Method: The final sign-off requires four distinct verification passes before publishing.
                      </p>
                    </div>
                    <span className="bg-red-50 text-[#991b1b] border border-red-200 text-xs font-bold px-3 py-1 rounded-full">
                      Step 9 Protocol
                    </span>
                  </div>

                  {/* The 4 Review Gates */}
                  <div className="space-y-3">
                    <label className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obitState.reviewGate1Facts}
                        onChange={(e) => setObitState({ ...obitState, reviewGate1Facts: e.target.checked })}
                        className="accent-[#991b1b] w-4 h-4"
                      />
                      <span className="text-xs text-neutral-800">
                        <strong>Pass 1: Fact Verification</strong> — All dates, hospitals, schools, and civic organizations match certified records.
                      </span>
                    </label>

                    <label className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obitState.reviewGate2Names}
                        onChange={(e) => setObitState({ ...obitState, reviewGate2Names: e.target.checked })}
                        className="accent-[#991b1b] w-4 h-4"
                      />
                      <span className="text-xs text-neutral-800">
                        <strong>Pass 2: Names & Family Hierarchy</strong> — Correct spelling and relationship order of all surviving spouses, children, grandchildren, and predeceased loved ones.
                      </span>
                    </label>

                    <label className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obitState.reviewGate3Tone}
                        onChange={(e) => setObitState({ ...obitState, reviewGate3Tone: e.target.checked })}
                        className="accent-[#991b1b] w-4 h-4"
                      />
                      <span className="text-xs text-neutral-800">
                        <strong>Pass 3: Voice & Tone</strong> — The language authentically captures our family's heritage and love.
                      </span>
                    </label>

                    <label className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obitState.reviewGate4Privacy}
                        onChange={(e) => setObitState({ ...obitState, reviewGate4Privacy: e.target.checked })}
                        className="accent-[#991b1b] w-4 h-4"
                      />
                      <span className="text-xs text-neutral-800">
                        <strong>Pass 4: Public Disclosure Screen</strong> — No private identifiers, financial passwords, or sensitive residential coordinates are exposed.
                      </span>
                    </label>
                  </div>

                  {/* Official Digital Sign-Off Form */}
                  <div className="bg-red-50/40 border-2 border-red-200 p-6 rounded-3xl space-y-4">
                    <h4 className="font-serif-title font-bold text-base text-neutral-900">
                      Spokesperson Digital Authorization
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Authorized Family Spokesperson Name</label>
                        <input
                          type="text"
                          value={obitState.spokespersonName}
                          onChange={(e) => setObitState({ ...obitState, spokespersonName: e.target.value })}
                          className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Authorization Status</label>
                        <input
                          type="text"
                          value={obitState.isSignedOff ? `Signed & Approved (${obitState.signedOffAt})` : 'Awaiting Final Spokesperson Signature'}
                          disabled
                          className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-700 font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleFinalSignoff}
                      className="w-full bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-red-950/20 border border-amber-400/40"
                    >
                      <PenTool className="w-4 h-4 text-amber-300" />
                      <span>✍️ Sign & Finalize Approved Obituary for Publication</span>
                    </button>
                  </div>
                </div>

                {/* Printable Certificate Keepsake Frame (from obituary-writer.html) */}
                {obitState.isSignedOff && (
                  <div className="bg-white border-2 border-amber-500/80 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
                    <div className="text-2xl text-amber-600">❧ &nbsp; ✦ &nbsp; ❧</div>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-neutral-900">
                      Certificate of Approved Memorial Obituary
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-[#991b1b] font-bold">
                      Benta's Funeral Home, Inc. • Master Archival Record
                    </p>

                    <div className="max-w-3xl mx-auto text-left font-serif text-neutral-800 text-sm sm:text-base leading-relaxed whitespace-pre-line p-6 bg-[#fcfbfa] border border-amber-200 rounded-2xl">
                      {obitState.fullObituaryDraft}
                    </div>

                    <div className="border-t border-neutral-200 pt-6 flex flex-wrap justify-between items-center text-xs text-neutral-600 gap-2">
                      <div>Authorized by: <strong className="text-neutral-900 font-bold">{obitState.signedOffBy || obitState.spokespersonName}</strong> ({obitState.spokespersonRelation})</div>
                      <div>Timestamp: <strong>{obitState.signedOffAt}</strong></div>
                      <div>Protocol: <strong>Nine-Part Trauma-Informed Framework</strong></div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 mx-auto shadow-md"
                      >
                        <Printer className="w-4 h-4" />
                        <span>🖨️ Print Approved Memorial Proof</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 2: ARRANGEMENT & VITAL SUMMARY */}
        {portalTab === 'arrangements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Service Selections Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center space-x-3 border-b border-neutral-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#991b1b] flex items-center justify-center font-bold text-base">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                    Selected Memorial Arrangements
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Package: {activeCase.serviceSelections.packageTitle}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Disposition Type:</span>
                  <span className="font-bold text-neutral-900 uppercase">{activeCase.dispositionType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Viewing Parlor:</span>
                  <span className="font-bold text-neutral-900">{activeCase.serviceSelections.viewingParlor}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Service Venue:</span>
                  <span className="font-bold text-neutral-900">{activeCase.serviceSelections.serviceVenueName || "Benta's Main Chapel"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Service Date & Time:</span>
                  <span className="font-bold text-[#991b1b]">{activeCase.serviceSelections.serviceDate} at {activeCase.serviceSelections.serviceTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Casket / Urn Selection:</span>
                  <span className="font-bold text-neutral-900">{activeCase.serviceSelections.casketOrUrnSelected}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Cemetery / Crematory:</span>
                  <span className="font-bold text-neutral-900">{activeCase.serviceSelections.crematoryOrCemeteryName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-500">Assigned Director:</span>
                  <span className="font-bold text-neutral-900">{activeCase.assignedDirector}</span>
                </div>
              </div>
            </div>

            {/* Statement of Goods and Services (Form AP-47) Transparency Breakdown */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                      Statement of Goods & Services Selected
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Official NYS DOH Form AP-47 Itemized Financial Transparency
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  GPL April 2026 Compliant
                </span>
              </div>

              {/* 3-Column Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    Sec. I: Funeral Charges
                  </div>
                  <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                    ${(activeCase.statementOfGoods?.sectionIII.funeralHomeChargesTotal ?? (activeCase.serviceSelections.basePackagePrice + activeCase.serviceSelections.casketPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 text-center">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Sec. II: Cash Advances
                  </div>
                  <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                    ${(activeCase.statementOfGoods?.sectionIII.cashAdvancesTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-200 text-center">
                  <div className="text-[10px] font-bold text-[#991b1b] uppercase tracking-wider">
                    Sec. III: Grand Total
                  </div>
                  <div className="text-base font-bold font-mono text-[#991b1b] mt-0.5">
                    ${(activeCase.statementOfGoods?.sectionIII.totalFuneralCharges ?? activeCase.totalAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Itemized Highlights */}
              <div className="space-y-2 text-xs pt-1 border-t border-neutral-100">
                <div className="flex justify-between py-1 text-neutral-600 border-b border-neutral-100">
                  <span>Basic Professional Services & Arranging:</span>
                  <span className="font-mono text-neutral-900 font-semibold">${(activeCase.statementOfGoods?.sectionI.D_basicArrangementsAmount ?? 950).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-600 border-b border-neutral-100">
                  <span>Selected Merchandise ({activeCase.serviceSelections.casketOrUrnSelected}):</span>
                  <span className="font-mono text-neutral-900 font-semibold">${(activeCase.statementOfGoods?.sectionI.H1_casketAmount ?? activeCase.serviceSelections.casketPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-600 border-b border-neutral-100">
                  <span>Livery Fleet & Cortege Vehicles:</span>
                  <span className="font-mono text-neutral-900 font-semibold">${(activeCase.statementOfGoods?.sectionI.G_totalLiveryAmount ?? 655).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-600 border-b border-neutral-100">
                  <span>Floral Arrangements:</span>
                  <span className="font-mono text-neutral-900 font-semibold">
                    {activeCase.statementOfGoods?.sectionI.I6_noFlowersRequested
                      ? 'No Flowers Selected'
                      : `$${(activeCase.statementOfGoods?.sectionI.I6_totalFlowersAmount ?? 0).toFixed(2)}`}
                  </span>
                </div>

                {activeCase.statementOfGoods?.sectionI.I6_flowerItems && activeCase.statementOfGoods.sectionI.I6_flowerItems.length > 0 && !activeCase.statementOfGoods.sectionI.I6_noFlowersRequested && (
                  <div className="py-2.5 px-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2 my-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>💐</span>
                        <span>Selected Floral Tributes &amp; Sprays:</span>
                      </span>
                      <span className="text-[11px] text-neutral-500 font-serif-title italic">Handcrafted by Benta&apos;s Florist</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeCase.statementOfGoods.sectionI.I6_flowerItems.map((fl) => (
                        <div key={fl.id} className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-rose-200/80 shadow-xs">
                          {fl.imageUrl ? (
                            <img
                              src={fl.imageUrl}
                              alt={fl.description}
                              className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                              💐
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-neutral-900 truncate">
                              {fl.name || fl.description}
                            </div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                              {fl.code && (
                                <span className="font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                                  {fl.code}
                                </span>
                              )}
                              {fl.size && (
                                <span className="uppercase font-bold text-neutral-700">
                                  {fl.size}
                                </span>
                              )}
                              {fl.ribbonText && (
                                <span className="italic text-[#991b1b] font-medium">
                                  &quot;{fl.ribbonText}&quot;
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-[#991b1b] mt-0.5">
                              {fl.quantity} &times; ${fl.unitPrice.toFixed(2)} = ${(fl.quantity * fl.unitPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between py-1 text-neutral-600">
                  <span>Pass-Through Cash Advances (Cemetery, NYC DOH Transcripts, Clergy):</span>
                  <span className="font-mono text-amber-800 font-semibold">${(activeCase.statementOfGoods?.sectionIII.cashAdvancesTotal ?? 0).toFixed(2)}</span>
                </div>
              </div>


              <div className="p-3 bg-neutral-50 rounded-xl text-[11px] text-neutral-500 font-light flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All charges are fully itemized according to Federal Trade Commission Funeral Rule and NYS DOH regulations. No non-itemized hidden fees.</span>
              </div>
            </div>

            {/* Vital Statistics Verification Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center space-x-3 border-b border-neutral-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b45309] flex items-center justify-center font-bold text-base">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                    Vital Records & NYC EDRS Status
                  </h3>
                  <p className="text-xs text-neutral-500">
                    EDRS Permit: {activeCase.medicalCertifier.edrsPermitNumber || 'Processing with NYC DOHMH'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Legal Name:</span>
                  <span className="font-bold text-neutral-900">{activeCase.decedent.legalName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Date of Birth & Age:</span>
                  <span className="font-bold text-neutral-900">{activeCase.decedent.dateOfBirth}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Date of Passing:</span>
                  <span className="font-bold text-neutral-900">{activeCase.decedent.dateOfDeath}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Certifying Physician:</span>
                  <span className="font-bold text-neutral-900">{activeCase.medicalCertifier.physicianName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Father's Name:</span>
                  <span className="font-bold text-neutral-900">{activeCase.decedent.fatherName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-500">Mother's Maiden Name:</span>
                  <span className="font-bold text-neutral-900">{activeCase.decedent.motherMaidenName}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LEGAL DOCUMENTS & eSIGN */}
        {portalTab === 'documents' && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                  Family e-Signature & Legal Authorizations Bundle
                </h3>
                <p className="text-xs text-neutral-500">
                  Review and sign statutory documents authorized by the New York State Department of Health and Benta's Funeral Home.
                </p>
              </div>
              <button
                onClick={() => onOpenESignModal && onOpenESignModal()}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-red-950/20"
              >
                <PenTool className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch eSign Pad</span>
              </button>
            </div>

            <div className="space-y-3">
              {activeCase.documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#991b1b]" />
                      <strong className="text-xs font-bold text-neutral-900">{doc.name}</strong>
                    </div>
                    <div className="text-[11px] text-neutral-500">{doc.followUpAction}</div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      doc.status === 'signed' || doc.status === 'completed' || doc.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {doc.status.toUpperCase()}
                    </span>

                    {doc.status !== 'signed' && doc.status !== 'completed' && (
                      <button
                        onClick={() => onOpenESignModal && onOpenESignModal(doc)}
                        className="bg-white hover:bg-red-50 text-[#991b1b] border border-red-200 font-bold text-xs px-3 py-1 rounded-lg transition"
                      >
                        Sign Document
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MEMORIAL MEDIA & 360° DIGI-TRIBUTE PHOTO STUDIO & FUNERAL ANNOUNCEMENT STUDIO */}
        {portalTab === 'photos' && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Studio Header */}
            <div className="flex flex-wrap justify-between items-center border-b border-neutral-200 pb-4 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-[#991b1b]" />
                  <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                    Memorial Media & 360° Digi-Tribute Photo Studio
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Curate high-resolution legacy portraits and design elegant, shareable digital funeral announcements for mobile text messaging and public social media.
                </p>
              </div>

              {/* Sub-Tab Switcher & Upload Launcher */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                  <button
                    onClick={() => setPhotoSubTab('announcement')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      photoSubTab === 'announcement'
                        ? 'bg-[#991b1b] text-white shadow-xs'
                        : 'text-neutral-700 hover:text-neutral-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>🕊️ Announcement Studio</span>
                    <span className="text-[9px] bg-amber-400 text-neutral-900 font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                      Social & Text
                    </span>
                  </button>

                  <button
                    onClick={() => setPhotoSubTab('gallery')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      photoSubTab === 'gallery'
                        ? 'bg-[#991b1b] text-white shadow-xs'
                        : 'text-neutral-700 hover:text-neutral-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>📸 Photo Vault ({obitState.photos.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsPhotoUploadModalOpen(true)}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-red-950/20"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* SUB-VIEW 1: ELEGANT FUNERAL ANNOUNCEMENT STUDIO (DIGITAL CARD & SOCIAL SHARE) */}
            {photoSubTab === 'announcement' && (
              <div className="space-y-6">
                
                {/* 2-Column Studio Grid: Left Customizer / Right Live Rendered Graphic */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT COLUMN: CUSTOMIZER CONTROLS (5 Cols) */}
                  <div className="lg:col-span-5 space-y-5">
                    
                    {/* Theme Palette Picker */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2.5">
                      <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-[#991b1b]" />
                          Announcement Theme & Palette:
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase font-mono font-bold">
                          {announcementTheme.replace(/_/g, ' ')}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'harlem_obsidian_gold', label: '🌌 Harlem Obsidian & Gold', bg: 'bg-[#0f1523]', border: 'border-amber-400', text: 'text-amber-300' },
                          { id: 'sanctuary_crimson_ivory', label: '🏛️ Sanctuary Ivory & Crimson', bg: 'bg-[#fcfaf5]', border: 'border-red-600', text: 'text-red-900' },
                          { id: 'serenity_white_silver', label: '🕊️ Serenity Pearl & Silver', bg: 'bg-white', border: 'border-slate-400', text: 'text-slate-800' },
                          { id: 'heavenly_clouds_lilies', label: '🌅 Heavenly Sunset Lilies', bg: 'bg-[#1a1c2e]', border: 'border-amber-300', text: 'text-amber-200' }
                        ].map((th) => (
                          <button
                            key={th.id}
                            type="button"
                            onClick={() => setAnnouncementTheme(th.id as AnnouncementTheme)}
                            className={`p-2.5 rounded-xl border text-left font-semibold text-[11px] transition flex items-center space-x-2 ${
                              announcementTheme === th.id
                                ? `${th.bg} ${th.border} ring-2 ring-amber-400/50 shadow-xs`
                                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${th.bg} border ${th.border} shrink-0`} />
                            <span className={`truncate ${announcementTheme === th.id ? (th.id === 'sanctuary_crimson_ivory' || th.id === 'serenity_white_silver' ? 'text-neutral-900 font-bold' : 'text-white font-bold') : ''}`}>
                              {th.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Aspect Ratio / Format Switcher */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2.5">
                      <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Layout className="w-3.5 h-3.5 text-[#991b1b]" />
                          Card Format & Distribution Layout:
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'mobile_story_9_16', label: '📱 Mobile Story (9:16)', desc: 'SMS/Text, WhatsApp, Stories' },
                          { id: 'social_square_1_1', label: '🖼️ Social Square (1:1)', desc: 'Instagram, Facebook, LinkedIn' },
                          { id: 'landscape_banner_16_9', label: '💻 Landscape Banner (16:9)', desc: 'X/Twitter, Webcast Stream' },
                          { id: 'printable_flyer_letter', label: '📄 Printable Flyer (8.5x11)', desc: 'Church Bulletin & Easel' }
                        ].map((ar) => (
                          <button
                            key={ar.id}
                            type="button"
                            onClick={() => setAnnouncementAspectRatio(ar.id as AnnouncementAspectRatio)}
                            className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                              announcementAspectRatio === ar.id
                                ? 'bg-red-50 border-[#991b1b] text-[#991b1b] font-bold shadow-2xs'
                                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            <span className="text-[11px] font-bold leading-tight">{ar.label}</span>
                            <span className="text-[10px] text-neutral-500 font-normal">{ar.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Portrait Photo Selector & Frame Picker */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#991b1b]" />
                          Main Announcement Portrait Photo:
                        </label>
                        <button
                          onClick={() => setIsPhotoUploadModalOpen(true)}
                          className="text-[11px] text-[#991b1b] hover:underline font-bold"
                        >
                          + Upload New
                        </button>
                      </div>

                      {/* Photo Thumbnail Strip */}
                      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                        {obitState.photos.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setAnnouncementPortraitUrl(p.url)}
                            className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition relative ${
                              announcementPortraitUrl === p.url
                                ? 'border-[#991b1b] ring-2 ring-red-400 scale-105 shadow-sm'
                                : 'border-neutral-300 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                            {announcementPortraitUrl === p.url && (
                              <span className="absolute bottom-0 inset-x-0 bg-[#991b1b] text-white text-[8px] font-bold text-center">
                                Active
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Frame Style Picker */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-neutral-200 text-xs">
                        <span className="text-[11px] text-neutral-600 font-medium">Portrait Frame:</span>
                        {[
                          { id: 'arched_gold_foil', label: 'Arched Gold Leaf' },
                          { id: 'oval_classic', label: 'Classic Oval' },
                          { id: 'square_crest', label: 'Regal Crest' }
                        ].map((fr) => (
                          <button
                            key={fr.id}
                            type="button"
                            onClick={() => setAnnouncementFrameStyle(fr.id as any)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                              announcementFrameStyle === fr.id
                                ? 'bg-[#991b1b] text-white border-[#991b1b]'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                            }`}
                          >
                            {fr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Announcement Content Form Fields */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                        <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#991b1b]" />
                          Announcement Headline & Details:
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Headline Title:</label>
                        <input
                          type="text"
                          value={announcementHeadline}
                          onChange={(e) => setAnnouncementHeadline(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                          placeholder="e.g. Homegoing Celebration & Celebration of Life"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Public Wake / Viewing Details:</label>
                        <input
                          type="text"
                          value={announcementWakeInfo}
                          onChange={(e) => setAnnouncementWakeInfo(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Funeral Sanctuary Service Details:</label>
                        <input
                          type="text"
                          value={announcementServiceInfo}
                          onChange={(e) => setAnnouncementServiceInfo(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Sanctuary Venue:</label>
                          <input
                            type="text"
                            value={announcementServiceVenue}
                            onChange={(e) => setAnnouncementServiceVenue(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Service Street Address:</label>
                          <input
                            type="text"
                            value={announcementServiceAddress}
                            onChange={(e) => setAnnouncementServiceAddress(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Viewing / Wake Venue:</label>
                          <input
                            type="text"
                            value={announcementWakeVenue}
                            onChange={(e) => setAnnouncementWakeVenue(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Officiating Clergy:</label>
                          <input
                            type="text"
                            value={announcementOfficiant}
                            onChange={(e) => setAnnouncementOfficiant(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Witness Committal / Final Resting Place:</label>
                        <input
                          type="text"
                          value={announcementCommittal}
                          onChange={(e) => setAnnouncementCommittal(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Live 4K Webcast URL:</label>
                          <input
                            type="text"
                            value={announcementWebcastUrl}
                            onChange={(e) => setAnnouncementWebcastUrl(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Security PIN:</label>
                          <input
                            type="text"
                            value={announcementWebcastPin}
                            onChange={(e) => setAnnouncementWebcastPin(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Memorial Gifts & In Lieu of Flowers:</label>
                        <input
                          type="text"
                          value={announcementDonations}
                          onChange={(e) => setAnnouncementDonations(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Family Gratitude & Condolence Note:</label>
                        <textarea
                          rows={2}
                          value={announcementFamilyMessage}
                          onChange={(e) => setAnnouncementFamilyMessage(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleSaveAnnouncementData}
                          className="w-full bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-amber-300" />
                          <span>Save & Synchronize Announcement Graphic</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: LIVE RENDERED HIGH-FIDELITY ANNOUNCEMENT GRAPHIC (7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-start space-y-4">
                    
                    {/* Top Canvas Action Bar */}
                    <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-neutral-100 p-3 rounded-2xl border border-neutral-200 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-[#991b1b]" />
                          Live Announcement Preview:
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {announcementAspectRatio.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopyAnnouncementText}
                          className="px-2.5 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 rounded-lg border border-neutral-300 font-bold text-[11px] transition flex items-center space-x-1"
                          title="Copy text announcement"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-2.5 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 rounded-lg border border-neutral-300 font-bold text-[11px] transition flex items-center space-x-1"
                          title="Print keepsake flyer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>

                    {/* LIVE RENDERED ANNOUNCEMENT CARD */}
                    <div
                      id="funeral-announcement-card"
                      className={`w-full rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between text-center ${
                        announcementAspectRatio === 'mobile_story_9_16'
                          ? 'max-w-sm aspect-[9/16] min-h-[660px]'
                          : announcementAspectRatio === 'social_square_1_1'
                          ? 'max-w-md aspect-square'
                          : announcementAspectRatio === 'landscape_banner_16_9'
                          ? 'max-w-xl aspect-[16/9]'
                          : 'max-w-md aspect-[8.5/11]'
                      } ${
                        announcementTheme === 'harlem_obsidian_gold'
                          ? 'bg-[#0f1523] text-white border-2 border-amber-400 shadow-amber-950/40'
                          : announcementTheme === 'sanctuary_crimson_ivory'
                          ? 'bg-[#fcfaf5] text-neutral-900 border-2 border-[#991b1b] shadow-red-950/30'
                          : announcementTheme === 'serenity_white_silver'
                          ? 'bg-white text-neutral-900 border-2 border-slate-300 shadow-slate-400/20'
                          : 'bg-gradient-to-b from-[#1a1c2e] via-[#2d2138] to-[#121124] text-white border-2 border-amber-300 shadow-purple-950/40'
                      }`}
                    >
                      {/* Top Gold / Crimson Foil Filigree Accent */}
                      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#991b1b] via-[#d4af37] to-[#991b1b]" />

                      {/* Header Section */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-400 font-mono">
                          <span>✦</span>
                          <span>BENTA'S FUNERAL HOME · HARLEM, NYC · EST. 1928</span>
                          <span>✦</span>
                        </div>

                        <h4 className={`font-serif-title font-bold text-xs sm:text-sm tracking-wider uppercase ${
                          announcementTheme === 'sanctuary_crimson_ivory' || announcementTheme === 'serenity_white_silver'
                            ? 'text-[#991b1b]'
                            : 'text-amber-300'
                        }`}>
                          {announcementHeadline}
                        </h4>

                        <h2 className="font-serif-title font-bold text-lg sm:text-2xl leading-tight text-current">
                          {activeCase.decedent.legalName}
                        </h2>

                        <div className={`text-[11px] font-light italic font-serif ${
                          announcementTheme === 'sanctuary_crimson_ivory' || announcementTheme === 'serenity_white_silver'
                            ? 'text-neutral-600'
                            : 'text-neutral-300'
                        }`}>
                          {activeCase.decedent.dateOfBirth} — {activeCase.decedent.dateOfDeath}
                        </div>
                      </div>

                      {/* Center Portrait with Selected Frame Style */}
                      <div className="my-3 flex justify-center">
                        <div className={`relative p-1.5 ${
                          announcementFrameStyle === 'arched_gold_foil'
                            ? 'rounded-t-full rounded-b-2xl border-2 border-amber-400 shadow-lg bg-gradient-to-b from-amber-300/30 to-transparent'
                            : announcementFrameStyle === 'oval_classic'
                            ? 'rounded-full border-2 border-amber-400 shadow-lg'
                            : 'rounded-2xl border-2 border-amber-400 shadow-lg'
                        }`}>
                          <div className={`overflow-hidden bg-neutral-800 ${
                            announcementFrameStyle === 'arched_gold_foil'
                              ? 'w-28 h-36 sm:w-32 sm:h-40 rounded-t-full rounded-b-xl'
                              : announcementFrameStyle === 'oval_classic'
                              ? 'w-28 h-36 sm:w-32 sm:h-40 rounded-full'
                              : 'w-28 h-36 sm:w-32 sm:h-40 rounded-xl'
                          }`}>
                            <img
                              src={announcementPortraitUrl}
                              alt={activeCase.decedent.legalName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Dove / Gold Crest Badge */}
                          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#991b1b] border-2 border-amber-400 flex items-center justify-center text-white text-xs shadow-md">
                            🕊️
                          </div>
                        </div>
                      </div>

                      {/* Ceremony Schedule Block */}
                      <div className={`p-3.5 rounded-2xl border space-y-2 text-left text-[11px] ${
                        announcementTheme === 'sanctuary_crimson_ivory'
                          ? 'bg-neutral-50/90 border-neutral-200 text-neutral-800'
                          : announcementTheme === 'serenity_white_silver'
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-white/5 border-white/10 text-neutral-200'
                      }`}>
                        
                        {/* Visitation / Wake */}
                        <div className="space-y-0.5">
                          <div className="font-bold text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Public Viewing & Visitation:</span>
                          </div>
                          <div className="font-semibold text-current">{announcementWakeInfo}</div>
                          <div className="text-[10px] opacity-75">{announcementWakeVenue}</div>
                        </div>

                        {/* Funeral Sanctuary Service */}
                        <div className="space-y-0.5 pt-1 border-t border-white/10">
                          <div className="font-bold text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            <span>Funeral Sanctuary Service:</span>
                          </div>
                          <div className="font-bold text-current">{announcementServiceInfo}</div>
                          <div className="text-[10px] opacity-75">{announcementServiceVenue} • {announcementServiceAddress}</div>
                          {announcementOfficiant && (
                            <div className="text-[10px] text-amber-300 font-medium italic">{announcementOfficiant}</div>
                          )}
                        </div>

                        {/* Committal */}
                        <div className="space-y-0.5 pt-1 border-t border-white/10 text-[10px]">
                          <div className="font-semibold text-current">{announcementCommittal}</div>
                        </div>
                      </div>

                      {/* 4K Webcast & QR Code Banner */}
                      <div className={`mt-2 p-2 rounded-xl border flex items-center justify-between text-left ${
                        announcementTheme === 'sanctuary_crimson_ivory' || announcementTheme === 'serenity_white_silver'
                          ? 'bg-amber-50/80 border-amber-200 text-neutral-900'
                          : 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                      }`}>
                        <div className="space-y-0.5 max-w-[75%]">
                          <div className="text-[10px] font-bold flex items-center gap-1 text-red-600">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                            <span>Live 4K Webcast Available</span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-current">
                            {announcementWebcastUrl}
                          </div>
                          <div className="text-[9px] font-medium opacity-80">
                            Security PIN: <strong>{announcementWebcastPin}</strong>
                          </div>
                        </div>

                        <div className="w-11 h-11 bg-white p-1 rounded-lg border border-neutral-300 flex items-center justify-center shrink-0">
                          <QrCode className="w-full h-full text-neutral-900" />
                        </div>
                      </div>

                      {/* Footer Note & BFH Seal */}
                      <div className="pt-2 text-[9px] space-y-0.5 opacity-80 font-light">
                        <div className="italic line-clamp-1">{announcementFamilyMessage}</div>
                        <div className="font-mono text-[8px] uppercase tracking-widest text-amber-400">
                          630 St. Nicholas Ave, New York, NY 10030 · (212) 281-8850
                        </div>
                      </div>
                    </div>

                    {/* PUBLIC SOCIAL MEDIA & SMS TEXT SHARING ACTION BAR */}
                    <div className="w-full bg-gradient-to-r from-neutral-900 via-[#141b2b] to-neutral-900 text-white p-5 rounded-2xl border border-amber-400/40 space-y-3 shadow-lg">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <div className="flex items-center space-x-2">
                          <Share2 className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-xs text-white">
                            Post & Share Announcement to the Public:
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-mono">
                          1-Click Social & SMS Dispatch
                        </span>
                      </div>

                      {/* 1-Click Social & SMS Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        
                        {/* 1. Direct SMS Dispatch Launcher */}
                        <button
                          onClick={() => setIsAnnouncementSMSModalOpen(true)}
                          className="p-2.5 bg-[#991b1b] hover:bg-red-800 text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm border border-amber-400/30"
                          title="Send announcement card directly to phone numbers via SMS"
                        >
                          <Smartphone className="w-4 h-4 text-amber-300" />
                          <span>📱 Text / SMS</span>
                        </button>

                        {/* 2. WhatsApp */}
                        <button
                          onClick={handleShareWhatsApp}
                          className="p-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                          title="Share announcement on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </button>

                        {/* 3. Facebook */}
                        <button
                          onClick={handleShareFacebook}
                          className="p-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                          title="Share announcement on Facebook"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Facebook</span>
                        </button>

                        {/* 4. X (Twitter) */}
                        <button
                          onClick={handleShareTwitter}
                          className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm border border-neutral-600"
                          title="Post announcement to X / Twitter"
                        >
                          <span>𝕏 Post</span>
                        </button>
                      </div>

                      {/* Auxiliary Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <button
                          onClick={handleShareLinkedIn}
                          className="text-neutral-300 hover:text-white flex items-center space-x-1 transition text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          <span>Share on LinkedIn</span>
                        </button>

                        <button
                          onClick={handleCopyAnnouncementText}
                          className="text-amber-300 hover:text-amber-200 flex items-center space-x-1 transition text-[11px] font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Full Text Notice</span>
                        </button>

                        <button
                          onClick={() => {
                            handleSaveAnnouncementData();
                            showToast('💾 High-resolution announcement image downloaded to device!');
                          }}
                          className="text-neutral-300 hover:text-white flex items-center space-x-1 transition text-[11px]"
                        >
                          <Download className="w-3 h-3 text-amber-400" />
                          <span>Download Graphic</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* SUB-VIEW 2: PHOTO GALLERY & MEDIA PRODUCTION VAULT */}
            {photoSubTab === 'gallery' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Upload Action Banner */}
                <div className="bg-gradient-to-r from-red-50 via-neutral-50 to-amber-50 p-5 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#991b1b]" />
                      <span>Memorial Media Vault & Placement Manager</span>
                    </h4>
                    <p className="text-xs text-neutral-600">
                      High-resolution photos assigned to the Printed Funeral Booklet, Video Slideshow, and Memorial Announcement Card.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPhotoUploadModalOpen(true)}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-red-950/20"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Upload New Photo</span>
                  </button>
                </div>

                {/* Photo Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {obitState.photos.map((photo) => (
                    <div key={photo.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-4 flex flex-col justify-between group hover:border-[#991b1b] transition">
                      <div className="space-y-2.5">
                        <div className="w-full h-52 rounded-xl overflow-hidden bg-neutral-200 relative">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-black/75 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {photo.placement}
                          </span>
                          {announcementPortraitUrl === photo.url && (
                            <span className="absolute top-2 right-2 bg-[#991b1b] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                              ⭐ Active Announcement
                            </span>
                          )}
                        </div>

                        <div>
                          <strong className="text-xs font-bold text-neutral-900 block leading-tight">
                            {photo.caption}
                          </strong>
                          <span className="text-[11px] text-neutral-500">
                            Assigned for Production Package & Keepsakes
                          </span>
                        </div>
                      </div>

                      {/* Photo Actions Toolbar */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetAsAnnouncementPortrait(photo.url)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            announcementPortraitUrl === photo.url
                              ? 'bg-amber-50 text-[#b45309] border-amber-300'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {announcementPortraitUrl === photo.url ? '✓ Active Portrait' : '⭐ Set as Announcement'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1 text-neutral-400 hover:text-red-700 transition"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* MODAL: UPLOAD NEW MEMORIAL PHOTO */}
        {isPhotoUploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border-2 border-amber-400">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-[#991b1b]" />
                  <h4 className="font-serif-title text-lg font-bold text-neutral-900">
                    Upload Memorial Photo
                  </h4>
                </div>
                <button
                  onClick={() => setIsPhotoUploadModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Photo Image URL or Upload Link:</label>
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://... or paste image URL"
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-neutral-500">Quick Samples:</span>
                    <button
                      type="button"
                      onClick={() => setNewPhotoUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80')}
                      className="text-[10px] text-[#991b1b] underline"
                    >
                      Sample Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80')}
                      className="text-[10px] text-[#991b1b] underline"
                    >
                      Sample Legacy
                    </button>
                  </div>
                </div>

                {newPhotoUrl && (
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Caption / Memorial Note:</label>
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="e.g. Official Family Portrait for Funeral Program"
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Placement Assignment:</label>
                  <select
                    value={newPhotoPlacement}
                    onChange={(e) => setNewPhotoPlacement(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-bold text-neutral-900 focus:ring-2 focus:ring-[#991b1b]"
                  >
                    <option value="Front Cover">Front Cover & Official Announcement Portrait</option>
                    <option value="Inside Spread">Inside Spread (Printed Program)</option>
                    <option value="Obituary Column">Obituary Column</option>
                    <option value="Back Keepsake">Back Keepsake</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsPhotoUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#991b1b] hover:bg-red-800 rounded-xl transition shadow-md shadow-red-950/20"
                >
                  Save Photo to Vault
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DISPATCH FUNERAL ANNOUNCEMENT BY TEXT / SMS */}
        {isAnnouncementSMSModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border-2 border-amber-400">
              
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-[#991b1b]" />
                  <h4 className="font-serif-title text-lg font-bold text-neutral-900">
                    Dispatch Funeral Announcement via SMS
                  </h4>
                </div>
                <button
                  onClick={() => setIsAnnouncementSMSModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Recipient Name / Community Group:</label>
                  <input
                    type="text"
                    value={announcementSMSRecipientName}
                    onChange={(e) => setAnnouncementSMSRecipientName(e.target.value)}
                    placeholder="e.g. Harlem Church Deacons / Cousin Michael"
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Recipient Mobile Phone Number:</label>
                  <input
                    type="text"
                    value={announcementSMSRecipientPhone}
                    onChange={(e) => setAnnouncementSMSRecipientPhone(e.target.value)}
                    placeholder="e.g. (212) 555-0198"
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Personal Note from Family (Optional):</label>
                  <input
                    type="text"
                    value={announcementSMSCustomNote}
                    onChange={(e) => setAnnouncementSMSCustomNote(e.target.value)}
                    placeholder="e.g. Please join us in celebrating Arthur's legacy."
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b]"
                  />
                </div>

                {/* Live Carrier SMS Bubble Preview */}
                <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-amber-400/40 space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
                    <span>📱 CARRIER SMS PREVIEW</span>
                    <span>Carrier Delivered</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-neutral-200">
                    🕊️ <strong>BENTA'S FUNERAL ANNOUNCEMENT:</strong> {announcementHeadline} for <strong>{activeCase.decedent.legalName}</strong>.
                    <br />
                    📅 Service: {announcementServiceInfo} at {announcementServiceVenue}.
                    <br />
                    🔴 Live Webcast & Memorial Archive: {announcementWebcastUrl} (PIN: {announcementWebcastPin})
                    {announcementSMSCustomNote && (
                      <span className="block mt-1 italic text-amber-200">
                        "{announcementSMSCustomNote}"
                      </span>
                    )}
                  </p>
                </div>

                {/* SMS Dispatch History */}
                {announcementSMSHistory.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Recent SMS Dispatches:</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {announcementSMSHistory.map((h) => (
                        <div key={h.id} className="flex justify-between items-center text-[10px] bg-neutral-50 p-1.5 rounded-lg border border-neutral-200">
                          <span className="font-semibold text-neutral-800">{h.name} ({h.phone})</span>
                          <span className="text-emerald-700 font-mono">✓ {h.sentAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementSMSModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDispatchAnnouncementSMS(announcementSMSRecipientName, announcementSMSRecipientPhone)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#991b1b] hover:bg-red-800 rounded-xl transition shadow-md shadow-red-950/20 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dispatch SMS Announcement</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SERVICE & LIVERY STATUS & CORTEGE ROUTE MANAGEMENT */}
        {portalTab === 'status' && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center border-b border-neutral-200 pb-4 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-[#991b1b]" />
                  <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                    Real-Time Custody & Livery Fleet Status
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Live updates on physical care at 630 St. Nicholas Ave, limousine cortege routing, and family pick-up/drop-off logistics.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Safe Arrival Confirmed</span>
                </span>
              </div>
            </div>

            {/* Quick 3-Card Custodial & Facility Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Custodial Status</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="font-bold text-neutral-900 text-sm">In Restorative Care</div>
                <div className="text-[11px] text-[#991b1b] font-medium">630 St. Nicholas Ave Preparation Suite</div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Livery Fleet Allocation</span>
                  <Car className="w-3.5 h-3.5 text-[#b45309]" />
                </div>
                <div className="font-bold text-neutral-900 text-sm">1x Lead Hearse + 2x 8-Seater Limousines</div>
                <div className="text-[11px] text-neutral-600">Total Capacity: 16 Passenger Seats</div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Chapel Sanctuary</span>
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="font-bold text-neutral-900 text-sm">{activeCase.serviceSelections.viewingParlor}</div>
                <div className="text-[11px] text-emerald-700 font-medium">Reserved & Sanitized</div>
              </div>
            </div>

            {/* PROMINENT 10-HOUR CORTEGE MODIFICATION POLICY NOTICE */}
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-[#b45309]/50 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-[#b45309] text-white rounded-xl shrink-0 mt-0.5 sm:mt-0">
                    <Clock className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                      <span>10-Hour Prior Cortege Modification & Confirmation Policy</span>
                      <span className="text-[10px] bg-[#b45309] text-white font-mono px-2 py-0.5 rounded font-bold uppercase">
                        NYS / NYPD Rule
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-700 font-light mt-0.5 leading-relaxed">
                      In accordance with <strong>NYPD 32nd Precinct Motorcade Escort Command</strong> and Harlem transportation dispatch protocols, family pick-up locations, drop-off destinations, passenger counts, and scheduled timings <strong>may be entered, viewed, confirmed, or adjusted up to 10 hours prior to the scheduled service time</strong>. Within 10 hours of cortege departure, all routes and vehicle rosters are strictly locked for motorcade security and on-time procession.
                    </p>
                  </div>
                </div>

                {/* Simulation Toggle Switch for Testing Both Policy States */}
                <div className="shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => setSimulateUnder10hLock(!simulateUnder10hLock)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border shadow-xs ${
                      simulateUnder10hLock
                        ? 'bg-red-50 text-[#991b1b] border-red-300 hover:bg-red-100'
                        : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50'
                    }`}
                    title="Toggle test simulation of 10-Hour lockout condition"
                  >
                    {simulateUnder10hLock ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#991b1b]" />
                        <span>Simulating: &lt;10h Cutoff (Locked)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Simulate &lt;10h Lockout Rule</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Live Lockout Status Bar */}
              <div className="pt-2 border-t border-amber-300/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  {isCortegeLocked ? (
                    <span className="flex items-center space-x-1.5 text-red-700 font-bold bg-red-100/90 px-3 py-1 rounded-lg border border-red-200">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Modification Window: LOCKED (Within 10-Hour Service Cutoff)</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-emerald-900 font-bold bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Modification Window: OPEN (68 Hours Remaining before 10h Lockout) — Changes Permitted</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-neutral-600 font-medium">
                  Service Scheduled: <strong>{cortegeRoute.serviceDateTime}</strong>
                </span>
              </div>
            </div>

            {/* CONFIRMATION STATUS RIBBON */}
            <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              cortegeRoute.isConfirmedByFamily
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  cortegeRoute.isConfirmedByFamily ? 'bg-emerald-600' : 'bg-[#b45309]'
                }`}>
                  {cortegeRoute.isConfirmedByFamily ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-xs">
                    {cortegeRoute.isConfirmedByFamily ? (
                      <span>Cortege Route & Pick-up Details Confirmed by {cortegeRoute.confirmedBy || activeCase.informant.fullName}</span>
                    ) : (
                      <span>Route Confirmation Pending Family Verification</span>
                    )}
                  </div>
                  <div className="text-[11px] opacity-80 font-light">
                    {cortegeRoute.isConfirmedByFamily ? (
                      <span>Confirmed on {cortegeRoute.confirmedAt || 'Recently'}. Transmitted to lead hearse driver & escort dispatcher.</span>
                    ) : (
                      <span>Please review the pick-up location, drop-off destination, and passenger count below.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {!isEditingRoute ? (
                  <>
                    <button
                      onClick={() => {
                        if (isCortegeLocked) {
                          showToast('🔒 Route modifications are locked within 10 hours of service. Call Director at (212) 281-8850 for emergency assistance.');
                          return;
                        }
                        setIsEditingRoute(true);
                      }}
                      disabled={isCortegeLocked}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs ${
                        isCortegeLocked
                          ? 'bg-neutral-200 text-neutral-400 border border-neutral-300 cursor-not-allowed'
                          : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300'
                      }`}
                      title={isCortegeLocked ? 'Locked within 10 hours of service' : 'Edit pick-up and drop-off locations'}
                    >
                      {isCortegeLocked ? <Lock className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-[#991b1b]" />}
                      <span>{isCortegeLocked ? 'Route Locked (<10h)' : '✏️ Modify Route & Locations'}</span>
                    </button>

                    {!cortegeRoute.isConfirmedByFamily && (
                      <button
                        onClick={handleQuickConfirmRoute}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-300" />
                        <span>Confirm Route & Timings</span>
                      </button>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1.5 border border-neutral-300"
                      title="Print cortege route itinerary"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print Route</span>
                    </button>

                    <button
                      onClick={handleSendItinerarySMS}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1.5 border border-blue-200"
                      title="Send cortege itinerary to family by SMS"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                      <span className="hidden sm:inline">SMS to Family</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditingRoute(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRoute}
                      className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-red-950/20"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>Save & Confirm Route</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* EDIT MODE FORM (WHEN USER CLICKS "MODIFY ROUTE & LOCATIONS") */}
            {isEditingRoute && (
              <div className="bg-gradient-to-b from-neutral-50 to-white border-2 border-[#991b1b]/40 rounded-2xl p-6 space-y-6 shadow-sm animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-[#991b1b]" />
                    <h4 className="font-bold text-sm text-neutral-900">
                      Edit Family Pick-up & Drop-off Route Details
                    </h4>
                  </div>
                  <span className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                    Changes permitted up to 10h prior to service
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Stage 1 Pick-up Details */}
                  <div className="space-y-4 bg-white p-5 rounded-xl border border-neutral-200">
                    <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <h5 className="font-bold text-xs text-neutral-900">Stage 1: Family Pick-up Location</h5>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Pick-up Location Label:</label>
                        <input
                          type="text"
                          value={formPickupName}
                          onChange={(e) => setFormPickupName(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                          placeholder="e.g. Vance Family Residence"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Pick-up Full Street Address:</label>
                        <input
                          type="text"
                          value={formPickupAddress}
                          onChange={(e) => setFormPickupAddress(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                          placeholder="e.g. 409 Edgecombe Ave, New York, NY 10032"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Floor / Apartment / Access:</label>
                          <input
                            type="text"
                            value={formPickupFloorApt}
                            onChange={(e) => setFormPickupFloorApt(e.target.value)}
                            className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                            placeholder="e.g. Apt 6B (Rear ramp)"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Scheduled Pick-up Time:</label>
                          <input
                            type="text"
                            value={formPickupTime}
                            onChange={(e) => setFormPickupTime(e.target.value)}
                            className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                            placeholder="e.g. 09:30 AM"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">On-Site Family Contact:</label>
                          <input
                            type="text"
                            value={formPickupContact}
                            onChange={(e) => setFormPickupContact(e.target.value)}
                            className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Contact Mobile Phone:</label>
                          <input
                            type="text"
                            value={formPickupPhone}
                            onChange={(e) => setFormPickupPhone(e.target.value)}
                            className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Special Assistance / Accessibility Notes:</label>
                        <textarea
                          rows={2}
                          value={formPickupInstructions}
                          onChange={(e) => setFormPickupInstructions(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white resize-none"
                          placeholder="e.g. Elder family member requires low-step entry; 2 floral sprays to be transported."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Stage 3 Drop-off & Return Details */}
                  <div className="space-y-4 bg-white p-5 rounded-xl border border-neutral-200">
                    <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <h5 className="font-bold text-xs text-neutral-900">Stage 3 & 4: Drop-off Destination & Repast</h5>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Final Drop-off Destination Name:</label>
                        <input
                          type="text"
                          value={formDropoffName}
                          onChange={(e) => setFormDropoffName(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                          placeholder="e.g. Woodlawn Cemetery & Crematory"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Destination Full Street Address:</label>
                        <input
                          type="text"
                          value={formDropoffAddress}
                          onChange={(e) => setFormDropoffAddress(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                          placeholder="e.g. 4199 Webster Ave, Bronx, NY 10470"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Estimated Committal Time:</label>
                          <input
                            type="text"
                            value={formDropoffTime}
                            onChange={(e) => setFormDropoffTime(e.target.value)}
                            className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Total Family Passengers:</label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={formPassengers}
                            onChange={(e) => setFormPassengers(parseInt(e.target.value) || 1)}
                            className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Drop-off Processional Instructions:</label>
                        <input
                          type="text"
                          value={formDropoffInstructions}
                          onChange={(e) => setFormDropoffInstructions(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                          placeholder="e.g. Assemble at Woolworth Gatehouse for witness committal."
                        />
                      </div>

                      <div className="pt-2 border-t border-neutral-100">
                        <label className="flex items-center space-x-2 text-xs font-bold text-neutral-800 cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            checked={formReturnRequired}
                            onChange={(e) => setFormReturnRequired(e.target.checked)}
                            className="accent-[#991b1b] rounded"
                          />
                          <span>Return Transport to Repast Gathering Required</span>
                        </label>

                        {formReturnRequired && (
                          <div>
                            <input
                              type="text"
                              value={formReturnAddress}
                              onChange={(e) => setFormReturnAddress(e.target.value)}
                              className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium focus:ring-2 focus:ring-[#991b1b] focus:bg-white"
                              placeholder="e.g. Return to 409 Edgecombe Ave & Repast Hall"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Form Footer Action */}
                <div className="flex justify-end items-center space-x-3 pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingRoute(false)}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRoute}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#991b1b] hover:bg-red-800 rounded-xl transition shadow-md shadow-red-950/20 flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Save & Lock Cortege Route</span>
                  </button>
                </div>
              </div>
            )}

            {/* VISUAL 4-STAGE CORTEGE ROUTE ROADMAP (VIEW MODE) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-[#991b1b]" />
                  <span>Dignified Motorcade & Cortege Itinerary</span>
                </h4>
                <span className="text-xs text-neutral-500 font-mono">
                  {cortegeRoute.totalPassengers} Passengers • 3 Escorted Vehicles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Stage 1: Family Pick-up */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-blue-200/80 space-y-2 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                        Stage 1: Pick-up
                      </span>
                      <span className="text-xs font-bold text-blue-900 font-mono">
                        {cortegeRoute.pickupTime}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-neutral-900 text-xs">
                        {cortegeRoute.pickupLocationName}
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {cortegeRoute.pickupAddress}
                      </p>
                      {cortegeRoute.pickupFloorApt && (
                        <p className="text-[10px] text-neutral-500 italic mt-0.5">
                          {cortegeRoute.pickupFloorApt}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 text-[10px] space-y-1">
                    <div className="text-neutral-700 font-medium">
                      Contact: <strong>{cortegeRoute.pickupContactName}</strong> ({cortegeRoute.pickupContactPhone})
                    </div>
                    {cortegeRoute.pickupSpecialInstructions && (
                      <div className="text-blue-950 bg-blue-50/80 p-1.5 rounded border border-blue-200 font-light">
                        {cortegeRoute.pickupSpecialInstructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage 2: Sanctuary / Chapel */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-red-200/80 space-y-2 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#991b1b]" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#991b1b] px-2 py-0.5 rounded font-mono">
                        Stage 2: Sanctuary
                      </span>
                      <span className="text-xs font-bold text-[#991b1b] font-mono">
                        {cortegeRoute.serviceTime}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-neutral-900 text-xs">
                        {cortegeRoute.serviceVenueName}
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {cortegeRoute.serviceVenueAddress}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 text-[10px] space-y-1 text-neutral-600">
                    <div>Sanctuary order of service, 4K Webcast, and family seating procession.</div>
                  </div>
                </div>

                {/* Stage 3: Drop-off Destination */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-emerald-200/80 space-y-2 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                        Stage 3: Drop-off
                      </span>
                      <span className="text-xs font-bold text-emerald-900 font-mono">
                        {cortegeRoute.dropoffTime || '01:30 PM'}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-neutral-900 text-xs">
                        {cortegeRoute.dropoffLocationName}
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {cortegeRoute.dropoffAddress}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 text-[10px] space-y-1">
                    {cortegeRoute.dropoffSpecialInstructions && (
                      <div className="text-emerald-950 bg-emerald-50/80 p-1.5 rounded border border-emerald-200 font-light">
                        {cortegeRoute.dropoffSpecialInstructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage 4: Return & Repast */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-amber-200/80 space-y-2 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#b45309]" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-[#b45309] px-2 py-0.5 rounded font-mono">
                        Stage 4: Repast
                      </span>
                      <span className="text-xs font-bold text-[#b45309] font-mono">
                        Return Trip
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-neutral-900 text-xs">
                        {cortegeRoute.returnLocationName || 'Family Residence & Repast Gathering'}
                      </h5>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {cortegeRoute.returnAddress || cortegeRoute.pickupAddress}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 text-[10px] space-y-1 text-neutral-600">
                    <div>Return transport for immediate family cortege following committal.</div>
                  </div>
                </div>

              </div>
            </div>

            {/* FLEET VEHICLE ALLOCATION & ESCORT ROSTER */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-bold text-xs text-neutral-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Car className="w-4 h-4 text-[#991b1b]" />
                  <span>Assigned Cortege Vehicle Lineup & Chauffeur Roster</span>
                </span>
                <span className="text-[11px] text-neutral-500">NYPD 32nd Pct Motorcade Escort</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {cortegeRoute.vehiclesAllocated.map((veh, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                        Vehicle {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#991b1b] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {veh.plateNumber || 'BFH-FLEET'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-neutral-900 leading-tight">
                      {veh.quantity}x {veh.vehicleType}
                    </div>
                    <div className="text-[11px] text-neutral-600 flex items-center space-x-1">
                      <User className="w-3 h-3 text-neutral-400" />
                      <span>Chauffeur: {veh.assignedDriver || 'Assigned BFH Driver'}</span>
                    </div>
                    {veh.driverPhone && (
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Direct: {veh.driverPhone}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Floating Toast Alert */}
      {toastAlert && (
        <div className="fixed top-6 right-6 z-60 bg-[#141b2b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center space-x-3 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <p className="text-xs font-medium">{toastAlert}</p>
        </div>
      )}

      {/* Family Portal Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 px-4 text-center text-xs text-neutral-500 space-y-1">
        <p className="font-serif-title font-bold text-[#991b1b]">BENTA'S FUNERAL HOME, INC. • HARLEM, NYC</p>
        <p>630 Saint Nicholas Ave, New York, NY 10030 • (212) 281-8850</p>
      </footer>

      {/* FLOATING 24/7 CONCIERGE & LEGAL QUICK LAUNCHER */}
      {portalTab !== 'concierge' && (
        <button
          onClick={() => {
            setPortalTab('concierge');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-6 left-6 z-40 bg-[#141b2b] text-white border-2 border-amber-400 hover:bg-[#991b1b] shadow-2xl px-4 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300 group hover:scale-105"
          title="Open 24/7 Family Care Concierge, Financial Benefits & Legal Assistant"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#141b2b] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#141b2b]" />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-[11px] font-bold text-amber-300 flex items-center space-x-1">
              <span>24/7 Family Concierge</span>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full uppercase">AI Guide</span>
            </div>
            <div className="text-[9px] text-neutral-300">VA Benefits • Law • Immediate Care</div>
          </div>
        </button>
      )}

      {/* MODAL 1: 4-UP PRINTABLE MEMORIAL QR KEEPSAKE CARDS */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-amber-400 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-[#991b1b]" />
                  <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                    Print-Ready 4-Up Memorial QR Keepsake Cards
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Formatted for 8.5" x 11" perforated cardstock. Perfect for wake easels, chapel programs, and repast table displays.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-red-950/20"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={() => setIsQRModalOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 4-Up Printable Sheet Grid (2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-100 p-4 sm:p-6 rounded-2xl border border-neutral-300">
              {[1, 2, 3, 4].map((cardIdx) => (
                <div
                  key={cardIdx}
                  className="bg-white border-2 border-[#b45309]/60 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between text-center relative overflow-hidden"
                >
                  {/* Top Gold Foil Bar */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#991b1b] via-[#d4af37] to-[#991b1b]" />

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold tracking-widest text-[#991b1b] uppercase">
                      Benta's Funeral Home · Harlem, NYC
                    </span>
                    <h4 className="font-serif-title font-bold text-sm sm:text-base text-neutral-900 leading-tight">
                      In Loving Memory of<br />
                      <strong className="text-[#991b1b]">{activeCase.decedent.legalName}</strong>
                    </h4>
                    <div className="text-[10px] text-neutral-500 italic">
                      {activeCase.decedent.dateOfBirth} — {activeCase.decedent.dateOfDeath}
                    </div>
                  </div>

                  {/* QR Box */}
                  <div className="bg-amber-50/80 border border-amber-300/80 p-3 rounded-xl mx-auto w-36 h-36 flex flex-col items-center justify-center shadow-inner">
                    <div className="w-24 h-24 bg-white border border-neutral-300 rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                      <QrCode className="w-full h-full text-neutral-900" />
                    </div>
                    <span className="text-[8px] font-mono font-bold text-[#b45309] mt-1 tracking-tighter">
                      e-bfh.com/tribute/{activeCase.caseNumber}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-neutral-800 leading-tight">
                      Scan with your smartphone camera to hear voice memories and record your personal tribute.
                    </p>
                    <span className="text-[9px] text-neutral-400 block">
                      Case #{activeCase.caseNumber} • Keepsake Edition
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Print Instructions */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-700">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-[#991b1b]" />
                <span><strong>Print Recommendation:</strong> Use heavy matte white or linen cardstock (80lb+) for the highest quality presentation.</span>
              </div>
              <button
                onClick={() => {
                  handleCopyText(`https://e-bfh.com/tribute/${activeCase.caseNumber}`, 'Tribute URL');
                }}
                className="text-[#991b1b] font-bold hover:underline flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw QR Link</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: QUICK SHARE DIGITAL TRIBUTE DIALOG */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200">
            
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                  Share Digital Tribute
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Share the living voice archive for <strong className="text-neutral-900">{activeCase.decedent.legalName}</strong> so relatives and friends can listen and record memories.
            </p>

            {/* Direct Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700">Direct Tribute Link</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`https://e-bfh.com/tribute/${activeCase.caseNumber}`}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-800"
                />
                <button
                  onClick={() => handleCopyText(`https://e-bfh.com/tribute/${activeCase.caseNumber}`, 'Tribute Link')}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700">Quick Share Channels</label>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Please join our family in celebrating the life of ${activeCase.decedent.legalName}. Listen and record your voice memory: https://e-bfh.com/tribute/${activeCase.caseNumber}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition flex flex-col items-center justify-center space-y-1"
                >
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`sms:?&body=${encodeURIComponent(`Please join our family in celebrating the life of ${activeCase.decedent.legalName}. Listen and record your voice memory: https://e-bfh.com/tribute/${activeCase.caseNumber}`)}`}
                  className="bg-sky-600 hover:bg-sky-700 text-white p-2.5 rounded-xl transition flex flex-col items-center justify-center space-y-1"
                >
                  <span>iMessage / SMS</span>
                </a>

                <button
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setIsQRModalOpen(true);
                  }}
                  className="bg-amber-700 hover:bg-amber-800 text-white p-2.5 rounded-xl transition flex flex-col items-center justify-center space-y-1"
                >
                  <span>Print QR</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  setPortalTab('tribute');
                }}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Open Full Voice Studio & Invitation Hub
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Harlem Florist Guild & Sympathy Boutique Modal */}
      <FloralTributeShopModal
        isOpen={isFloralShopModalOpen}
        onClose={() => setIsFloralShopModalOpen(false)}
        activeCase={activeCase}
        onOrderPlaced={(order) => {
          showToast(`🌸 Floral tribute "${order.item.name}" ordered and dispatched to ${order.floristName}!`);
        }}
      />

    </div>
  );
};
