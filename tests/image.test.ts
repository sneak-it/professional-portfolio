import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { imageDimensions, isLocalSrc, mediaFilePath } from '../lib/image.ts';

void test('isLocalSrc accepts only same-origin paths', () => {
  for (const src of [
    '/a.png',
    '/media/images/blog/x.webp',
    '/media/portfolio/p/1.jpg',
    '/',
  ]) {
    assert.equal(isLocalSrc(src), true, src);
  }
  for (const src of [
    'https://evil.example/x.png',
    'http://evil.example/x.png',
    '//evil.example/x.png', // protocol-relative
    'data:image/svg+xml;base64,PHN2Zy8+',
    'javascript:alert(1)',
    'media/images/x.png', // relative, resolves off the current route
    '',
    undefined,
    null,
    42,
  ]) {
    assert.equal(isLocalSrc(src), false, String(src));
  }
});

void test('mediaFilePath keeps env- and URL-supplied paths inside media/', () => {
  const root = '/srv/app';
  assert.equal(
    mediaFilePath('/media/images/a.png', root),
    '/srv/app/media/images/a.png',
  );
  assert.equal(mediaFilePath('/media', root), '/srv/app/media');

  // Anything resolving outside media/ resolves to nothing, including the
  // sibling directory Next *does* serve verbatim.
  assert.equal(mediaFilePath('/public/images/a.png', root), null);
  assert.equal(mediaFilePath('/images/a.png', root), null);
  assert.equal(mediaFilePath('/media/../public/a.png', root), null);
  assert.equal(mediaFilePath('/media/../../etc/passwd', root), null);
  assert.equal(mediaFilePath('/../../etc/passwd', root), null);
  assert.equal(mediaFilePath('//evil.example/x.png', root), null);
  assert.equal(mediaFilePath('https://evil.example/x.png', root), null);
  assert.equal(mediaFilePath('media/images/a.png', root), null);
  assert.equal(mediaFilePath(undefined, root), null);
});

void test('imageDimensions reports the served size: turned, long edge capped', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'image-test-'));
  const write = async (
    name: string,
    width: number,
    height: number,
    orientation?: number,
  ) => {
    const file = path.join(dir, name);
    let img = sharp({
      create: { width, height, channels: 3, background: '#c33' },
    });
    if (orientation) img = img.withMetadata({ orientation });
    await img.jpeg().toFile(file);
    return file;
  };
  assert.deepEqual(await imageDimensions(await write('big.jpg', 5000, 2000)), {
    width: 3840,
    height: 1536,
  });
  assert.deepEqual(
    await imageDimensions(await write('turned.jpg', 5000, 2000, 6)),
    { width: 1536, height: 3840 },
  );
  assert.deepEqual(await imageDimensions(await write('small.jpg', 600, 400)), {
    width: 600,
    height: 400,
  });
});
