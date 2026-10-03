import { useState, useEffect } from 'react';
import {
  UserRole,
  GoldenRecordCase,
  CasePhase,
  DocumentStatus,
  DocumentItem,
  BackOfficeTab,
  RoomScheduleEvent,
  SimulatedNotification,
  VehicleHoldRequest,
  ServicePartnerContact,
  PartnerScheduleRequest,
  RemovalScheduleInfo,
  StatementOfGoodsData,
  ArrangementAppointmentInfo,
  RoomId,
  DirectorProfile,
  ServiceDirectorAssignment,
  Director1099Voucher,
  PassThroughPayableCheck,
  FirstCallIntakeFormData
} from './lib/types/funeral';
import {
  MOCK_CASES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LIVERY_HOLDS,
  INITIAL_SERVICE_PARTNERS,
  INITIAL_PARTNER_REQUESTS,
  INITIAL_DIRECTOR_PROFILES,
  INITIAL_SERVICE_ASSIGNMENTS,
  INITIAL_1099_VOUCHERS
} from './lib/data/mockCases';
import {
  loadPersistedState,
  savePersistedState,
  STORAGE_KEYS
} from './lib/storage/persistence';
import {
  createSignedSessionToken,
  verifySessionToken,
  getActiveManagerSession,
  revokeManagerSession,
  SessionToken
} from './lib/storage/sessionAuth';

// Public Components
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicHero } from './components/public/PublicHero';
import { NotableServices } from './components/public/NotableServices';
import { ServiceOptionsSection } from './components/public/ServiceOptionsSection';
import { PreplanningSection } from './components/public/PreplanningSection';
import { PublicHistoryFacility } from './components/public/PublicHistoryFacility';
import { ObituariesTributes } from './components/public/ObituariesTributes';
import { GriefHealingSection } from './components/public/GriefHealingSection';
import { PublicFAQsContact } from './components/public/PublicFAQsContact';
import { ArrangerWizard } from './components/public/ArrangerWizard';
import { PublicFooter } from './components/public/PublicFooter';

// Back-Office Components
import { BackOfficeLayout } from './components/backoffice/BackOfficeLayout';
import { DirectorActiveCasesDashboard } from './components/backoffice/DirectorActiveCasesDashboard';
import { CasePipelineView } from './components/backoffice/CasePipelineView';
import { GoldenRecordDetail } from './components/backoffice/GoldenRecordDetail';
import { DocumentJourneyMatrix } from './components/backoffice/DocumentJourneyMatrix';
import { CanvasESignModal } from './components/backoffice/CanvasESignModal';
import { WoodlawnDispatchModal } from './components/backoffice/WoodlawnDispatchModal';
import { FinancialVerificationCenter } from './components/backoffice/FinancialVerificationCenter';
import { AftercareCRMNurture } from './components/backoffice/AftercareCRMNurture';
import { FacilityCalendarView } from './components/backoffice/FacilityCalendarView';
import { ExecutiveReportsAnalytics } from './components/backoffice/ExecutiveReportsAnalytics';
import { LiveNotificationSimulatorModal } from './components/backoffice/LiveNotificationSimulatorModal';
import { LiveryVehicleDispatchModal } from './components/backoffice/LiveryVehicleDispatchModal';
import { ServicePartnerNetworkManager } from './components/backoffice/ServicePartnerNetworkManager';
import { PartnerScheduleModal } from './components/backoffice/PartnerScheduleModal';
import { WebcastSchedulingModal } from './components/backoffice/WebcastSchedulingModal';
import { RemovalSchedulingModal } from './components/backoffice/RemovalSchedulingModal';
import { ArrangementContractBuilderModal } from './components/backoffice/ArrangementContractBuilderModal';
import { ArrangementAppointmentModal } from './components/backoffice/ArrangementAppointmentModal';
import { MemorialProgramBuilderModal } from './components/backoffice/MemorialProgramBuilderModal';
import { EdrsRapidFillModal } from './components/backoffice/EdrsRapidFillModal';
import { ChapelQrSignModal } from './components/backoffice/ChapelQrSignModal';
import { TwoWayVendorSmsModal } from './components/backoffice/TwoWayVendorSmsModal';
import { FamilyAccessModal } from './components/public/FamilyAccessModal';
import { ManagerDirectorSchedulingView } from './components/backoffice/ManagerDirectorSchedulingView';
import { ManagerPinLoginModal } from './components/backoffice/ManagerPinLoginModal';
import { DirectorAssignmentModal } from './components/backoffice/DirectorAssignmentModal';
import { PrintableFormAP47Modal } from './components/backoffice/PrintableFormAP47Modal';
import { DocuSignEnvelopeModal } from './components/backoffice/DocuSignEnvelopeModal';
import { QuickBooksSyncModal } from './components/backoffice/QuickBooksSyncModal';
import { CashAdvanceCheckPrinterModal } from './components/backoffice/CashAdvanceCheckPrinterModal';
import { FirstCallIntakeModal } from './components/backoffice/FirstCallIntakeModal';
import { DiscrepancyGuardrailModal } from './components/backoffice/DiscrepancyGuardrailModal';
import { DirectorDayOfServiceHUDModal } from './components/backoffice/DirectorDayOfServiceHUDModal';
import { FamilyProofApprovalModal } from './components/backoffice/FamilyProofApprovalModal';
import { TwilioGatewaySettingsModal } from './components/backoffice/TwilioGatewaySettingsModal';
import { CloudSyncStorageModal } from './components/backoffice/CloudSyncStorageModal';
import { AIGatewaySettingsModal } from './components/backoffice/AIGatewaySettingsModal';
import { CommercialPressFulfillmentModal } from './components/backoffice/CommercialPressFulfillmentModal';
import { WebcastLiveStreamHubModal } from './components/backoffice/WebcastLiveStreamHubModal';
import { StripePaymentGatewayModal } from './components/backoffice/StripePaymentGatewayModal';
import { IntegrationsCommandCenterModal } from './components/backoffice/IntegrationsCommandCenterModal';
import { CaseLifecycleSimulatorModal } from './components/backoffice/CaseLifecycleSimulatorModal';
import { createCaseFromFirstCall } from './lib/data/firstCallHelper';

// Family Portal Component (with full 9-Part Obituary Writer Suite)
import { FamilyPortalView } from './components/family/FamilyPortalView';
import { InteractiveGuidedTourModal, TourTrack } from './components/ui/InteractiveGuidedTourModal';

