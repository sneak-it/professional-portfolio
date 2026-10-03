import fs from 'fs';
import sharp from 'sharp';
import type { Sharp } from 'sharp';

/**
 * Rebuilds an image from pixels alone, which is what drops EXIF. `media/` sits
 * outside `public/`, so this is the only way its files reach a visitor.
 */

// Largest `images.deviceSizes` entry in next.config.ts.
const MAX_EDGE = 3840;

export interface Sanitized {
  body: Buffer;
  contentType: string;
}

/** Formats re-encoded as themselves; anything else decodable becomes JPEG. */
const ENCODERS: Record<
  string,
  { contentType: string; encode: (t: Sharp) => Sharp }
> = {
  png: { contentType: 'image/png', encode: (t) => t.png() },
  webp: { contentType: 'image/webp', encode: (t) => t.webp({ quality: 90 }) },
  gif: { contentType: 'image/gif', encode: (t) => t.gif() },
};

// No mozjpeg: 5x the CPU, and the optimizer re-encodes this output anyway.
const JPEG = {
  contentType: 'image/jpeg',
  encode: (t: Sharp) => t.jpeg({ quality: 90 }),
};

/** Runs at most `n` wrapped calls at once; the rest wait in arrival order. */
export function limiter(n: number) {
  let active = 0;
  const queue: Array<() => void> = [];
  return async <T>(run: () => Promise<T>): Promise<T> => {
    if (active < n) active++;
    else await new Promise<void>((resolve) => queue.push(resolve));
    try {
      return await run();
    } finally {
      const next = queue.shift();
      if (next) next();
      else active--;
    }
  };
}

// One decode at a time keeps a gallery's first view under compose's 512 MB.
const slot = limiter(1);

/**
 * Keeps only the colour profile. Rotates first: orientation lives in the EXIF
 * being dropped, so portraits would serve sideways without it. Throws on
 * anything sharp can't decode, rather than falling back to the original bytes.
 *
 * ponytail: re-encodes per origin hit; add a disk cache if origin hits show up.
 */
export function sanitize(file: string): Promise<Sanitized> {
  return slot(() => rebuild(file));
}

async function rebuild(file: string): Promise<Sanitized> {
  const buffer = await fs.promises.readFile(file);
  const { format, pages } = await sharp(buffer).metadata();

  // No EXIF in SVG, and rasterizing would change what it is.
  if (format === 'svg') {
    return { body: buffer, contentType: 'image/svg+xml' };
  }

  const animated = (pages ?? 1) > 1;
  const { contentType, encode } = (format && ENCODERS[format]) || JPEG;

  let transformer = sharp(buffer, { animated });
  // No EXIF orientation on multi-frame images.
  if (!animated) transformer = transformer.rotate();

  const body = await encode(
    transformer
      .keepIccProfile()
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true }),
  ).toBuffer();

  return { body, contentType };
}
