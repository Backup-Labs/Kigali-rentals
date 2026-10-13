'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRental } from '@/lib/rentalContext';
import {
  Menu,
  X,
  ChevronRight,
  Phone,
  Globe,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  id: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { currency, toggleCurrency } = useRental();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'Vehicles', href: '/#vehicles', id: 'vehicles' },
    { label: 'Apartments', href: '/#apartments', id: 'apartments' },
    { label: 'How it works', href: '/#how-it-works', id: 'how-it-works' },
    { label: 'About', href: '/#about', id: 'about' },
    { label: 'Contact', href: '/#contact', id: 'contact' },
  ];

  // Real-time Scroll Spy that highlights active section continuously as user scrolls
  useEffect(() => {
    if (pathname.startsWith('/listings')) {
      setActiveTab('apartments');
      return;
    }

    if (pathname !== '/') {
      return;
    }

    const updateActiveOnScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Bottom of page -> contact CTA
      if (windowHeight + scrollY >= docHeight - 140) {
        setActiveTab('contact');
        return;
      }

      // Very top of page in hero section
      if (scrollY < 380) {
        setActiveTab('home');
        return;
      }

      // 220px trigger line positioned right below the floating navbar
      const triggerLine = 220;

      const sections = [
        { id: 'vehicles', el: document.getElementById('vehicles') },
        { id: 'apartments', el: document.getElementById('apartments') || document.getElementById('properties') },
        { id: 'how-it-works', el: document.getElementById('how-it-works') },
        { id: 'about', el: document.getElementById('about') },
        { id: 'contact', el: document.getElementById('contact') },
      ];

      for (const sec of sections) {
        if (sec.el) {
          const rect = sec.el.getBoundingClientRect();
          if (rect.top <= triggerLine && rect.bottom > triggerLine) {
            setActiveTab(sec.id);
            return;
          }
        }
      }
    };

    updateActiveOnScroll();

    window.addEventListener('scroll', updateActiveOnScroll, { passive: true });
    window.addEventListener('resize', updateActiveOnScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateActiveOnScroll);
      window.removeEventListener('resize', updateActiveOnScroll);
    };
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    setActiveTab(item.id);

    // If on homepage and clicking an anchor link, smooth scroll to target section
    if (pathname === '/') {
      if (item.href === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      } else if (item.href.startsWith('/#')) {
        const targetId = item.href.replace('/#', '');
        const targetEl =
          document.getElementById(targetId) ||
          (targetId === 'apartments' ? document.getElementById('properties') : null);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${targetId}`);
        }
      } else if (item.href.startsWith('/?type=')) {
        const type = item.href.replace('/?type=', '');
        const targetId = type === 'car' ? 'vehicles' : 'apartments';
        const targetEl =
          document.getElementById(targetId) || document.getElementById('properties');
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', item.href);
        }
      }
    }
  };

  return (
    <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none transition-all">
      {/* Floating Glassmorphic + Skeuomorphic Capsule Bar */}
      <div className="pointer-events-auto max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto glass-skeu-nav rounded-2xl sm:rounded-full px-4 sm:px-6 2xl:px-8 py-2 sm:py-2.5 flex items-center justify-between transition-all">
        {/* Brand Logo with Tactile Bevel */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, navItems[0])}
          className="flex items-center gap-2.5 sm:gap-3 group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00638E] flex items-center justify-center text-white shadow-md border border-slate-200/40 transition-transform group-hover:scale-105 active:scale-95 shrink-0">
            {/* Bespoke Luxury Crest & "K" Monogram */}
            <svg
              className="w-5 h-5 sm:w-5.5 sm:h-5.5"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 3.5L28 9.5V22.5L16 28.5L4 22.5V9.5L16 3.5Z"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M11 9.5V22.5M11 16H15.5L21 10M15.5 16L21 22"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="15.5" cy="16" r="1.5" fill="#FFFFFF" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-tenor text-base sm:text-lg font-extrabold tracking-tight text-[#141414] leading-tight">
              Kigali<span className="text-[#00638E]">Rentals</span>
            </span>
            <span className="text-[9px] text-[#2B2B2B] font-sans tracking-wide hidden sm:inline -mt-0.5">
              Rwanda Living & Mobility
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Animated Highlighting Pill (Visible on lg: 1024px and up) */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`h-9 px-3 xl:px-3.5 rounded-full text-xs xl:text-sm font-tenor transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[#00638E] text-white font-bold shadow-md'
                    : 'text-[#2B2B2B] hover:text-[#00638E] font-medium hover:bg-[#F0F6F9]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions with Responsive Scaling */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Elegant Currency Selector Pill (Visible on desktop lg: screens; accessible in mobile drawer) */}
          <button
            onClick={toggleCurrency}
            className="hidden lg:flex h-9 px-3 rounded-xl skeu-btn-frosted items-center justify-center gap-2 text-xs font-tenor shrink-0 transition-all hover:bg-white/90 group"
            title={`Active: ${currency} (Click to toggle USD / RWF)`}
          >
            <Globe className="w-3.5 h-3.5 text-[#00638E] transition-colors shrink-0" />
            <div className="flex items-center text-[11px] font-bold tracking-tight">
              <span className={currency === 'USD' ? 'text-[#00638E] font-extrabold' : 'text-slate-400 font-medium'}>
                USD
              </span>
              <span className="text-slate-300 mx-1">|</span>
              <span className={currency === 'RWF' ? 'text-[#00638E] font-extrabold' : 'text-slate-400 font-medium'}>
                RWF
              </span>
            </div>
          </button>

          {/* Primary Phone Call CTA (Visible on desktop lg: screens; accessible in mobile drawer) */}
          <a
            href="tel:+250788123456"
            className="hidden lg:inline-flex h-9 items-center justify-center gap-1.5 px-3.5 sm:px-4 rounded-xl skeu-btn-teal text-white font-tenor font-semibold text-xs sm:text-sm tracking-tight shrink-0 shadow-md hover:shadow-lg transition-all"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>Book Call</span>
          </a>

          {/* Mobile/Tablet Hamburger Button (Shown on < lg screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-900 skeu-btn-frosted shrink-0 transition-all"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Clean Solid White Mobile Drawer with Active Highlighting */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay to close when clicking outside */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Drawer Container */}
          <div className="pointer-events-auto relative z-50 max-w-6xl mx-auto lg:hidden mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 sm:p-5 animate-fadeIn space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    handleNavClick(e, item);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-tenor font-semibold transition-all ${
                    isActive
                      ? 'bg-[#00638E] text-white shadow-md'
                      : 'text-slate-700 hover:text-[#00638E] hover:bg-[#F0F6F9]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                </Link>
              );
            })}

            {/* Direct Call Concierge Button */}
            <div className="pt-2">
              <a
                href="tel:+250788123456"
                className="w-full h-11 flex items-center justify-center gap-2 px-4 rounded-xl bg-[#00638E] text-white text-xs sm:text-sm font-tenor font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Concierge (+250 788 123 456)</span>
              </a>
            </div>

            {/* Currency Selector inside drawer */}
            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-tenor flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00638E]" />
                <span>Currency</span>
              </span>
              <button
                onClick={toggleCurrency}
                className="h-8 px-3 rounded-lg skeu-btn-frosted text-xs font-tenor font-bold flex items-center gap-2 border border-slate-200"
              >
                <span className={currency === 'USD' ? 'text-[#00638E] font-extrabold' : 'text-slate-400 font-medium'}>
                  USD
                </span>
                <span className="text-slate-300">|</span>
                <span className={currency === 'RWF' ? 'text-[#00638E] font-extrabold' : 'text-slate-400 font-medium'}>
                  RWF
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
