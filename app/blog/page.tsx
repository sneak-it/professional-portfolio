import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPostMeta } from '@/lib/mdx';
import BlogList from '@/components/BlogList';

// Re-read MDX content at request time (cached, refreshed in the background every
// 60s) so edits appear without a rebuild. See lib/mdx.ts.
export const revalidate = 60;

const DESCRIPTION =
  'Musings on web development, design, and modern technologies.';

const POSTS_PER_PAGE = 3;

// Resolve the requested page to a valid 1-based index, or null when the param is
// present but out of range / malformed (so callers can 404 instead of clamping,
// which would create an infinite space of duplicate URLs).
function resolvePage(
  page: string | undefined,
  totalPages: number,
): number | null {
  if (page === undefined) return 1;
  const parsed = Number(page);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > totalPages) {
    return null;
  }
  return parsed;
}

function totalPageCount(): number {
  return Math.max(1, Math.ceil(getAllPostMeta().length / POSTS_PER_PAGE));
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const currentPage = resolvePage(page, totalPageCount());
  // Out-of-range pages 404 (see default export); still give them a self-canonical.
  const canonical =
    currentPage && currentPage > 1 ? `/blog?page=${currentPage}` : '/blog';

  return {
    title: 'Blog',
    description: DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: 'Blog',
      description: DESCRIPTION,
      url: canonical,
    },
  };
}

export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const posts = getAllPostMeta();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  const currentPage = resolvePage(page, totalPages);
  if (currentPage === null) notFound();

  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <BlogList
      posts={paginatedPosts}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
