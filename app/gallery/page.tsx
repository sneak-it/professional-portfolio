import type { Metadata } from 'next';
import { getAllGalleries } from '@/lib/galleries';
import GalleryList from '@/components/GalleryList';

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
