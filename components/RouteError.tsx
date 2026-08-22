'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ErrorState';

/**
 * Shared route-level error boundary, re-exported by each segment's
 * `error.tsx`.
 */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
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
      retry={retry}
    />
  );
}
