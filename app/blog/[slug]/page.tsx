import type { Metadata } from 'next';
import { getPostBySlug, getPostSlugs } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import BlogPostContent from '@/components/BlogPostContent';
import { mdxComponents } from '@/components/MDXComponents';
import JsonLd from '@/components/JsonLd';
import { siteConfig } from '@/lib/site';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx$/, ''),
  }));
}

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

  const { title, excerpt, image, date } = post.meta;
  const url = `/blog/${post.slug}`;

  return {
    title,
    description: excerpt,
    alternates: { canonical: url },
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

  const url = `${siteConfig.url}/blog/${post.slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.excerpt,
    image: post.meta.image,
    datePublished: post.meta.date,
    dateModified: post.meta.date,
    articleSection: post.meta.category,
    author: { '@type': 'Person', name: siteConfig.author },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteConfig.url}/blog`,
      },
      { '@type': 'ListItem', position: 3, name: post.meta.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogPostContent post={post}>
        <MDXRemote source={post.content} components={mdxComponents} />
      </BlogPostContent>
    </>
  );
}
