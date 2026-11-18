'use client';

import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme } = useTheme();

  // The new theme spreads in a circle from the button (theme-reveal in
  // globals.css). flushSync applies it before the view transition's snapshot.
  const toggle = (button: HTMLButtonElement) => {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    // Spins the icons, not the bordered button. WAAPI ignores the CSS reduced-motion
    // backstop, so check it here.
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const icon of button.children) {
        icon.animate(
          { transform: ['rotate(0)', 'rotate(360deg)'] },
          { duration: 300, easing: 'ease' },
        );
      }
    }
    const commit = () => {
      flushSync(() => {
        setTheme(next);
      });
    };
    if (!('startViewTransition' in document)) {
      commit();
      return;
    }
    const { left, top, width, height } = button.getBoundingClientRect();
    root.style.setProperty('--vt-x', `${String(left + width / 2)}px`);
    root.style.setProperty('--vt-y', `${String(top + height / 2)}px`);
    root.classList.add('theme-switch');
    void document.startViewTransition(commit).finished.finally(() => {
      root.classList.remove('theme-switch');
    });
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        toggle(e.currentTarget);
      }}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-background text-gray-600 transition-colors hover:bg-gray-200 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
