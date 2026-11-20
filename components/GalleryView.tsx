'use client';

import { useState } from 'react';
import Image from 'next/image';
import Container from '@/components/Container';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import ImageLightbox from '@/components/ImageLightbox';
import PageHeader from '@/components/PageHeader';
import SectionNote from '@/components/SectionNote';
import type { GalleryItem } from '@/lib/portfolio';
import { toSlide } from '@/lib/lightbox';

export default function GalleryView({
  gallery,
  backHref,
  backLabel,
  note,
}: {
  gallery: GalleryItem;
  backHref: string;
  backLabel: string;
  /** The section note, rendered on the server. */
  note?: React.ReactNode;
}) {
  const [index, setIndex] = useState(-1);

  const slides = gallery.images.map(toSlide);

  return (
    <Container>
      <BackButton href={backHref} label={backLabel} />

      <PageHeader
        align="left"
        title={gallery.title}
        description={gallery.description}
      />

      {gallery.images.length === 0 && (
        <EmptyState>No images in this gallery yet.</EmptyState>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
        {gallery.images.map((image, i) => (
          <button
            type="button"
            key={image.id}
            style={{ animationDelay: `${(i % 5) * 100}ms` }}
            className="enter-up block w-full break-inside-avoid relative photo-edge [--photo-edge:rgb(0_0_0/0.35)] dark:[--photo-edge:rgb(255_255_255/0.35)] group cursor-pointer rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900"
            onClick={() => {
              setIndex(i);
            }}
            aria-label={`View image: ${image.alt}`}
            aria-haspopup="dialog"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, (max-width: 80rem) 33vw, 25rem"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ))}
      </div>

      <ImageLightbox
        slides={slides}
        index={index}
        close={() => {
          setIndex(-1);
        }}
      />
      <SectionNote>{note}</SectionNote>
    </Container>
  );
}
