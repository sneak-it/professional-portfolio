import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

// Rendered at request time so the emitted origin reflects the runtime `SITE_URL`
// (see lib/site.ts) rather than whatever was set when the image was built —
// robots.txt must be correct on the first crawl of any prebuilt-image deploy.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    // No `host`: Next emits it as a `Host:` line, which is a Yandex extension
    // Yandex itself dropped, and Google lists it as unsupported. The canonical
    // tags and the sitemap URL above are what actually declare the origin.
  };
}
