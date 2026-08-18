import assert from 'node:assert/strict';
import test from 'node:test';
import { readSize } from './image.ts';

function png(w: number, h: number) {
  const b = Buffer.alloc(24);
  b.writeUInt32BE(0x89504e47, 0);
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

function gif(w: number, h: number) {
  const b = Buffer.alloc(13);
  b.write('GIF89a', 0, 'ascii');
  b.writeUInt16LE(w, 6);
  b.writeUInt16LE(h, 8);
  return b;
}

function webpLossy(w: number, h: number) {
  const b = Buffer.alloc(30);
  b.write('RIFF', 0, 'ascii');
  b.write('WEBP', 8, 'ascii');
  b.write('VP8 ', 12, 'ascii');
  b.writeUInt16LE(w, 26);
  b.writeUInt16LE(h, 28);
  return b;
}

/** JPEG with one APP0 segment the walker must skip before reaching SOF0. */
function jpeg(w: number, h: number, app0Len = 16) {
  const b = Buffer.alloc(2 + 2 + app0Len + 9);
  b.writeUInt16BE(0xffd8, 0);
  b.writeUInt16BE(0xffe0, 2);
  b.writeUInt16BE(app0Len, 4);
  const sof = 4 + app0Len;
  b.writeUInt16BE(0xffc0, sof);
  b.writeUInt16BE(11, sof + 2);
  b.writeUInt16BE(h, sof + 5);
  b.writeUInt16BE(w, sof + 7);
  return b;
}

void test('reads raster header dimensions', () => {
  assert.deepEqual(readSize(png(1, 1)), { width: 1, height: 1 });
  assert.deepEqual(readSize(png(4000, 3000)), { width: 4000, height: 3000 });
  assert.deepEqual(readSize(gif(2, 3)), { width: 2, height: 3 });
  assert.deepEqual(readSize(webpLossy(640, 480)), { width: 640, height: 480 });
  assert.deepEqual(readSize(jpeg(800, 1200)), { width: 800, height: 1200 });
});

void test('reads svg from width/height, else viewBox', () => {
  assert.deepEqual(
    readSize(Buffer.from('<svg xmlns="..." width="120px" height="60">')),
    { width: 120, height: 60 },
  );
  assert.deepEqual(
    readSize(Buffer.from('<svg xmlns="..." viewBox="0 0 100.5 40">')),
    { width: 101, height: 40 },
  );
});

void test('rejects malformed input instead of hanging or over-reading', () => {
  // Truncated PNG: magic present, IHDR missing.
  assert.throws(() => readSize(png(10, 10).subarray(0, 18)));
  // Zero-length JPEG segment would loop forever without the progress check.
  assert.throws(() => readSize(jpeg(10, 10, 0)));
  // No SOF within the window.
  assert.throws(() => readSize(Buffer.concat([Buffer.from([0xff, 0xd8])])));
  // Unknown magic.
  assert.throws(() => readSize(Buffer.alloc(64)));
});
