import Image from 'next/image';
import Container from '@/components/Container';
import CoverImage from '@/components/CoverImage';
import Surface from '@/components/Surface';
import BackButton from '@/components/BackButton';
import ShareButton from '@/components/ShareButton';
import PostMeta from '@/components/PostMeta';
import { PROSE, PROSE_CODE } from '@/lib/prose';
import { avatarSrc, siteConfig } from '@/lib/site';
import type { BlogPost } from '@/lib/mdx';

export default function BlogPostContent({
  post,
  children,
}: {
  post: BlogPost;
  children: React.ReactNode;
}) {
  const avatar = avatarSrc();
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
            <CoverImage
              src={post.meta.image}
              alt={post.meta.title}
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </header>

        <div className={`${PROSE} ${PROSE_CODE}`}>{children}</div>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
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
        </footer>
      </Surface>
    </Container>
  );
}
