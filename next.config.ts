import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Local patterns only, so `/_next/image` serves same-origin paths, and
    // `search: ''` forbids a query string.
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
      // `s-maxage` opts these force-dynamic routes into a shared cache;
      // browsers still revalidate. Cloudflare needs a Cache Rule (CLOUDFLARE.md).
      {
        source:
          '/:path(|about|contact|blog|portfolio|robots\\.txt|sitemap\\.xml|blog/[^/]+|portfolio/[^/]+|portfolio/[^/]+/[^/]+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      // Each request is a full rasterize, so let browsers hold them too;
      // app/layout.tsx versions the URL (lib/site.ts `BRAND_VERSION`).
      {
        source: '/brand/:path(icon|apple-icon|opengraph-image)',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
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
