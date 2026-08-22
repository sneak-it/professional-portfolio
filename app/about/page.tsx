import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { CachedMDX } from '@/components/MDXComponents';
import { getAbout } from '@/lib/about';
import { avatarSrc, siteConfig } from '@/lib/site';

// Per request so canonical/OG URLs reflect the runtime SITE_URL. See app/page.tsx.
export const dynamic = 'force-dynamic';

const FALLBACK_DESCRIPTION = `Get to know ${siteConfig.name} and the work behind the site.`;

export function generateMetadata(): Metadata {
  const { description } = getAbout(FALLBACK_DESCRIPTION);
  return {
    title: 'About',
    description,
    alternates: { canonical: '/about' },
    openGraph: {
      title: 'About',
      description,
      url: '/about',
    },
  };
}

export default function AboutPage() {
  const {
    skills,
    interests,
    skillsHeading,
    skillsBlurb,
    interestsHeading,
    interestsBlurb,
    content,
  } = getAbout(FALLBACK_DESCRIPTION);

  return (
    <AboutClient
      linkedin={siteConfig.social.linkedin}
      avatarUrl={avatarSrc()}
      skills={skills}
      interests={interests}
      skillsHeading={skillsHeading}
      skillsBlurb={skillsBlurb}
      interestsHeading={interestsHeading}
      interestsBlurb={interestsBlurb}
    >
      <CachedMDX source={content} />
    </AboutClient>
  );
}
