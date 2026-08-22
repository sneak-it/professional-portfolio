import assert from 'node:assert/strict';
import test from 'node:test';
import {
  firstParagraph,
  readTime,
  stripFences,
  wordCount,
} from '../lib/markdown.ts';

void test('stripFences removes fenced blocks and their contents', () => {
  assert.equal(stripFences('a\n```ts\nconst x = 1;\n```\nb\n'), 'a\nb\n');
  assert.equal(stripFences('a\n~~~\ncode\n~~~\nb\n'), 'a\nb\n');
  assert.equal(stripFences('a\n  ```\n  code\n  ```\nb\n'), 'a\nb\n');
  assert.equal(
    stripFences('a\n```\nx\n```\nmid\n```\ny\n```\nz\n'),
    'a\nmid\nz\n',
  );
});

// The regression the /m-flag `$` bug caused: only the marker lines were removed.
void test('stripFences closes an unterminated fence at end of input', () => {
  assert.equal(stripFences('a\n```\nconst x = 1;\n# not a heading\n'), 'a\n');
});

void test('stripFences leaves prose and inline code alone', () => {
  assert.equal(stripFences('use `code` inline\n'), 'use `code` inline\n');
  assert.equal(stripFences('# heading\ntext\n'), '# heading\ntext\n');
});

void test('wordCount ignores fenced code', () => {
  const body = 'one two three\n```\nlots of code words here indeed\n```\n';
  assert.equal(wordCount(body), 3);
  assert.equal(wordCount(''), 0);
});

void test('readTime rounds to a minimum of one minute', () => {
  assert.equal(readTime('a few words'), '1 min read');
  assert.equal(readTime(''), '1 min read');
  assert.equal(readTime('word '.repeat(900)), '4 min read');
});

void test('readTime is not inflated by a long code block', () => {
  const body = `short intro\n\n\`\`\`json\n${'"key": "value",\n'.repeat(400)}\`\`\`\n`;
  assert.equal(readTime(body), '1 min read');
});

void test('firstParagraph takes the first prose line', () => {
  assert.equal(
    firstParagraph('# Title\n\nThe first real sentence.\n\nMore.\n'),
    'The first real sentence.',
  );
});

void test('firstParagraph skips structure and fenced code', () => {
  const body = [
    '## Heading',
    '> a quote',
    '| a | b |',
    '- a list item',
    '![an image](/x.png)',
    '<Figure src="/x.png" />',
    '```',
    'code prose-looking line',
    '```',
    'Actual prose.',
  ].join('\n');
  assert.equal(firstParagraph(body), 'Actual prose.');
});

void test('firstParagraph flattens links and emphasis', () => {
  assert.equal(
    firstParagraph('See **the [docs](https://x.dev)** for `more` details.\n'),
    'See the docs for more details.',
  );
});

void test('firstParagraph truncates on a word boundary', () => {
  const long = `${'word '.repeat(60)}end.`;
  const out = firstParagraph(long);
  assert.ok(out.length <= 201, `length ${out.length}`);
  assert.ok(out.endsWith('…'));
  assert.ok(!out.includes('wor…'));
});

void test('firstParagraph returns empty for a body with no prose', () => {
  assert.equal(firstParagraph(''), '');
  assert.equal(firstParagraph('\n\n   \n'), '');
  assert.equal(firstParagraph('<Figure src="/x.png" />\n'), '');
  assert.equal(firstParagraph('```\nonly code\n```\n'), '');
});
