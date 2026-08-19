'use client';

import Link from 'next/link';
import CoverImage from '@/components/CoverImage';
import { m } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import Container from '@/components/Container';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import { GitHubIcon } from '@/components/icons/BrandIcons';
import { scaleIn } from '@/lib/motion';
import type { ProjectSummary } from '@/lib/portfolio';

// Project-style listing (Technology Consulting, Open Source). Cards link to the
// per-item detail page; external links are only shown when present.
export default function SectionProjectList({
  title,
  description,
  projects,
}: {
  title: string;
  description: string;
  projects: ProjectSummary[];
}) {
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
              <m.div
                key={project.slug}
                {...scaleIn}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group flex flex-col bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all"
              >
                <Link
                  href={`/portfolio/${project.section}/${project.slug}`}
                  className="relative aspect-[4/3] overflow-hidden block"
                >
                  <CoverImage
                    src={project.coverImage}
                    alt={project.title}
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                {(project.link || project.github) && (
                  <div className="relative -mt-12 px-6 flex justify-end gap-3 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-md"
                        aria-label={`View ${project.title} live`}
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-md"
                        aria-label={`View ${project.title} source on GitHub`}
                      >
                        <GitHubIcon size={18} />
                      </a>
                    )}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                    <Link
                      href={`/portfolio/${project.section}/${project.slug}`}
                    >
                      {project.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">
                    {project.description}
                  </p>

                  {tech.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {tech.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-gray-600 dark:text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </m.div>
            );
          })}
        </div>
      )}
    </Container>
  );
}
