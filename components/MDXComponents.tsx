import path from 'path';
import type { ComponentPropsWithoutRef } from 'react';
import { imageDimensions } from '@/lib/image';

/**
 * Defense-in-depth allowlist for MDX rendering.
 *
 * Blog content is filesystem-sourced today, so the risk is low — but this keeps
 * the rendering surface explicit so adding content later can't introduce a
 * foot-gun. next-mdx-remote already strips JavaScript expressions and
 * import/export statements by default (`blockJS`); this layer additionally:
 *   - neutralises raw HTML elements that enable injection or data exfiltration
 *     (script, iframe, object, embed, form controls, link/meta/base/style), and
 *   - hardens any links so cross-origin navigations can't leak the referrer or
 *     grant the opened page access to `window.opener`.
 *
 * These mappings override next-mdx-remote's default element renderers, so a
 * `<script>` or `<iframe>` authored in MDX renders nothing instead of the tag.
 */

const Blocked = () => null;

// Tags that should never render from markdown content.
const BLOCKED_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'link',
  'meta',
  'base',
  'style',
  'frame',
  'frameset',
  'applet',
] as const;

function SafeLink({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const isExternal = typeof href === 'string' && /^https?:\/\//i.test(href);

  return (
    <a
      href={href}
      rel="noopener noreferrer nofollow ugc"
      {...(isExternal ? { target: '_blank' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

// Root-relative local image whose bytes live under public/. Excludes
// protocol-relative ('//host'), remote ('http(s)://'), and data: sources.
const LOCAL_IMAGE_RE = /\.(jpe?g|png|webp|gif|svg)$/i;

/**
 * Intrinsic width/height for a local (public/) image, read on the server so the
 * browser can reserve layout space (no CLS). Returns null for remote/data:
 * sources or if the file can't be read, in which case the <img> renders without
 * dimensions as before.
 */
function localImageDimensions(
  src: unknown,
): { width: number; height: number } | null {
  if (typeof src !== 'string') return null;
  if (!src.startsWith('/') || src.startsWith('//')) return null;
  if (!LOCAL_IMAGE_RE.test(src)) return null;
  try {
    return imageDimensions(path.join(process.cwd(), 'public', src));
  } catch {
    return null;
  }
}

function SafeImage({
  src,
  alt = '',
  ...rest
}: ComponentPropsWithoutRef<'img'>) {
  // Plain <img> (not next/image). MDX has no build-time dimensions, so for local
  // images we read them from disk at render time (server-only) to avoid layout
  // shift; remote/data: sources fall back to a dimensionless <img>. Any explicit
  // width/height in `rest` wins.
  const dims = localImageDimensions(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      {...dims}
      {...rest}
    />
  );
}

/**
 * Captioned image for MDX bodies. Used as `<Figure src alt caption />`.
 *
 * Renders through the same hardened <img> as bare Markdown images, wrapped in a
 * semantic <figure>/<figcaption>. Prefer this over raw Markdown when the image
 * needs a visible caption. `caption` is optional so it can also stand in as a
 * block-level image (bare Markdown images render inside a <p>, which is invalid
 * markup around a <figure>).
 */
function Figure({
  caption,
  ...img
}: ComponentPropsWithoutRef<'img'> & { caption?: React.ReactNode }) {
  return (
    <figure className="my-8">
      <SafeImage {...img} />
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export const mdxComponents = {
  a: SafeLink,
  img: SafeImage,
  Figure,
  ...Object.fromEntries(BLOCKED_TAGS.map((tag) => [tag, Blocked])),
} as const;
