'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRental } from '@/lib/rentalContext';
import {
  Star,
  MapPin,
  ShieldCheck,
  Zap,
  Wifi,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Plus,
  Minus,
  Lock,
  ArrowRight,
  Info,
  Car as CarIcon,
  Home as HomeIcon,
  Phone,
  Flame,
  Award,
  Check,
  MessageSquare,
} from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { getListingById, formatPrice, draftBooking, setDraftBooking, lockSecondsLeft } = useRental();

  const listing = getListingById(id);

  // Gallery state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Booking Card State
  const [startDate, setStartDate] = useState(draftBooking.startDate || '2026-10-14');
  const [endDate, setEndDate] = useState(draftBooking.endDate || '2026-10-18');
  const [guestsCount, setGuestsCount] = useState(draftBooking.guestsCount || 2);

  // Add-ons toggles
  const [includeCrossSell, setIncludeCrossSell] = useState(false);
  const [addAirportPickup, setAddAirportPickup] = useState(false);
  const [addDedicatedDriver, setAddDedicatedDriver] = useState(false);
  const [addChildSeat, setAddChildSeat] = useState(false);
  const [addWifiHotspot, setAddWifiHotspot] = useState(true);

  // Format lock timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate days
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

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-tenor text-2xl font-bold text-[#0D3846]">Listing Not Found</h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested asset ID does not exist in the Kigali inventory.</p>
        <Link href="/" className="px-5 py-2.5 bg-[#0D3846] text-white rounded-xl text-xs font-tenor font-bold">
          Return to All Listings
        </Link>
      </div>
    );
  }

  const isCar = listing.type === 'car';

  // Cross-sell asset
  const crossSellAsset = listing.crossSellRecommendation;
  const crossSellDailyRate = crossSellAsset ? crossSellAsset.discountDailyRate : 0;

  // Price Itemization Calculations
  const baseTotal = listing.pricePerDay * daysCount;
  const comboTotal = includeCrossSell && crossSellAsset ? crossSellDailyRate * daysCount : 0;
  const cleaningFee = listing.cleaningOrServiceFee;
  
  let addOnsTotal = 0;
  if (addAirportPickup) addOnsTotal += 30;
  if (addDedicatedDriver && isCar) addOnsTotal += (listing.vehicleDetails?.driverCostPerDay || 25) * daysCount;
  if (addChildSeat) addOnsTotal += 15;
  if (addWifiHotspot) addOnsTotal += 10;

  const securityDepositHold = listing.securityDeposit;
  const subtotal = baseTotal + comboTotal + cleaningFee + addOnsTotal;
  const taxesAndTourismLevy = Math.round(subtotal * 0.05); // 5% Rwanda tourism & municipal levy
  const grandTotal = subtotal + taxesAndTourismLevy;

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    setDraftBooking((prev) => ({
      ...prev,
      assetId: listing.id,
      asset: listing,
      pairedAssetId: includeCrossSell && crossSellAsset ? crossSellAsset.assetId : undefined,
      startDate,
      endDate,
      daysCount,
      guestsCount,
      addOns: {
        airportPickup: addAirportPickup,
        dedicatedDriver: addDedicatedDriver,
        childSeat: addChildSeat,
        wifiHotspot: addWifiHotspot,
        damageWaiver: true,
      },
    }));

    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 pt-20 sm:pt-24">
      {/* Breadcrumbs & Direct Concierge Notice Header */}
      <div className="bg-[#07232C] text-white py-3 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#E6D7C3]/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/#${isCar ? 'vehicles' : 'apartments'}`} className="hover:text-white capitalize">
              {isCar ? 'Vehicles' : 'Apartments'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
              {listing.title}
            </span>
          </div>

          <a
            href="https://wa.me/250788123456"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#5A6B3C]/30 hover:bg-[#5A6B3C]/50 text-[#E6D7C3] px-3 py-1 rounded-full border border-[#5A6B3C]/40 font-mono text-[11px] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#5A6B3C] animate-pulse" />
            <span>Concierge Online • Call / WhatsApp: +250 788 123 456</span>
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-8">
        {/* Title & Micro Stats Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-tenor font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white ${
                  isCar ? 'bg-[#5A6B3C]' : 'bg-[#0D3846]'
                }`}
              >
                {isCar ? 'Automotive Fleet' : 'Residential Luxury'}
              </span>

              {listing.badges.map((b) => (
                <span
                  key={b}
                  className="text-xs font-medium bg-white text-[#0D3846] border border-[#E6D7C3] px-2.5 py-1 rounded-full"
                >
                  {b}
                </span>
              ))}

              {listing.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5A6B3C] bg-[#5A6B3C]/10 border border-[#5A6B3C]/20 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kigali Certified</span>
                </span>
              )}
            </div>

            <h1 className="font-tenor text-2xl sm:text-4xl font-extrabold text-[#0D3846] tracking-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 mt-2 font-medium">
              <div className="flex items-center gap-1 text-[#C85A2A]">
                <MapPin className="w-4 h-4" />
                <span>{listing.address}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-slate-800">
                <Star className="w-4 h-4 fill-[#C85A2A] text-[#C85A2A]" />
                <span className="font-bold">{listing.rating.toFixed(2)}</span>
                <span className="text-slate-500">({listing.reviewCount} verified guest reviews)</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => alert('Link copied to clipboard!')}
              className="px-4 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Share Listing
            </button>
          </div>
        </div>

        {/* 1. MEDIA GALLERY (LS-01) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {/* Main Large Viewer */}
          <div className="lg:col-span-3 relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-md bg-slate-900 border border-[#E6D7C3]">
            <Image
              src={listing.images[activePhotoIdx] || listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover transition-all duration-300"
              priority
            />
            <div className="absolute bottom-4 left-4 bg-black/85 text-white text-xs px-3 py-1.5 rounded-full font-mono">
              Photo {activePhotoIdx + 1} of {listing.images.length}
            </div>
          </div>

          {/* Thumbnails Column */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3">
            {listing.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative aspect-[16/10] lg:aspect-auto lg:h-[110px] rounded-2xl overflow-hidden border-2 transition-all ${
                  activePhotoIdx === idx
                    ? 'border-[#C85A2A] ring-2 ring-[#C85A2A]/40'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* 2-COLUMN MAIN LAYOUT: Content on left, Sticky Booking Box on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (8 cols): Specifications, Description, Cross-Sell, Map */}
          <div className="lg:col-span-7 space-y-8">
            {/* Quick Specs Highlight Strip */}
            <div className="bg-white p-5 rounded-2xl border border-[#E6D7C3] shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {isCar ? (
                <>
                  <div className="p-2">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Passengers</span>
                    <span className="font-tenor font-bold text-base text-[#0D3846]">
                      {listing.vehicleDetails?.seats} Seats
                    </span>
                  </div>
                  <div className="p-2 border-l border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Drivetrain</span>
                    <span className="font-tenor font-bold text-base text-[#0D3846] uppercase">
                      {listing.vehicleDetails?.category}
                    </span>
                  </div>
                  <div className="p-2 border-l border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Transmission</span>
                    <span className="font-tenor font-bold text-base text-[#0D3846] capitalize">
                      {listing.vehicleDetails?.transmission}
                    </span>
                  </div>
                  <div className="p-2 border-l border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Efficiency</span>
                    <span className="font-tenor font-bold text-base text-[#5A6B3C]">
                      {listing.vehicleDetails?.fuelEfficiency}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Bedrooms</span>
                    <span className="font-tenor font-bold text-base text-[#0D3846]">
                      {listing.propertyDetails?.bedrooms} En-Suite
                    </span>
                  </div>
                  <div className="p-2 border-l border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Bathrooms</span>
                    <span className="font-tenor font-bold text-base text-[#0D3846]">
                      {listing.propertyDetails?.bathrooms} Baths
                    </span>
                  </div>
                  <div className="p-2 border-l border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Capacity</span>
                    <span className="font-tenor font-bold text-base text-[#0D3846]">
                      {listing.propertyDetails?.maxGuests} Guests
                    </span>
                  </div>
                  <div className="p-2 border-l border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 font-tenor">Living Space</span>
                    <span className="font-tenor font-bold text-base text-[#5A6B3C]">
                      {listing.propertyDetails?.sqm} m²
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6D7C3] shadow-sm">
              <h2 className="font-tenor text-xl font-bold text-[#0D3846] mb-4">
                About this {isCar ? 'Vehicle' : 'Property'}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>

              {/* Verified Rwanda Guarantee Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-[#5A6B3C]/10 border border-[#5A6B3C]/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#5A6B3C] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-800">
                  <span className="font-bold text-[#5A6B3C] block mb-0.5">
                    Kigali Rentals Operational Assurance
                  </span>
                  Physical inspection completed on October 2026. Backup generator switches, water tanks, Wi-Fi latency, and vehicle tire tread depths are verified by in-house operations staff prior to every guest check-in.
                </div>
              </div>
            </div>

            {/* Amenities & Specifications (LS-02) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6D7C3] shadow-sm">
              <h2 className="font-tenor text-xl font-bold text-[#0D3846] mb-4">
                {isCar ? 'Vehicle Equipment & Safety Features' : 'Included Amenities & Comforts'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(isCar
                  ? listing.vehicleDetails?.features
                  : listing.propertyDetails?.amenities
                )?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-slate-800 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6D7C3]/50"
                  >
                    <CheckCircle className="w-4 h-4 text-[#5A6B3C] shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. CROSS-SELL CALLOUT MODULE (BK-05, LS-06) */}
            {crossSellAsset && (
              <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5EFE6] rounded-3xl p-6 sm:p-8 border-2 border-[#C85A2A]/40 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-full sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-md border border-[#E6D7C3]">
                    <Image
                      src={crossSellAsset.image}
                      alt={crossSellAsset.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#C85A2A] text-white text-[10px] font-tenor font-bold px-2 py-0.5 rounded-full uppercase">
                      Bundle Deal
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C85A2A] uppercase tracking-wider mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended Pairing</span>
                    </div>
                    <h3 className="font-tenor font-bold text-lg text-[#0D3846]">
                      {crossSellAsset.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 mb-3">
                      {crossSellAsset.tagline}
                    </p>
                    <div className="text-xs text-slate-500 font-mono mb-4">
                      {crossSellAsset.specs}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5">
                          {formatPrice(crossSellAsset.originalDailyRate)}/day
                        </span>
                        <span className="font-tenor font-extrabold text-lg text-[#C85A2A]">
                          +{formatPrice(crossSellAsset.discountDailyRate)}
                        </span>
                        <span className="text-xs text-slate-500"> /day</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIncludeCrossSell(!includeCrossSell)}
                        className={`px-4 py-2 rounded-xl text-xs font-tenor font-bold transition-all shadow-sm ${
                          includeCrossSell
                            ? 'bg-[#5A6B3C] text-white hover:bg-[#44522C]'
                            : 'bg-[#C85A2A] text-white hover:bg-[#B24F23]'
                        }`}
                      >
                        {includeCrossSell ? '✓ Added to Booking' : '+ Add to My Booking'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mock Kigali Map Placeholder */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6D7C3] shadow-sm">
              <h2 className="font-tenor text-xl font-bold text-[#0D3846] mb-2">
                Location & Neighborhood Access
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Exact coordinates provided upon confirmation. Centrally positioned in {listing.neighborhood}.
              </p>

              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#E6D7C3] bg-[#E6D7C3]/30 flex flex-col items-center justify-center p-6 text-center">
                {/* Simulated map background grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#0D3846_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#C85A2A] text-white flex items-center justify-center shadow-lg shadow-[#C85A2A]/40 mb-3 animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-tenor font-bold text-base text-[#0D3846]">
                    {listing.address}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mt-1">
                    5 mins to Kigali Heights & KCC • 12 mins to Kigali International Airport (KGL) • 24/7 paved dual-lane access
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sticky Booking Box (BK-02, LS-03) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="skeu-card-elevated rounded-3xl p-6 sm:p-7">
              {/* Daily Rate Header */}
              <div className="flex items-baseline justify-between border-b border-[#E6D7C3]/60 pb-4 mb-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Starting from</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-tenor font-extrabold text-3xl text-[#0D3846]">
                      {formatPrice(listing.pricePerDay)}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      {isCar ? '/ day' : '/ night'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5A6B3C] bg-[#5A6B3C]/10 px-2.5 py-1 rounded-full border border-[#5A6B3C]/20 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>Instant Booking</span>
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">100% Refundable Deposit</div>
                </div>
              </div>

              {/* Date & Guest Inputs */}
              <div className="space-y-3 mb-5">
                <DatePicker
                  label={`Dates (${daysCount} ${isCar ? 'days' : 'nights'})`}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                />

                <div className="skeu-tray p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase font-tenor text-slate-400">
                      {isCar ? 'Passengers' : 'Total Guests'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {guestsCount} {guestsCount === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-7 h-7 rounded-lg skeu-btn-frosted flex items-center justify-center text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestsCount(guestsCount + 1)}
                      className="w-7 h-7 rounded-lg skeu-btn-frosted flex items-center justify-center text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add-ons Checkboxes */}
              <div className="space-y-2 mb-6">
                <span className="block text-xs font-bold font-tenor text-slate-600 uppercase">
                  Add-on Services
                </span>

                <label className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-200 hover:bg-[#FAF7F2] cursor-pointer transition-all">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addAirportPickup}
                      onChange={(e) => setAddAirportPickup(e.target.checked)}
                      className="rounded accent-[#C85A2A]"
                    />
                    <span className="text-slate-800">Kigali Airport VIP Meet & Greet</span>
                  </div>
                  <span className="font-semibold text-slate-700">+{formatPrice(30)}</span>
                </label>

                {isCar && (
                  <label className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-200 hover:bg-[#FAF7F2] cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addDedicatedDriver}
                        onChange={(e) => setAddDedicatedDriver(e.target.checked)}
                        className="rounded accent-[#C85A2A]"
                      />
                      <span className="text-slate-800">Professional Chauffeur</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      +{formatPrice((listing.vehicleDetails?.driverCostPerDay || 25) * daysCount)}
                    </span>
                  </label>
                )}

                <label className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-200 hover:bg-[#FAF7F2] cursor-pointer transition-all">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addWifiHotspot}
                      onChange={(e) => setAddWifiHotspot(e.target.checked)}
                      className="rounded accent-[#C85A2A]"
                    />
                    <span className="text-slate-800">5G High-Speed Pocket MiFi</span>
                  </div>
                  <span className="font-semibold text-slate-700">+{formatPrice(10)}</span>
                </label>

                {crossSellAsset && (
                  <label
                    className={`flex items-center justify-between text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                      includeCrossSell
                        ? 'border-[#C85A2A] bg-[#C85A2A]/10 shadow-[inset_0_1px_2px_rgba(200,90,42,0.1)]'
                        : 'border-slate-200 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={includeCrossSell}
                        onChange={(e) => setIncludeCrossSell(e.target.checked)}
                        className="rounded accent-[#C85A2A]"
                      />
                      <span className="text-slate-800 font-medium truncate">
                        Bundle: {crossSellAsset.title}
                      </span>
                    </div>
                    <span className="font-bold text-[#C85A2A] shrink-0">
                      +{formatPrice(comboTotal)}
                    </span>
                  </label>
                )}
              </div>

              {/* Price Itemization Breakdown (BK-02, PY-03) */}
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>
                    {formatPrice(listing.pricePerDay)} × {daysCount} {isCar ? 'days' : 'nights'}
                  </span>
                  <span className="font-semibold text-slate-800">{formatPrice(baseTotal)}</span>
                </div>

                {includeCrossSell && (
                  <div className="flex justify-between text-[#C85A2A]">
                    <span>Pairing: {crossSellAsset?.title}</span>
                    <span className="font-semibold">{formatPrice(comboTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Cleaning & Prep fee</span>
                  <span className="font-semibold text-slate-800">{formatPrice(cleaningFee)}</span>
                </div>

                {addOnsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Selected add-ons</span>
                    <span className="font-semibold text-slate-800">{formatPrice(addOnsTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Rwanda Tourism & Municipal Levy (5%)</span>
                  <span>{formatPrice(taxesAndTourismLevy)}</span>
                </div>

                <div className="flex justify-between text-slate-500 pt-1 border-t border-dashed border-slate-200">
                  <span className="flex items-center gap-1">
                    <span>Refundable Deposit Hold</span>
                    <span title="Held via MoMo or Card, released upon handover">
                      <Info className="w-3 h-3" />
                    </span>
                  </span>
                  <span className="font-mono text-[#5A6B3C] font-medium">
                    {formatPrice(securityDepositHold)} (Hold)
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-slate-200">
                  <span className="font-tenor font-bold text-sm text-[#0D3846]">Total Estimated</span>
                  <span className="font-tenor font-extrabold text-xl text-[#0D3846]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Direct Booking Actions (WhatsApp & Phone Call) */}
              {(() => {
                const whatsappMessage = `Hello Kigali Rentals! I would like to inquire about renting "${listing.title}" in ${listing.neighborhood}, Kigali.
Dates: ${startDate} to ${endDate} (${daysCount} ${isCar ? 'days' : 'nights'})
Guests: ${guestsCount} ${guestsCount === 1 ? 'person' : 'people'}
Estimated total: ${formatPrice(grandTotal)}
Is this available?`;
                const whatsappUrl = `https://wa.me/250788123456?text=${encodeURIComponent(whatsappMessage)}`;
                const phoneUrl = `tel:+250788123456`;

                return (
                  <div className="space-y-2.5">
                    {/* Primary Action: Direct WhatsApp Chat */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full skeu-btn-terracotta active:scale-[0.99] text-white py-3.5 px-6 rounded-2xl font-tenor font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MessageSquare className="w-4 h-4 fill-current shrink-0" />
                      <span>Chat on WhatsApp to Book</span>
                    </a>

                    {/* Secondary Action: Direct Phone Call */}
                    <a
                      href={phoneUrl}
                      className="w-full skeu-btn-teal text-white py-3 px-6 rounded-2xl font-tenor font-bold text-sm tracking-tight flex items-center justify-center gap-2 transition-all"
                    >
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>Call Concierge (+250 788 123 456)</span>
                    </a>

                    <div className="pt-3 border-t border-slate-100 text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5A6B3C]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Direct Booking • Zero Intermediary Fees</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Call or text us anytime. Keys delivered at Kigali Airport or to your address.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Assistance card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E6D7C3] flex items-center gap-3 text-xs text-slate-700">
              <Phone className="w-4 h-4 text-[#C85A2A] shrink-0" />
              <div>
                <span className="font-bold text-[#0D3846]">Have special delegation or safari questions?</span>
                <span className="block text-slate-500">Call our Kigali office at +250 788 123 456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

