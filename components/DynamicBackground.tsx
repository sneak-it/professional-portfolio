'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

export default function DynamicBackground() {
  const { tier } = useMotionEnabled();

  // Mouse-parallax source (only fed on the `full` tier). Hooks are called
  // unconditionally to keep order stable across tier changes.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const orb1X = useTransform(smoothMouseX, (v) => v * 2);
  const orb1Y = useTransform(smoothMouseY, (v) => v * 2);
  const orb2X = useTransform(smoothMouseX, (v) => v * -1.5);
  const orb2Y = useTransform(smoothMouseY, (v) => v * -2);

  // rAF-throttled mouse parallax — only on desktop with motion allowed. This
  // only does work while the cursor moves; it's idle otherwise.
  useEffect(() => {
    if (tier !== 'full') return;
    let ticking = false;
    let lastX = 0;
    let lastY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        mouseX.set((lastX / window.innerWidth - 0.5) * 100);
        mouseY.set((lastY / window.innerHeight - 0.5) * 100);
        ticking = false;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [tier, mouseX, mouseY]);

  // Smaller blur radii: a large blur over a 60vw element is expensive fill-rate.
  const blurClass = tier === 'lite' ? 'blur-[40px]' : 'blur-[56px]';

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background-deep">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Aurora Orbs — fully static (zero idle cost). The only motion is the
          cursor parallax via `style={{ x, y }}`, which is idle unless the mouse
          moves and is desktop-only. */}
      <div
        className={`absolute inset-0 opacity-50 dark:opacity-35 filter ${blurClass}`}
      >
        <motion.div
          style={{ x: orb1X, y: orb1Y }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
        />
        <motion.div
          style={{ x: orb2X, y: orb2Y }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-accent-from to-accent-via"
        />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-transparent to-background-deep opacity-80"></div>
    </div>
  );
}
