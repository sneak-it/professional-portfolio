import type { MetadataRoute } from 'next';
import { SITEMAP_CACHE_TTL_MS } from '@/lib/config';
import { getAllPostMeta } from '@/lib/mdx';
import {
  PORTFOLIO_SECTIONS,
  getProjectItems,
  getPhotographyGalleries,
} from '@/lib/portfolio';
import { siteConfig } from '@/lib/site';

// Rendered at request time so the emitted origin always reflects the runtime
// `SITE_URL` (see lib/site.ts) rather than a build-time value — this is what
// lets one prebuilt image serve any domain. The expensive part (scanning every
// content file for dates) is memoized below, so per-request work is just a
// cache lookup plus prepending the origin.
export const dynamic = 'force-dynamic';

type Entry = MetadataRoute.Sitemap[number];

/** A sitemap route as a site-relative path; the origin is applied per request. */
interface Route {
  path: string;
  lastModified?: Date;
}

/** Parses an ISO frontmatter date, or `undefined` if missing/unparseable. */
function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
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
 * Scans all content and returns origin-independent routes. This is the costly
 * step — it reads and parses every blog/portfolio file — so its result is
 * cached (see `getRoutes`). Deliberately excludes the origin: it's applied per
 * request instead, so a runtime `SITE_URL` change can never be served stale
 * from this cache.
 */
function buildRoutes(): Route[] {
  const postItems = getAllPostMeta().map((post) => ({
    path: `/blog/${post.slug}`,
    date: toDate(post.meta.date),
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
    // No meaningful runtime change-date, so lastModified is omitted; these change
    // on code deploys, not on content edits.
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

  return [
    ...staticRoutes,
    ...sectionRoutes,
    ...posts,
    ...photography,
    ...projects,
  ];
}

// SITEMAP_CACHE_TTL_MS is purely a cost knob: it bounds how often the content
// tree is walked, and how quickly a newly uploaded file appears in the sitemap.
// It does NOT affect the pages themselves, which render per request. Crawlers
// fetch sitemap.xml infrequently, so even a long TTL collapses any burst to a
// single scan.

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
  const base = siteConfig.url;
  return getRoutes().map((r) => entry(`${base}${r.path}`, r.lastModified));
}
