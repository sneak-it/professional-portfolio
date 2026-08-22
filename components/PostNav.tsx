'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { slideTo } from '@/components/PageTransition';
import type { BlogPostSummary } from '@/lib/mdx';

function PostNavLink({
  post,
  dir,
}: {
  post: BlogPostSummary;
  dir: 'prev' | 'next';
}) {
  const isPrev = dir === 'prev';
  const Icon = isPrev ? ArrowLeft : ArrowRight;
  const href = `/blog/${post.slug}`;
  return (
    <Link
      href={href}
      rel={dir}
      onClick={() => {
        slideTo(href, dir);
      }}
      className={`group card-surface flex flex-col gap-1 p-5 hover:border-accent/50 transition-colors ${
        isPrev ? 'items-start' : 'items-end text-right sm:col-start-2'
      }`}
    >
      <span
        className={`flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
          isPrev ? '' : 'flex-row-reverse'
        }`}
      >
        <Icon size={14} /> {isPrev ? 'Older' : 'Newer'}
      </span>
      <span className="font-bold line-clamp-2 group-hover:text-accent transition-colors">
        {post.meta.title}
      </span>
    </Link>
  );
}

/** Adjacent-post links; renders nothing at both ends of the archive. */
export default function PostNav({
  prev,
  next,
}: {
  prev?: BlogPostSummary;
  next?: BlogPostSummary;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      className="mt-8 grid gap-4 sm:grid-cols-2"
      aria-label="More blog posts"
    >
      {prev && <PostNavLink post={prev} dir="prev" />}
      {next && <PostNavLink post={next} dir="next" />}
    </nav>
  );
}
