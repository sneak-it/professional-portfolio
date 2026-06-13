'use client';

import { useReducedMotion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Animation capability tier — a single source of truth that every animated
 * surface consults so we can be lavish on a capable desktop and lean on a
 * phone or for a motion-averse user, without forking the design.
 *
 * - `none` → user prefers reduced motion: static fallbacks, no animation.
 * - `lite` → mobile: reduced effect budget (static background, no parallax/
 *            magnetic, smaller blur).
 * - `full` → desktop: everything on.
 */
export type MotionTier = 'none' | 'lite' | 'full';

export function useMotionEnabled(): {
  motionEnabled: boolean;
  tier: MotionTier;
} {
  // motion's useReducedMotion returns null until mounted, then a boolean.
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  if (prefersReduced) {
    return { motionEnabled: false, tier: 'none' };
  }

  return { motionEnabled: true, tier: isMobile ? 'lite' : 'full' };
}
