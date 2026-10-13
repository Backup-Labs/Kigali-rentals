'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, Car, MessageSquare, Phone } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>('explore');

  const items = [
    { label: 'Explore', href: '/', id: 'explore', icon: Compass, isExternal: false },
    { label: 'Vehicles', href: '/#vehicles', id: 'vehicles', icon: Car, isExternal: false },
    { label: 'Apartments', href: '/#apartments', id: 'apartments', icon: Home, isExternal: false },
    { label: 'WhatsApp', href: 'https://wa.me/250788123456', id: 'whatsapp', icon: MessageSquare, isExternal: true },
    { label: 'Call Us', href: 'tel:+250788123456', id: 'call', icon: Phone, isExternal: true },
  ];

  useEffect(() => {
    const updateActive = () => {
      if (pathname.startsWith('/listings')) {
        setActiveTab('apartments');
      } else if (pathname === '/') {
        const hash = window.location.hash;
        const search = window.location.search;

        if (hash === '#vehicles' || search.includes('type=car')) {
          setActiveTab('vehicles');
          return;
        }
        if (hash === '#apartments' || hash === '#properties' || search.includes('type=property')) {
          setActiveTab('apartments');
          return;
        }

        const scrollY = window.scrollY;
        const aptsEl = document.getElementById('apartments') || document.getElementById('properties');
        const vehEl = document.getElementById('vehicles');

        if (aptsEl && scrollY >= aptsEl.offsetTop - 250) {
          setActiveTab('apartments');
        } else if (vehEl && scrollY >= vehEl.offsetTop - 250) {
          setActiveTab('vehicles');
        } else {
          setActiveTab('explore');
        }
      }
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('hashchange', updateActive);
    window.addEventListener('popstate', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('hashchange', updateActive);
      window.removeEventListener('popstate', updateActive);
    };
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto glass-skeu-nav rounded-2xl px-2 py-1.5 transition-all shadow-xl">
        <div className="grid grid-cols-5 items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const content = (
              <>
                {/* Active Capsule Background */}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#184F60] to-[#0D3846] border border-[#082731] shadow-[0_2px_6px_rgba(13,56,70,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] -z-10 animate-fadeIn" />
                )}

                <Icon
                  className={`w-4 h-4 mb-0.5 transition-colors ${
                    item.id === 'whatsapp'
                      ? 'text-[#C85A2A]'
                      : isActive
                      ? 'text-[#C85A2A]'
                      : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-syne truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A2A] shadow-[0_0_6px_#C85A2A] animate-pulse mt-0.5" />
                )}
              </>
            );

            const className = `relative flex flex-col items-center justify-center py-1.5 transition-all duration-300 rounded-xl ${
              isActive
                ? 'text-white font-bold'
                : 'text-slate-500 hover:text-[#0D3846]'
            }`;

            if (item.isExternal) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.id === 'whatsapp' ? '_blank' : undefined}
                  rel={item.id === 'whatsapp' ? 'noopener noreferrer' : undefined}
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActiveTab(item.id);
                  if (pathname === '/' && item.id === 'explore') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (pathname === '/' && item.id === 'vehicles') {
                    const el = document.getElementById('vehicles');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else if (pathname === '/' && item.id === 'apartments') {
                    const el =
                      document.getElementById('apartments') || document.getElementById('properties');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
