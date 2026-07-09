import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  transpilePackages: ['motion'],
  turbopack: {},
};

export default nextConfig;
