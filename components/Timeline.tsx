import type { ReactNode } from 'react';

/**
 * Vertical timeline for MDX bodies. `.prose` rules outrank plain utilities, so
 * item styles come from the parent via child selectors, as in Callout.
 */
export default function Timeline({ children }: { children?: ReactNode }) {
  return (
    <ol className="ps-0 [&>li]:my-0 [&>li]:list-none [&>li]:border-s [&>li]:border-gray-200 [&>li]:ps-6 dark:[&>li]:border-white/15">
      {children}
    </ol>
  );
}

/**
 * One entry; children are optional Markdown under the title. Named
 * `Milestone` because `Event` would shadow the DOM global.
 */
export function Milestone({
  date,
  title,
  children,
}: {
  date: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <li className="relative pb-8 last:pb-0">
      <span
        aria-hidden
        className="absolute -start-[5.5px] top-[5px] size-2.5 rounded-full bg-accent"
      />
      <p className="not-prose text-sm text-gray-500 dark:text-gray-400">
        {date}
      </p>
      <p className="not-prose text-gray-900 dark:text-white">{title}</p>
      {children && (
        <div className="mt-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      )}
    </li>
  );
}
