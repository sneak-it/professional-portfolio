import { NextResponse } from 'next/server';

// Lightweight health endpoint polled by the Docker HEALTHCHECK (see Dockerfile).
// Force dynamic so the response always reflects a live process.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
