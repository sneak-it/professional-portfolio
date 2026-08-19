import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import AboutClient from './AboutClient';
import { mdxComponents } from '@/components/MDXComponents';
import { getAbout } from '@/lib/about';
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
  const { skills, interests, content } = getAbout();

  return (
    <AboutClient
      linkedin={siteConfig.social.linkedin}
      avatarUrl={siteConfig.avatarUrl}
      skills={skills}
      interests={interests}
    >
      <MDXRemote source={content} components={mdxComponents} />
    </AboutClient>
  );
}
