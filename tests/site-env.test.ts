import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GITHUB_PLACEHOLDER,
  LINKEDIN_PLACEHOLDER,
  background,
  brandVersion,
  licenseUrl,
  monogram,
  profileUrls,
  siteUrl,
  theme,
} from '../lib/site-env.ts';

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

void test('brandVersion is stable per input and moves with any part', () => {
  const base = ['IRT', 'Title', 'Author', 'Desc'];
  assert.equal(brandVersion(base), brandVersion([...base]));
  assert.notEqual(brandVersion(base), brandVersion(['IRX', ...base.slice(1)]));
  assert.notEqual(brandVersion(base), brandVersion([...base.slice(0, 3), 'X']));
  // NUL-joined, so a shifted boundary yields a different hash.
  assert.notEqual(brandVersion(['a', 'b']), brandVersion(['ab']));
});

void test('brandVersion emits a URL-safe token', () => {
  assert.match(brandVersion(['a']), /^[A-Za-z0-9_-]{12}$/);
});

void test('profileUrls drops placeholders and blanks', () => {
  assert.deepEqual(
    profileUrls(
      [GITHUB_PLACEHOLDER, '', 'https://linkedin.com/in/ian'],
      undefined,
    ),
    ['https://linkedin.com/in/ian'],
  );
  assert.deepEqual(
    profileUrls([GITHUB_PLACEHOLDER, LINKEDIN_PLACEHOLDER], ''),
    [],
  );
});

void test('profileUrls splits, trims, and dedupes SITE_PROFILE_URLS', () => {
  assert.deepEqual(
    profileUrls(
      ['https://github.com/a'],
      ' https://bsky.app/profile/a , https://github.com/a,,',
    ),
    ['https://github.com/a', 'https://bsky.app/profile/a'],
  );
});

void test('profileUrls rejects non-http(s) entries', () => {
  assert.deepEqual(
    profileUrls([], 'javascript:alert(1),example.com,mailto:a@b.c'),
    [],
  );
});

void test('licenseUrl keeps site paths and http(s) URLs only', () => {
  assert.equal(licenseUrl('/contact'), '/contact');
  assert.equal(
    licenseUrl(' https://creativecommons.org/licenses/by/4.0/ '),
    'https://creativecommons.org/licenses/by/4.0/',
  );
  assert.equal(licenseUrl('//evil.example'), '');
  assert.equal(licenseUrl('/\\evil.example'), '');
  assert.equal(licenseUrl('javascript:alert(1)'), '');
  assert.equal(licenseUrl('contact'), '');
  assert.equal(licenseUrl(undefined), '');
  assert.equal(licenseUrl('  '), '');
});

void test('background defaults to the still gradient', (t) => {
  const warn = t.mock.method(console, 'warn', () => undefined);
  assert.equal(background(undefined), 'gradient');
  assert.equal(background(''), 'gradient');
  assert.equal(background('gradient'), 'gradient');
  assert.equal(warn.mock.callCount(), 0);
});

void test('background accepts topographic, trimmed and case-insensitive', () => {
  assert.equal(background('topographic'), 'topographic');
  assert.equal(background(' Topographic '), 'topographic');
});

void test('background accepts the still patterns', () => {
  assert.equal(background('solid'), 'solid');
  assert.equal(background(' DOTS '), 'dots');
  assert.equal(background('grain'), 'grain');
});

void test('background falls back to the gradient for unknown values', (t) => {
  const warn = t.mock.method(console, 'warn', () => undefined);
  assert.equal(background('shader'), 'gradient');
  assert.equal(warn.mock.callCount(), 1);
});

void test('theme defaults to sunset', (t) => {
  const warn = t.mock.method(console, 'warn', () => undefined);
  assert.equal(theme(undefined), 'sunset');
  assert.equal(theme(''), 'sunset');
  assert.equal(theme('sunset'), 'sunset');
  assert.equal(warn.mock.callCount(), 0);
});

void test('theme accepts each name, trimmed and case-insensitive', () => {
  assert.equal(theme(' Ocean '), 'ocean');
  assert.equal(theme('forest'), 'forest');
  assert.equal(theme('VIOLET'), 'violet');
});

void test('theme falls back to sunset for unknown values', (t) => {
  const warn = t.mock.method(console, 'warn', () => undefined);
  assert.equal(theme('mono'), 'sunset');
  assert.equal(warn.mock.callCount(), 1);
});
