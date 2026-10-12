'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/lib/types';
import { useRental } from '@/lib/rentalContext';
import {
  Star,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Car as CarIcon,
  Home as HomeIcon,
  Zap,
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  daysCount?: number;
}

export default function ListingCard({ listing, daysCount = 3 }: ListingCardProps) {
  const { formatPrice, setDraftBooking } = useRental();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
  const totalEstimatedPrice = listing.pricePerDay * daysCount;

  const handleSelectForDraft = () => {
    setDraftBooking((prev) => ({
      ...prev,
      assetId: listing.id,
      asset: listing,
      daysCount,
    }));
  };

  return (
    <div className="group skeu-card-elevated rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Image Gallery Header with Carousel */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <Image
          src={listing.images[currentImageIndex] || listing.images[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={listing.featured}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-syne font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white shadow-md ${
              isCar ? 'bg-gradient-to-b from-[#6A7E46] to-[#5A6B3C] border border-[#44522C]' : 'bg-gradient-to-b from-[#184F60] to-[#0D3846] border border-[#082731]'
            }`}
          >
            {isCar ? <CarIcon className="w-3 h-3" /> : <HomeIcon className="w-3 h-3" />}
            {isCar ? 'Vehicle' : 'Property'}
          </span>

          {listing.badges?.[0] && (
            <span className="text-[10px] font-semibold skeu-badge text-[#0D3846] px-2.5 py-0.5 rounded-full">
              {listing.badges[0]}
            </span>
          )}
        </div>

        {/* Verified Badge */}
        {listing.isVerified && (
          <div className="absolute top-3 right-3 glass-skeu-card p-1.5 rounded-full text-emerald-600 shadow-sm z-10" title="Verified Quality & Power Backup Checked">
            <ShieldCheck className="w-4 h-4 fill-emerald-100" />
          </div>
        )}

        {/* Carousel Navigation Buttons */}
        {listing.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-xs shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-xs shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
              {listing.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-[#0D3846]/80 mb-2">
            <div className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C85A2A]" />
              <span>{listing.neighborhood}, Kigali</span>
            </div>
            <div className="flex items-center gap-1 text-slate-800 font-bold skeu-badge px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{listing.rating.toFixed(2)}</span>
              <span className="text-slate-400 font-normal">({listing.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/listings/${listing.id}`} onClick={handleSelectForDraft}>
            <h3 className="font-syne font-bold text-base sm:text-lg text-[#0D3846] group-hover:text-[#C85A2A] transition-colors leading-snug line-clamp-1">
              {listing.title}
            </h3>
          </Link>

          {/* Subtitle / Description teaser */}
          <p className="text-xs text-slate-600 line-clamp-1 mt-1 mb-3">
            {listing.subtitle}
          </p>

          {/* Specifications Chips */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl skeu-tray text-xs text-[#0D3846] font-medium mb-3.5">
            {isCar ? (
              <span className="truncate">
                {listing.specsSummary}
              </span>
            ) : (
              <span className="truncate">
                {listing.specsSummary}
              </span>
            )}
          </div>

          {/* Cross-Sell Teaser Banner if available */}
          {listing.crossSellRecommendation && (
            <div className="mb-3.5 p-2 rounded-xl bg-gradient-to-r from-[#C85A2A]/10 to-transparent border border-[#C85A2A]/20 flex items-center justify-between gap-2 text-[11px] text-[#C85A2A]">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#C85A2A]" />
                <span className="truncate font-medium">
                  {listing.crossSellRecommendation.tagline}
                </span>
              </div>
              <span className="shrink-0 font-bold underline cursor-pointer">
                Bundle
              </span>
            </div>
          )}
        </div>

        {/* Footer Pricing & CTA */}
        <div className="pt-3 border-t border-[#E6D7C3]/60 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-syne font-extrabold text-lg sm:text-xl text-[#0D3846]">
                {formatPrice(listing.pricePerDay)}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                {isCar ? '/ day' : '/ night'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Est. {formatPrice(totalEstimatedPrice)} for {daysCount} {isCar ? 'days' : 'nights'}
            </div>
          </div>

          <Link
            href={`/listings/${listing.id}`}
            onClick={handleSelectForDraft}
            className="px-3.5 sm:px-4 py-2 rounded-xl skeu-btn-teal text-white font-syne font-semibold text-xs tracking-tight"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

