'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ImageIcon } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import type { Gallery } from '@/lib/galleries';

export default function GalleryList({ galleries }: { galleries: Gallery[] }) {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4"
          >
            Galleries
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            A collection of my photography work organized by themes and
            projects.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((gallery, index) => (
            <motion.div
              key={gallery.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/gallery/${gallery.slug}`}
                className="group block relative rounded-3xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-900"
              >
                <Image
                  src={gallery.coverImage}
                  alt={gallery.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 text-white/80 mb-2 text-sm font-medium">
                    <ImageIcon size={16} />
                    <span>{gallery.images.length} Photos</span>
                    <span className="mx-2">•</span>
                    <span>{gallery.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {gallery.title}
                  </h2>
                  <p className="text-white/70 text-sm line-clamp-2">
                    {gallery.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
