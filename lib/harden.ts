/**
 * Remark-plugin half of the MDX allowlist. The components half lives in
 * components/MDXComponents.tsx; use them together via `mdxRenderProps`.
 *
 * A components map only governs elements MDX generates from *markdown* syntax.
 * Author-written HTML compiles to an intrinsic JSX element, which the map never
 * sees, so this plugin is the only thing that reaches it:
 *
 *   <script>alert(1)</script>      -> dropped with its subtree
 *   <div onclick="alert(1)">       -> onclick stripped
 *   <a href rel="opener">          -> <MdxRawLink href> (rel stripped)
 */

/** Tags that should never render from content. */
export const BLOCKED_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'link',
  'meta',
  'base',
  'style',
  'frame',
  'frameset',
  'applet',
] as const;

// Capitalised aliases for raw-HTML <a>/<img>: lowercase intrinsic names are not
// looked up in `components`, so the nodes are renamed to these.
const RAW_HTML_ALIASES: Record<string, string> = {
  a: 'MdxRawLink',
  img: 'MdxRawImage',
};

// Attributes the hardened components set themselves. An authored copy survives
// in `...rest` under its own casing (`referrerpolicy` vs `referrerPolicy`), which
// React emits as a second copy of the same HTML attribute.
const OWNED_ATTRS: Record<string, ReadonlySet<string>> = {
  a: new Set(['rel', 'target']),
  img: new Set(['referrerpolicy', 'loading', 'decoding']),
};

const BLOCKED_TAG_SET: ReadonlySet<string> = new Set(BLOCKED_TAGS);

interface MdxJsxNode {
  type?: string;
  name?: string | null;
  attributes?: Array<{ type?: string; name?: string }>;
  children?: MdxJsxNode[];
}

export function hardenRawHtml() {
  return (tree: MdxJsxNode) => {
    const walk = (node: MdxJsxNode) => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.filter((child) => {
        if (
          child.type === 'mdxJsxFlowElement' ||
          child.type === 'mdxJsxTextElement'
        ) {
          const name = typeof child.name === 'string' ? child.name : '';
          if (BLOCKED_TAG_SET.has(name)) return false;
          if (Array.isArray(child.attributes)) {
            const owned = OWNED_ATTRS[name];
            child.attributes = child.attributes.filter((attr) => {
              if (attr.type !== 'mdxJsxAttribute') return true;
              if (typeof attr.name !== 'string') return true;
              const lower = attr.name.toLowerCase();
              // `on*` on any tag, not just the aliased ones: only
              // 'unsafe-inline' can execute a handler and the CSP has none, but
              // the sanitizer shouldn't depend on the header holding.
              return !lower.startsWith('on') && !owned?.has(lower);
            });
          }
          const alias = RAW_HTML_ALIASES[name];
          if (alias) child.name = alias;
        }
        walk(child);
        return true;
      });
    };
    walk(tree);
  };
}
