/**
 * Human-readable rendering for the ISO dates in MDX frontmatter.
 *
 * `timeZone: 'UTC'` is load-bearing: `new Date('2026-06-20')` parses as UTC
 * midnight, and any zone west of UTC prints the 19th. Locale matches the
 * `lang="en"` / `locale: 'en_US'` in app/layout.tsx.
 */
const FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

/** Formats an ISO date, or returns the input unchanged if it isn't one. */
export function formatDate(iso: string): string {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : FORMATTER.format(parsed);
}

/** Parses an ISO frontmatter date, or `undefined` if missing/unparseable. */
export function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
