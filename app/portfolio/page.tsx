import type { Metadata } from 'next';
import { getSectionSummaries } from '@/lib/portfolio';
import { breadcrumbJsonLd } from '@/lib/jsonld';
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

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Portfolio', path: '/portfolio' },
        ])}
      />
      <PortfolioHub sections={sections} />
    </>
  );
}
