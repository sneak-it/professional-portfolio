import fs from 'fs';
import { IMAGE_DIMENSION_CACHE_MAX } from './config.ts';

/**
 * Shared, server-only image dimension reader.
 *
 * Reads just the file header and memoizes by (path, mtime), so repeat reads of
 * an unchanged file are free. Used both by the portfolio gallery scan and by the
 * MDX <img> renderer to stamp intrinsic width/height (reserving layout space and
 * avoiding CLS). Server-only: it touches `fs`, so never import this into a
 * client component.
 *
 * Formats: PNG, GIF, WebP, JPEG, SVG. Anything else throws; both callers treat a
 * throw as "no dimensions" and render without them. AVIF/HEIF/JXL/ICNS are
 * deliberately unsupported; their container walks are what made `image-size`
 * (this module's predecessor) hang on malformed input.
 */

/**
 * True for a root-relative path on this origin. Excludes protocol-relative
 * ('//host'), remote ('http(s)://'), and `data:` sources, matching the
 * `img-src 'self'` CSP and the absence of `images.remotePatterns` in
 * next.config.ts. Gates the MDX <img> renderer so an off-origin src fails at
 * render instead of relying on the browser to enforce the header.
 */
export function isLocalSrc(src: unknown): src is string {
  return (
    typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')
  );
}

// ponytail: 64 KiB header window; raise if a JPEG's SOF ever lands past it.
const HEADER_BYTES = 64 * 1024;

const dimensionCache = new Map<
  string,
  { mtimeMs: number; width: number; height: number }
>();

interface Size {
  width: number;
  height: number;
}

function need(b: Buffer, end: number) {
  if (b.length < end) throw new Error('truncated image header');
}

// Bounded to the root tag; no nested quantifiers.
const SVG_TAG_RE = /<svg\s[^>]{0,2000}>/i;
const SVG_WIDTH_RE = /\bwidth\s*=\s*["']?\s*([\d.]+)\s*(?:px)?\s*["']?/i;
const SVG_HEIGHT_RE = /\bheight\s*=\s*["']?\s*([\d.]+)\s*(?:px)?\s*["']?/i;
const SVG_VIEWBOX_RE =
  /\bviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i;

function svgSize(b: Buffer): Size | null {
  const tag = SVG_TAG_RE.exec(b.toString('utf8'))?.[0];
  if (!tag) return null;

  const w = SVG_WIDTH_RE.exec(tag)?.[1];
  const h = SVG_HEIGHT_RE.exec(tag)?.[1];
  if (w && h) return { width: Math.ceil(+w), height: Math.ceil(+h) };

  const box = SVG_VIEWBOX_RE.exec(tag);
  const bw = box?.[1];
  const bh = box?.[2];
  if (bw && bh) return { width: Math.ceil(+bw), height: Math.ceil(+bh) };
  return null;
}

function webpSize(b: Buffer): Size {
  need(b, 16);
  const chunk = b.toString('ascii', 12, 16);

  if (chunk === 'VP8 ') {
    need(b, 30);
    return {
      width: b.readUInt16LE(26) & 0x3fff,
      height: b.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L') {
    need(b, 25);
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    need(b, 30);
    return {
      width: b.readUIntLE(24, 3) + 1,
      height: b.readUIntLE(27, 3) + 1,
    };
  }
  throw new Error(`unsupported WebP chunk ${chunk}`);
}

function jpegSize(b: Buffer): Size {
  let off = 2;
  while (off + 9 <= b.length) {
    if (b[off] !== 0xff) throw new Error('malformed JPEG segment');
    const marker = b[off + 1];
    if (marker === undefined) throw new Error('malformed JPEG segment');

    // SOF0-SOF15, minus DHT (c4), JPG (c8) and DAC (cc).
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: b.readUInt16BE(off + 5),
        width: b.readUInt16BE(off + 7),
      };
    }

    // Forward progress or bust: a zero/short length field must not loop.
    const next = off + 2 + b.readUInt16BE(off + 2);
    if (next <= off) throw new Error('malformed JPEG segment length');
    off = next;
  }
  throw new Error('no JPEG SOF marker in header window');
}

export function readSize(b: Buffer): Size {
  need(b, 12);

  let size: Size | null = null;
  if (b.readUInt32BE(0) === 0x89504e47) {
    need(b, 24);
    size = { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  } else if (b.toString('ascii', 0, 4) === 'GIF8') {
    size = { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  } else if (
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP'
  ) {
    size = webpSize(b);
  } else if (b[0] === 0xff && b[1] === 0xd8) {
    size = jpegSize(b);
  } else {
    size = svgSize(b);
  }

  if (!size?.width || !size.height) throw new Error('unsupported image format');
  return size;
}

export function imageDimensions(imagePath: string): Size {
  const { mtimeMs } = fs.statSync(imagePath);
  const cached = dimensionCache.get(imagePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return { width: cached.width, height: cached.height };
  }

  const fd = fs.openSync(imagePath, 'r');
  let result: Size;
  try {
    const size = fs.fstatSync(fd).size;
    const length = Math.min(size, HEADER_BYTES);
    const header = Buffer.alloc(length);
    fs.readSync(fd, header, 0, length, 0);
    result = readSize(header);
  } finally {
    fs.closeSync(fd);
  }

  // Insertion-ordered eviction: a long-lived container serving a bind-mounted,
  // editable tree would otherwise grow this Map for every path ever requested.
  if (dimensionCache.size >= IMAGE_DIMENSION_CACHE_MAX) {
    const oldest = dimensionCache.keys().next().value;
    if (oldest !== undefined) dimensionCache.delete(oldest);
  }
  dimensionCache.set(imagePath, { mtimeMs, ...result });
  return result;
}
