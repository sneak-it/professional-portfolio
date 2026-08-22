'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

/* Site-wide background, mounted once in app/layout.tsx, and the bundle-size
   gate for the WebGL gradient:

     - full → lazy OGL shader gradient. Gated behind the post-mount tier, so
       the chunk loads on desktop only, after first paint.
     - lite / none → static CSS gradient, zero JS, same --accent-* tokens. */

const ShaderGradient = dynamic(() => import('./ShaderGradient'), {
  ssr: false,
});

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

  return hydrated && tier === 'full' ? <ShaderGradient /> : <StaticGradient />;
}
