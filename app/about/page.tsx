import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Software engineer and designer building robust, scalable web applications with a focus on user experience and beautiful interfaces.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About',
    description:
      'Software engineer and designer building robust, scalable web applications with a focus on user experience and beautiful interfaces.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
