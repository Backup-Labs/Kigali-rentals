'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
    title: 'Kiyovu Luxury Heights & Panoramic Skyline',
    badge: 'Diplomatic Hill Precinct',
    neighborhood: 'Kiyovu, Kigali',
    tab: 'all' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2400&q=85',
    title: 'Nyarutarama Diplomatic Private Villa',
    badge: 'Private Tropical Compound',
    neighborhood: 'Nyarutarama, Kigali',
    tab: 'property' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2400&q=85',
    title: 'Toyota Land Cruiser Prado TXL 4x4 Fleet',
    badge: 'Safari & Volcanoes Expedition Ready',
    neighborhood: 'Rwanda-wide Fleet',
    tab: 'car' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85',
    title: 'Stay & Drive Curated Experience',
    badge: 'Villa + Prado 4x4 (-20% Bundle)',
    neighborhood: 'Greater Kigali & Beyond',
    tab: 'combo' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
    title: 'Panoramic Hilltop Penthouse Views',
    badge: 'Floor-to-Ceiling Balcony',
    neighborhood: 'Kimihurura, Kigali',
    tab: 'property' as const,
  },
];

const HERO_BACKGROUNDS = {
  all: HERO_SLIDES[0],
  property: HERO_SLIDES[1],
  car: HERO_SLIDES[2],
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
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [startDate, setStartDate] = useState(draftBooking.startDate || '2026-10-14');
  const [endDate, setEndDate] = useState(draftBooking.endDate || '2026-10-18');
  const [guestsCapacity, setGuestsCapacity] = useState('2');

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
    setDraftBooking((prev) => ({
      ...prev,
      startDate,
      endDate,
      daysCount,
      guestsCount: parseInt(guestsCapacity, 10) || 2,
    }));
    // Smooth scroll to listings grid
    const target = document.getElementById('properties');
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

      // Dynamic tab capacity / model filter
      if (guestsCapacity !== 'all') {
        if (activeTab === 'property') {
          if (guestsCapacity === 'studio' && item.propertyDetails?.category !== 'studio') return false;
          if (guestsCapacity === 'penthouse' && item.propertyDetails?.category !== 'penthouse') return false;
          if (guestsCapacity === 'villa' && item.propertyDetails?.category !== 'villa') return false;
        } else if (activeTab === 'car') {
          if (guestsCapacity === '4x4' && !item.vehicleDetails?.fourWheelDrive) return false;
          if (guestsCapacity === 'with_driver' && item.vehicleDetails?.driverOption === 'self-drive') return false;
          if (guestsCapacity === 'hybrid' && item.vehicleDetails?.category !== 'hybrid') return false;
          if (guestsCapacity === 'luxury' && item.vehicleDetails?.category !== 'luxury') return false;
        } else if (activeTab === 'combo') {
          if (guestsCapacity === 'penthouse' && item.propertyDetails?.category !== 'penthouse') return false;
          if (guestsCapacity === 'villa' && item.propertyDetails?.category !== 'villa') return false;
          if (guestsCapacity === 'studio' && item.propertyDetails?.category !== 'studio') return false;
        } else if (activeTab === 'all') {
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
    selectedNeighborhood,
    maxPrice,
    selectedAssetSubtype,
    guestsCapacity,
    filterWithDriverOnly,
    filter4x4Only,
    filterHasPool,
    filterHasGenerator,
    sortBy,
  ]);

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
      zoneIcon: <MapPin className="w-3.5 h-3.5 text-[#C85A2A]" />,
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
      capacityIcon: <Users className="w-3.5 h-3.5 text-[#5A6B3C]" />,
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
      zoneIcon: <Home className="w-3.5 h-3.5 text-[#C85A2A]" />,
      zoneOptions: [
        { value: 'all', label: 'All Kigali Locations', description: 'Diplomatic Villas, Penthouses & Lofts' },
        { value: 'Kiyovu', label: 'Kiyovu Diplomatic Hill', description: 'Embassies, Penthouses & City Views' },
        { value: 'Nyarutarama', label: 'Nyarutarama Golf Estates', description: 'Private Gated Luxury Compounds' },
        { value: 'Kimihurura', label: 'Kimihurura Culinary Hub', description: 'Modern Serviced Urban Lofts' },
        { value: 'Gacuriro', label: 'Gacuriro Panoramic Heights', description: 'High-Elevation Residential Mansions' },
      ],
      dateLabel: 'Check-in / Check-out',
      capacityLabel: 'Bedrooms & Residence',
      capacityIcon: <Home className="w-3.5 h-3.5 text-[#C85A2A]" />,
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
      zoneIcon: <MapPin className="w-3.5 h-3.5 text-[#5A6B3C]" />,
      zoneOptions: [
        { value: 'all', label: 'All Delivery Desks', description: 'Airport, Kiyovu Hub or Hotel Delivery' },
        { value: 'airport', label: 'Kigali International Airport (KGL)', description: 'Flight meet & greet at arrivals' },
        { value: 'Kiyovu', label: 'Kiyovu Central Operations Desk', description: 'Central Kigali key collection' },
        { value: 'hotel', label: 'Direct Hotel / Villa Delivery', description: 'Chauffeur brings vehicle to your door' },
      ],
      dateLabel: 'Rental Duration',
      capacityLabel: 'Fleet Model & Chauffeur',
      capacityIcon: <Car className="w-3.5 h-3.5 text-[#5A6B3C]" />,
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
      zoneIcon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      zoneOptions: [
        { value: 'all', label: 'All Curated Bundles (-20%)', description: 'Combined single invoice & deposit hold' },
        { value: 'Kiyovu', label: 'Diplomatic Kiyovu + Prado Fleet', description: 'Hilltop Penthouse with Land Cruiser' },
        { value: 'Nyarutarama', label: 'Nyarutarama Villa + Chauffeur 4x4', description: 'Private compound with dedicated driver' },
        { value: 'Kimihurura', label: 'Kimihurura Loft + RAV4 Hybrid', description: 'Urban serviced loft with AWD cruiser' },
      ],
      dateLabel: 'Bundle Stay & Drive Dates',
      capacityLabel: 'Curated Package Tier',
      capacityIcon: <Layers className="w-3.5 h-3.5 text-[#C85A2A]" />,
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
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* 1. HERO SECTION: ZERO-SCROLL GUARANTEED WITH LOWERED FORM PLACEMENT */}
      <section className="relative h-[100dvh] min-h-[640px] max-h-[1050px] flex flex-col justify-center items-center px-4 sm:px-6 pt-24 sm:pt-28 pb-6 sm:pb-8">
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
        <div className="absolute bottom-3 right-4 sm:right-8 z-30 flex items-center gap-1.5 glass-skeu-card px-2.5 py-1 rounded-full pointer-events-auto">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlideIndex ? 'w-5 bg-[#C85A2A]' : 'w-1.5 bg-slate-400/50 hover:bg-slate-600'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Hero Headlines: Positioned with distinct distance from navbar and wide breathing space to form */}
        <div className="container mx-auto relative z-10 max-w-3xl text-center mb-10 sm:mb-14 mt-4 sm:mt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-xs sm:text-sm font-syne font-semibold text-white mb-2 sm:mb-2.5 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A2A] animate-pulse"></span>
            <span>Rwanda Verified Living & Mobility</span>
            <span className="text-white/60">•</span>
            <span className="text-white/95 font-sans font-normal text-xs">Villas & 4x4 Prado Fleet</span>
          </div>

          <h1 className="font-syne text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-xl mb-2 sm:mb-2.5">
            Find your luxury stay & drive in{' '}
            <span className="text-[#C85A2A] relative inline-block">
              Kigali
              <span className="absolute bottom-1 left-0 right-0 h-2 sm:h-2.5 bg-[#C85A2A]/30 -z-10 rounded-full" />
            </span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-white/95 font-sans max-w-xl mx-auto leading-relaxed drop-shadow-md">
            Serviced diplomatic villas and panoramic penthouses paired seamlessly with safari-ready 4x4 Land Cruisers. 100% verified backup power & water.
          </p>
        </div>

        {/* High-Frost Luminous Glassmorphic Search Form (Lowered position, zero-scroll fit) */}
        <div
          id="search"
          className="w-full max-w-6xl mx-auto relative z-20 glass-high-frost rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 text-slate-800 scroll-mt-24 transition-all"
        >
          {/* Dynamic Tab Selector with Tactile Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 pb-2.5 mb-2.5 border-b border-white/70 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-syne font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'skeu-tab-active text-white shadow-sm'
                  : 'skeu-btn-frosted text-slate-700 hover:text-slate-900'
              }`}
            >
              All Assets
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('property')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-syne font-bold transition-all shrink-0 ${
                activeTab === 'property'
                  ? 'skeu-tab-active text-white shadow-sm'
                  : 'skeu-btn-frosted text-slate-700 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#C85A2A]" />
              <span>Stays</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('car')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-syne font-bold transition-all shrink-0 ${
                activeTab === 'car'
                  ? 'skeu-tab-active text-white shadow-sm'
                  : 'skeu-btn-frosted text-slate-700 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-[#5A6B3C]" />
              <span>Vehicles</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('combo')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-syne font-bold transition-all shrink-0 ${
                activeTab === 'combo'
                  ? 'skeu-tab-active-accent text-white shadow-sm'
                  : 'skeu-btn-frosted text-[#C85A2A] hover:text-[#B24F23]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stay & Drive Combo</span>
              <span className="text-[10px] bg-white/30 px-1.5 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>

          {/* Luxury Form Inputs Grid with Unified Card Heights */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            <div className="lg:col-span-3">
              <CustomSelect
                label={tabConfigs[activeTab].zoneLabel}
                icon={tabConfigs[activeTab].zoneIcon}
                options={tabConfigs[activeTab].zoneOptions}
                value={selectedNeighborhood}
                onChange={(val) => setSelectedNeighborhood(val)}
              />
            </div>

            <div className="lg:col-span-4">
              <DatePicker
                label={tabConfigs[activeTab].dateLabel}
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>

            <div className="lg:col-span-3">
              <CustomSelect
                label={tabConfigs[activeTab].capacityLabel}
                icon={tabConfigs[activeTab].capacityIcon}
                options={tabConfigs[activeTab].capacityOptions}
                value={guestsCapacity}
                onChange={(val) => setGuestsCapacity(val)}
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-[52px] sm:h-[56px] skeu-btn-terracotta text-white rounded-xl sm:rounded-2xl font-syne font-bold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="truncate">{tabConfigs[activeTab].buttonText}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. VISUAL SHOWCASE STRIP: CURATED CATEGORY BENTO (Visual-First Skeuomorphic Experience) */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Diplomatic Villas',
              badge: 'Kiyovu & Nyarutarama',
              desc: 'Gated compounds with private pools, manicured gardens, and 24/7 security.',
              img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
              tab: 'property',
            },
            {
              title: 'Hilltop Penthouses',
              badge: 'Panoramic Kigali',
              desc: 'Floor-to-ceiling glass balconies overlooking the illuminated 1,000 hills.',
              img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
              tab: 'property',
            },
            {
              title: '4x4 Prado Fleets',
              badge: 'Self-Drive or Chauffeur',
              desc: 'Expedition Land Cruisers ready for Kigali hills or Volcanoes Gorilla safaris.',
              img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
              tab: 'car',
            },
            {
              title: 'Executive Chauffeurs',
              badge: 'Airport & Diplomatic',
              desc: 'Mercedes-Benz & Hybrid AWD with verified English & French speaking drivers.',
              img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
              tab: 'car',
            },
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => {
                setActiveTab(cat.tab as any);
                const el = document.getElementById('properties');
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
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A2A] glass-skeu-card px-2.5 py-0.5 rounded-full w-fit mb-2 shadow-xs">
                  {cat.badge}
                </span>
                <h3 className="font-syne font-bold text-lg text-white group-hover:text-amber-200 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2">
                  {cat.desc}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90 mt-2 group-hover:translate-x-1 transition-transform">
                  <span>Explore category</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C85A2A]" />
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
              <span className="font-syne font-bold text-slate-500 uppercase text-[11px] shrink-0 mr-1">
                Asset:
              </span>
              {[
                { label: 'All', value: 'all' },
                { label: 'Penthouses', value: 'penthouse' },
                { label: 'Villas', value: 'villa' },
                { label: 'Studios', value: 'studio' },
                { label: '4x4 SUVs', value: '4x4' },
                { label: 'Hybrids', value: 'hybrid' },
                { label: 'VIP Chauffeur', value: 'luxury' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setSelectedAssetSubtype(pill.value)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 text-xs ${
                    selectedAssetSubtype === pill.value
                      ? 'skeu-tab-active text-white font-semibold'
                      : 'skeu-btn-frosted text-slate-700'
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-syne transition-all ${
                  showAdvancedFilters
                    ? 'skeu-btn-terracotta text-white'
                    : 'skeu-btn-frosted text-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {(filterWithDriverOnly || filter4x4Only || filterHasPool || filterHasGenerator || maxPrice < 350) && (
                  <span className="w-2 h-2 rounded-full bg-amber-300"></span>
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
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between text-xs font-bold font-syne text-slate-800 mb-1.5">
                  <span>Max Daily Rate:</span>
                  <span className="text-[#C85A2A] font-mono text-sm">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="450"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#C85A2A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$50</span>
                  <span>$250</span>
                  <span>$450+</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold font-syne text-slate-800 block mb-2">Properties:</span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterHasPool}
                      onChange={(e) => setFilterHasPool(e.target.checked)}
                      className="rounded accent-[#C85A2A]"
                    />
                    <span>Swimming Pool</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterHasGenerator}
                      onChange={(e) => setFilterHasGenerator(e.target.checked)}
                      className="rounded accent-[#C85A2A]"
                    />
                    <span>Backup Generator</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold font-syne text-slate-800 block mb-2">Vehicles:</span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filter4x4Only}
                      onChange={(e) => setFilter4x4Only(e.target.checked)}
                      className="rounded accent-[#C85A2A]"
                    />
                    <span>Four-Wheel Drive (4x4)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterWithDriverOnly}
                      onChange={(e) => setFilterWithDriverOnly(e.target.checked)}
                      className="rounded accent-[#C85A2A]"
                    />
                    <span>Chauffeur Included</span>
                  </label>
                </div>
              </div>

              <div className="flex items-end justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#C85A2A] font-semibold py-2 px-3 rounded-lg hover:bg-[#FAF7F2] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. VISUAL STAY & DRIVE COMBO INTERACTIVE BANNER (BK-05) */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 my-12 scroll-mt-28">
        <div className="skeu-card-elevated !bg-gradient-to-br !from-[#0D3846] !via-[#092B36] !to-[#061F27] rounded-3xl overflow-hidden text-white grid grid-cols-1 lg:grid-cols-12 items-center border border-[#16495A]">
          {/* Visual Side: Combined Imagery */}
          <div className="lg:col-span-7 relative h-72 sm:h-96 w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85"
              alt="Stay and Drive Kigali Bundle"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0D3846]/40 to-[#0D3846]" />
            <div className="absolute top-4 left-4 skeu-btn-terracotta text-white px-3 py-1 rounded-full text-xs font-syne font-bold uppercase tracking-wider">
              Save 20% on Bundle
            </div>
          </div>

          {/* Copy Side */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center">
            <span className="text-xs font-bold font-syne uppercase tracking-wider text-emerald-300 mb-2">
              Stay & Drive Experience
            </span>
            <h2 className="font-syne text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Kiyovu Penthouse + Prado 4x4
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Pair any luxury villa with a Toyota Land Cruiser and unlock an automatic 20% bundle discount. Includes airport greeting, unified digital agreement, and 24/7 concierge.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('combo')}
                className="px-5 py-2.5 rounded-xl skeu-btn-terracotta text-white font-syne font-bold text-xs uppercase tracking-wider"
              >
                View Combos
              </button>
              <Link
                href="/handover"
                className="px-4 py-2.5 rounded-xl skeu-btn-frosted !text-[#0D3846] font-syne font-semibold text-xs"
              >
                Inspection Tool
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VISUAL LISTINGS GRID */}
      <section id="properties" className="container mx-auto px-4 sm:px-6 py-6 scroll-mt-28">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-syne text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'property'
                ? 'Available Properties in Kigali'
                : activeTab === 'car'
                ? 'Available Kigali Fleet'
                : activeTab === 'combo'
                ? 'Stay & Drive Curated Packages'
                : 'Featured Kigali Rentals'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {filteredListings.length} premium listings matching your dates and criteria
            </p>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="skeu-card rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl skeu-tray flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-syne font-bold text-lg text-slate-900">No listings found</h3>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Try adjusting your price ceiling or reset filters to see all available inventory.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl skeu-btn-teal text-white text-xs font-syne font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} daysCount={daysCount} />
            ))}
          </div>
        )}
      </section>

      {/* 6. VISUAL 3-STEP JOURNEY: HOW IT WORKS IN PHOTOGRAPHIC FRAMES */}
      <section id="how-it-works" className="bg-white/60 backdrop-blur-md border-y border-[#E6D7C3]/60 py-20 my-16 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold font-syne uppercase tracking-wider text-[#C85A2A]">
              Seamless Experience
            </span>
            <h2 className="font-syne text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              How Kigali Rentals Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
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
                title: 'Digital Hold & Agreement',
                desc: 'Lock inventory in 10 minutes. Sign digital agreements and pay with MTN MoMo, Airtel, or Credit Card.',
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
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-xl skeu-btn-teal text-white flex items-center justify-center font-syne font-bold text-xs">
                    {step.step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-syne font-bold text-lg text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
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
          <span className="text-xs font-bold font-syne uppercase tracking-wider text-[#C85A2A]">
            Beyond the City
          </span>
          <h2 className="font-syne text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Traverse Rwanda from Your Kigali Base
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
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
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A2A] glass-skeu-card px-2 py-0.5 rounded-full w-fit mb-2 shadow-xs">
                  {dest.badge}
                </span>
                <h3 className="font-syne font-bold text-lg text-white group-hover:text-amber-200 transition-colors">
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

      {/* 8. VISUAL OPERATIONAL STANDARD: HANDOVER TOOL PREVIEW */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="skeu-card-elevated rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5A6B3C]/10 text-[#5A6B3C] border border-[#5A6B3C]/30 text-xs font-bold font-syne shadow-[inset_0_1px_1px_rgba(90,107,60,0.15)]">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Friction Transparency</span>
            </div>
            <h2 className="font-syne text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Digital Condition Inspection on Every Handover
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We eliminate rental disputes with digital photo inspection at pickup and return. Odometer readings, fuel sliders, and room condition checklists are recorded on your phone.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2 p-2 rounded-xl skeu-tray">
                <Camera className="w-4 h-4 text-[#C85A2A]" />
                <span>4-Angle Exterior Photos</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl skeu-tray">
                <Fuel className="w-4 h-4 text-[#5A6B3C]" />
                <span>Digital Fuel Gauge Log</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl skeu-tray">
                <Gauge className="w-4 h-4 text-[#0D3846]" />
                <span>Mileage Tracking</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl skeu-tray">
                <Zap className="w-4 h-4 text-[#C85A2A]" />
                <span>Backup Power Test</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/handover"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl skeu-btn-teal text-white font-syne font-bold text-xs"
              >
                <span>Launch Interactive Handover Tool</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual Tool Mockup Card */}
          <div className="lg:col-span-6 skeu-card rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 text-xs font-syne font-bold text-slate-700">
              <span>Sample Inspection Report #RW-2026</span>
              <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Verified Matching
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80"
                  alt="Check-in Photo"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  Check-in (Front)
                </span>
              </div>
              <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80"
                  alt="Check-out Photo"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  Check-out (Match)
                </span>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between text-slate-600">
                <span>Fuel Gauge Level:</span>
                <span className="font-mono font-bold text-slate-900">100% (Full Tank)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Odometer Mileage:</span>
                <span className="font-mono font-bold text-slate-900">42,850 km</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Security Deposit Refund:</span>
                <span className="font-mono font-bold text-emerald-600">Instant Release</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. KIGALI NEIGHBORHOOD CURATION (VISUAL-FIRST) */}
      <section id="about" className="bg-white/60 backdrop-blur-md border-t border-[#E6D7C3]/60 py-16 scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold font-syne uppercase tracking-wider text-[#C85A2A]">
              Local Insights
            </span>
            <h2 className="font-syne text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Explore Kigali’s Best Neighborhoods
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
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
                  const el = document.getElementById('properties');
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
                  <span className="text-[10px] uppercase font-bold font-syne tracking-wider text-[#C85A2A] glass-skeu-card px-2.5 py-0.5 rounded-full w-fit mb-2 shadow-xs">
                    {n.badge}
                  </span>
                  <h3 className="font-syne font-bold text-xl text-white group-hover:text-[#E6D7C3] transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
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
