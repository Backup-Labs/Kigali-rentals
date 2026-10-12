'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, Car, CalendarCheck, ClipboardCheck } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const items = [
    { label: 'Explore', href: '/', icon: Compass },
    { label: 'Stays', href: '/?type=property', icon: Home },
    { label: 'Vehicles', href: '/?type=car', icon: Car },
    { label: 'Handover', href: '/handover', icon: ClipboardCheck },
    { label: 'Booking', href: '/checkout', icon: CalendarCheck },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto glass-skeu-nav rounded-2xl px-2 py-1.5 transition-all">
        <div className="grid grid-cols-5 items-center">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 transition-all rounded-xl ${
                  isActive
                    ? 'text-[#0D3846] font-bold bg-[#0D3846]/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'text-slate-500 hover:text-[#0D3846]'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${isActive ? 'text-[#C85A2A]' : 'text-slate-400'}`} />
                <span className="text-[10px] font-syne">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A2A] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
