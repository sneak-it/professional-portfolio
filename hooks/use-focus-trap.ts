'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab focus within `ref` while `active`, moving focus in on activation
 * and restoring it on deactivation. Used by the gallery lightbox.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const first = container.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
      if (first) first.focus();
      else container.focus();
    };
    focusFirst();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active]);

  return ref;
}
