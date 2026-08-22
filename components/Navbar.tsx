'use client';

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { navLinks as links } from '@/lib/nav';
import { useFocusTrap } from '@/hooks/use-focus-trap';

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Horizontal inset of the active underline, matching the links' px-4.
const UNDERLINE_INSET = 16;

interface Indicator {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default function Navbar({ monogram }: { monogram: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const pathname = usePathname();

  // Sliding-indicator geometry, measured from the live link elements. The pill
  // and underline translate with a CSS transform.
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [pill, setPill] = useState<Indicator | null>(null);
  const [underline, setUnderline] = useState<Indicator | null>(null);
  const activeExists = links.some((link) => link.href === pathname);

  const measure = useCallback((href: string | null): Indicator | null => {
    const el = href ? linkRefs.current.get(href) : null;
    if (!el) return null;
    return {
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
  }, []);

  // Keep last geometry when the target is gone (pointer left / no active link)
  // so the indicator fades in place.
  const applyMeasurements = useCallback(() => {
    const hovered = measure(hoveredPath);
    if (hovered) setPill(hovered);
    const active = measure(pathname);
    if (active) setUnderline(active);
  }, [measure, hoveredPath, pathname]);

  // Latest measurement, so the mount-only resize listener always calls current
  // hover/route state without re-subscribing.
  const applyRef = useRef(applyMeasurements);
  useEffect(() => {
    applyRef.current = applyMeasurements;
  });

  // Layout effect: positions land before paint. Re-runs on hover/route change
  // to drive the slides.
  useIsomorphicLayoutEffect(() => {
    applyMeasurements();
  }, [applyMeasurements]);

  // Re-measure when the nav resizes or web fonts settle (link widths shift).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const recalc = () => {
      applyRef.current();
    };
    const observer = new ResizeObserver(recalc);
    observer.observe(nav);
    void document.fonts.ready.then(recalc);
    return () => {
      observer.disconnect();
    };
  }, []);

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Moves focus into the panel on open and back to the trigger on close, and
  // keeps Tab inside it while open.
  const mobileMenuRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
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
            {monogram}
            <span className="text-accent">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center"
            onMouseLeave={() => {
              setHoveredPath(null);
            }}
          >
            <div ref={navRef} className="relative flex items-center">
              {/* Sliding hover pill: translates between links, fades out when
                  the pointer leaves the nav. */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 rounded-full bg-gray-200/50 dark:bg-white/10 transition-[transform,width,opacity] duration-300 ease-out"
                style={{
                  transform: `translateX(${pill?.left ?? 0}px)`,
                  top: pill?.top ?? 0,
                  width: pill?.width ?? 0,
                  height: pill?.height ?? 0,
                  opacity: hoveredPath ? 1 : 0,
                }}
              />
              {/* Sliding active underline: tracks the current route's link. */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 bottom-1 h-[2px] bg-accent transition-[transform,width,opacity] duration-300 ease-out"
                style={{
                  transform: `translateX(${(underline?.left ?? 0) + UNDERLINE_INSET}px)`,
                  width: Math.max(
                    (underline?.width ?? 0) - UNDERLINE_INSET * 2,
                    0,
                  ),
                  opacity: activeExists ? 1 : 0,
                }}
              />

              <div className="relative z-10 flex items-center space-x-2">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      ref={(el) => {
                        if (el) linkRefs.current.set(link.href, el);
                        else linkRefs.current.delete(link.href);
                      }}
                      onMouseEnter={() => {
                        setHoveredPath(link.href);
                      }}
                      className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                        isActive
                          ? 'text-accent'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <m.span className="block" whileTap={{ scale: 0.9 }}>
                        {link.name}
                      </m.span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="pl-4">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              className="p-2 text-gray-600 dark:text-gray-300"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div aria-hidden className="nav-progress" />

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={mobileMenuRef}
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
                  onClick={() => {
                    setIsOpen(false);
                  }}
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
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
