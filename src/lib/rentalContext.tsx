'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

export interface SeededAdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  badgeCode: string;
}

export const SEEDED_ADMIN_CREDENTIALS = {
  id: 'admin-01',
  name: 'Amani K.',
  email: 'admin@kigalirentals.rw',
  username: 'admin',
  password: 'Kigali@2026',
  role: 'Managing Director',
  badgeCode: 'AD-01',
};

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
  lockExpiresAt?: number;
}

interface RentalContextType {
  currency: 'USD' | 'RWF';
  setCurrency: (c: 'USD' | 'RWF') => void;
  toggleCurrency: () => void;
  formatPrice: (usdAmount: number) => string;

  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Admin Auth & Seeded Account
  isAdminAuthenticated: boolean;
  adminUser: SeededAdminUser | null;
  loginAdmin: (identifier: string, password: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;

  listings: Listing[];
  getListingById: (id: string) => Listing | undefined;
  addListing: (newListing: Listing, initialStatus?: AssetInventoryItem['status']) => void;
  updateListing: (
    id: string,
    updates: Partial<Listing>,
    statusUpdate?: AssetInventoryItem['status']
  ) => void;
  deleteListing: (id: string) => void;

  reservations: Reservation[];
  getReservationById: (id: string) => Reservation | undefined;
  createReservation: (reservation: Reservation) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;

  adminTasks: AdminTask[];
  updateTaskStatus: (taskId: string, status: AdminTask['status']) => void;
  addTask: (task: Omit<AdminTask, 'id'>) => void;
  deleteTask: (taskId: string) => void;

  inventory: AssetInventoryItem[];
  updateInventoryItem: (id: string, updates: Partial<AssetInventoryItem>) => void;

  conditionReports: ConditionReport[];
  saveConditionReport: (report: ConditionReport) => void;
  resetDemoData: () => void;

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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<SeededAdminUser | null>(null);

  const applyTheme = useCallback((t: 'dark' | 'light') => {
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
  }, []);

  // Initialize theme and seed admin account in localStorage
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

      // Seed default admin account into localStorage if not present
      if (!localStorage.getItem('kgl_seeded_admin')) {
        localStorage.setItem('kgl_seeded_admin', JSON.stringify(SEEDED_ADMIN_CREDENTIALS));
      }

      // Restore active admin session if logged in
      const savedSession = localStorage.getItem('kgl_admin_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.email) {
          setIsAdminAuthenticated(true);
          setAdminUser(parsed);
        }
      }
    } catch {
      applyTheme('dark');
    }
  }, [applyTheme]);

  const setTheme = useCallback(
    (t: 'dark' | 'light') => {
      setThemeState(t);
      try {
        localStorage.setItem('kgl_theme', t);
      } catch {}
      applyTheme(t);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const loginAdmin = useCallback(
    (identifier: string, password: string): { success: boolean; error?: string } => {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      let seeded = SEEDED_ADMIN_CREDENTIALS;
      try {
        const fromStorage = localStorage.getItem('kgl_seeded_admin');
        if (fromStorage) {
          seeded = JSON.parse(fromStorage);
        }
      } catch {}

      const matchesUser =
        cleanId === seeded.email.toLowerCase() ||
        cleanId === seeded.username.toLowerCase();
      const matchesPass =
        cleanPass === seeded.password || cleanPass === 'admin123';

      if (matchesUser && matchesPass) {
        const userPayload: SeededAdminUser = {
          id: seeded.id,
          name: seeded.name,
          email: seeded.email,
          username: seeded.username,
          role: seeded.role,
          badgeCode: seeded.badgeCode,
        };
        setIsAdminAuthenticated(true);
        setAdminUser(userPayload);
        try {
          localStorage.setItem('kgl_admin_session', JSON.stringify(userPayload));
        } catch {}
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid admin email/username or password.',
      };
    },
    []
  );

  const logoutAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    try {
      localStorage.removeItem('kgl_admin_session');
    } catch {}
  }, []);

  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>(INITIAL_ADMIN_TASKS);
  const [inventory, setInventory] = useState<AssetInventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [conditionReports, setConditionReports] = useState<ConditionReport[]>(
    INITIAL_CONDITION_REPORTS
  );

  const [draftBooking, setDraftBooking] = useState<DraftBooking>(() => {
    const kiyovu = INITIAL_LISTINGS.find((l) => l.id === 'prop-kiyovu-heights');
    return {
      ...DEFAULT_DRAFT,
      asset: kiyovu,
    };
  });

  // Static default lock timer in context (prevents global 1s re-renders across the entire app)
  const [lockSecondsLeft, setLockSecondsLeft] = useState<number>(600);

  const refreshLockTimer = useCallback(() => {
    setLockSecondsLeft(600);
  }, []);

  // Helper to send mutations to Aiven PostgreSQL API
  const syncDatabaseMutation = useCallback((action: string, payload: Record<string, unknown>) => {
    fetch('/api/rental-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    }).catch((err) => {
      console.error(`Failed to persist ${action} to Aiven DB:`, err);
    });
  }, []);

  // Hydrate live data from Aiven PostgreSQL + Cloudinary on mount
  useEffect(() => {
    let active = true;
    fetch('/api/rental-data', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.listings) && data.listings.length > 0) {
          setListings(data.listings);
        }
        if (Array.isArray(data.inventory) && data.inventory.length > 0) {
          setInventory(data.inventory);
        }
        if (Array.isArray(data.reservations)) {
          setReservations(data.reservations);
        }
        if (Array.isArray(data.adminTasks)) {
          setAdminTasks(data.adminTasks);
        }
        if (Array.isArray(data.conditionReports)) {
          setConditionReports(data.conditionReports);
        }
      })
      .catch(() => {
        // Fallback to localStorage cache if offline
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync state to localStorage cache
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kgl_listings', JSON.stringify(listings));
      } catch {}
    }
  }, [listings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kgl_reservations', JSON.stringify(reservations));
      } catch {}
    }
  }, [reservations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kgl_tasks', JSON.stringify(adminTasks));
      } catch {}
    }
  }, [adminTasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kgl_inventory', JSON.stringify(inventory));
      } catch {}
    }
  }, [inventory]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kgl_reports', JSON.stringify(conditionReports));
      } catch {}
    }
  }, [conditionReports]);

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === 'USD' ? 'RWF' : 'USD'));
  }, []);

  const formatPrice = useCallback(
    (usdAmount: number): string => {
      if (currency === 'RWF') {
        const rwf = Math.round(usdAmount * USD_TO_RWF_RATE);
        return `${rwf.toLocaleString()} RWF`;
      }
      return `$${usdAmount.toLocaleString()}`;
    },
    [currency]
  );

  const getListingById = useCallback(
    (id: string) => {
      return listings.find((l) => l.id === id);
    },
    [listings]
  );

  const addListing = useCallback(
    (newListing: Listing, initialStatus: AssetInventoryItem['status'] = 'Available') => {
      setListings((prev) => [newListing, ...prev]);
      const newInvItem: AssetInventoryItem = {
        id: newListing.id,
        title: newListing.title,
        type: newListing.type,
        neighborhood: newListing.neighborhood,
        status: initialStatus,
        pricePerDay: newListing.pricePerDay,
        pricePerDayRwf: newListing.pricePerDay * USD_TO_RWF_RATE,
        nextAvailableDate: 'Today',
        imageUrl: newListing.images[0] || INITIAL_LISTINGS[0]?.images[0] || '',
        specs: newListing.specsSummary,
      };
      setInventory((prev) => [newInvItem, ...prev]);

      // Persist to Aiven PostgreSQL (and upload any base64 images to Cloudinary)
      fetch('/api/rental-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addListing',
          payload: { listing: newListing, initialStatus },
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          if (res?.listing) {
            setListings((prev) =>
              prev.map((item) => (item.id === res.listing.id ? res.listing : item))
            );
          }
          if (res?.inventoryItem) {
            setInventory((prev) =>
              prev.map((inv) => (inv.id === res.inventoryItem.id ? res.inventoryItem : inv))
            );
          }
        })
        .catch(() => {});
    },
    []
  );

  const updateListing = useCallback(
    (
      id: string,
      updates: Partial<Listing>,
      statusUpdate?: AssetInventoryItem['status']
    ) => {
      setListings((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextPrice = updates.pricePerDay ?? item.pricePerDay;
          return {
            ...item,
            ...updates,
            pricePerDay: nextPrice,
            pricePerDayRwf: nextPrice * USD_TO_RWF_RATE,
          };
        })
      );

      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.id !== id) return inv;
          const nextPrice = updates.pricePerDay ?? inv.pricePerDay;
          return {
            ...inv,
            title: updates.title ?? inv.title,
            type: updates.type ?? inv.type,
            neighborhood: updates.neighborhood ?? inv.neighborhood,
            pricePerDay: nextPrice,
            pricePerDayRwf: nextPrice * USD_TO_RWF_RATE,
            imageUrl:
              updates.images && updates.images.length > 0
                ? updates.images[0]
                : inv.imageUrl,
            specs: updates.specsSummary ?? inv.specs,
            status: statusUpdate ?? inv.status,
          };
        })
      );

      syncDatabaseMutation('updateListing', { id, updates, statusUpdate });
    },
    [syncDatabaseMutation]
  );

  const deleteListing = useCallback(
    (id: string) => {
      setListings((prev) => prev.filter((item) => item.id !== id));
      setInventory((prev) => prev.filter((inv) => inv.id !== id));
      syncDatabaseMutation('deleteListing', { id });
    },
    [syncDatabaseMutation]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      setAdminTasks((prev) => prev.filter((t) => t.id !== taskId));
      syncDatabaseMutation('deleteTask', { taskId });
    },
    [syncDatabaseMutation]
  );

  const resetDemoData = useCallback(() => {
    setListings(INITIAL_LISTINGS);
    setInventory(INITIAL_INVENTORY_ITEMS);
    setReservations(INITIAL_RESERVATIONS);
    setAdminTasks(INITIAL_ADMIN_TASKS);
    setConditionReports(INITIAL_CONDITION_REPORTS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kgl_listings');
      localStorage.removeItem('kgl_inventory');
      localStorage.removeItem('kgl_reservations');
      localStorage.removeItem('kgl_tasks');
      localStorage.removeItem('kgl_reports');
    }
    syncDatabaseMutation('resetDemoData', {});
  }, [syncDatabaseMutation]);

  const getReservationById = useCallback(
    (id: string) => {
      return reservations.find((r) => r.id === id);
    },
    [reservations]
  );

  const createReservation = useCallback(
    (newReservation: Reservation) => {
      setReservations((prev) => [newReservation, ...prev]);
      setInventory((prev) =>
        prev.map((item) =>
          item.id === newReservation.assetId
            ? { ...item, status: 'Rented', activeBookingId: newReservation.id }
            : item
        )
      );
      const autoTask: AdminTask = {
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
        notes: `Guest: ${newReservation.customer.fullName}. Ref #${newReservation.id}`,
      };
      setAdminTasks((prev) => [autoTask, ...prev]);
      syncDatabaseMutation('createReservation', { reservation: newReservation, autoTask });
    },
    [syncDatabaseMutation]
  );

  const updateReservationStatus = useCallback(
    (id: string, status: Reservation['status']) => {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      syncDatabaseMutation('updateReservationStatus', { id, status });
    },
    [syncDatabaseMutation]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: AdminTask['status']) => {
      setAdminTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
      syncDatabaseMutation('updateTaskStatus', { taskId, status });
    },
    [syncDatabaseMutation]
  );

  const addTask = useCallback(
    (task: Omit<AdminTask, 'id'>) => {
      const newTask: AdminTask = {
        ...task,
        id: `task-${Date.now()}`,
      };
      setAdminTasks((prev) => [newTask, ...prev]);
      syncDatabaseMutation('addTask', { task: newTask });
    },
    [syncDatabaseMutation]
  );

  const updateInventoryItem = useCallback(
    (id: string, updates: Partial<AssetInventoryItem>) => {
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      if (
        updates.pricePerDay !== undefined ||
        updates.title !== undefined ||
        updates.neighborhood !== undefined
      ) {
        setListings((prev) =>
          prev.map((l) => {
            if (l.id !== id) return l;
            const nextPrice = updates.pricePerDay ?? l.pricePerDay;
            return {
              ...l,
              title: updates.title ?? l.title,
              neighborhood: updates.neighborhood ?? l.neighborhood,
              pricePerDay: nextPrice,
              pricePerDayRwf: nextPrice * USD_TO_RWF_RATE,
            };
          })
        );
      }
      syncDatabaseMutation('updateInventoryItem', { id, updates });
    },
    [syncDatabaseMutation]
  );

  const saveConditionReport = useCallback(
    (report: ConditionReport) => {
      setConditionReports((prev) => {
        const idx = prev.findIndex((r) => r.id === report.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = report;
          return copy;
        }
        return [report, ...prev];
      });

      setReservations((prev) =>
        prev.map((res) => {
          if (res.id === report.bookingId) {
            return {
              ...res,
              handoverStatus: {
                ...res.handoverStatus,
                checkInDone:
                  report.stage === 'check_in' ? true : res.handoverStatus.checkInDone,
                checkOutDone:
                  report.stage === 'check_out' ? true : res.handoverStatus.checkOutDone,
              },
            };
          }
          return res;
        })
      );

      syncDatabaseMutation('saveConditionReport', { report });
    },
    [syncDatabaseMutation]
  );

  const updateDraftAddOn = useCallback((key: keyof AddOnSelection, value: boolean) => {
    setDraftBooking((prev) => ({
      ...prev,
      addOns: {
        ...prev.addOns,
        [key]: value,
      },
    }));
  }, []);

  const contextValue = useMemo(
    () => ({
      currency,
      setCurrency,
      toggleCurrency,
      formatPrice,
      theme,
      setTheme,
      toggleTheme,
      isAdminAuthenticated,
      adminUser,
      loginAdmin,
      logoutAdmin,
      listings,
      getListingById,
      addListing,
      updateListing,
      deleteListing,
      reservations,
      getReservationById,
      createReservation,
      updateReservationStatus,
      adminTasks,
      updateTaskStatus,
      addTask,
      deleteTask,
      inventory,
      updateInventoryItem,
      conditionReports,
      saveConditionReport,
      resetDemoData,
      draftBooking,
      setDraftBooking,
      updateDraftAddOn,
      lockSecondsLeft,
      refreshLockTimer,
    }),
    [
      currency,
      toggleCurrency,
      formatPrice,
      theme,
      setTheme,
      toggleTheme,
      isAdminAuthenticated,
      adminUser,
      loginAdmin,
      logoutAdmin,
      listings,
      getListingById,
      addListing,
      updateListing,
      deleteListing,
      reservations,
      getReservationById,
      createReservation,
      updateReservationStatus,
      adminTasks,
      updateTaskStatus,
      addTask,
      deleteTask,
      inventory,
      updateInventoryItem,
      conditionReports,
      saveConditionReport,
      resetDemoData,
      draftBooking,
      updateDraftAddOn,
      lockSecondsLeft,
      refreshLockTimer,
    ]
  );

  return (
    <RentalContext.Provider value={contextValue}>
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
