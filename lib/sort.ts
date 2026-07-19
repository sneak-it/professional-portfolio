/**
 * Comparator for sorting items newest-first by a `date` field. Shared by the
 * blog and portfolio data layers so both order content the same way.
 *
 *   items.sort(byDateDesc)            // items shaped like { date: string }
 *   posts.sort((a, b) => byDateDesc(a.meta, b.meta))  // date nested under .meta
 *
 * Dates are parsed via `Date.parse()` so non-zero-padded values like
 * `2026-4-26` order correctly (a naive string compare puts them in the wrong
 * place). Missing or unparseable dates sort last, deterministically, and equal
 * dates return 0 to honor the comparator contract.
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
