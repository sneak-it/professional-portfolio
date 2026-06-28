'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ErrorState';

// Segment-level boundary: a single malformed MDX post degrades gracefully here
// instead of bubbling up and taking down the rest of the site.
export default function BlogPostError({
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
      title="This post couldn't be loaded."
      message="Something went wrong while rendering this article. You can try again or browse the rest of the blog."
      backHref="/blog"
      backLabel="Back to blog"
      reset={reset}
    />
  );
}
