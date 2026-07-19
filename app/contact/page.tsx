import type { Metadata } from 'next';
import ContactClient from './ContactClient';

// Rendered per request so the canonical/OG URLs (resolved against the layout's
// metadataBase) reflect the runtime `SITE_URL` rather than a build-time value.
// See lib/site.ts and app/page.tsx.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Ian Rodriguez-Torrent - open to new projects and opportunities.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact',
    description:
      'Get in touch with Ian Rodriguez-Torrent - open to new projects and opportunities.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
