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

  // Desktop Capsule Variant: Sleek, compact tactile dual slider (icon-only for clean navbar fit)
  return (
    <div
      className={`relative inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-200/90 dark:bg-[#0E0F12] border border-black/10 dark:border-white/10 select-none transition-all ${className}`}
      role="group"
      aria-label="Theme mode switcher"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Switch to Light Theme"
        aria-pressed={theme === 'light'}
        className={`relative z-10 flex items-center justify-center p-1.5 rounded-lg text-xs font-tenor font-bold transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white text-[#111111]'
            : 'text-zinc-500 hover:text-black dark:text-zinc-400'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#D4A017]' : 'text-zinc-400'}`} />
        <span className="sr-only">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Switch to Dark Theme"
        aria-pressed={theme === 'dark'}
        className={`relative z-10 flex items-center justify-center p-1.5 rounded-lg text-xs font-tenor font-bold transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-[#FFC72C] text-[#111111]'
            : 'text-zinc-500 hover:text-white dark:text-zinc-400'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#111111]' : 'text-zinc-400'}`} />
        <span className="sr-only">Dark</span>
      </button>
    </div>
  );
}

