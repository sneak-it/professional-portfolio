'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { activeHeading, type Heading } from '@/lib/markdown';

// Headings land at scroll-mt-24 (96px); the extra 8px keeps the one just
// jumped to current.
const LINE = 104;

/** Scrolls `list` just enough to show its `index`th link, never the page. */
function reveal(list: HTMLElement | null, index: number) {
  const link = list?.querySelectorAll('a')[index];
  if (!list || !link) return;
  const view = list.getBoundingClientRect();
  const box = link.getBoundingClientRect();
  if (box.top < view.top) list.scrollTop -= view.top - box.top;
  else if (box.bottom > view.bottom) list.scrollTop += box.bottom - view.bottom;
}

/** Post contents marking the section in view: a rail from lg, a button below. */
export default function TableOfContents({ items }: { items: Heading[] }) {
  const [active, setActive] = useState(-1);
  const navRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

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

  useEffect(() => {
    reveal(navRef.current, active);
    reveal(popoverRef.current, active);
  }, [active]);

  const contents = (
    <>
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
    </>
  );

  // The button sits outside the nav: the nav's blur would pin it to the rail.
  return (
    <aside className="lg:col-start-1 lg:row-start-1 lg:justify-self-end lg:pt-40 lg:pb-20">
      <nav
        ref={navRef}
        aria-label="Table of contents"
        className="surface sticky top-28 hidden w-48 max-h-[calc(100dvh-8rem)] overflow-y-auto p-5 lg:block"
      >
        {contents}
      </nav>
      <button
        type="button"
        popoverTarget={popoverId}
        className="pill-solid fixed right-4 bottom-4 z-40 px-4 py-2 text-sm md:bottom-16 lg:hidden"
      >
        Contents
      </button>
      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest('a'))
            event.currentTarget.hidePopover();
        }}
        onToggle={(event) => {
          if (event.newState === 'open') reveal(event.currentTarget, active);
        }}
        className="card-surface inset-auto right-4 bottom-16 m-0 w-72 max-w-[calc(100vw-2rem)] max-h-[60dvh] overflow-y-auto p-5 shadow-xl md:bottom-28 lg:hidden"
      >
        {contents}
      </div>
    </aside>
  );
}
