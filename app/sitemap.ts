import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/mdx';
import {
  PORTFOLIO_SECTIONS,
  getProjectItems,
  getPhotographyGalleries,
} from '@/lib/portfolio';
import { siteConfig } from '@/lib/site';

// Rendered at request time. Sitemaps are crawled infrequently, so re-reading
// content per request is cheap; in exchange the emitted origin always reflects
// the runtime `SITE_URL` (see lib/site.ts) instead of a build-time value, which
// matters for anyone running the prebuilt image under their own domain. The
// entries themselves derive `lastModified` from stable frontmatter dates, so
// repeated regenerations produce identical output (no crawler-noise concern).
export const dynamic = 'force-dynamic';

type Entry = MetadataRoute.Sitemap[number];

/** Parses an ISO frontmatter date, or `undefined` if missing/unparseable. */
function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/** Most-recent of the given dates, ignoring `undefined`; `undefined` if none. */
function latest(dates: Array<Date | undefined>): Date | undefined {
  const valid = dates.filter((d): d is Date => d !== undefined);
  return valid.length ? valid.reduce((max, d) => (d > max ? d : max)) : undefined;
}

/** Builds a sitemap entry, omitting `lastModified` when there's no real date. */
function entry(url: string, lastModified?: Date): Entry {
  return { url, ...(lastModified && { lastModified }) };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const postItems = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    date: toDate(post.meta.date),
  }));

  const photographyItems = getPhotographyGalleries().map((gallery) => ({
    url: `${base}/portfolio/photography/${gallery.slug}`,
    date: toDate(gallery.date),
  }));

  const projectItems = PORTFOLIO_SECTIONS.filter((s) => s.type === 'project').flatMap(
    (section) =>
      getProjectItems(section.slug).map((item) => ({
        url: `${base}/portfolio/${section.slug}/${item.slug}`,
        date: toDate(item.date),
        section: section.slug,
      })),
  );

  const posts = postItems.map((i) => entry(i.url, i.date));
  const photography = photographyItems.map((i) => entry(i.url, i.date));
  const projects = projectItems.map((i) => entry(i.url, i.date));

  // Index/hub pages change when their content changes, so their lastModified
  // tracks the newest child date (omitted entirely when a section is empty).
  const sectionRoutes: MetadataRoute.Sitemap = PORTFOLIO_SECTIONS.map((section) => {
    const childDates = (
      section.type === 'gallery'
        ? photographyItems
        : projectItems.filter((i) => i.section === section.slug)
    ).map((i) => i.date);
    return entry(`${base}/portfolio/${section.slug}`, latest(childDates));
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    // No meaningful runtime change-date, so lastModified is omitted; these change
    // on code deploys, not on content edits.
    entry(`${base}/`),
    entry(`${base}/about`),
    entry(`${base}/contact`),
    // Index pages track their newest content.
    entry(`${base}/portfolio`, latest([...photographyItems, ...projectItems].map((i) => i.date))),
    entry(`${base}/blog`, latest(postItems.map((i) => i.date))),
  ];

  return [...staticRoutes, ...sectionRoutes, ...posts, ...photography, ...projects];
}
