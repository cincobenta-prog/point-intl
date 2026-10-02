import React, { useState } from 'react';
import { 
  GoldenRecordCase, 
  StatementOfGoodsData, 
  ServiceTypeAP47,
  FloralArrangementItem,
  CustomLiveryVehicleItem
} from '../../lib/types/funeral';
import { 
  BFH_GPL_2026, 
  CATALOG_VAULTS, 
  calculateAP47Totals, 
  getDefaultStatementOfGoodsForCase 
} from '../../lib/data/generalPriceList';
import {
  ALL_UNIFIED_MERCHANDISE,
  BATESVILLE_CASKETS,
  MILSO_CASKETS,
  ManufacturerFilter,
  searchMerchandise
} from '../../lib/data/casketCatalog';
import {
  BFH_FLORAL_CATALOG,
  BFH_FLORAL_CATEGORIES,
  FloralCategory,
  FloralSize,
  getFloralByCode
} from '../../lib/data/floralCatalog';
import { CashAdvanceCheckPrinterModal } from './CashAdvanceCheckPrinterModal';
import { 
  CemeterySelectionModal, 
  SelectedCemeteryPayload 
} from './CemeterySelectionModal';
import { 
  FileText, 
  Printer, 
  Save, 
  CheckCircle2, 
  Heart, 
  Package, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ChevronRight, 
  X, 
  BookOpen, 
  Building2, 
  Copy,
  Sparkles,
  Layers,
  Tag,
  Image as ImageIcon,
  HandCoins,
  Key,
  Search,
  MapPin
} from 'lucide-react';



interface ArrangementContractBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: GoldenRecordCase;
  activeCase?: GoldenRecordCase;
  onSaveContract?: (caseId: string, updatedStatement: StatementOfGoodsData) => void;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: any) => void;
}

