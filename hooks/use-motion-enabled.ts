'use client';

import { useReducedMotion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Animation capability tier, consulted by every animated surface.
 *
 * - `none` → reduced motion: static fallbacks.
 * - `lite` → mobile: static background, no parallax/magnetic, smaller blur.
 * - `full` → desktop: everything on.
 */
export type MotionTier = 'none' | 'lite' | 'full';

export function useMotionEnabled(): { tier: MotionTier } {
  // motion's useReducedMotion returns null until mounted, then a boolean.
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  if (prefersReduced) {
    return { tier: 'none' };
  }

  return { tier: isMobile ? 'lite' : 'full' };
}
