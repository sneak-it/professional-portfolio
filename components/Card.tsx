import type { ReactNode } from 'react';
import Surface from '@/components/Surface';
import { PROSE, PROSE_CODE } from '@/lib/prose';

/** Project-page panel: `<Card title="..." checks>`. `checks` marks its list items with check icons. */
export default function Card({
  title,
  checks,
  children,
}: {
  title?: string;
  checks?: boolean;
  children?: ReactNode;
}) {
  return (
    <Surface padding="md" className="enter-up">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div
        className={`${PROSE} ${PROSE_CODE} ${checks ? 'checks' : ''} [&>:first-child]:mt-0 [&>:last-child]:mb-0`}
      >
        {children}
      </div>
    </Surface>
  );
}

/** Cards side by side from `md`; a lone or odd last card spans the row. */
export function CardRow({ children }: { children?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 [&>:last-child:nth-child(odd)]:col-span-full [&>:nth-child(even)]:[animation-delay:200ms]">
      {children}
    </div>
  );
}
