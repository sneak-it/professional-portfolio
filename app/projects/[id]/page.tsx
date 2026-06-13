import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Container from '@/components/Container';
import JsonLd from '@/components/JsonLd';
import { getProjectById, getProjectIds } from '@/lib/projects';
import { siteConfig } from '@/lib/site';
import ProjectDetailClient from './ProjectDetailClient';

export function generateStaticParams() {
  return getProjectIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return {};
  }

  const url = `/projects/${id}`;

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.description,
      url,
      images: project.image ? [{ url: project.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  const url = `${siteConfig.url}/projects/${id}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Projects',
        item: `${siteConfig.url}/projects`,
      },
      { '@type': 'ListItem', position: 3, name: project.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Container size="lg">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <ProjectDetailClient project={project} />
      </Container>
    </>
  );
}
