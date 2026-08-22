import type { Metadata } from 'next';
import { isDraft } from '@/lib/content';
import { getPostBySlug } from '@/lib/mdx';
import BlogPostContent from '@/components/BlogPostContent';
import { CachedMDX } from '@/components/MDXComponents';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl, siteConfig } from '@/lib/site';
import { breadcrumbJsonLd } from '@/lib/jsonld';
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

  return {
    title,
    description: excerpt,
    ...(tags.length > 0 && { keywords: tags }),
    alternates: { canonical: url },
    // Drafts and not-yet-published posts stay reachable for preview, so keep
    // crawlers off them. Same predicate the listings filter on.
    ...(isDraft(post.meta) && {
      robots: { index: false, follow: false },
    }),
    openGraph: {
      type: 'article',
      title,
      description: excerpt,
      url,
      publishedTime: date,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: image ? [image] : undefined,
    },
  };
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

  const url = absoluteUrl(`/blog/${post.slug}`);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.excerpt,
    image: post.meta.image,
    datePublished: post.meta.date,
    dateModified: post.meta.updated || post.meta.date,
    keywords: post.meta.tags.join(', '),
    author: { '@type': 'Person', name: siteConfig.author },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.meta.title, path: `/blog/${post.slug}` },
        ])}
      />
      <BlogPostContent post={post}>
        <CachedMDX source={post.content} />
      </BlogPostContent>
    </>
  );
}
