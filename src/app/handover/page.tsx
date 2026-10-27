'use client';

import React from 'react';
import Link from 'next/link';
import HandoverWorkspace from '@/components/HandoverWorkspace';
import { ArrowLeft } from 'lucide-react';

export default function HandoverToolPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white pb-20 pt-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-tenor font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#FFC72C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Open in Admin Dashboard</span>
          </Link>
        </div>
        <HandoverWorkspace />
      </div>
    </div>
  );
}
