import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
      <p className="font-display font-bold text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
        404
      </p>
      <h1 className="mt-6 text-3xl md:text-4xl font-display font-bold tracking-tight">
        This page wandered off.
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity"
      >
        <ArrowLeft size={18} />
        Back home
      </Link>
    </div>
  );
}
