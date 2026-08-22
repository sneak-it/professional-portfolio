import path from 'path';
import {
  listMdxFiles,
  readMdxFile,
  strings,
  text,
  type MdxFile,
} from './content.ts';
import { firstParagraph, readTime } from './markdown.ts';
import { slugify } from './slug.ts';
import { byDateDesc } from './sort.ts';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPostMeta {
  title: string;
  date: string;
  // Only title and date are structural; a post with no tags is still
  // publishable, so this is an empty array rather than a required field.
  tags: string[];
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
    tags: strings(data.tags),
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

/**
 * Below this a tag view is thin duplicate content: it is left out of the sitemap
 * and marked noindex. Not an env knob, it does not vary per deploy.
 */
export const TAG_INDEX_MIN_POSTS = 3;

export interface Tag {
  name: string;
  slug: string;
  count: number;
}

/**
 * Distinct tags across published posts, most-used first. Display name is
 * first-seen, and posts arrive newest-first, so the newest spelling of a tag
 * wins; `check:content` reports the conflicting spellings.
 */
export function getTags(): Tag[] {
  const byName = new Map<string, Tag>();
  for (const post of getAllPostMeta()) {
    // Per post, so `tags: ['AI', 'ai']` counts once rather than twice.
    for (const slug of new Set(post.meta.tags.map(slugify))) {
      if (slug === '') continue;
      const tag = byName.get(slug);
      if (tag) tag.count += 1;
      else
        byName.set(slug, {
          name: post.meta.tags.find((n) => slugify(n) === slug) ?? slug,
          slug,
          count: 1,
        });
    }
  }
  return [...byName.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}

/** Published posts carrying a tag, by slug; `[]` for an unknown slug. */
export function getPostsByTag(slug: string): BlogPostSummary[] {
  return getAllPostMeta().filter((post) =>
    post.meta.tags.some((name) => slugify(name) === slug),
  );
}
