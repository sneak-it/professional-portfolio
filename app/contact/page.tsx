import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import { siteConfig } from '@/lib/site';

// Rendered per request so the canonical/OG URLs (resolved against the layout's
// metadataBase) reflect the runtime `SITE_URL` rather than a build-time value.
// See lib/site.ts and app/page.tsx.
export const dynamic = 'force-dynamic';

const DESCRIPTION = `Get in touch with ${siteConfig.name} - open to new projects and opportunities.`;

export const metadata: Metadata = {
  title: 'Contact',
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact',
    description: DESCRIPTION,
    url: '/contact',
  },
};

export default function ContactPage() {
  return (
    <ContactClient
      linkedin={siteConfig.social.linkedin}
      location={siteConfig.location}
    />
  );
}
