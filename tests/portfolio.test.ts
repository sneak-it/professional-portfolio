import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-'));
after(() => {
  fs.rmSync(root, { recursive: true, force: true });
});
process.env.CONTENT_DIR = root;
process.env.MEDIA_DIR = path.join(root, 'media');
const { galleryPhotosChanged, getPortfolioPage, getSection } =
  await import('../lib/portfolio.ts');

// readMdxFile caches by mtime, so each rewrite moves the mtime forward.
let mtime = Date.now() / 1000;
function writePortfolio(yaml: string) {
  const file = path.join(root, 'portfolio.mdx');
  fs.writeFileSync(file, `---\n${yaml}\n---\n`);
  mtime += 1;
  fs.utimesSync(file, mtime, mtime);
}

void test('sections fall back to folder names and no description', () => {
  assert.deepEqual(getSection('technology-consulting'), {
    slug: 'technology-consulting',
    type: 'project',
    name: 'Technology Consulting',
    description: '',
    note: '',
  });
  assert.equal(getPortfolioPage().description, '');
});

void test('content/portfolio.mdx sets the hub description and section copy', () => {
  writePortfolio(
    "description: 'Hub.'\nsections:\n  photography:\n    name: 'Photos'\n    description: 'Mine.'\n    note: 'Rights.'",
  );
  assert.equal(getPortfolioPage().description, 'Hub.');
  assert.deepEqual(getSection('photography'), {
    slug: 'photography',
    type: 'gallery',
    name: 'Photos',
    description: 'Mine.',
    note: 'Rights.',
  });
  assert.equal(getSection('open-source')?.name, 'Open Source');
});

void test('non-text values and unknown section keys are ignored', () => {
  writePortfolio(
    "sections:\n  photography:\n    name: 2019\n  bogus:\n    name: 'X'",
  );
  assert.equal(getSection('photography')?.name, 'Photography');
  assert.equal(getSection('bogus'), null);
});

void test('galleryPhotosChanged takes the newest of the folder and its photos', () => {
  const dir = path.join(root, 'media/portfolio/photography/trip');
  const at = (iso: string) => new Date(iso);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'a.jpg'), '');
  fs.writeFileSync(path.join(dir, 'notes.txt'), '');
  fs.utimesSync(path.join(dir, 'a.jpg'), at('2026-01-01'), at('2026-01-01'));
  fs.utimesSync(
    path.join(dir, 'notes.txt'),
    at('2026-06-01'),
    at('2026-06-01'),
  );
  fs.utimesSync(dir, at('2026-02-01'), at('2026-02-01'));
  assert.equal(
    galleryPhotosChanged('trip')?.toISOString(),
    '2026-02-01T00:00:00.000Z',
  );
  fs.utimesSync(path.join(dir, 'a.jpg'), at('2026-03-01'), at('2026-03-01'));
  assert.equal(
    galleryPhotosChanged('trip')?.toISOString(),
    '2026-03-01T00:00:00.000Z',
  );
  assert.equal(galleryPhotosChanged('missing'), undefined);
});
