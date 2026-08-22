import type { ReactNode } from 'react';

/**
 * Circular icon chip for the about and contact pages. Color/size are static
 * lookups so Tailwind can see the full class names.
 */
const COLORS = {
  primary: 'bg-accent/10 dark:bg-accent/20 text-accent',
  secondary: 'bg-accent-2/10 dark:bg-accent-2/20 text-accent-2',
} as const;

const SIZES = {
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
} as const;

export default function IconBadge({
  color = 'primary',
  size = 'md',
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
