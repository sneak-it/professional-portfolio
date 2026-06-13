import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch — available for freelance work and open to new opportunities.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact',
    description:
      'Get in touch — available for freelance work and open to new opportunities.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
