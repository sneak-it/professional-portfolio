'use client';

import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Download } from 'lucide-react';
import Container from '@/components/Container';
import IconBadge from '@/components/IconBadge';
import { fadeInUp } from '@/lib/motion';
import { experience, education, type TimelineEntry } from '@/lib/resume';

function Timeline({
  entries,
  accent,
}: {
  entries: TimelineEntry[];
  accent: 'orange' | 'purple';
}) {
  const dot = accent === 'orange' ? 'bg-orange-500' : 'bg-purple-500';
  const badge =
    accent === 'orange'
      ? 'text-orange-500 bg-orange-50 dark:bg-orange-500/10'
      : 'text-purple-500 bg-purple-50 dark:bg-purple-500/10';

  return (
    <div className="relative border-l border-gray-200 dark:border-gray-800 ml-5 space-y-12">
      {entries.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative pl-8"
        >
          <div
            className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${dot} ring-4 ring-white dark:ring-background-deep`}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
            <h3 className="text-xl font-bold">{item.title}</h3>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full w-fit ${badge}`}
            >
              {item.period}
            </span>
          </div>
          <h4 className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {item.subtitle}
          </h4>
          {item.description && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {item.description}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function ResumeClient() {
  return (
    <Container size="md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <motion.h1
            {...fadeInUp}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4"
          >
            Resume
          </motion.h1>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            My professional journey and educational background.
          </motion.p>
        </div>
        <motion.a
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          href="/resume.pdf"
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-medium hover:scale-105 transition-transform"
        >
          <Download size={18} /> Download PDF
        </motion.a>
      </div>

      <div className="space-y-20">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <IconBadge color="orange">
              <Briefcase size={20} />
            </IconBadge>
            <h2 className="text-2xl font-bold">Experience</h2>
          </div>
          <Timeline entries={experience} accent="orange" />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <IconBadge color="purple">
              <GraduationCap size={20} />
            </IconBadge>
            <h2 className="text-2xl font-bold">Education</h2>
          </div>
          <Timeline entries={education} accent="purple" />
        </section>
      </div>
    </Container>
  );
}
