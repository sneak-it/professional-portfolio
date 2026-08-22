import type { ImageResponse } from 'next/og';

/**
 * Wraps a `next/og` renderer so it rasterizes once per container instead of once
 * per request. Safe because these images depend only on `siteConfig` and the
 * lib/brand.ts palette, both fixed at import: a change needs a restart, which
 * clears this anyway. Replays the original response's headers rather than
 * rebuilding them, so the cached hit is indistinguishable from the first.
 */
export function cachedImage(render: () => ImageResponse) {
  let cached: { body: ArrayBuffer; headers: Headers } | undefined;

  return async function GET() {
    if (!cached) {
      const res = render();
      cached = { body: await res.arrayBuffer(), headers: res.headers };
    }
    return new Response(cached.body, { headers: cached.headers });
  };
}
