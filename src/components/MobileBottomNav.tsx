'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, Car, CalendarCheck, ClipboardCheck } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>('explore');

  const items = [
    { label: 'Explore', href: '/', id: 'explore', icon: Compass },
    { label: 'Stays', href: '/?type=property', id: 'property', icon: Home },
    { label: 'Vehicles', href: '/?type=car', id: 'car', icon: Car },
    { label: 'Handover', href: '/handover', id: 'handover', icon: ClipboardCheck },
    { label: 'Booking', href: '/checkout', id: 'checkout', icon: CalendarCheck },
  ];

  useEffect(() => {
    const updateActive = () => {
      if (pathname === '/handover') {
        setActiveTab('handover');
      } else if (pathname === '/checkout') {
        setActiveTab('checkout');
      } else if (pathname.startsWith('/listings')) {
        setActiveTab('property');
      } else if (pathname === '/') {
        const search = window.location.search;
        if (search.includes('type=property')) {
          setActiveTab('property');
        } else if (search.includes('type=car')) {
          setActiveTab('car');
        } else {
          setActiveTab('explore');
        }
      }
    };

    updateActive();
    window.addEventListener('popstate', updateActive);
    return () => window.removeEventListener('popstate', updateActive);
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto glass-skeu-nav rounded-2xl px-2 py-1.5 transition-all shadow-xl">
        <div className="grid grid-cols-5 items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActiveTab(item.id);
                  if (pathname === '/' && item.id === 'explore') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (pathname === '/' && (item.id === 'property' || item.id === 'car')) {
                    const el = document.getElementById('properties');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`relative flex flex-col items-center justify-center py-1.5 transition-all duration-300 rounded-xl ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-500 hover:text-[#0D3846]'
                }`}
              >
                {/* Active Capsule Background */}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#184F60] to-[#0D3846] border border-[#082731] shadow-[0_2px_6px_rgba(13,56,70,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] -z-10 animate-fadeIn" />
                )}

                <Icon
                  className={`w-4 h-4 mb-0.5 transition-colors ${
                    isActive ? 'text-[#C85A2A]' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-syne truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A2A] shadow-[0_0_6px_#C85A2A] animate-pulse mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
