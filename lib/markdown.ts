/**
 * Reads an MDX body as text, for frontmatter this project derives rather than
 * asks authors to maintain. Everything here strips fenced code first: a 200-line
 * config dump is not forty minutes of reading, and a `# comment` inside a fence
 * is not a heading.
 */

// The end-of-input lookahead, not `$`, closes an unterminated fence: under /m,
// `$` would match the end of the opening line and strip only the marker.
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

// Lines that are structure, not prose: headings, JSX, images, quotes, tables,
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
