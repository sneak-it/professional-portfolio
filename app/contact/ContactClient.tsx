'use client';

import { m } from 'motion/react';
import { Mail, MapPin } from 'lucide-react';
import Container from '@/components/Container';
import IconBadge from '@/components/IconBadge';
import { LinkedInIcon } from '@/components/icons/BrandIcons';
import { fadeInUp } from '@/lib/motion';

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
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="heading-legible text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
          {heading} <span className="gradient-text">{highlight}</span>!
        </h1>
        <div className="heading-legible text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          {children}
        </div>

        {/* One to three cards, depending on which SITE_* values are set. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {email && (
            <m.a
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              href={`mailto:${email}`}
              className="group flex flex-col items-center p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-accent dark:hover:border-accent"
            >
              <IconBadge
                color="primary"
                size="lg"
                className="mb-6 transition-transform duration-300 group-hover:scale-110"
              >
                <Mail size={32} />
              </IconBadge>
              <h3 className="text-xl font-bold mb-2 transition-colors group-hover:text-accent">
                Email
              </h3>
              <span className="text-gray-600 dark:text-gray-400 transition-colors group-hover:text-accent break-all">
                {email}
              </span>
            </m.a>
          )}

          {linkedin && (
            <m.a
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-accent dark:hover:border-accent"
            >
              <IconBadge
                color="primary"
                size="lg"
                className="mb-6 transition-transform duration-300 group-hover:scale-110"
              >
                <LinkedInIcon size={32} />
              </IconBadge>
              <h3 className="text-xl font-bold mb-2 transition-colors group-hover:text-accent">
                LinkedIn
              </h3>
              <span className="text-gray-600 dark:text-gray-400 transition-colors group-hover:text-accent">
                Connect with me
              </span>
            </m.a>
          )}

          <m.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group flex flex-col items-center p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-accent dark:hover:border-accent"
          >
            <IconBadge
              color="secondary"
              size="lg"
              className="mb-6 transition-transform duration-300 group-hover:scale-110"
            >
              <MapPin size={32} />
            </IconBadge>
            <h3 className="text-xl font-bold mb-2 transition-colors group-hover:text-accent">
              Location
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{location}</p>
          </m.div>
        </div>
      </m.div>
    </Container>
  );
}
