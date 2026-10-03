import React, { useState } from 'react';
import { Heart, Sparkles, ChevronDown, ChevronUp, Phone } from 'lucide-react';

export const GriefHealingSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const griefTopics = [
    {
      title: 'The Four Tasks of Mourning',
      excerpt: 'Psychologist J. William Worden’s foundational roadmap for navigating grief.',
      content: '1. Accept the reality of the loss.\n2. Fully experience the changing "pains" of grief without self-judgment.\n3. Adjust to an environment in which the deceased is missing.\n4. Find an enduring connection with the deceased while embarking on a new life.'
    },
    {
      title: 'Grief & Resilience: What is Resilience?',
      excerpt: 'According to the American Psychological Association, resilience is the capacity to adapt well over time.',
      content: 'As Friedrich Nietzsche famously observed: "That which does not kill us makes us stronger." Resilience is not about avoiding sorrow or pretending the pain does not exist; rather, it is about learning daily coping practices, staying connected to family and community, and allowing time to restore balance.'
    },
    {
      title: 'Physical Symptoms of Grief & Managing the Effects',
      excerpt: 'Grief is not solely emotional—it profoundly affects the physical body.',
      content: 'Common physical reactions include overwhelming fatigue, disrupted sleep cycles, chest tightness, changes in appetite, forgetfulness, and lowered immunity. Hydration, gentle walks in Marcus Garvey or St. Nicholas Park, balanced nutrition, and patient self-care are essential first steps.'
    },
    {
      title: 'Healing a Broken Heart & Community Care (Meal Train)',
      excerpt: 'Practical assistance and community care for grieving families.',
      content: 'Whether organizing home-delivered meals for family members via Meal Train, scheduling airport pickups for traveling relatives, or organizing neighborhood prayer vigils, Benta’s works closely with Harlem churches and civic groups to ensure families are embraced by community love.'
    }
  ];

  return (
    <section id="grief" className="py-20 bg-[#fafafa] border-b border-red-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs text-[#991b1b] font-bold tracking-wide uppercase">
            <Heart className="w-3.5 h-3.5 text-[#991b1b]" />
            <span>Compassionate Aftercare & Healing</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-neutral-900">
            Grief, Healing & Family Resilience
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
            Navigating loss is one of life’s deepest journeys. We provide continuous resources, affirmations, and practical community support to sustain you and your family.
          </p>
        </div>

        {/* 2-Column Content: Left Quotes / Helpline & Right Expandable Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Anne Lamott Quote Box */}
            <div className="bg-white p-7 rounded-2xl border border-red-200/80 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-red-50 rounded-bl-full pointer-events-none" />
              <Sparkles className="w-6 h-6 text-[#b45309] mb-3" />
              <blockquote className="text-sm text-neutral-700 italic leading-relaxed font-light">
                "You will lose someone you can’t live without, and your heart will be badly broken, and the bad news is that you never completely get over the loss of your beloved. But this is also the good news. They live forever in your broken heart that doesn’t seal back up. And you come through. It’s like having a broken leg that never heals perfectly... but you learn to dance with a limp."
              </blockquote>
              <p className="text-xs text-[#991b1b] font-bold mt-4 text-right uppercase tracking-wider">
                — Anne Lamott
              </p>
            </div>

            {/* Community Meal Train Banner */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center space-x-4">
              <img
                src="/images/ebfh/Meal_train_logo.png"
                alt="Meal Train Community Support"
                className="w-12 h-12 object-contain rounded-lg p-1 bg-[#faf7f2] border border-[#e6dac1]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="space-y-0.5">
                <h4 className="font-serif-title font-bold text-xs text-neutral-900">
                  Community Meal Train Support
                </h4>
                <p className="text-[11px] text-neutral-600 font-light">
                  Coordinate home meals and physical support for grieving relatives with ease.
                </p>
              </div>
            </div>

            {/* 24/7 Helpline Card: Crimson Red Background */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#991b1b] text-white border border-amber-300/40 flex items-center justify-between shadow-lg shadow-red-950/20">
              <div className="space-y-1">
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Need to speak with someone?</span>
                <p className="text-base font-bold text-white">Benta’s 24/7 Careline</p>
                <p className="text-xs text-red-100 font-light">We are always here to listen and assist.</p>
              </div>
              <a
                href="tel:+12122818850"
                className="bg-white hover:bg-amber-100 text-[#991b1b] font-bold p-3.5 rounded-full shadow-md transition transform active:scale-95 cursor-pointer"
                aria-label="Call 24/7 Careline"
              >
                <Phone className="w-5 h-5 text-[#991b1b]" />
              </a>
            </div>
          </div>

          {/* Right Column: Accordion Topics */}
          <div className="lg:col-span-7 space-y-4">
            {griefTopics.map((topic, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50 transition cursor-pointer"
                  >
                    <div>
                      <h3 className="font-serif-title text-base sm:text-lg font-bold text-neutral-900">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 font-light">
                        {topic.excerpt}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-full bg-neutral-100 text-[#991b1b] shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 font-light whitespace-pre-line">
                      {topic.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

