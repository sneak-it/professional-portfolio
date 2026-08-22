import path from 'path';
import { readMdxFile, strings, text } from './content';

/** Homepage hero content, read from `content/home.mdx`. Mirrors lib/about.ts. */
export interface Home {
  eyebrow: string;
  headline: string;
  /** Non-empty: Typewriter indexes [0] unconditionally. */
  words: [string, ...string[]];
  /** MDX body: the bio paragraph. */
  content: string;
}

const DEFAULT_WORDS: [string, ...string[]] = [
  'Experiences',
  'Opportunities',
  'Connections',
  'Solutions',
];

/** Returns defaults if `content/home.mdx` is missing or unparseable. */
export function getHome(): Home {
  const file = readMdxFile(path.join(process.cwd(), 'content'), 'home');
  const data = file?.data ?? {};
  const words = strings(data.words);
  return {
    eyebrow: text(data.eyebrow, 'Building things, on and off the clock'),
    headline: text(data.headline, 'Creating'),
    // Non-empty: the gradient span needs at least one word.
    words: words.length > 0 ? (words as [string, ...string[]]) : DEFAULT_WORDS,
    content: file?.content ?? '',
  };
}
