'use client';

import { useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { Pause, Play } from 'lucide-react';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

/* Site-wide background, mounted once in app/layout.tsx, and the bundle-size
   gate for the WebGL gradient:

     - full → lazy OGL shader gradient. Gated behind the post-mount tier, so
       the chunk loads on desktop only, after first paint.
     - lite / none → static CSS gradient, zero JS, same --accent-* tokens. */

const ShaderGradient = dynamic(() => import('./ShaderGradient'), {
  ssr: false,
});

const PAUSED_KEY = 'bg-animation-paused';

/* The pause preference outlives a reload. localStorage access throws outright in
   some privacy modes, so both sides fall back to "playing". */
function readPaused(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PAUSED_KEY) === '1';
  } catch {
    return false;
  }
}

function savePaused(paused: boolean) {
  try {
    localStorage.setItem(PAUSED_KEY, paused ? '1' : '0');
  } catch {
    // Preference is cosmetic; dropping it is fine.
  }
}

/** False on the server and through hydration, true once mounted on the client. */
function useHydrated() {
  return useSyncExternalStore(
    () => {
      // The hydration flag never changes after mount — nothing to subscribe to.
      return () => {
        // No teardown needed.
      };
    },
    () => true,
    () => false,
  );
}

/** Static, zero-JS gradient for non-desktop / reduced-motion tiers. */
function StaticGradient() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background-deep"
    >
      {/* Soft accent tint on the calm side, matching the shader's ambient
          wash. */}
      <div
        className="absolute inset-0 opacity-[0.16] dark:opacity-[0.18]"
        style={{
          background:
            'linear-gradient(110deg, var(--accent-from) 0%, var(--accent-via) 22%, transparent 50%)',
        }}
      />
      {/* Gradient concentrated on the right to match the animated shader. */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-50"
        style={{
          background:
            'radial-gradient(70% 90% at 100% 18%, var(--accent-to), transparent 60%), radial-gradient(60% 80% at 92% 85%, var(--accent-via), transparent 60%), radial-gradient(55% 70% at 80% 50%, var(--accent-from), transparent 65%)',
        }}
      />
      {/* Vignette keeps text legible — matches the shader wrapper. */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-transparent to-background-deep opacity-80" />
    </div>
  );
}

export default function BackgroundCanvas() {
  const { tier } = useMotionEnabled();

  const hydrated = useHydrated();
  // Read once on first render, so a returning visitor never sees a frame of
  // animation they paused. BackgroundCanvas is mounted in the root layout, so
  // in-session navigation keeps this state without touching storage.
  const [paused, setPaused] = useState(readPaused);

  if (!hydrated || tier !== 'full') return <StaticGradient />;

  return (
    <>
      <ShaderGradient paused={paused} />
      <button
        type="button"
        onClick={() => {
          setPaused(!paused);
          savePaused(!paused);
        }}
        aria-pressed={paused}
        aria-label={
          paused ? 'Resume background animation' : 'Pause background animation'
        }
        title={
          paused ? 'Resume background animation' : 'Pause background animation'
        }
        className="fixed bottom-4 right-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-background/80 text-gray-600 backdrop-blur transition-colors hover:bg-gray-200 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
      >
        {paused ? (
          <Play className="h-[1.1rem] w-[1.1rem]" />
        ) : (
          <Pause className="h-[1.1rem] w-[1.1rem]" />
        )}
      </button>
    </>
  );
}
