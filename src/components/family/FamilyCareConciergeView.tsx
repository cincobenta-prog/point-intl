import React, { useState, useRef, useEffect } from 'react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { generateAIConciergeResponse } from '../../lib/services/aiGatewayService';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  Clock,
  User,
  Bot,
  RefreshCw,
  Phone
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  citation?: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

interface FamilyCareConciergeViewProps {
  activeCase: GoldenRecordCase;
  onBackToWelcome?: () => void;
  onNavigateTab?: (tab: 'obituary' | 'tribute' | 'arrangements' | 'documents' | 'photos') => void;
}

const PRESET_TOPICS = [
  'What is the scheduled time and venue for the Homegoing service?',
  'How do NYC HRA burial assistance and VA veterans benefits work?',
  'What is the status of our certified death certificates (EDRS)?',
  'How do family members and out-of-town guests access the live webcast?',
  'Can I speak directly with Director Jason Benta?'
];

export const FamilyCareConciergeView: React.FC<FamilyCareConciergeViewProps> = ({
  activeCase,
  onBackToWelcome,
  onNavigateTab: _onNavigateTab
}) => {
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const initialGreeting: ChatMessage = {
    id: 'msg-init',
    sender: 'bot',
    text: `Hello ${activeCase.informant.fullName || 'Family'}, I am your **Benta 24/7 Family Care Concierge** for **${activeCase.decedent.legalName}** (Case #${activeCase.caseNumber}).

I am here day and night to answer any questions about service arrangements, scheduled viewings, certified death certificates, financial programs (such as NYC HRA or VA Benefits), or to connect you directly with **Director Jason Benta, LFD**.

How may I assist you right now?`,
    citation: "Benta's Funeral Home 24/7 Family Care Desk • Harlem, NYC",
    timestamp: 'Just now',
    suggestedPrompts: [
      'Homegoing Service Details',
      'Death Certificate / EDRS Status',
      'NYC HRA & Veteran Benefits',
      'Webcast Access for Family'
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setUserInput('');
    setIsTyping(true);

    try {
      const botResponse = await generateAIConciergeResponse(text, activeCase);
      const responseText = typeof botResponse === 'string' ? botResponse : botResponse?.text || 'Director Jason Benta and our family care staff are available to assist you at (212) 281-8850.';
      const citationText = typeof botResponse === 'object' && botResponse?.citation ? botResponse.citation : `Benta's Funeral Home • Harlem Care Desk (Case #${activeCase.caseNumber})`;
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        citation: citationText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Concierge response error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Thank you for your message. Director Jason Benta and our family care staff have been alerted and are available at (212) 281-8850. For immediate assistance with the service for **${activeCase.decedent.legalName}**, our team is on call 24 hours a day.`,
        citation: "Benta's Funeral Home Emergency Line • 630 St. Nicholas Ave",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <div className="space-y-6">
      {/* Universal Navigation Button Back to Welcome Page */}
      <div className="flex items-center justify-between">
        {onBackToWelcome && (
          <button
            onClick={onBackToWelcome}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xl font-bold text-xs transition border border-neutral-300 shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 text-[#991b1b] group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Welcome Page</span>
          </button>
        )}
        <div className="flex items-center space-x-2 text-xs text-neutral-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Case #{activeCase.caseNumber} • 24/7 Dedicated Care Desk</span>
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[750px]">
        {/* Header Bar */}
        <div className="bg-[#1a1815] text-white p-5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#991b1b] to-red-950 flex items-center justify-center text-amber-300 shadow-md border border-amber-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-title text-lg font-bold text-white tracking-wide">
                  24/7 Family Care Concierge
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Online
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Dedicated care assistant & licensed directors for the family of <strong className="text-amber-200">{activeCase.decedent.legalName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="tel:2122818850"
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 border border-neutral-700"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>(212) 281-8850</span>
            </a>
            <button
              onClick={handleResetChat}
              title="Reset Conversation"
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition border border-transparent hover:border-neutral-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 overflow-x-auto flex items-center space-x-2 text-xs">
          <span className="text-[11px] font-bold text-neutral-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Suggested Topics:
          </span>
          {PRESET_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(topic)}
              className="whitespace-nowrap px-3 py-1 bg-white hover:bg-red-50 hover:text-[#991b1b] hover:border-red-200 text-neutral-700 font-medium rounded-full border border-neutral-200 shadow-2xs transition text-xs cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Message History Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-neutral-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-[#991b1b] text-white shadow-xs'
                    : 'bg-gradient-to-br from-[#1a1815] to-[#2c2824] text-amber-300 border border-amber-500/30 shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl space-y-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#991b1b] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-neutral-800 rounded-tl-xs border border-neutral-200 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">
                    {msg.text.split('\n').map((line, i) => {
                      // Basic markdown bold handler
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                          {parts.map((part, pIdx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={pIdx} className={msg.sender === 'user' ? 'font-bold underline decoration-amber-300' : 'font-bold text-neutral-900'}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {msg.citation && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-200/80 flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {msg.citation}
                      </span>
                    </div>
                  )}

                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-200 flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-medium transition cursor-pointer"
                        >
                          💬 {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 px-1">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-tl-xs shadow-xs space-y-1">
                <div className="flex items-center space-x-2 text-neutral-500 text-xs font-medium">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#991b1b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#991b1b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#991b1b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Benta Care Concierge is preparing guidance...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-neutral-200">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about the service, certificates, VA benefits, or message Director Jason Benta..."
              className="flex-1 border border-neutral-300 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#991b1b] focus:border-transparent bg-neutral-50 placeholder-neutral-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim() || isTyping}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-md ${
                userInput.trim() && !isTyping
                  ? 'bg-[#991b1b] hover:bg-red-800 text-white shadow-red-950/20'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>Send Message</span>
              <Send className="w-4 h-4 text-amber-300" />
            </button>
          </div>
          <div className="mt-2 text-center text-[11px] text-neutral-400 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confidential Family Communication Channel • Benta's Funeral Home, Inc. (Est. 1928)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
