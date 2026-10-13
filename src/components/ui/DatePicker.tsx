'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

interface DatePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  label?: string;
  className?: string;
  compact?: boolean;
}

export default function DatePicker({
  startDate,
  endDate,
  onChange,
  label = 'Dates',
  className = '',
  compact = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial dates or fallback
  const parseDate = (dStr: string) => {
    const parts = dStr.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const startObj = parseDate(startDate);
  const endObj = parseDate(endDate);

  // Currently viewed month in calendar (0-indexed month)
  const [viewYear, setViewYear] = useState<number>(startObj.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState<number>(startObj.getMonth() || 9); // October is 9

  // Temporary selection state when clicking
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);

  // Sync temp with props
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  // Click outside to close
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7; // Monday = 0, Sunday = 6
  };

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeek(viewYear, viewMonth);

  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handleDayClick = (day: number) => {
    const clickedStr = formatDateStr(viewYear, viewMonth, day);

    if (!tempStart || (tempStart && tempEnd)) {
      // First click: reset and pick start
      setTempStart(clickedStr);
      setTempEnd('');
    } else if (tempStart && !tempEnd) {
      // Second click: pick end
      if (clickedStr < tempStart) {
        setTempStart(clickedStr);
        setTempEnd(tempStart);
        onChange(clickedStr, tempStart);
      } else {
        setTempEnd(clickedStr);
        onChange(tempStart, clickedStr);
      }
      setIsOpen(false);
    }
  };

  // Presets
  const applyPreset = (days: number) => {
    const today = new Date(2026, 9, 14); // Oct 14, 2026 base
    const startStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
    const future = new Date(today);
    future.setDate(today.getDate() + days);
    const endStr = formatDateStr(future.getFullYear(), future.getMonth(), future.getDate());
    
    setTempStart(startStr);
    setTempEnd(endStr);
    onChange(startStr, endStr);
    setIsOpen(false);
  };

  const daysDiff = () => {
    try {
      const s = new Date(tempStart).getTime();
      const e = new Date(tempEnd || tempStart).getTime();
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return '';
    try {
      const d = parseDate(dStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dStr;
    }
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
            <CalendarIcon className="w-4 h-4 text-[#C85A2A] shrink-0" />
            <div className="truncate">
              {label && (
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
                  {label}
                </span>
              )}
              <span className="font-tenor font-bold text-xs sm:text-sm text-slate-900 truncate block leading-tight">
                {formatDisplayDate(tempStart)} — {tempEnd ? formatDisplayDate(tempEnd) : 'Departure'}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* Upper Micro-Label with Calendar Icon */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-tenor font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#C85A2A]" />
              <span className="truncate">{label}</span>
            </div>

            {/* Primary Date Range & Duration Pill */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="truncate pr-1">
                <span className="font-tenor font-bold text-xs sm:text-sm text-slate-900 block truncate">
                  {formatDisplayDate(tempStart)} — {tempEnd ? formatDisplayDate(tempEnd) : 'Pick departure'}
                </span>
              </div>
            </div>

            {/* Supporting Hint */}
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-sans truncate mt-0.5">
              {tempEnd ? 'Instant dates confirmation' : 'Click to select trip dates'}
            </div>
          </div>
        )}

        <span className="text-[10px] font-bold text-[#5A6B3C] bg-[#5A6B3C]/10 border border-[#5A6B3C]/20 px-2 py-0.5 rounded-full shrink-0 group-hover:bg-[#5A6B3C]/20 transition-colors ml-1">
          {tempEnd ? `${daysDiff()}d` : 'Pick'}
        </span>
      </button>

      {/* High-Frost Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[100] glass-high-frost-dropdown rounded-3xl p-4 sm:p-5 w-[320px] sm:w-[350px] animate-fadeIn shadow-2xl">
          {/* Header Month / Year & Navigation */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-tenor font-bold text-sm sm:text-base text-slate-900">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <span key={day} className="text-[11px] font-bold text-slate-400 font-tenor uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateStr(viewYear, viewMonth, dayNum);

              const isStart = dateStr === tempStart;
              const isEnd = dateStr === tempEnd;
              const isInRange =
                tempStart &&
                tempEnd &&
                dateStr > tempStart &&
                dateStr < tempEnd;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-8 rounded-xl text-xs font-semibold transition-all relative flex items-center justify-center ${
                    isStart || isEnd
                      ? 'bg-[#C85A2A] text-white shadow-md font-bold z-10'
                      : isInRange
                      ? 'bg-[#C85A2A]/15 text-[#C85A2A] rounded-none'
                      : 'text-slate-700 hover:bg-[#FAF7F2]'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Presets */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 font-tenor uppercase">Quick:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(3)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-tenor font-bold bg-[#5A6B3C]/10 hover:bg-[#5A6B3C]/20 text-[#5A6B3C] transition-colors"
              >
                3 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-tenor font-bold bg-[#C85A2A]/10 hover:bg-[#C85A2A]/20 text-[#C85A2A] transition-colors"
              >
                1 Week
              </button>
              <button
                type="button"
                onClick={() => applyPreset(14)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-tenor font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                2 Weeks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
