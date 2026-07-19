import path from 'path';
import { listMdxSlugs, readMdxFile } from './content';
import { byDateDesc } from './sort';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPostMeta {
  title: string;
  date: string;
  category: string;
  readTime?: string;
  excerpt?: string;
  image?: string;
  [key: string]: unknown;
}

export interface BlogPost {
  slug: string;
  meta: BlogPostMeta;
  content: string;
}

export function getPostSlugs() {
  return listMdxSlugs(postsDirectory);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = readMdxFile(postsDirectory, slug);
  if (file === null) return null;

  return {
    slug: file.slug,
    meta: file.data as BlogPostMeta,
    content: file.content,
  };
}

export function getAllPosts() {
  return (
    getPostSlugs()
      .map((slug) => getPostBySlug(slug))
      .filter((post): post is NonNullable<typeof post> => post !== null)
      // sort posts by date in descending order
      .sort((post1, post2) => byDateDesc(post1.meta, post2.meta))
  );
}
