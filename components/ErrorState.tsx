'use client';

import Link from 'next/link';
import { RotateCw, ArrowLeft } from 'lucide-react';
import MessagePage from '@/components/MessagePage';

/**
 * Segment-level error boundary copy: headline, a "Try again" button wired to
 * `retry`, and a back link. Each route's `error.tsx` supplies the copy and
 * keeps its own `console.error(error)`.
 */
export default function ErrorState({
  title,
  message,
  backHref,
  backLabel,
  retry,
}: {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
  retry: () => void;
}) {
  return (
    <MessagePage display="Oops" title={title} message={message}>
      <button onClick={retry} className="pill-solid">
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
