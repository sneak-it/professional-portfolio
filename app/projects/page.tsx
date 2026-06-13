import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A collection of recent work across web development, mobile apps, and design.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projects',
    description:
      'A collection of recent work across web development, mobile apps, and design.',
    url: '/projects',
  },
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
