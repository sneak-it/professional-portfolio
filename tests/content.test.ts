import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  isDraft,
  list,
  listDir,
  listMdxFiles,
  readMdxFile,
  strings,
  text,
} from '../lib/content.ts';

void test('list passes arrays through and rejects everything else', () => {
  assert.deepEqual(list([1, 2]), [1, 2]);
  assert.deepEqual(list('nope'), []);
  assert.deepEqual(list(undefined), []);
  assert.deepEqual(list({ 0: 'a' }), []);
});

// The hero's typewriter indexes words[0] unconditionally.
void test('strings drops non-string entries instead of coercing them', () => {
  assert.deepEqual(strings(['a', 2, null, 'b']), ['a', 'b']);
  assert.deepEqual(strings([{ x: 1 }]), []);
  assert.deepEqual(strings('nope'), []);
  assert.deepEqual(strings(undefined), []);
});

void test('text falls back for missing, blank, and non-string values', () => {
  assert.equal(text('hi', 'fb'), 'hi');
  assert.equal(text('', 'fb'), 'fb');
  assert.equal(text('   ', 'fb'), 'fb');
  assert.equal(text(undefined, 'fb'), 'fb');
  assert.equal(text(42, 'fb'), 'fb');
});

void test('listDir is quiet for a missing dir and loud for an unreadable one', () => {
  const errors: unknown[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => errors.push(args);
  try {
    assert.deepEqual(listDir('/nonexistent-content-dir'), []);
    assert.equal(errors.length, 0, 'ENOENT is a designed state, not an error');

    // A file is not a dir: ENOTDIR stands in for the EACCES a bind mount the
    // container cannot read would produce.
    assert.deepEqual(listDir('lib/content.ts'), []);
    assert.equal(errors.length, 1);
  } finally {
    console.error = original;
  }
});

void test('listMdxFiles drops drafts while readMdxFile still returns them', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdx-'));
  try {
    fs.writeFileSync(path.join(dir, 'live.mdx'), '---\ntitle: Live\n---\nbody');
    fs.writeFileSync(
      path.join(dir, 'wip.mdx'),
      '---\ntitle: WIP\ndraft: true\n---\nbody',
    );

    assert.deepEqual(
      listMdxFiles(dir).map((f) => f.slug),
      ['live.mdx'.replace('.mdx', '')],
      'the draft is not listed',
    );
    // Still reachable by slug: that is what makes preview-by-URL work.
    assert.equal(readMdxFile(dir, 'wip')?.data.draft, true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

void test('isDraft only accepts the literal true', () => {
  assert.equal(isDraft({ draft: true }), true);
  assert.equal(isDraft({ draft: 'true' }), false);
  assert.equal(isDraft({ draft: 1 }), false);
  assert.equal(isDraft({}), false);
});
