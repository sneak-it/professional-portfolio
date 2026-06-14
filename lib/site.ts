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
  // Trim first so a blank/whitespace-only env var (e.g. an unset Docker build
  // arg expanding to '') falls back to localhost instead of throwing
  // `new URL('')` during the prerender of metadata-bearing routes.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  ).replace(/\/$/, ''),
  author: 'John Doe',
  // Twitter/X handle (with leading @) for the twitter card `creator`/`site`.
  twitterHandle: '@johndoe',
  // Contact details, surfaced on the contact page and footer.
  email: 'hello@example.com',
  phone: '+1 (234) 567-890',
  phoneHref: 'tel:+1234567890',
  location: 'San Francisco, CA',
  locationNote: 'Available Worldwide',
  // Social profiles, rendered in the footer.
  social: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
} as const;

/** Primary navigation, shared by the navbar (desktop + mobile menus). */
export const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Resume', href: '/resume' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blog', href: '/blog' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
] as const;
