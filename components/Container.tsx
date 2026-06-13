import type { ReactNode } from 'react';

/**
 * Page shell: centers content and applies the standard horizontal + vertical
 * page padding repeated across every route. `size` picks the max width.
 */
const SIZES = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
} as const;

type Tag = 'div' | 'article' | 'section' | 'main';

export default function Container({
  size = 'xl',
  as: Tag = 'div',
  className = '',
  children,
}: {
  size?: keyof typeof SIZES;
  as?: Tag;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={`${SIZES[size]} mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 ${className}`}
    >
      {children}
    </Tag>
  );
}
