import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { hardenRawHtml } from '../lib/harden.ts';
import { rehypeHighlight } from '../lib/highlight.ts';
import { remarkMermaid } from '../lib/mermaid.ts';

// Same plugins as components/MDXComponents.tsx.
async function render(source: string) {
  const { content } = await compileMDX({
    source,
    components: { Mermaid: () => null },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMermaid, hardenRawHtml],
        rehypePlugins: [rehypeHighlight],
      },
    },
  });
  return renderToStaticMarkup(content);
}

const fence = (lang: string, code: string) =>
  `\`\`\`${lang}\n${code}\n\`\`\`\n`;

/** The `span.line` elements' class attributes, in order. */
const lineClasses = (html: string) =>
  [...html.matchAll(/<span class="(line[^"]*)"/g)].map(([, c]) => c);

const luminance = (hex: string) => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

void test('a fence carries both themes, so CSS can follow the toggle', async () => {
  const html = await render(fence('ts', 'const answer: number = 42;'));
  assert.match(html, /^<pre class="shiki shiki-themes [^"]+"/);
  assert.match(
    html,
    /<span style="--shiki-light:#[0-9a-f]{6};--shiki-dark:#[0-9a-f]{6}/i,
  );
  // A plain `color:` would pin one theme regardless of the toggle.
  assert.doesNotMatch(html, /style="([^"]*;)?\s*color:/);
});

// 5:1 on the bare panel leaves room for the tint on highlighted and diff lines
// (app/globals.css) to stay above AA's 4.5:1.
void test('every token reads at 5:1 or better on its panel, in both themes', async () => {
  const html = await render(
    [
      fence(
        'ts',
        '// comment\n/** @param x doc */\n@decorator\nexport async function f<T>(x: T): Promise<T[]> {\n  const re = /a+[b-c]/g, s = `t ${x}`, n = 0x1f;\n  return [x] as T[]; // done\n}',
      ),
      fence(
        'bash',
        '# comment\nexport A="b $HOME" && echo ${A:-x} | grep -v c',
      ),
      fence('json', '{ "key": [1, true, null, "s"] }'),
      fence('css', '.a:hover > b::before { color: #fff !important; }'),
      fence('html', '<!-- c --><a href="x" data-y>t &amp; u</a>'),
      fence('yaml', 'key: value # comment\nlist:\n  - 1\n  - "two"'),
      fence('diff', '@@ -1 +1 @@\n-old\n+new'),
    ].join('\n'),
  );
  for (const theme of ['light', 'dark']) {
    const panels = [
      ...html.matchAll(new RegExp(`--shiki-${theme}-bg:(#[0-9a-f]{6})`, 'gi')),
    ];
    const [panel] = new Set(panels.map(([, c]) => c));
    assert.ok(panel, `${theme}: no panel color`);
    const tokens = new Set(
      [
        ...html.matchAll(new RegExp(`--shiki-${theme}:(#[0-9a-f]{6,8})`, 'gi')),
      ].map(([, c]) => c),
    );
    assert.ok(tokens.size > 5, `${theme}: only ${tokens.size} token colors`);
    for (const token of tokens) {
      assert.equal(token?.length, 7, `${theme}: ${token} has alpha`);
      const ratio = contrast(token ?? '', panel);
      assert.ok(
        ratio >= 5,
        `${theme}: ${token} on ${panel} is ${ratio.toFixed(2)}:1`,
      );
    }
  }
});

void test('a fence with no language or an unknown one still gets the panel', async () => {
  for (const lang of ['', 'not-a-language']) {
    const html = await render(fence(lang, '$ npm test\nok'));
    assert.match(html, /^<pre class="shiki /, lang);
    assert.match(html, /\$ npm test/, lang);
  }
});

void test('`{2}` after the language highlights line 2', async () => {
  const html = await render(fence('ts {2}', 'a;\nb;\nc;'));
  assert.deepEqual(lineClasses(html), ['line', 'line highlighted', 'line']);
});

void test('`[!code ++]` and `[!code --]` mark diff lines and leave the text', async () => {
  const html = await render(
    fence('ts', 'keep();\nadd(); // [!code ++]\nremove(); // [!code --]'),
  );
  assert.match(html, /^<pre class="shiki [^"]*has-diff/);
  assert.deepEqual(lineClasses(html), [
    'line',
    'line diff add',
    'line diff remove',
  ]);
  assert.doesNotMatch(html, /\[!code/);
});

void test('code is shown as text, never parsed as markup', async () => {
  const html = await render(fence('html', '<script>alert(1)</script>'));
  assert.doesNotMatch(html, /<script/);
  assert.match(html, /&lt;/);
});

void test('mermaid fences are left to the Mermaid component', async () => {
  assert.equal(await render(fence('mermaid', 'flowchart LR\n  A --> B')), '');
});
