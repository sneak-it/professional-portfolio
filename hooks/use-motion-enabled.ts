'use client';

import { useIsMobile, useMediaQuery } from '@/hooks/use-mobile';

/**
 * Animation capability tier, consulted by every animated surface.
 *
 * - `none` → reduced motion: static fallbacks.
 * - `lite` → mobile: static background, no parallax/magnetic, smaller blur.
 * - `full` → desktop: everything on.
 */
export type MotionTier = 'none' | 'lite' | 'full';

export function useMotionEnabled(): { tier: MotionTier } {
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useIsMobile();

  if (prefersReduced) {
    return { tier: 'none' };
  }

  return { tier: isMobile ? 'lite' : 'full' };
}
