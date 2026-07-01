'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { navLinks as links } from '@/lib/site';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm dark:border-b dark:border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/"
            className="text-xl font-mono font-bold tracking-tight uppercase"
          >
            YN<span className="text-accent">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-2"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {links.map((link) => {
              const isActive = pathname === link.href;
              const isHovered = hoveredPath === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredPath(link.href)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                    isActive
                      ? 'text-accent'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <motion.span
                    className="relative z-10 block"
                    whileTap={{ scale: 0.9 }}
                  >
                    {link.name}
                  </motion.span>

                  {isHovered && (
                    <motion.div
                      layoutId="navbar-hover"
                      className="absolute inset-0 bg-gray-200/50 dark:bg-white/10 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute bottom-1 left-4 right-4 h-[2px] bg-accent"
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              );
            })}
            <div className="pl-4">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              className="p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-gray-200 dark:border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 text-base font-medium rounded-md ${
                    pathname === link.href
                      ? 'text-accent bg-accent/10 dark:bg-accent/10'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
