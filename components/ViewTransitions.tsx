'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type DocWithVT = Document & {
  startViewTransition?: (cb: () => Promise<void> | void) => unknown;
};

/**
 * Wraps client-side route navigations in the native View Transitions API so
 * route changes cross-fade (see ::view-transition rules in globals.css).
 *
 * Implementation: a capture-phase click listener intercepts internal-link
 * clicks before next/link's own handler runs (preventDefault makes Link bail),
 * then drives navigation inside document.startViewTransition(). The transition
 * promise resolves once the pathname commits. Browsers without the API (or
 * users with reduced motion) get a plain navigation / cut — graceful fallback.
 */
export default function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const finishRef = useRef<(() => void) | null>(null);

  // Resolve on path AND query change — query-only navs (e.g. ?page=2) commit
  // without a pathname change and would otherwise hang until the safety timeout.
  useEffect(() => {
    if (finishRef.current) {
      finishRef.current();
      finishRef.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const doc = document as DocWithVT;
    // Bind to doc so the extracted method keeps its `this`.
    const startViewTransition = doc.startViewTransition?.bind(doc);
    if (!startViewTransition) return;

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (
        !href ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Not every same-origin path is an app route. A link to a file under
      // public/ (/resume.pdf, /images/x.png) or to /api/* would be pushed
      // through the router and land on the 404 page instead of the resource.
      // Slugs are [A-Za-z0-9_-]+ (see lib/slug.ts), so no real route has a dot.
      if (/\.[^/]+$/.test(url.pathname) || url.pathname.startsWith('/api/')) {
        return;
      }
      // Same page (in-page anchor or no-op) — let the browser handle it.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      e.preventDefault();
      startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            finishRef.current = resolve;
            router.push(url.pathname + url.search + url.hash);
            // Safety: never leave the transition hanging if the route
            // change doesn't trigger the pathname effect.
            setTimeout(() => {
              if (finishRef.current === resolve) {
                finishRef.current = null;
                resolve();
              }
            }, 800);
          }),
      );
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, [router]);

  return null;
}
