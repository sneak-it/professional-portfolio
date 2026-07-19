import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import { listMdxSlugs, readMdxFile } from './content';
import { byDateDesc } from './sort';

/**
 * Unified, MDX-driven Portfolio data layer.
 *
 * The Portfolio is organized into three sections, each backed by its own folder
 * of `.mdx` files under `content/portfolio/<section>/`. Two sections
 * ('technology-consulting', 'open-source') are "project" style and render as
 * write-ups; 'photography' is "gallery" style and renders as a scrollable image
 * gallery whose images are auto-discovered from `public/portfolio/photography/<slug>/`.
 *
 * Adding a new engagement, project, or photography sub-category is just dropping
 * an MDX file in the matching folder — picked up via ISR without a rebuild
 * (mirrors the old lib/galleries.ts model).
 */

export const PORTFOLIO_SECTIONS = [
  {
    slug: 'technology-consulting',
    name: 'Technology Consulting',
    type: 'project',
    description:
      'Consulting engagements — strategy, architecture, and hands-on delivery.',
  },
  {
    slug: 'photography',
    name: 'Photography',
    type: 'gallery',
    description: 'Photography collections, organized by subject.',
  },
  {
    slug: 'open-source',
    name: 'Open Source',
    type: 'project',
    description: 'Open source projects and contributions.',
  },
] as const;

export type PortfolioSection = (typeof PORTFOLIO_SECTIONS)[number];
export type SectionSlug = PortfolioSection['slug'];

export interface PortfolioImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** Project-style item (technology-consulting, open-source). */
export interface ProjectItem {
  section: SectionSlug;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  content?: string;
  tech?: string[];
  link?: string;
  github?: string;
  features?: string[];
  challenges?: string;
}

/** Gallery-style item (photography). Structural superset of the old `Gallery`. */
export interface GalleryItem {
  section: 'photography';
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  content?: string;
  images: PortfolioImage[];
}

/** Hub-card summary for the /portfolio index. */
export interface SectionSummary {
  slug: SectionSlug;
  name: string;
  description: string;
  type: PortfolioSection['type'];
  count: number;
  coverImage: string | null;
}

const portfolioDirectory = path.join(process.cwd(), 'content/portfolio');
const publicPhotographyDirectory = path.join(
  process.cwd(),
  'public/portfolio/photography',
);

/** Look up a section by slug; validates a dynamic route param. */
export function getSection(slug: string): PortfolioSection | null {
  return PORTFOLIO_SECTIONS.find((s) => s.slug === slug) ?? null;
}

function sectionDir(section: SectionSlug): string {
  return path.join(portfolioDirectory, section);
}

// -- Project sections --------------------------------------------------------

export function getProjectItem(
  section: SectionSlug,
  slug: string,
): ProjectItem | null {
  const file = readMdxFile(sectionDir(section), slug);
  if (file === null) return null;

  const { data } = file;
  return {
    section,
    slug: file.slug,
    title: (data.title as string) || file.slug,
    description: (data.description as string) || '',
    coverImage: (data.coverImage as string) || '',
    date: (data.date as string) || '',
    content: file.content,
    tech: data.tech as string[] | undefined,
    link: (data.link as string) || undefined,
    github: (data.github as string) || undefined,
    features: data.features as string[] | undefined,
    challenges: (data.challenges as string) || undefined,
  };
}

export function getProjectItems(section: SectionSlug): ProjectItem[] {
  return listMdxSlugs(sectionDir(section))
    .map((file) => getProjectItem(section, file))
    .filter((p): p is ProjectItem => p !== null)
    .sort(byDateDesc);
}

// -- Photography (gallery) section ------------------------------------------

function scanImages(slug: string): PortfolioImage[] {
  const imagesDir = path.join(publicPhotographyDirectory, slug);
  const images: PortfolioImage[] = [];

  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    for (const file of files) {
      if (file.match(/\.(jpe?g|png|webp|gif)$/i)) {
        const imagePath = path.join(imagesDir, file);
        try {
          const buffer = fs.readFileSync(imagePath);
          const dimensions = sizeOf(buffer);
          images.push({
            id: file,
            src: `/portfolio/photography/${slug}/${file}`,
            alt: file.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
            width: dimensions.width || 800,
            height: dimensions.height || 600,
          });
        } catch (e) {
          console.error(`Error reading image dimensions for ${imagePath}`, e);
        }
      }
    }
  }

  // Fallback to placeholder images if the directory is empty (for demo purposes)
  if (images.length === 0) {
    images.push(
      {
        id: 'p1',
        src: `https://picsum.photos/seed/${slug}1/800/1200`,
        alt: 'Placeholder 1',
        width: 800,
        height: 1200,
      },
      {
        id: 'p2',
        src: `https://picsum.photos/seed/${slug}2/1200/800`,
        alt: 'Placeholder 2',
        width: 1200,
        height: 800,
      },
      {
        id: 'p3',
        src: `https://picsum.photos/seed/${slug}3/800/800`,
        alt: 'Placeholder 3',
        width: 800,
        height: 800,
      },
      {
        id: 'p4',
        src: `https://picsum.photos/seed/${slug}4/1200/1600`,
        alt: 'Placeholder 4',
        width: 1200,
        height: 1600,
      },
    );
  }

  return images;
}

export function getPhotographyGallery(slug: string): GalleryItem | null {
  const file = readMdxFile(sectionDir('photography'), slug);
  if (file === null) return null;

  const { data } = file;
  const images = scanImages(file.slug);
  const coverImage = (data.coverImage as string) || images[0]?.src || '';

  return {
    section: 'photography',
    slug: file.slug,
    title: (data.title as string) || file.slug,
    description: (data.description as string) || '',
    coverImage,
    date: (data.date as string) || '',
    content: file.content,
    images,
  };
}

export function getPhotographyGalleries(): GalleryItem[] {
  return listMdxSlugs(sectionDir('photography'))
    .map((file) => getPhotographyGallery(file))
    .filter((g): g is GalleryItem => g !== null)
    .sort(byDateDesc);
}

// -- Hub ---------------------------------------------------------------------

export function getSectionSummaries(): SectionSummary[] {
  return PORTFOLIO_SECTIONS.map((section) => {
    const items =
      section.type === 'gallery'
        ? getPhotographyGalleries()
        : getProjectItems(section.slug);
    return {
      slug: section.slug,
      name: section.name,
      description: section.description,
      type: section.type,
      count: items.length,
      coverImage: items[0]?.coverImage ?? null,
    };
  });
}
