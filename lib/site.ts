/**
 * Central site metadata config.
 *
 * `url` is the canonical production origin used to build absolute URLs for
 * Open Graph cards, the sitemap, robots.txt, and JSON-LD. Override it per
 * environment with `NEXT_PUBLIC_SITE_URL` (no trailing slash); the localhost
 * fallback keeps dev/preview builds working without configuration.
 *
 * The string fields below are intentionally generic placeholders — the actual
 * name/handle/description are content and get replaced once the site is
 * polished. This module only owns the technical plumbing.
 */
export const siteConfig = {
  name: 'Professional Portfolio',
  title: 'Professional Portfolio',
  description: 'A highly polished personal portfolio website.',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
  author: 'John Doe',
  // Twitter/X handle (with leading @) for the twitter card `creator`/`site`.
  twitterHandle: '@johndoe',
} as const;