export const ArrangementContractBuilderModal: React.FC<ArrangementContractBuilderModalProps> = ({
  isOpen,
  onClose,
  caseData,
  activeCase: propsActiveCase,
  onSaveContract,
  onUpdateCase,
  onSendNotification
}) => {
  const currentCase = caseData || propsActiveCase;
  if (!isOpen || !currentCase) return null;

  const activeCase = currentCase;

  // Wizard Step State (1: Biography/Story, 2: Service Type & Baseline, 3: Variables & Custom Items, 4: Live AP-47 Contract Preview)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isFamilyPortalPinModalOpen, setIsFamilyPortalPinModalOpen] = useState(false);

  // Active Category in Step 3
  const [activeVariablesCategory, setActiveVariablesCategory] = useState<'livery' | 'merchandise' | 'flowers' | 'stationery' | 'facilities_repast' | 'cash_advances'>('livery');

  // Main Statement of Goods State initialized with case data
  const [statementData, setStatementData] = useState<StatementOfGoodsData>(() => {
    if (activeCase.statementOfGoods) {
      return calculateAP47Totals(activeCase.statementOfGoods);
    }
    return getDefaultStatementOfGoodsForCase(activeCase);
  });

  // Local Custom Builders in Step 3
  const [newCustomVehicleType, setNewCustomVehicleType] = useState('');
  const [newCustomVehicleCount, setNewCustomVehicleCount] = useState(1);
  const [newCustomVehiclePrice, setNewCustomVehiclePrice] = useState(650);

  // BFH Catalog Floral Selection State
  const [selectedFloralCategory, setSelectedFloralCategory] = useState<FloralCategory | 'all'>('all');
  const [selectedFloralCode, setSelectedFloralCode] = useState<string>('BFH-CC-005');
  const [selectedFloralSize, setSelectedFloralSize] = useState<FloralSize>('medium');
  const [selectedFloralRibbon, setSelectedFloralRibbon] = useState<string>('Loving Family');
  const [selectedFloralQty, setSelectedFloralQty] = useState<number>(1);
  const [showVisualFloralGallery, setShowVisualFloralGallery] = useState<boolean>(false);

  const [newCustomFlowerType, setNewCustomFlowerType] = useState<FloralArrangementItem['type']>('casket_spray');
  const [newCustomFlowerDesc, setNewCustomFlowerDesc] = useState('');
  const [newCustomFlowerQty, setNewCustomFlowerQty] = useState(1);
  const [newCustomFlowerPrice, setNewCustomFlowerPrice] = useState(250);

  // Batesville & Milso Casket & Merchandise Selection State
  const [casketManufacturerFilter, setCasketManufacturerFilter] = useState<ManufacturerFilter>('all');
  const [casketSearchQuery, setCasketSearchQuery] = useState<string>('');
  const [casketCategoryFilter, setCasketCategoryFilter] = useState<string>('all');
  const [selectedCasketCatalogId, setSelectedCasketCatalogId] = useState<string>('');
  const [showFullCasketGallery, setShowFullCasketGallery] = useState<boolean>(false);

  // Urn & Keepsake Selection State
  const [urnManufacturerFilter, setUrnManufacturerFilter] = useState<ManufacturerFilter>('all');
  const [urnSearchQuery, setUrnSearchQuery] = useState<string>('');
  const [selectedUrnCatalogId, setSelectedUrnCatalogId] = useState<string>('');

  const [newCashAdvDesc, setNewCashAdvDesc] = useState('');
  const [newCashAdvAmount, setNewCashAdvAmount] = useState(150);
  const [isCheckPrinterOpen, setIsCheckPrinterOpen] = useState(false);
  const [isCemeteryModalOpen, setIsCemeteryModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCemeterySelected = (payload: SelectedCemeteryPayload) => {
    const updated = { ...statementData };
    updated.sectionII.cemeteryOrCrematoryName = payload.cemeteryName;
    updated.sectionII.cemeteryOrCrematoryAmount = payload.feeAmount;
    setStatementData(calculateAP47Totals(updated));
    showToast(`✓ Final destination set to ${payload.cemeteryName} ($${payload.feeAmount.toFixed(2)})`);
  };


  // -------------------------------------------------------------
  // HANDLERS FOR SERVICE TYPE & FLAT RATE SWITCHING
  // -------------------------------------------------------------

  const handleSelectServiceType = (type: ServiceTypeAP47) => {
    const updated = { ...statementData, serviceType: type };

    if (type === 'direct_cremation') {
      updated.sectionI.A_alternativeServicesTitle = 'Direct Cremation (Flat Rate)';
      updated.sectionI.A_alternativeServicesAmount = BFH_GPL_2026.directCremation.withCustomerContainer;
      updated.sectionI.directCremationOption = 'customer_container';
      updated.sectionI.C1_embalmingSelected = false;
      updated.sectionI.C1_embalmingAmount = 0;
      updated.sectionI.D_basicArrangementsAmount = 0; // Included in flat rate
      updated.sectionI.B_transferOfRemainsAmount = 0; // Included in flat rate
      updated.sectionI.E1_supervisionVisitationAmount = 0;
      updated.sectionI.E2_supervisionFuneralServiceAmount = 0;
      updated.sectionI.E3_supervisionMemorialAmount = 0;
      updated.sectionI.F1_facilitiesVisitationAmount = 0;
      updated.sectionI.F2_facilitiesFuneralServiceAmount = 0;
      updated.sectionI.F3_facilitiesMemorialServiceAmount = 0;
      updated.sectionI.H1_casketSelected = false;
      updated.sectionI.H3_urnSelected = true;
    } else if (type === 'cremation_memorial') {
      // Cremation and Memorial Service
      updated.sectionI.A_alternativeServicesTitle = 'Direct Cremation Base with Memorial Service';
      updated.sectionI.A_alternativeServicesAmount = BFH_GPL_2026.directCremation.withCustomerContainer;
      updated.sectionI.directCremationOption = 'customer_container';
      updated.sectionI.C1_embalmingSelected = false;
      updated.sectionI.C1_embalmingAmount = 0;
      updated.sectionI.D_basicArrangementsAmount = 0; // Included in direct cremation base
      updated.sectionI.B_transferOfRemainsAmount = 0; // Included in direct cremation base
      updated.sectionI.E1_supervisionVisitationAmount = 0;
      updated.sectionI.E2_supervisionFuneralServiceAmount = 0;
      updated.sectionI.E3_supervisionMemorialAmount = BFH_GPL_2026.supervisionMemorialService;
      updated.sectionI.F1_facilitiesVisitationAmount = 0;
      updated.sectionI.F2_facilitiesFuneralServiceAmount = 0;
      updated.sectionI.F3_facilitiesMemorialServiceAmount = BFH_GPL_2026.facilitiesMemorialService;
      updated.sectionI.H1_casketSelected = false;
      updated.sectionI.H3_urnSelected = true;
    } else if (type === 'direct_burial') {
      updated.sectionI.A_alternativeServicesTitle = 'Direct Burial (Flat Rate)';
      updated.sectionI.A_alternativeServicesAmount = BFH_GPL_2026.directBurial.withCustomerContainer;
      updated.sectionI.directBurialOption = 'customer_container';
      updated.sectionI.C1_embalmingSelected = false;
      updated.sectionI.C1_embalmingAmount = 0;
      updated.sectionI.D_basicArrangementsAmount = 0; // Included in flat rate
      updated.sectionI.B_transferOfRemainsAmount = 0; // Included in flat rate
      updated.sectionI.E1_supervisionVisitationAmount = 0;
      updated.sectionI.E2_supervisionFuneralServiceAmount = 0;
      updated.sectionI.E3_supervisionMemorialAmount = 0;
      updated.sectionI.F1_facilitiesVisitationAmount = 0;
      updated.sectionI.F2_facilitiesFuneralServiceAmount = 0;
      updated.sectionI.F3_facilitiesMemorialServiceAmount = 0;
      updated.sectionI.H1_casketSelected = false;
    } else if (type === 'forwarding_remains') {
      updated.sectionI.A_alternativeServicesAmount = 0;
      updated.sectionI.J1_forwardingRemainsAmount = BFH_GPL_2026.forwardingRemainsLocal;
      updated.sectionI.C1_embalmingSelected = true;
      updated.sectionI.C1_embalmingAmount = BFH_GPL_2026.embalming;
    } else if (type === 'receiving_remains') {
      updated.sectionI.A_alternativeServicesAmount = 0;
      updated.sectionI.J2_receivingRemainsAmount = BFH_GPL_2026.receivingRemainsLocal;
    } else {
      // Traditional Service and Burial / Funeral Service with Cremation (Variables increase)
      updated.sectionI.A_alternativeServicesAmount = 0;
      updated.sectionI.B_transferOfRemainsAmount = BFH_GPL_2026.transferOfRemainsLocalNYC;
      updated.sectionI.D_basicArrangementsAmount = BFH_GPL_2026.basicArrangements;
      updated.sectionI.C1_embalmingSelected = true;
      updated.sectionI.C1_embalmingAmount = BFH_GPL_2026.embalming;
      updated.sectionI.C2_dressingCasketingAmount = BFH_GPL_2026.dressingCasketing;
      updated.sectionI.C2_cosmetologyAmount = BFH_GPL_2026.cosmetology;
      updated.sectionI.E1_supervisionVisitationAmount = BFH_GPL_2026.supervisionVisitation;
      updated.sectionI.E2_supervisionFuneralServiceAmount = BFH_GPL_2026.supervisionFuneralService;
      updated.sectionI.E3_supervisionCemeteryCrematoryAmount = BFH_GPL_2026.supervisionCemeteryCrematory;
      updated.sectionI.F1_facilitiesVisitationAmount = BFH_GPL_2026.facilitiesVisitation;
      updated.sectionI.F2_facilitiesFuneralServiceAmount = BFH_GPL_2026.facilitiesFuneralService;
      updated.sectionI.H1_casketSelected = type === 'burial_with_service';
      updated.sectionI.H3_urnSelected = type === 'cremation_with_service';
    }

    setStatementData(calculateAP47Totals(updated));
  };

  // Direct Cremation Container Switcher
  const handleDirectCremationContainer = (opt: 'customer_container' | 'alternative_container') => {
    const updated = { ...statementData };
    updated.sectionI.directCremationOption = opt;
    updated.sectionI.A_alternativeServicesAmount = opt === 'alternative_container'
      ? BFH_GPL_2026.directCremation.withAlternativeContainer
      : BFH_GPL_2026.directCremation.withCustomerContainer;
    setStatementData(calculateAP47Totals(updated));
  };

  // Direct Burial Container Switcher
  const handleDirectBurialContainer = (opt: 'customer_container' | 'alternative_container') => {
    const updated = { ...statementData };
    updated.sectionI.directBurialOption = opt;
    updated.sectionI.A_alternativeServicesAmount = opt === 'alternative_container'
      ? BFH_GPL_2026.directBurial.withAlternativeContainer
      : BFH_GPL_2026.directBurial.withCustomerContainer;
    setStatementData(calculateAP47Totals(updated));
  };

  // -------------------------------------------------------------
  // HANDLERS FOR LIVERY, MERCHANDISE, FLOWERS, STATIONERY, CASH ADVANCES
  // -------------------------------------------------------------

  const handleAddCustomVehicle = () => {
    if (!newCustomVehicleType.trim()) return;
    const newVehicle: CustomLiveryVehicleItem = {
      id: `veh-${Date.now()}`,
      vehicleType: newCustomVehicleType.trim(),
      rateType: 'custom',
      count: newCustomVehicleCount,
      unitPrice: newCustomVehiclePrice,
      totalAmount: newCustomVehicleCount * newCustomVehiclePrice
    };
    const updated = { ...statementData };
    updated.sectionI.G_vehicles = [...(updated.sectionI.G_vehicles || []), newVehicle];
    setStatementData(calculateAP47Totals(updated));
    setNewCustomVehicleType('');
    showToast(`🚗 Added ${newVehicle.vehicleType} to livery lineup!`);
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    const updated = { ...statementData };
    updated.sectionI.G_vehicles = (updated.sectionI.G_vehicles || []).filter(v => v.id !== vehicleId);
    setStatementData(calculateAP47Totals(updated));
  };

  const handleAddBFHFloral = () => {
    const product = getFloralByCode(selectedFloralCode) || BFH_FLORAL_CATALOG[0];
    const unitPrice = product.pricing[selectedFloralSize];
    const ribbonText = selectedFloralRibbon.trim();
    
    const newFlower: FloralArrangementItem = {
      id: `fl-${product.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${Date.now()}`,
      type: product.category,
      code: product.code,
      name: product.name,
      size: selectedFloralSize,
      ribbonText: ribbonText || undefined,
      imageUrl: product.imageUrl,
      description: `${product.code} - ${product.name} (${selectedFloralSize.toUpperCase()} ${product.dimensions[selectedFloralSize]}${ribbonText ? ` • Sash: "${ribbonText}"` : ''})`,
      quantity: selectedFloralQty,
      unitPrice: unitPrice,
      totalAmount: unitPrice * selectedFloralQty
    };

    const updated = { ...statementData };
    updated.sectionI.I6_flowersSelected = true;
    updated.sectionI.I6_noFlowersRequested = false;
    updated.sectionI.I6_flowerItems = [...(updated.sectionI.I6_flowerItems || []), newFlower];
    setStatementData(calculateAP47Totals(updated));
    showToast(`💐 Added ${product.code} (${selectedFloralSize.toUpperCase()} - $${unitPrice.toFixed(2)}) to contract!`);
  };

  const handleAddCustomFlower = () => {

    if (!newCustomFlowerDesc.trim()) return;
    const newFlower: FloralArrangementItem = {
      id: `fl-${Date.now()}`,
      type: newCustomFlowerType,
      description: newCustomFlowerDesc.trim(),
      quantity: newCustomFlowerQty,
      unitPrice: newCustomFlowerPrice,
      totalAmount: newCustomFlowerQty * newCustomFlowerPrice
    };
    const updated = { ...statementData };
    updated.sectionI.I6_flowersSelected = true;
    updated.sectionI.I6_noFlowersRequested = false;
    updated.sectionI.I6_flowerItems = [...(updated.sectionI.I6_flowerItems || []), newFlower];
    setStatementData(calculateAP47Totals(updated));
    setNewCustomFlowerDesc('');
    showToast(`💐 Added ${newFlower.description} to floral tribute schedule!`);
  };

  const handleRemoveFlower = (flowerId: string) => {
    const updated = { ...statementData };
    updated.sectionI.I6_flowerItems = (updated.sectionI.I6_flowerItems || []).filter(f => f.id !== flowerId);
    setStatementData(calculateAP47Totals(updated));
  };

  const handleAddCustomCashAdvance = () => {
    if (!newCashAdvDesc.trim()) return;
    const newCash = {
      id: `cash-${Date.now()}`,
      description: newCashAdvDesc.trim(),
      amount: newCashAdvAmount
    };
    const updated = { ...statementData };
    updated.sectionII.customCashAdvances = [...(updated.sectionII.customCashAdvances || []), newCash];
    setStatementData(calculateAP47Totals(updated));
    setNewCashAdvDesc('');
    showToast(`💵 Added cash advance: ${newCash.description} ($${newCash.amount.toFixed(2)})`);
  };

  const handleRemoveCustomCashAdvance = (id: string) => {
    const updated = { ...statementData };
    updated.sectionII.customCashAdvances = (updated.sectionII.customCashAdvances || []).filter(c => c.id !== id);
    setStatementData(calculateAP47Totals(updated));
  };

  // -------------------------------------------------------------
  // SAVE & SYNC TO GOLDEN RECORD CASE
  // -------------------------------------------------------------

  const handleSaveToGoldenRecord = () => {
    const calculated = calculateAP47Totals(statementData);
    
    // Update Case object
    const updatedCase: GoldenRecordCase = {
      ...activeCase,
      totalAmountDue: calculated.sectionIII.totalFuneralCharges,
      statementOfGoods: calculated,
      serviceSelections: {
        ...activeCase.serviceSelections,
        basePackagePrice: calculated.sectionI.totalFuneralHomeCharges,
        casketOrUrnSelected: calculated.sectionI.H1_casketSelected 
          ? calculated.sectionI.H1_casketModelNameOrNumber 
          : (calculated.sectionI.H3_urnSelected ? calculated.sectionI.H3_urnModelName : 'Standard Direct Container'),
        casketPrice: calculated.sectionI.H1_casketSelected ? calculated.sectionI.H1_casketAmount : (calculated.sectionI.H3_urnSelected ? calculated.sectionI.H3_urnAmount : 0),
        crematoryOrCemeteryName: calculated.sectionII.cemeteryOrCrematoryName || activeCase.serviceSelections.crematoryOrCemeteryName,
        officiantName: calculated.sectionII.clergyChurchName || activeCase.serviceSelections.officiantName,
        organistName: calculated.sectionII.organistMusicianName || activeCase.serviceSelections.organistName
      },
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Jason Benta, LFD #08850',
          timestamp: 'Just now',
          text: `📜 Statement of Goods and Services Selected (Form AP-47) finalized. Total Funeral Charges: $${calculated.sectionIII.totalFuneralCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Funeral Home: $${calculated.sectionI.totalFuneralHomeCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Cash Advances: $${calculated.sectionII.totalCashAdvances.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Balance Due: $${calculated.sectionIII.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
        },
        ...activeCase.notes
      ]
    };

    if (onSaveContract) {
      onSaveContract(activeCase.id, calculated);
    } else if (onUpdateCase) {
      onUpdateCase(updatedCase);
    }

    if (onSendNotification) {
      onSendNotification({
        id: `notif-contract-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.informant.fullName,
        recipientPhone: activeCase.informant.phone,
        channel: 'sms',
        type: 'contract_signing',
        title: `Itemized Funeral Statement (AP-47) Updated`,
        bodyText: `Dear ${activeCase.informant.fullName}, your itemized Statement of Goods & Services Selected (Form AP-47) for ${activeCase.decedent.legalName} has been synchronized. Total charges: $${calculated.sectionIII.totalFuneralCharges.toFixed(2)}. Access your copy in the Family Portal at e-bfh.com/case/${activeCase.caseNumber}.`,
        sentAt: 'Just now',
        status: 'delivered'
      });
    }

    showToast('✓ Statement of Goods (Form AP-47) saved & synchronized to Golden Record!');
    setIsFamilyPortalPinModalOpen(true);
  };

  const handleCopyContractSummary = () => {
    const c = calculateAP47Totals(statementData);
    const text = `BENTA'S FUNERAL HOME, INC. — STATEMENT OF GOODS AND SERVICES SELECTED (FORM AP-47)
Case Number: ${activeCase.caseNumber}
Decedent: ${activeCase.decedent.legalName}
Date of Death: ${activeCase.decedent.dateOfDeath}
Invoice To: ${activeCase.informant.fullName} (${activeCase.informant.relationship})

I. FUNERAL HOME CHARGES: $${c.sectionI.totalFuneralHomeCharges.toFixed(2)}
• Service Type: ${c.serviceType.replace(/_/g, ' ').toUpperCase()}
• Basic Arrangements: $${c.sectionI.D_basicArrangementsAmount.toFixed(2)}
• Transfer of Remains: $${c.sectionI.B_transferOfRemainsAmount.toFixed(2)}
• Preparation & Embalming: $${(c.sectionI.C1_embalmingAmount + c.sectionI.C2_dressingCasketingAmount + c.sectionI.C2_cosmetologyAmount).toFixed(2)}
• Facilities & Supervision: $${(c.sectionI.E1_supervisionVisitationAmount + c.sectionI.E2_supervisionFuneralServiceAmount + c.sectionI.F1_facilitiesVisitationAmount + c.sectionI.F2_facilitiesFuneralServiceAmount).toFixed(2)}
• Livery Lineup: $${c.sectionI.G_totalLiveryAmount.toFixed(2)}
• Merchandise (Casket/Urn/Vault): $${(c.sectionI.H1_casketAmount + c.sectionI.H2_outerReceptacleAmount + c.sectionI.H3_urnAmount).toFixed(2)}
• Stationery, Programs & Flowers: $${(c.sectionI.I6_totalFlowersAmount + c.sectionI.I10_programsMatrix.totalAmount + c.sectionI.I1_memorialCardsAmount).toFixed(2)}

II. CASH ADVANCES: $${c.sectionII.totalCashAdvances.toFixed(2)}
• Cemetery/Crematory: $${c.sectionII.cemeteryOrCrematoryAmount.toFixed(2)}
• Clergy & Church: $${c.sectionII.clergyHonorariaAmount.toFixed(2)}
• Death Certificates (${c.sectionII.deathCertificateTranscriptsCount}x): $${c.sectionII.deathCertificateTranscriptsAmount.toFixed(2)}
• Organist & Music: $${c.sectionII.organistMusicianAmount.toFixed(2)}
• Tolls, Gratuities & Pallbearers: $${(c.sectionII.bridgeAndRoadTollsAmount + c.sectionII.gratuitiesLiveryAndStaffAmount + c.sectionII.pallbearersAmount).toFixed(2)}

III. TOTAL FUNERAL CHARGES: $${c.sectionIII.totalFuneralCharges.toFixed(2)}
Less Credits/Insurance: -$${c.sectionIII.lessCreditsAndInsurance.toFixed(2)}
BALANCE DUE: $${c.sectionIII.balanceDue.toFixed(2)}

Licensed Funeral Director: Jason Benta, NYS Reg. #08850
630 St. Nicholas Ave, New York, NY 10030 • (212) 281-8850`;

    navigator.clipboard.writeText(text);
    showToast('📋 Full Form AP-47 summary copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[96vh] flex flex-col shadow-2xl border-2 border-amber-400 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-neutral-900 via-[#181216] to-neutral-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#991b1b] border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                  Arrangement Conference & Form AP-47 Contract Studio
                </h3>
                <span className="bg-amber-400 text-neutral-950 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  NYS DOH Form AP-47
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Case #{activeCase.caseNumber} • <strong>{activeCase.decedent.legalName}</strong> • Informant: {activeCase.informant.fullName} ({activeCase.informant.relationship})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyContractSummary}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-200 text-xs rounded-xl font-bold transition flex items-center space-x-1"
              title="Copy text summary"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy Text</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-200 text-xs rounded-xl font-bold transition flex items-center space-x-1"
              title="Print Form AP-47"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Contract</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-STEP WIZARD PROGRESS BAR */}
        <div className="bg-neutral-100 px-4 sm:px-6 py-2.5 border-b border-neutral-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0 text-xs font-semibold">
          {[
            { step: 1, title: '1. Loved One Story & Vital Records', icon: BookOpen },
            { step: 2, title: '2. Service Type & Baseline GPL', icon: Building2 },
            { step: 3, title: '3. Variables & Custom Entries', icon: Package },
            { step: 4, title: '4. Live Form AP-47 Contract', icon: FileText }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
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

        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="bg-emerald-700 text-white text-xs py-2 px-4 text-center font-bold animate-fadeIn shrink-0">
            {toastMessage}
          </div>
        )}

        {/* MODAL BODY (SCROLLABLE CONTENT AREA) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ------------------------------------------------------------- */}
          {/* STEP 1: LOVED ONE STORY & VITAL RECORDS INTERVIEW */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Vital Records Reference Card */}
              <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#991b1b]" />
                    <span>Vital Records Verification Sheet & Informant Record</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold">
                    EDRS #{activeCase.medicalCertifier.edrsPermitNumber || 'EDRS-PENDING'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Full Legal Name:</span>
                    <strong className="text-neutral-900">{activeCase.decedent.legalName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Dates of Life:</span>
                    <strong className="text-neutral-900">{activeCase.decedent.dateOfBirth} — {activeCase.decedent.dateOfDeath}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Place of Passing:</span>
                    <strong className="text-neutral-900 truncate block">{activeCase.decedent.placeOfDeath}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Authorized Informant (NOK):</span>
                    <strong className="text-neutral-900">{activeCase.informant.fullName} ({activeCase.informant.relationship})</strong>
                  </div>
                </div>

                {activeCase.decedent.veteran && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center space-x-2">
                    <span className="font-bold">🎖️ Honorable Veteran:</span>
                    <span>{activeCase.decedent.branchOfService || 'U.S. Armed Forces'}. Eligible for Presidential Memorial Certificate, US Flag, and VA Plot Allowance.</span>
                  </div>
                )}
              </div>

              {/* Loved One Biography Interview ("Who Were They?") */}
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-[#991b1b]">
                  <Heart className="w-5 h-5 text-red-600 fill-red-100" />
                  <h4 className="font-serif-title font-bold text-base text-neutral-900">
                    Arrangement Inquiry: "Who Were They?" (Life Story & Traditions)
                  </h4>
                </div>
                <p className="text-xs text-neutral-600">
                  After reviewing vital records, the director asks the family about their loved one to tailor every detail of the celebration of life, scripture selections, musical liturgy, and memorial tributes.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-neutral-800 block mb-1">
                      Who was {activeCase.decedent.legalName}? (Core Character & Life Philosophy):
                    </label>
                    <textarea
                      rows={2}
                      value={statementData.lovedOneBiography.whoWereThey}
                      onChange={(e) => setStatementData({
                        ...statementData,
                        lovedOneBiography: { ...statementData.lovedOneBiography, whoWereThey: e.target.value }
                      })}
                      className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#991b1b]"
                      placeholder="e.g. A dedicated mentor, loving father, Columbia University educator, and neighborhood anchor in Central Harlem."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Passions, Hobbies & Music:
                      </label>
                      <input
                        type="text"
                        value={statementData.lovedOneBiography.passionsAndHobbies}
                        onChange={(e) => setStatementData({
                          ...statementData,
                          lovedOneBiography: { ...statementData.lovedOneBiography, passionsAndHobbies: e.target.value }
                        })}
                        className="w-full p-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#991b1b]"
                        placeholder="e.g. Jazz concerts at Apollo Theater, classic literature, church choir."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Faith Tradition & Spiritual Heritage:
                      </label>
                      <input
                        type="text"
                        value={statementData.lovedOneBiography.faithAndSpiritualTradition}
                        onChange={(e) => setStatementData({
                          ...statementData,
                          lovedOneBiography: { ...statementData.lovedOneBiography, faithAndSpiritualTradition: e.target.value }
                        })}
                        className="w-full p-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#991b1b]"
                        placeholder="e.g. Baptist (Abyssinian Baptist Church tradition), reading of Psalm 23."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Notable Civic & Career Accomplishments:
                      </label>
                      <input
                        type="text"
                        value={statementData.lovedOneBiography.specialAccomplishments}
                        onChange={(e) => setStatementData({
                          ...statementData,
                          lovedOneBiography: { ...statementData.lovedOneBiography, specialAccomplishments: e.target.value }
                        })}
                        className="w-full p-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#991b1b]"
                        placeholder="e.g. Retired Dean of Humanities, Columbia University; Lifetime Member NAACP."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Family Legacy & Surviving Generations:
                      </label>
                      <input
                        type="text"
                        value={statementData.lovedOneBiography.familyLegacyNotes}
                        onChange={(e) => setStatementData({
                          ...statementData,
                          lovedOneBiography: { ...statementData.lovedOneBiography, familyLegacyNotes: e.target.value }
                        })}
                        className="w-full p-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#991b1b]"
                        placeholder="e.g. Surviving spouse Eleanor, 3 children, and 6 grandchildren."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1 Navigation Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                >
                  <span>Proceed to Step 2: Select Service Type</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: SERVICE TYPE & BASELINE GENERAL PRICE LIST OPTIONS */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="border-b border-neutral-200 pb-2">
                <h4 className="font-serif-title text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#991b1b]" />
                  <span>Select Primary Service Type & Disposition Method</span>
                </h4>
                <p className="text-xs text-neutral-500">
                  Choose between Flat-Rate Direct Dispositions or a Service with Viewing/Sanctuary Ceremony where variables (flowers, vehicles, stationery matrix) increase.
                </p>
              </div>

              {/* 5 Primary Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Traditional Service and Burial */}
                <div 
                  onClick={() => handleSelectServiceType('burial_with_service')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                    statementData.serviceType === 'burial_with_service'
                      ? 'border-[#991b1b] bg-red-50/40 ring-2 ring-red-400/40 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      🏛️ Traditional Service and Burial
                    </span>
                    <span className="text-[10px] bg-[#991b1b] text-white px-2 py-0.5 rounded-full font-bold">
                      Variables Suite
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Comprehensive full-service traditional burial. Line items include basic arrangements, local transfer, embalming, facility, supervision, hearse, and cortege.
                  </p>
                  <div className="text-xs font-mono text-neutral-700 pt-1 border-t border-neutral-200 space-y-0.5">
                    <div>• Basic Arrangements: <strong>$950.00</strong></div>
                    <div>• Local Transfer: <strong>$750.00</strong> | Embalming: <strong>$900.00</strong></div>
                    <div>• Supervision & Facilities: <strong>$2,200.00</strong></div>
                  </div>
                </div>

                {/* 2. Funeral Service with Cremation */}
                <div 
                  onClick={() => handleSelectServiceType('cremation_with_service')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                    statementData.serviceType === 'cremation_with_service'
                      ? 'border-[#991b1b] bg-red-50/40 ring-2 ring-red-400/40 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      🕊️ Funeral Service with Cremation
                    </span>
                    <span className="text-[10px] bg-[#991b1b] text-white px-2 py-0.5 rounded-full font-bold">
                      Variables Suite
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Full ceremonial funeral gathering with viewing in Chapel A/B prior to cremation, ceremonial rental casket option ($1,100), and living voice tribute.
                  </p>
                  <div className="text-xs font-mono text-neutral-700 pt-1 border-t border-neutral-200 space-y-0.5">
                    <div>• Basic Arrangements: <strong>$950.00</strong></div>
                    <div>• Local Transfer: <strong>$750.00</strong> | Embalming / Prep: <strong>$900.00</strong></div>
                    <div>• Supervision & Facilities: <strong>$2,200.00</strong></div>
                  </div>
                </div>

                {/* 3. Cremation and Memorial Service */}
                <div 
                  onClick={() => handleSelectServiceType('cremation_memorial')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                    statementData.serviceType === 'cremation_memorial'
                      ? 'border-[#991b1b] bg-amber-50/50 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      🕯️ Cremation and Memorial Service
                    </span>
                    <span className="text-[10px] bg-[#b45309] text-white px-2 py-0.5 rounded-full font-bold">
                      Direct + Memorial
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Direct cremation baseline with chapel facility & supervision for memorial celebration. Variables: programs, prayer cards, officiant, organist, limousine, repast.
                  </p>
                  <div className="text-xs font-mono text-neutral-700 pt-1 border-t border-neutral-200 space-y-0.5">
                    <div>• Direct Cremation Base: <strong>$2,084.00</strong></div>
                    <div>• Memorial Supervision & Facility: <strong>$1,100.00</strong></div>
                    <div>• Handcrafted Keepsake Urn Display</div>
                  </div>
                </div>

                {/* 4. Direct Cremation (Flat Rate) */}
                <div 
                  onClick={() => handleSelectServiceType('direct_cremation')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                    statementData.serviceType === 'direct_cremation'
                      ? 'border-[#991b1b] bg-amber-50/50 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      ⚡ Direct Cremation
                    </span>
                    <span className="text-xs font-mono font-bold text-[#b45309]">
                      $2,084.00 – $2,214.00
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Immediate disposition without formal visitation or ceremony. Includes transfer of remains, basic arrangements, securing authorizations, and transport to crematory.
                  </p>
                  
                  {statementData.serviceType === 'direct_cremation' && (
                    <div className="pt-2 border-t border-amber-200 space-y-2 text-xs">
                      <span className="font-bold text-neutral-800 block">Select Container Option:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDirectCremationContainer('customer_container')}
                          className={`p-2 rounded-xl text-left border transition ${
                            statementData.sectionI.directCremationOption === 'customer_container'
                              ? 'bg-[#991b1b] text-white font-bold border-[#991b1b]'
                              : 'bg-white text-neutral-800 border-neutral-300'
                          }`}
                        >
                          <div>With Customer Container</div>
                          <div className="font-mono text-xs mt-0.5">$2,084.00</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectCremationContainer('alternative_container')}
                          className={`p-2 rounded-xl text-left border transition ${
                            statementData.sectionI.directCremationOption === 'alternative_container'
                              ? 'bg-[#991b1b] text-white font-bold border-[#991b1b]'
                              : 'bg-white text-neutral-800 border-neutral-300'
                          }`}
                        >
                          <div>With BFH Cardboard Box</div>
                          <div className="font-mono text-xs mt-0.5">$2,214.00</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Direct Earth Burial (Flat Rate) */}
                <div 
                  onClick={() => handleSelectServiceType('direct_burial')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                    statementData.serviceType === 'direct_burial'
                      ? 'border-[#991b1b] bg-amber-50/50 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      🌿 Direct Earth Burial
                    </span>
                    <span className="text-xs font-mono font-bold text-[#b45309]">
                      $2,084.00 – $2,484.00
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Direct interment without viewing or ceremony. Includes transfer of remains, basic staff arrangements, securing burial permits, and transport to local cemetery.
                  </p>

                  {statementData.serviceType === 'direct_burial' && (
                    <div className="pt-2 border-t border-amber-200 space-y-2 text-xs">
                      <span className="font-bold text-neutral-800 block">Select Container Option:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDirectBurialContainer('customer_container')}
                          className={`p-2 rounded-xl text-left border transition ${
                            statementData.sectionI.directBurialOption === 'customer_container'
                              ? 'bg-[#991b1b] text-white font-bold border-[#991b1b]'
                              : 'bg-white text-neutral-800 border-neutral-300'
                          }`}
                        >
                          <div>With Customer Container</div>
                          <div className="font-mono text-xs mt-0.5">$2,084.00</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectBurialContainer('alternative_container')}
                          className={`p-2 rounded-xl text-left border transition ${
                            statementData.sectionI.directBurialOption === 'alternative_container'
                              ? 'bg-[#991b1b] text-white font-bold border-[#991b1b]'
                              : 'bg-white text-neutral-800 border-neutral-300'
                          }`}
                        >
                          <div>With BFH Wood Container</div>
                          <div className="font-mono text-xs mt-0.5">$2,484.00</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ------------------------------------------------------------- */}
              {/* STEP 2.B: FINAL DISPOSITION DESTINATION (CEMETERY / CREMATORY) */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-red-50/40 p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-950">
                          Pass-Through Cash Advance
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          10 NYCRR § 77.8 Compliance
                        </span>
                      </div>
                      <h4 className="font-serif-title text-base font-bold text-neutral-900 mt-0.5">
                        Final Disposition Destination: Cemetery or Crematory
                      </h4>
                      <p className="text-xs text-neutral-600">
                        Select the interment cemetery, mausoleum, or crematory facility to automatically set pass-through cash advance fees, livery cortege routing, and Form AP-47 line items.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCemeteryModalOpen(true)}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-red-950/20 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-300" />
                    <span>Browse Cemetery Directory & Pricing Matrix</span>
                  </button>
                </div>

                {/* Active Cemetery Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1 shadow-2xs md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                        Selected Cemetery Destination:
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Payee</span>
                      </span>
                    </div>
                    <div className="font-bold text-neutral-900 text-sm">
                      {statementData.sectionII.cemeteryOrCrematoryName || activeCase.serviceSelections.crematoryOrCemeteryName || "The Woodlawn Cemetery & Crematory"}
                    </div>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#991b1b]" />
                      <span>Bronx, New York • Primary BFH Harlem partner facility (4199 Webster Ave)</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1 shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        Applied Pass-Through Fee:
                      </span>
                      <span className="text-[11px] text-neutral-500 block">
                        Form AP-47 Line II.1
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-neutral-100">
                      <span className="text-xs text-neutral-600 font-medium">Invoice Total:</span>
                      <span className="font-mono font-black text-base text-[#991b1b]">
                        ${statementData.sectionII.cemeteryOrCrematoryAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick 1-Click Select Chips for Common Harlem Destinations */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-neutral-700 block uppercase tracking-wider">
                    Quick-Select Frequent Tri-State Destinations:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      { name: 'The Woodlawn Cemetery & Crematory', fee: 1850, label: 'Woodlawn (Bronx)', icon: '🏛️' },
                      { name: 'Ferncliff Cemetery & Crematory', fee: 1950, label: 'Ferncliff (Hartsdale)', icon: '🕊️' },
                      { name: 'The Green-Wood Cemetery & Crematory', fee: 2100, label: 'Green-Wood (Brooklyn)', icon: '🌳' },
                      { name: 'Calverton National Cemetery (VA / U.S. Veterans)', fee: 0, label: 'Calverton VA (FREE)', icon: '🎖️' },
                      { name: 'Trinity Church Cemetery and Mausoleum', fee: 2600, label: 'Trinity (Manhattan)', icon: '⛪' },
                      { name: 'Fresh Pond Crematory', fee: 450, label: 'Fresh Pond (Queens)', icon: '🔥' }
                    ].map((quick) => {
                      const isActive = statementData.sectionII.cemeteryOrCrematoryName?.includes(quick.label.split(' ')[0]) ||
                        (quick.fee === 0 && statementData.sectionII.cemeteryOrCrematoryAmount === 0);
                      return (
                        <button
                          key={quick.name}
                          type="button"
                          onClick={() => {
                            const updated = { ...statementData };
                            updated.sectionII.cemeteryOrCrematoryName = quick.name;
                            updated.sectionII.cemeteryOrCrematoryAmount = quick.fee;
                            setStatementData(calculateAP47Totals(updated));
                            showToast(`✓ Selected ${quick.name} ($${quick.fee.toFixed(2)})`);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                              : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                          }`}
                        >
                          <span>{quick.icon}</span>
                          <span>{quick.label}</span>
                          <span className={`font-mono text-[11px] ${isActive ? 'text-amber-300' : 'text-[#991b1b]'}`}>
                            {quick.fee === 0 ? '$0.00' : `$${quick.fee}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Automatic Baseline Breakdown Notification */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">
                    Current Baseline Funeral Home Charges:
                  </span>
                  <span className="text-neutral-500">
                    Automatically itemized per BFH General Price List (Effective April 13, 2026).
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-base text-[#991b1b]">
                    ${statementData.sectionI.totalFuneralHomeCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Step 2 Navigation Bar */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Back to Step 1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                >
                  <span>Proceed to Step 3: Variables, Catalogs & Custom Entries</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: VARIABLES, CATALOGS & CUSTOM MANUAL ENTRIES */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Category Selector Tabs */}
              <div className="flex items-center space-x-2 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-bold">
                {[
                  { id: 'livery', label: '🚗 Livery & Vehicles', count: statementData.sectionI.G_vehicles?.length || 0 },
                  { id: 'merchandise', label: '⚰️ Caskets, Vaults & Urns', count: (statementData.sectionI.H1_casketSelected ? 1 : 0) + (statementData.sectionI.H3_urnSelected ? 1 : 0) },
                  { id: 'flowers', label: '💐 Floral Arrangements', count: statementData.sectionI.I6_flowerItems?.length || 0 },
                  { id: 'stationery', label: '📜 Printing & Stationery Matrix', count: statementData.sectionI.I10_programsMatrix.quantity },
                  { id: 'facilities_repast', label: '🍽️ Facilities & Repast Room', count: statementData.sectionI.F3_repastRoomAmount > 0 ? 1 : 0 },
                  { id: 'cash_advances', label: '💵 Cash Advances (Actual Cost)', count: 6 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveVariablesCategory(tab.id as any)}
                    className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 ${
                      activeVariablesCategory === tab.id
                        ? 'bg-[#991b1b] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-full font-mono">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* 3.A LIVERY FLEET & CUSTOM VEHICLE BUILDER */}
              {activeVariablesCategory === 'livery' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">Livery Fleet & Motorcade Vehicle Allocation</h4>
                      <p className="text-xs text-neutral-500">Standard rates per BFH General Price List (NYC Local vs Calverton National Cemetery).</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#991b1b]">
                      Total Livery: ${statementData.sectionI.G_totalLiveryAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Active Vehicle Roster Table */}
                  <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold">
                        <tr>
                          <th className="p-3">Vehicle Description</th>
                          <th className="p-3">Rate Category</th>
                          <th className="p-3 text-center">Count / Qty</th>
                          <th className="p-3 text-right">Unit Rate</th>
                          <th className="p-3 text-right">Line Total</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {(statementData.sectionI.G_vehicles || []).map((v) => (
                          <tr key={v.id} className="hover:bg-neutral-50">
                            <td className="p-3 font-semibold text-neutral-900">{v.vehicleType}</td>
                            <td className="p-3 text-neutral-600 uppercase font-mono text-[10px]">{v.rateType.replace(/_/g, ' ')}</td>
                            <td className="p-3 text-center font-mono font-bold">{v.count}</td>
                            <td className="p-3 text-right font-mono">${v.unitPrice.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono font-bold text-[#991b1b]">
                              ${(v.count * v.unitPrice).toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleRemoveVehicle(v.id)}
                                className="p-1 text-neutral-400 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Custom Vehicle Manual Entry Builder */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                    <span className="font-bold text-xs text-neutral-800 block flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#991b1b]" />
                      <span>Add / Custom Enter Vehicle Line Item:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-neutral-500 block mb-1">Vehicle Type / Name:</label>
                        <input
                          type="text"
                          value={newCustomVehicleType}
                          onChange={(e) => setNewCustomVehicleType(e.target.value)}
                          placeholder="e.g. Mercedes Sprinter Van (14-Pax) or Flower Car"
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Quantity:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newCustomVehicleCount}
                          onChange={(e) => setNewCustomVehicleCount(parseInt(e.target.value) || 1)}
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Unit Price ($):</label>
                        <input
                          type="number"
                          value={newCustomVehiclePrice}
                          onChange={(e) => setNewCustomVehiclePrice(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomVehicle}
                      className="px-4 py-2 bg-[#991b1b] hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      + Add Vehicle to Contract
                    </button>
                  </div>
                </div>
              )}

              {/* 3.B MERCHANDISE: CASKET, VAULT & URN */}
              {activeVariablesCategory === 'merchandise' && (
                <div className="space-y-6">
                  
                  {/* Casket Selection & Manual Entry */}
                  <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-[#991b1b]" />
                        <div>
                          <h4 className="font-bold text-sm text-neutral-900 font-serif-title">
                            Casket or Alternative Container (GPL Range: $130.00 – $41,340.00)
                          </h4>
                          <p className="text-[11px] text-neutral-500 font-normal">
                            Direct integration with official catalogs for <strong>Batesville Casket Company</strong> and <strong>Milso Industry</strong>.
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs hover:bg-neutral-50 transition">
                        <input
                          type="checkbox"
                          checked={statementData.sectionI.H1_casketSelected}
                          onChange={(e) => {
                            const updated = { ...statementData };
                            updated.sectionI.H1_casketSelected = e.target.checked;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="rounded text-[#991b1b] focus:ring-[#991b1b]"
                        />
                        <span className="font-bold text-neutral-800">Include Casket in Contract</span>
                      </label>
                    </div>

                    {statementData.sectionI.H1_casketSelected && (
                      <div className="space-y-4 pt-1">
                        
                        {/* Manufacturer Filter Tabs */}
                        <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-[11px] text-neutral-700">Manufacturer Catalog:</span>
                              <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-[11px] font-medium">
                                <button
                                  type="button"
                                  onClick={() => setCasketManufacturerFilter('all')}
                                  className={`px-3 py-1 rounded-md transition ${
                                    casketManufacturerFilter === 'all'
                                      ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                                      : 'text-neutral-600 hover:text-neutral-900'
                                  }`}
                                >
                                  All ({ALL_UNIFIED_MERCHANDISE.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCasketManufacturerFilter('batesville')}
                                  className={`px-3 py-1 rounded-md transition flex items-center space-x-1 ${
                                    casketManufacturerFilter === 'batesville'
                                      ? 'bg-[#991b1b] text-white shadow-2xs font-bold'
                                      : 'text-neutral-600 hover:text-neutral-900'
                                  }`}
                                >
                                  <span>Batesville Casket Co.</span>
                                  <span className="text-[10px] opacity-80 font-mono">({BATESVILLE_CASKETS.length})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCasketManufacturerFilter('milso')}
                                  className={`px-3 py-1 rounded-md transition flex items-center space-x-1 ${
                                    casketManufacturerFilter === 'milso'
                                      ? 'bg-[#15803d] text-white shadow-2xs font-bold'
                                      : 'text-neutral-600 hover:text-neutral-900'
                                  }`}
                                >
                                  <span>Milso Industry</span>
                                  <span className="text-[10px] opacity-80 font-mono">({MILSO_CASKETS.length})</span>
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowFullCasketGallery(!showFullCasketGallery)}
                              className="text-[11px] text-[#991b1b] hover:text-red-900 font-bold flex items-center space-x-1 underline"
                            >
                              <span>{showFullCasketGallery ? 'Collapse Catalog Cards' : 'Browse Visual Catalog Cards'}</span>
                            </button>
                          </div>

                          {/* Search and Category Filter Controls */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                            <div className="sm:col-span-7">
                              <input
                                type="text"
                                placeholder="Search by item #, model name, material, finish, or interior..."
                                value={casketSearchQuery}
                                onChange={(e) => setCasketSearchQuery(e.target.value)}
                                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs placeholder:text-neutral-400 focus:bg-white focus:ring-1 focus:ring-[#991b1b]"
                              />
                            </div>
                            <div className="sm:col-span-5">
                              <select
                                value={casketCategoryFilter}
                                onChange={(e) => setCasketCategoryFilter(e.target.value)}
                                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800"
                              >
                                <option value="all">All Material Categories</option>
                                <option value="bronze">Bronze & Copper</option>
                                <option value="stainless">Stainless Steel</option>
                                <option value="steel">16, 18 & 20 Gauge Steel</option>
                                <option value="wood">Hardwoods (Cherry, Oak, Maple, Poplar, Pine, Pecan, Mahogany)</option>
                                <option value="cloth">Cloth & Alternative Containers</option>
                              </select>
                            </div>
                          </div>

                          {/* Quick Interactive Dropdown Selector */}
                          <div className="pt-2 border-t border-neutral-100">
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Select Item to Generate Contract Price & Details:
                            </label>
                            {(() => {
                              let filteredList = searchMerchandise(casketSearchQuery, casketManufacturerFilter, 'casket');
                              if (casketCategoryFilter !== 'all') {
                                filteredList = filteredList.filter(item => {
                                  const c = (item.category + ' ' + item.material).toLowerCase();
                                  if (casketCategoryFilter === 'bronze') return c.includes('bronze') || c.includes('copper');
                                  if (casketCategoryFilter === 'stainless') return c.includes('stainless') || c.includes('onyx') || c.includes('sapphire');
                                  if (casketCategoryFilter === 'steel') return c.includes('gauge') || c.includes('steel') || c.includes('gemini') || c.includes('apollo') || c.includes('aries') || c.includes('spectra') || c.includes('hercules') || c.includes('pisces');
                                  if (casketCategoryFilter === 'wood') return c.includes('cherry') || c.includes('oak') || c.includes('maple') || c.includes('poplar') || c.includes('pine') || c.includes('pecan') || c.includes('mahogany') || c.includes('wood') || c.includes('hardwood') || c.includes('veneer');
                                  if (casketCategoryFilter === 'cloth') return c.includes('cloth') || c.includes('doeskin') || c.includes('cardboard') || c.includes('alternative') || c.includes('unfinished');
                                  return true;
                                });
                              }

                              return (
                                <div className="space-y-2">
                                  <select
                                    value={selectedCasketCatalogId}
                                    onChange={(e) => {
                                      const id = e.target.value;
                                      setSelectedCasketCatalogId(id);
                                      const found = ALL_UNIFIED_MERCHANDISE.find(m => m.id === id);
                                      if (found) {
                                        const updated = { ...statementData };
                                        updated.sectionI.H1_casketSupplier = found.supplier;
                                        updated.sectionI.H1_casketModelNameOrNumber = found.supplier === 'Batesville Casket Company' 
                                          ? `[#${found.modelCodeOrNumber}] ${found.nameOrDescription}` 
                                          : found.nameOrDescription;
                                        updated.sectionI.H1_casketMaterialSpeciesOrGauge = found.material;
                                        updated.sectionI.H1_casketInterior = found.interior;
                                        updated.sectionI.H1_casketAmount = found.price;
                                        setStatementData(calculateAP47Totals(updated));
                                        showToast(`Selected: ${found.displayText}`);
                                      }
                                    }}
                                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                                  >
                                    <option value="">-- Choose from Catalog ({filteredList.length} items matching filter) --</option>
                                    {filteredList.map((item) => (
                                      <option key={item.id} value={item.id}>
                                        {item.supplier === 'Milso Industry'
                                          ? `[Milso] ${item.nameOrDescription} — $${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                          : `[Batesville] [#${item.modelCodeOrNumber}] ${item.nameOrDescription} — $${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                      </option>
                                    ))}
                                  </select>

                                  <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
                                    <span>
                                      <strong>Format Rule:</strong> Batesville displays <em>Item number, Product Description, Proposed Display Price</em> | Milso displays <em>Item Name, Current Price</em>
                                    </span>
                                    <span className="font-mono text-neutral-600">
                                      Showing {filteredList.length} items
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Visual Catalog Grid (Collapsible or Shown) */}
                        {showFullCasketGallery && (
                          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-neutral-700">Visual Catalog Selection Cards:</span>
                              <span className="text-[10px] text-neutral-500">Click any card to load specifications & generate price</span>
                            </div>

                            {(() => {
                              let filtered = searchMerchandise(casketSearchQuery, casketManufacturerFilter, 'casket');
                              if (casketCategoryFilter !== 'all') {
                                filtered = filtered.filter(item => {
                                  const c = (item.category + ' ' + item.material).toLowerCase();
                                  if (casketCategoryFilter === 'bronze') return c.includes('bronze') || c.includes('copper');
                                  if (casketCategoryFilter === 'stainless') return c.includes('stainless') || c.includes('onyx') || c.includes('sapphire');
                                  if (casketCategoryFilter === 'steel') return c.includes('gauge') || c.includes('steel') || c.includes('gemini') || c.includes('apollo') || c.includes('aries') || c.includes('spectra') || c.includes('hercules') || c.includes('pisces');
                                  if (casketCategoryFilter === 'wood') return c.includes('cherry') || c.includes('oak') || c.includes('maple') || c.includes('poplar') || c.includes('pine') || c.includes('pecan') || c.includes('mahogany') || c.includes('wood') || c.includes('hardwood') || c.includes('veneer');
                                  if (casketCategoryFilter === 'cloth') return c.includes('cloth') || c.includes('doeskin') || c.includes('cardboard') || c.includes('alternative') || c.includes('unfinished');
                                  return true;
                                });
                              }

                              const displayItems = filtered.slice(0, 16);

                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                                  {displayItems.map((item) => {
                                    const isSelected = statementData.sectionI.H1_casketModelNameOrNumber.includes(item.nameOrDescription);
                                    return (
                                      <div
                                        key={item.id}
                                        onClick={() => {
                                          setSelectedCasketCatalogId(item.id);
                                          const updated = { ...statementData };
                                          updated.sectionI.H1_casketSupplier = item.supplier;
                                          updated.sectionI.H1_casketModelNameOrNumber = item.supplier === 'Batesville Casket Company' 
                                            ? `[#${item.modelCodeOrNumber}] ${item.nameOrDescription}` 
                                            : item.nameOrDescription;
                                          updated.sectionI.H1_casketMaterialSpeciesOrGauge = item.material;
                                          updated.sectionI.H1_casketInterior = item.interior;
                                          updated.sectionI.H1_casketAmount = item.price;
                                          setStatementData(calculateAP47Totals(updated));
                                          showToast(`Generated: ${item.displayText}`);
                                        }}
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                                          isSelected
                                            ? 'bg-red-50/80 border-[#991b1b] ring-2 ring-red-400/50 shadow-xs'
                                            : 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-2xs'
                                        }`}
                                      >
                                        <div className="space-y-1.5">
                                          <div className="flex items-center justify-between">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                              item.supplier === 'Batesville Casket Company'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                              {item.supplier === 'Batesville Casket Company' ? 'Batesville' : 'Milso'}
                                            </span>
                                            <span className="text-[10px] font-mono text-neutral-500 font-semibold">
                                              #{item.modelCodeOrNumber}
                                            </span>
                                          </div>

                                          <div className="font-bold text-neutral-900 text-xs line-clamp-2">
                                            {item.nameOrDescription}
                                          </div>

                                          <div className="text-[10px] text-neutral-600 line-clamp-1">
                                            {item.material}
                                          </div>
                                          <div className="text-[10px] text-neutral-500 line-clamp-1">
                                            Interior: {item.interior}
                                          </div>
                                        </div>

                                        <div className="pt-2 mt-2 border-t border-neutral-100 flex items-center justify-between">
                                          <div className="font-mono font-bold text-xs text-[#991b1b]">
                                            ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                          </div>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
                                            isSelected
                                              ? 'bg-[#991b1b] text-white'
                                              : 'bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200'
                                          }`}>
                                            {isSelected ? '✓ In Contract' : 'Select'}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Editable Form AP-47 Line Items */}
                        <div className="pt-3 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Supplier / Manufacturer:
                            </label>
                            <input
                              type="text"
                              value={statementData.sectionI.H1_casketSupplier}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H1_casketSupplier = e.target.value;
                                setStatementData(updated);
                              }}
                              placeholder="e.g. Batesville Casket Company or Milso Industry"
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Model Name or Number:
                            </label>
                            <input
                              type="text"
                              value={statementData.sectionI.H1_casketModelNameOrNumber}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H1_casketModelNameOrNumber = e.target.value;
                                setStatementData(updated);
                              }}
                              placeholder="e.g. [#147792] F63 899 IDH Sapphire"
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Material (Species of Wood / Gauge of Metal / Finish):
                            </label>
                            <input
                              type="text"
                              value={statementData.sectionI.H1_casketMaterialSpeciesOrGauge}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H1_casketMaterialSpeciesOrGauge = e.target.value;
                                setStatementData(updated);
                              }}
                              placeholder="e.g. Solid Cherry Hardwood / 18 Gauge Steel"
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Interior Description & Lining:
                            </label>
                            <input
                              type="text"
                              value={statementData.sectionI.H1_casketInterior}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H1_casketInterior = e.target.value;
                                setStatementData(updated);
                              }}
                              placeholder="e.g. Almond Tailored Velvet / Rosetan Crepe"
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2 bg-red-50/50 p-3 rounded-xl border border-red-100 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-neutral-900 block">
                                Generated Contract Casket Price ($):
                              </label>
                              <span className="text-[10px] text-neutral-500">
                                Automatically generated from manufacturer retail schedule (Batesville Proposed Display Price / Milso Current Price)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-neutral-500">$</span>
                              <input
                                type="number"
                                value={statementData.sectionI.H1_casketAmount}
                                onChange={(e) => {
                                  const updated = { ...statementData };
                                  updated.sectionI.H1_casketAmount = parseFloat(e.target.value) || 0;
                                  setStatementData(calculateAP47Totals(updated));
                                }}
                                className="w-36 p-2 bg-white border border-red-300 rounded-lg text-sm font-mono font-bold text-[#991b1b] text-right focus:ring-2 focus:ring-[#991b1b]"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Outer Interment Receptacle / Vault */}
                  <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#991b1b]" />
                        <span>Outer Interment Receptacle / Vault (GPL Range: $895.00 – $14,580.00)</span>
                      </h4>
                      <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs hover:bg-neutral-50 transition">
                        <input
                          type="checkbox"
                          checked={statementData.sectionI.H2_outerReceptacleSelected}
                          onChange={(e) => {
                            const updated = { ...statementData };
                            updated.sectionI.H2_outerReceptacleSelected = e.target.checked;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="rounded text-[#991b1b] focus:ring-[#991b1b]"
                        />
                        <span className="font-bold text-neutral-800">Include Vault in Contract</span>
                      </label>
                    </div>

                    {statementData.sectionI.H2_outerReceptacleSelected && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {CATALOG_VAULTS.map((v, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const updated = { ...statementData };
                                updated.sectionI.H2_outerReceptacleSupplier = v.supplier;
                                updated.sectionI.H2_outerReceptacleModelName = v.model;
                                updated.sectionI.H2_outerReceptacleMaterial = v.material;
                                updated.sectionI.H2_outerReceptacleAmount = v.price;
                                setStatementData(calculateAP47Totals(updated));
                              }}
                              className={`p-2.5 rounded-xl border text-left transition ${
                                statementData.sectionI.H2_outerReceptacleModelName === v.model
                                  ? 'bg-red-50 border-[#991b1b] ring-2 ring-red-400/40 shadow-xs'
                                  : 'bg-white border-neutral-200 hover:bg-neutral-100'
                              }`}
                            >
                              <div className="font-bold text-neutral-900 text-[11px]">{v.model}</div>
                              <div className="text-[10px] text-neutral-500">{v.material}</div>
                              <div className="font-mono font-bold text-[#991b1b] text-xs mt-1">
                                ${v.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Supplier:</label>
                            <input
                              type="text"
                              value={statementData.sectionI.H2_outerReceptacleSupplier}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H2_outerReceptacleSupplier = e.target.value;
                                setStatementData(updated);
                              }}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Model Name:</label>
                            <input
                              type="text"
                              value={statementData.sectionI.H2_outerReceptacleModelName}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H2_outerReceptacleModelName = e.target.value;
                                setStatementData(updated);
                              }}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Vault Price ($):</label>
                            <input
                              type="number"
                              value={statementData.sectionI.H2_outerReceptacleAmount}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H2_outerReceptacleAmount = parseFloat(e.target.value) || 0;
                                setStatementData(calculateAP47Totals(updated));
                              }}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold text-[#991b1b]"
                            />
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Urns & Keepsakes Selection Studio */}
                  <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-[#991b1b]" />
                        <div>
                          <h4 className="font-bold text-sm text-neutral-900 font-serif-title">
                            Urn & Keepsake Merchandise (Batesville & Milso)
                          </h4>
                          <p className="text-[11px] text-neutral-500 font-normal">
                            Cloisonne urns, cast bronze cubes, memory chimes, hardwood chests, tokens, and plaques.
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs hover:bg-neutral-50 transition">
                        <input
                          type="checkbox"
                          checked={statementData.sectionI.H3_urnSelected}
                          onChange={(e) => {
                            const updated = { ...statementData };
                            updated.sectionI.H3_urnSelected = e.target.checked;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="rounded text-[#991b1b] focus:ring-[#991b1b]"
                        />
                        <span className="font-bold text-neutral-800">Include Urn in Contract</span>
                      </label>
                    </div>

                    {statementData.sectionI.H3_urnSelected && (
                      <div className="space-y-3 pt-1">
                        
                        <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-neutral-700">Select Urn / Keepsake Preset:</span>
                            <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-[10px] font-medium">
                              <button
                                type="button"
                                onClick={() => setUrnManufacturerFilter('all')}
                                className={`px-2.5 py-0.5 rounded-md transition ${
                                  urnManufacturerFilter === 'all'
                                    ? 'bg-white text-neutral-900 font-bold shadow-2xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                                }`}
                              >
                                All
                              </button>
                              <button
                                type="button"
                                onClick={() => setUrnManufacturerFilter('batesville')}
                                className={`px-2.5 py-0.5 rounded-md transition ${
                                  urnManufacturerFilter === 'batesville'
                                    ? 'bg-[#991b1b] text-white font-bold shadow-2xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                                }`}
                              >
                                Batesville
                              </button>
                              <button
                                type="button"
                                onClick={() => setUrnManufacturerFilter('milso')}
                                className={`px-2.5 py-0.5 rounded-md transition ${
                                  urnManufacturerFilter === 'milso'
                                    ? 'bg-[#15803d] text-white font-bold shadow-2xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                                }`}
                              >
                                Milso
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-12">
                              <input
                                type="text"
                                placeholder="Search urns, keepsakes, medallions, cloisonne..."
                                value={urnSearchQuery}
                                onChange={(e) => setUrnSearchQuery(e.target.value)}
                                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs placeholder:text-neutral-400"
                              />
                            </div>
                          </div>

                          {(() => {
                            const urnItems = searchMerchandise(urnSearchQuery, urnManufacturerFilter, 'urn');
                            return (
                              <select
                                value={selectedUrnCatalogId}
                                onChange={(e) => {
                                  const id = e.target.value;
                                  setSelectedUrnCatalogId(id);
                                  const found = ALL_UNIFIED_MERCHANDISE.find(m => m.id === id);
                                  if (found) {
                                    const updated = { ...statementData };
                                    updated.sectionI.H3_urnSupplier = found.supplier;
                                    updated.sectionI.H3_urnModelName = found.supplier === 'Batesville Casket Company'
                                      ? `[#${found.modelCodeOrNumber}] ${found.nameOrDescription}`
                                      : found.nameOrDescription;
                                    updated.sectionI.H3_urnMaterial = found.material;
                                    updated.sectionI.H3_urnAmount = found.price;
                                    setStatementData(calculateAP47Totals(updated));
                                    showToast(`Selected: ${found.displayText}`);
                                  }
                                }}
                                className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900"
                              >
                                <option value="">-- Choose Urn / Keepsake ({urnItems.length} available) --</option>
                                {urnItems.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.supplier === 'Milso Industry'
                                      ? `[Milso] ${item.nameOrDescription} — $${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                      : `[Batesville] [#${item.modelCodeOrNumber}] ${item.nameOrDescription} — $${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                  </option>
                                ))}
                              </select>
                            );
                          })()}
                        </div>

                        <div className="pt-2 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Urn Supplier:</label>
                            <input
                              type="text"
                              value={statementData.sectionI.H3_urnSupplier}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H3_urnSupplier = e.target.value;
                                setStatementData(updated);
                              }}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Urn Model / Name:</label>
                            <input
                              type="text"
                              value={statementData.sectionI.H3_urnModelName}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H3_urnModelName = e.target.value;
                                setStatementData(updated);
                              }}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Urn Price ($):</label>
                            <input
                              type="number"
                              value={statementData.sectionI.H3_urnAmount}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionI.H3_urnAmount = parseFloat(e.target.value) || 0;
                                setStatementData(calculateAP47Totals(updated));
                              }}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold text-[#991b1b]"
                            />
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* 3.C FLOWERS & FLORAL ARRANGEMENTS */}
              {activeVariablesCategory === 'flowers' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">💐</span>
                        <h4 className="font-bold text-sm text-neutral-900 font-serif-title">Flowers & Floral Tributes (Benta&apos;s Florist Collection)</h4>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Handcrafted by our master florist. Select by category and size with real-time pricing and visual thumbnail verification.
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1.5 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs transition">
                        <input
                          type="checkbox"
                          checked={statementData.sectionI.I6_noFlowersRequested}
                          onChange={(e) => {
                            const updated = { ...statementData };
                            updated.sectionI.I6_noFlowersRequested = e.target.checked;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="rounded text-neutral-900"
                        />
                        <span className="font-bold text-neutral-800">No Flowers (In Lieu of Flowers)</span>
                      </label>
                      <div className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-xl">
                        <span className="text-xs font-mono font-bold text-[#991b1b]">
                          Total Floral: ${(statementData.sectionI.I6_totalFlowersAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!statementData.sectionI.I6_noFlowersRequested && (
                    <div className="space-y-5">
                      
                      {/* BFH Floral Arrangement Selector Box */}
                      <div className="bg-gradient-to-br from-amber-50/50 via-white to-neutral-50 p-5 rounded-2xl border-2 border-amber-300/70 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 bg-amber-200/70 text-amber-900 border border-amber-300 rounded-md text-[11px] font-bold uppercase tracking-wider">
                              BFH Florist Studio
                            </span>
                            <span className="text-xs font-bold text-neutral-800">
                              Official BFH Floral Catalog (24 Handcrafted Designs)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowVisualFloralGallery(!showVisualFloralGallery)}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>{showVisualFloralGallery ? 'Hide Photo Gallery' : 'Browse Visual Photo Gallery (24)'}</span>
                          </button>
                        </div>

                        {/* Interactive Photo Gallery Drawer */}
                        {showVisualFloralGallery && (
                          <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Click any arrangement below to configure size &amp; add to contract:</span>
                              </span>
                              <span className="text-[11px] text-neutral-500 font-mono">24 Floral Items</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto p-1">
                              {BFH_FLORAL_CATALOG.map((item) => {
                                const isSelected = selectedFloralCode === item.code;
                                return (
                                  <button
                                    key={item.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedFloralCode(item.code);
                                      if (selectedFloralCategory !== 'all' && selectedFloralCategory !== item.category) {
                                        setSelectedFloralCategory('all');
                                      }
                                    }}
                                    className={`p-2 rounded-xl border text-left transition relative group overflow-hidden cursor-pointer ${
                                      isSelected 
                                        ? 'border-[#991b1b] bg-rose-50/50 ring-2 ring-[#991b1b]/20 shadow-sm' 
                                        : 'border-neutral-200 bg-neutral-50 hover:border-amber-400 hover:bg-white'
                                    }`}
                                  >
                                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 mb-1.5 relative">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-white text-[9px] font-mono rounded">
                                        {item.code}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-neutral-900 truncate leading-tight">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-[#991b1b] font-bold mt-0.5">
                                      ${item.pricing.small} — ${item.pricing.large}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Dropdown Filters & Size Selector Grid */}
                        {(() => {
                          const activeProduct = getFloralByCode(selectedFloralCode) || BFH_FLORAL_CATALOG[0];
                          const filteredCatalog = selectedFloralCategory === 'all'
                            ? BFH_FLORAL_CATALOG
                            : BFH_FLORAL_CATALOG.filter(f => f.category === selectedFloralCategory);
                          const currentUnitPrice = activeProduct.pricing[selectedFloralSize] || 350;
                          const currentTotal = currentUnitPrice * selectedFloralQty;

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                              {/* Left Controls */}
                              <div className="lg:col-span-7 space-y-3.5 text-xs">
                                
                                {/* 1. Category Dropdown */}
                                <div>
                                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                                    <span>1. Select Floral Category:</span>
                                  </label>
                                  <select
                                    value={selectedFloralCategory}
                                    onChange={(e) => {
                                      const newCat = e.target.value as FloralCategory | 'all';
                                      setSelectedFloralCategory(newCat);
                                      if (newCat !== 'all') {
                                        const inCat = BFH_FLORAL_CATALOG.filter(f => f.category === newCat);
                                        if (inCat.length > 0 && !inCat.some(f => f.code === selectedFloralCode)) {
                                          setSelectedFloralCode(inCat[0].code);
                                        }
                                      }
                                    }}
                                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                                  >
                                    {BFH_FLORAL_CATEGORIES.map(c => (
                                      <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* 2. Arrangement Dropdown */}
                                <div>
                                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                                    <span>2. Select Floral Arrangement ({filteredCatalog.length} available):</span>
                                  </label>
                                  <select
                                    value={selectedFloralCode}
                                    onChange={(e) => setSelectedFloralCode(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                                  >
                                    {filteredCatalog.map(item => (
                                      <option key={item.code} value={item.code}>
                                        [{item.code}] {item.name} — ({item.categoryLabel})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 3. Size Selection (Generates Price) */}
                                <div>
                                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                                    <span>3. Select Size (Creates Total Price):</span>
                                    <span className="text-[10px] text-neutral-500 font-normal">Pricing based on BFH Florist scale</span>
                                  </label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {(['small', 'medium', 'large'] as FloralSize[]).map((sizeKey) => {
                                      const price = activeProduct.pricing[sizeKey];
                                      const dim = activeProduct.dimensions[sizeKey];
                                      const isSelected = selectedFloralSize === sizeKey;
                                      return (
                                        <button
                                          key={sizeKey}
                                          type="button"
                                          onClick={() => setSelectedFloralSize(sizeKey)}
                                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                                            isSelected
                                              ? 'border-[#991b1b] bg-rose-50 text-[#991b1b] ring-2 ring-[#991b1b]/20 font-bold shadow-xs'
                                              : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                                          }`}
                                        >
                                          <span className="text-xs uppercase tracking-wider">{sizeKey}</span>
                                          <span className="text-sm font-mono font-bold mt-1 text-[#991b1b]">${price.toFixed(2)}</span>
                                          <span className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{dim}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* 4. Ribbon / Banner Sash Text & Quantity */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                      Ribbon / Sash Text (Optional):
                                    </label>
                                    <input
                                      type="text"
                                      value={selectedFloralRibbon}
                                      onChange={(e) => setSelectedFloralRibbon(e.target.value)}
                                      placeholder="e.g. Loving Family, Beloved Mother, Forever in Our Hearts"
                                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {['Loving Family', 'Beloved Mother', 'Beloved Father', 'To Our Beloved Papa', 'Forever in Our Hearts'].map((phrase) => (
                                        <button
                                          key={phrase}
                                          type="button"
                                          onClick={() => setSelectedFloralRibbon(phrase)}
                                          className="text-[10px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-md transition cursor-pointer"
                                        >
                                          + {phrase}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                      Quantity:
                                    </label>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedFloralQty(Math.max(1, selectedFloralQty - 1))}
                                        className="w-8 h-9 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min={1}
                                        value={selectedFloralQty}
                                        onChange={(e) => setSelectedFloralQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold text-center"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setSelectedFloralQty(selectedFloralQty + 1)}
                                        className="w-8 h-9 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>

                              </div>

                              {/* Right Live Preview Card (Matching Director & Family Expectation) */}
                              <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                      Visual Order Verification
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-neutral-600">
                                      {activeProduct.code}
                                    </span>
                                  </div>

                                  {/* Small Image Preview That Follows The Order */}
                                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 mb-3 shadow-inner">
                                    <img
                                      src={activeProduct.imageUrl}
                                      alt={activeProduct.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-900/80 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold rounded-md">
                                      {activeProduct.categoryLabel}
                                    </div>
                                    {selectedFloralRibbon.trim() && (
                                      <div className="absolute bottom-2 left-2 right-2 bg-[#991b1b]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-bold text-center truncate shadow-md border border-amber-300/40">
                                        🎗️ Ribbon Sash: &quot;{selectedFloralRibbon.trim()}&quot;
                                      </div>
                                    )}
                                  </div>

                                  <h5 className="font-bold text-neutral-900 text-xs line-clamp-1">{activeProduct.name}</h5>
                                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{activeProduct.description}</p>
                                  
                                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                                    <span className="text-neutral-500 font-medium">
                                      Size: <strong className="text-neutral-800 uppercase">{selectedFloralSize}</strong> ({activeProduct.dimensions[selectedFloralSize]})
                                    </span>
                                    <span className="font-mono text-neutral-600">
                                      ${currentUnitPrice.toFixed(2)} &times; {selectedFloralQty}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-neutral-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-neutral-700">Total Item Price:</span>
                                    <span className="text-base font-mono font-bold text-[#991b1b]">
                                      ${currentTotal.toFixed(2)}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleAddBFHFloral}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#991b1b] to-red-800 hover:from-red-800 hover:to-[#991b1b] text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Floral Tribute to Contract</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Active Flower List with Image Thumbnails */}
                      <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                        <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
                          <span className="font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Included Floral Tribute Schedule ({(statementData.sectionI.I6_flowerItems || []).length} items):</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-[#991b1b]">
                            Total: ${(statementData.sectionI.I6_totalFlowersAmount || 0).toFixed(2)}
                          </span>
                        </div>

                        {(statementData.sectionI.I6_flowerItems || []).length === 0 ? (
                          <div className="p-6 text-center text-xs text-neutral-400">
                            No floral arrangements added yet. Use the BFH Florist selector above to add tributes.
                          </div>
                        ) : (
                          <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold text-[11px]">
                              <tr>
                                <th className="p-3">Floral Arrangement &amp; Visual Preview</th>
                                <th className="p-3 text-center">Type</th>
                                <th className="p-3 text-center">Size / Sash</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-right">Unit Price</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {(statementData.sectionI.I6_flowerItems || []).map((f) => (
                                <tr key={f.id} className="hover:bg-neutral-50/80 transition">
                                  <td className="p-3">
                                    <div className="flex items-center space-x-3">
                                      {f.imageUrl ? (
                                        <img
                                          src={f.imageUrl}
                                          alt={f.description}
                                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0 shadow-xs"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-800 shrink-0">
                                          💐
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-semibold text-neutral-900 text-xs">
                                          {f.name || f.description}
                                        </div>
                                        {f.code && (
                                          <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-mono text-[10px] font-bold">
                                            {f.code}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center font-mono uppercase text-[10px] text-neutral-500">
                                    {f.type.replace(/_/g, ' ')}
                                  </td>
                                  <td className="p-3 text-center text-[11px]">
                                    {f.size && (
                                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-bold uppercase text-[10px] block mb-0.5">
                                        {f.size}
                                      </span>
                                    )}
                                    {f.ribbonText ? (
                                      <span className="text-rose-700 italic text-[10px] block">
                                        &quot;{f.ribbonText}&quot;
                                      </span>
                                    ) : (
                                      <span className="text-neutral-400 text-[10px]">No sash</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold">{f.quantity}</td>
                                  <td className="p-3 text-right font-mono">${f.unitPrice.toFixed(2)}</td>
                                  <td className="p-3 text-right font-mono font-bold text-[#991b1b]">${(f.quantity * f.unitPrice).toFixed(2)}</td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFlower(f.id)}
                                      className="p-1.5 text-neutral-400 hover:text-red-700 transition cursor-pointer"
                                      title="Remove floral item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Custom Flower Manual Entry */}
                      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3 text-xs">
                        <span className="font-bold text-neutral-800 block flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-[#991b1b]" />
                          <span>Custom / Special Florist Arrangement Entry (Off-Catalog):</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Arrangement Type:</label>
                            <select
                              value={newCustomFlowerType}
                              onChange={(e) => setNewCustomFlowerType(e.target.value as FloralArrangementItem['type'])}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            >
                              <option value="casket_spray">Casket Spray</option>
                              <option value="standing_spray">Standing Spray</option>
                              <option value="heart_wreath">Heart Wreath</option>
                              <option value="church_basket">Church Basket</option>
                              <option value="boutonniere_corsage">Boutonniere / Corsage</option>
                              <option value="cross_wreath">Cross Wreath</option>
                              <option value="family_urn_surround">Urn Surround</option>
                              <option value="custom">Custom Piece</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-neutral-500 block mb-1">Description:</label>
                            <input
                              type="text"
                              value={newCustomFlowerDesc}
                              onChange={(e) => setNewCustomFlowerDesc(e.target.value)}
                              placeholder="e.g. Broken Heart Red Rose Wreath from Grandchildren"
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Quantity:</label>
                            <input
                              type="number"
                              min={1}
                              value={newCustomFlowerQty}
                              onChange={(e) => setNewCustomFlowerQty(parseInt(e.target.value) || 1)}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Unit Price ($):</label>
                            <input
                              type="number"
                              value={newCustomFlowerPrice}
                              onChange={(e) => setNewCustomFlowerPrice(parseFloat(e.target.value) || 0)}
                              className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomFlower}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          + Add Custom Floral Piece
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}


              {/* 3.D PRINTING & STATIONERY MATRIX */}
              {activeVariablesCategory === 'stationery' && (
                <div className="space-y-6 text-xs">
                  
                  {/* Programs & Booklets Matrix */}
                  <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#991b1b]" />
                        <span>Memorial Programs & Booklets Matrix (Type, Size, Quantity)</span>
                      </h4>
                      <span className="font-mono font-bold text-xs text-[#991b1b]">
                        Total Programs: ${statementData.sectionI.I10_programsMatrix.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'standard_bifold_50', label: 'Standard Bi-Fold (50 pk)', price: BFH_GPL_2026.stationery.standardBiFold50 },
                        { id: 'large_bifold_50', label: 'Large Bi-Fold Program (50 pk)', price: BFH_GPL_2026.stationery.largeBiFold50 },
                        { id: 'premium_designer_50', label: 'Premium Designer Program (50 pk)', price: BFH_GPL_2026.stationery.premiumDesigner50 },
                        { id: 'standard_booklet_50', label: 'Standard Multi-Page Booklet (50 pk)', price: BFH_GPL_2026.stationery.standardBooklet50 },
                        { id: 'large_booklet_50', label: 'Large Deluxe Booklet (50 pk)', price: BFH_GPL_2026.stationery.largeBooklet50 }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const updated = { ...statementData };
                            updated.sectionI.I10_programsMatrix.programType = p.id as any;
                            updated.sectionI.I10_programsMatrix.unitPrice = p.price;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className={`p-3 rounded-xl border text-left transition ${
                            statementData.sectionI.I10_programsMatrix.programType === p.id
                              ? 'bg-red-50 border-[#991b1b] ring-2 ring-red-400/40 shadow-xs'
                              : 'bg-white border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          <div className="font-bold text-neutral-900 text-[11px]">{p.label}</div>
                          <div className="font-mono font-bold text-xs text-[#991b1b] mt-1">${p.price.toFixed(2)}</div>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-200">
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Total Quantity Printed:</label>
                        <input
                          type="number"
                          value={statementData.sectionI.I10_programsMatrix.quantity}
                          onChange={(e) => {
                            const updated = { ...statementData };
                            updated.sectionI.I10_programsMatrix.quantity = parseInt(e.target.value) || 0;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Unit Price ($):</label>
                        <input
                          type="number"
                          value={statementData.sectionI.I10_programsMatrix.unitPrice}
                          onChange={(e) => {
                            const updated = { ...statementData };
                            updated.sectionI.I10_programsMatrix.unitPrice = parseFloat(e.target.value) || 0;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold text-[#991b1b]"
                        />
                      </div>
                      <div className="flex items-center pt-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={statementData.sectionI.I10_programsMatrix.lateFeeApplied}
                            onChange={(e) => {
                              const updated = { ...statementData };
                              updated.sectionI.I10_programsMatrix.lateFeeApplied = e.target.checked;
                              setStatementData(calculateAP47Totals(updated));
                            }}
                            className="rounded text-[#991b1b]"
                          />
                          <span className="font-bold text-neutral-800 text-[11px]">
                            Production Late Fee (+$125 if &lt;48h)
                          </span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Prayer Cards, Cards & Keepsakes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Prayer / Memorial Cards */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                      <span className="font-bold text-neutral-900 block">Memorial Cards (50 pk):</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...statementData };
                            updated.sectionI.I1_memorialCardsType = 'plain_50';
                            updated.sectionI.I1_memorialCardsAmount = BFH_GPL_2026.stationery.memorialCardsPlain50;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className={`p-2 rounded-lg border text-left ${
                            statementData.sectionI.I1_memorialCardsType === 'plain_50'
                              ? 'bg-[#991b1b] text-white font-bold'
                              : 'bg-white'
                          }`}
                        >
                          <div>Plain Text (50 pk)</div>
                          <div className="font-mono text-xs">$145.00</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...statementData };
                            updated.sectionI.I1_memorialCardsType = 'with_photo_50';
                            updated.sectionI.I1_memorialCardsAmount = BFH_GPL_2026.stationery.memorialCardsWithPhoto50;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className={`p-2 rounded-lg border text-left ${
                            statementData.sectionI.I1_memorialCardsType === 'with_photo_50'
                              ? 'bg-[#991b1b] text-white font-bold'
                              : 'bg-white'
                          }`}
                        >
                          <div>With Photo (50 pk)</div>
                          <div className="font-mono text-xs">$200.00</div>
                        </button>
                      </div>
                    </div>

                    {/* Acknowledgement & Thank You Cards */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                      <span className="font-bold text-neutral-900 block">Thank You Cards (25 pk - $20.00):</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={statementData.sectionI.I2_acknowledgementCardsQty}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 0;
                            const updated = { ...statementData };
                            updated.sectionI.I2_acknowledgementCardsQty = qty;
                            updated.sectionI.I2_acknowledgementCardsAmount = (qty / 25) * BFH_GPL_2026.stationery.stockThankYouCards25;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="w-24 p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                        />
                        <span className="text-neutral-500">cards total ($ {statementData.sectionI.I2_acknowledgementCardsAmount.toFixed(2)})</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* 3.E FACILITIES & REPAST ROOM (REPASS) */}
              {activeVariablesCategory === 'facilities_repast' && (
                <div className="space-y-6 text-xs">
                  
                  {/* Repast Room Reservation Card */}
                  <div className="bg-[#fcfbfa] p-5 rounded-2xl border-2 border-emerald-300/80 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                            🍽️
                          </span>
                          <h4 className="font-serif-title font-bold text-base text-neutral-900">
                            BFH 2nd-Floor Historic Repast Room (Repass Fellowship)
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
                          Private gathering room for family repast, fellowship meal, tables, linen, chairs, warming station & staff supervision.
                        </p>
                      </div>
                      <label className="flex items-center space-x-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-2xs">
                        <input
                          type="checkbox"
                          checked={statementData.sectionI.F3_repastRoomAmount > 0}
                          onChange={(e) => {
                            const updated = { ...statementData };
                            updated.sectionI.F3_repastRoomAmount = e.target.checked ? BFH_GPL_2026.repastRoomBase : 0;
                            setStatementData(calculateAP47Totals(updated));
                            showToast(e.target.checked ? '🍽️ Added Repast Room Reservation ($1,400.00)' : 'Removed Repast Room');
                          }}
                          className="rounded text-emerald-700 focus:ring-emerald-700"
                        />
                        <span className="font-bold text-neutral-900 text-xs">
                          {statementData.sectionI.F3_repastRoomAmount > 0 ? '✓ Repast Reserved ($1,400)' : 'Include Repast Room ($1,400)'}
                        </span>
                      </label>
                    </div>

                    {statementData.sectionI.F3_repastRoomAmount > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-3 bg-white rounded-xl border border-neutral-200">
                          <span className="text-[10px] text-neutral-500 block">Room Base Fee</span>
                          <strong className="font-mono text-sm text-[#991b1b]">${statementData.sectionI.F3_repastRoomAmount.toFixed(2)}</strong>
                          <span className="text-[10px] text-neutral-500 block">Per BFH GPL Section I.F3</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-neutral-200">
                          <span className="text-[10px] text-neutral-500 block">Seating Capacity</span>
                          <strong className="text-neutral-900 text-xs">Up to 80 Family Guests</strong>
                          <span className="text-[10px] text-neutral-500 block">Round tables & banquet buffet</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-neutral-200">
                          <span className="text-[10px] text-neutral-500 block">Catering / Staff Coordination</span>
                          <strong className="text-neutral-900 text-xs">Hostess / Setup Included</strong>
                          <span className="text-[10px] text-neutral-500 block">Food warming & post-event cleanup</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chapel & Visitation Facilities Breakdown */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-4">
                    <h4 className="font-bold text-sm text-neutral-900 border-b border-neutral-200 pb-2">
                      Chapel Gathering & Ceremony Facility Allocation
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Memorial Service Facilities */}
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <strong className="text-neutral-900">Memorial Service Facilities (Chapel)</strong>
                          <span className="font-mono font-bold text-xs text-[#991b1b]">${statementData.sectionI.F3_facilitiesMemorialServiceAmount.toFixed(2)}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600">
                          Use of Chapel A (120 seats) or Chapel B (110 seats) for memorial service celebration.
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="number"
                            value={statementData.sectionI.F3_facilitiesMemorialServiceAmount}
                            onChange={(e) => {
                              const updated = { ...statementData };
                              updated.sectionI.F3_facilitiesMemorialServiceAmount = parseFloat(e.target.value) || 0;
                              setStatementData(calculateAP47Totals(updated));
                            }}
                            className="w-28 p-1.5 bg-white border border-neutral-300 rounded font-mono"
                          />
                          <span className="text-[10px] text-neutral-500">Facility line item ($)</span>
                        </div>
                      </div>

                      {/* Memorial Service Supervision */}
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <strong className="text-neutral-900">Memorial Service Staff Supervision</strong>
                          <span className="font-mono font-bold text-xs text-[#991b1b]">${statementData.sectionI.E3_supervisionMemorialAmount.toFixed(2)}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600">
                          Licensed Funeral Director supervision and staff ushering for memorial service.
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="number"
                            value={statementData.sectionI.E3_supervisionMemorialAmount}
                            onChange={(e) => {
                              const updated = { ...statementData };
                              updated.sectionI.E3_supervisionMemorialAmount = parseFloat(e.target.value) || 0;
                              setStatementData(calculateAP47Totals(updated));
                            }}
                            className="w-28 p-1.5 bg-white border border-neutral-300 rounded font-mono"
                          />
                          <span className="text-[10px] text-neutral-500">Supervision line item ($)</span>
                        </div>
                      </div>

                      {/* Visitation Facilities */}
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <strong className="text-neutral-900">Visitation / Viewing Facilities</strong>
                          <span className="font-mono font-bold text-xs text-[#991b1b]">${statementData.sectionI.F1_facilitiesVisitationAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="number"
                            value={statementData.sectionI.F1_facilitiesVisitationAmount}
                            onChange={(e) => {
                              const updated = { ...statementData };
                              updated.sectionI.F1_facilitiesVisitationAmount = parseFloat(e.target.value) || 0;
                              setStatementData(calculateAP47Totals(updated));
                            }}
                            className="w-28 p-1.5 bg-white border border-neutral-300 rounded font-mono"
                          />
                          <span className="text-[10px] text-neutral-500">Visitation line item ($)</span>
                        </div>
                      </div>

                      {/* Funeral Service Facilities */}
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <strong className="text-neutral-900">Funeral Service Facilities</strong>
                          <span className="font-mono font-bold text-xs text-[#991b1b]">${statementData.sectionI.F2_facilitiesFuneralServiceAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="number"
                            value={statementData.sectionI.F2_facilitiesFuneralServiceAmount}
                            onChange={(e) => {
                              const updated = { ...statementData };
                              updated.sectionI.F2_facilitiesFuneralServiceAmount = parseFloat(e.target.value) || 0;
                              setStatementData(calculateAP47Totals(updated));
                            }}
                            className="w-28 p-1.5 bg-white border border-neutral-300 rounded font-mono"
                          />
                          <span className="text-[10px] text-neutral-500">Funeral Service line item ($)</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* 3.F CASH ADVANCES & PASS-THROUGH AP CHECKS GENERATOR */}
              {activeVariablesCategory === 'cash_advances' && (
                <div className="space-y-4 text-xs">
                  
                  {/* Executive Pass-Through Check Generator Banner */}
                  <div className="bg-gradient-to-r from-[#141b2b] via-[#1e2738] to-[#141b2b] text-white p-4 rounded-2xl border-2 border-amber-400/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#991b1b] text-white flex items-center justify-center font-bold shadow border border-amber-300">
                        <HandCoins className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            100% PASS-THROUGH • 0% MARKUP
                          </span>
                          <span className="text-xs text-neutral-300 font-mono">
                            10 NYCRR § 77.8 Compliance
                          </span>
                        </div>
                        <h4 className="font-serif-title text-sm sm:text-base font-bold text-white tracking-wide">
                          Accounts Payable Pass-Through Check Generator
                        </h4>
                        <p className="text-[11px] text-neutral-300">
                          Disbursements paid to third-party vendors on family's behalf with deceased name &amp; case # in memo.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckPrinterOpen(true)}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md border border-amber-400/50"
                      >
                        <Printer className="w-4 h-4 text-amber-300" />
                        <span>🖨️ Preview &amp; Print Checks (${statementData.sectionII.totalCashAdvances.toFixed(2)})</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">Cash Advance Items (Actual Third-Party Invoices)</h4>
                      <p className="text-xs text-neutral-500">Edit any pass-through item. Changes dynamically update printed checks and Form AP-47.</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#991b1b]">
                      Total Cash Advances: ${statementData.sectionII.totalCashAdvances.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white rounded-2xl border-2 border-amber-300 shadow-xs space-y-2.5 sm:col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🏛️</span>
                          <div>
                            <label className="font-bold text-xs text-neutral-900 block">
                              1. Cemetery or Crematory Fee (Pass-Through):
                            </label>
                            <span className="text-[10px] text-neutral-500">
                              Selected Cemetery: <strong className="text-neutral-900">{statementData.sectionII.cemeteryOrCrematoryName || activeCase.serviceSelections.crematoryOrCemeteryName || "The Woodlawn Cemetery & Crematory"}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsCemeteryModalOpen(true)}
                          className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5 text-amber-300" />
                          <span>Select Cemetery from Directory</span>
                        </button>
                      </div>

                      {/* Quick Fee Options for Current Cemetery */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-600 block uppercase tracking-wider">
                          Quick-Select Standard Fee Schedule for this Cemetery:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 text-[11px]">
                          {[
                            { label: 'Ground Burial', amount: 1850, icon: '⚰️' },
                            { label: 'Cremation Retort', amount: 475, icon: '🔥' },
                            { label: 'Witness Cremation', amount: 750, icon: '👁️' },
                            { label: 'Mausoleum Crypt', amount: 2250, icon: '🏛️' },
                            { label: 'Urn Niche', amount: 650, icon: '🏺' },
                            { label: 'VA Veteran', amount: 0, icon: '🎖️' }
                          ].map((tier) => {
                            const isSelected = statementData.sectionII.cemeteryOrCrematoryAmount === tier.amount;
                            return (
                              <button
                                key={tier.label}
                                type="button"
                                onClick={() => {
                                  const updated = { ...statementData };
                                  updated.sectionII.cemeteryOrCrematoryAmount = tier.amount;
                                  setStatementData(calculateAP47Totals(updated));
                                  showToast(`Applied ${tier.label} fee: $${tier.amount.toFixed(2)}`);
                                }}
                                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-[#991b1b] text-white border-[#991b1b] font-bold shadow-xs'
                                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                                }`}
                              >
                                <span className="text-xs">{tier.icon}</span>
                                <span className="text-[10px] truncate">{tier.label}</span>
                                <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-[#991b1b]'}`}>
                                  {tier.amount === 0 ? '$0.00' : `$${tier.amount}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fee Input Field */}
                      <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-neutral-500 italic">
                          Payee on Pass-Through Check: <strong className="text-neutral-800">{statementData.sectionII.cemeteryOrCrematoryName || activeCase.serviceSelections.crematoryOrCemeteryName || "Woodlawn Cemetery & Crematory"}</strong>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-neutral-700">Custom Invoice Amount:</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={statementData.sectionII.cemeteryOrCrematoryAmount}
                              onChange={(e) => {
                                const updated = { ...statementData };
                                updated.sectionII.cemeteryOrCrematoryAmount = parseFloat(e.target.value) || 0;
                                setStatementData(calculateAP47Totals(updated));
                              }}
                              className="w-32 pl-6 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold text-xs focus:bg-white focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <label className="font-bold text-neutral-800 block">2. Clergy Honoraria / Church Fee:</label>
                      <input
                        type="number"
                        value={statementData.sectionII.clergyHonorariaAmount}
                        onChange={(e) => {
                          const updated = { ...statementData };
                          updated.sectionII.clergyHonorariaAmount = parseFloat(e.target.value) || 0;
                          setStatementData(calculateAP47Totals(updated));
                        }}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                      />
                      <p className="text-[10px] text-neutral-500 italic">Payee: {statementData.sectionII.clergyChurchName || activeCase.serviceSelections.officiantName || "Abyssinian Baptist Church / Officiant"}</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <label className="font-bold text-neutral-800 block">3. NYC Certified Death Certificate Transcripts ($15/ea):</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={statementData.sectionII.deathCertificateTranscriptsCount}
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            const updated = { ...statementData };
                            updated.sectionII.deathCertificateTranscriptsCount = count;
                            setStatementData(calculateAP47Totals(updated));
                          }}
                          className="w-20 p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                        />
                        <span className="text-neutral-500 font-mono">copies = ${statementData.sectionII.deathCertificateTranscriptsAmount.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 italic">Payee: NYC Dept. of Health &amp; Mental Hygiene (DOHMH)</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <label className="font-bold text-neutral-800 block">4. Organist / Musician Accompaniment:</label>
                      <input
                        type="number"
                        value={statementData.sectionII.organistMusicianAmount}
                        onChange={(e) => {
                          const updated = { ...statementData };
                          updated.sectionII.organistMusicianAmount = parseFloat(e.target.value) || 0;
                          setStatementData(calculateAP47Totals(updated));
                        }}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                      />
                      <p className="text-[10px] text-neutral-500 italic">Payee: {statementData.sectionII.organistMusicianName || activeCase.serviceSelections.organistName || "Sanctuary Organist & Musician"}</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <label className="font-bold text-neutral-800 block">5. Pallbearers (Professional Crew):</label>
                      <input
                        type="number"
                        value={statementData.sectionII.pallbearersAmount}
                        onChange={(e) => {
                          const updated = { ...statementData };
                          updated.sectionII.pallbearersAmount = parseFloat(e.target.value) || 0;
                          setStatementData(calculateAP47Totals(updated));
                        }}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                      />
                      <p className="text-[10px] text-neutral-500 italic">Payee: Harlem Professional Pallbearers Guild</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <label className="font-bold text-neutral-800 block">6. Bridge &amp; Road Tolls / Livery Gratuities:</label>
                      <input
                        type="number"
                        value={statementData.sectionII.bridgeAndRoadTollsAmount + statementData.sectionII.gratuitiesLiveryAndStaffAmount}
                        onChange={(e) => {
                          const updated = { ...statementData };
                          updated.sectionII.bridgeAndRoadTollsAmount = parseFloat(e.target.value) || 0;
                          setStatementData(calculateAP47Totals(updated));
                        }}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                      />
                      <p className="text-[10px] text-neutral-500 italic">Payee: MTA Bridges &amp; Tunnels / Chauffeur Tolls Pool</p>
                    </div>
                  </div>

                  {/* Custom Cash Advances List */}
                  {(statementData.sectionII.customCashAdvances || []).length > 0 && (
                    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold">
                          <tr>
                            <th className="p-3">Cash Advance Description</th>
                            <th className="p-3 text-right">Amount ($)</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {statementData.sectionII.customCashAdvances.map((c) => (
                            <tr key={c.id} className="hover:bg-neutral-50">
                              <td className="p-3 font-semibold text-neutral-900">{c.description}</td>
                              <td className="p-3 text-right font-mono font-bold text-amber-700">${c.amount.toFixed(2)}</td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomCashAdvance(c.id)}
                                  className="p-1 text-neutral-400 hover:text-red-700"
                                  title="Remove cash advance item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Custom Cash Advance Builder */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                    <span className="font-bold text-neutral-800 block flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#991b1b]" />
                      <span>Add Other Specific Cash Advance:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={newCashAdvDesc}
                          onChange={(e) => setNewCashAdvDesc(e.target.value)}
                          placeholder="e.g. Consular Document Certification or Church Sexton Fee"
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={newCashAdvAmount}
                          onChange={(e) => setNewCashAdvAmount(parseFloat(e.target.value) || 0)}
                          placeholder="Amount ($)"
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomCashAdvance}
                      className="px-4 py-2 bg-[#991b1b] hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      + Add Cash Advance
                    </button>
                  </div>

                  {/* Live Generated Checks Ledger Summary Box */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <HandCoins className="w-4 h-4 text-[#991b1b]" />
                        <span className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                          Auto-Generated Check Vouchers for Date of Service:
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCheckPrinterOpen(true)}
                        className="text-xs text-[#991b1b] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Open 3-Part Voucher Printer</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-neutral-700 space-y-1">
                      <p>
                        • <strong>Memo format on each check:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono text-[10px] text-[#991b1b]">{activeCase.decedent.legalName} • Case #{activeCase.caseNumber} • Svc Date: {statementData.agreementDate || '09/24/2026'}</code>
                      </p>
                      <p>
                        • <strong>Bank account:</strong> JPMorgan Chase Operating Pass-Through (**4892)
                      </p>
                      <p>
                        • <strong>Staff time saved:</strong> Automated drafting eliminates manual check writing and ensures 100% accurate delivery stubs at cemetery/church on the day of service.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Step 3 Navigation Bar */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Back to Step 2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                >
                  <span>Proceed to Step 4: Live Official Form AP-47 Contract Preview</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 4: LIVE OFFICIAL 2-PAGE FORM AP-47 CONTRACT PREVIEW */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Banner with Action Buttons */}
              <div className="bg-neutral-100 p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-neutral-900 text-sm">Official Form AP-47 Itemization Verification</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      NYS DOH Compliant
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px]">
                    Verified against General Price List (Effective April 13, 2026).
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyContractSummary}
                    className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl font-bold transition flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl font-bold transition flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print 2-Page Contract</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToGoldenRecord}
                    className="px-5 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-md shadow-red-950/20"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Save & Sync to Case</span>
                  </button>
                </div>
              </div>

              {/* RENDERED FORM AP-47 DOCUMENT CANVAS */}
              <div 
                id="official-form-ap47-contract"
                className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-neutral-400 shadow-2xl text-neutral-900 space-y-6 text-xs font-sans print:p-0 print:border-none print:shadow-none"
              >
                
                {/* ----------------- PAGE 1 ----------------- */}
                <div className="space-y-4 pb-8 border-b-2 border-neutral-900">
                  
                  {/* Page 1 Header */}
                  <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-3">
                    <div className="space-y-0.5">
                      <div className="font-serif-title italic font-bold text-lg text-neutral-800">
                        "A Celebration of Life"
                      </div>
                      <h2 className="font-serif-title font-bold text-2xl text-[#991b1b] tracking-wider">
                        Benta's Funeral Home, Inc.
                      </h2>
                      <p className="text-[11px] text-neutral-600">
                        630 St. Nicholas Avenue (Corner of W. 141st Street) • New York, NY 10030 • (212) 281-8850-1-2-3
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs space-y-1">
                      <div>Number: <strong>{statementData.invoiceNumber}</strong></div>
                      <div>Date: <strong>{statementData.agreementDate}</strong></div>
                    </div>
                  </div>

                  {/* Deceased Metadata Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-300 text-[11px]">
                    <div><span className="text-neutral-500 block text-[9px]">Name of Deceased:</span> <strong>{activeCase.decedent.legalName}</strong></div>
                    <div><span className="text-neutral-500 block text-[9px]">Date of Death:</span> <strong>{activeCase.decedent.dateOfDeath}</strong></div>
                    <div><span className="text-neutral-500 block text-[9px]">Place of Death:</span> <strong>{activeCase.decedent.facilityName || 'Mount Sinai Morningside'}</strong></div>
                    <div><span className="text-neutral-500 block text-[9px]">Invoice To:</span> <strong>{activeCase.informant.fullName} (NOK)</strong></div>
                  </div>

                  <div className="text-center font-bold text-xs uppercase tracking-wider font-serif-title text-neutral-900 py-1 bg-neutral-100 rounded">
                    ITEMIZATION OF FUNERAL SERVICES AND MERCHANDISE SELECTED
                  </div>

                  <p className="text-[10px] text-neutral-600 italic">
                    The following are the charges for the services, merchandise, and livery you have selected. You will not be charged for any item you do not choose unless it is necessary because of other selections you have made. Any such charges are explained below.
                  </p>

                  {/* SECTION I: FUNERAL HOME CHARGES (2-Column Layout) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] border-t border-neutral-300 pt-3">
                    
                    {/* Left Column (A through E) */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-xs uppercase text-[#991b1b] border-b border-neutral-200 pb-1">
                        I. FUNERAL HOME CHARGES
                      </h5>

                      {/* A. Alternative Services */}
                      <div className="flex justify-between items-start">
                        <span>A. Alternative Services:</span>
                        <strong className="font-mono">
                          {statementData.sectionI.A_alternativeServicesAmount > 0 
                            ? `$${statementData.sectionI.A_alternativeServicesAmount.toFixed(2)}` 
                            : 'N/A'}
                        </strong>
                      </div>

                      {/* B. Transfer of Remains */}
                      <div className="flex justify-between items-start">
                        <span>B. Transfer of remains to the funeral establishment:</span>
                        <strong className="font-mono">${statementData.sectionI.B_transferOfRemainsAmount.toFixed(2)}</strong>
                      </div>

                      {/* C. Preparation of Remains */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>C. Preparation of Remains:</span>
                        </div>
                        <div className="pl-3 space-y-0.5 text-neutral-700 text-[10px]">
                          <div className="flex justify-between">
                            <span>1. Embalming (including use of prep room):</span>
                            <span className="font-mono">${statementData.sectionI.C1_embalmingAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>2. Other Preparation:</span>
                          </div>
                          <div className="pl-3 space-y-0.5 text-neutral-600">
                            <div className="flex justify-between">
                              <span>a. Topical Disinfection:</span>
                              <span className="font-mono">${statementData.sectionI.C2_topicalDisinfectionAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>b. Custodial Care:</span>
                              <span className="font-mono">${statementData.sectionI.C2_custodialCareAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>c. Dressing/Casketing:</span>
                              <span className="font-mono">${statementData.sectionI.C2_dressingCasketingAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>d. Cosmetology:</span>
                              <span className="font-mono">${statementData.sectionI.C2_cosmetologyAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>e. Restoration / Other:</span>
                              <span className="font-mono">${(statementData.sectionI.C2_restorationAmount + statementData.sectionI.C2_otherAmount).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* D. Arrangements */}
                      <div className="flex justify-between items-start">
                        <div className="max-w-[75%]">
                          <strong>D. Arrangements:</strong>
                          <p className="text-[9px] text-neutral-500 leading-tight mt-0.5">
                            Basic arrangements: funeral director, staff, equipment and facilities to respond to initial request, conference, securing authorizations, and coordination.
                          </p>
                        </div>
                        <strong className="font-mono">${statementData.sectionI.D_basicArrangementsAmount.toFixed(2)}</strong>
                      </div>

                      {/* E. Supervision */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <strong>E. Supervision (funeral director and staff):</strong>
                        </div>
                        <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                          <div className="flex justify-between">
                            <span>1. Supervision for visitation:</span>
                            <span className="font-mono">${statementData.sectionI.E1_supervisionVisitationAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>2. Supervision for funeral service:</span>
                            <span className="font-mono">${statementData.sectionI.E2_supervisionFuneralServiceAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>3. Other supervision (Cemetery/Crematory):</span>
                            <span className="font-mono">${statementData.sectionI.E3_supervisionCemeteryCrematoryAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column (F through J) */}
                    <div className="space-y-3">
                      
                      {/* F. Use of Facilities */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <strong>F. Use of the facilities:</strong>
                        </div>
                        <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                          <div className="flex justify-between">
                            <span>1. Use of facilities for visitation:</span>
                            <span className="font-mono">${statementData.sectionI.F1_facilitiesVisitationAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>2. Use of facilities for funeral service:</span>
                            <span className="font-mono">${statementData.sectionI.F2_facilitiesFuneralServiceAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* G. Livery */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <strong>G. Livery:</strong>
                          <strong className="font-mono">${statementData.sectionI.G_totalLiveryAmount.toFixed(2)}</strong>
                        </div>
                        <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                          {(statementData.sectionI.G_vehicles || []).map((v, i) => (
                            <div key={i} className="flex justify-between">
                              <span>• {v.vehicleType} ({v.count}x):</span>
                              <span className="font-mono">${(v.count * v.unitPrice).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* H. Merchandise */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <strong>H. Merchandise:</strong>
                        </div>
                        <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                          <div className="flex justify-between">
                            <span>1. Casket / Container ({statementData.sectionI.H1_casketModelNameOrNumber || 'Selected'}):</span>
                            <span className="font-mono">${statementData.sectionI.H1_casketAmount.toFixed(2)}</span>
                          </div>
                          {statementData.sectionI.H2_outerReceptacleSelected && (
                            <div className="flex justify-between">
                              <span>2. Outer Receptacle ({statementData.sectionI.H2_outerReceptacleModelName}):</span>
                              <span className="font-mono">${statementData.sectionI.H2_outerReceptacleAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {statementData.sectionI.H3_urnSelected && (
                            <div className="flex justify-between">
                              <span>3. Urn ({statementData.sectionI.H3_urnModelName}):</span>
                              <span className="font-mono">${statementData.sectionI.H3_urnAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* I. Additional Services and Merchandise */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <strong>I. Additional Services & Merchandise:</strong>
                        </div>
                        <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                          <div className="flex justify-between">
                            <span>• Memorial / Prayer Cards ({statementData.sectionI.I1_memorialCardsQty}x):</span>
                            <span className="font-mono">${statementData.sectionI.I1_memorialCardsAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Printed Programs ({statementData.sectionI.I10_programsMatrix.quantity}x):</span>
                            <span className="font-mono">${statementData.sectionI.I10_programsMatrix.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Floral Arrangements ({statementData.sectionI.I6_flowerItems.length} items):</span>
                            <span className="font-mono">${statementData.sectionI.I6_totalFlowersAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Register Book & Video Tribute:</span>
                            <span className="font-mono">${(statementData.sectionI.I8_registerBookAmount + statementData.sectionI.I11_videoTributeAmount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section I Total */}
                      <div className="flex justify-between pt-2 border-t-2 border-neutral-900 font-bold text-xs text-neutral-900">
                        <span>TOTAL OF FUNERAL HOME CHARGES:</span>
                        <span className="font-mono text-[#991b1b]">${statementData.sectionI.totalFuneralHomeCharges.toFixed(2)}</span>
                      </div>

                    </div>

                  </div>

                </div>

                {/* ----------------- PAGE 2 ----------------- */}
                <div className="space-y-4 pt-2">
                  
                  {/* Page 2 Title */}
                  <div className="text-center font-bold text-xs uppercase tracking-wider font-serif-title text-neutral-900 py-1 bg-neutral-100 rounded">
                    STATEMENT OF GOODS AND SERVICES SELECTED — PAGE 2
                  </div>

                  {/* SECTION II: CASH ADVANCES & SECTION III: SUMMARY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                    
                    {/* Left Column: Cash Advances */}
                    <div className="space-y-3 border border-neutral-300 rounded-xl p-3.5">
                      <div className="flex justify-between items-center border-b border-neutral-200 pb-1">
                        <h5 className="font-bold text-xs uppercase text-[#991b1b]">
                          II. CASH ADVANCES (Paid to Others on Family's Behalf)
                        </h5>
                        <button
                          type="button"
                          onClick={() => setIsCheckPrinterOpen(true)}
                          className="px-2.5 py-1 bg-[#991b1b] hover:bg-red-800 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-xs border border-amber-300/40"
                        >
                          <Printer className="w-3 h-3 text-amber-300" />
                          <span>Print Checks (${statementData.sectionII.totalCashAdvances.toFixed(2)})</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-neutral-500 italic">
                        These are estimated charges for items to be paid to others. We will charge you no more for these items than is actually paid the third parties.
                      </p>

                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span>1. Cemetery or Crematory:</span>
                          <span className="font-mono">${statementData.sectionII.cemeteryOrCrematoryAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2. Clergy Honoraria / Church:</span>
                          <span className="font-mono">${statementData.sectionII.clergyHonorariaAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3. Death Certificate Transcripts ({statementData.sectionII.deathCertificateTranscriptsCount}x):</span>
                          <span className="font-mono">${statementData.sectionII.deathCertificateTranscriptsAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>4. Organist / Musician Accompaniment:</span>
                          <span className="font-mono">${statementData.sectionII.organistMusicianAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>5. Pallbearers:</span>
                          <span className="font-mono">${statementData.sectionII.pallbearersAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>6. Gratuities & Livery Tips:</span>
                          <span className="font-mono">${statementData.sectionII.gratuitiesLiveryAndStaffAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>7. Bridge & Road Tolls:</span>
                          <span className="font-mono">${statementData.sectionII.bridgeAndRoadTollsAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>8. E-Vital Filing Fees:</span>
                          <span className="font-mono">${statementData.sectionII.eVitalFilingFeeAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-neutral-300 font-bold text-xs text-neutral-900">
                        <span>ESTIMATED TOTAL OF CASH ADVANCES:</span>
                        <span className="font-mono">${statementData.sectionII.totalCashAdvances.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Right Column: Summary of Charges & Balances */}
                    <div className="space-y-3 bg-red-50/60 border border-red-200 rounded-xl p-3.5">
                      <h5 className="font-bold text-xs uppercase text-[#991b1b] border-b border-red-200 pb-1">
                        III. SUMMARY OF CHARGES
                      </h5>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span>1. Funeral Home Charges:</span>
                          <span className="font-mono font-bold">${statementData.sectionIII.funeralHomeChargesTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2. Cash Advances:</span>
                          <span className="font-mono font-bold">${statementData.sectionIII.cashAdvancesTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-red-200 text-sm font-bold text-[#991b1b]">
                          <span>TOTAL FUNERAL CHARGES:</span>
                          <span className="font-mono">${statementData.sectionIII.totalFuneralCharges.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-800 font-bold text-xs pt-1">
                          <span>Less Payments / Life Insurance Credit:</span>
                          <span className="font-mono">-${statementData.sectionIII.lessCreditsAndInsurance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-neutral-900 pt-1 border-t border-red-300">
                          <span>BALANCE DUE:</span>
                          <span className="font-mono text-base text-red-900">${statementData.sectionIII.balanceDue.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-red-200 text-[10px] text-neutral-600 space-y-0.5">
                        <div><strong>Terms:</strong> This account becomes due upon arrangement completion. Late charge of 1.5% per month applies to balances past due.</div>
                      </div>
                    </div>

                  </div>

                  {/* SECTION IV: EXPLANATION OF CHARGES & STATUTORY CHECKBOXES */}
                  <div className="border border-neutral-300 rounded-xl p-3.5 space-y-3 text-[10px] text-neutral-700">
                    <h5 className="font-bold text-xs uppercase text-neutral-900 border-b border-neutral-200 pb-1">
                      IV. EXPLANATION OF CHARGES & STATUTORY AUTHORIZATIONS
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Custody Authorization */}
                      <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                        <div className="font-bold text-neutral-900 flex items-center gap-1">
                          <span className="text-emerald-700">☑</span>
                          <span>Custody Authorization:</span>
                        </div>
                        <p className="text-[9px] text-neutral-500">
                          "The undersigned hereby authorizes Benta's Funeral Home, Inc. or its representatives to obtain custody of the remains of {activeCase.decedent.legalName}."
                        </p>
                        <span className="font-bold text-neutral-800 block text-[9px]">
                          Authorized by: {activeCase.informant.fullName} ({activeCase.informant.relationship})
                        </span>
                      </div>

                      {/* Embalming Authorization */}
                      <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                        <div className="font-bold text-neutral-900 flex items-center gap-1">
                          <span className="text-emerald-700">☑</span>
                          <span>Embalming Authorization (10 NYCRR § 77.7):</span>
                        </div>
                        <p className="text-[9px] text-neutral-500">
                          "The undersigned hereby authorizes the above funeral establishment [✓] to embalm [ ] not to embalm the remains."
                        </p>
                        <span className="font-bold text-neutral-800 block text-[9px]">
                          Selected: {statementData.sectionIV.embalmingAuthorization.choice === 'embalm' ? 'Embalming Authorized for Public Viewing' : 'Direct Disposition / No Embalming'}
                        </span>
                      </div>

                    </div>

                    {/* FTC Rule & GPL Prior Receipt Acknowledgement */}
                    <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-[10px] space-y-1">
                      <p className="font-bold text-neutral-900">
                        "Charges are only for those items that are used. If we are required by law to use any items, we will explain the reasons in writing below."
                      </p>
                      <p className="text-neutral-600 text-[9px]">
                        "Prior to the discussion of these funeral arrangements, I was presented with a copy of this funeral firm's 'General Price List' for which I hereby acknowledge receipt, and have had an opportunity to review the firm's Casket Price List and Outer Interment Receptacle Price List."
                      </p>
                    </div>

                    {/* Public Notice & Warranty Exclusion */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9px] text-neutral-500 pt-1">
                      <div>
                        <strong>PUBLIC NOTICE:</strong> The New York State Department of Health is responsible for licensing and regulating New York State funeral directing under the Public Health Law.
                        <br />
                        <em>Bureau of Funeral Directing, NYS Dept of Health, 875 Central Avenue, Albany, NY 12206.</em>
                      </div>
                      <div>
                        <strong>EXCLUSION OF WARRANTY:</strong> The only warranties, express or implied, granted in connection with the goods sold with this funeral service are the express written warranties, if any, extended by the manufacturers thereof.
                      </div>
                    </div>

                    {/* Dual Signatures */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-neutral-300">
                      <div>
                        <div className="border-b border-neutral-900 pb-1 font-serif italic text-sm text-[#991b1b]">
                          {activeCase.informant.fullName} (Electronic Jurat Verified)
                        </div>
                        <span className="text-[9px] text-neutral-500 block mt-0.5">
                          Signature of Purchaser / Next of Kin • {statementData.agreementDate}
                        </span>
                      </div>

                      <div>
                        <div className="border-b border-neutral-900 pb-1 font-serif italic text-sm text-neutral-900">
                          {activeCase.assignedDirector || 'Jason Benta, NYS LFD #08850'}
                        </div>
                        <span className="text-[9px] text-neutral-500 block mt-0.5">
                          Signature of Licensed Funeral Director • Benta's Funeral Home, Inc.
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Step 4 Footer Navigation Bar */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Back to Step 3
                </button>
                <button
                  type="button"
                  onClick={handleSaveToGoldenRecord}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-8 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-red-950/20"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save & Complete Form AP-47 Statement</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 3-Part Pass-Through Check Voucher Printer Modal */}
      {isCheckPrinterOpen && (
        <CashAdvanceCheckPrinterModal
          isOpen={isCheckPrinterOpen}
          onClose={() => setIsCheckPrinterOpen(false)}
          caseData={activeCase}
          customStatement={statementData}
          onUpdateChecks={(updatedChecks) => {
            const updated = { ...statementData, cashAdvanceChecks: updatedChecks };
            setStatementData(updated);
          }}
        />
      )}

      {/* Family Portal PIN & Onboarding Guidance Modal */}
      {isFamilyPortalPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200">
            
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Arrangement Finalized & Locked
                  </span>
                  <h3 className="font-serif-title text-xl font-bold text-neutral-900 pt-0.5">
                    Family Portal PIN & Benefits Guide
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsFamilyPortalPinModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                    Case Access PIN for {activeCase.informant.fullName}
                  </span>
                  <p className="text-xs text-amber-800">
                    Share this secure PIN with the family or use Master Manager PIN <code className="font-mono font-bold bg-amber-200 px-1 py-0.5 rounded">3995</code>.
                  </p>
                </div>
                <div className="bg-neutral-900 text-amber-300 font-mono text-2xl font-black px-4 py-2 rounded-xl border border-amber-400/40 tracking-widest shadow-inner">
                  1948
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Benta's Funeral Home - Family Portal Access\nCase: ${activeCase.caseNumber} (${activeCase.decedent.legalName})\nAccess URL: https://e-bfh.com\nFamily PIN: 1948 (or Manager PIN: 3995)`);
                    showToast('✓ Family Portal credentials copied to clipboard!');
                  }}
                  className="w-full bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-700" />
                  <span>Copy Family Credentials & Portal Link</span>
                </button>
              </div>
            </div>

            {/* Funeral Director Onboarding Steps */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Funeral Director Onboarding Checklist:
              </h4>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">1.</span>
                  <span><strong>Hand over PIN:</strong> Provide PIN <code className="font-mono text-neutral-900">1948</code> to {activeCase.informant.fullName}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">2.</span>
                  <span><strong>Guide Through Portal:</strong> Open the Family Portal on the office tablet or family phone and demonstrate the portal's advantages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">3.</span>
                  <span><strong>Showcase 360 Voice Archive:</strong> Demonstrate the living audio studio with 4-pillar prompts (Joy, Pain, Sacrifice, Action) and AI poem formatting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">4.</span>
                  <span><strong>Preview Keepsake Volume:</strong> Show how voice stanzas and photos compile into the museum-grade Heirloom Coffee Table Book with scan-to-stream QR codes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">5.</span>
                  <span><strong>Transparent Financials:</strong> Explain that relatives can review the itemized AP-47 ledger and contribute via Split-Pay.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsFamilyPortalPinModalOpen(false);
                  onClose();
                }}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md"
              >
                Close & Return to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tri-State Cemetery & Crematory Directory & Pricing Modal */}
      {isCemeteryModalOpen && (
        <CemeterySelectionModal
          isOpen={isCemeteryModalOpen}
          onClose={() => setIsCemeteryModalOpen(false)}
          currentCemeteryName={statementData.sectionII.cemeteryOrCrematoryName || activeCase.serviceSelections.crematoryOrCemeteryName}
          currentFeeAmount={statementData.sectionII.cemeteryOrCrematoryAmount}
          onSelectCemetery={handleCemeterySelected}
        />
      )}

    </div>
  );
};
