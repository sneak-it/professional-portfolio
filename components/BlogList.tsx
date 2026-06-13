'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import { fadeInUpOnView } from '@/lib/motion';
import type { BlogPost } from '@/lib/mdx';

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <Container size="md">
      <PageHeader
        title="Blog"
        description="Thoughts, tutorials, and insights on web development, design, and technology."
      />

      <div className="space-y-12">
        {posts.map((post, index) => (
          <motion.article
            key={post.slug}
            {...fadeInUpOnView}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative flex flex-col md:flex-row gap-8 items-start bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 hover:border-orange-500/50 transition-colors"
          >
            <div className="w-full md:w-2/5 aspect-video md:aspect-square lg:aspect-[4/3] relative rounded-2xl overflow-hidden shrink-0">
              <Image
                src={post.meta.image ?? '/default-post.jpg'}
                alt={post.meta.title}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col flex-grow justify-center h-full py-2">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="text-orange-500 font-medium uppercase tracking-wider">
                  {post.meta.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {post.meta.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {post.meta.readTime}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-orange-500 transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.meta.title}
                </Link>
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                {post.meta.excerpt}
              </p>

              <div className="mt-auto flex items-center text-orange-500 font-medium">
                Read Article{' '}
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-2 transition-transform"
                />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </Container>
  );
}
