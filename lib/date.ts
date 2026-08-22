/**
 * Human-readable rendering for the ISO dates in MDX frontmatter.
 *
 * `timeZone: 'UTC'` is load-bearing: `new Date('2026-06-20')` is parsed as UTC
 * midnight, so formatting it in any zone west of UTC would print the 19th.
 *
 * Locale is fixed to match the hardcoded `lang="en"` and `locale: 'en_US'` in
 * app/layout.tsx; making all three configurable is one change, not this one.
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
