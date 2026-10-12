import type { Metadata } from 'next';
import './globals.css';
import { RentalProvider } from '@/lib/rentalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

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
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A282E] antialiased selection:bg-[#C85A2A] selection:text-white">
        <RentalProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileBottomNav />
        </RentalProvider>
      </body>
    </html>
  );
}

