import type { Metadata } from 'next';
import './globals.css';
import { RentalProvider } from '@/lib/rentalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

import NavigationProgressBar from '@/components/NavigationProgressBar';
import PageTransition from '@/components/PageTransition';

export const metadata: Metadata = {
  title: 'Kigali Rentals | Villas, Penthouses & 4x4 Fleet in Rwanda',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Tenor+Sans&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#141414] antialiased selection:bg-[#00638E] selection:text-white">
        <RentalProvider>
          <NavigationProgressBar />
          <Navbar />
          <main className="flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <MobileBottomNav />
        </RentalProvider>
      </body>
    </html>
  );
}

