/**
 * About-page content. `icon` is a stable key (not JSX) so this stays
 * presentation-free; AboutClient maps the key to a lucide icon.
 */
export type SkillIcon = 'frontend' | 'backend' | 'database' | 'tools';

export interface SkillGroup {
  name: string;
  icon: SkillIcon;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    name: 'Frontend',
    icon: 'frontend',
    items: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    name: 'Backend',
    icon: 'backend',
    items: ['Node.js', 'Express', 'Python', 'Django', 'GraphQL'],
  },
  {
    name: 'Database',
    icon: 'database',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma'],
  },
  {
    name: 'Tools',
    icon: 'tools',
    items: ['Git', 'Docker', 'AWS', 'Vercel', 'Figma'],
  },
];
