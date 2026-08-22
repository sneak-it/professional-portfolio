import { SITEMAP_CACHE_TTL_MS, ttlCached } from '@/lib/config';
import { toDate } from '@/lib/date';
import { getAllPostMeta } from '@/lib/mdx';
import { absoluteUrl, siteConfig } from '@/lib/site';

// Rendered per request so the origin reflects the runtime `SITE_URL`; the post
// scan behind it is cached like the sitemap's.
export const dynamic = 'force-dynamic';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

/** Frontmatter is untrusted text, so every interpolated value goes through it. */
function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

function tag(name: string, value: string | undefined): string {
  return value ? `<${name}>${esc(value)}</${name}>` : '';
}

/** RFC 822, which RSS requires; `undefined` for an unparseable date. */
function rfc822(value: string | undefined): string | undefined {
  return toDate(value)?.toUTCString();
}

/** A feed item as a site-relative path; the origin is applied per request. */
interface Item {
  path: string;
  title: string;
  pubDate?: string;
  description?: string;
  categories: string[];
}

function buildItems(): Item[] {
  return getAllPostMeta().map((post) => ({
    path: `/blog/${post.slug}`,
    title: post.meta.title,
    pubDate: rfc822(post.meta.date),
    description: post.meta.excerpt,
    categories: post.meta.tags,
  }));
}

const getItems = ttlCached(SITEMAP_CACHE_TTL_MS, buildItems);

function itemXml(item: Item): string {
  const url = absoluteUrl(item.path);
  return [
    '    <item>',
    `      ${tag('title', item.title)}`,
    `      <link>${esc(url)}</link>`,
    `      <guid isPermaLink="true">${esc(url)}</guid>`,
    `      ${tag('pubDate', item.pubDate)}`,
    `      ${tag('description', item.description)}`,
    ...item.categories.map((name) => `      ${tag('category', name)}`),
    '    </item>',
  ]
    .filter((line) => line.trim() !== '')
    .join('\n');
}

export function GET() {
  const items = getItems();

  const xml = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    ${tag('title', siteConfig.title)}`,
    `    <link>${esc(siteConfig.url)}</link>`,
    `    ${tag('description', siteConfig.description)}`,
    `    ${tag('language', siteConfig.locale)}`,
    // Newest post, since a code deploy doesn't change the feed's contents.
    `    ${tag('lastBuildDate', items[0]?.pubDate)}`,
    `    <atom:link href="${esc(absoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />`,
    ...items.map(itemXml),
    '  </channel>',
    '</rss>',
  ]
    .filter((line) => line.trim() !== '')
    .join('\n');

  return new Response(`${xml}\n`, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
