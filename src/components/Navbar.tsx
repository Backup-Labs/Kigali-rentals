'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRental } from '@/lib/rentalContext';
import {
  Menu,
  X,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  id: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { currency, toggleCurrency, lockSecondsLeft } = useRental();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'About', href: '/#about', id: 'about' },
    { label: 'How it works', href: '/#how-it-works', id: 'how-it-works' },
    { label: 'Properties', href: '/?type=property', id: 'property' },
    { label: 'Vehicles', href: '/?type=car', id: 'car' },
    { label: 'Handover', href: '/handover', id: 'handover' },
  ];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCheckout = pathname === '/checkout';

  // Determine active tab on mount, route change, search param, and scroll position
  useEffect(() => {
    const determineActiveTab = () => {
      if (pathname === '/handover') {
        setActiveTab('handover');
        return;
      }
      if (pathname === '/checkout') {
        setActiveTab('checkout');
        return;
      }
      if (pathname.startsWith('/listings')) {
        setActiveTab('property');
        return;
      }

      if (pathname === '/') {
        const hash = window.location.hash;
        const search = window.location.search;

        if (search.includes('type=property')) {
          setActiveTab('property');
          return;
        }
        if (search.includes('type=car')) {
          setActiveTab('car');
          return;
        }
        if (hash === '#how-it-works') {
          setActiveTab('how-it-works');
          return;
        }
        if (hash === '#about') {
          setActiveTab('about');
          return;
        }

        // Scroll spy on homepage sections
        const scrollY = window.scrollY;
        const aboutEl = document.getElementById('about');
        const howEl = document.getElementById('how-it-works');
        const propEl = document.getElementById('properties');

        if (aboutEl && scrollY >= aboutEl.offsetTop - 200) {
          setActiveTab('about');
        } else if (howEl && scrollY >= howEl.offsetTop - 200) {
          setActiveTab('how-it-works');
        } else if (propEl && scrollY >= propEl.offsetTop - 250) {
          setActiveTab('property');
        } else {
          setActiveTab('home');
        }
      }
    };

    determineActiveTab();

    window.addEventListener('scroll', determineActiveTab, { passive: true });
    window.addEventListener('hashchange', determineActiveTab);
    window.addEventListener('popstate', determineActiveTab);

    return () => {
      window.removeEventListener('scroll', determineActiveTab);
      window.removeEventListener('hashchange', determineActiveTab);
      window.removeEventListener('popstate', determineActiveTab);
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
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${targetId}`);
        }
      } else if (item.href.startsWith('/?type=')) {
        const targetEl = document.getElementById('properties');
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
              className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-amber-200"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4h4v12h12v4H4V4zm8 5h4v4h-4V9z" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-syne text-base sm:text-lg font-extrabold tracking-tight text-[#0D3846] leading-tight">
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
                className={`relative py-1.5 px-3.5 rounded-full text-xs sm:text-sm font-syne font-semibold transition-all duration-300 flex items-center gap-1.5 group ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-600 hover:text-[#0D3846] font-medium hover:bg-white/60'
                }`}
              >
                {/* Tactile Capsule Highlight Pill */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#184F60] to-[#0D3846] border border-[#082731] shadow-[0_2px_8px_rgba(13,56,70,0.35),inset_0_1px_1px_rgba(255,255,255,0.45)] -z-10 animate-fadeIn" />
                )}
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A2A] shadow-[0_0_8px_#C85A2A] animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Hold Badge (if in checkout flow) */}
          {isCheckout && (
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C85A2A]/10 text-[#C85A2A] border border-[#C85A2A]/25 font-mono text-xs font-semibold shadow-[inset_0_1px_2px_rgba(200,90,42,0.1)]">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{formatTimer(lockSecondsLeft)}</span>
            </div>
          )}

          {/* Tactile Currency Toggle */}
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl skeu-btn-frosted text-xs font-semibold text-slate-700"
            title="Switch Currency (USD / RWF)"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400">Curr:</span>
            <span className="font-mono text-[#C85A2A] font-bold">{currency}</span>
          </button>

          {/* Primary CTA (Skeuomorphic Deep Teal Button) */}
          <Link
            href="/#search"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                const s = document.getElementById('search');
                if (s) s.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl skeu-btn-teal text-white font-syne font-semibold text-xs sm:text-sm tracking-tight"
          >
            Get Started
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl text-slate-700 hover:text-slate-900 skeu-btn-frosted"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Glassmorphic Mobile Drawer with Active Highlighting */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto max-w-6xl mx-auto md:hidden mt-2 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-2xl p-4 animate-fadeIn space-y-2">
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
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-syne font-semibold transition-all ${
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

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-syne">Active Currency:</span>
            <button
              onClick={toggleCurrency}
              className="px-3 py-1 bg-[#0D3846] text-white rounded-lg text-xs font-mono font-bold"
            >
              Switch to {currency === 'USD' ? 'RWF' : 'USD'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
