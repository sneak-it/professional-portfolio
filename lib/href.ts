/**
 * Scheme allowlist for MDX links. Parsed rather than pattern-matched because the
 * URL parser strips the tabs, newlines, and case tricks that defeat a regex
 * (`java\nscript:` and `JavaScript:` both normalise to `javascript:`). The base
 * resolves relative hrefs and fragments to `https:`, so those stay allowed.
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
