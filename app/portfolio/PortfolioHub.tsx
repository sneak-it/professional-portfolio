'use client';

import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import CoverCard from '@/components/CoverCard';
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
            <CoverCard
              href={`/portfolio/${section.slug}`}
              coverImage={section.coverImage}
              title={section.name}
              description={section.description}
              aspect="aspect-[4/5]"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 33vw"
              badge={<ArrowUpRight size={20} />}
              meta={
                <p className="text-white/70 mb-2 text-sm font-medium font-mono uppercase tracking-wider">
                  {countLabel(section.slug, section.count)}
                </p>
              }
            />
          </motion.div>
        ))}
      </div>
    </Container>
  );
}
