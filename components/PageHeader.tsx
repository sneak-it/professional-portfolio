import type { ReactNode } from 'react';

/**
 * Animated page title + optional subtitle. `align`: centered or left.
 * `action` floats on the title's line, so a control costs no vertical space.
 */
export default function PageHeader({
  title,
  description,
  align = 'center',
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  action?: ReactNode;
}) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'text-center' : ''} mb-16`}>
      <div className="relative mb-4">
        <h1 className="enter-up heading-legible text-4xl md:text-5xl font-display font-bold tracking-tight">
          {title}
        </h1>
        {/* z-40: the -translate makes the wrapper a stacking context, so a
            dropdown inside it cannot rise above later content on its own. */}
        {action && (
          <div className="absolute right-0 top-1/2 z-40 -translate-y-1/2 text-left">
            {action}
          </div>
        )}
      </div>
      {description && (
        <p
          style={{ animationDelay: '100ms' }}
          className={`enter-up heading-legible text-lg text-gray-600 dark:text-gray-400 max-w-2xl ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
