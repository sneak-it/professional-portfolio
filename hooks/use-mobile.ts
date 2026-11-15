'use client';

import * as React from 'react';

// Tailwind's md breakpoint, so this agrees with md: classes at any default
// font size.
const MOBILE_QUERY = '(width < 48rem)';

/** Live result of a CSS media query; false on the server. */
export function useMediaQuery(query: string) {
  const matches = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;
  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => {
        mql.removeEventListener('change', onChange);
      };
    },
    matches,
    matches, // SSR fallback
  );
}

export function useIsMobile() {
  return useMediaQuery(MOBILE_QUERY);
}
