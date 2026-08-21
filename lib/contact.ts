import path from 'path';
import { readMdxFile, text } from './content';

/** Contact-page copy, read from `content/contact.mdx`. Mirrors lib/home.ts. */
export interface Contact {
  heading: string;
  /** Split out of `heading` because the page styles it with the gradient. */
  highlight: string;
  /** Falls back to the caller's name-derived line. */
  description: string;
  /** MDX body: the intro paragraph. */
  content: string;
}

/** Returns defaults if `content/contact.mdx` is missing or unparseable. */
export function getContact(fallbackDescription: string): Contact {
  const file = readMdxFile(path.join(process.cwd(), 'content'), 'contact');
  const data = file?.data ?? {};
  return {
    heading: text(data.heading, 'Say'),
    highlight: text(data.highlight, 'hello'),
    description: text(data.description, fallbackDescription),
    content: file?.content ?? '',
  };
}
