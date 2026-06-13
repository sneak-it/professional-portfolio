'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/**
 * Consistent scroll-into-view reveal. A single source of stagger/timing so
 * sections don't each hand-roll their own `whileInView`. Reduced motion is
 * handled globally via <MotionConfig reducedMotion="user">, which strips the
 * y-transform and leaves a plain opacity fade.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
