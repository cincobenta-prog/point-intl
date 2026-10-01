import React, { useState, useRef, useEffect } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { generateAIConciergeResponse } from '../../lib/services/aiGatewayService';
import { 
  getCloudMediaVault, 
  addMediaAssetToVault, 
  deleteMediaAssetFromVault, 
  CloudMediaAsset 
} from '../../lib/services/cloudStorageService';
import { FloralTributeShopModal, HARLEM_FLORAL_CATALOG } from './FloralTributeShopModal';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Scale, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw,
  Flower2,
  Flame,
  Music,
  UploadCloud,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Disc
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  citation?: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    actionKey: string;
  }>;
}

interface ScriptureVerse {
  reference: string;
  text: string;
  tradition: string;
}

interface MemorialCandleNote {
  id: string;
  author: string;
  relationship: string;
  message: string;
  scripture?: string;
  litAt: string;
  flameColor: string;
}

interface SacredHymnTrack {
  id: string;
  title: string;
  artistOrChoir: string;
  category: 'prelude' | 'processional' | 'solo' | 'recessional';
  duration: string;
  description: string;
  scriptureAnchor: string;
  isDirectorRecommended?: boolean;
}

interface FamilyCareConciergeViewProps {
  activeCase: GoldenRecordCase;
  onNavigateTab?: (tab: 'obituary' | 'tribute' | 'arrangements' | 'documents' | 'photos' | 'status') => void;
}

const SACRED_HYMNS_CATALOG: SacredHymnTrack[] = [
  {
    id: 'hymn-01',
    title: 'Take My Hand, Precious Lord',
    artistOrChoir: 'Harlem Sanctuary Gospel Organ & Choir',
    category: 'processional',
    duration: '4:15',
    description: 'Composed by Thomas A. Dorsey. The quintessential African-American solemn entrance hymn of comfort and spiritual guidance.',
    scriptureAnchor: 'Psalm 73:23-24',
    isDirectorRecommended: true
  },
  {
    id: 'hymn-02',
    title: 'Amazing Grace (A Cappella & Pipe Organ)',
    artistOrChoir: 'Benta’s Resident Soloist & Historic Organ',
    category: 'solo',
    duration: '3:50',
    description: 'A deeply moving traditional rendition featuring soaring high registers and warm pedal resonance throughout Chapel 1 Sanctuary.',
    scriptureAnchor: 'Ephesians 2:8-9',
    isDirectorRecommended: true
  },
  {
    id: 'hymn-03',
    title: 'His Eye Is on the Sparrow',
    artistOrChoir: 'Mount Olivet Baptist Choral Quartet',
    category: 'solo',
    duration: '4:45',
    description: 'An uplifting gospel ballad celebrating faith, protection, and eternal peace under God’s watchful eye.',
    scriptureAnchor: 'Matthew 6:26',
    isDirectorRecommended: true
  },
  {
    id: 'hymn-04',
    title: 'Going Up Yonder',
    artistOrChoir: 'Harlem Heritage Memorial Ensemble',
    category: 'recessional',
    duration: '5:10',
    description: 'Walter Hawkins’ triumphant gospel anthem accompanying the final cortege formation and recessional to Woodlawn Cemetery.',
    scriptureAnchor: '2 Corinthians 5:1',
    isDirectorRecommended: true
  },
  {
    id: 'hymn-05',
    title: 'Great Is Thy Faithfulness',
    artistOrChoir: 'Abyssinian Sanctuary String Trio & Grand Piano',
    category: 'prelude',
    duration: '3:30',
    description: 'Gentle, comforting instrumental prelude performed as family and community assemble in the sanctuary.',
    scriptureAnchor: 'Lamentations 3:22-23',
    isDirectorRecommended: false
  },
  {
    id: 'hymn-06',
    title: 'It Is Well With My Soul',
    artistOrChoir: 'St. Nicholas Choral Society',
    category: 'prelude',
    duration: '4:02',
    description: 'Timeless hymn of peace amidst life’s deepest trials, arranged with majestic brass and organ harmonics.',
    scriptureAnchor: 'Philippians 4:7',
    isDirectorRecommended: false
  }
];

