'use client';

import { useEffect } from 'react';

// global-error replaces the root layout entirely, so it must render its own
// <html>/<body> and cannot rely on the app's fonts, theme, or global CSS.
// Styling is kept inline to guarantee a usable fallback even when the layout fails.
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          background: '#0f1115',
          color: '#f5f5f5',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
          Something went wrong.
        </h1>
        <p style={{ color: '#9ca3af', maxWidth: '32rem', margin: 0 }}>
          A critical error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            border: 'none',
            background: '#f5f5f5',
            color: '#0f1115',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
