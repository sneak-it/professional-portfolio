'use client';

import { Mail, MapPin } from 'lucide-react';
import Container from '@/components/Container';
import IconBadge from '@/components/IconBadge';
import { LinkedInIcon } from '@/components/icons/BrandIcons';
import { moveSpotlight } from '@/lib/spotlight';

export default function ContactClient({
  email,
  linkedin,
  location,
  heading,
  highlight,
  children,
}: {
  email?: string;
  linkedin?: string;
  location: string;
  heading: string;
  highlight: string;
  /** Intro paragraph from content/contact.mdx. */
  children: React.ReactNode;
}) {
  return (
    <Container size="sm" className="text-center">
      <div className="enter-up">
        <h1 className="heading-legible text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
          {heading} <span className="gradient-text">{highlight}</span>!
        </h1>
        <div className="heading-legible text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          {children}
        </div>

        {/* One to three cards, depending on which SITE_* values are set. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {email && (
            <a
              style={{ animationDelay: '100ms' }}
              href={`mailto:${email}`}
              className="enter-up group flex flex-col items-center p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-accent dark:hover:border-accent"
            >
              <IconBadge
                color="primary"
                size="lg"
                className="mb-6 transition-transform duration-300 group-hover:scale-110"
              >
                <Mail size={32} />
              </IconBadge>
              <h2 className="text-xl font-bold mb-2 transition-colors group-hover:text-accent-text">
                Email
              </h2>
              <span className="text-gray-600 dark:text-gray-400 transition-colors group-hover:text-accent-text break-all">
                {email}
              </span>
            </a>
          )}

          {linkedin && (
            <a
              style={{ animationDelay: '200ms' }}
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="enter-up group flex flex-col items-center p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-accent dark:hover:border-accent"
            >
              <IconBadge
                color="primary"
                size="lg"
                className="mb-6 transition-transform duration-300 group-hover:scale-110"
              >
                <LinkedInIcon size={32} />
              </IconBadge>
              <h2 className="text-xl font-bold mb-2 transition-colors group-hover:text-accent-text">
                LinkedIn
              </h2>
              <span className="text-gray-600 dark:text-gray-400 transition-colors group-hover:text-accent-text">
                Connect with me
              </span>
            </a>
          )}

          <div
            style={{ animationDelay: '300ms' }}
            onPointerMove={moveSpotlight}
            className="enter-up group flex flex-col items-center p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/10 spotlight relative"
          >
            <IconBadge
              color="secondary"
              size="lg"
              className="mb-6 transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6"
            >
              <MapPin size={32} />
            </IconBadge>
            <h2 className="text-xl font-bold mb-2">Location</h2>
            <p className="text-gray-600 dark:text-gray-400">{location}</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
