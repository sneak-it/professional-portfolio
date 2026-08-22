import path from 'path';
import { listMdxFiles, readMdxFile, text, type MdxFile } from './content';
import { firstParagraph, readTime } from './markdown';
import { byDateDesc } from './sort';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPostMeta {
  title: string;
  date: string;
  // Optional, and guarded at every use: a post without one is still publishable,
  // so it is not in `required` below. Only title and date are structural.
  category?: string;
  // Derived from the body when frontmatter omits them, so they are never blank.
  readTime: string;
  excerpt: string;
  updated?: string;
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

/**
 * Frontmatter as `BlogPostMeta`, deriving what the author left out. The single
 * place the cast happens, so a list card and its article can't disagree.
 */
function postMeta(file: MdxFile): BlogPostMeta {
  const data = file.data as BlogPostMeta;
  return {
    ...data,
    readTime: text(data.readTime, readTime(file.content)),
    excerpt: text(data.excerpt, firstParagraph(file.content)),
    updated: text(data.updated, '') || undefined,
  };
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = readMdxFile(postsDirectory, slug, {
    required: ['title', 'date'],
  });
  if (file === null) return null;

  return {
    slug: file.slug,
    meta: postMeta(file),
    content: file.content,
  };
}

// List views (/blog, sitemap) only need metadata — carrying `content` would
// ship every full post body into the client payload for nothing.
export function getAllPostMeta(): BlogPostSummary[] {
  return listMdxFiles(postsDirectory, { required: ['title', 'date'] })
    .map((file) => ({ slug: file.slug, meta: postMeta(file) }))
    .sort((a, b) => byDateDesc(a.meta, b.meta));
}
