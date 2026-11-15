'use client';

import { useState } from 'react';
import Image, { getImageProps } from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Container from '@/components/Container';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import type { GalleryItem } from '@/lib/portfolio';

export default function GalleryView({
  gallery,
  backHref,
}: {
  gallery: GalleryItem;
  backHref: string;
}) {
  const [index, setIndex] = useState(-1);

  // A sizes without vw lists every configured width; the lightbox picks per
  // drawn size and zoom. Widths past the served copy are dropped.
  const slides = gallery.images.map(({ src, alt, width, height }) => {
    const { props } = getImageProps({ src, alt, width, height, sizes: '1px' });
    return {
      src: props.src,
      alt,
      width,
      height,
      download: { url: src, filename: src.slice(src.lastIndexOf('/') + 1) },
      srcSet: props.srcSet
        ?.split(', ')
        .map((entry) => {
          const space = entry.lastIndexOf(' ');
          const slideWidth = parseInt(entry.slice(space + 1), 10);
          return {
            src: entry.slice(0, space),
            width: slideWidth,
            height: Math.round((slideWidth * height) / width),
          };
        })
        .filter((s) => s.width <= width),
    };
  });
  const multiple = slides.length > 1;
  const noButton = multiple ? undefined : () => null;

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
        {gallery.images.map((image, i) => (
          <button
            type="button"
            key={image.id}
            style={{ animationDelay: `${(i % 5) * 100}ms` }}
            className="enter-up block w-full break-inside-avoid relative photo-edge group cursor-pointer rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900"
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
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => {
          setIndex(-1);
        }}
        slides={slides}
        plugins={
          multiple
            ? [Download, Fullscreen, Thumbnails, Zoom]
            : [Download, Fullscreen, Zoom]
        }
        controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
        carousel={{ imageProps: { referrerPolicy: 'no-referrer' } }}
        render={{ buttonPrev: noButton, buttonNext: noButton }}
        labels={{
          Lightbox: 'Image viewer',
          Close: 'Close image viewer',
          Previous: 'Previous image',
          Next: 'Next image',
        }}
        styles={{ root: { '--yarl__color_backdrop': 'rgb(0 0 0 / 0.9)' } }}
      />
    </Container>
  );
}
