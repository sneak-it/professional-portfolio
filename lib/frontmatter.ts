import { parse } from 'yaml';

const FRONTMATTER_RE = /^---\r?\n(.*?)\r?\n---\r?\n?/s;

export function parseFrontmatter(src: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = src.match(FRONTMATTER_RE);
  if (!match) return { data: {}, content: src };
  const data = (parse(match[1]) ?? {}) as Record<string, unknown>;
  return { data, content: src.slice(match[0].length) };
}
