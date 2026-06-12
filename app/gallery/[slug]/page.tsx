import { getGalleryBySlug, getAllGalleries } from '@/lib/galleries';
import GalleryView from '@/components/GalleryView';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const galleries = getAllGalleries();
  return galleries.map((g) => ({
    slug: g.slug,
  }));
}

export default async function SingleGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const gallery = getGalleryBySlug(resolvedParams.slug);

  if (!gallery) {
    notFound();
  }

  return <GalleryView gallery={gallery} />;
}
