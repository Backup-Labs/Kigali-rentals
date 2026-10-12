import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-4 text-center">
      <span className="font-syne font-bold text-5xl sm:text-7xl text-[#0D3846]">404</span>
      <h1 className="font-syne text-xl sm:text-2xl font-bold text-slate-800 mt-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm">
        The requested rental property, vehicle, or page could not be located in Kigali.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-[#0D3846] text-white font-syne font-semibold text-xs hover:bg-[#C85A2A] transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}

