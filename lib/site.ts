/**
 * Central site metadata config.
 *
 * `url` is the canonical production origin used to build absolute URLs for
 * Open Graph cards, the sitemap, robots.txt, and JSON-LD. Set it per
 * environment via the `SITE_URL` env var (no trailing slash), read at
 * container start. It is intentionally NOT `NEXT_PUBLIC_`-prefixed: `.url` is
 * consumed only in server code, so the prefix would needlessly inline it into
 * the client bundle at build time and freeze the value — the opposite of what
 * a portable prebuilt image needs. The routes that emit it render at runtime
 * (robots/sitemap/static pages are `force-dynamic`; blog/portfolio are ISR),
 * so a runtime `SITE_URL` flows through everywhere. The localhost fallback
 * keeps dev/preview and unconfigured runs working without configuration.
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
  // Trim first so a blank/whitespace-only value (e.g. an unset SITE_URL
  // expanding to '') falls back to localhost instead of throwing `new URL('')`
  // while rendering metadata-bearing routes.
  url: (process.env.SITE_URL?.trim() || 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
  author: 'Ian Rodriguez-Torrent',
  // Contact details, surfaced on the contact page and footer.
  location: 'Litchfield County, CT',
  // Social profiles, rendered in the footer.
  social: {
    github: 'https://github.com/sneak-it',
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
