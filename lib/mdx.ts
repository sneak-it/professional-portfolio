import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { safeSlug } from './slug';

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
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const realSlug = safeSlug(slug);
  if (realSlug === null) {
    return null;
  }

  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    meta: data as BlogPostMeta,
    content,
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is NonNullable<typeof post> => post !== null)
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.meta.date > post2.meta.date ? -1 : 1));
  return posts;
}
