import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/mdx';
import { getAllGalleries } from '@/lib/galleries';
import { getProjectIds } from '@/lib/projects';
import { siteConfig } from '@/lib/site';

// Re-read posts/galleries every 60s so the sitemap tracks content edits rather
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
      url: `${base}/projects`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${base}/gallery`,
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

  const galleries: MetadataRoute.Sitemap = getAllGalleries().map((gallery) => ({
    url: `${base}/gallery/${gallery.slug}`,
    lastModified: toDate(gallery.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const projects: MetadataRoute.Sitemap = getProjectIds().map((id) => ({
    url: `${base}/projects/${id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...posts, ...galleries, ...projects];
}
