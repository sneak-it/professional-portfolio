import type { Metadata } from 'next';
import ResumeClient from './ResumeClient';

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'Professional journey and educational background — experience, skills, and credentials.',
  alternates: { canonical: '/resume' },
  openGraph: {
    title: 'Resume',
    description:
      'Professional journey and educational background — experience, skills, and credentials.',
    url: '/resume',
  },
};

export default function ResumePage() {
  return <ResumeClient />;
}
