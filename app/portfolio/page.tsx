import type { Metadata } from 'next';
import { getSectionSummaries } from '@/lib/portfolio';
import { siteConfig } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import PortfolioHub from './PortfolioHub';

// Re-read MDX content at request time (cached, refreshed in the background every
// 60s) so edits appear without a rebuild. See lib/portfolio.ts.
export const revalidate = 60;

const description =
  'Selected work across technology consulting, photography, and open source.';

export const metadata: Metadata = {
  title: 'Portfolio',
  description,
  alternates: { canonical: '/portfolio' },
  openGraph: {
    title: 'Portfolio',
    description,
    url: '/portfolio',
  },
};

export default function PortfolioPage() {
  const sections = getSectionSummaries();

  const breadcrumbJsonLd = {
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
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PortfolioHub sections={sections} />
    </>
  );
}
