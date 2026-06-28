'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';

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

/** Slowly-rotating conic-gradient glow behind the hero headline. Augments the
 *  typewriter; static when motion is disabled. */
function GradientMesh() {
  // Static glow: a one-shot entrance fade only. Previously this rotated
  // infinitely, which kept re-compositing a large blurred layer behind the
  // hero every frame — pure cost for a barely-perceptible effect.
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="h-full w-full rounded-full opacity-30 blur-[64px] dark:opacity-40 [background:conic-gradient(from_0deg,var(--accent-from),var(--accent-via),var(--accent-to),var(--accent-from))]" />
    </motion.div>
  );
}

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FeaturedProjectCard({ item }: { item: number }) {
  return (
    <Reveal delay={item * 0.1}>
      <TiltCard className="group relative rounded-2xl overflow-hidden bg-white dark:bg-black border border-gray-100 dark:border-white/10 h-full">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-gray-900">
          <Image
            src={`https://picsum.photos/seed/project${item}/800/600`}
            alt={`Project ${item}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-full">
              Next.js
            </span>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-full">
              Tailwind
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
            Project Title {item}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            A brief description of the project and the value it provides to the
            users.
          </p>
        </div>
      </TiltCard>
    </Reveal>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <GradientMesh />
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

      {/* Featured Projects Preview */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                Selected Work
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Some of my recent projects.
              </p>
            </div>
            <Link
              href="/portfolio"
              className="hidden md:flex items-center gap-2 text-accent hover:text-accent font-medium group"
            >
              View all{' '}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 [perspective:1000px]">
            {[1, 2].map((item) => (
              <FeaturedProjectCard key={item} item={item} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-accent font-medium"
            >
              View all work <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
