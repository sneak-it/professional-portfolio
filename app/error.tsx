'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCw, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for server-side log aggregation.
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
      <p className="font-display font-bold text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2">
        Oops
      </p>
      <h1 className="mt-6 text-3xl md:text-4xl font-display font-bold tracking-tight">
        Something went wrong.
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
        An unexpected error occurred while rendering this page. You can try
        again or head back home.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity"
        >
          <RotateCw size={18} />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 dark:border-white/10 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={18} />
          Back home
        </Link>
      </div>
    </div>
  );
}
