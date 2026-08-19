import path from 'path';
import { readMdxFile } from './content';

/**
 * About-page content, read from `content/about.mdx` so the prose and the lists
 * are bind-mount editable like every other content type. `icon` is a stable key
 * (not JSX) so this stays presentation-free; AboutClient maps the key to a
 * lucide icon.
 */
export type SkillIcon = 'frontend' | 'backend' | 'database' | 'tools';

export interface SkillGroup {
  name: string;
  icon: SkillIcon;
  items: string[];
}

export type InterestIcon =
  'server' | 'bot' | 'gamepad' | 'camera' | 'wrench' | 'sprout';

export interface Interest {
  name: string;
  icon: InterestIcon;
  blurb: string;
}

export interface About {
  skills: SkillGroup[];
  interests: Interest[];
  /** MDX body: the bio paragraphs. */
  content: string;
}

// Frontmatter is cast rather than schema-checked (same as lib/mdx.ts), but the
// file is hand-edited at runtime with no build to catch a typo, so a non-list
// degrades to an empty section instead of throwing during render.
function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Returns empty content if `content/about.mdx` is missing or unparseable. */
export function getAbout(): About {
  const file = readMdxFile(path.join(process.cwd(), 'content'), 'about');
  return {
    skills: list<SkillGroup>(file?.data.skills),
    interests: list<Interest>(file?.data.interests),
    content: file?.content ?? '',
  };
}
