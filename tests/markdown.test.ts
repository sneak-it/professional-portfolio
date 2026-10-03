import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import {
  activeHeading,
  firstParagraph,
  headings,
  readTime,
  rehypeHeadingIds,
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

void test('headings collects h2 and h3 only, in source order', () => {
  const items = headings(
    '# Title\n\n## One\n\ntext\n\n### Deep\n\n#### Ignored\n\n## Two\n',
  );
  assert.deepEqual(items, [
    { depth: 2, text: 'One', id: 'one' },
    { depth: 3, text: 'Deep', id: 'deep' },
    { depth: 2, text: 'Two', id: 'two' },
  ]);
});

void test('headings ignores hashes inside fenced code', () => {
  assert.deepEqual(headings('```sh\n## not a heading\n```\n\n## Real\n'), [
    { depth: 2, text: 'Real', id: 'real' },
  ]);
});

void test('headings flattens inline markdown the same way the anchor does', () => {
  assert.deepEqual(headings('## The `code` and **bold** bit\n'), [
    { depth: 2, text: 'The code and bold bit', id: 'the-code-and-bold-bit' },
  ]);
  assert.deepEqual(headings('## A [link](/somewhere) here\n'), [
    { depth: 2, text: 'A link here', id: 'a-link-here' },
  ]);
  assert.deepEqual(headings('## Raise __max_connections__ first\n'), [
    {
      depth: 2,
      text: 'Raise max_connections first',
      id: 'raise-max-connections-first',
    },
  ]);
});

void test('headings numbers repeated titles and drops unslugable ones', () => {
  const ids = headings('## Setup\n\n## Setup\n\n## Setup 1\n').map((h) => h.id);
  assert.deepEqual(ids, ['setup', 'setup-1', 'setup-1-1']);
  assert.deepEqual(headings('##Tight\n\n## ***\n'), []);
});

void test('compiled h2 and h3 ids match headings()', async () => {
  const source =
    '## Setup\n\n### Notes\n\n## Setup\n\n### Notes\n\n## The `code` [bit](/x)\n\n## Tuning max_connections\n\nA note.[^1]\n\n[^1]: Footnote.\n';
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHeadingIds],
      },
    },
  });
  const html = renderToStaticMarkup(content);
  const ids = [...html.matchAll(/<h[23][^>]* id="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, [
    ...headings(source).map((h) => h.id),
    'footnote-label',
  ]);
});

// Tops are px from the viewport top, in document order; the line is 104px.
void test('activeHeading is -1 above the first heading', () => {
  assert.equal(activeHeading([150, 900, 1600], 104, false), -1);
});

void test('activeHeading picks the last heading above the line', () => {
  assert.equal(activeHeading([-400, 40, 600], 104, false), 1);
});

void test('activeHeading counts a heading exactly on the line', () => {
  assert.equal(activeHeading([-300, 104, 700], 104, false), 1);
});

void test('activeHeading picks the last heading at the bottom of the page', () => {
  assert.equal(activeHeading([-1200, -500, 400], 104, true), 2);
});

void test('activeHeading is -1 with no headings', () => {
  assert.equal(activeHeading([], 104, false), -1);
  assert.equal(activeHeading([], 104, true), -1);
});
