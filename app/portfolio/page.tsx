import type { Metadata } from 'next';
import { getSectionSummaries } from '@/lib/portfolio';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import PortfolioHub from './PortfolioHub';

// Rendered per request: the bind-mounted content/ dir and the runtime site
// config both apply immediately. See lib/portfolio.ts and lib/site.ts.
export const dynamic = 'force-dynamic';

// Single source for both the metadata description and the visible PageHeader.
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
      <PortfolioHub sections={sections} description={description} />
    </>
  );
}
