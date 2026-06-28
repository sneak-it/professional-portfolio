'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ErrorState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for server-side log aggregation.
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
