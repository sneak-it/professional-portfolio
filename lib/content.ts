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

export interface ReadMdxOptions {
  /**
   * Frontmatter keys that must be present as non-empty strings. A file missing
   * any of them is logged and skipped (`readMdxFile` returns `null`), so a post
   * with e.g. no `title`/`date` can't silently render blank alt text, an
   * `undefined` JSON-LD headline, or break date sorting. The frontmatter is
   * cast, not schema-checked, elsewhere — this is the one guard that runs.
   */
  required?: string[];
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
 * Pass `required` to additionally skip files whose frontmatter is missing those
 * fields.
 */
export function readMdxFile(
  dir: string,
  slug: string,
  options: ReadMdxOptions = {},
): MdxFile | null {
  const realSlug = safeSlug(slug);
  if (realSlug === null) return null;

  const fullPath = path.join(dir, `${realSlug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = parseFrontmatter(fileContents);

    const missing = (options.required ?? []).filter((key) => {
      const value = data[key];
      return typeof value !== 'string' || value.trim() === '';
    });
    if (missing.length > 0) {
      console.error(
        `Skipping MDX file "${fullPath}": missing/invalid frontmatter field(s): ${missing.join(', ')}`,
      );
      return null;
    }

    return { slug: realSlug, data, content };
  } catch (e) {
    console.error(`Failed to load MDX file "${fullPath}"`, e);
    return null;
  }
}
