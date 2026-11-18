import type { MdxJsxNode } from './harden.ts';

const isCard = (node: MdxJsxNode) =>
  node.type === 'mdxJsxFlowElement' &&
  (node.name === 'Card' || node.name === 'CardRow');

// Render nothing where they stand, so alone they'd leave an empty card.
const SILENT = new Set(['definition', 'footnoteDefinition']);

function wrapLoose(children: MdxJsxNode[]): MdxJsxNode[] {
  const out: MdxJsxNode[] = [];
  // Children of the card collecting the current run of loose nodes.
  let open: MdxJsxNode[] | null = null;
  for (const node of children) {
    if (isCard(node)) {
      out.push(node);
      open = null;
    } else if (SILENT.has(node.type ?? '')) {
      out.push(node);
    } else {
      if (!open) {
        open = [];
        out.push({
          type: 'mdxJsxFlowElement',
          name: 'Card',
          attributes: [],
          children: open,
        });
      }
      open.push(node);
    }
  }
  return out;
}

/** Remark plugin: wraps loose content (top level and inside each row) in untitled cards. */
export function remarkCardWrap() {
  return (tree: MdxJsxNode) => {
    tree.children = wrapLoose(tree.children ?? []);
    for (const node of tree.children) {
      if (node.name === 'CardRow')
        node.children = wrapLoose(node.children ?? []);
    }
  };
}
