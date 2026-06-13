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

export default function Blog() {
  const posts = getAllPosts();
  return <BlogList posts={posts} />;
}
