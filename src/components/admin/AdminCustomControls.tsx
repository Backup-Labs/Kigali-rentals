'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

/* =============================================================================
   1. ADMIN SELECT (CUSTOM FORM & TOOLBAR DROPDOWN)
   ============================================================================= */

export interface AdminSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface AdminSelectProps {
  options: AdminSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  align?: 'left' | 'right';
}

export function AdminSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  menuClassName = '',
  disabled = false,
  size = 'md',
  icon,
  align = 'left',
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

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

  const sizeStyles = {
    sm: 'h-8 px-2.5 text-xs rounded-lg gap-1.5',
    md: 'h-9 px-3 text-xs rounded-xl gap-2',
    lg: 'h-10 px-3.5 text-sm rounded-xl gap-2.5',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium flex items-center justify-between transition-all duration-150 focus:outline-none ${
          sizeStyles[size]
        } ${
          isOpen
            ? 'border-[#FFC72C] ring-2 ring-[#FFC72C]/20 bg-white dark:bg-[#141519]'
            : 'hover:border-zinc-300 dark:hover:border-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          {icon && <span className="shrink-0 text-[#FFC72C]">{icon}</span>}
          {selectedOption?.icon && (
            <span className="shrink-0 text-[#FFC72C]">{selectedOption.icon}</span>
          )}
          <span className="truncate font-semibold text-zinc-900 dark:text-white">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FFC72C]/20 text-[#B45309] dark:text-[#FFC72C]">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FFC72C]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } top-full mt-1.5 min-w-[180px] w-full z-[120] rounded-2xl bg-white dark:bg-[#16171E] border border-zinc-200 dark:border-zinc-700 shadow-2xl p-1.5 max-h-64 overflow-y-auto animate-fadeIn ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all my-0.5 ${
                  isSelected
                    ? 'bg-[#FFC72C]/15 text-[#111111] dark:text-[#FFC72C] font-bold border border-[#FFC72C]/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0 text-[#FFC72C]">{opt.icon}</span>}
                  <div className="truncate">
                    <span className="block truncate font-medium">{opt.label}</span>
                    {opt.description && (
                      <span className="block text-[10px] text-zinc-400 truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FFC72C] stroke-[2.5]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   2. ADMIN STATUS BADGE SELECT (PILL DROPDOWN FOR ASSETS & BOOKINGS)
   ============================================================================= */

export interface StatusBadgeOption {
  value: string;
  label: string;
  dotColor: string; // Tailwind color class for dot
  badgeClasses: string; // Tailwind classes for trigger badge
  description?: string;
}

interface AdminStatusBadgeSelectProps {
  value: string;
  options: StatusBadgeOption[];
  onChange: (value: string) => void;
  className?: string;
  title?: string;
}

export function AdminStatusBadgeSelect({
  value,
  options,
  onChange,
  className = '',
  title = 'Change status',
}: AdminStatusBadgeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = options.find((o) => o.value === value) || options[0];

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

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}
    >
      <button
        type="button"
        title={title}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-150 cursor-pointer focus:outline-none ${
          currentOption?.badgeClasses || 'bg-zinc-100 border-zinc-300 text-zinc-700'
        } ${isOpen ? 'ring-2 ring-[#FFC72C]/40 shadow-sm' : 'hover:opacity-90'}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentOption?.dotColor || 'bg-zinc-400'}`} />
        <span>{currentOption?.label || value}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-60 transition-transform duration-150 ${
            isOpen ? 'rotate-180 opacity-100' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-52 z-[130] rounded-2xl bg-white dark:bg-[#16171E] border border-zinc-200 dark:border-zinc-700 shadow-2xl p-1.5 animate-fadeIn">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            Update Status
          </div>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors ${
                  isSelected
                    ? 'bg-[#FFC72C]/15 text-[#111111] dark:text-[#FFC72C] font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotColor}`} />
                  <div className="truncate">
                    <span className="block font-semibold truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="block text-[10px] text-zinc-400 font-normal truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FFC72C] stroke-[2.5] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   3. ADMIN SINGLE DATE PICKER (CALENDAR POPOVER FOR TASKS & INSPECTIONS)
   ============================================================================= */

interface AdminSingleDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function AdminSingleDatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date...',
  className = '',
}: AdminSingleDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const initialObj = parseDate(value);
  const [viewYear, setViewYear] = useState<number>(initialObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialObj.getMonth());

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
    'July', 'August', 'September', 'October', 'November', 'December',
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeek(viewYear, viewMonth);

  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatDateStr(viewYear, viewMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatDisplay = (dStr: string) => {
    if (!dStr) return '';
    try {
      const d = parseDate(dStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}
    >
      {label && (
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white flex items-center justify-between transition-all duration-150 focus:outline-none ${
          isOpen ? 'border-[#FFC72C] ring-2 ring-[#FFC72C]/20' : 'hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
          <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#FFC72C]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-[140] w-72 rounded-2xl bg-white dark:bg-[#16171E] border border-zinc-200 dark:border-zinc-700 shadow-2xl p-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="font-tenor font-bold text-xs text-zinc-900 dark:text-white">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-6 h-6 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-6 h-6 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-zinc-400">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="h-7" />
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateStr(viewYear, viewMonth, dayNum);
              const isSelected = dateStr === value;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#FFC72C] text-[#111111] font-extrabold shadow-sm'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const todayStr = formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-[#FFC72C] hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-[10px] font-medium text-zinc-400 hover:text-zinc-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   4. ADMIN DATE RANGE PICKER (FOR BOOKINGS & REPORT FILTERS)
   ============================================================================= */

interface AdminDateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  className?: string;
  placeholder?: string;
}

export function AdminDateRangePicker({
  startDate,
  endDate,
  onChange,
  className = '',
  placeholder = 'Filter by dates...',
}: AdminDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);

  const parseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const baseObj = parseDate(startDate);
  const [viewYear, setViewYear] = useState<number>(baseObj.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState<number>(baseObj.getMonth() || 9);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

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
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
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
      setTempStart(clickedStr);
      setTempEnd('');
    } else if (tempStart && !tempEnd) {
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

  const formatDisplay = (s: string, e: string) => {
    if (!s && !e) return placeholder;
    if (s && !e) return `${s} → ...`;
    return `${s} → ${e}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 transition-all focus:outline-none ${
          isOpen ? 'border-[#FFC72C] ring-2 ring-[#FFC72C]/20 bg-white dark:bg-zinc-900' : ''
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#FFC72C]" />
        <span>{formatDisplay(startDate, endDate)}</span>
        {(startDate || endDate) && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('', '');
              setTempStart('');
              setTempEnd('');
            }}
            className="w-4 h-4 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
          >
            <X className="w-2.5 h-2.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-[140] w-72 rounded-2xl bg-white dark:bg-[#16171E] border border-zinc-200 dark:border-zinc-700 shadow-2xl p-3.5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="font-tenor font-bold text-xs text-zinc-900 dark:text-white">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else {
                    setViewMonth((m) => m - 1);
                  }
                }}
                className="w-6 h-6 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else {
                    setViewMonth((m) => m + 1);
                  }
                }}
                className="w-6 h-6 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-zinc-400">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="h-7" />
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateStr(viewYear, viewMonth, dayNum);
              const isStart = dateStr === tempStart;
              const isEnd = dateStr === tempEnd;
              const inRange =
                tempStart && tempEnd && dateStr > tempStart && dateStr < tempEnd;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                    isStart || isEnd
                      ? 'bg-[#FFC72C] text-[#111111] font-extrabold shadow-sm'
                      : inRange
                      ? 'bg-[#FFC72C]/20 text-amber-800 dark:text-[#FFC72C] rounded-none'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Presets & Reset */}
          <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const start = formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());
                const endObj = new Date(now);
                endObj.setDate(now.getDate() + 7);
                const end = formatDateStr(endObj.getFullYear(), endObj.getMonth(), endObj.getDate());
                onChange(start, end);
                setIsOpen(false);
              }}
              className="font-bold text-[#FFC72C] hover:underline"
            >
              Next 7 Days
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('', '');
                setTempStart('');
                setTempEnd('');
                setIsOpen(false);
              }}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

