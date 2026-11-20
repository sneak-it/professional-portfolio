'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { SlideImage } from 'yet-another-react-lightbox';
import { toSlide } from '@/lib/lightbox';

// Fetched on the first open, so a page nobody clicks never loads it.
const ImageLightbox = dynamic(() => import('./ImageLightbox'), { ssr: false });

/**
 * Opens any `LightboxTrigger` in <main>. A page's triggers form one set, in
 * page order; changing route closes it.
 */
export default function PostLightbox() {
  const pathname = usePathname();
  const [state, setState] = useState<{
    slides: SlideImage[];
    index: number;
    path: string;
  } | null>(null);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    const open = (event: MouseEvent) => {
      const trigger = (event.target as Element).closest<HTMLElement>(
        '[data-lightbox]',
      );
      // Modified clicks keep the link's own behavior, such as a new tab.
      if (
        !trigger ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      const triggers = [
        ...main.querySelectorAll<HTMLElement>('[data-lightbox]'),
      ];
      setState({
        slides: triggers.map(({ dataset }) =>
          toSlide({
            src: dataset.src ?? '',
            alt: dataset.alt ?? '',
            width: Number(dataset.width),
            height: Number(dataset.height),
          }),
        ),
        index: triggers.indexOf(trigger),
        path: pathname,
      });
    };
    main.addEventListener('click', open);
    return () => {
      main.removeEventListener('click', open);
    };
  }, [pathname]);

  // Render-phase close on a route change, so coming back doesn't reopen it.
  if (state && state.index >= 0 && state.path !== pathname) {
    setState({ ...state, index: -1 });
  }

  // Stays mounted after the first open, so closing animates and restores focus.
  if (!state) return null;
  return (
    <ImageLightbox
      slides={state.slides}
      index={state.path === pathname ? state.index : -1}
      close={() => {
        setState((s) => s && { ...s, index: -1 });
      }}
    />
  );
}
