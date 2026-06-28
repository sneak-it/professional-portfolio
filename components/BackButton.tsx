import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Standard "← Back to …" link shown at the top of detail and section pages.
 * Plain `next/link`, so it works in both server and client components.
 */
export default function BackButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-accent transition-colors mb-8"
    >
      <ArrowLeft size={16} /> {label}
    </Link>
  );
}
