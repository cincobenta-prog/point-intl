import React, { useState } from 'react';
import { GoldenRecordCase, DocumentItem, DocumentStatus, BFHFormType, ClothingChecklistData, JewelryItemSpec } from '../../lib/types/funeral';
import { getDefaultStatementOfGoodsForCase } from '../../lib/data/generalPriceList';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  Eye, 
  PenTool, 
  Printer, 
  Check, 
  X,
  FileCheck2,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';

interface DocumentJourneyMatrixProps {
  caseData: GoldenRecordCase;
  onUpdateDocumentStatus: (docId: string, newStatus: DocumentStatus) => void;
  onOpenESign: (doc?: DocumentItem) => void;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
}

export const DocumentJourneyMatrix: React.FC<DocumentJourneyMatrixProps> = ({
  caseData,
  onUpdateDocumentStatus,
  onOpenESign,
  onUpdateCase
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [clothingSavedToast, setClothingSavedToast] = useState(false);

  // Initialized Clothing Submittal Form State (Interactive & Editable)
  const [clothingData, setClothingData] = useState<ClothingChecklistData>(() => {
    if (caseData.clothingSubmittal) {
      return caseData.clothingSubmittal;
    }
    return {
      socks: true,
      socksNotes: 'Black dress socks / stockings',
      pants: true,
      pantsNotes: 'Navy blue wool dress trousers',
      shirt: true,
      shirtNotes: 'White French cuff dress shirt',
      underwear: true,
      underwearNotes: 'Full undergarment set / undershirt',
      shoes: true,
      shoesNotes: 'Black polished Oxford dress shoes (Size 10.5M)',
      dress: false,
      dressNotes: '',
      panties: false,
      pantiesNotes: '',
      wig: false,
      wigNotes: '',
      jacket: true,
      jacketNotes: 'Navy blue 2-button suit jacket with gold lapel pin',
      tie: true,
      tieNotes: 'Navy and gold silk necktie',
      pocketSquare: true,
      pocketSquareNotes: 'Burgundy silk pocket square',
      jewelryList: [
        { id: 'j-1', item: 'Watch / Timepiece', description: 'Vintage Gold Pocket Watch', checked: true, disposition: 'return_to_family' },
        { id: 'j-2', item: 'Ring(s) / Wedding Band', description: '14k Gold Band on left ring finger', checked: true, disposition: 'remain_on_decedent' },
        { id: 'j-3', item: 'Necklace / Chain', description: 'Gold Figaro chain with cross', checked: false, disposition: 'remain_on_decedent' },
        { id: 'j-4', item: 'Earrings', description: 'Pearl stud earrings', checked: false, disposition: 'remain_on_decedent' },
        { id: 'j-5', item: 'Bracelet', description: 'Silver link bracelet', checked: false, disposition: 'remain_on_decedent' },
        { id: 'j-6', item: 'Rosary / Blessed Beads', description: 'Handmade Black Rosary', checked: true, disposition: 'remain_on_decedent' },
        { id: 'j-7', item: 'Eyeglasses / Reading Glasses', description: 'Gold-rimmed reading glasses (Display for viewing, remove prior to service)', checked: true, disposition: 'return_to_family' },
        { id: 'j-8', item: 'Lapel Pins / Medals', description: 'U.S. Veteran Ribbons & Masonic Pin', checked: true, disposition: 'remain_on_decedent' }
      ],
      customItems: [],
      casketNumber: 'CSK-8819-CH',
      casketName: 'The St. Nicholas Heritage Casket',
      namePlate: true,
      hairdresserAssigned: true,
      hairdresserName: 'Kelvin Brooks (646-508-3474)',
      cosmeticsNotes: 'Natural tones, warm complexion styling. Family provided reference portrait photo for hairline taper fade.',
      deliveredBy: caseData.informant.fullName || 'Family Representative',
      deliveredByPhone: caseData.informant.phone || '(212) 555-0198',
      receivedByDirector: caseData.assignedDirector || 'Jason Benta (Director in Charge)',
      dateReceived: caseData.createdAt.split('T')[0],
      isCompleted: false,
      lastUpdated: undefined
    };
  });

  const [newCustomJewelryName, setNewCustomJewelryName] = useState('');
  const [newCustomJewelryDesc, setNewCustomJewelryDesc] = useState('');
  const [newCustomJewelryDisp, setNewCustomJewelryDisp] = useState<'remain_on_decedent' | 'return_to_family'>('remain_on_decedent');

  const handleSaveClothingSubmittal = () => {
    const updatedClothing: ClothingChecklistData = {
      ...clothingData,
      isCompleted: true,
      lastUpdated: new Date().toLocaleString()
    };
    setClothingData(updatedClothing);

    // Update document status in case
    const updatedDocuments = caseData.documents.map(d => {
      if (d.formType === 'clothing_transmittal') {
        return {
          ...d,
          status: 'completed' as DocumentStatus,
          lastUpdated: new Date().toLocaleString()
        };
      }
      return d;
    });

    const docTarget = caseData.documents.find(d => d.formType === 'clothing_transmittal');
    if (docTarget) {
      onUpdateDocumentStatus(docTarget.id, 'completed');
    }

    if (onUpdateCase) {
      onUpdateCase({
        ...caseData,
        clothingSubmittal: updatedClothing,
        documents: updatedDocuments
      });
    }

    setClothingSavedToast(true);
    setTimeout(() => setClothingSavedToast(false), 4000);
  };

  const handleAddCustomJewelry = () => {
    if (!newCustomJewelryName.trim()) return;
    const newItem: JewelryItemSpec = {
      id: `j-custom-${Date.now()}`,
      item: newCustomJewelryName.trim(),
      description: newCustomJewelryDesc.trim() || 'Family personal item',
      checked: true,
      disposition: newCustomJewelryDisp
    };
    setClothingData(prev => ({
      ...prev,
      jewelryList: [...prev.jewelryList, newItem]
    }));
    setNewCustomJewelryName('');
    setNewCustomJewelryDesc('');
  };

  const handleRemoveJewelry = (id: string) => {
    setClothingData(prev => ({
      ...prev,
      jewelryList: prev.jewelryList.filter(j => j.id !== id)
    }));
  };

  const applySuitPreset = () => {
    setClothingData(prev => ({
      ...prev,
      socks: true,
      pants: true,
      shirt: true,
      underwear: true,
      shoes: true,
      dress: false,
      panties: false,
      wig: false,
      jacket: true,
      tie: true,
      pocketSquare: true
    }));
  };

  const applyDressPreset = () => {
    setClothingData(prev => ({
      ...prev,
      socks: true,
      dress: true,
      panties: true,
      underwear: true,
      shoes: true,
      wig: true,
      pants: false,
      jacket: false,
      tie: false,
      pocketSquare: false
    }));
  };

  const handleToggleAllGarments = (checked: boolean) => {
    setClothingData(prev => ({
      ...prev,
      socks: checked,
      pants: checked,
      shirt: checked,
      underwear: checked,
      shoes: checked,
      dress: checked,
      panties: checked,
      wig: checked,
      jacket: checked,
      tie: checked,
      pocketSquare: checked
    }));
  };

  const filteredDocs = caseData.documents.filter(doc => {
    if (selectedPhase === 'all') return true;
    return doc.phase === selectedPhase;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
      case 'signed':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            {status}
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#991b1b] bg-red-50 px-2.5 py-1 rounded-full border border-red-200 uppercase animate-pulse">
            <AlertTriangle className="w-3 h-3 text-[#991b1b]" />
            Urgent Action
          </span>
        );
      case 'generated':
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase">
            <Send className="w-3 h-3 text-amber-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200 uppercase">
            <Clock className="w-3 h-3 text-neutral-400" />
            Pending
          </span>
        );
    }
  };

  // Helper to render the authentic official Benta form content
  const renderOfficialFormContent = (doc: DocumentItem) => {
    const formType: BFHFormType = doc.formType || 'general_document';

    switch (formType) {
      // -------------------------------------------------------------
      // FORM 1: VITAL RECORD INFORMATION
      // -------------------------------------------------------------
      case 'vital_records':
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-neutral-900 pb-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif-title font-bold text-base shadow-sm">
                  B
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-xl text-neutral-900 tracking-wide">
                    BENTA'S FUNERAL HOME, INC.
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">630 St. Nicholas Avenue, New York, NY 10030 • (212) 281-8850</p>
                </div>
              </div>
              <div className="text-right sm:text-right">
                <h4 className="font-bold text-base tracking-widest text-[#991b1b] font-serif-title uppercase">
                  VITAL RECORD INFORMATION
                </h4>
                <p className="font-mono text-xs font-bold text-neutral-600">Case No: {caseData.caseNumber}</p>
              </div>
            </div>

            {/* Decedent Identity & Residence */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border-b border-neutral-300 pb-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Name of Decedent:</span>
                  <strong className="text-sm text-neutral-900 font-serif-title">{caseData.decedent.legalName}</strong>
                </div>
                <div className="border-b border-neutral-300 pb-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Any Other Known Names of Deceased:</span>
                  <span className="text-xs text-neutral-800 font-medium">None / N/A</span>
                </div>
              </div>

              <div className="border-b border-neutral-300 pb-1">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Residence of Loved One:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-xs text-neutral-800">
                  <div><span className="text-[9px] text-neutral-400 block">Street & Number:</span> <strong>{caseData.decedent.residenceAddress}</strong></div>
                  <div><span className="text-[9px] text-neutral-400 block">Apt:</span> <strong>Apt 4B</strong></div>
                  <div><span className="text-[9px] text-neutral-400 block">City & State:</span> <strong>{caseData.decedent.city}, {caseData.decedent.state}</strong></div>
                  <div><span className="text-[9px] text-neutral-400 block">Zip:</span> <strong>{caseData.decedent.zipCode}</strong></div>
                </div>
              </div>
            </div>

            {/* Demographics & Place of Death */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-neutral-300 pb-3">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Date of Death:</span>
                <strong className="text-neutral-900">{caseData.decedent.dateOfDeath}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Sex:</span>
                <strong className="text-neutral-900 capitalize">{caseData.decedent.gender}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Education:</span>
                <strong className="text-neutral-900">Master's Degree / Doctorate</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Social Security #:</span>
                <strong className="font-mono text-neutral-900">{caseData.decedent.ssnMasked}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-neutral-300 pb-3">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Place of Death:</span>
                <strong className="text-neutral-900">{caseData.decedent.placeOfDeath}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Date of Birth & Age:</span>
                <strong className="text-neutral-900">{caseData.decedent.dateOfBirth} (72 Years)</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Birth Place:</span>
                <strong className="text-neutral-900">Harlem, New York, USA</strong>
              </div>
            </div>

            {/* Marital, Race, Occupation, Military */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-neutral-300 pb-3">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Marital Status:</span>
                <strong className="text-neutral-900 capitalize">{caseData.decedent.maritalStatus}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Race:</span>
                <strong className="text-neutral-900">Black / African American</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Occupation & Business:</span>
                <strong className="text-neutral-900">{caseData.decedent.occupation}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Military Status:</span>
                <strong className="text-neutral-900">{caseData.decedent.branchOfService || 'U.S. Navy (Veteran)'}</strong>
              </div>
            </div>

            {/* Parents & Spouse */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-neutral-300 pb-3">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Father's Name:</span>
                <strong className="text-neutral-900">{caseData.decedent.fatherName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Mother's Name (First & Maiden):</span>
                <strong className="text-neutral-900">{caseData.decedent.motherMaidenName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Spouse Name (First & Maiden):</span>
                <strong className="text-neutral-900">{caseData.informant.fullName} (DOB: 04/12/1956)</strong>
              </div>
            </div>

            {/* Informant & Next of Kin */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
              <span className="font-bold text-xs text-[#991b1b] uppercase tracking-wider block">
                Informant (Legal Next of Kin) Details:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div><span className="text-[9px] text-neutral-500 block">Name:</span> <strong>{caseData.informant.fullName}</strong></div>
                <div><span className="text-[9px] text-neutral-500 block">Relationship:</span> <strong>{caseData.informant.relationship}</strong></div>
                <div><span className="text-[9px] text-neutral-500 block">Telephone (Cell/Home):</span> <strong>{caseData.informant.phone}</strong></div>
                <div><span className="text-[9px] text-neutral-500 block">Email:</span> <strong className="truncate block">{caseData.informant.email}</strong></div>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 block">Address:</span>
                <strong>{caseData.informant.address}</strong>
              </div>
            </div>

            {/* Cemetery Deed & Interment Details */}
            <div className="border border-neutral-200 p-3.5 rounded-xl space-y-1.5 text-[11px] text-neutral-700">
              <span className="font-bold text-neutral-900 block">Cemetery Deed & Previous Interment Information:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div><span className="text-[9px] text-neutral-400 block">Deed Owner:</span> <span>Eleanor Vance</span></div>
                <div><span className="text-[9px] text-neutral-400 block">Address:</span> <span>Same as residence</span></div>
                <div><span className="text-[9px] text-neutral-400 block">Previous Interment:</span> <span>None (New Plot)</span></div>
                <div><span className="text-[9px] text-neutral-400 block">How Related:</span> <span>Spouse</span></div>
              </div>
            </div>

            {/* Jurat / Verification */}
            <div className="pt-4 border-t-2 border-neutral-900 flex flex-col sm:flex-row justify-between items-end text-xs gap-4">
              <div>
                <p className="text-[11px] text-neutral-700 italic">
                  The above vital information was reviewed and verified by <strong>{caseData.informant.fullName}</strong> on <strong>{caseData.createdAt.split('T')[0]}</strong>.
                </p>
                <div className="border-b border-neutral-900 w-56 mt-4 mb-1" />
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Signature of Informant / Next of Kin</span>
              </div>
              <div className="text-right">
                <div className="border-b border-neutral-900 w-56 mt-4 mb-1 ml-auto" />
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Jason Benta, Licensed Funeral Director</span>
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // FORM 2: STATEMENT OF GOODS AND SERVICES SELECTED (FORM AP-47)
      // -------------------------------------------------------------
      case 'statement_goods_services': {
        const ap47 = caseData.statementOfGoods || getDefaultStatementOfGoodsForCase(caseData);
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-10 rounded-xl border-2 border-neutral-400 shadow-sm print:p-0 print:border-none">
            
            {/* PAGE 1 */}
            <div className="space-y-4 pb-6 border-b-2 border-neutral-900">
              
              {/* Header */}
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
                  <div>Number: <strong>{ap47.invoiceNumber || `${caseData.caseNumber}-AP47`}</strong></div>
                  <div>Date: <strong>{ap47.agreementDate || caseData.serviceSelections.serviceDate || '2026-09-22'}</strong></div>
                </div>
              </div>

              {/* Case & Invoice Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-300 text-[11px]">
                <div><span className="text-[9px] text-neutral-500 block">Name of Deceased:</span> <strong>{caseData.decedent.legalName}</strong></div>
                <div><span className="text-[9px] text-neutral-500 block">Date of Death:</span> <strong>{caseData.decedent.dateOfDeath}</strong></div>
                <div><span className="text-[9px] text-neutral-500 block">Place of Death:</span> <strong>{caseData.decedent.facilityName || 'Mount Sinai Morningside'}</strong></div>
                <div><span className="text-[9px] text-neutral-500 block">Invoice To:</span> <strong>{caseData.informant.fullName} (NOK)</strong></div>
              </div>

              <div className="text-center font-bold text-xs uppercase tracking-wider font-serif-title text-neutral-900 py-1 bg-neutral-100 rounded">
                ITEMIZATION OF FUNERAL SERVICES AND MERCHANDISE SELECTED
              </div>

              <p className="text-[10px] text-neutral-600 italic">
                The following are the charges for the services, merchandise, and livery you have selected. You will not be charged for any item you do not choose unless it is necessary because of other selections you have made. Any such charges are explained below.
              </p>

              {/* Section I: Funeral Home Charges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] border-t border-neutral-300 pt-3">
                
                {/* Left Column (A-E) */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs uppercase text-[#991b1b] border-b border-neutral-200 pb-1">
                    I. FUNERAL HOME CHARGES
                  </h5>

                  <div className="flex justify-between">
                    <span>A. Alternative Services:</span>
                    <strong className="font-mono">
                      {ap47.sectionI.A_alternativeServicesAmount > 0 
                        ? `$${ap47.sectionI.A_alternativeServicesAmount.toFixed(2)}` 
                        : 'N/A'}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>B. Transfer of remains to the funeral establishment:</span>
                    <strong className="font-mono">${ap47.sectionI.B_transferOfRemainsAmount.toFixed(2)}</strong>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>C. Preparation of Remains:</span>
                    </div>
                    <div className="pl-3 space-y-0.5 text-neutral-700 text-[10px]">
                      <div className="flex justify-between">
                        <span>1. Embalming (including use of prep room):</span>
                        <span className="font-mono">${ap47.sectionI.C1_embalmingAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Other Preparation:</span>
                      </div>
                      <div className="pl-3 space-y-0.5 text-neutral-600">
                        <div className="flex justify-between">
                          <span>a. Topical Disinfection:</span>
                          <span className="font-mono">${ap47.sectionI.C2_topicalDisinfectionAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>b. Custodial Care:</span>
                          <span className="font-mono">${ap47.sectionI.C2_custodialCareAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>c. Dressing/Casketing:</span>
                          <span className="font-mono">${ap47.sectionI.C2_dressingCasketingAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>d. Cosmetology:</span>
                          <span className="font-mono">${ap47.sectionI.C2_cosmetologyAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>e. Restoration / Other:</span>
                          <span className="font-mono">${(ap47.sectionI.C2_restorationAmount + ap47.sectionI.C2_otherAmount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="max-w-[75%]">
                      <strong>D. Arrangements:</strong>
                      <p className="text-[9px] text-neutral-500 leading-tight">
                        Basic arrangements: funeral director, staff, equipment and facilities to respond to initial request, conference, securing authorizations, and coordination.
                      </p>
                    </div>
                    <strong className="font-mono">${ap47.sectionI.D_basicArrangementsAmount.toFixed(2)}</strong>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <strong>E. Supervision (funeral director and staff):</strong>
                    </div>
                    <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                      <div className="flex justify-between">
                        <span>1. Supervision for visitation:</span>
                        <span className="font-mono">${ap47.sectionI.E1_supervisionVisitationAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Supervision for funeral service:</span>
                        <span className="font-mono">${ap47.sectionI.E2_supervisionFuneralServiceAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Other supervision (Cemetery/Crematory):</span>
                        <span className="font-mono">${ap47.sectionI.E3_supervisionCemeteryCrematoryAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column (F-J) */}
                <div className="space-y-3">
                  
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <strong>F. Use of the facilities:</strong>
                    </div>
                    <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                      <div className="flex justify-between">
                        <span>1. Use of facilities for visitation:</span>
                        <span className="font-mono">${ap47.sectionI.F1_facilitiesVisitationAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Use of facilities for funeral service:</span>
                        <span className="font-mono">${ap47.sectionI.F2_facilitiesFuneralServiceAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <strong>G. Livery:</strong>
                      <strong className="font-mono">${ap47.sectionI.G_totalLiveryAmount.toFixed(2)}</strong>
                    </div>
                    <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                      {(ap47.sectionI.G_vehicles || []).map((v, i) => (
                        <div key={i} className="flex justify-between">
                          <span>• {v.vehicleType} ({v.count}x):</span>
                          <span className="font-mono">${(v.count * v.unitPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <strong>H. Merchandise:</strong>
                    </div>
                    <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                      <div className="flex justify-between">
                        <span>1. Casket ({ap47.sectionI.H1_casketModelNameOrNumber || 'Selected'}):</span>
                        <span className="font-mono">${ap47.sectionI.H1_casketAmount.toFixed(2)}</span>
                      </div>
                      {ap47.sectionI.H2_outerReceptacleSelected && (
                        <div className="flex justify-between">
                          <span>2. Outer Receptacle ({ap47.sectionI.H2_outerReceptacleModelName}):</span>
                          <span className="font-mono">${ap47.sectionI.H2_outerReceptacleAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <strong>I. Additional Services & Merchandise:</strong>
                    </div>
                    <div className="pl-3 space-y-0.5 text-[10px] text-neutral-700">
                      <div className="flex justify-between">
                        <span>• Memorial Cards & Booklets:</span>
                        <span className="font-mono">${(ap47.sectionI.I1_memorialCardsAmount + ap47.sectionI.I10_programsMatrix.totalAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Flowers & Tributes ({ap47.sectionI.I6_flowerItems.length} items):</span>
                        <span className="font-mono">${ap47.sectionI.I6_totalFlowersAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Register Book & Video Tribute:</span>
                        <span className="font-mono">${(ap47.sectionI.I8_registerBookAmount + ap47.sectionI.I11_videoTributeAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t-2 border-neutral-900 font-bold text-xs text-neutral-900">
                    <span>TOTAL FUNERAL HOME CHARGES:</span>
                    <span className="font-mono text-[#991b1b]">${ap47.sectionI.totalFuneralHomeCharges.toFixed(2)}</span>
                  </div>

                </div>

              </div>

            </div>

            {/* PAGE 2 */}
            <div className="space-y-4 pt-2">
              <div className="text-center font-bold text-xs uppercase tracking-wider font-serif-title text-neutral-900 py-1 bg-neutral-100 rounded">
                STATEMENT OF GOODS AND SERVICES SELECTED — PAGE 2
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                
                {/* Cash Advances */}
                <div className="space-y-2 border border-neutral-300 rounded-xl p-3.5">
                  <h5 className="font-bold text-xs uppercase text-[#991b1b] border-b border-neutral-200 pb-1">
                    II. CASH ADVANCES (Paid to Others on Family's Behalf)
                  </h5>
                  <p className="text-[9px] text-neutral-500 italic">
                    Charges actually paid to third parties on the family's behalf.
                  </p>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span>1. Cemetery or Crematory:</span>
                      <span className="font-mono">${ap47.sectionII.cemeteryOrCrematoryAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Clergy Honoraria / Church:</span>
                      <span className="font-mono">${ap47.sectionII.clergyHonorariaAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Death Certificate Transcripts ({ap47.sectionII.deathCertificateTranscriptsCount}x):</span>
                      <span className="font-mono">${ap47.sectionII.deathCertificateTranscriptsAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4. Organist / Musician:</span>
                      <span className="font-mono">${ap47.sectionII.organistMusicianAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5. Pallbearers, Tolls & Tips:</span>
                      <span className="font-mono">${(ap47.sectionII.pallbearersAmount + ap47.sectionII.bridgeAndRoadTollsAmount + ap47.sectionII.gratuitiesLiveryAndStaffAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-neutral-300 font-bold text-xs text-neutral-900">
                    <span>ESTIMATED TOTAL CASH ADVANCES:</span>
                    <span className="font-mono">${ap47.sectionII.totalCashAdvances.toFixed(2)}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2 bg-red-50/60 border border-red-200 rounded-xl p-3.5">
                  <h5 className="font-bold text-xs uppercase text-[#991b1b] border-b border-red-200 pb-1">
                    III. SUMMARY OF CHARGES
                  </h5>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>1. Funeral Home Charges:</span>
                      <span className="font-mono font-bold">${ap47.sectionIII.funeralHomeChargesTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Cash Advances:</span>
                      <span className="font-mono font-bold">${ap47.sectionIII.cashAdvancesTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-red-200 text-sm font-bold text-[#991b1b]">
                      <span>TOTAL FUNERAL CHARGES:</span>
                      <span className="font-mono">${ap47.sectionIII.totalFuneralCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold text-xs pt-1">
                      <span>Less Payments / Life Insurance:</span>
                      <span className="font-mono">-${ap47.sectionIII.lessCreditsAndInsurance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-neutral-900 pt-1 border-t border-red-300">
                      <span>BALANCE DUE:</span>
                      <span className="font-mono text-base text-red-900">${ap47.sectionIII.balanceDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Section IV Explanations & Signatures */}
              <div className="border border-neutral-300 rounded-xl p-3.5 space-y-3 text-[10px] text-neutral-700">
                <h5 className="font-bold text-xs uppercase text-neutral-900 border-b border-neutral-200 pb-1">
                  IV. EXPLANATION OF CHARGES & STATUTORY AUTHORIZATIONS
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="font-bold text-neutral-900 flex items-center gap-1">
                      <span className="text-emerald-700">☑</span>
                      <span>Custody Authorization:</span>
                    </div>
                    <p className="text-[9px] text-neutral-500 mt-0.5">
                      "The undersigned hereby authorizes Benta's Funeral Home, Inc. to obtain physical custody of the remains."
                    </p>
                    <span className="font-bold text-neutral-800 block text-[9px] mt-1">
                      Authorized by: {caseData.informant.fullName} ({caseData.informant.relationship})
                    </span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="font-bold text-neutral-900 flex items-center gap-1">
                      <span className="text-emerald-700">☑</span>
                      <span>Embalming Authorization (10 NYCRR § 77.7):</span>
                    </div>
                    <p className="text-[9px] text-neutral-500 mt-0.5">
                      "The undersigned hereby authorizes Benta's Funeral Home [✓] to embalm [ ] not to embalm the remains."
                    </p>
                    <span className="font-bold text-neutral-800 block text-[9px] mt-1">
                      Embalming Authorized for Public Viewing
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[9px] space-y-0.5 text-neutral-700">
                  <p className="font-bold text-neutral-900">
                    "Charges are only for those items that are used. If we are required by law to use any items, we will explain the reasons in writing below."
                  </p>
                  <p>
                    "Prior to the discussion of these funeral arrangements, I was presented with a copy of this funeral firm's 'General Price List' for which I hereby acknowledge receipt, and have had an opportunity to review the firm's Casket Price List and Outer Interment Receptacle Price List."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-neutral-300">
                  <div>
                    <div className="border-b border-neutral-900 pb-1 font-serif italic text-sm text-[#991b1b]">
                      {caseData.informant.fullName} (Electronic Jurat Verified)
                    </div>
                    <span className="text-[9px] text-neutral-500 block mt-0.5">
                      Signature of Purchaser / Next of Kin • {ap47.agreementDate}
                    </span>
                  </div>

                  <div>
                    <div className="border-b border-neutral-900 pb-1 font-serif italic text-sm text-neutral-900">
                      {caseData.assignedDirector || 'Jason Benta, NYS LFD #08850'}
                    </div>
                    <span className="text-[9px] text-neutral-500 block mt-0.5">
                      Signature of Licensed Funeral Director • Benta's Funeral Home, Inc.
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        );
      }

      // -------------------------------------------------------------
      // FORM 3: AT-NEED WRITTEN STATEMENT OF PERSON HAVING RIGHT TO CONTROL DISPOSITION (NYS § 4201)
      // -------------------------------------------------------------
      case 'right_to_control':
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            {/* Header */}
            <div className="text-center border-b-2 border-neutral-900 pb-3 space-y-1">
              <h3 className="font-serif-title font-bold text-base uppercase tracking-wider text-neutral-900">
                AT-NEED WRITTEN STATEMENT OF PERSON HAVING THE RIGHT TO CONTROL DISPOSITION
              </h3>
              <p className="text-xs text-neutral-500 italic">(Provided to Funeral Director)</p>
              <h4 className="font-bold text-sm tracking-widest text-[#991b1b] uppercase font-serif-title pt-1">
                PERSON OTHER THAN AGENT
              </h4>
            </div>

            {/* Statutory Attestation */}
            <div className="space-y-3 leading-relaxed text-xs text-neutral-800">
              <p>
                <strong>I, {caseData.informant.fullName}</strong>, hereby represent and assert that I am entitled to control the disposition of the remains of <strong>{caseData.decedent.legalName}</strong>.
              </p>
              <p>
                I further represent that I am the person having priority to control the disposition in accordance with Subdivision 2 of Section 4201 of the New York State Public Health Law. The order of priority set forth in Subdivision 2 of Section 4201 of the NYS Public Health Law is the following:
              </p>

              {/* 11-Tier Priority List */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 font-mono text-[11px] text-neutral-700">
                <p>1. Person designated in written instrument pursuant to Section 4201;</p>
                <p><strong>2. Spouse [✓ {caseData.informant.fullName}];</strong></p>
                <p>3. Domestic Partner;</p>
                <p>4. Children 18 or Older;</p>
                <p>5. Either of the Parents;</p>
                <p>6. Any Sibling 18 or Older;</p>
                <p>7. Authorized Guardian;</p>
                <p>8. Grandchildren, Great-Grandchildren, Nieces/Nephews, Grandparents, Aunts/Uncles, First Cousins;</p>
                <p>9. Fiduciary;</p>
                <p>10. Close friend or relative reasonably familiar with decedent's wishes;</p>
                <p>11. Public Administrator.</p>
              </div>

              <p className="pt-2">
                I also have no knowledge that the decedent executed a will containing directions for the disposition of his/her remains, or designated an agent by executing a written instrument pursuant to Section 4201 of the Public Health Law.
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="pt-6 border-t-2 border-neutral-900 flex flex-col sm:flex-row justify-between items-end text-xs gap-4">
              <div>
                <p className="font-mono text-xs font-bold text-neutral-600 mb-4">Date: {caseData.createdAt.split('T')[0]}</p>
                <div className="border-b border-neutral-900 w-56 mb-1" />
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Signature of Person Granting Authority ({caseData.informant.fullName})</span>
              </div>
              <div className="text-right text-[11px] text-neutral-500 font-mono">
                <p>Original — Funeral Director</p>
                <p>Copy — Next-of-Kin</p>
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // FORM 4: ENGAGEMENT OF SERVICES & FINANCIAL RESPONSIBILITY AFFIDAVIT
      // -------------------------------------------------------------
      case 'engagement_financial':
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            {/* Header */}
            <div className="text-center border-b-2 border-neutral-900 pb-3 space-y-1">
              <h2 className="font-serif-title font-bold text-2xl text-[#991b1b] tracking-wider">
                BENTA'S FUNERAL HOME, INC.
              </h2>
              <p className="text-xs text-neutral-600 font-medium">
                630 St. Nicholas Ave. New York, NY 10030 • Tel: 212.281.8850 • Fax: 212.234.3600 • WWW.E-BFH.COM
              </p>
              <h4 className="font-bold text-sm uppercase tracking-widest text-neutral-900 pt-2 font-serif-title">
                ENGAGEMENT OF SERVICES & FINANCIAL RESPONSIBILITY AFFIDAVIT
              </h4>
            </div>

            {/* Engagement Statement */}
            <div className="space-y-4 leading-relaxed text-xs text-neutral-800">
              <p className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <strong>I, {caseData.informant.fullName}</strong>, residing at <strong>{caseData.informant.address}</strong>, hereby engage the services of <strong>Benta's Funeral Home, Inc.</strong> to remove the remains of <strong>{caseData.decedent.legalName}</strong>, my <strong>{caseData.informant.relationship}</strong>, who died at <strong>{caseData.decedent.placeOfDeath}</strong> on the <strong>{caseData.decedent.dateOfDeath.split('-')[2] || '16th'}</strong> day of <strong>September, 2026</strong>, and <strong>embalm</strong> and prepare for <strong>{caseData.dispositionType.replace('_', ' ')}</strong>.
              </p>

              <p className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <strong>I, {caseData.informant.fullName}</strong>, will be financially responsible for any fees necessary related to this removal of <strong>{caseData.decedent.legalName}</strong> and for embalming, or refrigeration and or storage of the remains.
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-xs text-[#991b1b]">
                "This obligation is binding even if another funeral establishment is chosen after the services have been provided."
              </div>
            </div>

            {/* Notary Jurat */}
            <div className="pt-6 border-t-2 border-neutral-900 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[11px] text-neutral-600">Subscribed and sworn to before me this {new Date().getDate()} day of September, 2026.</p>
                </div>
                <div className="text-right">
                  <div className="border-b border-neutral-900 w-48 mb-1 ml-auto" />
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">L.S. Signature of Principal</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-between items-end">
                <div>
                  <div className="border-b border-neutral-900 w-56 mb-1" />
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Notary Public — Commissioner of Deeds</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">NY County Notary Reg #02BE6389201</span>
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // FORM 5: CLOTHING & DRESSING TRANSMITTAL SUBMITTAL FORM (EDITABLE)
      // -------------------------------------------------------------
      case 'clothing_transmittal':
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-2xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            
            {/* Success Toast / Notification Banner */}
            {clothingSavedToast && (
              <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                  <div>
                    <strong className="block text-xs font-bold">Clothing Submittal Saved & Transmitted</strong>
                    <span className="text-[11px] text-emerald-100">
                      Garment specifications and jewelry dispositions recorded in the Golden Record preparation suite.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-700/80 px-2.5 py-1 rounded-full font-mono">
                  Status: Completed ✓
                </span>
              </div>
            )}

            {/* Form Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-neutral-900 pb-4 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif-title font-bold text-base shadow-sm">
                  B
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                    BENTA'S FUNERAL HOME, INC.
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    630 St. Nicholas Ave, New York, NY 10030 • Preparation & Dressing Department
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h4 className="font-bold text-base tracking-widest text-[#991b1b] font-serif-title uppercase">
                  CLOTHING TRANSMITTAL & JEWELRY LOG
                </h4>
                <div className="flex items-center justify-end space-x-2 mt-1">
                  <span className="font-mono text-xs text-neutral-600 font-bold">Case: {caseData.caseNumber}</span>
                  {clothingData.isCompleted && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      Completed ✓
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Presets & Form Toolbar */}
            <div className="bg-[#fcfbfa] p-3.5 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-neutral-600 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Quick Presets:
                </span>
                <button
                  type="button"
                  onClick={applySuitPreset}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg border border-neutral-300 text-xs font-semibold transition shadow-2xs"
                >
                  🎩 Men's Full Suit Ensemble
                </button>
                <button
                  type="button"
                  onClick={applyDressPreset}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg border border-neutral-300 text-xs font-semibold transition shadow-2xs"
                >
                  👗 Women's Dress & Gown Ensemble
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllGarments(true)}
                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg border border-neutral-300 text-[11px] font-medium transition"
                >
                  ✓ Check All
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg border border-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveClothingSubmittal}
                  className="px-4 py-1.5 bg-[#991b1b] hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm border border-amber-300/40"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save & Finalize Transmittal</span>
                </button>
              </div>
            </div>

            {/* Case & Decedent Metadata Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Name of Deceased:</span>
                <strong className="text-sm text-neutral-900 font-serif-title">{caseData.decedent.legalName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Service Date:</span>
                <strong className="text-neutral-800">{caseData.serviceSelections.serviceDate || 'Pending Schedule'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Funeral Director:</span>
                <strong className="text-neutral-800">{clothingData.receivedByDirector || caseData.assignedDirector}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Case Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  Preparation & Dressing Hub
                </span>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* SECTION 1: CLOTHING & GARMENT CHECK-OFFS (EDITABLE)         */}
            {/* ----------------------------------------------------------- */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-1.5">
                <span className="font-bold text-xs uppercase text-neutral-900 tracking-wider">
                  1. Garments & Apparel Received Check-Offs:
                </span>
                <span className="text-[11px] text-neutral-500">
                  Select all items delivered by the family for dressing.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                
                {/* Socks */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.socks ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.socks}
                      onChange={(e) => setClothingData(prev => ({ ...prev, socks: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">🧦 Socks / Stockings</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.socksNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, socksNotes: e.target.value }))}
                    placeholder="e.g. Black dress socks, sheer stockings"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Pants */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.pants ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.pants}
                      onChange={(e) => setClothingData(prev => ({ ...prev, pants: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">👖 Pants / Slacks / Trousers</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.pantsNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, pantsNotes: e.target.value }))}
                    placeholder="e.g. Navy blue wool trousers, charcoal slacks"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Shirt */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.shirt ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.shirt}
                      onChange={(e) => setClothingData(prev => ({ ...prev, shirt: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">👔 Shirt / Blouse</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.shirtNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, shirtNotes: e.target.value }))}
                    placeholder="e.g. White French cuff dress shirt, silk blouse"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Underwear */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.underwear ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.underwear}
                      onChange={(e) => setClothingData(prev => ({ ...prev, underwear: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">🩲 Underwear / Undershirt</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.underwearNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, underwearNotes: e.target.value }))}
                    placeholder="e.g. Complete undergarment set, cotton undershirt"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Shoes */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.shoes ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.shoes}
                      onChange={(e) => setClothingData(prev => ({ ...prev, shoes: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">👞 Shoes / Footwear</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.shoesNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, shoesNotes: e.target.value }))}
                    placeholder="e.g. Black polished Oxfords, white satin slippers"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Dress (deass) */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.dress ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.dress}
                      onChange={(e) => setClothingData(prev => ({ ...prev, dress: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">👗 Dress / Gown / Robe</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.dressNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, dressNotes: e.target.value }))}
                    placeholder="e.g. Royal blue formal gown, church Sunday dress"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Panties (pantes) */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.panties ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.panties}
                      onChange={(e) => setClothingData(prev => ({ ...prev, panties: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">🩱 Panties / Slips</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.pantiesNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, pantiesNotes: e.target.value }))}
                    placeholder="e.g. Full slip, undergarments"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Wig */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.wig ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.wig}
                      onChange={(e) => setClothingData(prev => ({ ...prev, wig: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">💇 Wig / Hairpiece</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.wigNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, wigNotes: e.target.value }))}
                    placeholder="e.g. Short brown wave wig, attached styling pins"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Jacket */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.jacket ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.jacket}
                      onChange={(e) => setClothingData(prev => ({ ...prev, jacket: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">🧥 Suit Jacket / Blazer</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.jacketNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, jacketNotes: e.target.value }))}
                    placeholder="e.g. Navy 2-button jacket, black tuxedo coat"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Tie */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.tie ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.tie}
                      onChange={(e) => setClothingData(prev => ({ ...prev, tie: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">👔 Tie / Bowtie</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.tieNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, tieNotes: e.target.value }))}
                    placeholder="e.g. Navy & gold silk necktie, black silk bowtie"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Pocket Square */}
                <div className={`p-2.5 rounded-xl border transition ${clothingData.pocketSquare ? 'bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-white border-neutral-200'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={clothingData.pocketSquare}
                      onChange={(e) => setClothingData(prev => ({ ...prev, pocketSquare: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-neutral-900 text-xs">🔲 Pocket Square / Handkerchief</span>
                  </label>
                  <input
                    type="text"
                    value={clothingData.pocketSquareNotes || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, pocketSquareNotes: e.target.value }))}
                    placeholder="e.g. Burgundy accent silk square, white linen"
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-[11px] text-neutral-800 outline-none focus:border-emerald-600"
                  />
                </div>

              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* SECTION 2: JEWELRY & PERSONAL EFFECTS LOG (ITEMIZED & DISPOSITION) */}
            {/* ----------------------------------------------------------- */}
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <span className="font-bold text-xs uppercase text-[#991b1b] tracking-wider block">
                    2. Jewelry & Personal Effects Inventory & Disposition:
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Explicit instructions for each piece of jewelry: Remain with loved one vs. Return to family prior to committal.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                  {clothingData.jewelryList.filter(j => j.checked).length} Items Received
                </span>
              </div>

              {/* Jewelry Table */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 border-b border-neutral-300 text-[10px] font-bold text-neutral-600 uppercase">
                    <tr>
                      <th className="p-2.5 w-12 text-center">Status</th>
                      <th className="p-2.5 w-40">Jewelry / Effect Category</th>
                      <th className="p-2.5">Item Description & Markings</th>
                      <th className="p-2.5 w-64 text-center">Disposition Instruction</th>
                      <th className="p-2.5 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {clothingData.jewelryList.map((jItem) => (
                      <tr key={jItem.id} className={jItem.checked ? 'hover:bg-neutral-50/80' : 'bg-neutral-50/50 text-neutral-400'}>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={jItem.checked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setClothingData(prev => ({
                                ...prev,
                                jewelryList: prev.jewelryList.map(j => j.id === jItem.id ? { ...j, checked } : j)
                              }));
                            }}
                            className="rounded text-emerald-700 focus:ring-emerald-600"
                          />
                        </td>
                        <td className="p-2.5 font-bold text-neutral-900">
                          {jItem.item}
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={jItem.description || ''}
                            onChange={(e) => {
                              const description = e.target.value;
                              setClothingData(prev => ({
                                ...prev,
                                jewelryList: prev.jewelryList.map(j => j.id === jItem.id ? { ...j, description } : j)
                              }));
                            }}
                            placeholder="Enter description, metal type, stones, markings..."
                            className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800 outline-none focus:border-[#991b1b]"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center justify-center space-x-3">
                            <label className={`flex items-center space-x-1 cursor-pointer text-[11px] px-2 py-1 rounded border transition ${
                              jItem.disposition === 'remain_on_decedent'
                                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-800'
                            }`}>
                              <input
                                type="radio"
                                name={`disp-${jItem.id}`}
                                value="remain_on_decedent"
                                checked={jItem.disposition === 'remain_on_decedent'}
                                onChange={() => {
                                  setClothingData(prev => ({
                                    ...prev,
                                    jewelryList: prev.jewelryList.map(j => j.id === jItem.id ? { ...j, disposition: 'remain_on_decedent' } : j)
                                  }));
                                }}
                                className="text-amber-700"
                              />
                              <span>Remain with Deceased</span>
                            </label>

                            <label className={`flex items-center space-x-1 cursor-pointer text-[11px] px-2 py-1 rounded border transition ${
                              jItem.disposition === 'return_to_family'
                                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-800'
                            }`}>
                              <input
                                type="radio"
                                name={`disp-${jItem.id}`}
                                value="return_to_family"
                                checked={jItem.disposition === 'return_to_family'}
                                onChange={() => {
                                  setClothingData(prev => ({
                                    ...prev,
                                    jewelryList: prev.jewelryList.map(j => j.id === jItem.id ? { ...j, disposition: 'return_to_family' } : j)
                                  }));
                                }}
                                className="text-blue-700"
                              />
                              <span>Return to Family</span>
                            </label>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveJewelry(jItem.id)}
                            className="text-neutral-400 hover:text-red-700 p-1"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Custom Jewelry Box */}
              <div className="bg-[#f8fafc] border border-neutral-200 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-2 text-xs">
                <input
                  type="text"
                  value={newCustomJewelryName}
                  onChange={(e) => setNewCustomJewelryName(e.target.value)}
                  placeholder="Add item (e.g. Masonic Ring, Diamond Brooch)..."
                  className="w-full sm:w-1/3 bg-white border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none"
                />
                <input
                  type="text"
                  value={newCustomJewelryDesc}
                  onChange={(e) => setNewCustomJewelryDesc(e.target.value)}
                  placeholder="Description & placement note..."
                  className="w-full sm:w-1/3 bg-white border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none"
                />
                <select
                  value={newCustomJewelryDisp}
                  onChange={(e) => setNewCustomJewelryDisp(e.target.value as any)}
                  className="w-full sm:w-1/4 bg-white border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none"
                >
                  <option value="remain_on_decedent">Remain with Deceased</option>
                  <option value="return_to_family">Return to Family</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddCustomJewelry}
                  className="w-full sm:w-auto px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* SECTION 3: CASKET SPECS & HAIRDRESSER ASSIGNMENT            */}
            {/* ----------------------------------------------------------- */}
            <div className="border border-neutral-200 p-4 rounded-xl space-y-3 bg-[#fafafa]">
              <span className="font-bold text-xs uppercase text-[#991b1b] block">
                3. Casket Specifications & Cosmetology Assignment:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Casket Serial / Number:</label>
                  <input
                    type="text"
                    value={clothingData.casketNumber || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, casketNumber: e.target.value }))}
                    placeholder="e.g. CSK-8819-CH"
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 font-mono outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Casket Model / Name:</label>
                  <input
                    type="text"
                    value={clothingData.casketName || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, casketName: e.target.value }))}
                    placeholder="e.g. The St. Nicholas Heritage Cherry"
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Engraved Nameplate Required:</label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="namePlateOpt"
                        checked={clothingData.namePlate === true}
                        onChange={() => setClothingData(prev => ({ ...prev, namePlate: true }))}
                        className="text-emerald-700"
                      />
                      <span className="font-bold text-neutral-800">✓ Yes</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="namePlateOpt"
                        checked={clothingData.namePlate === false}
                        onChange={() => setClothingData(prev => ({ ...prev, namePlate: false }))}
                        className="text-neutral-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Hairdresser / Stylist Assigned:</label>
                  <select
                    value={clothingData.hairdresserName || ''}
                    onChange={(e) => setClothingData(prev => ({ 
                      ...prev, 
                      hairdresserName: e.target.value,
                      hairdresserAssigned: Boolean(e.target.value)
                    }))}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                  >
                    <option value="">-- Select Hairdresser / Stylist --</option>
                    <option value="Kelvin Brooks (646-508-3474)">Kelvin Brooks (646-508-3474)</option>
                    <option value="Tanisha Carey (347-605-8707)">Tanisha Carey (347-605-8707)</option>
                    <option value="Renee- Zomelia Thomas (646-285-2851)">Renee- Zomelia Thomas (646-285-2851)</option>
                    <option value="Family Private Hairdresser / Barber">Family Private Hairdresser / Barber</option>
                    <option value="In-House BFH Preparation Team">In-House BFH Preparation Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">
                  Hairstyling, Barbering & Cosmetology Instructions:
                </label>
                <textarea
                  rows={2}
                  value={clothingData.cosmeticsNotes || ''}
                  onChange={(e) => setClothingData(prev => ({ ...prev, cosmeticsNotes: e.target.value }))}
                  placeholder="Specific instructions on hair parting, mustache/beard trim, makeup shade, lipstick tone, or reference photo provided..."
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                />
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* SECTION 4: CHAIN OF CUSTODY & RECEIPT SIGN-OFF              */}
            {/* ----------------------------------------------------------- */}
            <div className="border border-neutral-200 p-4 rounded-xl bg-white space-y-3">
              <span className="font-bold text-xs uppercase text-neutral-900 block">
                4. Chain of Custody & Verification Sign-Off:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Garments Delivered By (Family / Informant):</label>
                  <input
                    type="text"
                    value={clothingData.deliveredBy || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, deliveredBy: e.target.value }))}
                    placeholder="Full name of person delivering"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Contact Phone:</label>
                  <input
                    type="tel"
                    value={clothingData.deliveredByPhone || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, deliveredByPhone: e.target.value }))}
                    placeholder="(212) 555-0198"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Received By (Funeral Director):</label>
                  <input
                    type="text"
                    value={clothingData.receivedByDirector || ''}
                    onChange={(e) => setClothingData(prev => ({ ...prev, receivedByDirector: e.target.value }))}
                    placeholder="Licensed Director Name"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Finalize Bar */}
            <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-[10px] text-neutral-400 font-serif italic">
                Official Property of Benta's Funeral Home, Inc. • Golden Record Dressing Protocol
              </p>
              <button
                type="button"
                onClick={handleSaveClothingSubmittal}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md border border-amber-300/40"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save & Complete Clothing Submittal</span>
              </button>
            </div>

          </div>
        );

      // -------------------------------------------------------------
      // FORM 6: CLIENT PRODUCTION PACKAGE OVERVIEW (DVD, PROGRAM, PRAYER CARDS)
      // -------------------------------------------------------------
      case 'client_production':
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-neutral-900 pb-3">
              <div>
                <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                  Client Production Package Overview
                </h3>
                <p className="text-xs text-[#991b1b] font-medium">Benta's Digiprint & 360° Media Suite</p>
              </div>
              <div className="text-right text-xs">
                <p>Today's Date: <strong>{caseData.createdAt.split('T')[0]}</strong></p>
                <p>Submittal Time: <strong className="font-mono">11:30 AM</strong></p>
              </div>
            </div>

            {/* Case Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs">
              <div><span className="text-[10px] text-neutral-500 block">Decedent Name:</span> <strong>{caseData.decedent.legalName}</strong></div>
              <div><span className="text-[10px] text-neutral-500 block">Case #:</span> <strong className="font-mono">{caseData.caseNumber}</strong></div>
              <div><span className="text-[10px] text-neutral-500 block">Dates:</span> <strong>{caseData.decedent.dateOfBirth} – {caseData.decedent.dateOfDeath}</strong></div>
              <div><span className="text-[10px] text-neutral-500 block">Funeral Director:</span> <strong>{caseData.assignedDirector}</strong></div>
            </div>

            {/* 3 Modules: Memorial DVD, Funeral Program, Prayer Cards */}
            <div className="space-y-4">
              
              {/* 1. Memorial DVD & 360 Screen Tribute */}
              <div className="border border-neutral-200 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="font-bold text-xs uppercase text-[#991b1b]">1. MEMORIAL DVD & 360° DIGI-TRIBUTE:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">[✓] YES [ ] NO</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-[9px] text-neutral-500 block">Delivery Date & Time:</span> <strong>Sept 21, 2026 at 2:00 PM</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block"># of Photos Uploaded:</span> <strong className="font-mono">48 High-Res Photos</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Easel Photo(s):</span> <strong>1x 16x20 Framed Portrait</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Suite Photos:</span> <strong>Dual 75" Sanctuary Screens</strong></div>
                </div>
                <p className="text-[10px] text-neutral-600 italic">Special Instructions: Loop slideshow during wake and chapel service with soft jazz background audio.</p>
              </div>

              {/* 2. Funeral Programs */}
              <div className="border border-neutral-200 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="font-bold text-xs uppercase text-[#991b1b]">2. FUNERAL SERVICE PROGRAM:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">[✓] YES [ ] NO</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-[9px] text-neutral-500 block">Quantity:</span> <strong className="font-mono">150 Booklets</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Program Size:</span> <strong>[✓] BIG Paper (8.5x14 Trifold)</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Program Style:</span> <strong>[✓] Premium Gold Foil Trim</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Photos Included:</span> <strong>[✓] Front [✓] Inside [✓] Obit [✓] Back</strong></div>
                </div>
              </div>

              {/* 3. Prayer Cards */}
              <div className="border border-neutral-200 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="font-bold text-xs uppercase text-[#991b1b]">3. MEMORIAL PRAYER CARDS:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">[✓] YES [ ] NO</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-[9px] text-neutral-500 block">Quantity Selected:</span> <strong className="font-mono">200 Laminated Cards</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Title Caption:</span> <strong>[✓] "In Loving Memory"</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Verse Type:</span> <strong>[✓] Scripture: Psalm 23 & John 14</strong></div>
                  <div><span className="text-[9px] text-neutral-500 block">Series / Code:</span> <strong>HARLEM-SERIES-GOLD</strong></div>
                </div>
              </div>

            </div>
          </div>
        );

      // -------------------------------------------------------------
      // FORM 7: NYC DEPT OF HOSPITALS - STATEMENT OF AUTHORITY
      // -------------------------------------------------------------
      case 'nyc_authority':
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            {/* Header */}
            <div className="text-center border-b-2 border-neutral-900 pb-3 space-y-1">
              <h3 className="font-serif-title font-bold text-sm tracking-wider text-neutral-800 uppercase">
                THE CITY OF NEW YORK DEPARTMENT OF HOSPITALS / HEALTH
              </h3>
              <h2 className="font-serif-title font-bold text-lg text-[#991b1b] uppercase">
                FUNERAL DIRECTOR'S STATEMENT OF AUTHORITY
              </h2>
              <p className="text-[11px] text-neutral-600 italic">
                "This statement is made for the purpose of inducing the hospital or health care facility to release the death certificate and/or the remains of the deceased below-named."
              </p>
            </div>

            {/* Certification Statement */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-3">
              <span className="font-bold text-neutral-900 uppercase block tracking-wider">
                IT IS HEREBY CERTIFIED THAT THE UNDERSIGNED HAS BEEN AUTHORIZED TO TAKE CHARGE OF:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-neutral-200 pb-2">
                <div><span className="text-[10px] text-neutral-500 block">The remains of:</span> <strong>{caseData.decedent.legalName}</strong></div>
                <div><span className="text-[10px] text-neutral-500 block">Who died at:</span> <strong>{caseData.decedent.placeOfDeath}</strong></div>
                <div><span className="text-[10px] text-neutral-500 block">On (Date):</span> <strong>{caseData.decedent.dateOfDeath}</strong></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-neutral-200 pb-2">
                <div><span className="text-[10px] text-neutral-500 block">By (Person granting authority):</span> <strong>{caseData.informant.fullName}</strong></div>
                <div><span className="text-[10px] text-neutral-500 block">Whose address is:</span> <strong>{caseData.informant.address}</strong></div>
                <div><span className="text-[10px] text-neutral-500 block">And who is the:</span> <strong>{caseData.informant.relationship}</strong></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><span className="text-[10px] text-neutral-500 block">Remains to be removed from:</span> <strong>{caseData.decedent.placeOfDeath}</strong></div>
                <div><span className="text-[10px] text-neutral-500 block">To:</span> <strong>Benta's Funeral Home, Inc., 630 St. Nicholas Ave, NY 10030</strong></div>
              </div>
            </div>

            {/* Non-Solicitation Statement */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-center text-xs text-[#991b1b]">
              "THIS AUTHORIZATION HAS NOT BEEN THE RESULT OF ANY SOLICITATION BY OR IN BEHALF OF THE UNDERSIGNED."
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t-2 border-neutral-900 flex justify-between items-end text-xs">
              <div>
                <div className="border-b border-neutral-900 w-56 mb-1" />
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Signature: Jason Benta (Funeral Director)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">New York State License No:</span>
                <strong className="font-mono text-sm">NYS-LFD-14892</strong>
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // FORM 8: WOODLAWN CREMATORY AUTHORIZATION & DISPATCH PACKET
      // -------------------------------------------------------------
      case 'woodlawn_cremation':
        return (
          <div className="space-y-6 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            <div className="text-center border-b-2 border-neutral-900 pb-3 space-y-1">
              <h3 className="font-serif-title font-bold text-base text-neutral-800 uppercase tracking-wide">
                WOODLAWN CREMATORY & CEMETERY (BRONX, NY)
              </h3>
              <h2 className="font-serif-title font-bold text-xl text-[#991b1b]">
                AUTHORIZATION FOR CREMATION AND DISPOSITION
              </h2>
              <p className="text-xs text-neutral-500 font-mono">Benta's Funeral Home Dispatch Ref #WD-2026-8819</p>
            </div>

            <div className="space-y-3 leading-relaxed text-xs">
              <p>
                The undersigned Next of Kin authorizes <strong>Woodlawn Crematory</strong> to cremate the remains of <strong>{caseData.decedent.legalName}</strong> delivered by <strong>Benta's Funeral Home, Inc.</strong>
              </p>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-[11px]">
                <p><strong>Pacemaker / Mechanical Devices:</strong> [✓] Certified Removed or None Present</p>
                <p><strong>Urn Selected:</strong> Handcrafted Bronze Keepsake Urn (Benta Collection)</p>
                <p><strong>Cortege Departure from BFH:</strong> 1:30 PM EST on Sept 22, 2026</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-neutral-900 flex justify-between items-end text-xs">
              <div>
                <div className="border-b border-neutral-900 w-56 mb-1" />
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Signature of Authorizing Agent ({caseData.informant.fullName})</span>
              </div>
              <div className="text-right">
                <div className="border-b border-neutral-900 w-56 mb-1 ml-auto" />
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Woodlawn Crematory Official Stamp</span>
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // DEFAULT / GENERAL DOCUMENT VIEW
      // -------------------------------------------------------------
      default:
        return (
          <div className="space-y-4 text-neutral-900 font-sans text-xs bg-white p-6 sm:p-8 rounded-xl border border-neutral-300 shadow-sm print:p-0 print:border-none">
            <div className="text-center border-b border-neutral-200 pb-3">
              <h4 className="font-bold text-base tracking-wide text-[#991b1b]">BENTA'S FUNERAL HOME, INC.</h4>
              <p className="text-[10px] text-neutral-500">630 Saint Nicholas Avenue, New York, NY 10030 • (212) 281-8850</p>
              <p className="font-bold text-sm uppercase mt-2 text-neutral-900">{doc.name}</p>
              <p className="text-[10px] text-neutral-400">Case No: {caseData.caseNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <p><strong>Decedent:</strong> {caseData.decedent.legalName}</p>
              <p><strong>Date of Death:</strong> {caseData.decedent.dateOfDeath}</p>
              <p><strong>Informant:</strong> {caseData.informant.fullName} ({caseData.informant.relationship})</p>
              <p><strong>Disposition:</strong> {caseData.serviceSelections.packageTitle}</p>
              <p><strong>Destination:</strong> {caseData.serviceSelections.crematoryOrCemeteryName}</p>
              <p><strong>EDRS Status:</strong> {caseData.medicalCertifier.edrsStatus}</p>
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed font-light">
              This official document has been authenticated by the BFH Golden Record Engine. All representations made herein comply with the New York State Department of Health and Federal Trade Commission regulations.
            </p>

            <div className="pt-4 flex justify-between items-end border-t border-neutral-200">
              <div>
                <div className="border-b border-neutral-900 w-48 mb-1" />
                <p className="text-[9px] text-neutral-600">Signature of Next of Kin / Authorized Representative</p>
              </div>
              <div>
                <div className="border-b border-neutral-900 w-48 mb-1" />
                <p className="text-[9px] text-neutral-600">Jason Benta, Licensed Funeral Director</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-neutral-900 font-sans">
      
      {/* 1. TOP HEADER & MATRIX SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Document Journey & Delivery Matrix
            </h2>
            <span className="bg-red-50 text-[#991b1b] text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
              <FileCheck2 className="w-3 h-3" />
              13 Official BFH Forms
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-light">
            Live lifecycle tracking and interactive field inspection for every official form for <strong className="text-[#991b1b] font-semibold">{caseData.decedent.legalName}</strong> ({caseData.caseNumber}).
          </p>
        </div>

        {/* Phase Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Documents (13)' },
            { id: 'intake_removal', label: 'Phase 1: Intake' },
            { id: 'arrangements', label: 'Phase 2: Arrangements' },
            { id: 'legal_bundle', label: 'Phase 3: Legal Bundle' },
            { id: 'permits_logistics', label: 'Phase 4: Permits' },
            { id: 'finalization_aftercare', label: 'Phase 5: Finalization' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedPhase(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedPhase === pill.id
                  ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN DOCUMENT MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200 font-bold">
              <tr>
                <th className="p-4">Official Form Name</th>
                <th className="p-4">Phase & Timing</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Delivery Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Legal Follow-up Action</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-50/80 transition group">
                  
                  {/* Document Name */}
                  <td className="p-4 font-bold text-neutral-900">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#991b1b] flex items-center justify-center shrink-0 border border-red-200/60 shadow-2xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-neutral-900 leading-snug">{doc.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">ID: {doc.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Timing */}
                  <td className="p-4 text-neutral-600 font-mono text-[11px]">
                    <span className="font-bold text-neutral-800 block capitalize">{doc.phase.replace('_', ' ')}</span>
                    <span className="text-neutral-500 text-[10px]">{doc.triggerTiming}</span>
                  </td>

                  {/* Recipient */}
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-800 font-medium">
                      {doc.destinationRecipient}
                    </span>
                  </td>

                  {/* Delivery Method */}
                  <td className="p-4 text-neutral-600 text-[11px] font-medium">
                    {doc.deliveryMethod}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {getStatusBadge(doc.status)}
                  </td>

                  {/* Follow Up */}
                  <td className="p-4 text-[11px] text-neutral-500 max-w-xs font-light">
                    {doc.followUpAction}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5 items-center">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-2xs border border-amber-400/30"
                        title="Open complete official document with all fields"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-300" />
                        <span>Inspect Form</span>
                      </button>

                      {doc.deliveryMethod === 'eSign Portal' && (
                        <button
                          onClick={() => onOpenESign(doc)}
                          className="bg-[#991b1b] hover:bg-red-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition shadow-sm border border-amber-300/30"
                        >
                          <PenTool className="w-3 h-3 text-amber-300" />
                          <span>eSign</span>
                        </button>
                      )}

                      {doc.status === 'pending' && (
                        <button
                          onClick={() => onUpdateDocumentStatus(doc.id, 'completed')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition shadow-sm"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. INTERACTIVE OFFICIAL DOCUMENT FORM INSPECTION MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-4xl w-full my-6 p-6 sm:p-8 space-y-5 shadow-2xl text-neutral-900">
            
            {/* Modal Top Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#991b1b] flex items-center justify-center border border-red-200 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-lg text-neutral-900 leading-tight">
                    {previewDoc.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-0.5">
                    <span className="font-mono text-[11px] font-bold text-[#991b1b]">{caseData.caseNumber}</span>
                    <span>•</span>
                    <span>{caseData.decedent.legalName}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">100% Field Fidelity</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition border border-neutral-300 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official PDF</span>
                </button>

                {previewDoc.deliveryMethod === 'eSign Portal' && (
                  <button
                    onClick={() => {
                      const doc = previewDoc;
                      setPreviewDoc(null);
                      onOpenESign(doc);
                    }}
                    className="bg-[#991b1b] hover:bg-red-800 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm border border-amber-300/40"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-300" />
                    <span>eSign Document</span>
                  </button>
                )}

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition"
                  title="Close Inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Render Exact Form Layout */}
            <div className="max-h-[72vh] overflow-y-auto pr-1">
              {renderOfficialFormContent(previewDoc)}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-neutral-200 gap-3 text-xs">
              <div className="flex items-center space-x-2 text-neutral-500 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted & Verified via BFH Golden Record v3.0 Compliance Framework</span>
              </div>

              <div className="flex gap-2">
                {previewDoc.status !== 'completed' && previewDoc.status !== 'signed' && (
                  <button
                    onClick={() => {
                      onUpdateDocumentStatus(previewDoc.id, 'completed');
                      setPreviewDoc(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Verified & Completed</span>
                  </button>
                )}

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-xl transition shadow-2xs"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
