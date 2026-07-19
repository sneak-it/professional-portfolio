'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ErrorState';

/**
 * Shared route-level error boundary. A single generic message is used across
 * every segment so the boundaries stay consistent; individual `error.tsx` files
 * just re-export this.
 */
export default function RouteError({
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
      title="Something went wrong."
      message="An unexpected error occurred while rendering this page. You can try again or head back home."
      backHref="/"
      backLabel="Back home"
      reset={reset}
    />
  );
}
