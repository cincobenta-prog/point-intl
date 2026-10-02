import React, { useState, useEffect, useRef } from 'react';
import {
  GoldenRecordCase,
  SimulatedNotification
} from '../../lib/types/funeral';
import {
  TributeQuestionPrompt,
  DigitalTributeItem,
  CoffeeTableBookCompilation,
  CloudStorageRetentionTelemetry
} from '../../lib/types/digitalTribute';
import {
  RELATIONSHIP_CATEGORIES,
  CURATED_QUESTION_BANK,
  INITIAL_DIGITAL_TRIBUTES,
  INITIAL_BOOK_COMPILATION,
  INITIAL_STORAGE_TELEMETRY
} from '../../lib/data/digitalTributeQuestionBank';
import { formatIntoPoeticStanzas } from '../../lib/utils/aiPoemEngine';
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Printer,
  ArrowLeft
} from 'lucide-react';

interface DigitalTributeStudioViewProps {
  activeCase: GoldenRecordCase;
  onBackToWelcome?: () => void;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenFamilyProofApproval?: () => void;
  isStaffUser?: boolean;
}

export const DigitalTributeStudioView: React.FC<DigitalTributeStudioViewProps> = ({
  activeCase,
  onBackToWelcome,
  onUpdateCase,
  onSendNotification,
  onOpenFamilyProofApproval: _onOpenFamilyProofApproval,
  isStaffUser: _isStaffUser
}) => {
  // Main Studio Mode: 'guest' (Share a Memory) | 'document' (Keepsake Coffee Table Book) | 'admin' (Funeral Admin) | 'cloud' (Cloud Sync)
  const [activeTab, setActiveTab] = useState<'guest' | 'document' | 'admin' | 'cloud'>('guest');

  // Contributor 4-Step Workflow: 1 (PIN Gate) | 2 (Relationship) | 3 (Dynamic Questions) | 4 (Studio Recording) | 5 (Completed)
  const [guestStep, setGuestStep] = useState<number>(1);
  const [eventPinInput, setEventPinInput] = useState<string>('1948');
  const [pinError, setPinError] = useState<string | null>(null);

  // Category Filter in Step 2: 'family' | 'friends' | 'associates'
  const [selectedCatFilter, setSelectedCatFilter] = useState<'family' | 'friends' | 'associates'>('friends');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('childhood_friend');
  const [selectedRelationshipLabel, setSelectedRelationshipLabel] = useState<string>('Childhood Friend');

  // Step 3: Question Prompts
  const [promptsList, setPromptsList] = useState<TributeQuestionPrompt[]>([]);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);

  // Step 4: Recording Studio State
  const [mediaMode, setMediaMode] = useState<'voice' | 'video' | 'written'>('voice');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState<string>('03:02');
  const [contributorName, setContributorName] = useState<string>('Martha Hayes');
  const [contributorEmail, setContributorEmail] = useState<string>('martha.h@example.com');
  const [writtenMemoryText, setWrittenMemoryText] = useState<string>('Our cedar fence raft in Mill Creek sank in the mud of 1962...');

  // Data State
  const [tributes, setTributes] = useState<DigitalTributeItem[]>(INITIAL_DIGITAL_TRIBUTES);
  const [bookCompilation] = useState<CoffeeTableBookCompilation>({
    ...INITIAL_BOOK_COMPILATION,
    decedentName: activeCase?.decedent?.legalName || 'Eleanor Vance',
    datesOfGrace: `${activeCase?.decedent?.dateOfBirth || 'March 14, 1948'} — ${activeCase?.decedent?.dateOfDeath || 'November 22, 2025'}`
  });
  const [storageTelemetry] = useState<CloudStorageRetentionTelemetry>(INITIAL_STORAGE_TELEMETRY);

  // Audio Playback simulation in Admin & Keepsake
  const [playingTributeId, setPlayingTributeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refs for Web Audio Waveform Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const decedentDisplayName = activeCase?.decedent?.legalName?.split(' ')[0] || 'Eleanor';

  // Load prompts whenever category or relationship changes
  useEffect(() => {
    const matched = CURATED_QUESTION_BANK.filter(q => 
      q.relationshipType === selectedRelationship || 
      (selectedCatFilter === 'friends' && q.relationshipType.includes('friend')) ||
      (selectedCatFilter === 'family' && (q.relationshipType.includes('spouse') || q.relationshipType.includes('child') || q.relationshipType.includes('parent'))) ||
      (selectedCatFilter === 'associates' && (q.relationshipType.includes('colleague') || q.relationshipType.includes('student') || q.relationshipType.includes('admirer')))
    );

    const questions = matched.length >= 3 ? matched.slice(0, 4) : CURATED_QUESTION_BANK.slice(0, 4);
    setPromptsList(questions);
    setSelectedPromptIndex(0);
  }, [selectedRelationship, selectedCatFilter]);

  // Shuffle prompts
  const shufflePrompts = () => {
    const shuffled = [...CURATED_QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 4);
    setPromptsList(shuffled);
    setSelectedPromptIndex(0);
    showToast('↻ Shuffled reflection prompts with fresh paired questions!');
  };

  // Step 1: Unlock PIN Gate
  const handleUnlockPIN = () => {
    const cleanPin = eventPinInput.trim();
    const validPins = ['1948', '3995', '2026', '1928', activeCase?.webcastSchedule?.securityPin].filter(Boolean);

    if (validPins.includes(cleanPin) || cleanPin === '3995') {
      setPinError(null);
      setGuestStep(2);
      showToast('🔒 Memorial Portal Unlocked');
    } else {
      setPinError('Invalid 4-Digit PIN. Please check your memorial card or use Demo PIN: 1948.');
    }
  };

  // Select relationship card
  const handleSelectRelationshipCard = (relId: string, relTitle: string) => {
    setSelectedRelationship(relId);
    setSelectedRelationshipLabel(relTitle);
    setGuestStep(3);
  };

  // Real / Simulated Audio Recording Toggle
  const toggleRealAudioRecording = async () => {
    if (isRecording) {
      // Stop Recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const mins = String(Math.floor(recordTimer / 60)).padStart(2, '0');
      const secs = String(recordTimer % 60).padStart(2, '0');
      setRecordedVoiceDuration(`${mins}:${secs}`);
      showToast(`🎙️ Voice recording captured (${mins}:${secs})`);
    } else {
      // Start Recording
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start();
        }
      } catch (err) {
        console.warn('Microphone permission fallback to simulated capture:', err);
      }
      setIsRecording(true);
      setRecordTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordTimer(prev => prev + 1);
      }, 1000);
    }
  };

  // Waveform Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 36;
      const barWidth = canvas.width / bars - 4;

      for (let i = 0; i < bars; i++) {
        let h = 8;
        if (isRecording) {
          h = 10 + Math.sin(tick * 0.25 + i * 0.3) * 26 + Math.cos(tick * 0.18 + i * 0.4) * 18;
          h = Math.max(6, Math.min(72, h));
          ctx.fillStyle = '#af893e';
        } else if (playingTributeId) {
          h = 10 + Math.sin(tick * 0.35 + i * 0.45) * 22;
          h = Math.max(6, Math.min(60, h));
          ctx.fillStyle = '#af893e';
        } else {
          h = 8 + Math.sin(i * 0.3) * 5;
          ctx.fillStyle = '#dcd3c4';
        }

        const x = i * (barWidth + 4);
        const y = (canvas.height - h) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 4);
        ctx.fill();
      }

      tick++;
      animFrame = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animFrame);
  }, [isRecording, playingTributeId]);

  // Submit Tribute
  const submitGuestMemory = () => {
    const activePrompt = promptsList[selectedPromptIndex] || CURATED_QUESTION_BANK[0];
    const generatedStanzas = formatIntoPoeticStanzas(
      writtenMemoryText || `${activePrompt.questionText} ${activePrompt.followUpPrompt || ''}`,
      contributorName || 'Martha Hayes',
      selectedRelationshipLabel || 'Childhood Friend'
    ).stanzas;

    const newTribute: DigitalTributeItem = {
      id: `dt-${Date.now()}`,
      caseId: activeCase?.id || 'case-mock',
      contributorName: contributorName || 'Martha Hayes',
      contributorEmail: contributorEmail || 'martha.h@example.com',
      contributorRelation: selectedRelationshipLabel || 'Childhood Friend',
      relationshipCategory: selectedRelationship,
      pillar: activePrompt.pillar || 'joy',
      pillarLabel: activePrompt.pillarLabel || 'Joy & Laughter',
      promptQuestion: activePrompt.questionText,
      followUpPrompt: activePrompt.followUpPrompt,
      mediaType: mediaMode === 'voice' ? 'voice' : mediaMode === 'video' ? 'video' : 'written',
      audioDuration: recordedVoiceDuration || '03:02',
      durationSeconds: recordTimer > 0 ? recordTimer : 182,
      audioWaveData: [20, 35, 48, 52, 38, 24, 46, 32, 20, 30, 50, 36, 22, 40, 44, 18],
      rawTranscript: writtenMemoryText || activePrompt.questionText,
      poeticStanzas: generatedStanzas,
      status: 'pending',
      includeInBook: true,
      includeInSlideshow: true,
      isFeatured: false,
      recordedDate: 'Just now',
      createdAt: new Date().toISOString(),
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://e-bfh.com/tribute/preview'
    };

    setTributes([newTribute, ...tributes]);
    setGuestStep(5);
    showToast(`🕊️ Memory submitted by ${contributorName} to the Keepsake volume!`);

    if (onUpdateCase && activeCase) {
      onUpdateCase({
        ...activeCase,
        notes: [
          {
            id: `note-dt-${Date.now()}`,
            author: 'Digi-Tribute 2.0 Engine',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `New ${mediaMode} tribute received from ${contributorName} (${selectedRelationshipLabel}).`
          },
          ...(activeCase.notes || [])
        ]
      });
    }

    if (onSendNotification && activeCase) {
      onSendNotification({
        id: `notif-dt-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent?.legalName || 'Loved One',
        recipientName: activeCase.informant?.fullName || 'Family',
        recipientPhone: activeCase.informant?.phone,
        recipientEmail: activeCase.informant?.email,
        channel: 'sms',
        type: 'portal_update',
        title: 'New Digital Tribute Submitted',
        bodyText: `${contributorName} shared a memory for ${activeCase.decedent?.legalName || 'Eleanor Vance'}.`,
        sentAt: 'Just now',
        status: 'delivered',
        actionUrl: `https://e-bfh.com/tribute/${activeCase.caseNumber}`,
        actionButtonText: 'Review in Admin Moderation'
      });
    }
  };

  // Approve Tribute in Admin
  const approveTribute = (id: string, name: string) => {
    setTributes(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    showToast(`✓ Published ${name}'s tribute to Coffee Table Keepsake Volume!`);
  };

  // Format Poem in Admin
  const autoFormatIntoPoem = (id: string) => {
    setTributes(prev => prev.map(t => {
      if (t.id === id) {
        const poem = formatIntoPoeticStanzas(t.rawTranscript || t.promptQuestion, t.contributorName, t.contributorRelation);
        return { ...t, poeticStanzas: poem.stanzas };
      }
      return t;
    }));
    showToast('✨ AI Poem Engine successfully formatted poetic stanzas!');
  };

  const activePrompt = promptsList[selectedPromptIndex] || CURATED_QUESTION_BANK[0];
  const pendingCount = tributes.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-[85vh] bg-[#faf7f2] text-[#191714] font-sans antialiased -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 p-4 sm:p-6 lg:p-8 rounded-3xl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#191714] text-[#af893e] border border-[#af893e] px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#af893e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP SITE HEADER */}
      <div className="flex items-center justify-between mb-4">
        {onBackToWelcome && (
          <button
            onClick={onBackToWelcome}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xl font-bold text-xs transition border border-[#e6dac1] shadow-xs group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#af893e] group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Welcome Page</span>
          </button>
        )}
        <div className="text-xs text-[#8c8273] font-medium hidden sm:block italic">
          "Preserving our community's legacy" • Family Legacy Archived at Benta's Funeral Home and the Schaumburg Research Library
        </div>
      </div>

      <header className="bg-[#faf7f2]/95 backdrop-blur-md border border-[#ece5d8] rounded-3xl sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-8 shadow-xs">
        
        {/* Brand Group */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#af893e]">🕊️</span>
            <span className="font-serif font-bold text-2xl tracking-wide text-[#191714]">
              Digital Tribute
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#f5eedf] text-[#af893e] border border-[#e6dac1] px-2.5 py-0.5 rounded-full">
              Living Audio & Heirloom Archive
            </span>
          </div>
          <div className="text-[11px] text-[#7a6f60] font-serif italic">
            "Preserving our community's legacy" Family Legacy Archived at Benta's Funeral Home and the Schaumburg Research Library
          </div>
        </div>

        {/* Navigation Tabs (Pill Segmented Bar) */}
        <nav className="flex items-center bg-[#eee8dc] p-1 rounded-full gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('guest')}
            className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guest'
                ? 'bg-white text-[#af893e] shadow-xs font-bold'
                : 'text-[#69635b] hover:text-[#191714]'
            }`}
          >
            <span>🎙️ Share a Memory</span>
          </button>

          <button
            onClick={() => setActiveTab('document')}
            className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'document'
                ? 'bg-white text-[#af893e] shadow-xs font-bold'
                : 'text-[#69635b] hover:text-[#191714]'
            }`}
          >
            <span>📖 Keepsake Coffee Table Book</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-[#af893e] shadow-xs font-bold'
                : 'text-[#69635b] hover:text-[#191714]'
            }`}
          >
            <span>🏛️ Funeral Admin</span>
            {pendingCount > 0 && (
              <span className="bg-[#e53e3e] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white text-[#af893e] shadow-xs font-bold'
                : 'text-[#69635b] hover:text-[#191714]'
            }`}
          >
            <span>⚡ Cloud Sync</span>
          </button>
        </nav>
      </header>

      {/* ======================================================== */}
      {/* VIEW 1: SHARE A MEMORY (4-STEP WORKFLOW)                 */}
      {/* ======================================================== */}
      {activeTab === 'guest' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          
          {/* Hero Banner */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1a1815]">
              Preserve Their True Impact
            </h2>
            <p className="text-[#69635b] text-sm sm:text-base max-w-xl mx-auto font-normal">
              Select your connection to uncover paired reflection questions that celebrate their life through joy, pain, sacrifice, and action.
            </p>
            <p className="text-xs text-[#8c8273] font-serif italic pt-1">
              "Preserving our community's legacy" • Family Legacy Archived at Benta's Funeral Home and the Schaumburg Research Library
            </p>
          </div>

          {/* White Card Box */}
          <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* Stepper Header */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 border-b border-[#ece5d8] pb-5 text-xs font-semibold">
              <div className={`flex items-center gap-2 ${guestStep >= 1 ? 'text-[#af893e]' : 'text-[#9c968c]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${guestStep >= 1 ? 'bg-[#af893e] text-white' : 'bg-[#e9e3d5] text-[#69635b]'}`}>
                  1
                </div>
                <span>PIN Gate</span>
              </div>

              <div className={`flex items-center gap-2 ${guestStep >= 2 ? 'text-[#af893e]' : 'text-[#9c968c]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${guestStep >= 2 ? 'bg-[#af893e] text-white' : 'bg-[#e9e3d5] text-[#69635b]'}`}>
                  2
                </div>
                <span>Relationship</span>
              </div>

              <div className={`flex items-center gap-2 ${guestStep >= 3 ? 'text-[#af893e]' : 'text-[#9c968c]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${guestStep >= 3 ? 'bg-[#af893e] text-white' : 'bg-[#e9e3d5] text-[#69635b]'}`}>
                  3
                </div>
                <span>Dynamic Questions</span>
              </div>

              <div className={`flex items-center gap-2 ${guestStep >= 4 ? 'text-[#af893e]' : 'text-[#9c968c]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${guestStep >= 4 ? 'bg-[#af893e] text-white' : 'bg-[#e9e3d5] text-[#69635b]'}`}>
                  4
                </div>
                <span>Studio Recording</span>
              </div>
            </div>

            {/* STEP 1: PIN GATE */}
            {guestStep === 1 && (
              <div className="max-w-md mx-auto text-center py-6 space-y-5">
                <div className="text-5xl">🔒</div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#191714]">Private Memorial Portal</h3>
                  <p className="text-xs text-[#69635b]">
                    Enter the 4-digit PIN from your memorial card (Demo PIN: <strong>1948</strong> or Manager PIN: <strong>3995</strong>)
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={eventPinInput}
                    onChange={(e) => setEventPinInput(e.target.value)}
                    className="w-48 text-center text-2xl tracking-[12px] font-mono font-bold bg-[#faf7f2] border-2 border-[#e6dac1] rounded-2xl py-3 text-[#191714] outline-none focus:border-[#af893e] shadow-inner"
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-red-600 font-semibold">{pinError}</p>
                )}

                <div>
                  <button
                    onClick={handleUnlockPIN}
                    className="bg-[#af893e] hover:bg-[#96732f] text-white font-bold text-sm px-8 py-3 rounded-full shadow-md transition cursor-pointer"
                  >
                    Unlock Memorial
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: RELATIONSHIP SELECTOR */}
            {guestStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-[#191714]">
                    How were you connected to {decedentDisplayName}?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#69635b]">
                    Choose the category that best describes your bond.
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedCatFilter('family')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      selectedCatFilter === 'family'
                        ? 'bg-white border border-[#e6dac1] text-[#af893e] shadow-xs'
                        : 'bg-[#f4efe6] text-[#69635b] hover:text-[#191714]'
                    }`}
                  >
                    <span>❤️ Family Members</span>
                  </button>

                  <button
                    onClick={() => setSelectedCatFilter('friends')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      selectedCatFilter === 'friends'
                        ? 'bg-white border border-[#e6dac1] text-[#af893e] shadow-xs'
                        : 'bg-[#f4efe6] text-[#69635b] hover:text-[#191714]'
                    }`}
                  >
                    <span>👥 Types of Friends</span>
                  </button>

                  <button
                    onClick={() => setSelectedCatFilter('associates')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      selectedCatFilter === 'associates'
                        ? 'bg-white border border-[#e6dac1] text-[#af893e] shadow-xs'
                        : 'bg-[#f4efe6] text-[#69635b] hover:text-[#191714]'
                    }`}
                  >
                    <span>⭐ Associates & Admirers</span>
                  </button>
                </div>

                {/* Relationship Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                  {RELATIONSHIP_CATEGORIES
                    .filter(c => {
                      if (selectedCatFilter === 'family') return c.group === 'Immediate Family' || c.group === 'Extended & In-Laws';
                      if (selectedCatFilter === 'friends') return c.group === 'Friends & Early Years' || c.group === 'Community & Faith';
                      return c.group === 'Mentors & Colleagues' || c.group === 'Community & Faith';
                    })
                    .map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectRelationshipCard(cat.id, cat.label)}
                        className="bg-[#faf7f2] hover:bg-[#f5eedf] border border-[#ece5d8] hover:border-[#af893e] rounded-2xl p-4 sm:p-5 text-left cursor-pointer transition transform hover:-translate-y-0.5 shadow-xs group"
                      >
                        <div className="flex items-center justify-between text-sm font-bold text-[#191714] group-hover:text-[#af893e]">
                          <span>{cat.label}</span>
                          <span className="text-[#af893e]">→</span>
                        </div>
                        <p className="text-xs text-[#69635b] mt-1 line-clamp-2">
                          {cat.sub}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* STEP 3: DYNAMIC QUESTIONS */}
            {guestStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#ece5d8] pb-3">
                  <button
                    onClick={() => setGuestStep(2)}
                    className="text-xs text-[#69635b] hover:text-[#191714] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Change Relationship</span>
                  </button>

                  <span className="bg-[#f5eedf] text-[#af893e] border border-[#e6dac1] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedRelationshipLabel}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-[#191714]">
                    Choose a Question to Discuss
                  </h3>
                  <p className="text-xs sm:text-sm text-[#69635b]">
                    Click any prompt to reveal the paired follow-up question that guides your storytelling.
                  </p>
                </div>

                {/* Prompt List Cards */}
                <div className="space-y-3 pt-2">
                  {promptsList.map((prompt, idx) => {
                    const isSelected = selectedPromptIndex === idx;
                    const pillarStyle = 
                      prompt.pillar === 'joy' ? 'bg-[#fef3c7] text-[#d97706]' :
                      prompt.pillar === 'pain' ? 'bg-[#e0e7ff] text-[#4f46e5]' :
                      prompt.pillar === 'help' ? 'bg-[#ccfbf1] text-[#0d9488]' :
                      'bg-[#ede9fe] text-[#7c3aed]';

                    return (
                      <div
                        key={prompt.id || idx}
                        onClick={() => setSelectedPromptIndex(idx)}
                        className={`p-5 rounded-2xl border transition cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#f5eedf] border-[#af893e] shadow-md'
                            : 'bg-[#faf7f2] border-[#ece5d8] hover:border-[#af893e]/60'
                        }`}
                      >
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 ${pillarStyle}`}>
                          {prompt.pillarLabel || 'Reflection Prompt'}
                        </span>
                        <div className="text-base font-bold text-[#191714]">
                          “{prompt.questionText}”
                        </div>
                        {prompt.followUpPrompt && isSelected && (
                          <div className="mt-3 pt-2.5 border-t border-dashed border-[#e6dac1] text-xs text-[#695d46] italic leading-relaxed">
                            Follow-Up: “{prompt.followUpPrompt}”
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#ece5d8]">
                  <button
                    onClick={shufflePrompts}
                    className="px-4 py-2.5 rounded-full border border-[#ece5d8] text-xs font-bold text-[#69635b] hover:text-[#191714] hover:bg-neutral-50 transition cursor-pointer"
                  >
                    ↻ Shuffle for Different Questions
                  </button>

                  <button
                    onClick={() => setGuestStep(4)}
                    className="bg-[#af893e] hover:bg-[#96732f] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: STUDIO RECORDING */}
            {guestStep === 4 && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece5d8] pb-3">
                  <button
                    onClick={() => setGuestStep(3)}
                    className="text-xs text-[#69635b] hover:text-[#191714] font-semibold cursor-pointer"
                  >
                    ← Back to Questions
                  </button>

                  <div className="flex items-center bg-[#eee8dc] p-1 rounded-full text-xs font-bold">
                    <button
                      onClick={() => setMediaMode('voice')}
                      className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                        mediaMode === 'voice' ? 'bg-white text-[#af893e] shadow-xs' : 'text-[#69635b]'
                      }`}
                    >
                      🎙️ Voice Only
                    </button>
                    <button
                      onClick={() => setMediaMode('video')}
                      className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                        mediaMode === 'video' ? 'bg-white text-[#af893e] shadow-xs' : 'text-[#69635b]'
                      }`}
                    >
                      📹 Video & Audio
                    </button>
                    <button
                      onClick={() => setMediaMode('written')}
                      className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                        mediaMode === 'written' ? 'bg-white text-[#af893e] shadow-xs' : 'text-[#69635b]'
                      }`}
                    >
                      ✍️ Written
                    </button>
                  </div>
                </div>

                {/* Teleprompter Box */}
                <div className="bg-[#f5eedf] border border-[#e6dac1] rounded-2xl p-5 text-center space-y-2">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#fef3c7] text-[#d97706] px-2.5 py-0.5 rounded-full">
                    ✨ {activePrompt.pillarLabel || 'Joy & Laughter'}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#2c2518]">
                    “{activePrompt.questionText}”
                  </h4>
                  {activePrompt.followUpPrompt && (
                    <p className="text-xs text-[#695d46] italic pt-1 border-t border-dashed border-[#e6dac1]">
                      Follow-Up: “{activePrompt.followUpPrompt}”
                    </p>
                  )}
                </div>

                {/* Recording Canvas */}
                {mediaMode === 'voice' && (
                  <div className="bg-[#faf7f2] rounded-2xl p-6 text-center space-y-3">
                    <canvas ref={canvasRef} width={560} height={80} className="w-full h-20 rounded-xl bg-[#faf7f2] mx-auto" />
                    
                    <div className="text-3xl font-mono font-bold text-[#191714]">
                      {String(Math.floor(recordTimer / 60)).padStart(2, '0')}:{String(recordTimer % 60).padStart(2, '0')}
                    </div>

                    <div>
                      <button
                        onClick={toggleRealAudioRecording}
                        className={`w-18 h-18 rounded-full text-2xl text-white shadow-xl transition flex items-center justify-center mx-auto cursor-pointer ${
                          isRecording
                            ? 'bg-[#e53e3e] animate-pulse shadow-red-500/40'
                            : 'bg-[#af893e] hover:bg-[#96732f] shadow-[#af893e]/30'
                        }`}
                      >
                        🎙️
                      </button>
                    </div>

                    <p className="text-xs text-[#69635b] pt-1">
                      {isRecording ? 'Recording in progress... Tap red button to finish' : 'Tap golden microphone to start acoustic voice recording'}
                    </p>
                  </div>
                )}

                {mediaMode === 'video' && (
                  <div className="bg-[#191714] text-white rounded-2xl p-8 text-center space-y-3">
                    <div className="text-4xl">📹</div>
                    <h4 className="font-bold text-base">Camera Viewfinder Ready</h4>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      High-definition audio and video will be recorded simultaneously.
                    </p>
                    <button
                      onClick={() => showToast('📹 Video camera recording simulated!')}
                      className="bg-[#af893e] hover:bg-[#96732f] text-white font-bold text-xs px-6 py-2.5 rounded-full transition cursor-pointer"
                    >
                      Start Video Recording
                    </button>
                  </div>
                )}

                {mediaMode === 'written' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#191714]">
                      Write Your Memory or Poetic Story:
                    </label>
                    <textarea
                      rows={4}
                      value={writtenMemoryText}
                      onChange={(e) => setWrittenMemoryText(e.target.value)}
                      placeholder="Share your personal story, quiet memory, or words of gratitude..."
                      className="w-full bg-[#faf7f2] border border-[#ece5d8] rounded-2xl p-4 text-xs text-[#191714] outline-none focus:border-[#af893e]"
                    />
                  </div>
                )}

                {/* Contributor Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#69635b] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={contributorName}
                      onChange={(e) => setContributorName(e.target.value)}
                      placeholder="e.g. Martha Hayes"
                      className="w-full bg-[#faf7f2] border border-[#ece5d8] rounded-xl px-3.5 py-2.5 text-xs text-[#191714] outline-none focus:border-[#af893e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#69635b] mb-1">Your Email Address</label>
                    <input
                      type="email"
                      value={contributorEmail}
                      onChange={(e) => setContributorEmail(e.target.value)}
                      placeholder="e.g. martha.h@example.com"
                      className="w-full bg-[#faf7f2] border border-[#ece5d8] rounded-xl px-3.5 py-2.5 text-xs text-[#191714] outline-none focus:border-[#af893e]"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    onClick={submitGuestMemory}
                    className="w-full bg-[#af893e] hover:bg-[#96732f] text-white font-bold text-sm py-3.5 rounded-full shadow-lg transition cursor-pointer"
                  >
                    Submit Memory to Family Keepsake Edition
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: COMPLETED */}
            {guestStep === 5 && (
              <div className="max-w-md mx-auto text-center py-6 space-y-4">
                <div className="text-5xl text-[#38a169]">✓</div>
                <h3 className="font-serif text-2xl font-bold text-[#191714]">
                  Thank You for Sharing
                </h3>
                <p className="text-xs sm:text-sm text-[#69635b] leading-relaxed">
                  Your tribute has been formatted into {decedentDisplayName}'s keepsake coffee table volume. Once approved by the funeral director, it will be published with scan-to-stream audio playback.
                </p>
                <div className="flex justify-center gap-3 pt-3">
                  <button
                    onClick={() => setGuestStep(2)}
                    className="px-5 py-2 rounded-full border border-[#ece5d8] text-xs font-bold text-[#69635b] hover:text-[#191714] transition cursor-pointer"
                  >
                    Share Another Memory
                  </button>
                  <button
                    onClick={() => setActiveTab('document')}
                    className="px-5 py-2 rounded-full bg-[#af893e] hover:bg-[#96732f] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Preview Keepsake Book →
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: KEEPSAKE COFFEE TABLE BOOK (Museum Grade)        */}
      {/* ======================================================== */}
      {activeTab === 'document' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-serif text-3xl font-semibold text-[#1a1815]">
                Keepsake Coffee Table Volume
              </h2>
              <p className="text-xs text-[#69635b]">
                Museum-grade memorial book formatted with poetic stanzas, archival photos, and audio QR codes.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-[#af893e] hover:bg-[#96732f] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save High-Res Coffee Table Book</span>
            </button>
          </div>

          {/* Book Canvas Container */}
          <div className="bg-white border border-[#e6dac1] rounded-2xl shadow-xl p-8 sm:p-14 font-serif text-[#191714] space-y-12">
            
            {/* Book Cover / Frontispiece */}
            <div className="text-center space-y-4 border-b-2 border-[#f5eedf] pb-10">
              <div className="text-lg text-[#af893e] tracking-[8px]">
                ❧ &nbsp; ✦ &nbsp; ❧
              </div>

              <div className="w-36 h-36 mx-auto rounded-full p-1 border-2 border-[#af893e] shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80"
                  alt={decedentDisplayName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-sans tracking-[3px] uppercase font-bold text-[#8c7d6b]">
                  IN LOVING MEMORY
                </div>
                <h1 className="text-4xl sm:text-5xl font-normal tracking-wide text-[#af893e]">
                  {bookCompilation.decedentName}
                </h1>
                <div className="text-xs italic text-[#8c7d6b] pt-1">
                  {bookCompilation.datesOfGrace} · Benta's Memorial Chapel
                </div>
              </div>

              <p className="text-sm italic text-[#483f34] max-w-xl mx-auto leading-relaxed pt-2">
                “A devoted educator of 38 years, master botanist, and beloved matriarch whose radiant wisdom, generous kitchen, and unforgettable bedtime stories touched generations of family and community members.”
              </p>
            </div>

            {/* Archival Photo Spread */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80"
                alt="Family Memory"
                className="w-full h-48 sm:h-56 object-cover rounded border border-[#ece5d8]"
              />
              <img
                src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80"
                alt="Wedding Memory"
                className="w-full h-48 sm:h-56 object-cover rounded border border-[#ece5d8]"
              />
            </div>

            {/* Chapter 1: Spouse */}
            <div className="space-y-4">
              <div className="text-center font-serif text-xl sm:text-2xl text-[#af893e] uppercase tracking-widest border-b border-[#e6dac1] pb-2">
                Words from Spouse & Life Partner
              </div>

              <div className="bg-[#faf7f2] border-l-4 border-[#af893e] p-6 rounded-r-xl space-y-3">
                <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-wider bg-[#ccfbf1] text-[#0d9488] px-2 py-0.5 rounded-full">
                  🤝 Help & Sacrifice
                </span>
                <div className="italic text-sm text-[#82662c]">
                  “What was a quiet, private ritual of love she did every single day?”
                </div>
                <p className="text-base text-[#24201b] leading-relaxed italic">
                  Every morning began before the sun with quiet chamomile tea.<br />
                  She left notes upon the counter—nineteen thousand over fifty years—<br />
                  words of steady courage that held our house upright through every storm.<br />
                  She never asked for gratitude, only that we met the morning with hope.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#e6dac1] text-xs">
                  <div>
                    <strong className="text-[#191613]">— Robert Vance</strong>, <span className="italic text-[#8c7d6b]">Husband of 52 Years</span>
                  </div>
                  <span className="bg-white border border-[#e6dac1] text-[#af893e] text-[10px] font-sans font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    📱 Scan to Stream Voice Recording (02:14)
                  </span>
                </div>
              </div>
            </div>

            {/* Chapter 2: Children */}
            <div className="space-y-4">
              <div className="text-center font-serif text-xl sm:text-2xl text-[#af893e] uppercase tracking-widest border-b border-[#e6dac1] pb-2">
                Words from Her Children
              </div>

              <div className="bg-[#faf7f2] border-l-4 border-[#af893e] p-6 rounded-r-xl space-y-3">
                <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-wider bg-[#fef3c7] text-[#d97706] px-2 py-0.5 rounded-full">
                  ✨ Joy & Laughter
                </span>
                <div className="italic text-sm text-[#82662c]">
                  “What's a moment she made you proud in a way that took your breath away?”
                </div>
                <p className="text-base text-[#24201b] leading-relaxed italic">
                  When the school closed its music hall, she opened our front door.<br />
                  Eight retired teachers, four years of after-school violin strings in our living room,<br />
                  never asking permission from the town board, only answering the call of children who wanted to play.<br />
                  Her life was an unending song of quiet courage.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#e6dac1] text-xs">
                  <div>
                    <strong className="text-[#191613]">— Claire Vance-Miller</strong>, <span className="italic text-[#8c7d6b]">Daughter</span>
                  </div>
                  <span className="bg-white border border-[#e6dac1] text-[#af893e] text-[10px] font-sans font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    🎥 Watch Video Tribute Recording (01:45)
                  </span>
                </div>
              </div>
            </div>

            {/* Chapter 3: Childhood Friends */}
            <div className="space-y-4">
              <div className="text-center font-serif text-xl sm:text-2xl text-[#af893e] uppercase tracking-widest border-b border-[#e6dac1] pb-2">
                Childhood & Lifelong Friends
              </div>

              <div className="bg-[#faf7f2] border-l-4 border-[#af893e] p-6 rounded-r-xl space-y-3">
                <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-wider bg-[#ede9fe] text-[#7c3aed] px-2 py-0.5 rounded-full">
                  👁️ Witnessing in Action
                </span>
                <div className="italic text-sm text-[#82662c]">
                  “What was an adventure only the two of you knew about?”
                </div>
                <p className="text-base text-[#24201b] leading-relaxed italic">
                  In the summer of '62, our cedar fence raft sank in the mud of Mill Creek.<br />
                  While I was ready to cry, Eleanor stood in the reeds and laughed until she couldn't breathe.<br />
                  'Now we know how to build a better one,' she smiled.<br />
                  That was how she treated every broken thing in this world.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#e6dac1] text-xs">
                  <div>
                    <strong className="text-[#191613]">— Martha Hayes</strong>, <span className="italic text-[#8c7d6b]">Childhood Friend of 63 Years</span>
                  </div>
                  <span className="bg-white border border-[#e6dac1] text-[#af893e] text-[10px] font-sans font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    📱 Scan to Stream Voice Recording (03:02)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-[#e6dac1] text-xs text-[#8c8071]">
              ❧ &nbsp; Published by Benta's Funeral Home · Digital Tribute Keepsake Edition &nbsp; ❧
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: FUNERAL HOME ADMINISTRATION (Moderation)         */}
      {/* ======================================================== */}
      {activeTab === 'admin' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-3xl font-semibold text-[#1a1815]">
              Funeral Home Administration
            </h2>
            <p className="text-xs text-[#69635b]">
              Review incoming guest voice and video tributes before publishing to the coffee table volume.
            </p>
          </div>

          <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 sm:p-8 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#ece5d8] text-[#69635b] uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Contributor</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Prompt & Stanza Snippet</th>
                  <th className="py-3 px-4">Media</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece5d8]">
                {tributes.map((item) => (
                  <tr key={item.id} className="hover:bg-[#faf7f2]/80 transition">
                    <td className="py-4 px-4">
                      <strong className="text-[#191714] block text-xs">{item.contributorName}</strong>
                      <span className="text-[#69635b] text-[11px]">{item.contributorEmail}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block bg-[#f5eedf] text-[#af893e] border border-[#e6dac1] px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                        {item.contributorRelation || 'Friend'}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <em className="text-[#82662c] block text-[11px]">“{item.promptQuestion}”</em>
                      <span className="text-[#69635b] text-[11px] line-clamp-1 mt-0.5">
                        {item.poeticStanzas?.[0] || item.rawTranscript}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-[#191714]">
                        <button
                          onClick={() => setPlayingTributeId(playingTributeId === item.id ? null : item.id)}
                          className="w-6 h-6 rounded-full bg-[#f5eedf] hover:bg-[#af893e] hover:text-white flex items-center justify-center transition text-[#af893e] cursor-pointer"
                        >
                          {playingTributeId === item.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                        </button>
                        <span>🎙️ Voice Only ({item.audioDuration || '03:02'})</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => autoFormatIntoPoem(item.id)}
                          className="bg-[#af893e] hover:bg-[#96732f] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs transition cursor-pointer"
                        >
                          ✨ Format Poem
                        </button>
                        {item.status === 'approved' ? (
                          <span className="text-[11px] font-bold text-[#38a169] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => approveTribute(item.id, item.contributorName)}
                            className="bg-[#38a169] hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs transition cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: CLOUD SYNC & 90-DAY ARCHIVAL POLICY             */}
      {/* ======================================================== */}
      {activeTab === 'cloud' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-3xl font-semibold text-[#1a1815]">
              Cloud Backend & 90-Day Archival Policy
            </h2>
            <p className="text-xs text-[#69635b]">
              Supabase PostgreSQL multi-tenant schema, RLS policies, and automated 90–day storage purge monitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Database & Storage Rules */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 text-xs leading-relaxed">
              <h3 className="text-base font-bold text-[#191714] border-b border-[#ece5d8] pb-2">
                Database & Storage Rules
              </h3>
              <div className="flex items-start gap-2">
                <span>🔒</span>
                <div>
                  <strong>Row Level Security (RLS):</strong> Enabled on all tables
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>📦</span>
                <div>
                  <strong>Raw Storage Bucket:</strong> <code className="bg-[#f5eedf] text-[#af893e] px-1.5 py-0.5 rounded text-[11px]">tributes-raw</code> (500MB cap)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>🎬</span>
                <div>
                  <strong>Final Archival:</strong> <code className="bg-[#f5eedf] text-[#af893e] px-1.5 py-0.5 rounded text-[11px]">tributes-final</code> (Permanent)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>📚</span>
                <div>
                  <strong>Taxonomy:</strong> 20+ Categories with Follow-Up Pairs
                </div>
              </div>
            </div>

            {/* Card 2: Automated 90-Day Purge */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 text-xs leading-relaxed">
              <h3 className="text-base font-bold text-[#191714] border-b border-[#ece5d8] pb-2">
                Automated 90–Day Purge
              </h3>
              <div className="flex items-start gap-2">
                <span>⏱️</span>
                <div>
                  <strong>Schedule:</strong> Daily at 03:00 UTC (via <code className="bg-[#f5eedf] text-[#af893e] px-1 py-0.5 rounded text-[11px]">pg_cron</code>)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>🧹</span>
                <div>
                  <strong>Procedure:</strong> <code className="bg-[#f5eedf] text-[#af893e] px-1 py-0.5 rounded text-[11px]">purge_expired_raw_media()</code>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>⚡</span>
                <div>
                  <strong>Edge Function:</strong> <code className="bg-[#f5eedf] text-[#af893e] px-1 py-0.5 rounded text-[11px]">functions/purge-raw-footage</code>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>🛡️</span>
                <div>
                  <strong>Safety:</strong> Coffee Table Book & compiled audio preserved forever
                </div>
              </div>
            </div>

            {/* Card 3: Realtime Storage Telemetry */}
            <div className="md:col-span-2 bg-white border border-[#ece5d8] rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#69635b]">Raw Storage Allocation</div>
                  <div className="text-sm font-bold text-[#191714] font-mono">{storageTelemetry.rawStorageUsedMB}MB / {storageTelemetry.rawStorageLimitMB}MB</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#69635b]">Preserved Archival Keepsakes</div>
                  <div className="text-sm font-bold text-emerald-700 font-mono">{storageTelemetry.permanentKeepsakeFilesCount} volumes preserved</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⏱️</span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#69635b]">Next pg_cron Purge Run</div>
                  <div className="text-sm font-bold text-[#af893e] font-mono">{storageTelemetry.nextScheduledPurgeTimestamp}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
