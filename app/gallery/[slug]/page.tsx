import type { Metadata } from 'next';
import { getGalleryBySlug, getAllGalleries } from '@/lib/galleries';
import GalleryView from '@/components/GalleryView';
import JsonLd from '@/components/JsonLd';
import { siteConfig } from '@/lib/site';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const galleries = getAllGalleries();
  return galleries.map((g) => ({
    slug: g.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gallery = getGalleryBySlug(slug);

  if (!gallery) {
    return {};
  }

  const url = `/gallery/${gallery.slug}`;

  return {
    title: gallery.title,
    description: gallery.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: gallery.title,
      description: gallery.description,
      url,
      images: gallery.coverImage ? [{ url: gallery.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: gallery.title,
      description: gallery.description,
      images: gallery.coverImage ? [gallery.coverImage] : undefined,
    },
  };
}

export default async function SingleGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const gallery = getGalleryBySlug(resolvedParams.slug);

  if (!gallery) {
    notFound();
  }

  const url = `${siteConfig.url}/gallery/${gallery.slug}`;

  const galleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: gallery.title,
    description: gallery.description,
    url,
    datePublished: gallery.date || undefined,
    image: gallery.images.map((img) =>
      img.src.startsWith('http') ? img.src : `${siteConfig.url}${img.src}`,
    ),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Gallery',
        item: `${siteConfig.url}/gallery`,
      },
      { '@type': 'ListItem', position: 3, name: gallery.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={galleryJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <GalleryView gallery={gallery} />
    </>
  );
}
