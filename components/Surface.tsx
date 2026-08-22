import type { ReactNode } from 'react';

/**
 * Frosted-glass reading panel that keeps body text legible over the animated
 * background. The visual is the `.surface` utility (app/globals.css); this adds
 * the standard inner padding and forwards `className` / `as`.
 */
const PADDING = {
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
