import type { MetadataRoute } from 'next';
import { SITEMAP_CACHE_TTL_MS } from '@/lib/config';
import { toDate } from '@/lib/date';
import { TAG_INDEX_MIN_POSTS, getAllPostMeta, getTags } from '@/lib/mdx';
import {
  PORTFOLIO_SECTIONS,
  getProjectItems,
  getPhotographyGalleries,
} from '@/lib/portfolio';
import { absoluteUrl } from '@/lib/site';

// Rendered per request so the origin reflects the runtime `SITE_URL` (see
// lib/site.ts). The content scan is memoized below.
export const dynamic = 'force-dynamic';

type Entry = MetadataRoute.Sitemap[number];

/** A sitemap route as a site-relative path; the origin is applied per request. */
interface Route {
  path: string;
  lastModified?: Date;
}

/** Most-recent of the given dates, ignoring `undefined`; `undefined` if none. */
function latest(dates: Array<Date | undefined>): Date | undefined {
  const valid = dates.filter((d): d is Date => d !== undefined);
  return valid.length
    ? valid.reduce((max, d) => (d > max ? d : max))
    : undefined;
}

/** Builds a sitemap entry, omitting `lastModified` when there's no real date. */
function entry(url: string, lastModified?: Date): Entry {
  return { url, ...(lastModified && { lastModified }) };
}

/**
 * Origin-independent routes from a full content scan, cached by `getRoutes`.
 * The origin is applied per request, so a `SITE_URL` change is served fresh.
 */
function buildRoutes(): Route[] {
  const postItems = getAllPostMeta().map((post) => ({
    path: `/blog/${post.slug}`,
    date: latest([toDate(post.meta.date), toDate(post.meta.updated)]),
  }));

  const photographyItems = getPhotographyGalleries().map((gallery) => ({
    path: `/portfolio/photography/${gallery.slug}`,
    date: toDate(gallery.date),
  }));

  const projectItems = PORTFOLIO_SECTIONS.filter(
    (s) => s.type === 'project',
  ).flatMap((section) =>
    getProjectItems(section.slug).map((item) => ({
      path: `/portfolio/${section.slug}/${item.slug}`,
      date: toDate(item.date),
      section: section.slug,
    })),
  );

  const posts: Route[] = postItems.map((i) => ({
    path: i.path,
    lastModified: i.date,
  }));
  const photography: Route[] = photographyItems.map((i) => ({
    path: i.path,
    lastModified: i.date,
  }));
  const projects: Route[] = projectItems.map((i) => ({
    path: i.path,
    lastModified: i.date,
  }));

  // Index/hub pages change when their content changes, so their lastModified
  // tracks the newest child date (omitted entirely when a section is empty).
  const sectionRoutes: Route[] = PORTFOLIO_SECTIONS.map((section) => {
    const childDates = (
      section.type === 'gallery'
        ? photographyItems
        : projectItems.filter((i) => i.section === section.slug)
    ).map((i) => i.date);
    return {
      path: `/portfolio/${section.slug}`,
      lastModified: latest(childDates),
    };
  });

  const staticRoutes: Route[] = [
    // These change on code deploys, so lastModified is omitted.
    { path: '/' },
    { path: '/about' },
    { path: '/contact' },
    // Index pages track their newest content.
    {
      path: '/portfolio',
      lastModified: latest(
        [...photographyItems, ...projectItems].map((i) => i.date),
      ),
    },
    { path: '/blog', lastModified: latest(postItems.map((i) => i.date)) },
  ];

  // Thin tag views are omitted.
  const tagRoutes: Route[] = getTags()
    .filter((tag) => tag.count >= TAG_INDEX_MIN_POSTS)
    .map((tag) => ({ path: `/blog?tag=${tag.slug}` }));

  return [
    ...staticRoutes,
    ...tagRoutes,
    ...sectionRoutes,
    ...posts,
    ...photography,
    ...projects,
  ];
}

// SITEMAP_CACHE_TTL_MS trades sitemap freshness against content-tree walks.
// Pages render per request, so it only affects sitemap.xml.

let routeCache: { at: number; routes: Route[] } | null = null;

/** Cached `buildRoutes()` — one filesystem scan per TTL, per container. */
function getRoutes(): Route[] {
  const now = Date.now();
  if (routeCache && now - routeCache.at < SITEMAP_CACHE_TTL_MS)
    return routeCache.routes;
  const routes = buildRoutes();
  routeCache = { at: now, routes };
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return getRoutes().map((r) => entry(absoluteUrl(r.path), r.lastModified));
}
