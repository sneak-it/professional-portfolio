import { Children, isValidElement, type ReactNode } from 'react';

// One column on phones, two on tablets, then one per tile up to four.
const COLUMNS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

/** Headline numbers for MDX bodies: `<Stats><Stat value label note /></Stats>`. */
export default function Stats({ children }: { children?: ReactNode }) {
  const count = Children.toArray(children).filter(isValidElement).length;
  return (
    <dl
      className={`not-prose my-8 grid gap-4 ${COLUMNS[Math.min(count, 4)] ?? ''}`}
    >
      {children}
    </dl>
  );
}

/** One tile. `value` renders as written, so `~200` and `1.25M+` work. */
export function Stat({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="card-surface flex flex-col p-6">
      <dt className="mt-1 text-gray-600 dark:text-gray-300">{label}</dt>
      <dd className="order-first text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {value}
      </dd>
      {note && (
        <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {note}
        </dd>
      )}
    </div>
  );
}
