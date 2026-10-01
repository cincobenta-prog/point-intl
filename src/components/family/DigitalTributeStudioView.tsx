import React, { useState, useEffect, useRef } from 'react';
import {
  GoldenRecordCase,
  SimulatedNotification
} from '../../lib/types/funeral';
import {
  TributeQuestionPrompt,
  TributeMediaType,
  DigitalTributeItem,
  CoffeeTableBookCompilation,
  CloudStorageRetentionTelemetry,
  FriendTributeInvitation
} from '../../lib/types/digitalTribute';
import {
  NARRATIVE_PILLARS,
  RELATIONSHIP_CATEGORIES,
  CURATED_QUESTION_BANK,
  INITIAL_DIGITAL_TRIBUTES,
  INITIAL_BOOK_COMPILATION,
  INITIAL_STORAGE_TELEMETRY,
  INITIAL_FRIEND_INVITATIONS
} from '../../lib/data/digitalTributeQuestionBank';
import { formatIntoPoeticStanzas } from '../../lib/utils/aiPoemEngine';
import {
  Headphones,
  Mic,
  Video,
  Play,
  Pause,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Share2,
  Cloud,
  Send,
  QrCode,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Printer,
  Download,
  Search,
  ChevronRight,
  Radio,
  FileText,
  Lock,
  Award,
  X,
  ArrowRight,
  Shuffle
} from 'lucide-react';

interface DigitalTributeStudioViewProps {
  activeCase: GoldenRecordCase;
  onUpdateCase?: (updatedCase: GoldenRecordCase) => void;
  onSendNotification?: (notif: SimulatedNotification) => void;
  onOpenFamilyProofApproval?: () => void;
  isStaffUser?: boolean;
}

