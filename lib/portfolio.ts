import path from 'path';
import { imageDimensions } from './image.ts';
import {
  isDraft,
  listDir,
  listMdxFiles,
  readMdxFile,
  type MdxFile,
} from './content.ts';
import { byDateDesc } from './sort.ts';

/**
 * MDX-driven Portfolio data layer. Three sections, each a folder of `.mdx`
 * under `content/portfolio/<section>/`: 'technology-consulting' and
 * 'open-source' render as project write-ups, 'photography' as a gallery whose
 * images are scanned from `media/portfolio/photography/<slug>/`. Adding an
 * item is dropping an MDX file in the matching folder.
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
  /** Only ever set on a direct lookup; listings filter drafts out. */
  draft?: true;
  content?: string;
  tech?: string[];
  link?: string;
  github?: string;
  features?: string[];
  challenges?: string;
}

/** Gallery-style item. No `content`: nothing renders a photography body. */
export interface GalleryItem {
  section: 'photography';
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  draft?: true;
  images: PortfolioImage[];
}

/**
 * Listing shapes: covers, titles, and a photo count, without the MDX body or
 * the per-image dimensions. Same split as `getAllPostMeta` (see lib/mdx.ts).
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
const mediaPhotographyDirectory = path.join(
  process.cwd(),
  'media/portfolio/photography',
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
    ...(isDraft(data) && { draft: true as const }),
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

/** Listing: metadata only, no MDX body. */
export function getProjectItems(section: SectionSlug): ProjectSummary[] {
  return listMdxFiles(sectionDir(section))
    .map((file) => projectSummary(section, file))
    .sort(byDateDesc);
}

// -- Photography (gallery) section ------------------------------------------

const IMAGE_FILE_RE = /\.(jpe?g|png|webp|gif)$/i;

/** Image filenames in a gallery's folder. */
function listGalleryImageFiles(slug: string): string[] {
  return listDir(path.join(mediaPhotographyDirectory, slug)).filter((file) =>
    IMAGE_FILE_RE.test(file),
  );
}

/**
 * Cover src without dimension reads: frontmatter, else the first image in the
 * gallery folder, else empty (CoverImage's gradient fallback).
 */
function galleryCoverSrc(slug: string, coverImage: unknown): string {
  if (typeof coverImage === 'string' && coverImage) return coverImage;
  const first = listGalleryImageFiles(slug)[0];
  return first ? `/media/portfolio/photography/${slug}/${first}` : '';
}

/**
 * Per-image alt text from gallery frontmatter, keyed by filename:
 *
 *   alt:
 *     dsc_0142.jpg: 'Fog lifting off the ridge at sunrise'
 *
 * Only string values are kept, since alt text is read aloud verbatim.
 */
function altMap(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

async function scanImages(
  slug: string,
  alt: Record<string, string>,
): Promise<PortfolioImage[]> {
  const imagesDir = path.join(mediaPhotographyDirectory, slug);

  // `Promise.all` keeps the readdir order; an unreadable file drops out.
  const scanned = await Promise.all(
    listGalleryImageFiles(slug).map(async (file) => {
      const imagePath = path.join(imagesDir, file);
      try {
        const { width, height } = await imageDimensions(imagePath);
        return {
          id: file,
          src: `/media/portfolio/photography/${slug}/${file}`,
          // Filled in by the caller when frontmatter has nothing: a filename is
          // worse than useless read aloud.
          alt: alt[file] ?? '',
          width,
          height,
        };
      } catch (e) {
        console.error(`Error reading image dimensions for ${imagePath}`, e);
        return null;
      }
    }),
  );

  return scanned.filter((image): image is PortfolioImage => image !== null);
}

export async function getPhotographyGallery(
  slug: string,
): Promise<GalleryItem | null> {
  const file = readMdxFile(sectionDir('photography'), slug);
  if (file === null) return null;

  const { data } = file;
  const title = (data.title as string) || file.slug;
  const images = (await scanImages(file.slug, altMap(data.alt))).map(
    (image, i, all) => ({
      ...image,
      alt: image.alt || `${title}, photo ${i + 1} of ${all.length}`,
    }),
  );
  const coverImage = (data.coverImage as string) || images[0]?.src || '';

  return {
    section: 'photography',
    slug: file.slug,
    title,
    description: (data.description as string) || '',
    coverImage,
    date: (data.date as string) || '',
    ...(isDraft(data) && { draft: true as const }),
    images,
  };
}

/**
 * Gallery listing: one readdir per gallery, no image headers. Also feeds the
 * hub via `getSectionSummaries`.
 */
export function getPhotographyGalleries(): GallerySummary[] {
  return listMdxFiles(sectionDir('photography'))
    .map((mdx) => {
      const { data } = mdx;
      return {
        section: 'photography' as const,
        slug: mdx.slug,
        title: (data.title as string) || mdx.slug,
        description: (data.description as string) || '',
        coverImage: galleryCoverSrc(mdx.slug, data.coverImage),
        date: (data.date as string) || '',
        imageCount: listGalleryImageFiles(mdx.slug).length,
      };
    })
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
