import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/mdx';
import {
  PORTFOLIO_SECTIONS,
  getProjectItems,
  getPhotographyGalleries,
} from '@/lib/portfolio';
import { siteConfig } from '@/lib/site';

// Re-read posts/portfolio every 60s so the sitemap tracks content edits rather
// than freezing at build-time content.
export const revalidate = 60;

/**
 * Parses an ISO `YYYY-MM-DD` frontmatter date, falling back to the build time
 * if it's missing or unparseable so `lastModified` is always a valid Date.
 */
function toDate(value: string | undefined): Date {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/portfolio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...PORTFOLIO_SECTIONS.map((section) => ({
      url: `${base}/portfolio/${section.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${base}/resume`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: toDate(post.meta.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const photography: MetadataRoute.Sitemap = getPhotographyGalleries().map(
    (gallery) => ({
      url: `${base}/portfolio/photography/${gallery.slug}`,
      lastModified: toDate(gallery.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    }),
  );

  const projects: MetadataRoute.Sitemap = PORTFOLIO_SECTIONS.filter(
    (s) => s.type === 'project',
  ).flatMap((section) =>
    getProjectItems(section.slug).map((item) => ({
      url: `${base}/portfolio/${section.slug}/${item.slug}`,
      lastModified: toDate(item.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  return [...staticRoutes, ...posts, ...photography, ...projects];
}
