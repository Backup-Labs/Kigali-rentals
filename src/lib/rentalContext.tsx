'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Listing,
  Reservation,
  AdminTask,
  ConditionReport,
  AssetInventoryItem,
  AddOnSelection,
} from './types';
import {
  INITIAL_LISTINGS,
  INITIAL_RESERVATIONS,
  INITIAL_ADMIN_TASKS,
  INITIAL_CONDITION_REPORTS,
  INITIAL_INVENTORY_ITEMS,
  USD_TO_RWF_RATE,
} from './mockData';

export interface DraftBooking {
  assetId: string;
  asset?: Listing;
  pairedAssetId?: string;
  pairedAsset?: Listing;
  startDate: string;
  endDate: string;
  daysCount: number;
  guestsCount: number;
  addOns: AddOnSelection;
  lockExpiresAt?: number; // timestamp in ms
}

interface RentalContextType {
  currency: 'USD' | 'RWF';
  setCurrency: (c: 'USD' | 'RWF') => void;
  toggleCurrency: () => void;
  formatPrice: (usdAmount: number) => string;

  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  listings: Listing[];
  getListingById: (id: string) => Listing | undefined;
  
  reservations: Reservation[];
  getReservationById: (id: string) => Reservation | undefined;
  createReservation: (reservation: Reservation) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;

  adminTasks: AdminTask[];
  updateTaskStatus: (taskId: string, status: AdminTask['status']) => void;
  addTask: (task: Omit<AdminTask, 'id'>) => void;

  inventory: AssetInventoryItem[];
  updateInventoryItem: (id: string, updates: Partial<AssetInventoryItem>) => void;

  conditionReports: ConditionReport[];
  saveConditionReport: (report: ConditionReport) => void;

  draftBooking: DraftBooking;
  setDraftBooking: React.Dispatch<React.SetStateAction<DraftBooking>>;
  updateDraftAddOn: (key: keyof AddOnSelection, value: boolean) => void;
  lockSecondsLeft: number;
  refreshLockTimer: () => void;
}

const DEFAULT_DRAFT: DraftBooking = {
  assetId: 'prop-kiyovu-heights',
  startDate: '2026-10-14',
  endDate: '2026-10-18',
  daysCount: 4,
  guestsCount: 2,
  addOns: {
    airportPickup: true,
    dedicatedDriver: false,
    childSeat: false,
    wifiHotspot: true,
    damageWaiver: true,
  },
};

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export function RentalProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<'USD' | 'RWF'>('USD');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kgl_theme') as 'dark' | 'light' | null;
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
        applyTheme(saved);
      } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const initial = prefersLight ? 'light' : 'dark';
        setThemeState(initial);
        applyTheme(initial);
      }
    } catch {
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (t: 'dark' | 'light') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (t === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
      }
      root.style.colorScheme = t;
    }
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    try {
      localStorage.setItem('kgl_theme', t);
    } catch {}
    applyTheme(t);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const [listings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kgl_reservations');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_RESERVATIONS;
  });

  const [adminTasks, setAdminTasks] = useState<AdminTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kgl_tasks');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_ADMIN_TASKS;
  });

  const [inventory, setInventory] = useState<AssetInventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kgl_inventory');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_INVENTORY_ITEMS;
  });

  const [conditionReports, setConditionReports] = useState<ConditionReport[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kgl_reports');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_CONDITION_REPORTS;
  });

  const [draftBooking, setDraftBooking] = useState<DraftBooking>(() => {
    const kiyovu = INITIAL_LISTINGS.find(l => l.id === 'prop-kiyovu-heights');
    return {
      ...DEFAULT_DRAFT,
      asset: kiyovu,
    };
  });

  // 10-minute Inventory lock countdown simulation
  const [lockSecondsLeft, setLockSecondsLeft] = useState<number>(600); // 10 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setLockSecondsLeft((prev) => {
        if (prev <= 1) {
          return 600; // auto-refresh simulated lock
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshLockTimer = () => {
    setLockSecondsLeft(600);
  };

  // Sync state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kgl_reservations', JSON.stringify(reservations));
    }
  }, [reservations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kgl_tasks', JSON.stringify(adminTasks));
    }
  }, [adminTasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kgl_inventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kgl_reports', JSON.stringify(conditionReports));
    }
  }, [conditionReports]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'RWF' : 'USD'));
  };

  const formatPrice = (usdAmount: number): string => {
    if (currency === 'RWF') {
      const rwf = Math.round(usdAmount * USD_TO_RWF_RATE);
      return `${rwf.toLocaleString()} RWF`;
    }
    return `$${usdAmount.toLocaleString()}`;
  };

  const getListingById = (id: string) => {
    return listings.find((l) => l.id === id);
  };

  const getReservationById = (id: string) => {
    return reservations.find((r) => r.id === id);
  };

  const createReservation = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);
    // Also update asset status in inventory
    setInventory((prev) =>
      prev.map((item) =>
        item.id === newReservation.assetId
          ? { ...item, status: 'Rented', activeBookingId: newReservation.id }
          : item
      )
    );
    // Add automatic admin tasks for operations
    const newTasks: AdminTask[] = [
      {
        id: `task-${Date.now()}-1`,
        title: `Pre-Arrival Setup: ${newReservation.assetTitle}`,
        type: newReservation.assetType === 'car' ? 'handover_checkin' : 'cleaning',
        assetId: newReservation.assetId,
        assetName: newReservation.assetTitle,
        assetType: newReservation.assetType === 'car' ? 'car' : 'property',
        assignee: 'Operations Team',
        assigneeRole: 'Field Coordinator',
        time: '09:00 AM',
        date: newReservation.startDate,
        status: 'pending',
        priority: 'high',
        notes: `Guest: ${newReservation.customer.fullName}. Ref #${newReservation.id}`
      }
    ];
    setAdminTasks((prev) => [...newTasks, ...prev]);
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const updateTaskStatus = (taskId: string, status: AdminTask['status']) => {
    setAdminTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const addTask = (task: Omit<AdminTask, 'id'>) => {
    const newTask: AdminTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setAdminTasks((prev) => [newTask, ...prev]);
  };

  const updateInventoryItem = (id: string, updates: Partial<AssetInventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const saveConditionReport = (report: ConditionReport) => {
    setConditionReports((prev) => {
      const idx = prev.findIndex((r) => r.id === report.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = report;
        return copy;
      }
      return [report, ...prev];
    });

    // Update reservation handover flags
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id === report.bookingId) {
          return {
            ...res,
            handoverStatus: {
              ...res.handoverStatus,
              checkInDone: report.stage === 'check_in' ? true : res.handoverStatus.checkInDone,
              checkOutDone: report.stage === 'check_out' ? true : res.handoverStatus.checkOutDone,
            },
          };
        }
        return res;
      })
    );
  };

  const updateDraftAddOn = (key: keyof AddOnSelection, value: boolean) => {
    setDraftBooking((prev) => ({
      ...prev,
      addOns: {
        ...prev.addOns,
        [key]: value,
      },
    }));
  };

  return (
    <RentalContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        theme,
        setTheme,
        toggleTheme,
        listings,
        getListingById,
        reservations,
        getReservationById,
        createReservation,
        updateReservationStatus,
        adminTasks,
        updateTaskStatus,
        addTask,
        inventory,
        updateInventoryItem,
        conditionReports,
        saveConditionReport,
        draftBooking,
        setDraftBooking,
        updateDraftAddOn,
        lockSecondsLeft,
        refreshLockTimer,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
}

export function useRental() {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
}

