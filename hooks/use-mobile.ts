import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

function getIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      mql.addEventListener('change', onChange);
      return () => { mql.removeEventListener('change', onChange); };
    },
    getIsMobile,
    getIsMobile, // SSR fallback
  );
}
