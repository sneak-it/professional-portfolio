import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { hardenRawHtml } from '../lib/harden.ts';
import { cleanSvg, remarkMermaid, renderDiagram } from '../lib/mermaid.ts';

const ID = '_S_1_';

// Same plugin order as components/MDXComponents.tsx, with a stub Mermaid.
async function render(source: string) {
  const { content } = await compileMDX({
    source,
    components: {
      Mermaid: ({ chart }: { chart: string }) =>
        createElement('figure', { 'data-chart': chart }),
    },
    options: {
      mdxOptions: { remarkPlugins: [remarkGfm, remarkMermaid, hardenRawHtml] },
    },
  });
  return renderToStaticMarkup(content);
}

const SOURCES = {
  flowchart: 'flowchart LR\n  A[Proxmox] -->|over WireGuard| B[TrueNAS]',
  state: 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Running',
  sequence: 'sequenceDiagram\n  Alice->>Bob: Hello',
  class: 'classDiagram\n  Animal <|-- Duck\n  Animal : +int age',
  er: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places',
  xychart: 'xychart-beta\n  x-axis [a, b]\n  bar [1, 2]',
};

const diagram = (source: string) => {
  const svg = renderDiagram(source, ID);
  assert.ok(svg !== null, `did not render:\n${source}`);
  return svg;
};

/** Every selector in every <style> block, comments dropped. */
const selectors = (svg: string) =>
  [...svg.matchAll(/<style>([\s\S]*?)<\/style>/g)].flatMap(([, css = '']) =>
    [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{/g)].flatMap(
      ([, prelude = '']) => prelude.split(',').map((s) => s.trim()),
    ),
  );

void test('a mermaid fence reaches the Mermaid component as its source', async () => {
  const html = await render(
    '```mermaid\nflowchart LR\n  A --> B\n```\n\n> ```mermaid\n> graph TD\n> ```\n',
  );
  assert.equal(
    html,
    '<figure data-chart="flowchart LR\n  A --&gt; B"></figure>\n' +
      '<blockquote>\n<figure data-chart="graph TD"></figure>\n</blockquote>',
  );
});

void test('other fences stay code blocks', async () => {
  assert.equal(
    await render('```ts\nconst x = 1;\n```\n'),
    '<pre><code class="language-ts">const x = 1;\n</code></pre>',
  );
});

void test('the diagram never fetches a web font', () => {
  const svg = diagram(SOURCES.flowchart);
  assert.doesNotMatch(svg, /@import|fonts\.googleapis/);
});

// Inlined, an unscoped `svg` or `.mono` rule restyles every match on the page.
void test('every style rule is scoped to the figure, in every diagram type', () => {
  for (const [type, source] of Object.entries(SOURCES)) {
    const found = selectors(diagram(source));
    assert.ok(found.length > 0, `${type} has no style rules`);
    for (const selector of found) {
      assert.ok(selector.startsWith(`#${ID} `), `${type}: "${selector}"`);
      // Leftovers from a botched @import strip would glue onto a selector.
      assert.match(selector.slice(ID.length + 2), /^[a-z.][\w.-]*$/i, type);
    }
  }
});

void test('labels inherit the page font', () => {
  for (const source of Object.values(SOURCES)) {
    assert.ok(!selectors(diagram(source)).includes(`#${ID} text`));
  }
});

