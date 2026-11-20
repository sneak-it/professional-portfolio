import Image from 'next/image';
import { ExternalLink, GitFork } from 'lucide-react';
import LightboxTrigger from '@/components/LightboxTrigger';
import Surface from '@/components/Surface';
import type { ProjectItem } from '@/lib/portfolio';
import { localImageDimensions } from '@/lib/image';

const COVER_BOX =
  'enter-up lg:self-center relative photo-edge rounded-3xl overflow-hidden shadow-2xl';

export default async function ProjectDetailClient({
  project,
  sectionName,
}: {
  project: ProjectItem;
  sectionName: string;
}) {
  const tech = project.tech ?? [];
  const dims = project.coverImage
    ? await localImageDimensions(project.coverImage)
    : null;
  const coverStyle = {
    animationDelay: '200ms',
    aspectRatio: dims ? `${dims.width} / ${dims.height}` : '1',
  };
  const cover = project.coverImage ? (
    <Image
      src={project.coverImage}
      alt=""
      fill
      loading="eager"
      fetchPriority="high"
      sizes="(max-width: 64rem) 100vw, 29rem"
      className="object-cover"
      referrerPolicy="no-referrer"
    />
  ) : null;

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

      {project.coverImage &&
        (dims ? (
          <LightboxTrigger
            src={project.coverImage}
            alt={project.title}
            {...dims}
            style={coverStyle}
            className={`${COVER_BOX} block w-full`}
          >
            {cover}
          </LightboxTrigger>
        ) : (
          <div style={coverStyle} className={COVER_BOX}>
            {cover}
          </div>
        ))}
    </div>
  );
}
