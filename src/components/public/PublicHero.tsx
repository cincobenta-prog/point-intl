import React from 'react';
import { Phone, Sparkles, MapPin, Clock, Award, Lock, ShieldCheck, Heart } from 'lucide-react';

interface PublicHeroProps {
  onOpenArranger: () => void;
  onExploreServices: () => void;
  onOpenNotable: () => void;
  onOpenFamilyPortal?: () => void;
  onOpenDirectorPortal?: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  onOpenArranger,
  onOpenNotable,
  onOpenFamilyPortal,
  onOpenDirectorPortal
}) => {
  return (
    <div className="space-y-0">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] via-[#fffbfb] to-[#f9f9fc] py-16 md:py-24 border-b border-red-900/10">
        {/* Background Decorative Gold Grid and Ambient Lights */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#991b1b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200/80 px-3.5 py-1.5 rounded-full text-xs text-[#991b1b] font-bold shadow-sm">
                <Award className="w-3.5 h-3.5 text-[#b45309]" />
                <span>Harlem's Historic Funeral Home • Continuous Service Since 1928</span>
              </div>

              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                Honoring Life with <br />
                <span className="red-gradient-text">Dignity, Heritage & Grace</span>
              </h1>

              <p className="text-neutral-700 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                For nearly a century, Benta's Funeral Home has guided families through life's most sacred moments. 
                Located at 630 Saint Nicholas Avenue in Harlem, we offer personalized celebrations of life, direct and full cremation, traditional church services, and pre-need guidance with absolute transparent care.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onOpenArranger}
                  className="bg-gradient-to-r from-[#991b1b] to-[#b91c1c] hover:from-[#7f1d1d] hover:to-[#991b1b] text-white font-bold text-sm px-7 py-3.5 rounded-lg shadow-lg shadow-red-950/20 hover:shadow-red-900/30 transition flex items-center space-x-2.5 border border-amber-400/40 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Pre-Arrangement Vital Records & Planning</span>
                </button>

                {onOpenFamilyPortal && (
                  <button
                    onClick={onOpenFamilyPortal}
                    className="bg-[#faf7f2] hover:bg-[#f5eedf] text-[#af893e] font-bold text-sm px-6 py-3.5 rounded-lg border border-[#e6dac1] transition flex items-center space-x-2 shadow-sm cursor-pointer"
                  >
                    <span>🕊️ Access Family Portal (PIN: 3995)</span>
                  </button>
                )}

                <a
                  href="tel:+12122818850"
                  className="bg-white hover:bg-red-50 text-neutral-900 font-semibold text-sm px-6 py-3.5 rounded-lg border border-neutral-300 hover:border-[#991b1b] transition flex items-center space-x-2 shadow-sm"
                >
                  <Phone className="w-4 h-4 text-[#991b1b]" />
                  <span>Immediate Care (212) 281-8850</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200 text-xs">
                <div className="space-y-1">
                  <span className="font-serif-title text-xl font-bold text-[#991b1b]">98 Years</span>
                  <p className="text-neutral-600 font-medium">Harlem Community Trust</p>
                </div>
                <div className="space-y-1">
                  <span className="font-serif-title text-xl font-bold text-[#b45309]">100%</span>
                  <p className="text-neutral-600 font-medium">Transparent FTC Pricing</p>
                </div>
                <div className="space-y-1">
                  <span className="font-serif-title text-xl font-bold text-[#991b1b]">2 Chapels</span>
                  <p className="text-neutral-600 font-medium">Seats 120 & 110 for Services</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card / Facility Preview */}
            <div className="lg:col-span-5">
              <div className="relative glass-card-light p-4 rounded-2xl border border-neutral-200 shadow-xl">
                <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200">
                  <div 
                    className="w-full h-full bg-cover bg-center transition duration-700 hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(153,27,27,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%), url('https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80')`
                    }}
                  />
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-md text-[#991b1b] text-[11px] font-bold px-3 py-1 rounded-full border border-amber-400/50 flex items-center gap-1.5 shadow-sm">
                      <MapPin className="w-3 h-3 text-[#991b1b]" />
                      Harlem • 630 Saint Nicholas Ave
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-red-100 shadow-md">
                    <p className="text-xs text-[#991b1b] font-bold uppercase tracking-wider">A Sanctuary of Comfort</p>
                    <p className="text-sm font-medium text-neutral-900 mt-0.5">
                      Two warm, comfortable parlors designed for intimate family viewings and grand memorial celebrations.
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200 text-xs">
                      <span className="text-neutral-600 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#b45309]" /> Mon–Fri 9am–5pm (24/7 on call)
                      </span>
                      <button 
                        onClick={onOpenNotable}
                        className="text-[#991b1b] hover:text-red-900 font-bold underline underline-offset-4 cursor-pointer"
                      >
                        Notable Services →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SHOWCASE OF NEW FEATURES & TWO PORTALS TO FAMILIES       */}
      {/* ======================================================== */}
      <section className="py-16 bg-[#faf7f2] border-b border-[#ece5d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="bg-[#f5eedf] text-[#af893e] border border-[#e6dac1] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              🕊️ Modern Memorial Innovations
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#191714]">
              New Memorial Features for Our Families
            </h2>
            <p className="text-xs sm:text-sm text-[#69635b] leading-relaxed">
              Every family served by Benta's receives full access to our next-generation memorial technology suite, combining timeless heritage with digital storytelling.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: 360 Digital Tribute Studio */}
            <div className="bg-white border border-[#ece5d8] rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-[#f5eedf] text-[#af893e] flex items-center justify-center text-xl font-bold">
                🎙️
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#191714] group-hover:text-[#af893e] transition">
                360° Digital Tribute Studio
              </h3>
              <p className="text-xs text-[#69635b] leading-relaxed">
                Gather acoustic voice recordings, video tributes, and written reflections from friends worldwide using 78 relationship-paired reflection prompts.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#af893e] flex items-center gap-1">
                <span>Dynamic Question Bank</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 2: Coffee Table Book Edition */}
            <div className="bg-white border border-[#ece5d8] rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-[#f5eedf] text-[#af893e] flex items-center justify-center text-xl font-bold">
                📖
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#191714] group-hover:text-[#af893e] transition">
                Keepsake Coffee Table Volume
              </h3>
              <p className="text-xs text-[#69635b] leading-relaxed">
                Museum-grade heirloom book formatting memories into 4-line poetic stanzas with embedded scan-to-stream QR audio playback.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#af893e] flex items-center gap-1">
                <span>Printable PDF & QR Codes</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 3: Vital Records Pre-Intake */}
            <div className="bg-white border border-[#ece5d8] rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#991b1b] flex items-center justify-center text-xl font-bold">
                📋
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#191714] group-hover:text-[#991b1b] transition">
                Vital Records Pre-Intake
              </h3>
              <p className="text-xs text-[#69635b] leading-relaxed">
                Complete your Vital Records sheet online prior to your appointment. Information auto-ports to Removal & Schedule queues.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#991b1b] flex items-center gap-1">
                <span>Instant Queue Porting</span>
                <span>→</span>
              </div>
            </div>

            {/* Feature 4: Director Consultation & PIN */}
            <div className="bg-white border border-[#ece5d8] rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">
                🤝
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#191714] group-hover:text-emerald-700 transition">
                Director Arrangement & PIN
              </h3>
              <p className="text-xs text-[#69635b] leading-relaxed">
                Meet in person or virtually with your licensed Funeral Director to finalize selections. Your secure Family PIN is generated at completion.
              </p>
              <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <span>Guided Family Tour</span>
                <span>→</span>
              </div>
            </div>

          </div>

          {/* Two Portals Access Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Family Portal Banner Card */}
            <div className="bg-white border-2 border-[#e6dac1] rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[#af893e] font-bold text-xs uppercase tracking-wider">
                  <Heart className="w-4 h-4 text-[#af893e]" />
                  <span>For Families & Friends</span>
                </div>
                <h3 className="font-serif-title text-2xl font-bold text-[#191714]">
                  Private Family Portal
                </h3>
                <p className="text-xs text-[#69635b] leading-relaxed">
                  Access your loved one's 360 Digital Tribute Studio, Keepsake Coffee Table Book, 9-Part Memorial Studio, Floral Tribute Shop, and Live Chapel Webcasting.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#ece5d8]">
                <span className="text-[11px] text-[#69635b]">
                  Protected by confidential 4-digit PIN (or Master PIN <strong className="font-mono text-[#af893e]">3995</strong>)
                </span>
                {onOpenFamilyPortal && (
                  <button
                    onClick={onOpenFamilyPortal}
                    className="bg-[#af893e] hover:bg-[#96732f] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Open Family Vault →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Director / Staff Back-Office Banner Card */}
            <div className="bg-[#191714] text-white border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>For Licensed Staff & Directors</span>
                </div>
                <h3 className="font-serif-title text-2xl font-bold text-white">
                  Director Back-Office Console
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Manage Golden Records, EDRS rapid death certificate filings, Form AP-47 contracts, livery dispatch, facility calendar, and commercial press fulfillment.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800">
                <span className="text-[11px] text-neutral-400">
                  NYS LFD Reg #08850 Security Gateway
                </span>
                {onOpenDirectorPortal && (
                  <button
                    onClick={onOpenDirectorPortal}
                    className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer border border-amber-400/30"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Director Login (PIN: 3995) →</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
