/**
 * Accent hexes for the `next/og` routes.
 *
 * `app/globals.css` is the source of truth for the palette; `next/og` renders
 * outside the document and cannot read CSS custom properties, so these three
 * stops are mirrored here. That is one file pair to keep in sync instead of the
 * four copies this replaces. `--accent` and `--accent-2` are deliberately absent:
 * nothing outside CSS consumes them, and an unused copy is one more thing to
 * drift.
 */
export const ACCENT = {
  from: '#ffb400', // --accent-from, amber gold
  via: '#ff6b3d', // --accent-via, vivid coral
  to: '#ff1e78', // --accent-to, hot rose-magenta
} as const;

/** Monogram tile fill, shared by the apple icon and the OG card. */
export const ACCENT_DIAGONAL = `linear-gradient(135deg, ${ACCENT.from} 0%, ${ACCENT.to} 100%)`;

/** Full-width rule across the foot of the OG card. */
export const ACCENT_BAR = `linear-gradient(90deg, ${ACCENT.from}, ${ACCENT.via}, ${ACCENT.to})`;
