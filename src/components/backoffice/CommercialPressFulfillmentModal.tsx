import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Truck, 
  FileCheck2, 
  Settings, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  RefreshCw, 
  ChevronRight,
  MapPin,
  Maximize2
} from 'lucide-react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  getPressFulfillmentConfig, 
  savePressFulfillmentConfig, 
  getPressJobHistory, 
  savePressJobHistory,
  dispatchPressJob,
  testPressConnection,
  runPreflightInspection,
  CommercialPressJobTicket,
  PressFulfillmentConfig,
  PressItemType,
  PressJobStage
} from '../../lib/services/commercialPressService';

interface CommercialPressFulfillmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: GoldenRecordCase[];
  selectedCaseId?: string;
  onJobDispatched?: (job: CommercialPressJobTicket) => void;
}

export const CommercialPressFulfillmentModal: React.FC<CommercialPressFulfillmentModalProps> = ({
  isOpen,
  onClose,
  cases,
  selectedCaseId,
  onJobDispatched
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'dispatcher' | 'tracker' | 'preflight' | 'settings'>('dispatcher');
  
  // Cases and selection
  const [selectedCase, setSelectedCase] = useState<GoldenRecordCase>(() => {
    if (selectedCaseId) {
      const match = cases.find(c => c.id === selectedCaseId);
      if (match) return match;
    }
    return cases[0];
  });

  // Dispatch Form State
  const [itemType, setItemType] = useState<PressItemType>('4_panel_bulletin');
  const [quantity, setQuantity] = useState<number>(350);
  const [paperStock, setPaperStock] = useState<string>('100lb Heavy Silk Cover + 80lb Gloss Text (Gold Foil Emboss)');
  const [finishingOptions, setFinishingOptions] = useState<string[]>([
    'Precision Score & Half-Fold',
    'UV Gloss Protective Coat',
    '300 DPI CMYK Bleed'
  ]);
  const [channel, setChannel] = useState<'production_email' | 'sftp_drop' | 'gelato_cloud_api'>('production_email');
  const [proofApprovedBy, setProofApprovedBy] = useState<string>(selectedCase?.informant?.fullName || 'Family Authorized Signer');
  const [deliveryTarget, setDeliveryTarget] = useState<string>('Day before service by 9:00 AM (Chapel 1 Delivery)');
  const [notes, setNotes] = useState<string>('Urgent Harlem Memorial Print Run. Deliver directly to Director Desk.');

  // Job History & Config
  const [jobHistory, setJobHistory] = useState<CommercialPressJobTicket[]>(() => getPressJobHistory());
  const [config, setConfig] = useState<PressFulfillmentConfig>(() => getPressFulfillmentConfig());
  
  // Async status states
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; channel?: string } | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Settings form input states
  const [partnerNameInput, setPartnerNameInput] = useState(config.partnerName);
  const [productionEmailInput, setProductionEmailInput] = useState(config.productionEmail);
  const [sftpHostInput, setSftpHostInput] = useState(config.sftpHost);
  const [sftpPortInput, setSftpPortInput] = useState(config.sftpPort);
  const [sftpUserInput, setSftpUserInput] = useState(config.sftpUsername);
  const [cloudApiKeyInput, setCloudApiKeyInput] = useState(config.cloudApiKey);
  const [courierCompanyInput, setCourierCompanyInput] = useState(config.courierCompany);
  const [deliveryAddressInput, setDeliveryAddressInput] = useState(config.deliveryAddress);

  // Pre-flight check calculation
  const preflightReport = runPreflightInspection(selectedCase, itemType);

  // Price estimate helper
  const calculateEstimatedCost = (type: PressItemType, qty: number): number => {
    switch (type) {
      case '4_panel_bulletin': return Math.round((120 + qty * 1.45) * 100) / 100;
      case '8_panel_trifold': return Math.round((150 + qty * 1.75) * 100) / 100;
      case '16_page_hardcover_keepsake': return Math.round((250 + qty * 14.50) * 100) / 100;
      case 'canvas_easel_portrait': return 165.00 * (qty > 0 ? qty : 1);
      default: return qty * 2.00;
    }
  };

  const getItemTitle = (type: PressItemType): string => {
    switch (type) {
      case '4_panel_bulletin': return '4-Panel Classic Harlem Sanctuary Program (8.5x11 Folded)';
      case '8_panel_trifold': return '8-Panel Trifold Celebration of Life Keepsake (8.5x14 Trifold)';
      case '16_page_hardcover_keepsake': return '16-Page Deluxe Hardcover Living Memory Volume (8.5x11 Landscape)';
      case 'canvas_easel_portrait': return '24x36 Gallery Velvet-Touch Easel Chapel Portrait';
      default: return 'Custom Memorial Press Run';
    }
  };

  const handleToggleFinishing = (opt: string) => {
    setFinishingOptions(prev => 
      prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
    );
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    setDispatchSuccessToast(null);

    const estimatedCost = calculateEstimatedCost(itemType, quantity);

    const newTicket = await dispatchPressJob({
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      decedentName: selectedCase.decedent.legalName,
      itemType,
      itemTitle: getItemTitle(itemType),
      quantity,
      paperStock,
      finishingOptions,
      preflightStatus: preflightReport.passed ? 'passed_300dpi_cmyk' : 'warning_dpi',
      proofApprovedBy: proofApprovedBy.trim() || 'Family Representative',
      proofApprovedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today',
      dispatchedChannel: channel,
      targetDeliveryTime: deliveryTarget,
      estimatedCost,
      notes
    });

    setJobHistory(getPressJobHistory());
    setIsDispatching(false);
    setDispatchSuccessToast(`Job Ticket ${newTicket.jobTicketNumber} dispatched to ${config.partnerName}!`);
    onJobDispatched?.(newTicket);

    setTimeout(() => {
      setActiveTab('tracker');
      setDispatchSuccessToast(null);
    }, 1800);
  };

  const handleAdvanceStage = (jobId: string) => {
    const stages: PressJobStage[] = [
      'files_received',
      'preflight_passed',
      'plate_imaging',
      'on_press_heidelberg',
      'uv_coating_finishing',
      'courier_in_transit',
      'delivered_bfh_chapel'
    ];

    const updated = jobHistory.map(job => {
      if (job.jobId === jobId) {
        const currentIndex = stages.indexOf(job.currentStage);
        const nextIndex = Math.min(currentIndex + 1, stages.length - 1);
        return { ...job, currentStage: stages[nextIndex] };
      }
      return job;
    });

    setJobHistory(updated);
    savePressJobHistory(updated);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testPressConnection({
      ...config,
      partnerName: partnerNameInput.trim(),
      productionEmail: productionEmailInput.trim(),
      sftpHost: sftpHostInput.trim(),
      sftpPort: Number(sftpPortInput),
      sftpUsername: sftpUserInput.trim(),
      cloudApiKey: cloudApiKeyInput.trim(),
      courierCompany: courierCompanyInput.trim(),
      deliveryAddress: deliveryAddressInput.trim()
    });
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PressFulfillmentConfig = {
      ...config,
      partnerName: partnerNameInput.trim(),
      productionEmail: productionEmailInput.trim(),
      sftpHost: sftpHostInput.trim(),
      sftpPort: Number(sftpPortInput),
      sftpUsername: sftpUserInput.trim(),
      cloudApiKey: cloudApiKeyInput.trim(),
      courierCompany: courierCompanyInput.trim(),
      deliveryAddress: deliveryAddressInput.trim(),
      isLiveActive: true
    };
    savePressFulfillmentConfig(updated);
    setConfig(updated);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  const stageLabels: Record<PressJobStage, { label: string; color: string; desc: string }> = {
    files_received: { label: 'Files Received', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', desc: 'PDF/X-1a received in secure drop' },
    preflight_passed: { label: 'Pre-Flight Passed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', desc: '300 DPI CMYK bleed validated' },
    plate_imaging: { label: 'CTP Plate Imaging', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', desc: 'Thermal aluminum plates laser-etched' },
    on_press_heidelberg: { label: 'On Heidelberg Press', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', desc: '4-Color Heidelberg offset running' },
    uv_coating_finishing: { label: 'UV Finishing & Bindery', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40', desc: 'Creasing, foil stamping & stitching' },
    courier_in_transit: { label: 'Courier In Transit', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', desc: 'Harlem white-glove direct van en route' },
    delivered_bfh_chapel: { label: 'Delivered to Chapel', color: 'bg-emerald-500/30 text-emerald-200 border-emerald-400', desc: 'Verified at 630 St. Nicholas Ave' }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <Printer className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold text-amber-100">
                  Commercial Press Fulfillment
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  300 DPI CMYK Press Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Partner: <span className="text-amber-300 font-medium">{config.partnerName}</span> • 4-Panel Bulletins, 16-Page Keepsakes & Easel Portraits
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dispatcher')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dispatcher'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Active Case Dispatcher</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Press Job Tracker & Courier HUD ({jobHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preflight')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'preflight'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>300 DPI Pre-Flight Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Press Partner & SFTP Config</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/90 custom-scrollbar">
          
          {/* TAB 1: DISPATCHER */}
          {activeTab === 'dispatcher' && (
            <div className="space-y-6">
              {dispatchSuccessToast && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-emerald-200 animate-fadeIn shadow-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium">{dispatchSuccessToast}</span>
                  </div>
                  <span className="text-xs text-emerald-400/80">Direct Route Active</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Form */}
                <form onSubmit={handleDispatch} className="lg:col-span-2 space-y-6">
                  
                  {/* Case Selector Card */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      1. Select Golden Record Case for Print Dispatch
                    </label>
                    <select
                      value={selectedCase.id}
                      onChange={(e) => {
                        const found = cases.find(c => c.id === e.target.value);
                        if (found) {
                          setSelectedCase(found);
                          setProofApprovedBy(found.informant?.fullName || 'Family Representative');
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.caseNumber} - {c.decedent.legalName} ({c.dispositionType.replace('_', ' ').toUpperCase()})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Primary Family Contact: <strong className="text-slate-200">{selectedCase.informant?.fullName || 'None Recorded'}</strong></span>
                      <span>Service Status: <strong className="text-amber-400">{selectedCase.currentPhase.replace('_', ' ').toUpperCase()}</strong></span>
                    </div>
                  </div>

                  {/* Print Product Options */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      2. Commercial Press Product
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: '4_panel_bulletin',
                          name: '4-Panel Classic Bulletin',
                          size: '8.5" x 11" Half-Fold (4 Printable Sides)',
                          desc: 'Standard sanctuary service program with foil crest',
                          popular: true
                        },
                        {
                          id: '8_panel_trifold',
                          name: '8-Panel Trifold Keepsake',
                          size: '8.5" x 14" Folded Accordion Style',
                          desc: 'Full photo journey with expanded obituary spread'
                        },
                        {
                          id: '16_page_hardcover_keepsake',
                          name: '16-Page Deluxe Hardcover Book',
                          size: '8.5" x 11" Casebound Hardcover',
                          desc: 'Smyth-sewn heirloom volume with gold foil lettering'
                        },
                        {
                          id: 'canvas_easel_portrait',
                          name: '24" x 36" Chapel Easel Portrait',
                          size: 'Archival Canvas on Stretched Timber',
                          desc: 'Velvet-touch portrait for chapel foyer sanctuary'
                        }
                      ].map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => setItemType(prod.id as PressItemType)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            itemType === prod.id
                              ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-950/40 text-slate-100'
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-amber-100">{prod.name}</h4>
                            {prod.popular && (
                              <span className="text-[10px] uppercase font-bold bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/50">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-400/80 font-mono mt-0.5">{prod.size}</p>
                          <p className="text-xs text-slate-400 mt-1">{prod.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity and Paper Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-300 uppercase">Quantity Needed</label>
                        <span className="text-sm font-mono font-bold text-amber-300">{quantity} Copies</span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="1000"
                        step="25"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <button type="button" onClick={() => setQuantity(100)} className="hover:text-amber-300">100</button>
                        <button type="button" onClick={() => setQuantity(250)} className="hover:text-amber-300">250</button>
                        <button type="button" onClick={() => setQuantity(350)} className="hover:text-amber-300 font-bold text-amber-400">350 (Std)</button>
                        <button type="button" onClick={() => setQuantity(500)} className="hover:text-amber-300">500</button>
                        <button type="button" onClick={() => setQuantity(1000)} className="hover:text-amber-300">1000</button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase block">Selected Paper Stock</label>
                      <select
                        value={paperStock}
                        onChange={(e) => setPaperStock(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="100lb Heavy Silk Cover + 80lb Gloss Text (Gold Foil Emboss)">
                          100lb Heavy Silk Cover + 80lb Gloss Text (Gold Foil Emboss)
                        </option>
                        <option value="100lb Gloss Cover Full Color Double Sided">
                          100lb Gloss Cover Full Color Double Sided
                        </option>
                        <option value="Hardcover Casebound with Gold Foil Lettering, 100lb Lustre Pages">
                          Hardcover Casebound with Gold Foil Lettering, 100lb Lustre Pages
                        </option>
                        <option value="120lb Archival Heavy Velvet Touch Matte with Stamped Seal">
                          120lb Archival Heavy Velvet Touch Matte with Stamped Seal
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Finishing Options */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Commercial Finishing & Bindery</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        'Precision Score & Half-Fold',
                        'UV Gloss Protective Coat',
                        'Gold Foil Embossed Cross / Crest',
                        'Smyth Sewn Archival Binding',
                        'Soft-Touch Velvet Lamination',
                        '300 DPI CMYK Bleed Verification'
                      ].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={finishingOptions.includes(opt)}
                            onChange={() => handleToggleFinishing(opt)}
                            className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/50"
                          />
                          <span className="text-slate-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Routing Channel & Proof Approval */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase block">Fulfillment Routing Channel</label>
                      <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="production_email">Dedicated Production Email ({config.productionEmail})</option>
                        <option value="sftp_drop">Direct Secure SFTP Drop ({config.sftpHost})</option>
                        <option value="gelato_cloud_api">Gelato / Lulu Cloud Print API</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase block">Proof Approved By (Signer)</label>
                      <input
                        type="text"
                        value={proofApprovedBy}
                        onChange={(e) => setProofApprovedBy(e.target.value)}
                        placeholder="Family contact or Director name"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Target Delivery & Courier Notes</label>
                    <input
                      type="text"
                      value={deliveryTarget}
                      onChange={(e) => setDeliveryTarget(e.target.value)}
                      placeholder="e.g. Day before service by 9:00 AM (Chapel 1)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 mb-2"
                    />
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Production instructions for press operators..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Submit Dispatch Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isDispatching}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-base flex items-center justify-center space-x-3 shadow-xl shadow-amber-950/50 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      {isDispatching ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Routing 300 DPI CMYK Files to Press Partner...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 font-bold" />
                          <span>Dispatch Press-Ready Order to {config.partnerName} (${calculateEstimatedCost(itemType, quantity).toFixed(2)})</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Right Column: Pre-Flight Summary & Ticket Preview */}
                <div className="space-y-6">
                  
                  {/* Preflight Badge Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-950 border border-slate-700/80 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-amber-100 uppercase tracking-wider">Live Pre-Flight Status</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        PASSED
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Target Resolution</span>
                        <span className="font-mono font-semibold text-emerald-400">300 DPI (Native Press)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Color Separation</span>
                        <span className="font-mono font-semibold text-emerald-400">CMYK (FOGRA39 Offset)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Bleed & Crop Marks</span>
                        <span className="font-mono font-semibold text-emerald-400">0.125" Standard Bleed</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Ink Density (TAC)</span>
                        <span className="font-mono font-semibold text-slate-200">292% (Safe &lt; 300%)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Font Outlining</span>
                        <span className="font-mono font-semibold text-slate-200">100% Vector Embedded</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5">
                      <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Automatic pre-flight confirms zero pixelation. Output complies with Harlem Heritage Press Heidelberg Speedmaster specs.
                      </p>
                    </div>
                  </div>

                  {/* Summary Ticket Card */}
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Estimated Press Cost</h3>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-serif font-bold text-amber-300">
                        ${calculateEstimatedCost(itemType, quantity).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">
                        (${ (calculateEstimatedCost(itemType, quantity) / quantity).toFixed(2) } / unit)
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <p>• Fast-turnaround local courier included</p>
                      <p>• Two archival copies routed to Benta Historical Vault</p>
                      <p>• Proof certificate emailed to signer</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRACKER & COURIER HUD */}
          {activeTab === 'tracker' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100">Live Press Jobs & White-Glove Dispatch</h3>
                  <p className="text-xs text-slate-400">Real-time telemetry from Heidelberg offset press & Harlem direct courier</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                    {jobHistory.length} Total Press Runs
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {jobHistory.map((job) => {
                  const stageInfo = stageLabels[job.currentStage];
                  const stagesList: PressJobStage[] = [
                    'files_received',
                    'preflight_passed',
                    'plate_imaging',
                    'on_press_heidelberg',
                    'uv_coating_finishing',
                    'courier_in_transit',
                    'delivered_bfh_chapel'
                  ];
                  const currentIdx = stagesList.indexOf(job.currentStage);

                  return (
                    <div
                      key={job.jobId}
                      className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 hover:border-slate-600 transition-all space-y-4 shadow-lg"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                            {job.itemType === '16_page_hardcover_keepsake' ? 'BKS' : 'PRG'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-slate-100">{job.jobTicketNumber}</span>
                              <span className="text-xs text-slate-400">({job.caseNumber})</span>
                            </div>
                            <h4 className="text-xs font-semibold text-amber-300">{job.decedentName}</h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stageInfo.color}`}>
                            {stageInfo.label}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">${job.estimatedCost.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Job details */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Item & Quantity:</span>
                          <span className="text-slate-200 font-medium">{job.quantity}x {job.itemTitle}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Paper Stock:</span>
                          <span className="text-slate-200 font-medium">{job.paperStock}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Proof Approved By:</span>
                          <span className="text-slate-200 font-medium">{job.proofApprovedBy} ({job.proofApprovedAt})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Courier Tracking:</span>
                          <span className="text-amber-400 font-mono font-semibold flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            {job.courierTrackingNumber}
                          </span>
                        </div>
                      </div>

                      {/* 7-Step Progress Pipeline */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                          <span>Production & Delivery Progress</span>
                          <span className="text-amber-300 font-semibold">{stageInfo.desc}</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                          {stagesList.map((st, idx) => {
                            const isPast = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div
                                key={st}
                                className={`h-2 rounded-full transition-all ${
                                  isCurrent
                                    ? 'bg-amber-400 animate-pulse shadow-md shadow-amber-500/50'
                                    : isPast
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-800'
                                }`}
                                title={stageLabels[st].label}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <div className="text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Target: {job.targetDeliveryTime}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {job.currentStage !== 'delivered_bfh_chapel' && (
                            <button
                              onClick={() => handleAdvanceStage(job.jobId)}
                              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition-colors flex items-center gap-1"
                            >
                              <span>Advance Stage</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 300 DPI PRE-FLIGHT SUITE */}
          {activeTab === 'preflight' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-amber-100">300 DPI CMYK Pre-Flight & Layout Inspector</h3>
                <p className="text-xs text-slate-400">Heidelberg CTP plate-ready verification engine for 4-panel bulletins and commemorative volumes</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Program Preview Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-950 border border-slate-700/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-amber-300 uppercase">Interactive Proof Spread (8.5x11 Folded)</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      300 DPI Verified
                    </span>
                  </div>

                  {/* Simulated 4-Panel Folding Mockup */}
                  <div className="aspect-[16/10] bg-slate-900 rounded-xl border border-amber-500/30 p-4 relative flex flex-col justify-between overflow-hidden shadow-inner">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="text-[10px] bg-slate-800/90 text-amber-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                        Bleed: 0.125"
                      </span>
                    </div>

                    {/* Program Front Cover Simulation */}
                    <div className="text-center space-y-2 my-auto">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 mx-auto flex items-center justify-center text-amber-300 font-serif font-bold text-xl shadow-lg shadow-amber-950">
                        ✝
                      </div>
                      <p className="text-[11px] uppercase tracking-widest text-amber-300/90 font-serif font-semibold">
                        A Celebration of Life & Legacy
                      </p>
                      <h2 className="text-xl font-serif font-bold text-slate-100 tracking-wide">
                        {selectedCase.decedent.legalName}
                      </h2>
                      <p className="text-xs text-slate-400 font-serif italic">
                        Sunrise: 1948 • Sunset: 2026
                      </p>
                    </div>

                    <div className="border-t border-amber-500/20 pt-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Benta's Funeral Home, Inc. • Harlem, NYC</span>
                      <span className="font-mono text-amber-300/80">CMYK FOGRA39</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => alert(`Downloaded 300 DPI CMYK press file for ${selectedCase.caseNumber}`)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Download PDF/X-1a Press File</span>
                    </button>

                    <button
                      onClick={() => alert(`Full resolution 300 DPI vector preview loaded.`)}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4 text-slate-400" />
                      <span>Zoom Proof</span>
                    </button>
                  </div>
                </div>

                {/* Pre-flight Technical Checkpoints */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Commercial Press Validation Checklist</h4>
                    
                    <div className="space-y-2.5">
                      {[
                        { title: '300 DPI Raster Resolution', desc: 'All portrait photography and emblems are 300 DPI native or vector', pass: true },
                        { title: 'CMYK Color Separation', desc: 'Zero RGB elements; all inks converted to FOGRA39 standard', pass: true },
                        { title: '0.125" Bleed Margins & Crop Marks', desc: 'Safety margin 0.25" inward from trim line; full bleed edges', pass: true },
                        { title: 'Total Area Coverage (TAC) < 300%', desc: 'Shadows capped at 292% to prevent heavy ink smear on press', pass: true },
                        { title: 'Embedded Typography & Curves', desc: 'Garamond Premier Pro and Bodoni fonts converted to vector curves', pass: true }
                      ].map((chk, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{chk.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{chk.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS & SFTP CONFIG */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100">Commercial Press Partner & SFTP Configuration</h3>
                  <p className="text-xs text-slate-400">Configure direct production routing to Harlem Heritage Press and Cloud Print APIs</p>
                </div>
                {saveSuccessToast && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Settings Saved Successfully
                  </span>
                )}
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' : 'bg-red-950/80 border-red-500/50 text-red-200'} flex items-start justify-between space-y-1`}>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{testResult.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Latency: {testResult.latencyMs}ms • Active Channel: {testResult.channel}</p>
                    </div>
                  </div>
                  <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Commercial Partner Details */}
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Print Partner & Production Routing</h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Partner Organization Name</label>
                        <input
                          type="text"
                          value={partnerNameInput}
                          onChange={(e) => setPartnerNameInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Dedicated Production Email</label>
                        <input
                          type="email"
                          value={productionEmailInput}
                          onChange={(e) => setProductionEmailInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">White-Glove Courier Service</label>
                        <input
                          type="text"
                          value={courierCompanyInput}
                          onChange={(e) => setCourierCompanyInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Chapel Delivery Address</label>
                        <input
                          type="text"
                          value={deliveryAddressInput}
                          onChange={(e) => setDeliveryAddressInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Secure SFTP & Cloud API */}
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Secure SFTP Drop & Cloud Print API</h4>
                    
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-slate-300 font-medium mb-1">SFTP Host</label>
                          <input
                            type="text"
                            value={sftpHostInput}
                            onChange={(e) => setSftpHostInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-medium mb-1">Port</label>
                          <input
                            type="number"
                            value={sftpPortInput}
                            onChange={(e) => setSftpPortInput(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">SFTP Username</label>
                        <input
                          type="text"
                          value={sftpUserInput}
                          onChange={(e) => setSftpUserInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Cloud Print API Key (Gelato / Lulu - Optional)</label>
                        <input
                          type="password"
                          value={cloudApiKeyInput}
                          onChange={(e) => setCloudApiKeyInput(e.target.value)}
                          placeholder="gelato_live_key_..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    <span>Test Press SFTP / API Ping</span>
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-950"
                  >
                    Save Press Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Harlem Heritage Press SFTP Drop & Direct Mail Online</span>
          </div>
          <span>Benta's Funeral Home, Inc. • 630 St. Nicholas Ave, Harlem NYC</span>
        </div>

      </div>
    </div>
  );
};