const SCRIPTURE_PRESETS: ScriptureVerse[] = [
  {
    reference: 'Psalm 23:1-4',
    text: 'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.',
    tradition: 'Biblical Comfort'
  },
  {
    reference: 'John 14:1-3',
    text: 'Let not your heart be troubled: ye believe in God, believe also in me. In my Father’s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.',
    tradition: 'Assurance of Heaven'
  },
  {
    reference: 'Ecclesiastes 3:1-4',
    text: 'To every thing there is a season, and a time to every purpose under the heaven: A time to be born, and a time to die; a time to weep, and a time to laugh; a time to mourn, and a time to dance.',
    tradition: 'Eternal Wisdom'
  },
  {
    reference: 'Revelation 21:4',
    text: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.',
    tradition: 'Promise of Rest'
  },
  {
    reference: 'Romans 8:38-39',
    text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities... shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
    tradition: 'Victory in Faith'
  }
];

export const FamilyCareConciergeView: React.FC<FamilyCareConciergeViewProps> = ({
  activeCase,
  onNavigateTab
}) => {
  const [activeSection, setActiveSection] = useState<
    'chat' | 'floral' | 'candles' | 'music' | 'vault' | 'financial' | 'laws' | 'crisis'
  >('chat');
  const [selectedState, setSelectedState] = useState<'NY' | 'NJ' | 'CT'>('NY');
  
  // Floral Boutique Modal State
  const [isFloralModalOpen, setIsFloralModalOpen] = useState(false);

  // Chat state
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const initialGreeting: ChatMessage = {
    id: 'msg-init',
    sender: 'bot',
    text: `Hello ${activeCase.informant.fullName || 'Family'}, I am your **Benta 24/7 Family Care Concierge** for **${activeCase.decedent.legalName}** (Case #${activeCase.caseNumber}). 

I am here day and night to answer questions regarding **financial assistance (NYC HRA & VA Benefits)**, **New York funeral laws & Right of Disposition (PHL § 4201)**, **interstate transport logistics**, **Harlem florist tributes**, or to connect you directly with **Director Jason Benta**.

How may I gently assist you right now?`,
    citation: "Benta's Funeral Home Care Desk • Serving Families Since 1928",
    timestamp: 'Just now',
    suggestedActions: [
      { label: '🌸 Harlem Florist Guild Boutique', actionKey: 'floral' },
      { label: '🕯️ Light a Virtual Memorial Candle', actionKey: 'candles' },
      { label: '🎵 Curate Sacred Hymns & Service Music', actionKey: 'music' },
      { label: '🛡️ Upload to S3 Golden Vault', actionKey: 'vault' },
      { label: '💰 Financial & Veteran Benefits', actionKey: 'financial' },
      { label: '📜 NY State Law & Right to Control (PHL § 4201)', actionKey: 'laws' }
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  // Interactive Candle State
  const [candleCount, setCandleCount] = useState<number>(48);
  const [candleAuthorName, setCandleAuthorName] = useState<string>(activeCase.informant.fullName || 'Beloved Family');
  const [candleRelationship, setCandleRelationship] = useState<string>('Family & Friends');
  const [candleNote, setCandleNote] = useState<string>(`In loving memory of ${activeCase.decedent.legalName}. Your legacy will shine forever in our hearts.`);
  const [selectedScripture, setSelectedScripture] = useState<ScriptureVerse>(SCRIPTURE_PRESETS[0]);
  const [candleList, setCandleList] = useState<MemorialCandleNote[]>([
    {
      id: 'c-01',
      author: activeCase.informant.fullName || 'Family',
      relationship: activeCase.informant.relationship || 'Next of Kin',
      message: `Rest peacefully, beloved ${activeCase.decedent.legalName.split(' ')[0]}. You gave our entire family so much love and wisdom.`,
      scripture: 'Psalm 23:1-4',
      litAt: '15 mins ago',
      flameColor: '#f59e0b'
    },
    {
      id: 'c-02',
      author: 'Rev. Dr. Marcus Vance & Congregation',
      relationship: 'Church Family',
      message: 'A steadfast pillar of faith and dignity. Well done, good and faithful servant.',
      scripture: 'John 14:1-3',
      litAt: '1 hour ago',
      flameColor: '#e11d48'
    },
    {
      id: 'c-03',
      author: 'Harlem Community Council',
      relationship: 'Lifelong Neighbors',
      message: 'Holding your entire family in our warmest prayers and gratitude.',
      scripture: 'Romans 8:38-39',
      litAt: '3 hours ago',
      flameColor: '#3b82f6'
    }
  ]);

  // Sacred Music Player State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [selectedServiceTracks, setSelectedServiceTracks] = useState<string[]>(['hymn-01', 'hymn-02', 'hymn-04']);

  // S3 Golden Vault Media State
  const [vaultAssets, setVaultAssets] = useState<CloudMediaAsset[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [mediaUploadCategory, setMediaUploadCategory] = useState<CloudMediaAsset['category']>('memorial_photo');
  const [uploadFileName, setUploadFileName] = useState<string>('');

  useEffect(() => {
    setVaultAssets(getCloudMediaVault(activeCase.caseNumber));
  }, [activeCase.caseNumber]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleLightCandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candleNote.trim()) return;

    const newNote: MemorialCandleNote = {
      id: `candle-${Date.now()}`,
      author: candleAuthorName || 'Anonymous Friend',
      relationship: candleRelationship || 'Community Member',
      message: candleNote,
      scripture: selectedScripture.reference,
      litAt: 'Just now',
      flameColor: '#f59e0b'
    };

    setCandleList(prev => [newNote, ...prev]);
    setCandleCount(c => c + 1);
    setCandleNote('');
  };

  const handleTogglePlayHymn = (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(trackId);
    }
  };

  const handleToggleServiceHymnSelection = (trackId: string) => {
    setSelectedServiceTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleSimulatedVaultUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setIsUploadingMedia(true);
    await new Promise(r => setTimeout(r, 1200));

    addMediaAssetToVault({
      caseNumber: activeCase.caseNumber,
      decedentName: activeCase.decedent.legalName,
      category: mediaUploadCategory,
      fileName: uploadFileName.endsWith('.jpg') || uploadFileName.endsWith('.mp3') || uploadFileName.endsWith('.pdf') 
        ? uploadFileName 
        : `${uploadFileName}.${mediaUploadCategory === 'living_voice_audio' ? 'mp3' : mediaUploadCategory === 'memorial_photo' ? 'jpg' : 'pdf'}`,
      fileSizeBytes: Math.floor(1500000 + Math.random() * 4500000),
      mimeType: mediaUploadCategory === 'living_voice_audio' ? 'audio/mpeg' : mediaUploadCategory === 'memorial_photo' ? 'image/jpeg' : 'application/pdf',
      publicUrl: mediaUploadCategory === 'memorial_photo' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200' 
        : 'https://demo.docusign.net/documents/sample-signed.pdf',
      uploadedBy: `${activeCase.informant.fullName} (Family Portal)`
    });

    setVaultAssets(getCloudMediaVault(activeCase.caseNumber));
    setUploadFileName('');
    setIsUploadingMedia(false);
  };

  const handleDeleteVaultAsset = (assetId: string) => {
    deleteMediaAssetFromVault(assetId);
    setVaultAssets(getCloudMediaVault(activeCase.caseNumber));
  };

  // Knowledge Base Query Engine
  const generateBotResponse = (query: string): { text: string; citation: string; actions?: any[] } => {
    const q = query.toLowerCase();

    if (q.includes('flower') || q.includes('floral') || q.includes('spray') || q.includes('wreath') || q.includes('daniela') || q.includes('barbara')) {
      return {
        text: `Benta’s proudly partners with Harlem's premier master florists: **Daniela's Flower Shop** (3650 Broadway) and **Barbara's Flowers** (2522 Frederick Douglass Blvd).

We provide full casket sprays, standing crosses & wreaths, urn surrounds, and sympathy baskets delivered directly to Chapel 1 Sanctuary or the family residence with customized embossed satin ribbon banners.`,
        citation: "Harlem Florist Guild & BFH Concierge Delivery Desk",
        actions: [
          { label: '🌸 Open Floral Boutique & Order via Stripe', actionKey: 'floral' }
        ]
      };
    }

    if (q.includes('candle') || q.includes('memory') || q.includes('condolence') || q.includes('scripture')) {
      return {
        text: `You and your family can light a virtual memorial candle and post heartfelt tributes on the **Living Memorial Wall**. You may also anchor your tribute with sacred scripture selections including Psalm 23, John 14, and Ecclesiastes 3.`,
        citation: "Benta's Interactive Memory & Tribute Wall",
        actions: [
          { label: '🕯️ Light a Virtual Memorial Candle', actionKey: 'candles' }
        ]
      };
    }

    if (q.includes('music') || q.includes('hymn') || q.includes('song') || q.includes('organ') || q.includes('choir') || q.includes('solo')) {
      return {
        text: `Our sacred music catalog features historic Harlem gospel anthems and solemn classical preludes—including *"Take My Hand, Precious Lord"*, *"Amazing Grace"*, *"His Eye Is on the Sparrow"*, and *"Going Up Yonder"*. You can curate the sanctuary cue sheet directly in the portal.`,
        citation: "BFH Sanctuary Music & Organ Guild",
        actions: [
          { label: '🎵 Curate Sacred Music Playlist', actionKey: 'music' }
        ]
      };
    }

    if (q.includes('veteran') || q.includes('va') || q.includes('military') || q.includes('dd-214') || q.includes('flag') || q.includes('taps')) {
      return {
        text: `Honoring our nation's service members is a sacred duty at Benta's Funeral Home. ${activeCase.decedent.veteran ? `Since ${activeCase.decedent.legalName} served in the ${activeCase.decedent.branchOfService || 'U.S. Armed Forces'}, your family is entitled to full federal honors:` : 'Honorably discharged veterans are entitled to meaningful federal benefits:'}

1. **Free Cemetery Plot & Burial:** In any VA National Cemetery (such as Calverton National, Long Island National, or BG William C. Doyle NJ).
2. **Military Funeral Honors:** 2-person uniform honor guard, the playing of *Taps*, and official flag presentation.
3. **Presidential Memorial Certificate:** Engraved parchment signed by the President.
4. **VA Burial Allowance:** Between **$893 and $2,000+**.`,
        citation: "U.S. Department of Veterans Affairs (VA.gov) 38 CFR § 3.1700",
        actions: [
          { label: 'View Financial Benefits Cards', actionKey: 'open_financial_tab' },
          { label: 'Speak with Director on VA Filing', actionKey: 'call_director' }
        ]
      };
    }

    if (q.includes('hra') || q.includes('financial') || q.includes('assistance') || q.includes('cost') || q.includes('money') || q.includes('social security')) {
      return {
        text: `Several government assistance programs are available to help families offset funeral costs:

• **NYC HRA Burial Assistance:** Up to **$1,700** toward funeral or cremation expenses for qualifying NYC residents.
• **Social Security Lump-Sum Death Benefit:** One-time **$255** payable to surviving spouse (Form SSA-721).
• **NYS Office of Victim Services (OVS):** Up to **$6,000** for violent crime losses.
• **Medicaid Pre-Need Spend-Down:** Irrevocable funeral trusts protect assets during qualification.`,
        citation: "NYC Human Resources Administration & SSA § 402(i)",
        actions: [
          { label: 'Explore Financial Benefits Section', actionKey: 'open_financial_tab' },
          { label: 'View Legal Documents & eSign', actionKey: 'nav_docs' }
        ]
      };
    }

    return {
      text: `I understand you are asking about: "${query}". 

At Benta's Funeral Home, Director Jason Benta and our licensed directors ensure every detail is handled with absolute dignity and transparency. You can explore financial aid, review NY state laws (PHL § 4201), order custom floral sprays from Daniela's Flowers, or contact our desk 24/7.`,
      citation: "Benta's Funeral Home • Established 1928 • 630 St. Nicholas Ave",
      actions: [
        { label: '🌸 View Harlem Florist Catalog', actionKey: 'floral' },
        { label: '🕯️ Light a Memorial Candle', actionKey: 'candles' },
        { label: '📞 Call Director Jason Benta (212-281-8850)', actionKey: 'call_director' }
      ]
    };
  };

  const handleSendMessage = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const query = directQuery || userInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!directQuery) setUserInput('');
    setIsTyping(true);

    try {
      let botResponseText = '';
      let botCitation = "Benta's Funeral Home Care Desk • Serving Families Since 1928";
      let botActions = undefined;

      try {
        const aiRes = await generateAIConciergeResponse(query, activeCase);
        if (aiRes && aiRes.text) {
          botResponseText = aiRes.text;
          botCitation = aiRes.citation || botCitation;
          botActions = aiRes.suggestedActions;
        } else {
          const ruleBot = generateBotResponse(query);
          botResponseText = ruleBot.text;
          botCitation = ruleBot.citation;
          botActions = ruleBot.actions;
        }
      } catch {
        const ruleBot = generateBotResponse(query);
        botResponseText = ruleBot.text;
        botCitation = ruleBot.citation;
        botActions = ruleBot.actions;
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        citation: botCitation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: botActions
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const fallback = generateBotResponse(query);
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: fallback.text,
        citation: fallback.citation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: fallback.actions
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (actionKey: string) => {
    switch (actionKey) {
      case 'floral':
        setActiveSection('floral');
        break;
      case 'candles':
        setActiveSection('candles');
        break;
      case 'music':
        setActiveSection('music');
        break;
      case 'vault':
        setActiveSection('vault');
        break;
      case 'financial':
      case 'open_financial_tab':
        setActiveSection('financial');
        break;
      case 'laws':
      case 'open_laws_tab':
        setActiveSection('laws');
        break;
      case 'crisis':
      case 'open_crisis_tab':
        setActiveSection('crisis');
        break;
      case 'nav_docs':
        if (onNavigateTab) onNavigateTab('documents');
        break;
      case 'call_director':
        alert("Connecting to Director Jason Benta's 24/7 Family Line: (212) 281-8850");
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Concierge Hero Banner */}
      <div className="bg-gradient-to-br from-[#141b2b] via-[#1f2a42] to-[#2b1810] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-amber-500/30">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-amber-400/20 border border-amber-400/50 text-amber-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>24/7 Family Care Concierge & Tribute Suite</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              <span>NYS Reg #08850 • Harlem Heritage</span>
            </span>
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Compassionate Care for {activeCase.decedent.legalName}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
            Live AI concierge, floral sympathy boutique from Daniela’s & Barbara’s Flowers, memorial candle wall, sacred hymn curation, and S3 Golden Vault media preservation.
          </p>
        </div>
        <div className="absolute right-6 -bottom-6 text-9xl text-white/5 font-serif select-none pointer-events-none">
          🕯️
        </div>
      </div>

      {/* Concierge Sub-Navigation Pills */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-1.5 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSection('chat')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'chat'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>💬 Live Care Chat</span>
        </button>

        <button
          onClick={() => setActiveSection('floral')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'floral'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Flower2 className="w-3.5 h-3.5 text-rose-400" />
          <span>🌸 Florist Boutique</span>
        </button>

        <button
          onClick={() => setActiveSection('candles')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'candles'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>🕯️ Memorial Candles ({candleCount})</span>
        </button>

        <button
          onClick={() => setActiveSection('music')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'music'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Music className="w-3.5 h-3.5 text-indigo-400" />
          <span>🎵 Sacred Hymns</span>
        </button>

        <button
          onClick={() => setActiveSection('vault')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'vault'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>🛡️ S3 Vault ({vaultAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('financial')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'financial'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>💰 Financial Aid</span>
        </button>

        <button
          onClick={() => setActiveSection('laws')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'laws'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-blue-400" />
          <span>⚖️ NY State Law</span>
        </button>

        <button
          onClick={() => setActiveSection('crisis')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
            activeSection === 'crisis'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>🚨 Passing Guide</span>
        </button>
      </div>

      {/* SUB-TAB 1: LIVE CARE CHAT */}
      {activeSection === 'chat' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
          
          <div className="h-[480px] overflow-y-auto pr-2 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#991b1b] text-white rounded-br-none shadow-md'
                      : 'bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {msg.citation && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-200/60 text-[10px] text-neutral-400 flex items-center justify-between">
                      <span className="font-serif italic">{msg.citation}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(action.actionKey)}
                        className="px-3 py-1 rounded-full bg-white border border-amber-900/30 text-amber-900 text-xs font-semibold hover:bg-amber-50 hover:border-amber-700 transition shadow-sm flex items-center space-x-1"
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-neutral-400 text-xs italic pl-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-150" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-300" />
                <span>Benta Care Desk is consulting statutory guidelines...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={(e) => handleSendMessage(e)} className="pt-2 border-t border-neutral-200 flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about floral arrangements, veteran honors, HRA aid, music..."
              className="flex-1 px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-amber-600 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isTyping}
              className="p-3.5 rounded-2xl bg-[#991b1b] hover:bg-red-800 text-white font-bold transition disabled:opacity-50 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* SUB-TAB 2: HARLEM FLORIST GUILD BOUTIQUE */}
      {activeSection === 'floral' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
            <div>
              <span className="text-[#b45309] text-[11px] font-bold uppercase tracking-widest block mb-1">
                Handcrafted Sympathy & Floral Tributes
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                Harlem Florist Guild Collection
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Direct partnership with <strong>Daniela’s Flower Shop (Broadway)</strong> and <strong>Barbara’s Flowers (FDB)</strong> with direct delivery to Benta's Sanctuary.
              </p>
            </div>
            <button
              onClick={() => setIsFloralModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition shrink-0"
            >
              <ShoppingBag className="w-4 h-4" /> Open Full Floral Boutique (Stripe 1-Click)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HARLEM_FLORAL_CATALOG.slice(0, 6).map((item) => (
              <div 
                key={item.id}
                className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-bold bg-black/80 backdrop-blur-md text-amber-300">
                    ${item.price}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      {item.categoryLabel}
                    </span>
                    <h4 className="font-serif-title font-bold text-sm text-neutral-900 mt-0.5">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500">{item.floristName.split(' ')[0]}</span>
                    <button
                      onClick={() => setIsFloralModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold transition shadow-sm"
                    >
                      Send Tribute →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MEMORIAL CANDLE LIGHTING & LIVING WALL */}
      {activeSection === 'candles' && (
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl border border-amber-900/40">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                <h3 className="font-serif-title text-2xl font-bold text-amber-100">
                  Perpetual Memorial Candle & Living Memory Wall
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {candleCount} candles lit in loving celebration of <strong>{activeCase.decedent.legalName}</strong>.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-2xl border border-amber-900/50">
              <span className="text-2xl font-bold text-amber-400 font-mono">{candleCount}</span>
              <span className="text-xs text-stone-400 uppercase font-bold tracking-wider leading-tight">
                Flames<br />Burning
              </span>
            </div>
          </div>

          {/* Form to Light a Candle */}
          <form onSubmit={handleLightCandle} className="bg-stone-950/80 border border-amber-900/50 rounded-2xl p-6 space-y-4">
            <h4 className="font-serif-title font-bold text-sm text-amber-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Light a Digital Candle & Share a Sacred Scripture
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Your Full Name</label>
                <input 
                  type="text"
                  value={candleAuthorName}
                  onChange={(e) => setCandleAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Relationship to Decedent</label>
                <input 
                  type="text"
                  value={candleRelationship}
                  onChange={(e) => setCandleRelationship(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Personal Message of Solace</label>
              <textarea 
                rows={2}
                value={candleNote}
                onChange={(e) => setCandleNote(e.target.value)}
                placeholder="Share a heartfelt thought or prayer..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Anchor with Scripture Verse</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SCRIPTURE_PRESETS.map((scrip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedScripture(scrip)}
                    className={`p-2 rounded-xl text-left text-[11px] border transition ${
                      selectedScripture.reference === scrip.reference
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="block font-bold">{scrip.reference}</span>
                    <span className="text-[9px] opacity-75">{scrip.tradition}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-amber-200/80 italic mt-2 p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                "{selectedScripture.text}"
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              <Flame className="w-4 h-4 fill-stone-950" /> Light Candle in Honor of {activeCase.decedent.legalName}
            </button>
          </form>

          {/* Living Memorial Wall Feed */}
          <div className="space-y-4">
            <h4 className="font-serif-title text-base font-bold text-amber-100 flex items-center gap-2">
              <span>🕊️</span> Living Tributes & Condolences Feed
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candleList.map((c) => (
                <div 
                  key={c.id}
                  className="p-5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-900 pb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shadow-lg animate-pulse"
                          style={{ backgroundColor: c.flameColor }}
                        />
                        <span className="font-bold text-xs text-amber-200">{c.author}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">{c.litAt}</span>
                    </div>

                    <p className="text-xs text-stone-300 italic pt-2 leading-relaxed">
                      "{c.message}"
                    </p>
                  </div>

                  {c.scripture && (
                    <div className="text-[10px] font-mono text-amber-400/90 pt-2 border-t border-stone-900">
                      📖 {c.scripture}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: SACRED HYMNS & SERVICE MUSIC PLAYLIST */}
      {activeSection === 'music' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
            <div>
              <span className="text-[#b45309] text-[11px] font-bold uppercase tracking-widest block mb-1">
                Harlem Sacred Repertoire & Organ Guild
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                Service Hymns & Sanctuary Music
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Curate the prelude, solo, and recessional music for {activeCase.decedent.legalName}’s service in Chapel 1.
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <Disc className="w-4 h-4 text-amber-700" />
              <span>{selectedServiceTracks.length} Selected for Director Cue Sheet</span>
            </div>
          </div>

          <div className="space-y-3">
            {SACRED_HYMNS_CATALOG.map((track) => {
              const isPlaying = playingTrackId === track.id;
              const isSelected = selectedServiceTracks.includes(track.id);

              return (
                <div 
                  key={track.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isPlaying 
                      ? 'bg-amber-50/80 border-amber-400 shadow-sm' 
                      : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => handleTogglePlayHymn(track.id)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition shadow-sm shrink-0 ${
                        isPlaying 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif-title font-bold text-sm text-neutral-900">
                          {track.title}
                        </h4>
                        {track.isDirectorRecommended && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                            Director Pick
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded">
                          {track.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {track.artistOrChoir} • {track.duration} • <span className="font-mono text-[10px] text-amber-800">{track.scriptureAnchor}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleServiceHymnSelection(track.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected on Program
                        </>
                      ) : (
                        <>+ Add to Program</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: S3 GOLDEN VAULT MULTI-MEDIA UPLOADER */}
      {activeSection === 'vault' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
            <div>
              <span className="text-[#b45309] text-[11px] font-bold uppercase tracking-widest block mb-1">
                Cryptographically Sealed Cloud Storage
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                S3 Golden Record Media Vault
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Permanently archive high-res portrait photos, Living Voice audio remembrances, and statutory certificates into Case #{activeCase.caseNumber}.
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SHA-256 Verified Immutable Storage</span>
            </div>
          </div>

          {/* Quick Uploader Card */}
          <form onSubmit={handleSimulatedVaultUpload} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
            <h4 className="font-serif-title font-bold text-sm text-neutral-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-amber-600" /> Upload New Asset Directly to Golden Vault
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-neutral-600 block mb-1">Asset Category</label>
                <select 
                  value={mediaUploadCategory}
                  onChange={(e) => setMediaUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                >
                  <option value="memorial_photo">📸 Memorial Portrait Photo (4K)</option>
                  <option value="living_voice_audio">🎙️ Living Voice Audio Recording</option>
                  <option value="pdf_contract">📄 Signed PDF Affidavit / Document</option>
                  <option value="nys_permit">📜 NYS Burial-Transit Permit</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-600 block mb-1">File Name or Descriptive Title</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder="e.g. Evelyn_Family_Portrait_1975.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="submit"
                    disabled={!uploadFileName.trim() || isUploadingMedia}
                    className="px-5 py-2 rounded-xl bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold transition disabled:opacity-50 shadow-md flex items-center gap-2"
                  >
                    {isUploadingMedia ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sealing Hash...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" /> Seal to Vault
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Vault Assets Grid */}
          <div className="space-y-3">
            <h4 className="font-serif-title font-bold text-sm text-neutral-900">
              Preserved Vault Assets ({vaultAssets.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vaultAssets.map((asset) => (
                <div 
                  key={asset.id}
                  className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      {asset.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <h5 className="font-bold text-neutral-900 break-all">{asset.fileName}</h5>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      SHA: {asset.sha256Hash.slice(0, 18)}... • {(asset.fileSizeBytes / 1000000).toFixed(2)} MB
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Uploaded by {asset.uploadedBy} • {asset.uploadedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => window.open(asset.publicUrl, '_blank')}
                      className="p-2 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 transition"
                      title="Open Public URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVaultAsset(asset.id)}
                      className="p-2 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600 transition"
                      title="Remove Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: FINANCIAL & VETERAN BENEFITS */}
      {activeSection === 'financial' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <span className="text-[#b45309] text-[11px] font-bold uppercase tracking-widest block mb-1">
              Statutory Aid & Claims Desk
            </span>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
              Government & Military Burial Assistance
            </h3>
            <p className="text-xs text-neutral-600">
              We directly prepare documentation for all eligible federal and local benefit claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NYC HRA Burial Assistance */}
            <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                <h4 className="font-serif-title font-bold text-base text-neutral-900">
                  NYC HRA Burial Assistance ($1,700)
                </h4>
              </div>
              <p className="text-xs text-neutral-600">
                Provides up to $1,700 for qualifying low-income NYC residents toward burial or cremation. Total funeral cost cap is $3,400. Applications accepted within 120 days of death.
              </p>
              <span className="text-[10px] text-neutral-400 block font-mono">NYC Admin Code Title 21</span>
            </div>

            {/* VA Veteran Benefits */}
            <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 space-y-3">
              <div className="flex items-center space-x-2 text-blue-800">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h4 className="font-serif-title font-bold text-base text-neutral-900">
                  U.S. Department of Veterans Affairs
                </h4>
              </div>
              <p className="text-xs text-neutral-600">
                Free burial plot in any VA National Cemetery, military honors ceremony (Taps & Flag Folding), Presidential Memorial Certificate, and $893–$2,000+ burial allowance.
              </p>
              <span className="text-[10px] text-neutral-400 block font-mono">38 CFR § 3.1700</span>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 7: NY STATE LAWS */}
      {activeSection === 'laws' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <span className="text-[#b45309] text-[11px] font-bold uppercase tracking-widest block mb-1">
                Tri-State Statutory Compliance
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                Funeral & Final Disposition Rights
              </h3>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-neutral-100 p-1 rounded-xl">
              {(['NY', 'NJ', 'CT'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedState === st
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {st === 'NY' ? 'New York (PHL 4201)' : st === 'NJ' ? 'New Jersey' : 'Connecticut'}
                </button>
              ))}
            </div>
          </div>

          {selectedState === 'NY' && (
            <div className="space-y-4">
              <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3 text-xs text-neutral-700">
                <h4 className="font-serif-title font-bold text-base text-neutral-900">
                  NYS Right of Disposition Hierarchy (PHL § 4201)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li><strong>Designated Agent:</strong> Named in written, signed NYS form.</li>
                  <li><strong>Surviving Spouse / Registered Domestic Partner:</strong> ({activeCase.informant.fullName}).</li>
                  <li><strong>Surviving Adult Children:</strong> (Majority consensus).</li>
                  <li><strong>Surviving Parents:</strong> Biological or adoptive.</li>
                  <li><strong>Surviving Adult Siblings:</strong> Brothers and sisters.</li>
                </ol>
              </div>
            </div>
          )}

          {selectedState === 'NJ' && (
            <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3 text-xs text-neutral-700">
              <h4 className="font-serif-title font-bold text-base text-neutral-900">
                New Jersey Right to Control (NJSA 45:27-22)
              </h4>
              <p>In New Jersey, custody priority begins with the <strong>Appointed Executor named in the Will</strong>, followed by surviving spouse, then adult children.</p>
            </div>
          )}

          {selectedState === 'CT' && (
            <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3 text-xs text-neutral-700">
              <h4 className="font-serif-title font-bold text-base text-neutral-900">
                Connecticut Disposition Rights (CT Gen Stat § 45a-318)
              </h4>
              <p>Connecticut enforces a mandatory 48-hour waiting period and Medical Examiner Cremation Certificate before disposition.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 8: PASSING GUIDE */}
      {activeSection === 'crisis' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <span className="text-[#b45309] text-[11px] font-bold uppercase tracking-widest block mb-1">
              Immediate Guidance for Families
            </span>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
              First Steps Following a Passing
            </h3>
            <p className="text-xs text-neutral-600">
              Step-by-step procedures based on where the passing occurred.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 space-y-3">
              <h4 className="font-serif-title font-bold text-base text-neutral-900 flex items-center space-x-2">
                <span>🏥</span>
                <span>Hospital or Hospice Facility Passing</span>
              </h4>
              <ol className="space-y-2 list-decimal list-inside text-neutral-700">
                <li>Attending physician or nurse completes official Pronouncement of Death.</li>
                <li>Inform the charge nurse that <strong>Benta's Funeral Home (212-281-8850)</strong> is your chosen provider.</li>
                <li>Sign the hospital release authorization (can be completed via eSign in our portal).</li>
                <li>BFH transfer team arrives within 60–90 minutes into dignified custody.</li>
              </ol>
            </div>

            <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 space-y-3">
              <h4 className="font-serif-title font-bold text-base text-neutral-900 flex items-center space-x-2">
                <span>🏠</span>
                <span>Home or Sudden Passing (OCME)</span>
              </h4>
              <ol className="space-y-2 list-decimal list-inside text-neutral-700">
                <li>If under hospice care, call hospice nurse first. Otherwise call 911 for emergency response.</li>
                <li>If police/OCME respond, obtain the <strong>Medical Examiner Case Number</strong>.</li>
                <li>Call Benta's Funeral Home. We interface directly with OCME for case tracking.</li>
                <li>Sign electronic OCME Release and custody transfer authorization.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Floral Tribute Boutique Modal */}
      <FloralTributeShopModal
        isOpen={isFloralModalOpen}
        onClose={() => setIsFloralModalOpen(false)}
        activeCase={activeCase}
        onOrderPlaced={(order) => {
          alert(`Floral Order Succeeded! $${order.totalAmount}.00 charged via Stripe to ${order.senderName}. Dispatched to ${order.floristName}.`);
        }}
      />

    </div>
  );
};
