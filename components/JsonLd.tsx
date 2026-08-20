import { cspNonce } from '@/lib/nonce';

/**
 * Renders a JSON-LD structured-data block. Nonced even though the script never
 * executes: `script-src` covers every <script> regardless of `type`.
 */
export default async function JsonLd({
  data,
}: {
  data: Record<string, unknown>;
}) {
  return (
    <script
      type="application/ld+json"
      nonce={await cspNonce()}
      // JSON.stringify output is escaped for the </script> edge case below.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
