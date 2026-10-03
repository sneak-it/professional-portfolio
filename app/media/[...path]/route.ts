import fs from 'fs';
import { mediaFilePath } from '@/lib/image';
import { fileVersion, sanitizeCached } from '@/lib/media';

/**
 * The only reader of `media/`. `/_next/image` fetches through here too, so even
 * its passthrough cases (HEIC, animated, optimize failure) serve stripped bytes.
 */
// Dynamic: media/ is bind-mounted and edited live.
export const dynamic = 'force-dynamic';

// Matches `images.minimumCacheTTL`.
const CACHE_CONTROL =
  'public, max-age=3600, s-maxage=604800, stale-while-revalidate=604800';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  // Images never need a query string; one would only bypass the CDN cache.
  if (new URL(request.url).search) return new Response(null, { status: 404 });
  const { path } = await params;
  const file = mediaFilePath(`/media/${path.join('/')}`);
  if (file === null) return new Response(null, { status: 404 });

  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(file);
  } catch {
    return new Response(null, { status: 404 });
  }
  if (!stat.isFile()) return new Response(null, { status: 404 });

  // From the file, not the body: a 304 costs a stat, not a re-encode.
  const etag = `"${fileVersion(stat)}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag, 'Cache-Control': CACHE_CONTROL },
    });
  }

  let sanitized;
  try {
    sanitized = await sanitizeCached(file, stat);
  } catch {
    // Fails closed: never fall back to the original bytes.
    console.error(`[media] cannot sanitize ${file}`);
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(sanitized.body), {
    headers: {
      'Content-Type': sanitized.contentType,
      'Content-Length': String(sanitized.body.byteLength),
      'Content-Disposition': 'inline',
      'Cache-Control': CACHE_CONTROL,
      ETag: etag,
    },
  });
}
