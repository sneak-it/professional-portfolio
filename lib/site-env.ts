/**
 * Env parsing for lib/site.ts, split out so `node --test` can reach it: that
 * module's `server-only` guard throws outside a bundler. Same reasoning as
 * lib/config.ts.
 */
import { createHash } from 'node:crypto';

const DEFAULT_URL = 'http://localhost:3000';

/**
 * Absolute http(s) origin, no trailing slash. A malformed value warns and falls
 * back rather than throwing: `new URL(siteConfig.url)` runs at module load in
 * app/layout.tsx, so a bad one would 500 every route. Not lib/href.ts
 * `isSafeHref`, which resolves relative input against a base and so would
 * accept a scheme-less `example.com` as valid.
 */
export function siteUrl(raw = process.env.SITE_URL): string {
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_URL;

  const protocol = URL.parse(trimmed)?.protocol;
  if (protocol === 'http:' || protocol === 'https:') {
    return trimmed.replace(/\/$/, '');
  }

  console.warn(
    `[site] SITE_URL "${trimmed}" is not an absolute http(s) URL; using ${DEFAULT_URL}.`,
  );
  return DEFAULT_URL;
}

/** Bounded here, not per consumer, so the chrome and the icons agree. */
export function monogram(raw = process.env.SITE_MONOGRAM): string {
  return (raw?.trim() || 'YN').slice(0, 3);
}

/**
 * Cache-buster for the app/brand/* image URLs. Those render from `parts` alone,
 * so a moved token means moved bytes, which is what lets the responses carry a
 * long Cache-Control instead of going stale on a `SITE_*` change.
 */
export function brandVersion(parts: readonly string[]): string {
  return createHash('sha256')
    .update(parts.join('\0'))
    .digest('base64url')
    .slice(0, 12);
}
