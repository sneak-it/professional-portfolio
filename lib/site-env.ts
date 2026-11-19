/**
 * Env parsing for lib/site.ts, split out so `node --test` reaches it past that
 * module's `server-only` guard.
 */
import { createHash } from 'node:crypto';

const DEFAULT_URL = 'http://localhost:3000';

export const GITHUB_PLACEHOLDER = 'https://github.com/your-username';
export const LINKEDIN_PLACEHOLDER = 'https://linkedin.com/in/your-profile';

function isHttpUrl(value: string): boolean {
  const protocol = URL.parse(value)?.protocol;
  return protocol === 'http:' || protocol === 'https:';
}

/**
 * Absolute http(s) origin, scheme required, no trailing slash. A malformed
 * value warns and falls back: app/layout.tsx calls `new URL()` on this at
 * module load.
 */
export function siteUrl(raw = process.env.SITE_URL): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    console.warn(
      `SITE_URL unset; canonical, share, sitemap, and feed URLs use ${DEFAULT_URL}.`,
    );
    return DEFAULT_URL;
  }

  if (isHttpUrl(trimmed)) return trimmed.replace(/\/$/, '');

  console.warn(
    `[site] SITE_URL "${trimmed}" is not an absolute http(s) URL; using ${DEFAULT_URL}.`,
  );
  return DEFAULT_URL;
}

/**
 * Profiles that are also the owner (schema.org `sameAs`): `links` plus `extra`
 * split on commas and whitespace, http(s) only, placeholders dropped, deduped.
 */
export function profileUrls(
  links: readonly string[],
  extra = process.env.SITE_PROFILE_URLS,
): string[] {
  const added = extra?.split(/[\s,]+/).filter(Boolean) ?? [];
  for (const entry of added) {
    if (!isHttpUrl(entry)) {
      console.warn(
        `[site] SITE_PROFILE_URLS entry "${entry}" is not an absolute http(s) URL; skipped.`,
      );
    }
  }
  return [...new Set([...links, ...added])].filter(
    (url) =>
      isHttpUrl(url) &&
      url !== GITHUB_PLACEHOLDER &&
      url !== LINKEDIN_PLACEHOLDER,
  );
}

/**
 * A site path or an absolute http(s) URL, else ''. `//` and `/\` are refused:
 * browsers resolve both to another host.
 */
export function licenseUrl(raw = process.env.SITE_PHOTO_LICENSE_URL): string {
  const value = raw?.trim();
  if (!value) return '';
  if (/^\/(?![/\\])/.test(value) || isHttpUrl(value)) return value;
  console.warn(
    `[site] SITE_PHOTO_LICENSE_URL "${value}" is not a site path or http(s) URL; left out.`,
  );
  return '';
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
