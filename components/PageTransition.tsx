// ViewTransition is canary-only; see the note in app/layout.tsx.
/// <reference types="react/canary" />
'use client';

import type { ReactNode } from 'react';
import { useState, ViewTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const depth = (path: string) => path.split('/').filter(Boolean).length;
const pathOf = (url: string) => url.split('?')[0] ?? url;

// Sibling navigation (prev/next post) slides instead of zooming. Keyed by
// target path, so a re-render can't consume the direction meant for another.
let slide: { path: string; cls: string } | null = null;

export function slideTo(path: string, dir: 'prev' | 'next') {
  slide = { path, cls: `page-slide-${dir}` };
}

function transitionClass(from: string, to: string): string {
  const target = pathOf(to);
  if (pathOf(from) === target) return 'page-fade';
  if (slide?.path === target) return slide.cls;
  // Zoom direction from path depth: going up a level reverses it, so no Link
  // needs `transitionTypes`. Animations in globals.css.
  return depth(target) < depth(pathOf(from)) ? 'page-back' : 'page-forward';
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const query = useSearchParams().toString();
  const pathname = usePathname();
  const url = query ? `${pathname}?${query}` : pathname;

  // Render-phase update: the class lands before React commits the transition.
  const [nav, setNav] = useState({ url, cls: 'page-forward' });
  if (nav.url !== url) {
    setNav({ url, cls: transitionClass(nav.url, url) });
  }

  // Keep the div: React names host children by position, so the wrapper pins
  // each page to a stable index across navigations.
  return (
    <ViewTransition default={nav.cls}>
      <div>{children}</div>
    </ViewTransition>
  );
}
