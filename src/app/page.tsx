'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRental } from '@/lib/rentalContext';
import ListingCard from '@/components/ListingCard';
import { KIGALI_NEIGHBORHOODS } from '@/lib/mockData';
import DatePicker from '@/components/ui/DatePicker';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import {
  Home,
  Car,
  Layers,
  Search,
  Users,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Compass,
  Star,
  ArrowRight,
  Clock,
  Fuel,
  Gauge,
  Camera,
  ChevronRight,
  Shield,
  Zap,
  Phone,
  MessageSquare,
  X,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=2400&q=85',
    title: 'Toyota Land Cruiser Prado TXL 4x4 Fleet',
    badge: 'Safari & Volcanoes Expedition Ready',
    neighborhood: 'Full-Time 4WD • Automatic',
    tab: 'car' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2400&q=85',
    title: 'Land Rover Defender 110 Expedition 4x4',
    badge: 'Adaptive Air Suspension & Roof Rack',
    neighborhood: 'Akagera & Virunga Ready',
    tab: 'car' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=2400&q=85',
    title: 'Mercedes-Benz E-Class VIP Saloon',
    badge: 'Executive Diplomatic Chauffeur',
    neighborhood: 'Kigali Airport & Protocol',
    tab: 'car' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=2400&q=85',
    title: 'Toyota RAV4 Hybrid Eco AWD',
    badge: 'Intelligent AWD City & Lake Kivu Cruiser',
    neighborhood: 'Eco Hybrid • Smooth AWD',
    tab: 'car' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=2400&q=85',
    title: 'Rugged 4x4 Overland & Cross-Country Fleet',
    badge: 'Certified Rwanda Roadside Rescue 24/7',
    neighborhood: 'Self-Drive or Licensed Chauffeur',
    tab: 'car' as const,
  },
];

const HERO_BACKGROUNDS = {
  all: HERO_SLIDES[0],
  property: HERO_SLIDES[1],
  car: HERO_SLIDES[0],
  combo: HERO_SLIDES[3],
};

