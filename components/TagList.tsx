import Link from 'next/link';
import { slugify } from '@/lib/slug';

export const tagHref = (slug: string) => `/blog?tag=${slug}`;

// accent-2 keeps tags on their own axis from links and pagination. Amber fails
// contrast as text, so a chip is a tint plus a per-theme text colour.
const BASE =
  'font-mono text-xs uppercase tracking-wider rounded-full border px-3 py-1 transition-colors';
const IDLE =
  'border-accent-2/40 bg-accent-2/10 text-gray-700 dark:text-accent-2 hover:bg-accent-2/20 hover:border-accent-2';
const ACTIVE = 'border-accent-2 bg-accent-2 text-gray-900';

/** Chip styling, for the one chip that isn't a tag (the "All" filter). */
export const chipClass = (active: boolean) =>
  `${BASE} ${active ? ACTIVE : IDLE}`;

/**
 * The one tag chip: post meta row, /blog filter row, all-tags index. `link`
 * makes it a filter link, which on the /blog cards needs `relative z-10` to
 * sit above the card overlay (components/BlogList.tsx).
 */
export default function TagList({
  tags,
  max,
  link = false,
  activeSlug,
  counts,
  className = '',
}: {
  tags: Array<string | { name: string; slug: string; count: number }>;
  max?: number;
  link?: boolean;
  activeSlug?: string;
  counts?: boolean;
  className?: string;
}) {
  const items = (max === undefined ? tags : tags.slice(0, max)).map((tag) =>
    typeof tag === 'string' ? { name: tag, slug: slugify(tag), count: 0 } : tag,
  );
  if (items.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map(({ name, slug, count }) => {
        const label = counts ? `${name} ${count}` : name;
        const active = slug !== '' && slug === activeSlug;
        return (
          <li key={slug || name}>
            {link && slug !== '' ? (
              <Link
                href={tagHref(slug)}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 ${chipClass(active)}`}
              >
                {label}
              </Link>
            ) : (
              <span className={chipClass(active)}>{label}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
