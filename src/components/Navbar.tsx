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
import ThemeToggle from '@/components/ThemeToggle';

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
    { label: 'How It Works', href: '/#how-it-works', id: 'how-it-works' },
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
        setActiveTab((prev) => (prev === 'contact' ? prev : 'contact'));
        return;
      }

      // Very top of page in hero section
      if (scrollY < 380) {
        setActiveTab((prev) => (prev === 'home' ? prev : 'home'));
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
            setActiveTab((prev) => (prev === sec.id ? prev : sec.id));
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

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      {/* Refined Minimal Floating Capsule Bar */}
      <div className="pointer-events-auto max-w-5xl xl:max-w-6xl mx-auto glass-skeu-nav rounded-full px-3.5 sm:px-5 py-2 flex items-center justify-between gap-4 transition-all">
        {/* Clean Single-Line Brand Identity */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, navItems[0])}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#FFD54F] via-[#FFC72C] to-[#E5B224] flex items-center justify-center text-[#111111] transition-transform group-hover:scale-105 active:scale-95 shrink-0">
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 3.5L28 9.5V22.5L16 28.5L4 22.5V9.5L16 3.5Z"
                stroke="#111111"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M11 9.5V22.5M11 16H15.5L21 10M15.5 16L21 22"
                stroke="#111111"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="15.5" cy="16" r="1.5" fill="#111111" />
            </svg>
          </div>

          <span className="font-tenor text-base sm:text-[17px] font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">
            Kigali<span className="text-[#FFC72C]">Rentals</span>
          </span>
        </Link>

        {/* Center Navigation Track (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`h-8 px-3.5 rounded-full text-xs font-tenor transition-all duration-200 flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800/95 text-zinc-950 dark:text-[#FFC72C] font-bold shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Unified Utility Pill + Single Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Compact Combined Utility Pill (Currency + Theme) */}
          <div className="flex items-center h-9 px-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={toggleCurrency}
              className="h-7 px-2.5 rounded-full text-[11px] font-tenor font-bold text-zinc-700 dark:text-zinc-200 hover:text-[#FFC72C] dark:hover:text-[#FFC72C] flex items-center gap-1 transition-colors"
              title={`Active currency: ${currency}. Click to switch to ${currency === 'USD' ? 'RWF' : 'USD'}`}
            >
              <span className="text-[#FFC72C] font-extrabold">{currency}</span>
            </button>

            <span className="h-3.5 w-px bg-black/10 dark:bg-white/10 mx-0.5" />

            <ThemeToggle variant="nav" />
          </div>

          {/* Single Primary CTA Button (Cal.com Booking Link) */}
          <a
            href="https://cal.com/kigali-rentals/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex h-9 items-center justify-center gap-1.5 px-4 rounded-full bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs tracking-wide shrink-0 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>Book Call</span>
          </a>

          {/* Mobile/Tablet Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] shrink-0 transition-all"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Clean Mobile Drawer with Active Highlighting */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay to close when clicking outside */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Drawer Container */}
          <div className="pointer-events-auto relative z-50 max-w-6xl mx-auto lg:hidden mt-2 bg-white dark:bg-[#141519] border border-black/10 dark:border-zinc-800 shadow-2xl rounded-2xl p-4 sm:p-5 animate-fadeIn space-y-2">
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
                      ? 'bg-gradient-to-r from-[#FFD54F] to-[#FFC72C] text-[#111111] font-bold'
                      : 'text-zinc-800 dark:text-zinc-300 hover:text-[#FFC72C] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />}
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#111111]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                </Link>
              );
            })}

            {/* Cal.com Schedule Call Concierge Button */}
            <div className="pt-2">
              <a
                href="https://cal.com/kigali-rentals/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 flex items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-r from-[#FFD54F] to-[#FFC72C] text-[#111111] text-xs sm:text-sm font-tenor font-extrabold transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Book a Call on Cal.com</span>
              </a>
            </div>

            {/* Currency Selector & Theme Selector inside drawer */}
            <div className="pt-3 border-t border-black/10 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-tenor flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span>Currency</span>
                </span>
                <button
                  onClick={toggleCurrency}
                  className="h-8 px-3 rounded-lg skeu-btn-frosted text-xs font-tenor font-bold flex items-center gap-2 border border-black/10 dark:border-zinc-700"
                >
                  <span className={currency === 'USD' ? 'text-[#FFC72C] font-extrabold' : 'text-zinc-500 dark:text-zinc-400 font-medium'}>
                    USD
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600">|</span>
                  <span className={currency === 'RWF' ? 'text-[#FFC72C] font-extrabold' : 'text-zinc-500 dark:text-zinc-400 font-medium'}>
                    RWF
                  </span>
                </button>
              </div>

              <ThemeToggle variant="drawer" />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
