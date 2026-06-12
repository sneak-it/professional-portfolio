'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Download, Code2, Palette, Terminal, Database } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const skills = [
  {
    name: 'Frontend',
    icon: <Palette size={24} />,
    items: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    name: 'Backend',
    icon: <Terminal size={24} />,
    items: ['Node.js', 'Express', 'Python', 'Django', 'GraphQL'],
  },
  {
    name: 'Database',
    icon: <Database size={24} />,
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma'],
  },
  {
    name: 'Tools',
    icon: <Code2 size={24} />,
    items: ['Git', 'Docker', 'AWS', 'Vercel', 'Figma'],
  },
];

export default function About() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-square max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/portrait/800/800"
                alt="Portrait"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              About Me
            </h1>
            <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
              <p>
                Hello! I&apos;m a passionate software engineer and designer with
                over 5 years of experience creating digital products. I
                specialize in building robust, scalable web applications with a
                strong focus on user experience and beautiful interfaces.
              </p>
              <p>
                My journey started with a curiosity for how things work on the
                internet, which led me to dive deep into frontend and backend
                technologies. I believe that great software is a perfect blend
                of solid engineering and thoughtful design.
              </p>
              <p>
                When I&apos;m not coding, you can find me exploring the
                outdoors, reading sci-fi novels, or experimenting with new
                cooking recipes.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
              >
                <Download size={18} /> Download Resume
              </a>
            </div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <div className="mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Technical Arsenal
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              The tools and technologies I use to bring ideas to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 hover:border-orange-500/50 transition-colors shadow-lg"
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center mb-6">
                  {skillGroup.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {skillGroup.name}
                </h3>
                <ul className="space-y-2">
                  {skillGroup.items.map((item) => (
                    <li
                      key={item}
                      className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
