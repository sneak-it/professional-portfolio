'use client';

import type { ReactNode } from 'react';
import { m } from 'motion/react';
import { fadeInUp } from '@/lib/motion';

/**
 * Animated page title + optional subtitle, repeated near-verbatim across
 * routes. `align` toggles the centered (default) vs left-aligned variant.
 */
export default function PageHeader({
  title,
  description,
  align = 'center',
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'text-center' : ''} mb-16 ${className}`}>
      <m.h1
        {...fadeInUp}
        className="heading-legible text-4xl md:text-5xl font-display font-bold tracking-tight mb-4"
      >
        {title}
      </m.h1>
      {description && (
        <m.p
          {...fadeInUp}
          transition={{ delay: 0.1 }}
          className={`heading-legible text-lg text-gray-600 dark:text-gray-400 max-w-2xl ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {description}
        </m.p>
      )}
    </div>
  );
}
