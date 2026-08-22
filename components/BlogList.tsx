'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import CoverImage from '@/components/CoverImage';
import { m } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
} from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import PostMeta from '@/components/PostMeta';
import TagList, { chipClass } from '@/components/TagList';
import { fadeInUpOnView } from '@/lib/motion';
import type { BlogPostSummary, Tag } from '@/lib/mdx';

export default function BlogList({
  posts,
  currentPage,
  totalPages,
  tags,
  activeTag,
}: {
  posts: BlogPostSummary[];
  currentPage: number;
  totalPages: number;
  tags: Tag[];
  activeTag?: string;
}) {
  const active = tags.find((t) => t.slug === activeTag);
  const filter = useRef<HTMLDetailsElement>(null);

  // <details> has no light dismiss, so close it on an outside click or Escape.
  useEffect(() => {
    const dismiss = (event: Event) => {
      const el = filter.current;
      if (!el?.open) return;
      const outside =
        event.type === 'keydown'
          ? (event as KeyboardEvent).key === 'Escape'
          : !el.contains(event.target as Node);
      if (outside) el.open = false;
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', dismiss);
    };
  }, []);

  // Carries the filter, or paging out of a filtered view silently drops it.
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (activeTag) params.set('tag', activeTag);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `/blog?${query}` : '/blog';
  };

  return (
    <Container size="md">
      <PageHeader
        title="Blog"
        action={
          tags.length > 0 && (
            <nav aria-label="Filter posts by tag">
              {/* Native disclosure, panel absolutely placed: no layout shift. */}
              <details ref={filter} className="group relative">
                <summary
                  className={`inline-flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden ${chipClass(
                    Boolean(activeTag),
                  )}`}
                >
                  <TagIcon size={12} />
                  {active ? active.name : 'Tags'}
                  <ChevronDown
                    size={12}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="card-surface absolute right-0 z-30 mt-2 flex max-h-80 w-64 flex-wrap items-start gap-2 overflow-y-auto p-4 shadow-2xl">
                  <Link
                    href="/blog"
                    aria-current={activeTag ? undefined : 'page'}
                    className={chipClass(!activeTag)}
                  >
                    All
                  </Link>
                  <TagList tags={tags} link counts activeSlug={activeTag} />
                </div>
              </details>
            </nav>
          )
        }
      />

      <div className="space-y-4">
        {posts.map((post, index) => (
          <m.article
            key={post.slug}
            {...fadeInUpOnView}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative flex flex-col md:flex-row gap-8 items-start card-surface p-6 hover:border-accent/50 transition-colors"
          >
            <div className="w-full md:w-2/5 aspect-video md:aspect-square lg:aspect-[4/3] relative rounded-2xl overflow-hidden shrink-0">
              <CoverImage
                src={post.meta.image}
                alt={post.meta.title}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col flex-grow justify-center h-full py-2">
              <PostMeta
                date={post.meta.date}
                readTime={post.meta.readTime}
                className="mb-4"
              />

              <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-accent transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.meta.title}
                </Link>
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                {post.meta.excerpt}
              </p>

              <div className="mt-auto flex items-center text-accent font-medium">
                Read Article{' '}
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-2 transition-transform"
                />
              </div>
            </div>
          </m.article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-16 flex items-center justify-center gap-2"
          aria-label="Blog pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1)}
              rel="prev"
              aria-label="Previous page"
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-accent/50 hover:text-accent transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage;
            return (
              <Link
                key={page}
                href={pageHref(page)}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-center h-10 w-10 rounded-full border text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-accent bg-accent text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-accent/50 hover:text-accent'
                }`}
              >
                {page}
              </Link>
            );
          })}

          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1)}
              rel="next"
              aria-label="Next page"
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-accent/50 hover:text-accent transition-colors"
            >
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </span>
          )}
        </nav>
      )}
    </Container>
  );
}
