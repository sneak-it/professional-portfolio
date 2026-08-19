import 'server-only';

/**
 * Central site metadata config.
 *
 * Every field is env-driven, defaulting to a generic placeholder, so one
 * prebuilt image can serve any identity under any domain without a rebuild.
 * Values are read at container start; see .env.example for the full list.
 *
 * None are `NEXT_PUBLIC_`-prefixed: that prefix inlines a value into the
 * client bundle at build time and freezes it, the opposite of what a portable
 * prebuilt image needs. The `server-only` import enforces it: importing this
 * module from a client component is a build error. Client components take what
 * they need as props from their server parent. The routes that emit these
 * values render at runtime (robots/sitemap/static pages are `force-dynamic`;
 * blog/portfolio are ISR), so a runtime override flows through everywhere.
 *
 * The defaults are deliberately generic: the real name, description, and
 * links are content, and this module only owns the plumbing.
 */
const name = process.env.SITE_NAME?.trim() || 'Your Name';

export const siteConfig = {
  name,
  title: process.env.SITE_TITLE?.trim() || name,
  description:
    process.env.SITE_DESCRIPTION?.trim() ||
    'Personal portfolio and blog: projects, writing, and photography.',
  // Trim first so a blank/whitespace-only value (e.g. an unset SITE_URL
  // expanding to '') falls back to localhost instead of throwing `new URL('')`
  // while rendering metadata-bearing routes.
  url: (process.env.SITE_URL?.trim() || 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
  author: process.env.SITE_AUTHOR?.trim() || name,
  // Contact details, surfaced on the contact page and footer.
  location: process.env.SITE_LOCATION?.trim() || 'Your City, ST',
  // Wordmark in the navbar and footer.
  monogram: process.env.SITE_MONOGRAM?.trim() || 'YN',
  // Portrait on the about page and the blog post byline. Must stay on a host
  // allowed by `images.remotePatterns` and the CSP in next.config.ts, both of
  // which are baked at build time.
  avatarUrl:
    process.env.SITE_AVATAR_URL?.trim() ||
    'https://picsum.photos/seed/portrait/800/800',
  // Social profiles. `?? ` rather than `|| `: an explicitly empty value blanks
  // the link out (callers hide it), while an unset one keeps the placeholder.
  social: {
    github:
      process.env.SITE_GITHUB_URL?.trim() ?? 'https://github.com/your-username',
    linkedin:
      process.env.SITE_LINKEDIN_URL?.trim() ??
      'https://linkedin.com/in/your-profile',
  },
} as const;
