import Image from 'next/image';
import { ExternalLink, GitFork } from 'lucide-react';
import Surface from '@/components/Surface';
import type { ProjectItem } from '@/lib/portfolio';

export default function ProjectDetailClient({
  project,
  sectionName,
}: {
  project: ProjectItem;
  sectionName: string;
}) {
  const tech = project.tech ?? [];

  return (
    // Without a cover image, the title card spans both columns.
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 [&>:only-child]:col-span-full">
      <div className="enter-up">
        <Surface padding="lg">
          <span className="text-accent-text font-medium font-mono uppercase tracking-wider text-sm mb-4 block">
            {sectionName}
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
            {project.title}
          </h1>
          <p className="max-w-measure text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            {project.description}
          </p>

          {(project.link || project.github) && (
            <div className="flex flex-wrap gap-4 mb-8">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-solid px-6 py-3"
                >
                  {project.linkLabel} <ExternalLink size={18} />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-outline px-6 py-3"
                >
                  Source Code <GitFork size={18} />
                </a>
              )}
            </div>
          )}

          {tech.length > 0 && (
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {tech.map((t) => (
                  <span
                    key={t}
                    className="text-sm font-medium px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Surface>
      </div>

      {project.coverImage && (
        <div
          style={{ animationDelay: '200ms' }}
          className="enter-up relative photo-edge aspect-square lg:aspect-auto lg:h-full rounded-3xl overflow-hidden shadow-2xl"
        >
          <Image
            src={project.coverImage}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 64rem) 100vw, 27.5rem"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
