'use client';

import { motion } from 'motion/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Container from '@/components/Container';
import IconBadge from '@/components/IconBadge';
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
          Let&apos;s create something{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2">
            amazing
          </span>{' '}
          together.
        </h1>
        <p className="heading-legible text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          I&apos;m currently available for freelance work and open to new
          opportunities. Whether you have a project in mind or just want to say
          hi, feel free to reach out!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
          >
            <IconBadge color="primary" size="lg" className="mb-6">
              <Mail size={32} />
            </IconBadge>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
            >
              {siteConfig.email}
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
              <br />
              {siteConfig.locationNote}
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
          >
            <IconBadge color="secondary" size="lg" className="mb-6">
              <Phone size={32} />
            </IconBadge>
            <h3 className="text-xl font-bold mb-2">Phone</h3>
            <a
              href={siteConfig.phoneHref}
              className="text-gray-600 dark:text-gray-400 hover:text-accent-2 transition-colors"
            >
              {siteConfig.phone}
            </a>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}
