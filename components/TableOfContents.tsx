'use client';

import { useEffect, useRef, useState } from 'react';
import { activeHeading, type Heading } from '@/lib/markdown';

// Headings land at scroll-mt-24 (96px); the extra 8px keeps the one just
// jumped to current.
const LINE = 104;

/** Contents rail pinned beside a post from lg, marking the section in view. */
export default function TableOfContents({ items }: { items: Heading[] }) {
  const [active, setActive] = useState(-1);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;
    const measure = () => {
      ticking = false;
      const tops = items.map(
        (item) =>
          document.getElementById(item.id)?.getBoundingClientRect().top ??
          Infinity,
      );
      const page = document.documentElement;
      const atBottom =
        window.scrollY + window.innerHeight >= page.scrollHeight - 2;
      setActive(activeHeading(tops, LINE, atBottom));
    };
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [items]);

  // Keep the current entry in view by scrolling the rail, never the page.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelectorAll('a')[active];
    if (!nav || !link) return;
    const view = nav.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    if (box.top < view.top) nav.scrollTop -= view.top - box.top;
    else if (box.bottom > view.bottom)
      nav.scrollTop += box.bottom - view.bottom;
  }, [active]);

  return (
    <aside className="hidden lg:block lg:col-start-1 lg:row-start-1 lg:justify-self-end lg:pt-40 lg:pb-20">
      <nav
        ref={navRef}
        aria-label="Table of contents"
        className="surface sticky top-28 w-48 max-h-[calc(100dvh-8rem)] overflow-y-auto p-5"
      >
        <p className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Contents
        </p>
        <ol className="mt-4 space-y-1">
          {items.map((item, i) => (
            <li
              key={`${item.id}-${i}`}
              className={item.depth === 3 ? 'ml-5' : ''}
            >
              <a
                href={`#${item.id}`}
                aria-current={i === active ? 'location' : undefined}
                className="block border-l-2 border-transparent py-1 pl-3 text-sm text-gray-600 transition-colors hover:text-accent-text aria-[current=location]:border-accent aria-[current=location]:text-gray-900 dark:text-gray-400 dark:aria-[current=location]:text-white"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
