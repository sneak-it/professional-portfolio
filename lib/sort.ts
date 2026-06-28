/**
 * Comparator for sorting items newest-first by an ISO/`YYYY-MM-DD` `date`
 * field. Shared by the blog and portfolio data layers so both order content
 * the same way.
 *
 *   items.sort(byDateDesc)            // items shaped like { date: string }
 *   posts.sort((a, b) => byDateDesc(a.meta, b.meta))  // date nested under .meta
 */
export function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return a.date > b.date ? -1 : 1;
}