export function App() {
  // App View Mode: 'public' or 'backoffice'
  const [viewMode, setViewMode] = useState<'public' | 'backoffice'>('public');
  const [activePublicSection, setActivePublicSection] = useState('home');

  // Multi-Tenancy & Access Isolation: isStaffUser is true only for BFH Staff / Directors
  const [isStaffUser, setIsStaffUser] = useState<boolean>(true);
  const [isFamilyAccessModalOpen, setIsFamilyAccessModalOpen] = useState<boolean>(false);

  // Case State with Persistent Local Storage Hydration
  const [cases, setCases] = useState<GoldenRecordCase[]>(() => 
    loadPersistedState<GoldenRecordCase[]>(STORAGE_KEYS.CASES, MOCK_CASES)
  );
  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    const loaded = loadPersistedState<GoldenRecordCase[]>(STORAGE_KEYS.CASES, MOCK_CASES);
    return loaded[0]?.id || MOCK_CASES[0].id;
  });

  // Facility Calendar Events State
  const [calendarEvents, setCalendarEvents] = useState<RoomScheduleEvent[]>(() => 
    loadPersistedState<RoomScheduleEvent[]>(STORAGE_KEYS.CALENDAR_EVENTS, INITIAL_CALENDAR_EVENTS)
  );

  // Livery Vehicle Holds State
  const [liveryHolds, setLiveryHolds] = useState<VehicleHoldRequest[]>(() => 
    loadPersistedState<VehicleHoldRequest[]>(STORAGE_KEYS.LIVERY_HOLDS, INITIAL_LIVERY_HOLDS)
  );
  const [isLiveryModalOpen, setIsLiveryModalOpen] = useState(false);

  // Service Partners & SMS Dispatch State
  const [servicePartners, setServicePartners] = useState<ServicePartnerContact[]>(() => 
    loadPersistedState<ServicePartnerContact[]>(STORAGE_KEYS.SERVICE_PARTNERS, INITIAL_SERVICE_PARTNERS)
  );
  const [partnerRequests, setPartnerRequests] = useState<PartnerScheduleRequest[]>(() => 
    loadPersistedState<PartnerScheduleRequest[]>(STORAGE_KEYS.PARTNER_REQUESTS, INITIAL_PARTNER_REQUESTS)
  );
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Two-Way Vendor SMS Dispatch & Confirmation Modal State
  const [isTwoWaySmsModalOpen, setIsTwoWaySmsModalOpen] = useState(false);
  const [twoWaySmsTargetRequestId, setTwoWaySmsTargetRequestId] = useState<string | null>(null);

  const handleOpenTwoWaySmsModal = (requestId?: string) => {
    setTwoWaySmsTargetRequestId(requestId || null);
    setIsTwoWaySmsModalOpen(true);
  };

  // 4K Webcast Scheduling State
  const [isWebcastModalOpen, setIsWebcastModalOpen] = useState(false);
  const [webcastTargetCase, setWebcastTargetCase] = useState<GoldenRecordCase | null>(null);

  // Universal First Call & Intake Studio State
  const [isFirstCallIntakeOpen, setIsFirstCallIntakeOpen] = useState(false);

  // First Call Removal & Custody Affidavit State
  const [isRemovalModalOpen, setIsRemovalModalOpen] = useState(false);
  const [removalTargetCase, setRemovalTargetCase] = useState<GoldenRecordCase | null>(null);

  // Arrangement Conference & AP-47 Contract Studio State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTargetCase, setContractTargetCase] = useState<GoldenRecordCase | null>(null);

  // In-Person Family Arrangement Conference Scheduling Studio State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentTargetCase, setAppointmentTargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenAppointmentModal = (c?: GoldenRecordCase) => {
    setAppointmentTargetCase(c || null);
    setIsAppointmentModalOpen(true);
  };

  // NYS Form AP-47 Official Printable Contract State
  const [isPrintAP47Open, setIsPrintAP47Open] = useState(false);
  const [printAP47TargetCase, setPrintAP47TargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenPrintAP47Modal = (c?: GoldenRecordCase) => {
    setPrintAP47TargetCase(c || activeCase);
    setIsPrintAP47Open(true);
  };

  // 4-Panel Memorial Program Builder State
  const [isMemorialProgramModalOpen, setIsMemorialProgramModalOpen] = useState(false);

  // NYS EDRS & NYC eVital Assistant State
  const [isEdrsModalOpen, setIsEdrsModalOpen] = useState(false);

  // Chapel QR Easel Sign State
  const [isChapelQrModalOpen, setIsChapelQrModalOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<SimulatedNotification[]>(() => 
    loadPersistedState<SimulatedNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );
  const [isNotificationHubOpen, setIsNotificationHubOpen] = useState(false);

  // Executive Manager Suite & Cryptographic RBAC Session State
  const [managerSession, setManagerSession] = useState<SessionToken | null>(() => getActiveManagerSession());
  const [isManagerPinModalOpen, setIsManagerPinModalOpen] = useState<boolean>(false);
  const [directorProfiles, setDirectorProfiles] = useState<DirectorProfile[]>(() => {
    const loaded = loadPersistedState<DirectorProfile[]>(STORAGE_KEYS.DIRECTOR_PROFILES, INITIAL_DIRECTOR_PROFILES);
    if (!loaded || !Array.isArray(loaded) || loaded.some(d => d.name.toLowerCase().includes('carol'))) {
      return INITIAL_DIRECTOR_PROFILES;
    }
    const hasUpdatedFlags = loaded.some(d => (d.name.includes('Beth') || d.name.includes('Billy')) && d.isManager);
    if (!hasUpdatedFlags) {
      return INITIAL_DIRECTOR_PROFILES;
    }
    return loaded;
  });
  const [serviceAssignments, setServiceAssignments] = useState<ServiceDirectorAssignment[]>(() => 
    loadPersistedState<ServiceDirectorAssignment[]>(STORAGE_KEYS.SERVICE_ASSIGNMENTS, INITIAL_SERVICE_ASSIGNMENTS)
  );
  const [vouchers, setVouchers] = useState<Director1099Voucher[]>(() => 
    loadPersistedState<Director1099Voucher[]>(STORAGE_KEYS.VOUCHERS, INITIAL_1099_VOUCHERS)
  );
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedAssignmentForModal, setSelectedAssignmentForModal] = useState<ServiceDirectorAssignment | null>(null);

  // Automated Synchronization to LocalStorage on State Mutation
  useEffect(() => { savePersistedState(STORAGE_KEYS.CASES, cases); }, [cases]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.CALENDAR_EVENTS, calendarEvents); }, [calendarEvents]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.LIVERY_HOLDS, liveryHolds); }, [liveryHolds]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.SERVICE_PARTNERS, servicePartners); }, [servicePartners]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.PARTNER_REQUESTS, partnerRequests); }, [partnerRequests]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.DIRECTOR_PROFILES, directorProfiles); }, [directorProfiles]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.SERVICE_ASSIGNMENTS, serviceAssignments); }, [serviceAssignments]);
  useEffect(() => { savePersistedState(STORAGE_KEYS.VOUCHERS, vouchers); }, [vouchers]);

  // Back-Office State
  const [currentRole, setCurrentRole] = useState<UserRole>('director');
  const [backOfficeTab, setBackOfficeTab] = useState<BackOfficeTab>('dashboard');

  // Periodic Session Token Expiry & Tamper Verification Guard
  useEffect(() => {
    const checkSession = () => {
      const active = getActiveManagerSession();
      if (!active || !verifySessionToken(active, 'manager')) {
        if (managerSession) setManagerSession(null);
        if (currentRole === 'manager') {
          setCurrentRole('director');
          if (backOfficeTab === 'manager') {
            setBackOfficeTab('dashboard');
          }
        }
      }
    };
    const interval = setInterval(checkSession, 15000);
    return () => clearInterval(interval);
  }, [managerSession, currentRole, backOfficeTab]);

  const handleLockManagerSuite = () => {
    revokeManagerSession();
    setManagerSession(null);
    setCurrentRole('director');
    if (backOfficeTab === 'manager') {
      setBackOfficeTab('dashboard');
    }
    handleSendNotification({
      id: `notif-${Date.now()}`,
      caseId: activeCase.id,
      decedentName: "Benta's Operations",
      recipientName: 'Management Admin',
      recipientPhone: '(212) 281-8850',
      channel: 'sms',
      type: 'portal_update',
      title: '🔒 Executive Suite Locked',
      bodyText: 'Manager session token revoked. Suite downgraded to Licensed Funeral Director role.',
      sentAt: 'Just now',
      status: 'delivered'
    });
  };

  // Current Active Funeral Director (for director-level case filtering & claiming)
  const [currentDirectorId, setCurrentDirectorId] = useState<string>('dir-fd-1'); // Default Beth Crowe (LFD)

  // Modals
  const [isArrangerOpen, setIsArrangerOpen] = useState(false);
  const [isESignOpen, setIsESignOpen] = useState(false);
  const [targetESignDoc, setTargetESignDoc] = useState<DocumentItem | null>(null);
  const [isWoodlawnDispatchOpen, setIsWoodlawnDispatchOpen] = useState(false);
  const [selectedServiceOption, setSelectedServiceOption] = useState<string>('full_cremation');

  // DocuSign Legal eSign Suite State
  const [isDocuSignModalOpen, setIsDocuSignModalOpen] = useState(false);
  const [docuSignTargetCase, setDocuSignTargetCase] = useState<GoldenRecordCase | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAIGatewayModalOpen, setIsAIGatewayModalOpen] = useState(false);
  const [isPressModalOpen, setIsPressModalOpen] = useState(false);
  const [isWebcastHubModalOpen, setIsWebcastHubModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [stripeTargetCase, setStripeTargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenDocuSignModal = (c?: GoldenRecordCase) => {
    setDocuSignTargetCase(c || activeCase);
    setIsDocuSignModalOpen(true);
  };

  // QuickBooks Online Financial Integration State
  const [isQuickBooksModalOpen, setIsQuickBooksModalOpen] = useState(false);
  const [quickBooksTargetCase, setQuickBooksTargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenQuickBooksModal = (c?: GoldenRecordCase) => {
    setQuickBooksTargetCase(c || activeCase);
    setIsQuickBooksModalOpen(true);
  };

  // Enterprise Integrations Command Center Hub State
  const [isIntegrationsCenterOpen, setIsIntegrationsCenterOpen] = useState(false);

  // End-to-End Case Lifecycle Simulation Runner State
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  // Cash Advance Pass-Through Check Generator State
  const [isCheckPrinterModalOpen, setIsCheckPrinterModalOpen] = useState(false);
  const [checkPrinterTargetCase, setCheckPrinterTargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenCheckPrinterModal = (c?: GoldenRecordCase) => {
    setCheckPrinterTargetCase(c || activeCase);
    setIsCheckPrinterModalOpen(true);
  };

  // 1. Multi-Document Discrepancy & NYS PHL § 4201 Guardrail State
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [discrepancyTargetCase, setDiscrepancyTargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenDiscrepancyModal = (c?: GoldenRecordCase) => {
    setDiscrepancyTargetCase(c || activeCase);
    setIsDiscrepancyModalOpen(true);
  };

  // 2. Mobile Day-of-Service Director Pocket HUD State
  const [isDirectorHUDModalOpen, setIsDirectorHUDModalOpen] = useState(false);
  const [directorHUDTargetCase, setDirectorHUDTargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenDirectorHUDModal = (c?: GoldenRecordCase) => {
    setDirectorHUDTargetCase(c || activeCase);
    setIsDirectorHUDModalOpen(true);
  };

  // 3. Family Proof Approval & Commercial Press Lock State
  const [isProofApprovalModalOpen, setIsProofApprovalModalOpen] = useState(false);
  const [proofApprovalTargetCase, setProofApprovalTargetCase] = useState<GoldenRecordCase | null>(null);

  const handleOpenProofApprovalModal = (c?: GoldenRecordCase) => {
    setProofApprovalTargetCase(c || activeCase);
    setIsProofApprovalModalOpen(true);
  };

  // 4. Twilio Live SMS Gateway Config Modal State
  const [isTwilioGatewayModalOpen, setIsTwilioGatewayModalOpen] = useState(false);

  // 5. Interactive Step-by-Step Guided Tour & Spotlight Tutorial State
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState(false);
  const [guidedTourInitialTrack, setGuidedTourInitialTrack] = useState<TourTrack>('director');

  const handleOpenGuidedTour = (track: TourTrack = 'director') => {
    setGuidedTourInitialTrack(track);
    setIsGuidedTourOpen(true);
  };

  const handleLaunchToolFromTour = (modalKey: string) => {
    setIsGuidedTourOpen(false);
    switch (modalKey) {
      case 'cases':
        setViewMode('backoffice');
        setCurrentRole('director');
        setBackOfficeTab('dashboard');
        break;
      case 'first_call':
        setIsFirstCallIntakeOpen(true);
        break;
      case 'contract':
        setIsArrangerOpen(true);
        break;
      case 'edrs':
        setIsEdrsModalOpen(true);
        break;
      case 'docusign':
        handleOpenDocuSignModal(activeCase);
        break;
      case 'checks':
        handleOpenCheckPrinterModal(activeCase);
        break;
      case 'hud':
        handleOpenDirectorHUDModal(activeCase);
        break;
      case 'cloud':
        setIsCloudModalOpen(true);
        break;
      case 'obituary':
      case 'florist':
      case 'memorial':
      case 'music':
        setViewMode('backoffice');
        setCurrentRole('family');
        break;
      case 'webcast':
        setIsWebcastHubModalOpen(true);
        break;
      case 'simulator':
        setIsSimulationModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleUpdatePassThroughChecks = (caseId: string, updatedChecks: PassThroughPayableCheck[]) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const currentStatement = c.statementOfGoods;
        return {
          ...c,
          statementOfGoods: currentStatement ? {
            ...currentStatement,
            cashAdvanceChecks: updatedChecks
          } : undefined
        };
      }
      return c;
    }));
  };

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  // Case Management Handlers
  const handleUpdateCase = (updated: GoldenRecordCase) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleUpdateCasePhase = (caseId: string, newPhase: CasePhase) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          currentPhase: newPhase,
          notes: [
            {
              id: `note-${Date.now()}`,
              author: 'Phase Pipeline Controller',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `Case advanced to Phase: ${newPhase.replace('_', ' ').toUpperCase()}`
            },
            ...c.notes
          ]
        };
      }
      return c;
    }));
  };

  const handleUpdateDocumentStatus = (docId: string, newStatus: DocumentStatus) => {
    const updatedDocs = activeCase.documents.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: newStatus,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    });

    handleUpdateCase({
      ...activeCase,
      documents: updatedDocs
    });
  };

  const handleSignatureComplete = (signatureDataUrl: string, docIds: string[]) => {
    const updatedDocs = activeCase.documents.map(doc => {
      if (docIds.includes(doc.id)) {
        return {
          ...doc,
          status: 'signed' as DocumentStatus,
          signedTimestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
          signatureDataUrl: signatureDataUrl
        };
      }
      return doc;
    });

    handleUpdateCase({
      ...activeCase,
      currentPhase: 'permits_logistics',
      documents: updatedDocs,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Legal eSign Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Legal bundle e-signed by ${activeCase.informant.fullName}. Advanced to Phase 4 (Permits & Logistics).`
        },
        ...activeCase.notes
      ]
    });

    setIsESignOpen(false);
    setTargetESignDoc(null);
  };

  const handleAddCalendarEvent = (newEvent: RoomScheduleEvent) => {
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const handleSendNotification = (newNotif: SimulatedNotification) => {
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleAddLiveryHold = (newHold: VehicleHoldRequest) => {
    setLiveryHolds(prev => [newHold, ...prev]);
    const associatedCase = cases.find(c => c.id === newHold.caseId);
    if (associatedCase) {
      handleUpdateCase({
        ...associatedCase,
        liveryHolds: [newHold, ...(associatedCase.liveryHolds || [])],
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'Livery Dispatch Engine',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Vehicle hold SMS dispatched: ${newHold.quantity}x ${newHold.vehicleSize} (${newHold.vehicleType}) with ${newHold.vendorName}. 48-Hour routing notice acknowledged.`
          },
          ...associatedCase.notes
        ]
      });
    }
  };

  const handleUpdateLiveryHold = (updatedHold: VehicleHoldRequest) => {
    setLiveryHolds(prev => prev.map(h => h.id === updatedHold.id ? updatedHold : h));
  };

  const handleWoodlawnDispatchConfirmed = () => {
    handleUpdateDocumentStatus('doc-11', 'completed');
    setIsWoodlawnDispatchOpen(false);
  };

  const handleSaveWebcast = (updatedWebcast: any) => {
    const caseToUpdate = webcastTargetCase || activeCase;
    handleUpdateCase({
      ...caseToUpdate,
      webcastSchedule: updatedWebcast,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: '4K Broadcast Controller',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Webcast schedule configured for ${updatedWebcast.venueName} on ${updatedWebcast.broadcastDate}. PIN: ${updatedWebcast.securityPin}.`
        },
        ...caseToUpdate.notes
      ]
    });
    setIsWebcastModalOpen(false);
    setWebcastTargetCase(null);
  };

  // First Call Removal & Custody Affidavit Handlers
  const handleSaveRemoval = (caseId: string, updatedRemoval: RemovalScheduleInfo) => {
    const caseToUpdate = cases.find(c => c.id === caseId) || removalTargetCase || activeCase;
    const isCompleted = updatedRemoval.status === 'safe_arrival_completed';

    const updatedDocs = caseToUpdate.documents.map(d => {
      if (d.id === 'doc-2' && isCompleted) {
        return {
          ...d,
          status: 'completed' as DocumentStatus,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return d;
    });

    handleUpdateCase({
      ...caseToUpdate,
      removalSchedule: updatedRemoval,
      safeArrivalStatus: isCompleted ? 'safe_arrival_confirmed' : caseToUpdate.safeArrivalStatus,
      currentPhase: (isCompleted && caseToUpdate.currentPhase === 'intake_removal') ? 'arrangements' : caseToUpdate.currentPhase,
      documents: updatedDocs,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'First Call Removal Logistics Hub',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Removal schedule updated for ${updatedRemoval.facilityName}. Director: ${updatedRemoval.assignedDirector} (${updatedRemoval.directorLicenseNumber}). Status: ${updatedRemoval.status.toUpperCase()}.${isCompleted ? ' Safe arrival logged at 630 St Nicholas Ave. Case advanced.' : ''}`
        },
        ...caseToUpdate.notes
      ]
    });
  };

  // Arrangement Conference & AP-47 Contract Handlers
  const handleSaveContract = (caseId: string, updatedStatement: StatementOfGoodsData) => {
    const caseToUpdate = cases.find(c => c.id === caseId) || activeCase;
    const isSigned = updatedStatement.sectionIV.custodyAuthorization.authorized;

    const updatedDocs = caseToUpdate.documents.map(d => {
      if (d.id === 'doc-goods' || d.formType === 'statement_goods_services') {
        return {
          ...d,
          status: (isSigned ? 'signed' : 'generated') as DocumentStatus,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return d;
    });

    handleUpdateCase({
      ...caseToUpdate,
      statementOfGoods: updatedStatement,
      totalAmountDue: updatedStatement.sectionIII.totalFuneralCharges,
      currentPhase: caseToUpdate.currentPhase === 'intake_removal' ? 'arrangements' : caseToUpdate.currentPhase,
      documents: updatedDocs,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Director Arrangement Conference',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Form AP-47 Statement of Goods & Services saved and synchronized. Total Estimated Charges: $${updatedStatement.sectionIII.totalFuneralCharges.toFixed(2)} (Section I: $${updatedStatement.sectionIII.funeralHomeChargesTotal.toFixed(2)}, Section II Cash Advances: $${updatedStatement.sectionIII.cashAdvancesTotal.toFixed(2)}).`
        },
        ...caseToUpdate.notes
      ]
    });
  };

  // In-Person Family Arrangement Conference Handlers
  const handleSaveAppointment = (caseId: string, updatedAppt: ArrangementAppointmentInfo) => {
    const caseToUpdate = cases.find(c => c.id === caseId) || appointmentTargetCase || activeCase;
    
    // If confirmed, update / inject RoomScheduleEvent in calendar
    if (updatedAppt.status === 'confirmed' && updatedAppt.confirmedSlot) {
      const roomId: RoomId = updatedAppt.locationVenue.toLowerCase().includes('suite b') 
        ? 'family_suite_2' 
        : updatedAppt.locationVenue.toLowerCase().includes('boardroom')
        ? 'repast_room'
        : 'family_suite_1';
        
      const newEvent: RoomScheduleEvent = {
        id: `evt-conf-${Date.now()}`,
        roomId: roomId,
        caseId: caseToUpdate.id,
        caseNumber: caseToUpdate.caseNumber,
        decedentName: caseToUpdate.decedent.legalName,
        title: `Arrangement Conference — ${caseToUpdate.decedent.legalName} (${updatedAppt.assignedDirectorName})`,
        date: updatedAppt.confirmedSlot.date,
        startTime: updatedAppt.confirmedSlot.time,
        endTime: '12:00 PM',
        serviceType: 'Arrangement Conference',
        assignedDirector: updatedAppt.assignedDirectorName,
        estimatedGuests: updatedAppt.attendingFamilyCount,
        status: 'confirmed',
        notes: `Family Conference (${updatedAppt.attendingFamilyCount} attendees). Informant: ${caseToUpdate.informant.fullName} (${caseToUpdate.informant.phone})`
      };

      setCalendarEvents(prev => [newEvent, ...prev.filter(e => e.caseId !== caseToUpdate.id || e.serviceType !== 'Arrangement Conference')]);
    }

    handleUpdateCase({
      ...caseToUpdate,
      arrangementAppointment: updatedAppt,
      currentPhase: (updatedAppt.status === 'confirmed' && caseToUpdate.currentPhase === 'intake_removal') ? 'arrangements' : caseToUpdate.currentPhase,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Arrangement Scheduling Hub',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `In-Person Arrangement Conference status: ${updatedAppt.status.toUpperCase()}. Director: ${updatedAppt.assignedDirectorName}. Venue: ${updatedAppt.locationVenue}.${updatedAppt.confirmedSlot ? ` Scheduled: ${updatedAppt.confirmedSlot.date} at ${updatedAppt.confirmedSlot.time}` : ''}`
        },
        ...caseToUpdate.notes
      ]
    });
  };

  // First Call Intake Case Generator & Bi-Directional Router
  const handleCreateCaseFromIntake = (
    formData: FirstCallIntakeFormData,
    nextAction: 'open_removal' | 'open_appointment' | 'save_only'
  ) => {
    const newCase = createCaseFromFirstCall(formData, cases.length);
    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setIsFirstCallIntakeOpen(false);

    handleSendNotification({
      id: `notif-intake-${Date.now()}`,
      caseId: newCase.id,
      decedentName: newCase.decedent.legalName,
      recipientName: newCase.assignedDirector,
      recipientPhone: '(212) 281-8850',
      channel: 'sms',
      type: 'service_schedule',
      title: `NEW FIRST CALL INTAKE: ${newCase.decedent.legalName} (${newCase.caseNumber})`,
      bodyText: `Intake logged by ${formData.callerName} (${formData.callerPhone}). Pickup: ${formData.facilityName}. Pathway: ${formData.intakePathway.toUpperCase()}. Assigned Lead: ${newCase.assignedDirector}.`,
      sentAt: 'Just now',
      status: 'delivered'
    });

    if (nextAction === 'open_removal') {
      setRemovalTargetCase(newCase);
      setIsRemovalModalOpen(true);
    } else if (nextAction === 'open_appointment') {
      setAppointmentTargetCase(newCase);
      setIsAppointmentModalOpen(true);
    } else {
      setBackOfficeTab('golden_record');
    }
  };

  // Service Partner Network Handlers
  const handleAddServicePartner = (newPartner: ServicePartnerContact) => {
    setServicePartners(prev => [newPartner, ...prev]);
  };

  const handleImportServicePartners = (newPartners: ServicePartnerContact[]) => {
    setServicePartners(prev => [...newPartners, ...prev]);
  };

  const handleAddPartnerRequest = (newReq: PartnerScheduleRequest) => {
    setPartnerRequests(prev => [newReq, ...prev]);
    const associatedCase = cases.find(c => c.id === newReq.caseId);
    if (associatedCase) {
      handleUpdateCase({
        ...associatedCase,
        partnerRequests: [newReq, ...(associatedCase.partnerRequests || [])],
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'Service Partner Dispatch Engine',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `SMS booking request dispatched to ${newReq.partnerName} (${newReq.roleTitle}) for ${newReq.serviceDate} at ${newReq.callTime}. Recurring reminder cycle activated.`
          },
          ...associatedCase.notes
        ]
      });
    }
  };

  const handleUpdatePartnerRequest = (updatedReq: PartnerScheduleRequest) => {
    setPartnerRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
    const associatedCase = cases.find(c => c.id === updatedReq.caseId);
    if (associatedCase && (updatedReq.status === 'confirmed' || updatedReq.status === 'declined')) {
      handleUpdateCase({
        ...associatedCase,
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'Two-Way Partner SMS Bridge',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Vendor ${updatedReq.partnerName} (${updatedReq.roleTitle}) marked status: ${updatedReq.status.toUpperCase()}${updatedReq.adjustedArrivalTime ? ` (Adjusted arrival time: ${updatedReq.adjustedArrivalTime})` : ''}`
          },
          ...associatedCase.notes
        ]
      });
    }
  };

  const handleSimulatePartnerReminder = (requestId: string) => {
    setPartnerRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const nextCount = r.remindersCount + 1;
        const nextStatus = nextCount === 1 ? 'reminder_1_sent' : 'reminder_2_sent';
        const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          ...r,
          status: nextStatus,
          remindersCount: nextCount,
          lastReminderAt: `Today ${nowFormatted}`
        };
      }
      return r;
    }));
  };

  const handleSimulatePartnerConfirm = (requestId: string) => {
    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();
    setPartnerRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const confirmed: PartnerScheduleRequest = {
          ...r,
          status: 'confirmed',
          confirmedAt: nowFormatted
        };

        const associatedCase = cases.find(c => c.id === r.caseId);
        if (associatedCase) {
          handleUpdateCase({
            ...associatedCase,
            notes: [
              {
                id: `note-${Date.now()}`,
                author: 'Carrier SMS Webhook',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `SMS "YES" Confirmation received from ${r.partnerName} (${r.roleTitle}) for ${r.serviceDate}. Locked on schedule.`
              },
              ...associatedCase.notes
            ]
          });
        }

        return confirmed;
      }
      return r;
    }));
  };

  // Case Claiming Handler (Each funeral director claims case before arrangements and after appointment made)
  const handleClaimCase = (caseId: string) => {
    const director = directorProfiles.find(d => d.id === currentDirectorId) || directorProfiles[2];
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          caseClaimStatus: 'claimed' as const,
          assignedDirectorId: director.id,
          assignedDirector: `${director.name} (${director.licenseNumber || 'LFD'})`,
          notes: [
            {
              id: `note-${Date.now()}`,
              author: 'Case Claiming Engine',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `Case officially claimed by Licensed Funeral Director ${director.name} (${director.licenseNumber || 'LFD'}) prior to family arrangement conference.`
            },
            ...c.notes
          ]
        };
      }
      return c;
    }));

    handleSendNotification({
      id: `notif-${Date.now()}`,
      caseId: caseId,
      decedentName: activeCase?.decedent?.legalName || 'Active Case',
      recipientName: director.name,
      recipientPhone: director.phone,
      channel: 'sms',
      type: 'portal_update',
      title: '🎯 Case Claimed Successfully',
      bodyText: `You have claimed responsibility for Case ${caseId}. Proceed with family arrangement conference and Form AP-47.`,
      sentAt: 'Just now',
      status: 'delivered'
    });
  };

  // Manager Override Handler (Managers can reassign cases & staff to tasks)
  const handleOverrideDirector = (caseId: string, newDirectorId: string) => {
    const targetDir = directorProfiles.find(d => d.id === newDirectorId);
    if (!targetDir) return;

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          caseClaimStatus: 'claimed' as const,
          assignedDirectorId: targetDir.id,
          assignedDirector: `${targetDir.name} (${targetDir.licenseNumber || 'LFD'})`,
          notes: [
            {
              id: `note-${Date.now()}`,
              author: 'Executive Manager Override',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `Managerial staff reassignment: Case director overridden to ${targetDir.name} (${targetDir.licenseNumber || 'LFD'}).`
            },
            ...c.notes
          ]
        };
      }
      return c;
    }));

    handleSendNotification({
      id: `notif-${Date.now()}`,
      caseId: caseId,
      decedentName: "Manager Roster Control",
      recipientName: targetDir.name,
      recipientPhone: targetDir.phone,
      channel: 'sms',
      type: 'partner_dispatch',
      title: '👔 Case Responsibility Reassigned',
      bodyText: `Executive Management has assigned you as lead director for Case ${caseId}.`,
      sentAt: 'Just now',
      status: 'delivered'
    });
  };

  // DocuSign Save Handler
  const handleSaveDocuSign = (caseId: string, envelopeData: any) => {
    const caseToUpdate = cases.find(c => c.id === caseId) || docuSignTargetCase || activeCase;
    const isSigned = envelopeData.status === 'completed';

    const updatedDocs = caseToUpdate.documents.map(d => {
      if (envelopeData.documentIds?.includes(d.id) && isSigned) {
        return {
          ...d,
          status: 'signed' as DocumentStatus,
          signedTimestamp: envelopeData.signedAt || new Date().toLocaleString(),
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return d;
    });

    handleUpdateCase({
      ...caseToUpdate,
      docusignEnvelope: envelopeData,
      currentPhase: isSigned && caseToUpdate.currentPhase === 'legal_bundle' ? 'permits_logistics' : caseToUpdate.currentPhase,
      documents: updatedDocs,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'DocuSign NYS ESRA Bridge',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `DocuSign envelope [${envelopeData.envelopeId}] status updated to: ${envelopeData.status.toUpperCase()}. Signer: ${envelopeData.recipientEmail}. Verification: ${envelopeData.idVerificationMethod}.`
        },
        ...caseToUpdate.notes
      ]
    });
  };

  // QuickBooks Sync Save Handler
  const handleSaveQuickBooksSync = (caseId: string, syncData: any) => {
    const caseToUpdate = cases.find(c => c.id === caseId) || quickBooksTargetCase || activeCase;
    handleUpdateCase({
      ...caseToUpdate,
      quickbooksSync: syncData,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'QuickBooks Online Sync Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `QuickBooks Online sync complete! Customer Invoice #${syncData.invoiceNumber} ($${syncData.syncedAmount?.toFixed(2) || caseToUpdate.totalAmountDue.toFixed(2)}) created. ACH Bank match active.`
        },
        ...caseToUpdate.notes
      ]
    });
  };

  const handleCaseCreatedFromArranger = (newCase: GoldenRecordCase) => {
    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setIsArrangerOpen(false);
    setViewMode('backoffice');
    setBackOfficeTab('golden_record');
  };

  const handleSelectServiceFromPublic = (serviceType: string) => {
    setSelectedServiceOption(serviceType);
    setIsArrangerOpen(true);
  };

  const handleNavigatePublic = (section: string) => {
    setActivePublicSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthenticateFamily = (targetCase: GoldenRecordCase) => {
    setActiveCaseId(targetCase.id);
    setIsStaffUser(false);
    setCurrentRole('family');
    setViewMode('backoffice');
  };

  // If in Back-Office / Authenticated View
  if (viewMode === 'backoffice') {
    // If role switched to Family, render the authentic Family Portal with 9-Part Obituary Studio
    if (currentRole === 'family') {
      return (
        <>
          <FamilyPortalView
            activeCase={activeCase}
            cases={cases}
            onSelectCase={(c) => setActiveCaseId(c.id)}
            onUpdateCase={handleUpdateCase}
            onOpenESignModal={(doc) => {
              setTargetESignDoc(doc || null);
              setIsESignOpen(true);
            }}
            onSendNotification={handleSendNotification}
            onOpenFamilyProofApproval={() => handleOpenProofApprovalModal(activeCase)}
            onOpenGuidedTour={() => handleOpenGuidedTour('family')}
            onExitPortal={() => {
              if (isStaffUser) {
                setCurrentRole('director');
              } else {
                setViewMode('public');
                setCurrentRole('director');
                setIsStaffUser(true);
              }
            }}
            isStaffUser={isStaffUser}
          />

          {/* Interactive Guided Tour & Spotlight Tutorial Modal */}
          <InteractiveGuidedTourModal
            isOpen={isGuidedTourOpen}
            onClose={() => setIsGuidedTourOpen(false)}
            activeCase={activeCase}
            initialTrack={guidedTourInitialTrack}
            onLaunchToolModal={handleLaunchToolFromTour}
          />
        </>
      );
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col font-sans">
        <BackOfficeLayout
          currentRole={currentRole}
          onChangeRole={(role) => {
            if (role === 'manager') {
              const active = getActiveManagerSession();
              if (!active || !verifySessionToken(active, 'manager')) {
                setIsManagerPinModalOpen(true);
                return;
              }
              setManagerSession(active);
              setCurrentRole('manager');
              setBackOfficeTab('manager');
              return;
            }
            if (role === 'family') {
              setIsStaffUser(true);
            }
            setCurrentRole(role);
          }}
          onLockManagerSuite={handleLockManagerSuite}
          activeCase={activeCase}
          cases={cases}
          onSelectCase={(c) => setActiveCaseId(c.id)}
          activeTab={backOfficeTab}
          onChangeTab={(tab) => {
            if (tab === 'manager') {
              const active = getActiveManagerSession();
              if (!active || !verifySessionToken(active, 'manager')) {
                setIsManagerPinModalOpen(true);
                return;
              }
              setManagerSession(active);
            }
            setBackOfficeTab(tab);
          }}
          onExitBackOffice={() => setViewMode('public')}
          onOpenNewCase={() => setIsArrangerOpen(true)}
          onOpenFirstCallIntake={() => setIsFirstCallIntakeOpen(true)}
          onOpenNotifications={() => setIsNotificationHubOpen(true)}
          notificationCount={notifications.length}
          onOpenLiveryModal={() => setIsLiveryModalOpen(true)}
          onOpenESignModal={() => setIsESignOpen(true)}
          onOpenWoodlawnModal={() => setIsWoodlawnDispatchOpen(true)}
          onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
          onOpenRemovalModal={() => {
            setRemovalTargetCase(activeCase);
            setIsRemovalModalOpen(true);
          }}
          onOpenContractModal={() => {
            setContractTargetCase(activeCase);
            setIsContractModalOpen(true);
          }}
          onOpenPrintAP47={() => handleOpenPrintAP47Modal(activeCase)}
          onOpenDiscrepancyGuardrail={() => handleOpenDiscrepancyModal(activeCase)}
          onOpenDirectorDayOfServiceHUD={() => handleOpenDirectorHUDModal(activeCase)}
          onOpenFamilyProofApproval={() => handleOpenProofApprovalModal(activeCase)}
          onAdvancePhase={handleUpdateCasePhase}
          onOpenTwoWaySmsModal={handleOpenTwoWaySmsModal}
          onOpenDocuSignModal={() => handleOpenDocuSignModal(activeCase)}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
          onOpenAIModal={() => setIsAIGatewayModalOpen(true)}
          onOpenPressModal={() => setIsPressModalOpen(true)}
          onOpenWebcastModal={() => setIsWebcastHubModalOpen(true)}
          onOpenStripeModal={() => setIsStripeModalOpen(true)}
          onOpenQuickBooksModal={() => handleOpenQuickBooksModal(activeCase)}
          onOpenQuickBooks={() => handleOpenQuickBooksModal(activeCase)}
          onOpenCheckPrinter={() => handleOpenCheckPrinterModal(activeCase)}
          onOpenTwilioGatewayModal={() => setIsTwilioGatewayModalOpen(true)}
          onOpenIntegrationsCenter={() => setIsIntegrationsCenterOpen(true)}
          onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
          onOpenGuidedTour={() => handleOpenGuidedTour('director')}
          currentDirectorId={currentDirectorId}
          onChangeDirectorId={setCurrentDirectorId}
          directorProfiles={directorProfiles}
          partnerRequests={partnerRequests}
        />

        <main className="flex-1 overflow-y-auto">
          {backOfficeTab === 'dashboard' && (
            <DirectorActiveCasesDashboard
              cases={cases}
              activeCase={activeCase}
              onSelectCase={(c) => setActiveCaseId(c.id)}
              onOpenGoldenRecord={(caseId) => {
                if (caseId) setActiveCaseId(caseId);
                setBackOfficeTab('golden_record');
              }}
              onOpenESignModal={(doc) => {
                setTargetESignDoc(doc || null);
                setIsESignOpen(true);
              }}
              onOpenLiveryModal={() => setIsLiveryModalOpen(true)}
              onOpenWoodlawnModal={() => setIsWoodlawnDispatchOpen(true)}
              onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
              onOpenTwoWaySmsModal={handleOpenTwoWaySmsModal}
              onOpenRemovalModal={(targetCase) => {
                setRemovalTargetCase(targetCase);
                setIsRemovalModalOpen(true);
              }}
              onOpenContractModal={(targetCase) => {
                setContractTargetCase(targetCase);
                setIsContractModalOpen(true);
              }}
              onOpenPrintAP47={(targetCase) => handleOpenPrintAP47Modal(targetCase)}
              onOpenAppointmentModal={(targetCase) => handleOpenAppointmentModal(targetCase)}
              onOpenWebcastModal={(targetCase) => {
                setWebcastTargetCase(targetCase);
                setIsWebcastHubModalOpen(true);
              }}
              onOpenNewCase={() => setIsArrangerOpen(true)}
              onOpenFirstCallIntake={() => setIsFirstCallIntakeOpen(true)}
              onOpenFamilyPortal={(caseId) => {
                if (caseId) setActiveCaseId(caseId);
                setCurrentRole('family');
              }}
              onUpdateCasePhase={handleUpdateCasePhase}
              onSendNotification={handleSendNotification}
              currentRole={currentRole}
              currentDirectorId={currentDirectorId}
              onChangeDirectorId={setCurrentDirectorId}
              directorProfiles={directorProfiles}
              onClaimCase={handleClaimCase}
              onOverrideDirector={handleOverrideDirector}
              onOpenDocuSignModal={(targetCase) => handleOpenDocuSignModal(targetCase)}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
              onOpenAIModal={() => setIsAIGatewayModalOpen(true)}
              onOpenPressModal={() => setIsPressModalOpen(true)}
              onOpenStripeModal={(targetCase) => {
                setStripeTargetCase(targetCase);
                setIsStripeModalOpen(true);
              }}
              onOpenQuickBooksModal={(targetCase) => handleOpenQuickBooksModal(targetCase)}
              onOpenDiscrepancyGuardrail={(targetCase) => handleOpenDiscrepancyModal(targetCase)}
              onOpenDirectorDayOfServiceHUD={(targetCase) => handleOpenDirectorHUDModal(targetCase)}
              onOpenFamilyProofApproval={(targetCase) => handleOpenProofApprovalModal(targetCase)}
              partnerRequests={partnerRequests}
            />
          )}

          {backOfficeTab === 'pipeline' && (
            <CasePipelineView
              cases={cases}
              activeCase={activeCase}
              onSelectCase={(c) => setActiveCaseId(c.id)}
              onUpdateCasePhase={handleUpdateCasePhase}
              onOpenGoldenRecord={() => setBackOfficeTab('golden_record')}
              onOpenContractModal={(targetCase) => {
                setContractTargetCase(targetCase);
                setIsContractModalOpen(true);
              }}
              onOpenPrintAP47={(targetCase) => handleOpenPrintAP47Modal(targetCase)}
              currentRole={currentRole}
            />
          )}

          {backOfficeTab === 'golden_record' && (
            <GoldenRecordDetail
              caseData={activeCase}
              currentRole={currentRole}
              onUpdateCase={handleUpdateCase}
              onOpenESign={() => setIsESignOpen(true)}
              onOpenWoodlawnDispatch={() => setIsWoodlawnDispatchOpen(true)}
              onOpenDocuments={() => setBackOfficeTab('documents')}
              onOpenRemovalModal={() => {
                setRemovalTargetCase(activeCase);
                setIsRemovalModalOpen(true);
              }}
              onOpenContractModal={() => {
                setContractTargetCase(activeCase);
                setIsContractModalOpen(true);
              }}
              onOpenPrintAP47={() => handleOpenPrintAP47Modal(activeCase)}
              onOpenAppointmentModal={() => handleOpenAppointmentModal(activeCase)}
              onOpenDiscrepancyGuardrail={() => handleOpenDiscrepancyModal(activeCase)}
              onOpenDirectorDayOfServiceHUD={() => handleOpenDirectorHUDModal(activeCase)}
              onOpenFamilyProofApproval={() => handleOpenProofApprovalModal(activeCase)}
              onSendNotification={handleSendNotification}
              onOpenNotifications={() => setIsNotificationHubOpen(true)}
              onOpenFamilyPortal={() => setCurrentRole('family')}
              onOpenMemorialProgramModal={() => setIsMemorialProgramModalOpen(true)}
              onOpenEdrsRapidFillModal={() => setIsEdrsModalOpen(true)}
              onOpenChapelQrModal={() => setIsChapelQrModalOpen(true)}
              onAdvancePhase={handleUpdateCasePhase}
              onOpenTwoWaySmsModal={handleOpenTwoWaySmsModal}
              onOpenCalendar={() => setBackOfficeTab('calendar')}
              onOpenLiveryModal={() => setIsLiveryModalOpen(true)}
              onOpenFinances={() => setBackOfficeTab('finances')}
              onOpenAftercare={() => setBackOfficeTab('aftercare')}
              onOpenCheckPrinter={() => handleOpenCheckPrinterModal(activeCase)}
              partnerRequests={partnerRequests}
            />
          )}

          {backOfficeTab === 'calendar' && (
            <FacilityCalendarView
              cases={cases}
              events={calendarEvents}
              directorProfiles={directorProfiles}
              onAddEvent={handleAddCalendarEvent}
              onSelectCase={(c) => {
                setActiveCaseId(c.id);
                setBackOfficeTab('golden_record');
              }}
              onOpenGoldenRecord={() => setBackOfficeTab('golden_record')}
            />
          )}

          {backOfficeTab === 'manager' && (
            <ManagerDirectorSchedulingView
              cases={cases}
              directorProfiles={directorProfiles}
              serviceAssignments={serviceAssignments}
              vouchers={vouchers}
              onOpenAssignModal={(assignment) => {
                setSelectedAssignmentForModal(assignment);
                setIsAssignModalOpen(true);
              }}
              onApproveVoucher={(voucherId) => {
                setVouchers(prev => prev.map(v => {
                  if (v.id === voucherId) {
                    return {
                      ...v,
                      status: 'approved_for_payment',
                      approvedBy: 'Jason Benta (Managing LFD)',
                      approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                  }
                  return v;
                }));
                handleSendNotification({
                  id: `notif-${Date.now()}`,
                  caseId: activeCase.id,
                  decedentName: "Trade Guild Payroll",
                  recipientName: 'Finance / Accounting',
                  recipientPhone: '(212) 281-8850',
                  channel: 'sms',
                  type: 'portal_update',
                  title: '💰 Trade Director Voucher Approved',
                  bodyText: `Voucher #${voucherId} approved for ACH payout by Managing Director.`,
                  sentAt: 'Just now',
                  status: 'delivered'
                });
              }}
              onUpdateDirectorHours={(directorId, additionalHours) => {
                setDirectorProfiles(prev => prev.map(d => {
                  if (d.id === directorId) {
                    return {
                      ...d,
                      weeklyHoursLogged: (d.weeklyHoursLogged || 0) + additionalHours
                    };
                  }
                  return d;
                }));
              }}
            />
          )}

          {backOfficeTab === 'reports' && (
            <ExecutiveReportsAnalytics
              cases={cases}
            />
          )}

          {backOfficeTab === 'documents' && (
            <DocumentJourneyMatrix
              caseData={activeCase}
              onUpdateDocumentStatus={handleUpdateDocumentStatus}
              onUpdateCase={handleUpdateCase}
              onOpenESign={(doc) => {
                setTargetESignDoc(doc || null);
                setIsESignOpen(true);
              }}
            />
          )}

          {backOfficeTab === 'dispatch' && (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#991b1b] flex items-center justify-center mx-auto border border-red-200">
                  <span className="font-serif-title font-bold text-lg">BFH</span>
                </div>
                <h2 className="font-serif-title text-2xl font-bold text-neutral-900">
                  Woodlawn & Logistics Dispatch Engine
                </h2>
                <p className="text-xs text-neutral-600 max-w-xl mx-auto font-light">
                  Transmit verified dispatch packets, certified NYC EDRS permits, and signed crematory authorization bundles directly to Woodlawn Crematory and service officiants.
                </p>
                <button
                  onClick={() => setIsWoodlawnDispatchOpen(true)}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-3 rounded-lg transition shadow-md shadow-red-950/20 border border-amber-300/40"
                >
                  Open Woodlawn Dispatch Console
                </button>
              </div>
            </div>
          )}

          {backOfficeTab === 'partners' && (
            <ServicePartnerNetworkManager
              partners={servicePartners}
              requests={partnerRequests}
              cases={cases}
              activeCase={activeCase}
              onAddPartner={handleAddServicePartner}
              onImportPartners={handleImportServicePartners}
              onAddRequest={handleAddPartnerRequest}
              onUpdateRequest={handleUpdatePartnerRequest}
              onSimulateReminder={handleSimulatePartnerReminder}
              onSimulateConfirm={handleSimulatePartnerConfirm}
              onOpenTwoWaySmsModal={handleOpenTwoWaySmsModal}
            />
          )}

          {backOfficeTab === 'finances' && (
            <FinancialVerificationCenter
              caseData={activeCase}
              onUpdateBilling={(updatedBilling) => {
                handleUpdateCase({
                  ...activeCase,
                  splitBilling: updatedBilling
                });
              }}
              onOpenQuickBooks={(targetCase) => handleOpenQuickBooksModal(targetCase)}
              onOpenCheckPrinter={(targetCase) => handleOpenCheckPrinterModal(targetCase)}
              onOpenStripeModal={() => setIsStripeModalOpen(true)}
            />
          )}

          {backOfficeTab === 'aftercare' && (
            <AftercareCRMNurture
              caseData={activeCase}
              onUpdateAftercare={(updatedAftercare) => {
                handleUpdateCase({
                  ...activeCase,
                  aftercare: updatedAftercare
                });
              }}
            />
          )}
        </main>

        {/* Service Partner SMS Schedule Modal */}
        {isPartnerModalOpen && (
          <PartnerScheduleModal
            isOpen={isPartnerModalOpen}
            onClose={() => setIsPartnerModalOpen(false)}
            activeCase={activeCase}
            partners={servicePartners}
            onAddRequest={handleAddPartnerRequest}
          />
        )}

        {/* Live Family SMS & Notification Simulator Modal */}
        {isNotificationHubOpen && (
          <LiveNotificationSimulatorModal
            cases={cases}
            activeCase={activeCase}
            notifications={notifications}
            onClose={() => setIsNotificationHubOpen(false)}
            onSendNotification={handleSendNotification}
            onSelectCase={(c) => setActiveCaseId(c.id)}
            onOpenTwilioGateway={() => setIsTwilioGatewayModalOpen(true)}
          />
        )}

        {/* Livery Vehicle Hold SMS Dispatch Modal */}
        {isLiveryModalOpen && (
          <LiveryVehicleDispatchModal
            cases={cases}
            activeCase={activeCase}
            liveryHolds={liveryHolds}
            onClose={() => setIsLiveryModalOpen(false)}
            onAddHold={handleAddLiveryHold}
            onUpdateHold={handleUpdateLiveryHold}
            onSendNotification={handleSendNotification}
          />
        )}

        {/* E-Sign Modal */}
        {isESignOpen && (
          <CanvasESignModal
            caseData={activeCase}
            targetDoc={targetESignDoc}
            onClose={() => {
              setIsESignOpen(false);
              setTargetESignDoc(null);
            }}
            onSignatureComplete={handleSignatureComplete}
          />
        )}

        {/* Woodlawn Dispatch Modal */}
        {isWoodlawnDispatchOpen && (
          <WoodlawnDispatchModal
            caseData={activeCase}
            onClose={() => setIsWoodlawnDispatchOpen(false)}
            onDispatchConfirmed={handleWoodlawnDispatchConfirmed}
          />
        )}

        {/* 4K Webcast Scheduling Modal */}
        {isWebcastModalOpen && (
          <WebcastSchedulingModal
            isOpen={isWebcastModalOpen}
            onClose={() => {
              setIsWebcastModalOpen(false);
              setWebcastTargetCase(null);
            }}
            activeCase={webcastTargetCase || activeCase}
            cases={cases}
            partners={servicePartners}
            onSaveWebcast={handleSaveWebcast}
            onDispatchSMS={(recipient, msg) => {
              const c = webcastTargetCase || activeCase;
              handleSendNotification({
                id: `notif-${Date.now()}`,
                caseId: c.id,
                decedentName: c.decedent.legalName,
                recipientName: recipient,
                recipientPhone: '(212) 555-0198',
                channel: 'sms',
                type: 'webcast_invite',
                title: 'Webcast SMS Notification Dispatched',
                bodyText: `Message sent to ${recipient}: ${msg}`,
                sentAt: 'Just now',
                status: 'delivered'
              });
            }}
          />
        )}

        {/* Universal First Call & Intake Studio Modal */}
        {isFirstCallIntakeOpen && (
          <FirstCallIntakeModal
            isOpen={isFirstCallIntakeOpen}
            onClose={() => setIsFirstCallIntakeOpen(false)}
            onSubmitIntake={handleCreateCaseFromIntake}
            directorProfiles={directorProfiles}
            currentDirectorId={currentDirectorId}
          />
        )}

        {/* First Call Removal & Legal Custody Affidavit Modal */}
        {isRemovalModalOpen && (
          <RemovalSchedulingModal
            isOpen={isRemovalModalOpen}
            onClose={() => {
              setIsRemovalModalOpen(false);
              setRemovalTargetCase(null);
            }}
            activeCase={removalTargetCase || activeCase}
            cases={cases}
            onSaveRemoval={handleSaveRemoval}
            onSendNotification={handleSendNotification}
            onOpenAppointmentModal={(c) => {
              setIsRemovalModalOpen(false);
              setAppointmentTargetCase(c || removalTargetCase || activeCase);
              setIsAppointmentModalOpen(true);
            }}
            onOpenContractModal={(c) => {
              setIsRemovalModalOpen(false);
              setContractTargetCase(c || removalTargetCase || activeCase);
              setIsContractModalOpen(true);
            }}
          />
        )}

        {/* Arrangement Conference & AP-47 Contract Studio Modal */}
        {isContractModalOpen && (
          <ArrangementContractBuilderModal
            isOpen={isContractModalOpen}
            onClose={() => {
              setIsContractModalOpen(false);
              setContractTargetCase(null);
            }}
            caseData={contractTargetCase || activeCase}
            onSaveContract={handleSaveContract}
            onSendNotification={handleSendNotification}
          />
        )}

        {/* In-Person Family Arrangement Conference Scheduling Studio Modal */}
        {isAppointmentModalOpen && (
          <ArrangementAppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={() => {
              setIsAppointmentModalOpen(false);
              setAppointmentTargetCase(null);
            }}
            activeCase={appointmentTargetCase || activeCase}
            cases={cases}
            onSaveAppointment={handleSaveAppointment}
            onSendNotification={handleSendNotification}
            onOpenCalendar={() => setBackOfficeTab('calendar')}
            onOpenContractModal={() => {
              setIsAppointmentModalOpen(false);
              setContractTargetCase(appointmentTargetCase || activeCase);
              setIsContractModalOpen(true);
            }}
            onOpenRemovalModal={(c) => {
              setIsAppointmentModalOpen(false);
              setRemovalTargetCase(c || appointmentTargetCase || activeCase);
              setIsRemovalModalOpen(true);
            }}
          />
        )}

        {/* 4-Panel Memorial Service Bulletin Studio Modal */}
        {isMemorialProgramModalOpen && (
          <MemorialProgramBuilderModal
            isOpen={isMemorialProgramModalOpen}
            onClose={() => setIsMemorialProgramModalOpen(false)}
            caseData={activeCase}
            onOpenFamilyProofApproval={() => handleOpenProofApprovalModal(activeCase)}
          />
        )}

        {/* NYS EDRS & NYC eVital Death Registration Assistant Modal */}
        {isEdrsModalOpen && (
          <EdrsRapidFillModal
            isOpen={isEdrsModalOpen}
            onClose={() => setIsEdrsModalOpen(false)}
            caseData={activeCase}
            activeCase={activeCase}
            cases={cases}
            onSendNotification={handleSendNotification}
          />
        )}

        {/* Chapel Welcome & Digi-Tribute QR Easel Sign Modal */}
        {isChapelQrModalOpen && (
          <ChapelQrSignModal
            isOpen={isChapelQrModalOpen}
            onClose={() => setIsChapelQrModalOpen(false)}
            caseData={activeCase}
          />
        )}

        {/* Two-Way Vendor SMS Dispatch & Carrier Confirmation Modal */}
        {isTwoWaySmsModalOpen && (
          <TwoWayVendorSmsModal
            isOpen={isTwoWaySmsModalOpen}
            onClose={() => {
              setIsTwoWaySmsModalOpen(false);
              setTwoWaySmsTargetRequestId(null);
            }}
            activeCase={activeCase}
            partners={servicePartners}
            requests={partnerRequests}
            onUpdateRequest={handleUpdatePartnerRequest}
            onAddRequest={handleAddPartnerRequest}
            onSendNotification={handleSendNotification}
            targetRequestId={twoWaySmsTargetRequestId}
            onOpenTwilioGateway={() => setIsTwilioGatewayModalOpen(true)}
          />
        )}

        {/* Arranger Modal (New Case from Back-Office) */}
        {isArrangerOpen && (
          <ArrangerWizard
            onClose={() => setIsArrangerOpen(false)}
            onCaseCreated={handleCaseCreatedFromArranger}
            initialService={selectedServiceOption}
          />
        )}

        {/* Manager PIN Login Modal */}
        <ManagerPinLoginModal
          isOpen={isManagerPinModalOpen}
          onClose={() => setIsManagerPinModalOpen(false)}
          onSuccess={() => {
            const token = createSignedSessionToken('manager', 'lfd-08850', 'Jason Benta (Managing LFD #08850)', 60);
            setManagerSession(token);
            setIsManagerPinModalOpen(false);
            setCurrentRole('manager');
            setBackOfficeTab('manager');
            handleSendNotification({
              id: `notif-${Date.now()}`,
              caseId: activeCase.id,
              decedentName: "Benta's Operations",
              recipientName: 'Management Admin',
              recipientPhone: '(212) 281-8850',
              channel: 'sms',
              type: 'portal_update',
              title: '🔐 Manager Suite Unlocked',
              bodyText: 'Jason Benta (Managing LFD #08850) authenticated. Cryptographic RBAC session token issued (60-min window).',
              sentAt: 'Just now',
              status: 'delivered'
            });
          }}
        />

        {/* Director Assignment Modal */}
        <DirectorAssignmentModal
          isOpen={isAssignModalOpen}
          assignment={selectedAssignmentForModal}
          directors={directorProfiles}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedAssignmentForModal(null);
          }}
          onSaveAssignment={(updatedAssignment) => {
            setServiceAssignments(prev => prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
            
            // Sync with active case
            setCases(prev => prev.map(c => {
              if (c.id === updatedAssignment.caseId || c.caseNumber === updatedAssignment.caseNumber) {
                return {
                  ...c,
                  assignedDirector: `${updatedAssignment.assignedDirectorName} (${updatedAssignment.directorLicense || 'LFD'})`,
                  notes: [
                    ...c.notes,
                    {
                      id: `note-${Date.now()}`,
                      author: 'Manager Operations Suite',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      text: `Director ${updatedAssignment.assignedDirectorName} (${updatedAssignment.directorType === 'in_house' ? 'In-House Staff' : 'Outsourced Trade Guild'}) assigned to lead service on ${updatedAssignment.serviceDate} at ${updatedAssignment.venueName}. Call time: ${updatedAssignment.callTime}.`
                    }
                  ]
                };
              }
              return c;
            }));

            // Create 1099 voucher if outsourced
            if (updatedAssignment.directorType === 'outsourced' && updatedAssignment.assignedDirectorId) {
              const existingVoucher = vouchers.find(v => v.assignmentId === updatedAssignment.id);
              if (!existingVoucher) {
                const newVoucher: Director1099Voucher = {
                  id: `vch-${Date.now()}`,
                  voucherNumber: `VCH-2026-0${Math.floor(Math.random() * 900 + 100)}`,
                  assignmentId: updatedAssignment.id,
                  directorId: updatedAssignment.assignedDirectorId,
                  directorName: updatedAssignment.assignedDirectorName || 'Trade Director',
                  directorLicense: updatedAssignment.directorLicense || 'NYS LFD',
                  caseNumber: updatedAssignment.caseNumber,
                  decedentName: updatedAssignment.decedentName,
                  serviceDate: updatedAssignment.serviceDate,
                  serviceType: updatedAssignment.serviceType,
                  amount: updatedAssignment.costAnalysis.outsourcedCost || 350.00,
                  status: 'pending_approval',
                  notes: 'Automatic trade guild disbursement voucher generated upon service dispatch.'
                };
                setVouchers(prev => [newVoucher, ...prev]);
              }
            }

            handleSendNotification({
              id: `notif-${Date.now()}`,
              caseId: updatedAssignment.caseId,
              decedentName: updatedAssignment.decedentName,
              recipientName: updatedAssignment.assignedDirectorName || 'Director Staff',
              recipientPhone: '(212) 555-0198',
              channel: 'sms',
              type: 'partner_dispatch',
              title: `👔 Director Assigned: ${updatedAssignment.decedentName}`,
              bodyText: `${updatedAssignment.assignedDirectorName} assigned for ${updatedAssignment.serviceDate} (${updatedAssignment.serviceTime}) at ${updatedAssignment.venueName}.`,
              sentAt: 'Just now',
              status: 'delivered'
            });
          }}
        />

        {/* Printable NYS Form AP-47 Official Statement of Goods & Services Modal */}
        <PrintableFormAP47Modal
          isOpen={isPrintAP47Open}
          onClose={() => {
            setIsPrintAP47Open(false);
            setPrintAP47TargetCase(null);
          }}
          caseData={printAP47TargetCase || activeCase}
          onOpenCheckPrinter={(targetCase) => handleOpenCheckPrinterModal(targetCase)}
        />

        {/* DocuSign NYS ESRA Compliant Legal E-Signature Hub Modal */}
        {isDocuSignModalOpen && (
          <DocuSignEnvelopeModal
            isOpen={isDocuSignModalOpen}
            onClose={() => {
              setIsDocuSignModalOpen(false);
              setDocuSignTargetCase(null);
            }}
            activeCase={docuSignTargetCase || activeCase}
            onSaveEnvelope={(env) => handleSaveDocuSign((docuSignTargetCase || activeCase).id, env)}
            onSendNotification={handleSendNotification}
          />
        )}

        {/* QuickBooks Online Accounting & Invoicing Integration Modal */}
        {isQuickBooksModalOpen && (
          <QuickBooksSyncModal
            isOpen={isQuickBooksModalOpen}
            onClose={() => {
              setIsQuickBooksModalOpen(false);
              setQuickBooksTargetCase(null);
            }}
            activeCase={quickBooksTargetCase || activeCase}
            cases={cases}
            onUpdateCase={handleUpdateCase}
            onSaveSync={(syncData) => handleSaveQuickBooksSync((quickBooksTargetCase || activeCase).id, syncData)}
            onSendNotification={handleSendNotification}
          />
        )}

        {/* Pass-Through Accounts Payable Check Generator & Voucher Printer Modal */}
        {isCheckPrinterModalOpen && (
          <CashAdvanceCheckPrinterModal
            isOpen={isCheckPrinterModalOpen}
            onClose={() => {
              setIsCheckPrinterModalOpen(false);
              setCheckPrinterTargetCase(null);
            }}
            caseData={checkPrinterTargetCase || activeCase}
            onUpdateChecks={(updatedChecks) => handleUpdatePassThroughChecks((checkPrinterTargetCase || activeCase).id, updatedChecks)}
            onOpenQuickBooks={(targetCase: GoldenRecordCase) => handleOpenQuickBooksModal(targetCase)}
          />
        )}

        {/* Multi-Document Discrepancy & NYS PHL § 4201 Guardrail Modal */}
        {isDiscrepancyModalOpen && (
          <DiscrepancyGuardrailModal
            isOpen={isDiscrepancyModalOpen}
            onClose={() => {
              setIsDiscrepancyModalOpen(false);
              setDiscrepancyTargetCase(null);
            }}
            caseData={discrepancyTargetCase || activeCase}
            onUpdateCase={handleUpdateCase}
            onOpenEdrsRapidFill={() => setIsEdrsModalOpen(true)}
            onOpenContractModal={() => {
              setContractTargetCase(discrepancyTargetCase || activeCase);
              setIsContractModalOpen(true);
            }}
          />
        )}

        {/* Mobile Day-of-Service Director Pocket HUD & SMS Cortege Dispatch Modal */}
        {isDirectorHUDModalOpen && (
          <DirectorDayOfServiceHUDModal
            isOpen={isDirectorHUDModalOpen}
            onClose={() => {
              setIsDirectorHUDModalOpen(false);
              setDirectorHUDTargetCase(null);
            }}
            caseData={directorHUDTargetCase || activeCase}
            onUpdateCase={handleUpdateCase}
            onSendNotification={handleSendNotification}
          />
        )}

        {/* Family Proof Approval & Commercial Press Lock Hub Modal */}
        {isProofApprovalModalOpen && (
          <FamilyProofApprovalModal
            isOpen={isProofApprovalModalOpen}
            onClose={() => {
              setIsProofApprovalModalOpen(false);
              setProofApprovalTargetCase(null);
            }}
            caseData={proofApprovalTargetCase || activeCase}
            onUpdateCase={handleUpdateCase}
            onSendNotification={handleSendNotification}
          />
        )}

        {/* Twilio Live SMS Cellular Gateway Configuration Modal */}
        <TwilioGatewaySettingsModal
          isOpen={isTwilioGatewayModalOpen}
          onClose={() => setIsTwilioGatewayModalOpen(false)}
        />

        {/* Cloud Database, S3 Object Storage & Multi-Device Real-Time Sync Modal */}
        {isCloudModalOpen && (
          <CloudSyncStorageModal
            isOpen={isCloudModalOpen}
            onClose={() => setIsCloudModalOpen(false)}
            cases={cases}
            onSyncComplete={() => {
              // Trigger state refresh
            }}
          />
        )}

        {/* 24/7 AI Family Care Concierge, 9-Part Obituary Generator & Whisper Audio Hub */}
        <AIGatewaySettingsModal
          isOpen={isAIGatewayModalOpen}
          onClose={() => setIsAIGatewayModalOpen(false)}
          activeCase={activeCase}
          cases={cases}
        />

        {/* Commercial Press Fulfillment & 300 DPI CMYK Offset Routing */}
        <CommercialPressFulfillmentModal
          isOpen={isPressModalOpen}
          onClose={() => setIsPressModalOpen(false)}
          cases={cases}
          selectedCaseId={activeCase.id}
        />

        {/* Live 4K Webcasting, PTZ Multi-Camera Studio & Vimeo Enterprise Gateway Hub */}
        <WebcastLiveStreamHubModal
          isOpen={isWebcastHubModalOpen}
          onClose={() => {
            setIsWebcastHubModalOpen(false);
            setWebcastTargetCase(null);
          }}
          activeCase={webcastTargetCase || activeCase}
          cases={cases}
          onSendNotification={handleSendNotification}
        />

        {/* Stripe Merchant POS Terminal & Split-Pay Crowdfunding Gateway */}
        <StripePaymentGatewayModal
          isOpen={isStripeModalOpen}
          onClose={() => {
            setIsStripeModalOpen(false);
            setStripeTargetCase(null);
          }}
          activeCase={stripeTargetCase || activeCase}
          cases={cases}
          onSendNotification={handleSendNotification}
          onUpdateCaseBilling={(caseId, updatedBilling) => {
            setCases(prev => prev.map(c => {
              if (c.id === caseId) {
                return {
                  ...c,
                  splitBilling: updatedBilling
                };
              }
              return c;
            }));
          }}
        />

        {/* Enterprise Integrations & API Gateway Command Center Hub */}
        <IntegrationsCommandCenterModal
          isOpen={isIntegrationsCenterOpen}
          onClose={() => setIsIntegrationsCenterOpen(false)}
          onLaunchStripe={() => {
            setStripeTargetCase(activeCase);
            setIsStripeModalOpen(true);
          }}
          onLaunchTwilio={() => setIsTwilioGatewayModalOpen(true)}
          onLaunchCloud={() => setIsCloudModalOpen(true)}
          onLaunchDocuSign={() => handleOpenDocuSignModal(activeCase)}
          onLaunchQuickBooks={() => handleOpenQuickBooksModal(activeCase)}
          onLaunchEdrs={() => setIsEdrsModalOpen(true)}
          onLaunchWebcast={() => setIsWebcastHubModalOpen(true)}
          onLaunchPress={() => setIsPressModalOpen(true)}
          onLaunchAI={() => setIsAIGatewayModalOpen(true)}
        />

        {/* End-to-End Case Lifecycle Simulation Runner Modal */}
        <CaseLifecycleSimulatorModal
          isOpen={isSimulationModalOpen}
          onClose={() => setIsSimulationModalOpen(false)}
          activeCase={activeCase}
          cases={cases}
          onSelectCase={(c) => setActiveCaseId(c.id)}
          onAdvancePhase={handleUpdateCasePhase}
          onLaunchModal={(key, targetCase) => {
            switch (key) {
              case 'removal':
                setRemovalTargetCase(targetCase);
                setIsRemovalModalOpen(true);
                break;
              case 'contract':
                setContractTargetCase(targetCase);
                setIsContractModalOpen(true);
                break;
              case 'ai':
                setIsAIGatewayModalOpen(true);
                break;
              case 'docusign':
                handleOpenDocuSignModal(targetCase);
                break;
              case 'quickbooks':
                handleOpenQuickBooksModal(targetCase);
                break;
              case 'stripe':
                setStripeTargetCase(targetCase);
                setIsStripeModalOpen(true);
                break;
              case 'edrs':
                setIsEdrsModalOpen(true);
                break;
              case 'press':
                setIsPressModalOpen(true);
                break;
              case 'webcast':
                setIsWebcastHubModalOpen(true);
                break;
              case 'golden_record':
                setActiveCaseId(targetCase.id);
                setBackOfficeTab('golden_record');
                break;
            }
          }}
        />

        {/* Interactive Guided Tour & Spotlight Tutorial Modal */}
        <InteractiveGuidedTourModal
          isOpen={isGuidedTourOpen}
          onClose={() => setIsGuidedTourOpen(false)}
          activeCase={activeCase}
          initialTrack={guidedTourInitialTrack}
          onLaunchToolModal={handleLaunchToolFromTour}
        />
      </div>
    );
  }

  // Otherwise, render Public-Facing Harlem Community Site
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans">
      <PublicNavbar
        onOpenPortal={() => {
          setIsStaffUser(true);
          setCurrentRole('director');
          setViewMode('backoffice');
        }}
        onOpenFamilyPortal={() => setIsFamilyAccessModalOpen(true)}
        onOpenArranger={() => setIsArrangerOpen(true)}
        activeSection={activePublicSection}
        onNavigate={handleNavigatePublic}
      />

      <main className="flex-1">
        <PublicHero
          onOpenArranger={() => setIsArrangerOpen(true)}
          onExploreServices={() => handleNavigatePublic('services')}
          onOpenNotable={() => handleNavigatePublic('notable')}
          onOpenFamilyPortal={() => setIsFamilyAccessModalOpen(true)}
          onOpenDirectorPortal={() => {
            setIsStaffUser(true);
            setCurrentRole('director');
            setViewMode('backoffice');
          }}
        />
        <NotableServices />
        <ServiceOptionsSection onSelectService={handleSelectServiceFromPublic} />
        <PreplanningSection onOpenArranger={() => setIsArrangerOpen(true)} />
        <PublicHistoryFacility />
        <ObituariesTributes />
        <GriefHealingSection />
        <PublicFAQsContact />
      </main>

      <PublicFooter
        onOpenPortal={() => {
          setIsStaffUser(true);
          setCurrentRole('director');
          setViewMode('backoffice');
        }}
        onOpenFamilyPortal={() => setIsFamilyAccessModalOpen(true)}
        onNavigate={handleNavigatePublic}
      />

      {/* Arranger Modal */}
      {isArrangerOpen && (
        <ArrangerWizard
          onClose={() => setIsArrangerOpen(false)}
          onCaseCreated={handleCaseCreatedFromArranger}
          initialService={selectedServiceOption}
        />
      )}

      {/* Family Access & Confidential Vault Authentication Modal */}
      <FamilyAccessModal
        isOpen={isFamilyAccessModalOpen}
        onClose={() => setIsFamilyAccessModalOpen(false)}
        cases={cases}
        onAuthenticateFamily={handleAuthenticateFamily}
        onOpenDirectorPortal={() => {
          setIsStaffUser(true);
          setCurrentRole('director');
          setViewMode('backoffice');
        }}
      />
    </div>
  );
}

export default App;
