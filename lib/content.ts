import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './frontmatter.ts';
import { safeSlug } from './slug.ts';

/**
 * Shared MDX plumbing for lib/mdx.ts and lib/portfolio.ts: one dir listing and
 * one read/parse (with its traversal guard and try/catch) behind both.
 */

export interface MdxFile {
  slug: string;
  data: Record<string, unknown>;
  content: string;
}

export interface ReadMdxOptions {
  /**
   * Frontmatter keys that must be non-empty strings; a file missing any is
   * logged and skipped, rather than rendering blank alt text or breaking date
   * sorting. Frontmatter is cast elsewhere, so this is the one guard that runs.
   */
  required?: string[];
}

/**
 * Slugs (filenames minus `.mdx`) in a content dir, or `[]` if it doesn't exist.
 * Filtering to `.mdx` keeps editor backups and `drafts/` out of the listings,
 * and slugs feed straight into `readMdxFile`.
 */
export function listMdxSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => path.basename(file, '.mdx'));
}

/**
 * Reads one MDX file by slug. Returns `null` if the slug is unsafe (traversal
 * guard), the file is missing, or the read/parse throws — one bad file can't
 * take down a listing, and callers filter out the null.
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

/** A frontmatter array, else []: unchecked input must not throw at render. */
export function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** String entries of a frontmatter list; non-strings dropped, not coerced. */
export function strings(value: unknown): string[] {
  return list<unknown>(value).filter((v): v is string => typeof v === 'string');
}

/** A non-empty frontmatter string, else `fallback`. */
export function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}
