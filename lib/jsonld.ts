import { absoluteUrl } from './site';

/**
 * schema.org `BreadcrumbList` from an ordered crumb list. Each site-relative
 * `path` ('/' for home) resolves against the canonical origin.
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
      item: absoluteUrl(crumb.path === '/' ? '' : crumb.path),
    })),
  };
}
