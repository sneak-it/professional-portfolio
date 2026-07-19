import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './frontmatter';
import { safeSlug } from './slug';

/**
 * Shared MDX data-layer plumbing used by both the blog (`lib/mdx.ts`) and the
 * portfolio (`lib/portfolio.ts`). Centralizing the dir listing and the
 * read/parse (with its path-traversal guard and try/catch) keeps the two data
 * layers thin mappers over one implementation.
 */

export interface MdxFile {
  slug: string;
  data: Record<string, unknown>;
  content: string;
}

/**
 * Lists the `.mdx` filenames in a content directory, or `[]` if it doesn't
 * exist. Filtering to `.mdx` keeps editor backups, `drafts/` folders, and other
 * stray entries out of `generateStaticParams`.
 */
export function listMdxSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith('.mdx'));
}

/**
 * Reads and parses a single MDX file by slug from `dir`. Sanitizes the slug
 * (path-traversal guard), returns `null` if the slug is unsafe or the file is
 * missing, and swallows read/parse errors (e.g. malformed YAML frontmatter) so
 * one bad file can't take down a whole listing — callers filter out the null.
 */
export function readMdxFile(dir: string, slug: string): MdxFile | null {
  const realSlug = safeSlug(slug);
  if (realSlug === null) return null;

  const fullPath = path.join(dir, `${realSlug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = parseFrontmatter(fileContents);
    return { slug: realSlug, data, content };
  } catch (e) {
    console.error(`Failed to load MDX file "${fullPath}"`, e);
    return null;
  }
}
