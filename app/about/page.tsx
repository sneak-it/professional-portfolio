import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { siteConfig } from '@/lib/site';

// Rendered per request so the canonical/OG URLs (resolved against the layout's
// metadataBase) reflect the runtime `SITE_URL` rather than a build-time value.
// See lib/site.ts and app/page.tsx.
export const dynamic = 'force-dynamic';

const DESCRIPTION = `Get to know ${siteConfig.name} - the technologist, tinkerer, photographer, and gearhead behind the work.`;

export const metadata: Metadata = {
  title: 'About',
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About',
    description: DESCRIPTION,
    url: '/about',
  },
};

export default function AboutPage() {
  return (
    <AboutClient
      linkedin={siteConfig.social.linkedin}
      avatarUrl={siteConfig.avatarUrl}
    />
  );
}
