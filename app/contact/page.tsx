import ContactClient from './ContactClient';
import { CachedMDX } from '@/components/MDXComponents';
import { getContact } from '@/lib/contact';
import { pageMetadata } from '@/lib/metadata';
import { siteConfig } from '@/lib/site';

// Per request so canonical/OG URLs reflect the runtime SITE_URL. See app/page.tsx.
export const dynamic = 'force-dynamic';

const FALLBACK_DESCRIPTION = `Get in touch with ${siteConfig.name} - open to new projects and opportunities.`;

export function generateMetadata() {
  const { description } = getContact(FALLBACK_DESCRIPTION);
  return pageMetadata({ title: 'Contact', description, path: '/contact' });
}

export default function ContactPage() {
  const { heading, highlight, content } = getContact(FALLBACK_DESCRIPTION);

  return (
    <ContactClient
      email={siteConfig.social.email}
      linkedin={siteConfig.social.linkedin}
      location={siteConfig.location}
      heading={heading}
      highlight={highlight}
    >
      <CachedMDX source={content} />
    </ContactClient>
  );
}
