import React, { useState } from 'react';
import { 
  GoldenRecordCase, 
  DayOfServiceVIPItinerary, 
  ServiceMilestoneItem 
} from '../../lib/types/funeral';
import { generateVIPItinerary } from '../../lib/utils/itineraryGenerator';
import { 
  X, 
  Printer, 
  Phone, 
  Car, 
  MapPin, 
  Clock, 
  Navigation, 
  CheckCircle2, 
  Share2, 
  Users, 
  Compass, 
  ShieldCheck, 
  Copy, 
  Send, 
  ChevronRight, 
  Building2, 
  Heart,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface DayOfServiceVIPItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  isStaffMode?: boolean;
}

export const DayOfServiceVIPItineraryModal: React.FC<DayOfServiceVIPItineraryModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onUpdateCase,
  isStaffMode = false
}) => {
  if (!isOpen || !caseData) return null;

  // Initialize or fetch itinerary data
  const [itinerary, setItinerary] = useState<DayOfServiceVIPItinerary>(() => 
    generateVIPItinerary(caseData)
  );

  const [activeTab, setActiveTab] = useState<'timeline' | 'gps' | 'motorcade' | 'pallbearers'>('timeline');
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(itinerary.milestones[0]?.id || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateMilestoneStatus = (id: string, status: ServiceMilestoneItem['status']) => {
    const updatedMilestones = itinerary.milestones.map(m => 
      m.id === id ? { ...m, status } : m
    );
    const updated = { ...itinerary, milestones: updatedMilestones };
    setItinerary(updated);
    if (onUpdateCase) {
      onUpdateCase({
        ...caseData,
        vipItinerary: updated
      });
    }
    showToast(`Milestone updated to: ${status.replace('_', ' ').toUpperCase()}`);
  };

  const copyShareLink = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/itinerary/${caseData.caseNumber}?token=${itinerary.shareableToken}`;
    navigator.clipboard?.writeText(url);
    showToast("VIP Mobile Itinerary link copied to clipboard!");
  };

  const getCategoryIcon = (category: ServiceMilestoneItem['category']) => {
    switch (category) {
      case 'pickup': return Car;
      case 'viewing': return Heart;
      case 'service': return Building2;
      case 'motorcade': return Compass;
      case 'committal': return MapPin;
      case 'repast': return Users;
      default: return Clock;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 font-sans animate-fadeIn">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#991b1b] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-amber-400/50 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Main Modal Container */}
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none print:bg-white print:text-neutral-900">
        
        {/* Top Gold Foil Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 print:hidden"></div>

        {/* Executive Screen-Only Toolbar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141b2b] via-[#1a2335] to-[#141b2b] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-neutral-800 print:hidden">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-bold shadow-md border border-amber-300">
              <Compass className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  DAY-OF-SERVICE VIP FAMILY ITINERARY
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Case #{caseData.caseNumber}
                </span>
                {isStaffMode && (
                  <span className="text-[10px] bg-red-950 text-red-200 px-2 py-0.5 rounded border border-red-500/40 font-bold">
                    Staff Live Dispatch
                  </span>
                )}
              </div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                Pocket VIP Concierge & Service Itinerary
              </h3>
              <p className="text-[11px] text-neutral-300 font-light">
                {caseData.decedent.legalName} • {itinerary.serviceDate}
              </p>
            </div>
          </div>

          {/* Top Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition border border-neutral-700"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share SMS Link</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm border border-amber-400/40"
              title="Print standard 1-page pocket folded itinerary"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print Pocket Guide</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINT-ONLY OFFICIAL HEADER */}
        <div className="hidden print:block p-8 border-b-2 border-[#991b1b] text-center font-serif-title">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-[#991b1b]">
            Benta’s Funeral Home, Inc.
          </h1>
          <p className="text-xs text-neutral-600 font-sans mt-0.5">
            630 Saint Nicholas Avenue • Harlem, New York 10030 • (212) 281-8696 • Established 1928
          </p>
          <div className="mt-4 p-3 bg-neutral-100 rounded-xl border border-neutral-300 font-sans text-xs flex justify-between items-center">
            <div>
              <strong>In Memory of:</strong> {caseData.decedent.legalName}
            </div>
            <div>
              <strong>Service Date:</strong> {itinerary.serviceDate}
            </div>
            <div>
              <strong>Lead Director:</strong> {itinerary.directorName}
            </div>
          </div>
        </div>

        {/* Director & Chauffeur Hotlines Quick Bar */}
        <div className="bg-neutral-950 p-4 px-6 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs print:bg-white print:border-neutral-200">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            
            {/* Assigned Director Contact */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                FD
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-400">Assigned Funeral Director</div>
                <div className="font-bold text-white print:text-neutral-900 flex items-center gap-1.5">
                  <span>{itinerary.directorName}</span>
                  <span className="text-[10px] text-amber-400/80 font-mono">({itinerary.directorLicense})</span>
                </div>
              </div>
              <a
                href={`tel:${itinerary.directorPhone.replace(/[^0-9]/g, '')}`}
                className="ml-2 bg-[#991b1b] hover:bg-red-800 text-white p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition print:hidden"
                title="Call Director on Duty"
              >
                <PhoneCall className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">Call Director</span>
              </a>
            </div>

            {/* Lead Chauffeur Contact */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                <Car className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-400">Lead Livery Chauffeur</div>
                <div className="font-bold text-white print:text-neutral-900 flex items-center gap-1.5">
                  <span>{itinerary.limousineLeadChauffeur}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Plate: {itinerary.limousinePlate}</span>
                </div>
              </div>
              <a
                href={`tel:${itinerary.limousinePhone?.replace(/[^0-9]/g, '')}`}
                className="ml-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition border border-neutral-700 print:hidden"
                title="Call Chauffeur"
              >
                <Phone className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Call Car</span>
              </a>
            </div>

          </div>

          <div className="text-right text-[11px] text-neutral-400 font-mono hidden lg:block print:hidden">
            <span>24/7 BFH Switchboard: </span>
            <strong className="text-amber-300">(212) 281-8696</strong>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="px-6 pt-3 bg-neutral-900 border-b border-neutral-800 flex gap-2 overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'timeline'
                ? 'bg-neutral-800 text-amber-300 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Service Timeline ({itinerary.milestones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gps')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'gps'
                ? 'bg-neutral-800 text-amber-300 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>GPS Venue Directions</span>
          </button>

          <button
            onClick={() => setActiveTab('motorcade')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'motorcade'
                ? 'bg-neutral-800 text-amber-300 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Motorcade & Cortege Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('pallbearers')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'pallbearers'
                ? 'bg-neutral-800 text-amber-300 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pallbearers & Seating ({itinerary.pallbearers?.length || 0})</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 print:overflow-visible print:p-4">
          
          {/* 1. TIMELINE VIEW */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center print:hidden">
                <div className="text-xs text-neutral-400 font-light">
                  Follow the step-by-step itinerary below. Click any milestone to expand navigation details and special instructions.
                </div>
                <div className="text-[11px] font-mono text-amber-400">
                  {itinerary.milestones.filter(m => m.status === 'completed').length} of {itinerary.milestones.length} Completed
                </div>
              </div>

              {/* Milestone Stepper */}
              <div className="relative border-l-2 border-amber-400/40 ml-4 sm:ml-6 space-y-8 print:border-neutral-300 print:ml-4">
                {itinerary.milestones.map((m) => {
                  const Icon = getCategoryIcon(m.category);
                  const isCompleted = m.status === 'completed';
                  const isInProgress = m.status === 'in_progress';
                  const isSelected = activeMilestoneId === m.id;

                  return (
                    <div key={m.id} className="relative pl-6 sm:pl-8 group">
                      
                      {/* Stepper Node Icon */}
                      <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition border-2 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : isInProgress
                          ? 'bg-[#991b1b] border-amber-400 text-amber-300 animate-pulse'
                          : 'bg-neutral-800 border-neutral-600 text-neutral-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>

                      {/* Milestone Card */}
                      <div 
                        onClick={() => setActiveMilestoneId(isSelected ? '' : m.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-800/90 border-amber-400 shadow-xl'
                            : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                        } print:bg-white print:border-neutral-300 print:p-3`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono font-bold text-amber-300 text-sm sm:text-base bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 print:bg-neutral-100 print:text-neutral-900">
                              {m.timeLabel}
                            </span>
                            <div>
                              <h4 className="font-serif-title font-bold text-white text-base print:text-neutral-900">
                                {m.title}
                              </h4>
                              <div className="text-xs text-neutral-400 font-light flex items-center gap-1.5 mt-0.5 print:text-neutral-600">
                                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                                <span>{m.venueName} • {m.address}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {m.badgeLabel && (
                              <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 print:hidden">
                                {m.badgeLabel}
                              </span>
                            )}

                            {isStaffMode && (
                              <select
                                value={m.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value as any)}
                                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg text-[10px] p-1 font-mono focus:outline-none print:hidden"
                              >
                                <option value="upcoming">Upcoming</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed ✓</option>
                              </select>
                            )}

                            <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform ${isSelected ? 'rotate-90' : ''} print:hidden`} />
                          </div>
                        </div>

                        {/* Expandable Details Drawer */}
                        {(isSelected || true) && (
                          <div className={`mt-4 pt-3 border-t border-neutral-800/80 space-y-3 print:border-neutral-200 ${!isSelected ? 'hidden sm:block' : ''}`}>
                            
                            {m.specialInstructions && (
                              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 font-light italic print:bg-neutral-50 print:text-neutral-700 print:border-neutral-200">
                                <strong className="text-amber-300 font-semibold not-italic mr-1">Family VIP Note:</strong>
                                {m.specialInstructions}
                              </div>
                            )}

                            {m.keyDetails && m.keyDetails.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                {m.keyDetails.map((kd, kIdx) => (
                                  <div key={kIdx} className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 print:bg-white print:border-neutral-200">
                                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">{kd.label}</span>
                                    <span className="font-semibold text-white text-xs mt-0.5 block print:text-neutral-900">{kd.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {m.directionsUrl && (
                              <div className="flex justify-end pt-1 print:hidden">
                                <a
                                  href={m.directionsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700 transition"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  <span>Open Turn-by-Turn GPS</span>
                                </a>
                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 2. GPS VENUE DIRECTIONS HUB */}
          {activeTab === 'gps' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-400 font-light">
                1-Tap GPS navigation buttons to direct private family vehicles to each venue without getting lost.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itinerary.milestones.map((venue) => (
                  <div key={venue.id} className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          {venue.timeLabel} • {venue.category.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-white text-base mt-0.5">
                          {venue.venueName}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {venue.address}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <a
                        href={venue.directionsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm border border-amber-400/40"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-300" />
                        <span>Google Maps</span>
                      </a>

                      <a
                        href={`http://maps.apple.com/?daddr=${encodeURIComponent(venue.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition border border-neutral-700"
                      >
                        <Compass className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Apple Maps</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MOTORCADE & CORTEGE PROTOCOL */}
          {activeTab === 'motorcade' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif-title text-lg font-bold text-white">
                      Official Harlem Motorcade & Cortege Protocol
                    </h4>
                    <p className="text-xs text-neutral-400 font-light">
                      Mandatory safety procedures for private family vehicles participating in the funeral procession.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-neutral-300">
                  {itinerary.cortegeInstructions.map((rule, rIdx) => (
                    <div key={rIdx} className="flex items-start space-x-3 p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                      <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {rIdx + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BFH Gold Pennant Notice Card */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      Gold Cortege Pennants & NYC Toll Exemption
                    </h5>
                    <p className="text-xs text-neutral-400 font-light">
                      Official Benta magnetic pennants are distributed at the chapel curb by directors. All RFK / Triborough bridge tolls are handled via BFH pass-through operating dispatch.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 4. PALLBEARERS & SEATING GUIDE */}
          {activeTab === 'pallbearers' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-serif-title text-lg font-bold text-white">
                    Assigned Pallbearers & Escort Order
                  </h4>
                  <p className="text-xs text-neutral-400 font-light">
                    Active pallbearers assist with casket movement at the chapel and graveside. Honorary pallbearers form the receiving honor guard.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itinerary.pallbearers?.map((p, pIdx) => (
                  <div key={pIdx} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        p.type === 'active' 
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}>
                        {pIdx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{p.name}</div>
                        <div className="text-[11px] text-neutral-400">{p.role || 'Pallbearer'}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      p.type === 'active'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                    }`}>
                      {p.type === 'active' ? 'Active Escort' : 'Honorary'}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* SHARE SMS / EMAIL LINK MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white animate-fadeIn">
            
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-title text-lg font-bold text-white">
                  Share VIP Mobile Itinerary Link
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-neutral-300 font-light">
                Send this private mobile link to designated family members, drivers, and pallbearers. Includes live timeline, GPS navigation, and 1-tap director calling.
              </p>

              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <span className="font-mono text-amber-300 text-[11px] truncate mr-2">
                  https://bfh.nyc/itinerary/{caseData.caseNumber}?token={itinerary.shareableToken}
                </span>
                <button
                  onClick={copyShareLink}
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Pre-formatted SMS Card */}
              <div className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 text-xs space-y-1.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Pre-Formatted SMS Message</div>
                <p className="text-neutral-200 italic font-light">
                  "Good morning family, here is the official Day-of-Service VIP Itinerary and GPS directions for {caseData.decedent.legalName}: bfh.nyc/itinerary/{caseData.caseNumber}. Lead Director: {itinerary.directorName} ({itinerary.directorPhone})."
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  copyShareLink();
                  setIsShareModalOpen(false);
                }}
                className="w-full py-3 bg-[#991b1b] hover:bg-red-800 text-white font-bold rounded-2xl transition border border-amber-400/40 text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Copy & Send to Family Group</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
