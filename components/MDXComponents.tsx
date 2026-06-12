import type { ComponentPropsWithoutRef } from 'react';

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

function SafeImage({ src, alt = '', ...rest }: ComponentPropsWithoutRef<'img'>) {
  // Plain <img> (not next/image) because MDX content has no build-time
  // dimensions; loading + referrer policy kept consistent with the rest of the site.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" {...rest} />;
}

export const mdxComponents = {
  a: SafeLink,
  img: SafeImage,
  ...Object.fromEntries(BLOCKED_TAGS.map((tag) => [tag, Blocked])),
} as const;
