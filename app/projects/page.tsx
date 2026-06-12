'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, GitFork } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const categories = ['All', 'Web', 'Mobile', 'Design'];

const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    category: 'Web',
    image: 'https://picsum.photos/seed/ecommerce/800/600',
    description: 'A full-featured e-commerce platform built with Next.js, Stripe, and Tailwind CSS.',
    tech: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind'],
    link: '#',
    github: '#'
  },
  {
    id: 2,
    title: 'Fitness Tracker App',
    category: 'Mobile',
    image: 'https://picsum.photos/seed/fitness/800/600',
    description: 'A cross-platform mobile app for tracking workouts and nutrition.',
    tech: ['React Native', 'Firebase', 'Redux'],
    link: '#',
    github: '#'
  },
  {
    id: 3,
    title: 'Brand Identity',
    category: 'Design',
    image: 'https://picsum.photos/seed/brand/800/600',
    description: 'Complete brand identity design for a sustainable tech startup.',
    tech: ['Figma', 'Illustrator', 'Photoshop'],
    link: '#',
    github: '#'
  },
  {
    id: 4,
    title: 'AI Content Generator',
    category: 'Web',
    image: 'https://picsum.photos/seed/ai/800/600',
    description: 'A web app that uses OpenAI API to generate marketing copy and blog posts.',
    tech: ['React', 'Node.js', 'OpenAI API'],
    link: '#',
    github: '#'
  },
  {
    id: 5,
    title: 'Task Management Tool',
    category: 'Web',
    image: 'https://picsum.photos/seed/task/800/600',
    description: 'A collaborative task management tool with real-time updates.',
    tech: ['Vue.js', 'Socket.io', 'Express'],
    link: '#',
    github: '#'
  },
  {
    id: 6,
    title: 'Weather Dashboard',
    category: 'Web',
    image: 'https://picsum.photos/seed/weather/800/600',
    description: 'A beautiful weather dashboard with interactive maps and charts.',
    tech: ['Next.js', 'D3.js', 'Weather API'],
    link: '#',
    github: '#'
  }
];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4"
          >
            My Projects
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            A collection of my recent work across web development, mobile apps, and design.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
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

        {/* Project Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform">
                      <ExternalLink size={20} />
                    </a>
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform">
                      <GitFork size={20} />
                    </a>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-orange-500 uppercase tracking-wider">{project.category}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                    <Link href={`/projects/${project.id}`}>{project.title}</Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tech.map((t) => (
                      <span key={t} className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-gray-600 dark:text-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageTransition>
  );
}
