/**
 * Shared Tailwind Typography classes for MDX bodies. `PROSE` is the base;
 * `PROSE_CODE` adds the code treatment the blog needs on top.
 */
export const PROSE =
  'prose md:prose-lg dark:prose-invert max-w-none prose-p:my-[1em] prose-p:leading-relaxed prose-li:my-[0.25em] prose-li:leading-relaxed prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-[1.5em] prose-h2:mb-[0.5em] prose-a:font-medium prose-a:underline-offset-4 prose-img:rounded-2xl [&_li:has(>input)]:list-none';

export const PROSE_CODE =
  'prose-pre:rounded-2xl prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-white/10 prose-code:before:content-none prose-code:after:content-none prose-code:not-in-[pre]:rounded prose-code:not-in-[pre]:bg-gray-100 dark:prose-code:not-in-[pre]:bg-white/10 prose-code:not-in-[pre]:px-1.5 prose-code:not-in-[pre]:py-0.5 prose-code:font-normal';
