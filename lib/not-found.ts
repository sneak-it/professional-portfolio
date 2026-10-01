import { contentDir, readMdxFile, text } from './content';

/** 404 copy, read from `content/not-found.mdx`. Mirrors lib/contact.ts. */
export interface NotFound {
  title: string;
  message: string;
}

/** Returns defaults if `content/not-found.mdx` is missing or unparseable. */
export function getNotFound(): NotFound {
  const data = readMdxFile(contentDir(), 'not-found')?.data ?? {};
  return {
    title: text(data.title, 'Page not found.'),
    message: text(
      data.message,
      'The page you are looking for cannot be found.',
    ),
  };
}
