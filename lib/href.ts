const BASE = 'https://relative.invalid';

/**
 * Scheme allowlist for MDX links, parsed with the URL parser so tab, newline,
 * and case variants normalise first (`java\nscript:` → `javascript:`). The
 * base resolves relative hrefs and fragments to `https:`.
 */
export function isSafeHref(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  try {
    const { protocol } = new URL(href, BASE);
    return (
      protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:'
    );
  } catch {
    return false;
  }
}

/** A safe href that leaves this site, however it is spelled (`//`, `/\`). */
export function isExternalHref(href: string): boolean {
  const { protocol, host } = new URL(href, BASE);
  return protocol !== 'mailto:' && host !== 'relative.invalid';
}
