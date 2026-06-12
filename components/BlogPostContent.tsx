'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import type { BlogPost } from '@/lib/mdx';

export default function BlogPostContent({ post, children }: { post: BlogPost; children: React.ReactNode }) {
  return (
    <PageTransition>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        
        <header className="mb-10">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span className="text-orange-500 font-medium uppercase tracking-wider">{post.meta.category}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {post.meta.date}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {post.meta.readTime}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-8">
            {post.meta.title}
          </h1>
          
          <div className="relative aspect-video rounded-3xl overflow-hidden mb-10">
            <Image
              src={post.meta.image ?? '/default-post.jpg'}
              alt={post.meta.title}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>
        
        <div className="prose prose-lg dark:prose-invert prose-orange max-w-none">
          {children}
        </div>
        
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src="https://picsum.photos/seed/portrait/100/100" alt="Author" width={48} height={48} className="rounded-full" referrerPolicy="no-referrer" />
            <div>
              <p className="font-bold">John Doe</p>
              <p className="text-sm text-gray-500">Frontend Developer</p>
            </div>
          </div>
          
          <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
            <Share2 size={18} />
          </button>
        </footer>
      </article>
    </PageTransition>
  );
}
