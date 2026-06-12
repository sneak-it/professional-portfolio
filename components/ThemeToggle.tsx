'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-[#f5f5f5] text-gray-600 transition-colors hover:bg-gray-200 dark:border-white/10 dark:bg-[#0f1115] dark:text-gray-300 dark:hover:bg-white/10"
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 rounded-md border border-gray-200 bg-[#f5f5f5] p-1 shadow-lg dark:border-white/10 dark:bg-[#0f1115]"
          >
            <button
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-200 dark:hover:bg-white/10 ${theme === 'light' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-200 dark:hover:bg-white/10 ${theme === 'dark' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
            <button
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-200 dark:hover:bg-white/10 ${theme === 'system' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <Laptop className="h-4 w-4" />
              System
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
