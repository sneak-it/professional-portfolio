/**
 * Operational tuning, read at container start; see .env.example (lib/site.ts
 * owns identity). Read at runtime, so no `NEXT_PUBLIC_`.
 */

// Non-positive and malformed values fall back to the default.
function envInt(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Posts per page on /blog. */
export const BLOG_POSTS_PER_PAGE = envInt('BLOG_POSTS_PER_PAGE', 3);
