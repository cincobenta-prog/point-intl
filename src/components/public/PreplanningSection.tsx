import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Shield, Heart, FileText, ArrowRight, MessageSquare, ListChecks } from 'lucide-react';

interface PreplanningSectionProps {
  onOpenArranger: () => void;
}

export const PreplanningSection: React.FC<PreplanningSectionProps> = ({ onOpenArranger }) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'checklist' | 'talk'>('benefits');

  return (
    <section id="preplan" className="py-20 bg-white border-b border-red-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs text-[#991b1b] font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Peace of Mind for Tomorrow</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-neutral-900">
            Pre-Planning & Advance Life Decisions
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
            Planning your arrangements in advance is one of the most thoughtful gifts you can give to your loved ones. It ensures your exact wishes are recorded and protects against future inflation.
          </p>

          {/* Sub Navigation */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'benefits'
                  ? 'bg-[#991b1b] text-white shadow-md border border-amber-300/40'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Why Plan Ahead</span>
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'checklist'
                  ? 'bg-[#991b1b] text-white shadow-md border border-amber-300/40'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Preplanning Checklist</span>
            </button>
            <button
              onClick={() => setActiveTab('talk')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'talk'
                  ? 'bg-[#991b1b] text-white shadow-md border border-amber-300/40'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Having "The Talk"</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Benefits */}
        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#fafafa] p-6 rounded-2xl border border-neutral-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#991b1b] flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                Relieve Emotional Burden
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                When a death occurs, grieving family members are faced with over 70 critical decisions in the first 24 hours. Preplanning provides your loved ones with a clear roadmap so they can focus on supporting one another.
              </p>
            </div>

            <div className="bg-[#fafafa] p-6 rounded-2xl border border-neutral-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b45309] flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                Financial Protection & FDIC Trusts
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                By pre-funding through the New York State Pre-Plan Trust (NYS GBL § 453), your funds remain 100% FDIC insured in interest-bearing accounts. Irrevocable trusts also protect assets during Medicaid qualification.
              </p>
            </div>

            <div className="bg-[#fafafa] p-6 rounded-2xl border border-neutral-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-neutral-900">
                Your Exact Personal Wishes
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                From your choice of music, sacred scriptures, and eulogists to your preferred disposition (burial or cremation), casket style, and reception details—your celebration reflects your authentic life story.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Checklist */}
        {activeTab === 'checklist' && (
          <div className="bg-[#fafafa] p-8 rounded-3xl border border-neutral-200 max-w-4xl mx-auto space-y-6">
            <h3 className="font-serif-title text-xl font-bold text-neutral-900 text-center">
              Essential Preplanning Information & Document Checklist
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-700">
              <div className="space-y-2.5">
                <h4 className="font-bold text-[#991b1b] uppercase tracking-wider text-[11px]">Vital Statistics</h4>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#991b1b]" /> Full legal name & Social Security Number</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#991b1b]" /> Date & Place of Birth</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#991b1b]" /> Father's legal name & Mother's maiden name</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#991b1b]" /> Highest level of education & Occupation</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#991b1b]" /> Military Service record (Form DD-214)</p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-[#b45309] uppercase tracking-wider text-[11px]">Ceremony & Service Details</h4>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#b45309]" /> Choice of Burial or Cremation</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#b45309]" /> Chapel vs. Church Ceremony venue</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#b45309]" /> Favorite hymns, music selections & scripture</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#b45309]" /> Pallbearers & honorary pallbearers</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#b45309]" /> Preferred cemetery lot / deed information</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: The Talk */}
        {activeTab === 'talk' && (
          <div className="bg-[#fafafa] p-8 rounded-3xl border border-neutral-200 max-w-4xl mx-auto space-y-6">
            <h3 className="font-serif-title text-xl font-bold text-neutral-900 text-center">
              Having "The Talk" with Your Family
            </h3>
            <p className="text-xs text-neutral-600 font-light text-center max-w-2xl mx-auto leading-relaxed">
              Starting a conversation about end-of-life decisions can feel sensitive, but it is one of the most loving conversations a family can share. Here are gentle ways to open the dialogue:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-2">
                <span className="font-bold text-[#991b1b] block">1. Choose a Relaxed Setting</span>
                <p className="text-neutral-600 font-light leading-relaxed">
                  Bring up the subject during a calm, casual moment at home rather than during a medical crisis.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-2">
                <span className="font-bold text-[#b45309] block">2. Share Personal Values</span>
                <p className="text-neutral-600 font-light leading-relaxed">
                  Focus on how you want your life to be remembered, honored, and celebrated by family and friends.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-2">
                <span className="font-bold text-emerald-700 block">3. Record and File</span>
                <p className="text-neutral-600 font-light leading-relaxed">
                  Document selections in writing with Benta’s so your preferences are securely archived and easily accessible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action Bar */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenArranger}
            className="bg-gradient-to-r from-[#991b1b] to-[#b91c1c] hover:from-[#7f1d1d] hover:to-[#991b1b] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg transition flex items-center space-x-2 mx-auto border border-amber-300/40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Begin Pre-Arrangement Online Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
