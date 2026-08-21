import assert from 'node:assert/strict';
import test from 'node:test';
import { monogram, siteUrl } from '../lib/site-env.ts';

const DEFAULT_URL = 'http://localhost:3000';

void test('siteUrl accepts absolute http(s) origins and strips the trailing slash', () => {
  assert.equal(siteUrl('https://example.com'), 'https://example.com');
  assert.equal(siteUrl('https://example.com/'), 'https://example.com');
  assert.equal(siteUrl('  http://example.com/  '), 'http://example.com');
});

// This value reaches `metadataBase` and the JSON-LD `url`.
void test('siteUrl rejects scheme-less and non-http(s) values', () => {
  assert.equal(siteUrl('example.com'), DEFAULT_URL);
  assert.equal(siteUrl('javascript:alert(1)'), DEFAULT_URL);
  assert.equal(siteUrl('mailto:a@b.c'), DEFAULT_URL);
  assert.equal(siteUrl('://'), DEFAULT_URL);
});

void test('siteUrl falls back for unset and blank values', () => {
  assert.equal(siteUrl(undefined), DEFAULT_URL);
  assert.equal(siteUrl(''), DEFAULT_URL);
  assert.equal(siteUrl('   '), DEFAULT_URL);
});

void test('monogram bounds the value to three characters', () => {
  assert.equal(monogram('ABCDE'), 'ABC');
  assert.equal(monogram(' AB '), 'AB');
  assert.equal(monogram(undefined), 'YN');
  assert.equal(monogram('   '), 'YN');
});
