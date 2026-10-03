import React, { useState } from 'react';
import { BookOpen, Search, Heart, Sparkles, Video, Send } from 'lucide-react';

export const ObituariesTributes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [litCandles, setLitCandles] = useState<{ [key: string]: number }>({
    'obit-1': 48,
    'obit-2': 32,
    'obit-3': 19
  });
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [condolenceText, setCondolenceText] = useState('');

  const obituaries = [
    {
      id: 'obit-1',
      name: 'Viola Brown',
      dates: 'Sunrise: March 14, 1938 – Sunset: September 20, 2026',
      serviceDate: 'Saturday, September 26, 2026 at 10:00 AM',
      location: "Benta's Main Chapel (630 Saint Nicholas Ave, New York, NY)",
      image: '/images/ebfh/Viola_Brown_Program_Photo.png',
      summary: 'Beloved matriarch, educator, and lifelong Harlem resident whose grace and radiant smile touched generations.',
      hasLivestream: true,
      hasDigiTribute: true
    },
    {
      id: 'obit-2',
      name: 'Alvin Jackson',
      dates: 'Sunrise: August 11, 1945 – Sunset: September 18, 2026',
      serviceDate: 'Friday, September 25, 2026 at 11:00 AM',
      location: 'Abyssinian Baptist Church (132 W 138th St, Harlem, NY)',
      image: '/images/ebfh/Alvin_Jackson_Front_of_Program.jpg',
      summary: 'Honored U.S. Veteran, community deacon, and devoted father celebrated for a lifetime of faith, service, and dignity.',
      hasLivestream: true,
      hasDigiTribute: true
    },
    {
      id: 'obit-3',
      name: 'Dorothy Aiken',
      dates: 'Sunrise: June 22, 1941 – Sunset: September 19, 2026',
      serviceDate: 'Monday, September 28, 2026 at 10:30 AM',
      location: "Benta's Parlor B (Harlem Memorial Chapel, 630 St Nicholas Ave)",
      image: '/images/ebfh/DorothyAiken.jpg',
      summary: 'Dedicated nurse, cherished grandmother, and pillar of the Harlem community known for her generous heart and spirit.',
      hasLivestream: true,
      hasDigiTribute: true
    },
    {
      id: 'obit-4',
      name: 'Florie Scobie',
      dates: 'Sunrise: February 2, 1935 – Sunset: September 15, 2026',
      serviceDate: 'Private Family Committal at Ferncliff Cemetery',
      location: 'Ferncliff Chapel, Hartsdale, NY',
      image: '/images/ebfh/Florie_Scobie_Program_and_Prayer_Card_Photo.png',
      summary: 'Beloved mother and retired city administrator who devoted her life to youth mentorship and cultural preservation.',
      hasLivestream: false,
      hasDigiTribute: true
    }
  ];

  const handleLightCandle = (id: string) => {
    setLitCandles(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const filtered = obituaries.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="obituaries" className="py-20 bg-white border-b border-red-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs text-[#991b1b] font-bold tracking-wide uppercase">
              <BookOpen className="w-3.5 h-3.5 text-[#b45309]" />
              <span>Current Memorials & Tributes</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-neutral-900">
              Obituaries & 360° Digi-Tributes
            </h2>
            <p className="text-neutral-600 text-sm font-light">
              Light a virtual candle, leave heartfelt condolences, view service programs, and join virtual livestreams.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by loved one's name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fbfbfd] border border-neutral-300 focus:border-[#991b1b] rounded-lg pl-10 pr-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Obituaries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((obit) => (
            <div 
              key={obit.id}
              className="bg-white rounded-2xl border border-neutral-200 hover:border-red-300 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl group"
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-56 bg-neutral-900 overflow-hidden">
                  <img 
                    src={obit.image} 
                    alt={obit.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {obit.hasLivestream && (
                      <span className="bg-red-900/90 backdrop-blur-md border border-red-400/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Video className="w-3 h-3 text-white animate-pulse" /> Virtual Stream
                      </span>
                    )}
                    {obit.hasDigiTribute && (
                      <span className="bg-amber-900/90 backdrop-blur-md border border-amber-300/50 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-amber-300" /> 360° Tribute
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-serif-title text-xl font-bold text-white leading-snug">
                      {obit.name}
                    </h3>
                    <p className="text-[11px] text-amber-300 font-mono font-medium mt-0.5">{obit.dates}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {obit.summary}
                  </p>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] space-y-1">
                    <span className="text-[#991b1b] font-bold block uppercase tracking-wider">Service Information:</span>
                    <p className="text-neutral-900 font-semibold">{obit.serviceDate}</p>
                    <p className="text-neutral-600 font-light">{obit.location}</p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-5 pt-0 border-t border-neutral-100 mt-4 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleLightCandle(obit.id)}
                  className="flex items-center space-x-1.5 text-[#991b1b] hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 font-bold transition"
                >
                  <Heart className="w-3.5 h-3.5 fill-[#991b1b] text-[#991b1b]" />
                  <span>Light Candle ({litCandles[obit.id] || 0})</span>
                </button>

                <button
                  onClick={() => setActiveMessage(activeMessage === obit.id ? null : obit.id)}
                  className="text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Condolences
                </button>
              </div>

              {/* Collapsible Condolence Form */}
              {activeMessage === obit.id && (
                <div className="p-4 bg-red-50/50 border-t border-red-100 space-y-2">
                  <p className="text-[11px] text-neutral-800 font-bold">Leave a memory or prayer for the family:</p>
                  <textarea
                    rows={2}
                    value={condolenceText}
                    onChange={(e) => setCondolenceText(e.target.value)}
                    placeholder="Write a message of comfort..."
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#991b1b]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveMessage(null)}
                      className="text-xs text-neutral-500 px-2 py-1 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert('Your condolence message has been recorded and delivered to the family.');
                        setCondolenceText('');
                        setActiveMessage(null);
                      }}
                      className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" /> Send to Family
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
