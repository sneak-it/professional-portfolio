import { useId } from 'react';
import { renderDiagram } from '@/lib/mermaid';

/**
 * A ```mermaid fence (see lib/mermaid.ts), or `<Mermaid chart="…" />`, as
 * inline SVG. Anything it can't render shows as the source in a code block.
 */
export default function Mermaid({ chart }: { chart: string }) {
  const id = useId();
  const svg = renderDiagram(chart, id);
  if (svg === null) {
    return (
      <pre>
        <code className="language-mermaid">{chart}</code>
      </pre>
    );
  }
  // Natural size, scrolling sideways when wider than the column, like a code
  // block: shrunk to fit, a phone would get unreadable labels.
  return (
    <figure
      id={id}
      className="not-prose my-8 overflow-x-auto [&>svg]:mx-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
