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
  name: 'Ian Rodriguez-Torrent',
  title: 'Ian Rodriguez-Torrent',
  description:
    'Ian Rodriguez-Torrent — technology leader by day; homelab tinkerer, photographer, and gearhead by night.',
  // Trim first so a blank/whitespace-only env var (e.g. an unset Docker build
  // arg expanding to '') falls back to localhost instead of throwing
  // `new URL('')` during the prerender of metadata-bearing routes.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  ).replace(/\/$/, ''),
  author: 'Ian Rodriguez-Torrent',
  // Contact details, surfaced on the contact page and footer.
  location: 'Litchfield County, CT',
  // Social profiles, rendered in the footer.
  social: {
    github: 'https://github.com/sneak_it',
    linkedin: 'https://linkedin.com/in/ianrt',
  },
} as const;

/** Primary navigation, shared by the navbar (desktop + mobile menus). */
export const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
] as const;
