'use client';

import * as React from 'react';

// Tailwind's md breakpoint, so this agrees with md: classes at any default
// font size.
const MOBILE_QUERY = '(width < 48rem)';

function getIsMobile() {
  return (
    typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(MOBILE_QUERY);
      mql.addEventListener('change', onChange);
      return () => {
        mql.removeEventListener('change', onChange);
      };
    },
    getIsMobile,
    getIsMobile, // SSR fallback
  );
}
