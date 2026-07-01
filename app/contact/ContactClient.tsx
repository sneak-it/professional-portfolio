'use client';

import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import Container from '@/components/Container';
import IconBadge from '@/components/IconBadge';
import { LinkedInIcon } from '@/components/icons/BrandIcons';
import { fadeInUp } from '@/lib/motion';
import { siteConfig } from '@/lib/site';

export default function ContactClient() {
  return (
    <Container size="sm" className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="heading-legible text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
          Say{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2">
            hello
          </span>
          !
        </h1>
        <p className="heading-legible text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          Looking to collaborate, chat, or just say hi?
          I’m always open to new opportunities and conversations.
          Reach out and let’s connect!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
          >
            <IconBadge color="primary" size="lg" className="mb-6">
              <LinkedInIcon size={32} />
            </IconBadge>
            <h3 className="text-xl font-bold mb-2">LinkedIn</h3>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
            >
              Connect with me
            </a>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
          >
            <IconBadge color="secondary" size="lg" className="mb-6">
              <MapPin size={32} />
            </IconBadge>
            <h3 className="text-xl font-bold mb-2">Location</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {siteConfig.location}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}
