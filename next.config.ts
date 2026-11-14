import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Local patterns only, so `/_next/image` serves same-origin paths, and
    // `search: ''` forbids a query string. `/media/**` alone: nothing outside
    // it strips metadata.
    localPatterns: [{ pathname: '/media/**', search: '' }],
    formats: ['image/webp'],
    minimumCacheTTL: 604800,
    qualities: [80],
    deviceSizes: [640, 828, 1200, 1920, 2560, 3840],
    imageSizes: [256, 384],
  },

  // Clients that skip <link rel="icon"> ask for these paths directly.
  async rewrites() {
    return [
      { source: '/favicon.ico', destination: '/brand/icon' },
      { source: '/apple-touch-icon.png', destination: '/brand/apple-icon' },
    ];
  },

  async headers() {
    return [
      // Each request is a full rasterize, so let browsers hold them too. /brand/ URLs
      // are versioned (lib/site.ts `BRAND_VERSION`); the two root aliases are not.
      {
        source:
          '/:path(brand/icon|brand/apple-icon|brand/opengraph-image|favicon\\.ico|apple-touch-icon\\.png)',
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
            value: 'max-age=63072000',
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
