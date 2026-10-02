import React, { useState, useMemo } from 'react';
import { 
  TRI_STATE_CEMETERIES_DIRECTORY, 
  CemeteryDirectoryItem 
} from '../../lib/data/partnerCatalogs';
import { 
  Search, 
  MapPin, 
  Flame, 
  Building2, 
  Phone, 
  Clock, 
  ShieldAlert, 
  Check, 
  Plus, 
  X, 
  Sparkles
} from 'lucide-react';

export interface SelectedCemeteryPayload {
  cemeteryName: string;
  cemeteryAddress: string;
  cemeteryCityStateZip: string;
  cemeteryPhone: string;
  cemeteryCounty: string;
  feeCategory: 'ground_burial' | 'cremation' | 'witness_cremation' | 'mausoleum_entombment' | 'urn_inurnment' | 'va_veterans' | 'custom';
  feeLabel: string;
  feeAmount: number;
  requiresVault: boolean;
  cutoffTime?: string;
  notes?: string;
}

export interface CemeteryFeeScheduleOption {
  id: string;
  category: 'ground_burial' | 'cremation' | 'witness_cremation' | 'mausoleum_entombment' | 'urn_inurnment' | 'va_veterans';
  label: string;
  amount: number;
  description: string;
  icon: string;
}

export function getCemeteryFeeOptions(cemetery: CemeteryDirectoryItem): CemeteryFeeScheduleOption[] {
  // If National Veteran Cemetery (e.g. Calverton)
  if (cemetery.id === 'cem-calverton' || cemetery.name.toLowerCase().includes('national cemetery')) {
    return [
      {
        id: 'calverton-vet',
        category: 'va_veterans',
        label: 'Honorably Discharged Veteran Committal Plot & Vault',
        amount: 0,
        description: '100% Free Benefit provided by the US Dept. of Veterans Affairs (Grave opening, concrete graveliner vault, and headstone).',
        icon: '🎖️'
      },
      {
        id: 'calverton-spouse',
        category: 'va_veterans',
        label: 'Eligible Veteran Spouse / Dependent Committal',
        amount: 0,
        description: 'Covered under VA national cemetery benefit rules (zsh.00 pass-through).',
        icon: '🎖️'
      }
    ];
  }

  const fees: CemeteryFeeScheduleOption[] = [];

  // Ground Burial Opening & Closing
  let groundAmount = 1850;
  if (cemetery.id === 'cem-greenwood') groundAmount = 2100;
  else if (cemetery.id === 'cem-ferncliff') groundAmount = 1950;
  else if (cemetery.id === 'cem-kensico') groundAmount = 1900;
  else if (cemetery.id === 'cem-cypress-hills') groundAmount = 1800;
  else if (cemetery.id === 'cem-trinity-church') groundAmount = 2600;
  else if (cemetery.id === 'cem-rosehill-linden') groundAmount = 1650;
  else if (cemetery.id === 'cem-st-raymonds') groundAmount = 1850;
  else if (cemetery.id === 'cem-mount-hope') groundAmount = 1850;
  else if (cemetery.id === 'cem-pinelawn') groundAmount = 1950;
  else if (cemetery.id === 'cem-gate-of-heaven') groundAmount = 1900;
  else if (cemetery.id === 'cem-putnam-greenwich') groundAmount = 2100;

  if (cemetery.id !== 'cem-fresh-pond') {
    fees.push({
      id: `${cemetery.id}-ground`,
      category: 'ground_burial',
      label: 'Standard Ground Burial (Interment Opening & Closing)',
      amount: groundAmount,
      description: 'Standard excavation, lowering device, artificial grass dressing, and cemetery recording fee.',
      icon: '⚰️'
    });
  }

  // Crematory on-site fees
  if (cemetery.hasCrematory) {
    let retortAmount = 475;
    if (cemetery.id === 'cem-fresh-pond') retortAmount = 450;
    else if (cemetery.id === 'cem-ferncliff') retortAmount = 495;
    else if (cemetery.id === 'cem-greenwood') retortAmount = 520;
    else if (cemetery.id === 'cem-rosehill-linden') retortAmount = 425;
    else if (cemetery.id === 'cem-woodlawn') retortAmount = 475;

    fees.push({
      id: `${cemetery.id}-cremation-retort`,
      category: 'cremation',
      label: 'Crematory Retort Direct Processing Fee',
      amount: retortAmount,
      description: 'Individual retort chamber cremation processing, metal disk ID tracking, and temporary container packaging.',
      icon: '🔥'
    });

    fees.push({
      id: `${cemetery.id}-witness-cremation`,
      category: 'witness_cremation',
      label: 'Witness Cremation & Family Committal Chapel Fee',
      amount: retortAmount + 275,
      description: 'Includes 30-minute private family committal chapel gathering prior to witnessed chamber initiation.',
      icon: '👁️'
    });
  }

  // Mausoleum Crypt Entombment
  if (cemetery.hasMausoleum) {
    let mausoleumAmount = 2250;
    if (cemetery.id === 'cem-trinity-church') mausoleumAmount = 2850;
    else if (cemetery.id === 'cem-ferncliff') mausoleumAmount = 2400;
    else if (cemetery.id === 'cem-greenwood') mausoleumAmount = 2350;
    else if (cemetery.id === 'cem-cypress-hills') mausoleumAmount = 2100;
    else if (cemetery.id === 'cem-st-raymonds') mausoleumAmount = 2200;

    fees.push({
      id: `${cemetery.id}-mausoleum`,
      category: 'mausoleum_entombment',
      label: 'Mausoleum Crypt Entombment & Sealing Fee',
      amount: mausoleumAmount,
      description: 'Elevator tray placement, crypt tray sealing, sanitary membrane, and inscription record.',
      icon: '🏛️'
    });

    fees.push({
      id: `${cemetery.id}-urn-niche`,
      category: 'urn_inurnment',
      label: 'Columbarium Urn Niche Inurnment & Inscription',
      amount: 650,
      description: 'Glass-front or bronze/granite niche opening, placement of urn, and secure front re-attachment.',
      icon: '🏺'
    });
  }

  return fees;
}

