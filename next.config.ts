import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Images are served from this origin only. No `remotePatterns`, so
    // `/_next/image` will not fetch an off-origin URL for anyone: it is not a
    // server-side fetcher, and it cannot be driven to re-encode arbitrary
    // remote bytes on a half-core container.
    //
    // `localPatterns` is the positive half of the same policy: only these two
    // directories are optimizable, and `search: ''` forbids a query string so
    // the optimizer cannot be enumerated through `?v=` variants. A cover or
    // avatar path outside these gets a 400 rather than being optimized.
    localPatterns: [
      { pathname: '/images/**', search: '' },
      { pathname: '/portfolio/**', search: '' },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 604800,
    qualities: [80],
    deviceSizes: [640, 828, 1200, 1920, 2560, 3840],
    imageSizes: [256, 384],
  },

  async headers() {
    return [
      // Content pages render per request (see the route `dynamic` exports), so
      // Next sends them `no-store`, which forbids any shared cache. These are
      // anonymous, cookie-free, identical-for-everyone documents, so let a CDN
      // or reverse proxy absorb repeat traffic and burst load. `s-maxage` is
      // shared-cache only: browsers still revalidate, and the origin stays
      // authoritative. Cloudflare additionally needs a Cache Rule marking HTML
      // eligible for cache, since it caches by file extension by default and
      // never caches HTML on its own. The metadata routes (robots/sitemap/
      // manifest) are `force-dynamic` for the same runtime-SITE_URL reason, so
      // they need the header too or every crawler fetch reaches the origin.
      {
        source:
          '/:path(|about|contact|blog|portfolio|opengraph-image|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|blog/[^/]+|portfolio/[^/]+|portfolio/[^/]+/[^/]+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP is in proxy.ts: it carries a per-request nonce.
        ],
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
