/**
 * Newest-first comparator on a `date` field, shared by the blog and portfolio
 * data layers.
 *
 *   items.sort(byDateDesc)
 *   posts.sort((a, b) => byDateDesc(a.meta, b.meta))  // date under .meta
 *
 * Parsed with `Date.parse()`, so `2026-4-26` orders correctly. Missing and
 * unparseable dates sort last; equal dates return 0.
 */
export function byDateDesc<T extends { date?: string }>(a: T, b: T): number {
  const ta = parseTime(a.date);
  const tb = parseTime(b.date);
  if (ta === tb) return 0;
  return ta > tb ? -1 : 1;
}

function parseTime(value: string | undefined): number {
  if (value) {
    const t = Date.parse(value);
    if (!Number.isNaN(t)) return t;
  }
  // Undated / invalid content sorts last (oldest) without producing NaN.
  return -Infinity;
}
