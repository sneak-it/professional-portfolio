import assert from 'node:assert/strict';
import test from 'node:test';
import { isSafeHref } from '../lib/href.ts';

// The scheme allowlist behind SafeLink. The obfuscation cases matter more than
// the plain ones: they are what a regex-based check would let through.

void test('isSafeHref allows http, https, and mailto', () => {
  for (const href of [
    'https://example.com',
    'http://example.com',
    'HTTPS://EXAMPLE.COM',
    'mailto:someone@example.com',
  ]) {
    assert.equal(isSafeHref(href), true, href);
  }
});

void test('isSafeHref allows relative hrefs, which resolve to https', () => {
  for (const href of ['/about', 'about', '#section', '?page=2', '']) {
    assert.equal(isSafeHref(href), true, JSON.stringify(href));
  }
});

void test('isSafeHref rejects javascript: however it is spelled', () => {
  for (const href of [
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'java\nscript:alert(1)', // newline inside the scheme
    'java\tscript:alert(1)', // tab inside the scheme
    'java\r\nscript:alert(1)',
    ' javascript:alert(1)', // leading space is trimmed by the parser
    '\njavascript:alert(1)',
    'javascript\n:alert(1)',
  ]) {
    assert.equal(isSafeHref(href), false, JSON.stringify(href));
  }
});

void test('isSafeHref rejects every other scheme', () => {
  for (const href of [
    'data:text/html,<script>alert(1)</script>',
    'data:image/svg+xml;base64,PHN2Zy8+',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'blob:https://example.com/uuid',
    'ftp://example.com',
    'tel:+15551234',
    'ws://example.com',
  ]) {
    assert.equal(isSafeHref(href), false, href);
  }
});

void test('isSafeHref rejects non-strings', () => {
  for (const href of [null, undefined, 42, {}, [], true, () => 'x']) {
    assert.equal(isSafeHref(href), false, String(href));
  }
});

// A space (rather than a tab or newline) does not get stripped, so the value
// stays a relative path on this origin instead of becoming a scheme.
void test('isSafeHref treats a spaced scheme as a relative path', () => {
  assert.equal(isSafeHref('java script:alert(1)'), true);
});

// Markdown entity-escapes like `[x](java&#10;script:alert(1))` reach this
// function already percent-encoded. That is safe for a different reason than
// the cases above: a scheme cannot contain '%', so the colon never starts one
// and the browser resolves the whole thing as a path on our own origin.
void test('isSafeHref treats a percent-encoded scheme as a relative path', () => {
  const href = 'java%0Ascript:alert(1)';
  assert.equal(isSafeHref(href), true);
  assert.equal(
    new URL(href, 'https://site.example/blog/post').protocol,
    'https:',
  );
});

// Protocol-relative hrefs inherit https and are allowed. SafeLink's
// `isExternal` test is `^https?://`, so these do not get target="_blank", but
// they do still get the unconditional rel="noopener noreferrer nofollow ugc".
void test('isSafeHref allows protocol-relative hrefs', () => {
  assert.equal(isSafeHref('//example.com/x'), true);
});
