'use client';

import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Download } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const experience = [
  {
    id: 1,
    role: 'Senior Frontend Engineer',
    company: 'Tech Innovators Inc.',
    period: '2021 - Present',
    description: 'Lead the frontend development team in building a scalable SaaS platform using Next.js and React. Improved performance by 40% and established design system guidelines.',
  },
  {
    id: 2,
    role: 'Full Stack Developer',
    company: 'Digital Solutions Agency',
    period: '2018 - 2021',
    description: 'Developed and maintained multiple client projects using React, Node.js, and PostgreSQL. Mentored junior developers and implemented CI/CD pipelines.',
  },
  {
    id: 3,
    role: 'Web Developer',
    company: 'Creative Studio',
    period: '2016 - 2018',
    description: 'Created interactive marketing websites and landing pages using HTML, CSS, JavaScript, and GSAP for animations.',
  }
];

const education = [
  {
    id: 1,
    degree: 'Master of Science in Computer Science',
    institution: 'Tech University',
    period: '2014 - 2016',
  },
  {
    id: 2,
    degree: 'Bachelor of Science in Software Engineering',
    institution: 'State College',
    period: '2010 - 2014',
  }
];

export default function Resume() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4"
            >
              Resume
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
          {/* Experience Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <h2 className="text-2xl font-bold">Experience</h2>
            </div>
            
            <div className="relative border-l border-gray-200 dark:border-gray-800 ml-5 space-y-12">
              {experience.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-8"
                >
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-white dark:ring-[#050505]" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h3 className="text-xl font-bold">{item.role}</h3>
                    <span className="text-sm font-medium text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full w-fit">
                      {item.period}
                    </span>
                  </div>
                  <h4 className="text-lg text-gray-600 dark:text-gray-400 mb-4">{item.company}</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-500 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <h2 className="text-2xl font-bold">Education</h2>
            </div>
            
            <div className="relative border-l border-gray-200 dark:border-gray-800 ml-5 space-y-12">
              {education.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-8"
                >
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white dark:ring-[#050505]" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h3 className="text-xl font-bold">{item.degree}</h3>
                    <span className="text-sm font-medium text-purple-500 bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full w-fit">
                      {item.period}
                    </span>
                  </div>
                  <h4 className="text-lg text-gray-600 dark:text-gray-400">{item.institution}</h4>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
