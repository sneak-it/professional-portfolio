'use client';

import { m } from 'motion/react';
import { ImageIcon } from 'lucide-react';
import Container from '@/components/Container';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import CoverCard from '@/components/CoverCard';
import { fadeInUpOnView } from '@/lib/motion';
import type { GallerySummary } from '@/lib/portfolio';

// Dedicated Photography page: a grid of sub-category collections (Landscape,
// Automotive, ...). Each links to its scrollable gallery.
export default function SectionGalleryList({
  title,
  description,
  galleries,
}: {
  title: string;
  description: string;
  galleries: GallerySummary[];
}) {
  return (
    <Container>
      <BackButton href="/portfolio" label="Back to Portfolio" />

      <PageHeader title={title} description={description} />

      {galleries.length === 0 ? (
        <EmptyState>No collections here yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((gallery, index) => (
            <m.div
              key={gallery.slug}
              {...fadeInUpOnView}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CoverCard
                href={`/portfolio/photography/${gallery.slug}`}
                coverImage={gallery.coverImage}
                title={gallery.title}
                description={gallery.description}
                aspect="aspect-square"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                meta={
                  <div className="flex items-center gap-2 text-white/80 mb-2 text-sm font-medium">
                    <ImageIcon size={16} />
                    <span>{gallery.imageCount} Photos</span>
                    {gallery.date && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{gallery.date}</span>
                      </>
                    )}
                  </div>
                }
              />
            </m.div>
          ))}
        </div>
      )}
    </Container>
  );
}
