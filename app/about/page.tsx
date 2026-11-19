import AboutClient from './AboutClient';
import { CachedMDX } from '@/components/MDXComponents';
import JsonLd from '@/components/JsonLd';
import { profilePageJsonLd } from '@/lib/jsonld';
import { getAbout } from '@/lib/about';
import { pageMetadata } from '@/lib/metadata';
import { avatarSrc, siteConfig } from '@/lib/site';

// Per request so canonical/OG URLs reflect the runtime SITE_URL. See app/page.tsx.
export const dynamic = 'force-dynamic';

const FALLBACK_DESCRIPTION = `Get to know ${siteConfig.name} and the work behind the site.`;

export function generateMetadata() {
  const { description } = getAbout(FALLBACK_DESCRIPTION);
  return pageMetadata({ title: 'About', description, path: '/about' });
}

export default function AboutPage() {
  const {
    heading,
    skills,
    interests,
    skillsHeading,
    skillsBlurb,
    interestsHeading,
    interestsBlurb,
    content,
  } = getAbout(FALLBACK_DESCRIPTION);

  return (
    <>
      <JsonLd data={profilePageJsonLd()} />
      <AboutClient
        name={siteConfig.name}
        heading={heading}
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
    </>
  );
}
