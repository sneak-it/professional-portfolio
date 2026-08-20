import assert from 'node:assert/strict';
import test from 'node:test';
import { safeSlug } from '../lib/slug.ts';

// safeSlug is the only thing between a route param and a filesystem path
// (lib/content.ts builds `${dir}/${slug}.mdx` from its return value), so these
// assert the guard rather than the happy path.

void test('safeSlug accepts plain slugs and strips one .mdx', () => {
  assert.equal(safeSlug('my-post'), 'my-post');
  assert.equal(safeSlug('a_b-1'), 'a_b-1');
  assert.equal(safeSlug('ABC123'), 'ABC123');
  assert.equal(safeSlug('my-post.mdx'), 'my-post');
});

void test('safeSlug rejects path traversal', () => {
  for (const slug of [
    '..',
    '../etc/passwd',
    '../../etc/passwd',
    '..%2Fetc',
    'a/b',
    'a\\b',
    '/etc/passwd',
    './a',
    'a/../b',
  ]) {
    assert.equal(safeSlug(slug), null, slug);
  }
});

void test('safeSlug rejects anything that is not a bare slug', () => {
  for (const slug of [
    '', // empty
    '.',
    'a.mdx.mdx', // only one suffix is stripped, the dot then fails
    'a.txt',
    'post name', // space
    ' post',
    'post ',
    'post\n',
    'a\0b', // null byte
    'café', // non-ASCII
    'пост', // cyrillic
    'a:b',
    'a?b=1',
    'a#frag',
    '%2e%2e',
  ]) {
    assert.equal(safeSlug(slug), null, JSON.stringify(slug));
  }
});
