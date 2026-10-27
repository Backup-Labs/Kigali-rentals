'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRental, SEEDED_ADMIN_CREDENTIALS } from '@/lib/rentalContext';
import {
  Listing,
  AdminTask,
  AssetInventoryItem,
  PropertyCategory,
  VehicleCategory,
  Transmission,
  FuelType,
  DriverOption,
  Reservation,
} from '@/lib/types';
import { USD_TO_RWF_RATE } from '@/lib/mockData';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Building2,
  Car,
  CalendarCheck,
  ClipboardCheck,
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  Image as ImageIcon,
  Star,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  ExternalLink,
  X,
  Check,
  Sparkles,
  Share2,
  MapPin,
  Bed,
  Bath,
  Users,
  Maximize2,
  Gauge,
  Fuel,
  ShieldCheck,
  RotateCcw,
  Menu,
  Globe,
  ArrowUpRight,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  KeyRound,
  Tag,
  FileText,
  Layers,
} from 'lucide-react';

const SocialFlyerModal = dynamic(() => import('@/components/SocialFlyerModal'), {
  ssr: false,
});

type DashboardSection = 'overview' | 'listings' | 'bookings' | 'tasks';

interface ListingFormState {
  id: string;
  type: 'property' | 'car';
  title: string;
  subtitle: string;
  neighborhood: string;
  address: string;
  description: string;
  images: string[];
  pricePerDay: number;
  securityDeposit: number;
  cleaningOrServiceFee: number;
  status: AssetInventoryItem['status'];
  featured: boolean;
  isVerified: boolean;
  isInstantBook: boolean;
  badges: string[];
  // Property specific
  propertyCategory: PropertyCategory;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sqm: number;
  hasPool: boolean;
  hasBackupGenerator: boolean;
  hasWaterReservoir: boolean;
  hasFastWifi: boolean;
  amenities: string[];
  rules: string[];
  // Vehicle specific
  vehicleCategory: VehicleCategory;
  seats: number;
  doors: number;
  transmission: Transmission;
  fuelType: FuelType;
  fuelEfficiency: string;
  driverOption: DriverOption;
  driverCostPerDay: number;
  fourWheelDrive: boolean;
  unlimitedMileage: boolean;
  features: string[];
}

const DEFAULT_FORM_STATE: ListingFormState = {
  id: '',
  type: 'property',
  title: '',
  subtitle: '',
  neighborhood: 'Kiyovu',
  address: 'KN 4 Ave, Kiyovu, Kigali',
  description: '',
  images: [],
  pricePerDay: 150,
  securityDeposit: 200,
  cleaningOrServiceFee: 30,
  status: 'Available',
  featured: false,
  isVerified: true,
  isInstantBook: true,
  badges: ['Verified Asset', '24/7 Support'],
  propertyCategory: 'penthouse',
  bedrooms: 2,
  bathrooms: 2,
  maxGuests: 4,
  sqm: 120,
  hasPool: false,
  hasBackupGenerator: true,
  hasWaterReservoir: true,
  hasFastWifi: true,
  amenities: [
    'High-Speed Fiber WiFi',
    'Silent Backup Generator',
    '24/7 Security & CCTV',
    'Secure Parking',
  ],
  rules: ['No smoking indoors', 'Valid ID required at check-in'],
  vehicleCategory: '4x4',
  seats: 5,
  doors: 5,
  transmission: 'automatic',
  fuelType: 'diesel',
  fuelEfficiency: '9.2L / 100km',
  driverOption: 'both',
  driverCostPerDay: 30,
  fourWheelDrive: true,
  unlimitedMileage: true,
  features: [
    'Full-Time 4WD',
    'Comprehensive Insurance',
    '24/7 Roadside Assistance',
    'Apple CarPlay & Bluetooth',
  ],
};

const NEIGHBORHOOD_OPTIONS = [
  'Kiyovu',
  'Nyarutarama',
  'Kimihurura',
  'Gacuriro',
  'Kigali Airport',
  'Kacyiru',
  'Remera',
];

