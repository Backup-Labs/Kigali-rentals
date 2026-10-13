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
        } ${isOpen ? 'border-[#C85A2A] ring-2 ring-[#C85A2A]/20 bg-white' : ''}`}
      >
        {compact ? (
          <div className="flex items-center gap-2 truncate pr-1">
            {icon && <span className="shrink-0">{icon}</span>}
            <div className="truncate">
              {label && (
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
                  {label}
                </span>
              )}
              <span className="font-tenor font-bold text-xs sm:text-sm text-slate-900 truncate block leading-tight">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {label && (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-tenor font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="truncate">{label}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-1.5">
              <span className="font-tenor font-bold text-xs sm:text-sm text-slate-900 truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            {selectedOption?.description && (
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-sans truncate mt-0.5">
                {selectedOption.description}
              </div>
            )}
          </div>
        )}

        <div
          className={`w-5 h-5 rounded-full bg-slate-100/90 flex items-center justify-center shrink-0 text-slate-500 transition-transform duration-200 group-hover:bg-[#C85A2A]/10 group-hover:text-[#C85A2A] ml-1 ${
            isOpen ? 'rotate-180 bg-[#C85A2A]/15 text-[#C85A2A]' : ''
          }`}
        >
          <ChevronDown className="w-3 h-3" />
        </div>
      </button>

      {/* High-Frost Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] glass-high-frost-dropdown rounded-2xl p-1.5 max-h-72 overflow-y-auto animate-fadeIn shadow-2xl">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3.5 py-2.5 mx-0 my-0.5 rounded-xl text-left transition-all duration-150 flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#C85A2A]/12 text-[#C85A2A] font-bold border border-[#C85A2A]/25 shadow-[inset_0_1px_2px_rgba(200,90,42,0.08)]'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="truncate">
                    <span className="block font-syne font-semibold text-xs sm:text-sm truncate">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-[11px] text-slate-400 block font-sans font-normal truncate mt-0.5">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#C85A2A] text-white flex items-center justify-center shrink-0 shadow-xs">
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
