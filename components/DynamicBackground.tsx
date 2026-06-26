'use client';

import { useEffect, useRef } from 'react';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

/* ---------------------------------------------------------------------------
   Cursor-reactive geometric grid field.

   A Canvas-2D matrix of dots that drifts gently on its own and ripples toward
   the cursor, lighting cells from --accent (green) at the pointer's center to
   --accent-2 (blue) at the edge of its influence. Both colors are read live
   from the CSS variables in globals.css (re-read on theme change), so editing
   the palette there reskins this background automatically.

   Motion tiers (hooks/use-motion-enabled.ts):
     - full : animated rAF loop + cursor interaction + ambient drift
     - lite : single static frame (mobile), no rAF, no pointer tracking
     - none : single static frame (prefers-reduced-motion)
--------------------------------------------------------------------------- */

const SPACING = 30; // px between grid points
const RADIUS = 150; // px cursor influence radius
const DOT_BASE = 1.1; // base dot radius
const DOT_EXTRA = 2.2; // additional radius at full influence
const PULL = 0.28; // how strongly dots slide toward the cursor
const AMBIENT_AMP = 2.2; // px amplitude of idle drift
const AMBIENT_SPEED = 0.0006; // drift speed (per ms)

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  const h = hex.trim().replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full || '14b87a', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function readVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v.trim() || fallback;
}

export default function DynamicBackground() {
  const { tier } = useMotionEnabled();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;

    // Palette + theme, re-read on theme change so the grid follows the tokens.
    let accent = hexToRgb(readVar('--accent', '#14b87a'));
    let accent2 = hexToRgb(readVar('--accent-2', '#4f7cff'));
    let isDark = document.documentElement.classList.contains('dark');
    const refreshTheme = () => {
      accent = hexToRgb(readVar('--accent', '#14b87a'));
      accent2 = hexToRgb(readVar('--accent-2', '#4f7cff'));
      isDark = document.documentElement.classList.contains('dark');
      if (tier !== 'full') draw(0); // repaint the static frame in the new theme
    };

    // Pointer kept far offscreen until the cursor actually moves.
    let pointerX = -9999;
    let pointerY = -9999;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / SPACING) + 1;
      rows = Math.ceil(height / SPACING) + 1;
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const baseAlpha = isDark ? 0.16 : 0.22;
      const baseChannel = isDark ? 255 : 20;
      const animated = tier === 'full';

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const gx = i * SPACING;
          const gy = j * SPACING;

          // Idle drift — a slow phase-shifted wave per cell.
          let px = gx;
          let py = gy;
          if (animated) {
            px += Math.sin(time * AMBIENT_SPEED + i * 0.5) * AMBIENT_AMP;
            py += Math.cos(time * AMBIENT_SPEED + j * 0.5) * AMBIENT_AMP;
          }

          const dx = pointerX - px;
          const dy = pointerY - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = dist < RADIUS ? 1 - dist / RADIUS : 0;

          if (influence > 0) {
            px += dx * influence * PULL;
            py += dy * influence * PULL;
            // green at the center → blue toward the edge of the radius.
            const t = 1 - influence;
            const r = Math.round(accent.r + (accent2.r - accent.r) * t);
            const g = Math.round(accent.g + (accent2.g - accent.g) * t);
            const b = Math.round(accent.b + (accent2.b - accent.b) * t);
            const alpha = baseAlpha + influence * (1 - baseAlpha);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, DOT_BASE + influence * DOT_EXTRA, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(${baseChannel},${baseChannel},${baseChannel},${baseAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, DOT_BASE, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    resize();

    // Static tiers: paint one frame and wire only resize/theme repaints.
    if (tier !== 'full') {
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener('resize', onResize);
      const themeObserver = new MutationObserver(refreshTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      return () => {
        window.removeEventListener('resize', onResize);
        themeObserver.disconnect();
      };
    }

    // Full tier: continuous rAF (paused while the tab is hidden) + pointer.
    let rafId = 0;
    let running = true;
    const loop = (time: number) => {
      if (!running) return;
      draw(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    let ticking = false;
    let lastX = 0;
    let lastY = 0;
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        pointerX = lastX;
        pointerY = lastY;
        ticking = false;
      });
    };
    const onLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    };
    const onResize = () => resize();

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    const themeObserver = new MutationObserver(refreshTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      themeObserver.disconnect();
    };
  }, [tier]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background-deep">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Vignette keeps text legible over the grid in both themes. */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-transparent to-background-deep opacity-80" />
    </div>
  );
}
