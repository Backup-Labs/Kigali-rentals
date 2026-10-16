'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  label,
  icon,
  placeholder = 'Select an option',
  className = '',
  compact = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Luxury Tactile Trigger Cell */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left skeu-input-cell rounded-xl px-3 sm:px-3.5 transition-all duration-200 group focus:outline-none flex items-center justify-between ${
          compact ? 'h-11 sm:h-12' : 'py-2 sm:py-2.5 rounded-xl sm:rounded-2xl'
        } ${isOpen ? 'border-[#FFC72C] ring-2 ring-[#FFC72C]/20 bg-slate-50 dark:bg-[#141519]' : ''}`}
      >
        {compact ? (
          <div className="flex items-center gap-2 truncate pr-1">
            {icon && <span className="shrink-0 text-[#FFC72C]">{icon}</span>}
            <div className="truncate">
              {label && (
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 block leading-tight">
                  {label}
                </span>
              )}
              <span className="font-tenor font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate block leading-tight">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {label && (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-tenor font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">
                {icon && <span className="shrink-0 text-[#FFC72C]">{icon}</span>}
                <span className="truncate">{label}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-1.5">
              <span className="font-tenor font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            {selectedOption?.description && (
              <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-sans truncate mt-0.5">
                {selectedOption.description}
              </div>
            )}
          </div>
        )}

        <div
          className={`w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400 transition-transform duration-200 group-hover:bg-[#FFC72C]/15 group-hover:text-[#FFC72C] ml-1 ${
            isOpen ? 'rotate-180 bg-[#FFC72C]/20 text-[#FFC72C]' : ''
          }`}
        >
          <ChevronDown className="w-3 h-3" />
        </div>
      </button>

      {/* High-Frost Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] glass-high-frost-dropdown rounded-2xl p-1.5 max-h-72 overflow-y-auto animate-fadeIn shadow-2xl bg-white dark:bg-[#16171E] border border-black/10 dark:border-zinc-700/80">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3.5 py-2.5 mx-0 my-0.5 rounded-xl text-left transition-all duration-150 flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#FFC72C]/15 text-[#FFC72C] font-bold border border-[#FFC72C]/30 shadow-[inset_0_1px_2px_rgba(255,199,44,0.15)]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.icon && <span className="shrink-0 text-[#FFC72C]">{opt.icon}</span>}
                  <div className="truncate">
                    <span className="block font-tenor font-semibold text-xs sm:text-sm truncate">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-sans font-normal truncate mt-0.5">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#FFC72C] text-[#111111] flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
