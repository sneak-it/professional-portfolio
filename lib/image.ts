import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { MAX_EDGE, isOpaque } from './media.ts';

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

/** `MEDIA_DIR` (absolute, or relative to the cwd), else ./media. */
export function mediaDir(raw = process.env.MEDIA_DIR): string {
  const dir = raw?.trim();
  return dir
    ? path.resolve(/*turbopackIgnore: true*/ dir)
    : path.join(process.cwd(), 'media');
}

/**
 * Filesystem path backing a `/media/...` URL, or null if it resolves outside
 * `dir`. SITE_AVATAR_URL and the route's `[...path]` both arrive from
 * outside, so the containment check is a real boundary.
 */
export function mediaFilePath(
  src: unknown,
  dir: string = mediaDir(),
): string | null {
  if (!isLocalSrc(src)) return null;
  if (src !== '/media' && !src.startsWith('/media/')) return null;
  const full = path.resolve(dir, `.${src.slice('/media'.length)}`);
  return full === dir || full.startsWith(dir + path.sep) ? full : null;
}

interface Size {
  width: number;
  height: number;
}

interface Measured extends Size {
  mtimeMs: number;
  alpha: boolean;
  // Set by coverFit on first use.
  opaque?: boolean;
}

const dimensionCache = new Map<string, Measured>();
// About 0.4 MB when full.
const DIMENSION_CACHE_MAX = 2000;

export async function imageDimensions(imagePath: string): Promise<Size> {
  const { width, height } = await measure(imagePath);
  return { width, height };
}

async function measure(imagePath: string): Promise<Measured> {
  const { mtimeMs } = await fs.promises.stat(imagePath);
  const cached = dimensionCache.get(imagePath);
  if (cached && cached.mtimeMs === mtimeMs) return cached;

  const { width, height, orientation, hasAlpha } =
    await sharp(imagePath).metadata();
  if (!width || !height) throw new Error(`no dimensions in ${imagePath}`);

  // Served pixels: quarter-turns (orientations 5-8) applied, long edge capped at
  // MAX_EDGE as sanitize() does. An SVG isn't resized, but only its ratio matters.
  const [w, h] =
    orientation && orientation >= 5 ? [height, width] : [width, height];
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const entry: Measured = {
    mtimeMs,
    width: Math.round(w * scale),
    height: Math.round(h * scale),
    alpha: hasAlpha,
  };

  // Insertion-ordered eviction: a long-lived container serving a bind-mounted,
  // editable tree would otherwise grow this Map for every path ever requested.
  if (dimensionCache.size >= DIMENSION_CACHE_MAX) {
    const oldest = dimensionCache.keys().next().value;
    if (oldest !== undefined) dimensionCache.delete(oldest);
  }
  dimensionCache.set(imagePath, entry);
  return entry;
}

// Extensions `imageDimensions` can measure.
const LOCAL_IMAGE_RE = /\.(jpe?g|png|webp|gif|svg)$/i;

/**
 * Intrinsic width/height for a local (media/) image, read on the server to
 * reserve layout space. Null for an unreadable file or unmeasurable extension.
 */
export async function localImageDimensions(
  src: string,
): Promise<{ width: number; height: number } | null> {
  if (!LOCAL_IMAGE_RE.test(src)) return null;
  const file = mediaFilePath(src);
  if (file === null) return null;
  try {
    return await imageDimensions(file);
  } catch {
    return null;
  }
}

/**
 * `sizes` for an object-cover image. A photo wider than its box (width over
 * height) is drawn wider than the box, so every slot grows by that factor.
 */
export async function coverSizes(
  src: string | null | undefined,
  sizes: string,
  boxAspect: number,
): Promise<string> {
  const dims = src ? await localImageDimensions(src) : null;
  if (!dims) return sizes;
  const stretch = Math.ceil((dims.width / dims.height / boxAspect) * 100) / 100;
  if (stretch <= 1) return sizes;
  return sizes
    .split(',')
    .map((slot) =>
      slot.trim().replace(/\S+$/, (len) => `calc(${len} * ${stretch})`),
    )
    .join(', ');
}

/** How a cover sits in its box when it doesn't fill it; px caps are absent for SVG. */
export interface CoverFit {
  backdrop: 'blur' | 'panel';
  maxWidth?: number;
  maxHeight?: number;
}

// Next's smallest device width: narrower covers are enlarged in a phone-wide box.
const MIN_FILL_WIDTH = 640;

/**
 * Null fills the box, cropped. Otherwise the cover is drawn whole on a backdrop:
 * a panel behind transparency, else a blurred copy of itself.
 * @param box Box width over height; omit when the box takes the cover's shape.
 * @param maxCrop Largest share of the cover a fill may crop away.
 */
export async function coverFit(
  src: string | null | undefined,
  box?: number,
  maxCrop = 0.25,
): Promise<CoverFit | null> {
  if (!src || !LOCAL_IMAGE_RE.test(src)) return null;
  const file = mediaFilePath(src);
  if (file === null) return null;
  let m: Measured;
  try {
    m = await measure(file);
    m.opaque ??= m.alpha ? await isOpaque(file) : true;
  } catch {
    return null;
  }

  const svg = /\.svg$/i.test(src);
  const cap = svg ? {} : { maxWidth: m.width, maxHeight: m.height };
  if (!m.opaque) return { backdrop: 'panel', ...cap };
  const r = box && Number.isFinite(box) ? m.width / m.height / box : 1;
  const crop = 1 - Math.min(r, 1 / r);
  if (crop > maxCrop || (!svg && m.width < MIN_FILL_WIDTH)) {
    return { backdrop: 'blur', ...cap };
  }
  return null;
}