export const DigitalTributeStudioView: React.FC<DigitalTributeStudioViewProps> = ({
  activeCase,
  onUpdateCase,
  onSendNotification,
  onOpenFamilyProofApproval,
  isStaffUser = false
}) => {
  // Main Studio Mode: 'studio' (Contributor Recording) | 'book' (Coffee Table Volume) | 'admin' (Moderation) | 'invites' (Outreach & QR) | 'cloud' (Storage & Purge)
  const [studioMode, setStudioMode] = useState<'studio' | 'book' | 'admin' | 'invites' | 'cloud'>('studio');

  // Contributor 5-Step Workflow: 1 (Welcome) | 2 (Relationship) | 3 (Prompts) | 4 (Recording/Media) | 5 (Success)
  const [contributorStep, setContributorStep] = useState<number>(1);

  // Data State
  const [tributes, setTributes] = useState<DigitalTributeItem[]>(INITIAL_DIGITAL_TRIBUTES);
  const [bookCompilation, setBookCompilation] = useState<CoffeeTableBookCompilation>({
    ...INITIAL_BOOK_COMPILATION,
    decedentName: activeCase.decedent.legalName || INITIAL_BOOK_COMPILATION.decedentName,
    datesOfGrace: `${activeCase.decedent.dateOfBirth || '1948'} — ${activeCase.decedent.dateOfDeath || '2026'}`
  });
  const [storageTelemetry, setStorageTelemetry] = useState<CloudStorageRetentionTelemetry>(INITIAL_STORAGE_TELEMETRY);
  const [invitations, setInvitations] = useState<FriendTributeInvitation[]>(INITIAL_FRIEND_INVITATIONS);

  // Step 2: Relationship Selector
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All');
  const [relationshipSearch, setRelationshipSearch] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('spouse_partner');

  // Step 3: Question Bank & Narrative Pillars
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<TributeQuestionPrompt>(CURATED_QUESTION_BANK[0]);
  const [shuffledQuestions, setShuffledQuestions] = useState<TributeQuestionPrompt[]>(CURATED_QUESTION_BANK);

  // Step 4: Media Recording Studio
  const [mediaType, setMediaType] = useState<TributeMediaType>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [hasLiveAudioRecording, setHasLiveAudioRecording] = useState(false);

  // Contributor Form Fields
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributorPhone, setContributorPhone] = useState('');
  const [contributorRelation, setContributorRelation] = useState('');
  const [writtenMemory, setWrittenMemory] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [livePoemPreview, setLivePoemPreview] = useState<string[]>([]);
  const [isFormattingPoem, setIsFormattingPoem] = useState(false);

  // Audio Playback Player Modal & Inline Audio
  const [activePlaybackTribute, setActivePlaybackTribute] = useState<DigitalTributeItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Moderation & Admin State
  const [moderationFilter, setModerationFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [isCompilingBook, setIsCompilingBook] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileStepLabel, setCompileStepLabel] = useState('');

  // QR Modal & Share State
  const [isQRCardModalOpen, setIsQRCardModalOpen] = useState(false);
  const [shareRecipientName, setShareRecipientName] = useState('');
  const [shareRecipientContact, setShareRecipientContact] = useState('');
  const [shareChannel, setShareChannel] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [shareNote, setShareNote] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Web Audio Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter relationship categories
  const filteredCategories = RELATIONSHIP_CATEGORIES.filter(cat => {
    const matchesGroup = selectedGroupFilter === 'All' || cat.group === selectedGroupFilter;
    const matchesSearch = !relationshipSearch || 
      cat.label.toLowerCase().includes(relationshipSearch.toLowerCase()) || 
      cat.sub.toLowerCase().includes(relationshipSearch.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  // Filter prompts for selected relationship & pillar
  const availablePrompts = shuffledQuestions.filter(q => {
    const matchesRel = q.relationshipType === selectedRelationship;
    const matchesPillar = selectedPillarFilter === 'all' || q.pillar === selectedPillarFilter;
    return matchesRel && matchesPillar;
  });

  // Shuffle Prompts
  const handleShufflePrompts = () => {
    const shuffled = [...shuffledQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    showToast('🎲 Question bank randomized with fresh reflection prompts!');
  };

  // Select a category
  const handleSelectCategory = (catId: string, catLabel: string) => {
    setSelectedRelationship(catId);
    setContributorRelation(catLabel);
    
    // Find first prompt for this category
    const foundPrompt = shuffledQuestions.find(q => q.relationshipType === catId) || CURATED_QUESTION_BANK[0];
    setSelectedPrompt(foundPrompt);
    setContributorStep(3);
  };

  // Real or Simulated Microphone Recording
  const startAudioRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          setHasLiveAudioRecording(true);
          // Stop mic tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(200);
      }
    } catch (err) {
      console.warn('Microphone permission fallback to simulated acoustic capture:', err);
    }

    setIsRecording(true);
    setRecordDuration(0);
    setHasLiveAudioRecording(false);

    timerIntervalRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      setHasLiveAudioRecording(true);
    }
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    showToast(`🎙️ Voice recording captured (${formatSeconds(recordDuration)}). Ready for review!`);
  };

  // Canvas Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 42;
      const barWidth = canvas.width / bars - 3;

      for (let i = 0; i < bars; i++) {
        let h = 8;
        if (isRecording) {
          // Dynamic simulated live frequencies
          h = 10 + Math.sin(tick * 0.2 + i * 0.4) * 22 + Math.cos(tick * 0.15 + i * 0.3) * 16;
          h = Math.max(6, Math.min(64, h));
          ctx.fillStyle = i % 2 === 0 ? '#991b1b' : '#b45309';
        } else if (isPlayingAudio) {
          h = 10 + Math.sin(tick * 0.3 + i * 0.5) * 26;
          h = Math.max(6, Math.min(60, h));
          ctx.fillStyle = '#af893e';
        } else {
          // Resting serene wave
          h = 6 + Math.sin(i * 0.25) * 4;
          ctx.fillStyle = '#d4c5a9';
        }

        const x = i * (barWidth + 3);
        const y = (canvas.height - h) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 3);
        ctx.fill();
      }

      tick++;
      animFrame = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isRecording, isPlayingAudio]);

  // AI Poetic Stanza Formatter Handler
  const handleRunAiPoemEngine = () => {
    setIsFormattingPoem(true);
    setTimeout(() => {
      const textToFormat = writtenMemory || selectedPrompt.questionText + ' ' + (selectedPrompt.followUpPrompt || '');
      const result = formatIntoPoeticStanzas(textToFormat, contributorName || 'Robert Vance', contributorRelation || 'Spouse');
      setLivePoemPreview(result.stanzas);
      setIsFormattingPoem(false);
      showToast('✨ AI Memorial Engine formatted words into 4-line poetic stanzas!');
    }, 600);
  };

  // Submit Contributor Tribute
  const handleSubmitTribute = () => {
    if (!contributorName.trim()) {
      alert('Please enter your full name so the family knows who shared this memory.');
      return;
    }

    const durationSec = recordDuration > 0 ? recordDuration : 145;
    const minutes = String(Math.floor(durationSec / 60)).padStart(2, '0');
    const seconds = String(durationSec % 60).padStart(2, '0');

    // Auto-generate poetic stanzas if none yet
    const stanzasResult = livePoemPreview.length > 0 
      ? livePoemPreview 
      : formatIntoPoeticStanzas(
          writtenMemory || `${selectedPrompt.questionText} ${selectedPrompt.followUpPrompt || ''}`,
          contributorName,
          contributorRelation
        ).stanzas;

    const newTribute: DigitalTributeItem = {
      id: `dt-${Date.now()}`,
      caseId: activeCase.id,
      contributorName: contributorName.trim(),
      contributorEmail: contributorEmail.trim(),
      contributorPhone: contributorPhone.trim(),
      contributorRelation: contributorRelation || 'Family Friend',
      relationshipCategory: selectedRelationship,
      pillar: selectedPrompt.pillar,
      pillarLabel: selectedPrompt.pillarLabel,
      promptQuestion: selectedPrompt.questionText,
      followUpPrompt: selectedPrompt.followUpPrompt,
      mediaType,
      audioDuration: `${minutes}:${seconds}`,
      durationSeconds: durationSec,
      audioWaveData: [18, 32, 45, 50, 36, 22, 44, 30, 18, 28, 48, 34, 20, 38, 42, 16],
      rawTranscript: writtenMemory || `Living memory reflecting on: "${selectedPrompt.questionText}"`,
      poeticStanzas: stanzasResult,
      status: 'pending',
      includeInBook: true,
      includeInSlideshow: true,
      isFeatured: false,
      recordedDate: 'Just now',
      createdAt: new Date().toISOString(),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://e-bfh.com/tribute/${activeCase.caseNumber}`,
      privateNoteToFamily: privateNote.trim()
    };

    const updatedTributes = [newTribute, ...tributes];
    setTributes(updatedTributes);

    // Update storage metrics
    setStorageTelemetry(prev => ({
      ...prev,
      rawStorageUsedMB: Number((prev.rawStorageUsedMB + 4.2).toFixed(1)),
      rawMediaFilesCount: prev.rawMediaFilesCount + 1
    }));

    setContributorStep(5);
    showToast(`🕊️ Thank you, ${contributorName}! Your memory has been submitted to the family archive.`);

    if (onUpdateCase) {
      onUpdateCase({
        ...activeCase,
        notes: [
          {
            id: `note-tribute-${Date.now()}`,
            author: 'Digi-Tribute 2.0 System',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `New ${mediaType} tribute recorded by ${contributorName} (${contributorRelation || 'Friend'}).`
          },
          ...activeCase.notes
        ]
      });
    }

    if (onSendNotification) {
      onSendNotification({
        id: `notif-${Date.now()}`,
        caseId: activeCase.id,
        decedentName: activeCase.decedent.legalName,
        recipientName: activeCase.informant.fullName,
        recipientPhone: activeCase.informant.phone,
        recipientEmail: activeCase.informant.email,
        channel: 'sms',
        type: 'portal_update',
        title: 'New Digital Tribute Memory Submitted',
        bodyText: `${contributorName} (${contributorRelation || 'Friend'}) recorded a ${mediaType} memory for ${activeCase.decedent.legalName}.`,
        sentAt: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'delivered',
        actionUrl: `https://e-bfh.com/tribute/${activeCase.caseNumber}`,
        actionButtonText: 'Review in Memorial Hub'
      });
    }
  };

  // Compile Master Keepsake Book & Slideshow
  const handleCompileKeepsakeBook = () => {
    setIsCompilingBook(true);
    setCompileProgress(10);
    setCompileStepLabel('Aggregating approved audio waveforms and high-res photos...');

    setTimeout(() => {
      setCompileProgress(35);
      setCompileStepLabel('Running AI Memorial Stanza Engine on all contributor reflections...');
    }, 700);

    setTimeout(() => {
      setCompileProgress(65);
      setCompileStepLabel('Generating dynamic scan-to-stream QR verification pills...');
    }, 1400);

    setTimeout(() => {
      setCompileProgress(90);
      setCompileStepLabel('Binding museum-grade Coffee Table Booklet PDF & chapel audio reels...');
    }, 2100);

    setTimeout(() => {
      setCompileProgress(100);
      setCompileStepLabel('Compilation complete! Master archival files locked.');

      const approvedTributes = tributes.filter(t => t.status === 'approved' || t.status === 'featured');
      
      setBookCompilation(prev => ({
        ...prev,
        totalTributes: approvedTributes.length,
        totalAudioSeconds: approvedTributes.reduce((acc, t) => acc + (t.durationSeconds || 120), 0),
        isCompiled: true,
        lastCompiledAt: new Date().toISOString()
      }));

      setIsCompilingBook(false);
      showToast('📖 Coffee Table Keepsake Volume & Master Prelude Audio successfully compiled!');
    }, 2800);
  };

  // Moderation status change
  const handleUpdateTributeStatus = (tributeId: string, newStatus: 'approved' | 'featured' | 'archived') => {
    setTributes(prev => prev.map(t => {
      if (t.id === tributeId) {
        return {
          ...t,
          status: newStatus,
          approvedAt: newStatus !== 'archived' ? new Date().toISOString() : undefined,
          isFeatured: newStatus === 'featured'
        };
      }
      return t;
    }));
    showToast(`✓ Tribute marked as ${newStatus.toUpperCase()}`);
  };

  // Format single tribute in moderation table
  const handleFormatSingleTributePoem = (tributeId: string) => {
    setTributes(prev => prev.map(t => {
      if (t.id === tributeId) {
        const res = formatIntoPoeticStanzas(t.rawTranscript || t.promptQuestion, t.contributorName, t.contributorRelation);
        return {
          ...t,
          poeticStanzas: res.stanzas
        };
      }
      return t;
    }));
    showToast('✨ AI Memorial Engine formatted tribute into 4-line poetic stanzas!');
  };

  // Send friend invitation
  const handleSendFriendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareRecipientName.trim() || !shareRecipientContact.trim()) {
      alert('Please provide recipient name and contact details.');
      return;
    }

    setIsSendingInvite(true);
    setTimeout(() => {
      const newInv: FriendTributeInvitation = {
        id: `inv-${Date.now()}`,
        caseId: activeCase.id,
        recipientName: shareRecipientName.trim(),
        recipientContact: shareRecipientContact.trim(),
        channel: shareChannel,
        status: 'sent',
        personalNote: shareNote.trim() || `Please share a memory for ${activeCase.decedent.legalName}'s Coffee Table Keepsake Book.`,
        sentAt: 'Just now',
        magicToken: `tok_${Math.random().toString(36).substring(2, 9)}`
      };

      setInvitations(prev => [newInv, ...prev]);
      setShareRecipientName('');
      setShareRecipientContact('');
      setShareNote('');
      setIsSendingInvite(false);
      showToast(`📱 Tribute invite dispatched to ${newInv.recipientName} via ${shareChannel.toUpperCase()}!`);
    }, 800);
  };

  // Simulate friend action
  const handleSimulateInviteAction = (invId: string, nextStatus: 'opened' | 'recorded') => {
    setInvitations(prev => prev.map(inv => {
      if (inv.id === invId) {
        return {
          ...inv,
          status: nextStatus,
          openedAt: nextStatus === 'opened' || nextStatus === 'recorded' ? 'Just now' : inv.openedAt,
          recordedAt: nextStatus === 'recorded' ? 'Just now' : inv.recordedAt
        };
      }
      return inv;
    }));
    showToast(`Simulation: Invitation ${nextStatus === 'opened' ? 'opened by friend' : 'voice memory recorded'}!`);
  };

  const formatSeconds = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#191714] text-amber-200 border-2 border-[#af893e] px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DIGNIFIED HERO BANNER */}
      <div className="bg-gradient-to-br from-[#141b2b] via-[#1c2438] to-[#261e14] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-amber-500/30">
        <div className="max-w-4xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-amber-400/20 border border-amber-400/50 text-amber-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <Headphones className="w-3.5 h-3.5 text-amber-300" />
              <span>Digi-Tribute 2.0 • Living Memorial Platform</span>
            </span>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Permanent Master Archival Active</span>
            </span>
            {isStaffUser && (
              <span className="bg-amber-950/80 text-amber-300 border border-amber-500/50 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Director Mode
              </span>
            )}
          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide">
            Digital Tribute & Coffee Table Keepsake Volume
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-3xl">
            In loving memory of <strong className="text-amber-300 font-bold">{activeCase.decedent.legalName}</strong>. 
            Gather living acoustic voice recordings, video tributes, and written reflections from family and friends worldwide. 
            Curate and format tributes into poetic stanzas bound into a luxury high-res Coffee Table Keepsake Volume with scan-to-stream QR audio playback.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold font-serif-title text-amber-300">{tributes.length}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Tributes Gathered</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold font-serif-title text-emerald-300">
                {tributes.filter(t => t.status === 'approved' || t.status === 'featured').length}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">In Keepsake Volume</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold font-serif-title text-sky-300">78 Prompts</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Curated Question Bank</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold font-serif-title text-purple-300">{invitations.length}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Community Invites</div>
            </div>
          </div>
        </div>

        <div className="absolute right-6 -bottom-6 text-9xl text-white/5 font-serif select-none pointer-events-none">
          🕊️
        </div>
      </div>

      {/* TOP SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setStudioMode('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              studioMode === 'studio'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-amber-300" />
            <span>1. Record / Share Tribute</span>
          </button>

          <button
            onClick={() => setStudioMode('book')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              studioMode === 'book'
                ? 'bg-[#af893e] text-white shadow-md'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Coffee Table Keepsake Book</span>
          </button>

          <button
            onClick={() => setStudioMode('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              studioMode === 'admin'
                ? 'bg-neutral-900 text-amber-300 shadow-md'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Family & Staff Moderation Hub</span>
            {tributes.filter(t => t.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {tributes.filter(t => t.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setStudioMode('invites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              studioMode === 'invites'
                ? 'bg-neutral-800 text-white shadow-md'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Community Invites & QR Cards</span>
          </button>

          <button
            onClick={() => setStudioMode('cloud')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              studioMode === 'cloud'
                ? 'bg-neutral-800 text-white shadow-md'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>5. 90-Day Archival & Purge Rules</span>
          </button>
        </div>

        {/* Global Action: Quick QR Print */}
        <button
          onClick={() => setIsQRCardModalOpen(true)}
          className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm ml-auto"
        >
          <QrCode className="w-3.5 h-3.5 text-[#b45309]" />
          <span>Print 4-Up QR Service Cards</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CONTRIBUTOR MEMORIAL STUDIO (5-STEP INTERACTIVE FLOW)              */}
      {/* ========================================================================= */}
      {studioMode === 'studio' && (
        <div className="space-y-6">
          
          {/* 5-Step Visual Stepper Bar */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold">
              {[
                { step: 1, label: '1. Welcome & Access' },
                { step: 2, label: '2. Relationship' },
                { step: 3, label: '3. Curated Question' },
                { step: 4, label: '4. Record / Write' },
                { step: 5, label: '5. Keepsake Created' }
              ].map(item => (
                <button
                  key={item.step}
                  onClick={() => setContributorStep(item.step)}
                  className={`py-2 px-1 rounded-xl transition flex items-center justify-center space-x-1 ${
                    contributorStep === item.step
                      ? 'bg-[#991b1b] text-white shadow-sm'
                      : contributorStep > item.step
                      ? 'bg-amber-50 text-[#b45309] border border-amber-200'
                      : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-[11px] truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: WELCOME & ACCESS PIN */}
          {contributorStep === 1 && (
            <div className="bg-white border-2 border-amber-400/50 rounded-3xl p-6 sm:p-10 shadow-lg max-w-2xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#991b1b] to-[#b45309] text-white flex items-center justify-center font-serif-title font-bold text-3xl mx-auto shadow-md border-2 border-amber-300">
                BFH
              </div>

              <div className="space-y-2">
                <span className="bg-amber-100 text-[#b45309] border border-amber-300 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  🕊️ Digi-Tribute 2.0 Contributor Studio
                </span>
                <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-neutral-900">
                  Celebrate the Life of {activeCase.decedent.legalName}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  You have been invited to record a living acoustic voice tribute, video memory, or written reflection. 
                  Your words will be preserved in the family's permanent Coffee Table Keepsake Book.
                </p>
              </div>

              {/* Privacy Access Check */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 max-w-md mx-auto space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Family Access Protection (PIN / Magic Link)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Verified Guest
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  This tribute studio is private to family, friends, and church community members.
                </p>
              </div>

              <button
                onClick={() => setContributorStep(2)}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-sm px-8 py-3.5 rounded-2xl transition shadow-lg shadow-red-950/20 flex items-center space-x-2 mx-auto"
              >
                <span>Begin Your Tribute</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          )}

          {/* STEP 2: RELATIONSHIP TAXONOMY SELECTOR */}
          {contributorStep === 2 && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div className="space-y-1">
                  <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                    What was your relationship to {activeCase.decedent.legalName}?
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Selecting your connection unlocks 78 deeply personal, curated prompts tailored to your shared story.
                  </p>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search relationship..."
                      value={relationshipSearch}
                      onChange={(e) => setRelationshipSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 outline-none focus:border-[#991b1b] w-48"
                    />
                  </div>
                </div>
              </div>

              {/* Group Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Immediate Family', 'Extended & In-Laws', 'Friends & Early Years', 'Mentors & Colleagues', 'Community & Faith'].map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroupFilter(group)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedGroupFilter === group
                        ? 'bg-[#991b1b] text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              {/* Relationship Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredCategories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id, cat.label)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between hover:shadow-md hover:border-amber-400 ${
                      selectedRelationship === cat.id
                        ? 'bg-amber-50/90 border-[#af893e] ring-2 ring-amber-400/30'
                        : 'bg-neutral-50/60 border-neutral-200 hover:bg-white'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          {cat.group}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-neutral-900">{cat.label}</div>
                      <p className="text-[11px] text-neutral-500 leading-snug">{cat.sub}</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-200/60 mt-3 flex items-center justify-between text-[11px] text-neutral-600 font-semibold">
                      <span>View Prompts</span>
                      <ChevronRight className="w-4 h-4 text-[#af893e]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DYNAMIC QUESTION BANK & 4 NARRATIVE PILLARS */}
          {contributorStep === 3 && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-100 text-[#b45309] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                      Relationship: {RELATIONSHIP_CATEGORIES.find(c => c.id === selectedRelationship)?.label}
                    </span>
                  </div>
                  <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                    Choose a Meaningful Reflection Prompt
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Each prompt is paired with an introspective follow-up question to spark genuine, heartfelt storytelling.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShufflePrompts}
                    className="bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-300 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle Prompts</span>
                  </button>
                  <button
                    onClick={() => setContributorStep(2)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 font-semibold px-2 py-1"
                  >
                    Change Relationship
                  </button>
                </div>
              </div>

              {/* 4 Narrative Pillar Filter Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'All 4 Narrative Pillars', icon: '🌟' },
                  { id: 'joy', label: 'Joy & Laughter', icon: '✨' },
                  { id: 'pain', label: 'Pain & Resilience', icon: '🛡️' },
                  { id: 'help', label: 'Help & Sacrifice', icon: '🤝' },
                  { id: 'action', label: 'Witnessing in Action', icon: '👁️' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPillarFilter(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      selectedPillarFilter === p.id
                        ? 'bg-[#991b1b] text-white shadow-sm'
                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Prompt Pebble Cards List */}
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {availablePrompts.map(prompt => {
                  const isSelected = selectedPrompt.id === prompt.id;
                  const pillarMeta = NARRATIVE_PILLARS[prompt.pillar] || NARRATIVE_PILLARS.joy;

                  return (
                    <div
                      key={prompt.id}
                      onClick={() => setSelectedPrompt(prompt)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-50/90 border-[#af893e] ring-2 ring-amber-400/20 shadow-md'
                          : 'bg-neutral-50/50 border-neutral-200 hover:bg-white hover:border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${pillarMeta.badgeBg}`}>
                          {pillarMeta.icon} {pillarMeta.label}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-[#b45309] flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected Prompt</span>
                          </span>
                        )}
                      </div>

                      <div className="font-serif-title font-bold text-base sm:text-lg text-neutral-900">
                        {prompt.questionText}
                      </div>

                      {prompt.followUpPrompt && (
                        <div className="text-xs text-neutral-600 italic bg-white/70 border border-neutral-200/80 rounded-xl p-2.5">
                          ↳ <strong>Follow-Up Reflection:</strong> "{prompt.followUpPrompt}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
                <button
                  onClick={() => setContributorStep(2)}
                  className="text-xs text-neutral-600 hover:text-neutral-900 font-bold"
                >
                  ← Back to Relationships
                </button>

                <button
                  onClick={() => setContributorStep(4)}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md flex items-center space-x-1.5"
                >
                  <span>Continue to Recording Studio</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MEDIA RECORDING & WRITING STUDIO */}
          {contributorStep === 4 && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Teleprompter Card Header */}
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-center space-y-2">
                <span className="inline-block bg-[#af893e] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full">
                  Teleprompter Guide
                </span>
                <h4 className="font-serif-title text-lg sm:text-xl font-bold text-neutral-900">
                  {selectedPrompt.questionText}
                </h4>
                {selectedPrompt.followUpPrompt && (
                  <p className="text-xs text-neutral-600 italic max-w-xl mx-auto border-t border-amber-200/80 pt-2">
                    Follow-Up Reflection: "{selectedPrompt.followUpPrompt}"
                  </p>
                )}
              </div>

              {/* Media Format Switcher */}
              <div className="flex flex-wrap justify-center gap-2 border-b border-neutral-200 pb-4">
                {[
                  { mode: 'voice', label: '🎙️ Live Acoustic Voice' },
                  { mode: 'video', label: '📹 Video Tribute' },
                  { mode: 'written', label: '✍️ Written Reflection & Poem' },
                  { mode: 'photo', label: '🖼️ Archival Photo & Letter' }
                ].map(item => (
                  <button
                    key={item.mode}
                    onClick={() => setMediaType(item.mode as TributeMediaType)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition text-left flex items-center space-x-2 ${
                      mediaType === item.mode
                        ? 'bg-[#991b1b] text-white shadow-md'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* MEDIA STUDIO CANVAS */}
              <div className="space-y-4">
                
                {/* 1. Voice Recording Mode */}
                {mediaType === 'voice' && (
                  <div className="bg-[#181614] rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-inner">
                    <div className="flex justify-between items-center text-xs text-amber-400 font-mono tracking-wider">
                      <span className="flex items-center space-x-1.5">
                        <Radio className={`w-3.5 h-3.5 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
                        <span>{isRecording ? 'LIVE ACOUSTIC RECORDING' : 'AUDIO RECORDER READY'}</span>
                      </span>
                      <span>{formatSeconds(recordDuration)}</span>
                    </div>

                    {/* Canvas Waveform */}
                    <div className="h-20 flex items-center justify-center">
                      <canvas ref={canvasRef} width={500} height={70} className="w-full max-w-lg" />
                    </div>

                    {/* Big Circular Recording Button */}
                    <div className="flex items-center justify-center space-x-4">
                      {!isRecording ? (
                        <button
                          onClick={startAudioRecording}
                          className="w-16 h-16 rounded-full bg-[#991b1b] hover:bg-red-800 text-white flex items-center justify-center text-2xl shadow-xl shadow-red-950/40 transition transform active:scale-95 border-2 border-amber-300"
                          title="Start recording"
                        >
                          <Mic className="w-7 h-7 text-amber-200" />
                        </button>
                      ) : (
                        <button
                          onClick={stopAudioRecording}
                          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-2xl shadow-xl shadow-red-950/40 transition transform active:scale-95 animate-pulse border-2 border-white"
                          title="Stop recording"
                        >
                          <Pause className="w-7 h-7" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400">
                      {isRecording 
                        ? 'Speak naturally from the heart. Tap the square button when finished.'
                        : 'Tap the red button to record your voice memory using your microphone.'}
                    </p>

                    {hasLiveAudioRecording && !isRecording && (
                      <div className="bg-white/10 border border-amber-400/30 rounded-xl p-3 flex items-center justify-between text-xs max-w-sm mx-auto">
                        <span className="text-emerald-300 flex items-center space-x-1 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Voice Memory Recorded ({formatSeconds(recordDuration)})</span>
                        </span>
                        <button
                          onClick={startAudioRecording}
                          className="text-amber-300 hover:underline text-[11px]"
                        >
                          Re-record
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Video Tribute Mode */}
                {mediaType === 'video' && (
                  <div className="bg-neutral-900 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-3xl">
                      📹
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif-title font-bold text-lg text-white">Video Tribute Viewfinder</h4>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto">
                        Record directly using your webcam or upload a recorded tribute video (MP4/MOV).
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setRecordDuration(95);
                          showToast('📹 Webcam connected and simulated 1:35 video memory captured!');
                        }}
                        className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md"
                      >
                        <Video className="w-4 h-4 text-amber-300" />
                        <span>Record via Camera</span>
                      </button>

                      <label className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5">
                        <Download className="w-4 h-4 text-amber-300" />
                        <span>Upload Video File</span>
                        <input type="file" accept="video/*" className="hidden" onChange={() => showToast('Video file uploaded successfully.')} />
                      </label>
                    </div>
                  </div>
                )}

                {/* 3. Written Reflection & AI Poem Mode */}
                {(mediaType === 'written' || mediaType === 'voice') && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#991b1b]" />
                        <span>Your Written Reflection / Spoken Story</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleRunAiPoemEngine}
                        disabled={isFormattingPoem}
                        className="bg-[#af893e] hover:bg-[#967432] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition flex items-center space-x-1 shadow-sm"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isFormattingPoem ? 'animate-spin' : ''}`} />
                        <span>{isFormattingPoem ? 'Formatting...' : '✨ Format into Poetic Stanzas'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      value={writtenMemory}
                      onChange={(e) => setWrittenMemory(e.target.value)}
                      placeholder="Share a vivid memory, conversation, or gratitude... (e.g. Every Sunday morning she would brew chamomile tea and write notes of courage...)"
                      className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                    />

                    {/* Live AI Stanza Preview */}
                    {livePoemPreview.length > 0 && (
                      <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-2">
                        <div className="text-[10px] font-bold text-[#b45309] uppercase tracking-wider flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Poetic Stanzas for Keepsake Booklet:</span>
                        </div>
                        {livePoemPreview.map((stanza, idx) => (
                          <p key={idx} className="font-serif-body text-xs text-neutral-800 italic leading-relaxed whitespace-pre-line pl-3 border-l-2 border-amber-400">
                            {stanza}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Contributor Information Form */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Contributor Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contributorName}
                        onChange={(e) => setContributorName(e.target.value)}
                        placeholder="e.g. Robert Vance, Martha Hayes"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Relationship to Loved One
                      </label>
                      <input
                        type="text"
                        value={contributorRelation}
                        onChange={(e) => setContributorRelation(e.target.value)}
                        placeholder="e.g. Spouse of 52 Years, Lifelong Friend"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={contributorEmail}
                        onChange={(e) => setContributorEmail(e.target.value)}
                        placeholder="robert@example.com"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={contributorPhone}
                        onChange={(e) => setContributorPhone(e.target.value)}
                        placeholder="(212) 555-0144"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Private Note to the Immediate Family (Optional)
                    </label>
                    <input
                      type="text"
                      value={privateNote}
                      onChange={(e) => setPrivateNote(e.target.value)}
                      placeholder="Private words of comfort only visible to the immediate family..."
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                    />
                  </div>
                </div>

              </div>

              {/* Bottom Navigation */}
              <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
                <button
                  onClick={() => setContributorStep(3)}
                  className="text-xs text-neutral-600 hover:text-neutral-900 font-bold"
                >
                  ← Back to Questions
                </button>

                <button
                  onClick={handleSubmitTribute}
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-8 py-3.5 rounded-2xl transition shadow-lg shadow-red-950/20 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Submit Memory to Keepsake Edition</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUBMISSION CONFIRMATION & QR CARD */}
          {contributorStep === 5 && (
            <div className="bg-white border-2 border-emerald-400/60 rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-bold">
                ✓
              </div>

              <div className="space-y-2">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Memorial Tribute Recorded
                </span>
                <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-neutral-900">
                  Thank You for Honoring {activeCase.decedent.legalName}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Your tribute has been safely archived and formatted for the family's Coffee Table Keepsake Book. 
                  Once reviewed by the family, attendees will be able to scan your QR code and listen to your voice memory.
                </p>
              </div>

              {/* Instant QR Verification Pill Preview */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 max-w-xs mx-auto space-y-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://e-bfh.com/tribute/${activeCase.caseNumber}`}
                  alt="Tribute QR Code"
                  className="w-28 h-28 mx-auto rounded-xl border border-neutral-200 shadow-sm"
                />
                <div className="text-[11px] font-bold text-neutral-800">
                  Scan-to-Stream Audio Memory
                </div>
                <div className="text-[10px] text-neutral-500">
                  e-bfh.com/tribute/{activeCase.caseNumber}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setContributorStep(2);
                    setContributorName('');
                    setWrittenMemory('');
                    setLivePoemPreview([]);
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs px-5 py-2.5 rounded-xl transition"
                >
                  Share Another Memory
                </button>

                <button
                  onClick={() => setStudioMode('book')}
                  className="bg-[#af893e] hover:bg-[#967432] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Coffee Table Volume</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: KEEPSAKE COFFEE TABLE VOLUME (MEMORIAL DOCUMENT FLIPBOOK)          */}
      {/* ========================================================================= */}
      {studioMode === 'book' && (
        <div className="space-y-6">
          
          {/* Header Controls */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-[#b45309] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                  Museum-Grade Memorial Publication
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs font-bold text-emerald-700">
                  {bookCompilation.totalTributes} Approved Entries
                </span>
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-neutral-900">
                Keepsake Coffee Table Volume
              </h3>
              <p className="text-xs text-neutral-500">
                Elegantly typeset memorial volume featuring AI poetic stanzas, archival photo spreads, and scan-to-stream QR audio codes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenFamilyProofApproval && (
                <button
                  onClick={onOpenFamilyProofApproval}
                  className="bg-purple-900 hover:bg-purple-800 text-purple-100 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md border border-purple-400/40"
                  title="Open Family Proof Approval & Commercial Press Lock Hub"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Family Proof Approval & Press Lock</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="bg-[#af893e] hover:bg-[#967432] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-amber-950/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export High-Res PDF Book</span>
              </button>
            </div>
          </div>

          {/* LUXURY COFFEE TABLE BOOK CONTAINER */}
          <div className="bg-[#faf7f2] border-2 border-[#e6dac1] rounded-3xl p-6 sm:p-12 shadow-2xl space-y-12 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
            
            {/* BOOK COVER PAGE FRAME */}
            <div className="bg-white border-2 border-[#e6dac1] rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-md relative overflow-hidden">
              <div className="text-xl text-[#af893e] tracking-[8px] select-none">
                ❧ &nbsp; ✦ &nbsp; ❧
              </div>

              {/* Oval Portrait Frame */}
              <div className="w-44 h-56 rounded-[50%] mx-auto overflow-hidden border-4 border-[#af893e] p-1 bg-white shadow-xl">
                <img
                  src={bookCompilation.coverPhotoUrl}
                  alt={bookCompilation.decedentName}
                  className="w-full h-full object-cover rounded-[50%]"
                />
              </div>

              <div className="space-y-2">
                <div className="font-serif-title text-xs uppercase tracking-[4px] text-neutral-500">
                  In Loving Memory & Enduring Grace
                </div>
                <h1 className="font-serif-title text-3xl sm:text-5xl font-bold text-[#af893e]">
                  {bookCompilation.decedentName}
                </h1>
                <div className="font-serif-body italic text-sm text-neutral-600">
                  {bookCompilation.datesOfGrace}
                </div>
                <div className="text-xs font-semibold text-neutral-500 pt-1">
                  {bookCompilation.chapelName}
                </div>
              </div>

              <p className="font-serif-body text-xs sm:text-sm text-neutral-700 italic max-w-xl mx-auto leading-relaxed border-t border-b border-amber-200/80 py-4">
                {bookCompilation.biographicalEpitaph}
              </p>

              <div className="text-[11px] text-[#af893e] font-serif-title uppercase tracking-widest">
                Coffee Table Keepsake Edition • Volume I
              </div>
            </div>

            {/* ARCHIVAL LIFE PHOTO SPREAD */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e6dac1] pb-2">
                <span className="font-serif-title text-sm uppercase tracking-widest text-[#af893e] font-bold">
                  Archival Life Mosaic Spread
                </span>
                <span className="text-xs font-serif-body italic text-neutral-500">
                  Moments of Grace & Family Heritage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-2xl border border-[#e6dac1] shadow-sm space-y-2">
                  <img
                    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80"
                    alt="Family Tradition"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="text-[11px] font-serif-body italic text-neutral-600 text-center">
                    Sunday dinner gathering and fellowship with extended family.
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-[#e6dac1] shadow-sm space-y-2">
                  <img
                    src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80"
                    alt="Wedding Celebration"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="text-[11px] font-serif-body italic text-neutral-600 text-center">
                    Celebrating 52 years of sacred devotion and partnership.
                  </div>
                </div>
              </div>
            </div>

            {/* MEMORIAL TRIBUTE CHAPTERS & POETIC STANZAS */}
            <div className="space-y-8">
              {tributes
                .filter(t => t.status === 'approved' || t.status === 'featured')
                .map((tribute, idx) => {
                  const pillarMeta = NARRATIVE_PILLARS[tribute.pillar] || NARRATIVE_PILLARS.joy;

                  return (
                    <div
                      key={tribute.id}
                      className="bg-white border border-[#e6dac1] rounded-3xl p-6 sm:p-8 shadow-md space-y-4 relative"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5eedf] pb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${pillarMeta.badgeBg}`}>
                          {pillarMeta.icon} {pillarMeta.label}
                        </span>

                        <div className="text-xs text-neutral-400 font-serif-title">
                          Chapter Entry #{idx + 1}
                        </div>
                      </div>

                      {/* Prompt Question */}
                      <div className="font-serif-title font-bold text-base sm:text-lg text-neutral-900">
                        {tribute.promptQuestion}
                      </div>

                      {/* Poetic Stanzas */}
                      <div className="bg-[#faf7f2] border-l-4 border-[#af893e] p-4 sm:p-5 rounded-r-2xl space-y-2.5">
                        {(tribute.poeticStanzas && tribute.poeticStanzas.length > 0
                          ? tribute.poeticStanzas
                          : [tribute.rawTranscript || '']
                        ).map((stanza, sIdx) => (
                          <p
                            key={sIdx}
                            className="font-serif-body text-xs sm:text-sm text-neutral-800 italic leading-relaxed whitespace-pre-line"
                          >
                            {stanza}
                          </p>
                        ))}
                      </div>

                      {/* Signature & Scan-to-Stream QR Audio Chip */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f5eedf]">
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-neutral-900 font-serif-title">
                            — {tribute.contributorName}
                          </div>
                          <div className="text-[11px] text-[#8c7d6b] italic">
                            {tribute.contributorRelation}
                          </div>
                        </div>

                        {/* Interactive Clickable & Printable Scan-to-Stream QR Pill */}
                        <div
                          onClick={() => setActivePlaybackTribute(tribute)}
                          className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#b45309] px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center space-x-2 shadow-sm"
                          title="Click to stream or scan with mobile phone"
                        >
                          <QrCode className="w-4 h-4 text-[#af893e]" />
                          <span>
                            {tribute.mediaType === 'video' ? '🎥 Watch Video Tribute' : `📱 Scan to Stream Voice (${tribute.audioDuration || '02:14'})`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Book Colophon */}
            <div className="text-center pt-8 border-t border-[#e6dac1] text-xs font-serif-body text-neutral-500 space-y-1">
              <div>❧ &nbsp; Published by Benta's Funeral Home · Digital Tribute Keepsake Edition &nbsp; ❧</div>
              <div className="text-[10px]">630 Saint Nicholas Avenue, New York, NY 10030 · Permanent Master Archive</div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: FAMILY & ADMIN MODERATION HUB (CURATION & COMPILER)                */}
      {/* ========================================================================= */}
      {studioMode === 'admin' && (
        <div className="space-y-6">
          
          {/* Moderation Controls Header */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    Director & Family Curation Console
                  </span>
                </div>
                <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                  Tribute Moderation & AI Keepsake Compiler
                </h3>
                <p className="text-xs text-neutral-500">
                  Review incoming voice and video recordings, format raw prose into 4-line poetic stanzas with 1 click, and compile the master volume.
                </p>
              </div>

              {/* Master Compiler Button */}
              <button
                onClick={handleCompileKeepsakeBook}
                disabled={isCompilingBook}
                className="bg-[#af893e] hover:bg-[#967432] text-white font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center space-x-2 shadow-lg shadow-amber-950/20"
              >
                <Sparkles className={`w-4 h-4 text-amber-200 ${isCompilingBook ? 'animate-spin' : ''}`} />
                <span>{isCompilingBook ? 'Compiling Volume...' : '⚡ Re-Compile Keepsake Volume'}</span>
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `All Entries (${tributes.length})` },
                { id: 'pending', label: `Pending Review (${tributes.filter(t => t.status === 'pending').length})` },
                { id: 'approved', label: `Approved for Book (${tributes.filter(t => t.status === 'approved').length})` },
                { id: 'featured', label: `Featured Tributes (${tributes.filter(t => t.status === 'featured').length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setModerationFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    moderationFilter === f.id
                      ? 'bg-[#991b1b] text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compiler Progress Modal / Banner */}
          {isCompilingBook && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-3xl p-6 shadow-lg space-y-3 animate-fadeIn">
              <div className="flex justify-between items-center text-xs font-bold text-neutral-800">
                <span className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#991b1b]" />
                  <span>Keepsake Presentation Compiler in Progress</span>
                </span>
                <span className="text-[#b45309] font-mono">{compileProgress}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#991b1b] to-[#af893e] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${compileProgress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-600 font-medium italic">{compileStepLabel}</p>
            </div>
          )}

          {/* Moderation Queue Cards */}
          <div className="space-y-4">
            {tributes
              .filter(t => moderationFilter === 'all' || t.status === moderationFilter)
              .map(tribute => {
                const pillarMeta = NARRATIVE_PILLARS[tribute.pillar] || NARRATIVE_PILLARS.joy;

                return (
                  <div
                    key={tribute.id}
                    className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-amber-300 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#b45309] flex items-center justify-center font-bold text-sm font-serif-title uppercase">
                          {tribute.contributorName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-neutral-900 flex items-center space-x-2">
                            <span>{tribute.contributorName}</span>
                            <span className="text-xs text-neutral-500 font-normal">({tribute.contributorRelation})</span>
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            Recorded: {tribute.recordedDate} • {tribute.contributorEmail || tribute.contributorPhone || 'Guest Submission'}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${pillarMeta.badgeBg}`}>
                          {pillarMeta.icon} {pillarMeta.label}
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          tribute.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tribute.status === 'featured'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : tribute.status === 'pending'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {tribute.status}
                        </span>
                      </div>
                    </div>

                    {/* Question & Transcript / Verse */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-neutral-800">
                        {tribute.promptQuestion}
                      </div>

                      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs text-neutral-700 leading-relaxed font-serif-body whitespace-pre-line">
                        {tribute.poeticStanzas && tribute.poeticStanzas.length > 0 
                          ? tribute.poeticStanzas.join('\n\n')
                          : tribute.rawTranscript}
                      </div>

                      {tribute.privateNoteToFamily && (
                        <div className="text-[11px] text-neutral-500 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 italic">
                          🔒 <strong>Private note to family:</strong> "{tribute.privateNoteToFamily}"
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
                      <div className="flex items-center space-x-2">
                        {/* Audio / Video Stream Preview Button */}
                        <button
                          onClick={() => setActivePlaybackTribute(tribute)}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5"
                        >
                          <Play className="w-3.5 h-3.5 text-[#af893e]" />
                          <span>Listen Memory ({tribute.audioDuration || '02:14'})</span>
                        </button>

                        {/* 1-Click AI Format Poem */}
                        <button
                          onClick={() => handleFormatSingleTributePoem(tribute.id)}
                          className="bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>✨ Format into Poetic Stanza</span>
                        </button>
                      </div>

                      {/* Approval Status Controls */}
                      <div className="flex items-center space-x-2">
                        {tribute.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateTributeStatus(tribute.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve for Book</span>
                          </button>
                        )}

                        {tribute.status !== 'featured' && (
                          <button
                            onClick={() => handleUpdateTributeStatus(tribute.id, 'featured')}
                            className="bg-[#af893e] hover:bg-[#967432] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Feature in Cover Spread</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleUpdateTributeStatus(tribute.id, 'archived')}
                          className="text-neutral-400 hover:text-red-600 text-xs font-semibold px-2 py-1"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: COMMUNITY OUTREACH & QR INVITATIONS                                */}
      {/* ========================================================================= */}
      {studioMode === 'invites' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Personalized Invite Dispatch Form */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#b45309] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif-title font-bold text-base text-neutral-900">
                    Dispatch Personalized Tribute Invite
                  </h4>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Send a private link directly to a friend's phone or email
                </p>
              </div>

              {/* Channel Selector */}
              <div className="flex bg-neutral-100 p-0.5 rounded-lg text-xs font-bold">
                {(['sms', 'email', 'whatsapp'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setShareChannel(ch)}
                    className={`px-2.5 py-1 rounded-md transition capitalize ${
                      shareChannel === ch
                        ? 'bg-[#991b1b] text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendFriendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Friend / Relative Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shareRecipientName}
                  onChange={(e) => setShareRecipientName(e.target.value)}
                  placeholder="e.g. Aunt Gloria, Pastor Williams, Dr. Hayes"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {shareChannel === 'sms' ? 'Mobile Phone Number (for SMS Link)' : shareChannel === 'email' ? 'Email Address' : 'WhatsApp Phone Number'} <span className="text-red-500">*</span>
                </label>
                <input
                  type={shareChannel === 'email' ? 'email' : 'tel'}
                  value={shareRecipientContact}
                  onChange={(e) => setShareRecipientContact(e.target.value)}
                  placeholder={shareChannel === 'email' ? 'name@example.com' : '(212) 555-0199'}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-neutral-700">
                    Personal Note & Memory Request
                  </label>
                  <span className="text-[10px] text-neutral-400">Quick Templates:</span>
                </div>

                {/* Quick Template Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    { label: 'General Friend', text: `Dear friend, we are gathering living voice memories, prayers, and reflections for ${activeCase.decedent.legalName}'s digital keepsake archive. Please tap the link to listen and record your own reflection:` },
                    { label: 'Church & Choir', text: `Dear Church Family, ${activeCase.decedent.legalName} always treasured our Sunday worship together. We would be deeply blessed if you could share a prayer or favorite memory on their digital tribute audio archive:` },
                    { label: 'Work Colleague', text: `Dear Colleague, ${activeCase.decedent.legalName}'s legacy in education and community leadership touched so many. Please record a short story or memory for our permanent family keepsake archive:` }
                  ].map(tmpl => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => setShareNote(tmpl.text)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-semibold px-2 py-1 rounded-md transition"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={shareNote}
                  onChange={(e) => setShareNote(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 outline-none focus:border-[#991b1b] resize-none"
                  placeholder="Type a custom message for this friend..."
                />
              </div>

              {/* Message Bubble Preview */}
              <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-3 text-[11px] space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  {shareChannel.toUpperCase()} Dispatch Preview:
                </span>
                <p className="text-neutral-800 italic">
                  "{shareNote || `We are gathering voice memories for ${activeCase.decedent.legalName}.`} https://e-bfh.com/tribute/{activeCase.caseNumber}"
                </p>
              </div>

              <button
                type="submit"
                disabled={isSendingInvite}
                className="w-full bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-md shadow-red-950/20"
              >
                {isSendingInvite ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                ) : (
                  <Send className="w-4 h-4 text-amber-300" />
                )}
                <span>{isSendingInvite ? 'Dispatching...' : `Dispatch Invite via ${shareChannel.toUpperCase()}`}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Invitation Activity & Status Tracker */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="space-y-1">
                <h4 className="font-serif-title font-bold text-base text-neutral-900">
                  Community Activity & Invitation Log ({invitations.length})
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Real-time delivery status, friend listening sessions, and new voice recordings
                </p>
              </div>

              <button
                onClick={() => setIsQRCardModalOpen(true)}
                className="bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>4-Up Print Cards</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {invitations.map(inv => (
                <div
                  key={inv.id}
                  className="bg-neutral-50/80 border border-neutral-200 rounded-2xl p-4 space-y-2 hover:border-amber-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700 uppercase font-serif-title">
                        {inv.recipientName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-neutral-900 block">
                          {inv.recipientName}
                        </strong>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {inv.channel.toUpperCase()}: {inv.recipientContact}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center space-x-2">
                      {inv.status === 'sent' && (
                        <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-sky-600" />
                          <span>Invite Sent</span>
                        </span>
                      )}
                      {inv.status === 'opened' && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-amber-600" />
                          <span>Opened • Listening</span>
                        </span>
                      )}
                      {inv.status === 'recorded' && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Voice Memory Recorded</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-600 bg-white p-2 rounded-xl border border-neutral-200/60 line-clamp-1 italic">
                    "{inv.personalNote}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-200/60 text-[11px]">
                    <span className="text-neutral-400 text-[10px]">Dispatched: {inv.sentAt}</span>

                    <div className="flex items-center space-x-1.5">
                      {inv.status !== 'recorded' && (
                        <button
                          onClick={() => handleSimulateInviteAction(inv.id, inv.status === 'sent' ? 'opened' : 'recorded')}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-[10px] px-2 py-1 rounded-lg transition"
                          title="Simulate recipient clicking link and recording memory"
                        >
                          {inv.status === 'sent' ? 'Simulate Link Opened' : 'Simulate Recorded Memory'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 5: CLOUD ARCHIVAL & 90-DAY PURGE RULES TELEMETRY                      */}
      {/* ========================================================================= */}
      {studioMode === 'cloud' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1 border-b border-neutral-200 pb-4">
              <div className="flex items-center space-x-2">
                <span className="bg-sky-100 text-sky-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                  PostgreSQL & Storage Archival Architecture
                </span>
              </div>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900">
                Permanent Master Archival & 90-Day Raw Storage Purge
              </h3>
              <p className="text-xs text-neutral-500">
                To guarantee permanent access while optimizing storage costs and family privacy, Digi-Tribute implements an automated 2-tier retention lifecycle.
              </p>
            </div>

            {/* Architecture Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Permanent Master Keepsake Tier */}
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#af893e] text-white flex items-center justify-center font-bold text-lg">
                    🔒
                  </div>
                  <div>
                    <h4 className="font-serif-title font-bold text-base text-neutral-900">
                      Permanent Master Archival Tier (`tributes-final`)
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Preserved Forever
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-neutral-700 leading-relaxed">
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>High-Res Printable Coffee Table PDF:</strong> Bound memorial document with typography and photo spreads.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Master Compiled Audio Reel:</strong> Seamlessly stitched prelude & service audio tracks.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Scan-to-Stream QR Endpoints:</strong> Lifetime mobile playback routing for family keepsakes.</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs font-mono text-neutral-800">
                  Storage Used: <strong>{storageTelemetry.permanentMasterUsedMB} MB</strong> ({storageTelemetry.permanentKeepsakeFilesCount} master assets)
                </div>
              </div>

              {/* Card 2: 90-Day Raw Footage Purge Policy */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 text-amber-300 flex items-center justify-center font-bold text-lg">
                    ⏳
                  </div>
                  <div>
                    <h4 className="font-serif-title font-bold text-base text-neutral-900">
                      90-Day Raw Purge Lifecycle (`tributes-raw`)
                    </h4>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                      Automated Cleanup
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-neutral-700 leading-relaxed">
                  <div className="flex items-start space-x-2">
                    <span className="text-[#b45309] font-bold">•</span>
                    <span><strong>Serverless Edge Function:</strong> <code>functions/purge-raw-footage</code> runs daily at 03:00 UTC.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-[#b45309] font-bold">•</span>
                    <span><strong>PostgreSQL pg_cron Trigger:</strong> Automatically flags unapproved test cuts & raw high-bitrate scratch files.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-[#b45309] font-bold">•</span>
                    <span><strong>Privacy Assurance:</strong> Raw scratch takes are permanently removed to protect family confidentiality.</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-800">
                  Raw Storage: <strong>{storageTelemetry.rawStorageUsedMB} MB</strong> / {storageTelemetry.rawStorageLimitMB} MB ({storageTelemetry.retentionDaysRemaining} days remaining in current cycle)
                </div>
              </div>

            </div>

            {/* Storage Meter & RLS Security Status */}
            <div className="bg-neutral-900 text-white rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Row-Level Security (RLS) & Storage Quota Health</span>
                </span>
                <span className="text-amber-400 font-mono">
                  {storageTelemetry.rlsPoliciesActive} Active Policies • Operational
                </span>
              </div>

              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(storageTelemetry.rawStorageUsedMB / storageTelemetry.rawStorageLimitMB) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Last Daily Purge: {storageTelemetry.lastDailyPurgeTimestamp}</span>
                <span>Next Scheduled Cycle: {storageTelemetry.nextScheduledPurgeTimestamp}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE SCAN-TO-STREAM AUDIO / VIDEO PLAYER MODAL             */}
      {/* ========================================================================= */}
      {activePlaybackTribute && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative">
            
            <button
              onClick={() => {
                setActivePlaybackTribute(null);
                setIsPlayingAudio(false);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#991b1b] to-[#b45309] text-white flex items-center justify-center font-serif-title font-bold text-xl mx-auto shadow-md border-2 border-amber-300">
              BFH
            </div>

            <div className="space-y-1">
              <span className="bg-amber-100 text-[#b45309] text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full">
                🕊️ Living Memorial Audio Stream
              </span>
              <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                {activePlaybackTribute.contributorName}
              </h3>
              <div className="text-xs text-neutral-500 italic">
                {activePlaybackTribute.contributorRelation} • {activePlaybackTribute.recordedDate}
              </div>
            </div>

            {/* Prompt */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs font-semibold text-neutral-800 leading-relaxed">
              {activePlaybackTribute.promptQuestion}
            </div>

            {/* Black Audio Canvas */}
            <div className="bg-[#181614] rounded-2xl p-5 text-white shadow-inner space-y-3">
              <div className="flex justify-between items-center text-xs text-amber-400 font-mono">
                <span className="flex items-center space-x-1">
                  <Radio className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-red-500 animate-pulse' : ''}`} />
                  <span>{isPlayingAudio ? 'NOW STREAMING' : 'READY TO PLAY'}</span>
                </span>
                <span>{activePlaybackTribute.audioDuration || '02:14'}</span>
              </div>

              {/* Animated Waveform Bars */}
              <div className="flex items-center justify-center gap-1.5 h-14 my-2">
                {(activePlaybackTribute.audioWaveData || [20, 35, 50, 28, 54, 40, 22, 46, 18, 32, 44, 30, 52, 38]).map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 bg-[#af893e] rounded-full transition-all duration-300 ${
                      isPlayingAudio ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: isPlayingAudio ? `${Math.max(10, (h * ((idx % 3) + 1) * 0.7) % 48)}px` : `${h}px`,
                      animationDelay: `${idx * 0.1}s`
                    }}
                  />
                ))}
              </div>

              {/* Play / Pause Circular Button */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-14 h-14 rounded-full bg-[#af893e] hover:bg-[#c59e4b] text-white flex items-center justify-center text-xl mx-auto shadow-lg shadow-amber-950/40 transition transform active:scale-95"
              >
                {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
            </div>

            {/* Transcript Snippet */}
            <p className="font-serif-body text-xs text-neutral-600 italic bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-left line-clamp-3">
              "{activePlaybackTribute.rawTranscript || activePlaybackTribute.promptQuestion}"
            </p>

            <button
              onClick={() => {
                setActivePlaybackTribute(null);
                setIsPlayingAudio(false);
              }}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-2.5 rounded-xl transition"
            >
              Close Stream
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE 4-UP QR SERVICE CARDS MODAL                            */}
      {/* ========================================================================= */}
      {isQRCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="space-y-1">
                <h3 className="font-serif-title text-xl font-bold text-neutral-900">
                  Printable 4-Up Tribute QR Cards for Service
                </h3>
                <p className="text-xs text-neutral-500">
                  Ready to print and place in chapel vestibules, service programs, and memorial envelopes.
                </p>
              </div>

              <button
                onClick={() => setIsQRCardModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Up Printable Grid */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-white border-2 border-[#af893e] rounded-2xl p-4 text-center space-y-2 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#991b1b] to-[#b45309] text-white flex items-center justify-center font-serif-title font-bold text-xs mx-auto">
                    BFH
                  </div>
                  <div className="font-serif-title text-xs font-bold text-neutral-900 leading-tight">
                    In Memory of {activeCase.decedent.legalName}
                  </div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://e-bfh.com/tribute/${activeCase.caseNumber}`}
                    alt="Tribute QR"
                    className="w-20 h-20 mx-auto rounded-lg border border-neutral-200"
                  />
                  <div className="text-[9px] text-[#b45309] font-bold uppercase tracking-wider">
                    Scan to Listen & Share Memory
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsQRCardModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Print 4-Up Sheet (Letter / A4)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
