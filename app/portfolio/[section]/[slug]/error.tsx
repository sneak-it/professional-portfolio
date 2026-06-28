'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ErrorState';

// Segment-level boundary: a single broken portfolio item (e.g. an unreadable
// image or malformed metadata) degrades gracefully here rather than failing the
// whole section.
export default function PortfolioItemError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="This item couldn't be loaded."
      message="Something went wrong while rendering this page. You can try again or browse the rest of the portfolio."
      backHref="/portfolio"
      backLabel="Back to Portfolio"
      reset={reset}
    />
  );
}
