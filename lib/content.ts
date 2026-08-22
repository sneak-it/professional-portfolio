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

/**
 * Parsed files by path, invalidated on mtime change. Uncapped: a key needs a
 * real `.mdx` file. `data` is shared across requests, so treat it read-only.
 */
const parseCache = new Map<
  string,
  { mtimeMs: number; data: Record<string, unknown>; content: string }
>();

export interface ReadMdxOptions {
  /**
   * Frontmatter keys that must be non-empty strings; a file missing any is
   * logged and skipped. The only guard, since frontmatter is cast elsewhere.
   */
  required?: string[];
}

/**
 * Entries of a content dir, or `[]` if absent (a designed state, so quiet).
 * Every other error is logged; EACCES means an unreadable bind mount.
 */
export function listDir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Cannot read content dir "${dir}"`, e);
    }
    return [];
  }
}

/**
 * Slugs (filenames minus `.mdx`) in a content dir, or `[]`. The `.mdx` filter
 * keeps editor backups and `drafts/` out; slugs feed `readMdxFile`.
 */
export function listMdxSlugs(dir: string): string[] {
  return listDir(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => path.basename(file, '.mdx'));
}

/**
 * Reads one MDX file by slug. `null` for an unsafe slug, a missing file, or a
 * failed parse, so one bad file can't take down a listing.
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
    // In the try: an unreadable file lands on the catch below.
    const { mtimeMs } = fs.statSync(fullPath);
    let entry = parseCache.get(fullPath);
    if (entry?.mtimeMs !== mtimeMs) {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      entry = { mtimeMs, ...parseFrontmatter(fileContents) };
      parseCache.set(fullPath, entry);
    }
    const { data, content } = entry;

    // Outside the cache: `required` varies per call, the parse does not.
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

/**
 * `draft: true`, or a `date` still in the future, keeps a file out of every
 * listing. A missing or unparseable date is not a draft.
 */
export function isDraft(data: Record<string, unknown>): boolean {
  if (data.draft === true) return true;
  const at = Date.parse(typeof data.date === 'string' ? data.date : '');
  return Number.isFinite(at) && at > Date.now();
}

/**
 * Every readable, non-draft `.mdx` file in a dir. Single-item lookups call
 * `readMdxFile` directly, which leaves drafts reachable for preview.
 */
export function listMdxFiles(
  dir: string,
  options: ReadMdxOptions = {},
): MdxFile[] {
  return listMdxSlugs(dir)
    .map((slug) => readMdxFile(dir, slug, options))
    .filter((file): file is MdxFile => file !== null)
    .filter((file) => !isDraft(file.data));
}

/** A frontmatter array, else []: unchecked input must not throw at render. */
export function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** String entries of a frontmatter list; non-strings dropped. */
export function strings(value: unknown): string[] {
  return list<unknown>(value).filter((v): v is string => typeof v === 'string');
}

/** A non-empty frontmatter string, else `fallback`. */
export function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}
