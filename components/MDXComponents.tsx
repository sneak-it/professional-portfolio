import path from 'path';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import { imageDimensions, isLocalSrc } from '@/lib/image';
import { isSafeHref } from '@/lib/href';
import { BLOCKED_TAGS, hardenRawHtml } from '@/lib/harden';

/**
 * Defense-in-depth allowlist for MDX rendering, on top of next-mdx-remote's
 * `blockJS`: no referrer or `window.opener` leak on cross-origin navigation, no
 * href outside http/https/mailto, no image src that is not same-origin.
 *
 * SCOPE. Only governs elements MDX generates from *markdown* syntax; authored
 * HTML compiles to an intrinsic element that never resolves through this map,
 * which is what lib/harden.ts covers. `CachedMDX` consumes both halves, and the
 * sanitization is incomplete with either one alone.
 */

const Blocked = () => null;

function SafeLink({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  // No anchor at all for a blocked scheme: an <a> with a stripped href is dead
  // markup, and the text is what the author meant to show either way.
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
 * Intrinsic width/height for a local (public/) image, read on the server so the
 * browser can reserve layout space (no CLS). Returns null for an unreadable file
 * or an extension we don't parse, in which case the <img> renders without
 * dimensions.
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
  // Off-origin sources render nothing rather than a broken image. The CSP
  // (`img-src 'self'`) already blocks them in the browser, but failing here
  // makes it deterministic and visible while authoring instead of a console
  // warning in production. Same posture as SafeLink dropping a bad scheme.
  if (!isLocalSrc(src)) return null;

  // Plain <img> (not next/image), so `images.localPatterns` does not apply and
  // any same-origin path is fine. MDX has no build-time dimensions, so read them
  // from disk at render time (server-only) to avoid layout shift.
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
  MdxRawLink: SafeLink,
  MdxRawImage: SafeImage,
  Figure,
  ...Object.fromEntries(BLOCKED_TAGS.map((tag) => [tag, Blocked])),
} as const;

/**
 * The components map and the remark plugin, kept together so a call site cannot
 * wire up one without the other and lose raw-HTML sanitization. `CachedMDX` is
 * the only consumer.
 */
const mdxRenderProps = {
  components: mdxComponents,
  options: { mdxOptions: { remarkPlugins: [hardenRawHtml] } },
};

// Keyed by body text, so an edit lands on a new key and needs no revalidation.
// Old entries are dead weight, hence the cap.
const compileCache = new Map<string, ReactElement>();
const COMPILE_CACHE_MAX = 64;

/**
 * Renders MDX, compiling each distinct body once per container rather than once
 * per request. Use instead of `<MDXRemote>`: the element `compileMDX` returns is
 * an immutable descriptor, so React can be handed the same one every request.
 */
export async function CachedMDX({ source }: { source: string }) {
  const cached = compileCache.get(source);
  if (cached) return cached;

  const { content } = await compileMDX({ source, ...mdxRenderProps });

  // Cleared, not evicted: refilling this content tree costs a few ms.
  if (compileCache.size >= COMPILE_CACHE_MAX) compileCache.clear();
  compileCache.set(source, content);
  return content;
}
