import type { Metadata } from 'next';
import './globals.css';
import { RentalProvider } from '@/lib/rentalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import NavigationProgressBar from '@/components/NavigationProgressBar';
import PageTransition from '@/components/PageTransition';

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kglrentals.amanisamuel.online');

// High-availability CDN images for 100% reliable social crawler unfurling
const OG_IMAGE_BANNER =
  'https://res.cloudinary.com/dlf3koulm/image/upload/v1793163370/kigali-rentals/og/kigali-rentals-og-banner.jpg';
const OG_IMAGE_SQUARE =
  'https://res.cloudinary.com/dlf3koulm/image/upload/v1793163373/kigali-rentals/og/kigali-rentals-og-square.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kigali Rentals | Villas, Penthouses & 4x4 Fleet in Rwanda',
    template: '%s | Kigali Rentals',
  },
  description:
    'Rwanda’s unified car and property rental platform. Discover luxury apartments in Kiyovu, diplomatic villas in Nyarutarama, and chauffeur or self-drive 4x4 vehicles with zero surprise fees.',
  keywords: [
    'Kigali Rentals',
    'Rwanda car rental',
    'Kigali apartments for rent',
    'Kigali 4x4 rental',
    'Land Cruiser Kigali',
    'Nyarutarama villa',
    'Kiyovu penthouse',
  ],
  authors: [{ name: 'Kigali Rentals Concierge' }],
  creator: 'Kigali Rentals',
  publisher: 'Kigali Rentals Rwanda',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Kigali Rentals',
    title: 'Kigali Rentals | Villas, Penthouses & 4x4 Fleet in Rwanda',
    description:
      'Rwanda’s premier vehicle fleet & luxury residential accommodations. Chauffeur & self-drive 4x4 SUVs, diplomatic villas, and high-end penthouses in Kigali with zero surprise fees.',
    images: [
      {
        url: OG_IMAGE_BANNER,
        secureUrl: OG_IMAGE_BANNER,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Kigali Rentals - Luxury 4x4 Fleet & Diplomatic Residences in Rwanda',
      },
      {
        url: `${siteUrl}/og-image.jpg`,
        secureUrl: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Kigali Rentals - Luxury 4x4 Fleet & Diplomatic Residences in Rwanda',
      },
      {
        url: OG_IMAGE_SQUARE,
        secureUrl: OG_IMAGE_SQUARE,
        width: 800,
        height: 800,
        type: 'image/jpeg',
        alt: 'Kigali Rentals Official Logo Emblem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kigali Rentals | Villas, Penthouses & 4x4 Fleet in Rwanda',
    description:
      'Rwanda’s premier vehicle fleet & luxury residential accommodations. Chauffeur & self-drive 4x4 SUVs, diplomatic villas, and high-end penthouses in Kigali.',
    images: [OG_IMAGE_BANNER, `${siteUrl}/og-image.jpg`, OG_IMAGE_SQUARE],
    creator: '@KigaliRentals',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/dark-white.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('kgl_theme');
                if (saved === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta property="og:image" content={OG_IMAGE_BANNER} />
        <meta property="og:image:secure_url" content={OG_IMAGE_BANNER} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content="Kigali Rentals Official Brand Logo &amp; Luxury Fleet" />
        <meta property="og:image" content={OG_IMAGE_SQUARE} />
        <meta property="og:image:secure_url" content={OG_IMAGE_SQUARE} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={OG_IMAGE_BANNER} />
        <meta name="twitter:image:src" content={OG_IMAGE_BANNER} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Tenor+Sans&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white transition-colors duration-200 antialiased selection:bg-[#FFC72C] selection:text-[#111111]">
        <RentalProvider>
          <NavigationProgressBar />
          <Navbar />
          <main className="flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </RentalProvider>
      </body>
    </html>
  );
}

