import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Get to know Ian Rodriguez-Torrent - the technologist, tinkerer, photographer, and gearhead behind the work.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About',
    description:
      'Get to know Ian Rodriguez-Torrent - the technologist, tinkerer, photographer, and gearhead behind the work.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
