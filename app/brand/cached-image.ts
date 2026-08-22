import type { ImageResponse } from 'next/og';

/**
 * Wraps a `next/og` renderer so it rasterizes once per container. Safe: these
 * depend only on `siteConfig` and the lib/brand.ts palette, both fixed at
 * import. Replays the original response headers.
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
