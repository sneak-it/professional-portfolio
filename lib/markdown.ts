import { slugger } from './slug.ts';

/**
 * Reads an MDX body as text for the frontmatter this project derives. Fenced
 * code is stripped first, so it counts toward neither read time nor headings.
 */

// The end-of-input lookahead closes an unterminated fence.
const FENCE =
  /^ {0,3}(`{3,}|~{3,})[\s\S]*?(?:^ {0,3}\1[^\n]*\n?|$(?![\s\S]))/gm;

/** Body with fenced code blocks removed, including an unterminated final one. */
export function stripFences(source: string): string {
  return source.replace(FENCE, '');
}

const WORDS_PER_MINUTE = 225;

/** Words outside fenced code, for a derived read time. */
export function wordCount(source: string): number {
  const words = stripFences(source).match(/\S+/g);
  return words ? words.length : 0;
}

/** `"4 min read"`, rounded up from one minute. */
export function readTime(source: string): string {
  return `${Math.max(1, Math.round(wordCount(source) / WORDS_PER_MINUTE))} min read`;
}

const EXCERPT_MAX = 200;

// Structural lines: headings, JSX, images, quotes, tables,
// list items, fence remnants, and frontmatter-ish separators.
const SKIP_LINE = /^\s*([#<>|`~*+-]|!\[|\d+\.\s|:{3})/;

/** Inline markdown reduced to plain text: links unwrapped, emphasis dropped. */
function plainText(line: string): string {
  return line
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\^[^\]]*\]/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * First prose paragraph as plain text, truncated on a word boundary, or `''` if
 * the body has no prose (a JSX-only or empty post).
 */
export function firstParagraph(source: string): string {
  for (const line of stripFences(source).split('\n')) {
    if (line.trim() === '' || SKIP_LINE.test(line)) continue;
    const flat = plainText(line);
    if (flat === '') continue;
    if (flat.length <= EXCERPT_MAX) return flat;
    const cut = flat.lastIndexOf(' ', EXCERPT_MAX);
    return `${flat.slice(0, cut > 0 ? cut : EXCERPT_MAX).trimEnd()}…`;
  }
  return '';
}

export interface Heading {
  depth: 2 | 3;
  text: string;
  id: string;
}

/**
 * `##`/`###` headings outside fenced code, in source order. Ids are numbered as
 * `rehypeHeadingIds` numbers the rendered ones, so TOC hrefs match the anchors.
 */
export function headings(source: string): Heading[] {
  const found: Heading[] = [];
  const slug = slugger();
  for (const [, hashes, raw] of stripFences(source).matchAll(
    /^(#{2,3})[ \t]+(.+)$/gm,
  )) {
    const text = plainText(raw ?? '');
    if (text === '') continue;
    found.push({
      depth: hashes?.length === 3 ? 3 : 2,
      text,
      id: slug(text),
    });
  }
  return found;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const hastText = (node: HastNode): string =>
  node.type === 'text'
    ? (node.value ?? '')
    : (node.children ?? []).map(hastText).join('');

/** Rehype plugin: an id on each h2/h3 without one, from its text, as `headings()` numbers it. */
export function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const slug = slugger();
    const walk = (node: HastNode) => {
      if (
        (node.tagName === 'h2' || node.tagName === 'h3') &&
        node.properties?.id === undefined
      ) {
        const id = slug(hastText(node));
        if (id) node.properties = { ...node.properties, id };
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/**
 * Index of the heading being read, or -1 above the first one. At the bottom of
 * the page it is the last heading: a short final section never reaches `line`.
 */
export function activeHeading(
  tops: number[],
  line: number,
  atBottom: boolean,
): number {
  if (atBottom) return tops.length - 1;
  return tops.findLastIndex((top) => top <= line);
}
