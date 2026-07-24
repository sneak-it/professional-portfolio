import fs from 'fs';
import sizeOf from 'image-size';

/**
 * Shared, server-only image dimension reader.
 *
 * Reads just the file header (image-size's own bound) and memoizes by
 * (path, mtime), so repeat reads of an unchanged file are free. Used both by the
 * portfolio gallery scan and by the MDX <img> renderer to stamp intrinsic
 * width/height (reserving layout space and avoiding CLS). Server-only: it
 * touches `fs`, so never import this into a client component.
 */

// Read only the header (image-size's own bound); memoize by (path, mtime).
const HEADER_BYTES = 512 * 1024;
const dimensionCache = new Map<
  string,
  { mtimeMs: number; width: number; height: number }
>();

export function imageDimensions(imagePath: string): {
  width: number;
  height: number;
} {
  const { mtimeMs } = fs.statSync(imagePath);
  const cached = dimensionCache.get(imagePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return { width: cached.width, height: cached.height };
  }

  const fd = fs.openSync(imagePath, 'r');
  let dimensions;
  try {
    const size = fs.fstatSync(fd).size;
    const length = Math.min(size, HEADER_BYTES);
    const header = Buffer.alloc(length);
    fs.readSync(fd, header, 0, length, 0);
    dimensions = sizeOf(header);
  } finally {
    fs.closeSync(fd);
  }

  const result = {
    width: dimensions.width || 800,
    height: dimensions.height || 600,
  };
  dimensionCache.set(imagePath, { mtimeMs, ...result });
  return result;
}
