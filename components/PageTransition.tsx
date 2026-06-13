import type { ReactNode } from 'react';

/**
 * Route transitions are now handled by the native View Transitions API
 * (see components/ViewTransitions.tsx + ::view-transition rules in globals.css),
 * which cross-fades the full page and captures the new route fully rendered.
 *
 * This wrapper is retained as a no-op passthrough so the ~10 page components
 * that import it don't need to change; per-page entrance motion now lives on
 * the individual elements (headings, hero, cards). Remove the wrapper from
 * call sites at leisure.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
