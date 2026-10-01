import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Mic, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Send, 
  Copy, 
  Server, 
  AlertCircle,
  Volume2
} from 'lucide-react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { 
  getAIGatewayConfig, 
  saveAIGatewayConfig, 
  testAIConnection, 
  generateAIConciergeResponse,
  generate9PartObituary,
  SAMPLE_VOICE_TRANSCRIPTS,
  AIGatewayConfig,
  VoiceTranscriptionResult,
  DEFAULT_AI_PERSONA
} from '../../lib/services/aiGatewayService';

interface AIGatewaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase?: GoldenRecordCase;
  cases?: GoldenRecordCase[];
}

export const AIGatewaySettingsModal: React.FC<AIGatewaySettingsModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  cases = []
}) => {
  if (!isOpen) return null;

  const currentCase = activeCase || cases[0] || ({
    id: 'case-demo',
    caseNumber: 'BFH-2026-0891',
    currentPhase: 'arrangements',
    decedent: {
      legalName: 'Evelyn Marie Jenkins',
      dateOfBirth: '1944-05-12',
      dateOfDeath: '2026-09-28',
      placeOfDeath: 'Mount Sinai Hospital, Manhattan',
      veteran: false
    },
    informant: {
      fullName: 'Clarissa Jenkins',
      relationship: 'Daughter',
      phone: '(212) 555-0198',
      email: 'clarissa.jenkins@harlemfamily.org'
    },
    serviceSelections: {
      packageTitle: 'Harlem Historic Church Celebration & Earth Burial',
      serviceVenueName: 'Abyssinian Baptist Church, Harlem',
      serviceDate: '2026-10-04'
    }
  } as unknown as GoldenRecordCase);

  const [activeTab, setActiveTab] = useState<'concierge' | 'obituary' | 'whisper' | 'settings'>('concierge');
  const [config, setConfig] = useState<AIGatewayConfig>(() => getAIGatewayConfig());
  
  // Settings Form
  const [openaiKeyInput, setOpenaiKeyInput] = useState(config.openaiApiKey || '');
  const [geminiKeyInput, setGeminiKeyInput] = useState(config.geminiApiKey || '');
  const [anthropicKeyInput, setAnthropicKeyInput] = useState(config.anthropicApiKey || '');
  const [modelChoice, setModelChoice] = useState(config.model || 'gpt-4o');
  const [temperatureVal, setTemperatureVal] = useState(config.temperature || 0.7);
  const [personaText, setPersonaText] = useState(config.systemPersona || DEFAULT_AI_PERSONA);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; model?: string; provider?: string } | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Concierge Interactive Chat Tester
  const [testPrompt, setTestPrompt] = useState('Does our family qualify for NYC HRA burial assistance or VA military honors?');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string; citation?: string }>>([
    {
      sender: 'ai',
      text: `Hello, I am your 24/7 Benta Family Care Concierge for **${currentCase.decedent.legalName}** (Case #${currentCase.caseNumber}). How may I gently assist you with arrangements, NYS laws, or benefits?`,
      citation: "Benta's Funeral Home Care Desk • Est. 1928"
    }
  ]);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);

  // 9-Part Obituary Generator State
  const [obituaryStyle, setObituaryStyle] = useState<'traditional_faith' | 'celebration_of_life' | 'contemporary_poetic' | 'civic_leader'>('traditional_faith');
  const [includeScripture, setIncludeScripture] = useState(true);
  const [generatedObituary, setGeneratedObituary] = useState<string | null>(null);
  const [isGeneratingObit, setIsGeneratingObit] = useState(false);
  const [copiedObitToast, setCopiedObitToast] = useState(false);

  // Whisper Audio Transcripts State
  const [voiceTranscripts] = useState<VoiceTranscriptionResult[]>(SAMPLE_VOICE_TRANSCRIPTS);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('voice-01');

  const handleSendChatTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testPrompt.trim()) return;

    const query = testPrompt.trim();
    setTestPrompt('');
    setChatLog(prev => [...prev, { sender: 'user', text: query }]);
    setIsGeneratingChat(true);

    const response = await generateAIConciergeResponse(query, currentCase);
    setIsGeneratingChat(false);
    setChatLog(prev => [...prev, { sender: 'ai', text: response.text, citation: response.citation }]);
  };

  const handleGenerateObituary = async () => {
    setIsGeneratingObit(true);
    const obit = await generate9PartObituary({
      caseItem: currentCase,
      style: obituaryStyle,
      includeScripture
    });
    setIsGeneratingObit(false);
    setGeneratedObituary(obit.fullText);
  };

  const handleCopyObituary = () => {
    if (!generatedObituary) return;
    navigator.clipboard.writeText(generatedObituary);
    setCopiedObitToast(true);
    setTimeout(() => setCopiedObitToast(false), 3000);
  };

  const handleTestAI = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testAIConnection({
      ...config,
      openaiApiKey: openaiKeyInput.trim(),
      geminiApiKey: geminiKeyInput.trim(),
      anthropicApiKey: anthropicKeyInput.trim(),
      model: modelChoice,
      temperature: temperatureVal,
      systemPersona: personaText.trim()
    });
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AIGatewayConfig = {
      ...config,
      openaiApiKey: openaiKeyInput.trim(),
      geminiApiKey: geminiKeyInput.trim(),
      anthropicApiKey: anthropicKeyInput.trim(),
      model: modelChoice,
      temperature: temperatureVal,
      systemPersona: personaText.trim(),
      isLiveActive: Boolean(openaiKeyInput.trim() || geminiKeyInput.trim() || anthropicKeyInput.trim())
    };
    saveAIGatewayConfig(updated);
    setConfig(updated);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3500);
  };

  const activeVoice = voiceTranscripts.find(v => v.id === selectedVoiceId) || voiceTranscripts[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans animate-fadeIn">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold shadow-inner">
              <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                  AI Family Care Concierge &amp; Whisper Audio Hub
                </h3>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold rounded-full">
                  GPT-4o &amp; WHISPER READY
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                24/7 Family Guidance • 9-Part Obituary Generator • Voice Memory Archiving
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition cursor-pointer"
            title="Close AI Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 sm:px-6 pt-2 shrink-0 gap-1 overflow-x-auto">
          {[
            { id: 'concierge', label: '24/7 AI Concierge 🤖', icon: Bot },
            { id: 'obituary', label: '9-Part Obituary AI 📜', icon: FileText },
            { id: 'whisper', label: 'Whisper Voice Archive 🎙️', icon: Mic },
            { id: 'settings', label: 'AI Keys & Persona ⚙️', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition flex items-center space-x-2 cursor-pointer border-t border-x ${
                  isActive
                    ? 'bg-white text-indigo-950 border-neutral-200 border-b-transparent shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-700' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50/50 space-y-4">
          
          {/* TAB 1: 24/7 AI Family Care Concierge */}
          {activeTab === 'concierge' && (
            <div className="space-y-4">
              
              <div className="p-3.5 bg-gradient-to-r from-indigo-950 to-neutral-900 text-white rounded-2xl border border-indigo-800/60 flex items-center justify-between shadow-md">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
                    <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-200">
                      Active Case Context: {currentCase.decedent.legalName} ({currentCase.caseNumber})
                    </h5>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    Next-of-Kin: <strong>{currentCase.informant.fullName}</strong> ({currentCase.informant.relationship}) • Service: <strong>{currentCase.serviceSelections.packageTitle}</strong>
                  </p>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                  ● HARLEM PERSONA ACTIVE
                </span>
              </div>

              {/* Chat Window */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col h-[340px]">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {chatLog.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl max-w-[85%] space-y-1 ${
                        msg.sender === 'user'
                          ? 'bg-[#991b1b] text-white rounded-br-none'
                          : 'bg-indigo-50/80 border border-indigo-100 text-neutral-900 rounded-bl-none'
                      }`}>
                        <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                        {msg.citation && (
                          <div className="text-[10px] text-indigo-800/80 font-mono pt-1 border-t border-indigo-200/50">
                            {msg.citation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isGeneratingChat && (
                    <div className="flex items-center space-x-2 text-neutral-500 text-xs italic bg-neutral-100 p-2.5 rounded-2xl w-fit">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Concierge is drafting a gentle answer...</span>
                    </div>
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100">
                  <span className="text-[10px] font-bold text-neutral-400 self-center">Try:</span>
                  {[
                    'Veteran VA burial honors',
                    'NYC HRA burial assistance ($1,700)',
                    'NYS PHL § 4201 Right of Disposition',
                    'Woodlawn crematory timing'
                  ].map((promptText, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTestPrompt(promptText);
                      }}
                      className="text-[10px] bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-900 text-neutral-700 font-medium px-2.5 py-1 rounded-lg border border-neutral-200 transition cursor-pointer"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChatTest} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Ask the AI Concierge about funeral traditions, costs, or NYS law..."
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingChat || !testPrompt.trim()}
                    className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: Automated 9-Part Obituary AI */}
          {activeTab === 'obituary' && (
            <div className="space-y-4">
              
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-700" />
                    <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                      9-Part Biographical Obituary Generator
                    </h5>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Case: {currentCase.decedent.legalName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Tone &amp; Literary Style</label>
                    <select
                      value={obituaryStyle}
                      onChange={(e) => setObituaryStyle(e.target.value as any)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs text-neutral-900"
                    >
                      <option value="traditional_faith">Traditional Faith &amp; Grace</option>
                      <option value="celebration_of_life">Celebration of Life &amp; Joy</option>
                      <option value="contemporary_poetic">Contemporary Poetic Remembrance</option>
                      <option value="civic_leader">Harlem Civic &amp; Community Leader</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Scripture &amp; Eulogy Quotes</label>
                    <div className="flex items-center space-x-2 pt-1.5">
                      <input
                        type="checkbox"
                        id="includeScriptureCheck"
                        checked={includeScripture}
                        onChange={(e) => setIncludeScripture(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="includeScriptureCheck" className="text-neutral-700 text-xs font-medium cursor-pointer">
                        Include Sacred Scripture (2 Tim 4:7)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleGenerateObituary}
                      disabled={isGeneratingObit}
                      className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingObit ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingObit ? 'Writing 9-Part Draft...' : 'Generate Full Obituary'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {copiedObitToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 rounded-xl flex items-center space-x-2 font-bold text-xs animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Obituary copied to clipboard! Ready to paste into funeral program.</span>
                </div>
              )}

              {/* Output Preview */}
              {generatedObituary && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <span className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                      Generated Publication-Ready Text
                    </span>
                    <button
                      onClick={handleCopyObituary}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Copy Text</span>
                    </button>
                  </div>

                  <div className="bg-[#fcfbf9] border border-neutral-200 p-4 rounded-xl text-neutral-900 text-xs font-serif leading-relaxed whitespace-pre-line space-y-2">
                    {generatedObituary}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Whisper Voice Archive & Memory Transcription */}
          {activeTab === 'whisper' && (
            <div className="space-y-4">
              
              <div className="p-3.5 bg-gradient-to-r from-neutral-900 to-indigo-950 text-white rounded-2xl border border-indigo-800/60 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">Living Voice Remembrance Archive</h5>
                    <p className="text-[11px] text-neutral-300">
                      OpenAI Whisper converts spoken family voice memories into searchable text &amp; program quotes.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-bold">
                  WHISPER-V3 NEURAL ENGINE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Voice Clips List */}
                <div className="space-y-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-neutral-600 block">
                    Recorded Audio Memories ({voiceTranscripts.length})
                  </span>
                  {voiceTranscripts.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoiceId(v.id)}
                      className={`w-full text-left p-3 rounded-xl border transition cursor-pointer space-y-1 block ${
                        selectedVoiceId === v.id
                          ? 'bg-indigo-50 border-indigo-400 shadow-2xs'
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900 truncate">{v.speakerName}</span>
                        <span className="text-[10px] font-mono text-indigo-700 font-bold">{v.audioDuration}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate">{v.rawTranscript}</p>
                    </button>
                  ))}
                </div>

                {/* Selected Transcript Detail */}
                <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <div>
                      <h6 className="font-bold text-xs text-neutral-900">{activeVoice.speakerName}</h6>
                      <p className="text-[10px] text-neutral-500 font-mono">Case #{activeVoice.caseNumber} • {activeVoice.timestamp}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                      Confidence: {(activeVoice.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Raw Whisper Transcript:</span>
                    <div className="bg-neutral-50 p-3 rounded-xl text-xs text-neutral-800 leading-relaxed font-sans border border-neutral-100">
                      "{activeVoice.rawTranscript}"
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Key Highlighted Memory Quotes:</span>
                    <div className="space-y-1">
                      {activeVoice.keyQuotes.map((q, idx) => (
                        <div key={idx} className="p-2 bg-indigo-50/60 rounded-lg text-[11px] text-indigo-950 font-serif italic border border-indigo-100">
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Suggested Program Paragraph:</span>
                    <p className="text-xs text-neutral-700 bg-[#faf8f5] p-3 rounded-xl border border-neutral-200 font-serif">
                      {activeVoice.suggestedObituaryParagraph}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: AI Keys & Model Tuning */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              
              <div className="p-3.5 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl border border-neutral-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">AI Provider Keys &amp; Model Orchestration</h5>
                    <p className="text-[11px] text-neutral-400">
                      Configure OpenAI, Google Gemini, or Anthropic API Keys for live streaming intelligence.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                  {config.isLiveActive ? '● LIVE KEYS ACTIVE' : '○ BUILT-IN HARLEM MODEL'}
                </span>
              </div>

              {saveSuccessToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 rounded-xl flex items-center justify-between font-bold text-xs animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI configuration saved to .env.local successfully!</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Saved</span>
                </div>
              )}

              {/* Key Form */}
              <form onSubmit={handleSaveSettings} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      1. OpenAI API Key (starts with sk-)
                    </label>
                    <input
                      type="password"
                      value={openaiKeyInput}
                      onChange={(e) => setOpenaiKeyInput(e.target.value)}
                      placeholder="e.g. sk-proj-..."
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:border-indigo-600 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      2. Preferred Model
                    </label>
                    <select
                      value={modelChoice}
                      onChange={(e) => setModelChoice(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:border-indigo-600 outline-none shadow-xs"
                    >
                      <option value="gpt-4o">OpenAI GPT-4o (State of the Art)</option>
                      <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Fast &amp; Cost-Effective)</option>
                      <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Multimodal)</option>
                      <option value="claude-3-5-sonnet-20241022">Anthropic Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      3. Google Gemini API Key (Optional)
                    </label>
                    <input
                      type="password"
                      value={geminiKeyInput}
                      onChange={(e) => setGeminiKeyInput(e.target.value)}
                      placeholder="e.g. AIzaSy..."
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:border-indigo-600 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      4. Anthropic Claude API Key (Optional)
                    </label>
                    <input
                      type="password"
                      value={anthropicKeyInput}
                      onChange={(e) => setAnthropicKeyInput(e.target.value)}
                      placeholder="e.g. sk-ant-..."
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:border-indigo-600 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">
                      5. Model Creativity (Temperature: {temperatureVal})
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={temperatureVal}
                      onChange={(e) => setTemperatureVal(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-neutral-700 font-bold mb-1">
                      6. Persona System Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={personaText}
                      onChange={(e) => setPersonaText(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:border-indigo-600 outline-none shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={handleTestAI}
                    disabled={isTesting}
                    className="bg-neutral-900 hover:bg-neutral-800 text-indigo-300 font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition border border-indigo-400/30 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Authenticating...' : 'Test AI Gateway'}</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                    <span>Save AI Gateway Configuration</span>
                  </button>
                </div>
              </form>

              {/* Test Diagnostic Output */}
              {testResult && (
                <div className={`p-4 rounded-2xl border ${
                  testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
                } space-y-2 animate-fadeIn`}>
                  <div className="flex items-center space-x-2 font-bold text-xs">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span>{testResult.message}</span>
                    {testResult.latencyMs && (
                      <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                        {testResult.latencyMs} ms
                      </span>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-3.5 bg-neutral-100 border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs text-neutral-600 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>AI Provider: <strong>{config.model.toUpperCase()} ({config.provider})</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close AI Hub
          </button>
        </div>

      </div>
    </div>
  );
};
