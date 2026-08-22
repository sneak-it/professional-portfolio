/**
 * Sanitizes a content slug before it reaches a filesystem path: strips one
 * trailing `.mdx`, accepts only letters, digits, hyphens, and underscores.
 * Returns the normalized slug, or `null` if it is unsafe.
 */
export function safeSlug(slug: string): string | null {
  const realSlug = slug.replace(/\.mdx$/, '');
  return /^[a-zA-Z0-9_-]+$/.test(realSlug) ? realSlug : null;
}

/**
 * A display string as a URL slug: lowercase, non-alphanumerics collapsed to a
 * single hyphen, ends trimmed. Shared by tag URLs and heading anchors. May
 * return `''`.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
