'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Phone,
  ArrowUp,
  ChevronRight,
  ArrowRight,
  Instagram,
  Facebook,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);

  // Smooth Parallax Effect on Scroll for Footer & Giant Wordmark
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        if (!footerRef.current) return;
        const rect = footerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // When footer is visible or entering the viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const totalDistance = windowHeight + rect.height;
          const currentProgress = (windowHeight - rect.top) / totalDistance;
          // Smooth parallax shift from -28px to +28px
          const offset = (currentProgress - 0.5) * 45;
          setParallaxOffset(offset);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
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

  return (
    <div
      ref={footerRef}
      id="main-footer"
      className="w-full relative z-10 selection:bg-[#FFC72C] selection:text-[#111111] overflow-hidden bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white border-t border-black/10 dark:border-zinc-800/80"
    >
      {/* Background Ambient Organic Parallax Glow (Gold) */}
      <div
        className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[350px] bg-[#FFC72C]/10 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translate(-50%, ${parallaxOffset * 0.4}px)` }}
      />
      <div
        className="pointer-events-none absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#FFC72C]/5 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxOffset * -0.3}px)` }}
      />

      {/* =========================================================================
          1. PRE-FOOTER CTA SECTION (LUXURY DARK & GOLD)
      ========================================================================= */}
      <section
        id="contact"
        className="w-full relative scroll-mt-24 py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#101114] text-zinc-900 dark:text-white border-b border-black/10 dark:border-zinc-800"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC72C]/10 border border-[#FFC72C]/30 text-xs font-tenor font-bold text-[#FFC72C] mb-5 shadow-xs transition-transform hover:scale-105 duration-300">
            <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-pulse" />
            <span>Direct Concierge Service • 24/7 Available</span>
          </div>

          <h2 className="font-tenor text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight mb-4">
            Ready to Explore Kigali in Supreme Comfort?
          </h2>

          <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10">
            Connect directly with our Kigali reservation manager to confirm vehicle availability, dates, and bespoke arrangements.
          </p>

          <div className="flex justify-center items-center">
            <a
              href="tel:+250788123456"
              className="min-h-[48px] px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl skeu-btn-teal text-[#111111] font-tenor font-extrabold text-sm sm:text-base tracking-tight flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Phone className="w-4 h-4 shrink-0 text-[#111111]" />
              <span>Book Call</span>
            </a>
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
            
            {/* Left Section: Newsletter & Socials (Span 4 cols with vertical divider) */}
            <div className="lg:col-span-4 lg:pr-12 lg:border-r border-black/10 dark:border-white/20 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-white/80 font-semibold block mb-6">
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
                  href="https://wa.me/250788123456"
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
                      href="tel:+250788123456"
                      className="hover:text-[#FFC72C] hover:translate-x-1 inline-block transition-all duration-200 py-0.5 font-medium text-zinc-900 dark:text-white"
                    >
                      +250 788 123 456
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/250788123456"
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
                    <Link
                      href="/handover"
                      className="hover:text-black dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-0.5"
                    >
                      Handover Protocol
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin"
                      className="text-zinc-600 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 py-0.5"
                    >
                      <span>Operations</span>
                      <span className="text-[10px] bg-black/10 dark:bg-white/20 text-zinc-800 dark:text-white px-1.5 py-0.5 rounded-sm font-mono font-bold">
                        AD-01
                      </span>
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
            <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-white/90 text-center sm:text-left">
              COPYRIGHT KGLRENTALS 2026
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
