import path from 'path';
import { listMdxSlugs, readMdxFile } from './content';
import { byDateDesc } from './sort';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPostMeta {
  title: string;
  date: string;
  // Optional, and guarded at every use: a post without one is still publishable,
  // so it is not in `required` below. Only title and date are structural.
  category?: string;
  readTime?: string;
  excerpt?: string;
  image?: string;
  [key: string]: unknown;
}

export interface BlogPostSummary {
  slug: string;
  meta: BlogPostMeta;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = readMdxFile(postsDirectory, slug, {
    required: ['title', 'date'],
  });
  if (file === null) return null;

  return {
    slug: file.slug,
    meta: file.data as BlogPostMeta,
    content: file.content,
  };
}

// List views (/blog, sitemap) only need metadata — carrying `content` would
// ship every full post body into the client payload for nothing.
export function getAllPostMeta(): BlogPostSummary[] {
  return listMdxSlugs(postsDirectory)
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .map(({ slug, meta }) => ({ slug, meta }))
    .sort((a, b) => byDateDesc(a.meta, b.meta));
}
