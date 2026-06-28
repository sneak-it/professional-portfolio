import type { Metadata } from 'next';
import { getAllGalleries } from '@/lib/galleries';
import GalleryList from '@/components/GalleryList';

// Re-read MDX content at request time (cached, refreshed in the background every
// 60s) so edits appear without a rebuild. See lib/galleries.ts.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'A collection of photography — nature, urban exploration, and more.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Gallery',
    description:
      'A collection of photography — nature, urban exploration, and more.',
    url: '/gallery',
  },
};

export default function GalleryPage() {
  const galleries = getAllGalleries();
  return <GalleryList galleries={galleries} />;
}
