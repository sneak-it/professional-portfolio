import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  PORTFOLIO_SECTIONS,
  getSection,
  getProjectItems,
  getPhotographyGalleries,
} from '@/lib/portfolio';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import SectionGalleryList from './SectionGalleryList';
import SectionProjectList from './SectionProjectList';

// Prerendered sections (below) revalidate every 60s, and dynamicParams (default
// true) renders newly-added content on demand — both without a rebuild.
export const revalidate = 60;

export function generateStaticParams() {
  return PORTFOLIO_SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const config = getSection(section);
  if (!config) return {};

  const url = `/portfolio/${config.slug}`;

  return {
    title: config.name,
    description: config.description,
    alternates: { canonical: url },
    openGraph: {
      title: config.name,
      description: config.description,
      url,
    },
  };
}

export default async function PortfolioSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const config = getSection(section);
  if (!config) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Portfolio', path: '/portfolio' },
          { name: config.name, path: `/portfolio/${config.slug}` },
        ])}
      />
      {config.type === 'gallery' ? (
        <SectionGalleryList
          title={config.name}
          description={config.description}
          galleries={getPhotographyGalleries()}
        />
      ) : (
        <SectionProjectList
          title={config.name}
          description={config.description}
          projects={getProjectItems(config.slug)}
        />
      )}
    </>
  );
}
