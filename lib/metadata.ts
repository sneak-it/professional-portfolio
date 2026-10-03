import type { Metadata } from 'next';
import { BRAND_VERSION, siteConfig } from './site';

/** The generated share card (app/brand/opengraph-image). */
const OG_IMAGE = `/brand/opengraph-image?v=${BRAND_VERSION}`;

interface Page {
  /** Omitted on the home page, which keeps the root title. */
  title?: string;
  description: string;
  /** Site-relative; the canonical and og:url. */
  path: string;
  /** Site-relative share image; the generated card when absent. */
  image?: string;
  /** Posts and portfolio items: og:type article, with this publish date. */
  published?: string;
  keywords?: string[];
  robots?: Metadata['robots'];
}

/**
 * Page metadata with the site-wide share fields restated: Next replaces
 * `openGraph`, `twitter`, and `alternates` whole in every segment that sets them.
 */
export function pageMetadata(page: Page): Metadata {
  const { title, description, path, image, published, keywords, robots } = page;
  const shareTitle = title ?? siteConfig.title;
  const images = image
    ? [{ url: image }]
    : [{ url: OG_IMAGE, width: 1200, height: 630, alt: siteConfig.title }];
  return {
    ...(title && { title }),
    description,
    ...(keywords && keywords.length > 0 && { keywords }),
    ...(robots && { robots }),
    alternates: {
      canonical: path,
      types: { 'application/rss+xml': '/feed.xml' },
    },
    openGraph: {
      ...(published !== undefined
        ? { type: 'article', ...(published && { publishedTime: published }) }
        : { type: 'website' }),
      siteName: siteConfig.name,
      locale: siteConfig.locale.replace('-', '_'),
      title: shareTitle,
      description,
      url: path,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: images.map((i) => i.url),
    },
  };
}
