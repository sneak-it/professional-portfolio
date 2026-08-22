import assert from 'node:assert/strict';
import test from 'node:test';
import { inspect } from 'node:util';
import { isSafeHref } from '../lib/href.ts';

// The scheme allowlist behind SafeLink. The obfuscation cases are the point.

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
    // inspect, not String: the list includes {} and a function.
    assert.equal(isSafeHref(href), false, inspect(href));
  }
});

// A space isn't stripped, so the value stays a relative path.
void test('isSafeHref treats a spaced scheme as a relative path', () => {
  assert.equal(isSafeHref('java script:alert(1)'), true);
});

// Entity-escapes arrive already percent-encoded. A scheme cannot contain '%',
// so the browser resolves this as a path on our origin.
void test('isSafeHref treats a percent-encoded scheme as a relative path', () => {
  const href = 'java%0Ascript:alert(1)';
  assert.equal(isSafeHref(href), true);
  assert.equal(
    new URL(href, 'https://site.example/blog/post').protocol,
    'https:',
  );
});

// Protocol-relative inherits https and is allowed. SafeLink's `isExternal` is
// `^https?://`, so no target="_blank", but rel is applied unconditionally.
void test('isSafeHref allows protocol-relative hrefs', () => {
  assert.equal(isSafeHref('//example.com/x'), true);
});
