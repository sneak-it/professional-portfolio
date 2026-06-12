import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import sizeOf from 'image-size';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Gallery {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  images: GalleryImage[];
  content?: string;
}

const galleriesDirectory = path.join(process.cwd(), 'content/galleries');
const publicGalleriesDirectory = path.join(process.cwd(), 'public/galleries');

export function getGallerySlugs() {
  if (!fs.existsSync(galleriesDirectory)) {
    return [];
  }
  return fs.readdirSync(galleriesDirectory).filter(file => file.endsWith('.mdx'));
}

export function getGalleryBySlug(slug: string): Gallery | null {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(galleriesDirectory, `${realSlug}.mdx`);
  
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Auto-read images from public/galleries/[slug]
  const imagesDir = path.join(publicGalleriesDirectory, realSlug);
  const images: GalleryImage[] = [];

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
            src: `/galleries/${realSlug}/${file}`,
            alt: file.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
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
      { id: 'p1', src: `https://picsum.photos/seed/${realSlug}1/800/1200`, alt: 'Placeholder 1', width: 800, height: 1200 },
      { id: 'p2', src: `https://picsum.photos/seed/${realSlug}2/1200/800`, alt: 'Placeholder 2', width: 1200, height: 800 },
      { id: 'p3', src: `https://picsum.photos/seed/${realSlug}3/800/800`, alt: 'Placeholder 3', width: 800, height: 800 },
      { id: 'p4', src: `https://picsum.photos/seed/${realSlug}4/1200/1600`, alt: 'Placeholder 4', width: 1200, height: 1600 }
    );
  }

  const coverImage = data.coverImage || images[0].src;

  return {
    slug: realSlug,
    title: data.title || realSlug,
    description: data.description || '',
    coverImage,
    date: data.date || '',
    images,
    content,
  };
}

export function getAllGalleries(): Gallery[] {
  const slugs = getGallerySlugs();
  const galleries = slugs
    .map((slug) => getGalleryBySlug(slug))
    .filter((g): g is Gallery => g !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
  return galleries;
}
