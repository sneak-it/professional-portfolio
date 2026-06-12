/**
 * Sanitizes a content slug (typically a route param) before it is used to
 * build a filesystem path. Strips a trailing `.mdx` and rejects anything
 * that isn't a plain slug — letters, digits, hyphens, underscores — so a
 * crafted value like `../../etc/passwd` can never escape the content
 * directory. Returns the normalized slug, or `null` if it is unsafe.
 */
export function safeSlug(slug: string): string | null {
  const realSlug = slug.replace(/\.mdx$/, '');
  return /^[a-zA-Z0-9_-]+$/.test(realSlug) ? realSlug : null;
}
