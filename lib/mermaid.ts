import { renderMermaidSVG } from 'beautiful-mermaid';

/**
 * Mermaid fences as inline SVG, rendered on the server by beautiful-mermaid
 * and cleaned for inlining by components/Mermaid.tsx.
 */

interface MdNode {
  type: string;
  lang?: string | null;
  value?: string;
  name?: string;
  attributes?: Array<{ type: string; name: string; value: string }>;
  children?: MdNode[];
}

/** Remark plugin: a ```mermaid fence becomes `<Mermaid chart="…" />`, a string attribute `blockJS` keeps. */
export function remarkMermaid() {
  const walk = (node: MdNode) => {
    if (!Array.isArray(node.children)) return;
    node.children = node.children.map((child) => {
      if (child.type !== 'code' || child.lang !== 'mermaid') {
        walk(child);
        return child;
      }
      return {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'chart', value: child.value ?? '' },
        ],
        children: [],
      };
    });
  };
  return walk;
}

// Theme variables from app/globals.css. No `accent`: the library reads
// `--accent`, which the page already sets; passing it would self-reference.
const COLORS = {
  bg: 'var(--diagram-bg)',
  fg: 'var(--diagram-fg)',
  // Sequence and ER labels default to a 40% mix: 2.5:1, under AA. 60% passes.
  muted: 'color-mix(in srgb, var(--diagram-fg) 60%, var(--diagram-bg))',
  transparent: true,
};

/**
 * The diagram scoped to the figure with id `id`, or null for unsafe output or
 * a source the renderer rejects: an unsupported type or unreadable first line.
 */
export function renderDiagram(source: string, id: string): string | null {
  let svg: string;
  try {
    // ponytail: no cache; ~70 ms while elkjs warms up, a few ms after. Key one
    // by source if a page with many diagrams shows up in response times.
    svg = renderMermaidSVG(source, COLORS);
  } catch {
    return null;
  }
  return cleanSvg(svg, id);
}

// Every element beautiful-mermaid emits. Anything else, a <script> or an
// <iframe> that ends SVG parsing, is output this file was not written for.
const ELEMENTS = new Set([
  'svg',
  'style',
  'defs',
  'marker',
  'g',
  'title',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'path',
  'text',
  'tspan',
]);

// Tested with attribute values blanked, so label text never trips it. HTML
// also ends an attribute at a closing quote or `/`, not only at whitespace.
const UNSAFE_ATTRIBUTE = /[\s/"'](on\w*|(xlink:)?href)\s*=/i;

/** Library output made safe to inline in the figure with id `id`, or null if it could run code. */
export function cleanSvg(svg: string, id: string): string | null {
  // A quoted value may hold `>`; every `<` must open a tag, so a truncated one is refused.
  const tags = svg.match(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g) ?? [];
  if (tags.length !== svg.split('<').length - 1) return null;
  for (const tag of tags) {
    const name = /^<\/?([\w:-]+)/.exec(tag)?.[1]?.toLowerCase() ?? '';
    const bare = tag.replace(/"[^"]*"|'[^']*'/g, '""');
    if (!ELEMENTS.has(name) || UNSAFE_ATTRIBUTE.test(bare)) return null;
  }
  return svg
    .replace(
      /<style>([\s\S]*?)<\/style>/g,
      (_, css: string) => `<style>${scopeCss(css, id)}</style>`,
    )
    .replace(/(\s)id="/g, `$1id="${id}-`)
    .replace(/="url\(#/g, `="url(#${id}-`);
}

/** An inlined <style> applies page-wide, so every selector gets the figure's id. */
function scopeCss(css: string, id: string): string {
  return (
    css
      // Line-wise: the font URL contains `;`. The CSP blocks it regardless.
      .replace(/^\s*@import\b.*$/gm, '')
      // Pins labels to Inter; without it they inherit the page font.
      .replace(/^\s*text\s*\{[^}]*\}\s*$/gm, '')
      .replace(
        /([^{}]+)\{/g,
        (_, prelude: string) =>
          `${prelude
            .split(',')
            .map((selector) => `#${id} ${selector.trim()}`)
            .join(', ')} {`,
      )
  );
}
