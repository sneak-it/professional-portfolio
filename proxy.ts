import { NextResponse, type NextRequest } from 'next/server';

// Built per request, so the nonce is fresh on every response.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    // 'strict-dynamic': only scripts loaded by a nonce'd script run, which is
    // how Next pulls its chunks. React evals in dev only.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDev ? " 'unsafe-eval'" : ''
    }`,
    // Can't be nonced: React's `style` prop emits inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  // Request copy is what Next reads to nonce its own scripts; response copy is
  // what the browser enforces.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      // `brand`: PNG responses, no nonce to inject.
      source: '/((?!api|brand|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
