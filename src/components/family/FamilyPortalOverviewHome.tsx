import React, { useState } from 'react';
import { GoldenRecordCase, SimulatedNotification } from '../../lib/types/funeral';
import { 
  Sparkles, 
  Headphones, 
  Video, 
  MessageSquare, 
  PenTool, 
  Calendar, 
  Image as ImageIcon, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Building, 
  ChevronRight
} from 'lucide-react';

interface FamilyPortalOverviewHomeProps {
  activeCase: GoldenRecordCase;
  onNavigateTab: (tab: 'obituary' | 'tribute' | 'webcast' | 'concierge' | 'arrangements' | 'documents' | 'photos') => void;
  onOpenESignModal?: () => void;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenGuidedTour?: () => void;
}

export const FamilyPortalOverviewHome: React.FC<FamilyPortalOverviewHomeProps> = ({
  activeCase,
  onNavigateTab,
  onOpenESignModal: _onOpenESignModal,
  onUpdateCase: _onUpdateCase,
  onSendNotification: _onSendNotification,
  onOpenGuidedTour
}) => {
  const [toastMessage] = useState<string | null>(null);

  const pendingDocsCount = activeCase.documents.filter(d => d.status !== 'completed').length;

  const portalOfferings = [
    {
      id: 'obituary' as const,
      tab: 'obituary' as const,
      title: '9-Part Obituary & Life Story Studio',
      subtitle: 'Harlem Legacy Biographical Method',
      icon: Sparkles,
      iconBg: 'bg-amber-100 text-[#b45309]',
      borderHover: 'hover:border-amber-400',
      badge: 'Interactive Story Studio',
      badgeColor: 'bg-amber-50 text-[#b45309] border-amber-200',
      description: 'Craft a timeless tribute using our guided 9-part interview. Generates polished narratives in 3 literary voices (Poetic, Traditional Faith, Journalistic) with zero AI hallucination.',
      highlights: [
        'Guided family voice & text interview questions',
        'Verified Fact Ledger cross-check against vital records',
        'Direct 1-click proof sign-off & print-ready typesetting'
      ],
      buttonText: 'Open Obituary Studio',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'tribute' as const,
      tab: 'tribute' as const,
      title: 'Digital Tribute',
      subtitle: `"Preserving our community's legacy" • Family Legacy Archived at Benta's Funeral Home and the Schaumburg Research Library`,
      icon: Headphones,
      iconBg: 'bg-rose-100 text-[#991b1b]',
      borderHover: 'hover:border-red-400',
      badge: 'Living Voice Keepsakes',
      badgeColor: 'bg-red-50 text-[#991b1b] border-red-200',
      description: 'Collect living voice memories from relatives, church elders, and lifelong friends worldwide. Curated stories are formatted into poetic stanzas and preserved in the museum-grade Heirloom Coffee Table Book.',
      highlights: [
        'Voice prompt cards across Joy, Pain, Sacrifice & Action reflections',
        'AI Poetic Stanza Formatter with audio playback preview',
        'Heirloom Coffee Table Book Volume with scan-to-stream QR codes'
      ],
      buttonText: 'Open Digital Tribute Studio',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'webcast' as const,
      tab: 'webcast' as const,
      title: '4K HD Live Sanctuary Webcasting & Guest Sharing',
      subtitle: 'Open Access Broadcast • No PIN Required for Out-of-Town Guests',
      icon: Video,
      iconBg: 'bg-sky-100 text-sky-800',
      borderHover: 'hover:border-sky-400',
      badge: '4K Multi-Camera Live Stream',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
      description: 'Join the sanctuary celebration of life from anywhere in the world. Features multi-angle 4K PTZ cameras and direct audio. All family, friends, and community members can access the stream directly with zero PIN required.',
      highlights: [
        'Open access stream link for instant SMS/WhatsApp sharing',
        'Multi-angle sanctuary PTZ cameras & pipe organ audio feed',
        '1-Page printable service bulletin with direct stream QR code'
      ],
      buttonText: 'Watch Webcast & Share',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'concierge' as const,
      tab: 'concierge' as const,
      title: '24/7 Family Care Concierge',
      subtitle: 'Live Director & Care Assistant',
      icon: MessageSquare,
      iconBg: 'bg-purple-100 text-purple-800',
      borderHover: 'hover:border-purple-400',
      badge: '24/7 Live Care Chat',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      description: 'Direct conversational chat with our family care assistant and funeral directors for answers about service arrangements, schedules, and guidance.',
      highlights: [
        'Instant conversational answers to questions about your case',
        'Immediate guidance on memorial schedules & service details',
        'Direct connection to Benta family care staff'
      ],
      buttonText: 'Chat with 24/7 Concierge',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'documents' as const,
      tab: 'documents' as const,
      title: 'Legal Authorizations & Digital eSign Suite',
      subtitle: 'State-Mandated Disposition Consents',
      icon: PenTool,
      iconBg: 'bg-emerald-100 text-emerald-800',
      borderHover: 'hover:border-emerald-400',
      badge: `${pendingDocsCount} Action Required`,
      badgeColor: pendingDocsCount > 0 ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Review and legally sign required documents from any phone or computer with interactive preview, drawn signature pad, and instant PDF download.',
      highlights: [
        'NYC EDRS Vital Statistics authorization & permit release',
        'Form AP-47 Statement of Goods and NYS PHL § 4201 consents',
        'Interactive signature pad with certified timestamp certificate'
      ],
      buttonText: 'Review & eSign Documents',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'arrangements' as const,
      tab: 'arrangements' as const,
      title: 'Arrangement Summary & Transparent Accounting',
      subtitle: 'Itemized Statement of Goods & Split-Pay Ledger',
      icon: Calendar,
      iconBg: 'bg-indigo-100 text-indigo-800',
      borderHover: 'hover:border-indigo-400',
      badge: 'Transparent Ledger',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      description: 'Clear itemized review of your selected service package, ceremonial casket or urn, chapel parlor reservation, and split-billing insurance/card payments.',
      highlights: [
        'Complete breakdown conforming to NYS General Price List (GPL)',
        'Direct online family split-payment contribution links',
        'Order of service schedule & cemetery/crematory destination'
      ],
      buttonText: 'View Arrangement Summary',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    },
    {
      id: 'photos' as const,
      tab: 'photos' as const,
      title: 'Memorial Photo Gallery & Announcement Studio',
      subtitle: 'High-Resolution Portrait Archives & Shareable Graphics',
      icon: ImageIcon,
      iconBg: 'bg-pink-100 text-pink-800',
      borderHover: 'hover:border-pink-400',
      badge: 'Social & Text Graphics',
      badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
      description: 'Upload high-resolution family portraits and generate shareable digital funeral announcements for mobile text messaging and social media.',
      highlights: [
        'Designated placement tags: Front Cover, Inside Spread, Memorial Keepsake',
        'Custom themed digital announcements formatted for SMS and Instagram',
        'Safe cloud archive preserved for the family'
      ],
      buttonText: 'Upload Memorial Photos',
      buttonColor: 'bg-[#991b1b] text-white hover:bg-red-800'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. DIGNIFIED WELCOME HERO BANNER */}
      <div className="bg-gradient-to-br from-[#141b2b] via-[#1c2538] to-[#2a1d12] text-white p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden border-2 border-amber-500/40">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-4 opacity-10 pointer-events-none hidden lg:block">
          <Building className="w-64 h-64 text-amber-300" />
        </div>

        <div className="max-w-3xl space-y-4 relative z-10">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center space-x-1.5 bg-amber-400/20 border border-amber-400/60 text-amber-200 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Benta's Private Family Care Portal</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-400/40 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Resting Safely in Care at 630 St. Nicholas Ave</span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-neutral-300 uppercase tracking-widest font-semibold">
              Welcoming {activeCase.informant.fullName} ({activeCase.informant.relationship}) & The Family
            </div>
            <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide">
              In Loving Memory of<br />
              <strong className="text-amber-300">{activeCase.decedent.legalName}</strong>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-light italic">
              {activeCase.decedent.dateOfBirth} — {activeCase.decedent.dateOfDeath} • Case #{activeCase.caseNumber}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed max-w-2xl">
            This private portal is your family’s dedicated, 24/7 digital center to craft your loved one's story, invite friends to share voice tributes, review legal documents, watch the live sanctuary broadcast, and explore financial benefits with complete transparency.
          </p>

          {/* Quick Stats / Highlights Ribbon */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">Sanctuary Service</span>
              <div className="font-bold text-white text-xs">{activeCase.serviceSelections.serviceDate || 'Sep 22, 2026'}</div>
              <div className="text-[10px] text-neutral-300">{activeCase.serviceSelections.viewingParlor}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">4K Live Webcast</span>
              <div className="font-bold text-white text-xs">Chapel 1 & 2 Active</div>
              <div className="text-[10px] text-emerald-300">Open Access • No PIN</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">Legal eSign</span>
              <div className="font-bold text-white text-xs">
                {pendingDocsCount > 0 ? `${pendingDocsCount} Pending Review` : 'All Completed'}
              </div>
              <div className="text-[10px] text-neutral-300">NYC EDRS Verified</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-amber-200 font-bold uppercase block">Director Hotline</span>
              <div className="font-bold text-white text-xs">(212) 281-8850</div>
              <div className="text-[10px] text-neutral-300">Jason Benta, LFD</div>
            </div>
          </div>

          {/* Interactive Tutorial Launcher Banner */}
          {onOpenGuidedTour && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenGuidedTour}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
                title="Start the 6-step interactive family portal guide"
              >
                <Sparkles className="w-4 h-4 text-neutral-950 animate-pulse" />
                <span>Start Interactive Family Guide (6 Comfort Steps)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-amber-200/90 italic">
                💡 Guided walkthrough of your obituary suite, floral gifts, live webcast & legal vault
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#141b2b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* 1.5 CONFIRMATION OF COMPLETED ARRANGEMENT & ACTIVE MEMORIAL SERVICE */}
      <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Official Arrangement Confirmed • Benta's Funeral Home
              </span>
            </div>
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
              Arrangements Finalized: Celebration of Life for {activeCase.decedent.legalName}
            </h2>
            <p className="text-xs text-neutral-500 font-light">
              Your binding funeral arrangements have been completed with Licensed Funeral Director Jason Benta. Your private Family Portal is active with all memorial tools below.
            </p>
          </div>

          <div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>✅ Arrangement Completed & Locked</span>
            </span>
          </div>
        </div>

        {/* 4-Card Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Assigned Funeral Director</span>
            <strong className="text-[#991b1b] text-sm block font-serif-title">{activeCase.assignedDirector || 'Jason Benta, LFD #08850'}</strong>
            <span className="text-neutral-600 text-[11px] block">(212) 281-8850 • Direct Line</span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Statement of Goods (AP-47)</span>
            <strong className="text-emerald-700 text-sm block font-serif-title">Itemized & Finalized</strong>
            <span className="text-neutral-600 text-[11px] block">NYS PHL § 3440-a Compliant</span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Sanctuary Service & Chapel</span>
            <strong className="text-neutral-900 text-sm block font-serif-title">{activeCase.serviceSelections.viewingParlor || 'Chapel Sanctuary'}</strong>
            <span className="text-neutral-600 text-[11px] block">{activeCase.serviceSelections.serviceDate || 'Scheduled with Family'}</span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Family Access Credentials</span>
            <strong className="text-[#991b1b] text-sm block font-mono font-bold">PIN: 1948 (Unlocked)</strong>
            <span className="text-neutral-600 text-[11px] block">Universal Manager PIN: 3995</span>
          </div>

        </div>

      </div>

      {/* 2. "WHERE TO START" RECOMMENDED ACTION ROADMAP */}
      <div className="bg-amber-50/80 border-2 border-amber-300/80 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[#991b1b]">
            <CheckCircle2 className="w-5 h-5 text-[#991b1b]" />
            <h3 className="font-serif-title text-base sm:text-lg font-bold text-neutral-900">
              Where Should Your Family Begin? (Recommended Journey)
            </h3>
          </div>
          <span className="text-xs text-[#b45309] font-bold bg-amber-100 px-3 py-1 rounded-full">
            4-Step Priority Guide
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div 
            onClick={() => onNavigateTab('obituary')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991b1b] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">Tell Their Life Story</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Answer 9 guided biographical questions to craft the official printed obituary and program bio.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>Start Story Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('documents')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-[#b45309] font-bold text-xs flex items-center justify-center">
                2
              </span>
              <PenTool className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">eSign Authorizations</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Review and sign state-required cremation, embalming, and vital records permits from your phone.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>Open eSign Pad</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('tribute')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <Headphones className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">Digital Tribute</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Share voice tribute prompts so relatives can record living memories preserved in the Heirloom Book.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>Open Tribute Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('webcast')}
            className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-[#991b1b] cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                4
              </span>
              <Video className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-neutral-900">Share Live Webcast Link</div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Send the live 4K sanctuary webcast link with zero PIN required for out-of-town mourners worldwide.
            </p>
            <div className="text-[11px] text-[#991b1b] font-bold flex items-center space-x-1 group-hover:underline">
              <span>View Webcast Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. "WHAT THIS PORTAL OFFERS" COMPLETE 7-MODULE DIRECTORY */}
      <div className="space-y-4">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-neutral-900">
              What This Portal Offers Your Family
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Explore the purpose-built studios and suites available inside your private Benta portal.
            </p>
          </div>
        </div>

        {/* 7-Card Grid (2 columns on large screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portalOfferings.map((offering) => {
            const Icon = offering.icon;
            return (
              <div
                key={offering.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border-2 border-neutral-200 ${offering.borderHover} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group`}
              >
                {/* Card Top */}
                <div className="space-y-3">
                  
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center space-x-3">
                      <span className={`p-3 rounded-2xl ${offering.iconBg} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </span>
                      <div>
                        <h3 className="font-serif-title text-lg font-bold text-neutral-900 leading-snug">
                          {offering.title}
                        </h3>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {offering.subtitle}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${offering.badgeColor}`}>
                      {offering.badge}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {offering.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="bg-neutral-50 rounded-2xl p-3.5 space-y-1.5 border border-neutral-200/70 text-xs">
                    {offering.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{h}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card Action Button */}
                <button
                  onClick={() => onNavigateTab(offering.tab)}
                  className={`w-full ${offering.buttonColor} font-bold text-xs py-3 px-4 rounded-2xl transition flex items-center justify-center space-x-2 shadow-md shadow-red-950/10 group-hover:shadow-lg`}
                >
                  <span>{offering.buttonText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

              </div>
            );
          })}
        </div>

      </div>

      {/* 4. SECURITY, PRIVACY & LEGAL COMPLIANCE FOOTER CARD */}
      <div className="bg-[#141b2b] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/40 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif-title text-base sm:text-lg font-bold text-white">
              Bank-Grade Security & New York State Regulatory Compliance
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
              All electronic signatures are cryptographically sealed and comply with <strong>NYS Public Health Law § 4201</strong> and <strong>FTC Funeral Rules</strong>. Pre-need financial funds are held in 100% FDIC-insured trust escrow under NY GBL § 453.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <a
            href="tel:2122818850"
            className="px-5 py-3 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs rounded-2xl transition flex items-center space-x-2 shadow-lg shadow-red-950/40"
          >
            <Phone className="w-4 h-4 text-amber-300" />
            <span>Call Director: (212) 281-8850</span>
          </a>
        </div>

      </div>

    </div>
  );
};
