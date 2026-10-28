'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Phone,
  ArrowUp,
  ChevronRight,
  ArrowRight,
  Instagram,
  Facebook,
  MessageCircle,
  CheckCircle2,
  Mail,
  Copy,
  Check,
  Calendar,
  Send,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { sanitizePlainText, sanitizeEmail, isValidEmail } from '@/lib/sanitize';
import { getWhatsAppUrl, WHATSAPP_RAW_NUMBER, WHATSAPP_DISPLAY_NUMBER } from '@/lib/constants';
import { AdminSelect } from '@/components/admin/AdminCustomControls';

const CONCIERGE_EMAIL = 'concierge@kigalirentals.rw';
const CALCOM_BOOKING_URL = 'https://cal.com/kigali-rentals/30min';

export default function Footer() {
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Copyable email state
  const [emailCopied, setEmailCopied] = useState(false);

  // Direct Email Form State (Sanitized & Protected)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Vehicle & Residence Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [honeypotWebsite, setHoneypotWebsite] = useState('');

  // Anti-Robot Verification State
  const [notRobotChecked, setNotRobotChecked] = useState(false);
  const [numA, setNumA] = useState(4);
  const [numB, setNumB] = useState(5);
  const [challengeInput, setChallengeInput] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactStatus, setContactStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const regenerateChallenge = () => {
    setNumA(Math.floor(Math.random() * 7) + 2);
    setNumB(Math.floor(Math.random() * 7) + 2);
    setChallengeInput('');
  };

  useEffect(() => {
    regenerateChallenge();
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONCIERGE_EMAIL);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    } catch {
      // Fallback copy
      const el = document.createElement('textarea');
      el.value = CONCIERGE_EMAIL;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus(null);

    if (honeypotWebsite.trim().length > 0) {
      return;
    }

    const cleanName = sanitizePlainText(contactName, 100);
    const cleanEmail = sanitizeEmail(contactEmail);
    const cleanSubject = sanitizePlainText(contactSubject, 140);
    const cleanMessage = sanitizePlainText(contactMessage, 1500);

    if (cleanName.length < 2) {
      setContactStatus({
        type: 'error',
        text: 'Please enter your full name (at least 2 characters).',
      });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setContactStatus({
        type: 'error',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    if (cleanMessage.length < 10) {
      setContactStatus({
        type: 'error',
        text: 'Please write a message of at least 10 characters.',
      });
      return;
    }

    if (!notRobotChecked || Number(challengeInput) !== numA + numB) {
      setContactStatus({
        type: 'error',
        text: 'Please check "I am not a robot" and solve the security check.',
      });
      return;
    }

    setIsSubmittingContact(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          website: honeypotWebsite,
          notRobotChecked,
          numA,
          numB,
          challengeAnswer: Number(challengeInput),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setContactStatus({
          type: 'error',
          text: data.error || 'Could not send message. Please try again.',
        });
        return;
      }

      setContactStatus({
        type: 'success',
        text: `Message sent to ${CONCIERGE_EMAIL} (Ref: ${data.inquiryId}). Our concierge will reply shortly.`,
      });
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setNotRobotChecked(false);
      regenerateChallenge();
    } catch {
      setContactStatus({
        type: 'error',
        text: 'Network error while sending message. Please try again.',
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeEmail(newsletterEmail);
    if (isValidEmail(clean)) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div
      id="main-footer"
      className="w-full relative z-10 selection:bg-[#FFC72C] selection:text-[#111111] overflow-hidden bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white border-t border-black/10 dark:border-zinc-800/80"
    >
      {/* Background Ambient Organic Glow (Gold) */}
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[350px] bg-[#FFC72C]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#FFC72C]/5 rounded-full blur-3xl" />

      {/* =========================================================================
          1. PRE-FOOTER CTA & DIRECT EMAIL SECTION (LEFT: EMAIL + CAL.COM | RIGHT: SANITIZED FORM)
      ========================================================================= */}
      <section
        id="contact"
        className="w-full relative scroll-mt-24 py-14 sm:py-20 bg-white dark:bg-[#101114] text-zinc-900 dark:text-white border-b border-black/10 dark:border-zinc-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* LEFT COLUMN: Clickable & Copyable Email + Cal.com Booking */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC72C]/10 border border-[#FFC72C]/30 text-xs font-tenor font-bold text-[#FFC72C]">
                <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-pulse" />
                <span>Direct Concierge Service • 24/7 Available</span>
              </div>

              <h2 className="font-tenor text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                Ready to Explore Kigali in Supreme Comfort?
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Connect directly with our Kigali reservation manager to confirm vehicle availability, dates, and bespoke diplomatic or safari arrangements.
              </p>

              {/* Clickable & Copyable Official Email Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-[#141519] border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  Official Concierge Email (Click to Mail or Copy)
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={`mailto:${CONCIERGE_EMAIL}?subject=Kigali%20Rentals%20Reservation%20Inquiry`}
                    className="inline-flex items-center gap-2 font-tenor font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white hover:text-[#FFC72C] dark:hover:text-[#FFC72C] transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-[#FFC72C] shrink-0" />
                    <span>{CONCIERGE_EMAIL}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`h-8 px-3 rounded-xl text-xs font-tenor font-bold flex items-center gap-1.5 border transition-all ${
                      emailCopied
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#FFC72C]'
                    }`}
                    title="Copy email address"
                  >
                    {emailCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#FFC72C]" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cal.com Schedule Call CTA + Direct Phone */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={CALCOM_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-6 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4 shrink-0 text-[#111111]" />
                  <span>Book Call on Cal.com</span>
                </a>

                <a
                  href={`tel:+${WHATSAPP_RAW_NUMBER}`}
                  className="h-12 px-5 rounded-xl bg-zinc-100 dark:bg-[#141519] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 font-tenor font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4 text-[#FFC72C]" />
                  <span>{WHATSAPP_DISPLAY_NUMBER}</span>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: Sanitized Direct Email Inquiry Form with Anti-Robot Check */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleContactSubmit}
                noValidate
                className="p-5 sm:p-7 rounded-3xl bg-zinc-50 dark:bg-[#141519] border border-zinc-200 dark:border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-tenor font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white">
                      Message Our Concierge by Email
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Protected & sanitized direct dispatch to {CONCIERGE_EMAIL}
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#FFC72C] shrink-0" />
                </div>

                {/* Hidden Honeypot Input for Bot Mitigation */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="kgl-website-hp">Website</label>
                  <input
                    id="kgl-website-hp"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypotWebsite}
                    onChange={(e) => setHoneypotWebsite(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={100}
                      value={contactName}
                      onChange={(e) =>
                        setContactName(e.target.value.replace(/[<>`]/g, ''))
                      }
                      placeholder="e.g. Jean-Luc Habimana"
                      className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Your Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={120}
                      value={contactEmail}
                      onChange={(e) =>
                        setContactEmail(e.target.value.replace(/[<>`\s]/g, ''))
                      }
                      placeholder="you@organization.org"
                      className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Inquiry Topic
                  </label>
                  <AdminSelect
                    options={[
                      { value: 'Vehicle & Residence Inquiry', label: 'Vehicle & Residence Inquiry' },
                      { value: '4x4 Prado / Defender Fleet Booking', label: '4x4 Prado / Defender Fleet Booking' },
                      { value: 'Luxury Villa / Penthouse Stay', label: 'Luxury Villa / Penthouse Stay' },
                      { value: 'Stay & Drive Combo (-20% Bundle)', label: 'Stay & Drive Combo (-20% Bundle)' },
                      { value: 'VIP Airport Chauffeur Protocol', label: 'VIP Airport Chauffeur Protocol' },
                    ]}
                    value={contactSubject}
                    onChange={setContactSubject}
                    size="lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    required
                    maxLength={1500}
                    value={contactMessage}
                    onChange={(e) =>
                      setContactMessage(e.target.value.replace(/[<>`]/g, ''))
                    }
                    placeholder="Share your preferred dates, vehicle/apartment interest, or any special requests..."
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                  />
                </div>

                {/* Human / Anti-Robot Verification Bar */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notRobotChecked}
                      onChange={(e) => setNotRobotChecked(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#FFC72C] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      I am not a robot
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      Verify: {numA} + {numB} =
                    </span>
                    <input
                      type="number"
                      required
                      value={challengeInput}
                      onChange={(e) => setChallengeInput(e.target.value)}
                      placeholder="?"
                      aria-label="Security math challenge answer"
                      className="w-14 h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-center text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                    />
                    <button
                      type="button"
                      onClick={regenerateChallenge}
                      title="New security check"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {contactStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      contactStatus.type === 'success'
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {contactStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{contactStatus.text}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[10px] text-zinc-400">
                    Inputs sanitized against XSS & injection
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="h-10 px-6 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] disabled:opacity-50 text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingContact ? 'Sending...' : 'Send Email Message'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN FOOTER CONTENT DIRECTORY (DEEP AZURE PALETTE + ANIMATIONS)
             - Newsletter on Left with vertical border
             - 4 link columns on Right
      ========================================================================= */}
      <footer className="w-full pt-10 sm:pt-14 pb-0 relative z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Content Grid: Left (Newsletter) + Right (4 Link Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 pb-12 sm:pb-16">
            
            {/* Left Section: Brand Logo, Newsletter & Socials (Span 4 cols with vertical divider) */}
            <div className="lg:col-span-4 lg:pr-12 lg:border-r border-black/10 dark:border-white/20 flex flex-col justify-between">
              <div>
                {/* Official Dual-Theme Brand Logo */}
                <Link href="/" className="inline-block mb-6 group" aria-label="Kigali Rentals Home">
                  <Image
                    src="/logo-dark.svg"
                    alt="Kigali Rentals"
                    width={180}
                    height={48}
                    className="h-10 sm:h-11 w-auto object-contain hidden dark:block transition-transform group-hover:scale-102"
                  />
                  <Image
                    src="/logo-light.svg"
                    alt="Kigali Rentals"
                    width={180}
                    height={48}
                    className="h-10 sm:h-11 w-auto object-contain dark:hidden transition-transform group-hover:scale-102"
                  />
                </Link>

                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-white/80 font-semibold block mb-4">
                  Newsletter
                </span>

                {/* Subscription input matching editorial design */}
                <form onSubmit={handleSubscribe} className="relative w-full max-w-sm mb-4">
                  <div className="flex items-center border-b border-black/20 dark:border-white/30 focus-within:border-[#FFC72C] transition-colors pb-2 group">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/60 focus:outline-hidden pr-8 font-sans"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe to newsletter"
                      className="text-zinc-700 dark:text-white/80 hover:text-black dark:hover:text-white p-1 transition-transform group-hover:translate-x-1 duration-200"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {subscribed ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 mb-6 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Murakoze! You are now subscribed to Kigali updates.</span>
                  </p>
                ) : (
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-white/70 mb-8">
                    I agree to terms & concierge notifications
                  </p>
                )}
              </div>

              {/* Social icons matching bottom-left of inspiration */}
              <div className="flex items-center gap-3 text-zinc-600 dark:text-white/80 pt-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-black/20 dark:border-white/30 hover:border-[#FFC72C] text-zinc-700 dark:text-white hover:text-[#FFC72C] hover:bg-[#FFC72C]/10 flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-black/20 dark:border-white/30 hover:border-[#FFC72C] text-zinc-700 dark:text-white hover:text-[#FFC72C] hover:bg-[#FFC72C]/10 flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-black/20 dark:border-white/30 hover:border-[#FFC72C] text-zinc-700 dark:text-white hover:text-[#FFC72C] hover:bg-[#FFC72C]/10 flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Section: 4 Link Columns (Span 8 cols on lg screens) */}
            <div className="lg:col-span-8 lg:pl-12 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
              
              {/* Column 1: Vehicles */}
              <div className="space-y-3">
                <h5 className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-white/80 font-semibold mb-4">
                  Vehicles
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-white/85 font-sans">
                  <li>
                    <Link
                      href="/listings/veh-land-cruiser-prado"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Toyota Prado TXL
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/listings/veh-defender-110"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Defender 110
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/listings/veh-rav4-hybrid"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      RAV4 Hybrid AWD
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/listings/veh-mercedes-e-class"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Mercedes VIP
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#vehicles"
                      className="text-zinc-900 dark:text-white font-semibold hover:underline flex items-center gap-1 pt-1 group"
                    >
                      <span>All 4x4 Fleet</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Apartments */}
              <div className="space-y-3">
                <h5 className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-white/80 font-semibold mb-4">
                  Apartments
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-white/85 font-sans">
                  <li>
                    <Link
                      href="/?neighborhood=Kiyovu"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Kiyovu Hill
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/?neighborhood=Nyarutarama"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Nyarutarama Golf
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/?neighborhood=Kimihurura"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Kimihurura Lofts
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/?neighborhood=Gacuriro"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Gacuriro Mansions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#apartments"
                      className="text-zinc-900 dark:text-white font-semibold hover:underline flex items-center gap-1 pt-1 group"
                    >
                      <span>All Residences</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Experiences */}
              <div className="space-y-3">
                <h5 className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-white/80 font-semibold mb-4">
                  Experiences
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-white/85 font-sans">
                  <li>
                    <Link
                      href="/?type=combo"
                      className="text-zinc-900 dark:text-white font-semibold hover:underline hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Stay & Drive Combo
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#about"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Gorilla Safaris
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#about"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Akagera Big Five
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#about"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Lake Kivu Drives
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#how-it-works"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Concierge */}
              <div className="space-y-3">
                <h5 className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-white/80 font-semibold mb-4">
                  Concierge
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-white/85 font-sans">
                  <li>
                    <a
                      href={`tel:+${WHATSAPP_RAW_NUMBER}`}
                      className="hover:text-[#FFC72C] hover:translate-x-1 inline-block transition-all duration-200 py-0.5 font-medium text-zinc-900 dark:text-white"
                    >
                      {WHATSAPP_DISPLAY_NUMBER}
                    </a>
                  </li>
                  <li>
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#FFC72C] hover:translate-x-1 inline-block transition-all duration-200 py-0.5 text-zinc-900 dark:text-white font-medium"
                    >
                      WhatsApp Desk
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:concierge@kigalirentals.rw"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5 truncate"
                    >
                      concierge@kgl.rw
                    </a>
                  </li>
                  <li>
                    <a
                      href={CALCOM_BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#FFC72C] hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Book Call (Cal.com)
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/admin"
                      className="text-zinc-600 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 py-0.5"
                    >
                      <span>Admin Portal</span>
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* =========================================================================
              4. COPYRIGHT & REGULATORY BAR (ABOVE "Kigali Rentals")
          ========================================================================= */}
          <div className="w-full border-t border-black/10 dark:border-white/20 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 dark:text-white/90 gap-4">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-white/90 text-center sm:text-left">
              <Image src="/icon.svg" alt="Emblem" width={18} height={18} className="w-4 h-4 rounded-xs shrink-0" />
              <span>COPYRIGHT KGLRENTALS 2026 • RWANDA</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[11px] text-zinc-500 dark:text-white/75">
                Regulated by Rwanda Development Board (RDB)
              </span>

              {/* Circular contact / scroll button with hover bounce animation */}
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="w-10 h-10 rounded-full bg-[#FFC72C] hover:bg-[#FFE082] border border-[#FFC72C]/40 flex items-center justify-center text-[#111111] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                title="Back to Top"
              >
                <ArrowUp className="w-4 h-4 text-[#111111]" />
              </button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            5. GIGANTIC BOLD "Kigali Rentals" SLIDING FROM RIGHT TO LEFT
               Continuous smooth marquee in Syne font, extra large & bold
        ========================================================================= */}
        <div className="w-full overflow-hidden select-none pt-2 sm:pt-3 pb-3 sm:pb-4 border-t border-black/10 dark:border-zinc-800/80 relative flex items-center">
          <div className="animate-marquee-left flex items-center whitespace-nowrap will-change-transform">
            {/* Repeated Sequence A */}
            <div className="flex items-center gap-8 sm:gap-14 shrink-0 pr-8 sm:pr-14">
              <span
                className="font-syne font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-[#FFC72C] to-[#FFC72C]/30 dark:from-white dark:via-[#FFC72C] dark:to-[#FFC72C]/25 drop-shadow-md text-[13vw] sm:text-[11vw] lg:text-[10vw] leading-[0.82] select-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Kigali Rentals
              </span>
              <span className="text-[#FFC72C] text-2xl sm:text-4xl lg:text-5xl font-sans">•</span>
              <span
                className="font-syne font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-[#FFC72C] to-[#FFC72C]/30 dark:from-white dark:via-[#FFC72C] dark:to-[#FFC72C]/25 drop-shadow-md text-[13vw] sm:text-[11vw] lg:text-[10vw] leading-[0.82] select-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Kigali Rentals
              </span>
              <span className="text-[#FFC72C] text-2xl sm:text-4xl lg:text-5xl font-sans">•</span>
            </div>

            {/* Repeated Sequence B (Seamless clone for infinite loop) */}
            <div className="flex items-center gap-8 sm:gap-14 shrink-0 pr-8 sm:pr-14">
              <span
                className="font-syne font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-[#FFC72C] to-[#FFC72C]/30 dark:from-white dark:via-[#FFC72C] dark:to-[#FFC72C]/25 drop-shadow-md text-[13vw] sm:text-[11vw] lg:text-[10vw] leading-[0.82] select-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Kigali Rentals
              </span>
              <span className="text-[#FFC72C] text-2xl sm:text-4xl lg:text-5xl font-sans">•</span>
              <span
                className="font-syne font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-[#FFC72C] to-[#FFC72C]/30 dark:from-white dark:via-[#FFC72C] dark:to-[#FFC72C]/25 drop-shadow-md text-[13vw] sm:text-[11vw] lg:text-[10vw] leading-[0.82] select-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Kigali Rentals
              </span>
              <span className="text-[#FFC72C] text-2xl sm:text-4xl lg:text-5xl font-sans">•</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
