import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateOgImages() {
  const WIDTH = 1200;
  const HEIGHT = 630;

  console.log('Generating 1200x630 Open Graph preview image with official Kigali Rentals logo...');

  // 1. Trim the official dark-white.jpeg to get the pure logo artwork
  const trimmedLogoBuffer = await sharp('public/dark-white.jpeg')
    .trim({ threshold: 10 })
    .resize({ height: 320, fit: 'contain' })
    .toBuffer();

  const logoMeta = await sharp(trimmedLogoBuffer).metadata();
  console.log('Processed logo dimensions:', logoMeta.width, 'x', logoMeta.height);

  const logoX = Math.round((WIDTH - logoMeta.width) / 2);
  const logoY = 120; // Positioned comfortably in the upper-mid region

  // 2. Create the Luxury SVG overlay containing gradients, borders, badge pills, and typography
  const svgOverlay = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Ambient Radial Glow -->
      <radialGradient id="centerGlow" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stop-color="#242832" stop-opacity="0.85" />
        <stop offset="45%" stop-color="#14171E" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#08090B" stop-opacity="1" />
      </radialGradient>

      <!-- Gold Luxury Accents Gradient -->
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFE082" />
        <stop offset="40%" stop-color="#FFC72C" />
        <stop offset="100%" stop-color="#E5B224" />
      </linearGradient>

      <!-- Soft Radial Light Behind Logo -->
      <radialGradient id="goldAura" cx="50%" cy="45%" r="45%">
        <stop offset="0%" stop-color="#FFC72C" stop-opacity="0.12" />
        <stop offset="60%" stop-color="#FFC72C" stop-opacity="0.03" />
        <stop offset="100%" stop-color="#FFC72C" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Deep Luxury Onyx Base -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#08090B" />
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#centerGlow)" />

    <!-- Center Ambient Logo Lighting -->
    <ellipse cx="600" cy="280" rx="360" ry="220" fill="url(#goldAura)" />

    <!-- Double Outer Gold Hairline Border -->
    <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="24" fill="none" stroke="url(#goldGradient)" stroke-width="1.5" stroke-opacity="0.4" />
    <rect x="30" y="30" width="${WIDTH - 60}" height="${HEIGHT - 60}" rx="18" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.05" />

    <!-- Top Badge Pill: Rwanda's Premier Rental Fleet & Living -->
    <g transform="translate(600, 68)">
      <rect x="-240" y="-18" width="480" height="36" rx="18" fill="#14171E" stroke="url(#goldGradient)" stroke-width="1" stroke-opacity="0.6" />
      <circle cx="-212" cy="0" r="4" fill="#FFC72C" />
      <text x="0" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC72C" text-anchor="middle">
        RWANDA'S PREMIER 4X4 FLEET &amp; DIPLOMATIC VILLAS
      </text>
      <circle cx="212" cy="0" r="4" fill="#FFC72C" />
    </g>

    <!-- Subtitle / Tagline below Logo -->
    <text x="600" y="480" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" letter-spacing="1.5" fill="#E2E8F0" text-anchor="middle">
      LUXURY LIVING &amp; MOBILITY IN KIGALI • NO HIDDEN FEES
    </text>

    <!-- Bottom Highlights Track: 4 Feature Chips -->
    <g transform="translate(600, 528)">
      <!-- Chip 1: 4x4 Fleet -->
      <g transform="translate(-360, 0)">
        <rect x="-95" y="-14" width="190" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="0" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1" text-anchor="middle">
          ★ Land Cruiser 4x4 Fleet
        </text>
      </g>

      <!-- Chip 2: Prime Locations -->
      <g transform="translate(-120, 0)">
        <rect x="-95" y="-14" width="190" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="0" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1" text-anchor="middle">
          ★ Kiyovu &amp; Nyarutarama
        </text>
      </g>

      <!-- Chip 3: Airport Concierge -->
      <g transform="translate(120, 0)">
        <rect x="-95" y="-14" width="190" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="0" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1" text-anchor="middle">
          ★ Airport VIP Delivery
        </text>
      </g>

      <!-- Chip 4: 24/7 Concierge -->
      <g transform="translate(360, 0)">
        <rect x="-95" y="-14" width="190" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="0" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1" text-anchor="middle">
          ★ 24/7 WhatsApp Support
        </text>
      </g>
    </g>

    <!-- Bottom URL Footer Line -->
    <g transform="translate(600, 582)">
      <line x1="-540" y1="0" x2="540" y2="0" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />
      <rect x="-90" y="-12" width="180" height="24" rx="6" fill="#08090B" />
      <text x="0" y="4" font-family="monospace" font-size="12" font-weight="700" letter-spacing="2" fill="#FFC72C" text-anchor="middle">
        KIGALIRENTALS.RW
      </text>
    </g>
  </svg>
  `;

  // 3. Composite everything together using sharp
  const baseImage = sharp(Buffer.from(svgOverlay));

  const finalComposite = await baseImage
    .composite([
      {
        input: trimmedLogoBuffer,
        top: logoY,
        left: logoX,
      },
    ])
    .toBuffer();

  // 4. Save to public/og-image.jpg (high-quality progressive JPEG for fast WhatsApp crawling)
  await sharp(finalComposite)
    .jpeg({ quality: 92, progressive: true, mozjpeg: true })
    .toFile('public/og-image.jpg');
  console.log('Saved public/og-image.jpg');

  // 5. Save to public/og-image.png (crisp PNG)
  await sharp(finalComposite)
    .png({ quality: 95 })
    .toFile('public/og-image.png');
  console.log('Saved public/og-image.png');

  // 6. Save to src/app/opengraph-image.png (Next.js App Router native static OG image)
  await sharp(finalComposite)
    .png({ quality: 95 })
    .toFile('src/app/opengraph-image.png');
  console.log('Saved src/app/opengraph-image.png');

  const statJpg = fs.statSync('public/og-image.jpg');
  const statPng = fs.statSync('public/og-image.png');
  console.log(`Open Graph card generation complete! JPG: ${(statJpg.size / 1024).toFixed(1)} KB, PNG: ${(statPng.size / 1024).toFixed(1)} KB`);
}

generateOgImages().catch(err => {
  console.error('Error generating OG images:', err);
  process.exit(1);
});

