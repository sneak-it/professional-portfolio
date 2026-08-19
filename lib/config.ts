/**
 * Operational tuning knobs, read at container start.
 *
 * Separate from lib/site.ts, which owns identity: nothing here is visible to a
 * visitor, these only trade freshness against work done per request. Same
 * runtime-not-build-time rule applies, so no `NEXT_PUBLIC_`. Unlike lib/site.ts
 * there is no `server-only` guard: lib/image.ts imports this and is exercised by
 * a plain `node --test` run, where that package throws. Nothing here is secret,
 * and a client importer would just read the defaults.
 *
 * See .env.example.
 */

// Non-positive and malformed values fall back rather than half-break the
// caller (a negative page size slices from the end of the list).
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
