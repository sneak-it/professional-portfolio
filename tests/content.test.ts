import assert from 'node:assert/strict';
import test from 'node:test';
import { list, strings, text } from '../lib/content.ts';

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
