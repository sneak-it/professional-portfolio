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
const { getPortfolioPage, getSection } = await import('../lib/portfolio.ts');

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
