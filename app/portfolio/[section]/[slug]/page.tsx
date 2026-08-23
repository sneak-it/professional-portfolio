import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import BackButton from '@/components/BackButton';
import GalleryView from '@/components/GalleryView';
import JsonLd from '@/components/JsonLd';
import { CachedMDX } from '@/components/MDXComponents';
import {
  getSection,
  getProjectItem,
  getPhotographyGallery,
} from '@/lib/portfolio';
import { absoluteUrl } from '@/lib/site';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { PROSE } from '@/lib/prose';
import ProjectDetailClient from './ProjectDetailClient';

// Rendered per request so items added, edited, or removed in the bind-mounted
// content/ dir are served immediately, and so the runtime site config applies.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}): Promise<Metadata> {
  const { section, slug } = await params;
  const config = getSection(section);
  if (!config) return {};

  const item =
    config.type === 'gallery'
      ? await getPhotographyGallery(slug)
      : getProjectItem(config.slug, slug);
  if (!item) return {};

  const url = `/portfolio/${config.slug}/${item.slug}`;

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: url },
    // Drafts stay reachable for preview, so keep crawlers off them.
    ...(item.draft && { robots: { index: false, follow: false } }),
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.description,
      url,
      images: item.coverImage ? [{ url: item.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: item.coverImage ? [item.coverImage] : undefined,
    },
  };
}

export default async function PortfolioItemPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const config = getSection(section);
  if (!config) notFound();

  const breadcrumbFor = (title: string, path: string) =>
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Portfolio', path: '/portfolio' },
      { name: config.name, path: `/portfolio/${config.slug}` },
      { name: title, path },
    ]);

  // Photography: scrollable gallery + lightbox.
  if (config.type === 'gallery') {
    const gallery = await getPhotographyGallery(slug);
    if (!gallery) notFound();

    const url = absoluteUrl(`/portfolio/${config.slug}/${gallery.slug}`);
    const galleryJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: gallery.title,
      description: gallery.description,
      url,
      datePublished: gallery.date || undefined,
      // Gallery srcs are always site-relative (scanned out of media/), so
      // JSON-LD just needs the origin prepended. They point at the stripping
      // route, so Google Images caches sanitized copies.
      image: gallery.images.map((img) => absoluteUrl(img.src)),
    };

    return (
      <>
        <JsonLd data={galleryJsonLd} />
        <JsonLd
          data={breadcrumbFor(
            gallery.title,
            `/portfolio/${config.slug}/${gallery.slug}`,
          )}
        />
        <GalleryView gallery={gallery} backHref={`/portfolio/${config.slug}`} />
      </>
    );
  }

  // Technology Consulting / Open Source: project-style write-up.
  const project = getProjectItem(config.slug, slug);
  if (!project) notFound();

  const url = absoluteUrl(`/portfolio/${config.slug}/${project.slug}`);
  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url,
    datePublished: project.date || undefined,
    image: project.coverImage || undefined,
  };

  return (
    <>
      <JsonLd data={projectJsonLd} />
      <JsonLd
        data={breadcrumbFor(
          project.title,
          `/portfolio/${config.slug}/${project.slug}`,
        )}
      />
      <Container size="lg">
        <BackButton
          href={`/portfolio/${config.slug}`}
          label={`Back to ${config.name}`}
        />

        <ProjectDetailClient project={project} sectionName={config.name} />

        {project.content && project.content.trim() && (
          <div className={`surface p-8 md:p-12 mt-16 ${PROSE}`}>
            <CachedMDX source={project.content} />
          </div>
        )}
      </Container>
    </>
  );
}
