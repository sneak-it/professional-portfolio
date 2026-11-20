/**
 * The SITE_THEME accents (lib/themes.ts) and page backgrounds, for consumers
 * that cannot read custom properties: the app/brand/ `next/og` routes, the
 * `viewport` export, and the lib/site.ts version token.
 */
import { theme } from './site-env.ts';
import { THEMES, type Theme } from './themes.ts';

export const THEME: Theme = THEMES[theme()];

export const ACCENT = {
  from: THEME['--accent-from'],
  via: THEME['--accent-via'],
  to: THEME['--accent-to'],
} as const;

/** Monogram tile fill, shared by the apple icon and the OG card. */
export const ACCENT_DIAGONAL = `linear-gradient(135deg, ${ACCENT.from} 0%, ${ACCENT.to} 100%)`;

/** Full-width rule across the foot of the OG card. */
export const ACCENT_BAR = `linear-gradient(90deg, ${ACCENT.from}, ${ACCENT.via}, ${ACCENT.to})`;

/**
 * Page background per mode, mirrored from `--background` in app/globals.css
 * and read by the `viewport` themeColor export. Tracks `--background` because
 * browser chrome sits against the body (`bg-background`, app/layout.tsx).
 */
export const BACKGROUND = {
  light: '#f5f5f5', // :root --background
  dark: '#0f1115', // .dark  --background
} as const;
