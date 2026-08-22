'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';

// Client boundary for motion: LazyMotion lazy-loads domAnimation, and the
// function prop is why this is its own file. `strict` throws on `motion.*`.
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
