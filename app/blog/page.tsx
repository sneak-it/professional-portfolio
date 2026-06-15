import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/mdx';
import BlogList from '@/components/BlogList';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Musings on web development, design, and modern technologies.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog',
    description: 'Musings on web development, design, and modern technologies.',
    url: '/blog',
  },
};

const POSTS_PER_PAGE = 3;

export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const posts = getAllPosts();

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const parsed = Number(page);
  const currentPage =
    Number.isInteger(parsed) && parsed >= 1 ? Math.min(parsed, totalPages) : 1;

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
