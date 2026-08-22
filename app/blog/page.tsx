import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BLOG_POSTS_PER_PAGE as POSTS_PER_PAGE } from '@/lib/config';
import {
  TAG_INDEX_MIN_POSTS,
  getAllPostMeta,
  getPostsByTag,
  getTags,
  type Tag,
} from '@/lib/mdx';
import BlogList from '@/components/BlogList';

// Rendered per request: the bind-mounted content/ dir and the runtime site
// config both apply immediately. See lib/mdx.ts and lib/site.ts.
export const dynamic = 'force-dynamic';

// Single source for both the metadata description and the visible PageHeader.
const DESCRIPTION =
  'Thoughts, tutorials, and insights on web development, design, and technology.';

// Resolve the requested page to a valid 1-based index, or null when the param
// is present but out of range / malformed. Callers 404 on null.
function resolvePage(
  page: string | undefined,
  totalPages: number,
): number | null {
  if (page === undefined) return 1;
  // Bare positive integers only, so one page of content has one indexable URL.
  if (!/^[1-9]\d*$/.test(page)) return null;
  const parsed = Number(page);
  return parsed > totalPages ? null : parsed;
}

/**
 * The requested tag, or null when unknown; callers 404, as with `resolvePage`.
 *
 * ponytail: single tag; intersect a comma-split list if browsing needs it.
 */
function resolveTag(tag: string | undefined, tags: Tag[]): Tag | null {
  if (tag === undefined) return null;
  return tags.find((t) => t.slug === tag) ?? null;
}

/** The list a request renders, and the tag that narrowed it. */
function resolveView(params: { page?: string; tag?: string }) {
  const tags = getTags();
  const tag = resolveTag(params.tag, tags);
  const missingTag = params.tag !== undefined && tag === null;
  const posts = tag ? getPostsByTag(tag.slug) : getAllPostMeta();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  return {
    tags,
    tag,
    missingTag,
    posts,
    totalPages,
    currentPage: resolvePage(params.page, totalPages),
  };
}

function canonicalFor(tag: Tag | null, page: number | null): string {
  const search = new URLSearchParams();
  if (tag) search.set('tag', tag.slug);
  if (page && page > 1) search.set('page', String(page));
  const query = search.toString();
  return query ? `/blog?${query}` : '/blog';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}): Promise<Metadata> {
  const { tag, missingTag, posts, currentPage } = resolveView(
    await searchParams,
  );
  if (missingTag) return {};

  const title = tag ? `Posts tagged ${tag.name}` : 'Blog';
  const description = tag ? `Every post tagged ${tag.name}.` : DESCRIPTION;
  // Out-of-range pages 404 (see default export); still give them a self-canonical.
  const canonical = canonicalFor(tag, currentPage);

  return {
    title,
    description,
    alternates: { canonical },
    // A one- or two-post tag view is thin content, and there will be many of
    // them; `follow` still lets the posts themselves be discovered.
    ...(tag &&
      posts.length < TAG_INDEX_MIN_POSTS && {
        robots: { index: false, follow: true },
      }),
    openGraph: { title, description, url: canonical },
  };
}

export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { tags, tag, missingTag, posts, totalPages, currentPage } = resolveView(
    await searchParams,
  );
  if (missingTag || currentPage === null) notFound();

  const start = (currentPage - 1) * POSTS_PER_PAGE;

  return (
    <BlogList
      posts={posts.slice(start, start + POSTS_PER_PAGE)}
      description={DESCRIPTION}
      currentPage={currentPage}
      totalPages={totalPages}
      tags={tags}
      activeTag={tag?.slug}
    />
  );
}
