import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { sanitize } from '../lib/media.ts';

/** The EXIF guarantee, asserted rather than documented. */

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'media-test-'));

/** `sanitize` takes a path, so fixtures need a file. */
function scratch(name: string, body: Buffer): string {
  const file = path.join(tmp, name);
  fs.writeFileSync(file, body);
  return file;
}

async function metadata(body: Buffer) {
  const { exif, xmp, iptc, width, height } = await sharp(body).metadata();
  return { hasMetadata: Boolean(exif || xmp || iptc), width, height };
}

void test('sanitize drops every metadata block', async () => {
  const original = await sharp({
    create: { width: 600, height: 400, channels: 3, background: '#c33' },
  })
    .withExifMerge({
      IFD0: { Artist: 'admin', Model: 'iPhone', Copyright: 'private' },
      IFD3: { GPSLatitudeRef: 'N', GPSLongitudeRef: 'W' },
    })
    .jpeg()
    .toBuffer();

  // Guard the fixture: stripping nothing must not pass.
  assert.equal((await metadata(original)).hasMetadata, true);

  const { body, contentType } = await sanitize(scratch('exif.jpg', original));
  assert.equal(contentType, 'image/jpeg');
  assert.equal((await metadata(body)).hasMetadata, false);
});

void test('sanitize bakes in orientation instead of serving it sideways', async () => {
  // 600x400 stored, flagged for a quarter turn, so it displays 400x600.
  const original = await sharp({
    create: { width: 600, height: 400, channels: 3, background: '#39f' },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();

  const { body } = await sanitize(scratch('rotated.jpg', original));
  const after = await metadata(body);
  assert.equal(after.hasMetadata, false);
  assert.deepEqual(
    { width: after.width, height: after.height },
    { width: 400, height: 600 },
  );
});

void test('sanitize caps the long edge', async () => {
  const original = await sharp({
    create: { width: 6000, height: 4000, channels: 3, background: '#444' },
  })
    .jpeg()
    .toBuffer();

  const { body } = await sanitize(scratch('huge.jpg', original));
  assert.equal((await metadata(body)).width, 3840);
});

void test('sanitize keeps animated frames instead of flattening them', async () => {
  const frames = Buffer.concat(
    await Promise.all(
      ['#f00', '#0f0', '#00f'].map((background) =>
        sharp({ create: { width: 40, height: 40, channels: 3, background } })
          .raw()
          .toBuffer(),
      ),
    ),
  );
  const original = await sharp(frames, {
    raw: { width: 40, height: 120, channels: 3, pageHeight: 40 },
  })
    .gif({ loop: 0, delay: [100, 100, 100] })
    .toBuffer();

  const { body, contentType } = await sanitize(scratch('anim.gif', original));
  assert.equal(contentType, 'image/gif');
  const after = await sharp(body, { animated: true }).metadata();
  assert.equal(after.pages, 3);
  assert.equal(Boolean(after.exif || after.xmp || after.iptc), false);
});

void test('sanitize passes SVG through, since it carries no EXIF', async () => {
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
      'width="10" height="10"><rect width="10" height="10"/></svg>',
  );
  const { body, contentType } = await sanitize(scratch('x.svg', svg));
  assert.equal(contentType, 'image/svg+xml');
  assert.deepEqual(body, svg);
});

void test('sanitize fails closed rather than falling back to raw bytes', async () => {
  const notAnImage = scratch('x.bin', Buffer.from('definitely not an image'));
  await assert.rejects(() => sanitize(notAnImage));
});

/** Every file under `dir`, recursively, excluding dotfiles. */
function filesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => path.join(e.parentPath, e.name));
}

void test('public/ holds no images, because Next serves it verbatim', async () => {
  for (const file of filesIn(path.join(process.cwd(), 'public'))) {
    const decodable = await sharp(file)
      .metadata()
      .then(
        () => true,
        () => false,
      );
    assert.equal(
      decodable,
      false,
      `${file} is an image in public/, which is served without stripping. Move it to media/.`,
    );
  }
});

void test('no committed image carries metadata into git history', async (t) => {
  let tracked: string[];
  try {
    tracked = execFileSync('git', ['ls-files', '-z', 'media'], {
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean);
  } catch {
    t.skip('not a git checkout');
    return;
  }

  for (const file of tracked) {
    const meta = await sharp(file)
      .metadata()
      .catch(() => null);
    if (meta === null) continue; // not a raster sharp can read (SVG included)
    assert.equal(
      Boolean(meta.exif || meta.xmp || meta.iptc),
      false,
      `${file} carries metadata and is committed. Stripping on the way out does not help: git keeps the original forever.`,
    );
  }
});

test.after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});
