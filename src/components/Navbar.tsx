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
  MessageSquare,
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
      <div className="pointer-events-auto max-w-6xl mx-auto glass-skeu-nav rounded-2xl sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all">
        {/* Brand Logo with Tactile Bevel */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, navItems[0])}
          className="flex items-center gap-2.5 sm:gap-3 group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-b from-[#184F60] to-[#0D3846] flex items-center justify-center text-white shadow-sm border border-[#0A2E3A] transition-transform group-hover:scale-105 active:scale-95">
            {/* Geometric L-Angle Icon */}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-[#E6D7C3]"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4h4v12h12v4H4V4zm8 5h4v4h-4V9z" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-tenor text-base sm:text-lg font-extrabold tracking-tight text-[#0D3846] leading-tight">
              Kigali<span className="text-[#C85A2A]">Rentals</span>
            </span>
            <span className="text-[9px] text-slate-500 font-sans tracking-wide hidden sm:inline -mt-0.5">
              Rwanda Living & Mobility
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Animated Highlighting Pill */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`h-9 px-3.5 rounded-full text-xs sm:text-sm font-tenor transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[#0D3846] text-white font-bold shadow-md'
                    : 'text-slate-600 hover:text-[#0D3846] font-medium hover:bg-slate-100/70'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A2A] shadow-[0_0_8px_#C85A2A] animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions with Identical Button Height (h-9) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Elegant Currency Selector Pill */}
          <button
            onClick={toggleCurrency}
            className="h-9 px-3 rounded-xl skeu-btn-frosted flex items-center justify-center gap-2 text-xs font-tenor shrink-0 transition-all hover:bg-white/90 group"
            title={`Active: ${currency} (Click to toggle USD / RWF)`}
          >
            <Globe className="w-3.5 h-3.5 text-[#0D3846] group-hover:text-[#C85A2A] transition-colors shrink-0" />
            <div className="flex items-center text-[11px] font-bold tracking-tight">
              <span className={currency === 'USD' ? 'text-[#C85A2A] font-extrabold' : 'text-slate-400 font-medium'}>
                USD
              </span>
              <span className="text-slate-300 mx-1">|</span>
              <span className={currency === 'RWF' ? 'text-[#C85A2A] font-extrabold' : 'text-slate-400 font-medium'}>
                RWF
              </span>
            </div>
          </button>

          {/* Primary Phone Call CTA */}
          <a
            href="tel:+250788123456"
            className="inline-flex h-9 items-center justify-center gap-1.5 px-3.5 sm:px-4 rounded-xl skeu-btn-teal text-white font-tenor font-semibold text-xs sm:text-sm tracking-tight shrink-0 shadow-md hover:shadow-lg transition-all"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>Book Call</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-900 skeu-btn-frosted shrink-0 transition-all"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Clean Solid White Mobile Drawer with Active Highlighting */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto max-w-6xl mx-auto md:hidden mt-2 bg-white border border-[#E6D7C3] shadow-2xl rounded-2xl p-4 animate-fadeIn space-y-2">
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
                    ? 'bg-gradient-to-r from-[#184F60] to-[#0D3846] text-white shadow-md'
                    : 'text-slate-700 hover:text-[#0D3846] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#C85A2A] animate-pulse" />}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
              </Link>
            );
          })}

          {/* Quick Mobile Contact Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href="https://wa.me/250788123456"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl skeu-btn-terracotta text-white text-xs font-tenor font-bold shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:+250788123456"
              className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-[#0D3846] text-white text-xs font-tenor font-bold shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Book Call</span>
            </a>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-tenor flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0D3846]" />
              <span>Currency</span>
            </span>
            <button
              onClick={toggleCurrency}
              className="h-8 px-3 rounded-lg skeu-btn-frosted text-xs font-tenor font-bold flex items-center gap-2 border border-[#E6D7C3]"
            >
              <span className={currency === 'USD' ? 'text-[#C85A2A] font-extrabold' : 'text-slate-400 font-medium'}>
                USD
              </span>
              <span className="text-slate-300">|</span>
              <span className={currency === 'RWF' ? 'text-[#C85A2A] font-extrabold' : 'text-slate-400 font-medium'}>
                RWF
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
