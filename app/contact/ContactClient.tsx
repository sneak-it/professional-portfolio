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
            <m.div
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
            >
              <IconBadge color="primary" size="lg" className="mb-6">
                <Mail size={32} />
              </IconBadge>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <a
                href={`mailto:${email}`}
                className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors break-all"
              >
                {email}
              </a>
            </m.div>
          )}

          {linkedin && (
            <m.div
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
            >
              <IconBadge color="primary" size="lg" className="mb-6">
                <LinkedInIcon size={32} />
              </IconBadge>
              <h3 className="text-xl font-bold mb-2">LinkedIn</h3>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
              >
                Connect with me
              </a>
            </m.div>
          )}

          <m.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
          >
            <IconBadge color="secondary" size="lg" className="mb-6">
              <MapPin size={32} />
            </IconBadge>
            <h3 className="text-xl font-bold mb-2">Location</h3>
            <p className="text-gray-600 dark:text-gray-400">{location}</p>
          </m.div>
        </div>
      </m.div>
    </Container>
  );
}
