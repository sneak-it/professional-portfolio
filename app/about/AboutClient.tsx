'use client';

import Image from 'next/image';
import { m } from 'motion/react';
import {
  Cloud,
  Network,
  Database,
  Briefcase,
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
import type {
  Interest,
  InterestIcon,
  SkillGroup,
  SkillIcon,
} from '@/lib/about';

const SKILL_ICONS: Record<SkillIcon, React.ReactNode> = {
  ops: <Cloud size={24} />,
  network: <Network size={24} />,
  data: <Database size={24} />,
  business: <Briefcase size={24} />,
};

const INTEREST_ICONS: Record<InterestIcon, React.ReactNode> = {
  server: <Server size={24} />,
  bot: <Bot size={24} />,
  gamepad: <Gamepad2 size={24} />,
  camera: <Camera size={24} />,
  wrench: <Wrench size={24} />,
  sprout: <Sprout size={24} />,
};

export default function AboutClient({
  linkedin,
  avatarUrl,
  skills,
  interests,
  skillsHeading,
  skillsBlurb,
  interestsHeading,
  interestsBlurb,
  children,
}: {
  linkedin?: string;
  avatarUrl: string;
  skills: SkillGroup[];
  interests: Interest[];
  skillsHeading: string;
  skillsBlurb: string;
  interestsHeading: string;
  interestsBlurb: string;
  /** Bio paragraphs, rendered from content/about.mdx by the server parent. */
  children: React.ReactNode;
}) {
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
              src={avatarUrl}
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
              {children}
            </div>

            {linkedin && (
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
            )}
          </Surface>
        </m.div>
      </div>

      {/* Skills section, hidden when about.mdx has none */}
      {skills.length > 0 && (
        <div className="mt-32">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="heading-legible text-3xl md:text-4xl font-display font-bold tracking-tight">
              {skillsHeading}
            </h2>
            <p className="heading-legible mt-4 text-gray-600 dark:text-gray-400">
              {skillsBlurb}
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
                  {/* Unrecognized key falls back: about.mdx is hand-edited. */}
                  {SKILL_ICONS[skillGroup.icon] ?? <Wrench size={24} />}
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
      )}

      {/* Personal interests, hidden when about.mdx has none */}
      {interests.length > 0 && (
        <div className="mt-32">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="heading-legible text-3xl md:text-4xl font-display font-bold tracking-tight">
              {interestsHeading}
            </h2>
            <p className="heading-legible mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              {interestsBlurb}
            </p>
          </m.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {interests.map((interest, index) => (
              <m.div
                key={interest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface p-6 hover:border-accent/50 transition-colors"
              >
                <IconBadge size="md" shape="xl" className="mb-6">
                  {INTEREST_ICONS[interest.icon]}
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
      )}
    </Container>
  );
}
