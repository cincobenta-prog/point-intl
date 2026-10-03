import React, { useState } from 'react';
import { Phone, Lock, Sparkles } from 'lucide-react';

interface PublicNavbarProps {
  onOpenPortal: () => void;
  onOpenFamilyPortal?: () => void;
  onOpenArranger: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onOpenPortal,
  onOpenFamilyPortal,
  onOpenArranger,
  activeSection,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'history', label: 'Our History' },
    { id: 'facility', label: 'Facility' },
    { id: 'services', label: 'Services & Products' },
    { id: 'preplan', label: 'Pre-Plan' },
    { id: 'notable', label: 'Notable Services' },
    { id: 'obituaries', label: 'Obituaries' },
    { id: 'grief', label: 'Grief & Healing' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-red-900/10 shadow-sm text-neutral-900">
      {/* Top Banner: Benta Crimson Red Bar */}
      <div className="bg-[#991b1b] text-white py-1.5 px-4 text-xs font-medium border-b border-amber-400/30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-3 text-amber-200">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-black/20 border border-amber-300/40 text-[11px] text-amber-200 font-bold tracking-wide">
              EST. 1928 • HARLEM, NYC
            </span>
            <span className="hidden sm:inline text-red-200">|</span>
            <span className="hidden sm:inline text-white/90">630 Saint Nicholas Ave, New York, NY 10030</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <a 
              href="tel:+12122818850" 
              className="flex items-center space-x-1.5 text-amber-300 hover:text-white font-bold transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>24/7 Careline: (212) 281-8850</span>
            </a>

            {onOpenFamilyPortal && (
              <button
                onClick={onOpenFamilyPortal}
                className="flex items-center space-x-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 px-2.5 py-1 rounded text-xs transition border border-amber-300/40 font-bold cursor-pointer"
                title="Open Family Portal with 360 Digi-Tribute & 9-Part Memorial Suite"
              >
                <span>🕊️ Family Portal</span>
              </button>
            )}

            <button
              onClick={onOpenPortal}
              className="flex items-center space-x-1 bg-black/25 hover:bg-black/40 text-amber-200 px-2.5 py-1 rounded text-xs transition border border-amber-300/30 cursor-pointer"
              title="Open Funeral Directors Back-Office Portal"
            >
              <Lock className="w-3 h-3 text-amber-300" />
              <span>Funeral Directors Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Official Brand Logo & Title from e-bfh.com */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <img
            src="/images/ebfh/BENTA_logo.png"
            alt="Benta's Funeral Home, Inc."
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              // Fallback to flame icon if logo image fails
              const target = e.target as HTMLImageElement;
              target.src = '/images/ebfh/Benta-Flame-MN.png';
            }}
          />
          <div className="hidden sm:block">
            <h1 className="font-serif-title text-lg sm:text-xl font-bold tracking-wide text-[#991b1b] group-hover:text-red-700 transition leading-tight">
              BENTA'S FUNERAL HOME
            </h1>
            <p className="text-[10px] text-[#b45309] tracking-widest uppercase font-semibold">
              Four Generations of Compassion & Dignity
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition cursor-pointer ${
                activeSection === link.id
                  ? 'text-[#991b1b] bg-red-50 border border-red-200'
                  : 'text-neutral-700 hover:text-[#991b1b] hover:bg-neutral-50'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Primary Action Button: Crimson with Gold Accent */}
        <div className="hidden sm:flex items-center space-x-2.5">
          <button
            onClick={onOpenArranger}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-[#991b1b] to-[#b91c1c] hover:from-[#7f1d1d] hover:to-[#991b1b] text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-md shadow-red-950/20 hover:shadow-lg transition transform active:scale-95 border border-amber-400/40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Plan Online / Get Started</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="xl:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-neutral-700 hover:text-red-800 hover:bg-neutral-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-red-100 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-[#991b1b]"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-neutral-200 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenArranger();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#991b1b] hover:bg-red-800 text-white font-bold py-2 rounded text-xs uppercase text-center border border-amber-400/40"
            >
              Plan Online / Get Started
            </button>
            <button
              onClick={() => {
                onOpenPortal();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-2 rounded text-xs text-center border border-neutral-300 flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5 text-[#991b1b]" />
              <span>Director / Family Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
