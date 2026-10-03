import React, { useState } from 'react';
import { HelpCircle, Phone, MapPin, Clock, Send, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export const PublicFAQsContact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqs = [
    {
      q: 'What should I do immediately when a death occurs?',
      a: 'When a death occurs, call Benta’s Funeral Home immediately at (212) 281-8850. Our licensed staff is available 24 hours a day, 7 days a week. If the death occurred at home under hospice care, notify the hospice nurse first. If the death occurred at a hospital or medical center, let the nursing supervisor know that Benta’s Funeral Home is handling arrangements.'
    },
    {
      q: 'How does electronic death certificate registration work in New York?',
      a: 'New York City utilizes the electronic NYC eVital / EDRS system. Once the attending physician, hospice doctor, or Medical Examiner completes the medical portion of the death certificate, Benta’s licensed directors complete the personal vital statistics and transmit the electronic filing directly to the NYC Department of Health to issue official burial or cremation transit permits.'
    },
    {
      q: 'What is the difference between Direct Cremation and Cremation with Memorial Services?',
      a: 'Direct Cremation is an immediate disposition without formal viewing or visitation in our chapels. Cremation with a Memorial Service includes direct cremation followed by a commemorative celebration of life in Parlor A or Parlor B with custom programs, 360° Digi-Tributes, guest register, and family floral tributes.'
    },
    {
      q: 'Can I pre-plan and prepay for funeral arrangements in advance?',
      a: 'Yes. Benta’s offers New York State Pre-Plan Trusts under NYS General Business Law § 453. All funds are held in 100% FDIC-insured trust accounts, guaranteeing that your funeral selections and funds are fully protected and shielded from Medicaid spend-down rules if established as irrevocable trusts.'
    },
    {
      q: 'Are military funeral honors available for veterans?',
      a: 'Yes. Every eligible veteran discharged under conditions other than dishonorable is entitled to military funeral honors provided by the Department of Defense at no charge. This includes the folding and presentation of the United States flag, the sounding of Taps, and interment in a National Cemetery (such as Calverton).'
    },
    {
      q: 'How do family members access virtual chapel livestreams and digital obituaries?',
      a: 'Benta’s provides private, high-definition 4K live streaming for services in Parlor A and Parlor B. Families and distant relatives can log in via our website using the family’s unique 4-digit PIN to watch live broadcasts, download memorial bulletins, and leave condolence messages in the digital guestbook.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setContactForm({
        fullName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-0">
      {/* FAQs Section */}
      <section id="faqs" className="py-20 bg-[#faf7f2] border-b border-[#ece5d8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-[#f5eedf] text-[#af893e] border border-[#e6dac1] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#af893e]" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#191714]">
              Common Inquiries & Guidance
            </h2>
            <p className="text-xs sm:text-sm text-[#69635b] font-light max-w-xl mx-auto">
              Clear, compassionate answers to assist you and your family in navigating funeral arrangements and legal requirements.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#ece5d8] rounded-2xl overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#fcfbf9] transition cursor-pointer"
                  >
                    <span className="font-serif-title font-bold text-sm sm:text-base text-[#191714]">
                      {faq.q}
                    </span>
                    <span className="p-1 rounded-full bg-[#f5eedf] text-[#af893e] shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#69635b] leading-relaxed border-t border-[#f5eedf]/60 font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-white border-b border-red-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs text-[#991b1b] font-bold tracking-wide uppercase">
                <MapPin className="w-3.5 h-3.5 text-[#b45309]" />
                <span>Harlem Location & Hours</span>
              </div>

              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
                Get in Touch with <br />
                <span className="red-gradient-text">Benta's Funeral Home</span>
              </h2>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                We welcome you to visit our sanctuary at 630 Saint Nicholas Avenue in Harlem, or contact our directors by phone or message at any time.
              </p>

              {/* Contact Card Details */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="p-2 rounded-lg bg-red-50 text-[#991b1b] border border-red-200 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Address</h3>
                    <p className="text-xs text-neutral-700 mt-0.5 font-medium">630 Saint Nicholas Avenue</p>
                    <p className="text-xs text-neutral-500">New York, NY 10030 (Between 141st & 142nd Streets)</p>
                    <p className="text-[11px] text-[#b45309] font-semibold mt-1">Subway: A, B, C, D trains to 145th Street</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="p-2 rounded-lg bg-amber-50 text-[#b45309] border border-amber-200 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Telephone & Fax</h3>
                    <p className="text-xs text-neutral-700 mt-0.5">
                      Phone: <a href="tel:+12122818850" className="font-bold text-[#991b1b] hover:underline">(212) 281-8850</a> (24/7 Careline)
                    </p>
                    <p className="text-xs text-neutral-500">Fax: (212) 234-3600</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Office Hours</h3>
                    <p className="text-xs text-neutral-700 mt-0.5 font-medium">Monday–Friday: 9:00 AM – 5:00 PM</p>
                    <p className="text-xs text-neutral-500">Saturday & Sunday: Closed (Except under special direction & scheduled services)</p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">24/7 First Call Emergency Response Staff On-Duty</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Contact / Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-lg relative">
                <h3 className="font-serif-title text-xl font-bold text-neutral-900 mb-2">
                  Send a Confidential Message to our Staff
                </h3>
                <p className="text-xs text-neutral-500 mb-6 font-light">
                  Whether inquiring about pre-planning, current obituary details, or general service questions, our directors will respond promptly.
                </p>

                {isSubmitted ? (
                  <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-serif-title text-lg font-bold text-emerald-950">
                      Message Received
                    </h4>
                    <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                      Thank you for contacting Benta’s Funeral Home. A licensed funeral director will review your inquiry and follow up shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.fullName}
                          onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                          placeholder="e.g. Jane Doe"
                          className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#991b1b]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="(212) 555-0199"
                          className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#991b1b]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#991b1b]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Subject / Inquiry Type
                        </label>
                        <select
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-[#991b1b]"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Immediate Service Need">Immediate Service Need (First Call)</option>
                          <option value="Pre-Planning Consultation">Pre-Planning Consultation</option>
                          <option value="Obituary / Digi-Tribute Question">Obituary / Digi-Tribute Question</option>
                          <option value="Florals & Products">Florals & Celebration Products</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Your Message / Questions *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Please tell us how we may assist you..."
                        className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-3 text-xs text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#991b1b]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#991b1b] to-[#b91c1c] hover:from-[#7f1d1d] hover:to-[#991b1b] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md transition flex items-center justify-center space-x-2 border border-amber-300/30 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>Send Confidential Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
