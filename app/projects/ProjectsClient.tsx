'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import { GitHubIcon } from '@/components/icons/BrandIcons';
import { scaleIn } from '@/lib/motion';
import { getAllProjects, getProjectCategories } from '@/lib/projects';

const categories = getProjectCategories();
const projects = getAllProjects();

export default function ProjectsClient() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <Container>
      <PageHeader
        title="My Projects"
        description="A collection of my recent work across web development, mobile apps, and design."
      />

      {/* Filters */}
      <motion.div
        role="group"
        aria-label="Filter projects by category"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            aria-pressed={activeCategory === category}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      <p className="sr-only" aria-live="polite">
        Showing {filteredProjects.length}{' '}
        {filteredProjects.length === 1 ? 'project' : 'projects'}
        {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.
      </p>

      {/* Project Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              {...scaleIn}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="group flex flex-col bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform"
                    aria-label="View live project"
                  >
                    <ExternalLink size={20} />
                  </a>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform"
                    aria-label="View source on GitHub"
                  >
                    <GitHubIcon size={20} />
                  </a>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-orange-500 uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                  <Link href={`/projects/${project.id}`}>{project.title}</Link>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-gray-600 dark:text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
}
