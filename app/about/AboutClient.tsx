'use client';

import Image from 'next/image';
import { m } from 'motion/react';
import {
  Code2,
  Palette,
  Terminal,
  Database,
  Bot,
  Server,
  Gamepad2,
  Camera,
  Wrench,
  Sprout,
} from 'lucide-react';
import Container from '@/components/Container';
import Surface from '@/components/Surface';
import IconBadge from '@/components/IconBadge';
import { LinkedInIcon } from '@/components/icons/BrandIcons';
import { skills, type SkillIcon } from '@/lib/about';

const SKILL_ICONS: Record<SkillIcon, React.ReactNode> = {
  frontend: <Palette size={24} />,
  backend: <Terminal size={24} />,
  database: <Database size={24} />,
  tools: <Code2 size={24} />,
};

// Personal interests for the "Off the Clock" section.
const INTERESTS: Array<{ name: string; icon: React.ReactNode; blurb: string }> =
  [
    {
      name: 'Homelab & Self-Hosting',
      icon: <Server size={24} />,
      blurb:
        'A rack that is perpetually half-reorganized. I self-host what I can, break it regularly, and learn something every time I put it back together.',
    },
    {
      name: 'AI & Tinkering',
      icon: <Bot size={24} />,
      blurb:
        'Local models, agentic workflows, and automating the boring parts of my day. If it has an API, I have probably poked at it.',
    },
    {
      name: 'Gaming & Esports',
      icon: <Gamepad2 size={24} />,
      blurb:
        'Where a lot of this started. I built a community of nearly two million players and still keep a controller - and a server or two - close by.',
    },
    {
      name: 'Photography',
      icon: <Camera size={24} />,
      blurb:
        'A good excuse to slow down and pay attention. Mostly nature and the odd geometry of cities - some of it lives in my portfolio.',
    },
    {
      name: 'Cars & Wrenching',
      icon: <Wrench size={24} />,
      blurb:
        'I like machines I can actually put my hands on. Plenty of weekends involve a hood up, a socket set out, and grease under my fingernails.',
    },
    {
      name: 'Gardening',
      icon: <Sprout size={24} />,
      blurb:
        'A slower, dirtier kind of system to maintain - and a nice reminder that not everything worthwhile reboots in thirty seconds.',
    },
  ];

export default function AboutClient({ linkedin }: { linkedin: string }) {
  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <m.div
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
        </m.div>

        <m.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Surface padding="lg">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              About Me
            </h1>
            <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
              <p>
                Hi, I'm Ian - a Connecticut-based technologist who genuinely
                likes this stuff. I've spent years running IT operations,
                wrangling infrastructure, and untangling the kinds of problems
                that make other people's eyes glaze over. Somewhere along the
                way it stopped being just a job.
              </p>
              <p>Paragraph two.</p>
              <p>Paragraph three.</p>
            </div>

            <div className="mt-8 flex gap-4">
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent transition-colors"
              >
                <LinkedInIcon size={18} /> View LinkedIn
              </a>
            </div>
          </Surface>
        </m.div>
      </div>

      {/* Skills Section */}
      <div className="mt-32">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="heading-legible text-3xl md:text-4xl font-display font-bold tracking-tight">
            Technical Arsenal
          </h2>
          <p className="heading-legible mt-4 text-gray-600 dark:text-gray-400">
            The tools I reach for - at work and at home.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skillGroup, index) => (
            <m.div
              key={skillGroup.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface p-6 hover:border-accent/50 transition-colors"
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
            </m.div>
          ))}
        </div>
      </div>

      {/* Off the Clock — personal interests */}
      <div className="mt-32">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="heading-legible text-3xl md:text-4xl font-display font-bold tracking-tight">
            Off the Clock
          </h2>
          <p className="heading-legible mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            When I'm not being paid to think about technology, I'm usually still
            thinking about technology - plus a few things that keep me away from
            a screen.
          </p>
        </m.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {INTERESTS.map((interest, index) => (
            <m.div
              key={interest.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface p-6 hover:border-accent/50 transition-colors"
            >
              <IconBadge size="md" shape="xl" className="mb-6">
                {interest.icon}
              </IconBadge>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                {interest.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {interest.blurb}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </Container>
  );
}
