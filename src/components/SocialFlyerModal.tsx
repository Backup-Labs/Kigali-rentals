'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Helper to load an image safely for Canvas drawing
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

  // Helper to draw rounded rectangle path
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

  // Helper to draw an image with `object-fit: cover` inside a box
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

  // Word-wrap text helper returning lines
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

  // Render the High-Res Social Flyer on HTML5 Canvas (Zero emojis)
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

    // Load hero image + up to 2 secondary images for collage
    const imagesList = listing.images?.length ? listing.images : [];
    const mainSrc = imagesList[selectedHeroIdx] || imagesList[0] || '';
    const secondarySrcs = imagesList.filter((_, idx) => idx !== selectedHeroIdx).slice(0, 2);

    const [heroImg, ...thumbImgs] = await Promise.all([
      loadImage(mainSrc),
      ...secondarySrcs.map((s) => loadImage(s)),
    ]);

    const isLight = flyerTheme === 'pearl';
    const isPoster = flyerTheme === 'poster';

    // 1. Background Fill
    ctx.fillStyle = isLight ? '#F8F9FB' : '#0B0C0E';
    ctx.fillRect(0, 0, W, H);

    const pad = 56;
    const gold = '#FFC72C';
    const darkInk = '#111111';

    if (isPoster) {
      // FULL-BLEED MAGAZINE POSTER STYLE
      if (heroImg) {
        drawImageCover(ctx, heroImg, 0, 0, W, H, 0);
      }
      // Deep cinematic top & bottom gradient overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(11, 12, 14, 0.78)');
      grad.addColorStop(0.3, 'rgba(11, 12, 14, 0.18)');
      grad.addColorStop(0.55, 'rgba(11, 12, 14, 0.55)');
      grad.addColorStop(1, 'rgba(11, 12, 14, 0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      // CARD / EDITORIAL LAYOUT (OBSIDIAN OR PEARL)
      const glow = ctx.createRadialGradient(W * 0.8, H * 0.1, 20, W * 0.8, H * 0.1, W * 0.7);
      glow.addColorStop(0, 'rgba(255, 199, 44, 0.16)');
      glow.addColorStop(1, 'rgba(255, 199, 44, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Hero image frame
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

      // Bottom inner shadow inside hero image for badge readability
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

      // Subtle border around hero image
      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, pad, imgTop, imgWidth, imgHeight, 36);
      ctx.stroke();

      // Secondary Collage Thumbnails on Bottom-Right of Hero Image
      const validThumbs = thumbImgs.filter(Boolean) as HTMLImageElement[];
      if (showCollage && validThumbs.length > 0) {
        const thumbW = 150;
        const thumbH = 110;
        const gap = 14;
        validThumbs.forEach((tImg, i) => {
          const tx =
            W - pad - 24 - (validThumbs.length - i) * thumbW - (validThumbs.length - 1 - i) * gap;
          const ty = imgTop + imgHeight - thumbH - 22;
          drawImageCover(ctx, tImg, tx, ty, thumbW, thumbH, 18);
          ctx.strokeStyle = gold;
          ctx.lineWidth = 3;
          roundRect(ctx, tx, ty, thumbW, thumbH, 18);
          ctx.stroke();
        });
      }

      // Location Pill inside Hero Image (Bottom-Left) - Clean geometric dot instead of emoji
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

      // Gold location indicator dot
      ctx.beginPath();
      ctx.arc(locX + 22, locY + 22, 6, 0, Math.PI * 2);
      ctx.fillStyle = gold;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(locText, locX + 36, locY + 29);
      ctx.restore();
    }

    // 2. TOP HEADER BAR (Brand Logo + Promo Badge)
    const logoSize = 64;
    ctx.fillStyle = gold;
    roundRect(ctx, pad, 46, logoSize, logoSize, 16);
    ctx.fill();

    ctx.fillStyle = darkInk;
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('K', pad + logoSize / 2, 46 + 44);
    ctx.textAlign = 'left';

    // Brand Title
    ctx.fillStyle = isLight && !isPoster ? '#111111' : '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Kigali', pad + logoSize + 18, 76);
    const kigaliW = ctx.measureText('Kigali').width;
    ctx.fillStyle = gold;
    ctx.fillText('Rentals', pad + logoSize + 18 + kigaliW, 76);

    ctx.fillStyle = isLight && !isPoster ? '#64748B' : 'rgba(255,255,255,0.65)';
    ctx.font = '600 15px monospace';
    ctx.fillText('RWANDA LIVING & 4X4 MOBILITY', pad + logoSize + 18, 100);

    // Top-Right Promo Badge Pill
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

    // 3. CONTENT & TYPOGRAPHY SECTION
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

    // Category Eyebrow
    ctx.font = '800 19px monospace';
    ctx.fillStyle = gold;
    const categoryLabel =
      listing.type === 'car'
        ? `${listing.vehicleDetails?.category?.toUpperCase() || '4X4'} FLEET  //  VERIFIED ASSET`
        : `${listing.propertyDetails?.category?.toUpperCase() || 'LUXURY'} RESIDENCE  //  VERIFIED ASSET`;
    ctx.fillText(categoryLabel, pad, contentStartY);

    // Title
    ctx.font = 'bold 46px sans-serif';
    ctx.fillStyle = textPrimary;
    const titleLines = wrapTextLines(ctx, listing.title, W - pad * 2, 2);
    let cursorY = contentStartY + 52;
    titleLines.forEach((line) => {
      ctx.fillText(line, pad, cursorY);
      cursorY += 54;
    });

    // Subtitle / Description snippet
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

    // Specs & Highlight Pills Row
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

    // 4. BOTTOM PRICE & CONTACT FOOTER CARD
    const footerH = 148;
    const footerY = H - footerH - 42;
    ctx.fillStyle = isLight && !isPoster ? '#111111' : '#16181F';
    roundRect(ctx, pad, footerY, W - pad * 2, footerH, 28);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 199, 44, 0.45)';
    ctx.lineWidth = 2;
    roundRect(ctx, pad, footerY, W - pad * 2, footerH, 28);
    ctx.stroke();

    // Left of Footer: Price
    const rwfAmount = (listing.pricePerDay * USD_TO_RWF_RATE).toLocaleString();
    let mainPriceText = `$${listing.pricePerDay}`;
    let subPriceText =
      listing.type === 'car' ? 'PER DAY  |  ALL INCLUSIVE' : 'PER NIGHT  |  VERIFIED';

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

    // Right of Footer: Contact & CTA Box (Clean text, no emojis)
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

  if (!isOpen || !listing) return null;

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

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#141519] w-full max-w-6xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#111318]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#111111] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-tenor font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
                  Social Media Flyer & Card Studio
                </h2>
                {isNewlyCreated && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                    Listing Published - Ready to Share
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Customize and download a high-resolution social media flyer and caption for{' '}
                <strong className="text-zinc-800 dark:text-zinc-200">{listing.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Left Live Flyer Canvas Preview | Right Customization Controls */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: LIVE HIGH-RES CANVAS PREVIEW (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-100 dark:bg-[#0B0C0E] rounded-2xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="w-full flex items-center justify-between mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                Live High-Res Flyer Preview ({FORMAT_DIMENSIONS[format].sub})
              </span>
              {isRendering && (
                <span className="text-[#FFC72C] font-mono text-[11px]">Rendering...</span>
              )}
            </div>

            <div className="relative flex items-center justify-center w-full overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[540px] w-auto max-w-full rounded-2xl shadow-2xl border border-black/10 dark:border-white/10"
              />
            </div>

            {/* Primary Download & Copy Action Bar under Preview */}
            <div className="w-full mt-5 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="w-full sm:flex-1 h-11 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download High-Res PNG Flyer</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-white dark:bg-zinc-800 hover:border-[#FFC72C] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-tenor font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Caption Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#FFC72C]" />
                    <span>Copy Social Caption</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: FLYER STUDIO CONTROLS (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Social Platform Size / Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                1. Social Media Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'portrait' as const, label: '4:5 Feed', icon: RectangleVertical },
                  { id: 'square' as const, label: '1:1 Post', icon: Square },
                  { id: 'story' as const, label: '9:16 Story', icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormat(item.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        format === item.id
                          ? 'bg-[#FFC72C] text-[#111111] border-[#FFC72C]'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Flyer Visual Theme */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                2. Flyer Template Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'obsidian' as const, label: 'Obsidian Gold' },
                  { id: 'poster' as const, label: 'Full-Bleed Poster' },
                  { id: 'pearl' as const, label: 'Pearl Editorial' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFlyerTheme(t.id)}
                    className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold transition-all ${
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

            {/* 3. Select Featured Photo & Collage */}
            {listing.images.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    3. Main Flyer Photo
                  </label>
                  {flyerTheme !== 'poster' && (
                    <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCollage}
                        onChange={(e) => setShowCollage(e.target.checked)}
                        className="rounded accent-[#FFC72C]"
                      />
                      <span>Show inset thumbnails</span>
                    </label>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {listing.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedHeroIdx(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        selectedHeroIdx === idx
                          ? 'border-[#FFC72C] scale-105'
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

            {/* 4. Price Display Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                4. Price Badge Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'usd' as const, label: 'USD ($)' },
                  { id: 'rwf' as const, label: 'RWF Only' },
                  { id: 'both' as const, label: 'USD + RWF' },
                  { id: 'inquire' as const, label: 'VIP Quote' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPriceMode(pm.id)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
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

            {/* 5. Custom Headlines & Contact Details */}
            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                5. Flyer Text & Contact Info
              </label>

              <div>
                <span className="text-[11px] text-zinc-500 block mb-1">
                  Top Gold Promo Badge
                </span>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <span className="text-[11px] text-zinc-500 block mb-1">
                  Call-To-Action Headline
                </span>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[11px] text-zinc-500 block mb-1">
                    WhatsApp / Phone
                  </span>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 block mb-1">Website</span>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 6. Ready-to-Post Social Caption Preview */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Auto-Generated Caption
                </span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="text-xs font-bold text-[#FFC72C] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCaption ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-sans text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                {generateSocialCaption()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