interface CemeterySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCemeteryName?: string;
  currentFeeAmount?: number;
  onSelectCemetery: (payload: SelectedCemeteryPayload) => void;
}

export const CemeterySelectionModal: React.FC<CemeterySelectionModalProps> = ({
  isOpen,
  onClose,
  currentCemeteryName,
  currentFeeAmount,
  onSelectCemetery
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [capabilityFilter, setCapabilityFilter] = useState<'all' | 'crematory' | 'mausoleum' | 'va_veterans'>('all');
  const [activeTab, setActiveTab] = useState<'directory' | 'custom'>('directory');

  // Custom Cemetery Form State
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customCityStateZip, setCustomCityStateZip] = useState('New York, NY');
  const [customPhone, setCustomPhone] = useState('');
  const [customFeeAmount, setCustomFeeAmount] = useState<number>(1850);
  const [customFeeType, setCustomFeeType] = useState<SelectedCemeteryPayload['feeCategory']>('ground_burial');
  const [customRequiresVault, setCustomRequiresVault] = useState(true);

  if (!isOpen) return null;

  // Filtered Cemeteries
  const filteredCemeteries = useMemo(() => {
    return TRI_STATE_CEMETERIES_DIRECTORY.filter((cem) => {
      // Region filter
      if (selectedRegion !== 'all') {
        if (selectedRegion === 'Bronx' && !cem.county.includes('Bronx') && !cem.city.includes('Bronx')) return false;
        if (selectedRegion === 'Manhattan' && !cem.county.includes('New York') && !cem.city.includes('New York') && cem.id !== 'cem-trinity-church') return false;
        if (selectedRegion === 'Brooklyn' && !cem.county.includes('Kings') && !cem.city.includes('Brooklyn')) return false;
        if (selectedRegion === 'Queens' && !cem.county.includes('Queens') && !cem.city.includes('Middle Village')) return false;
        if (selectedRegion === 'Westchester' && !cem.county.includes('Westchester')) return false;
        if (selectedRegion === 'Long Island' && !cem.county.includes('Suffolk')) return false;
        if (selectedRegion === 'New Jersey' && cem.state !== 'NJ') return false;
        if (selectedRegion === 'Connecticut' && cem.state !== 'CT') return false;
      }

      // Capability filter
      if (capabilityFilter === 'crematory' && !cem.hasCrematory) return false;
      if (capabilityFilter === 'mausoleum' && !cem.hasMausoleum) return false;
      if (capabilityFilter === 'va_veterans' && cem.id !== 'cem-calverton' && !cem.name.toLowerCase().includes('veterans')) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = cem.name.toLowerCase().includes(q);
        const matchCity = cem.city.toLowerCase().includes(q);
        const matchCounty = cem.county.toLowerCase().includes(q);
        const matchNotes = cem.notes.toLowerCase().includes(q);
        const matchZip = cem.zip.includes(q);
        if (!matchName && !matchCity && !matchCounty && !matchNotes && !matchZip) return false;
      }

      return true;
    });
  }, [searchQuery, selectedRegion, capabilityFilter]);

  const handleSelectPredefined = (cemetery: CemeteryDirectoryItem, fee: CemeteryFeeScheduleOption) => {
    onSelectCemetery({
      cemeteryName: cemetery.name,
      cemeteryAddress: cemetery.address,
      cemeteryCityStateZip: `${cemetery.city}, ${cemetery.state} ${cemetery.zip}`,
      cemeteryPhone: cemetery.phone,
      cemeteryCounty: cemetery.county,
      feeCategory: fee.category,
      feeLabel: fee.label,
      feeAmount: fee.amount,
      requiresVault: cemetery.requiresVault,
      cutoffTime: cemetery.committalServiceCutoff,
      notes: cemetery.notes
    });
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onSelectCemetery({
      cemeteryName: customName.trim(),
      cemeteryAddress: customAddress.trim() || 'Address on file with cemetery office',
      cemeteryCityStateZip: customCityStateZip.trim(),
      cemeteryPhone: customPhone.trim() || '(212) 281-8850',
      cemeteryCounty: 'Custom / Tri-State',
      feeCategory: customFeeType,
      feeLabel: customFeeType === 'ground_burial' ? 'Ground Burial Opening' : 'Cremation / Entombment Fee',
      feeAmount: customFeeAmount,
      requiresVault: customRequiresVault,
      notes: 'Custom cemetery entered during arrangement conference.'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-neutral-300 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-neutral-200 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#991b1b] flex items-center justify-center font-bold text-xl border border-red-200">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Form AP-47 Cash Advance Matrix
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  10 NYCRR § 77.8 Pass-Through (0% Markup)
                </span>
              </div>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
                Tri-State Cemetery & Crematory Directory & Pricing
              </h3>
              <p className="text-xs text-neutral-500">
                Select from verified partner cemeteries across NY, NJ & CT to automatically populate the destination, fee schedule, and pass-through check payee.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Currently Selected Summary Strip */}
        {currentCemeteryName && (
          <div className="bg-amber-50/80 border border-amber-300/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-amber-800 font-bold">Currently Selected Destination:</span>
              <strong className="text-neutral-900 font-bold">{currentCemeteryName}</strong>
            </div>
            {currentFeeAmount !== undefined && (
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-neutral-600">Active Pass-Through Fee:</span>
                <strong className="text-[#991b1b] text-sm font-bold">${currentFeeAmount.toFixed(2)}</strong>
              </div>
            )}
          </div>
        )}

        {/* Tab Selector: Directory vs Custom */}
        <div className="flex items-center space-x-2 border-b border-neutral-200 pb-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Tri-State Directory ({TRI_STATE_CEMETERIES_DIRECTORY.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom / Out-of-Area Cemetery</span>
          </button>
        </div>

        {/* Tab 1: Verified Directory */}
        {activeTab === 'directory' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Search and Filters Bar */}
            <div className="space-y-2.5 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by cemetery name, borough, town, or zip code (e.g. Woodlawn, Ferncliff, Bronx, 10470)..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Capability filter */}
                <select
                  value={capabilityFilter}
                  onChange={(e) => setCapabilityFilter(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:bg-white focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                >
                  <option value="all">All Service Types</option>
                  <option value="crematory">🔥 Has On-Site Crematory</option>
                  <option value="mausoleum">🏛️ Has Mausoleum Crypts</option>
                  <option value="va_veterans">🎖️ VA Veteran National Cemetery</option>
                </select>
              </div>

              {/* Region Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                {[
                  { id: 'all', label: 'All Regions (20)' },
                  { id: 'Bronx', label: 'Bronx' },
                  { id: 'Manhattan', label: 'Manhattan' },
                  { id: 'Brooklyn', label: 'Brooklyn' },
                  { id: 'Queens', label: 'Queens' },
                  { id: 'Westchester', label: 'Westchester' },
                  { id: 'Long Island', label: 'Long Island / VA' },
                  { id: 'New Jersey', label: 'New Jersey' },
                  { id: 'Connecticut', label: 'Connecticut' }
                ].map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegion(reg.id)}
                    className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                      selectedRegion === reg.id
                        ? 'bg-neutral-900 text-amber-300 shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cemeteries List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {filteredCemeteries.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                  <Building2 className="w-10 h-10 text-neutral-300 mx-auto" />
                  <div className="font-bold text-neutral-700 text-sm">No Cemeteries Match Your Filters</div>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Try clearing search criteria or use the "Custom / Out-of-Area Cemetery" tab to manually enter any cemetery.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('all');
                      setCapabilityFilter('all');
                    }}
                    className="text-xs font-bold text-[#991b1b] hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                filteredCemeteries.map((cemetery) => {
                  const feeOptions = getCemeteryFeeOptions(cemetery);
                  const isSelected = currentCemeteryName?.toLowerCase().includes(cemetery.name.toLowerCase()) || 
                    cemetery.name.toLowerCase().includes(currentCemeteryName?.toLowerCase() || '___');

                  return (
                    <div
                      key={cemetery.id}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-4 bg-white ${
                        isSelected
                          ? 'border-[#991b1b] ring-2 ring-red-400/30 shadow-md bg-red-50/10'
                          : 'border-neutral-200 hover:border-neutral-300 shadow-xs'
                      }`}
                    >
                      {/* Top Info Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-serif-title font-bold text-base text-neutral-900">
                              {cemetery.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 uppercase">
                              {cemetery.county} • {cemetery.state}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Active Selection</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#991b1b]" />
                              <span>{cemetery.address}, {cemetery.city}, {cemetery.state} {cemetery.zip}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{cemetery.phone}</span>
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                          {cemetery.hasCrematory && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-700" />
                              <span>On-Site Crematory</span>
                            </span>
                          )}
                          {cemetery.hasMausoleum && (
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-300 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-stone-600" />
                              <span>Mausoleum Crypts</span>
                            </span>
                          )}
                          {cemetery.requiresVault ? (
                            <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-red-600" />
                              <span>Vault Required</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              No Vault Required / VA
                            </span>
                          )}
                          {cemetery.committalServiceCutoff && (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              <span>Cutoff: {cemetery.committalServiceCutoff}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {cemetery.notes && (
                        <p className="text-[11px] text-neutral-500 italic bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                          ℹ️ {cemetery.notes}
                        </p>
                      )}

                      {/* Pricing / Fee Schedule Selector Buttons */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                        <span className="text-[11px] font-bold text-neutral-800 block uppercase tracking-wider">
                          Select Cemetery Fee Schedule to Apply to Form AP-47:
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {feeOptions.map((fee) => {
                            const isFeeActive = isSelected && currentFeeAmount === fee.amount;
                            return (
                              <button
                                key={fee.id}
                                type="button"
                                onClick={() => handleSelectPredefined(cemetery, fee)}
                                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 cursor-pointer ${
                                  isFeeActive
                                    ? 'bg-[#991b1b] text-white border-[#991b1b] shadow-sm'
                                    : 'bg-neutral-50 hover:bg-red-50/50 hover:border-red-300 text-neutral-900 border-neutral-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs flex items-center gap-1">
                                    <span>{fee.icon}</span>
                                    <span>{fee.label}</span>
                                  </span>
                                </div>
                                <p className={`text-[10px] leading-tight ${isFeeActive ? 'text-red-100' : 'text-neutral-500'}`}>
                                  {fee.description}
                                </p>
                                <div className="flex items-center justify-between pt-1 border-t border-black/10">
                                  <span className="text-[10px] uppercase font-bold tracking-wider">
                                    {isFeeActive ? '✓ Selected' : '1-Click Apply'}
                                  </span>
                                  <span className={`font-mono font-black text-xs ${isFeeActive ? 'text-amber-300' : 'text-[#991b1b]'}`}>
                                    {fee.amount === 0 ? 'FREE (VA Benefit)' : `$${fee.amount.toFixed(2)}`}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Custom / Out-of-Area Cemetery */}
        {activeTab === 'custom' && (
          <form onSubmit={handleApplyCustom} className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-1">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Custom Cemetery or Out-of-Area Family Plot</span>
              </h4>
              <p className="text-xs text-amber-800">
                If the family owns a private family plot, an upstate/out-of-state cemetery, or a custom mausoleum not listed in the Tri-State directory, enter the details below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 block">Cemetery / Crematory Facility Name *</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Mount Hebron Cemetery or Pinelawn Private Family Crypt"
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800 block">Phone Number</label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. (718) 555-0199"
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800 block">Street Address</label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. 130-04 Horace Harding Expy"
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800 block">City, State & Zip</label>
                <input
                  type="text"
                  value={customCityStateZip}
                  onChange={(e) => setCustomCityStateZip(e.target.value)}
                  placeholder="e.g. Flushing, NY 11367"
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800 block">Disposition Fee Type</label>
                <select
                  value={customFeeType}
                  onChange={(e) => setCustomFeeType(e.target.value as any)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                >
                  <option value="ground_burial">⚰️ Ground Burial (Interment Opening & Closing)</option>
                  <option value="cremation">🔥 Direct Cremation Processing</option>
                  <option value="witness_cremation">👁️ Witness Cremation & Family Committal</option>
                  <option value="mausoleum_entombment">🏛️ Mausoleum Crypt Entombment</option>
                  <option value="urn_inurnment">🏺 Columbarium Urn Niche Inurnment</option>
                  <option value="va_veterans">🎖️ VA Veteran Committal (zsh.00)</option>
                  <option value="custom">⚙️ Custom Invoice / Specialized Service</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800 block">Estimated / Invoiced Cemetery Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={customFeeAmount}
                  onChange={(e) => setCustomFeeAmount(parseFloat(e.target.value) || 0)}
                  placeholder="1850.00"
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-[#991b1b] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                id="customVault"
                checked={customRequiresVault}
                onChange={(e) => setCustomRequiresVault(e.target.checked)}
                className="w-4 h-4 text-[#991b1b] rounded focus:ring-red-500"
              />
              <label htmlFor="customVault" className="font-medium text-neutral-800 cursor-pointer">
                Outer Burial Container / Concrete Vault required by cemetery bylaws
              </label>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Back to Directory
              </button>
              <button
                type="submit"
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-red-950/20"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>Apply Custom Cemetery & Fee (${customFeeAmount.toFixed(2)})</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
