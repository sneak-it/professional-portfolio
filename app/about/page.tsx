import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { siteConfig } from '@/lib/site';

// Rendered per request so the canonical/OG URLs (resolved against the layout's
// metadataBase) reflect the runtime `SITE_URL` rather than a build-time value.
// See lib/site.ts and app/page.tsx.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Get to know Your Name - the technologist, tinkerer, photographer, and gearhead behind the work.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About',
    description:
      'Get to know Your Name - the technologist, tinkerer, photographer, and gearhead behind the work.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutClient linkedin={siteConfig.social.linkedin} />;
}
