import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Container from '@/components/Container';
import GalleryView from '@/components/GalleryView';
import JsonLd from '@/components/JsonLd';
import { mdxComponents } from '@/components/MDXComponents';
import {
  PORTFOLIO_SECTIONS,
  getSection,
  getProjectItem,
  getProjectItems,
  getPhotographyGallery,
  getPhotographyGalleries,
} from '@/lib/portfolio';
import { siteConfig } from '@/lib/site';
import ProjectDetailClient from './ProjectDetailClient';

// Prerendered slugs (below) revalidate every 60s, and dynamicParams (default
// true) renders newly-added items on demand — both without a rebuild.
export const revalidate = 60;

export function generateStaticParams() {
  return PORTFOLIO_SECTIONS.flatMap((s) =>
    (s.type === 'gallery'
      ? getPhotographyGalleries()
      : getProjectItems(s.slug)
    ).map((item) => ({ section: s.slug, slug: item.slug })),
  );
}

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
      ? getPhotographyGallery(slug)
      : getProjectItem(config.slug, slug);
  if (!item) return {};

  const url = `/portfolio/${config.slug}/${item.slug}`;

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: url },
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

  const breadcrumbBase = (title: string, url: string) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Portfolio',
        item: `${siteConfig.url}/portfolio`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.name,
        item: `${siteConfig.url}/portfolio/${config.slug}`,
      },
      { '@type': 'ListItem', position: 4, name: title, item: url },
    ],
  });

  // Photography: scrollable gallery + lightbox.
  if (config.type === 'gallery') {
    const gallery = getPhotographyGallery(slug);
    if (!gallery) notFound();

    const url = `${siteConfig.url}/portfolio/${config.slug}/${gallery.slug}`;
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

    return (
      <>
        <JsonLd data={galleryJsonLd} />
        <JsonLd data={breadcrumbBase(gallery.title, url)} />
        <GalleryView gallery={gallery} backHref={`/portfolio/${config.slug}`} />
      </>
    );
  }

  // Technology Consulting / Open Source: project-style write-up.
  const project = getProjectItem(config.slug, slug);
  if (!project) notFound();

  const url = `${siteConfig.url}/portfolio/${config.slug}/${project.slug}`;
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
      <JsonLd data={breadcrumbBase(project.title, url)} />
      <Container size="lg">
        <Link
          href={`/portfolio/${config.slug}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to {config.name}
        </Link>

        <ProjectDetailClient project={project} sectionName={config.name} />

        {project.content && project.content.trim() && (
          <div className="prose prose-lg dark:prose-invert max-w-none mt-16 prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-12 prose-a:font-medium prose-a:underline-offset-4 prose-img:rounded-2xl">
            <MDXRemote source={project.content} components={mdxComponents} />
          </div>
        )}
      </Container>
    </>
  );
}
