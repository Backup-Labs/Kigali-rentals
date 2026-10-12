'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRental } from '@/lib/rentalContext';
import {
  Menu,
  X,
  PhoneCall,
  Clock,
  Home,
  Compass,
  Car,
  Layers,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currency, toggleCurrency, lockSecondsLeft } = useRental();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Modern navigation matching the clean glassmorphic reference
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/#about' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Properties', href: '/?type=property' },
    { label: 'Vehicles', href: '/?type=car' },
    { label: 'Handover', href: '/handover' },
  ];

  const isCheckout = pathname === '/checkout';

  return (
    <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none transition-all">
      {/* Floating Glassmorphic + Skeuomorphic Capsule Bar */}
      <div className="pointer-events-auto max-w-6xl mx-auto glass-skeu-nav rounded-2xl sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all">
        {/* Brand Logo with Tactile Bevel */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {navItems.map((item) => {
            const isHome = item.label === 'Home';
            const isActive = isHome ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-xs sm:text-sm transition-all relative py-1 px-2 rounded-lg ${
                  isActive
                    ? 'text-[#0D3846] font-bold bg-[#0D3846]/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]'
                    : 'text-slate-600 hover:text-[#0D3846] font-medium hover:bg-white/60'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#C85A2A] rounded-full" />
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

      {/* Glassmorphic Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto max-w-6xl mx-auto md:hidden mt-2 bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-4 animate-fadeIn space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-syne font-semibold text-slate-700 hover:text-[#0D3846] hover:bg-white/80 transition-colors"
            >
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">Active Currency:</span>
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
