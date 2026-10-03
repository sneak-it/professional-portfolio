import Image from 'next/image';
import { ExternalLink, GitFork, CheckCircle2 } from 'lucide-react';
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
  const features = project.features ?? [];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
        <div className="enter-up">
          <Surface padding="lg">
            <span className="text-accent-text font-medium font-mono uppercase tracking-wider text-sm mb-4 block">
              {sectionName}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              {project.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
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
                    Live Demo <ExternalLink size={18} />
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
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Technologies
                </h3>
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
            className="enter-up relative aspect-square lg:aspect-auto lg:h-full rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {(features.length > 0 || project.challenges) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {features.length > 0 && (
            <div className="enter-up">
              <Surface padding="md">
                <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                    >
                      <CheckCircle2
                        className="text-accent shrink-0 mt-1"
                        size={20}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Surface>
            </div>
          )}

          {project.challenges && (
            <div className="enter-up" style={{ animationDelay: '200ms' }}>
              <Surface padding="md">
                <h2 className="text-2xl font-bold mb-6">
                  Challenges & Solutions
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {project.challenges}
                </p>
              </Surface>
            </div>
          )}
        </div>
      )}
    </>
  );
}
