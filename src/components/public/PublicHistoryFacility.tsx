import React from 'react';
import { History, Building2, Users, Shield, Check } from 'lucide-react';

export const PublicHistoryFacility: React.FC = () => {
  return (
    <section id="history" className="py-20 bg-white border-b border-red-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid: History & Legacy with Real Images */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs text-[#991b1b] font-bold tracking-wide uppercase">
              <History className="w-3.5 h-3.5 text-[#b45309]" />
              <span>Harlem Roots Since 1928</span>
            </div>

            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              A Living Testament to <br />
              <span className="red-gradient-text">Harlem's Cultural History</span>
            </h2>

            <div className="space-y-4 text-neutral-600 text-sm leading-relaxed font-light">
              <p>
                In <strong>1928</strong>, George Alexander Benta recognized a vital need in the Harlem community for dignified, compassionate, and professional funeral services. Facing the severe social and economic challenges of the era, his unwavering commitment established one of the premier African American-owned funeral establishments in New York.
              </p>
              <p>
                Following his passing in 1966, his son <strong>George Bernard Benta</strong> took the helm, providing steadfast leadership for decades and cementing Benta’s reputation for honoring everyday families alongside legendary cultural figures during the Cotton Club and civil rights eras.
              </p>
              <p>
                In 2002, fourth-generation funeral director <strong>Jason Benta</strong> assumed leadership. Today, Benta's Funeral Home seamlessly unites time-honored traditions and deep spiritual respect with modern digital technology, automated family transparency, and state-of-the-art arrangement workflows.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-700 font-semibold">
              <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                <Shield className="w-4 h-4 text-[#991b1b]" />
                <span>NYS Licensed & Inspected (Reg #08850)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                <Users className="w-4 h-4 text-[#b45309]" />
                <span>Family Owned & Operated • 4 Generations</span>
              </div>
            </div>
          </div>

          {/* Right History Visual Timeline & Authentic Archive Photos */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative rounded-xl overflow-hidden border border-neutral-200 shadow-sm group h-44">
                <img
                  src="/images/ebfh/Coton_Club.jpg"
                  alt="Historic Harlem Cotton Club Era"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] text-amber-200 font-mono font-bold bg-black/60 px-2 py-0.5 rounded">
                  Harlem Renaissance Era (1928)
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-neutral-200 shadow-sm group h-44">
                <img
                  src="/images/ebfh/GeorgeBenta_thumnail.png"
                  alt="George Benta Leadership"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] text-amber-200 font-mono font-bold bg-black/60 px-2 py-0.5 rounded">
                  George Benta Stewardship
                </span>
              </div>
            </div>

            <div className="bg-[#fffdfd] p-5 rounded-2xl border border-red-200/80 shadow-md space-y-4">
              <h3 className="font-serif-title text-base font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#991b1b]" />
                Generations of Service in Harlem
              </h3>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-red-200">
                
                <div className="relative flex items-start space-x-4 pl-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#991b1b] ring-4 ring-white shrink-0 mt-1 shadow-sm" />
                  <div>
                    <span className="text-[11px] font-bold text-[#991b1b] font-mono">1928 — FOUNDATION</span>
                    <h4 className="text-xs font-bold text-neutral-900">George A. Benta Establishes the Home</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Founded on St. Nicholas Avenue during the peak of the Harlem Renaissance.</p>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pl-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#b45309] ring-4 ring-white shrink-0 mt-1 shadow-sm" />
                  <div>
                    <span className="text-[11px] font-bold text-[#b45309] font-mono">1966 — STEWARDSHIP</span>
                    <h4 className="text-xs font-bold text-neutral-900">George Bernard Benta Expands the Legacy</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Conducting historic services for Langston Hughes, Count Basie, and Alvin Ailey.</p>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pl-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#991b1b] ring-4 ring-white shrink-0 mt-1 shadow-sm" />
                  <div>
                    <span className="text-[11px] font-bold text-[#991b1b] font-mono">2002 to PRESENT — INNOVATION</span>
                    <h4 className="text-xs font-bold text-neutral-900">Jason Benta & Digital Modernization</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">360° Digi-Tributes, Golden Record Data Architecture, and Cicely Tyson memorials.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: 630 Saint Nicholas Facility Tour with Authentic Images */}
        <div id="facility" className="mt-16 pt-16 border-t border-neutral-200">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-xs text-[#991b1b] font-bold tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#991b1b]" />
              <span>Sanctuary & Chapels</span>
            </div>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-neutral-900">
              The Facility at 630 Saint Nicholas Avenue
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-light">
              Two grand, comfortable chapels and family viewing suites designed for intimate family gatherings and majestic celebrations of life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Parlor A / Main Chapel */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition overflow-hidden group">
              <div className="relative h-56 bg-neutral-900 overflow-hidden">
                <img
                  src="/images/ebfh/Suite_-_Easel_IMG_7469.jpg"
                  alt="Parlor A Chapel & Digital Easel Suite"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <span className="absolute top-3 right-3 text-xs bg-[#991b1b] text-white font-bold px-3 py-1 rounded-full border border-amber-300/40 shadow-sm">
                  Seats 120 Guests
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h4 className="font-serif-title text-xl font-bold text-white">
                    Parlor A (Saint Nicholas Main Chapel)
                  </h4>
                  <p className="text-xs text-amber-200 font-medium">Grand Ceremony Sanctuary & 4K Webcast</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Our grand main sanctuary featuring warm mahogany appointments, plush seating for up to 120 guests, integrated audio/video live-streaming screens, and private family alcoves.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700 font-medium pt-2 border-t border-neutral-100">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#991b1b]" /> 4K HD Live Streaming</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#991b1b]" /> Piano & Organ Audio</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#991b1b]" /> ADA Handicap Accessible</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#991b1b]" /> Climate Controlled Air</span>
                </div>
              </div>
            </div>

            {/* Parlor B / Second Chapel */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition overflow-hidden group">
              <div className="relative h-56 bg-neutral-900 overflow-hidden">
                <img
                  src="/images/ebfh/Suite_-_Easel_IMG_20240806_0010_copy.jpg"
                  alt="Parlor B Memorial Suite"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <span className="absolute top-3 right-3 text-xs bg-[#b45309] text-white font-bold px-3 py-1 rounded-full border border-amber-300/40 shadow-sm">
                  Seats 110 Guests
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h4 className="font-serif-title text-xl font-bold text-white">
                    Parlor B (Harlem Memorial Chapel)
                  </h4>
                  <p className="text-xs text-amber-200 font-medium">Viewing Suite & Digital Memorial Easels</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Our stately second chapel seating up to 110 guests, tailored for extended family vigils, celebration-of-life multimedia presentations, and traditional viewing ceremonies.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700 font-medium pt-2 border-t border-neutral-100">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#b45309]" /> 360° Digi-Tribute Easels</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#b45309]" /> Private Family Lounge</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#b45309]" /> Dedicated Floral Staging</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#b45309]" /> Guest Registry & WiFi</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

