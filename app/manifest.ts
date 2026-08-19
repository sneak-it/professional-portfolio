import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
import { BACKGROUND } from '@/lib/brand';

// A manifest route is a Route Handler that Next caches by default, which would
// bake the build-time placeholder identity into the image. Same reasoning as
// robots.ts and sitemap.ts: render per request so SITE_* overrides apply.
export const dynamic = 'force-dynamic';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: BACKGROUND.light,
    theme_color: BACKGROUND.light,
    // The two icons the app already generates (app/icon.tsx, app/apple-icon.tsx).
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
