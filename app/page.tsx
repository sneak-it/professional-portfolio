'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

const WORDS = ['Experiences', 'Opportunities', 'Connections', 'Solutions'];

function TypewriterText() {
  const [textIndex, setTextIndex] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) =>
    WORDS[textIndex].slice(0, latest),
  );

  useEffect(() => {
    const controls = animate(count, WORDS[textIndex].length, {
      type: 'tween',
      duration: 1,
      ease: 'linear',
      onComplete: () => {
        setTimeout(() => {
          animate(count, 0, {
            type: 'tween',
            duration: 0.5,
            ease: 'linear',
            onComplete: () => {
              setTextIndex((prev) => (prev + 1) % WORDS.length);
            },
          });
        }, 2000);
      },
    });
    return controls.stop;
  }, [textIndex, count]);

  return <motion.span>{displayText}</motion.span>;
}

export default function Home() {
  const { tier } = useMotionEnabled();
  const interactive = tier === 'full';

  // Pointer position normalized to [-0.5, 0.5] from the hero center, smoothed
  // by a spring. Drives the trailing accent glow only — the headline itself
  // stays put. Stays at 0 unless `interactive`, so mobile (`lite`) and
  // reduced-motion (`none`) render a perfectly static hero.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 120, damping: 20, mass: 0.5 });
  const spy = useSpring(py, { stiffness: 120, damping: 20, mass: 0.5 });

  const glowX = useTransform(spx, [-0.5, 0.5], ['38%', '62%']);
  const glowY = useTransform(spy, [-0.5, 0.5], ['38%', '62%']);

  function handlePointer(e: React.MouseEvent) {
    if (!interactive) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function resetPointer() {
    px.set(0);
    py.set(0);
  }

  return (
    <>
      {/* Hero Section — the animated gradient backdrop is provided site-wide by
          components/BackgroundCanvas.tsx. */}
      <section
        onMouseMove={handlePointer}
        onMouseLeave={resetPointer}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Readability vignette — keeps the headline legible over the brighter
            palette + glow, regardless of where the animated background lands. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,var(--background-deep)_0%,transparent_70%)] opacity-70 dark:opacity-80"
        />

        {/* Cursor-following accent glow — soft depth cue, desktop + motion only. */}
        {interactive && (
          <motion.div
            aria-hidden
            style={{ left: glowX, top: glowY }}
            className="pointer-events-none absolute z-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_65%)] opacity-20 blur-3xl"
          />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'backOut' }}
              className="text-sm md:text-base font-semibold tracking-widest text-accent uppercase font-mono mb-4"
            >
              Frontend Developer & Designer
            </motion.p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-6 flex flex-wrap justify-center gap-x-4">
              <motion.span
                initial={{
                  opacity: 0,
                  y: 50,
                  filter: 'blur(10px)',
                  scale: 0.9,
                }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                transition={{ duration: 1, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="inline-block"
              >
                Creating
              </motion.span>
              <div className="w-full h-0" />
              <motion.span
                initial={{
                  opacity: 0,
                  y: 50,
                  filter: 'blur(10px)',
                  scale: 0.9,
                }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.2,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-accent-from via-accent-via to-accent-to inline-block"
              >
                <TypewriterText />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: 'linear',
                  }}
                  className="inline-block w-[4px] h-[0.9em] bg-accent ml-2 align-middle -mt-2"
                />
              </motion.span>
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="surface mt-4 max-w-2xl mx-auto mb-10 p-6"
            >
              <p className="text-xl text-gray-800 dark:text-gray-200 font-medium">
                I build accessible, pixel-perfect digital experiences for the
                web. Focusing on modern technologies and beautiful design.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <div className="inline-block">
                <Link
                  href="/portfolio"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black dark:bg-white dark:text-black rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-4px_var(--accent)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    View Portfolio{' '}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-accent-from to-accent-via transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                </Link>
              </div>
              <div className="inline-block">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black dark:text-white border border-gray-200 dark:border-white/20 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Contact Me
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
