import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {
  coverFit,
  coverSizes,
  imageDimensions,
  isLocalSrc,
  mediaDir,
  mediaFilePath,
} from '../lib/image.ts';

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
  const dir = '/srv/app/media';
  assert.equal(
    mediaFilePath('/media/images/a.png', dir),
    '/srv/app/media/images/a.png',
  );
  assert.equal(mediaFilePath('/media', dir), '/srv/app/media');

  // Anything resolving outside media/ resolves to nothing, including the
  // sibling directory Next *does* serve verbatim.
  assert.equal(mediaFilePath('/public/images/a.png', dir), null);
  assert.equal(mediaFilePath('/images/a.png', dir), null);
  assert.equal(mediaFilePath('/media/../public/a.png', dir), null);
  assert.equal(mediaFilePath('/media/../../etc/passwd', dir), null);
  assert.equal(mediaFilePath('/media/../media-x/a.png', dir), null);
  assert.equal(mediaFilePath('/mediax/a.png', dir), null);
  assert.equal(mediaFilePath('/../../etc/passwd', dir), null);
  assert.equal(mediaFilePath('//evil.example/x.png', dir), null);
  assert.equal(mediaFilePath('https://evil.example/x.png', dir), null);
  assert.equal(mediaFilePath('media/images/a.png', dir), null);
  assert.equal(mediaFilePath(undefined, dir), null);
});

void test('mediaDir defaults to ./media and resolves MEDIA_DIR', () => {
  assert.equal(mediaDir(undefined), path.resolve('media'));
  assert.equal(mediaDir('   '), path.resolve('media'));
  assert.equal(mediaDir(' /srv/media '), '/srv/media');
  assert.equal(mediaDir('../private'), path.resolve('../private'));
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

void test('coverSizes widens each slot by how far the photo overflows its box', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cover-test-'));
  process.env.MEDIA_DIR = dir;
  const write = (name: string, width: number, height: number) =>
    sharp({ create: { width, height, channels: 3, background: '#c33' } })
      .jpeg()
      .toFile(path.join(dir, name));
  await write('wide.jpg', 1600, 900);
  await write('tall.jpg', 900, 1600);
  const sizes = '(max-width: 48rem) 100vw, 24rem';

  // 16:9 in a 4:5 box: drawn at 2.23 box widths.
  assert.equal(
    await coverSizes('/media/wide.jpg', sizes, 4 / 5),
    '(max-width: 48rem) calc(100vw * 2.23), calc(24rem * 2.23)',
  );
  // Narrower than the box: it fills the width, so the slot already fits.
  assert.equal(await coverSizes('/media/tall.jpg', sizes, 1), sizes);
  // Unmeasurable sources keep the box width.
  assert.equal(await coverSizes('/media/missing.jpg', sizes, 1), sizes);
  assert.equal(await coverSizes(null, sizes, 1), sizes);
  delete process.env.MEDIA_DIR;
});

void test('coverFit fills ordinary covers and fits the rest', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fit-test-'));
  process.env.MEDIA_DIR = dir;
  const write = (name: string, width: number, height: number, alpha = 1) =>
    sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 200, g: 50, b: 50, alpha },
      },
    }).toFile(path.join(dir, name));
  await write('photo.jpg', 1600, 1200);
  await write('wide.jpg', 1600, 900);
  await write('screenshot.png', 1000, 1030);
  await write('logo.png', 1000, 153, 0);
  await write('small.jpg', 170, 128);
  await sharp({
    create: { width: 2000, height: 1500, channels: 4, background: '#c33' },
  })
    .composite([
      {
        input: {
          create: {
            width: 2000,
            height: 100,
            channels: 4,
            background: '#000',
          },
        },
        top: 0,
        left: 0,
        blend: 'dest-out',
      },
    ])
    .png()
    .toFile(path.join(dir, 'strip.png'));
  fs.writeFileSync(
    path.join(dir, 'logo.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30"><rect x="10" y="5" width="80" height="20" fill="#333"/></svg>',
  );

  assert.equal(await coverFit('/media/photo.jpg', 4 / 3), null);
  assert.equal(await coverFit('/media/photo.jpg'), null);
  // 16:9 in 4:3 crops exactly a quarter.
  assert.equal(await coverFit('/media/wide.jpg', 4 / 3), null);
  // screenshot: an alpha channel with nothing transparent in it.
  assert.deepEqual(await coverFit('/media/screenshot.png', 4 / 3), {
    backdrop: 'blur',
    maxWidth: 1000,
    maxHeight: 1030,
  });
  assert.equal(await coverFit('/media/screenshot.png', 4 / 3, 0.5), null);
  // unknown box
  assert.equal(await coverFit('/media/screenshot.png', Infinity), null);
  assert.deepEqual(await coverFit('/media/logo.png', 4 / 3), {
    backdrop: 'panel',
    maxWidth: 1000,
    maxHeight: 153,
  });
  // strip: survives the downscale before the check.
  assert.equal((await coverFit('/media/strip.png', 4 / 3))?.backdrop, 'panel');
  const small = { backdrop: 'blur', maxWidth: 170, maxHeight: 128 };
  assert.deepEqual(await coverFit('/media/small.jpg', 4 / 3), small);
  assert.deepEqual(await coverFit('/media/small.jpg'), small);
  // svg: no pixel cap on a vector.
  assert.deepEqual(await coverFit('/media/logo.svg', 4 / 3), {
    backdrop: 'panel',
  });

  // replaced: same name, new mtime, opaque now.
  const logo = path.join(dir, 'logo.png');
  await write('logo.png', 1600, 1200);
  const later = new Date(Date.now() + 60_000);
  fs.utimesSync(logo, later, later);
  assert.equal(await coverFit('/media/logo.png', 4 / 3), null);

  assert.equal(await coverFit('/media/missing.png', 4 / 3), null);
  assert.equal(await coverFit(null, 4 / 3), null);
  assert.equal(await coverFit('https://example.com/a.png', 4 / 3), null);
  delete process.env.MEDIA_DIR;
});
