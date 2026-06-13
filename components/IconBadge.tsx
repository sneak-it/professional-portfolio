import type { ReactNode } from 'react';

/**
 * Circular (or rounded) icon chip used in the resume, about, and contact
 * pages. Color/size are static lookups so Tailwind can see the full class
 * names (dynamically built `bg-${color}-100` strings would be purged).
 */
const COLORS = {
  orange: 'bg-orange-100 dark:bg-orange-500/20 text-orange-500',
  purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-500',
  pink: 'bg-pink-100 dark:bg-pink-500/20 text-pink-500',
} as const;

const SIZES = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
} as const;

export default function IconBadge({
  color = 'orange',
  size = 'sm',
  shape = 'full',
  className = '',
  children,
}: {
  color?: keyof typeof COLORS;
  size?: keyof typeof SIZES;
  shape?: 'full' | 'xl';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${SIZES[size]} ${
        shape === 'full' ? 'rounded-full' : 'rounded-xl'
      } ${COLORS[color]} flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}
