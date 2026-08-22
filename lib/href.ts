/**
 * Scheme allowlist for MDX links, parsed with the URL parser so tab, newline,
 * and case variants normalise first (`java\nscript:` → `javascript:`). The
 * base resolves relative hrefs and fragments to `https:`.
 */
export function isSafeHref(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  try {
    const { protocol } = new URL(href, 'https://relative.invalid');
    return (
      protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:'
    );
  } catch {
    return false;
  }
}
