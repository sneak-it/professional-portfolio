'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { ExternalLink, GitFork, CheckCircle2 } from 'lucide-react';
import { fadeInUp, fadeInUpOnView } from '@/lib/motion';
import type { ProjectData } from '@/lib/projects';

export default function ProjectDetailClient({
  project,
}: {
  project: ProjectData;
}) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
        <motion.div {...fadeInUp}>
          <span className="text-orange-500 font-medium uppercase tracking-wider text-sm mb-4 block">
            {project.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
            {project.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-medium hover:scale-105 transition-transform"
            >
              Live Demo <ExternalLink size={18} />
            </a>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/20 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Source Code <GitFork size={18} />
            </a>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-sm font-medium px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative aspect-square lg:aspect-auto lg:h-full rounded-3xl overflow-hidden shadow-2xl"
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <motion.div {...fadeInUpOnView}>
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <ul className="space-y-4">
            {project.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
              >
                <CheckCircle2
                  className="text-orange-500 shrink-0 mt-1"
                  size={20}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeInUpOnView} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold mb-6">Challenges & Solutions</h2>
          <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {project.challenges}
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
