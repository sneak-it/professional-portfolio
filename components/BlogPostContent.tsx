import Image from 'next/image';
import Container from '@/components/Container';
import CoverImage from '@/components/CoverImage';
import Surface from '@/components/Surface';
import BackButton from '@/components/BackButton';
import ShareButton from '@/components/ShareButton';
import PostMeta from '@/components/PostMeta';
import TagList from '@/components/TagList';
import PostNav from '@/components/PostNav';
import { headings } from '@/lib/markdown';
import { PROSE, PROSE_CODE } from '@/lib/prose';
import { avatarSrc, siteConfig } from '@/lib/site';
import type { BlogPost, BlogPostSummary } from '@/lib/mdx';

export default function BlogPostContent({
  post,
  prev,
  next,
  children,
}: {
  post: BlogPost;
  prev?: BlogPostSummary;
  next?: BlogPostSummary;
  children: React.ReactNode;
}) {
  const avatar = avatarSrc();
  const toc = headings(post.content);
  // Fewer than four sections is shorter than the list describing them.
  const showToc =
    typeof post.meta.toc === 'boolean' ? post.meta.toc : toc.length >= 4;
  return (
    <Container as="article" size="md">
      <BackButton href="/blog" label="Back to Blog" />

      <Surface as="div" padding="lg" className="surface-opaque mt-6">
        <header className="mb-10">
          <div className="mx-auto max-w-measure">
            <TagList tags={post.meta.tags} link className="mb-6" />

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4">
              {post.meta.title}
            </h1>

            <PostMeta
              date={post.meta.date}
              readTime={post.meta.readTime}
              updated={post.meta.updated}
              className="mb-10"
            />
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden mb-10">
            <CoverImage
              src={post.meta.image}
              alt={post.meta.title}
              priority
              sizes="(max-width: 896px) 100vw, 736px"
            />
          </div>
        </header>

        {showToc && toc.length > 0 && (
          <details className="mx-auto mb-10 max-w-measure card-surface p-5">
            <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Contents
            </summary>
            <ol className="mt-4 space-y-2">
              {toc.map((item, i) => (
                <li
                  key={`${item.id}-${i}`}
                  className={item.depth === 3 ? 'ml-5' : ''}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-gray-700 hover:text-accent-text dark:text-gray-300 transition-colors"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className={`${PROSE} ${PROSE_CODE} measure`}>{children}</div>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={siteConfig.author}
                  width={48}
                  height={48}
                  className="rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent-2/30" />
              )}
              <div>
                <p className="font-bold">{siteConfig.author}</p>
              </div>
            </div>

            <ShareButton title={post.meta.title} />
          </div>

          <PostNav prev={prev} next={next} />
        </footer>
      </Surface>
    </Container>
  );
}
