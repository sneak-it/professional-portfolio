import { siteConfig } from './site';

/**
 * Builds a schema.org `BreadcrumbList` JSON-LD object from an ordered list of
 * crumbs. Each `path` is site-relative ('/' for home) and is resolved against
 * the canonical origin, so callers never hand-build the absolute URLs or the
 * repetitive `position`/`@type` boilerplate.
 */
export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${siteConfig.url}${crumb.path === '/' ? '' : crumb.path}`,
    })),
  };
}
