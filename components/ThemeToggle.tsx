'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Laptop },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Move focus into the menu when it opens.
  React.useEffect(() => {
    if (!isOpen) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')
      ?.focus();
  }, [isOpen]);

  const close = (restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => {
          setIsOpen((o) => !o);
        }}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-background text-gray-600 transition-colors hover:bg-gray-200 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
        aria-label="Toggle theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Theme"
            aria-orientation="vertical"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
            }}
            className="absolute right-0 mt-2 w-36 rounded-md border border-gray-200 bg-background p-1 shadow-lg dark:border-white/10"
          >
            {OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                role="menuitemradio"
                aria-checked={theme === value}
                onClick={() => {
                  setTheme(value);
                  close();
                }}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-200 dark:hover:bg-white/10 ${
                  theme === value
                    ? 'text-accent'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
