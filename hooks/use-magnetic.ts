'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

/**
 * Magnetic "pull toward cursor" effect. Returns a ref to attach to the target
 * and spring-smoothed x/y motion values to spread into its `style`.
 * Active only on the `full` tier (desktop + motion allowed); a no-op on touch
 * and under reduced motion, where x/y stay pinned at 0.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const { tier } = useMotionEnabled();
  const enabled = tier === 'full';
  const ref = useRef<T>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 15, mass: 0.3 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    if (!enabled) {
      x.set(0);
      y.set(0);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      x.set(relX * strength);
      y.set(relY * strength);
    };
    const handleLeave = () => {
      x.set(0);
      y.set(0);
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [enabled, strength, x, y]);

  return { ref, style: { x: springX, y: springY } };
}
