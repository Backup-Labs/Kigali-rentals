import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 text-center">
      <span className="font-tenor font-black text-6xl sm:text-8xl text-[#FFC72C] drop-shadow-[0_0_25px_rgba(255,199,44,0.3)]">404</span>
      <h1 className="font-tenor text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-4">Page Not Found</h1>
      <p className="text-sm text-zinc-400 mt-2 mb-8 max-w-sm">
        The requested rental property, vehicle, or page could not be located in Rwanda.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#FFC72C] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-[#FFD54F] transition-all shadow-[0_4px_16px_rgba(255,199,44,0.3)]"
      >
        Return to Home
      </Link>
    </div>
  );
}

