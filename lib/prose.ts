/**
 * Shared Tailwind Typography classes for MDX bodies. `PROSE` is the base;
 * `PROSE_CODE` adds the code treatment the blog needs on top.
 */
export const PROSE =
  'prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-12 prose-a:font-medium prose-a:underline-offset-4 prose-img:rounded-2xl [&_li:has(>input)]:list-none';

export const PROSE_CODE =
  'prose-pre:rounded-2xl prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-white/10 prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal';
