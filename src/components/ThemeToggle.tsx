'use client';

import React from 'react';
import { useRental } from '@/lib/rentalContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'nav' | 'drawer' | 'floating';
  className?: string;
}

export default function ThemeToggle({ variant = 'nav', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useRental();

  if (variant === 'drawer') {
    return (
      <div className={`w-full flex items-center justify-between gap-3 ${className}`}>
        <span className="text-xs font-tenor font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          {theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-[#FFC72C]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[#E5B224]" />
          )}
          <span>Appearance</span>
        </span>

        {/* Dual Segmented Slider */}
        <div className="relative inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-[#0E0F12] border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tenor font-bold transition-all duration-200 ${
              theme === 'light'
                ? 'bg-white text-[#111111]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#E5B224]' : 'text-zinc-400'}`} />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tenor font-bold transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-[#FFC72C] text-[#111111]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#111111]' : 'text-zinc-400'}`} />
            <span>Dark</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop Capsule Variant: Single clean icon toggle for an uncluttered navbar
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`h-7 w-7 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-[#FFC72C] hover:bg-black/5 dark:hover:bg-white/10 transition-colors select-none ${className}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-[#FFC72C]" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-zinc-700" />
      )}
    </button>
  );
}

