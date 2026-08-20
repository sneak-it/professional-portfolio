import 'server-only';
import { headers } from 'next/headers';

// Set by proxy.ts.
const NONCE_HEADER = 'x-nonce';

/**
 * Per-request CSP nonce, for the inline scripts Next doesn't stamp itself.
 * `undefined` when the proxy didn't run, which is also when no CSP was sent.
 */
export async function cspNonce(): Promise<string | undefined> {
  return (await headers()).get(NONCE_HEADER) ?? undefined;
}
