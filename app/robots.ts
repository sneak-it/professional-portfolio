import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

// Rendered at request time so the emitted origin reflects the runtime
// `SITE_URL` (see lib/site.ts) on the first crawl of a prebuilt-image deploy.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    // No `host`: the `Host:` line Next emits for it is unsupported, and the
    // canonical tags and sitemap URL above already declare the origin.
  };
}
