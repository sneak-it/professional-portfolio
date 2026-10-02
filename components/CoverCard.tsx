import type { ReactNode } from 'react';
import Link from 'next/link';
import CoverImage from '@/components/CoverImage';

/**
 * Overlay cover card: full-bleed image under a darkening gradient, with a
 * bottom title/description block and optional meta row and badge. Shared by
 * the portfolio hub and the photography grid.
 */
export default function CoverCard({
  href,
  coverImage,
  title,
  description,
  sizes,
  aspect = 'aspect-[4/5]',
  priority = false,
  meta,
  badge,
}: {
  href: string;
  coverImage: string | null;
  title: string;
  description: string;
  sizes: string;
  aspect?: string;
  priority?: boolean;
  meta?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`not-prose group block relative rounded-3xl overflow-hidden ${aspect} bg-gray-100 dark:bg-gray-900`}
    >
      <CoverImage
        src={coverImage}
        alt={title}
        priority={priority}
        sizes={sizes}
        className="transition-transform duration-700 group-hover:scale-105"
      />
      {badge && (
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {badge}
        </div>
      )}

      {/* Scrim on the text block, so it is 60% black up to the first line. */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pt-16 bg-gradient-to-t from-black/80 via-black/60 via-[calc(100%-4rem)] to-transparent transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        {meta}
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/90 text-sm line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
