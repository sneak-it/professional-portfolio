'use client';

import CoverImage from '@/components/CoverImage';
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
import { moveSpotlight } from '@/lib/spotlight';

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
  avatarUrl: string | null;
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
        <div className="enter-up">
          <div className="relative aspect-square max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-2xl">
            <CoverImage
              src={avatarUrl}
              alt="Portrait"
              priority
              sizes="(max-width: 1024px) 100vw, 448px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>

        <div className="enter-up" style={{ animationDelay: '200ms' }}>
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
                  className="pill-solid px-6 py-3"
                >
                  <LinkedInIcon size={18} /> View LinkedIn
                </a>
              </div>
            )}
          </Surface>
        </div>
      </div>

      {/* Skills section, hidden when about.mdx has none */}
      {skills.length > 0 && (
        <div className="mt-32">
          <div className="enter-up text-center mb-16">
            <h2 className="heading-legible text-3xl md:text-4xl font-display font-bold tracking-tight">
              {skillsHeading}
            </h2>
            <p className="heading-legible mt-4 text-gray-600 dark:text-gray-400">
              {skillsBlurb}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillGroup, index) => (
              <div
                key={skillGroup.name}
                style={{ animationDelay: `${index * 100}ms` }}
                onPointerMove={moveSpotlight}
                className="enter-up surface p-6 spotlight relative group"
              >
                <IconBadge
                  size="md"
                  shape="xl"
                  className="mb-6 transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6"
                >
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal interests, hidden when about.mdx has none */}
      {interests.length > 0 && (
        <div className="mt-32">
          <div className="enter-up text-center mb-16">
            <h2 className="heading-legible text-3xl md:text-4xl font-display font-bold tracking-tight">
              {interestsHeading}
            </h2>
            <p className="heading-legible mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              {interestsBlurb}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {interests.map((interest, index) => (
              <div
                key={interest.name}
                style={{ animationDelay: `${index * 100}ms` }}
                onPointerMove={moveSpotlight}
                className="enter-up surface p-6 spotlight relative group"
              >
                <IconBadge
                  size="md"
                  shape="xl"
                  className="mb-6 transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6"
                >
                  {INTEREST_ICONS[interest.icon] ?? <Wrench size={24} />}
                </IconBadge>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {interest.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {interest.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
