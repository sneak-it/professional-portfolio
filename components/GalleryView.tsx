'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import type { Gallery } from '@/lib/galleries';

export default function GalleryView({ gallery }: { gallery: Gallery }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isOpen = selectedIndex !== null;
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);

  const close = useCallback(() => setSelectedIndex(null), []);
  const showPrev = useCallback(
    () =>
      setSelectedIndex((i) =>
        i === null
          ? i
          : (i - 1 + gallery.images.length) % gallery.images.length,
      ),
    [gallery.images.length],
  );
  const showNext = useCallback(
    () =>
      setSelectedIndex((i) =>
        i === null ? i : (i + 1) % gallery.images.length,
      ),
    [gallery.images.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, showPrev, showNext]);

  const selected =
    selectedIndex !== null ? gallery.images[selectedIndex] : null;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Galleries
        </Link>

        <div className="mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4"
          >
            {gallery.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl"
          >
            {gallery.description}
          </motion.p>
        </div>

        {gallery.images.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 py-20 text-center text-gray-500 dark:text-gray-400">
            No images in this gallery yet.
          </div>
        )}

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {gallery.images.map((image, index) => (
            <motion.button
              type="button"
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
              className="block w-full break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image: ${image.alt}`}
              aria-haspopup="dialog"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Image viewer: ${selected.alt}`}
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
              onClick={close}
            >
              <button
                type="button"
                className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-50"
                onClick={close}
                aria-label="Close image viewer"
              >
                <X size={32} />
              </button>

              {gallery.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 p-2 rounded-full bg-white/10 hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      showPrev();
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 p-2 rounded-full bg-white/10 hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      showNext();
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}

              <motion.div
                key={selected.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative max-w-5xl max-h-[90vh] w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selected.src}
                  alt={selected.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
