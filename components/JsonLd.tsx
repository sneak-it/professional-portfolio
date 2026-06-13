/**
 * Renders a JSON-LD structured-data block. Server component — the `<script>`
 * is emitted as static HTML, never executed, so it's safe under the existing
 * CSP (`type="application/ld+json"` is data, not script).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is escaped for the </script> edge case below.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
