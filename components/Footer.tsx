import Link from 'next/link';
import { GitHubIcon, LinkedInIcon } from '@/components/icons/BrandIcons';
import { siteConfig } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-black/50 border-t border-gray-200 dark:border-white/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <Link href="/" className="text-2xl font-bold tracking-tighter">
YN<span className="text-accent">.</span>
            </Link>
          </div>

          <div className="flex space-x-6">
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <GitHubIcon size={20} />
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <LinkedInIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
