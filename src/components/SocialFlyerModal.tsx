'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Listing } from '@/lib/types';
import { USD_TO_RWF_RATE } from '@/lib/mockData';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Share2,
  Smartphone,
  Square,
  RectangleVertical,
} from 'lucide-react';

interface SocialFlyerModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isNewlyCreated?: boolean;
}

type FlyerFormat = 'square' | 'portrait' | 'story';
type FlyerTheme = 'obsidian' | 'poster' | 'pearl';
type PriceDisplayMode = 'usd' | 'rwf' | 'both' | 'inquire';

const FORMAT_DIMENSIONS: Record<
  FlyerFormat,
  { width: number; height: number; label: string; sub: string }
> = {
  square: {
    width: 1080,
    height: 1080,
    label: 'Instagram Post (1:1)',
    sub: '1080 x 1080 px',
  },
  portrait: {
    width: 1080,
    height: 1350,
    label: 'Feed Flyer (4:5)',
    sub: '1080 x 1350 px',
  },
  story: {
    width: 1080,
    height: 1920,
    label: 'Story / Status (9:16)',
    sub: '1080 x 1920 px',
  },
};

export default function SocialFlyerModal({
  listing,
  isOpen,
  onClose,
  isNewlyCreated = false,
}: SocialFlyerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const [format, setFormat] = useState<FlyerFormat>('portrait');
  const [flyerTheme, setFlyerTheme] = useState<FlyerTheme>('obsidian');
  const [selectedHeroIdx, setSelectedHeroIdx] = useState<number>(0);
  const [showCollage, setShowCollage] = useState<boolean>(true);
  const [priceMode, setPriceMode] = useState<PriceDisplayMode>('usd');
  const [badgeText, setBadgeText] = useState<string>('NEW LISTING - KIGALI');
  const [contactPhone, setContactPhone] = useState<string>('+250 788 123 456');
  const [websiteUrl, setWebsiteUrl] = useState<string>('kigalirentals.rw');
  const [ctaText, setCtaText] = useState<string>('Book Instant Stay or Chauffeur');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Reset defaults when listing changes
  useEffect(() => {
    if (listing) {
      setSelectedHeroIdx(0);
      setBadgeText(
        listing.type === 'car'
          ? 'AVAILABLE NOW - 4X4 FLEET'
          : 'LUXURY RESIDENCE - KIGALI'
      );
      setCtaText(
        listing.type === 'car'
          ? 'Self-Drive or Executive Chauffeur'
          : 'Book Your Stay in Kigali Today'
      );
    }
  }, [listing]);

  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      const img = new window.Image();
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  };

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    radius = 0
  ) => {
    ctx.save();
    if (radius > 0) {
      roundRect(ctx, x, y, w, h, radius);
      ctx.clip();
    }
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let drawW = w;
    let drawH = h;
    let offsetX = x;
    let offsetY = y;

    if (imgRatio > boxRatio) {
      drawW = h * imgRatio;
      offsetX = x - (drawW - w) / 2;
    } else {
      drawH = w / imgRatio;
      offsetY = y - (drawH - h) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  };

  const wrapTextLines = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines = 3
  ): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        if (lines.length >= maxLines - 1) {
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine && lines.length < maxLines) {
      const remainingWords = words.slice(
        lines.join(' ').split(/\s+/).filter(Boolean).length
      );
      const lastText = remainingWords.join(' ');
      if (ctx.measureText(lastText).width > maxWidth) {
        let truncated = currentLine;
        while (
          ctx.measureText(truncated + '...').width > maxWidth &&
          truncated.length > 0
        ) {
          truncated = truncated.slice(0, -1);
        }
        lines.push(truncated + '...');
      } else {
        lines.push(lastText || currentLine);
      }
    }
    return lines;
  };

  const renderFlyerToCanvas = useCallback(async () => {
    if (!listing || !canvasRef.current) return;
    setIsRendering(true);

    const canvas = canvasRef.current;
    const { width: W, height: H } = FORMAT_DIMENSIONS[format];
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsRendering(false);
      return;
    }

    const imagesList = listing.images?.length ? listing.images : [];
    const mainSrc = imagesList[selectedHeroIdx] || imagesList[0] || '';
    const secondarySrcs = imagesList
      .filter((_, idx) => idx !== selectedHeroIdx)
      .slice(0, 2);

    const [heroImg, ...thumbImgs] = await Promise.all([
      loadImage(mainSrc),
      ...secondarySrcs.map((s) => loadImage(s)),
    ]);

    const isLight = flyerTheme === 'pearl';
    const isPoster = flyerTheme === 'poster';

    ctx.fillStyle = isLight ? '#F8F9FB' : '#0B0C0E';
    ctx.fillRect(0, 0, W, H);

    const pad = 56;
    const gold = '#FFC72C';
    const darkInk = '#111111';

    if (isPoster) {
      if (heroImg) {
        drawImageCover(ctx, heroImg, 0, 0, W, H, 0);
      }
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(11, 12, 14, 0.78)');
      grad.addColorStop(0.3, 'rgba(11, 12, 14, 0.18)');
      grad.addColorStop(0.55, 'rgba(11, 12, 14, 0.55)');
      grad.addColorStop(1, 'rgba(11, 12, 14, 0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      const glow = ctx.createRadialGradient(
        W * 0.8,
        H * 0.1,
        20,
        W * 0.8,
        H * 0.1,
        W * 0.7
      );
      glow.addColorStop(0, 'rgba(255, 199, 44, 0.16)');
      glow.addColorStop(1, 'rgba(255, 199, 44, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const imgTop = 148;
      const imgHeight =
        format === 'square' ? 470 : format === 'portrait' ? 620 : 960;
      const imgWidth = W - pad * 2;

      if (heroImg) {
        drawImageCover(ctx, heroImg, pad, imgTop, imgWidth, imgHeight, 36);
      } else {
        ctx.fillStyle = '#1E2028';
        roundRect(ctx, pad, imgTop, imgWidth, imgHeight, 36);
        ctx.fill();
      }

      ctx.save();
      roundRect(ctx, pad, imgTop, imgWidth, imgHeight, 36);
      ctx.clip();
      const innerGrad = ctx.createLinearGradient(
        0,
        imgTop + imgHeight * 0.5,
        0,
        imgTop + imgHeight
      );
      innerGrad.addColorStop(0, 'rgba(0,0,0,0)');
      innerGrad.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = innerGrad;
      ctx.fillRect(pad, imgTop, imgWidth, imgHeight);
      ctx.restore();

      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, pad, imgTop, imgWidth, imgHeight, 36);
      ctx.stroke();

      const validThumbs = thumbImgs.filter(Boolean) as HTMLImageElement[];
      if (showCollage && validThumbs.length > 0) {
        const thumbW = 150;
        const thumbH = 110;
        const gap = 14;
        validThumbs.forEach((tImg, i) => {
          const tx =
            W -
            pad -
            24 -
            (validThumbs.length - i) * thumbW -
            (validThumbs.length - 1 - i) * gap;
          const ty = imgTop + imgHeight - thumbH - 22;
          drawImageCover(ctx, tImg, tx, ty, thumbW, thumbH, 18);
          ctx.strokeStyle = gold;
          ctx.lineWidth = 3;
          roundRect(ctx, tx, ty, thumbW, thumbH, 18);
          ctx.stroke();
        });
      }

      ctx.save();
      const locText = `${listing.neighborhood.toUpperCase()}, KIGALI`;
      ctx.font = 'bold 20px sans-serif';
      const locW = ctx.measureText(locText).width + 54;
      const locX = pad + 24;
      const locY = imgTop + imgHeight - 66;
      ctx.fillStyle = 'rgba(17, 17, 17, 0.85)';
      roundRect(ctx, locX, locY, locW, 44, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 199, 44, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(locX + 22, locY + 22, 6, 0, Math.PI * 2);
      ctx.fillStyle = gold;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(locText, locX + 36, locY + 29);
      ctx.restore();
    }

    const logoSize = 64;
    ctx.fillStyle = gold;
    roundRect(ctx, pad, 46, logoSize, logoSize, 16);
    ctx.fill();

    ctx.fillStyle = darkInk;
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('K', pad + logoSize / 2, 46 + 44);
    ctx.textAlign = 'left';

    ctx.fillStyle = isLight && !isPoster ? '#111111' : '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Kigali', pad + logoSize + 18, 76);
    const kigaliW = ctx.measureText('Kigali').width;
    ctx.fillStyle = gold;
    ctx.fillText('Rentals', pad + logoSize + 18 + kigaliW, 76);

    ctx.fillStyle = isLight && !isPoster ? '#64748B' : 'rgba(255,255,255,0.65)';
    ctx.font = '600 15px monospace';
    ctx.fillText('RWANDA LIVING & 4X4 MOBILITY', pad + logoSize + 18, 100);

    if (badgeText.trim()) {
      ctx.font = '800 19px sans-serif';
      const bText = badgeText.trim().toUpperCase();
      const bWidth = ctx.measureText(bText).width + 44;
      const bX = W - pad - bWidth;
      const bY = 54;
      ctx.fillStyle = gold;
      roundRect(ctx, bX, bY, bWidth, 48, 24);
      ctx.fill();
      ctx.fillStyle = darkInk;
      ctx.fillText(bText, bX + 22, bY + 31);
    }

    const contentStartY = isPoster
      ? H - (format === 'story' ? 660 : 490)
      : format === 'square'
      ? 655
      : format === 'portrait'
      ? 808
      : 1155;

    const textPrimary = isLight && !isPoster ? '#111111' : '#FFFFFF';
    const textSecondary =
      isLight && !isPoster ? '#52525B' : 'rgba(255, 255, 255, 0.75)';

    ctx.font = '800 19px monospace';
    ctx.fillStyle = gold;
    const categoryLabel =
      listing.type === 'car'
        ? `${listing.vehicleDetails?.category?.toUpperCase() || '4X4'} FLEET  //  VERIFIED ASSET`
        : `${listing.propertyDetails?.category?.toUpperCase() || 'LUXURY'} RESIDENCE  //  VERIFIED ASSET`;
    ctx.fillText(categoryLabel, pad, contentStartY);

    ctx.font = 'bold 46px sans-serif';
    ctx.fillStyle = textPrimary;
    const titleLines = wrapTextLines(ctx, listing.title, W - pad * 2, 2);
    let cursorY = contentStartY + 52;
    titleLines.forEach((line) => {
      ctx.fillText(line, pad, cursorY);
      cursorY += 54;
    });

    ctx.font = '500 23px sans-serif';
    ctx.fillStyle = textSecondary;
    const descText =
      format === 'story'
        ? `${listing.subtitle}. ${listing.description}`
        : listing.subtitle || listing.description;
    const maxDescLines = format === 'story' ? 4 : format === 'portrait' ? 2 : 1;
    const subLines = wrapTextLines(ctx, descText, W - pad * 2, maxDescLines);
    subLines.forEach((line) => {
      ctx.fillText(line, pad, cursorY);
      cursorY += 34;
    });

    cursorY += 16;
    const specPills: string[] = [];
    if (listing.type === 'property' && listing.propertyDetails) {
      specPills.push(`${listing.propertyDetails.bedrooms} Bedrooms`);
      specPills.push(`${listing.propertyDetails.bathrooms} Bathrooms`);
      specPills.push(`Up to ${listing.propertyDetails.maxGuests} Guests`);
      if (listing.propertyDetails.hasPool) specPills.push('Private Pool');
      else if (listing.propertyDetails.hasBackupGenerator)
        specPills.push('24/7 Backup Power');
      if (listing.propertyDetails.hasFastWifi) specPills.push('High-Speed WiFi');
    } else if (listing.type === 'car' && listing.vehicleDetails) {
      specPills.push(`${listing.vehicleDetails.seats} Seats`);
      specPills.push(
        listing.vehicleDetails.transmission === 'automatic'
          ? 'Automatic'
          : 'Manual'
      );
      if (listing.vehicleDetails.fourWheelDrive) specPills.push('4x4 AWD');
      specPills.push(listing.vehicleDetails.fuelType.toUpperCase());
      specPills.push(
        listing.vehicleDetails.driverOption === 'both'
          ? 'Self-Drive / Chauffeur'
          : 'VIP Chauffeur'
      );
    } else {
      specPills.push(...listing.specsSummary.split('•').map((s) => s.trim()));
    }

    ctx.font = 'bold 20px sans-serif';
    let pillX = pad;
    const pillH = 44;
    for (const pill of specPills.slice(0, 5)) {
      const pw = ctx.measureText(pill).width + 34;
      if (pillX + pw > W - pad) break;
      ctx.fillStyle =
        isLight && !isPoster
          ? 'rgba(17, 17, 17, 0.06)'
          : 'rgba(255, 255, 255, 0.1)';
      roundRect(ctx, pillX, cursorY, pw, pillH, 12);
      ctx.fill();
      ctx.strokeStyle =
        isLight && !isPoster
          ? 'rgba(17, 17, 17, 0.12)'
          : 'rgba(255, 199, 44, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = textPrimary;
      ctx.fillText(pill, pillX + 17, cursorY + 29);
      pillX += pw + 12;
    }

    const footerH = 148;
    const footerY = H - footerH - 42;
    ctx.fillStyle = isLight && !isPoster ? '#111111' : '#16181F';
    roundRect(ctx, pad, footerY, W - pad * 2, footerH, 28);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 199, 44, 0.45)';
    ctx.lineWidth = 2;
    roundRect(ctx, pad, footerY, W - pad * 2, footerH, 28);
    ctx.stroke();

    const rwfAmount = (listing.pricePerDay * USD_TO_RWF_RATE).toLocaleString();
    let mainPriceText = `$${listing.pricePerDay}`;
    let subPriceText =
      listing.type === 'car'
        ? 'PER DAY  |  ALL INCLUSIVE'
        : 'PER NIGHT  |  VERIFIED';

    if (priceMode === 'rwf') {
      mainPriceText = `${rwfAmount} RWF`;
    } else if (priceMode === 'both') {
      mainPriceText = `$${listing.pricePerDay}`;
      subPriceText = `${rwfAmount} RWF / ${listing.type === 'car' ? 'DAY' : 'NIGHT'}`;
    } else if (priceMode === 'inquire') {
      mainPriceText = 'VIP RATES';
      subPriceText = 'CONTACT CONCIERGE FOR QUOTE';
    }

    ctx.fillStyle = gold;
    ctx.font = '900 48px sans-serif';
    ctx.fillText(mainPriceText, pad + 34, footerY + 72);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(subPriceText, pad + 34, footerY + 108);

    ctx.textAlign = 'right';
    const rightEdge = W - pad - 34;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 23px sans-serif';
    ctx.fillText(ctaText || 'Book Your Stay Today', rightEdge, footerY + 54);

    ctx.fillStyle = gold;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`TEL: ${contactPhone}`, rightEdge, footerY + 90);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '600 17px monospace';
    ctx.fillText(`WEB: ${websiteUrl}`, rightEdge, footerY + 120);

    ctx.textAlign = 'left';
    setIsRendering(false);
  }, [
    listing,
    format,
    flyerTheme,
    selectedHeroIdx,
    showCollage,
    priceMode,
    badgeText,
    contactPhone,
    websiteUrl,
    ctaText,
  ]);

  useEffect(() => {
    if (isOpen && listing) {
      renderFlyerToCanvas();
    }
  }, [isOpen, listing, renderFlyerToCanvas]);

  if (!mounted || !isOpen || !listing) return null;

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const slug = listing.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    link.download = `kigali-rentals-${slug}-${format}.png`;
    link.href = dataUrl;
    link.click();
  };

  const generateSocialCaption = () => {
    const rwf = (listing.pricePerDay * USD_TO_RWF_RATE).toLocaleString();
    const rateLine =
      priceMode === 'rwf'
        ? `Rate: ${rwf} RWF / ${listing.type === 'car' ? 'day' : 'night'}`
        : priceMode === 'both'
        ? `Rate: $${listing.pricePerDay} (${rwf} RWF) / ${
            listing.type === 'car' ? 'day' : 'night'
          }`
        : priceMode === 'inquire'
        ? `Rate: Contact Concierge for VIP Rates`
        : `Rate: $${listing.pricePerDay} / ${
            listing.type === 'car' ? 'day' : 'night'
          }`;

    const highlights =
      listing.type === 'property'
        ? (listing.propertyDetails?.amenities || []).slice(0, 4)
        : (listing.vehicleDetails?.features || []).slice(0, 4);

    return `[${badgeText}]
${listing.title} - ${listing.subtitle}
Location: ${listing.neighborhood}, Kigali, Rwanda

${listing.description}

Specifications: ${listing.specsSummary}
${highlights.map((h) => `- ${h}`).join('\n')}

${rateLine}
Tel / WhatsApp: ${contactPhone}
Book Online: https://${websiteUrl}

#KigaliRentals #VisitRwanda #KigaliLiving #RwandaLuxury #${listing.neighborhood.replace(
      /\s+/g,
      ''
    )} #Kigali`;
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generateSocialCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999] w-screen h-dvh bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#141519] w-full max-w-5xl max-h-[90dvh] rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="shrink-0 px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#111318]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFC72C] text-[#111111] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="font-tenor font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                  Social Media Flyer Studio — {listing.title}
                </h2>
                {isNewlyCreated && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase shrink-0">
                    Published
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                Customize template and download ready-to-post PNG flyer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Compact Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: LIVE HIGH-RES CANVAS PREVIEW (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-zinc-100 dark:bg-[#0B0C0E] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="w-full flex items-center justify-between mb-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                Preview ({FORMAT_DIMENSIONS[format].sub})
              </span>
              {isRendering && (
                <span className="text-[#FFC72C] font-mono">Rendering...</span>
              )}
            </div>

            <div className="relative flex items-center justify-center w-full overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[360px] sm:max-h-[410px] w-auto max-w-full rounded-xl shadow-xl border border-black/10 dark:border-white/10"
              />
            </div>
          </div>

          {/* RIGHT: FLYER STUDIO CONTROLS (6 cols) */}
          <div className="lg:col-span-6 space-y-3.5">
            {/* Format & Theme in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  1. Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'portrait' as const, label: '4:5', icon: RectangleVertical },
                    { id: 'square' as const, label: '1:1', icon: Square },
                    { id: 'story' as const, label: '9:16', icon: Smartphone },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormat(item.id)}
                        className={`py-2 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          format === item.id
                            ? 'bg-[#FFC72C] text-[#111111] border-[#FFC72C]'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  2. Theme Style
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'obsidian' as const, label: 'Dark' },
                    { id: 'poster' as const, label: 'Poster' },
                    { id: 'pearl' as const, label: 'Light' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFlyerTheme(t.id)}
                      className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all ${
                        flyerTheme === t.id
                          ? 'bg-[#FFC72C] text-[#111111] border-[#FFC72C]'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Select Featured Photo & Collage */}
            {listing.images.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    3. Main Photo
                  </label>
                  {flyerTheme !== 'poster' && (
                    <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCollage}
                        onChange={(e) => setShowCollage(e.target.checked)}
                        className="rounded accent-[#FFC72C]"
                      />
                      <span>Inset thumbnails</span>
                    </label>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {listing.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedHeroIdx(idx)}
                      className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        selectedHeroIdx === idx
                          ? 'border-[#FFC72C]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Format */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                4. Price Display
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'usd' as const, label: 'USD ($)' },
                  { id: 'rwf' as const, label: 'RWF' },
                  { id: 'both' as const, label: 'Both' },
                  { id: 'inquire' as const, label: 'Quote' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPriceMode(pm.id)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                      priceMode === pm.id
                        ? 'bg-[#FFC72C] text-[#111111] border-[#FFC72C]'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Headlines & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                  Promo Badge
                </span>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                  Call-To-Action
                </span>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                  Phone / WhatsApp
                </span>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                  Website
                </span>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Social Caption Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Social Caption
                </span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="text-[11px] font-bold text-[#FFC72C] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCaption ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-sans text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap max-h-20 overflow-y-auto leading-snug bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                {generateSocialCaption()}
              </pre>
            </div>
          </div>
        </div>

        {/* Pinned Footer Actions */}
        <div className="shrink-0 px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111318] flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleCopyCaption}
            className="h-9 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:border-[#FFC72C] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-tenor font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            {copiedCaption ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Caption Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>Copy Caption</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="h-9 px-5 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download PNG Flyer</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
