import React, { useState } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  Printer, 
  X, 
  Edit3, 
  Plus, 
  Trash2, 
  BookOpen, 
  Layout, 
  Eye, 
  Palette,
  Heart,
  ScrollText,
  Lock
} from 'lucide-react';

interface MemorialProgramBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  onSaveProgram?: (programData: any) => void;
  onOpenFamilyProofApproval?: () => void;
}

export const MemorialProgramBuilderModal: React.FC<MemorialProgramBuilderModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onSaveProgram: _onSaveProgram,
  onOpenFamilyProofApproval
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit_order' | 'edit_cover' | 'edit_back'>('preview');
  const [theme, setTheme] = useState<'crimson_gold' | 'midnight_pearl' | 'ivory_rose' | 'celestial_blue'>('crimson_gold');
  const [activeSpread, setActiveSpread] = useState<'outer' | 'inner'>('outer'); // outer = Page 4 & 1, inner = Page 2 & 3

  // Cover State
  const [titleHeader, setTitleHeader] = useState('Celebrating the Life, Love & Legacy of');
  const [coverSubtitle, setCoverSubtitle] = useState('A Life Well Lived & Reverently Honored');
  const [serviceDateText, setServiceDateText] = useState(
    caseData.serviceSelections.serviceDate ? `${caseData.serviceSelections.serviceDate} • 11:00 AM` : 'Tuesday, September 22, 2026 • 11:00 AM'
  );
  const [serviceVenueText, setServiceVenueText] = useState<string>(
    caseData.serviceSelections.viewingParlor || "Benta's Funeral Home Chapel • 630 Saint Nicholas Ave, New York, NY"
  );
  const [officiantText, setOfficiantText] = useState(
    caseData.serviceSelections.officiantName || 'Rev. Dr. Calvin Butts IV, Officiating'
  );

  // Order of Service State
  const [orderOfService, setOrderOfService] = useState<Array<{ step: string; leadBy: string }>>([
    { step: 'Musical Prelude', leadBy: caseData.serviceSelections.organistName || 'Dr. Julian Vance, Organist' },
    { step: 'Processional', leadBy: 'Clergy, Funeral Directors & The Family' },
    { step: 'Hymn of Comfort', leadBy: '"Amazing Grace" — Sanctuary Choir' },
    { step: 'Holy Scripture Reading (Old Testament)', leadBy: 'Psalm 23 • Sister Angela Davis' },
    { step: 'Holy Scripture Reading (New Testament)', leadBy: 'John 14:1-6 • Deacon Ronald Hayes' },
    { step: 'Prayer of Solace & Comfort', leadBy: 'Rev. Dr. Malcolm Turner' },
    { step: 'Musical Solo', leadBy: '"His Eye Is On The Sparrow" • Danielle St. Claire' },
    { step: 'Reading of Cards & Telegrams', leadBy: 'Church Clerk & Family Resolutions' },
    { step: 'Reflections (2 Minutes Please)', leadBy: 'Friends, Colleagues & Grandchildren' },
    { step: 'Reading of the Obituary', leadBy: 'Read Silently with Soft Choral Accompaniment' },
    { step: 'Choral Anthem', leadBy: '"Precious Lord, Take My Hand" — Sanctuary Choir' },
    { step: 'The Eulogy', leadBy: officiantText },
    { step: 'Benediction & Final Viewing', leadBy: "Benta's Funeral Home Directors" },
    { step: 'Recessional', leadBy: 'Clergy & Family Cortege' }
  ]);

  // Back Cover State
  const [pallbearers, setPallbearers] = useState<string[]>([
    'Brother Elijah Brooks',
    'Marcus Vance Jr.',
    'Kenneth Washington',
    'Gregory Hall',
    'Deacon Thomas Vance',
    'Andre Baptiste'
  ]);

  const [honoraryPallbearers, setHonoraryPallbearers] = useState<string[]>([
    'Trustees of Convent Ave Baptist Church',
    'Harlem Choral Institute Guild'
  ]);

  const [acknowledgmentsText, setAcknowledgmentsText] = useState(
    `The family of ${caseData.decedent.legalName} wishes to express our deepest and most sincere gratitude for every prayer, telephone call, floral arrangement, and thoughtful deed extended during our time of bereavement. May God richly bless and keep you always.`
  );

  const [finalRestingPlace, setFinalRestingPlace] = useState(
    caseData.serviceSelections.crematoryOrCemeteryName || 'The Woodlawn Cemetery & Crematory • Bronx, New York'
  );

  const [repastText, setRepastText] = useState(
    'Following the committal service, family and friends are warmly invited to join the repast at the Benta Fellowship Suite (630 St. Nicholas Ave).'
  );

  // New Step Input
  const [newStepName, setNewStepName] = useState('');
  const [newStepLead, setNewStepLead] = useState('');

  if (!isOpen) return null;

  const handleAddOrderStep = () => {
    if (!newStepName.trim()) return;
    setOrderOfService([...orderOfService, { step: newStepName.trim(), leadBy: newStepLead.trim() || 'Leader' }]);
    setNewStepName('');
    setNewStepLead('');
  };

  const handleRemoveOrderStep = (idx: number) => {
    setOrderOfService(orderOfService.filter((_, i) => i !== idx));
  };

  const handlePrintProgram = () => {
    window.print();
  };

  const themeStyles = {
    crimson_gold: {
      border: 'border-[#991b1b]',
      goldAccent: 'text-[#b45309]',
      headerBg: 'bg-[#991b1b] text-white',
      cardBg: 'bg-[#fcfbfa]',
      frameBorder: 'border-[#b45309]/50',
      tagBg: 'bg-red-50 text-[#991b1b] border-red-200'
    },
    midnight_pearl: {
      border: 'border-neutral-900',
      goldAccent: 'text-neutral-700',
      headerBg: 'bg-neutral-900 text-white',
      cardBg: 'bg-neutral-50',
      frameBorder: 'border-neutral-300',
      tagBg: 'bg-neutral-100 text-neutral-900 border-neutral-300'
    },
    ivory_rose: {
      border: 'border-rose-900',
      goldAccent: 'text-rose-800',
      headerBg: 'bg-rose-950 text-rose-100',
      cardBg: 'bg-rose-50/30',
      frameBorder: 'border-rose-300',
      tagBg: 'bg-rose-50 text-rose-900 border-rose-200'
    },
    celestial_blue: {
      border: 'border-sky-900',
      goldAccent: 'text-sky-800',
      headerBg: 'bg-sky-950 text-white',
      cardBg: 'bg-sky-50/30',
      frameBorder: 'border-sky-300',
      tagBg: 'bg-sky-50 text-sky-900 border-sky-200'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8f9fa] border border-neutral-300 rounded-3xl max-w-6xl w-full max-h-[96vh] flex flex-col shadow-2xl text-neutral-900 overflow-hidden">
        
        {/* TOP BAR: Navigation, Theme & Action Controls (Hidden during print) */}
        <div className="p-4 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#991b1b] shadow-xs">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                  4-Panel Memorial Service Bulletin Studio
                </h3>
                <span className="bg-red-50 text-[#991b1b] border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  8.5" x 11" Bifold Duplex
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-light">
                Official ceremonial print suite for <strong>{caseData.decedent.legalName}</strong> • Case #{caseData.caseNumber}
              </p>
            </div>
          </div>

          {/* Controls: Theme & Spread Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Spread Toggle */}
            <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveSpread('outer')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeSpread === 'outer'
                    ? 'bg-white text-[#991b1b] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Outer Sheet (Pages 4 & 1)
              </button>
              <button
                onClick={() => setActiveSpread('inner')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeSpread === 'inner'
                    ? 'bg-white text-[#991b1b] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Inner Sheet (Pages 2 & 3)
              </button>
            </div>

            {/* Family Proof Approval & Press Lock */}
            {onOpenFamilyProofApproval && (
              <button
                onClick={onOpenFamilyProofApproval}
                className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-2xs"
                title="Open Family Proof Approval & Commercial Press Lock Hub"
              >
                <Lock className="w-3.5 h-3.5 text-purple-700" />
                <span>Family Proof & Press Lock</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrintProgram}
              className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm border border-amber-300/40"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print Bulletin (Duplex)</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUB-NAV TABS (Hidden on Print) */}
        <div className="px-6 py-2 bg-neutral-100 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-white text-[#991b1b] shadow-2xs' : 'text-neutral-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('edit_order')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'edit_order' ? 'bg-white text-[#991b1b] shadow-2xs' : 'text-neutral-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Order of Service ({orderOfService.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('edit_cover')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'edit_cover' ? 'bg-white text-[#991b1b] shadow-2xs' : 'text-neutral-600'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Edit Cover & Officiant</span>
            </button>
            <button
              onClick={() => setActiveTab('edit_back')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'edit_back' ? 'bg-white text-[#991b1b] shadow-2xs' : 'text-neutral-600'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Pallbearers & Repast</span>
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center space-x-2">
            <Palette className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-500 text-[11px]">Theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#991b1b]"
            >
              <option value="crimson_gold">Crimson & Gold Heritage</option>
              <option value="midnight_pearl">Midnight & Pearl Formal</option>
              <option value="ivory_rose">Ivory & Velvet Rose</option>
              <option value="celestial_blue">Celestial Sky Blue</option>
            </select>
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: LIVE 4-PANEL PRINT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* PRINT INSTRUCTIONS BANNER (Hidden on print) */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 print:hidden shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Duplex Folding Guide:</strong> Print Sheet 1 (Outer: Back & Front), then Sheet 2 (Inner: Order of Service & Obituary) in Landscape duplex to fold into a stately 5.5" x 8.5" commemorative program.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveSpread(activeSpread === 'outer' ? 'inner' : 'outer')}
                    className="px-3 py-1 bg-white text-amber-900 font-bold border border-amber-300 rounded-lg text-xs shadow-2xs"
                  >
                    Flip Sheet: Viewing {activeSpread === 'outer' ? 'Outer Sheet' : 'Inner Sheet'} ↻
                  </button>
                </div>
              </div>

              {/* SPREAD A: OUTER SHEET (PAGE 4 [LEFT] & PAGE 1 [RIGHT]) */}
              {activeSpread === 'outer' && (
                <div className="bg-white border-2 border-neutral-300 shadow-xl rounded-2xl p-6 sm:p-8 aspect-[11/8.5] max-w-4xl mx-auto grid grid-cols-2 gap-8 print:border-0 print:shadow-none print:p-0 print:m-0 print:aspect-auto print:max-w-none">
                  
                  {/* ========================================================= */}
                  {/* PAGE 4: BACK COVER (LEFT PANEL)                           */}
                  {/* ========================================================= */}
                  <div className={`p-6 border-2 ${currentTheme.frameBorder} rounded-xl flex flex-col justify-between text-center space-y-4`}>
                    
                    {/* Pallbearers Roster */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-serif-title font-bold text-xs uppercase tracking-widest text-[#991b1b]">
                          Active Pallbearers
                        </h4>
                        <div className="h-0.5 w-10 bg-[#b45309] mx-auto my-1"></div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-800 font-medium pt-1">
                          {pallbearers.map((name, i) => (
                            <div key={i} className="truncate">• {name}</div>
                          ))}
                        </div>
                      </div>

                      {honoraryPallbearers.length > 0 && (
                        <div className="pt-2">
                          <h4 className="font-serif-title font-bold text-[10px] uppercase tracking-wider text-neutral-600">
                            Honorary Pallbearers
                          </h4>
                          <div className="text-[10px] text-neutral-700 font-light pt-0.5 space-y-0.5">
                            {honoraryPallbearers.map((name, i) => (
                              <div key={i}>{name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Family Acknowledgments & Gratitude */}
                    <div className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <h4 className="font-serif-title font-bold text-xs uppercase tracking-wider text-[#991b1b]">
                        With Sincere Gratitude
                      </h4>
                      <p className="text-[10px] text-neutral-700 leading-relaxed italic font-light">
                        "{acknowledgmentsText}"
                      </p>
                      <span className="text-[10px] font-bold text-neutral-900 block pt-0.5">
                        — The Family of {caseData.decedent.legalName}
                      </span>
                    </div>

                    {/* Final Resting Place & Repast */}
                    <div className="space-y-2 text-[10px] text-neutral-600 pt-1 border-t border-neutral-200">
                      <div>
                        <strong className="text-neutral-900 uppercase font-semibold">Interment & Committal:</strong>
                        <div>{finalRestingPlace}</div>
                      </div>
                      <div>
                        <strong className="text-neutral-900 uppercase font-semibold">Fellowship & Repast:</strong>
                        <div>{repastText}</div>
                      </div>
                    </div>

                    {/* Stately BFH Director Imprint */}
                    <div className="pt-2 border-t border-neutral-200 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif-title font-bold text-xs shadow-xs mb-1">
                        BFH
                      </div>
                      <span className="font-serif-title font-bold text-[10px] tracking-wider uppercase text-neutral-900">
                        Benta's Funeral Home, Inc.
                      </span>
                      <span className="text-[9px] text-neutral-500 font-light">
                        630 Saint Nicholas Avenue • Harlem, New York 10030 • (212) 281-8850
                      </span>
                      <span className="text-[8px] text-[#b45309] font-medium tracking-widest pt-0.5">
                        FOUR GENERATIONS OF COMPASSION & DIGNITY • EST. 1928
                      </span>
                    </div>

                  </div>

                  {/* ========================================================= */}
                  {/* PAGE 1: FRONT COVER (RIGHT PANEL)                          */}
                  {/* ========================================================= */}
                  <div className={`p-6 border-2 ${currentTheme.frameBorder} rounded-xl flex flex-col justify-between items-center text-center space-y-3`}>
                    
                    {/* Top Header */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#b45309]">
                        In Loving Memory & Celebration
                      </span>
                      <h2 className="font-serif-title font-bold text-base text-[#991b1b] leading-tight">
                        {titleHeader}
                      </h2>
                      <p className="text-[10px] text-neutral-600 italic font-serif">
                        {coverSubtitle}
                      </p>
                      <div className="h-0.5 w-12 bg-[#b45309] mx-auto my-1"></div>
                    </div>

                    {/* Decedent Portrait */}
                    <div className="relative my-2">
                      <div className="w-36 h-44 rounded-full overflow-hidden border-4 border-[#b45309]/60 shadow-lg mx-auto bg-neutral-100 flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
                          alt={caseData.decedent.legalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Decedent Name & Life Dates */}
                    <div className="space-y-1">
                      <h1 className="font-serif-title font-bold text-xl sm:text-2xl text-neutral-900 leading-tight">
                        {caseData.decedent.legalName}
                      </h1>
                      <div className="flex items-center justify-center space-x-3 text-xs font-semibold text-[#b45309]">
                        <span>Sunrise: {caseData.decedent.dateOfBirth || 'June 14, 1948'}</span>
                        <span>•</span>
                        <span>Sunset: {caseData.decedent.dateOfDeath || 'September 18, 2026'}</span>
                      </div>
                    </div>

                    {/* Service Venue & Schedule */}
                    <div className="space-y-1 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs w-full">
                      <div className="font-bold text-neutral-900">{serviceDateText}</div>
                      <div className="text-[11px] text-neutral-700">{serviceVenueText}</div>
                      <div className="text-[10px] text-[#991b1b] font-semibold pt-1">{officiantText}</div>
                    </div>

                  </div>

                </div>
              )}

              {/* SPREAD B: INNER SHEET (PAGE 2 [LEFT: ORDER OF SERVICE] & PAGE 3 [RIGHT: OBITUARY]) */}
              {activeSpread === 'inner' && (
                <div className="bg-white border-2 border-neutral-300 shadow-xl rounded-2xl p-6 sm:p-8 aspect-[11/8.5] max-w-4xl mx-auto grid grid-cols-2 gap-8 print:border-0 print:shadow-none print:p-0 print:m-0 print:aspect-auto print:max-w-none">
                  
                  {/* ========================================================= */}
                  {/* PAGE 2: ORDER OF SERVICE (LEFT PANEL)                      */}
                  {/* ========================================================= */}
                  <div className={`p-6 border-2 ${currentTheme.frameBorder} rounded-xl flex flex-col justify-between space-y-3`}>
                    <div className="text-center space-y-1 pb-2 border-b border-neutral-200">
                      <h3 className="font-serif-title font-bold text-base uppercase tracking-widest text-[#991b1b]">
                        Order of Service
                      </h3>
                      <p className="text-[10px] text-neutral-500 italic font-serif">
                        "Blessed are those who mourn, for they shall be comforted." — Matthew 5:4
                      </p>
                    </div>

                    {/* Order List */}
                    <div className="space-y-1.5 text-xs flex-1 justify-center flex flex-col">
                      {orderOfService.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-baseline border-b border-dotted border-neutral-200 pb-0.5 text-[11px]">
                          <span className="font-serif-title font-bold text-neutral-900">{item.step}</span>
                          <span className="text-[10px] text-neutral-600 truncate max-w-[180px] font-light">{item.leadBy}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-center border-t border-neutral-200">
                      <span className="text-[10px] text-[#b45309] font-medium tracking-wide">
                        Please silence all mobile devices during the solemn worship celebration.
                      </span>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* PAGE 3: THE LIFE & LEGACY OBITUARY (RIGHT PANEL)           */}
                  {/* ========================================================= */}
                  <div className={`p-6 border-2 ${currentTheme.frameBorder} rounded-xl flex flex-col justify-between space-y-3`}>
                    <div className="text-center space-y-1 pb-2 border-b border-neutral-200">
                      <h3 className="font-serif-title font-bold text-base uppercase tracking-widest text-[#991b1b]">
                        The Life & Legacy
                      </h3>
                      <p className="text-[10px] text-[#b45309] font-bold">
                        {caseData.decedent.legalName}
                      </p>
                    </div>

                    {/* Formatted Obituary Narrative */}
                    <div className="text-[10.5px] text-neutral-700 leading-relaxed font-light space-y-2 overflow-y-auto flex-1 pr-1">
                      <p>
                        <span className="text-base font-serif-title font-bold text-[#991b1b] float-left mr-1 leading-none">E</span>
                        leanor Vance, beloved matriarch, devoted educator, and pillar of the Harlem community, peacefully transitioned to eternal rest on September 18, 2026, surrounded by the warmth and prayers of her loving family.
                      </p>
                      <p>
                        Born on June 14, 1948 in New York City, Eleanor was educated in the New York City Public School system before earning her Bachelor of Arts and Master of Education from Hunter College. For over thirty-five years, Mrs. Vance dedicated her life to educating and uplifting generations of children at P.S. 154 in Harlem.
                      </p>
                      <p>
                        A lifelong faithful servant of God, she was an active member of the Convent Avenue Baptist Church, serving joyfully on the Deaconess Board and Gospel Choir. Her kitchen was always open, and her wise counsel was sought by all who knew her.
                      </p>
                      <p>
                        Eleanor was predeceased by her loving husband, Thomas Vance Sr. She leaves to cherish her precious memory her devoted children, Marcus Vance and Brenda Vance; three grandchildren, Maya, Jordan, and Elijah; her beloved sister, Claudia; and a host of nieces, nephews, church family, and dear friends.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 text-center italic font-serif text-[10px] text-neutral-500">
                      "I have fought the good fight, I have finished the race, I have kept the faith." — 2 Timothy 4:7
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: EDIT ORDER OF SERVICE */}
          {activeTab === 'edit_order' && (
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-[#991b1b]" />
                  <h3 className="font-serif-title font-bold text-base text-neutral-900">
                    Customize Ceremonial Order of Service
                  </h3>
                </div>
                <span className="text-xs text-neutral-500">{orderOfService.length} Liturgical Steps</span>
              </div>

              {/* Steps List */}
              <div className="space-y-2">
                {orderOfService.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                    <span className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.step}
                      onChange={(e) => {
                        const copy = [...orderOfService];
                        copy[idx].step = e.target.value;
                        setOrderOfService(copy);
                      }}
                      className="flex-1 bg-white border border-neutral-300 rounded-lg p-2 font-bold text-neutral-900 outline-none focus:border-[#991b1b]"
                    />
                    <input
                      type="text"
                      value={item.leadBy}
                      onChange={(e) => {
                        const copy = [...orderOfService];
                        copy[idx].leadBy = e.target.value;
                        setOrderOfService(copy);
                      }}
                      className="flex-1 bg-white border border-neutral-300 rounded-lg p-2 text-neutral-700 outline-none focus:border-[#991b1b]"
                    />
                    <button
                      onClick={() => handleRemoveOrderStep(idx)}
                      className="p-2 text-neutral-400 hover:text-red-600 rounded-lg transition"
                      title="Remove Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Step Row */}
              <div className="pt-3 border-t border-neutral-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New Liturgical Step (e.g. Special Choral Solo)"
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  className="flex-1 bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs outline-none focus:border-[#991b1b]"
                />
                <input
                  type="text"
                  placeholder="Leader / Soloist (e.g. Sister Danielle St. Claire)"
                  value={newStepLead}
                  onChange={(e) => setNewStepLead(e.target.value)}
                  className="flex-1 bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 text-xs outline-none focus:border-[#991b1b]"
                />
                <button
                  onClick={handleAddOrderStep}
                  className="px-4 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl"
                >
                  Save & Return to Preview
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EDIT COVER */}
          {activeTab === 'edit_cover' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif-title font-bold text-base text-neutral-900 border-b border-neutral-200 pb-2">
                Front Cover Headings & Officiant
              </h3>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Cover Header Title</label>
                <input
                  type="text"
                  value={titleHeader}
                  onChange={(e) => setTitleHeader(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 font-bold outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Cover Subtitle / Motto</label>
                <input
                  type="text"
                  value={coverSubtitle}
                  onChange={(e) => setCoverSubtitle(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Service Schedule Line</label>
                <input
                  type="text"
                  value={serviceDateText}
                  onChange={(e) => setServiceDateText(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Service Venue</label>
                <input
                  type="text"
                  value={serviceVenueText}
                  onChange={(e) => setServiceVenueText(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Officiating Clergy</label>
                <input
                  type="text"
                  value={officiantText}
                  onChange={(e) => setOfficiantText(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-5 py-2.5 bg-[#991b1b] text-white font-bold text-xs rounded-xl"
                >
                  Save & Return to Preview
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: EDIT BACK COVER */}
          {activeTab === 'edit_back' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif-title font-bold text-base text-neutral-900 border-b border-neutral-200 pb-2">
                Pallbearers, Acknowledgments & Repast
              </h3>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Active Pallbearers (One per line)</label>
                <textarea
                  rows={3}
                  value={pallbearers.join('\n')}
                  onChange={(e) => setPallbearers(e.target.value.split('\n').filter(s => s.trim()))}
                  placeholder="Brother Elijah Brooks&#10;Marcus Vance Jr."
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Honorary Pallbearers (One per line)</label>
                <textarea
                  rows={2}
                  value={honoraryPallbearers.join('\n')}
                  onChange={(e) => setHonoraryPallbearers(e.target.value.split('\n').filter(s => s.trim()))}
                  placeholder="Trustees of Convent Ave Baptist Church"
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Family Message of Gratitude / Acknowledgments</label>
                <textarea
                  rows={3}
                  value={acknowledgmentsText}
                  onChange={(e) => setAcknowledgmentsText(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Final Resting Place / Cemetery</label>
                <input
                  type="text"
                  value={finalRestingPlace}
                  onChange={(e) => setFinalRestingPlace(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Repast / Fellowship Suite</label>
                <input
                  type="text"
                  value={repastText}
                  onChange={(e) => setRepastText(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-xl p-2.5 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-5 py-2.5 bg-[#991b1b] text-white font-bold text-xs rounded-xl"
                >
                  Save & Return to Preview
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
