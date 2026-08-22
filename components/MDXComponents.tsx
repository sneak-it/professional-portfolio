import path from 'path';
import { isValidElement } from 'react';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { Info, Lightbulb, TriangleAlert } from 'lucide-react';
import Container from '@/components/Container';
import CoverCard from '@/components/CoverCard';
import CoverImage from '@/components/CoverImage';
import EmptyState from '@/components/EmptyState';
import IconBadge from '@/components/IconBadge';
import PostMeta from '@/components/PostMeta';
import Surface from '@/components/Surface';
import { imageDimensions, isLocalSrc } from '@/lib/image';
import { isSafeHref } from '@/lib/href';
import { BLOCKED_TAGS, hardenRawHtml } from '@/lib/harden';
import { slugify } from '@/lib/slug';

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

// Semantic colors rather than the brand accents: the palette is two warm
// tones, so a coral "note" and a red "warning" would be indistinguishable.
const CALLOUTS = {
  note: {
    Icon: Info,
    label: 'Note',
    tone: 'border-sky-500 bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-300',
  },
  tip: {
    Icon: Lightbulb,
    label: 'Tip',
    tone: 'border-emerald-500 bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  warn: {
    Icon: TriangleAlert,
    label: 'Warning',
    tone: 'border-amber-500 bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
  },
} as const;

/**
 * Aside for MDX bodies: `<Callout type="tip">…</Callout>`. An unknown `type`
 * falls back to `note`, so a typo still renders the post.
 */
function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const { Icon, label, tone, text } =
    CALLOUTS[type as keyof typeof CALLOUTS] ?? CALLOUTS.note;
  return (
    <div className={`my-6 rounded-r-2xl border-l-4 px-5 py-4 ${tone}`}>
      <div
        className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider ${text}`}
      >
        <Icon size={16} aria-hidden /> {title ?? label}
      </div>
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

function flatten(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flatten).join('');
  if (isValidElement(node))
    return flatten((node.props as { children?: ReactNode }).children);
  return '';
}

/**
 * Anchorable heading, with the id `headings()` predicts. An authored id wins:
 * GFM's footnote section emits `id="footnote-label"` that its backrefs target.
 */
function heading(Tag: 'h2' | 'h3') {
  return function Heading({
    children,
    id,
    ...rest
  }: ComponentPropsWithoutRef<'h2'>) {
    return (
      <Tag {...rest} id={(id ?? slugify(flatten(children))) || undefined}>
        {children}
      </Tag>
    );
  };
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
  Callout,
  h2: heading('h2'),
  h3: heading('h3'),
  // Server components only: a client one would ship JS per post for no gain.
  Container,
  CoverCard,
  CoverImage,
  EmptyState,
  IconBadge,
  PostMeta,
  Surface,
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
