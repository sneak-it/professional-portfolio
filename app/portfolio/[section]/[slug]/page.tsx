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
import { breadcrumbJsonLd, galleryJsonLd, projectJsonLd } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/metadata';
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

  return pageMetadata({
    title: item.title,
    description: item.description,
    path: url,
    image: item.coverImage || undefined,
    published: item.date,
    // Drafts stay reachable for preview, so keep crawlers off them.
    ...(item.draft && { robots: { index: false, follow: false } }),
  });
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

    const path = `/portfolio/${config.slug}/${gallery.slug}`;

    return (
      <>
        <JsonLd data={galleryJsonLd(gallery, path)} />
        <JsonLd data={breadcrumbFor(gallery.title, path)} />
        <GalleryView
          gallery={gallery}
          backHref={`/portfolio/${config.slug}`}
          backLabel={`Back to ${config.name}`}
          note={config.note ? <CachedMDX source={config.note} /> : undefined}
        />
      </>
    );
  }

  // Technology Consulting / Open Source: project-style write-up.
  const project = getProjectItem(config.slug, slug);
  if (!project) notFound();

  const path = `/portfolio/${config.slug}/${project.slug}`;

  return (
    <>
      <JsonLd data={projectJsonLd(project, path)} />
      <JsonLd data={breadcrumbFor(project.title, path)} />
      <Container size="lg">
        <BackButton
          href={`/portfolio/${config.slug}`}
          label={`Back to ${config.name}`}
        />

        <ProjectDetailClient project={project} sectionName={config.name} />

        {project.content && project.content.trim() && (
          <div className="mt-8 flex flex-col gap-8">
            <CachedMDX source={project.content} cards />
          </div>
        )}
      </Container>
    </>
  );
}
