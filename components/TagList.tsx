import Link from 'next/link';
import { slugify } from '@/lib/slug';

export const tagHref = (slug: string) => `/blog?tag=${slug}`;

// accent-2, not accent: tags read as a separate axis from links, pagination and
// the rest of the accent-coloured UI. Both are theme tokens (app/globals.css),
// so a reskin carries here. Amber text fails contrast on the light background,
// hence a tint plus a readable per-theme text colour rather than coloured text.
const BASE =
  'font-mono text-xs uppercase tracking-wider rounded-full border px-3 py-1 transition-colors';
const IDLE =
  'border-accent-2/40 bg-accent-2/10 text-gray-700 dark:text-accent-2 hover:bg-accent-2/20 hover:border-accent-2';
const ACTIVE = 'border-accent-2 bg-accent-2 text-gray-900';

/** Chip styling, for the one chip that isn't a tag (the "All" filter). */
export const chipClass = (active: boolean) =>
  `${BASE} ${active ? ACTIVE : IDLE}`;

/**
 * The one tag chip, everywhere tags render: the post meta row, the /blog filter
 * row, and the all-tags index.
 *
 * `link` turns each chip into a filter link. On the /blog cards that needs
 * `relative z-10`, because the card's own full-surface overlay
 * (components/BlogList.tsx) otherwise sits on top and swallows the click.
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
