'use client';

import Image from 'next/image';
import Container from '@/components/Container';
import Surface from '@/components/Surface';
import BackButton from '@/components/BackButton';
import ShareButton from '@/components/ShareButton';
import PostMeta from '@/components/PostMeta';
import { PROSE, PROSE_CODE } from '@/lib/prose';
import type { BlogPost } from '@/lib/mdx';

export default function BlogPostContent({
  post,
  children,
}: {
  post: BlogPost;
  children: React.ReactNode;
}) {
  return (
    <Container as="article" size="sm">
      <BackButton href="/blog" label="Back to Blog" />

      <Surface as="div" padding="lg" className="mt-6">
        <header className="mb-10">
          <PostMeta
            category={post.meta.category}
            date={post.meta.date}
            readTime={post.meta.readTime}
            className="mb-6"
          />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-8">
            {post.meta.title}
          </h1>

          <div className="relative aspect-video rounded-3xl overflow-hidden mb-10">
            <Image
              src={post.meta.image ?? '/default-post.jpg'}
              alt={post.meta.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        <div className={`${PROSE} ${PROSE_CODE}`}>{children}</div>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="https://picsum.photos/seed/portrait/100/100"
              alt="Author"
              width={48}
              height={48}
              className="rounded-full"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold">Ian Rodriguez-Torrent</p>
            </div>
          </div>

          <ShareButton title={post.meta.title} />
        </footer>
      </Surface>
    </Container>
  );
}
