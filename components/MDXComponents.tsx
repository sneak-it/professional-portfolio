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
 *   - hardens links and images so cross-origin navigations can't leak the
 *     referrer or grant the opened page access to `window.opener`, and
 *   - refuses any href outside the http/https/mailto allowlist.
 *
 * SCOPE. A components map alone only governs elements MDX generates from
 * *markdown* syntax: author-written HTML compiles to an intrinsic JSX element
 * (`<a>` becomes `_jsx("a", ...)`, not `_jsx(_components.a, ...)`), and only
 * capitalised names resolve through the map. So raw HTML used to bypass all of
 * the above, and `BLOCKED_TAGS` was inert. The `hardenRawHtml` remark plugin
 * below closes that: it drops blocked tags and rewrites raw `<a>`/`<img>` to the
 * capitalised aliases, which is the one form MDX does resolve from `components`.
 *
 * Consume both halves together via `mdxRenderProps`, never `components` alone —
 * the sanitization is only complete with the plugin attached.
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

/**
 * Scheme allowlist. Parsed rather than pattern-matched because the URL parser
 * strips the tabs, newlines, and case tricks that defeat a regex
 * (`java\nscript:` and `JavaScript:` both normalise to `javascript:`). The base
 * resolves relative hrefs and fragments to `https:`, so those stay allowed.
 */
function isSafeHref(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  try {
    const { protocol } = new URL(href, 'https://relative.invalid');
    return (
      protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:'
    );
  } catch {
    return false;
  }
}

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
  // shift; remote/data: sources fall back to a dimensionless <img>.
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

// Capitalised aliases for raw-HTML <a>/<img>. Lowercase intrinsic names are not
// looked up in `components`, so the plugin below renames the nodes to these.
const RAW_HTML_ALIASES: Record<string, string> = {
  a: 'MdxRawLink',
  img: 'MdxRawImage',
};

// Attributes the hardened components set themselves. An authored copy survives
// in `...rest` under its own casing (`referrerpolicy` vs `referrerPolicy`), which
// React emits as a second copy of the same HTML attribute, so drop them here
// rather than trying to out-spell every casing at the JSX level.
const OWNED_ATTRS: Record<string, ReadonlySet<string>> = {
  a: new Set(['rel', 'target']),
  img: new Set(['referrerpolicy', 'loading', 'decoding']),
};

const BLOCKED_TAG_SET: ReadonlySet<string> = new Set(BLOCKED_TAGS);

interface MdxJsxNode {
  type?: string;
  name?: string | null;
  attributes?: Array<{ type?: string; name?: string }>;
  children?: MdxJsxNode[];
}

/**
 * Remark plugin that applies the allowlist to author-written HTML, which the
 * components map cannot reach (see SCOPE above). Runs before compilation:
 *
 *   <script>alert(1)</script>        -> dropped
 *   <a href rel="opener">            -> <MdxRawLink href> (rel stripped)
 *   <img src referrerpolicy="...">   -> <MdxRawImage src> (referrerpolicy stripped)
 *
 * A blocked node is removed with its subtree, matching what the `Blocked`
 * component already did for the markdown path (it discards children too).
 */
export function hardenRawHtml() {
  return (tree: MdxJsxNode) => {
    const walk = (node: MdxJsxNode) => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.filter((child) => {
        if (
          child.type === 'mdxJsxFlowElement' ||
          child.type === 'mdxJsxTextElement'
        ) {
          const name = typeof child.name === 'string' ? child.name : '';
          if (BLOCKED_TAG_SET.has(name)) return false;
          const owned = OWNED_ATTRS[name];
          if (owned && Array.isArray(child.attributes)) {
            child.attributes = child.attributes.filter(
              (attr) =>
                !(
                  attr.type === 'mdxJsxAttribute' &&
                  typeof attr.name === 'string' &&
                  owned.has(attr.name.toLowerCase())
                ),
            );
          }
          const alias = RAW_HTML_ALIASES[name];
          if (alias) child.name = alias;
        }
        walk(child);
        return true;
      });
    };
    walk(tree);
  };
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
 * Spread into every `<MDXRemote>`: `{...mdxRenderProps}`. Bundles the components
 * map with the remark plugin so a call site cannot wire up one without the other
 * and silently lose raw-HTML sanitization.
 */
export const mdxRenderProps = {
  components: mdxComponents,
  options: { mdxOptions: { remarkPlugins: [hardenRawHtml] } },
};
