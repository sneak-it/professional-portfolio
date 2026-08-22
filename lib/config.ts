/**
 * Operational tuning knobs, read at container start; see .env.example. These
 * trade freshness against per-request work (lib/site.ts owns identity). Read at
 * runtime, so no `NEXT_PUBLIC_`, and no `server-only` guard, so lib/image.ts
 * stays reachable from `node --test`.
 */

// Non-positive and malformed values fall back to the default.
function envInt(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Posts per page on /blog. */
export const BLOG_POSTS_PER_PAGE = envInt('BLOG_POSTS_PER_PAGE', 3);

/** How long sitemap.ts reuses a scanned route list before rescanning. */
export const SITEMAP_CACHE_TTL_MS = envInt('SITEMAP_CACHE_TTL_MS', 5 * 60_000);

/** Entries kept by the lib/image.ts dimension cache before eviction. */
export const IMAGE_DIMENSION_CACHE_MAX = envInt(
  'IMAGE_DIMENSION_CACHE_MAX',
  2000,
);
