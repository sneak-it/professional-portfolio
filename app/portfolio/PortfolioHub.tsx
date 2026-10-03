import { ArrowUpRight } from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import CoverCard from '@/components/CoverCard';
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
  description,
}: {
  sections: SectionSummary[];
  description: string;
}) {
  return (
    <Container>
      <PageHeader title="Portfolio" description={description} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, index) => (
          <div
            key={section.slug}
            className="enter-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CoverCard
              href={`/portfolio/${section.slug}`}
              coverImage={section.coverImage}
              title={section.name}
              description={section.cardDescription}
              aspect="aspect-[4/5]"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 33vw"
              badge={<ArrowUpRight size={20} />}
              meta={
                <p className="text-white/90 mb-2 text-sm font-medium font-mono uppercase tracking-wider">
                  {countLabel(section.slug, section.count)}
                </p>
              }
            />
          </div>
        ))}
      </div>
    </Container>
  );
}
