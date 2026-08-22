/**
 * Shared motion presets, spread into an `m.*` element. Add a `transition` for
 * per-element timing:
 *
 *   <m.div {...fadeInUp} transition={{ delay: 0.1 }} />
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
} as const;

/** Fade up once the element scrolls into view. */
export const fadeInUpOnView = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
} as const;

/** Scale + fade in (used for cards and grid items). */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
} as const;
