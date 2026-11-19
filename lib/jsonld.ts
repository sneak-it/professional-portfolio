import { getImageProps } from 'next/image';
import { getAbout } from './about';
import { OG_IMAGE } from './metadata';
import type { BlogPost } from './mdx';
import type { GalleryItem, ProjectItem } from './portfolio';
import { AVATAR_FALLBACK, absoluteUrl, avatarSrc, siteConfig } from './site';

export const PERSON_ID = `${siteConfig.url}/#person`;

/**
 * Points at the Person, with name and url restated: Google reads those and
 * does not follow the `@id` to another page.
 */
export function authorRef(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: siteConfig.author,
    url: absoluteUrl('/about'),
  };
}

/** The full Person. Empty fields are left out, so no placeholder publishes. */
export function personJsonLd(): Record<string, unknown> {
  const avatar = avatarSrc();
  const knowsAbout = [
    ...new Set(getAbout('').skills.flatMap((group) => group.items)),
  ];
  return {
    ...authorRef(),
    description: siteConfig.description,
    ...(avatar && avatar !== AVATAR_FALLBACK && { image: absoluteUrl(avatar) }),
    ...(siteConfig.jobTitle && { jobTitle: siteConfig.jobTitle }),
    ...(siteConfig.profileUrls.length > 0 && {
      sameAs: siteConfig.profileUrls,
    }),
    ...(knowsAbout.length > 0 && { knowsAbout }),
  };
}

/** Every page: the site and its owner. */
export function siteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.title,
        description: siteConfig.description,
        inLanguage: siteConfig.locale,
        publisher: { '@id': PERSON_ID },
      },
      personJsonLd(),
    ],
  };
}

/**
 * `/about`. The full Person, since Google's docs don't say it joins an `@id`
 * across separate script blocks.
 */
export function profilePageJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl('/about'),
    mainEntity: personJsonLd(),
  };
}

export function blogPostingJsonLd(post: BlogPost): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.excerpt,
    image: post.meta.image
      ? URL.parse(post.meta.image, siteConfig.url)?.href
      : absoluteUrl(OG_IMAGE),
    datePublished: post.meta.date,
    dateModified: post.meta.updated || post.meta.date,
    keywords: post.meta.tags.join(', '),
    author: authorRef(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

/** `path` is site-relative. */
export function projectJsonLd(
  project: ProjectItem,
  path: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    ...(project.github
      ? { '@type': 'SoftwareSourceCode', codeRepository: project.github }
      : { '@type': 'CreativeWork' }),
    name: project.title,
    description: project.description,
    url: absoluteUrl(path),
    datePublished: project.date || undefined,
    image: project.coverImage
      ? URL.parse(project.coverImage, siteConfig.url)?.href
      : undefined,
    author: authorRef(),
  };
}

/** `path` is site-relative. */
export function galleryJsonLd(
  gallery: GalleryItem,
  path: string,
): Record<string, unknown> {
  const license =
    siteConfig.photoLicenseUrl &&
    URL.parse(siteConfig.photoLicenseUrl, siteConfig.url)?.href;
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: gallery.title,
    description: gallery.description,
    url: absoluteUrl(path),
    datePublished: gallery.date || undefined,
    image: gallery.images.map((img) => ({
      '@type': 'ImageObject',
      // With a `vw` in `sizes`, `src` is the largest configured width, which
      // is what the gallery's <img src> carries.
      contentUrl: absoluteUrl(
        getImageProps({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
          sizes: '100vw',
        }).props.src,
      ),
      width: img.width,
      height: img.height,
      caption: img.alt,
      creator: authorRef(),
      creditText: siteConfig.author,
      copyrightNotice: `© ${siteConfig.author}`,
      ...(license && { license, acquireLicensePage: license }),
    })),
    author: authorRef(),
  };
}

/**
 * schema.org `BreadcrumbList` from an ordered crumb list. Each site-relative
 * `path` ('/' for home) resolves against the canonical origin.
 */
export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path === '/' ? '' : crumb.path),
    })),
  };
}
