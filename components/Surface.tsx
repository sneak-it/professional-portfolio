import type { ReactNode } from 'react';

/**
 * Frosted-glass reading panel: lifts long-form / body text off the animated
 * topographic background so it stays legible. The visual lives in the
 * `.surface` utility (app/globals.css); this component just adds the standard
 * inner padding and forwards `className` / `as`, mirroring Container's shape.
 */
const PADDING = {
  sm: 'p-6 md:p-8',
  md: 'p-8 md:p-10',
  lg: 'p-8 md:p-12',
} as const;

type Tag = 'div' | 'article' | 'section';

export default function Surface({
  padding = 'md',
  as: Tag = 'div',
  className = '',
  children,
}: {
  padding?: keyof typeof PADDING;
  as?: Tag;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`surface ${PADDING[padding]} ${className}`}>{children}</Tag>
  );
}
