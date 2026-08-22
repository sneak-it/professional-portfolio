/**
 * Env parsing for lib/site.ts, split out so `node --test` reaches it past that
 * module's `server-only` guard. Same reasoning as lib/config.ts.
 */
import { createHash } from 'node:crypto';

const DEFAULT_URL = 'http://localhost:3000';

/**
 * Absolute http(s) origin, scheme required, no trailing slash. A malformed
 * value warns and falls back: app/layout.tsx calls `new URL()` on this at
 * module load.
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

/** Bounded once, so the chrome and the icons agree. */
export function monogram(raw = process.env.SITE_MONOGRAM): string {
  return (raw?.trim() || 'YN').slice(0, 3);
}

/**
 * Cache-buster for the app/brand/* image URLs. They render from `parts` alone,
 * so a moved token means moved bytes and a long Cache-Control is safe.
 */
export function brandVersion(parts: readonly string[]): string {
  return createHash('sha256')
    .update(parts.join('\0'))
    .digest('base64url')
    .slice(0, 12);
}
