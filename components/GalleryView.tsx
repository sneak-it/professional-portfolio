'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '@/components/Container';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import type { GalleryItem } from '@/lib/portfolio';

export default function GalleryView({
  gallery,
  backHref,
}: {
  gallery: GalleryItem;
  backHref: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isOpen = selectedIndex !== null;
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);

  const close = useCallback(() => {
    setSelectedIndex(null);
  }, []);
  const showPrev = useCallback(() => {
    setSelectedIndex((i) =>
      i === null ? i : (i - 1 + gallery.images.length) % gallery.images.length,
    );
  }, [gallery.images.length]);
  const showNext = useCallback(() => {
    setSelectedIndex((i) => (i === null ? i : (i + 1) % gallery.images.length));
  }, [gallery.images.length]);

  useEffect(() => {
    if (!isOpen) return;

    // Lock the page behind the dialog, restoring the previous value so a
    // nested overlay leaves the body as it found it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, showPrev, showNext]);

  const selected =
    selectedIndex !== null ? gallery.images[selectedIndex] : null;

  return (
    <Container>
      <BackButton href={backHref} label="Back to Photography" />

      <PageHeader
        align="left"
        title={gallery.title}
        description={gallery.description}
      />

      {gallery.images.length === 0 && (
        <EmptyState>No images in this gallery yet.</EmptyState>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {gallery.images.map((image, index) => (
          <m.button
            type="button"
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
            className="block w-full break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900"
            onClick={() => {
              setSelectedIndex(index);
            }}
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
          </m.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <m.div
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

            <m.div
              key={selected.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] w-full h-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Image
                src={selected.src}
                alt={selected.alt}
                fill
                sizes="100vw"
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
