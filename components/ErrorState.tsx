'use client';

import Link from 'next/link';
import { RotateCw, ArrowLeft } from 'lucide-react';
import MessagePage from '@/components/MessagePage';

/**
 * Segment-level error boundary copy: the "Oops" display headline, a "Try again"
 * button wired to the boundary's `reset`, and a contextual back link. Each
 * route's `error.tsx` keeps its own `console.error(error)` effect and just
 * supplies the copy + back target.
 */
export default function ErrorState({
  title,
  message,
  backHref,
  backLabel,
  reset,
}: {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
  reset: () => void;
}) {
  return (
    <MessagePage display="Oops" title={title} message={message}>
      <button onClick={reset} className="pill-solid">
        <RotateCw size={18} />
        Try again
      </button>
      <Link href={backHref} className="pill-outline">
        <ArrowLeft size={18} />
        {backLabel}
      </Link>
    </MessagePage>
  );
}
