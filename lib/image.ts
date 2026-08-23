import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { IMAGE_DIMENSION_CACHE_MAX } from './config.ts';

/**
 * Server-only: same-origin src validation, `media/` containment, and a
 * dimension read memoized by (path, mtime). The gallery scan and the MDX <img>
 * renderer stamp the dimensions to avoid CLS. lib/media.ts serves the bytes.
 */

/**
 * True for a root-relative path on this origin, matching the `img-src 'self'`
 * CSP. Gates the MDX <img> renderer so an off-origin src fails at render.
 */
export function isLocalSrc(src: unknown): src is string {
  return (
    typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')
  );
}

/**
 * Filesystem path backing a `/media/...` URL, or null if it resolves outside
 * `media/`. SITE_AVATAR_URL and the route's `[...path]` both arrive from
 * outside, so the containment check is a real boundary.
 */
export function mediaFilePath(
  src: unknown,
  root: string = process.cwd(),
): string | null {
  if (!isLocalSrc(src)) return null;
  const mediaDir = path.join(root, 'media');
  const full = path.resolve(root, `.${src}`);
  return full === mediaDir || full.startsWith(mediaDir + path.sep)
    ? full
    : null;
}

const dimensionCache = new Map<
  string,
  { mtimeMs: number; width: number; height: number }
>();

interface Size {
  width: number;
  height: number;
}

export async function imageDimensions(imagePath: string): Promise<Size> {
  const { mtimeMs } = await fs.promises.stat(imagePath);
  const cached = dimensionCache.get(imagePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return { width: cached.width, height: cached.height };
  }

  const { width, height, orientation } = await sharp(imagePath).metadata();
  if (!width || !height) throw new Error(`no dimensions in ${imagePath}`);

  // Orientations 5-8 are quarter-turns, which sanitize() and the optimizer
  // both apply, so the served pixels are swapped from the stored ones.
  const size =
    orientation && orientation >= 5
      ? { width: height, height: width }
      : { width, height };

  // Insertion-ordered eviction: a long-lived container serving a bind-mounted,
  // editable tree would otherwise grow this Map for every path ever requested.
  if (dimensionCache.size >= IMAGE_DIMENSION_CACHE_MAX) {
    const oldest = dimensionCache.keys().next().value;
    if (oldest !== undefined) dimensionCache.delete(oldest);
  }
  dimensionCache.set(imagePath, { mtimeMs, ...size });
  return size;
}
