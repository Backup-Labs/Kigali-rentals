import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Award, MapPin, Mail, Phone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0D3846] text-[#E6D7C3] border-t border-[#E6D7C3]/20 pt-16 pb-24 md:pb-12">
      {/* Trust Badges Bar */}
      <div className="container mx-auto px-4 sm:px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.03] backdrop-blur-xl border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#5A6B3C]/40 to-[#5A6B3C]/10 border border-[#5A6B3C]/40 flex items-center justify-center text-[#5A6B3C] shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-syne font-bold text-white text-base">Uninterrupted Comfort</h4>
              <p className="text-xs text-[#E6D7C3]/75 mt-1 leading-relaxed">
                100% of our properties feature verified automatic backup generators and high-capacity water reserves.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#C85A2A]/40 to-[#C85A2A]/10 border border-[#C85A2A]/40 flex items-center justify-center text-[#C85A2A] shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <ShieldCheck className="w-6 h-6 text-[#C85A2A]" />
            </div>
            <div>
              <h4 className="font-syne font-bold text-white text-base">Zero Surprise Charges</h4>
              <p className="text-xs text-[#E6D7C3]/75 mt-1 leading-relaxed">
                Itemized pricing, refundable security holds via bank or MoMo, and transparent digital condition handovers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#5A6B3C]/40 to-[#5A6B3C]/10 border border-[#5A6B3C]/40 flex items-center justify-center text-[#5A6B3C] shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-syne font-bold text-white text-base">Rwanda Certified Fleet</h4>
              <p className="text-xs text-[#E6D7C3]/75 mt-1 leading-relaxed">
                4x4 vehicles inspected for Volcanoes, Akagera, and Nyungwe terrain with 24/7 Rwanda roadside rescue.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#C85A2A] flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="font-syne text-xl font-bold text-white">
              Kigali<span className="text-[#C85A2A]">Rentals</span>
            </span>
          </div>
          <p className="text-sm text-[#E6D7C3]/80 leading-relaxed mb-6">
            Rwanda’s unified platform for premium residential stays and rugged, chauffeur-ready vehicles. Modern African hospitality delivered with Swiss reliability.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#E6D7C3]/60">
            <MapPin className="w-4 h-4 text-[#C85A2A]" />
            <span>Kigali Heights, 4th Floor, KN 78 St, Kimihurura</span>
          </div>
        </div>

        <div>
          <h5 className="font-syne font-bold text-white text-sm uppercase tracking-wider mb-4">
            Key Neighborhoods
          </h5>
          <ul className="space-y-2.5 text-sm text-[#E6D7C3]/80">
            <li>
              <Link href="/?neighborhood=Kiyovu" className="hover:text-white transition-colors">
                Kiyovu Diplomatic Hill
              </Link>
            </li>
            <li>
              <Link href="/?neighborhood=Nyarutarama" className="hover:text-white transition-colors">
                Nyarutarama Golf & Embassy Estates
              </Link>
            </li>
            <li>
              <Link href="/?neighborhood=Kimihurura" className="hover:text-white transition-colors">
                Kimihurura Convention & Arts Hub
              </Link>
            </li>
            <li>
              <Link href="/?neighborhood=Gacuriro" className="hover:text-white transition-colors">
                Gacuriro Panoramic Hillside
              </Link>
            </li>
            <li>
              <Link href="/?neighborhood=Kigali+Airport" className="hover:text-white transition-colors">
                Kigali International Airport (KGL)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-syne font-bold text-white text-sm uppercase tracking-wider mb-4">
            Fleet & Bundles
          </h5>
          <ul className="space-y-2.5 text-sm text-[#E6D7C3]/80">
            <li>
              <Link href="/listings/veh-land-cruiser-prado" className="hover:text-white transition-colors">
                Toyota Land Cruiser Prado TXL 4x4
              </Link>
            </li>
            <li>
              <Link href="/listings/veh-rav4-hybrid" className="hover:text-white transition-colors">
                Toyota RAV4 Hybrid Eco AWD
              </Link>
            </li>
            <li>
              <Link href="/listings/veh-mercedes-e-class" className="hover:text-white transition-colors">
                Mercedes-Benz VIP Chauffeur Saloon
              </Link>
            </li>
            <li>
              <Link href="/listings/veh-defender-110" className="hover:text-white transition-colors">
                Land Rover Defender Expedition Ready
              </Link>
            </li>
            <li>
              <Link href="/?type=combo" className="text-[#C85A2A] font-semibold hover:underline">
                Stay & Drive Package Discounts (-20%)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-syne font-bold text-white text-sm uppercase tracking-wider mb-4">
            Operations & Trust
          </h5>
          <ul className="space-y-2.5 text-sm text-[#E6D7C3]/80">
            <li>
              <Link href="/handover" className="hover:text-white transition-colors flex items-center gap-2">
                <span>Digital Condition Handover</span>
                <span className="text-[10px] bg-[#5A6B3C] text-white px-1.5 py-0.5 rounded">HO-02</span>
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-2">
                <span>Back-Office Operations Hub</span>
                <span className="text-[10px] bg-[#C85A2A] text-white px-1.5 py-0.5 rounded">AD-01</span>
              </Link>
            </li>
            <li>
              <a href="mailto:concierge@kigalirentals.rw" className="hover:text-white transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C85A2A]" />
                <span>concierge@kigalirentals.rw</span>
              </a>
            </li>
            <li>
              <a href="tel:+250788123456" className="hover:text-white transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C85A2A]" />
                <span>+250 788 123 456 (MTN / MoMo)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E6D7C3]/60 gap-4">
        <div>
          © 2026 Kigali Rentals SARL. Regulated by Rwanda Development Board (RDB). All rights reserved.
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with pride in</span>
          <span className="text-white font-medium">Kigali, Rwanda</span>
          <Heart className="w-3.5 h-3.5 text-[#C85A2A] fill-current mx-1" />
          <span>Land of a Thousand Hills</span>
        </div>
      </div>
    </footer>
  );
}

