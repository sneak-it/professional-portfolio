// ViewTransition is canary-only; see the note in app/layout.tsx.
/// <reference types="react/canary" />
'use client';

import type { ReactNode } from 'react';
import { useState, ViewTransition } from 'react';
import { usePathname } from 'next/navigation';

const depth = (path: string) => path.split('/').filter(Boolean).length;

// Sibling navigation (prev/next post) slides instead of zooming. Keyed by
// target path, so a re-render can't consume the direction meant for another.
let slide: { path: string; cls: string } | null = null;

export function slideTo(path: string, dir: 'prev' | 'next') {
  slide = { path, cls: `page-slide-${dir}` };
}

// Zoom direction from path depth: going up a level reverses it, so no Link
// needs `transitionTypes`. Animations in globals.css.
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Render-phase update: the class lands before React commits the transition.
  const [nav, setNav] = useState({ path: pathname, cls: 'page-forward' });
  if (nav.path !== pathname) {
    setNav({
      path: pathname,
      cls:
        slide?.path === pathname
          ? slide.cls
          : depth(pathname) < depth(nav.path)
            ? 'page-back'
            : 'page-forward',
    });
  }

  // Keep the div: React names host children by position, so the wrapper pins
  // each page to a stable index across navigations.
  return (
    <ViewTransition default={nav.cls}>
      <div>{children}</div>
    </ViewTransition>
  );
}
