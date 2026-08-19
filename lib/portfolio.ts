import fs from 'fs';
import path from 'path';
import { imageDimensions } from './image';
import { listMdxSlugs, readMdxFile, type MdxFile } from './content';
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

/**
 * Gallery-style item (photography). Structural superset of the old `Gallery`.
 *
 * No `content`: nothing renders a photography MDX body, so carrying it only
 * serialized dead prose into the client payload.
 */
export interface GalleryItem {
  section: 'photography';
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  images: PortfolioImage[];
}

/**
 * Listing shapes. The section listings render covers, titles, and a photo
 * count, so the full MDX body and the per-image dimension array would be
 * serialized into the RSC payload of a page that never reads them. Mirrors what
 * `getAllPostMeta` already does for the blog (see lib/mdx.ts).
 */
export type ProjectSummary = Omit<ProjectItem, 'content'>;

export type GallerySummary = Omit<GalleryItem, 'images'> & {
  imageCount: number;
};

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

function projectSummary(section: SectionSlug, file: MdxFile): ProjectSummary {
  const { data } = file;
  return {
    section,
    slug: file.slug,
    title: (data.title as string) || file.slug,
    description: (data.description as string) || '',
    coverImage: (data.coverImage as string) || '',
    date: (data.date as string) || '',
    tech: data.tech as string[] | undefined,
    link: (data.link as string) || undefined,
    github: (data.github as string) || undefined,
    features: data.features as string[] | undefined,
    challenges: (data.challenges as string) || undefined,
  };
}

export function getProjectItem(
  section: SectionSlug,
  slug: string,
): ProjectItem | null {
  const file = readMdxFile(sectionDir(section), slug);
  if (file === null) return null;
  return { ...projectSummary(section, file), content: file.content };
}

/** Listing: the MDX body is never built, so it cannot reach the payload. */
export function getProjectItems(section: SectionSlug): ProjectSummary[] {
  const dir = sectionDir(section);
  return listMdxSlugs(dir)
    .map((file) => readMdxFile(dir, file))
    .filter((f): f is MdxFile => f !== null)
    .map((file) => projectSummary(section, file))
    .sort(byDateDesc);
}

// -- Photography (gallery) section ------------------------------------------

const IMAGE_FILE_RE = /\.(jpe?g|png|webp|gif)$/i;

/** Image filenames in a gallery's folder. */
function listGalleryImageFiles(slug: string): string[] {
  const imagesDir = path.join(publicPhotographyDirectory, slug);
  if (!fs.existsSync(imagesDir)) return [];
  return fs.readdirSync(imagesDir).filter((file) => IMAGE_FILE_RE.test(file));
}

/** Cover src without dimension reads: frontmatter, else first image, else picsum. */
function galleryCoverSrc(slug: string, coverImage: unknown): string {
  if (typeof coverImage === 'string' && coverImage) return coverImage;
  const first = listGalleryImageFiles(slug)[0];
  if (first) return `/portfolio/photography/${slug}/${first}`;
  return `https://picsum.photos/seed/${slug}1/800/1200`;
}

// Shape of the demo fallback, kept separate so the listing can count it without
// scanning the (empty) directory.
const PLACEHOLDER_SIZES = [
  [800, 1200],
  [1200, 800],
  [800, 800],
  [1200, 1600],
] as const;

function placeholderImages(slug: string): PortfolioImage[] {
  return PLACEHOLDER_SIZES.map(([width, height], i) => ({
    id: `p${i + 1}`,
    src: `https://picsum.photos/seed/${slug}${i + 1}/${width}/${height}`,
    alt: `Placeholder ${i + 1}`,
    width,
    height,
  }));
}

function scanImages(slug: string): PortfolioImage[] {
  const imagesDir = path.join(publicPhotographyDirectory, slug);
  const images: PortfolioImage[] = [];

  for (const file of listGalleryImageFiles(slug)) {
    const imagePath = path.join(imagesDir, file);
    try {
      const { width, height } = imageDimensions(imagePath);
      images.push({
        id: file,
        src: `/portfolio/photography/${slug}/${file}`,
        alt: file.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
        width,
        height,
      });
    } catch (e) {
      console.error(`Error reading image dimensions for ${imagePath}`, e);
    }
  }

  // Fallback to placeholder images if the directory is empty (for demo purposes)
  if (images.length === 0) images.push(...placeholderImages(slug));

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
    images,
  };
}

/**
 * Gallery listing. Reads no image headers: the cover comes from
 * `galleryCoverSrc` and the count from the directory listing, so a section with
 * N galleries costs N readdir calls instead of one `statSync` + header read per
 * photo. Also feeds the hub via `getSectionSummaries`.
 */
export function getPhotographyGalleries(): GallerySummary[] {
  const dir = sectionDir('photography');
  return listMdxSlugs(dir)
    .map((file) => {
      const mdx = readMdxFile(dir, file);
      if (mdx === null) return null;
      const { data } = mdx;
      const files = listGalleryImageFiles(mdx.slug);
      return {
        section: 'photography' as const,
        slug: mdx.slug,
        title: (data.title as string) || mdx.slug,
        description: (data.description as string) || '',
        coverImage: galleryCoverSrc(mdx.slug, data.coverImage),
        date: (data.date as string) || '',
        imageCount: files.length || PLACEHOLDER_SIZES.length,
      };
    })
    .filter((g): g is GallerySummary => g !== null)
    .sort(byDateDesc);
}

// -- Hub ---------------------------------------------------------------------

export function getSectionSummaries(): SectionSummary[] {
  return PORTFOLIO_SECTIONS.map((section) => {
    if (section.type === 'gallery') {
      const covers = getPhotographyGalleries();
      return {
        slug: section.slug,
        name: section.name,
        description: section.description,
        type: section.type,
        count: covers.length,
        coverImage: covers[0]?.coverImage ?? null,
      };
    }

    const items = getProjectItems(section.slug);
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
