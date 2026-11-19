import { contentDir, readMdxFile, text } from './content.ts';

/** `/blog` copy from `content/blog.mdx`; `description` is '' when unset. */
export function getBlogPage(): { description: string } {
  const data = readMdxFile(contentDir(), 'blog')?.data ?? {};
  return { description: text(data.description, '') };
}
