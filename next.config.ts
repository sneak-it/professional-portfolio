import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/seed/**',
      },
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
      // never caches HTML on its own.
      {
        source:
          '/:path(|about|contact|blog|portfolio|opengraph-image|blog/[^/]+|portfolio/[^/]+|portfolio/[^/]+/[^/]+)',
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
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // NOTE: 'unsafe-inline' in script-src is a deliberate trade-off, not an
              // oversight. A strict nonce/hash CSP would require a per-request nonce
              // generated in middleware and read via next/headers, which opts every
              // route into dynamic rendering and disables the static generation the
              // blog/gallery pages rely on. The XSS surface here is low: no user input,
              // no forms or backend, and all MDX is author-authored and rendered through
              // the component allowlist in components/MDXComponents.tsx. The static-
              // rendering win is preferred. Revisit if untrusted content is introduced.
              "script-src 'self' 'unsafe-inline'",
              // 'unsafe-inline' here is additionally required by Tailwind v4 / Next.js.
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://picsum.photos data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