export default function AdminDashboardPage() {
  const {
    isAdminAuthenticated,
    adminUser,
    loginAdmin,
    logoutAdmin,
    listings,
    addListing,
    updateListing,
    deleteListing,
    inventory,
    updateInventoryItem,
    reservations,
    updateReservationStatus,
    adminTasks,
    updateTaskStatus,
    addTask,
    deleteTask,
    resetDemoData,
    formatPrice,
    currency,
    toggleCurrency,
  } = useRental();

  // Admin Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<DashboardSection>('listings');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters for Listings Manager
  const [listingSearch, setListingSearch] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'property' | 'car'>('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<string>('all');

  // Filters for Bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  // Filters for Tasks
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssetId, setNewTaskAssetId] = useState(listings[0]?.id || '');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Jean-Paul Nsengiyumva');
  const [newTaskType, setNewTaskType] = useState<AdminTask['type']>('cleaning');
  const [newTaskPriority, setNewTaskPriority] = useState<AdminTask['priority']>('high');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Listing Studio Modal (Create / Edit with Photo Upload & Descriptions)
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ListingFormState>(DEFAULT_FORM_STATE);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [newBadgeInput, setNewBadgeInput] = useState('');
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [newRuleInput, setNewRuleInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Social Media Flyer & Card Studio state
  const [flyerListing, setFlyerListing] = useState<Listing | null>(null);
  const [isFlyerNewlyCreated, setIsFlyerNewlyCreated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Helper to get operational status from inventory
  const getAssetStatus = (id: string): AssetInventoryItem['status'] => {
    const found = inventory.find((i) => i.id === id);
    return found ? found.status : 'Available';
  };

  // Metrics
  const totalAssets = listings.length;
  const propertiesCount = listings.filter((l) => l.type === 'property').length;
  const vehiclesCount = listings.filter((l) => l.type === 'car').length;
  const availableAssetsCount = inventory.filter((i) => i.status === 'Available').length;
  const rentedAssetsCount = inventory.filter((i) => i.status === 'Rented').length;
  const totalRevenueUsd = reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + (r.pricing?.grandTotal || 0), 0);
  const pendingTasksCount = adminTasks.filter((t) => t.status !== 'completed').length;

  // Open Studio for Creating New Listing
  const handleOpenCreateModal = (defaultType: 'property' | 'car' = 'property') => {
    setEditingListingId(null);
    setFormState({
      ...DEFAULT_FORM_STATE,
      id: `${defaultType === 'car' ? 'veh' : 'prop'}-${Date.now()}`,
      type: defaultType,
      address:
        defaultType === 'car'
          ? 'KN 5 Rd, Kigali International Airport'
          : 'KN 4 Ave, Kiyovu, Kigali',
      neighborhood: defaultType === 'car' ? 'Kigali Airport' : 'Kiyovu',
      pricePerDay: defaultType === 'car' ? 95 : 180,
      securityDeposit: defaultType === 'car' ? 200 : 250,
      cleaningOrServiceFee: defaultType === 'car' ? 15 : 35,
    });
    setImageUrlInput('');
    setIsStudioOpen(true);
  };

  // Open Studio for Editing Existing Listing
  const handleOpenEditModal = (listing: Listing) => {
    setEditingListingId(listing.id);
    const currentStatus = getAssetStatus(listing.id);

    setFormState({
      id: listing.id,
      type: listing.type,
      title: listing.title,
      subtitle: listing.subtitle || '',
      neighborhood: listing.neighborhood,
      address: listing.address || `${listing.neighborhood}, Kigali`,
      description: listing.description || '',
      images: [...(listing.images || [])],
      pricePerDay: listing.pricePerDay,
      securityDeposit: listing.securityDeposit || 200,
      cleaningOrServiceFee: listing.cleaningOrServiceFee || 25,
      status: currentStatus,
      featured: Boolean(listing.featured),
      isVerified: listing.isVerified ?? true,
      isInstantBook: listing.isInstantBook ?? true,
      badges: [...(listing.badges || [])],
      // Property fields
      propertyCategory: listing.propertyDetails?.category || 'penthouse',
      bedrooms: listing.propertyDetails?.bedrooms ?? 2,
      bathrooms: listing.propertyDetails?.bathrooms ?? 2,
      maxGuests: listing.propertyDetails?.maxGuests ?? 4,
      sqm: listing.propertyDetails?.sqm ?? 120,
      hasPool: listing.propertyDetails?.hasPool ?? false,
      hasBackupGenerator: listing.propertyDetails?.hasBackupGenerator ?? true,
      hasWaterReservoir: listing.propertyDetails?.hasWaterReservoir ?? true,
      hasFastWifi: listing.propertyDetails?.hasFastWifi ?? true,
      amenities: [...(listing.propertyDetails?.amenities || DEFAULT_FORM_STATE.amenities)],
      rules: [...(listing.propertyDetails?.rules || DEFAULT_FORM_STATE.rules)],
      // Vehicle fields
      vehicleCategory: listing.vehicleDetails?.category || '4x4',
      seats: listing.vehicleDetails?.seats ?? 5,
      doors: listing.vehicleDetails?.doors ?? 5,
      transmission: listing.vehicleDetails?.transmission || 'automatic',
      fuelType: listing.vehicleDetails?.fuelType || 'diesel',
      fuelEfficiency: listing.vehicleDetails?.fuelEfficiency || '9.5L / 100km',
      driverOption: listing.vehicleDetails?.driverOption || 'both',
      driverCostPerDay: listing.vehicleDetails?.driverCostPerDay ?? 30,
      fourWheelDrive: listing.vehicleDetails?.fourWheelDrive ?? true,
      unlimitedMileage: listing.vehicleDetails?.unlimitedMileage ?? true,
      features: [...(listing.vehicleDetails?.features || DEFAULT_FORM_STATE.features)],
    });
    setImageUrlInput('');
    setIsStudioOpen(true);
  };

  // Compress & convert uploaded image file to Data URL
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressedDataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const uploadedUrls: string[] = [];
    for (const file of validFiles) {
      try {
        const dataUrl = await processImageFile(file);
        uploadedUrls.push(dataUrl);
      } catch {
        // ignore failed file
      }
    }

    if (uploadedUrls.length > 0) {
      setFormState((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      showToast(`Uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''}`);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setFormState((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));
    setImageUrlInput('');
  };

  const handleSetCoverImage = (idx: number) => {
    if (idx === 0) return;
    setFormState((prev) => {
      const next = [...prev.images];
      const [selected] = next.splice(idx, 1);
      next.unshift(selected);
      return { ...prev, images: next };
    });
  };

  const handleRemoveImage = (idx: number) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  // Save Listing (Create or Update)
  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      showToast('Please enter a title for the listing.');
      return;
    }

    const fallbackImage =
      formState.type === 'car'
        ? 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80'
        : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

    const finalImages =
      formState.images.length > 0 ? formState.images : [fallbackImage];

    const specsSummary =
      formState.type === 'property'
        ? `${formState.bedrooms} Bed${formState.bedrooms > 1 ? 's' : ''} • ${formState.bathrooms} Bath${formState.bathrooms > 1 ? 's' : ''} • ${formState.maxGuests} Guests • ${formState.sqm} sqm`
        : `${formState.seats} Seats • ${formState.transmission === 'automatic' ? 'Automatic' : 'Manual'} • ${formState.fourWheelDrive ? '4x4 AWD' : formState.fuelType}`;

    const existingListing = editingListingId
      ? listings.find((l) => l.id === editingListingId)
      : undefined;

    const constructedListing: Listing = {
      id: editingListingId || formState.id || `${formState.type}-${Date.now()}`,
      type: formState.type,
      title: formState.title.trim(),
      subtitle:
        formState.subtitle.trim() ||
        (formState.type === 'property'
          ? `Luxury ${formState.propertyCategory} in ${formState.neighborhood}`
          : `Executive ${formState.vehicleCategory.toUpperCase()} Fleet`),
      neighborhood: formState.neighborhood,
      address: formState.address.trim() || `${formState.neighborhood}, Kigali`,
      description:
        formState.description.trim() ||
        `Experience refined comfort with ${formState.title.trim()} in ${formState.neighborhood}, Kigali.`,
      images: finalImages,
      pricePerDay: Number(formState.pricePerDay) || 100,
      pricePerDayRwf: (Number(formState.pricePerDay) || 100) * USD_TO_RWF_RATE,
      securityDeposit: Number(formState.securityDeposit) || 0,
      cleaningOrServiceFee: Number(formState.cleaningOrServiceFee) || 0,
      rating: existingListing?.rating || 4.95,
      reviewCount: existingListing?.reviewCount || 12,
      isVerified: formState.isVerified,
      isInstantBook: formState.isInstantBook,
      featured: formState.featured,
      badges: formState.badges.length > 0 ? formState.badges : ['Verified'],
      specsSummary,
      propertyDetails:
        formState.type === 'property'
          ? {
              category: formState.propertyCategory,
              bedrooms: Number(formState.bedrooms) || 1,
              bathrooms: Number(formState.bathrooms) || 1,
              maxGuests: Number(formState.maxGuests) || 2,
              sqm: Number(formState.sqm) || 80,
              amenities: formState.amenities,
              rules: formState.rules,
              hasBackupGenerator: formState.hasBackupGenerator,
              hasWaterReservoir: formState.hasWaterReservoir,
              hasFastWifi: formState.hasFastWifi,
              hasPool: formState.hasPool,
            }
          : undefined,
      vehicleDetails:
        formState.type === 'car'
          ? {
              category: formState.vehicleCategory,
              seats: Number(formState.seats) || 5,
              doors: Number(formState.doors) || 4,
              transmission: formState.transmission,
              fuelType: formState.fuelType,
              fuelEfficiency: formState.fuelEfficiency || '9.5L / 100km',
              features: formState.features,
              driverOption: formState.driverOption,
              driverCostPerDay: Number(formState.driverCostPerDay) || 30,
              fourWheelDrive: formState.fourWheelDrive,
              unlimitedMileage: formState.unlimitedMileage,
            }
          : undefined,
      crossSellRecommendation: existingListing?.crossSellRecommendation,
    };

    if (editingListingId) {
      updateListing(editingListingId, constructedListing, formState.status);
      showToast(`Updated "${constructedListing.title}"`);
      setIsStudioOpen(false);
    } else {
      addListing(constructedListing, formState.status);
      showToast(`Published "${constructedListing.title}" — Social Flyer ready!`);
      setIsStudioOpen(false);
      // Automatically open Social Media Flyer & Card Generator for the new listing
      setFlyerListing(constructedListing);
      setIsFlyerNewlyCreated(true);
    }
  };

  const handleConfirmDeleteListing = (id: string, title: string) => {
    deleteListing(id);
    setDeleteConfirmId(null);
    showToast(`Removed "${title}" from inventory`);
  };

  // Filtered Lists
  const filteredListings = listings.filter((item) => {
    if (listingTypeFilter !== 'all' && item.type !== listingTypeFilter) return false;
    const status = getAssetStatus(item.id);
    if (listingStatusFilter !== 'all' && status !== listingStatusFilter) return false;
    if (listingSearch.trim()) {
      const q = listingSearch.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNeighborhood = item.neighborhood.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchNeighborhood && !matchDesc) return false;
    }
    return true;
  });

  const filteredReservations = reservations.filter((res) => {
    if (bookingStatusFilter !== 'all' && res.status !== bookingStatusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const matchId = res.id.toLowerCase().includes(q);
      const matchGuest = res.customer.fullName.toLowerCase().includes(q);
      const matchAsset = res.assetTitle.toLowerCase().includes(q);
      if (!matchId && !matchGuest && !matchAsset) return false;
    }
    return true;
  });

  const filteredTasks = adminTasks.filter((task) => {
    if (taskStatusFilter !== 'all' && task.status !== taskStatusFilter) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const targetListing = listings.find((l) => l.id === newTaskAssetId) || listings[0];
    addTask({
      title: newTaskTitle.trim(),
      type: newTaskType,
      assetId: targetListing?.id || 'custom',
      assetName: targetListing?.title || 'General Operations',
      assetType: targetListing?.type || 'property',
      assignee: newTaskAssignee.trim() || 'Operations Team',
      assigneeRole: 'Field Specialist',
      time: '10:00 AM',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      priority: newTaskPriority,
      notes: newTaskNotes.trim() || undefined,
    });
    setNewTaskTitle('');
    setNewTaskNotes('');
    setShowAddTaskModal(false);
    showToast('Task dispatched to operations board');
  };

  const getStatusBadgeClasses = (status: AssetInventoryItem['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'Rented':
        return 'bg-[#FFC72C]/20 text-amber-800 dark:text-[#FFC72C] border-[#FFC72C]/40';
      case 'Cleaning':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30';
      case 'Maintenance':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30';
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = loginAdmin(loginIdentifier, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Authentication failed');
    } else {
      showToast(`Welcome back, ${SEEDED_ADMIN_CREDENTIALS.name}`);
    }
  };

  const handleFillSeededAdmin = () => {
    setLoginIdentifier(SEEDED_ADMIN_CREDENTIALS.email);
    setLoginPassword(SEEDED_ADMIN_CREDENTIALS.password);
    setLoginError(null);
  };

  // PROTECTED ROUTE GATE: Require Admin Authentication
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F4F6F9] dark:bg-[#0B0C0E] text-zinc-900 dark:text-zinc-100 p-4 sm:p-8">
        {/* Top Bar */}
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFC72C] flex items-center justify-center text-[#111111] font-extrabold text-sm">
              K
            </div>
            <div>
              <span className="font-tenor text-base font-extrabold tracking-tight text-zinc-900 dark:text-white block leading-none">
                Kigali<span className="text-[#FFC72C]">Rentals</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Protected Admin Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="nav" />
            <Link
              href="/"
              className="h-9 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141519] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-[#FFC72C] flex items-center gap-1.5 transition-colors"
            >
              <span>Return to Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#FFC72C]" />
            </Link>
          </div>
        </div>

        {/* Center Login Card */}
        <div className="my-auto max-w-md w-full mx-auto bg-white dark:bg-[#141519] rounded-3xl p-6 sm:p-8 border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC72C]/15 border border-[#FFC72C]/30 flex items-center justify-center text-[#FFC72C] shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFC72C] block">
                Back-Office Security Gate
              </span>
              <h1 className="font-tenor font-extrabold text-xl sm:text-2xl text-zinc-900 dark:text-white">
                Admin Console Login
              </h1>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Admin Email or Username
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="admin@kigalirentals.rw"
                className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-zinc-50 dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          {/* Seeded Admin Credentials Helper Box */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>Seeded Admin Account</span>
              </span>
              <button
                type="button"
                onClick={handleFillSeededAdmin}
                className="px-2.5 py-1 rounded-lg bg-[#FFC72C]/15 hover:bg-[#FFC72C] text-zinc-900 dark:text-[#FFC72C] hover:text-[#111111] dark:hover:text-[#111111] text-[11px] font-bold transition-colors"
              >
                Auto-Fill Credentials
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0B0C0E] border border-zinc-200/70 dark:border-zinc-800/80 text-[11px] font-mono space-y-1 text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Email:</span>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  {SEEDED_ADMIN_CREDENTIALS.email}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Username:</span>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  {SEEDED_ADMIN_CREDENTIALS.username}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  {SEEDED_ADMIN_CREDENTIALS.password}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
          Kigali Rentals Back-Office Console • Protected Route
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] dark:bg-[#0B0C0E] text-zinc-900 dark:text-zinc-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-xl border border-white/10 dark:border-black/10 flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#FFC72C] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-white dark:bg-[#111318] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC72C] flex items-center justify-center text-[#111111] font-extrabold text-sm">
              K
            </div>
            <div>
              <span className="font-tenor text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white block leading-none">
                Kigali<span className="text-[#FFC72C]">Rentals</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Admin Workspace
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Quick Action */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80">
          <button
            onClick={() => {
              handleOpenCreateModal('property');
              setSidebarOpen(false);
            }}
            className="w-full h-10 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Listing</span>
          </button>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
            Management
          </div>

          {[
            {
              id: 'overview' as const,
              label: 'Dashboard Overview',
              icon: LayoutDashboard,
              badge: null,
            },
            {
              id: 'listings' as const,
              label: 'Listings & Photos',
              icon: Building2,
              badge: listings.length,
            },
            {
              id: 'bookings' as const,
              label: 'Reservations',
              icon: CalendarCheck,
              badge: reservations.length,
            },
            {
              id: 'tasks' as const,
              label: 'Field Tasks',
              icon: ClipboardCheck,
              badge: pendingTasksCount > 0 ? pendingTasksCount : null,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FFC72C]/15 text-zinc-900 dark:text-[#FFC72C] border border-[#FFC72C]/30 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#FFC72C]' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-[#FFC72C] text-[#111111]'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
            Quick Shortcuts
          </div>

          <button
            onClick={() => handleOpenCreateModal('property')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Building2 className="w-4 h-4 text-[#FFC72C]" />
            <span>+ New Residence / Villa</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal('car')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Car className="w-4 h-4 text-[#FFC72C]" />
            <span>+ New Vehicle / 4x4</span>
          </button>

          <Link
            href="/handover"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Handover Terminal</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2.5">
          {adminUser && (
            <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {adminUser.name}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                  {adminUser.email}
                </div>
              </div>
              <button
                onClick={logoutAdmin}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link
            href="/"
            className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#FFC72C]/50 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FFC72C]" />
          </Link>

          <button
            onClick={() => {
              resetDemoData();
              showToast('Demo listings and bookings restored to default');
            }}
            className="w-full h-8 px-3 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP DASHBOARD HEADER */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#111318]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-tenor font-bold text-base sm:text-lg text-zinc-900 dark:text-white leading-tight">
                {activeSection === 'overview' && 'Executive Overview'}
                {activeSection === 'listings' && 'Listings, Photos & Descriptions'}
                {activeSection === 'bookings' && 'Reservations & Guest Ledger'}
                {activeSection === 'tasks' && 'Field Operations & Dispatch'}
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                {activeSection === 'overview' &&
                  'Real-time portfolio performance, active bookings, and quick inventory status'}
                {activeSection === 'listings' &&
                  'Upload photos, edit descriptions, manage amenities, and update daily rates'}
                {activeSection === 'bookings' &&
                  'Track guest reservations, payment verification, and check-in schedules'}
                {activeSection === 'tasks' &&
                  'Coordinate housekeeping, chauffeur dispatches, and property inspections'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency Switcher */}
            <button
              onClick={toggleCurrency}
              className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-[#FFC72C]/50 flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
              title="Switch display currency"
            >
              <Globe className="w-3.5 h-3.5 text-[#FFC72C]" />
              <span>{currency}</span>
            </button>

            {/* Light / Dark Theme Toggle */}
            <ThemeToggle variant="nav" />

            {/* Quick Add Listing CTA */}
            <button
              onClick={() => handleOpenCreateModal('property')}
              className="hidden sm:inline-flex h-9 px-4 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Listing</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* =========================================================
              SECTION 1: EXECUTIVE OVERVIEW
             ========================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* KPI Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#141519] rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Total Portfolio Assets
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#FFC72C]/15 text-[#FFC72C] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white font-price">
                    {totalAssets}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {propertiesCount} Residences • {vehiclesCount} Vehicles
                  </div>
                </div>

                <div className="bg-white dark:bg-[#141519] rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Available Right Now
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white font-price">
                    {availableAssetsCount}{' '}
                    <span className="text-sm font-normal text-zinc-400">/ {totalAssets}</span>
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                    {rentedAssetsCount} currently rented
                  </div>
                </div>

                <div className="bg-white dark:bg-[#141519] rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Active Bookings Value
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#FFC72C]/15 text-[#FFC72C] flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white font-price">
                    {formatPrice(totalRevenueUsd)}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Across {reservations.length} reservations
                  </div>
                </div>

                <div className="bg-white dark:bg-[#141519] rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Open Operations Tasks
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white font-price">
                    {pendingTasksCount}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Housekeeping & handovers
                  </div>
                </div>
              </div>

              {/* Quick Portfolio Management Table */}
              <div className="bg-white dark:bg-[#141519] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-tenor font-bold text-base text-zinc-900 dark:text-white">
                      Portfolio Catalog & Quick Actions
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Click any asset to upload new photos, update descriptions, or adjust pricing
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSection('listings')}
                      className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-[#FFC72C] transition-colors"
                    >
                      Open Full Catalog ({listings.length})
                    </button>
                    <button
                      onClick={() => handleOpenCreateModal('property')}
                      className="px-3.5 py-2 rounded-xl bg-[#FFC72C] text-[#111111] text-xs font-extrabold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Listing</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-mono bg-zinc-50/50 dark:bg-zinc-900/40">
                        <th className="py-3 px-5">Listing</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Photos</th>
                        <th className="py-3 px-4">Rate / Day</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/70">
                      {listings.map((item) => {
                        const status = getAssetStatus(item.id);
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                          >
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-black/5 dark:border-white/10">
                                  <Image
                                    src={item.images[0] || ''}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-zinc-900 dark:text-white line-clamp-1">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-xs">
                                    {item.subtitle}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium capitalize">
                                {item.type === 'car' ? (
                                  <Car className="w-3 h-3 text-[#FFC72C]" />
                                ) : (
                                  <Building2 className="w-3 h-3 text-[#FFC72C]" />
                                )}
                                {item.type === 'car' ? 'Vehicle' : 'Property'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                              {item.neighborhood}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-mono">
                                <ImageIcon className="w-3.5 h-3.5 text-[#FFC72C]" />
                                {item.images.length}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                              {formatPrice(item.pricePerDay)}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={status}
                                onChange={(e) => {
                                  updateInventoryItem(item.id, {
                                    status: e.target.value as AssetInventoryItem['status'],
                                  });
                                  showToast(`Status updated for ${item.title}`);
                                }}
                                aria-label={`Status for ${item.title}`}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer ${getStatusBadgeClasses(
                                  status
                                )}`}
                              >
                                <option value="Available" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Available
                                </option>
                                <option value="Rented" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Rented
                                </option>
                                <option value="Cleaning" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Cleaning
                                </option>
                                <option value="Maintenance" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Maintenance
                                </option>
                              </select>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setFlyerListing(item);
                                    setIsFlyerNewlyCreated(false);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFC72C]/15 hover:bg-[#FFC72C] text-zinc-900 dark:text-[#FFC72C] hover:text-[#111111] dark:hover:text-[#111111] border border-[#FFC72C]/30 font-semibold transition-colors"
                                  title="Generate social media flyer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>Flyer</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-[#FFC72C] dark:bg-zinc-800 dark:hover:bg-[#FFC72C] text-zinc-800 dark:text-zinc-200 hover:text-[#111111] dark:hover:text-[#111111] font-semibold transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Reservations Preview */}
              <div className="bg-white dark:bg-[#141519] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h2 className="font-tenor font-bold text-base text-zinc-900 dark:text-white">
                      Recent Reservations
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Latest customer bookings and payment status
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('bookings')}
                    className="text-xs font-bold text-[#FFC72C] hover:underline"
                  >
                    Manage All Bookings →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-mono bg-zinc-50/50 dark:bg-zinc-900/40">
                        <th className="py-3 px-5">Ref ID</th>
                        <th className="py-3 px-4">Guest</th>
                        <th className="py-3 px-4">Booked Asset</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/70">
                      {reservations.slice(0, 5).map((res) => (
                        <tr key={res.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="py-3.5 px-5 font-mono font-bold text-[#FFC72C]">
                            {res.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-zinc-900 dark:text-white">
                              {res.customer.fullName}
                            </div>
                            <div className="text-[11px] text-zinc-500">{res.customer.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                            {res.assetTitle}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                            {res.startDate} → {res.endDate}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                            {formatPrice(res.pricing?.grandTotal || 0)}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#FFC72C]/15 text-amber-800 dark:text-[#FFC72C]">
                              {res.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              SECTION 2: LISTINGS, PHOTOS & DESCRIPTIONS MANAGER (CMS)
             ========================================================= */}
          {activeSection === 'listings' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Filter & Action Toolbar */}
              <div className="bg-white dark:bg-[#141519] rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Type Filter Pills */}
                  {[
                    { id: 'all', label: `All (${listings.length})` },
                    { id: 'property', label: `Residences (${propertiesCount})` },
                    { id: 'car', label: `Vehicles (${vehiclesCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setListingTypeFilter(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        listingTypeFilter === tab.id
                          ? 'bg-[#FFC72C] text-[#111111]'
                          : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {/* Status Filter */}
                  <select
                    value={listingStatusFilter}
                    onChange={(e) => setListingStatusFilter(e.target.value)}
                    aria-label="Filter by operational status"
                    className="h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-transparent focus:border-[#FFC72C] text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      placeholder="Search title, neighborhood..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FFC72C]"
                    />
                  </div>

                  <button
                    onClick={() => handleOpenCreateModal('property')}
                    className="h-9 px-4 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Property</span>
                  </button>

                  <button
                    onClick={() => handleOpenCreateModal('car')}
                    className="h-9 px-4 rounded-xl border border-[#FFC72C]/50 bg-[#FFC72C]/10 hover:bg-[#FFC72C]/20 text-zinc-900 dark:text-[#FFC72C] font-tenor font-extrabold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Vehicle</span>
                  </button>
                </div>
              </div>

              {/* Listings Cards Grid */}
              {filteredListings.length === 0 ? (
                <div className="bg-white dark:bg-[#141519] rounded-2xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800/80">
                  <ImageIcon className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                  <h3 className="font-tenor font-bold text-base text-zinc-900 dark:text-white">
                    No matching listings found
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
                    Try clearing your search filters or create a new listing.
                  </p>
                  <button
                    onClick={() => handleOpenCreateModal('property')}
                    className="px-4 py-2 rounded-xl bg-[#FFC72C] text-[#111111] text-xs font-extrabold"
                  >
                    + Create New Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredListings.map((item) => {
                    const status = getAssetStatus(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-[#141519] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col hover:border-[#FFC72C]/50 transition-all"
                      >
                        {/* Cover Photo & Badges */}
                        <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden group">
                          <Image
                            src={
                              item.images[0] ||
                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
                            }
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Top Left: Asset Type & Featured */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                              {item.type === 'car' ? (
                                <Car className="w-3 h-3 text-[#FFC72C]" />
                              ) : (
                                <Building2 className="w-3 h-3 text-[#FFC72C]" />
                              )}
                              {item.type === 'car' ? 'Vehicle' : 'Property'}
                            </span>
                            {item.featured && (
                              <span className="px-2 py-1 rounded-lg bg-[#FFC72C] text-[#111111] text-[10px] font-extrabold uppercase">
                                Featured
                              </span>
                            )}
                          </div>

                          {/* Top Right: Photo Count Button */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-[#FFC72C] text-white hover:text-[#111111] text-[11px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/15 transition-colors"
                            title="Manage photos"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{item.images.length} Photos</span>
                          </button>

                          {/* Bottom Row on Image: Price & Neighborhood */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                            <div>
                              <span className="text-[11px] text-zinc-300 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#FFC72C]" />
                                {item.neighborhood}, Kigali
                              </span>
                              <h3 className="font-tenor font-bold text-base text-white line-clamp-1">
                                {item.title}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-price font-extrabold text-lg text-[#FFC72C] leading-none block">
                                {formatPrice(item.pricePerDay)}
                              </span>
                              <span className="text-[10px] text-zinc-300">per day</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Body: Subtitle, Description Preview, Specs */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                              {item.subtitle}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                            <div className="pt-1 flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
                                {item.specsSummary}
                              </span>
                            </div>
                          </div>

                          {/* Status & Action Footer */}
                          <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/80 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                Status:
                              </span>
                              <select
                                value={status}
                                onChange={(e) => {
                                  updateInventoryItem(item.id, {
                                    status: e.target.value as AssetInventoryItem['status'],
                                  });
                                  showToast(`Status updated to ${e.target.value}`);
                                }}
                                aria-label={`Status for ${item.title}`}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${getStatusBadgeClasses(
                                  status
                                )}`}
                              >
                                <option value="Available" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Available
                                </option>
                                <option value="Rented" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Rented
                                </option>
                                <option value="Cleaning" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Cleaning
                                </option>
                                <option value="Maintenance" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  Maintenance
                                </option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="flex-1 h-9 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Info</span>
                              </button>

                              <button
                                onClick={() => {
                                  setFlyerListing(item);
                                  setIsFlyerNewlyCreated(false);
                                }}
                                className="h-9 px-3 rounded-xl bg-[#FFC72C]/15 hover:bg-[#FFC72C] border border-[#FFC72C]/40 text-zinc-900 dark:text-[#FFC72C] hover:text-[#111111] dark:hover:text-[#111111] font-tenor font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                title="Create Social Media Flyer / Card"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Flyer</span>
                              </button>

                              <Link
                                href={`/listings/${item.id}`}
                                className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#FFC72C] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                title="Preview live listing page"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>

                              {deleteConfirmId === item.id ? (
                                <button
                                  onClick={() => handleConfirmDeleteListing(item.id, item.title)}
                                  className="h-9 px-2.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold"
                                  title="Click to confirm deletion"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(item.id)}
                                  className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-rose-500/10 flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors"
                                  title="Delete listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              SECTION 3: RESERVATIONS & BOOKINGS
             ========================================================= */}
          {activeSection === 'bookings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-[#141519] rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {['all', 'confirmed', 'active', 'pending_handover', 'completed', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setBookingStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                          bookingStatusFilter === st
                            ? 'bg-[#FFC72C] text-[#111111]'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>

                <div className="relative sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search guest, ref ID, asset..."
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FFC72C]"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#141519] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-mono bg-zinc-50/50 dark:bg-zinc-900/40">
                        <th className="py-3.5 px-5">Booking Ref</th>
                        <th className="py-3.5 px-4">Guest Details</th>
                        <th className="py-3.5 px-4">Asset & Bundle</th>
                        <th className="py-3.5 px-4">Dates</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-5">Booking Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/70">
                      {filteredReservations.map((res) => (
                        <tr
                          key={res.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="py-4 px-5 font-mono font-bold text-[#FFC72C]">
                            {res.id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-zinc-900 dark:text-white">
                              {res.customer.fullName}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {res.customer.email} • {res.customer.phone}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-zinc-900 dark:text-white">
                              {res.assetTitle}
                            </div>
                            {res.pairedAssetTitle && (
                              <span className="text-[11px] text-[#FFC72C] font-medium block">
                                + Paired: {res.pairedAssetTitle}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                            <div>
                              {res.startDate} → {res.endDate}
                            </div>
                            <div className="text-[11px] text-zinc-400">{res.daysCount} days</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] uppercase">
                              {res.pricing?.paymentMethod === 'momo_mtn'
                                ? 'MTN MoMo'
                                : res.pricing?.paymentMethod === 'card'
                                ? 'Visa / MC'
                                : 'Airtel Money'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                            {formatPrice(res.pricing?.grandTotal || 0)}
                          </td>
                          <td className="py-4 px-5">
                            <select
                              value={res.status}
                              onChange={(e) => {
                                updateReservationStatus(
                                  res.id,
                                  e.target.value as Reservation['status']
                                );
                                showToast(`Reservation ${res.id} marked as ${e.target.value}`);
                              }}
                              aria-label={`Booking status for ${res.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="active">Active Stay / Rental</option>
                              <option value="pending_handover">Pending Handover</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              SECTION 4: FIELD OPERATIONS & TASKS
             ========================================================= */}
          {activeSection === 'tasks' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-[#141519] rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All Tasks' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'completed', label: 'Completed' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTaskStatusFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        taskStatusFilter === tab.id
                          ? 'bg-[#FFC72C] text-[#111111]'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="h-9 px-4 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Assign Field Task</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white dark:bg-[#141519] rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                      task.status === 'completed'
                        ? 'border-zinc-200/50 dark:border-zinc-800/40 opacity-65'
                        : 'border-zinc-200/80 dark:border-zinc-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : task.priority === 'high'
                              ? 'bg-[#FFC72C]/20 text-amber-800 dark:text-[#FFC72C]'
                              : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          {task.priority} priority
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-zinc-400">{task.time}</span>
                          <button
                            onClick={() => {
                              deleteTask(task.id);
                              showToast('Task removed');
                            }}
                            className="text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-tenor font-bold text-sm text-zinc-900 dark:text-white mb-1">
                        {task.title}
                      </h3>
                      <p className="text-xs font-medium text-[#FFC72C] mb-2">{task.assetName}</p>

                      {task.notes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 mb-4">
                          {task.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[140px]">
                        {task.assignee}
                      </span>
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task.id,
                            task.status === 'completed' ? 'pending' : 'completed'
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-[#FFC72C] text-[#111111] hover:bg-[#FFD54F]'
                        }`}
                      >
                        {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          LISTING & MEDIA STUDIO MODAL (UPLOAD PHOTOS, DESCRIPTIONS, SPECS)
         ===================================================================== */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#141519] w-full max-w-5xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-[#111318]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFC72C]/15 border border-[#FFC72C]/30 flex items-center justify-center text-[#FFC72C]">
                  {formState.type === 'car' ? (
                    <Car className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="font-tenor font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
                    {editingListingId
                      ? `Edit Listing: ${formState.title}`
                      : 'Create New Listing & Upload Media'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Upload photos, write descriptions, and configure pricing & specifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form
              onSubmit={handleSaveListing}
              className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* LEFT COLUMN (5 cols): PHOTO UPLOADER & GALLERY */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    1. Asset Category
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormState((prev) => ({ ...prev, type: 'property' }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        formState.type === 'property'
                          ? 'bg-[#FFC72C] text-[#111111] border-[#FFC72C]'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Property / Villa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState((prev) => ({ ...prev, type: 'car' }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        formState.type === 'car'
                          ? 'bg-[#FFC72C] text-[#111111] border-[#FFC72C]'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Car className="w-4 h-4" />
                      <span>Vehicle / 4x4</span>
                    </button>
                  </div>
                </div>

                {/* Photo Upload Dropzone */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      2. Photos & Gallery ({formState.images.length})
                    </label>
                    <span className="text-[11px] text-zinc-400">First image is cover</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesUpload(e.target.files)}
                    className="hidden"
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      handleFilesUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                      isDraggingOver
                        ? 'border-[#FFC72C] bg-[#FFC72C]/10'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-[#FFC72C] bg-zinc-50/70 dark:bg-zinc-900/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFC72C]/15 text-[#FFC72C] flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Click to upload photos or drag & drop
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      PNG, JPG, WEBP — multiple photos supported
                    </p>
                  </div>

                  {/* Or Paste Image URL */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste an image URL (https://...)"
                      className="flex-1 h-9 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FFC72C]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="h-9 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-[#FFC72C] text-zinc-800 dark:text-zinc-200 hover:text-[#111111] text-xs font-bold transition-colors shrink-0"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Uploaded Photo Grid */}
                  {formState.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                      {formState.images.map((imgUrl, idx) => (
                        <div
                          key={`${idx}-${imgUrl.slice(0, 24)}`}
                          className={`relative group aspect-[16/11] rounded-xl overflow-hidden border-2 ${
                            idx === 0
                              ? 'border-[#FFC72C]'
                              : 'border-zinc-200 dark:border-zinc-800'
                          } bg-zinc-900`}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-[#FFC72C] text-[#111111] text-[9px] font-extrabold uppercase">
                              Cover
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(idx)}
                                className="px-2 py-1 rounded bg-[#FFC72C] text-[#111111] text-[10px] font-bold"
                                title="Set as cover photo"
                              >
                                Make Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 rounded bg-rose-600 text-white"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operational Status & Visibility Toggles */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    3. Availability & Visibility
                  </label>

                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                      Current Operational Status
                    </span>
                    <select
                      value={formState.status}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          status: e.target.value as AssetInventoryItem['status'],
                        }))
                      }
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                    >
                      <option value="Available">Available (Ready to Book)</option>
                      <option value="Rented">Rented (Occupied / Out on Trip)</option>
                      <option value="Cleaning">Cleaning & Turnover</option>
                      <option value="Maintenance">Maintenance & Inspection</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.featured}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, featured: e.target.checked }))
                        }
                        className="rounded accent-[#FFC72C]"
                      />
                      <span>Featured on Home</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.isInstantBook}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, isInstantBook: e.target.checked }))
                        }
                        className="rounded accent-[#FFC72C]"
                      />
                      <span>Instant Book</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (7 cols): DESCRIPTIONS, LOCATION, PRICING & SPECS */}
              <div className="lg:col-span-7 space-y-5">
                {/* Title, Subtitle & Full Description */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    4. Title & Description
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                        Listing Title *
                      </span>
                      <input
                        type="text"
                        required
                        value={formState.title}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder={
                          formState.type === 'property'
                            ? 'e.g. Kiyovu Sky Penthouse'
                            : 'e.g. Toyota Land Cruiser Prado TXL'
                        }
                        className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                        Tagline / Subtitle
                      </span>
                      <input
                        type="text"
                        value={formState.subtitle}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, subtitle: e.target.value }))
                        }
                        placeholder="Short highlight summary shown on listing page"
                        className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFC72C]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Detailed Description
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {formState.description.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={formState.description}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Write a detailed description covering views, interior finishes, neighborhood convenience, backup power/water, or vehicle capabilities..."
                      className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white leading-relaxed focus:outline-none focus:border-[#FFC72C]"
                    />
                  </div>
                </div>

                {/* Location & Pricing Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Location */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      5. Location
                    </label>
                    <div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                        Neighborhood
                      </span>
                      <select
                        value={formState.neighborhood}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, neighborhood: e.target.value }))
                        }
                        className="w-full h-9 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white"
                      >
                        {NEIGHBORHOOD_OPTIONS.map((nb) => (
                          <option key={nb} value={nb}>
                            {nb}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                        Street Address / Pickup Point
                      </span>
                      <input
                        type="text"
                        value={formState.address}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder="e.g. KN 4 Ave, Kiyovu, Kigali"
                        className="w-full h-9 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      6. Pricing & Deposit (USD)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                          Daily Rate ($)
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={formState.pricePerDay}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              pricePerDay: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                          Deposit ($)
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={formState.securityDeposit}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              securityDeposit: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                          Service Fee ($)
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={formState.cleaningOrServiceFee}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              cleaningOrServiceFee: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-[#FFC72C]">
                      ≈ {(formState.pricePerDay * USD_TO_RWF_RATE).toLocaleString()} RWF / day
                    </div>
                  </div>
                </div>

                {/* TYPE-SPECIFIC SPECIFICATIONS */}
                {formState.type === 'property' ? (
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      7. Property Specifications & Amenities
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Category</span>
                        <select
                          value={formState.propertyCategory}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              propertyCategory: e.target.value as PropertyCategory,
                            }))
                          }
                          className="w-full h-9 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="penthouse">Penthouse</option>
                          <option value="villa">Villa</option>
                          <option value="apartment">Apartment</option>
                          <option value="studio">Studio Loft</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Bedrooms</span>
                        <input
                          type="number"
                          min={1}
                          value={formState.bedrooms}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              bedrooms: Number(e.target.value) || 1,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Bathrooms</span>
                        <input
                          type="number"
                          min={1}
                          step="0.5"
                          value={formState.bathrooms}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              bathrooms: Number(e.target.value) || 1,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Max Guests</span>
                        <input
                          type="number"
                          min={1}
                          value={formState.maxGuests}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              maxGuests: Number(e.target.value) || 1,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Area (sqm)</span>
                        <input
                          type="number"
                          min={15}
                          value={formState.sqm}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              sqm: Number(e.target.value) || 50,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Key Infrastructure Checkboxes */}
                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.hasPool}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, hasPool: e.target.checked }))
                          }
                          className="rounded accent-[#FFC72C]"
                        />
                        <span>Swimming Pool</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.hasBackupGenerator}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              hasBackupGenerator: e.target.checked,
                            }))
                          }
                          className="rounded accent-[#FFC72C]"
                        />
                        <span>24/7 Backup Generator</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.hasFastWifi}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, hasFastWifi: e.target.checked }))
                          }
                          className="rounded accent-[#FFC72C]"
                        />
                        <span>High-Speed Fiber WiFi</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.hasWaterReservoir}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              hasWaterReservoir: e.target.checked,
                            }))
                          }
                          className="rounded accent-[#FFC72C]"
                        />
                        <span>Water Tank & Filtration</span>
                      </label>
                    </div>

                    {/* Amenities Tags */}
                    <div>
                      <span className="text-[11px] font-medium text-zinc-500 block mb-1.5">
                        Included Amenities
                      </span>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={newAmenityInput}
                          onChange={(e) => setNewAmenityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newAmenityInput.trim()) {
                                setFormState((prev) => ({
                                  ...prev,
                                  amenities: [...prev.amenities, newAmenityInput.trim()],
                                }));
                                setNewAmenityInput('');
                              }
                            }
                          }}
                          placeholder="Add amenity (e.g. Espresso Machine, Smart Lock)..."
                          className="flex-1 h-8 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newAmenityInput.trim()) {
                              setFormState((prev) => ({
                                ...prev,
                                amenities: [...prev.amenities, newAmenityInput.trim()],
                              }));
                              setNewAmenityInput('');
                            }
                          }}
                          className="h-8 px-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formState.amenities.map((am, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300"
                          >
                            <span>{am}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((prev) => ({
                                  ...prev,
                                  amenities: prev.amenities.filter((_, idx) => idx !== i),
                                }))
                              }
                              className="text-zinc-400 hover:text-rose-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      7. Vehicle Specifications & Fleet Features
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Category</span>
                        <select
                          value={formState.vehicleCategory}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              vehicleCategory: e.target.value as VehicleCategory,
                            }))
                          }
                          className="w-full h-9 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="4x4">4x4 Expedition</option>
                          <option value="suv">SUV</option>
                          <option value="luxury">VIP Executive</option>
                          <option value="hybrid">Hybrid AWD</option>
                          <option value="sedan">Saloon</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Seats</span>
                        <input
                          type="number"
                          min={2}
                          value={formState.seats}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              seats: Number(e.target.value) || 5,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Transmission</span>
                        <select
                          value={formState.transmission}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              transmission: e.target.value as Transmission,
                            }))
                          }
                          className="w-full h-9 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="automatic">Automatic</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Fuel Type</span>
                        <select
                          value={formState.fuelType}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              fuelType: e.target.value as FuelType,
                            }))
                          }
                          className="w-full h-9 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="diesel">Diesel</option>
                          <option value="petrol">Petrol</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="electric">Electric</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">
                          Driver / Chauffeur Mode
                        </span>
                        <select
                          value={formState.driverOption}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              driverOption: e.target.value as DriverOption,
                            }))
                          }
                          className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="both">Self-Drive or Chauffeur</option>
                          <option value="chauffeur">Chauffeur Included Only</option>
                          <option value="self-drive">Self-Drive Only</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                        <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formState.fourWheelDrive}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                fourWheelDrive: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#FFC72C]"
                          />
                          <span>4x4 / AWD</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formState.unlimitedMileage}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                unlimitedMileage: e.target.checked,
                              }))
                            }
                            className="rounded accent-[#FFC72C]"
                          />
                          <span>Unlimited Mileage</span>
                        </label>
                      </div>
                    </div>

                    {/* Vehicle Features Tags */}
                    <div>
                      <span className="text-[11px] font-medium text-zinc-500 block mb-1.5">
                        Vehicle Equipment & Features
                      </span>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={newAmenityInput}
                          onChange={(e) => setNewAmenityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newAmenityInput.trim()) {
                                setFormState((prev) => ({
                                  ...prev,
                                  features: [...prev.features, newAmenityInput.trim()],
                                }));
                                setNewAmenityInput('');
                              }
                            }
                          }}
                          placeholder="Add vehicle feature (e.g. Roof Rack, Cooler Box)..."
                          className="flex-1 h-8 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newAmenityInput.trim()) {
                              setFormState((prev) => ({
                                ...prev,
                                features: [...prev.features, newAmenityInput.trim()],
                              }));
                              setNewAmenityInput('');
                            }
                          }}
                          className="h-8 px-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formState.features.map((feat, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300"
                          >
                            <span>{feat}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((prev) => ({
                                  ...prev,
                                  features: prev.features.filter((_, idx) => idx !== i),
                                }))
                              }
                              className="text-zinc-400 hover:text-rose-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsStudioOpen(false)}
                    className="h-10 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {editingListingId ? 'Save Changes' : 'Publish & Create Social Flyer'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          SOCIAL MEDIA FLYER & CARD GENERATOR MODAL
         ===================================================================== */}
      <SocialFlyerModal
        listing={flyerListing}
        isOpen={Boolean(flyerListing)}
        onClose={() => setFlyerListing(null)}
        isNewlyCreated={isFlyerNewlyCreated}
      />

      {/* =====================================================================
          CREATE FIELD TASK MODAL
         ===================================================================== */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white dark:bg-[#141519] rounded-3xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-tenor font-bold text-base text-zinc-900 dark:text-white">
                Assign Field Task
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Deep clean penthouse & restock coffee bar"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Target Asset
              </label>
              <select
                value={newTaskAssetId}
                onChange={(e) => setNewTaskAssetId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  required
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as AdminTask['priority'])}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Optional instructions for field staff..."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="h-9 px-4 rounded-xl text-xs font-bold text-zinc-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-xl bg-[#FFC72C] text-[#111111] text-xs font-extrabold"
              >
                Dispatch Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
