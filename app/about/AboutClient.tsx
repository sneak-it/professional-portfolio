'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Download, Code2, Palette, Terminal, Database } from 'lucide-react';
import Container from '@/components/Container';
import IconBadge from '@/components/IconBadge';
import { skills, type SkillIcon } from '@/lib/about';

const SKILL_ICONS: Record<SkillIcon, React.ReactNode> = {
  frontend: <Palette size={24} />,
  backend: <Terminal size={24} />,
  database: <Database size={24} />,
  tools: <Code2 size={24} />,
};

export default function AboutClient() {
  return (
    <Container>
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
              priority
              sizes="(max-width: 1024px) 100vw, 448px"
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
              over 5 years of experience creating digital products. I specialize
              in building robust, scalable web applications with a strong focus
              on user experience and beautiful interfaces.
            </p>
            <p>
              My journey started with a curiosity for how things work on the
              internet, which led me to dive deep into frontend and backend
              technologies. I believe that great software is a perfect blend of
              solid engineering and thoughtful design.
            </p>
            <p>
              When I&apos;m not coding, you can find me exploring the outdoors,
              reading sci-fi novels, or experimenting with new cooking recipes.
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent transition-colors"
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
              className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 hover:border-accent/50 transition-colors shadow-lg"
            >
              <IconBadge size="md" shape="xl" className="mb-6">
                {SKILL_ICONS[skillGroup.icon]}
              </IconBadge>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {skillGroup.name}
              </h3>
              <ul className="space-y-2">
                {skillGroup.items.map((item) => (
                  <li
                    key={item}
                    className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Container>
  );
}
