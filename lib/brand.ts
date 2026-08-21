/**
 * Palette values mirrored out of CSS for consumers that cannot read custom
 * properties: the `next/og` routes under app/brand/ (which render outside the
 * document), the `viewport` metadata export, and the lib/site.ts version token.
 *
 * `app/globals.css` is the source of truth; this is one file pair to keep in
 * sync instead of the four copies it replaces. `--accent` and `--accent-2` are
 * deliberately absent: nothing outside CSS consumes them, and an unused copy is
 * one more thing to drift.
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

/**
 * Page background per theme, mirrored from `--background` in app/globals.css.
 * Read by the `viewport` themeColor export.
 *
 * `--background` rather than `--background-deep`: browser chrome sits against
 * the body, which is `bg-background` (see app/layout.tsx). In dark mode the deep
 * token is #050505, which would visibly mismatch the #0f1115 body.
 */
export const BACKGROUND = {
  light: '#f5f5f5', // :root --background
  dark: '#0f1115', // .dark  --background
} as const;
