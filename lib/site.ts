import 'server-only';
import fs from 'fs';
import { ACCENT_BAR, ACCENT_DIAGONAL } from './brand';
import { publicFilePath } from './image';
import { brandVersion, monogram, siteUrl } from './site-env';

/**
 * Central site metadata. Every field is env-driven with a placeholder, so one
 * prebuilt image serves any identity under any domain; see .env.example.
 *
 * Read at container start, so no `NEXT_PUBLIC_`; `server-only` enforces that
 * and client components take these as props.
 */
const name = process.env.SITE_NAME?.trim() || 'Your Name';

// Warn loudly, so a missing env_file shows up in the logs.
if (!process.env.SITE_NAME) {
  console.warn(
    '[site] SITE_NAME unset; serving the placeholder identity. See .env.example.',
  );
}

export const siteConfig = {
  name,
  title: process.env.SITE_TITLE?.trim() || name,
  description:
    process.env.SITE_DESCRIPTION?.trim() ||
    'Personal portfolio and blog: projects, writing, and photography.',
  url: siteUrl(),
  author: process.env.SITE_AUTHOR?.trim() || name,
  // Contact details, surfaced on the contact page and footer.
  location: process.env.SITE_LOCATION?.trim() || 'Your City, ST',
  // Wordmark in the navbar and footer, and the glyph on the generated icons.
  monogram: monogram(),
  // BCP 47 tag for <html lang>; callers convert to the OG underscore form.
  locale: process.env.SITE_LOCALE?.trim() || 'en-US',
  // Site-relative, inside images.localPatterns (next.config.ts): point this at
  // a file mounted under public/images/.
  avatarUrl:
    process.env.SITE_AVATAR_URL?.trim() || '/images/avatar-placeholder.png',
  // `??`: an empty value blanks the link out (callers hide it), an unset one
  // keeps the placeholder. `email` has no placeholder.
  social: {
    email: process.env.SITE_EMAIL?.trim() ?? '',
    github:
      process.env.SITE_GITHUB_URL?.trim() ?? 'https://github.com/your-username',
    linkedin:
      process.env.SITE_LINKEDIN_URL?.trim() ??
      'https://linkedin.com/in/your-profile',
  },
} as const;

/**
 * Absolute URL for a site-relative path, resolved against the runtime origin.
 * Concatenation only; breadcrumb callers collapse a bare '/' themselves.
 */
export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

const AVATAR_FALLBACK = '/images/avatar-placeholder.png';
const missingAvatars = new Set<string>();

/**
 * The avatar to render, or null when no file backs it. Resolved per call:
 * public/ is bind-mounted, so the file can appear or vanish live.
 */
export function avatarSrc(): string | null {
  for (const src of new Set([siteConfig.avatarUrl, AVATAR_FALLBACK])) {
    const file = publicFilePath(src);
    if (file !== null && fs.existsSync(file)) return src;
    if (!missingAvatars.has(src)) {
      missingAvatars.add(src);
      console.warn(`[site] no avatar file for "${src}"`);
    }
  }
  return null;
}

/**
 * Version token for the app/brand/* URLs, emitted by app/layout.tsx. Covers the
 * palette as well as the identity, so a lib/brand.ts edit busts the URL too.
 */
export const BRAND_VERSION = brandVersion([
  siteConfig.monogram,
  siteConfig.title,
  siteConfig.author,
  siteConfig.description,
  ACCENT_DIAGONAL,
  ACCENT_BAR,
]);
