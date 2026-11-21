import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { remarkCardWrap } from '../lib/cards.ts';
import { hardenRawHtml } from '../lib/harden.ts';
import { remarkMermaid } from '../lib/mermaid.ts';

// Project-page plugin order from components/MDXComponents.tsx, with stub cards.
async function render(source: string) {
  const { content } = await compileMDX({
    source,
    components: {
      Card: ({ title, children }: { title?: string; children?: ReactNode }) =>
        createElement('section', { 'data-title': title }, children),
      CardRow: ({ children }: { children?: ReactNode }) =>
        createElement('div', { 'data-row': '' }, children),
      FigureRow: ({ children }: { children?: ReactNode }) =>
        createElement('div', { 'data-figures': '' }, children),
      Figure: ({ src }: { src?: string }) =>
        createElement('figure', { 'data-src': src }),
    },
    options: {
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkMermaid,
          hardenRawHtml,
          remarkCardWrap,
        ],
      },
    },
  });
  return renderToStaticMarkup(content).replace(/\n/g, '');
}

void test('a body with no cards is one untitled card', async () => {
  assert.equal(
    await render('Para\n\n## Heading\n\n- item\n'),
    '<section><p>Para</p><h2>Heading</h2><ul><li>item</li></ul></section>',
  );
});

void test('loose content between cards gets one card per run', async () => {
  assert.equal(
    await render('Intro\n\nMore\n\n<Card title="A">\nIn\n</Card>\n\nOutro\n'),
    '<section><p>Intro</p><p>More</p></section><section data-title="A"><p>In</p></section><section><p>Outro</p></section>',
  );
});

void test('loose content inside a row is wrapped', async () => {
  assert.equal(
    await render(
      '<CardRow>\n<Card title="A">\nx\n</Card>\n\nstray\n</CardRow>\n',
    ),
    '<div data-row=""><section data-title="A"><p>x</p></section><section><p>stray</p></section></div>',
  );
});

void test('a definition between paragraphs keeps one card', async () => {
  assert.equal(
    await render('One [a][d]\n\n[d]: https://example.com\n\nTwo\n'),
    '<section><p>One <a href="https://example.com">a</a></p><p>Two</p></section>',
  );
});

void test('definitions alone make no card', async () => {
  assert.equal(
    await render('<Card>\nIn [a][d]\n</Card>\n\n[d]: https://example.com\n'),
    '<section><p>In <a href="https://example.com">a</a></p></section>',
  );
});

void test('footnote definitions alone make no card', async () => {
  const html = await render('<Card>\nIn[^1]\n</Card>\n\n[^1]: Note\n');
  assert.ok(html.startsWith('<section><p>In<sup>'), html);
  assert.ok(!html.includes('<section></section>'), html);
});

void test('an MDX comment in a row makes no card', async () => {
  assert.equal(
    await render(
      '<CardRow>\n{/* left */}\n<Card title="A">\nx\n</Card>\n<Card title="B">\ny\n</Card>\n</CardRow>\n',
    ),
    '<div data-row=""><section data-title="A"><p>x</p></section><section data-title="B"><p>y</p></section></div>',
  );
});

void test('export lines stay unwrapped', async () => {
  assert.equal(
    await render('export const a = 1\n\n<Card>\nText\n</Card>\n'),
    '<section><p>Text</p></section>',
  );
});

void test('blocked tags in loose content are still dropped', async () => {
  assert.equal(
    await render('<script>alert(1)</script>\n\nText\n'),
    '<section><p>Text</p></section>',
  );
});

void test('an empty body renders nothing', async () => {
  assert.equal(await render(''), '');
});

void test('figure rows keep figures as direct children, inside a card', async () => {
  const expected =
    '<section><div data-figures=""><figure data-src="/a.png"></figure><figure data-src="/b.png"></figure></div></section>';
  const a = '<Figure src="/a.png" alt="A" />';
  const b = '<Figure src="/b.png" alt="B" />';
  assert.equal(
    await render(`<FigureRow>\n${a}\n${b}\n</FigureRow>\n`),
    expected,
  );
  assert.equal(
    await render(`<FigureRow>\n\n${a}\n\n${b}\n\n</FigureRow>\n`),
    expected,
  );
});
