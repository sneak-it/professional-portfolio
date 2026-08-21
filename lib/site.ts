import 'server-only';

/**
 * Central site metadata. Every field is env-driven with a generic placeholder,
 * so one prebuilt image serves any identity under any domain. Read at container
 * start; see .env.example.
 *
 * No `NEXT_PUBLIC_`: that prefix inlines and freezes values at build time,
 * which is the opposite of what a portable image needs. `server-only` enforces
 * it — client components take these as props. Every route that emits them
 * renders at runtime, so an override flows through everywhere.
 */
const name = process.env.SITE_NAME?.trim() || 'Your Name';

export const siteConfig = {
  name,
  title: process.env.SITE_TITLE?.trim() || name,
  description:
    process.env.SITE_DESCRIPTION?.trim() ||
    'Personal portfolio and blog: projects, writing, and photography.',
  // Trim first: a whitespace-only value would throw in `new URL('')`.
  url: (process.env.SITE_URL?.trim() || 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
  author: process.env.SITE_AUTHOR?.trim() || name,
  // Contact details, surfaced on the contact page and footer.
  location: process.env.SITE_LOCATION?.trim() || 'Your City, ST',
  // Wordmark in the navbar and footer, and the glyph on the generated icons.
  monogram: process.env.SITE_MONOGRAM?.trim() || 'YN',
  // BCP 47 tag for <html lang>; callers convert to the OG underscore form.
  locale: process.env.SITE_LOCALE?.trim() || 'en-US',
  // Site-relative only, and inside images.localPatterns (next.config.ts, baked
  // at build time): point this at a file mounted under public/images/.
  avatarUrl:
    process.env.SITE_AVATAR_URL?.trim() || '/images/avatar-placeholder.png',
  // `??` not `||`: an empty value blanks the link out (callers hide it), an
  // unset one keeps the placeholder. `email` has none — a fake mailto: is worse.
  social: {
    email: process.env.SITE_EMAIL?.trim() ?? '',
    github:
      process.env.SITE_GITHUB_URL?.trim() ?? 'https://github.com/your-username',
    linkedin:
      process.env.SITE_LINKEDIN_URL?.trim() ??
      'https://linkedin.com/in/your-profile',
  },
} as const;
