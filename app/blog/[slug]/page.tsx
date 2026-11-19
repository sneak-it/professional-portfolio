import type { Metadata } from 'next';
import { isDraft } from '@/lib/content';
import { getAdjacentPosts, getPostBySlug } from '@/lib/mdx';
import BlogPostContent from '@/components/BlogPostContent';
import { CachedMDX } from '@/components/MDXComponents';
import JsonLd from '@/components/JsonLd';
import { blogPostingJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/metadata';
import { notFound } from 'next/navigation';

// Rendered per request so posts added, edited, or removed in the bind-mounted
// content/ dir are served immediately, and so the runtime site config applies.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const { title, excerpt, image, date, tags } = post.meta;
  const url = `/blog/${post.slug}`;

  return pageMetadata({
    title,
    description: excerpt,
    path: url,
    image,
    published: date,
    modified: post.meta.updated,
    keywords: tags,
    // Drafts and not-yet-published posts stay reachable for preview, so keep
    // crawlers off them. Same predicate the listings filter on.
    ...(isDraft(post.meta) && {
      robots: { index: false, follow: false },
    }),
  });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(post.slug);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.meta.title, path: `/blog/${post.slug}` },
        ])}
      />
      <BlogPostContent post={post} prev={prev} next={next}>
        <CachedMDX source={post.content} />
      </BlogPostContent>
    </>
  );
}
