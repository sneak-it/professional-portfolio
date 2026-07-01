import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Ian Rodriguez-Torrent - open to new projects and opportunities.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact',
    description:
      'Get in touch with Ian Rodriguez-Torrent - open to new projects and opportunities.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
