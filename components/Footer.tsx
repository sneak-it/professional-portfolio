import Link from 'next/link';
import { CodeXml } from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from '@/components/icons/BrandIcons';
import { REPO_URL, siteConfig } from '@/lib/site';

// A blanked-out SITE_*_URL hides its link.
const socials = [
  { name: 'GitHub', href: siteConfig.social.github, Icon: GitHubIcon },
  { name: 'LinkedIn', href: siteConfig.social.linkedin, Icon: LinkedInIcon },
].filter((social) => social.href);

export default function Footer() {
  // md:pb-16 keeps the row clear of the fixed corner controls at the page end.
  return (
    <footer className="bg-gray-50 dark:bg-black/50 border-t border-gray-200 dark:border-white/10 py-8 md:pb-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <Link
              prefetch={false}
              href="/"
              className="text-2xl font-mono font-bold tracking-tight uppercase"
            >
              {siteConfig.monogram}
              <span className="text-accent">.</span>
            </Link>
          </div>

          <div className="flex space-x-6">
            {socials.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel={`${siteConfig.profileUrls.includes(href) ? 'me ' : ''}noopener noreferrer`}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <span className="sr-only">{name}</span>
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Mirrors the pause button's position (BackgroundCanvas.tsx). No noreferrer,
          so GitHub's traffic page lists the sites that run this. */}
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener"
        title="Built with professional-portfolio"
        className="fixed bottom-4 left-4 z-40 inline-flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <span className="sr-only">Built with professional-portfolio</span>
        <CodeXml className="h-[1.1rem] w-[1.1rem]" aria-hidden />
      </a>
    </footer>
  );
}
