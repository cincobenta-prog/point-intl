import React, { useState } from 'react';
import { Award, Sparkles, BookOpen, Music, Star, Film, Mic, UserCheck } from 'lucide-react';

export const NotableServices: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const notables = [
    {
      name: 'Cicely Tyson',
      title: 'Legendary Academy Award-Nominated Actress, Presidential Medal of Freedom Recipient & Cultural Icon',
      year: '1924 – 2021',
      category: 'arts',
      image: '/images/ebfh/notable/Cicely_Tyson_-_banner_bw.jpg',
      description: 'Benta’s Funeral Home had the sacred honor of preparing the funeral arrangements and official memorial program for Harlem’s own Cicely Tyson, followed by private services at Abyssinian Baptist Church.',
      icon: Star,
      tag: 'Cultural Icon'
    },
    {
      name: 'Langston Hughes',
      title: 'Leader of the Harlem Renaissance, Poet Laureate & Playwright',
      year: '1901 – 1967',
      category: 'literature',
      image: '/images/ebfh/james_langston_hughes.jpg',
      description: 'The poet laureate of Harlem. His historic community arrangements and funeral service were prepared with timeless dignity at 630 Saint Nicholas Avenue.',
      icon: Award,
      tag: 'Renaissance Leader'
    },
    {
      name: 'Alvin Ailey',
      title: 'Visionary Choreographer & Founder, Alvin Ailey American Dance Theater',
      year: '1931 – 1989',
      category: 'arts',
      image: '/images/ebfh/Ailey_-_2_0.jpg',
      description: 'Whose transformative choreography enriched world culture. Benta’s assisted the family and the global dance community in celebrating his immortal artistry.',
      icon: Sparkles,
      tag: 'Master Choreographer'
    },
    {
      name: 'Count Basie',
      title: 'Iconic Big Band Leader, Pianist & American Jazz Royalty',
      year: '1904 – 1984',
      category: 'music',
      image: '/images/ebfh/william_count_basie.jpg',
      description: 'Bringing the swing era and Kansas City jazz sound to the world stage. Entrusted to Benta’s for dignified final coordination.',
      icon: Music,
      tag: 'Jazz Royalty'
    },
    {
      name: 'James Baldwin',
      title: 'Acclaimed Essayist, Novelist, Playwright & Civil Rights Conscience',
      year: '1924 – 1987',
      category: 'literature',
      image: '/images/ebfh/JamesBaldwin_-SophieBassouls_GettyImages-970956586.jpg',
      description: 'One of the twentieth century’s greatest literary figures and Harlem native, whose final journey and community farewell were entrusted to the care of Benta’s.',
      icon: BookOpen,
      tag: 'Literary Giant'
    },
    {
      name: 'Paul Robeson',
      title: 'World-Renowned Bass-Baritone Concert Artist, Stage Actor & Human Rights Champion',
      year: '1898 – 1976',
      category: 'music',
      image: '/images/ebfh/notable/Paul-Robeson.jpg',
      description: 'Global activist, Rutgers football star, and concert virtuoso whose memorial services were conducted under the reverent care of Benta’s Funeral Home.',
      icon: Music,
      tag: 'Global Icon'
    },
    {
      name: 'Arthur Mitchell Jr.',
      title: 'First African American Principal Dancer at NYC Ballet & Co-Founder of Dance Theatre of Harlem',
      year: '1934 – 2018',
      category: 'arts',
      image: '/images/ebfh/Arthur_Mitchell_Jr._2.jpg',
      description: 'Trailblazing dance pioneer who founded Dance Theatre of Harlem following the assassination of Dr. Martin Luther King Jr., bringing classical ballet to Uptown youth.',
      icon: Sparkles,
      tag: 'Ballet Pioneer'
    },
    {
      name: 'Basil A. Paterson',
      title: 'NYS Secretary of State, Deputy Mayor of NYC & Civil Rights Leader',
      year: '1926 – 2014',
      category: 'leaders',
      image: '/images/ebfh/Basil_A._Paterson_2_bw.jpg',
      description: 'Influential member of Harlem’s historic "Gang of Four" who shaped modern New York political history and championed minority business advancement.',
      icon: UserCheck,
      tag: 'Statesman'
    },
    {
      name: 'Dr. John Henrik Clarke',
      title: 'Pioneering Pan-Africanist Scholar, Historian & Professor Emeritus',
      year: '1915 – 1998',
      category: 'literature',
      image: '/images/ebfh/notable/Dr_John_Henrik_Clarke.jpg',
      description: 'World-renowned African and Afro-American history scholar whose lectures and foundational writings awakened generations to global African history.',
      icon: BookOpen,
      tag: 'Eminent Scholar'
    },
    {
      name: 'Kenneth Bancroft Clark',
      title: 'First African American President of APA & Renowned Civil Rights Psychologist',
      year: '1914 – 2005',
      category: 'leaders',
      image: '/images/ebfh/notable/Kenneth_Bancroft_Clark.jpg',
      description: 'Co-conducted the historic "Doll Test" studies cited by the U.S. Supreme Court in Brown v. Board of Education, striking down school segregation.',
      icon: Award,
      tag: 'Civil Rights Giant'
    },
    {
      name: 'Gil Noble',
      title: 'Legendary ABC News Journalist & Emmy Award-Winning Host of "Like It Is"',
      year: '1932 – 2012',
      category: 'media',
      image: '/images/ebfh/Gil_Noblebw.jpg',
      description: 'Respected investigative journalist and documentarian who chronicled the Black experience for over four decades on television.',
      icon: Mic,
      tag: 'Journalist'
    },
    {
      name: 'Norma Miller',
      title: '"Queen of Swing", Lindy Hop Pioneer & Savoy Ballroom Icon',
      year: '1919 – 2019',
      category: 'arts',
      image: '/images/ebfh/Norma-Miller-RIP-1024x680.jpg',
      description: 'Dancer, comedian, and author who danced at the Savoy Ballroom and Whitey’s Lindy Hoppers, spreading swing dance worldwide.',
      icon: Sparkles,
      tag: 'Queen of Swing'
    },
    {
      name: 'Malik Sealy',
      title: 'St. John’s University All-American & NBA Star (Timberwolves, Pacers, Clippers)',
      year: '1970 – 2000',
      category: 'sports',
      image: '/images/ebfh/Malik_Sealy_bw.jpg',
      description: 'Beloved Bronx/Harlem basketball hero and NBA standout remembered for his infectious spirit, talent, and devotion to youth athletics.',
      icon: Star,
      tag: 'Athletic Hero'
    },
    {
      name: 'Adolph Ceasar',
      title: 'Academy Award-Nominated Actor ("A Soldier’s Story", "The Color Purple")',
      year: '1933 – 1986',
      category: 'arts',
      image: '/images/ebfh/Adolph_Ceasar-1.jpg',
      description: 'Distinguished Harlem-born stage and screen actor celebrated for his resonant baritone voice and compelling dramatic performances.',
      icon: Film,
      tag: 'Dramatic Actor'
    },
    {
      name: 'Vaughn Harper',
      title: 'Iconic WBLS "Quiet Storm" Radio Host & Voice of NYC Late-Night Soul',
      year: '1945 – 2016',
      category: 'media',
      image: '/images/ebfh/Vaughn-Harper_BW.jpg',
      description: 'The velvet baritone voice behind WBLS’s legendary "Quiet Storm", soothing millions of New Yorkers across the airwaves for decades.',
      icon: Mic,
      tag: 'Radio Legend'
    },
    {
      name: 'Clarice Taylor',
      title: 'Emmy-Nominated Stage & TV Actress (The Cosby Show, Sesame Street)',
      year: '1917 – 2011',
      category: 'arts',
      image: '/images/ebfh/Clarice_Taylor_BW.jpg',
      description: 'Beloved actress who brought joy to millions as "Grandma Anna Huxtable" and celebrated Harlem stage productions.',
      icon: Film,
      tag: 'Beloved Actress'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Notable Figures' },
    { id: 'arts', label: 'Arts & Stage' },
    { id: 'literature', label: 'Literature & History' },
    { id: 'music', label: 'Jazz & Music' },
    { id: 'leaders', label: 'Civic Leaders' },
    { id: 'media', label: 'Media & Sports' }
  ];

  const filteredNotables = activeCategory === 'all'
    ? notables
    : notables.filter(n => {
      if (activeCategory === 'media') return n.category === 'media' || n.category === 'sports';
      return n.category === activeCategory;
    });

  return (
    <section id="notable" className="py-20 bg-white border-b border-red-900/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs text-[#991b1b] font-bold tracking-wide uppercase">
            <Award className="w-3.5 h-3.5 text-[#b45309]" />
            <span>A Legacy of Reverence Since 1928</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-neutral-900">
            Notable Services & Memorials
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
            For generations, the most distinguished luminaries of arts, literature, civil rights, music, and community leadership—along with everyday families across New York—have entrusted Benta's Funeral Home to celebrate their lives with majesty and care.
          </p>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-[#991b1b] text-white shadow-sm border border-amber-300/40'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotables.map((person, idx) => {
            const Icon = person.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200 hover:border-red-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Real Scraped Photo from e-bfh.com */}
                  <div className="relative h-56 bg-neutral-900 overflow-hidden">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        // Fallback placeholder with initials if needed
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                        {person.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-serif-title text-lg font-bold text-white leading-snug">
                        {person.name}
                      </h3>
                      <p className="text-[11px] text-amber-300 font-mono font-medium">{person.year}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-[#b45309] font-semibold line-clamp-2">
                      {person.title}
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed font-light line-clamp-4">
                      {person.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-neutral-100 flex items-center text-[11px] text-neutral-500 group-hover:text-[#991b1b] transition font-medium">
                  <Icon className="w-3.5 h-3.5 mr-1.5 text-[#b45309] shrink-0" />
                  <span className="truncate">Arranged by Benta's Funeral Home</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quote banner: Crimson & Gold */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#991b1b] text-white border border-amber-400/40 text-center max-w-4xl mx-auto shadow-xl shadow-red-950/20">
          <p className="font-serif-title text-lg sm:text-xl text-amber-200 italic font-medium leading-relaxed">
            "In 1928, George A. Benta recognized a need in the Harlem Community and in a small way, he tried to fulfill it... We continue this sacred trust today."
          </p>
          <p className="text-xs text-amber-300 uppercase tracking-widest mt-3 font-bold">
            — Benta's Historic Commitment
          </p>
        </div>

      </div>
    </section>
  );
};