// Marker ids are fixed (`arrowhead`), so two diagrams on a page would share them.
void test('every id is prefixed and every reference follows it', () => {
  for (const [type, source] of Object.entries(SOURCES)) {
    const svg = diagram(source);
    const ids = [...svg.matchAll(/\sid="([^"]*)"/g)].map(([, v]) => v ?? '');
    for (const id of ids) assert.ok(id.startsWith(`${ID}-`), `${type}: ${id}`);
    for (const [, ref] of svg.matchAll(/url\(#([^)]*)\)/g)) {
      assert.ok(ids.includes(ref ?? ''), `${type}: dangling url(#${ref})`);
    }
  }
});

/** The custom properties set inline on the <svg> root, by name. */
const rootVars = (svg: string) =>
  new Map(
    (/<svg[^>]*\sstyle="([^"]*)"/.exec(svg)?.[1] ?? '')
      .split(';')
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')), d.slice(d.indexOf(':') + 1)]),
  );

// `--accent: var(--accent)` on the <svg> is a cycle, which resolves to nothing.
void test('the root takes theme colors without referencing itself', () => {
  const vars = rootVars(diagram(SOURCES.flowchart));
  assert.equal(vars.get('--bg'), 'var(--diagram-bg)');
  assert.equal(vars.get('--fg'), 'var(--diagram-fg)');
  for (const [name, value] of vars) {
    assert.ok(!value.includes(`var(${name})`), `${name}: ${value}`);
  }
});

// The library's default mixes in 40%: 2.5:1 on the light panel, under AA.
void test('muted labels mix in at least 60% of the text color', () => {
  const muted = rootVars(diagram(SOURCES.sequence)).get('--muted') ?? '';
  const share =
    /^color-mix\(in srgb, var\(--diagram-fg\) (\d+)%, var\(--diagram-bg\)\)$/.exec(
      muted,
    );
  assert.ok(share && Number(share[1]) >= 60, `--muted is "${muted}"`);
});

void test('a label cannot inject markup', () => {
  const svg = diagram('flowchart LR\n  A["<script>alert(1)</script>"] --> B');
  assert.match(svg, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

void test('an unsupported type or unreadable first line renders nothing', () => {
  for (const source of ['', 'not a diagram', 'pie\n  "a" : 1', 'gantt']) {
    assert.equal(renderDiagram(source, ID), null, source);
  }
});

// Upstream behavior the authoring docs describe: no fallback for a bad line.
void test('a line the renderer cannot read is dropped, not refused', () => {
  const svg = diagram('flowchart LR\n  A --> B\n  B -> C');
  assert.match(svg, /data-id="B"/);
  assert.doesNotMatch(svg, /data-id="C"/);
});

void test('cleanSvg refuses scripts, event handlers, and links', () => {
  for (const svg of [
    '<svg><script>alert(1)</script></svg>',
    '<svg><SCRIPT src="x.js"></SCRIPT></svg>',
    '<svg><rect onload="alert(1)" /></svg>',
    '<svg><g><rect width="1" OnClick=\'x\' /></g></svg>',
    '<svg><a href="javascript:alert(1)"><text>x</text></a></svg>',
    '<svg><text xlink:href="data:x">x</text></svg>',
  ]) {
    assert.equal(cleanSvg(svg, ID), null, svg);
  }
});

// All four parse in Chromium as a live onmouseover attribute.
void test('cleanSvg refuses a handler however the HTML parser would read it', () => {
  for (const svg of [
    '<svg><rect x="1"onmouseover="alert(1)" /></svg>',
    '<svg><rect/onmouseover="alert(1)" /></svg>',
    '<svg><rect fill="a>b" onmouseover="alert(1)" /></svg>',
    '<svg><rect onmouseover="alert(1)"',
  ]) {
    assert.equal(cleanSvg(svg, ID), null, svg);
  }
});

// Inline in HTML, some tags leave SVG parsing and others set attributes later.
void test('cleanSvg refuses any element the library does not emit', () => {
  for (const svg of [
    '<svg><iframe src="javascript:alert(1)"></iframe></svg>',
    '<svg><animate attributeName="href" to="javascript:alert(1)" /></svg>',
    '<svg><foreignObject><div>x</div></foreignObject></svg>',
    '<svg><b><img src="x" /></b></svg>',
  ]) {
    assert.equal(cleanSvg(svg, ID), null, svg);
  }
});

void test('every shape of every diagram type survives cleaning', () => {
  for (const source of [
    'flowchart TD\n  subgraph g1 [Group]\n    a((circle)) --> b{diamond}\n    b -.->|dotted| c([stadium])\n  end\n  c ==> d[(cylinder)] --> e{{hex}} --> f(((double)))\n  A["<b>bold</b> <i>it</i><br/>two"] <--> B\n  linkStyle 0 stroke:red',
    'stateDiagram-v2\n  [*] --> A\n  A --> B : go\n  state B {\n    [*] --> C\n    C --> [*]\n  }\n  B --> [*]',
    'sequenceDiagram\n  participant A\n  actor U\n  A->>U: hi\n  U-->>A: back\n  Note over A,U: note\n  loop every minute\n    A->>A: self\n  end',
    'classDiagram\n  class Animal {\n    +String name\n    +eat() void\n  }\n  Animal <|-- Duck\n  Animal *-- Leg\n  Animal o-- Tail\n  Animal ..> Water',
    'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  CUSTOMER {\n    string name PK "the name"\n  }',
    'xychart-beta\n  title "Sales"\n  x-axis [jan, feb]\n  bar [10, 50]\n  line [20, 40]',
  ]) {
    diagram(source);
  }
});

void test('text that only looks like an attribute or a scheme still renders', () => {
  diagram(
    'flowchart LR\n  A[set online=true] -->|javascript: is a word| B[href= text]',
  );
});
