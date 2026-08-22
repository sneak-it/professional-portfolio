import path from 'path';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { imageDimensions, isLocalSrc } from '@/lib/image';
import { isSafeHref } from '@/lib/href';
import { BLOCKED_TAGS, hardenRawHtml } from '@/lib/harden';

/**
 * Defense-in-depth allowlist for MDX rendering, over next-mdx-remote's
 * `blockJS`: no referrer or `window.opener` leak, hrefs limited to
 * http/https/mailto, image srcs to same-origin.
 *
 * Covers markdown-generated elements only; lib/harden.ts covers authored HTML.
 * `CachedMDX` needs both halves.
 */

const Blocked = () => null;

function SafeLink({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  // A blocked scheme renders as the link text alone.
  if (!isSafeHref(href)) return <>{children}</>;

  const isExternal = /^https?:\/\//i.test(href);

  // `rest` first: authored MDX attributes must not override the hardening below.
  return (
    <a
      {...rest}
      href={href}
      rel="noopener noreferrer nofollow ugc"
      {...(isExternal ? { target: '_blank' } : {})}
    >
      {children}
    </a>
  );
}

// Extensions whose headers `imageDimensions` can read.
const LOCAL_IMAGE_RE = /\.(jpe?g|png|webp|gif|svg)$/i;

/**
 * Intrinsic width/height for a local (public/) image, read on the server to
 * reserve layout space. Null for an unreadable file or unparsed extension.
 */
function localImageDimensions(
  src: string,
): { width: number; height: number } | null {
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
  // Off-origin sources render nothing, so a bad src is visible while
  // authoring. The CSP (`img-src 'self'`) blocks them in the browser too.
  if (!isLocalSrc(src)) return null;

  // Plain <img>, so `images.localPatterns` doesn't apply. Dimensions come from
  // disk at render time (server-only) to avoid layout shift.
  const dims = localImageDimensions(src);
  // `dims` then `rest` so an explicit width/height in MDX still wins, then the
  // security attributes last so authored ones cannot override them.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...dims}
      {...rest}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

/**
 * Captioned image for MDX bodies: `<Figure src alt caption />`. The same
 * hardened <img>, wrapped in <figure>/<figcaption>. `caption` is optional, so
 * it also serves as a block-level image.
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

// GFM task lists compile to <input type="checkbox">, and `input` is blocked.
// This re-admits just that checkbox; lib/harden.ts drops authored <input>.
function TaskCheckbox({ type, ...rest }: ComponentPropsWithoutRef<'input'>) {
  if (type !== 'checkbox') return null;
  return <input {...rest} type="checkbox" disabled />;
}

export const mdxComponents = {
  a: SafeLink,
  img: SafeImage,
  MdxRawLink: SafeLink,
  MdxRawImage: SafeImage,
  Figure,
  ...Object.fromEntries(BLOCKED_TAGS.map((tag) => [tag, Blocked])),
  // After the spread: the one blocked tag with a safe narrow case.
  input: TaskCheckbox,
} as const;

/** Both sanitization halves, kept together. `CachedMDX` is the only consumer. */
const mdxRenderProps = {
  components: mdxComponents,
  options: { mdxOptions: { remarkPlugins: [remarkGfm, hardenRawHtml] } },
};

// Keyed by body text, so an edit lands on a new key. Capped, since a
// superseded entry is never read again.
const compileCache = new Map<string, ReactElement>();
const COMPILE_CACHE_MAX = 64;

/**
 * Renders MDX, compiling each distinct body once per container: the element
 * `compileMDX` returns is an immutable descriptor.
 */
export async function CachedMDX({ source }: { source: string }) {
  const cached = compileCache.get(source);
  if (cached) return cached;

  const { content } = await compileMDX({ source, ...mdxRenderProps });

  // Cleared wholesale: refilling this content tree costs a few ms.
  if (compileCache.size >= COMPILE_CACHE_MAX) compileCache.clear();
  compileCache.set(source, content);
  return content;
}
