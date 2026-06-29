'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react';
import { ArrowRight } from 'lucide-react';

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
  return (
    <>
      {/* Hero Section — the animated gradient backdrop is provided site-wide by
          components/BackgroundCanvas.tsx. */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
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
              className="mt-4 max-w-2xl mx-auto mb-10 p-6 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 shadow-xl"
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
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black dark:bg-white dark:text-black rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]"
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
