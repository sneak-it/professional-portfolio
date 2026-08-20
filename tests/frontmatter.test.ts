import assert from 'node:assert/strict';
import test from 'node:test';
import { parseFrontmatter } from '../lib/frontmatter.ts';

void test('parseFrontmatter splits data from content', () => {
  assert.deepEqual(parseFrontmatter('---\ntitle: A\n---\nbody'), {
    data: { title: 'A' },
    content: 'body',
  });
});

void test('parseFrontmatter handles CRLF and a missing trailing newline', () => {
  assert.deepEqual(parseFrontmatter('---\r\ntitle: A\r\n---\r\nbody'), {
    data: { title: 'A' },
    content: 'body',
  });
  assert.deepEqual(parseFrontmatter('---\ntitle: A\n---'), {
    data: { title: 'A' },
    content: '',
  });
});

// No delimiters, or delimiters that do not start the file, means no
// frontmatter: the whole input is content.
void test('parseFrontmatter passes through when there is no frontmatter', () => {
  for (const src of ['', 'just body', 'text\n---\ntitle: A\n---\n']) {
    assert.deepEqual(
      parseFrontmatter(src),
      { data: {}, content: src },
      JSON.stringify(src),
    );
  }
});

// An empty block does not match the regex (it needs a line between the
// delimiters), so the delimiters stay in the content.
void test('parseFrontmatter leaves an empty block alone', () => {
  const src = '---\n---\nbody';
  assert.deepEqual(parseFrontmatter(src), { data: {}, content: src });
});

// Scalar YAML parses to a string. Callers read `data[key]`, which is undefined
// on a string, so a required-field check treats it as missing rather than
// throwing.
void test('parseFrontmatter does not throw on non-object frontmatter', () => {
  const { content } = parseFrontmatter('---\nfoo\n---\nbody');
  assert.equal(content, 'body');
  assert.equal(parseFrontmatter('---\nfoo\n---\nbody').data as unknown, 'foo');
});

// Malformed YAML throws. readMdxFile wraps this in a try/catch and skips the
// file, so a bad content file cannot take a page down.
void test('parseFrontmatter throws on malformed YAML', () => {
  assert.throws(() => parseFrontmatter('---\na: [\n---\nbody'));
});