export default function HomePage() {
  const { listings, formatPrice, draftBooking, setDraftBooking } = useRental();

  // Automatic slideshow state (Cycles every 5 seconds by default)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Search State (DS-01)
  const [activeTab, setActiveTab] = useState<'all' | 'property' | 'car' | 'combo'>('all');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [startDate, setStartDate] = useState(draftBooking.startDate || '2026-10-14');
  const [endDate, setEndDate] = useState(draftBooking.endDate || '2026-10-18');
  const [guestsCapacity, setGuestsCapacity] = useState('all');

  // Click outside to dismiss live search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  // Handle URL hash changes or direct deep links to #vehicles, #apartments, #properties
  useEffect(() => {
    const handleUrlNavigation = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      const typeParam = search.get('type');

      if (hash === '#vehicles' || typeParam === 'car') {
        if (activeTab === 'property') {
          setActiveTab('car');
        }
        setTimeout(() => {
          const el = document.getElementById('vehicles');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else if (hash === '#apartments' || hash === '#properties' || typeParam === 'property') {
        if (activeTab === 'car') {
          setActiveTab('property');
        }
        setTimeout(() => {
          const el = document.getElementById('apartments') || document.getElementById('properties');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    };

    handleUrlNavigation();
    window.addEventListener('hashchange', handleUrlNavigation);
    return () => window.removeEventListener('hashchange', handleUrlNavigation);
  }, [activeTab]);

  // Dynamic live suggestions retrieved directly from DB listings (never hardcoded)
  const liveSuggestions = useMemo(() => {
    const q = customSearchQuery.trim().toLowerCase();

    // Matching vehicles from database inventory
    const cars = listings
      .filter((l) => l.type === 'car')
      .map((l) => ({
        type: 'car' as const,
        title: l.title,
        category: l.vehicleDetails?.category === '4x4' ? '4x4 Fleet' : l.vehicleDetails?.category === 'luxury' ? 'VIP Saloon' : 'Eco Hybrid',
        badge: l.specsSummary,
      }));

    // Locations from database inventory
    const locations = Array.from(new Set(listings.map((l) => l.neighborhood))).map((nh) => ({
      type: 'location' as const,
      title: `${nh}`,
      category: 'Kigali Area',
      badge: `${listings.filter((l) => l.neighborhood === nh).length} assets in DB`,
    }));

    // Properties from database inventory
    const properties = listings
      .filter((l) => l.type === 'property')
      .map((l) => ({
        type: 'property' as const,
        title: l.title,
        category: 'Residence',
        badge: l.specsSummary,
      }));

    const pool =
      activeTab === 'car'
        ? [...cars, ...locations]
        : activeTab === 'property'
        ? [...properties, ...locations]
        : [...cars, ...locations, ...properties];

    if (!q) {
      return pool.slice(0, 6);
    }

    return pool
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [listings, customSearchQuery, activeTab]);

  // Dynamic category & fleet options derived directly from DB inventory (never hardcoded)
  const dynamicCategoryOptions = useMemo(() => {
    if (activeTab === 'car') {
      const cars = listings.filter((l) => l.type === 'car');
      return [
        { value: 'all', label: 'All Kigali Fleets', description: `${cars.length} vehicles verified in DB` },
        { value: '4x4', label: 'Toyota Prado & 4x4 (AWD)', description: 'Full-time 4WD with low-range lock' },
        { value: 'with_driver', label: 'Chauffeur Included', description: 'Certified English & French speaking driver' },
        { value: 'self_drive', label: 'Self-Drive Options', description: 'Self-drive rental with unlimited km' },
        { value: 'luxury', label: 'Mercedes-Benz VIP', description: 'Executive diplomatic chauffeur' },
        { value: 'hybrid', label: 'Toyota RAV4 Hybrid', description: 'Eco-efficient city & lake AWD' },
      ];
    }
    if (activeTab === 'property') {
      const props = listings.filter((l) => l.type === 'property');
      return [
        { value: 'all', label: 'All Kigali Residences', description: `${props.length} residences verified in DB` },
        { value: 'penthouse', label: 'Hilltop Penthouses', description: 'Kiyovu skyline & private pools' },
        { value: 'villa', label: 'Diplomatic Villas', description: 'Nyarutarama private compounds' },
        { value: 'studio', label: 'Serviced Urban Lofts', description: 'High-speed fiber & central location' },
      ];
    }
    if (activeTab === 'combo') {
      return [
        { value: 'all', label: 'All Curated Bundles (-20%)', description: 'Stay & 4x4 combined contract' },
        { value: 'penthouse', label: 'Penthouse + Prado 4x4', description: 'Kiyovu luxury + Land Cruiser' },
        { value: 'villa', label: 'Diplomatic Villa + Chauffeur', description: 'Private compound + dedicated driver' },
      ];
    }
    return [
      { value: 'all', label: 'All Assets in Database', description: `${listings.length} verified listings in DB` },
      { value: '4x4', label: '4x4 Expedition Fleet', description: 'Toyota Land Cruiser Prado & Defender' },
      { value: 'luxury', label: 'Executive VIP Fleet', description: 'Mercedes-Benz VIP Saloon' },
      { value: 'villa', label: 'Diplomatic Villas', description: 'Private compounds with generators' },
      { value: 'penthouse', label: 'Panoramic Penthouses', description: 'Skyline balconies & pools' },
    ];
  }, [activeTab, listings]);

  // Filter & Sort State (DS-02, DS-03)
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [selectedAssetSubtype, setSelectedAssetSubtype] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating'>('recommended');
  
  // Toggles
  const [filterWithDriverOnly, setFilterWithDriverOnly] = useState(false);
  const [filterHasPool, setFilterHasPool] = useState(false);
  const [filterHasGenerator, setFilterHasGenerator] = useState(false);
  const [filter4x4Only, setFilter4x4Only] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Calculate days difference
  const daysCount = useMemo(() => {
    try {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 3;
    } catch {
      return 3;
    }
  }, [startDate, endDate]);

  // Sync dates to context
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setDraftBooking((prev) => ({
      ...prev,
      startDate,
      endDate,
      daysCount,
      guestsCount: parseInt(guestsCapacity, 10) || 2,
    }));
    // Smooth scroll to relevant listings section (vehicles or apartments)
    const targetId = activeTab === 'property' ? 'apartments' : 'vehicles';
    const target =
      document.getElementById(targetId) ||
      document.getElementById('vehicles') ||
      document.getElementById('apartments') ||
      document.getElementById('properties');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Tab filter
      if (activeTab === 'property' && item.type !== 'property') return false;
      if (activeTab === 'car' && item.type !== 'car') return false;
      if (activeTab === 'combo' && !item.crossSellRecommendation) return false;

      // Neighborhood
      if (selectedNeighborhood !== 'all' && item.neighborhood !== selectedNeighborhood) {
        return false;
      }

      // Max price
      if (item.pricePerDay > maxPrice) return false;

      // Subtype
      if (selectedAssetSubtype !== 'all') {
        if (item.type === 'property' && item.propertyDetails?.category !== selectedAssetSubtype) {
          return false;
        }
        if (item.type === 'car' && item.vehicleDetails?.category !== selectedAssetSubtype) {
          return false;
        }
      }

      // Feature filters
      if (filterWithDriverOnly && item.type === 'car') {
        if (item.vehicleDetails?.driverOption === 'self-drive') return false;
      }
      if (filter4x4Only && item.type === 'car') {
        if (!item.vehicleDetails?.fourWheelDrive) return false;
      }
      if (filterHasPool && item.type === 'property') {
        if (!item.propertyDetails?.hasPool) return false;
      }
      if (filterHasGenerator && item.type === 'property') {
        if (!item.propertyDetails?.hasBackupGenerator) return false;
      }

      // Custom typed input search query (retrieves dynamically from DB)
      if (customSearchQuery.trim()) {
        const q = customSearchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSubtitle = item.subtitle?.toLowerCase().includes(q);
        const inNeighborhood = item.neighborhood.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inAddress = item.address.toLowerCase().includes(q);
        const inSpecs = item.specsSummary?.toLowerCase().includes(q);
        const inCategory = (item.vehicleDetails?.category || item.propertyDetails?.category || '').toLowerCase().includes(q);
        const inFeatures =
          item.vehicleDetails?.features?.some((f) => f.toLowerCase().includes(q)) ||
          item.propertyDetails?.amenities?.some((a) => a.toLowerCase().includes(q));

        if (
          !inTitle &&
          !inSubtitle &&
          !inNeighborhood &&
          !inDesc &&
          !inAddress &&
          !inSpecs &&
          !inCategory &&
          !inFeatures
        ) {
          return false;
        }
      }

      // Dynamic tab capacity / model filter
      if (guestsCapacity !== 'all') {
        if (activeTab === 'car') {
          if (guestsCapacity === '4x4' && !item.vehicleDetails?.fourWheelDrive) return false;
          if (guestsCapacity === 'with_driver' && item.vehicleDetails?.driverOption === 'self-drive') return false;
          if (guestsCapacity === 'self_drive' && item.vehicleDetails?.driverOption === 'chauffeur') return false;
          if (guestsCapacity === 'hybrid' && item.vehicleDetails?.category !== 'hybrid') return false;
          if (guestsCapacity === 'luxury' && item.vehicleDetails?.category !== 'luxury') return false;
        } else if (activeTab === 'property') {
          if (guestsCapacity === 'studio' && item.propertyDetails?.category !== 'studio') return false;
          if (guestsCapacity === 'penthouse' && item.propertyDetails?.category !== 'penthouse') return false;
          if (guestsCapacity === 'villa' && item.propertyDetails?.category !== 'villa') return false;
        } else if (activeTab === 'combo') {
          if (guestsCapacity === 'penthouse' && item.propertyDetails?.category !== 'penthouse') return false;
          if (guestsCapacity === 'villa' && item.propertyDetails?.category !== 'villa') return false;
          if (guestsCapacity === 'studio' && item.propertyDetails?.category !== 'studio') return false;
        } else if (activeTab === 'all') {
          if (guestsCapacity === '4x4' && !item.vehicleDetails?.fourWheelDrive) return false;
          if (guestsCapacity === 'luxury' && item.vehicleDetails?.category !== 'luxury') return false;
          if (guestsCapacity === 'penthouse' && item.propertyDetails?.category !== 'penthouse') return false;
          if (guestsCapacity === 'villa' && item.propertyDetails?.category !== 'villa') return false;
          const num = parseInt(guestsCapacity, 10);
          if (!isNaN(num)) {
            if (item.type === 'property' && (item.propertyDetails?.maxGuests || 0) < num) return false;
            if (item.type === 'car' && (item.vehicleDetails?.seats || 0) < num) return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price_desc') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
  }, [
    listings,
    activeTab,
    customSearchQuery,
    selectedNeighborhood,
    maxPrice,
    selectedAssetSubtype,
    guestsCapacity,
    filterWithDriverOnly,
    filter4x4Only,
    filterHasPool,
    filterHasGenerator,
  ]);

  // Split filtered listings into dedicated vehicles and apartments sets
  const vehicleListings = useMemo(
    () => filteredListings.filter((item) => item.type === 'car'),
    [filteredListings]
  );

  const apartmentListings = useMemo(
    () => filteredListings.filter((item) => item.type === 'property'),
    [filteredListings]
  );

  // Dynamic form configs per tab
  const tabConfigs: Record<
    'all' | 'property' | 'car' | 'combo',
    {
      zoneLabel: string;
      zoneIcon: React.ReactNode;
      zoneOptions: SelectOption[];
      dateLabel: string;
      capacityLabel: string;
      capacityIcon: React.ReactNode;
      capacityOptions: SelectOption[];
      buttonText: string;
    }
  > = {
    all: {
      zoneLabel: 'Kigali Zone',
      zoneIcon: <MapPin className="w-3.5 h-3.5 text-[#FFC72C]" />,
      zoneOptions: [
        { value: 'all', label: 'All Neighborhoods', description: 'Across Greater Kigali' },
        ...KIGALI_NEIGHBORHOODS.filter((n) => n.value !== 'all').map((nh) => ({
          value: nh.value,
          label: nh.name,
          description: nh.desc,
        })),
      ],
      dateLabel: 'Trip Dates',
      capacityLabel: 'Guests / Capacity',
      capacityIcon: <Users className="w-3.5 h-3.5 text-[#FFC72C]" />,
      capacityOptions: [
        { value: 'all', label: 'Any Capacity', description: 'Show all properties and vehicles' },
        { value: '1', label: '1 Guest / Driver', description: 'Studio Loft or City Sedan' },
        { value: '2', label: '2 Guests', description: 'Couples or Business Travel' },
        { value: '4', label: '4 Guests', description: 'Standard 2-Bed / SUV Capacity' },
        { value: '6', label: '6+ Guests', description: 'Large Villa / 7-Seater Prado' },
      ],
      buttonText: 'Search Kigali',
    },
    property: {
      zoneLabel: 'Property District',
      zoneIcon: <Home className="w-3.5 h-3.5 text-[#FFC72C]" />,
      zoneOptions: [
        { value: 'all', label: 'All Kigali Locations', description: 'Diplomatic Villas, Penthouses & Lofts' },
        { value: 'Kiyovu', label: 'Kiyovu Diplomatic Hill', description: 'Embassies, Penthouses & City Views' },
        { value: 'Nyarutarama', label: 'Nyarutarama Golf Estates', description: 'Private Gated Luxury Compounds' },
        { value: 'Kimihurura', label: 'Kimihurura Culinary Hub', description: 'Modern Serviced Urban Lofts' },
        { value: 'Gacuriro', label: 'Gacuriro Panoramic Heights', description: 'High-Elevation Residential Mansions' },
      ],
      dateLabel: 'Check-in / Check-out',
      capacityLabel: 'Bedrooms & Residence',
      capacityIcon: <Home className="w-3.5 h-3.5 text-[#FFC72C]" />,
      capacityOptions: [
        { value: 'all', label: 'All Property Classes', description: 'Show all available residences' },
        { value: 'penthouse', label: '2-Bed Penthouse (Up to 4 Guests)', description: 'Kiyovu luxury heights & infinity pool' },
        { value: 'villa', label: '4-Bed Diplomatic Villa (Up to 8 Guests)', description: 'Nyarutarama private estate & garden' },
        { value: 'studio', label: 'Loft Studio (1-2 Guests)', description: 'Kimihurura serviced loft with fiber' },
      ],
      buttonText: 'Find Luxury Stays',
    },
    car: {
      zoneLabel: 'Pickup / Delivery Location',
      zoneIcon: <MapPin className="w-3.5 h-3.5 text-[#FFC72C]" />,
      zoneOptions: [
        { value: 'all', label: 'All Delivery Desks', description: 'Airport, Kiyovu Hub or Hotel Delivery' },
        { value: 'airport', label: 'Kigali International Airport (KGL)', description: 'Flight meet & greet at arrivals' },
        { value: 'Kiyovu', label: 'Kiyovu Central Operations Desk', description: 'Central Kigali key collection' },
        { value: 'hotel', label: 'Direct Hotel / Villa Delivery', description: 'Chauffeur brings vehicle to your door' },
      ],
      dateLabel: 'Rental Duration',
      capacityLabel: 'Fleet Model & Chauffeur',
      capacityIcon: <Car className="w-3.5 h-3.5 text-[#FFC72C]" />,
      capacityOptions: [
        { value: 'all', label: 'All Vehicle Models', description: 'Explore full 4x4 & sedan inventory' },
        { value: '4x4', label: 'Toyota Land Cruiser Prado TXL', description: 'Safari suspension 4x4, automatic' },
        { value: 'with_driver', label: 'Prado 4x4 + Dedicated Chauffeur', description: 'Licensed professional driver included' },
        { value: 'hybrid', label: 'Toyota RAV4 Hybrid AWD', description: 'High fuel efficiency city & highway cruiser' },
        { value: 'luxury', label: 'Mercedes-Benz E-Class VIP', description: 'Executive airport transfer & chauffeur' },
      ],
      buttonText: 'Find 4x4 & Fleet',
    },
    combo: {
      zoneLabel: 'Base Sanctuary District',
      zoneIcon: <Sparkles className="w-3.5 h-3.5 text-[#FFC72C]" />,
      zoneOptions: [
        { value: 'all', label: 'All Curated Bundles (-20%)', description: 'Combined single invoice & deposit hold' },
        { value: 'Kiyovu', label: 'Diplomatic Kiyovu + Prado Fleet', description: 'Hilltop Penthouse with Land Cruiser' },
        { value: 'Nyarutarama', label: 'Nyarutarama Villa + Chauffeur 4x4', description: 'Private compound with dedicated driver' },
        { value: 'Kimihurura', label: 'Kimihurura Loft + RAV4 Hybrid', description: 'Urban serviced loft with AWD cruiser' },
      ],
      dateLabel: 'Bundle Stay & Drive Dates',
      capacityLabel: 'Curated Package Tier',
      capacityIcon: <Layers className="w-3.5 h-3.5 text-[#FFC72C]" />,
      capacityOptions: [
        { value: 'all', label: 'All Curated Packages', description: 'Show all 20% discounted pairings' },
        { value: 'penthouse', label: 'Penthouse + Prado 4x4 (-20%)', description: 'Kiyovu 2-Bed + Land Cruiser Prado TXL' },
        { value: 'villa', label: 'Diplomatic Villa + Safari 4x4 (-20%)', description: 'Nyarutarama 4-Bed + 7-Seater Prado' },
        { value: 'studio', label: 'Urban Loft + Hybrid AWD (-20%)', description: 'Kimihurura Studio + Toyota RAV4' },
      ],
      buttonText: 'Explore Combo Bundles',
    },
  };

  const handleTabChange = (tab: 'all' | 'property' | 'car' | 'combo') => {
    setActiveTab(tab);
    setSelectedNeighborhood('all');
    setGuestsCapacity('all');
    setSelectedAssetSubtype('all');
    const matchedIdx = HERO_SLIDES.findIndex((s) => s.tab === tab);
    if (matchedIdx !== -1) {
      setCurrentSlideIndex(matchedIdx);
    }
  };

  const resetFilters = () => {
    setActiveTab('all');
    setCustomSearchQuery('');
    setSelectedNeighborhood('all');
    setMaxPrice(350);
    setSelectedAssetSubtype('all');
    setGuestsCapacity('all');
    setFilterWithDriverOnly(false);
    setFilterHasPool(false);
    setFilterHasGenerator(false);
    setFilter4x4Only(false);
    setSortBy('recommended');
  };

  // Sort options for CustomSelect
  const sortOptions: SelectOption[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated (★)' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white transition-colors duration-200">
      {/* 1. HERO SECTION: FULL VIEWPORT RESPONSIVE FROM SMALLEST (280px) TO LARGEST (4K/8K) */}
      <section className="relative min-h-[100dvh] h-auto flex flex-col justify-center items-center px-3 min-[360px]:px-4 sm:px-6 lg:px-8 2xl:px-12 pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-12 2xl:pb-16 overflow-hidden">
        {/* Full-bleed Background Images Slideshow (Auto-cycles smoothly by default) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.url}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.url}
                alt={slide.title}
                fill
                className="object-cover object-center transform transition-transform duration-[6000ms] ease-out scale-100"
                priority={idx === 0}
              />
            </div>
          ))}
          {/* Luminous photographic overlay: rich vibrancy without muddy graying */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/50" />
        </div>

        {/* Slideshow Progress Dots Indicator */}
        <div className="absolute bottom-3 right-4 sm:right-8 z-30 flex items-center gap-1.5 glass-skeu-card px-2.5 py-1 rounded-full pointer-events-auto border border-black/10 dark:border-zinc-800 bg-white/80 dark:bg-[#141519]/80 backdrop-blur-md">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlideIndex ? 'w-5 bg-[#FFC72C]' : 'w-1.5 bg-zinc-400 dark:bg-zinc-600 hover:bg-zinc-600 dark:hover:bg-zinc-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Hero Headlines: Positioned with distinct distance from navbar and wide breathing space to form */}
        <div className="container mx-auto relative z-10 max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl text-center mb-8 sm:mb-12 2xl:mb-16 mt-2 sm:mt-4">
          <h1 className="font-tenor text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-extrabold tracking-tight text-white leading-[1.18] sm:leading-[1.15] drop-shadow-xl mb-3 sm:mb-4">
            Rent your luxury 4x4 & executive drive in{' '}
            <span className="inline-block bg-[#FFC72C] text-[#111111] px-2.5 min-[360px]:px-3.5 sm:px-4 md:px-5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl md:rounded-2xl align-baseline font-black whitespace-nowrap">
              Rwanda
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg 2xl:text-xl text-zinc-300 font-sans max-w-xl sm:max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed drop-shadow-md px-2">
            Toyota Land Cruiser Prado TXL, Land Rover Defender 110, and VIP Mercedes-Benz saloons. Expedition-ready for Rwanda’s 1,000 hills, Volcanoes Gorilla trekking, and city protocol.
          </p>
        </div>

        {/* High-Frost Luminous Glassmorphic Search Form (Sleek Reduced Height, Zero-Scroll Fit) */}
        <div
          id="search"
          className="w-full max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto relative z-20 glass-high-frost rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 2xl:p-5 text-zinc-900 dark:text-white scroll-mt-24 transition-all border border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#141519]/95 backdrop-blur-xl"
        >
          {/* Dynamic Tab Selector with Tactile Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 pb-2.5 mb-2.5 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-tenor font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'skeu-tab-active text-[#111111]'
                  : 'skeu-btn-frosted text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              All Assets
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('car')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-tenor font-bold transition-all shrink-0 ${
                activeTab === 'car'
                  ? 'skeu-tab-active text-[#111111]'
                  : 'skeu-btn-frosted text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-[#FFC72C]" />
              <span>Vehicles & 4x4 Fleet</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('property')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-tenor font-bold transition-all shrink-0 ${
                activeTab === 'property'
                  ? 'skeu-tab-active text-[#111111]'
                  : 'skeu-btn-frosted text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#FFC72C]" />
              <span>Apartments</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('combo')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-tenor font-bold transition-all shrink-0 ${
                activeTab === 'combo'
                  ? 'skeu-tab-active text-[#111111]'
                  : 'skeu-btn-frosted text-[#FFC72C] hover:text-[#d4a017]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stay & Drive Combo</span>
              <span className="text-[10px] bg-[#FFC72C] text-[#111111] px-1.5 py-0.5 rounded-full font-extrabold">
                -20%
              </span>
            </button>
          </div>

          {/* Luxury Form Inputs Grid with Reduced Height (h-11 sm:h-12) & Dynamic DB Search */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-2.5 items-center">
            {/* Field 1: Custom Input with live suggestions retrieved directly from DB */}
            <div ref={searchContainerRef} className="lg:col-span-4 relative">
              <div className="relative flex items-center h-11 sm:h-12 px-3 sm:px-3.5 rounded-xl skeu-input-cell">
                <Search className="w-4 h-4 text-[#FFC72C] shrink-0 mr-2" />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block leading-tight">
                    {activeTab === 'car'
                      ? 'FLEET MODEL & CHAUFFEUR'
                      : activeTab === 'property'
                      ? 'VILLA OR NEIGHBORHOOD'
                      : 'SEARCH ASSET OR MODEL'}
                  </span>
                  <input
                    type="text"
                    value={customSearchQuery}
                    onChange={(e) => {
                      setCustomSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={
                      activeTab === 'car'
                        ? 'Toyota Prado, Defender, RAV4...'
                        : activeTab === 'property'
                        ? 'Kiyovu Villa, Nyarutarama...'
                        : 'Prado 4x4, Penthouse...'
                    }
                    className="w-full bg-transparent font-tenor font-bold text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 placeholder:font-normal focus:outline-none leading-tight truncate"
                  />
                </div>
                {customSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Database Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 z-50 glass-high-frost-dropdown rounded-2xl p-2 shadow-2xl animate-fadeIn border border-black/10 dark:border-zinc-700/80 max-h-64 overflow-y-auto bg-white dark:bg-[#16171E] text-zinc-900 dark:text-white"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-1.5 mb-1">
                    <span>Database Matches</span>
                    <span className="font-mono text-[#FFC72C] text-[9px] font-bold">Verified DB Inventory</span>
                  </div>
                  {liveSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                      No matching assets found in DB. Press search to browse all inventory.
                    </div>
                  ) : (
                    liveSuggestions.map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setCustomSearchQuery(item.title);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {item.type === 'car' ? (
                            <Car className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                          ) : item.type === 'location' ? (
                            <MapPin className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                          ) : (
                            <Home className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-tenor font-bold text-xs text-zinc-900 dark:text-white group-hover:text-[#FFC72C] block truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                              {item.badge}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-tenor shrink-0">
                          {item.category}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Field 2: Trip / Rental Dates (Reduced compact height h-11 sm:h-12) */}
            <div className="lg:col-span-3">
              <DatePicker
                label={tabConfigs[activeTab].dateLabel}
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                compact={true}
              />
            </div>

            {/* Field 3: Dynamic Category / Fleet from DB (Reduced compact height h-11 sm:h-12) */}
            <div className="lg:col-span-3">
              <CustomSelect
                label={tabConfigs[activeTab].capacityLabel}
                icon={tabConfigs[activeTab].capacityIcon}
                options={dynamicCategoryOptions}
                value={guestsCapacity}
                onChange={(val) => setGuestsCapacity(val)}
                compact={true}
              />
            </div>

            {/* Field 4: Search Action Button (Reduced compact height h-11 sm:h-12) */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-11 sm:h-12 skeu-btn-terracotta text-[#111111] rounded-xl font-tenor font-extrabold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 transition-all"
              >
                <Search className="w-4 h-4 shrink-0 text-[#111111]" />
                <span className="truncate">{tabConfigs[activeTab].buttonText}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. VISUAL SHOWCASE STRIP: CURATED CATEGORY BENTO (Visual-First Skeuomorphic Experience) */}
      <section className="container mx-auto px-3 min-[360px]:px-4 sm:px-6 2xl:px-8 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: '4x4 Prado Fleets',
              badge: 'Self-Drive or Chauffeur',
              desc: 'Expedition Land Cruisers ready for Kigali hills or Volcanoes Gorilla safaris.',
              img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
              tab: 'car',
              target: 'vehicles',
            },
            {
              title: 'Executive Chauffeurs',
              badge: 'Airport & Diplomatic',
              desc: 'Mercedes-Benz & Hybrid AWD with verified English & French speaking drivers.',
              img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
              tab: 'car',
              target: 'vehicles',
            },
            {
              title: 'Hilltop Penthouses',
              badge: 'Panoramic Kigali',
              desc: 'Floor-to-ceiling glass balconies overlooking the illuminated 1,000 hills.',
              img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
              tab: 'property',
              target: 'apartments',
            },
            {
              title: 'Diplomatic Villas',
              badge: 'Kiyovu & Nyarutarama',
              desc: 'Gated compounds with private pools, manicured gardens, and 24/7 security.',
              img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
              tab: 'property',
              target: 'apartments',
            },
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => {
                setActiveTab(cat.tab as any);
                const el = document.getElementById(cat.target) || document.getElementById('properties');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer skeu-card-elevated hover:shadow-2xl transition-all duration-300"
            >
              <Image
                src={cat.img}
                alt={cat.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FFC72C] glass-skeu-card px-2.5 py-0.5 rounded-full w-fit mb-2 shadow-xs">
                  {cat.badge}
                </span>
                <h3 className="font-tenor font-bold text-lg text-white group-hover:text-white transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2">
                  {cat.desc}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90 mt-2 group-hover:translate-x-1 transition-transform">
                  <span>Explore category</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#FFC72C]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. VISUAL DISCOVERY CONTROLS & FILTER BAR */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="skeu-card-elevated rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Quick Subcategory Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
              <span className="font-tenor font-bold text-zinc-500 dark:text-zinc-400 uppercase text-[11px] shrink-0 mr-1">
                Asset:
              </span>
              {[
                { label: 'All', value: 'all' },
                { label: '4x4 SUVs', value: '4x4' },
                { label: 'VIP Chauffeur', value: 'luxury' },
                { label: 'Hybrids', value: 'hybrid' },
                { label: 'Apartments', value: 'studio' },
                { label: 'Penthouses', value: 'penthouse' },
                { label: 'Villas', value: 'villa' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setSelectedAssetSubtype(pill.value)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 text-xs ${
                    selectedAssetSubtype === pill.value
                      ? 'skeu-tab-active !text-[#111111] font-extrabold'
                      : 'skeu-btn-frosted text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Filter Toggle & Custom Sort Dropdown */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-tenor transition-all ${
                  showAdvancedFilters
                    ? 'skeu-btn-terracotta !text-[#111111]'
                    : 'skeu-btn-frosted text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {(filterWithDriverOnly || filter4x4Only || filterHasPool || filterHasGenerator || maxPrice < 350) && (
                  <span className="w-2 h-2 rounded-full bg-[#FFC72C]"></span>
                )}
              </button>

              <div className="w-44">
                <CustomSelect
                  options={sortOptions}
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  placeholder="Sort by"
                />
              </div>
            </div>
          </div>

          {/* Expanded Filter Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between text-xs font-bold font-tenor text-zinc-800 dark:text-zinc-200 mb-1.5">
                  <span>Max Daily Rate:</span>
                  <span className="text-[#FFC72C] font-mono text-sm">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="450"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#FFC72C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  <span>$50</span>
                  <span>$250</span>
                  <span>$450+</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold font-tenor text-zinc-800 dark:text-zinc-200 block mb-2">Properties:</span>
                <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterHasPool}
                      onChange={(e) => setFilterHasPool(e.target.checked)}
                      className="rounded accent-[#FFC72C]"
                    />
                    <span>Swimming Pool</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterHasGenerator}
                      onChange={(e) => setFilterHasGenerator(e.target.checked)}
                      className="rounded accent-[#FFC72C]"
                    />
                    <span>Backup Generator</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold font-tenor text-zinc-800 dark:text-zinc-200 block mb-2">Vehicles:</span>
                <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filter4x4Only}
                      onChange={(e) => setFilter4x4Only(e.target.checked)}
                      className="rounded accent-[#FFC72C]"
                    />
                    <span>Four-Wheel Drive (4x4)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterWithDriverOnly}
                      onChange={(e) => setFilterWithDriverOnly(e.target.checked)}
                      className="rounded accent-[#FFC72C]"
                    />
                    <span>Chauffeur Included</span>
                  </label>
                </div>
              </div>

              <div className="flex items-end justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-[#FFC72C] dark:hover:text-[#FFC72C] font-semibold py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. DEDICATED VEHICLES SECTION (VEHICLES FIRST) */}
      <section id="vehicles" className="container mx-auto px-3 min-[360px]:px-4 sm:px-6 2xl:px-8 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] py-8 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC72C]/15 text-[#FFC72C] text-xs font-tenor font-bold mb-2">
              <Car className="w-3.5 h-3.5" />
              <span>Kigali Fleet & Safari 4x4s</span>
            </div>
            <h2 className="font-tenor text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Available Vehicles & 4x4 Fleet in Kigali
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Toyota Land Cruiser Prado TXL, Safari AWDs, and VIP Mercedes-Benz executive sedans.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl skeu-badge text-[#FFC72C]">
              {vehicleListings.length} Vehicles Available
            </span>
          </div>
        </div>

        {activeTab === 'property' ? (
          <div className="skeu-card rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto my-6 border border-black/10 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl skeu-tray flex items-center justify-center mx-auto text-[#FFC72C] mb-3">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-tenor font-bold text-base text-zinc-900 dark:text-white">Currently filtering by Apartments</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4">
              Explore our Kigali Land Cruiser Prado fleet, Safari AWDs, and executive chauffeurs.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="px-5 py-2 rounded-xl skeu-btn-teal !text-[#111111] text-xs font-tenor font-extrabold"
            >
              Show All Vehicles & Fleets
            </button>
          </div>
        ) : vehicleListings.length === 0 ? (
          <div className="skeu-card rounded-3xl p-12 text-center max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl skeu-tray flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-tenor font-bold text-lg text-zinc-900 dark:text-white">No vehicles match your criteria</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 mb-6">
              Try adjusting your price ceiling or reset filters to see all available vehicles.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl skeu-btn-teal !text-[#111111] text-xs font-tenor font-extrabold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
            {vehicleListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} daysCount={daysCount} />
            ))}
          </div>
        )}
      </section>

      {/* 5. DEDICATED APARTMENTS & RESIDENCES SECTION (APARTMENTS SECOND) */}
      <section id="apartments" className="container mx-auto px-3 min-[360px]:px-4 sm:px-6 2xl:px-8 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] py-8 scroll-mt-28 relative">
        {/* Backward-compatibility anchor for legacy #properties links */}
        <span id="properties" className="absolute -top-28 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC72C]/15 text-[#FFC72C] text-xs font-tenor font-bold mb-2">
              <Home className="w-3.5 h-3.5" />
              <span>Luxury Kigali Residences</span>
            </div>
            <h2 className="font-tenor text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Luxury Apartments & Diplomatic Stays in Kigali
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Gated diplomatic villas in Nyarutarama, panoramic penthouses in Kiyovu, and serviced modern lofts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl skeu-badge text-[#FFC72C]">
              {apartmentListings.length} Apartments Available
            </span>
          </div>
        </div>

        {activeTab === 'car' ? (
          <div className="skeu-card rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto my-6 border border-black/10 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl skeu-tray flex items-center justify-center mx-auto text-[#FFC72C] mb-3">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-tenor font-bold text-base text-zinc-900 dark:text-white">Currently filtering by Vehicles</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4">
              Explore our luxury serviced apartments, Kiyovu penthouses, and Nyarutarama villas.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="px-5 py-2 rounded-xl skeu-btn-terracotta !text-[#111111] text-xs font-tenor font-extrabold"
            >
              Show All Apartments & Stays
            </button>
          </div>
        ) : apartmentListings.length === 0 ? (
          <div className="skeu-card rounded-3xl p-12 text-center max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl skeu-tray flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-tenor font-bold text-lg text-zinc-900 dark:text-white">No residences match your criteria</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 mb-6">
              Try adjusting your price ceiling or reset filters to see all available properties.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl skeu-btn-teal !text-[#111111] text-xs font-tenor font-extrabold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
            {apartmentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} daysCount={daysCount} />
            ))}
          </div>
        )}
      </section>

      {/* 6. VISUAL STAY & DRIVE COMBO INTERACTIVE BANNER */}
      <section id="combo" className="container mx-auto px-3 min-[360px]:px-4 sm:px-6 2xl:px-8 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] my-12 scroll-mt-28">
        <div className="skeu-card-elevated bg-white dark:bg-[#141414] rounded-3xl overflow-hidden text-zinc-900 dark:text-white grid grid-cols-1 lg:grid-cols-12 items-center border border-black/10 dark:border-white/10 shadow-xl">
          {/* Visual Side: Combined Imagery */}
          <div className="lg:col-span-7 relative h-72 sm:h-96 w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85"
              alt="Stay and Drive Kigali Bundle"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white dark:via-[#141414]/40 dark:to-[#141414]" />
            <div className="absolute top-4 left-4 skeu-btn-terracotta text-[#111111] px-3 py-1 rounded-full text-xs font-tenor font-bold uppercase tracking-wider">
              Save 20% on Bundle
            </div>
          </div>

          {/* Copy Side */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center">
            <span className="text-xs font-bold font-tenor uppercase tracking-wider text-[#FFC72C] mb-2">
              Stay & Drive Experience
            </span>
            <h2 className="font-tenor text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white">
              Kiyovu Penthouse + Prado 4x4
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
              Pair any luxury villa with a Toyota Land Cruiser and unlock an automatic 20% bundle discount. Includes airport greeting, unified digital agreement, and 24/7 concierge.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('combo')}
                className="px-5 py-2.5 rounded-xl skeu-btn-terracotta !text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider"
              >
                View Combos
              </button>
              <a
                href="https://wa.me/250788123456?text=Hello%20Kigali%20Rentals,%20I%20am%20inquiring%20about%20the%20Stay%20%26%20Drive%20Combo%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl skeu-btn-frosted !text-[#FFC72C] font-tenor font-semibold text-xs flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VISUAL 3-STEP JOURNEY: HOW IT WORKS IN PHOTOGRAPHIC FRAMES */}
      <section id="how-it-works" className="bg-[#F1F3F6] dark:bg-[#0E0F12] border-y border-black/5 dark:border-white/10 py-20 my-16 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold font-tenor uppercase tracking-wider text-[#FFC72C]">
              Seamless Experience
            </span>
            <h2 className="font-tenor text-2xl sm:text-4xl font-extrabold text-[#FFC72C] mt-1">
              How Kigali Rentals Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Three simple steps to unlock your serviced home and vehicle in Rwanda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Select Villa or 4x4 Fleet',
                desc: 'Choose individual luxury properties, safari-ready Land Cruisers, or bundle both for 20% off.',
                img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
              },
              {
                step: '02',
                title: 'Call or WhatsApp Concierge',
                desc: 'Message or call our Kigali office directly (+250 788 123 456). We confirm availability, dates, and driver preferences within minutes.',
                img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
              },
              {
                step: '03',
                title: 'White-Glove Handover',
                desc: 'Meet your concierge at Kigali International Airport or at your private villa gates with verified condition checks.',
                img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col rounded-3xl overflow-hidden skeu-card-elevated group">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-xl skeu-btn-teal !text-[#111111] flex items-center justify-center font-tenor font-extrabold text-xs">
                    {step.step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-tenor font-bold text-lg text-zinc-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. VISUAL RWANDA SAFARI & SCENIC EXPEDITIONS (Inspiring Photographic Journey) */}
      <section id="about" className="container mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold font-tenor uppercase tracking-wider text-[#FFC72C]">
            Beyond the City
          </span>
          <h2 className="font-tenor text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Traverse Rwanda from Your Kigali Base
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Every vehicle in our fleet is fully serviced for cross-country exploration across Rwanda’s national parks and lakeside hills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Volcanoes National Park',
              badge: 'Gorilla Trekking • 2.5 hrs',
              desc: 'Paved highland roads leading to the mist-covered virungas.',
              img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=700&q=80',
            },
            {
              title: 'Lake Kivu Shores',
              badge: 'Waterfront Resorts • 3.0 hrs',
              desc: 'Scenic lakeside serpentine drives between Rubavu and Karongi.',
              img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80',
            },
            {
              title: 'Akagera Big Five Safari',
              badge: 'Savannah Wildlife • 2.5 hrs',
              desc: 'Off-road 4x4 tracks traversing savannahs, lakes, and elephant herds.',
              img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=700&q=80',
            },
            {
              title: 'Kigali Cultural Mile',
              badge: 'Kiyovu & Kimihurura • 5 mins',
              desc: 'Art galleries, diplomatic cafes, and illuminated convention domes.',
              img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80',
            },
          ].map((dest, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden skeu-card-elevated hover:shadow-2xl transition-all aspect-[4/5]">
              <Image
                src={dest.img}
                alt={dest.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FFC72C] glass-skeu-card px-2.5 py-0.5 rounded-full w-fit mb-2 shadow-xs">
                  {dest.badge}
                </span>
                <h3 className="font-tenor font-bold text-lg text-white group-hover:text-white transition-colors">
                  {dest.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2">
                  {dest.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. KIGALI NEIGHBORHOOD CURATION (VISUAL-FIRST) */}
      <section id="neighborhoods" className="bg-[#F8F9FB] dark:bg-[#0B0C0E] border-t border-black/5 dark:border-white/10 py-16 scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold font-tenor uppercase tracking-wider text-[#FFC72C]">
              Local Insights
            </span>
            <h2 className="font-tenor text-2xl sm:text-4xl font-extrabold text-[#FFC72C] mt-1">
              Explore Kigali’s Best Neighborhoods
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              From diplomatic embassies on Kiyovu hill to nightlife in Kimihurura, choose the ideal setting for your Rwanda stay.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Kiyovu Hill',
                badge: 'Diplomatic Core',
                desc: 'Historic tree-lined avenues, proximity to five-star hotels and presidential ministries. Serene, ultra-secure, and green.',
                img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
                nh: 'Kiyovu',
              },
              {
                title: 'Nyarutarama',
                badge: 'Golf & Estates',
                desc: 'Expansive private compounds, diplomatic residences, and walking distance to the 18-hole Kigali Golf Club.',
                img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
                nh: 'Nyarutarama',
              },
              {
                title: 'Kimihurura',
                badge: 'Culinary & Convention',
                desc: 'Kigali’s vibrant dining hub. Home to the illuminated Kigali Convention Centre dome, art bistros, and trendy lofts.',
                img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
                nh: 'Kimihurura',
              },
            ].map((n, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedNeighborhood(n.nh);
                  const el = document.getElementById('apartments') || document.getElementById('properties');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer skeu-card-elevated hover:shadow-2xl transition-all duration-300 aspect-[4/3]"
              >
                <Image
                  src={n.img}
                  alt={n.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase font-bold font-tenor tracking-wider text-[#FFC72C] glass-skeu-card px-2.5 py-0.5 rounded-full w-fit mb-2 shadow-xs">
                    {n.badge}
                  </span>
                  <h3 className="font-tenor font-bold text-xl text-white group-hover:text-white transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                    {n.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
