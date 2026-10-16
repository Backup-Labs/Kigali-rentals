'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/lib/types';
import { useRental } from '@/lib/rentalContext';
import {
  Star,
  Compass,
  Heart,
  Bed,
  Bath,
  Waves,
  Zap,
  Users,
  Gauge,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  daysCount?: number;
}

export default function ListingCard({ listing, daysCount = 3 }: ListingCardProps) {
  const { formatPrice, setDraftBooking } = useRental();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const isCar = listing.type === 'car';

  const handleSelectForDraft = () => {
    setDraftBooking((prev) => ({
      ...prev,
      assetId: listing.id,
      asset: listing,
      daysCount,
    }));
  };

  return (
    <div className="group bg-white dark:bg-[#141519] rounded-[26px] p-3 sm:p-3.5 border border-black/5 dark:border-zinc-800/80 hover:border-[#FFC72C]/40 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.7)] hover:shadow-[0_16px_36px_-6px_rgba(255,199,44,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* 1. Inset Image Frame with Action Buttons matching Reference Design */}
      <div className="relative aspect-[16/11] rounded-[20px] overflow-hidden bg-black mb-3.5 border border-black/5 dark:border-zinc-800/60">
        <Link href={`/listings/${listing.id}`} onClick={handleSelectForDraft} className="block w-full h-full relative">
          <Image
            src={listing.images[currentImageIndex] || listing.images[0]}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={listing.featured}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
        </Link>

        {/* Floating Bottom-Left Badge: Gold Pill (Directly from uploaded photo!) */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFC72C] text-xs font-extrabold text-[#111111]">
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            <span>{isCar ? 'For Rent • Fleet' : 'For Rent • Villa'}</span>
          </div>
        </div>

        {/* Floating Bottom-Right Action Buttons: Map + Wishlist */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label="View on map"
            className="w-9 h-9 rounded-full bg-white/90 dark:bg-[#181920]/90 backdrop-blur-md border border-black/10 dark:border-zinc-700/80 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-[#FFC72C] hover:border-[#FFC72C]/40 hover:scale-110 active:scale-95 transition-all"
            title="Explore neighborhood on map"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            aria-label="Save to favorites"
            className="w-9 h-9 rounded-full bg-white/90 dark:bg-[#181920]/90 backdrop-blur-md border border-black/10 dark:border-zinc-700/80 flex items-center justify-center text-[#FFC72C] hover:scale-110 active:scale-95 transition-all"
            title="Save to favorites"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'fill-[#FFC72C] text-[#FFC72C]' : 'text-[#FFC72C]'
              }`}
            />
          </button>
        </div>

        {/* Carousel Navigation Buttons */}
        {listing.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Gallery Indicator Dots */}
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {listing.images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-[#FFC72C] w-4' : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Price Row & Rating */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-baseline gap-1">
          <span className="font-price text-2xl sm:text-[26px] font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
            {formatPrice(listing.pricePerDay)}
          </span>
          <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {isCar ? '/ day' : '/ night'}
          </span>
        </div>

        {/* Rating Pill with Gold Star */}
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181920] border border-black/5 dark:border-zinc-800 shadow-2xs">
          <Star className="w-3.5 h-3.5 fill-[#FFC72C] text-[#FFC72C]" />
          <span className="text-xs font-bold text-zinc-900 dark:text-white">
            {listing.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">/ 5.0</span>
        </div>
      </div>

      {/* 3. Divider Line */}
      <div className="border-t border-black/5 dark:border-zinc-800/80 my-2" />

      {/* 4. Eyebrow Category, Title & Address Subtitle (Matching photo style!) */}
      <div className="px-1 mb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFC72C] block mb-1">
          {isCar
            ? (listing.vehicleDetails?.fourWheelDrive ? 'AUTOMATIC SUV • 4X4 EXPEDITION' : 'VIP SALOON • LEATHER')
            : 'FURNISHED LUXURY RESIDENCE'}
        </span>
        <Link href={`/listings/${listing.id}`} onClick={handleSelectForDraft}>
          <h3 className="font-tenor font-bold text-base sm:text-lg text-zinc-900 dark:text-white group-hover:text-[#FFC72C] transition-colors leading-snug line-clamp-1">
            {listing.title}
          </h3>
        </Link>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
          {listing.neighborhood}, Kigali • Rwanda
        </p>
      </div>

      {/* 5. Amenities / Specs Row */}
      <div className="mt-auto px-1 pt-2.5 border-t border-black/5 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-medium">
        {isCar ? (
          <>
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-4 h-4 text-[#FFC72C] shrink-0" />
              <span className="truncate">{listing.vehicleDetails?.seats || 5} seats</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Gauge className="w-4 h-4 text-[#FFC72C] shrink-0" />
              <span className="truncate">{listing.vehicleDetails?.fourWheelDrive ? '4x4 AWD' : 'Auto'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4 h-4 text-[#FFC72C] shrink-0" />
              <span className="truncate">
                {listing.vehicleDetails?.driverOption === 'both' ? 'Driver opt' : 'Chauffeur'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 truncate">
              <Bed className="w-4 h-4 text-[#FFC72C] shrink-0" />
              <span className="truncate">{listing.propertyDetails?.bedrooms || 3} bedroom</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Bath className="w-4 h-4 text-[#FFC72C] shrink-0" />
              <span className="truncate">{listing.propertyDetails?.bathrooms || 2} bathroom</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              {listing.propertyDetails?.hasPool ? (
                <>
                  <Waves className="w-4 h-4 text-[#FFC72C] shrink-0" />
                  <span className="truncate">1 private pool</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#FFC72C] shrink-0" />
                  <span className="truncate">24/7 generator</span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
