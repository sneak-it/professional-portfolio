'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import { fadeInUpOnView } from '@/lib/motion';
import type { SectionSummary } from '@/lib/portfolio';

// Singular/plural noun shown under each section card, by section.
const COUNT_NOUN: Record<string, [singular: string, plural: string]> = {
  'technology-consulting': ['engagement', 'engagements'],
  photography: ['collection', 'collections'],
  'open-source': ['project', 'projects'],
};

function countLabel(slug: string, count: number): string {
  const [singular, plural] = COUNT_NOUN[slug] ?? ['item', 'items'];
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function PortfolioHub({
  sections,
}: {
  sections: SectionSummary[];
}) {
  return (
    <Container>
      <PageHeader
        title="Portfolio"
        description="Selected work across technology consulting, photography, and open source."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.slug}
            {...fadeInUpOnView}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              href={`/portfolio/${section.slug}`}
              className="group block relative rounded-3xl overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-gray-900"
            >
              {section.coverImage ? (
                <Image
                  src={section.coverImage}
                  alt={section.name}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent-2/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight size={20} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/70 mb-2 text-sm font-medium font-mono uppercase tracking-wider">
                  {countLabel(section.slug, section.count)}
                </p>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {section.name}
                </h2>
                <p className="text-white/70 text-sm line-clamp-2">
                  {section.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}
