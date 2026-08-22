import Link from 'next/link';
import { slugify } from '@/lib/slug';

const tagHref = (slug: string) => `/blog?tag=${slug}`;

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
 * The one tag chip: the article header and the /blog filter panel. `link` makes
 * it a filter link to /blog?tag=.
 */
export default function TagList({
  tags,
  link = false,
  activeSlug,
  counts,
  className = '',
}: {
  tags: Array<string | { name: string; slug: string; count: number }>;
  link?: boolean;
  activeSlug?: string;
  counts?: boolean;
  className?: string;
}) {
  const items = tags.map((tag) =>
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
                className={chipClass(active)}
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
