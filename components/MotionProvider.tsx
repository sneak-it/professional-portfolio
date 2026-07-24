'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';

// Client boundary for motion: LazyMotion loads the domAnimation bundle lazily.
// Lives here (not the server layout) because the loader is a function prop.
// `strict` makes any stray `motion.*` throw in dev.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion
      features={() => import('@/lib/motion-features').then((m) => m.default)}
      strict
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
