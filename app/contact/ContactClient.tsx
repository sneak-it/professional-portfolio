'use client';

import { motion } from 'motion/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function ContactClient() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
            Let&apos;s create something{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
              amazing
            </span>{' '}
            together.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            I&apos;m currently available for freelance work and open to new
            opportunities. Whether you have a project in mind or just want to
            say hi, feel free to reach out!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
            >
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <a
                href="mailto:hello@example.com"
                className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
              >
                hello@example.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Location</h3>
              <p className="text-gray-600 dark:text-gray-400">
                San Francisco, CA
                <br />
                Available Worldwide
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"
            >
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-500/20 text-pink-500 rounded-full flex items-center justify-center mb-6">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <a
                href="tel:+1234567890"
                className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors"
              >
                +1 (234) 567-890
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
