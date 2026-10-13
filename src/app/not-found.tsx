import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <span className="font-tenor font-bold text-5xl sm:text-7xl text-[#00638E]">404</span>
      <h1 className="font-tenor text-xl sm:text-2xl font-bold text-[#141414] mt-2">Page Not Found</h1>
      <p className="text-sm text-[#2B2B2B] mt-1 mb-6 max-w-sm">
        The requested rental property, vehicle, or page could not be located in Kigali.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-[#00638E] text-white font-tenor font-semibold text-xs hover:bg-[#00557B] transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}

