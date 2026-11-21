import Link from 'next/link';
import CoverImage from '@/components/CoverImage';
import { ExternalLink } from 'lucide-react';
import Container from '@/components/Container';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import SectionNote from '@/components/SectionNote';
import { GitHubIcon } from '@/components/icons/BrandIcons';
import type { ProjectSummary } from '@/lib/portfolio';
import { coverFit, coverSizes } from '@/lib/image';

const SIZES =
  '(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, (max-width: 80rem) 33vw, 24rem';

// Project-style listing (Technology Consulting, Open Source). Cards link to the
// per-item detail page; external links are only shown when present.
export default async function SectionProjectList({
  title,
  description,
  projects,
  note,
}: {
  title: string;
  description: string;
  projects: ProjectSummary[];
  note?: React.ReactNode;
}) {
  const covers = await Promise.all(
    projects.map(async (p) => {
      const fit = await coverFit(p.coverImage, 4 / 3);
      const sizes = fit ? SIZES : await coverSizes(p.coverImage, SIZES, 4 / 3);
      return { fit, sizes };
    }),
  );
  return (
    <Container>
      <BackButton href="/portfolio" label="Back to Portfolio" />

      <PageHeader title={title} description={description} />

      {projects.length === 0 ? (
        <EmptyState>Nothing here yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const tech = project.tech ?? [];
            return (
              <div
                key={project.slug}
                style={{ animationDelay: `${index * 50}ms` }}
                className="enter-up group flex flex-col card-surface overflow-hidden hover:border-accent/50 transition-colors"
              >
                {/* Same target as the title link below: one Tab stop per card. */}
                <Link
                  prefetch={false}
                  href={`/portfolio/${project.section}/${project.slug}`}
                  aria-hidden
                  tabIndex={-1}
                  className="relative photo-edge aspect-[4/3] overflow-hidden block"
                >
                  <CoverImage
                    src={project.coverImage}
                    alt=""
                    priority={index === 0}
                    sizes={covers[index]?.sizes ?? SIZES}
                    fit={covers[index]?.fit}
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                {(project.link || project.github) && (
                  // The row overlaps the cover; only the buttons take clicks.
                  <div className="relative -mt-12 px-6 flex justify-end gap-3 z-10 pointer-events-none">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener"
                        className="pointer-events-auto w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-md"
                        aria-label={`${project.linkLabel}: ${project.title}`}
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener"
                        className="pointer-events-auto w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-md"
                        aria-label={`View ${project.title} source on GitHub`}
                      >
                        <GitHubIcon size={18} />
                      </a>
                    )}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-accent-text transition-colors">
                    <Link
                      prefetch={false}
                      href={`/portfolio/${project.section}/${project.slug}`}
                    >
                      {project.title}
                    </Link>
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 flex-grow">
                    {project.description}
                  </p>

                  {tech.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {tech.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-gray-700 dark:text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <SectionNote>{note}</SectionNote>
    </Container>
  );
}
